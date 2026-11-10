/* Motion Prompt extension · data · Original demonstrations by yipoo, 2026. */
MotionPrompt.pack('data', function () {
  // @kit
  const CW = 539, CH = 208, CYC = 4.8;
  const C = { bg:'#f6f5f1', ink:'#182321', mute:'#81908a', line:'#dce3dc', blue:'#376cf6', mint:'#45b991', coral:'#ee866e', gold:'#e7b751', white:'#fff' };
  const COLORS = [C.blue,C.mint,C.coral,C.gold,'#a48ada'];
  const clamp = v => Math.max(0,Math.min(1,v));
  const ease = p => 1-Math.pow(1-clamp(p),3);
  const progress = (u,a=.35,b=2.85) => ease((u-a)/(b-a));
  const t = (zh,en) => document.documentElement.lang === 'en' ? en : zh;
  let X;
  const CELLS = [];
  function rect(x,y,w,h,c,r=4){X.fillStyle=c;X.beginPath();X.roundRect(x,y,Math.max(0,w),Math.max(0,h),r);X.fill();}
  function text(s,x,y,size=13,c=C.ink,align='left',weight=500){X.font=`${weight} ${size}px "Motion Sans",sans-serif`;X.textAlign=align;X.textBaseline='middle';X.fillStyle=c;X.fillText(s,x,y);}
  function line(x,y,x2,y2,c=C.line,lw=1){X.beginPath();X.moveTo(x,y);X.lineTo(x2,y2);X.strokeStyle=c;X.lineWidth=lw;X.lineCap='round';X.stroke();}
  function dot(x,y,r,c){X.beginPath();X.arc(x,y,Math.max(0,r),0,Math.PI*2);X.fillStyle=c;X.fill();}
  function arc(x,y,r,start,end,c,lw){X.beginPath();X.arc(x,y,r,start,end);X.strokeStyle=c;X.lineWidth=lw;X.lineCap='round';X.stroke();}
  function poly(points,c,fill=false,lw=3){X.beginPath();points.forEach(([x,y],i)=>i?X.lineTo(x,y):X.moveTo(x,y));if(fill){X.closePath();X.fillStyle=c;X.fill();}else{X.strokeStyle=c;X.lineWidth=lw;X.lineJoin='round';X.stroke();}}
  function axes(){[65,105,145,180].forEach(y=>line(48,y,501,y));}
  function draw(zh,en,fn){return(k,w,h,u)=>{X=k;X.save();X.scale(w/CW,h/CH);rect(0,0,CW,CH,C.bg,0);u=((u%CYC)+CYC)%CYC;X.globalAlpha=clamp(u/.2)*clamp((CYC-u)/.3);text(t(zh,en),26,24,13,C.mute);fn(u,progress(u));X.restore();};}
  // @shared
  const series=[.28,.51,.42,.72,.58,.88,.76,.96];
  function curve(p,fill=false){const pts=series.map((v,i)=>[50+i*62,180-v*120]);X.save();X.beginPath();X.rect(48,44,451*p,140);X.clip();if(fill)poly([[50,180],...pts,[484,180]],'#cbdcfb',true);poly(pts,C.blue);pts.forEach(([x,y])=>dot(x,y,4,C.blue));X.restore();}
  function cubic(a,b,c,d,q){const s=1-q;return s*s*s*a+3*s*s*q*b+3*s*q*q*c+q*q*q*d;}

  // @element 01
  CELLS[0]=draw('逐项增长','Staggered bars',(u)=>{axes();[68,110,88,130,98,142].forEach((h,i)=>{let p=progress(u,.3+i*.16,1.6+i*.16);rect(65+i*71,180-h*p,42,h*p,COLORS[i%5]);text(String(i+1),86+i*71,194,10,C.mute,'center');});});
  // @element 02
  CELLS[1]=draw('折线绘制','Line reveal',(u,p)=>{axes();curve(p);const j=Math.min(6,Math.floor(p*7)),q=p*7-j;dot(50+(j+q)*62,180-(series[j]+(series[j+1]-series[j])*q)*120,7,C.coral);});
  // @element 03
  CELLS[2]=draw('面积蓄积','Area fill',(u,p)=>{axes();const pts=series.map((v,i)=>[50+i*62,180-v*120*p]);poly([[50,180],...pts,[484,180]],'#c5e7da',true);poly(pts,C.mint);text(`${Math.round(p*864)} k`,483,59,23,C.ink,'right',700);});
  // @element 04
  CELLS[3]=draw('甜甜圈分布','Donut distribution',(u,p)=>{let a=-Math.PI/2;[.42,.28,.18,.12].forEach((v,i)=>{arc(191,118,61,a,a+v*Math.PI*2*p,COLORS[i],22);a+=v*Math.PI*2;rect(325,62+i*33,10,10,COLORS[i]);text(`${t(['搜索','直接','社交','其他'][i],['Search','Direct','Social','Other'][i])}  ${Math.round(v*100*p)}%`,345,68+i*33);});text(`${Math.round(p*100)}%`,191,118,27,C.ink,'center',700);});
  // @element 05
  CELLS[4]=draw('热力扫描','Heatmap scan',(u,p)=>{for(let r=0;r<5;r++)for(let c=0;c<12;c++){let v=((r*7+c*3)%11)/10,q=progress(u,.25+c*.1,1.15+c*.1);rect(55+c*35,49+r*27,29,21,`rgba(55,108,246,${.09+.85*v*q})`,3);}const x=55+385*((u/4.8)%1);line(x,43,x,185,C.coral,2);});
  // @element 06
  CELLS[5]=draw('散点聚类','Scatter clustering',(u,p)=>{axes();for(let i=0;i<42;i++){let group=i%3,a=i*2.399,x0=65+(i*67%425),y0=60+(i*29%115),x1=125+group*145+Math.cos(a)*32,y1=100+(group%2)*40+Math.sin(a)*25;dot(x0+(x1-x0)*p,y0+(y1-y0)*p,5,COLORS[group]);}for(let i=0;i<3;i++){X.globalAlpha*=1;arc(125+i*145,100+(i%2)*40,40,0,Math.PI*2,'#b9c8c0',1);}});
  // @element 07
  CELLS[6]=draw('雷达展开','Radar expansion',(u,p)=>{const pt=(i,r)=>[265+Math.sin(i*Math.PI/3)*r,120-Math.cos(i*Math.PI/3)*r];for(let r=25;r<=75;r+=25)poly([...Array(6)].map((_,i)=>pt(i,r)).concat([pt(0,r)]),C.line,false,1);for(let i=0;i<6;i++){line(265,120,...pt(i,75));text(String(i+1),...pt(i,88),11,C.mute,'center');}let pts=[.9,.65,.82,.5,.75,.95].map((v,i)=>pt(i,75*v*p));poly(pts,'#c5dbfb',true);poly([...pts,pts[0]],C.blue);pts.forEach(v=>dot(...v,4,C.blue));});
  // @element 08
  CELLS[7]=draw('瀑布累计','Waterfall accumulation',(u)=>{axes();let sum=0;[38,25,-18,32,-12,22].forEach((v,i)=>{let before=sum;sum+=v;let p=progress(u,.3+i*.22,1.3+i*.22),top=180-Math.max(before,sum)*1.35;rect(64+i*70,top,43,Math.abs(v)*1.35*p,v>0?C.mint:C.coral);if(i<5)line(107+i*70,180-sum*1.35,134+i*70,180-sum*1.35,C.mute,1);});});
  // @element 09
  CELLS[8]=draw('翻页数字','Flip counter',(u,p)=>{const s=String(Math.floor(p*2480)).padStart(4,'0');for(let i=0;i<4;i++){rect(112+i*79,64,68,103,'#25332e',9);text(s[i],146+i*79,118,63,C.white,'center',700);line(114+i*79,115,178+i*79,115,C.bg,2);let fold=Math.abs(Math.sin(u*9-i*.6))*(1-p);rect(114+i*79,66,64,47*fold,'rgba(255,255,255,.13)',4);}text(t('累计订单','TOTAL ORDERS'),270,187,11,C.mute,'center');});
  // @element 10
  CELLS[9]=draw('机械滚轮','Odometer',(u,p)=>{rect(88,63,363,107,'#e3e8e1',14);X.save();X.beginPath();X.rect(98,73,343,87);X.clip();for(let i=0;i<5;i++){const value=p*12345/Math.pow(10,4-i),digit=Math.floor(value)%10,frac=value%1;rect(103+i*67,72,59,89,C.white,5);for(let n=-1;n<=1;n++)text(String((digit+n+10)%10),133+i*67,117+(n-frac)*78,54,C.ink,'center',700);}X.restore();});
  // @element 11
  CELLS[10]=draw('仪表指针','Gauge needle',(u,p)=>{arc(268,165,94,Math.PI,Math.PI*2,C.line,17);arc(268,165,94,Math.PI,Math.PI+Math.PI*.78*p,C.mint,17);let a=Math.PI+Math.PI*.78*p;line(268,165,268+Math.cos(a)*75,165+Math.sin(a)*75,C.ink,4);dot(268,165,8,C.ink);text(`${Math.round(p*78)}`,268,118,33,C.ink,'center',700);text('0',161,179,11,C.mute);text('100',365,179,11,C.mute);});
  // @element 12
  CELLS[11]=draw('进度圆环','Progress ring',(u,p)=>{arc(270,119,64,0,Math.PI*2,C.line,13);arc(270,119,64,-Math.PI/2,-Math.PI/2+Math.PI*2*p*.86,C.blue,13);text(`${Math.round(p*86)}%`,270,116,32,C.ink,'center',700);text(t('上传中','UPLOADING'),270,143,10,C.mute,'center');});
  // @element 13
  CELLS[12]=draw('分段进度','Segmented progress',(u,p)=>{for(let i=0;i<12;i++){let q=progress(u,.3+i*.17,.65+i*.17);rect(57+i*36,99,29,34,C.line);rect(57+i*36,99,29*q,34,C.blue);if(q>.9)text('✓',71+i*36,116,15,C.white,'center');}text(`${Math.floor(p*12)} / 12`,270,163,24,C.ink,'center',700);});
  // @element 14
  CELLS[13]=draw('行情跳动','Market ticker',(u)=>{const prices=[102.8,108.4,105.2,114.6],i=Math.min(3,Math.floor(u/1.1)),q=progress(u,i*1.1,i*1.1+.45),v=i?prices[i-1]+(prices[i]-prices[i-1])*q:prices[0];text(`$ ${v.toFixed(2)}`,270,103,48,C.ink,'center',700);const up=i===0||prices[i]>prices[i-1];text(t(up?'▲ 买盘上升':'▼ 短线回调',up?'▲ BUY PRESSURE':'▼ PULLBACK'),270,151,14,up?C.mint:C.coral,'center');for(let j=0;j<16;j++){let h=16+(j*13%40);rect(59+j*27,186-h,16,h,j<=u*3.5?C.mint:C.line);}});
  // @element 15
  CELLS[14]=draw('堆叠配额','Stacked quota',(u,p)=>{const rows=[[.4,.25,.18],[.22,.4,.25],[.32,.18,.3]];rows.forEach((vs,r)=>{text(['A','B','C'][r],44,76+r*45,13,C.mute);rect(69,61+r*45,408,28,C.line);let x=69;vs.forEach((v,i)=>{rect(x,61+r*45,408*v*p,28,COLORS[i],2);x+=408*v*p;});});});
  // @element 16
  CELLS[15]=draw('液位占比','Liquid level',(u,p)=>{X.save();X.beginPath();X.arc(270,120,72,0,Math.PI*2);X.clip();rect(190,40,160,160,'#e2e9e2',0);const y=192-134*p;let pts=[[190,200],[350,200]];for(let x=350;x>=190;x-=4)pts.push([x,y+5*Math.sin(x*.07-u*4)]);poly(pts,C.mint,true);X.restore();arc(270,120,72,0,Math.PI*2,C.white,4);text(`${Math.round(p*93)}%`,270,120,32,C.ink,'center',700);});
  // @element 17
  CELLS[16]=draw('桑基流动','Sankey flow',(u,p)=>{const links=[[67,283,17],[108,283,23],[153,323,21]];links.forEach(([y,x2,lw],i)=>{X.beginPath();X.moveTo(100,y);X.bezierCurveTo(220,y,310,83+i*42,436,83+i*42);X.strokeStyle=COLORS[i]+'66';X.lineWidth=lw*p;X.stroke();for(let k=0;k<6;k++){let q=(u/2+k/6)%1;dot(cubic(100,220,310,436,q),cubic(y,y,83+i*42,83+i*42,q),3,COLORS[i]);}});[57,98,143].forEach((y,i)=>rect(78,y,22,31,COLORS[i]));[68,110,152].forEach((y,i)=>rect(436,y,22,31,COLORS[i]));});
  // @element 18
  CELLS[17]=draw('漏斗转化','Conversion funnel',(u)=>{[420,330,240,150].forEach((w,i)=>{const p=progress(u,.3+i*.25,1.1+i*.25),next=w-60;poly([[270-w/2,49+i*35],[270+w/2,49+i*35],[270+next/2,77+i*35],[270-next/2,77+i*35]],COLORS[i],true);rect(270-w/2,49+i*35,w*(1-p),28,C.bg,0);if(p>.7)text(`${[100,76,52,29][i]}%`,270,63+i*35,13,C.white,'center',700);});});
  // @element 19
  CELLS[18]=draw('动态排名','Ranking race',(u)=>{const p=progress(u,.7,3.2),start=[0,1,2,3],end=[2,0,3,1],values=[.82,.68,.95,.74];for(let i=0;i<4;i++){let y=55+(start[i]+(end[i]-start[i])*p)*34;dot(65,y+10,10,COLORS[i]);text(String.fromCharCode(65+i),65,y+10,11,C.white,'center');rect(90,y,350*(.35+(values[i]-.35)*p),21,COLORS[i]);text(String(Math.round(350*(.35+(values[i]-.35)*p))),455,y+11,11,C.mute);}});
  // @element 20
  CELLS[19]=draw('树图展开','Treemap expansion',(u,p)=>{const boxes=[[53,50,240,132],[299,50,183,62],[299,118,88,64],[393,118,89,64]];boxes.forEach(([x,y,w,h],i)=>{rect(x+w*(1-p)/2,y+h*(1-p)/2,w*p,h*p,COLORS[i],5);if(p>.75)text(`${[48,28,12,12][i]}%`,x+w/2,y+h/2,20,C.white,'center',700);});});
  // @element 21
  CELLS[20]=draw('矩阵传播','Matrix propagation',(u)=>{for(let r=0;r<5;r++)for(let c=0;c<11;c++){let q=progress(u,.2+(r+c)*.13,.6+(r+c)*.13),pulse=.6+.4*Math.sin(u*4-r-c);rect(72+c*36,49+r*28,25,19,q>.8?`rgba(69,185,145,${.35+.6*pulse})`:C.line,3);if(q>.8)dot(84+c*36,58+r*28,2,C.white);}});
  // @element 22
  CELLS[21]=draw('数据包传输','Packet transfer',(u)=>{for(let i=0;i<3;i++){const y=73+i*47;line(111,y,430,y,C.line,4);for(let k=0;k<4;k++){let q=(u/2.4+k/4+i*.15)%1;rect(115+q*300,y-6,18,12,COLORS[i],3);}rect(58,y-16,53,32,C.ink,7);rect(430,y-16,53,32,COLORS[i],7);text(i?'API':'DB',84,y,10,C.white,'center');} });
  // @element 23
  CELLS[22]=draw('节点连接','Network connections',(u,p)=>{const pts=[[91,116],[210,62],[210,164],[355,73],[355,157],[469,116]],edges=[[0,1],[0,2],[1,3],[1,4],[2,4],[3,5],[4,5]];edges.forEach(([a,b],i)=>{let q=progress(u,.25+i*.18,1+i*.18);line(...pts[a],pts[a][0]+(pts[b][0]-pts[a][0])*q,pts[a][1]+(pts[b][1]-pts[a][1])*q,C.blue,3);let v=(u/2+i*.17)%1;dot(pts[a][0]+(pts[b][0]-pts[a][0])*v,pts[a][1]+(pts[b][1]-pts[a][1])*v,4,C.coral);});pts.forEach(([x,y],i)=>{dot(x,y,14+2*Math.sin(u*3-i),C.white);arc(x,y,16,0,Math.PI*2,C.mint,2);text(String(i+1),x,y,12,C.ink,'center');});});
  // @element 24
  CELLS[23]=draw('实时数据流','Live data stream',(u)=>{axes();const pts=[];for(let i=0;i<=80;i++){const x=49+i*5.6,a=i/12+u*2;pts.push([x,122+30*Math.sin(a)+15*Math.sin(a*2)]);}poly(pts,C.blue);dot(...pts[pts.length-1],6,C.coral);rect(363,46,133,29,C.white,6);text(`${t('实时','LIVE')}  ${Math.round(120+30*Math.sin(u*2))}`,430,61,13,C.blue,'center',700);});
  // @end
  return {width:CW,height:CH,cycle:CYC,cells:CELLS,fonts:[]};
});
