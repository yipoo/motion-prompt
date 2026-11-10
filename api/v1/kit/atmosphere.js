/* Motion Prompt · Original extensions by yipoo (MIT). Requires studio/locale.js and bundled Motion Sans. */
  // @kit
  const CW=539,CH=208,CYC=4.8,TAU=Math.PI*2,CELLS=[];
  const bi=(en,zh)=>document.documentElement.lang==='en'?en:zh;
  const palette=['#a8c9ff','#ddf98b','#c7a6ff','#ffb896'];
  const dot=(k,x,y,r,c)=>{k.fillStyle=c;k.beginPath();k.arc(x,y,Math.max(.01,r),0,TAU);k.fill()};
  const line=(k,pts,c,width=1)=>{k.strokeStyle=c;k.lineWidth=width;k.beginPath();pts.forEach(([x,y],i)=>i?k.lineTo(x,y):k.moveTo(x,y));k.stroke()};
  const text=(k,en,zh,x,y,size=35,c='#fff')=>{k.font=`700 ${size}px "Motion Sans",sans-serif`;k.textAlign='center';k.textBaseline='middle';k.fillStyle=c;k.fillText(bi(en,zh),x,y)};
  function background(k,w,h,color='#080e21'){k.fillStyle=color;k.fillRect(0,0,w,h)}
  function glow(k,x,y,r,color){const g=k.createRadialGradient(x,y,0,x,y,r);g.addColorStop(0,color);g.addColorStop(1,'#00000000');k.fillStyle=g;k.fillRect(x-r,y-r,r*2,r*2)}
  function stars(k,w,h,a,n=110){for(let j=0;j<n;j++){const x=((Math.sin(j*127.1)*43758.5453)%1+1)%1*w,y=((Math.sin(j*311.7)*9513.175)%1+1)%1*h;k.globalAlpha=.25+.6*(.5+.5*Math.sin(a+j));dot(k,x,y,j%7===0?1.3:.65,'#e2ecff')}k.globalAlpha=1}
  function grid(k,w,h,step=25){for(let x=w/2%step;x<w;x+=step)line(k,[[x,0],[x,h]],'#91a9e51c');for(let y=h/2%step;y<h;y+=step)line(k,[[0,y],[w,y]],'#91a9e51c')}
  function pointerAt(a,w,h,p){return p?{x:p.x*w,y:p.y*h}:{x:w/2+Math.cos(a)*w*.23,y:h/2+Math.sin(a*2)*h*.24}}
  function scene(index,k,w,h,u,p){const a=u/CYC*TAU,pt=pointerAt(a,w,h,p),cx=w/2,cy=h/2,scale=Math.min(w/539,h/208),overlay=!!p?.overlay;if(!overlay)background(k,w,h);k.save();
    if(index<8){
      if(index===0){stars(k,w,h,a);glow(k,cx+Math.cos(a)*w*.13,cy,h*.8,'#425eff88');glow(k,w*.7,cy+Math.sin(a)*h*.18,h*.65,'#ce6aff66');text(k,'BEYOND THE ORDINARY','不止于想象',cx,cy,36*scale)}
      if(index===1){for(let i=0;i<7;i++){const y=cy+(i-3)*h*.09;line(k,Array.from({length:100},(_,j)=>{const x=j/99*w;return[x,y+Math.sin(j/99*TAU+a+i*.4)*h*.15]}),palette[i%4]+'99',3*scale)}text(k,'AURORA','极光之境',cx,cy,44*scale)}
      if(index===2){stars(k,w,h,a);for(let i=0;i<7;i++){const r=h*(.14+i*.11),g=k.createLinearGradient(cx-r,0,cx+r,h);g.addColorStop(0,'#96bfff00');g.addColorStop(.5,'#91c0ff');g.addColorStop(1,'#dda8ff00');k.strokeStyle=g;k.lineWidth=2*scale;k.beginPath();k.ellipse(cx,cy,r,r*.38,a+i*.14,0,TAU);k.stroke()}text(k,'ORBIT','环绕未来',cx,cy,32*scale)}
      if(index===3){for(let i=0;i<15;i++){const r=((i/15+u/CYC)%1)*Math.max(w,h);k.strokeStyle=`rgba(135,177,255,${1-r/Math.max(w,h)})`;k.lineWidth=2*scale;k.beginPath();k.ellipse(cx,cy,r,r*.4,0,0,TAU);k.stroke()}text(k,'ENTER','进入新世界',cx,cy,32*scale)}
      if(index===4){for(let i=0;i<20;i++){const x=(i/20*w+u/CYC*w)%w,kx=x-w*.2;const g=k.createLinearGradient(x,0,x+w*.13,0);g.addColorStop(0,'#6ab4ff00');g.addColorStop(.5,palette[i%4]+'88');g.addColorStop(1,'#6ab4ff00');k.fillStyle=g;k.save();k.transform(1,0,-.35,1,0,0);k.fillRect(x,0,w*.13,h);k.restore()}text(k,'IN MOTION','光影之间',cx,cy,38*scale)}
      if(index===5){stars(k,w,h,a,150);const r=h*.4;k.save();k.translate(cx,cy);k.rotate(-.35);k.strokeStyle='#d6c0ff';k.lineWidth=2*scale;k.beginPath();k.ellipse(0,0,r*1.7,r*.32,0,0,TAU);k.stroke();glow(k,0,0,r*1.4,'#729bff55');const g=k.createLinearGradient(-r,-r,r,r);g.addColorStop(0,'#b9d8ff');g.addColorStop(.45,'#698cdc');g.addColorStop(1,'#171a45');dot(k,0,0,r,g);k.restore();text(k,'NEW HORIZONS','新的地平线',cx,cy+h*.32,21*scale)}
      if(index===6){const points=Array.from({length:80},(_,j)=>{const theta=j*2.39996,r=Math.sqrt(j/80)*h*.66;return[cx+Math.cos(theta+a*.2)*r*1.6,cy+Math.sin(theta+a*.2)*r]});points.forEach(([x,y],j)=>{if(j>0&&j%3)line(k,[[x,y],points[j-1]],'#9ec7ff33');dot(k,x,y,1.5*scale,palette[j%4])});text(k,'CONNECTED','万物互联',cx,cy,33*scale)}
      if(index===7){const g=k.createLinearGradient(0,0,w,h);g.addColorStop(0,'#15455c');g.addColorStop(.5,'#0e1732');g.addColorStop(1,'#422947');k.fillStyle=g;k.fillRect(0,0,w,h);for(let j=0;j<9;j++)glow(k,(.5+.45*Math.sin(a+j))*w,(.5+.4*Math.cos(a+j*2))*h,h*.35,palette[j%4]+'33');text(k,'CREATE WHAT’S NEXT','创造下一种可能',cx,cy,30*scale)}
    }else if(index<16){
      if(!overlay)grid(k,w,h);if(index===8){k.strokeStyle='#d7f692';k.lineWidth=1.5*scale;k.beginPath();k.arc(pt.x,pt.y,20*scale,0,TAU);k.stroke();dot(k,pt.x,pt.y,4*scale,'#fff')}
      if(index===9){for(let j=26;j>=0;j--){const t=a-j*.045,hp=p?.history?.[Math.max(0,p.history.length-1-j)],px=hp?hp.x*w:p?pt.x+Math.cos(t)*j*2*scale:cx+Math.cos(t)*w*.23,py=hp?hp.y*h:p?pt.y+Math.sin(t*2)*j*scale:cy+Math.sin(t*2)*h*.24;k.globalAlpha=(1-j/27)*.8;dot(k,px,py,(2+4*(1-j/27))*scale,palette[j%4])}k.globalAlpha=1}
      if(index===10){for(let j=5;j>=0;j--){k.strokeStyle=palette[j%4];k.lineWidth=(1+j*.25)*scale;const points=Array.from({length:60},(_,n)=>{const q=n/59;return[cx+(pt.x-cx)*q,cy+(pt.y-cy)*q+Math.sin(q*TAU*2-a-j*.25)*h*.14*(1-q)]});line(k,points,palette[j%4],2*scale)}}
      if(index===11){glow(k,pt.x,pt.y,h*.65,'#8caeff99');stars(k,w,h,a);text(k,'FOLLOW THE LIGHT','追随光的方向',cx,cy,27*scale)}
      if(index===12){for(let j=0;j<80;j++){const x=(j%16+.5)/16*w,y=(Math.floor(j/16)+.5)/5*h,d=Math.hypot(x-pt.x,y-pt.y),f=Math.max(0,1-d/(h*.9));dot(k,x+(pt.x-x)*f*.35,y+(pt.y-y)*f*.35,(1.5+3*f)*scale,f>.3?'#d8f36a':'#7082af')}}
      if(index===13){for(let j=0;j<9;j++){const r=(j/9+u/CYC)%1*h*.6;k.globalAlpha=1-r/(h*.6);k.strokeStyle=palette[j%4];k.lineWidth=1.5*scale;k.beginPath();k.arc(pt.x,pt.y,r,0,TAU);k.stroke()}k.globalAlpha=1}
      if(index===14){for(let j=0;j<22;j++){const q=j/22,r=(q+u/CYC)%1;dot(k,pt.x+Math.cos(j*2.4)*r*h*.55,pt.y+Math.sin(j*2.4)*r*h*.55,Math.max(.2,4*(1-r))*scale,palette[j%4])}dot(k,pt.x,pt.y,7*scale,'#d8f36a')}
      if(index===15){k.strokeStyle='#bbd7ff';k.lineWidth=2*scale;k.beginPath();k.ellipse(pt.x,pt.y,36*scale,36*scale*(.4+.4*Math.sin(a)**2),a,0,TAU);k.stroke();line(k,[[pt.x-55*scale,pt.y],[pt.x+55*scale,pt.y]],'#bbd7ff55');line(k,[[pt.x,pt.y-55*scale],[pt.x,pt.y+55*scale]],'#bbd7ff55')}
      if(!overlay)text(k,'MOVE TO EXPLORE','移动指针，探索变化',cx,h-20*scale,13*scale,'#a9b8d6');
    }else{
      if(index>=20)stars(k,w,h,a,120);else grid(k,w,h);
      if(index===16){for(let j=0;j<3;j++)line(k,Array.from({length:150},(_,n)=>{const x=n/149*w;return[x,cy+Math.sin(n/149*TAU*2-a+j*.8)*h*(.13+j*.05)]}),palette[j],2*scale)}
      if(index===17){line(k,Array.from({length:301},(_,n)=>{const q=n/300*TAU;return[cx+Math.sin(3*q+a)*w*.31,cy+Math.sin(2*q)*h*.35]}),'#b5d6ff',2*scale);dot(k,cx+Math.sin(a)*w*.31,cy,5*scale,'#d8f36a')}
      if(index===18){for(let j=0;j<8;j++)line(k,Array.from({length:100},(_,n)=>{const x=n/99*w,q=(n/99-.5)*5;return[x,cy+(Math.sin(q*q+a+j*.28)*.2+(j-4)*.045)*h]}),palette[j%4]+'aa',1.4*scale)}
      if(index===19){for(let j=0;j<260;j++){const theta=j/260*TAU,r=h*.34*Math.cos(5*theta+a);dot(k,cx+Math.cos(theta)*r,cy+Math.sin(theta)*r,1.6*scale,palette[j%4])}}
      if(index===20){for(let j=0;j<170;j++){const theta=j*2.39996+a,r=Math.sqrt(j/170),x=cx+Math.cos(theta)*r*w*.44,y=cy+Math.sin(theta)*r*h*.4;glow(k,x,y,4*scale,palette[j%4]+'88');dot(k,x,y,(.6+1.2*(1-r))*scale,'#fff')}glow(k,cx,cy,h*.25,'#c5b6ff66')}
      if(index===21){for(let j=0;j<150;j++){const theta=j*2.39996,r=((j*.618033+u/CYC)%1)**2;line(k,[[cx+Math.cos(theta)*r*w,cy+Math.sin(theta)*r*h],[cx+Math.cos(theta)*(r+.025)*w,cy+Math.sin(theta)*(r+.025)*h]],'#bdd6ff',1.3*scale)}}
      if(index===22){glow(k,cx,cy,h*.5,'#859fff55');for(let j=0;j<18;j++){k.save();k.translate(cx,cy);k.rotate(a+j*.19);k.strokeStyle=palette[j%4]+'88';k.lineWidth=1.3*scale;k.beginPath();k.ellipse(0,0,h*(.18+j*.012),h*.13,0,0,TAU);k.stroke();k.restore()}dot(k,cx,cy,h*.16,'#02030a')}
      if(index===23){const influence=(pt.x/w-.5)*.5;for(let j=0;j<20;j++)line(k,Array.from({length:80},(_,n)=>{const q=n/79,x=n/79*w;return[x,h*.28+j*h*.025+Math.sin(q*TAU*2-a+j*.14+influence)*h*.13]}),palette[j%4]+'88',1.1*scale)}
    }k.restore();
  }
