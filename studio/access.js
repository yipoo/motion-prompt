/* Hosted service access policy. Existing MIT grants and attribution are preserved. */
window.MP_ACCESS={
 pro:false,enabled:true,cache:new Map(),
 premium:e=>Number(e?.id)>192,
 locked(e){return this.premium(e)&&!this.pro},
 subscribe(){const lang=document.documentElement.lang==='en'?'en':'zh';location.assign((location.hostname==='motion.yipoo.com'||location.hostname==='motion-prompt.vercel.app'?location.origin:'https://motion.yipoo.com')+'/account.html?lang='+lang)},
 async ensure(elements){if(elements.some(e=>this.premium(e)))throw Error('pro_required')},
 content(e){return this.cache.get((document.documentElement.lang==='en'?'en':'zh-Hans')+':'+e.id)},
 prompt(e,options){
  if(this.locked(e))return document.documentElement.lang==='en'?'Subscribe to Pro to use this motion.':'订阅 Pro 后即可使用此动效。';
  const payload=this.content(e);if(!payload)return '';
  const base=window.MP_BUILD_PROMPT(e,options).replace(/^(规格与代码|共享辅助代码|Spec and code|Shared helper code)[:：].*$/gm,'');
  return base+'\n\n'+(document.documentElement.lang==='en'?'Reference code and helpers (included; no sign-in token needed):':'参考实现与辅助代码（已完整附上，无需提供登录凭据）：')+'\n\n'+payload.kit+'\n\n'+payload.code;
 }
};
