import http from 'node:http';
import { createReadStream, realpathSync, statSync } from 'node:fs';
import path from 'node:path';
import Stripe from 'stripe';
import { createRemoteJWKSet, jwtVerify } from 'jose';
import { createBilling } from './service.mjs';

const error = (status, message) => Object.assign(new Error(message), { status });
export function configuration(env) {
  for (const name of ['STRIPE_SECRET_KEY','STRIPE_WEBHOOK_SECRET','AUTH_ISSUER','AUTH_AUDIENCE','AUTH_JWKS_URL','SITE_URL','ALLOWED_ORIGIN','BILLING_CATALOG']) {
    if (!env[name]) throw Error(`Missing configuration: ${name}`);
  }
  const livemode=env.APP_ENV==='production';
  if (!(livemode?/^(rk|sk)_live_/:/^(rk|sk)_test_/).test(env.STRIPE_SECRET_KEY)) throw Error(livemode?'Production requires a live Stripe key':'Use a Stripe sandbox key; live mode is disabled outside production');
  if (!env.STRIPE_WEBHOOK_SECRET.startsWith('whsec_')) throw Error('Invalid webhook signing secret');
  const site = new URL(env.SITE_URL);
  if (site.protocol !== 'https:' && site.hostname !== 'localhost' && site.hostname !== '127.0.0.1') throw Error('SITE_URL must use HTTPS');
  if (site.search || site.hash) throw Error('SITE_URL must not contain query or fragment');
  const origin = new URL(env.ALLOWED_ORIGIN);
  if (origin.origin !== env.ALLOWED_ORIGIN || origin.origin !== site.origin) throw Error('ALLOWED_ORIGIN must match SITE_URL origin');
  for (const key of ['AUTH_ISSUER', 'AUTH_JWKS_URL']) if (new URL(env[key]).protocol !== 'https:') throw Error(`${key} must use HTTPS`);
  const catalog = JSON.parse(env.BILLING_CATALOG);
  if (!Array.isArray(catalog) || !catalog.length || new Set(catalog.map(x=>x.sku)).size !== catalog.length || new Set(catalog.map(x=>x.price)).size !== catalog.length) throw Error('Catalog requires unique SKUs and prices');
  for (const p of catalog) {
    if (!/^[a-z0-9-]{1,64}$/.test(p.sku) || !['payment','subscription'].includes(p.mode) || !/^price_[A-Za-z0-9]+$/.test(p.price) || p.price.includes('REPLACE')) throw Error('Configure actual catalog prices');
    if (p.mode === 'payment' && (!p.file || path.basename(p.file) !== p.file || !p.file.endsWith('.zip'))) throw Error('Each paid pack requires a private zip filename');
  }
  return { livemode, catalog, siteURL: site.href, origin: origin.origin, privateDir: path.resolve(env.PRIVATE_PACK_DIR || './private'), portalConfiguration:env.STRIPE_PORTAL_CONFIGURATION };
}

