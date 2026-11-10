import fs from 'node:fs';
import Stripe from 'stripe';
import { createHash } from 'node:crypto';
import { EVENTS } from './service.mjs';
const base=new URL(process.argv[2]);
if(base.protocol!=='https:'||!base.hostname.endsWith('.vercel.app')&&base.hostname!=='motion.yipoo.com')throw Error('Expected the deployed HTTPS Vercel URL');
if(!/^(rk|sk)_test_/.test(process.env.STRIPE_SECRET_KEY||''))throw Error('Sandbox key required');
const stripe=new Stripe(process.env.STRIPE_SECRET_KEY,{apiVersion:'2026-10-28.endive',timeout:15000,maxNetworkRetries:1});
const url=new URL('/api/billing/webhooks/stripe',base).href;
const endpoints=(await stripe.webhookEndpoints.list({limit:100})).data;
let endpoint=endpoints.find(e=>e.url===url);
if(!endpoint){const old=endpoints.find(e=>e.description==='Motion Prompt Vercel sandbox'&&e.url==='https://motion-prompt.vercel.app/api/billing/webhooks/stripe');if(old)endpoint=await stripe.webhookEndpoints.update(old.id,{url})}
if(!endpoint)endpoint=await stripe.webhookEndpoints.create({url,api_version:'2026-10-28.endive',enabled_events:[...EVENTS],description:'Motion Prompt Vercel sandbox'},{idempotencyKey:'motion-webhook-'+createHash('sha256').update(url).digest('hex').slice(0,32)});
let env=fs.readFileSync('.env','utf8');
const updates={SITE_URL:base.origin+'/',ALLOWED_ORIGIN:base.origin,...(endpoint.secret?{STRIPE_WEBHOOK_SECRET:endpoint.secret}:{})};
if(!endpoint.secret&&!process.env.STRIPE_WEBHOOK_SECRET)throw Error('Endpoint already exists; retrieve its signing secret from Stripe Workbench without recreating it');
for(const [key,value] of Object.entries(updates)){
 const regex=new RegExp(`^${key}=.*$`,'m');env=regex.test(env)?env.replace(regex,()=>key+'='+value):env+'\n'+key+'='+value+'\n';
}
fs.writeFileSync('.env',env,{mode:0o600});fs.chmodSync('.env',0o600);
console.log(JSON.stringify({sandbox:true,webhookConfigured:true,eventCount:EVENTS.size,environmentUpdated:true}));
