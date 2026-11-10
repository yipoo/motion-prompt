import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';
import { openPostgres } from './postgres.mjs';
import { createHandler, configuration, verifier } from './server.mjs';

let runtime;
export function publicSettings(env) {
  const authReady=!!(env.SUPABASE_URL && env.SUPABASE_PUBLISHABLE_KEY);
  const paymentsReady=authReady && ['STRIPE_SECRET_KEY','STRIPE_WEBHOOK_SECRET','DATABASE_URL','BILLING_CATALOG','SITE_URL','SUPABASE_SECRET_KEY'].every(k=>!!env[k]) && env.PREMIUM_CONTENT_READY==='true';
  return {
    authReady, paymentsReady, sandbox:true,
    authURL:authReady?env.SUPABASE_URL:null, authKey:authReady?env.SUPABASE_PUBLISHABLE_KEY:null,
    githubEnabled:env.GITHUB_LOGIN_ENABLED==='true',
    products:[
      {sku:'premium-pack',mode:'payment',amount:900,currency:'usd',interval:null},
      {sku:'pro-monthly',mode:'subscription',amount:1200,currency:'usd',interval:'month'},
      {sku:'pro-yearly',mode:'subscription',amount:9900,currency:'usd',interval:'year'}
    ]
  };
}
export default async function handler(req,res) {
  const env=process.env;
  const incoming=new URL(req.url,'http://localhost');
  const route=incoming.searchParams.has('__route')?'/api/billing/'+incoming.searchParams.get('__route'):incoming.pathname;
  req.url=route;
  if (req.method==='GET' && route==='/api/billing/public') {
    res.setHeader('Content-Type','application/json');res.setHeader('Cache-Control','no-store');res.end(JSON.stringify(publicSettings(env)));return;
  }
  if (req.method==='GET' && route==='/api/billing/health') {
    res.setHeader('Content-Type','application/json');res.setHeader('Cache-Control','no-store');res.end(JSON.stringify({ok:true,mode:'sandbox',configured:publicSettings(env).paymentsReady}));return;
  }
  try {
    if(!runtime) {
      const authEnv={...env,AUTH_ISSUER:env.SUPABASE_URL?`${env.SUPABASE_URL.replace(/\/$/,'')}/auth/v1`:null,AUTH_AUDIENCE:'authenticated',AUTH_JWKS_URL:env.SUPABASE_URL?`${env.SUPABASE_URL.replace(/\/$/,'')}/auth/v1/.well-known/jwks.json`:null};
      const config=configuration(authEnv);config.siteURL=new URL('account.html',config.siteURL).href;
      if(!env.DATABASE_URL || !env.SUPABASE_URL || !env.SUPABASE_SECRET_KEY) throw Error('Incomplete deployment configuration');
      const stripe=new Stripe(env.STRIPE_SECRET_KEY,{apiVersion:'2026-10-28.endive',maxNetworkRetries:1,timeout:8000});
      const store=openPostgres(env.DATABASE_URL);
      const storage=createClient(env.SUPABASE_URL,env.SUPABASE_SECRET_KEY,{auth:{persistSession:false,autoRefreshToken:false}});
      runtime=createHandler({stripe,store,config,authenticate:verifier(authEnv),webhookSecret:env.STRIPE_WEBHOOK_SECRET,
        signedDownload:async file=>{
          const {data,error}=await storage.storage.from(env.PRIVATE_PACK_BUCKET||'premium-packs').createSignedUrl(file,60,{download:true});
          if(error)throw Error('Private download unavailable');return data.signedUrl;
        }}).handler;
    }
    if(route.endsWith('/checkout') && env.PREMIUM_CONTENT_READY!=='true') {
      res.statusCode=503;res.setHeader('Content-Type','application/json');res.end(JSON.stringify({error:'Premium packs are not available yet'}));return;
    }
    await runtime(req,res);
  } catch {
    if(!res.headersSent){res.statusCode=503;res.setHeader('Content-Type','application/json');res.setHeader('Cache-Control','no-store');res.end(JSON.stringify({error:'Billing is not configured yet'}));}
    else res.destroy();
  }
}
