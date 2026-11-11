// Access-control integration test only: temporary Pro entitlement fixture, not a paid Stripe subscription.
import assert from 'node:assert/strict';
import {randomBytes,randomUUID} from 'node:crypto';
import {createClient} from '@supabase/supabase-js';
import {openPostgres} from './postgres.mjs';
if(process.env.SUPABASE_URL!=='https://ozzutjxoxdoqvxsfemmn.supabase.co'||!/^(rk|sk)_test_/.test(process.env.STRIPE_SECRET_KEY||''))throw Error('Selected development environment required');
const admin=createClient(process.env.SUPABASE_URL,process.env.SUPABASE_SECRET_KEY,{auth:{persistSession:false,autoRefreshToken:false}});
const client=createClient(process.env.SUPABASE_URL,process.env.SUPABASE_PUBLISHABLE_KEY,{auth:{persistSession:false,autoRefreshToken:false}});
const store=openPostgres(process.env.DATABASE_URL),tag=randomUUID(),customer='cus_fixture_'+tag,subscription='sub_fixture_'+tag;let user;
const base='https://motion.yipoo.com',report={test:'Pro access fixture, not payment completion'};
try{
 const email=`motion-pro-${tag}@example.invalid`,password=randomBytes(32).toString('hex');
 const created=await admin.auth.admin.createUser({email,password,email_confirm:true,app_metadata:{motion_prompt_verification:true}});if(created.error)throw Error('Test user creation failed');user=created.data.user;
 const signed=await client.auth.signInWithPassword({email,password});if(signed.error)throw Error('Sign-in failed');const headers={Authorization:`Bearer ${signed.data.session.access_token}`};
 assert.equal((await fetch(base+'/api/billing/motions/193')).status,401);
 assert.equal((await fetch(base+'/api/billing/motions/193',{headers})).status,403);report.nonSubscriberDenied=true;
 await store.run('INSERT INTO customers VALUES (?,?)',user.id,customer);
 await store.run('INSERT INTO subscriptions VALUES (?,?,?,?)',subscription,customer,'active',Math.floor(Date.now()/1000)+120);
 const response=await fetch(base+'/api/billing/motions/193?lang=zh-Hans',{headers});assert.equal(response.status,200);const payload=await response.json();assert.ok(payload.spec.length>0);assert.ok(payload.code.includes('CELLS['));assert.ok(payload.kit.length>0);report.activeFixtureCanRead=true;
 await store.run('UPDATE subscriptions SET status=? WHERE id=?','canceled',subscription);
 assert.equal((await fetch(base+'/api/billing/motions/193',{headers})).status,403);report.canceledFixtureDenied=true;
 for(const [route,status] of [['/api/v1/en/p/192.txt',200],['/api/v1/en/p/193.txt',404],['/api/v1/zh-Hans/e/193.txt',404],['/api/v1/kit/micro.js',404]])assert.equal((await fetch(base+route)).status,status,route);
 const catalog=await (await fetch(base+'/api/v1/catalog.json')).json();assert.equal(catalog.elements.filter(e=>e.access==='free').length,198);assert.equal(catalog.elements.filter(e=>e.access==='pro').length,126);assert.deepEqual(catalog.elements.find(e=>e.id==='193').spec.en,[]);report.staticBoundary=true;report.passed=true;
}catch(e){report.passed=false;report.failure=e.message||e.code}
finally{
 if(user){await store.run('DELETE FROM subscriptions WHERE id=?',subscription);await store.run('DELETE FROM customers WHERE user_id=?',user.id);const deleted=await admin.auth.admin.deleteUser(user.id);report.fixtureRemoved=!deleted.error}
 await store.close();await client.auth.signOut();
}
console.log(JSON.stringify(report,null,2));if(!report.passed)process.exitCode=1;
