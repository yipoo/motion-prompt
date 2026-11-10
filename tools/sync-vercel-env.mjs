import { spawnSync } from 'node:child_process';
process.loadEnvFile('billing/.env');
const names=['STRIPE_SECRET_KEY','STRIPE_WEBHOOK_SECRET','STRIPE_PORTAL_CONFIGURATION','SITE_URL','ALLOWED_ORIGIN','BILLING_CATALOG','DATABASE_URL','DATABASE_CA_CERT','SUPABASE_URL','SUPABASE_PUBLISHABLE_KEY','SUPABASE_SECRET_KEY','PRIVATE_PACK_BUCKET','PREMIUM_CONTENT_READY','PRO_CONTENT_READY','EMAIL_OTP_READY','GITHUB_LOGIN_ENABLED','CANONICAL_DOMAIN_READY'];
const target=process.argv[2];if(!['preview','production'].includes(target))throw Error('Select preview or production');
for(const name of names){
  const value=process.env[name];if(!value?.trim()){console.log(`${name}: not configured`);continue}
  const child=spawnSync('vercel',['env','add',name,target,'--force','--yes','--scope','yipoos-projects'],{input:value,encoding:'utf8'});
  console.log(`${name}: ${child.status===0?'saved':'failed'}`);
  if(child.status!==0)process.exit(1);
}
