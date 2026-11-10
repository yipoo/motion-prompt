import { spawnSync } from 'node:child_process';
import { parseEnv } from 'node:util';
import { readFileSync } from 'node:fs';

const [target, file] = process.argv.slice(2);
if (!['preview', 'production'].includes(target) || !file) {
  throw Error('Usage: node tools/sync-vercel-env.mjs <preview|production> <env-file>');
}
const env = parseEnv(readFileSync(file, 'utf8'));
const expectedURL = target === 'preview' ? 'https://dev.motion.yipoo.com/' : 'https://motion.yipoo.com/';
if (env.SITE_URL !== expectedURL || env.ALLOWED_ORIGIN !== new URL(expectedURL).origin) {
  throw Error('SITE_URL and ALLOWED_ORIGIN must match the selected environment');
}
if (target === 'production' && /^(sk|rk)_test_/.test(env.STRIPE_SECRET_KEY || '')) {
  throw Error('Sandbox credentials belong to develop, not production');
}
if (target === 'preview' && /^(sk|rk)_live_/.test(env.STRIPE_SECRET_KEY || '')) {
  throw Error('Live credentials must never be sent to develop');
}
const names=['APP_ENV','STRIPE_SECRET_KEY','STRIPE_WEBHOOK_SECRET','STRIPE_PORTAL_CONFIGURATION','SITE_URL','ALLOWED_ORIGIN','BILLING_CATALOG','DATABASE_URL','DATABASE_CA_CERT','SUPABASE_URL','SUPABASE_PUBLISHABLE_KEY','SUPABASE_SECRET_KEY','PRIVATE_PACK_BUCKET','PREMIUM_CONTENT_READY','PRO_CONTENT_READY','EMAIL_OTP_READY','GITHUB_LOGIN_ENABLED','CANONICAL_DOMAIN_READY'];
for (const name of names) {
  const value = env[name];
  if (!value?.trim()) { console.log(`${name}: not configured`); continue; }
  const args=['env','add',name,target,'--force','--yes','--scope','yipoos-projects'];
  if (target === 'preview') args.push('develop');
  if (/(KEY|SECRET|DATABASE_URL|DATABASE_CA_CERT)/.test(name)) args.push('--sensitive');
  const child=spawnSync('vercel',args,{input:value,encoding:'utf8'});
  console.log(`${name}: ${child.status===0?'saved':'failed'}`);
  if(child.status!==0)process.exit(1);
}
