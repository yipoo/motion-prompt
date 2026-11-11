import fs from 'node:fs';import path from 'node:path';import assert from 'node:assert/strict';
import {publicElement} from './public-content.mjs';
const out=process.argv[2]||'out/public',manifest=JSON.parse(fs.readFileSync(path.join(out,'seo-routes.json'))),full=JSON.parse(fs.readFileSync('api/v1/catalog.json')),site=manifest.canonicalSite;
const find=(s,re)=>s.match(re)?.[1];let details=0;const titles=new Map();
for(const r of manifest.routes){
 const file=path.join(out,r.route,'index.html'),html=fs.readFileSync(file,'utf8');
 assert.equal(find(html,/<link rel="canonical" href="([^"]+)"/),r.canonical,r.route+' canonical');
 assert(html.includes('hreflang="zh-Hans"'));assert(html.includes('hreflang="en"'));
 assert(html.includes('href="'+new URL(r.route.replace(/^(zh|en)\//,'zh/'),site).href+'"')||r.canonical!==new URL(r.route,site).href);
 assert.equal((html.match(/<h1[ >]/g)||[]).length,1,r.route+' h1');
 assert(!/<(?:p|h[123])\b[^>]*>\s*<\//.test(html.replace(/<dialog\b[\s\S]*?<\/dialog>/g,'')),'Empty visible body copy '+r.route);
 if(r.route===r.locale+'/'){assert(html.includes('data-home="true"'));assert.equal((html.match(/<article class="card"/g)||[]).length,24);assert(html.includes('data-pack="interface"')||html.includes('/packs/interface/'));assert(html.includes('studio/strings.js'));assert(!html.includes('assets/entry.js'));}
 const title=find(html,/<title>([^<]+)<\/title>/);if(titles.has(title)&&r.indexable&&titles.get(title).indexable)throw Error('Duplicate indexable title '+title);titles.set(title,r);
 if(r.route.includes('/motions/')){
  details++;const id=r.route.match(/\/(\d{3})-/)[1],e=full.elements.find(e=>e.id===id);assert(e);assert(html.includes('id="about"'));assert(html.includes('id="use"'));assert(html.includes('id="limits"'));assert(html.includes('id="integration"'));assert(html.includes('data-motion-preview'));
  if(e.tier==='pro')for(const lang of ['en','zh-Hans'])for(const value of [...e.spec[lang],e.ask[lang],e.use[lang]])if(value.length>35)assert(!html.includes(value),'Private content leaked '+r.route);
 }
 for(const script of html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g))JSON.parse(script[1]);
 for(const a of html.replace(/<base\b[^>]*>/g,'').matchAll(/(?:href|src)="([^"#]+)"/g)){
  const link=a[1];if(/^(?:https?:|mailto:)/.test(link))continue;
  const withoutBase=link.startsWith(manifest.basePath)?link.slice(manifest.basePath.length):link;
  const pathname=withoutBase.split(/[?#]/)[0];if(!pathname||pathname.startsWith('api/'))continue;
  const generated=path.join(out,pathname,pathname.endsWith('/')?'index.html':'');const raw=path.join(process.cwd(),pathname,pathname.endsWith('/')?'index.html':'');assert(fs.existsSync(generated)||fs.existsSync(raw),'Broken local link '+r.route+' '+link);
 }
}
assert.equal(details,full.elements.length*2);assert.equal(manifest.routes.length,(full.elements.length+full.packs.length+2)*2);
const sitemap=fs.readFileSync(path.join(out,'sitemap.xml'),'utf8');assert(!sitemap.includes('/studio/'));assert(!sitemap.includes('account.html'));assert.equal((sitemap.match(/<loc>/g)||[]).length,manifest.routes.filter(r=>r.indexable).length);
const workspace=fs.readFileSync(path.join(out,'studio/index.html'),'utf8');assert(workspace.includes('noindex,follow'));assert(workspace.includes('<base href="../">'));
const robots=fs.readFileSync(path.join(out,'robots.txt'),'utf8');assert(!robots.includes('Disallow: '+manifest.basePath+'studio/'),'Preview assets must remain crawlable');
const secret='PRIVATE_CONTENT_SENTINEL';const e=full.elements.find(e=>e.tier==='pro');const projected=JSON.stringify(publicElement({...e,spec:{en:[secret]},private:secret,public:{...e.public,unknown:secret,locales:{...e.public.locales,en:{...e.public.locales.en,private:secret}}}}));assert(!projected.includes(secret));
const deploymentConfig=path.join(out,'../config.json');
if(fs.existsSync(deploymentConfig)){
 const config=JSON.parse(fs.readFileSync(deploymentConfig,'utf8'));
 const apiNoindex=config.routes.find(r=>r.src==='/api/v1/(.*)'&&r.headers?.['X-Robots-Tag']?.includes('noindex')&&r.continue===true);assert(apiNoindex,'Raw API exports need a crawlable noindex response header');
 for(const raw of ['/api/v1/en/e/001.txt','/api/v1/zh-Hans/p/001.txt','/api/v1/catalog.json','/api/v1/en/catalog.tsv','/api/v1/kit/motion.js'])assert(new RegExp(apiNoindex.src).test(raw));
 for(const asset of ['/assets/runtime.js','/studio/locale.js','/studio/packs/motion.js'])assert(!new RegExp(apiNoindex.src).test(asset),'Raw export policy must not target preview assets');
}
console.log(`PASS: ${details} static detail pages, canonical/languages, visible body, links, JSON-LD, public allowlist, paid-content boundary, sitemap, robots and workspace isolation.`);
