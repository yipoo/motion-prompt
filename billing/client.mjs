// Browser adapter. getToken must obtain a short-lived token from your identity provider.
// Import only this file into a paid storefront; never import server modules in browser code.
export function billingClient({ apiURL, getToken }) {
  const base = apiURL.replace(/\/$/, '');
  async function request(route, options={}) {
    const token = await getToken();
    if (!token) throw Error('Sign in required');
    const response = await fetch(base + route, { ...options, headers: { Authorization: `Bearer ${token}`, ...options.headers } });
    const result = await response.json();
    if (!response.ok) throw Error(result.error || 'Billing request failed');
    return result;
  }
  return {
    // Generate once per deliberate purchase attempt; retain the key across network retries.
    checkout: (sku, language, attemptKey) => request('/checkout', {
      method: 'POST', headers: { 'Content-Type': 'application/json', 'Idempotency-Key': attemptKey }, body: JSON.stringify({ sku, language })
    }),
    portal: () => request('/portal', { method: 'POST' }),
    entitlements: () => request('/entitlements'),
    invoices: () => request('/invoices'),
    // Returns { url } for a short-lived, authorized private Storage download.
    download: sku => request('/downloads/'+encodeURIComponent(sku))
  };
}