export function verifier(env, jwks = createRemoteJWKSet(new URL(env.AUTH_JWKS_URL))) {
  return async req => {
    const token = /^Bearer (\S+)$/.exec(req.headers.authorization || '')?.[1];
    if (!token) throw error(401, 'Sign in required');
    try {
      const { payload } = await jwtVerify(token, jwks, {
        issuer: env.AUTH_ISSUER, audience: env.AUTH_AUDIENCE, algorithms: ['RS256','ES256'], requiredClaims: ['sub','exp','iat']
      });
      if (!payload.sub || payload.sub.length > 256) throw Error();
      return payload.sub;
    } catch { throw error(401, 'Invalid or expired sign-in token'); }
  };
}
async function body(req) {
  const chunks = []; let size = 0;
  for await (const chunk of req) {
    size += chunk.length;
    if (size > 1024*1024) throw error(413, 'Request too large');
    chunks.push(chunk);
  }
  return Buffer.concat(chunks);
}
export function createHandler({ stripe, store, config, authenticate, webhookSecret, signedDownload, motionContent }) {
  const billing = createBilling({ stripe, store, catalog: config.catalog, siteURL: config.siteURL, portalConfiguration:config.portalConfiguration, livemode:config.livemode });
  const buckets = new Map();
  const handler = async (req, res) => {
    const json = (status, data) => { res.writeHead(status, { 'Content-Type': 'application/json' }); res.end(JSON.stringify(data)); };
    res.setHeader('Cache-Control', 'no-store');
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('Content-Security-Policy', "default-src 'none'; frame-ancestors 'none'");
    res.setHeader('Vary', 'Origin');
    try {
      const url = new URL(req.url, 'http://localhost');
      url.pathname = url.pathname.replace(/^\/api\/billing(?=\/|$)/, '') || '/';
      if (req.headers.origin && req.headers.origin !== config.origin) throw error(403, 'Origin is not allowed');
      if (req.headers.origin === config.origin) {
        res.setHeader('Access-Control-Allow-Origin', config.origin);
        res.setHeader('Access-Control-Allow-Headers', 'Authorization, Content-Type, Idempotency-Key');
        res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
      }
      if (req.method === 'OPTIONS') { res.writeHead(204); res.end(); return; }
      if (url.pathname === '/health' && req.method === 'GET') { json(200, { ok: true, mode: config.livemode?'production':'sandbox' }); return; }
      if (url.pathname === '/webhooks/stripe' && req.method === 'POST') {
        const raw = await body(req);
        let event;
        try { event = stripe.webhooks.constructEvent(raw, req.headers['stripe-signature'], webhookSecret); }
        catch { throw error(400, 'Invalid Stripe signature'); }
        await billing.handle(event);
        json(200, { received: true });
        return;
      }
      const user = await authenticate(req);
      // A single-process guard; production ingress must also enforce IP rate limits.
      const now = Date.now();
      if (buckets.size > 10000) for (const [k, v] of buckets) if (v.until < now) buckets.delete(k);
      const bucket = buckets.get(user) || { count: 0, until: now + 60000 };
      if (bucket.until < now) { bucket.count = 0; bucket.until = now + 60000; }
      buckets.set(user, bucket);
      if (++bucket.count > 60) throw error(429, 'Too many requests');
      if (req.method === 'GET' && url.pathname === '/catalog') { json(200, billing.catalog); return; }
      if (req.method === 'GET' && url.pathname === '/entitlements') { json(200, await billing.entitlements(user)); return; }
      if(req.method==='GET' && /^\/motions\/\d{3}$/.test(url.pathname)){
        const motionID=url.pathname.split('/').at(-1);
        if(+motionID<193||+motionID>312||!motionContent)throw error(404,'Motion not found');
        const access=await billing.entitlements(user);
        if(!access.pro)throw error(403,'An active Pro subscription is required');
        json(200,await motionContent(motionID,url.searchParams.get('lang')==='en'?'en':'zh-Hans'));return;
      }
      if (req.method === 'POST' && url.pathname === '/checkout') {
        if (!req.headers['content-type']?.startsWith('application/json')) throw error(415, 'JSON required');
        let data; try { data = JSON.parse((await body(req)).toString()); } catch (e) { if (e.status) throw e; throw error(400, 'Invalid JSON'); }
        if (!data || typeof data !== 'object') throw error(400, 'Invalid checkout');
        json(200, await billing.checkout(user, data.sku, req.headers['idempotency-key'], data.language)); return;
      }
      if (req.method === 'POST' && url.pathname === '/portal') { json(200, await billing.portal(user)); return; }
      if (req.method === 'GET' && url.pathname === '/invoices') {
        const customer = await store.customer(user);
        const invoices = customer ? await stripe.invoices.list({ customer, limit: 20 }) : { data: [] };
        json(200, invoices.data.map(x => ({ id: x.id, number: x.number, status: x.status, currency: x.currency, total: x.total, url: x.hosted_invoice_url, pdf: x.invoice_pdf }))); return;
      }
      if (req.method === 'GET' && url.pathname.startsWith('/downloads/')) {
        const sku = url.pathname.slice('/downloads/'.length);
        const product = config.catalog.find(x => x.sku === sku && x.mode === 'payment');
        if (!product) throw error(404, 'Pack not found');
        const access = await billing.entitlements(user);
        if (!access.pro && !access.packs.includes(sku)) throw error(403, 'Purchase required');
        if (signedDownload) { json(200, { url: await signedDownload(product.file) }); return; }
        let file, size;
        try {
          const root = realpathSync(config.privateDir);
          file = realpathSync(path.join(root, product.file));
          if (!file.startsWith(root + path.sep)) throw Error();
          const stat = statSync(file); if (!stat.isFile()) throw Error(); size = stat.size;
        } catch { throw error(404, 'Pack file unavailable'); }
        res.writeHead(200, { 'Content-Type': 'application/zip', 'Content-Length': size, 'Content-Disposition': `attachment; filename="${product.sku}.zip"` });
        createReadStream(file).on('error', () => res.destroy()).pipe(res); return;
      }
      throw error(404, 'Not found');
    } catch (e) {
      if (res.headersSent) { res.destroy(); return; }
      // Never expose upstream errors, request bodies, keys, customer details, or tokens.
      json(e.status || 503, { error: e.status ? e.message : 'Billing temporarily unavailable' });
    }
  };
  return { handler, billing };
}

export function createServer(options) {
  const { handler, billing } = createHandler(options);
  const server = http.createServer(handler);
  server.requestTimeout = 15000;
  server.headersTimeout = 10000;
  return { server, billing };
}
