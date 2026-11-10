import { DatabaseSync } from 'node:sqlite';
import { mkdirSync } from 'node:fs';
import { dirname } from 'node:path';

export function openStore(file) {
  if (file !== ':memory:') mkdirSync(dirname(file), { recursive: true, mode: 0o700 });
  const db = new DatabaseSync(file);
  db.exec(`PRAGMA journal_mode=WAL; PRAGMA busy_timeout=5000;
    CREATE TABLE IF NOT EXISTS customers (user_id TEXT PRIMARY KEY, customer_id TEXT UNIQUE NOT NULL);
    CREATE TABLE IF NOT EXISTS requests (request_key TEXT PRIMARY KEY, sku TEXT NOT NULL, created INTEGER NOT NULL, session_url TEXT);
    CREATE TABLE IF NOT EXISTS purchases (session_id TEXT PRIMARY KEY, customer_id TEXT NOT NULL, sku TEXT NOT NULL, payment_intent TEXT);
    CREATE TABLE IF NOT EXISTS subscriptions (id TEXT PRIMARY KEY, customer_id TEXT NOT NULL, status TEXT NOT NULL, expires INTEGER NOT NULL);
    CREATE TABLE IF NOT EXISTS risks (charge_id TEXT PRIMARY KEY, customer_id TEXT NOT NULL, reason TEXT NOT NULL);
    CREATE TABLE IF NOT EXISTS events (id TEXT PRIMARY KEY, payload TEXT NOT NULL, status TEXT NOT NULL DEFAULT 'pending', attempts INTEGER NOT NULL DEFAULT 0, next_try INTEGER NOT NULL DEFAULT 0);`);
  const run = (sql, ...args) => db.prepare(sql).run(...args);
  const get = (sql, ...args) => db.prepare(sql).get(...args);
  const all = (sql, ...args) => db.prepare(sql).all(...args);
  return { db, run, get, all,
    transaction(fn) { db.exec('BEGIN IMMEDIATE'); try { const out = fn(); db.exec('COMMIT'); return out; } catch (e) { db.exec('ROLLBACK'); throw e; } },
    customer(user) { return get('SELECT customer_id FROM customers WHERE user_id=?', user)?.customer_id; },
    access(customer) {
      if (get('SELECT 1 FROM risks WHERE customer_id=?', customer)) return { pro: false, packs: [], reviewRequired: true };
      const pro = !!get("SELECT 1 FROM subscriptions WHERE customer_id=? AND status='active' AND expires>?", customer, Math.floor(Date.now()/1000));
      return { pro, packs: all('SELECT DISTINCT sku FROM purchases WHERE customer_id=?', customer).map(x => x.sku), reviewRequired: false };
    }
  };
}
