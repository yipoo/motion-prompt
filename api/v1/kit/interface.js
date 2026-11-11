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
