import Stripe from 'stripe';
import { openStore } from './store.mjs';
import { configuration, createServer, verifier } from './server.mjs';
const env=process.env,config=configuration(env);
const store=openStore(env.DATABASE_PATH||'./data/billing.sqlite');
const stripe=new Stripe(env.STRIPE_SECRET_KEY,{apiVersion:'2026-10-28.endive',maxNetworkRetries:1,timeout:8000});
const {server}=createServer({stripe,store,config,authenticate:verifier(env),webhookSecret:env.STRIPE_WEBHOOK_SECRET});
server.listen(Number(env.PORT||4242),'127.0.0.1',()=>console.log('Local billing preview ready'));
