import pg from 'pg';
import { AsyncLocalStorage } from 'node:async_hooks';
import { readFileSync } from 'node:fs';

// All billing tables live outside the PostgREST-exposed public schema.
export function openPostgres(connectionString, options = {}) {
  let verifiedConnection=connectionString;
  if(!options.pool){
    const url=new URL(connectionString);
    if(!['postgres:','postgresql:'].includes(url.protocol))throw Error('Postgres connection required');
    if(['disable','no-verify'].includes(url.searchParams.get('sslmode')))throw Error('Verified database TLS is required');
    // pg's connection-string options must not override certificate verification.
    for(const key of ['sslmode','sslrootcert','sslcert','sslkey'])url.searchParams.delete(key);
    verifiedConnection=url.href;
  }
  const pool = options.pool || new pg.Pool({ connectionString:verifiedConnection, ssl:{rejectUnauthorized:true,ca:process.env.DATABASE_CA_CERT||readFileSync(new URL('./certs/supabase-ca.crt',import.meta.url),'utf8')},max: 2, connectionTimeoutMillis: 5000, idleTimeoutMillis: 10000,query_timeout:15000 });
  pool.on?.('error', () => console.error('Billing database connection interrupted'));
  const context = new AsyncLocalStorage();
  async function query(sql, args=[]) {
    let i=0;
    sql = sql.replace(/\?/g, () => `$${++i}`);
    if (sql.startsWith('INSERT OR IGNORE')) sql = sql.replace('INSERT OR IGNORE', 'INSERT') + ' ON CONFLICT DO NOTHING';
    if (sql.startsWith('INSERT OR REPLACE INTO subscriptions')) sql = sql.replace('INSERT OR REPLACE', 'INSERT') + ' ON CONFLICT (id) DO UPDATE SET customer_id=EXCLUDED.customer_id,status=EXCLUDED.status,expires=EXCLUDED.expires';
    if (sql.startsWith('INSERT OR REPLACE INTO risks')) sql = sql.replace('INSERT OR REPLACE', 'INSERT') + ' ON CONFLICT (charge_id) DO UPDATE SET customer_id=EXCLUDED.customer_id,reason=EXCLUDED.reason';
    sql = sql.replace(/\b(customers|requests|purchases|subscriptions|risks|events)\b/g, 'motion_billing.$1');
    return (context.getStore() || pool).query(sql, args);
  }
  const store = {
    run: (sql,...args) => query(sql,args),
    get: async (sql,...args) => (await query(sql,args)).rows[0],
    all: async (sql,...args) => (await query(sql,args)).rows,
    async customer(user) { return (await store.get('SELECT customer_id FROM customers WHERE user_id=?',user))?.customer_id; },
    async access(customer) {
      if (await store.get('SELECT 1 FROM risks WHERE customer_id=?',customer)) return {pro:false,packs:[],reviewRequired:true};
      const pro = !!await store.get("SELECT 1 FROM subscriptions WHERE customer_id=? AND status='active' AND expires>?",customer,Math.floor(Date.now()/1000));
      return {pro,packs:(await store.all('SELECT DISTINCT sku FROM purchases WHERE customer_id=?',customer)).map(x=>x.sku),reviewRequired:false};
    },
    async exclusive(fn) {
      const client=await pool.connect();
      try {
        await client.query('BEGIN');
        // Transaction-scoped lock also works through Supabase's transaction pooler.
        // Return a retryable error instead of consuming a function timeout waiting for a lock.
        const result=await client.query('SELECT pg_try_advisory_xact_lock(804234261) AS acquired');
        if (!result.rows[0].acquired) throw Object.assign(Error('Billing is busy; retry with the same Idempotency-Key'),{status:503});
        const out=await context.run(client,fn);
        await client.query('COMMIT'); return out;
      } catch(e) { await client.query('ROLLBACK'); throw e; }
      finally { client.release(); }
    },
    close: () => pool.end()
  };
  return store;
}
