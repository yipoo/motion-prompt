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
  const CW = 539, CH = 208, CYC = 4.8, TAU = Math.PI * 2;
  const C = { bg: '#10182b', ink: '#edf2ff', muted: '#7f92b5', blue: '#719bff', mint: '#79e6c7', coral: '#ff8c81', gold: '#ffdc82', grid: '#263650' };
  const CELLS = [];
  let X;
  const clamp = v => Math.max(0, Math.min(1, v));
  const mix = (a, b, p) => a + (b - a) * p;
  const phase = t => TAU * (((t % CYC) + CYC) % CYC) / CYC;
  const bi = (en, zh) => document.documentElement.lang === 'en' ? en : zh;
  function text(en, zh, x, y, size = 12, color = C.muted, align = 'left') {
    X.font = `600 ${size}px "Motion Sans",sans-serif`; X.textAlign = align; X.textBaseline = 'middle'; X.fillStyle = color; X.fillText(bi(en, zh), x, y);
  }
  function line(points, color = C.grid, width = 1.5, close = false) {
    X.beginPath(); points.forEach((p, i) => i ? X.lineTo(p[0], p[1]) : X.moveTo(p[0], p[1])); if (close) X.closePath(); X.strokeStyle = color; X.lineWidth = width; X.lineJoin = 'round'; X.lineCap = 'round'; X.stroke();
  }
  function poly(points, color, stroke) {
    X.beginPath(); points.forEach((p, i) => i ? X.lineTo(p[0], p[1]) : X.moveTo(p[0], p[1])); X.closePath(); X.fillStyle = color; X.fill(); if (stroke) { X.strokeStyle = stroke; X.lineWidth = 1.5; X.stroke(); }
  }
  function dot(x, y, r, color) { X.beginPath(); X.arc(x, y, Math.max(.01, r), 0, TAU); X.fillStyle = color; X.fill(); }
  function ellipse(x, y, a, b, color, fill = false) { X.beginPath(); X.ellipse(x, y, a, b, 0, 0, TAU); if (fill) { X.fillStyle = color; X.fill(); } else { X.strokeStyle = color; X.lineWidth = 1.4; X.stroke(); } }
  function rect(x, y, w, h, r, color) { X.beginPath(); X.roundRect(x, y, w, h, r); X.fillStyle = color; X.fill(); }
  function glow(x, y, r, color) { X.save(); X.shadowColor = color; X.shadowBlur = 16; dot(x, y, r, color); X.restore(); }
  function scene(en, zh, draw) { return (ctx, w, h, t) => { X = ctx; X.save(); X.scale(w / CW, h / CH); X.fillStyle = C.bg; X.fillRect(0, 0, CW, CH); draw(phase(t), t); text(en, zh, 20, 22); X.restore(); }; }
  function project(x, y, z, focal = 360, cx = 269.5, cy = 109) { const s = focal / (focal + z); return [cx + x * s, cy + y * s, s]; }
  function rotate(p, a, b = 0) { const x = p[0] * Math.cos(a) + p[2] * Math.sin(a), z = -p[0] * Math.sin(a) + p[2] * Math.cos(a); return [x, p[1] * Math.cos(b) - z * Math.sin(b), p[1] * Math.sin(b) + z * Math.cos(b)]; }
  function spring(x1, y1, x2, y2, amp = 7, color = C.mint, turns = 12) { const dx = x2 - x1, dy = y2 - y1, len = Math.hypot(dx, dy) || 1, pts = []; for (let i = 0; i <= turns * 4; i++) { const p = i / (turns * 4), d = amp * Math.sin(p * turns * TAU) * Math.sin(Math.PI * p); pts.push([x1 + dx * p - dy / len * d, y1 + dy * p + dx / len * d]); } line(pts, color, 2); }
  function floor(y = 174) { line([[62, y], [477, y]], C.grid, 2); }

  // @shared
  function miniCard(x, y, w, h, color, number) { rect(x - w / 2, y - h / 2, w, h, 9, color); X.save(); X.globalAlpha = .3; rect(x - w * .32, y + h * .14, w * .64, 4, 2, C.bg); rect(x - w * .32, y + h * .25, w * .44, 4, 2, C.bg); X.restore(); text(String(number), String(number), x, y - h * .13, Math.min(24, w / 3), C.bg, 'center'); }
