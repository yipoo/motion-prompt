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
