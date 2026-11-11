// Shared public projection. Never spread source records into public documents.
const localeKeys=['en','zh-Hans'];
const editorialKeys=['useCases','limitations','integration'];
export function publicElement(e){
 const fields=['id','no','slug','pack','category','name','meaning','summary','tier','width','height','cycle','tags'];
 const out=Object.fromEntries(fields.filter(k=>e[k]!==undefined).map(k=>[k,e[k]]));
 out.public={indexable:e.public?.indexable!==false,locales:Object.fromEntries(localeKeys.map(lang=>[lang,Object.fromEntries(editorialKeys.map(k=>[k,(e.public?.locales?.[lang]?.[k]||[]).filter(x=>typeof x==='string')]))]))};
 if(e.public?.canonicalId)out.public.canonicalId=e.public.canonicalId;
 if(e.public?.aliases)out.public.aliases=e.public.aliases.filter(x=>typeof x==='string');
 if(e.related?.url?.startsWith('https://'))out.related={platform:e.related.platform,url:e.related.url};
 return out;
}
export function hostedElement(e){const out=publicElement(e),pro=e.tier==='pro';out.access=pro?'pro':'free';for(const key of ['spec','use','ask'])out[key]=pro?(key==='spec'?{en:[],'zh-Hans':[]}:{en:'','zh-Hans':''}):e[key];return out;}
