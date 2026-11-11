import {execFileSync} from 'node:child_process';
import {buildSEO} from './seo.mjs';
import fs from 'node:fs';
import { protectStatic } from './package-access.mjs';
fs.rmSync('dist',{recursive:true,force:true});fs.mkdirSync('dist');for(const name of ['index.html','.nojekyll','assets','studio','api','LICENSE','THIRD-PARTY-NOTICES.md'])fs.cpSync(name,'dist/'+name,{recursive:true});protectStatic('dist');const catalog=JSON.parse(fs.readFileSync('dist/api/v1/catalog.json'));console.log(`Packaged static site: ${catalog.elements.filter(e=>e.access==='free').length} Free, ${catalog.elements.filter(e=>e.access==='pro').length} Pro previews; paid exports excluded.`);

buildSEO({out:'dist',basePath:process.env.PUBLIC_BASE_PATH??'/motion-prompt/',mirror:process.env.SEO_MIRROR!=='false',preview:process.env.SEO_NOINDEX==='true'});

execFileSync(process.execPath,['tools/verify-seo.mjs','dist'],{stdio:'inherit'});
