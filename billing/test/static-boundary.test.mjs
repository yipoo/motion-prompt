import test from 'node:test';
import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { once } from 'node:events';

test('static development server excludes billing and hidden credentials', async t => {
  const child = spawn(process.execPath, ['tools/serve.mjs'], { cwd: new URL('../../', import.meta.url), env: { ...process.env, PORT: '0' }, stdio:['ignore','pipe','pipe'] });
  t.after(async () => { const done = once(child, 'exit'); child.kill(); await done; });
  const [out] = await once(child.stdout, 'data');
  const base = /http:\/\/127\.0\.0\.1:\d+/.exec(out.toString())[0];
  assert.equal((await fetch(base)).status, 200);
  for (const pathname of ['/billing/.env','/billing/server.mjs','/%62illing/client.mjs','/.git/config','/.env','/node_modules/stripe/package.json']) {
    assert.equal((await fetch(base + pathname)).status, 404, pathname);
  }
  assert.equal((await fetch(base + '/studio/studio.js')).status, 200);
});
