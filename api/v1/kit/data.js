/* Motion Prompt · Original extensions by yipoo (MIT). Requires studio/locale.js and bundled Motion Sans. */
/*
MIT License

Copyright (c) 2026 yipoo (bilingual redesign and original extensions)

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
*/
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
