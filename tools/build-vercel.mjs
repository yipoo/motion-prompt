import fs from 'node:fs';
import { execFileSync } from 'node:child_process';
import { build } from 'esbuild';
const canonical='https://yipoo.github.io/motion-prompt/';
const deploymentBase=process.env.SITE_URL||'https://motion-prompt.vercel.app/';
execFileSync(process.execPath,['tools/build-studio.mjs'],{stdio:'inherit',env:{...process.env,SITE_URL:canonical}});
execFileSync(process.execPath,['tools/package.mjs'],{stdio:'inherit'});
const output='.vercel/output';
fs.rmSync(output,{recursive:true,force:true});
fs.mkdirSync(output+'/static',{recursive:true});
fs.cpSync('dist',output+'/static',{recursive:true});
function localizeHost(folder){for(const item of fs.readdirSync(folder,{withFileTypes:true})){const file=folder+'/'+item.name;if(item.isDirectory())localizeHost(file);else if(/\.(html|js|json|txt|tsv|md)$/.test(item.name))fs.writeFileSync(file,fs.readFileSync(file,'utf8').replaceAll(canonical,deploymentBase));}}
localizeHost(output+'/static');
fs.cpSync('billing/web/account.html',output+'/static/account.html');
fs.cpSync('billing/web/account.css',output+'/static/studio/account.css');
await build({entryPoints:['billing/web/account.mjs'],outfile:output+'/static/studio/account.js',bundle:true,format:'esm',platform:'browser',minify:true});
let index=fs.readFileSync(output+'/static/index.html','utf8');
index=index.replace('<div class="install">','<p class="commerce-entry"><a id="commerce-entry" href="account.html">精品包与账户 ↗</a></p><div class="install">');
index=index.replace('</body>',`<script>const cl=document.getElementById('commerce-entry');function commerceLocale(){cl.textContent=document.documentElement.lang==='en'?'Premium packs & account ↗':'精品包与账户 ↗'}new MutationObserver(commerceLocale).observe(document.documentElement,{attributes:true,attributeFilter:['lang']});commerceLocale();</script></body>`);
fs.writeFileSync(output+'/static/index.html',index);
const fn=output+'/functions/api/billing.func';fs.mkdirSync(fn,{recursive:true});
fs.cpSync('billing/certs',fn+'/certs',{recursive:true});
await build({entryPoints:['billing/vercel.mjs'],outfile:fn+'/index.mjs',bundle:true,format:'esm',platform:'node',target:'node24',banner:{js:"import { createRequire as _createRequire } from 'node:module';const require=_createRequire(import.meta.url);"},external:['pg-native'],minify:false});
fs.writeFileSync(fn+'/.vc-config.json',JSON.stringify({runtime:'nodejs24.x',handler:'index.mjs',launcherType:'Nodejs',maxDuration:60}));
fs.writeFileSync(output+'/config.json',JSON.stringify({version:3,regions:['sin1'],routes:[
  {src:'/api/billing(?:/(.*))?',dest:'/api/billing?__route=$1'},
  {handle:'filesystem'},
  {src:'/',dest:'/index.html'}
]}));
console.log('Vercel output: public site + account page + one billing function. Private code and secrets excluded from static files.');
