import { createHash } from 'node:crypto';
const id = value => typeof value === 'string' ? value : value?.id;
const fail = (message, status=400) => { throw Object.assign(new Error(message), { status }); };
export const EVENTS = new Set([
  'checkout.session.completed', 'checkout.session.async_payment_succeeded', 'checkout.session.async_payment_failed',
  'customer.subscription.created', 'customer.subscription.updated', 'customer.subscription.deleted',
  'invoice.paid', 'invoice.payment_failed', 'charge.refunded', 'charge.dispute.created', 'radar.early_fraud_warning.created'
]);

export function createBilling({ stripe, store, catalog, siteURL, portalConfiguration, livemode=false }) {
  const identity=user=>livemode?`live:${user}`:user;
  const eventKey=event=>livemode?`live:${event.id}`:event.id;
  const checkMode=event=>{if(event.livemode!==livemode)fail('Stripe event environment mismatch')};
  const bySKU = new Map(catalog.map(x => [x.sku, x]));
  const byPrice = new Map(catalog.map(x => [x.price, x]));
  // One process per SQLite database. Serialize Stripe snapshots and DB writes to avoid stale overwrites.
  let tail = Promise.resolve();
  const localExclusive = fn => { const next = tail.then(fn); tail = next.catch(() => {}); return next; };
  const exclusive = fn => store.exclusive ? store.exclusive(fn) : localExclusive(fn);
  const requestKey = (user, key) => createHash('sha256').update(`${identity(user)}\0${key}`).digest('hex');
  async function customerFor(user) {
    const existing = await store.customer(identity(user));
    if (existing) return existing;
    const customer = await stripe.customers.create({}, { idempotencyKey: `customer-${requestKey(user, 'customer')}` });
    await store.run('INSERT INTO customers VALUES (?,?)', identity(user), customer.id);
    return customer.id;
  }
  async function syncSubscription(subscriptionID) {
    const sub = await stripe.subscriptions.retrieve(subscriptionID);
    const relevant = sub.items.data.filter(item => byPrice.get(item.price.id)?.mode === 'subscription');
    const expires = Math.min(...relevant.map(x => x.current_period_end));
    await store.run('INSERT OR REPLACE INTO subscriptions VALUES (?,?,?,?)', sub.id, id(sub.customer),
      relevant.length && Number.isFinite(expires) ? sub.status : 'inactive', Number.isFinite(expires) ? expires : 0);
  }
  async function processEvent(event) {
    const obj = event.data.object;
    if (event.type.startsWith('checkout.session.')) {
      // Retrieve current state, rather than trust webhook delivery order.
      const session = await stripe.checkout.sessions.retrieve(obj.id);
      if (!await store.get('SELECT 1 FROM customers WHERE customer_id=?', id(session.customer))) return;
      if (session.mode === 'subscription') {
        if (id(session.subscription)) await syncSubscription(id(session.subscription));
        return;
      }
      if (session.payment_status !== 'paid') return;
      const lines = await stripe.checkout.sessions.listLineItems(session.id, { limit: 100 });
      if (lines.has_more) fail('Unexpected checkout size');
      const purchased = lines.data.map(line => byPrice.get(line.price?.id)).filter(x => x?.mode === 'payment');
      // This service creates exactly one catalog item per Checkout Session.
      if (purchased.length !== 1 || lines.data.length !== 1) return;
      await store.run('INSERT OR IGNORE INTO purchases VALUES (?,?,?,?)', session.id, id(session.customer), purchased[0].sku, id(session.payment_intent) || null);
    } else if (event.type.startsWith('customer.subscription.')) {
      await syncSubscription(obj.id);
    } else if (event.type.startsWith('invoice.')) {
      const invoice = await stripe.invoices.retrieve(obj.id);
      const subscription = id(invoice.parent?.subscription_details?.subscription);
      if (subscription) await syncSubscription(subscription);
    } else {
      // Use first-class charge/customer ownership for refunds, disputes, and fraud alerts.
      const chargeID = event.type === 'charge.refunded' ? obj.id : id(obj.charge);
      if (!chargeID) fail('Missing charge on risk event');
      const charge = await stripe.charges.retrieve(chargeID);
      const customer = id(charge.customer);
      if (customer && await store.get('SELECT 1 FROM customers WHERE customer_id=?', customer)) {
        // Conservative policy: suspend paid access until the owner resolves the case.
        await store.run('INSERT OR REPLACE INTO risks VALUES (?,?,?)', charge.id, customer, event.type);
      }
    }
  }
  return {
    catalog: catalog.map(({ sku, mode, title, amount, currency, interval }) => ({ sku, mode, title, amount, currency, interval })),
    handle: event => exclusive(async () => {
      if (!EVENTS.has(event.type)) return;
      checkMode(event);
      const existing = await store.get('SELECT status FROM events WHERE id=?', eventKey(event));
      if (existing?.status === 'done') return;
      await store.run('INSERT OR IGNORE INTO events (id,payload) VALUES (?,?)', eventKey(event), JSON.stringify(event));
      await processEvent(event);
      await store.run("UPDATE events SET status='done',payload='{}' WHERE id=?", eventKey(event));
    }),
    checkout: (user, sku, key, language='en') => exclusive(async () => {
      const product = bySKU.get(sku);
      if (!product) fail('Unknown product');
      if(product.available===false)fail('This product is not available yet',503);
      if (!/^[a-zA-Z0-9-]{16,80}$/.test(key || '')) fail('A stable Idempotency-Key is required');
      const reqKey = requestKey(user, key);
      const cached = await store.get('SELECT * FROM requests WHERE request_key=?', reqKey);
      if (cached && cached.sku !== sku) fail('Idempotency key already used for another product', 409);
      if (cached?.session_url) return { url: cached.session_url };
      if (cached && Date.now() - cached.created > 23*3600*1000) fail('Previous attempt needs reconciliation; do not retry with a new key', 409);
      const customer = await customerFor(user);
      const access = await store.access(customer);
      if (access.reviewRequired) fail('Account requires billing review', 409);
      if (product.mode === 'payment' && (access.pro || access.packs.includes(sku))) fail('Already owned', 409);
      if (product.mode === 'subscription' && !cached) {
        const subscriptions = await stripe.subscriptions.list({ customer, status: 'all', limit: 100 });
        if (subscriptions.has_more || subscriptions.data.some(s => !['canceled', 'incomplete_expired'].includes(s.status)
          && s.items.data.some(i => byPrice.get(i.price.id)?.mode === 'subscription'))) fail('Manage your existing subscription in the billing portal', 409);
        const open = await stripe.checkout.sessions.list({ customer, status: 'open', limit: 100 });
        if (open.has_more || open.data.some(s => s.mode === 'subscription')) fail('An open subscription checkout already exists', 409);
      }
      const price = await stripe.prices.retrieve(product.price);
      if (price.livemode!==livemode || !price.active || (product.mode === 'subscription') !== !!price.recurring) fail('Product price is unavailable', 503);
      await store.run('INSERT OR IGNORE INTO requests VALUES (?,?,?,NULL)', reqKey, sku, Date.now());
      const params = {
        mode: product.mode, customer, line_items: [{ price: product.price, quantity: 1 }],
        locale: language === 'zh' ? 'zh' : 'en',
        success_url: `${siteURL}?billing=success&session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${siteURL}?billing=cancelled`,
        integration_identifier: `motion_prompt_${reqKey.slice(0,16).match(/../g).map(x => String.fromCharCode(97 + parseInt(x,16)%26)).join('')}`,
        ...(product.mode === 'payment' ? { invoice_creation: { enabled: true } } : {})
      };
      const session = await stripe.checkout.sessions.create(params, { idempotencyKey: `checkout-${reqKey}` });
      await store.run('UPDATE requests SET session_url=? WHERE request_key=?', session.url, reqKey);
      return { url: session.url };
    }),
    portal: user => exclusive(async () => {
      const customer = await store.customer(identity(user));
      if (!customer) fail('No billing account yet', 404);
      const session = await stripe.billingPortal.sessions.create({ customer, return_url: siteURL, ...(portalConfiguration ? {configuration:portalConfiguration} : {}) });
      return { url: session.url };
    }),
    async entitlements(user) { const customer = await store.customer(identity(user)); return customer ? await store.access(customer) : { pro: false, packs: [], reviewRequired: false }; },
    async enqueue(event) {
      if (!EVENTS.has(event.type)) return;
      checkMode(event);
      await store.run('INSERT OR IGNORE INTO events (id,payload) VALUES (?,?)', eventKey(event), JSON.stringify(event));
    },
    drain: () => exclusive(async () => {
      const events = await store.all("SELECT * FROM events WHERE status='pending' AND next_try<=? ORDER BY next_try,id LIMIT 10", Date.now());
      for (const row of events) {
        try {
          const event=JSON.parse(row.payload);checkMode(event);
          await processEvent(event);
          // Snapshots are idempotent. If interrupted before this write they can safely run again.
          await store.run("UPDATE events SET status='done',payload='{}' WHERE id=?", row.id);
        } catch {
          await store.run('UPDATE events SET attempts=attempts+1,next_try=? WHERE id=?', Date.now() + Math.min(3600000, 1000 * 2 ** Math.min(row.attempts, 12)), row.id);
          console.error(`Stripe event processing deferred: ${row.id}`);
        }
      }
    }),
    async pendingCount() { return (await store.get("SELECT COUNT(*) AS count FROM events WHERE status='pending'")).count; }
  };
}
