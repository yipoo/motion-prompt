/* Motion Prompt · Copyright (c) 2026 Shohei Ohtaki; (c) 2026 yipoo. MIT License. Requires studio/locale.js and bundled Motion Sans. */
/*
MIT License

Copyright (c) 2026 Shohei Ohtaki
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
  const CW = 539, CH = 208;
  const CYC = 4.7;
  const LOOP = CYC * 2;
  const C = {
    desk: "#E7EAF0",
    win: "#FFFFFF",
    bar: "#F3F5F8",
    rule: "#E2E6ED",
    ink: "#1C2333",
    sub: "#7D879B",
    faint: "#DCE1EA",
    soft: "#F3F5F9",
    skel: "#E4E8EF",
    acc: "#FF5A2C",
    accL: "#FFE5DB",
    blue: "#3B64E8",
    blueL: "#E1E8FF"
  };
  const FONT = '"Motion Sans", sans-serif';
  const EN = '"Motion Sans", sans-serif';
  const clamp = (x, a = 0, b = 1) => Math.min(b, Math.max(a, x));
  const lerp = (a, b, x) => a + (b - a) * x;
  const P = (t, a, b) => clamp((t - a) / (b - a));
  const eIO = x => x < .5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2;
  const eIOs = x => x < .5 ? 2 * x * x : 1 - Math.pow(-2 * x + 2, 2) / 2;
  const eOut = x => 1 - Math.pow(1 - x, 3);
  const eIn = x => x * x * x;
  const mod = (a, n) => (a % n + n) % n;
  const snapU = u => mod(Math.round(u * 1e6) / 1e6, CYC);
  const eEl = x => x <= 0 ? 0 : x >= 1 ? 1 : Math.pow(2, -10 * x) * Math.sin((x - .075) * 2 * Math.PI / .3) + 1;
  function rr(k, x, y, w, h, r) {
    k.beginPath();
    k.roundRect(x, y, w, h, r);
  }
  function txt(k, s, x, y, font, col, align = "left", base = "alphabetic", ls = "0px") {
    k.font = font;
    k.fillStyle = col;
    k.textAlign = align;
    k.textBaseline = base;
    k.letterSpacing = ls;
    k.fillText(MotionLocale.text(s), x, y);
    k.letterSpacing = "0px";
  }
  function steps(keys, u) {
    u = mod(u, CYC);
    if (u <= keys[0][0]) return keys[0][1];
    for (let i = 1; i < keys.length; i++) if (u < keys[i][0]) {
      const [t0, a] = keys[i - 1], [t1, b] = keys[i];
      return lerp(a, b, eIO((u - t0) / (t1 - t0)));
    }
    return keys[keys.length - 1][1];
  }
  function path(keys, u) {
    u = mod(u, CYC);
    if (u <= keys[0][0]) return [ keys[0][1], keys[0][2] ];
    for (let i = 1; i < keys.length; i++) if (u < keys[i][0]) {
      const a = keys[i - 1], b = keys[i], f = eIO((u - a[0]) / (b[0] - a[0]));
      return [ lerp(a[1], b[1], f), lerp(a[2], b[2], f) ];
    }
    const l = keys[keys.length - 1];
    return [ l[1], l[2] ];
  }
  function trans(on, u, dur, ease = eOut) {
    const s = on(u);
    for (let i = 0, t = u; i < 600; i++, t -= 1 / 120) if (on(t - 1 / 120) !== s) {
      const q = ease(P(u, t, t + dur));
      return s ? q : 1 - q;
    }
    return s ? 1 : 0;
  }
  const WIN = {
    x: 14,
    y: 8,
    w: 511,
    h: 192,
    r: 10,
    bar: 24
  };
  const VW = WIN.w, VH = WIN.h - WIN.bar;
  function frame(k, url = "example.com") {
    k.fillStyle = C.desk;
    k.fillRect(0, 0, CW, CH);
    k.save();
    k.shadowColor = "rgba(28,35,51,.16)";
    k.shadowBlur = 16;
    k.shadowOffsetY = 4;
    k.fillStyle = C.win;
    rr(k, WIN.x, WIN.y, WIN.w, WIN.h, WIN.r);
    k.fill();
    k.restore();
    k.save();
    rr(k, WIN.x, WIN.y, WIN.w, WIN.h, WIN.r);
    k.clip();
    k.fillStyle = C.bar;
    k.fillRect(WIN.x, WIN.y, WIN.w, WIN.bar);
    k.fillStyle = C.rule;
    k.fillRect(WIN.x, WIN.y + WIN.bar - 1, WIN.w, 1);
    k.restore();
    for (let i = 0; i < 3; i++) {
      k.fillStyle = "#CDD3DD";
      k.beginPath();
      k.arc(WIN.x + 15 + i * 12, WIN.y + 12, 3.6, 0, 7);
      k.fill();
    }
    k.fillStyle = "#E6E9EF";
    rr(k, WIN.x + WIN.w / 2 - 110, WIN.y + 5, 220, 14, 7);
    k.fill();
    txt(k, url, WIN.x + WIN.w / 2, WIN.y + 12.5, `500 9.5px ${EN}`, C.sub, "center", "middle");
  }
  function view(k, fn) {
    k.save();
    rr(k, WIN.x, WIN.y + WIN.bar, VW, VH, [ 0, 0, WIN.r, WIN.r ]);
    k.clip();
    k.translate(WIN.x, WIN.y + WIN.bar);
    k.fillStyle = "#fff";
    k.fillRect(0, 0, VW, VH);
    fn();
    k.restore();
  }
  function sbar(k, pos, ratio = .42) {
    const th = (VH - 8) * ratio;
    k.fillStyle = "rgba(28,35,51,.38)";
    rr(k, VW - 9, 4 + (VH - 8 - th) * clamp(pos), 5, th, 2.5);
    k.fill();
  }
  function bars(k, x, y, w, n, col = C.faint, hh = 6, gap = 11, last = .62) {
    k.fillStyle = col;
    for (let i = 0; i < n; i++) {
      rr(k, x, y + i * gap, i === n - 1 && n > 1 ? w * last : w, hh, hh / 2);
      k.fill();
    }
  }
  const PICS = [ {
    sky: [ "#A9C0FF", "#E4EBFF" ],
    sun: "#FF5A2C",
    sx: .74,
    sy: .32,
    m1: "#7D9AF4",
    m2: "#4B6BDB"
  }, {
    sky: [ "#FFC7B2", "#FFEDE5" ],
    sun: "#FFFFFF",
    sx: .28,
    sy: .34,
    m1: "#F4977A",
    m2: "#DD5F3B"
  }, {
    sky: [ "#3A4884", "#7484CC" ],
    sun: "#FFE5DB",
    sx: .6,
    sy: .3,
    m1: "#2B3770",
    m2: "#1C2349"
  } ];
  const M1 = [ [ 0, .62 ], [ .22, .4 ], [ .42, .56 ], [ .66, .3 ], [ .86, .5 ], [ 1, .42 ] ], M2 = [ [ 0, .8 ], [ .28, .6 ], [ .5, .76 ], [ .76, .58 ], [ 1, .74 ] ];
  function mount(k, w, h, pts, col, flip) {
    k.fillStyle = col;
    k.beginPath();
    k.moveTo(flip ? w : 0, h + 1);
    pts.forEach(([a, b]) => k.lineTo((flip ? 1 - a : a) * w, b * h));
    k.lineTo(flip ? 0 : w, h + 1);
    k.closePath();
    k.fill();
  }
  function pic(k, x, y, w, h, v = 0, r = 6, z = 1) {
    const p = PICS[v % PICS.length];
    k.save();
    rr(k, x, y, w, h, r);
    k.clip();
    k.translate(x + w / 2, y + h / 2);
    k.scale(z, z);
    k.translate(-w / 2, -h / 2);
    const g = k.createLinearGradient(0, 0, 0, h);
    g.addColorStop(0, p.sky[0]);
    g.addColorStop(1, p.sky[1]);
    k.fillStyle = g;
    k.fillRect(-1, -1, w + 2, h + 2);
    k.fillStyle = p.sun;
    k.beginPath();
    k.arc(w * p.sx, h * p.sy, Math.min(w, h) * .13, 0, 7);
    k.fill();
    mount(k, w, h, M1, p.m1, v % 2);
    mount(k, w, h, M2, p.m2, (v + 1) % 2);
    k.restore();
  }
  function btn(k, x, y, w, h, label, col = C.acc, tcol = "#fff", fs = 12) {
    k.fillStyle = col;
    rr(k, x, y, w, h, h / 2);
    k.fill();
    txt(k, label, x + w / 2, y + h / 2 + .5, `700 ${fs}px ${FONT}`, tcol, "center", "middle");
  }
  function logo(k, x, y, col = C.ink) {
    k.fillStyle = C.acc;
    rr(k, x, y - 7, 14, 14, 4);
    k.fill();
    txt(k, MotionLocale.text("SAMPLE"), x + 20, y + .5, `800 12px ${EN}`, col, "left", "middle", "1px");
  }
  const NAVX = [ 300, 346, 392 ];
  function header(k, y, active = -1) {
    k.fillStyle = "#fff";
    k.fillRect(0, y, VW, 34);
    k.fillStyle = C.rule;
    k.fillRect(0, y + 33, VW, 1);
    logo(k, 18, y + 17);
    [ MotionLocale.text("copy_051"), MotionLocale.text("copy_028"), MotionLocale.text("FAQ") ].forEach((s, i) => txt(k, s, NAVX[i], y + 17.5, `600 12px ${FONT}`, active === i ? C.acc : C.ink, "left", "middle"));
    btn(k, 428, y + 7, 70, 20, MotionLocale.text("copy_102"), C.acc, "#fff", 10.5);
  }
  function cursor(k, x, y, press = 0) {
    const s = 1.2 * (1 - .12 * press);
    k.save();
    k.translate(x, y);
    k.scale(s, s);
    k.beginPath();
    [ [ 0, 0 ], [ 0, 16.5 ], [ 4.2, 12.6 ], [ 7, 19 ], [ 9.8, 17.8 ], [ 7.1, 11.6 ], [ 12.6, 11.6 ] ].forEach(([a, b], i) => i ? k.lineTo(a, b) : k.moveTo(a, b));
    k.closePath();
    k.lineJoin = "round";
    k.lineWidth = 1.6;
    k.strokeStyle = "#fff";
    k.fillStyle = C.ink;
    k.fill();
    k.stroke();
    k.restore();
  }
  function click(k, x, y, u, times) {
    let press = 0;
    for (const tc of times) {
      const d = mod(u - tc + .1, CYC) - .1;
      if (d > -.1 && d < .12) press = Math.max(press, 1 - Math.abs(d - .01) / .11);
      if (d >= 0 && d < .35) {
        const q = d / .35;
        k.strokeStyle = `rgba(28,35,51,${.45 * (1 - q)})`;
        k.lineWidth = 2;
        k.beginPath();
        k.arc(x, y, 5 + 13 * eOut(q), 0, 7);
        k.stroke();
      }
    }
    cursor(k, x, y, clamp(press));
  }
  function spinner(k, x, y, r, u, col = C.acc) {
    const a = u / .8 * Math.PI * 2;
    k.lineCap = "round";
    k.lineWidth = r * .28;
    k.strokeStyle = C.faint;
    k.beginPath();
    k.arc(x, y, r, 0, 7);
    k.stroke();
    k.strokeStyle = col;
    k.beginPath();
    k.arc(x, y, r, a, a + Math.PI * .6);
    k.stroke();
    k.lineCap = "butt";
  }
  function enteredAt(sy, top, line, u) {
    const dt = 1 / 120, y = t => top - sy(t);
    if (y(u) >= VH) return null;
    for (let t = u; t > u - CYC; t -= dt) {
      const a = y(t), b = y(t - dt);
      if (a >= VH) return null;
      if (a < line && b >= line) return t - dt + dt * (b - line) / (b - a);
    }
    return y(u) < line ? -1e9 : null;
  }
  function hex(c) {
    if (c[0] === "r") return c.match(/\d+/g).slice(0, 3).map(Number);
    return [ parseInt(c.slice(1, 3), 16), parseInt(c.slice(3, 5), 16), parseInt(c.slice(5, 7), 16) ];
  }
  function mix(a, b, t) {
    const A = hex(a), B = hex(b);
    return `rgb(${Math.round(lerp(A[0], B[0], t))},${Math.round(lerp(A[1], B[1], t))},${Math.round(lerp(A[2], B[2], t))})`;
  }
  function heartPath(k, s) {
    k.beginPath();
    k.moveTo(0, s * .92);
    k.bezierCurveTo(-s * 1.75, -s * .12, -s * .85, -s * 1.2, 0, -s * .42);
    k.bezierCurveTo(s * .85, -s * 1.2, s * 1.75, -s * .12, 0, s * .92);
    k.closePath();
  }
  function check(k, x, y, s, col, lw, f = 1) {
    const pts = [ [ -.5, .02 ], [ -.14, .38 ], [ .52, -.34 ] ], L1 = Math.hypot(.36, .36), L2 = Math.hypot(.66, .72), L = (L1 + L2) * clamp(f);
    k.save();
    k.translate(x, y);
    k.strokeStyle = col;
    k.lineWidth = lw;
    k.lineCap = "round";
    k.lineJoin = "round";
    k.beginPath();
    k.moveTo(pts[0][0] * s, pts[0][1] * s);
    if (L <= L1) {
      const q = L / L1;
      k.lineTo(lerp(pts[0][0], pts[1][0], q) * s, lerp(pts[0][1], pts[1][1], q) * s);
    } else {
      const q = (L - L1) / L2;
      k.lineTo(pts[1][0] * s, pts[1][1] * s);
      k.lineTo(lerp(pts[1][0], pts[2][0], q) * s, lerp(pts[1][1], pts[2][1], q) * s);
    }
    if (L > 0) k.stroke();
    k.restore();
  }
  function lastSwitch(on, u) {
    const s = on(u);
    for (let i = 0, t = u; i < 600; i++, t -= 1 / 120) if (on(t - 1 / 120) !== s) return t;
    return null;
  }
  const GREEN = "#1E9E5A", RED = "#E5383B", HEART = "#F23D5C";
  const CELLS = [];
