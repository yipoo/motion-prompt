import fs from 'node:fs';
import { protectStatic } from './package-access.mjs';
fs.rmSync('dist',{recursive:true,force:true});fs.mkdirSync('dist');for(const name of ['index.html','.nojekyll','assets','studio','api','LICENSE','THIRD-PARTY-NOTICES.md'])fs.cpSync(name,'dist/'+name,{recursive:true});protectStatic('dist');console.log('Packaged static site: 192 free motions, 120 Pro previews; paid exports excluded.');
