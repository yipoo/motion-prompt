import fs from 'node:fs';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import { spawnSync } from 'node:child_process';
const root=process.argv[2]||'dist',catalog=JSON.parse(fs.readFileSync(root+'/api/v1/catalog.json','utf8'));
assert.equal(catalog.elements.filter(e=>e.access==='free').length,192);
assert.equal(catalog.elements.filter(e=>e.access==='pro').length,120);
for(const e of catalog.elements){
 for(const lang of ['en','zh-Hans'])for(const kind of ['p','e'])assert.equal(fs.existsSync(`${root}/api/v1/${lang}/${kind}/${e.id}.txt`),+e.id<=192,`${e.id} public export`);
 if(+e.id>192){assert.deepEqual(e.spec,{en:[],'zh-Hans':[]});assert.equal(e.ask.en,'');assert.equal(e.use.en,'')}
}
const scope={window:{}};vm.runInNewContext(fs.readFileSync(root+'/assets/zh-specs.js','utf8'),scope);
assert.equal(Object.keys(scope.window.MP_ZH).length,192);
for(const pack of catalog.packs)assert.equal(fs.existsSync(`${root}/api/v1/kit/${pack.pack}.js`),pack.order<=8);
const env={...process.env};delete env.MOTION_PROMPT_ACCESS_TOKEN;
const blocked=spawnSync(process.execPath,['skills/motion-prompt/scripts/motion-prompt.mjs','get','193'],{env,encoding:'utf8'});
assert.equal(blocked.status,2);assert.match(blocked.stderr,/requires Pro/);
console.log('Access packaging: 192 free exports, 120 Pro previews, private specs excluded, unauthenticated Pro CLI blocked.');
