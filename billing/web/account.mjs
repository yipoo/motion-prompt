import { createClient } from '@supabase/supabase-js';
const $=s=>document.querySelector(s);
const text={
  billingPending:['登录成功。订阅与账单服务正在准备中。','Signed in. Subscriptions and billing are being prepared.'],
  emailPending:['邮箱验证码登录正在配置，请稍后再试。','Email code sign-in is being configured. Please try again later.'],
  emailLogin:['邮箱登录 / 注册','Sign in with email'],loginIntro:['无需密码。输入邮箱，使用验证码登录；首次登录将自动创建账户。','No password needed. Enter your email to receive a sign-in code. New accounts are created automatically.'],loginHelp:['请勿向他人透露验证码。收不到邮件时，请检查垃圾邮件。','Never share your code. Check your spam folder if the email is missing.'],resend:['重新发送','Resend code'],changeEmail:['更换邮箱','Change email'],sending:['正在发送…','Sending…'],verifying:['正在验证…','Verifying…'],invalidCode:['验证码错误或已过期，请检查后重试，或重新发送。','The code is incorrect or expired. Check it or request a new one.'],rateLimit:['请求过于频繁，请稍后再试。','Too many requests. Please try again later.'],sendFailed:['验证码发送失败，请稍后重试或联系作者。','Unable to send a code. Try again later or contact the author.'],signedIn:['登录成功。','Signed in.'],
  library:['免费动效库','Free motion library'],headline:['把动效灵感，变成完整设计。','Turn motion inspiration into complete designs.'],intro:['免费库继续开放。精品包围绕真实页面，提供组合 prompt、示例代码和设计说明。','The free library stays open. Premium packs bring composed prompts, example code and design notes to real pages.'],account:['你的账户','Your account'],accountIntro:['登录后查看购买记录、下载精品包，或管理订阅和发票。','Sign in to access purchased packs and manage your subscription and invoices.'],email:['邮箱','Email'],sendCode:['发送验证码','Send code'],code:['邮箱验证码','Email code'],verify:['登录','Sign in'],github:['使用 GitHub 登录','Continue with GitHub'],portal:['管理订阅与发票','Manage billing & invoices'],signOut:['退出登录','Sign out'],contact:['联系作者','Contact'],terms:['单包包含所购版本；Pro 权益在订阅有效期内提供。下载后的文件按交付许可使用。现有 MIT 开源内容保持免费。','Pack purchases include the purchased version. Pro access lasts for the subscription term. Downloaded files follow their delivered license. Existing MIT content remains free.'],
  pack:['精品设计包','Premium design pack'],monthly:['Pro 月付','Pro monthly'],yearly:['Pro 年付','Pro yearly'],packDesc:['一次购买，持续使用所购版本。组合 prompt、示例代码与设计说明。','One purchase. Keep the purchased version, with composed prompts, code and design notes.'],proDesc:['解锁新增 120 个动效的完整规格、prompt、参考代码与组合导出，可在账单门户取消续费。','Unlock full specs, prompts, reference exports and composition for 120 added motions. Cancel renewal in the billing portal.'],buy:['购买精品包','Buy pack'],subscribe:['订阅 Pro','Subscribe to Pro'],soon:['准备中','Coming soon'],month:['/ 月','/ month'],year:['/ 年','/ year'],once:['一次购买','one time'],sandbox:['沙盒体验：仅用于测试，不会收取真实款项。','Sandbox only. No real payments are collected.'],notReady:['精品内容和结账正在准备中；免费库可正常使用。','Premium content and checkout are being prepared. The free library remains available.'],authPending:['登录服务正在配置，请稍后再试。','Sign-in is being configured. Please try later.'],sent:['验证码已发送，请检查邮箱。','Code sent. Check your inbox.'],failed:['操作未完成，请稍后再试或联系作者。','Could not complete this action. Try later or contact the author.'],signFirst:['请先登录，再选择购买方案。','Sign in before choosing a plan.'],free:['当前为免费账户。','You have a free account.'],pro:['Pro 订阅有效。','Your Pro subscription is active.'],owned:['已购精品包：','Purchased packs: '],review:['付费权益正在核查，请联系作者。','Your billing access is under review. Please contact the author.'],download:['下载','Download'],invoice:['发票','Invoice'],paidPending:['付款结果正在确认，权益由支付通知更新。','Confirming payment. Access updates after the payment notification.'],cancelled:['本次结账已取消。','Checkout was cancelled.'],refresh:['刷新权益','Refresh access'],loadFailed:['暂时无法加载账户信息，请刷新重试。','Account information is unavailable. Refresh to retry.']
};
const requestedLang=new URLSearchParams(location.search).get('lang');
let lang=['zh','en'].includes(requestedLang)?requestedLang:localStorage.getItem('studio-lang')==='"en"'?'en':'zh';
let settings,auth,user,access={pro:false,packs:[]},busy=false,poll,authBusy=false,codeEmail='',resendAt=0,loginMessageKey='';
const t=k=>text[k]?.[lang==='en'?1:0]||k;
function message(key){$('#message').textContent=t(key)}
function render(){
  document.documentElement.lang=lang==='en'?'en':'zh-CN';document.title=lang==='en'?'Motion Prompt · Premium & account':'Motion Prompt · 精品包与账户';
  document.querySelectorAll('[data-i18n]').forEach(el=>el.textContent=t(el.dataset.i18n));$('#language').textContent=lang==='en'?'中文':'EN';
  $('#environment').textContent=settings?.paymentsReady?(settings.sandbox?t('sandbox'):''):t('notReady');
  $('#open-login').hidden=!!user;$('#open-login').disabled=!settings?.authReady;$('#signed-in').hidden=!user;$('#github').hidden=!!user||!settings?.githubEnabled;
  renderLogin();
  $('#identity').textContent=user?.email||'';
  $('#portal').hidden=!settings?.billingReady;
  $('#entitlements').textContent=!settings?.billingReady?t('billingPending'):access.reviewRequired?t('review'):access.pro?t('pro'):access.packs.length?t('owned')+access.packs.join(', '):t('free');
  $('#products').replaceChildren();
  const labels=['pack','monthly','yearly'];
  for(const [i,p] of (settings?.products||[]).entries()){
    const card=document.createElement('article');card.className='product'+(i===1?' featured':'');
    const title=document.createElement('h2');title.textContent=t(labels[i]);
    const price=document.createElement('div');price.className='price';price.textContent=new Intl.NumberFormat(lang==='en'?'en-US':'zh-CN',{style:'currency',currency:p.currency,maximumFractionDigits:0}).format(p.amount/100)+' ';
    const period=document.createElement('span');period.textContent=t(p.interval==='month'?'month':p.interval==='year'?'year':'once');price.append(period);
    const description=document.createElement('p');description.textContent=t(i===0?'packDesc':'proDesc');
    const button=document.createElement('button');button.textContent=t(p.available?(i===0?'buy':'subscribe'):'soon');button.disabled=!p.available||busy;button.onclick=()=>checkout(p.sku);
    card.append(title,price,description,button);$('#products').append(card);
  }
  $('#downloads').replaceChildren();
  const downloads=access.pro?(settings?.products||[]).filter(p=>p.mode==='payment').map(p=>p.sku):access.packs;
  for(const sku of downloads){const row=document.createElement('div');row.className='download';const label=document.createElement('span');label.textContent=sku;const button=document.createElement('button');button.textContent=t('download');button.onclick=()=>download(sku);row.append(label,button);$('#downloads').append(row)}
}
async function api(route,options={}){
  const {data}=await auth.auth.getSession();if(!data.session)throw Error('signFirst');
  const response=await fetch('/api/billing'+route,{...options,headers:{Authorization:`Bearer ${data.session.access_token}`,...options.headers}});
  const dataOut=await response.json();if(!response.ok)throw Error('failed');return dataOut;
}
async function refresh(){if(!user||!settings?.billingReady)return;try{access=await api('/entitlements');render();return access}catch{message('loadFailed')}}
async function checkout(sku){
  if(!user){openLogin();return}
  busy=true;render();
  try{
    const storageKey=`checkout:${user.id}:${sku}`;
    let key=sessionStorage.getItem(storageKey);if(!key){key=crypto.randomUUID();sessionStorage.setItem(storageKey,key)}
    const result=await api('/checkout',{method:'POST',headers:{'Content-Type':'application/json','Idempotency-Key':key},body:JSON.stringify({sku,language:lang})});
    const url=new URL(result.url);if(url.protocol!=='https:'||url.hostname!=='checkout.stripe.com')throw Error('failed');location.assign(url.href);
  }catch(e){message(e.message==='signFirst'?'signFirst':'failed')}finally{busy=false;render()}
}
async function download(sku){try{const result=await api('/downloads/'+encodeURIComponent(sku));const url=new URL(result.url);if(url.protocol!=='https:'||url.origin!==new URL(settings.authURL).origin)throw Error();location.assign(url.href)}catch{message('failed')}}
$('#language').onclick=()=>{lang=lang==='en'?'zh':'en';localStorage.setItem('studio-lang',JSON.stringify(lang==='en'?'en':'zh-Hans'));render()};
function renderLogin(){
  const remaining=Math.max(0,Math.ceil((resendAt-Date.now())/1000));
  $('#email-status').hidden=!!settings?.emailOtpReady;$('#email-status').textContent=t('emailPending');
  $('#email-form').hidden=!!codeEmail;$('#code-form').hidden=!codeEmail;
  $('#email').disabled=!settings?.authReady||authBusy;
  $('#send-code').disabled=!settings?.authReady||!settings?.emailOtpReady||authBusy||remaining>0;
  $('#send-code').textContent=authBusy?t('sending'):remaining?t('sendCode')+` (${remaining}s)`:t('sendCode');
  $('#verify-code').disabled=authBusy;$('#verify-code').textContent=t(authBusy?'verifying':'verify');
  $('#resend-code').disabled=authBusy||remaining>0;$('#resend-code').textContent=t('resend')+(remaining?` (${remaining}s)`:'');
  $('#change-email').disabled=authBusy;$('#github').disabled=authBusy;
  $('#sent-to').textContent=codeEmail;$('#login-message').textContent=loginMessageKey?t(loginMessageKey):'';
}
function openLogin(){if(!auth){message('authPending');return}$('#login-dialog').showModal();renderLogin();$(codeEmail?'#code':'#email').focus()}
$('#open-login').onclick=openLogin;
$('#close-login').onclick=()=>$('#login-dialog').close();
$('#login-dialog').addEventListener('click',event=>{if(event.target===$('#login-dialog')){const r=event.target.getBoundingClientRect();if(event.clientX<r.left||event.clientX>r.right||event.clientY<r.top||event.clientY>r.bottom)event.target.close()}});
async function sendCode(){
  if(authBusy||Date.now()<resendAt)return;
  if(!auth||!settings?.emailOtpReady){loginMessageKey='emailPending';renderLogin();return}
  const email=codeEmail||$('#email').value.trim();authBusy=true;loginMessageKey='';renderLogin();
  try{
    const {error}=await auth.auth.signInWithOtp({email,options:{emailRedirectTo:location.origin+'/account.html?lang='+lang,data:{language:lang}}});
    if(error)throw error;
    codeEmail=email;resendAt=Date.now()+60000;loginMessageKey='sent';$('#code').value='';
  }catch(error){loginMessageKey=error.status===429?'rateLimit':'sendFailed';if(error.status===429)resendAt=Date.now()+60000}
  finally{authBusy=false;renderLogin();if(codeEmail)$('#code').focus()}
}
$('#email-form').onsubmit=event=>{event.preventDefault();void sendCode()};
$('#resend-code').onclick=()=>void sendCode();
$('#change-email').onclick=()=>{codeEmail='';$('#code').value='';loginMessageKey='';renderLogin();$('#email').focus()};
$('#code-form').onsubmit=async event=>{
  event.preventDefault();if(authBusy||!codeEmail)return;authBusy=true;loginMessageKey='';renderLogin();
  try{
    const {error}=await auth.auth.verifyOtp({email:codeEmail,token:$('#code').value.trim(),type:'email'});if(error)throw error;
    $('#login-dialog').close();codeEmail='';$('#code').value='';loginMessageKey='';message('signedIn');
  }catch(error){loginMessageKey=error.status===429?'rateLimit':'invalidCode'}finally{authBusy=false;renderLogin()}
};
setInterval(renderLogin,1000);
$('#github').onclick=async()=>{const {error}=await auth.auth.signInWithOAuth({provider:'github',options:{redirectTo:location.origin+'/account.html'}});if(error)message('failed')};
$('#sign-out').onclick=async()=>{await auth.auth.signOut();access={pro:false,packs:[]};clearInterval(poll);render()};
$('#portal').onclick=async()=>{try{const result=await api('/portal',{method:'POST'});const url=new URL(result.url);if(url.protocol!=='https:'||url.hostname!=='billing.stripe.com')throw Error();location.assign(url.href)}catch{message('failed')}};
try{
  const response=await fetch('/api/billing/public');if(!response.ok)throw Error();settings=await response.json();render();
  if(settings.authReady){
    auth=createClient(settings.authURL,settings.authKey,{auth:{flowType:'pkce'}});
    const {data,error}=await auth.auth.getSession();if(error)throw error;user=data.session?.user;
    auth.auth.onAuthStateChange((_event,session)=>{user=session?.user;if(user&&$('#login-dialog').open)$('#login-dialog').close();if(!user)access={pro:false,packs:[]};render();if(user)setTimeout(()=>void refresh(),0)});
    if(user)await refresh();
  }
  render();
  const result=new URLSearchParams(location.search).get('billing');
  if(result==='success'){message('paidPending');let count=0;poll=setInterval(async()=>{const state=await refresh();if(++count>=10||state?.pro||state?.packs.length)clearInterval(poll)},3000)}
  if(result==='cancelled')message('cancelled');
}catch{settings={authReady:false,paymentsReady:false,products:[{sku:'premium-pack',mode:'payment',amount:900,currency:'usd'},{sku:'pro-monthly',mode:'subscription',amount:1200,currency:'usd',interval:'month'},{sku:'pro-yearly',mode:'subscription',amount:9900,currency:'usd',interval:'year'}]};render();message('loadFailed')}
