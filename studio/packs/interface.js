/* Original implementations by yipoo. Inspiration index: docs/interface-patterns.md. MIT. */
MotionPrompt.pack('interface',function(){
  // @kit
  const CW=539,CH=208,CYC=4.8,TAU=Math.PI*2,CELLS=[];
  const clamp=x=>Math.max(0,Math.min(1,x));
  const ease=x=>1-Math.pow(1-clamp(x),3);
  const ink='#91afff',dim='#263350',bright='#dff697';
  function frame(k,w,h){k.save();k.scale(w/CW,h/CH);k.fillStyle='#0b1223';k.fillRect(0,0,CW,CH);k.lineCap='round';k.lineJoin='round'}
  function end(k){k.restore()}
  function box(k,x,y,w,h,r,color){k.fillStyle=color;k.beginPath();k.roundRect(x,y,w,h,r);k.fill()}
  function dot(k,x,y,r,color){k.fillStyle=color;k.beginPath();k.arc(x,y,r,0,TAU);k.fill()}
  function label(k,en,zh,x,y,size=15,color='#e4ebff'){k.fillStyle=color;k.font=`600 ${Math.max(20,size)}px "Motion Sans",sans-serif`;k.textAlign='center';k.textBaseline='middle';k.fillText(document.documentElement.lang==='en'?en:zh,x,y)}
  function stroke(k,points,color,width=2){k.strokeStyle=color;k.lineWidth=width;k.beginPath();points.forEach(([x,y],i)=>i?k.lineTo(x,y):k.moveTo(x,y));k.stroke()}
  // @element 01
  CELLS[0]=(k,w,h,t)=>{frame(k,w,h);for(let i=0;i<3;i++){const p=(t/.8-i/3)%1,s=Math.max(0,Math.sin(p*TAU));k.save();k.translate(235+i*34,133);k.scale(1-s*.45,1);dot(k,0,0,7,'#33405b');k.restore();dot(k,235+i*34,113-s*36,7,ink)}label(k,'Preparing your workspace','正在准备工作区',269,166,13);end(k)};
  // @element 02
  CELLS[1]=(k,w,h,t)=>{frame(k,w,h);for(let i=0;i<11;i++){const v=.2+.8*Math.pow(.5+.5*Math.sin(t*TAU/1.2-i*.6),2);box(k,198+i*13,104-v*44,7,v*88,4,i%3===0?bright:ink)}label(k,'Listening','正在聆听',269,172,13);end(k)};
  // @element 03
  CELLS[2]=(k,w,h,t)=>{frame(k,w,h);const pts=[[269,48],[326,145],[212,145],[269,48]],p=(t%2.4)/2.4;stroke(k,pts,dim,4);k.save();k.setLineDash([330*ease(p),330]);stroke(k,pts,ink,4);k.restore();dot(k,269,104,3,bright);end(k)};
  // @element 04
  CELLS[3]=(k,w,h,t)=>{frame(k,w,h);const slots=[[238,69],[276,69],[276,107],[238,107]],q=(t%4.8)/.4,step=Math.floor(q),p=ease(q-step),positions=[0,1,2];let empty=3,moving=0;for(let n=0;n<=step;n++){moving=positions.indexOf((empty+3)%4);if(n<step){const prev=positions[moving];positions[moving]=empty;empty=prev}}for(let i=0;i<3;i++){const at=positions[i],to=i===moving?empty:at,m=i===moving?p:0;box(k,slots[at][0]+(slots[to][0]-slots[at][0])*m,slots[at][1]+(slots[to][1]-slots[at][1])*m,27,27,7,i===0?bright:ink)}end(k)};
  // @element 05
  CELLS[4]=(k,w,h,t)=>{frame(k,w,h);box(k,176,61,187,86,18,dim);box(k,179,64,181,80,15,'#0b1223');k.save();k.beginPath();k.roundRect(177,62,185,84,17);k.clip();const a=t*TAU/2.4;const g=k.createLinearGradient(269-Math.cos(a)*110,104-Math.sin(a)*60,269+Math.cos(a)*110,104+Math.sin(a)*60);g.addColorStop(0,'#91afff00');g.addColorStop(1,'#dff697');k.strokeStyle=g;k.lineWidth=5;k.stroke();k.restore();label(k,'PROCESSING','处理中',269,104,16);end(k)};
  // @element 06
  CELLS[5]=(k,w,h,t)=>{frame(k,w,h);const p=(t%1.6)/1.6;const pts=[[165,104],[227,104],[240,91],[252,125],[265,69],[280,113],[293,104],[374,104]];stroke(k,pts,dim,3);k.save();k.beginPath();k.rect(165,40,209*p,120);k.clip();stroke(k,pts,bright,3);k.restore();end(k)};
  // @element 07
  CELLS[6]=(k,w,h,t)=>{frame(k,w,h);const p=(t%2.4)/2.4,v=.5+.48*Math.sin(p*TAU),over=Math.max(0,(v-.85)/.15),stretch=over*18;box(k,161,85,216+stretch,38-stretch*.25,19,dim);box(k,161,85,Math.max(20,216*v),38-stretch*.25,19,ink);dot(k,161+216*v,104-stretch*.125,12+over*2,'#fff');label(k,'Elastic limit feedback','弹性边界反馈',269,164,14);end(k)};
  // @element 08
  CELLS[7]=(k,w,h,t)=>{frame(k,w,h);const q=(t%4.8),p=q>=3.4?0:clamp((q-.5)/1.4),done=q>=1.9&&q<3.4;box(k,171,76,196,56,28,done?'#346d50':dim);k.save();k.beginPath();k.roundRect(171,76,196,56,28);k.clip();box(k,171,76,196*p,56,0,done?'#346d50':'#526cbb');k.restore();label(k,done?'Confirmed':'Hold to confirm',done?'已确认':'按住以确认',269,104,18);k.strokeStyle=bright;k.lineWidth=3;k.beginPath();k.arc(269,104,72,-Math.PI/2,-Math.PI/2+TAU*(done?1:p));k.stroke();end(k)};
  // @element 09
  CELLS[8]=(k,w,h,t)=>{frame(k,w,h);const q=(t%2.4)/2.4,p=.5-.5*Math.cos(q*TAU),x=179+180*p;box(k,153,74,234,60,30,dim);dot(k,179,104,17,ink);dot(k,x,104,22,ink);const gap=x-179;box(k,179,104-12*(1-clamp(gap/180)),gap,24*(1-clamp(gap/180)),12,ink);['A','B','C'].forEach((s,i)=>label(k,s,s,179+i*90,104,16));end(k)};
  // @element 10
  CELLS[9]=(k,w,h,t)=>{frame(k,w,h);const q=t/CYC,offset=(q*450+60*Math.sin(q*TAU))%450,velocity=450+60*TAU*Math.cos(q*TAU);k.save();k.beginPath();k.rect(35,60,469,90);k.clip();k.transform(1,0,-velocity/12000,1,0,0);for(let i=-1;i<3;i++)label(k,'IDEAS IN MOTION','让灵感动起来',269+i*450-offset,104,36);k.restore();end(k)};
  // @element 11
  CELLS[10]=(k,w,h,t)=>{frame(k,w,h);const p=(t%CYC)/CYC,active=Math.min(2,Math.floor(p*3)),names=[['Explore','探索'],['Build','构建'],['Review','审阅']];for(let i=0;i<3;i++){const x=97+i*121,fill=clamp(p*3-i);box(k,x,88,101,5,3,dim);box(k,x,88,101*fill,5,3,ink);label(k,names[i][0],names[i][1],x+50,119,14,i===active?bright:'#7888a7');dot(k,x+101*fill,90,fill>0&&fill<1?4:0,bright)}end(k)};
  // @element 12
  CELLS[11]=(k,w,h,t)=>{frame(k,w,h);const p=(t%2.4)/2.4,x=159+220*(.5+.5*Math.sin(p*TAU)),y=80+45*Math.cos(p*TAU);box(k,159,54,220,102,22,'#22314d');k.save();k.beginPath();k.roundRect(159,54,220,102,22);k.clip();const g=k.createRadialGradient(x,y,0,x,y,115);g.addColorStop(0,'#c0d9ff88');g.addColorStop(1,'#c0d9ff00');k.fillStyle=g;k.fillRect(159,54,220,102);stroke(k,[[160,76],[378,76]],'#d8e8ff44');label(k,'CONTEXT','上下文',269,110,22);k.restore();end(k)};
  // @end
  return{width:CW,height:CH,cycle:CYC,cells:CELLS,fonts:[]};
});
