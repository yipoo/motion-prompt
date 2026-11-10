// Explicit integration check against this project's DEVELOPMENT Supabase and Stripe SANDBOX.
// Creates a temporary auth user and customer, checks checkout creation, then cleans them up.
import assert from 'node:assert/strict';
import { randomBytes,randomUUID,createHash } from 'node:crypto';
import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';
import { openPostgres } from './postgres.mjs';
import { createServer,configuration,verifier } from './server.mjs';
if(!/^(rk|sk)_test_/.test(process.env.STRIPE_SECRET_KEY||'')||process.env.SUPABASE_URL!=='https://ozzutjxoxdoqvxsfemmn.supabase.co')throw Error('Only the selected development project and sandbox may be verified');
const env={...process.env,AUTH_ISSUER:process.env.SUPABASE_URL+'/auth/v1',AUTH_JWKS_URL:process.env.SUPABASE_URL+'/auth/v1/.well-known/jwks.json',AUTH_AUDIENCE:'authenticated'};
const admin=createClient(env.SUPABASE_URL,env.SUPABASE_SECRET_KEY,{auth:{persistSession:false,autoRefreshToken:false}});
const auth=createClient(env.SUPABASE_URL,env.SUPABASE_PUBLISHABLE_KEY,{auth:{persistSession:false,autoRefreshToken:false}});
const stripe=new Stripe(env.STRIPE_SECRET_KEY,{apiVersion:'2026-10-28.endive',maxNetworkRetries:1,timeout:10000});
const store=openPostgres(env.DATABASE_URL);
const config=configuration(env),sessions=[],keys=[],report={sandbox:true};let user,server;
try{
  const email=`motion-verification-${randomUUID()}@example.invalid`,password=randomBytes(32).toString('base64url');
  const created=await admin.auth.admin.createUser({email,password,email_confirm:true,app_metadata:{motion_prompt_verification:true}});if(created.error)throw Error('Test user creation failed');user=created.data.user;
  const signed=await auth.auth.signInWithPassword({email,password});if(signed.error)throw Error('Test sign-in failed');
  const token=signed.data.session.access_token;
  const instance=createServer({stripe,store,config,authenticate:verifier(env),webhookSecret:env.STRIPE_WEBHOOK_SECRET});server=instance.server;
  await new Promise(r=>server.listen(0,'127.0.0.1',r));const base='http://127.0.0.1:'+server.address().port;
  const headers={Authorization:`Bearer ${token}`,'Content-Type':'application/json'};
  assert.equal((await fetch(base+'/entitlements')).status,401);
  assert.equal((await fetch(base+'/entitlements',{headers})).status,200);report.signedAuthentication=true;
  report.checkouts=[];
  for(const sku of ['premium-pack','pro-monthly','pro-yearly']){
    const key=randomUUID();keys.push(key);
    const response=await fetch(base+'/checkout',{method:'POST',headers:{...headers,'Idempotency-Key':key},body:JSON.stringify({sku,language:'zh'})});
    assert.equal(response.status,200,`Checkout creation failed for ${sku}`);
    const result=await response.json();assert.equal(new URL(result.url).hostname,'checkout.stripe.com');
    const customer=await store.customer(user.id);
    const list=await stripe.checkout.sessions.list({customer,status:'open',limit:100});
    const session=list.data.find(s=>s.url===result.url);assert.ok(session);sessions.push(session.id);
    assert.equal(session.livemode,false);assert.equal(session.locale,'zh');
    const replay=await fetch(base+'/checkout',{method:'POST',headers:{...headers,'Idempotency-Key':key},body:JSON.stringify({sku,language:'zh'})});
    assert.equal(replay.status,200);assert.equal((await replay.json()).url,result.url);
    if(sku==='pro-monthly'){
      const duplicateKey=randomUUID();keys.push(duplicateKey);
      const duplicate=await fetch(base+'/checkout',{method:'POST',headers:{...headers,'Idempotency-Key':duplicateKey},body:JSON.stringify({sku:'pro-yearly'})});assert.equal(duplicate.status,409);report.duplicateSubscriptionBlocked=true;
    }
    report.checkouts.push({sku,created:true,idempotent:true,amount:session.amount_total,currency:session.currency});
    await stripe.checkout.sessions.expire(session.id);
  }
  const portal=await fetch(base+'/portal',{method:'POST',headers});assert.equal(portal.status,200);assert.equal(new URL((await portal.json()).url).hostname,'billing.stripe.com');report.portal=true;
  const invoices=await fetch(base+'/invoices',{headers});assert.equal(invoices.status,200);report.invoiceRead=true;
  const access=await (await fetch(base+'/entitlements',{headers})).json();assert.equal(access.pro,false);assert.deepEqual(access.packs,[]);report.unpaidSessionsGrantNoAccess=true;
  report.passed=true;
}catch(e){report.passed=false;report.failure=e.code||e.message||'Integration check failed'}
finally{
  if(server)await new Promise(r=>server.close(r));
  if(user){
    for(const id of sessions){try{const session=await stripe.checkout.sessions.retrieve(id);if(session.status==='open')await stripe.checkout.sessions.expire(id)}catch{}}
    const customer=await store.customer(user.id);if(customer)await stripe.customers.del(customer);
    for(const key of keys)await store.run('DELETE FROM requests WHERE request_key=?',createHash('sha256').update(`${user.id}\0${key}`).digest('hex'));
    await store.run('DELETE FROM customers WHERE user_id=?',user.id);
    const result=await admin.auth.admin.deleteUser(user.id);report.testUserCleanedUp=!result.error;
  }
  await store.close();await auth.auth.signOut();
}
console.log(JSON.stringify(report,null,2));if(!report.passed)process.exitCode=1;
