import fs from 'node:fs';
fs.rmSync('dist',{recursive:true,force:true});fs.mkdirSync('dist');for(const name of ['index.html','.nojekyll','assets','studio','api','LICENSE','THIRD-PARTY-NOTICES.md'])fs.cpSync(name,'dist/'+name,{recursive:true});console.log('Packaged static site in dist/');
