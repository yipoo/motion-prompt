import { createClient } from '@supabase/supabase-js';
const access=window.MP_ACCESS;
async function initialize(){
 try{
  const response=await fetch('/api/billing/public');if(!response.ok)return;
  const settings=await response.json();if(!settings.authReady)return;
  const client=createClient(settings.authURL,settings.authKey,{auth:{flowType:'pkce'}});
  async function api(route){const {data}=await client.auth.getSession();if(!data.session)throw Error('pro_required');const r=await fetch('/api/billing'+route,{headers:{Authorization:`Bearer ${data.session.access_token}`}});if(!r.ok)throw Error(r.status===403||r.status===401?'pro_required':'unavailable');return r.json()}
  access.ensure=async elements=>{
    for(const e of elements.filter(e=>access.premium(e))){
      const lang=document.documentElement.lang==='en'?'en':'zh-Hans';
      const payload=await api(`/motions/${e.id}?lang=${lang}`);
      access.pro=true;access.cache.set(lang+':'+e.id,payload);
      for(const key of ['spec','use','ask'])e[key]??={};
      e.spec[lang]=payload.spec;e.use[lang]=payload.use;e.ask[lang]=payload.ask;
      if(lang==='zh-Hans')window.MP_ZH[e.id]={summary:e.summary[lang],use:payload.use,spec:payload.spec};
    }
  };
  async function refresh(){try{const result=await api('/entitlements');access.pro=result.pro===true}catch{access.pro=false}dispatchEvent(new Event('motion-access-change'))}
  client.auth.onAuthStateChange(()=>setTimeout(()=>void refresh(),0));await refresh();
 }catch{access.pro=false}
}
void initialize();
