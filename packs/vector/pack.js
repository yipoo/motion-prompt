/* Motion Prompt · vector · yipoo original extensions · MIT */
MotionPrompt.pack('vector', function () {
  // @kit
  const CW=539, CH=208, CYC=4.8, TAU=Math.PI*2;
  const C={bg:'#f7f6f2',ink:'#162d40',blue:'#295de8',orange:'#f5774a',mint:'#52b99b',muted:'#d5dddF'};
  const lang=(en,zh)=>document.documentElement.lang==='en'?en:zh;
  const wave=p=>(1-Math.cos(TAU*p))/2;
  function line(k,points,color=C.blue,width=4){k.beginPath();points.forEach((v,i)=>i?k.lineTo(...v):k.moveTo(...v));k.strokeStyle=color;k.lineWidth=width;k.lineCap='round';k.lineJoin='round';k.stroke();}
  function circle(k,x,y,r,color){k.beginPath();k.arc(x,y,r,0,TAU);k.fillStyle=color;k.fill();}
  function text(k,en,zh,x,y,size=34,color=C.ink){k.font=`700 ${size}px "Motion Sans",sans-serif`;k.textAlign='center';k.textBaseline='middle';k.fillStyle=color;k.fillText(lang(en,zh),x,y);}
  function scene(k){k.fillStyle=C.blue;k.fillRect(80,30,380,148);circle(k,362,69,25,'#ffd66e');k.fillStyle=C.mint;k.beginPath();k.moveTo(80,178);k.lineTo(194,66);k.lineTo(291,178);k.fill();k.fillStyle='#8cd4bb';k.beginPath();k.moveTo(220,178);k.lineTo(336,100);k.lineTo(460,178);k.fill();}
  const wrap=fn=>(k,w,h,t)=>{k.save();k.scale(w/CW,h/CH);k.fillStyle=C.bg;k.fillRect(0,0,CW,CH);fn(k,((t%CYC)+CYC)%CYC/CYC);k.restore();};
  // @shared
  const CELLS=[];
  const curve=p=>[65+410*p,104-65*Math.sin(TAU*p)];
  // @element 01
  CELLS[0]=wrap((k,p)=>{let pts=Array.from({length:121},(_,i)=>curve(i/120));line(k,pts,C.muted,5);line(k,pts.slice(0,Math.max(2,Math.ceil(121*wave(p)))),C.blue,7);circle(k,...curve(wave(p)),8,C.orange);});
  // @element 02
  CELLS[1]=wrap((k,p)=>{k.setLineDash([14,12]);k.lineDashOffset=-26*p*8;line(k,[[65,150],[166,55],[273,150],[377,55],[475,150]],C.blue,7);k.setLineDash([]);});
  // @element 03
  CELLS[2]=wrap((k,p)=>{let pts=Array.from({length:181},(_,i)=>[269+170*Math.cos(i/180*TAU),104+61*Math.sin(i/180*TAU)]);line(k,pts,C.muted,3);for(let j=0;j<5;j++){let a=TAU*(p+j/5);circle(k,269+170*Math.cos(a),104+61*Math.sin(a),9,j===0?C.orange:C.blue);}});
  // @element 04
  CELLS[3]=wrap((k,p)=>{for(let j=30;j>=0;j--){let a=TAU*(p-j/100);k.globalAlpha=(1-j/31)*.85;circle(k,269+160*Math.sin(a),104+65*Math.sin(2*a),3+7*(1-j/31),C.orange);}k.globalAlpha=1;});
  // @element 05
  CELLS[4]=wrap((k,p)=>{let a=[85,143],b=[190,25+70*wave(p)],c=[349,183-70*wave(p)],d=[454,65];line(k,[a,b],C.muted,2);line(k,[c,d],C.muted,2);k.beginPath();k.moveTo(...a);k.bezierCurveTo(...b,...c,...d);k.strokeStyle=C.blue;k.lineWidth=7;k.stroke();[a,b,c,d].forEach((v,i)=>circle(k,...v,7,i===1||i===2?C.orange:C.ink));});
  // @element 06
  CELLS[5]=wrap((k,p)=>{let q=wave(p);k.beginPath();for(let i=0;i<=160;i++){let a=i/160*TAU,r=63*(1-q)+q*(i%40<20?75:56),x=269+r*Math.cos(a),y=104+r*Math.sin(a);i?k.lineTo(x,y):k.moveTo(x,y);}k.closePath();k.fillStyle=C.mint;k.fill();k.strokeStyle=C.ink;k.lineWidth=4;k.stroke();});
  // @element 07
  CELLS[6]=wrap((k,p)=>{for(let j=0;j<3;j++)line(k,Array.from({length:150},(_,i)=>[50+i*2.95,104+(20+j*12)*Math.sin(i/149*TAU*2-TAU*p+j*.7)]),[C.blue,C.orange,C.mint][j],4);});
  // @element 08
  CELLS[7]=wrap((k,p)=>{let q=wave(p);line(k,Array.from({length:260},(_,i)=>{let a=i/259*TAU*3+TAU*p,r=8+i/259*(35+43*q);return[269+r*Math.cos(a),104+r*Math.sin(a)];}),C.orange,4);});
  // @element 09
  CELLS[8]=wrap((k,p)=>{k.save();k.beginPath();k.arc(269,104,220*wave(p),0,TAU);k.clip();scene(k);k.restore();text(k,'IRIS','圆形揭示',269,104,24);});
  // @element 10
  CELLS[9]=wrap((k,p)=>{k.save();k.beginPath();for(let i=0;i<10;i++)k.rect(80+i*38,30,38*wave(p),148);k.clip();scene(k);k.restore();});
  // @element 11
  CELLS[10]=wrap((k,p)=>{k.save();k.beginPath();for(let y=0;y<4;y++)for(let x=0;x<10;x++){let q=wave(p+(x+y)%2*.08);k.rect(80+x*38+19*(1-q),30+y*37+18.5*(1-q),38*q,37*q);}k.clip();scene(k);k.restore();});
  // @element 12
  CELLS[11]=wrap((k,p)=>{k.save();k.beginPath();let q=wave(p);k.moveTo(80,178);for(let i=0;i<=80;i++){let x=80+i*4.75,y=178-148*q+13*Math.sin(i*.55)*Math.sin(Math.PI*q);k.lineTo(x,y);}k.lineTo(460,178);k.closePath();k.clip();scene(k);k.restore();});
  // @element 13
  CELLS[12]=wrap((k,p)=>{k.save();k.beginPath();let q=wave(p);for(let i=0;i<8;i++)k.rect(80+i*47.5,30+(i%2?1:-1)*160*(1-q),47.5,148);k.clip();scene(k);k.restore();});
  // @element 14
  CELLS[13]=wrap((k,p)=>{let q=wave(p);k.save();k.translate(269,104);k.rotate(TAU*p);k.beginPath();k.rect(-210*q,-19,420*q,38);k.clip();k.rotate(-TAU*p);k.translate(-269,-104);scene(k);k.restore();});
  // @element 15
  CELLS[14]=wrap((k,p)=>{let q=wave(p);for(let y=0;y<8;y++)for(let x=0;x<20;x++){let delay=((x*7+y*11)%23)/23, a=Math.max(0,Math.min(1,(q-delay)*5));k.globalAlpha=a;k.fillStyle=(x+y)%3===0?C.orange:(x+y)%3===1?C.blue:C.mint;k.fillRect(80+x*19,28+y*19,17,17);}k.globalAlpha=1;});
  // @element 16
  CELLS[15]=wrap((k,p)=>{let q=wave(p);k.save();k.beginPath();k.moveTo(80,30);k.lineTo(80+380*q,30);k.lineTo(80+380*q-70*Math.sin(Math.PI*q),178);k.lineTo(80,178);k.closePath();k.clip();scene(k);k.restore();line(k,[[80+380*q,30],[80+380*q-70*Math.sin(Math.PI*q),178]],C.orange,4);});
  // @element 17
  CELLS[16]=wrap((k,p)=>{let s=lang('MOTION','动态设计'),gap=4+18*wave(p);k.font='700 38px "Motion Sans",sans-serif';let ws=Array.from(s).map(c=>k.measureText(c).width),total=ws.reduce((a,b)=>a+b,0)+gap*(s.length-1),x=(CW-total)/2;k.fillStyle=C.ink;k.textAlign='left';k.textBaseline='middle';Array.from(s).forEach((c,i)=>{k.fillText(c,x,104);x+=ws[i]+gap;});});
  // @element 18
  CELLS[17]=wrap((k,p)=>{let s=lang('MOTION • YIPOO • ','动态 • YIPOO • ');Array.from(s).forEach((c,i)=>{let a=TAU*(i/s.length+p);k.save();k.translate(269+76*Math.cos(a),104+76*Math.sin(a));k.rotate(a+Math.PI/2);text(k,c,c,0,0,19,i%3?C.ink:C.orange);k.restore();});});
  // @element 19
  CELLS[18]=wrap((k,p)=>{text(k,'MAKE IT MOVE','让设计动起来',269,94,38);let q=wave(p);line(k,[[105,130],[105+329*q,130]],C.orange,8);});
  // @element 20
  CELLS[19]=wrap((k,p)=>{let q=wave(p);for(let j=0;j<2;j++){k.save();k.beginPath();k.rect(40,j?104:20,459,j?84:84);k.clip();text(k,'SPLIT TYPE','文字切片',269+(j?1:-1)*80*q,104,54,j?C.orange:C.blue);k.restore();}});
  // @element 21
  CELLS[20]=wrap((k,p)=>{let s=lang('WAVE','文字波浪');Array.from(s).forEach((c,i)=>{let x=165+i*65,y=104+35*Math.sin(TAU*p+i*.9);text(k,c,c,x,y,48,[C.blue,C.orange,C.mint,C.ink][i%4]);});});
  // @element 22
  CELLS[21]=wrap((k,p)=>{let q=wave(p);k.save();k.translate(269,104);k.rotate(-.2+.4*q);k.scale(.6+.4*q,.6+.4*q);k.strokeStyle=C.orange;k.lineWidth=5;k.strokeRect(-122,-48,244,96);text(k,'APPROVED','审核通过',0,0,36,C.orange);k.restore();for(let i=0;i<12;i++){let a=TAU*i/12;line(k,[[269+(72+q*26)*Math.cos(a),104+(72+q*26)*Math.sin(a)],[269+(76+q*33)*Math.cos(a),104+(76+q*33)*Math.sin(a)]],C.orange,2);}});
  // @element 23
  CELLS[22]=wrap((k,p)=>{let q=wave(p);text(k,'01  →  02  →  03','准备  →  设计  →  发布',269,70,26);line(k,[[90,134],[449,134]],C.muted,5);for(let j=0;j<3;j++){let x=100+j*170;circle(k,x,134,12,C.blue);text(k,String(j+1),String(j+1),x,134,14,'#fff');}let x=100+340*q;k.fillStyle=C.orange;k.beginPath();k.moveTo(x+12,134);k.lineTo(x-10,122);k.lineTo(x-10,146);k.fill();});
  // @element 24
  CELLS[23]=wrap((k,p)=>{let q=wave(p);k.save();k.beginPath();k.rect(60,49,419*q,110);k.clip();text(k,'VECTOR LAB','矢量实验室',269,104,49,C.blue);k.restore();line(k,[[60+419*q,53],[60+419*q,155]],C.orange,4);});
  // @end
  return {width:CW,height:CH,cycle:CYC,cells:CELLS,fonts:[]};
});
