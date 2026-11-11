// Run after build:vercel. Verify content-tier boundaries across the real output.
import fs from 'node:fs';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import path from 'node:path';
import {spawnSync} from 'node:child_process';
const root=process.argv[2]||'dist';
const full=JSON.parse(fs.readFileSync('api/v1/catalog.json','utf8'));
const publicCatalog=JSON.parse(fs.readFileSync(root+'/api/v1/catalog.json','utf8'));
const privateFile='.vercel/output/functions/api/billing.func/premium.json';const isFunctionOutput=path.resolve(root)===path.resolve('.vercel/output/static');if(isFunctionOutput)assert(fs.existsSync(privateFile),'Build the Vercel function before checking private content');const privateCatalog=isFunctionOutput?JSON.parse(fs.readFileSync(privateFile,'utf8')):null;
const context={window:{}};vm.createContext(context);vm.runInContext(fs.readFileSync('studio/access.js','utf8'),context);
let free=0,pro=0;
for(const e of full.elements){
  const paid=e.tier==='pro';const visible=publicCatalog.elements.find(x=>x.id===e.id);
  assert.equal(context.window.MP_ACCESS.premium(e),paid,e.id+' client tier');
  assert.equal(visible.access,paid?'pro':'free');
  if(privateCatalog)assert.equal(Boolean(privateCatalog[e.id]),paid,e.id+' private catalog');
  if(paid){pro++;assert.deepEqual(visible.spec,{en:[],'zh-Hans':[]});for(const lang of ['en','zh-Hans']){assert.equal(visible.ask[lang],'');assert.equal(visible.use[lang],'')}}else{free++;assert(visible.spec.en.length)}
  for(const lang of ['en','zh-Hans'])for(const kind of ['p','e'])assert.equal(fs.existsSync(`${root}/api/v1/${lang}/${kind}/${e.id}.txt`),!paid,e.id+' public export');
}
assert(fs.existsSync(root+'/api/v1/kit/interface.js'));
const kit=fs.readFileSync(root+'/api/v1/kit/interface.js','utf8');
assert(!kit.includes('CELLS[7]='),'Mixed-tier shared kit must not include Pro element implementations');
assert.equal(free,full.elements.filter(e=>e.tier==='free').length);assert.equal(pro,full.elements.filter(e=>e.tier==='pro').length);
console.log(`PASS: ${free} Free / ${pro} Pro; client tiers, public exports, private content, and mixed-tier helpers agree.`);

const translations={window:{}};vm.runInNewContext(fs.readFileSync(root+'/assets/zh-specs.js','utf8'),translations);assert.equal(Object.keys(translations.window.MP_ZH).length,free);
for(const pack of publicCatalog.packs)assert.equal(fs.existsSync(root+'/api/v1/kit/'+pack.pack+'.js'),publicCatalog.elements.some(e=>e.pack===pack.pack&&e.access==='free'));
const env={...process.env};delete env.MOTION_PROMPT_ACCESS_TOKEN;
for(const id of ['193','319']){const blocked=spawnSync(process.execPath,['skills/motion-prompt/scripts/motion-prompt.mjs','get',id,'--local'],{env,encoding:'utf8'});assert.equal(blocked.status,2);assert.match(blocked.stderr,/requires Pro/)}
for(const args of [['get','313'],['kit','interface']]){const available=spawnSync(process.execPath,['skills/motion-prompt/scripts/motion-prompt.mjs',...args,'--local'],{env,encoding:'utf8'});assert.equal(available.status,0,available.stderr)}
console.log('PASS: private specs/use/ask removed, Free translations and helpers retained, old/new Pro CLI blocked, new Free CLI and mixed-pack helpers available.');
