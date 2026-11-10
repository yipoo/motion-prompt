/* Original Motion Prompt extensions by yipoo · MIT License. */
MotionPrompt.pack('micro', function () {
  // @kit
  const CW=539, CH=208, CYC=4.8, CELLS=[];
  const C={bg:'#eff3e9',ink:'#293923',green:'#597a36',lime:'#cbe875',line:'#d0dbc3',white:'#fff',red:'#d86151'};
  const clamp=x=>Math.max(0,Math.min(1,x)),lerp=(a,b,p)=>a+(b-a)*p,P=(t,a,b)=>clamp((t-a)/(b-a)),ease=x=>1-(1-x)**3;
  const phase=u=>ease(P(u,.4,1.4))*(1-ease(P(u,3.5,4.4)));
  const t=(zh,en)=>document.documentElement.lang==='en'?en:zh;
  function bg(k){k.fillStyle=C.bg;k.fillRect(0,0,CW,CH)}
  function rr(k,x,y,w,h,r,col){k.fillStyle=col;k.beginPath();k.roundRect(x,y,w,h,r);k.fill()}
  function txt(k,s,x,y,size=20,col=C.ink,align='center'){k.font=`600 ${size}px "Motion Sans", sans-serif`;k.fillStyle=col;k.textAlign=align;k.textBaseline='middle';k.fillText(s,x,y)}
  function dot(k,x,y,r,col){k.fillStyle=col;k.beginPath();k.arc(x,y,r,0,Math.PI*2);k.fill()}
  function line(k,points,col=C.green,width=3){k.strokeStyle=col;k.lineWidth=width;k.lineCap='round';k.lineJoin='round';k.beginPath();points.forEach(([x,y],i)=>i?k.lineTo(x,y):k.moveTo(x,y));k.stroke()}
  function check(k,x,y,p,col=C.white){const q=[[x-13,y],[x-3,y+10],[x+17,y-13]],len=p*2;line(k,len<1?[q[0],[lerp(q[0][0],q[1][0],len),lerp(q[0][1],q[1][1],len)]]:[q[0],q[1],[lerp(q[1][0],q[2][0],len-1),lerp(q[1][1],q[2][1],len-1)]],col,4)}
  function cursor(k,x,y){k.save();k.translate(x,y);line(k,[[0,0],[0,18],[6,13],[12,23]],C.ink,3);k.restore()}
  function heart(k,x,y,s,col){k.save();k.translate(x,y);k.scale(s,s);k.fillStyle=col;k.beginPath();k.moveTo(0,9);k.bezierCurveTo(-45,-18,-18,-48,0,-22);k.bezierCurveTo(18,-48,45,-18,0,9);k.fill();k.restore()}
  // @element 01
  CELLS[0]=(k,w,h,u)=>{bg(k);rr(k,170,72,200,66,14,C.green);txt(k,t('继续','Continue'),270,105,23,C.white);const p=P(u,.6,1.5);if(p>0&&p<1){k.save();k.beginPath();k.roundRect(170,72,200,66,14);k.clip();k.globalAlpha=(1-p)*.6;dot(k,235,105,p*180,C.lime);k.restore()}cursor(k,235,110)};
  // @element 02
  CELLS[1]=(k,w,h,u)=>{bg(k);const p=Math.sin(u/CYC*Math.PI*2),x=270+28*p,y=105+9*Math.sin(u/CYC*Math.PI*4);rr(k,x-84,y-30,168,60,30,C.green);txt(k,t('跟随磁力','Magnetic'),x,y,20,C.white);cursor(k,270+95*p,112)};
  // @element 03
  CELLS[2]=(k,w,h,u)=>{bg(k);const p=phase(u);rr(k,184,80,172,65,14,'#344d24');rr(k,184+3*p,70+10*p,172,65-5*p,14,C.green);txt(k,t('按下','Press'),270+3*p,102+7*p,23,C.white);cursor(k,305,112)};
  // @element 04
  CELLS[3]=(k,w,h,u)=>{bg(k);const p=phase(u);rr(k,100,65,340,80,12,C.red);txt(k,t('删除','Delete'),400,105,18,C.white);rr(k,100-200*p,65,340,80,12,C.white);txt(k,t('向左轻扫','Swipe left'),270-200*p,105,21);cursor(k,310-200*p,120)};
  // @element 05
  CELLS[4]=(k,w,h,u)=>{bg(k);for(let i=0;i<4;i++)rr(k,102+i*87,75,70,60,10,C.line);const p=phase(u),x=102+261*p;rr(k,x,75,70,60,10,C.green);txt(k,'↔',x+35,105,30,C.white);cursor(k,x+45,125)};
  // @element 06
  CELLS[5]=(k,w,h,u)=>{bg(k);const p=phase(u);for(let i=0;i<3;i++){const y=44+i*47+(i===0?94*p:i>0?-47*p:0);rr(k,160+(i===0?20*Math.sin(p*Math.PI):0),y,220,37,8,i===0?C.green:C.white);txt(k,String(i+1),190+(i===0?20*Math.sin(p*Math.PI):0),y+19,17,i===0?C.white:C.ink);line(k,[[220,y+19],[340,y+19]],i===0?C.lime:C.line,4)}};
  // @element 07
  CELLS[6]=(k,w,h,u)=>{bg(k);const p=phase(u);rr(k,115,42,310,45+82*p,10,C.white);txt(k,t('展开详情','Expand details'),140,65,18,C.ink,'left');txt(k,p>.5?'−':'+',395,65,24);k.save();k.beginPath();k.rect(128,87,284,77*p);k.clip();for(let i=0;i<3;i++)rr(k,140,99+i*17,240-i*25,5,2,C.line);k.restore()};
  // @element 08
  CELLS[7]=(k,w,h,u)=>{bg(k);const p=phase(u);rr(k,lerp(88,128,p),lerp(68,36,p),lerp(100,284,p),lerp(72,137,p),14,C.green);txt(k,t('共享元素','Shared element'),lerp(138,270,p),lerp(104,104,p),lerp(13,25,p),C.white)};
  // @element 09
  CELLS[8]=(k,w,h,u)=>{bg(k);const p=phase(u);for(let i=2;i>=0;i--){rr(k,160+i*12,90-i*18*p,220-i*24,50,10,i===0?C.green:i===1?'#9db785':C.line)}txt(k,t('3 条新消息','3 new messages'),270,115,17,C.white)};
  // @element 10
  CELLS[9]=(k,w,h,u)=>{bg(k);const p=phase(u);rr(k,215,54,108,100,24,p>.1?C.green:C.line);check(k,269,103,p);for(let i=0;i<6;i++){const a=i*Math.PI/3,r=60+15*p;k.globalAlpha=Math.sin(p*Math.PI);dot(k,269+r*Math.cos(a),103+r*Math.sin(a),4,C.green)}k.globalAlpha=1};
  // @element 11
  CELLS[10]=(k,w,h,u)=>{bg(k);const p=phase(u);for(let i=0;i<3;i++){k.strokeStyle=C.line;k.lineWidth=3;k.beginPath();k.arc(170+i*100,105,25,0,7);k.stroke()}dot(k,170+200*p,105,16,C.green);txt(k,t('单选切换','Radio selection'),270,166,15,C.green)};
  // @element 12
  CELLS[11]=(k,w,h,u)=>{bg(k);const p=phase(u);rr(k,190,65,160,78,39,p>.5?C.green:C.line);const stretch=Math.sin(p*Math.PI)*14;rr(k,198+82*p-stretch/2,73,62+stretch,62,31,C.white);txt(k,p>.5?t('开启','On'):t('关闭','Off'),270,172,16,C.green)};
  // @element 13
  CELLS[12]=(k,w,h,u)=>{bg(k);const p=phase(u);heart(k,270,119,1.5+.3*Math.sin(p*Math.PI),p>.2?C.red:C.line);for(let i=0;i<8;i++){const a=i*Math.PI/4,r=35+55*p;k.globalAlpha=Math.sin(p*Math.PI);dot(k,270+r*Math.cos(a),100+r*Math.sin(a),4,C.red)}k.globalAlpha=1};
  // @element 14
  CELLS[13]=(k,w,h,u)=>{bg(k);const p=phase(u);k.save();k.translate(270,105);k.scale(1+.15*Math.sin(p*Math.PI),1+.15*Math.sin(p*Math.PI));k.fillStyle=p>.2?C.green:C.line;k.beginPath();k.moveTo(-29,-48);k.lineTo(29,-48);k.lineTo(29,48);k.lineTo(0,27);k.lineTo(-29,48);k.closePath();k.fill();k.restore();txt(k,p>.3?t('已收藏','Saved'):t('收藏','Save'),270,180,15,C.green)};
  // @element 15
  CELLS[14]=(k,w,h,u)=>{bg(k);const p=phase(u);rr(k,100,77,340,65,10,C.white);k.strokeStyle=C.green;k.lineWidth=2*p;k.beginPath();k.roundRect(100,77,340,65,10);if(p)k.stroke();rr(k,112,lerp(101,61,p),96,26,4,C.bg);txt(k,t('电子邮箱','Email'),160,lerp(114,74,p),lerp(18,13,p),C.green);cursor(k,280,120)};
  // @element 16
  CELLS[15]=(k,w,h,u)=>{bg(k);const p=phase(u),x=110+Math.sin(u*35)*7*Math.sin(p*Math.PI);rr(k,x,64,320,58,10,C.white);k.strokeStyle=C.red;k.lineWidth=2;k.strokeRect(x,64,320,58);txt(k,'hello@',x+24,93,20,C.ink,'left');k.globalAlpha=p;txt(k,t('请输入完整邮箱','Enter a valid email'),270,153,17,C.red);k.globalAlpha=1};
  // @element 17
  CELLS[16]=(k,w,h,u)=>{bg(k);const p=phase(u);rr(k,110,68,320,72,12,C.white);txt(k,p>.5?'motion2026':'••••••••••',240,104,24);k.strokeStyle=C.green;k.lineWidth=3;k.beginPath();k.ellipse(390,104,17,9+4*p,0,0,7);k.stroke();dot(k,390,104,5,C.green);cursor(k,400,120)};
  // @element 18
  CELLS[17]=(k,w,h,u)=>{bg(k);const p=phase(u),s=P(u,1.4,2.8);rr(k,lerp(170,235,p),72,lerp(200,70,p),64,32,C.green);if(p<.5){k.globalAlpha=1-2*p;txt(k,t('提交','Submit'),270,104,22,C.white);k.globalAlpha=1}else if(s<1){k.strokeStyle=C.lime;k.lineWidth=4;k.beginPath();k.arc(270,104,17,u*5,u*5+4.7);k.stroke()}else check(k,270,104,1)};
  // @element 19
  CELLS[18]=(k,w,h,u)=>{bg(k);const p=phase(u);rr(k,170,26,200,160,14,C.white);for(let i=0;i<3;i++)rr(k,190,65+i*32+30*p,160,8,4,C.line);k.save();k.translate(270,48+20*p);k.rotate(p*7);txt(k,'↻',0,0,26,C.green);k.restore()};
  // @element 20
  CELLS[19]=(k,w,h,u)=>{bg(k);rr(k,130,20,280,180,18,C.white);const p=phase(u);k.save();k.beginPath();k.roundRect(130,20,280,180,18);k.clip();k.globalAlpha=.15*p;k.fillStyle=C.ink;k.fillRect(130,20,280,180);k.globalAlpha=1;rr(k,130,200-135*p,280,150,18,C.green);rr(k,244,210-135*p,52,5,3,C.lime);txt(k,t('选择操作','Choose action'),270,251-135*p,22,C.white);k.restore()};
  // @element 21
  CELLS[20]=(k,w,h,u)=>{bg(k);const a=u/CYC*2*Math.PI,x=270+120*Math.cos(a),y=105+42*Math.sin(a);for(let i=7;i>=0;i--){const b=a-i*.08;dot(k,270+120*Math.cos(b),105+42*Math.sin(b),14-i,`rgba(89,122,54,${.08+.08*(7-i)})`)}cursor(k,x,y);txt(k,t('平滑跟随','Smooth follow'),270,105,18,C.green)};
  // @element 22
  CELLS[21]=(k,w,h,u)=>{bg(k);const p=phase(u);for(let r=0;r<2;r++)for(let c=0;c<4;c++)rr(k,112+c*80,48+r*65,60,46,8,C.white);k.fillStyle='rgba(89,122,54,.12)';k.fillRect(104,40,lerp(5,235,p),lerp(5,115,p));k.strokeStyle=C.green;k.lineWidth=2;k.setLineDash([5,4]);k.strokeRect(104,40,lerp(5,235,p),lerp(5,115,p));k.setLineDash([]);cursor(k,104+235*p,40+115*p)};
  // @element 23
  CELLS[22]=(k,w,h,u)=>{bg(k);const p=phase(u);dot(k,270,108,48,C.green);txt(k,'✉',270,108,38,C.white);const s=1+.2*Math.sin(p*Math.PI);dot(k,308,72,20*s,C.red);txt(k,String(1+Math.floor(3*p)),308,72,18,C.white);k.save();k.globalAlpha=Math.sin(p*Math.PI);k.strokeStyle=C.red;k.lineWidth=3;k.beginPath();k.arc(308,72,22+22*p,0,7);k.stroke();k.restore()};
  // @element 24
  CELLS[23]=(k,w,h,u)=>{bg(k);const p=phase(u);rr(k,120,50,300,60,10,C.white);txt(k,t('文件已移除','File removed'),270,80,20);rr(k,145,128,250,45,10,C.green);txt(k,t('撤销','Undo'),348,150,16,C.lime);line(k,[[160,162],[160+220*(1-p),162]],C.lime,3);cursor(k,350,153);k.globalAlpha=p;txt(k,t('已恢复','Restored'),210,150,15,C.white);k.globalAlpha=1};
  // @end
  return {width:CW,height:CH,cycle:CYC,cells:CELLS,fonts:[]};
});
