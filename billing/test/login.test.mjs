import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';

async function fixture({sendError,verifyError,language='en',cachedLanguage}={}){
  const nodes=new Map();
  const node=()=>({hidden:false,disabled:false,value:'',textContent:'',open:false,dataset:{},append(){},replaceChildren(){},focus(){this.focused=true},addEventListener(){},showModal(){this.open=true},close(){this.open=false}});
  const $=id=>{if(!nodes.has(id))nodes.set(id,node());return nodes.get(id)};
  let listener;const sent=[],verified=[];
  const auth={getSession:async()=>({data:{session:null}}),onAuthStateChange:fn=>{listener=fn},signInWithOtp:async args=>{sent.push(args);return {error:sendError}},verifyOtp:async args=>{verified.push(args);if(!verifyError)listener('SIGNED_IN',{user:{id:'test',email:args.email}});return {error:verifyError}}};
  const document={querySelector:$,querySelectorAll:()=>[],createElement:node,documentElement:{}};
  const context=vm.createContext({document,URL,URLSearchParams,Intl,Date,location:{search:'?lang='+language,origin:'https://motion.yipoo.com'},localStorage:{getItem(){return cachedLanguage},setItem(){}},setInterval(){},setTimeout(){},clearInterval(){},createClient:()=>({auth}),fetch:async()=>({ok:true,json:async()=>({authReady:true,emailOtpReady:true,authURL:'https://example.supabase.co',authKey:'public',products:[]})})});
  const source=fs.readFileSync(new URL('../web/account.mjs',import.meta.url),'utf8').replace(/^import .*;\n/,'');
  await vm.runInContext('(async()=>{'+source+'})()',context);
  return {$,sent,verified};
}
const submit={preventDefault(){}};
test('email login opens a modal, pins sent address, prevents duplicate sends and verifies OTP',async()=>{
  const {$,sent,verified}=await fixture();
  $('#open-login').onclick();assert.equal($('#login-dialog').open,true);
  $('#email').value='person@example.com';
  $('#email-form').onsubmit(submit);await new Promise(setImmediate);
  assert.equal(sent.length,1);assert.equal(sent[0].options.emailRedirectTo,'https://motion.yipoo.com/account.html?lang=en');
  assert.equal($('#code-form').hidden,false);assert.equal($('#email-form').hidden,true);assert.equal($('#resend-code').disabled,true);
  $('#resend-code').onclick();await new Promise(setImmediate);assert.equal(sent.length,1);
  $('#email').value='changed@example.com';$('#code').value='123456';
  await $('#code-form').onsubmit(submit);
  assert.equal(verified[0].email,'person@example.com');assert.equal(verified[0].type,'email');assert.equal($('#login-dialog').open,false);assert.equal($('#code').value,'');
});
test('send and verification errors remain actionable without exposing provider details',async()=>{
  const failed=await fixture({sendError:{status:429,message:'private provider detail'}});
  failed.$('#email').value='person@example.com';failed.$('#email-form').onsubmit(submit);await new Promise(setImmediate);
  assert.match(failed.$('#login-message').textContent,/Too many/);assert.equal(failed.$('#code-form').hidden,true);
  const invalid=await fixture({verifyError:{status:403,message:'private provider detail'}});
  invalid.$('#open-login').onclick();invalid.$('#email').value='person@example.com';invalid.$('#email-form').onsubmit(submit);await new Promise(setImmediate);
  invalid.$('#code').value='000000';await invalid.$('#code-form').onsubmit(submit);
  assert.match(invalid.$('#login-message').textContent,/incorrect or expired/);assert.equal(invalid.$('#login-dialog').open,true);assert.equal(invalid.$('#verify-code').disabled,false);
});

test('requested UI language overrides stored language and accompanies every email request',async()=>{
  const chinese=await fixture({language:'zh',cachedLanguage:'"en"'});chinese.$('#email').value='person@example.com';chinese.$('#email-form').onsubmit(submit);await new Promise(setImmediate);
  assert.equal(chinese.sent[0].options.emailRedirectTo,'https://motion.yipoo.com/account.html?lang=zh');
  assert.equal(chinese.sent[0].options.data.language,'zh');
  const english=await fixture({language:'zh'});english.$('#language').onclick();english.$('#email').value='person@example.com';english.$('#email-form').onsubmit(submit);await new Promise(setImmediate);
  assert.equal(english.sent[0].options.emailRedirectTo,'https://motion.yipoo.com/account.html?lang=en');
});
