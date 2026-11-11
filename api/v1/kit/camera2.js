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
  const CW = 539, CH = 208, FPS = 30;
  const HOLD = 9.4, CYC = HOLD / 2;
  const C = {
    bg: "#F4F3F0",
    card: "#FFFFFF",
    border: "#E3E1DC",
    ink: "#1E1E21",
    sub: "#8E8E93",
    faint: "#C9C9CC",
    blue: "#2F6BEB",
    blueM: "#9DB8F6",
    blueL: "#C9D8FB",
    blueXL: "#E4ECFE",
    blueBg: "#F1F5FF",
    grid: "#ECECEC",
    g1: "#F1F0EE",
    g2: "#E2E1DE",
    g3: "#CFCECB",
    g4: "#A9A8A5"
  };
  const FONT = '"Motion Sans", sans-serif';
  const EN = '"Motion Sans", sans-serif';
  const MONO = '"Motion Sans", sans-serif';
  const clamp = (x, a = 0, b = 1) => Math.min(b, Math.max(a, x));
  const lerp = (a, b, x) => a + (b - a) * x;
  const P = (t, a, b) => clamp((t - a) / (b - a));
  const eIO = x => x < .5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2;
  const eIOs = x => x < .5 ? 2 * x * x : 1 - Math.pow(-2 * x + 2, 2) / 2;
  const eOut = x => 1 - Math.pow(1 - x, 3);
  const mod = (a, n) => (a % n + n) % n;
  function mkCanvas(w, h) {
    const c = document.createElement("canvas");
    c.width = w;
    c.height = h;
    return c;
  }
  function rr(ctx, x, y, w, h, r) {
    ctx.beginPath();
    ctx.roundRect(x, y, w, h, r);
  }
  function txt(ctx, s, x, y, font, col, align = "left", base = "alphabetic", ls = "0px") {
    ctx.font = font;
    ctx.fillStyle = col;
    ctx.textAlign = align;
    ctx.textBaseline = base;
    ctx.letterSpacing = ls;
    ctx.fillText(MotionLocale.text(s), x, y);
    ctx.letterSpacing = "0px";
  }
  function tw(ctx, s, font, ls = "0px") {
    ctx.font = font;
    ctx.letterSpacing = ls;
    const w = ctx.measureText(MotionLocale.text(s)).width;
    ctx.letterSpacing = "0px";
    return w;
  }
  const F0 = 330;
  const mm = f => Math.round(f / F0 * 24) + "mm";
  function cam(o) {
    return Object.assign({
      x: 0,
      y: 1.5,
      z: 0,
      yaw: 0,
      pitch: 0,
      roll: 0,
      f: F0
    }, o);
  }
  function proj(c, X, Y, Z) {
    const dx = X - c.x, dy = Y - c.y, dz = Z - c.z;
    const cy = Math.cos(c.yaw), sy = Math.sin(c.yaw);
    const x1 = dx * cy - dz * sy, z1 = dx * sy + dz * cy;
    const cp = Math.cos(c.pitch), sp = Math.sin(c.pitch);
    const y2 = dy * cp - z1 * sp, z2 = dy * sp + z1 * cp;
    return {
      x: c.f * x1 / z2,
      y: -c.f * y2 / z2,
      z: z2,
      s: c.f / z2,
      cx: x1,
      cy: y2
    };
  }
  function camZ(c, X, Y, Z) {
    return proj(c, X, Y, Z).z;
  }
  const NEAR = .25;
  function seg(ctx, c, a, b) {
    let za = camZ(c, ...a), zb = camZ(c, ...b);
    if (za < NEAR && zb < NEAR) return;
    if (za < NEAR) {
      const t = (NEAR - za) / (zb - za);
      a = a.map((v, i) => lerp(v, b[i], t));
    } else if (zb < NEAR) {
      const t = (NEAR - zb) / (za - zb);
      b = b.map((v, i) => lerp(v, a[i], t));
    }
    const p = proj(c, ...a), q = proj(c, ...b);
    ctx.moveTo(p.x, p.y);
    ctx.lineTo(q.x, q.y);
  }
  function poly(ctx, c, pts) {
    ctx.beginPath();
    pts.forEach((p, i) => {
      const q = proj(c, ...p);
      i ? ctx.lineTo(q.x, q.y) : ctx.moveTo(q.x, q.y);
    });
    ctx.closePath();
  }
  function sprite(ctx, c, X, Y, Z, fn) {
    const p = proj(c, X, Y, Z);
    if (p.z < NEAR) return;
    ctx.save();
    ctx.translate(p.x, p.y);
    ctx.scale(p.s, -p.s);
    fn(ctx, p.s);
    ctx.restore();
  }
  function person(ctx, s, o = {}) {
    const col = o.col || C.blue, walk = o.walk || 0, face = o.face;
    ctx.fillStyle = col;
    const sw = Math.sin(walk) * .42;
    [ [ -.08, sw ], [ .08, -sw ] ].forEach(([x, a]) => {
      ctx.save();
      ctx.translate(x, .86);
      ctx.rotate(a);
      rr(ctx, -.075, -.86, .15, .88, .07);
      ctx.fill();
      ctx.restore();
    });
    [ [ -.25, -sw ], [ .25, sw ] ].forEach(([x, a]) => {
      ctx.save();
      ctx.translate(x, 1.38);
      ctx.rotate(a * (o.armUp ? 0 : 1) + (o.armUp ? x < 0 ? -2.6 : 2.6 : 0));
      rr(ctx, -.06, -.58, .12, .6, .06);
      ctx.fill();
      ctx.restore();
    });
    rr(ctx, -.23, .82, .46, .64, .12);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(0, 1.63, .16, 0, 7);
    ctx.fill();
    if (face !== undefined && Math.cos(face) > 0) {
      ctx.fillStyle = "#FFFFFF";
      ctx.beginPath();
      ctx.arc(Math.sin(face) * -.09, 1.65, .035, 0, 7);
      ctx.fill();
    }
  }
  function tree(ctx, s, h = 4, col = C.g2) {
    ctx.fillStyle = C.g3;
    ctx.fillRect(-.09 * h / 4, 0, .18 * h / 4, h * .55);
    ctx.fillStyle = col;
    ctx.beginPath();
    ctx.arc(0, h * .68, h * .3, 0, 7);
    ctx.fill();
  }
  function building(ctx, s, w, h, col = C.g1) {
    ctx.fillStyle = col;
    ctx.fillRect(-w / 2, 0, w, h);
    ctx.strokeStyle = C.g3;
    ctx.lineWidth = 1.4 / s;
    ctx.strokeRect(-w / 2, 0, w, h);
    ctx.fillStyle = C.g2;
    for (let y = h - 1.6; y > 1; y -= 1.8) for (let x = -w / 2 + .6; x < w / 2 - .7; x += 1.3) ctx.fillRect(x, y, .6, .8);
  }
  function post(ctx, s, h = 1.2) {
    ctx.fillStyle = C.g4;
    ctx.fillRect(-.07, 0, .14, h);
    ctx.fillRect(-.12, h - .06, .24, .1);
  }
  const MTN_FAR = [ [ -420, 0 ], [ -300, 22 ], [ -230, 8 ], [ -150, 30 ], [ -80, 12 ], [ -20, 34 ], [ 50, 14 ], [ 120, 28 ], [ 190, 6 ], [ 260, 26 ], [ 340, 10 ], [ 420, 0 ] ];
  const MTN_NEAR = [ [ -260, 0 ], [ -190, 12 ], [ -140, 4 ], [ -70, 18 ], [ -20, 6 ], [ 30, 15 ], [ 95, 3 ], [ 160, 16 ], [ 230, 5 ], [ 300, 0 ] ];
  const BLD = [ [ -17, 4, 9 ], [ -12, 3.2, 13 ], [ -8, 2.6, 7 ], [ 11, 3.4, 11 ], [ 15.5, 4, 8 ], [ 20, 3, 15 ], [ -24, 3.5, 10 ], [ 26, 4, 7 ] ];
  const CITY = [ [ -9, 3.4, 12 ], [ -5.5, 3, 18 ], [ -2, 3.6, 9 ], [ 1.8, 3, 22 ], [ 5.4, 3.6, 14 ], [ 9, 3, 10 ], [ -13, 3.4, 15 ], [ 12.8, 3.6, 19 ] ];
  function world(ctx, w, h, c, o = {}) {
    ctx.save();
    ctx.translate(w / 2, h / 2);
    ctx.rotate(c.roll || 0);
    const blurBg = o.blurBg || 0, blurFg = o.blurFg || 0;
    const setBlur = b => {
      ctx.filter = b > .05 ? `blur(${b.toFixed(2)}px)` : "none";
    };
    if (o.sky) {
      ctx.fillStyle = o.sky;
      ctx.fillRect(-w * 2, -h * 3, w * 4, h * 6);
    }
    setBlur(blurBg);
    const sun = o.sun === undefined ? [ 30, 30, 170 ] : o.sun;
    if (sun) {
      const p = proj(c, ...sun);
      if (p.z > NEAR) {
        ctx.fillStyle = o.sunCol || C.blueL;
        ctx.beginPath();
        ctx.arc(p.x, p.y, Math.max(0, 5.5 * p.s * (o.sunScale || 1)), 0, 7);
        ctx.fill();
      }
    }
    if (o.clouds) o.clouds.forEach(([X, Y, Z, r]) => {
      const p = proj(c, X, Y, Z);
      if (p.z < NEAR) return;
      ctx.fillStyle = C.g1;
      ctx.beginPath();
      ctx.ellipse(p.x, p.y, r * 2.2 * p.s, r * p.s, 0, 0, 7);
      ctx.ellipse(p.x + r * 1.2 * p.s, p.y + r * .2 * p.s, r * 1.4 * p.s, r * .8 * p.s, 0, 0, 7);
      ctx.fill();
    });
    if (o.mountains !== false) {
      const off = o.mtnZ || 0;
      ctx.fillStyle = C.blueXL;
      poly(ctx, c, [ ...MTN_FAR.map(([x, y]) => [ x, y, 175 + off ]) ]);
      ctx.fill();
      ctx.fillStyle = C.blueL;
      poly(ctx, c, [ ...MTN_NEAR.map(([x, y]) => [ x, y, 120 + off ]) ]);
      ctx.fill();
    }
    if (o.grid !== false) {
      ctx.save();
      setBlur(blurBg * .6);
      ctx.strokeStyle = C.grid;
      ctx.lineWidth = 1.3;
      ctx.beginPath();
      const z0 = Math.floor(c.z / 2) * 2, xs = o.gridX || 40;
      for (let z = z0 + 2; z <= z0 + 90; z += z - z0 < 30 ? 2 : 6) seg(ctx, c, [ -xs + c.x, 0, z ], [ xs + c.x, 0, z ]);
      for (let x = Math.floor(c.x / 2) * 2 - xs; x <= c.x + xs; x += 2) seg(ctx, c, [ x, 0, z0 + .5 ], [ x, 0, z0 + 90 ]);
      ctx.stroke();
      ctx.strokeStyle = C.g2;
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      seg(ctx, c, [ c.x - 400, 0, c.z + 300 ], [ c.x + 400, 0, c.z + 300 ]);
      ctx.stroke();
      ctx.restore();
    }
    const list = [];
    const add = (X, Y, Z, fn, fg) => list.push({
      z: camZ(c, X, Y, Z),
      X: X,
      Y: Y,
      Z: Z,
      fn: fn,
      fg: fg
    });
    if (o.buildings !== false) (o.city ? CITY.map(([x, bw, bh]) => [ x, bw, bh, 30 ]) : BLD.map(([x, bw, bh]) => [ x, bw, bh, 48 ])).forEach(([x, bw, bh, z]) => add(x, 0, z, (k, s) => building(k, s, bw, bh)));
    if (o.trees !== false) [ [ -7, 22 ], [ 6.5, 19 ], [ 9.5, 24 ], [ -11, 26 ], [ 3, 30 ] ].forEach(([x, z]) => add(x, 0, z, (k, s) => tree(k, s, 4)));
    if (o.tower) add(o.tower[0], 0, o.tower[1], (k, s) => {
      building(k, s, 6, 9.5, C.g1);
      k.fillStyle = C.g4;
      k.fillRect(-.08, 9.5, .16, 2.2);
      k.fillStyle = C.blue;
      k.beginPath();
      k.arc(0, 11.8, .3, 0, 7);
      k.fill();
    });
    if (o.ring) for (let i = 0; i < 12; i++) {
      const a = i / 12 * Math.PI * 2;
      add(o.ring[0] + Math.sin(a) * o.ring[2], 0, o.ring[1] + Math.cos(a) * o.ring[2], (k, s) => tree(k, s, 3.2, i % 3 ? C.g2 : C.blueXL));
    }
    if (o.extra) o.extra.forEach(e => add(e[0], e[1], e[2], e[3], e[4]));
    if (o.person) {
      const pp = o.person;
      add(pp.x || 0, pp.y || 0, pp.z === undefined ? 8 : pp.z, (k, s) => person(k, s, pp), pp.fg);
    }
    if (o.fg) o.fg.forEach(([X, Z, kind]) => add(X, 0, Z, (k, s) => kind === "rock" ? (k.fillStyle = C.g3,
    k.beginPath(), k.ellipse(0, .1, .55, .38, 0, 0, 7), k.fill()) : post(k, s), true));
    list.sort((a, b) => b.z - a.z);
    for (const it of list) {
      setBlur(it.fg ? blurFg : blurBg);
      sprite(ctx, c, it.X, it.Y, it.Z, it.fn);
    }
    ctx.filter = "none";
    if (o.after) o.after(ctx, c);
    ctx.restore();
  }
  const CARD = mkCanvas(CW, CH), CK = CARD.getContext("2d");
  const TMP = mkCanvas(CW, CH), TK = TMP.getContext("2d");
  const TMP2 = mkCanvas(CW, CH), TK2 = TMP2.getContext("2d");
  function clear(k, w = CW, h = CH) {
    k.setTransform(1, 0, 0, 1, 0, 0);
    k.globalAlpha = 1;
    k.filter = "none";
    k.fillStyle = "#FFFFFF";
    k.fillRect(0, 0, w, h);
  }
  function blend(k, fnA, fnB, a) {
    if (a <= .001) return fnA(k);
    if (a >= .999) return fnB(k);
    fnA(k);
    clear(TK2);
    fnB(TK2);
    k.save();
    k.globalAlpha = a;
    k.drawImage(TMP2, 0, 0);
    k.restore();
  }
  function mblur(k, fn, s0, s1, n) {
    if (Math.abs(s1 - s0) < 1e-4 || n < 2) return fn(k, s0);
    const acc = mkCanvasCached(), ak = acc.getContext("2d");
    for (let i = 0; i < n; i++) {
      clear(TK);
      fn(TK, lerp(s0, s1, (i + .5) / n));
      ak.globalAlpha = 1 / (i + 1);
      ak.drawImage(TMP, 0, 0);
    }
    ak.globalAlpha = 1;
    k.save();
    k.drawImage(acc, 0, 0);
    k.restore();
  }
  let _acc;
  function mkCanvasCached() {
    if (!_acc) _acc = mkCanvas(CW, CH);
    const k = _acc.getContext("2d");
    k.globalAlpha = 1;
    k.fillStyle = "#fff";
    k.fillRect(0, 0, CW, CH);
    return _acc;
  }
  function viewfinder(k, w, h, t, hud, hudCol) {
    k.save();
    const m = 13, L = 20;
    k.strokeStyle = "#8F8F94";
    k.lineWidth = 2.6;
    k.lineCap = "round";
    k.beginPath();
    [ [ m, m, 1, 1 ], [ w - m, m, -1, 1 ], [ m, h - m, 1, -1 ], [ w - m, h - m, -1, -1 ] ].forEach(([x, y, sx, sy]) => {
      k.moveTo(x, y + sy * L);
      k.lineTo(x, y);
      k.lineTo(x + sx * L, y);
    });
    k.stroke();
    k.strokeStyle = "rgba(143,143,148,.55)";
    k.lineWidth = 1.6;
    k.beginPath();
    k.moveTo(w / 2 - 7, h / 2);
    k.lineTo(w / 2 + 7, h / 2);
    k.moveTo(w / 2, h / 2 - 7);
    k.lineTo(w / 2, h / 2 + 7);
    k.stroke();
    const a = .55 + .45 * Math.cos(t * Math.PI * 2 * 9 / HOLD);
    k.fillStyle = C.blue;
    k.globalAlpha = a;
    k.beginPath();
    k.arc(m + 16, m + 17, 5, 0, 7);
    k.fill();
    k.globalAlpha = 1;
    txt(k, MotionLocale.text("REC"), m + 27, m + 17, `600 14px ${MONO}`, "#7D7D82", "left", "middle");
    if (hud) {
      const f = `600 15px ${MONO}`, ww = tw(k, hud, f);
      k.fillStyle = "rgba(255,255,255,.82)";
      rr(k, w - m - 14 - ww - 10, m + 6, ww + 20, 23, 6);
      k.fill();
      txt(k, hud, w - m - 14, m + 18, f, hudCol || "#6E6E73", "right", "middle");
    }
    k.restore();
  }
  const RESET = .5;
  function camCell(stateAt, hudAt, t0 = .5, t1 = 3.4) {
    return (k, w, h, u) => {
      const p = eIO(P(u, t0, t1));
      const r = P(u, CYC - RESET, CYC);
      blend(k, kk => stateAt(kk, w, h, p, u), kk => stateAt(kk, w, h, 0, u - CYC), eIOs(r));
      return hudAt(r > .5 ? 0 : p, u);
    };
  }
  function shot(fn, vh) {
    return (k, w, h, u) => {
      const uu = mod(u, CYC), cyc = Math.floor(u / CYC);
      k.fillStyle = "#FFFFFF";
      k.fillRect(0, 0, w, h);
      k.save();
      const hud = fn(k, w, h, uu, cyc);
      k.restore();
      k.globalAlpha = 1;
      k.filter = "none";
      viewfinder(k, w, vh || h, u, hud);
    };
  }
  function strip(k, w, h, segs, pos, lab) {
    const x0 = 44, x1 = w - 44, y = h - 36, hh = 24;
    const xAt = t => lerp(x0, x1, t / CYC);
    k.save();
    k.fillStyle = "rgba(255,255,255,.9)";
    rr(k, x0 - 6, y - 5, x1 - x0 + 12, hh + 10, 7);
    k.fill();
    segs.forEach(([a, b, s, col]) => {
      k.fillStyle = col;
      rr(k, xAt(a) + 1, y, Math.max(2, xAt(b) - xAt(a) - 2), hh, 4);
      k.fill();
      if (s) txt(k, s, (xAt(a) + xAt(b)) / 2, y + hh / 2 + .5, `700 12px ${FONT}`, col === C.g2 ? C.g4 : "#fff", "center", "middle");
    });
    const hx = xAt(pos);
    k.fillStyle = C.ink;
    k.fillRect(hx - 1.5, y - 4, 3, hh + 8);
    k.beginPath();
    k.moveTo(hx - 5, y - 6);
    k.lineTo(hx + 5, y - 6);
    k.lineTo(hx, y - 1);
    k.fill();
    if (lab) txt(k, lab, x0 - 6, y - 10, `600 11px ${MONO}`, C.sub, "left", "alphabetic");
    k.restore();
  }
  const CELLS = [];

  // @shared
    const sceneA = (k, w, h, extra = {}) => world(k, w, h, cam(Object.assign({
    y: 1.4
  }, extra.cam)), Object.assign({
    person: {
      x: -.6,
      z: 7
    }
  }, extra));
  const CAR = [ 1.2, 0, 9, kk => {
    kk.fillStyle = C.blue;
    rr(kk, -1.9, .35, 3.8, .75, .25);
    kk.fill();
    rr(kk, -1.1, .95, 2.1, .62, .28);
    kk.fill();
    kk.fillStyle = "#fff";
    kk.fillRect(-.85, 1.08, .8, .36);
    kk.fillRect(.12, 1.08, .7, .36);
    kk.fillStyle = C.ink;
    [ -1.15, 1.15 ].forEach(x => {
      kk.beginPath();
      kk.arc(x, .34, .34, 0, 7);
      kk.fill();
    });
  } ];
  const SB = {
    city: true,
    mountains: false,
    trees: false,
    sun: [ -26, 40, 150 ],
    extra: [ CAR ]
  };
  const sceneB = (k, w, h, extra = {}) => world(k, w, h, cam(Object.assign({
    y: 1.6,
    pitch: .1
  }, extra.cam)), Object.assign({}, SB, extra));
  function abCell(trans, hudFn) {
    return (k, w, h, u, cyc) => {
      const S = cyc % 2 === 0 ? [ sceneA, sceneB ] : [ sceneB, sceneA ];
      trans(k, w, h, u, S[0], S[1], cyc);
      return hudFn ? hudFn(u, cyc) : cyc % 2 === 0 ? "A → B" : "B → A";
    };
  }

  // @shared
    function jumpY(q) {
    return q <= 0 || q >= 1 ? 0 : 4 * q * (1 - q) * 1.1;
  }
  function leaves(u, speed) {
    const ex = [];
    for (let i = 0; i < 9; i++) {
      const ph = mod(u * speed / 4.7 + i / 9, 1);
      ex.push([ -3 + i * .75 + Math.sin(i * 3) * .3, 3.4 - ph * 3.4, 6 + i % 3, kk => {
        kk.fillStyle = i % 2 ? C.blueM : C.g3;
        kk.save();
        kk.rotate(ph * 6 + i);
        kk.beginPath();
        kk.ellipse(0, 0, .09, .045, 0, 0, 7);
        kk.fill();
        kk.restore();
      } ]);
    }
    return ex;
  }
