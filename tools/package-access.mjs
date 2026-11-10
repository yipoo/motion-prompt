import fs from 'node:fs';
export function protectStatic(root){
  const catalog=JSON.parse(fs.readFileSync(root+'/api/v1/catalog.json','utf8'));
  const translations={};
  for(const e of catalog.elements){
    e.access=+e.id>192?'pro':'free';
    if(+e.id>192){
      e.spec={en:[],'zh-Hans':[]};e.use={en:'','zh-Hans':''};e.ask={en:'','zh-Hans':''};
      for(const lang of ['en','zh-Hans'])for(const kind of ['p','e'])fs.rmSync(`${root}/api/v1/${lang}/${kind}/${e.id}.txt`,{force:true});
    }else translations[e.id]={summary:e.summary['zh-Hans'],spec:e.spec['zh-Hans'],use:e.use['zh-Hans']};
  }
  for(const p of catalog.packs)if(p.order>8)fs.rmSync(`${root}/api/v1/kit/${p.pack}.js`,{force:true});
  fs.writeFileSync(root+'/api/v1/catalog.json',JSON.stringify(catalog));
  fs.writeFileSync(root+'/assets/catalog.js','window.MP_CATALOG = '+JSON.stringify(catalog)+';\n');
  fs.writeFileSync(root+'/assets/zh-specs.js','window.MP_ZH = '+JSON.stringify(translations)+';\n');
}
