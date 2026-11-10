import fs from 'node:fs';
import Stripe from 'stripe';
if(!/^(rk|sk)_test_/.test(process.env.STRIPE_SECRET_KEY||''))throw Error('Sandbox key required');
const stripe=new Stripe(process.env.STRIPE_SECRET_KEY,{apiVersion:'2026-10-28.endive',timeout:15000,maxNetworkRetries:1});
const definitions=[
  {sku:'premium-pack',name:'Motion Prompt · Premium Design Pack',amount:900,mode:'payment',lookup:'motion_prompt_pack_v1_usd',file:'premium-pack.zip'},
  {sku:'pro-monthly',name:'Motion Prompt Pro',amount:1200,mode:'subscription',interval:'month',lookup:'motion_prompt_pro_month_v1_usd'},
  {sku:'pro-yearly',name:'Motion Prompt Pro',amount:9900,mode:'subscription',interval:'year',lookup:'motion_prompt_pro_year_v1_usd'}
];
const products=(await stripe.products.list({limit:100})).data;
const catalog=[];let proProduct;
for(const definition of definitions){
  const productKey=definition.mode==='payment'?'premium-pack':'pro';
  let product=products.find(p=>p.metadata.motion_prompt_sku===productKey);
  if(!product){product=await stripe.products.create({name:definition.name,metadata:{motion_prompt_sku:productKey}},{idempotencyKey:`motion-prompt-product-${productKey}-v1`});products.push(product)}
  let price=(await stripe.prices.list({lookup_keys:[definition.lookup],limit:2})).data[0];
  if(!price)price=await stripe.prices.create({product:product.id,unit_amount:definition.amount,currency:'usd',lookup_key:definition.lookup,...(definition.interval?{recurring:{interval:definition.interval}}:{})},{idempotencyKey:`motion-prompt-price-${definition.lookup}`});
  if(price.livemode||price.unit_amount!==definition.amount||price.currency!=='usd'||price.recurring?.interval!==definition.interval||price.product!==product.id)throw Error('Existing catalog conflicts with approved pricing');
  catalog.push({sku:definition.sku,title:definition.name,mode:definition.mode,price:price.id,amount:definition.amount,currency:'usd',...(definition.interval?{interval:definition.interval}:{}),...(definition.file?{file:definition.file}:{})});
  if(definition.mode==='subscription')proProduct=product.id;
}
const existing=(await stripe.billingPortal.configurations.list({limit:100,active:true})).data.find(p=>p.metadata?.motion_prompt==='v1');
const portal=existing||await stripe.billingPortal.configurations.create({metadata:{motion_prompt:'v1'},features:{invoice_history:{enabled:true},payment_method_update:{enabled:true},subscription_cancel:{enabled:true,mode:'at_period_end'},subscription_update:{enabled:true,default_allowed_updates:['price'],proration_behavior:'create_prorations',products:[{product:proProduct,prices:catalog.filter(p=>p.mode==='subscription').map(p=>p.price)}]}}});
let env=fs.readFileSync('.env','utf8');
for(const [name,value] of Object.entries({BILLING_CATALOG:JSON.stringify(catalog),STRIPE_PORTAL_CONFIGURATION:portal.id})){
  const line=`${name}=${value}`;
  const pattern=new RegExp(`^${name}=.*$`,'m');env=pattern.test(env)?env.replace(pattern,()=>line):env+'\n'+line+'\n';
}
fs.writeFileSync('.env',env,{mode:0o600});fs.chmodSync('.env',0o600);
console.log(JSON.stringify({sandbox:true,products:2,prices:catalog.map(p=>({sku:p.sku,amount:p.amount,currency:p.currency,interval:p.interval||null})),portalConfigured:true,environmentUpdated:true}));
