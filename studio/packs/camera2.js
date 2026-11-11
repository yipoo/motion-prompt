/* Copyright (c) 2026 Shohei Ohtaki; (c) 2026 yipoo. MIT License; see LICENSE. */
MotionPrompt.pack("camera2", function() {
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
  // @element 01
    CELLS[0] = shot(camCell((k, w, h, p) => world(k, w, h, cam({
    y: lerp(1, 3.2, p)
  }), {
    person: {
      z: 7
    },
    tower: [ 3.5, 26 ],
    buildings: true
  }), p => `↕ ${lerp(1, 3.2, p).toFixed(1)}m`));
  // @element 02
    CELLS[1] = shot(camCell((k, w, h, p) => world(k, w, h, cam({
    roll: p * Math.PI * 2
  }), {
    person: {
      z: 7
    }
  }), p => `↻ ${Math.round(p * 360)}°`, .5, 3.6));
  // @element 03
    const HL_BLD = [ [ -7.5, 4, 9, 5 ], [ 7.5, 3.4, 12, 9 ], [ -7.5, 3.6, 14, 13 ], [ 7.5, 4, 8, 18 ], [ -7.5, 3.2, 11, 22 ], [ 7.5, 3.6, 15, 27 ], [ -7.5, 4, 9, 31 ], [ 7.5, 3.2, 12, 36 ], [ -7.5, 3.6, 13, 40 ], [ 7.5, 4, 10, 45 ], [ -7.5, 3.4, 16, 50 ], [ 7.5, 3.6, 9, 55 ] ];
  CELLS[2] = shot(camCell((k, w, h, p) => {
    const z = lerp(0, 22, p), a = lerp(-1.25, 1.25, p);
    const clouds = [ [ -20 + mod(p * 140, 80) - 10, 18, z + 90, 2.2 ], [ -50 + mod(p * 140 + 40, 80), 24, z + 120, 3 ], [ -10 + mod(p * 140 + 20, 80) - 30, 13, z + 70, 1.6 ] ];
    const ex = HL_BLD.map(([x, bw, bh, zz]) => [ x, 0, zz, (kk, s) => building(kk, s, bw, bh) ]);
    for (let i = 0; i < 6; i++) {
      const ph = mod(p * 6 + i / 6, 1), dir = i % 2 ? 1 : -1;
      ex.push([ dir * lerp(-5.5, 5.5, ph), 0, 7 + i * 7, kk => {
        kk.fillStyle = i % 3 ? C.g4 : C.blueM;
        kk.fillRect(-.12, 0, .24, .9);
        kk.beginPath();
        kk.arc(0, 1.05, .13, 0, 7);
        kk.fill();
      } ]);
    }
    world(k, w, h, cam({
      z: z,
      y: 1.6,
      pitch: .05
    }), {
      buildings: false,
      trees: false,
      mtnZ: z,
      sun: [ Math.sin(a) * 120, Math.cos(a) * 60 - 8, z + 170 ],
      sunCol: C.blueM,
      clouds: clouds,
      extra: ex,
      gridX: 24,
      after: (kk, cc) => {
        kk.fillStyle = "rgba(160,160,165,.22)";
        HL_BLD.forEach(([x, bw, bh, zz]) => {
          if (zz < cc.z + 1) return;
          const L = bh * .9;
          const q1 = proj(cc, x - bw / 2, 0, zz), q2 = proj(cc, x + bw / 2, 0, zz), q3 = proj(cc, x + bw / 2 - Math.sin(a) * L, 0, zz - Math.cos(a) * L * .4 - 1), q4 = proj(cc, x - bw / 2 - Math.sin(a) * L, 0, zz - Math.cos(a) * L * .4 - 1);
          if (q3.z < NEAR || q4.z < NEAR) return;
          kk.beginPath();
          kk.moveTo(q1.x, q1.y);
          kk.lineTo(q2.x, q2.y);
          kk.lineTo(q3.x, q3.y);
          kk.lineTo(q4.x, q4.y);
          kk.fill();
        });
      }
    });
  }, p => {
    const m = Math.round(lerp(6 * 60, 18 * 60, p) / 10) * 10;
    return `${String(Math.floor(m / 60)).padStart(2, "0")}:${String(m % 60).padStart(2, "0")} · ${Math.round(lerp(0, 22, p))}m`;
  }, .4, 4.1));
  // @element 04
    CELLS[3] = shot((k, w, h, u) => {
    const uu = Math.min(u, CYC - RESET);
    const draw = (kk, t) => {
      const p = t / (CYC - RESET);
      const x = lerp(-3.4, 2.8, p), z = lerp(5.2, 9.6, p), cx = lerp(0, 1.4, p);
      world(kk, w, h, cam({
        x: cx,
        y: 1.4,
        yaw: Math.atan2(x - cx, z) * .8
      }), {
        person: {
          x: x,
          z: z,
          walk: t * 7
        },
        fg: [ [ -2.6, 3.4 ], [ 3.6, 4.6, "rock" ] ]
      });
      strip(kk, w, h, [ [ 0, CYC, MotionLocale.text("copy_055"), C.blue ] ], t);
    };
    const r = P(u, CYC - RESET, CYC);
    blend(k, kk => draw(kk, uu), kk => draw(kk, 0), eIOs(r));
    return `NO CUT ${(r > .5 ? 0 : uu).toFixed(1)}s`;
  });
  // @element 05
    CELLS[4] = shot((k, w, h, u) => {
    const v = 8 / CYC, z = u * v, T = u * 2 * Math.PI / CYC;
    const c = cam({
      z: z,
      y: 1.45 + .035 * Math.sin(T * 2),
      x: .05 * Math.sin(T),
      yaw: .012 * Math.sin(T + 1),
      roll: .006 * Math.sin(T * 2 + .5),
      pitch: -.02
    });
    const ex = [], L = 8, base = Math.floor(z / L) * L;
    for (let i = 0; i < 10; i++) {
      const zz = base + i * L;
      ex.push([ -5, 0, zz + 2, (kk, s) => tree(kk, s, 3.6) ]);
      ex.push([ 5, 0, zz + 6, (kk, s) => tree(kk, s, 3.2, C.blueXL) ]);
    }
    world(k, w, h, c, {
      buildings: false,
      trees: false,
      extra: ex,
      mtnZ: z,
      sun: [ 30, 30, z + 170 ],
      gridX: 20,
      person: {
        z: z + 5,
        walk: T * 5
      }
    });
    return MotionLocale.text("STABILIZED");
  });
  // @element 06
    CELLS[5] = shot(camCell((k, w, h, p) => {
    const path = s => [ 1.8 * Math.sin(s * 2.2), 4 + s * 9 ];
    const [px, pz] = path(p), [cx, cz] = path(p - .4);
    world(k, w, h, cam({
      x: cx,
      z: cz,
      y: 1.5,
      yaw: Math.atan2(px - cx, pz - cz)
    }), {
      person: {
        x: px,
        z: pz,
        walk: p * 30
      },
      fg: [ [ -2.4, 7 ], [ 2.6, 9.5, "rock" ], [ -1.5, 12 ] ]
    });
  }, p => `FOLLOW ${Math.hypot(1.8 * Math.sin(p * 2.2) - 1.8 * Math.sin((p - .4) * 2.2), 3.6).toFixed(1)}m`, .3, 4.2));
  // @element 07
    CELLS[6] = shot((k, w, h, u) => {
    const q = u / CYC;
    world(k, w, h, cam({
      y: 1.4
    }), {
      person: {
        x: lerp(-6.2, 6.2, q),
        z: 6.5,
        walk: u * 7
      },
      extra: [ [ lerp(16, -16, q), 0, 15, kk => {
        kk.fillStyle = C.g4;
        rr(kk, -1.9, .35, 3.8, .75, .25);
        kk.fill();
        rr(kk, -1.1, .95, 2.1, .62, .28);
        kk.fill();
        kk.fillStyle = C.ink;
        [ -1.15, 1.15 ].forEach(x => {
          kk.beginPath();
          kk.arc(x, .34, .34, 0, 7);
          kk.fill();
        });
      } ] ],
      after: kk => {
        kk.strokeStyle = C.g4;
        kk.lineWidth = 2.2;
        kk.lineCap = "round";
        const x = -w / 2 + 38, y = h / 2 - 20;
        kk.beginPath();
        kk.moveTo(x, y - 30);
        kk.lineTo(x - 12, y);
        kk.moveTo(x, y - 30);
        kk.lineTo(x + 12, y);
        kk.moveTo(x, y - 30);
        kk.lineTo(x, y - 2);
        kk.stroke();
        kk.fillStyle = C.g4;
        rr(kk, x - 9, y - 42, 18, 12, 3);
        kk.fill();
      }
    });
    return MotionLocale.text("LOCKED");
  });
  // @element 08
    CELLS[7] = shot(camCell((k, w, h, p) => {
    const z = lerp(0, 12.5, p), WZ = 8;
    world(k, w, h, cam({
      z: z,
      y: 1.3
    }), {
      buildings: true,
      person: {
        x: .3,
        z: 14.5
      },
      extra: [ [ 0, 0, WZ, (kk, s) => {
        kk.fillStyle = C.g1;
        kk.beginPath();
        kk.rect(-40, 0, 80, 14);
        kk.rect(-1.2, .15, 2.4, 2.2);
        kk.fill("evenodd");
        kk.strokeStyle = C.g3;
        kk.lineWidth = 1.6 / s;
        kk.strokeRect(-1.2, .15, 2.4, 2.2);
        kk.strokeStyle = C.g2;
        kk.lineWidth = 1.2 / s;
        kk.beginPath();
        kk.moveTo(-40, 14);
        kk.lineTo(40, 14);
        kk.stroke();
      } ] ]
    });
  }, p => {
    const d = 8 - lerp(0, 12.5, p);
    return d > 0 ? `Window: ${d.toFixed(1)}m` : MotionLocale.text("copy_068");
  }, .5, 3.6));
  // @element 09
    CELLS[8] = shot(camCell((k, w, h, p) => world(k, w, h, cam({
    y: lerp(1.5, .35, p),
    pitch: lerp(0, .32, p)
  }), {
    person: {
      z: 4.5
    },
    tower: [ -3, 22 ]
  }), p => `↗ ${Math.round(lerp(0, .32, p) * 57.3)}° · ${lerp(1.5, .35, p).toFixed(1)}m`, .6, 2.2));
  // @element 10
    CELLS[9] = shot(camCell((k, w, h, p) => world(k, w, h, cam({
    y: lerp(1.5, 4.5, p),
    pitch: lerp(0, -.5, p)
  }), {
    person: {
      z: 5
    }
  }), p => `↘ ${Math.round(lerp(0, .5, p) * 57.3)}° · ${lerp(1.5, 4.5, p).toFixed(1)}m`, .6, 2.2));
  // @element 11
    CELLS[10] = shot(camCell((k, w, h, p, u) => {
    const z = lerp(0, 3.2, p), T = u * 2 * Math.PI / CYC;
    const bob = Math.sin(T * 6) * .03 * (p > 0 && p < 1 ? 1 : 0);
    world(k, w, h, cam({
      z: z,
      y: 1.6 + bob,
      roll: Math.sin(T * 3) * .008 * (p > 0 && p < 1 ? 1 : 0)
    }), {
      person: {
        z: 7.5,
        armUp: u > 1.6 && u < 3.4,
        walk: 0
      },
      fg: [ [ -1.8, 2.6 ], [ 2.2, 3.8 ] ],
      after: kk => {
        kk.fillStyle = C.blue;
        [ -1, 1 ].forEach(sx => {
          kk.save();
          kk.translate(sx * 178, 64);
          kk.rotate(sx * -.5);
          kk.fillStyle = C.blue;
          rr(kk, -34, -28, 68, 120, 30);
          kk.fill();
          if (sx > 0) {
            kk.fillStyle = "#fff";
            rr(kk, -17, -62, 34, 54, 6);
            kk.fill();
            kk.strokeStyle = C.blue;
            kk.lineWidth = 3;
            rr(kk, -17, -62, 34, 54, 6);
            kk.stroke();
          }
          kk.restore();
        });
      }
    });
  }, p => MotionLocale.text("POV"), .3, 4.2));
  // @element 12
    CELLS[11] = shot(camCell((k, w, h, p, u) => {
    world(k, w, h, cam({
      z: lerp(0, .35, p),
      y: 1.55,
      yaw: .05
    }), {
      person: {
        x: .32,
        z: 3.1,
        walk: .35 * Math.sin(u * 5)
      },
      blurFg: 2.6,
      extra: [ [ -.62, 0, 1.15, kk => {
        kk.fillStyle = C.g4;
        kk.beginPath();
        kk.arc(0, 1.63, .17, 0, 7);
        kk.fill();
        rr(kk, -.34, .9, .68, .6, .14);
        kk.fill();
      }, true ] ]
    });
  }, p => MotionLocale.text("OTS")));
  // @element 13
    CELLS[12] = shot(camCell((k, w, h, p) => {
    const c = cam({
      y: lerp(9, 15, p),
      pitch: -Math.PI / 2
    });
    const ex = [ [ 0, 0, 0, (kk, s) => {
      kk.fillStyle = C.g1;
      kk.fillRect(-1.6, -16, 3.2, 32);
      kk.strokeStyle = C.grid;
      kk.lineWidth = 1.3 / s;
      kk.beginPath();
      for (let i = -16; i <= 16; i += 2) {
        kk.moveTo(i, -16);
        kk.lineTo(i, 16);
        kk.moveTo(-16, i);
        kk.lineTo(16, i);
      }
      kk.stroke();
      kk.strokeStyle = "#fff";
      kk.lineWidth = 2 / s;
      kk.setLineDash([ .6, .6 ]);
      kk.beginPath();
      kk.moveTo(0, -16);
      kk.lineTo(0, 16);
      kk.stroke();
      kk.setLineDash([]);
    } ] ];
    [ [ -4.5, -2.5, 1 ], [ -5.5, 1.8, 1.2 ], [ 4.6, -.6, 1.1 ], [ 5.2, 3.2, .9 ], [ -4.2, 5.5, 1 ], [ 4.9, -4.4, 1 ] ].forEach(([x, z, r]) => ex.push([ x, 0, z, kk => {
      kk.fillStyle = C.g2;
      kk.beginPath();
      kk.arc(0, 0, r, 0, 7);
      kk.fill();
      kk.fillStyle = C.g3;
      kk.beginPath();
      kk.arc(0, 0, .12, 0, 7);
      kk.fill();
    } ]));
    [ [ -8.5, -3, 3, 2.4 ], [ 8.6, 1, 3.4, 2.8 ], [ -8.3, 2.5, 2.6, 2 ] ].forEach(([x, z, bw, bd]) => ex.push([ x, 0, z, (kk, s) => {
      kk.fillStyle = C.g1;
      kk.fillRect(-bw / 2, -bd / 2, bw, bd);
      kk.strokeStyle = C.g3;
      kk.lineWidth = 1.4 / s;
      kk.strokeRect(-bw / 2, -bd / 2, bw, bd);
    } ]));
    ex.push([ -.8, 0, lerp(3.4, -3.4, p), kk => {
      kk.fillStyle = C.blue;
      rr(kk, -.9, -2, 1.8, 4, .4);
      kk.fill();
      kk.fillStyle = "#fff";
      kk.fillRect(-.7, .3, 1.4, .8);
      kk.fillRect(-.7, -1.2, 1.4, .6);
    } ]);
    ex.push([ .9, 0, lerp(-2.6, 2.6, p), kk => {
      kk.fillStyle = C.blue;
      kk.beginPath();
      kk.ellipse(0, 0, .24, .12, 0, 0, 7);
      kk.fill();
      kk.beginPath();
      kk.arc(0, 0, .16, 0, 7);
      kk.fill();
    } ]);
    world(k, w, h, c, {
      grid: false,
      mountains: false,
      buildings: false,
      trees: false,
      sun: null,
      extra: ex
    });
  }, p => `↓ 90° · ${lerp(9, 15, p).toFixed(0)}m`));
  // @element 14
    CELLS[13] = shot(camCell((k, w, h, p) => {
    world(k, w, h, cam({
      y: 1.1
    }), {
      person: {
        x: .9,
        z: 9
      },
      blurFg: 5 * (1 - p),
      blurBg: 6 * (1 - p),
      extra: [ [ -.75, 0, 2, (kk, s) => {
        kk.fillStyle = C.g3;
        kk.fillRect(-.025, 0, .05, .75);
        kk.fillStyle = C.blueM;
        for (let i = 0; i < 6; i++) {
          kk.beginPath();
          kk.ellipse(Math.cos(i) * .09, .8 + Math.sin(i) * .09, .08, .05, i, 0, 7);
          kk.fill();
        }
        kk.fillStyle = C.blue;
        kk.beginPath();
        kk.arc(0, .8, .05, 0, 7);
        kk.fill();
      }, true ] ],
      after: (kk, cc) => {
        kk.globalAlpha = p;
        kk.strokeStyle = C.blue;
        kk.lineWidth = 2;
        kk.beginPath();
        [ [ proj(cc, -.75, .8, 2), 46 ], [ proj(cc, .9, .9, 9), 30 ] ].forEach(([q, r]) => [ [ -1, -1 ], [ 1, -1 ], [ -1, 1 ], [ 1, 1 ] ].forEach(([sx, sy]) => {
          kk.moveTo(q.x + sx * r, q.y + sy * r - sy * 9);
          kk.lineTo(q.x + sx * r, q.y + sy * r);
          kk.lineTo(q.x + sx * r - sx * 9, q.y + sy * r);
        }));
        kk.stroke();
        kk.globalAlpha = 1;
      }
    });
  }, p => {
    const a = lerp(1.8, 16, p);
    return `f/${a < 10 ? a.toFixed(1) : Math.round(a)}`;
  }));
  // @element 15
    CELLS[14] = shot(camCell((k, w, h, p, u) => {
    const clouds = [ [ -30, 20, 110, 2.6 ], [ 20, 26, 150, 3.2 ], [ 60, 17, 95, 2 ] ];
    world(k, w, h, cam({
      f: 220,
      y: 4.5,
      pitch: -.06,
      z: lerp(-5, -2.5, p)
    }), {
      city: true,
      clouds: clouds,
      tower: [ 16, 36 ],
      person: {
        x: -1,
        z: 12
      }
    });
    const a = P(u, .9, 1.3);
    if (a > 0) {
      k.save();
      k.globalAlpha = a;
      k.translate(30, h - 52 + (1 - a) * 8);
      k.fillStyle = "rgba(255,255,255,.9)";
      rr(k, 0, 0, 158, 30, 6);
      k.fill();
      k.fillStyle = C.blue;
      k.fillRect(0, 0, 4, 30);
      txt(k, MotionLocale.text("EXT. CITY – DAY"), 14, 15.5, `600 14px ${MONO}`, C.ink, "left", "middle");
      k.restore();
    }
  }, p => `${mm(220)} WIDE`, .3, 4.2));
  // @element 16
    CELLS[15] = shot(camCell((k, w, h, p) => {
    const f = 610 * Math.pow(2040 / 610, p);
    world(k, w, h, cam({
      f: f,
      x: -.06,
      y: 1.66
    }), {
      blurBg: 3,
      trees: true,
      extra: [ [ 0, 0, 1.3, kk => {
        person(kk, 1);
        [ [ -.06, 1.66 ], [ .06, 1.66 ] ].forEach(([x, y]) => {
          kk.fillStyle = "#fff";
          kk.beginPath();
          kk.ellipse(x, y, .045, .028, 0, 0, 7);
          kk.fill();
          kk.fillStyle = C.ink;
          kk.beginPath();
          kk.arc(x + .008, y, .016, 0, 7);
          kk.fill();
          kk.fillStyle = "#fff";
          kk.beginPath();
          kk.arc(x + .014, y + .007, .005, 0, 7);
          kk.fill();
          kk.strokeStyle = "#fff";
          kk.lineWidth = .012;
          kk.beginPath();
          kk.arc(x, y + .02, .05, Math.PI * 1.15, Math.PI * 1.85);
          kk.stroke();
        });
      } ] ]
    });
  }, p => `${mm(610 * Math.pow(2040 / 610, p))} ${p > .85 ? MotionLocale.text("ECU") : MotionLocale.text("CU")}`));
  // @element 17
    const INS = [ 1.6, 2.9 ];
  CELLS[16] = shot((k, w, h, u) => {
    const ins = u >= INS[0] && u < INS[1];
    if (!ins) world(k, w, h, cam({
      y: 1.4
    }), {
      person: {
        x: -.6,
        z: 6,
        walk: 0
      },
      fg: [ [ 2.2, 4 ] ],
      after: (kk, cc) => {
        const q = proj(cc, -.35, 1.08, 6);
        kk.fillStyle = C.ink;
        kk.beginPath();
        kk.arc(q.x, q.y, 1.6 * q.s / 10, 0, 7);
        kk.fill();
      }
    }); else {
      k.save();
      k.translate(w / 2, h / 2);
      k.fillStyle = C.blueXL;
      k.fillRect(-w, -h, w * 2, h * 2);
      k.fillStyle = C.blue;
      k.save();
      k.rotate(-.35);
      rr(k, -300, -46, 600, 92, 30);
      k.fill();
      k.restore();
      k.fillStyle = "#fff";
      k.beginPath();
      k.arc(0, 0, 58, 0, 7);
      k.fill();
      k.strokeStyle = C.ink;
      k.lineWidth = 5;
      k.stroke();
      k.strokeStyle = C.ink;
      k.lineWidth = 4;
      k.lineCap = "round";
      k.beginPath();
      k.moveTo(0, 0);
      k.lineTo(0, -34);
      k.moveTo(0, 0);
      k.lineTo(26, 14);
      k.stroke();
      const a = (u - INS[0]) / (INS[1] - INS[0]) * Math.PI * 2 - Math.PI / 2;
      k.strokeStyle = C.blue;
      k.lineWidth = 2;
      k.beginPath();
      k.moveTo(0, 0);
      k.lineTo(Math.cos(a) * 44, Math.sin(a) * 44);
      k.stroke();
      k.restore();
    }
    strip(k, w, h, [ [ 0, INS[0], "A", C.g2 ], [ INS[0], INS[1], MotionLocale.text("copy_057"), C.blue ], [ INS[1], CYC, "A", C.g2 ] ], u);
    return ins ? MotionLocale.text("INSERT") : MotionLocale.text("SHOT A");
  });
  // @element 18
    CELLS[17] = shot((k, w, h, u) => {
    const T0 = 2, T1 = 2.45, r = P(u, CYC - RESET, CYC);
    const draw = (kk, t) => {
      const q = eIOs(P(t, T0, T1));
      const pose = (k2, m) => world(k2, w, h, cam({
        y: 1.45,
        z: 0
      }), {
        person: {
          x: lerp(-.4, .35, q),
          z: 3.3,
          walk: (m ? .55 : -.45) + .12 * Math.sin(t * 3)
        },
        trees: true,
        buildings: true
      });
      const bl = Math.sin(q * Math.PI) * 2.2;
      kk.save();
      kk.filter = bl > .05 ? `blur(${bl.toFixed(2)}px)` : "none";
      blend(kk, k2 => pose(k2, false), k2 => pose(k2, true), q);
      kk.restore();
      strip(kk, w, h, [ [ 0, T0, MotionLocale.text("copy_053"), C.g2 ], [ T0, T1, "", C.blue ], [ T1, CYC, MotionLocale.text("copy_054"), C.g2 ] ], t);
    };
    blend(k, kk => draw(kk, u), kk => draw(kk, 0), eIOs(r));
    return r > .5 || u < T0 ? MotionLocale.text("TAKE 1") : u < T1 ? MotionLocale.text("MORPH") : MotionLocale.text("TAKE 2");
  });
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
  // @element 19
    CELLS[18] = shot(abCell((k, w, h, u, A, B) => {
    const out = eIOs(P(u, 1.4, 2.6)), inn = eIOs(P(u, 3.1, 4.3));
    if (u < 2.9) A(k, w, h); else B(k, w, h);
    const a = u < 2.9 ? out : 1 - inn;
    if (a > 0) {
      k.fillStyle = `rgba(20,20,24,${a.toFixed(3)})`;
      k.fillRect(0, 0, w, h);
    }
  }, u => u < 2.9 ? MotionLocale.text("FADE OUT") : MotionLocale.text("FADE IN")));
  // @element 20
    CELLS[19] = shot(abCell((k, w, h, u, A, B) => {
    const out = eIOs(P(u, 1.3, 2.7)), inn = eIOs(P(u, 3.1, 4.4));
    const first = u < 2.9, cur = first ? A : B;
    cur(k, w, h);
    const c = cur === sceneA ? proj(cam({
      y: 1.4
    }), -.6, 1.63, 7) : proj(cam({
      y: 1.6,
      pitch: .1
    }), 1.2, .9, 9);
    const rad = first ? lerp(340, 0, out) : lerp(0, 340, inn);
    const cx = w / 2 + c.x, cy = h / 2 + c.y;
    if (rad < 339) {
      k.fillStyle = "#141418";
      k.beginPath();
      k.rect(0, 0, w, h);
      k.arc(cx, cy, Math.max(0, rad), 0, Math.PI * 2, true);
      k.fill("evenodd");
      if (rad > 1) {
        k.strokeStyle = C.blue;
        k.lineWidth = 2;
        k.beginPath();
        k.arc(cx, cy, rad, 0, 7);
        k.stroke();
      }
    }
  }, u => u < 2.9 ? MotionLocale.text("IRIS OUT") : MotionLocale.text("IRIS IN")));
  // @element 21
    const CUT = [ 1.7, 3 ];
  CELLS[20] = shot((k, w, h, u) => {
    const away = u >= CUT[0] && u < CUT[1];
    if (!away) world(k, w, h, cam({
      y: 1.4
    }), {
      person: {
        x: 0,
        z: 5.5,
        walk: .45 * Math.sin(u * 6)
      },
      extra: [ [ .9, 0, 5.6, kk => {
        kk.fillStyle = C.g3;
        kk.fillRect(-.3, 0, .6, 1.1);
        kk.fillRect(-.4, 1.05, .8, .1);
      } ] ]
    }); else {
      const t = u - CUT[0], ex = [];
      [ [ -1.6, 3.2 ], [ -.2, 3.6 ], [ 1.3, 3.1 ], [ .6, 4.4 ], [ -1.1, 4.6 ] ].forEach(([x, z], i) => ex.push([ x, 0, z, kk => {
        kk.save();
        kk.translate(0, Math.abs(Math.sin(t * 9 + i)) * .05);
        person(kk, 1, {
          armUp: true,
          col: i % 2 ? C.blue : C.blueM
        });
        kk.restore();
      } ]));
      world(k, w, h, cam({
        y: 1.6,
        pitch: -.08
      }), {
        buildings: false,
        trees: false,
        mountains: false,
        sun: null,
        extra: ex
      });
    }
    strip(k, w, h, [ [ 0, CUT[0], "A", C.g2 ], [ CUT[0], CUT[1], MotionLocale.text("copy_056"), C.blue ], [ CUT[1], CYC, "A", C.g2 ] ], u);
    return away ? MotionLocale.text("CUTAWAY") : MotionLocale.text("SHOT A");
  });
  // @element 22
    const XC = [ 0, 1.1, 2, 2.7, 3.3, 3.8, 4.2, 4.5, CYC ];
  CELLS[21] = shot((k, w, h, u) => {
    const r = P(u, CYC - .3, CYC);
    const runA = (kk, t) => world(kk, w, h, cam({
      y: 1.3
    }), {
      person: {
        x: -.3,
        z: lerp(15, 4.5, t / CYC),
        walk: t * 12
      },
      fg: [ [ -2.2, 3.5 ], [ -2.2, 6.5 ], [ -2.2, 9.5 ], [ -2.2, 12.5 ] ]
    });
    const carB = (kk, t) => world(kk, w, h, cam({
      y: 1.6,
      pitch: .06
    }), {
      city: true,
      mountains: false,
      trees: false,
      sun: [ -26, 40, 150 ],
      extra: [ [ 1, 0, lerp(17, 4.5, t / CYC), CAR[3] ] ]
    });
    let i = 0;
    while (u >= XC[i + 1]) i++;
    const isA = i % 2 === 0;
    blend(k, kk => (isA ? runA : carB)(kk, u), kk => runA(kk, 0), eIOs(r));
    const segs = [];
    for (let j = 0; j < XC.length - 1; j++) segs.push([ XC[j], XC[j + 1], j % 2 ? "B" : "A", j % 2 ? C.blue : C.g2 ]);
    strip(k, w, h, segs, u);
    return r > .5 || isA ? MotionLocale.text("SCENE A") : MotionLocale.text("SCENE B");
  });
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
  // @element 23
    CELLS[22] = shot((k, w, h, u, cyc) => {
    const T0 = 1.5, T1 = 3.3, SLOW = .1;
    const tj = u < T0 ? u : u < T1 ? T0 + (u - T0) * SLOW : u - (T1 - T0) * (1 - SLOW);
    const q = P(tj, .6, 2.6), e = eIO(P(u, T0, T1));
    const a = cyc % 2 === 0 ? lerp(-.6, .6, e) : lerp(.6, -.6, e), R = 6, P0 = [ 0, 0, 9 ];
    const c = cam({
      x: P0[0] + Math.sin(a) * R,
      z: P0[2] - Math.cos(a) * R,
      yaw: -a,
      y: 1.6,
      pitch: -.05
    });
    world(k, w, h, c, {
      person: {
        z: 9,
        y: jumpY(q),
        armUp: q > 0 && q < 1,
        face: a
      },
      ring: [ 0, 9, 10 ],
      trees: false,
      extra: leaves(tj, 1.5).map(l => [ l[0], l[1], l[2] + 3, l[3] ]),
      after: (kk, cc) => {
        kk.strokeStyle = C.blueM;
        kk.lineWidth = 2;
        kk.setLineDash([ 5, 5 ]);
        kk.beginPath();
        for (let i = 0; i <= 48; i++) {
          const b = i / 48 * Math.PI * 2;
          const qq = proj(cc, Math.sin(b) * 1.3, 0, 9 + Math.cos(b) * 1.3);
          i ? kk.lineTo(qq.x, qq.y) : kk.moveTo(qq.x, qq.y);
        }
        kk.stroke();
        kk.setLineDash([]);
      }
    });
    return u >= T0 && u < T1 ? `BULLET ×${SLOW.toFixed(1)}` : "×1.0";
  });
  // @element 24
    const MT = [ [ .75, 1, (kk, w, h, t) => world(kk, w, h, cam({
    x: t * 2.2 - 1,
    y: 1.3
  }), {
    person: {
      x: t * 2.2 - 1,
      z: 6,
      walk: t * 14
    },
    fg: [ [ -3, 4 ], [ -1.4, 4 ], [ .2, 4 ], [ 1.8, 4 ], [ 3.4, 4 ] ]
  }) ], [ .7, 3, (kk, w, h, t) => world(kk, w, h, cam({
    y: 1.3
  }), {
    person: {
      z: 7,
      y: jumpY(P(t, .05, .7)),
      armUp: true
    },
    buildings: false
  }) ], [ .65, 7, (kk, w, h, t) => world(kk, w, h, cam({
    y: 1.6,
    pitch: .1
  }), {
    sun: [ 20, lerp(4, 12, t / .65), 170 ],
    sunCol: C.blueM,
    buildings: false,
    trees: false,
    clouds: [ [ -30, 20, 110, 2.6 ], [ 40, 26, 150, 3.2 ] ]
  }) ], [ .65, 12, (kk, w, h, t) => world(kk, w, h, cam({
    y: .5,
    pitch: .25
  }), {
    person: {
      z: 4.5,
      armUp: true
    },
    tower: [ -3, 22 ]
  }) ], [ .65, 20, (kk, w, h, t) => world(kk, w, h, cam({
    y: 1.5,
    f: 420
  }), {
    city: true,
    mountains: false,
    person: {
      z: 7,
      walk: t * 9,
      x: -.5 + t * .6
    }
  }) ], [ .6, 28, (kk, w, h, t) => {
    const a = lerp(-.3, .3, t / .6);
    world(kk, w, h, cam({
      x: Math.sin(a) * 6,
      z: 9 - Math.cos(a) * 6,
      yaw: -a,
      y: 1.7,
      pitch: -.07
    }), {
      person: {
        z: 9,
        face: a
      },
      ring: [ 0, 9, 10 ],
      trees: false
    });
  } ], [ .7, 30, (kk, w, h, t) => world(kk, w, h, cam({
    y: 1.4
  }), {
    person: {
      z: 6,
      armUp: true
    },
    extra: [ [ 1.4, 0, 6.3, k2 => {
      k2.fillStyle = C.g4;
      k2.fillRect(-.04, 0, .08, 2.6);
      k2.fillStyle = C.blue;
      k2.beginPath();
      k2.moveTo(.04, 2.6);
      k2.lineTo(.9, 2.3);
      k2.lineTo(.04, 2);
      k2.fill();
    } ] ]
  }) ] ];
  CELLS[23] = shot((k, w, h, u) => {
    let i = 0, t0 = 0;
    while (i < MT.length - 1 && u >= t0 + MT[i][0]) {
      t0 += MT[i][0];
      i++;
    }
    const r = P(u, CYC - .3, CYC);
    blend(k, kk => MT[i][2](kk, w, h, u - t0), kk => MT[0][2](kk, w, h, 0), eIOs(r));
    const segs = [];
    let s = 0;
    MT.forEach(([d, day], j) => {
      segs.push([ s, s + d, "", j === i ? C.blue : C.g2 ]);
      s += d;
    });
    strip(k, w, h, segs, u);
    return `DAY ${r > .5 ? MT[0][1] : MT[i][1]}`;
  });
  // @end
    return {
    width: CW,
    height: CH,
    cycle: CYC * 2,
    cells: CELLS,
    fonts: []
  };
});
