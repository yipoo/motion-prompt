import test from 'node:test';
import assert from 'node:assert/strict';
import { createHmac } from 'node:crypto';
import { mkdtempSync, writeFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import Stripe from 'stripe';
import { generateKeyPair, exportJWK, createLocalJWKSet, SignJWT } from 'jose';
import { openStore } from '../store.mjs';
import { createBilling } from '../service.mjs';
import { createServer, verifier, configuration } from '../server.mjs';

const catalog = [
  { sku: 'new-pack', mode: 'payment', price: 'price_pack', file: 'pack.zip' },
  { sku: 'pro-monthly', mode: 'subscription', price: 'price_monthly' }
];
const key = '00000000-1111-2222-3333-444444444444';
function fixture(t) {
  const store = openStore(':memory:'); t.after(() => store.db.close());
  const state = { customerCalls: 0, checkouts: [], sessions: new Map(), subs: [], sub: { id: 'sub_1', customer: 'cus_1', status: 'active', items: { data: [{ price: { id: 'price_monthly' }, current_period_end: Math.floor(Date.now()/1000)+3600 }] } } };
  const stripe = {
    customers: { create: async () => { state.customerCalls++; return { id: 'cus_1' }; } },
    prices: { retrieve: async price => ({ id: price, active: true, livemode:false, recurring: price === 'price_monthly' ? { interval: 'month' } : null }) },
    checkout: { sessions: {
      create: async (params, options) => { state.checkouts.push({ params, options }); return { id: 'cs_1', url: 'https://checkout.stripe.com/c/pay/test' }; },
      retrieve: async sid => state.sessions.get(sid),
      listLineItems: async () => ({ data: [{ price: { id: 'price_pack' } }], has_more: false }),
      list: async () => ({ data: [], has_more: false })
    } },
    subscriptions: { retrieve: async () => state.sub, list: async () => ({ data: state.subs, has_more: false }) },
    invoices: { retrieve: async () => ({ parent: { subscription_details: { subscription: 'sub_1' } } }), list: async () => ({ data: [] }) },
    charges: { retrieve: async () => ({ id: 'ch_1', customer: 'cus_1' }) },
    billingPortal: { sessions: { create: async p => ({ url: `https://billing.stripe.com/${p.customer}` }) } },
    webhooks: new Stripe('placeholder').webhooks
  };
  const billing = createBilling({ stripe, store, catalog, siteURL: 'https://yipoo.github.io/motion-prompt/' });
  return { stripe, store, state, billing };
}
const event = (eventID, type, object) => ({ id: eventID, type, livemode: false, data: { object } });

test('checkout binds customer and price server-side and survives repeated requests', async t => {
  const { billing, state } = fixture(t);
  const result = await Promise.all([billing.checkout('alice', 'new-pack', key, 'zh'), billing.checkout('alice', 'new-pack', key, 'zh')]);
  assert.equal(result[0].url, result[1].url); assert.equal(state.checkouts.length, 1); assert.equal(state.customerCalls, 1);
  const { params } = state.checkouts[0];
  assert.equal(params.customer, 'cus_1'); assert.equal(params.locale, 'zh');
  assert.deepEqual(params.line_items, [{ price: 'price_pack', quantity: 1 }]);
  assert.equal(params.invoice_creation.enabled, true); assert.equal('payment_method_types' in params, false);
  await assert.rejects(billing.checkout('alice', 'pro-monthly', key), { status: 409 });
  await assert.rejects(billing.checkout('alice', 'price_attack', key), { status: 400 });
});

test('only paid webhook state grants a pack; delivery duplicates are harmless', async t => {
  const { billing, store, state } = fixture(t);
  await billing.checkout('alice', 'new-pack', key);
  state.sessions.set('cs_1', { id: 'cs_1', customer: 'cus_1', mode: 'payment', payment_status: 'unpaid', payment_intent: 'pi_1' });
  await billing.enqueue(event('evt_1', 'checkout.session.completed', { id: 'cs_1' })); await billing.drain();
  assert.deepEqual((await billing.entitlements('alice')).packs, []);
  state.sessions.get('cs_1').payment_status = 'paid';
  const paid = event('evt_2', 'checkout.session.async_payment_succeeded', { id: 'cs_1' });
  await billing.enqueue(paid); await billing.enqueue(paid); await billing.drain();
  assert.deepEqual((await billing.entitlements('alice')).packs, ['new-pack']);
  assert.equal(store.get('SELECT COUNT(*) AS n FROM purchases').n, 1);
  assert.equal((await billing.pendingCount()), 0);
});

test('subscription renewal, stale delivery, cancellation and expiry use current Stripe state', async t => {
  const { billing, store, state } = fixture(t);
  store.run('INSERT INTO customers VALUES (?,?)', 'alice', 'cus_1');
  await billing.enqueue(event('evt_active', 'invoice.paid', { id: 'in_1' })); await billing.drain();
  assert.equal((await billing.entitlements('alice')).pro, true);
  state.sub.status = 'canceled';
  await billing.enqueue(event('evt_stale', 'customer.subscription.updated', { id: 'sub_1', status: 'active' })); await billing.drain();
  assert.equal((await billing.entitlements('alice')).pro, false);
  state.sub.status = 'active'; state.sub.items.data[0].current_period_end = 1;
  await billing.enqueue(event('evt_expired', 'customer.subscription.updated', { id: 'sub_1' })); await billing.drain();
  assert.equal((await billing.entitlements('alice')).pro, false);
});

test('prevent duplicate active subscriptions and defer failing webhooks durably', async t => {
  const { billing, state, store, stripe } = fixture(t);
  state.subs = [state.sub];
  await assert.rejects(billing.checkout('alice', 'pro-monthly', key), { status: 409 });
  stripe.subscriptions.retrieve = async () => { throw Error('temporary outage'); };
  await billing.enqueue(event('evt_retry', 'customer.subscription.updated', { id: 'sub_1' })); await billing.drain();
  assert.equal((await billing.pendingCount()), 1);
  assert.equal(store.get('SELECT attempts FROM events WHERE id=?', 'evt_retry').attempts, 1);
  stripe.subscriptions.retrieve = async () => state.sub;
  store.run('UPDATE events SET next_try=0'); await billing.drain();
  assert.equal((await billing.pendingCount()), 0);
});

test('refund, dispute and fraud signals suspend paid access for review', async t => {
  for (const type of ['charge.refunded','charge.dispute.created','radar.early_fraud_warning.created']) {
    const { billing, store } = fixture(t);
    store.run('INSERT INTO customers VALUES (?,?)', 'alice', 'cus_1');
    store.run('INSERT INTO purchases VALUES (?,?,?,?)', 'cs_1', 'cus_1', 'new-pack', 'pi_1');
    await billing.enqueue(event(`evt_${type}`, type, { id: 'ch_1', charge: 'ch_1' })); await billing.drain();
    assert.deepEqual((await billing.entitlements('alice')), { pro: false, packs: [], reviewRequired: true });
  }
});

test('HTTP rejects unauthenticated access, forged signatures, wrong origins and unauthorized downloads', async t => {
  const { stripe, store } = fixture(t);
  const folder = mkdtempSync(path.join(tmpdir(), 'motion-billing-')); t.after(()=>rmSync(folder,{recursive:true,force:true}));
  writeFileSync(path.join(folder,'pack.zip'), 'private zip fixture');
  const config = { catalog, siteURL: 'https://yipoo.github.io/motion-prompt/', origin: 'https://yipoo.github.io', privateDir: folder };
  const authenticate = async req => { if (req.headers.authorization !== 'Bearer test-user') throw Object.assign(Error('Sign in required'), { status: 401 }); return 'alice'; };
  const { server } = createServer({ stripe, store, config, authenticate, webhookSecret: 'whsec_fixture',motionContent:async(id,lang)=>({id,lang,spec:['paid specification'],code:'paid reference'}) });
  await new Promise(r=>server.listen(0,'127.0.0.1',r)); t.after(()=>new Promise(r=>server.close(r)));
  const base = `http://127.0.0.1:${server.address().port}`;
  assert.equal((await fetch(`${base}/entitlements`)).status, 401);
  assert.equal((await fetch(`${base}/catalog`, { headers: { Origin: 'https://attacker.example' } })).status, 403);
  assert.equal((await fetch(`${base}/webhooks/stripe`, { method: 'POST', body: '{}' })).status, 400);
  const headers = { Authorization: 'Bearer test-user' };
  assert.equal((await fetch(`${base}/downloads/new-pack`, { headers })).status, 403);
  assert.equal((await fetch(`${base}/motions/193`, { headers })).status,403);
  store.run('INSERT INTO customers VALUES (?,?)', 'alice', 'cus_1');
  store.run('INSERT INTO purchases VALUES (?,?,?,?)', 'cs_1', 'cus_1', 'new-pack', 'pi_1');
  assert.equal(await (await fetch(`${base}/downloads/new-pack`, { headers })).text(), 'private zip fixture');
  assert.equal((await fetch(`${base}/motions/193`,{headers})).status,403);
  store.run('INSERT INTO subscriptions VALUES (?,?,?,?)','sub_pro','cus_1','active',Math.floor(Date.now()/1000)+3600);
  const premium=await fetch(`${base}/motions/193?lang=en`,{headers});assert.equal(premium.status,200);assert.deepEqual((await premium.json()).spec,['paid specification']);
  const raw = JSON.stringify(event('evt_signed', 'checkout.session.async_payment_failed', { id: 'cs_unpaid' }));
  stripe.checkout.sessions.retrieve = async () => ({ id:'cs_unpaid', customer:'cus_1', mode:'payment', payment_status:'unpaid' });
  const timestamp = Math.floor(Date.now()/1000);
  const signature = createHmac('sha256','whsec_fixture').update(`${timestamp}.${raw}`).digest('hex');
  assert.equal((await fetch(`${base}/webhooks/stripe`, { method:'POST', headers:{'Stripe-Signature':`t=${timestamp},v1=${signature}`}, body:raw })).status, 200);
});

test('production verifier rejects missing or untrusted tokens before granting identity', async () => {
  const verify = verifier({ AUTH_JWKS_URL:'https://auth.example/.well-known/jwks.json', AUTH_ISSUER:'https://auth.example/', AUTH_AUDIENCE:'motion-prompt' });
  await assert.rejects(verify({ headers:{} }), { status:401 });
  await assert.rejects(verify({ headers:{ authorization:'Bearer forged-token' } }), { status:401 });
});

test('config fails closed without real sandbox keys and configured auth', () => {
  assert.throws(()=>configuration({}), /Missing configuration/);
  const env = { STRIPE_SECRET_KEY:'sk_live_fixture', STRIPE_WEBHOOK_SECRET:'whsec_fixture', AUTH_ISSUER:'https://auth.example/', AUTH_AUDIENCE:'motion-prompt', AUTH_JWKS_URL:'https://auth.example/jwks', SITE_URL:'https://yipoo.github.io/motion-prompt/', ALLOWED_ORIGIN:'https://yipoo.github.io', BILLING_CATALOG:JSON.stringify(catalog) };
  assert.throws(()=>configuration(env), /live mode is disabled/);
});

test('serverless webhook completion awaits fulfillment and duplicate calls do not repeat work',async t=>{
  const {billing,store,state,stripe}=fixture(t);
  store.run('INSERT INTO customers VALUES (?,?)','alice','cus_1');
  let reads=0;stripe.subscriptions.retrieve=async()=>{reads++;return state.sub};
  const paid=event('evt_serverless','invoice.paid',{id:'in_1'});
  await billing.handle(paid);
  assert.equal((await billing.entitlements('alice')).pro,true);
  await billing.handle(paid);assert.equal(reads,1);
});

test('failed synchronous webhook rejects for Stripe retry and can then recover',async t=>{
  const {billing,store,state,stripe}=fixture(t);
  store.run('INSERT INTO customers VALUES (?,?)','alice','cus_1');
  const paid=event('evt_failed','invoice.paid',{id:'in_1'});
  stripe.subscriptions.retrieve=async()=>{throw Error('temporary outage')};
  await assert.rejects(billing.handle(paid));
  assert.equal((await billing.entitlements('alice')).pro,false);
  stripe.subscriptions.retrieve=async()=>state.sub;
  await billing.handle(paid);
  assert.equal((await billing.entitlements('alice')).pro,true);
});

test('JWT verification accepts the signed owner and rejects wrong audience, issuer and expiry', async () => {
  const { publicKey, privateKey } = await generateKeyPair('RS256');
  const jwk = await exportJWK(publicKey); jwk.kid = 'test-key'; jwk.alg = 'RS256';
  const env = { AUTH_JWKS_URL:'https://auth.example/jwks', AUTH_ISSUER:'https://auth.example/', AUTH_AUDIENCE:'motion-prompt' };
  const verify = verifier(env, createLocalJWKSet({ keys:[jwk] }));
  async function token(aud=env.AUTH_AUDIENCE, issuer=env.AUTH_ISSUER, expires='5m') {
    return new SignJWT({}).setProtectedHeader({ alg:'RS256', kid:'test-key' }).setSubject('alice').setIssuer(issuer).setAudience(aud).setIssuedAt().setExpirationTime(expires).sign(privateKey);
  }
  const req = async (...args) => ({ headers: { authorization:`Bearer ${await token(...args)}` } });
  assert.equal(await verify(await req()), 'alice');
  await assert.rejects(verify(await req('other-app')), { status:401 });
  await assert.rejects(verify(await req(env.AUTH_AUDIENCE, 'https://attacker.example/')), { status:401 });
  await assert.rejects(verify(await req(env.AUTH_AUDIENCE, env.AUTH_ISSUER, '0s')), { status:401 });
});

test('production requires live credentials and sandbox rejects them',()=>{
  const env={APP_ENV:'production',STRIPE_SECRET_KEY:'sk_live_fixture',STRIPE_WEBHOOK_SECRET:'whsec_fixture',AUTH_ISSUER:'https://auth.example/',AUTH_AUDIENCE:'motion-prompt',AUTH_JWKS_URL:'https://auth.example/jwks',SITE_URL:'https://motion.yipoo.com/',ALLOWED_ORIGIN:'https://motion.yipoo.com',BILLING_CATALOG:JSON.stringify(catalog)};
  assert.equal(configuration(env).livemode,true);
  assert.throws(()=>configuration({...env,STRIPE_SECRET_KEY:'sk_test_fixture'}),/requires a live/);
});

test('shared database keeps live customer identities and webhook events separate',async t=>{
  const {stripe,store,billing:sandbox}=fixture(t);
  store.run('INSERT INTO customers VALUES (?,?)','alice','cus_sandbox');
  const live=createBilling({stripe,store,catalog,siteURL:'https://motion.yipoo.com/account.html',livemode:true});
  assert.deepEqual(await live.entitlements('alice'),{pro:false,packs:[],reviewRequired:false});
  await assert.rejects(live.enqueue(event('evt_wrong','invoice.paid',{id:'in_1'})),/environment mismatch/);
  await live.enqueue({...event('evt_shared','invoice.paid',{id:'in_1'}),livemode:true});
  assert.ok(store.get('SELECT status FROM events WHERE id=?','live:evt_shared'));
  assert.equal(store.get('SELECT status FROM events WHERE id=?','evt_shared'),undefined);
  await assert.rejects(live.checkout('alice','new-pack',key),{status:503});
  assert.equal(await store.customer('alice'),'cus_sandbox');
  assert.equal(await store.customer('live:alice'),'cus_1');
  stripe.prices.retrieve=async id=>({id,active:true,livemode:true,recurring:null});
  assert.ok((await live.checkout('alice','new-pack',key)).url);
  const paid={...event('evt_live_paid','invoice.paid',{id:'in_1'}),livemode:true};
  await live.handle(paid);
  assert.equal((await live.entitlements('alice')).pro,true);
  assert.equal((await sandbox.entitlements('alice')).pro,false);
  await assert.rejects(sandbox.handle(paid),/environment mismatch/);
  assert.equal(store.get('SELECT status FROM events WHERE id=?','live:evt_live_paid').status,'done');
});
