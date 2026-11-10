/* Motion Prompt · Original extensions by yipoo (MIT). Requires studio/locale.js and bundled Motion Sans. */
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
