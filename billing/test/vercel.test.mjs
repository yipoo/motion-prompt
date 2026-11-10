import test from 'node:test';
import assert from 'node:assert/strict';
import { publicSettings } from '../vercel.mjs';
import { openPostgres } from '../postgres.mjs';

test('public configuration never exposes server keys and content readiness defaults closed',()=>{
  const config=publicSettings({SUPABASE_URL:'https://project.supabase.co',SUPABASE_PUBLISHABLE_KEY:'public-key',STRIPE_SECRET_KEY:'private-stripe-key',SUPABASE_SECRET_KEY:'private-storage-key',DATABASE_URL:'private-db-url'});
  const json=JSON.stringify(config);
  assert.equal(config.authReady,true);assert.equal(config.paymentsReady,false);
  assert.equal(json.includes('private-'),false);
  assert.deepEqual(config.products.map(x=>x.amount),[900,1200,9900]);
});

test('database transaction returns its connection and rolls back when Stripe fails',async()=>{
  const calls=[];let released=0;
  const client={query:async(sql,args)=>{calls.push([sql,args]);return {rows:sql.includes('pg_try_advisory')?[{acquired:true}]:[]}},release:()=>released++};
  const store=openPostgres('',{pool:{on(){},connect:async()=>client,query:async()=>{throw Error('queries must share transaction connection')},end(){}}});
  await assert.rejects(store.exclusive(async()=>{await store.run('INSERT OR IGNORE INTO events (id,payload) VALUES (?,?)','evt_test','{}');throw Error('Stripe unavailable')}),/Stripe unavailable/);
  assert.equal(released,1);assert.equal(calls.at(-1)[0],'ROLLBACK');
  assert.ok(calls.some(([sql,args])=>sql.includes('motion_billing.events')&&sql.includes('ON CONFLICT DO NOTHING')&&args[0]==='evt_test'));
});

test('cross-instance lock contention does not run a second purchase',async()=>{
  let ran=false,released=false;
  const client={query:async sql=>({rows:sql.includes('pg_try_advisory')?[{acquired:false}]:[]}),release(){released=true}};
  const store=openPostgres('',{pool:{on(){},connect:async()=>client,end(){}}});
  await assert.rejects(store.exclusive(async()=>{ran=true}),{status:503});
  assert.equal(ran,false);assert.equal(released,true);
});
