/* Derived from Motion Prompt by Shohei Ohtaki (MIT); bilingual redesign by yipoo. */
MotionPrompt.pack("lp2", function() {
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
  // @element 01
    CELLS[0] = (k, w, h, u) => {
    u = snapU(u);
    frame(k);
    const y = steps([ [ .3, 0 ], [ 2.3, 190 ], [ 3, 190 ], [ 4.3, 0 ] ], u);
    const ROWS = [ [ 72, "2018", MotionLocale.text("copy_073") ], [ 126, "2020", MotionLocale.text("copy_074") ], [ 180, "2022", MotionLocale.text("copy_076") ], [ 234, "2024", MotionLocale.text("copy_075") ], [ 288, "2026", MotionLocale.text("copy_077") ] ];
    const LX = 168, L = y + 126;
    view(k, () => {
      k.save();
      k.translate(0, -y);
      txt(k, MotionLocale.text("HISTORY"), 34, 34, `800 11px ${EN}`, C.acc, "left", "alphabetic", "2px");
      txt(k, MotionLocale.text("copy_072"), 34, 60, `800 20px ${FONT}`, C.ink);
      pic(k, 34, 76, 100, 62, 0, 6);
      bars(k, 34, 148, 90, 2);
      k.fillStyle = C.faint;
      rr(k, LX - 1.5, 52, 3, 248, 1.5);
      k.fill();
      k.fillStyle = C.acc;
      rr(k, LX - 1.5, 52, 3, clamp(L - 52, 0, 248), 1.5);
      k.fill();
      for (const [iy, yr, lab] of ROWS) {
        const q = eOut(clamp((L - iy) / 22));
        k.fillStyle = "#fff";
        k.beginPath();
        k.arc(LX, iy, 7.5, 0, 7);
        k.fill();
        k.lineWidth = 2.5;
        k.strokeStyle = q > 0 ? C.acc : C.faint;
        k.stroke();
        if (q > 0) {
          k.fillStyle = C.acc;
          k.beginPath();
          k.arc(LX, iy, 4 * q, 0, 7);
          k.fill();
        }
        k.save();
        k.globalAlpha = q;
        k.translate(16 * (1 - q), 0);
        txt(k, yr, LX + 22, iy + 6, `800 18px ${EN}`, C.acc);
        txt(k, lab, LX + 82, iy + 5, `700 15px ${FONT}`, C.ink);
        bars(k, LX + 82, iy + 15, 190, 1, C.faint, 5);
        k.restore();
      }
      k.restore();
      sbar(k, y / 190, .45);
    });
  };
  // @element 02
    CELLS[1] = (k, w, h, u) => {
    u = snapU(u);
    frame(k);
    const p = steps([ [ .3, 0 ], [ 2.6, 1 ], [ 3.2, 1 ], [ 4.4, 0 ] ], u), y = p * 40;
    const LINES = [ MotionLocale.text("copy_080"), MotionLocale.text("copy_078"), MotionLocale.text("copy_079") ], F = `800 27px ${FONT}`;
    const total = LINES.join("").length;
    view(k, () => {
      k.save();
      k.translate(0, -y);
      txt(k, MotionLocale.text("ABOUT US"), 40, 34, `800 11px ${EN}`, C.acc, "left", "alphabetic", "2px");
      let n = 0;
      LINES.forEach((s, li) => {
        let x = 40;
        k.font = F;
        for (const ch of s) {
          const f = clamp(p * (total + 2) - n);
          txt(k, ch, x, 72 + li * 38, F, mix("#D6DBE4", C.ink, f));
          k.font = F;
          x += k.measureText(ch).width;
          n++;
        }
      });
      bars(k, 40, 168, 300, 3, C.faint, 6, 12, .7);
      k.restore();
      sbar(k, p, .55);
    });
  };
  // @element 03
    CELLS[2] = (k, w, h, u) => {
    u = snapU(u);
    frame(k);
    const s = steps([ [ .3, 0 ], [ 1.1, 1 ], [ 1.6, 1 ], [ 2.4, 2 ], [ 3.2, 2 ], [ 4.4, 0 ] ], u);
    const CARDS = [ [ C.blueL, C.ink, C.acc, "01", MotionLocale.text("copy_085"), 0 ], [ C.ink, "#fff", C.acc, "02", MotionLocale.text("copy_082"), 2 ], [ C.acc, "#fff", "#fff", "03", MotionLocale.text("copy_083"), 1 ] ];
    const X = 70, CWD = 371, CHT = 124, STEP = 170;
    view(k, () => {
      k.fillStyle = C.soft;
      k.fillRect(0, 0, VW, VH);
      CARDS.forEach(([bg, fg, nc, no, ttl, pv], i) => {
        const top = Math.max(14 + i * 12, 16 + i * STEP - s * STEP);
        const cov = clamp(s - i), sc = 1 - .045 * cov - .045 * clamp(s - i - 1);
        k.save();
        k.translate(VW / 2, top);
        k.scale(sc, sc);
        k.translate(-VW / 2, 0);
        k.save();
        k.shadowColor = "rgba(28,35,51,.22)";
        k.shadowBlur = 14;
        k.shadowOffsetY = -2;
        k.fillStyle = bg;
        rr(k, X, 0, CWD, CHT, 12);
        k.fill();
        k.restore();
        txt(k, no, X + 24, 44, `800 26px ${EN}`, nc);
        txt(k, ttl, X + 24, 78, `800 20px ${FONT}`, fg);
        bars(k, X + 24, 92, 140, 2, i === 0 ? "#C3CDEA" : "rgba(255,255,255,.35)");
        pic(k, X + CWD - 160, 14, 144, CHT - 28, pv, 8);
        if (cov > 0) {
          k.fillStyle = `rgba(28,35,51,${.16 * cov})`;
          rr(k, X, 0, CWD, CHT, 12);
          k.fill();
        }
        k.restore();
      });
      sbar(k, s / 2, .4);
    });
  };
  // @element 04
    CELLS[3] = (k, w, h, u) => {
    u = snapU(u);
    frame(k);
    const y = steps([ [ .3, 0 ], [ 1.2, VH ], [ 1.8, VH ], [ 2.7, 2 * VH ], [ 3.3, 2 * VH ], [ 4.4, 0 ] ], u), s = y / VH;
    const BG = [ "#FFEBD9", "#1E2A4A", "#DDE6FF" ], DK = [ 0, 1, 0 ];
    const i0 = Math.min(1, Math.floor(s)), t = eIOs(clamp((s - i0 - .05) / .9));
    const bg = mix(BG[i0], BG[i0 + 1], t), dk = lerp(DK[i0], DK[i0 + 1], t);
    const fg = mix(C.ink, "#FFFFFF", dk), bc = mix("#E3C9B4", "#45507A", dk);
    view(k, () => {
      k.fillStyle = bg;
      k.fillRect(0, 0, VW, VH);
      k.save();
      k.translate(0, -y);
      const S = [ [ MotionLocale.text("01  MORNING"), MotionLocale.text("copy_069") ], [ MotionLocale.text("02  NIGHT"), MotionLocale.text("copy_070") ], [ MotionLocale.text("03  HOLIDAY"), MotionLocale.text("copy_071") ] ];
      S.forEach(([no, ttl], i) => {
        const y0 = i * VH;
        txt(k, no, 40, y0 + 58, `800 12px ${EN}`, C.acc, "left", "alphabetic", "2px");
        txt(k, ttl, 40, y0 + 92, `800 24px ${FONT}`, fg);
        k.fillStyle = bc;
        for (let j = 0; j < 2; j++) {
          rr(k, 40, y0 + 108 + j * 12, j ? 110 : 180, 6, 3);
          k.fill();
        }
      });
      k.fillStyle = C.acc;
      k.beginPath();
      k.arc(380, 84, 34, 0, 7);
      k.fill();
      k.strokeStyle = C.acc;
      k.lineWidth = 4;
      k.lineCap = "round";
      for (let j = 0; j < 8; j++) {
        const a = j * Math.PI / 4;
        k.beginPath();
        k.moveTo(380 + Math.cos(a) * 44, 84 + Math.sin(a) * 44);
        k.lineTo(380 + Math.cos(a) * 54, 84 + Math.sin(a) * 54);
        k.stroke();
      }
      k.fillStyle = "#FFE5DB";
      k.beginPath();
      k.arc(380, VH + 84, 36, 0, 7);
      k.fill();
      k.fillStyle = bg;
      k.beginPath();
      k.arc(396, VH + 72, 32, 0, 7);
      k.fill();
      k.fillStyle = "#FFE5DB";
      [ [ 300, 50 ], [ 450, 40 ], [ 330, 130 ], [ 470, 120 ] ].forEach(([a, b]) => {
        k.beginPath();
        k.arc(a, VH + b, 2.5, 0, 7);
        k.fill();
      });
      pic(k, 300, 2 * VH + 28, 180, 112, 0, 10);
      k.restore();
      sbar(k, s / 2, .34);
    });
  };
  // @element 05
    CELLS[4] = (k, w, h, u) => {
    u = snapU(u);
    frame(k);
    const SY = t => steps([ [ .3, 0 ], [ 1.1, 170 ], [ 1.5, 170 ], [ 1.9, 100 ], [ 2.4, 100 ], [ 2.9, 230 ], [ 3.3, 230 ], [ 4.3, 0 ] ], t), y = SY(u);
    const hidden = t => {
      const yt = SY(t);
      if (yt < 34) return false;
      for (let i = 0, tt = t; i < 600; i++, tt -= 1 / 120) {
        const d = SY(tt) - SY(tt - 1 / 120);
        if (Math.abs(d) > 1e-4) return d > 0;
      }
      return false;
    };
    const q = trans(hidden, u, .3, eIOs);
    view(k, () => {
      k.save();
      k.translate(0, -y);
      pic(k, 24, 48, 214, 110, 1, 8);
      txt(k, MotionLocale.text("copy_113"), 262, 84, `800 22px ${FONT}`, C.ink);
      txt(k, MotionLocale.text("copy_092"), 262, 114, `800 22px ${FONT}`, C.ink);
      bars(k, 262, 128, 200, 2);
      btn(k, 262, 152, 100, 24, MotionLocale.text("copy_136"));
      k.fillStyle = C.soft;
      k.fillRect(0, 196, VW, 260);
      txt(k, MotionLocale.text("copy_127"), VW / 2, 232, `800 17px ${FONT}`, C.ink, "center");
      for (let r = 0; r < 2; r++) for (let i = 0; i < 3; i++) {
        const x = 34 + i * 152, y0 = 250 + r * 100;
        k.fillStyle = "#fff";
        rr(k, x, y0, 136, 88, 8);
        k.fill();
        pic(k, x + 8, y0 + 8, 120, 46, (i + r) % 3, 5);
        bars(k, x + 10, y0 + 64, 100, 2, C.faint, 5, 10);
      }
      k.restore();
      const hy = -36 * q;
      if (y > 0 && q < 1) {
        const g = k.createLinearGradient(0, hy + 34, 0, hy + 46);
        g.addColorStop(0, `rgba(28,35,51,${.14 * clamp(y / 30)})`);
        g.addColorStop(1, "rgba(28,35,51,0)");
        k.fillStyle = g;
        k.fillRect(0, hy + 34, VW, 12);
      }
      header(k, hy);
      sbar(k, y / 230, .42);
    });
  };
  // @element 06
    CELLS[5] = (k, w, h, u) => {
    u = snapU(u);
    frame(k);
    const y = steps([ [ .3, 0 ], [ .9, 100 ], [ 1.35, 100 ], [ 1.95, 200 ], [ 2.4, 200 ], [ 3, 300 ], [ 3.5, 300 ], [ 4.4, 0 ] ], u);
    const NAMES = [ MotionLocale.text("copy_104"), MotionLocale.text("copy_103"), MotionLocale.text("copy_028"), MotionLocale.text("copy_129") ], TX = 160;
    const act = t => {
      const yy = steps([ [ .3, 0 ], [ .9, 100 ], [ 1.35, 100 ], [ 1.95, 200 ], [ 2.4, 200 ], [ 3, 300 ], [ 3.5, 300 ], [ 4.4, 0 ] ], t);
      let a = 0;
      for (let i = 0; i < 4; i++) if (i * 100 <= yy + 40) a = i;
      return a;
    };
    view(k, () => {
      k.save();
      k.beginPath();
      k.rect(TX - 10, 0, VW, VH);
      k.clip();
      k.translate(0, -y);
      NAMES.forEach((s, i) => {
        const y0 = i * 100 + 14;
        txt(k, `${i + 1}. ${s}`, TX + 14, y0 + 22, `800 16px ${FONT}`, C.ink);
        bars(k, TX + 14, y0 + 38, 300, 3, C.faint, 6, 12, .6);
      });
      k.restore();
      k.fillStyle = C.soft;
      k.fillRect(0, 0, TX - 10, VH);
      txt(k, MotionLocale.text("copy_047"), 20, 30, `800 12px ${FONT}`, C.sub);
      const a = act(u);
      NAMES.forEach((s, i) => {
        const q = trans(t => act(t) === i, u, .25), iy = 54 + i * 30;
        if (q > 0) {
          k.fillStyle = `rgba(255,229,219,${q})`;
          rr(k, 12, iy - 13, TX - 34, 26, 6);
          k.fill();
          k.fillStyle = C.acc;
          k.globalAlpha = q;
          rr(k, 12, iy - 13, 4, 26, 2);
          k.fill();
          k.globalAlpha = 1;
        }
        txt(k, s, 26, iy + 1, `${a === i ? 800 : 600} 13px ${FONT}`, mix("#7D879B", C.acc, q), "left", "middle");
      });
      sbar(k, y / 300, .36);
    });
  };
  // @element 07
    CELLS[6] = (k, w, h, u) => {
    u = snapU(u);
    frame(k);
    const CLK = 2.6, MAX = 300;
    const y = u < CLK + .02 ? steps([ [ .2, 0 ], [ 1.7, MAX ] ], u) : MAX * (1 - eIO(P(u, CLK + .06, CLK + .66)));
    const cur = t => path([ [ 0, 340, 205 ], [ 1.6, 340, 205 ], [ 2.35, 472, 138 ], [ 2.95, 472, 138 ], [ 3.6, 340, 205 ], [ 4.7, 340, 205 ] ], t);
    const [cx, cy] = cur(u);
    view(k, () => {
      k.save();
      k.translate(0, -y);
      txt(k, MotionLocale.text("BLOG"), 70, 32, `800 11px ${EN}`, C.acc, "left", "alphabetic", "2px");
      txt(k, MotionLocale.text("copy_114"), 70, 58, `800 19px ${FONT}`, C.ink);
      pic(k, 70, 72, 371, 100, 2, 8);
      for (let b = 0; b < 3; b++) {
        const y0 = 192 + b * 82;
        k.fillStyle = C.ink;
        rr(k, 70, y0, 150, 9, 4.5);
        k.fill();
        bars(k, 70, y0 + 22, 371, 4, C.faint, 6, 12);
      }
      k.fillStyle = C.ink;
      k.fillRect(0, 438, VW, 80);
      logo(k, 70, 454, "#fff");
      bars(k, 300, 451, 140, 1, "rgba(255,255,255,.3)");
      k.restore();
      const tb = eOut(clamp((y - 80) / 60));
      if (tb > 0) {
        const hov = trans(t => {
          const [a, b] = cur(t);
          return Math.hypot(a - 472, b - 138) < 20;
        }, u, .2);
        k.save();
        k.globalAlpha = tb;
        k.translate(0, 10 * (1 - tb));
        k.save();
        k.shadowColor = "rgba(28,35,51,.3)";
        k.shadowBlur = 10;
        k.shadowOffsetY = 3;
        k.fillStyle = mix(C.acc, "#D9431C", hov);
        k.beginPath();
        k.arc(472, 138, 19, 0, 7);
        k.fill();
        k.restore();
        k.strokeStyle = "#fff";
        k.lineWidth = 2.6;
        k.lineCap = "round";
        k.lineJoin = "round";
        k.beginPath();
        k.moveTo(465, 142);
        k.lineTo(472, 134.5);
        k.lineTo(479, 142);
        k.stroke();
        k.restore();
      }
      sbar(k, y / MAX, .34);
      click(k, cx, cy, u, [ CLK ]);
    });
  };
  // @element 08
    CELLS[7] = (k, w, h, u) => {
    u = snapU(u);
    frame(k);
    const p = steps([ [ .3, 0 ], [ 2.3, 1 ], [ 3, 1 ], [ 4.4, 0 ] ], u);
    const x = lerp(178, 0, p), y = lerp(58, 0, p), ww = lerp(155, VW, p), hh = lerp(90, VH, p);
    view(k, () => {
      const a = 1 - clamp(p * 2.2);
      k.save();
      k.globalAlpha = a;
      txt(k, MotionLocale.text("copy_109"), VW / 2, 38, `800 19px ${FONT}`, C.ink, "center");
      bars(k, 34, 66, 120, 4, C.faint, 6, 14);
      bars(k, 357, 66, 120, 4, C.faint, 6, 14);
      k.restore();
      pic(k, x, y, ww, hh, 0, lerp(8, 0, p));
      const b = clamp((p - .7) / .3);
      if (b > 0) {
        k.save();
        k.globalAlpha = b;
        txt(k, MotionLocale.text("copy_108"), VW / 2, VH / 2 + 2, `800 26px ${FONT}`, "#fff", "center", "middle", "2px");
        k.restore();
      }
      sbar(k, p * .6, .4);
    });
  };
  // @element 09
    const TC = document.createElement("canvas");
  TC.width = 220;
  TC.height = 132;
  const TCK = TC.getContext("2d");
  const TD = document.createElement("canvas");
  TD.width = 300;
  TD.height = 190;
  const TDK = TD.getContext("2d");
  const TDW = 300, TDH = 190;
  CELLS[8] = (k, w, h, u) => {
    u = snapU(u);
    frame(k);
    const BX = VW / 2, BY = 82, BW = 220, BH = 132, MAXA = .32, D = 520;
    const cur = t => path([ [ 0, 80, 190 ], [ .6, 190, 40 ], [ 1.2, 335, 50 ], [ 1.8, 330, 125 ], [ 2.4, 180, 122 ], [ 3, 258, 80 ], [ 3.6, 470, 190 ], [ 4.7, 80, 190 ] ], t);
    const inside = t => {
      const [x, y] = cur(t);
      return Math.abs(x - BX) < BW / 2 && Math.abs(y - BY) < BH / 2;
    };
    const q = trans(inside, u, .4, eOut), [cx, cy] = cur(u);
    const nx = clamp((cx - BX) / (BW / 2), -1, 1), ny = clamp((cy - BY) / (BH / 2), -1, 1);
    const ry = nx * MAXA * q, rx = ny * MAXA * q;
    const m = k.getTransform(), S = Math.min(4, Math.max(1, Math.hypot(m.a, m.b)));
    const cw = Math.ceil(BW * S), ch = Math.ceil(BH * S), dw = Math.ceil(TDW * S), dh = Math.ceil(TDH * S);
    if (TC.width !== cw || TC.height !== ch) {
      TC.width = cw;
      TC.height = ch;
    }
    if (TD.width !== dw || TD.height !== dh) {
      TD.width = dw;
      TD.height = dh;
    }
    const g = TCK;
    g.clearRect(0, 0, TC.width, TC.height);
    g.save();
    g.scale(S, S);
    rr(g, 0, 0, BW, BH, 14);
    g.clip();
    const gr = g.createLinearGradient(0, 0, BW, BH);
    gr.addColorStop(0, "#2B4FD6");
    gr.addColorStop(1, "#7D9AF4");
    g.fillStyle = gr;
    g.fillRect(0, 0, BW, BH);
    g.fillStyle = "rgba(255,255,255,.12)";
    g.beginPath();
    g.arc(BW - 30, 20, 70, 0, 7);
    g.fill();
    logo(g, 18, 26, "#fff");
    g.fillStyle = "#FFD9C9";
    rr(g, 18, 52, 34, 26, 5);
    g.fill();
    txt(g, MotionLocale.text("MEMBER CARD"), 18, 104, `700 11px ${EN}`, "rgba(255,255,255,.8)", "left", "alphabetic", "2px");
    txt(g, "0123  4567  8910", 18, 122, `700 13px ${EN}`, "#fff", "left", "alphabetic", "1px");
    const gx = (nx * .5 + .5) * BW, gy = (ny * .5 + .5) * BH, gl = g.createRadialGradient(gx, gy, 0, gx, gy, 130);
    gl.addColorStop(0, `rgba(255,255,255,${.42 * q})`);
    gl.addColorStop(1, "rgba(255,255,255,0)");
    g.fillStyle = gl;
    g.fillRect(0, 0, BW, BH);
    g.restore();
    const d = TDK;
    d.clearRect(0, 0, TD.width, TD.height);
    const N = 44;
    for (let i = 0; i < N; i++) {
      const v0 = i / N - .5, v1 = (i + 1) / N - .5, z0 = v0 * BH * Math.sin(rx), z1 = v1 * BH * Math.sin(rx), s0 = D / (D + z0), s1 = D / (D + z1);
      const y0 = TDH / 2 + v0 * BH * Math.cos(rx) * s0, y1 = TDH / 2 + v1 * BH * Math.cos(rx) * s1, sw = BW * (s0 + s1) / 2;
      d.drawImage(TC, 0, i * BH / N * S, BW * S, (BH / N + .6) * S, (TDW / 2 - sw / 2) * S, y0 * S, sw * S, (y1 - y0 + .6) * S);
    }
    view(k, () => {
      k.fillStyle = C.soft;
      k.fillRect(0, 0, VW, VH);
      k.fillStyle = `rgba(28,35,51,${.1 + .05 * q})`;
      k.beginPath();
      k.ellipse(BX - nx * 10 * q, 158, 96, 7, 0, 0, 7);
      k.fill();
      for (let i = 0; i < N; i++) {
        const f0 = i / N - .5, f1 = (i + 1) / N - .5, z0 = f0 * TDW * Math.sin(ry), z1 = f1 * TDW * Math.sin(ry), s0 = D / (D + z0), s1 = D / (D + z1);
        const x0 = BX + f0 * TDW * Math.cos(ry) * s0, x1 = BX + f1 * TDW * Math.cos(ry) * s1, sh = TDH * (s0 + s1) / 2;
        k.drawImage(TD, i * TDW / N * S, 0, (TDW / N + .6) * S, TDH * S, x0, BY - sh / 2, x1 - x0 + .6, sh);
      }
      cursor(k, cx, cy);
    });
  };
  // @element 10
    CELLS[9] = (k, w, h, u) => {
    u = snapU(u);
    frame(k);
    const cx = 255 + 190 * Math.sin(2 * Math.PI * u / CYC), cy = 92 + 40 * Math.sin(4 * Math.PI * u / CYC);
    view(k, () => {
      k.fillStyle = "#121828";
      k.fillRect(0, 0, VW, VH);
      txt(k, MotionLocale.text("FEATURES"), VW / 2, 26, `800 11px ${EN}`, "rgba(255,255,255,.45)", "center", "alphabetic", "3px");
      const LAB = [ MotionLocale.text("copy_096"), MotionLocale.text("copy_098"), MotionLocale.text("copy_097") ];
      for (let i = 0; i < 3; i++) {
        const x = 22 + i * 160, y = 40, cw = 147, ch = 116;
        k.fillStyle = "#1C2335";
        rr(k, x, y, cw, ch, 10);
        k.fill();
        k.save();
        rr(k, x, y, cw, ch, 10);
        k.clip();
        const g = k.createRadialGradient(cx, cy, 0, cx, cy, 115);
        g.addColorStop(0, "rgba(255,255,255,.34)");
        g.addColorStop(1, "rgba(255,255,255,0)");
        k.fillStyle = g;
        k.fillRect(x, y, cw, ch);
        k.restore();
        k.lineWidth = 1.5;
        k.strokeStyle = "rgba(255,255,255,.08)";
        rr(k, x + .75, y + .75, cw - 1.5, ch - 1.5, 10);
        k.stroke();
        const sg = k.createRadialGradient(cx, cy, 0, cx, cy, 120);
        sg.addColorStop(0, "rgba(255,122,82,1)");
        sg.addColorStop(1, "rgba(255,122,82,0)");
        k.lineWidth = 2;
        k.strokeStyle = sg;
        rr(k, x + 1, y + 1, cw - 2, ch - 2, 10);
        k.stroke();
        k.strokeStyle = "rgba(255,255,255,.75)";
        k.lineWidth = 2;
        k.beginPath();
        k.arc(x + 30, y + 32, 12, 0, 7);
        k.stroke();
        txt(k, LAB[i], x + 18, y + 72, `800 16px ${FONT}`, "rgba(255,255,255,.9)");
        bars(k, x + 18, y + 86, 110, 2, "rgba(255,255,255,.16)", 5, 10);
      }
      cursor(k, cx, cy);
    });
  };
  // @element 11
    function tee(k, x, y, s, col, back) {
    k.save();
    k.translate(x, y);
    k.scale(s, s);
    k.fillStyle = col;
    k.beginPath();
    k.moveTo(-.36, -.5);
    k.quadraticCurveTo(0, back ? -.44 : -.3, .36, -.5);
    [ [ .66, -.3 ], [ .52, -.08 ], [ .38, -.18 ], [ .38, .56 ], [ -.38, .56 ], [ -.38, -.18 ], [ -.52, -.08 ], [ -.66, -.3 ] ].forEach(([a, b]) => k.lineTo(a, b));
    k.closePath();
    k.fill();
    k.strokeStyle = "rgba(28,35,51,.18)";
    k.lineWidth = .025;
    k.beginPath();
    k.moveTo(-.36, -.5);
    k.quadraticCurveTo(0, back ? -.44 : -.3, .36, -.5);
    k.stroke();
    k.restore();
  }
  CELLS[10] = (k, w, h, u) => {
    u = snapU(u);
    frame(k);
    const CX = [ 44, 271 ], CY = 10, CWD = 196, IH = 112;
    const PRODS = [ [ MotionLocale.text("copy_153"), "¥3,980", "#FFFFFF", C.blueL, C.blue ], [ MotionLocale.text("copy_152"), "¥4,280", C.acc, C.accL, "#fff" ] ];
    const cur = t => path([ [ 0, 60, 200 ], [ .4, 150, 70 ], [ 1.6, 160, 80 ], [ 2, 370, 70 ], [ 3.3, 380, 82 ], [ 3.8, 470, 200 ], [ 4.7, 60, 200 ] ], t);
    view(k, () => {
      for (let i = 0; i < 2; i++) {
        const [nm, pr, col, bg, mark] = PRODS[i], x = CX[i];
        const inside = t => {
          const [a, b] = cur(t);
          return a > x && a < x + CWD && b > CY && b < CY + IH + 40;
        };
        const q = trans(inside, u, .3, eIOs);
        k.save();
        rr(k, x, CY, CWD, IH, 8);
        k.clip();
        k.fillStyle = bg;
        k.fillRect(x, CY, CWD, IH);
        k.globalAlpha = 1 - q;
        tee(k, x + CWD / 2, CY + IH / 2 + 4, 108, col, false);
        k.fillStyle = mark;
        k.beginPath();
        k.arc(x + CWD / 2 + 18, CY + IH / 2 - 16, 7, 0, 7);
        k.fill();
        k.globalAlpha = q;
        tee(k, x + CWD / 2, CY + IH / 2 + 4, 108, col, true);
        {
          const sx = x + CWD / 2, sy = CY + IH / 2 + 12;
          k.fillStyle = mark;
          k.beginPath();
          for (let j = 0; j < 10; j++) {
            const r = j % 2 ? 8 : 19, a = -Math.PI / 2 + j * Math.PI / 5;
            j ? k.lineTo(sx + Math.cos(a) * r, sy + Math.sin(a) * r) : k.moveTo(sx + Math.cos(a) * r, sy + Math.sin(a) * r);
          }
          k.closePath();
          k.fill();
        }
        k.globalAlpha = 1;
        k.restore();
        for (let j = 0; j < 2; j++) {
          k.fillStyle = (j ? q : 1 - q) > .5 ? C.ink : C.faint;
          k.beginPath();
          k.arc(x + CWD / 2 - 6 + j * 12, CY + IH - 10, 3, 0, 7);
          k.fill();
        }
        txt(k, nm, x + 4, CY + IH + 22, `800 14px ${FONT}`, C.ink);
        txt(k, pr, x + CWD - 4, CY + IH + 22, `800 14px ${EN}`, C.ink, "right");
        bars(k, x + 4, CY + IH + 32, 90, 1, C.faint, 5);
      }
      const [cx, cy] = cur(u);
      cursor(k, cx, cy);
    });
  };
  // @element 12
    CELLS[11] = (k, w, h, u) => {
    u = snapU(u);
    frame(k);
    const LINKS = [ MotionLocale.text("WORKS"), MotionLocale.text("ABOUT"), MotionLocale.text("CONTACT") ], F = `800 30px ${EN}`, GAP = 44, LY = 100, LH = 40;
    const cur = t => path([ [ 0, 110, 200 ], [ .4, 120, 92 ], [ 1.25, 140, 96 ], [ 1.5, 252, 92 ], [ 2.35, 268, 96 ], [ 2.6, 380, 92 ], [ 3.45, 400, 96 ], [ 3.9, 450, 200 ], [ 4.7, 110, 200 ] ], t);
    view(k, () => {
      k.fillStyle = "#FFF3EA";
      k.fillRect(0, 0, VW, VH);
      logo(k, 24, 28);
      txt(k, MotionLocale.text("MENU"), VW - 26, 28.5, `800 11px ${EN}`, C.sub, "right", "middle", "2px");
      k.font = F;
      k.letterSpacing = "1px";
      const ws = LINKS.map(s => k.measureText(MotionLocale.text(s)).width);
      k.letterSpacing = "0px";
      let x = (VW - ws.reduce((a, b) => a + b, 0) - GAP * (LINKS.length - 1)) / 2;
      LINKS.forEach((s, i) => {
        const x0 = x, x1 = x + ws[i], inside = t => {
          const [a, b] = cur(t);
          return a > x0 - 6 && a < x1 + 6 && b > LY - 30 && b < LY + 10;
        };
        const on = inside(u), tc = lastSwitch(inside, u);
        k.save();
        k.beginPath();
        k.rect(x0 - 4, LY - 31, ws[i] + 8, 39);
        k.clip();
        let cxp = x0;
        [ ...s ].forEach((ch, j) => {
          const f = tc === null ? on ? 1 : 0 : eIO(P(u, tc + .035 * j, tc + .035 * j + .36)), q = on ? f : 1 - f;
          k.font = F;
          k.letterSpacing = "1px";
          const cw = k.measureText(ch).width;
          k.letterSpacing = "0px";
          txt(k, ch, cxp, LY - LH * q, F, C.ink, "left", "alphabetic", "1px");
          txt(k, ch, cxp, LY + LH - LH * q, F, C.acc, "left", "alphabetic", "1px");
          cxp += cw;
        });
        k.restore();
        x += ws[i] + GAP;
      });
      bars(k, VW / 2 - 110, 132, 220, 1, "#F1D9C9", 6);
      const [cx, cy] = cur(u);
      cursor(k, cx, cy);
    });
  };
  // @element 13
    CELLS[12] = (k, w, h, u) => {
    u = snapU(u);
    frame(k);
    const NAMES = [ MotionLocale.text("copy_124"), MotionLocale.text("copy_121"), MotionLocale.text("copy_120"), MotionLocale.text("copy_122") ], RT = 6, RH = 39;
    const cur = t => path([ [ 0, 140, 200 ], [ .4, 150, 26 ], [ 1.15, 190, 28 ], [ 1.4, 205, 65 ], [ 2.15, 230, 67 ], [ 2.4, 245, 104 ], [ 3.15, 265, 106 ], [ 3.4, 280, 143 ], [ 3.9, 292, 144 ], [ 4.3, 150, 200 ], [ 4.7, 140, 200 ] ], t);
    const [cx, cy] = cur(u);
    view(k, () => {
      NAMES.forEach((s, i) => {
        const top = RT + i * RH, inside = t => {
          const [a, b] = cur(t);
          return b > top && b < top + RH && a > 20 && a < 490;
        };
        const q = trans(inside, u, .25);
        txt(k, "0" + (i + 1), 30, top + 25, `800 12px ${EN}`, C.sub);
        txt(k, s, 64 + 8 * q, top + 26, `800 17px ${FONT}`, mix(C.ink, C.acc, q));
        txt(k, "→", 476, top + 25, `700 15px ${EN}`, mix("#B7BFCC", C.acc, q), "right");
        k.fillStyle = C.rule;
        k.fillRect(24, top + RH, VW - 48, 1);
      });
      NAMES.forEach((s, i) => {
        const top = RT + i * RH, q = trans(t => {
          const [a, b] = cur(t);
          return b > top && b < top + RH && a > 20 && a < 490;
        }, u, .25);
        if (q <= 0) return;
        const iw = 132, ih = 84, px = cx + 26, py = clamp(cy - 46, 4, VH - ih - 4), sc = .85 + .15 * q;
        k.save();
        k.globalAlpha = q;
        k.translate(px + iw / 2, py + ih / 2);
        k.scale(sc, sc);
        k.shadowColor = "rgba(28,35,51,.25)";
        k.shadowBlur = 12;
        k.shadowOffsetY = 4;
        k.fillStyle = "#fff";
        rr(k, -iw / 2, -ih / 2, iw, ih, 6);
        k.fill();
        k.shadowColor = "transparent";
        pic(k, -iw / 2, -ih / 2, iw, ih, [ 0, 2, 1, 2 ][i], 6);
        k.restore();
      });
      cursor(k, cx, cy);
    });
  };
  // @element 14
    CELLS[13] = (k, w, h, u) => {
    u = snapU(u);
    frame(k);
    const TEXT = "hello@example.com", F = {
      x: 106,
      y: 58,
      w: 300,
      h: 46
    };
    const len = t => {
      t = mod(t, CYC);
      return t < 1 ? 0 : t < 3.2 ? Math.min(TEXT.length, Math.floor((t - 1) / .075)) : Math.max(0, TEXT.length - Math.floor((t - 3.2) / .03));
    };
    const focused = t => {
      t = mod(t, CYC);
      return t >= .65 && t < 3.95;
    };
    const q = trans(t => focused(t) || len(t) > 0, u, .24, eOut), fo = trans(focused, u, .15);
    const cur = t => path([ [ 0, 445, 205 ], [ .45, 262, 82 ], [ .85, 262, 82 ], [ 1.4, 452, 142 ], [ 3.5, 452, 142 ], [ 3.85, 470, 26 ], [ 4.05, 470, 26 ], [ 4.6, 445, 205 ], [ 4.7, 445, 205 ] ], t);
    const [cx, cy] = cur(u);
    view(k, () => {
      k.fillStyle = C.soft;
      k.fillRect(0, 0, VW, VH);
      k.save();
      k.shadowColor = "rgba(28,35,51,.1)";
      k.shadowBlur = 12;
      k.shadowOffsetY = 3;
      k.fillStyle = "#fff";
      rr(k, 80, 12, 352, 148, 12);
      k.fill();
      k.restore();
      txt(k, MotionLocale.text("copy_138"), F.x, 40, `800 15px ${FONT}`, C.ink);
      k.lineWidth = lerp(1.5, 2.2, fo);
      k.strokeStyle = mix("#C9D0DC", C.acc, fo);
      rr(k, F.x, F.y, F.w, F.h, 8);
      k.stroke();
      const s = TEXT.slice(0, len(u));
      txt(k, s, F.x + 14, F.y + 30, `600 15px ${EN}`, C.ink);
      if (focused(u) && (mod(u, .9) < .5 || u > 1 && u < 2.4)) {
        k.font = `600 15px ${EN}`;
        const xw = k.measureText(MotionLocale.text(s)).width;
        k.fillStyle = C.ink;
        k.fillRect(F.x + 14 + xw + 1, F.y + 14, 1.6, 20);
      }
      const fs = lerp(15, 11.5, q), ly = lerp(F.y + F.h / 2, F.y, q), lx = F.x + lerp(14, 10, q), LAB = MotionLocale.text("copy_139");
      k.font = `600 ${fs}px ${FONT}`;
      const lw = k.measureText(LAB).width;
      if (q > 0) {
        k.fillStyle = "#fff";
        k.fillRect(lx - 4, ly - 3, lw + 8, 6);
      }
      txt(k, LAB, lx, ly + .5, `600 ${fs}px ${FONT}`, mix("#8B94A6", C.acc, fo), "left", "middle");
      btn(k, F.x, 118, F.w, 30, MotionLocale.text("copy_043"), C.ink, "#fff", 12);
      click(k, cx, cy, u, [ .65, 3.95 ]);
    });
  };
  // @element 15
    CELLS[14] = (k, w, h, u) => {
    u = snapU(u);
    frame(k);
    const TEXT = "hana@example.com", F = {
      x: 106,
      y: 56,
      w: 300,
      h: 44
    };
    const len = t => {
      t = mod(t, CYC);
      return t < .75 ? 0 : t < 3.6 ? Math.min(TEXT.length, Math.floor((t - .75) / .115)) : Math.max(0, TEXT.length - Math.floor((t - 3.6) / .03));
    };
    const err = t => {
      const n = len(t);
      return mod(t, CYC) < 3.6 && n >= 2 && n < TEXT.length;
    };
    const ok = t => mod(t, CYC) < 3.6 && len(t) === TEXT.length;
    const focused = t => {
      t = mod(t, CYC);
      return t >= .45 && t < 4.2;
    };
    const qe = trans(err, u, .15), qo = trans(ok, u, .25), fo = trans(focused, u, .15);
    const cur = t => path([ [ 0, 445, 205 ], [ .3, 262, 80 ], [ .6, 262, 80 ], [ 1.1, 455, 146 ], [ 3.8, 455, 146 ], [ 4.1, 470, 26 ], [ 4.3, 470, 26 ], [ 4.65, 445, 205 ], [ 4.7, 445, 205 ] ], t);
    const [cx, cy] = cur(u);
    view(k, () => {
      txt(k, MotionLocale.text("copy_130"), F.x, 26, `800 15px ${FONT}`, C.ink);
      txt(k, MotionLocale.text("copy_139"), F.x, 47, `700 12px ${FONT}`, C.ink);
      k.fillStyle = mix("#FFFFFF", "#FFF1F1", qe);
      rr(k, F.x, F.y, F.w, F.h, 8);
      k.fill();
      const bc = mix(mix(mix("#C9D0DC", C.ink, fo), RED, qe), GREEN, qo);
      k.lineWidth = lerp(1.5, 2.2, Math.max(fo, qe, qo));
      k.strokeStyle = bc;
      rr(k, F.x, F.y, F.w, F.h, 8);
      k.stroke();
      const s = TEXT.slice(0, len(u));
      txt(k, s, F.x + 14, F.y + 28, `600 15px ${EN}`, C.ink);
      if (focused(u) && !ok(u) && (mod(u, .9) < .5 || u > .75 && u < 2.6)) {
        k.font = `600 15px ${EN}`;
        const xw = k.measureText(MotionLocale.text(s)).width;
        k.fillStyle = C.ink;
        k.fillRect(F.x + 14 + xw + 1, F.y + 12, 1.6, 20);
      }
      if (qe > 0) {
        k.save();
        k.globalAlpha = qe;
        k.fillStyle = RED;
        k.beginPath();
        k.arc(F.x + 7, F.y + F.h + 20, 7, 0, 7);
        k.fill();
        txt(k, "!", F.x + 7, F.y + F.h + 20.5, `800 11px ${EN}`, "#fff", "center", "middle");
        txt(k, MotionLocale.text("copy_140"), F.x + 20, F.y + F.h + 20.5, `700 13px ${FONT}`, RED, "left", "middle");
        k.restore();
      }
      if (qo > 0) {
        k.save();
        k.globalAlpha = qo;
        k.fillStyle = GREEN;
        k.beginPath();
        k.arc(F.x + F.w - 22, F.y + F.h / 2, 11 * eEl(qo), 0, 7);
        k.fill();
        check(k, F.x + F.w - 22, F.y + F.h / 2, 12, "#fff", 2.4);
        k.fillStyle = GREEN;
        k.beginPath();
        k.arc(F.x + 7, F.y + F.h + 20, 7, 0, 7);
        k.fill();
        check(k, F.x + 7, F.y + F.h + 20, 8, "#fff", 1.8);
        txt(k, MotionLocale.text("OK"), F.x + 20, F.y + F.h + 20.5, `800 13px ${EN}`, GREEN, "left", "middle");
        k.restore();
      }
      click(k, cx, cy, u, [ .45, 4.2 ]);
    });
  };
  // @element 16
    CELLS[15] = (k, w, h, u) => {
    u = snapU(u);
    frame(k);
    const CLK = .8, BY = 124, BHT = 36;
    const shr = eIO(P(u, CLK + .05, CLK + .35)), done = eOut(P(u, 2.25, 2.45)), grow = eIO(P(u, 2.45, 2.8)), fade = P(u, 3.9, 4.1), back = eOut(P(u, 4.1, 4.4));
    const bw = fade >= 1 ? 220 : grow > 0 ? lerp(BHT, 150, grow) : lerp(220, BHT, shr);
    const cur = t => path([ [ 0, 430, 205 ], [ .55, 290, 136 ], [ 1.1, 290, 136 ], [ 1.6, 440, 205 ], [ 4.7, 430, 205 ] ], t);
    const [cx, cy] = cur(u);
    view(k, () => {
      k.fillStyle = C.blueL;
      k.fillRect(0, 0, VW, VH);
      k.save();
      k.shadowColor = "rgba(28,35,51,.1)";
      k.shadowBlur = 12;
      k.shadowOffsetY = 3;
      k.fillStyle = "#fff";
      rr(k, 130, 10, 251, 150, 12);
      k.fill();
      k.restore();
      txt(k, MotionLocale.text("copy_052"), VW / 2, 36, `800 15px ${FONT}`, C.ink, "center");
      for (let i = 0; i < 2; i++) {
        k.strokeStyle = "#D5DBE6";
        k.lineWidth = 1.5;
        rr(k, 150, 50 + i * 32, 211, 24, 6);
        k.stroke();
        bars(k, 160, 59 + i * 32, i ? 90 : 120, 1, "#AEB6C5", 6);
      }
      const col = fade >= 1 ? "#FF5A2C" : mix("#FF5A2C", GREEN, done), ba = fade >= 1 ? back : 1 - fade;
      k.save();
      k.globalAlpha = ba;
      k.translate(0, fade >= 1 ? 6 * (1 - back) : 0);
      k.save();
      k.shadowColor = "rgba(28,35,51,.18)";
      k.shadowBlur = 8;
      k.shadowOffsetY = 3;
      k.fillStyle = col;
      rr(k, VW / 2 - bw / 2, BY, bw, BHT, BHT / 2);
      k.fill();
      k.restore();
      const idleA = fade >= 1 ? 1 : 1 - clamp(shr * 3);
      if (idleA > 0) {
        k.save();
        k.globalAlpha = idleA * ba;
        txt(k, MotionLocale.text("copy_137"), VW / 2, BY + BHT / 2 + .5, `800 14px ${FONT}`, "#fff", "center", "middle");
        k.restore();
      }
      if (u > CLK + .3 && u < 2.3) {
        k.save();
        k.globalAlpha = clamp((u - CLK - .3) / .1) * (1 - clamp((u - 2.2) / .08));
        k.lineCap = "round";
        k.lineWidth = 3;
        k.strokeStyle = "rgba(255,255,255,.35)";
        k.beginPath();
        k.arc(VW / 2, BY + BHT / 2, 10, 0, 7);
        k.stroke();
        const a = u / .7 * Math.PI * 2;
        k.strokeStyle = "#fff";
        k.beginPath();
        k.arc(VW / 2, BY + BHT / 2, 10, a, a + Math.PI * .7);
        k.stroke();
        k.restore();
      }
      if (u >= 2.25 && fade < 1) {
        k.save();
        const ox = lerp(0, -26, grow);
        check(k, VW / 2 + ox, BY + BHT / 2, 16, "#fff", 3, P(u, 2.25, 2.5));
        if (grow > .5) {
          k.globalAlpha = ba * P(grow, .5, 1);
          txt(k, MotionLocale.text("copy_042"), VW / 2 + 12, BY + BHT / 2 + .5, `800 14px ${FONT}`, "#fff", "center", "middle");
        }
        k.restore();
      }
      k.restore();
      click(k, cx, cy, u, [ CLK ]);
    });
  };
  // @element 17
    CELLS[16] = (k, w, h, u) => {
    u = snapU(u);
    const e = u < 2 ? eIO(P(u, .85, 1.45)) : 1 - eIO(P(u, 3.15, 3.75));
    frame(k, e > .5 ? "example.com/works/02" : "example.com/works");
    const G = [ 24, 184, 344 ], GY = 44, GW = 143, GH = 80, NM = [ MotionLocale.text("copy_119"), MotionLocale.text("copy_125"), MotionLocale.text("copy_123") ], PV = [ 0, 1, 2 ];
    const T = {
      x: 16,
      y: 10,
      w: VW - 32,
      h: 94
    };
    const cur = t => path([ [ 0, 420, 205 ], [ .5, 262, 88 ], [ .95, 262, 88 ], [ 1.6, 380, 150 ], [ 2.55, 380, 150 ], [ 2.9, 62, 30 ], [ 3.2, 62, 30 ], [ 3.9, 420, 205 ], [ 4.7, 420, 205 ] ], t);
    const [cx, cy] = cur(u);
    view(k, () => {
      const ga = 1 - clamp(e * 1.6);
      k.save();
      k.globalAlpha = ga;
      txt(k, MotionLocale.text("WORKS"), 24, 30, `800 15px ${EN}`, C.ink, "left", "alphabetic", "2px");
      for (let i = 0; i < 3; i++) {
        if (i !== 1) pic(k, G[i], GY, GW, GH, PV[i], 6);
        txt(k, NM[i], G[i], GY + GH + 20, `800 13px ${FONT}`, C.ink);
        bars(k, G[i], GY + GH + 30, 90, 1, C.faint, 5);
      }
      k.restore();
      const x = lerp(G[1], T.x, e), y = lerp(GY, T.y, e), ww = lerp(GW, T.w, e), hh = lerp(GH, T.h, e);
      pic(k, x, y, ww, hh, 1, lerp(6, 8, e));
      const da = clamp((e - .6) / .4);
      if (da > 0) {
        k.save();
        k.globalAlpha = da;
        k.fillStyle = "rgba(255,255,255,.92)";
        rr(k, 26, 19, 74, 22, 11);
        k.fill();
        txt(k, MotionLocale.text("copy_145"), 63, 30.5, `700 11px ${FONT}`, C.ink, "center", "middle");
        txt(k, MotionLocale.text("copy_125"), 24, 134, `800 19px ${FONT}`, C.ink);
        bars(k, 200, 122, 280, 3, C.faint, 6, 12, .7);
        k.restore();
      }
      click(k, cx, cy, u, [ .75, 3.05 ]);
    });
  };
  // @element 18
    CELLS[17] = (k, w, h, u) => {
    u = snapU(u);
    frame(k);
    const e = u < 2 ? eOut(P(u, .85, 1.3)) : 1 - eIO(P(u, 3.05, 3.4));
    const TX = [ 24, 142, 260, 378 ], TY = 72, TW = 108, THt = 72, PV = [ 2, 0, 1, 0 ];
    const B = {
      x: 125,
      y: 12,
      w: 261,
      h: 128
    };
    const cur = t => path([ [ 0, 430, 205 ], [ .5, 318, 110 ], [ .95, 318, 110 ], [ 1.6, 445, 120 ], [ 2.5, 445, 120 ], [ 2.85, 487, 19 ], [ 3.15, 487, 19 ], [ 3.8, 430, 205 ], [ 4.7, 430, 205 ] ], t);
    const [cx, cy] = cur(u);
    view(k, () => {
      header(k, 0);
      txt(k, MotionLocale.text("copy_154"), 24, 60, `800 15px ${FONT}`, C.ink);
      for (let i = 0; i < 4; i++) pic(k, TX[i], TY, TW, THt, PV[i], 6);
      bars(k, 24, 154, 300, 1, C.faint, 6);
      if (e > 0) {
        k.fillStyle = `rgba(14,18,28,${.82 * e})`;
        k.fillRect(0, 0, VW, VH);
        const x = lerp(TX[2], B.x, e), y = lerp(TY, B.y, e), ww = lerp(TW, B.w, e), hh = lerp(THt, B.h, e);
        pic(k, x, y, ww, hh, 1, 6);
        k.save();
        k.globalAlpha = clamp((e - .5) / .5);
        txt(k, "3 / 4", VW / 2, 156, `700 12px ${EN}`, "rgba(255,255,255,.85)", "center", "middle", "1px");
        k.strokeStyle = "#fff";
        k.lineWidth = 2.4;
        k.lineCap = "round";
        k.lineJoin = "round";
        k.beginPath();
        k.moveTo(481, 13);
        k.lineTo(493, 25);
        k.moveTo(493, 13);
        k.lineTo(481, 25);
        k.stroke();
        k.beginPath();
        k.moveTo(98, 66);
        k.lineTo(90, 76);
        k.lineTo(98, 86);
        k.stroke();
        k.beginPath();
        k.moveTo(413, 66);
        k.lineTo(421, 76);
        k.lineTo(413, 86);
        k.stroke();
        k.restore();
      }
      click(k, cx, cy, u, [ .75, 3 ]);
    });
  };
  // @element 19
    CELLS[18] = (k, w, h, u) => {
    u = snapU(u);
    frame(k);
    const D1 = [ 186, 52 ], D2 = [ 150, 122 ];
    const o1 = t => {
      t = mod(t, CYC);
      return t >= .9 && t < 2.4;
    }, o2 = t => {
      t = mod(t, CYC);
      return t >= 2.4 && t < 3.8;
    };
    const q1 = trans(o1, u, .25), q2 = trans(o2, u, .25);
    const cur = t => path([ [ 0, 280, 205 ], [ .6, D1[0], D1[1] ], [ 1.15, D1[0], D1[1] ], [ 2.05, D2[0], D2[1] ], [ 3.95, D2[0], D2[1] ], [ 4.45, 280, 205 ], [ 4.7, 280, 205 ] ], t);
    const [cx, cy] = cur(u);
    view(k, () => {
      k.fillStyle = "#EEF1F6";
      k.fillRect(0, 0, 300, VH);
      k.strokeStyle = C.ink;
      k.lineWidth = 6;
      k.lineCap = "round";
      k.beginPath();
      k.arc(150, 30, 16, Math.PI, 0);
      k.stroke();
      k.fillStyle = "#3B64E8";
      rr(k, 92, 26, 116, 134, 28);
      k.fill();
      k.fillStyle = "#2E50C2";
      rr(k, 108, 92, 84, 56, 14);
      k.fill();
      k.strokeStyle = "#FFD9C9";
      k.lineWidth = 2.5;
      k.beginPath();
      k.moveTo(116, 104);
      k.lineTo(184, 104);
      k.stroke();
      k.fillStyle = C.acc;
      rr(k, 140, 54, 20, 8, 4);
      k.fill();
      txt(k, MotionLocale.text("copy_149"), 322, 58, `800 16px ${FONT}`, C.ink);
      txt(k, "¥12,800", 322, 88, `800 19px ${EN}`, C.acc);
      bars(k, 322, 104, 160, 3);
      [ D1, D2 ].forEach(([x, y], i) => {
        for (let r = 0; r < 2; r++) {
          const f = mod(u / (CYC / 3) + r * .5, 1);
          k.strokeStyle = `rgba(255,255,255,${.75 * (1 - f)})`;
          k.lineWidth = 2;
          k.beginPath();
          k.arc(x, y, 8 + 12 * f, 0, 7);
          k.stroke();
        }
        k.save();
        k.shadowColor = "rgba(28,35,51,.3)";
        k.shadowBlur = 6;
        k.shadowOffsetY = 2;
        k.fillStyle = "#fff";
        k.beginPath();
        k.arc(x, y, 8, 0, 7);
        k.fill();
        k.restore();
        k.fillStyle = C.acc;
        k.beginPath();
        k.arc(x, y, 4, 0, 7);
        k.fill();
      });
      const tip = (x, y, q, title, left) => {
        if (q <= 0) return;
        k.save();
        k.globalAlpha = q;
        k.translate(x, y + 6 * (1 - q));
        const L = left ? 0 : 1;
        const bx = L ? 0 : -136;
        k.save();
        k.shadowColor = "rgba(28,35,51,.22)";
        k.shadowBlur = 12;
        k.shadowOffsetY = 4;
        k.fillStyle = "#fff";
        rr(k, bx, -24, 136, 48, 8);
        k.fill();
        k.beginPath();
        if (L) {
          k.moveTo(0, -6);
          k.lineTo(-8, 0);
          k.lineTo(0, 6);
        } else {
          k.moveTo(0, -6);
          k.lineTo(8, 0);
          k.lineTo(0, 6);
        }
        k.fill();
        k.restore();
        txt(k, title, bx + 12, -6, `800 13px ${FONT}`, C.ink);
        bars(k, bx + 12, 6, 100, 1, C.faint, 5);
        k.restore();
      };
      tip(D1[0] - 16, D1[1], q1, MotionLocale.text("copy_150"), true);
      tip(D2[0] + 16, D2[1], q2, MotionLocale.text("copy_151"), false);
      click(k, cx, cy, u, [ .9, 2.4, 3.8 ]);
    });
  };
  // @element 20
    CELLS[19] = (k, w, h, u) => {
    const tp = mod(Math.round(u * 1e6) / 1e6, LOOP);
    frame(k);
    const T0 = .4, START = 2 * 3600 + 15 * 60 + 4;
    const n = clamp(Math.floor(tp - T0) + 1, 0, 9), fp = n === 0 ? 1 : clamp((tp - T0 - (n - 1)) / .32);
    const dg = v => {
      const hh = Math.floor(v / 3600), mm = Math.floor(v / 60) % 60, ss = v % 60;
      return [ hh, mm, ss ].map(x => String(x).padStart(2, "0")).join("");
    };
    const now = dg(START - n), was = dg(START - Math.max(0, n - 1));
    const TW = 34, TH = 50, TY = 50, GW = 2 * TW + 4, SEP = 30, X0 = (VW - (3 * GW + 2 * SEP)) / 2;
    const tile = (x, d, clipHalf) => {
      k.save();
      k.beginPath();
      if (clipHalf === 0) k.rect(x, TY, TW, TH / 2); else if (clipHalf === 1) k.rect(x, TY + TH / 2, TW, TH / 2); else k.rect(x, TY, TW, TH);
      k.clip();
      k.fillStyle = C.ink;
      rr(k, x, TY, TW, TH, 6);
      k.fill();
      txt(k, String(d), x + TW / 2, TY + TH / 2 + 1.5, `800 32px ${EN}`, "#fff", "center", "middle");
      k.restore();
    };
    const flip = (x, a, b, f) => {
      k.fillStyle = C.ink;
      rr(k, x, TY, TW, TH, 6);
      k.fill();
      k.save();
      rr(k, x, TY, TW, TH, 6);
      k.clip();
      const o = eIO(clamp(f)) * TH;
      txt(k, String(a), x + TW / 2, TY + TH / 2 + 1.5 - o, `800 32px ${EN}`, "#fff", "center", "middle");
      txt(k, String(b), x + TW / 2, TY + TH / 2 + 1.5 + TH - o, `800 32px ${EN}`, "#fff", "center", "middle");
      k.restore();
    };
    view(k, () => {
      const g = k.createLinearGradient(0, 0, VW, VH);
      g.addColorStop(0, "#FF6A3D");
      g.addColorStop(1, "#FF4A2C");
      k.fillStyle = g;
      k.fillRect(0, 0, VW, VH);
      txt(k, MotionLocale.text("copy_160"), VW / 2, 34, `800 15px ${FONT}`, "#fff", "center");
      [ MotionLocale.text("copy_164"), MotionLocale.text("copy_165"), MotionLocale.text("copy_166") ].forEach((lab, gi) => {
        const x = X0 + gi * (GW + SEP);
        for (let j = 0; j < 2; j++) {
          const p = gi * 2 + j, xx = x + j * (TW + 4);
          if (was[p] !== now[p]) flip(xx, was[p], now[p], fp); else tile(xx, now[p], 2);
        }
        txt(k, lab, x + GW / 2, TY + TH + 16, `700 11px ${FONT}`, "rgba(255,255,255,.9)", "center", "middle");
        if (gi < 2) txt(k, ":", x + GW + SEP / 2, TY + TH / 2, `800 26px ${EN}`, "#fff", "center", "middle");
      });
      btn(k, VW / 2 - 75, 132, 150, 28, MotionLocale.text("copy_133"), "#fff", C.acc, 12);
    });
  };
  // @element 21
    CELLS[20] = (k, w, h, u) => {
    u = snapU(u);
    frame(k);
    const a = 2 * Math.PI * u / CYC;
    const wave = (base, A1, L1, p1, A2, L2, p2) => {
      k.beginPath();
      k.moveTo(0, VH + 1);
      for (let x = 0; x <= VW + 4; x += 4) k.lineTo(x, base + A1 * Math.sin(2 * Math.PI * x / L1 + p1) + A2 * Math.sin(2 * Math.PI * x / L2 + p2));
      k.lineTo(VW, VH + 1);
      k.closePath();
    };
    view(k, () => {
      const g = k.createLinearGradient(0, 0, 0, 120);
      g.addColorStop(0, "#3B64E8");
      g.addColorStop(1, "#8FA9F7");
      k.fillStyle = g;
      k.fillRect(0, 0, VW, VH);
      k.fillStyle = "rgba(255,255,255,.9)";
      k.beginPath();
      k.arc(430, 44, 22, 0, 7);
      k.fill();
      txt(k, MotionLocale.text("copy_162"), 34, 42, `800 22px ${FONT}`, "#fff");
      btn(k, 34, 56, 96, 24, MotionLocale.text("copy_136"), "#fff", C.blue, 11);
      k.fillStyle = "rgba(255,255,255,.45)";
      wave(100, 8, 260, a + 1, 4, 130, -2 * a);
      k.fill();
      k.fillStyle = "#fff";
      wave(110, 9, 300, -a, 3.5, 110, 2 * a + .5);
      k.fill();
      txt(k, MotionLocale.text("copy_126"), 34, 146, `800 15px ${FONT}`, C.ink);
      bars(k, 170, 140, 290, 1, C.faint, 6);
      bars(k, 34, 156, 200, 1, C.faint, 5);
    });
  };
  // @element 22
    CELLS[21] = (k, w, h, u) => {
    u = snapU(u);
    frame(k);
    const ON = .9, OFF = 3.3, HX = 266, HY = 118;
    const liked = u >= ON && u < OFF, d = u - ON, d2 = u - OFF;
    let sc = 1;
    if (d >= 0 && d < 1.2) sc = d < .12 ? lerp(.78, 1.45, eOut(d / .12)) : 1 + .45 * Math.exp(-7 * (d - .12)) * Math.cos((d - .12) * 15); else if (d < 0 && d > -.1) sc = 1 - .22 * (1 + d / .1);
    if (d2 >= -.1 && d2 < .3) sc = 1 - .16 * Math.sin(Math.PI * clamp((d2 + .1) / .4));
    const cur = t => path([ [ 0, 430, 205 ], [ .5, 276, 130 ], [ 1.25, 276, 130 ], [ 1.8, 430, 160 ], [ 2.75, 430, 160 ], [ 3.1, 276, 130 ], [ 3.55, 276, 130 ], [ 4.1, 430, 205 ], [ 4.7, 430, 205 ] ], t);
    const [cx, cy] = cur(u);
    view(k, () => {
      k.fillStyle = C.soft;
      k.fillRect(0, 0, VW, VH);
      k.fillStyle = "#fff";
      rr(k, 16, 12, 479, 144, 12);
      k.fill();
      pic(k, 28, 24, 200, 120, 1, 8);
      k.fillStyle = C.blueL;
      k.beginPath();
      k.arc(258, 40, 11, 0, 7);
      k.fill();
      txt(k, "sample_trip", 276, 44.5, `700 13px ${EN}`, C.ink);
      bars(k, 248, 62, 220, 2, C.faint, 6, 12, .7);
      if (d >= .08 && d < .6) {
        const f = (d - .08) / .5;
        k.strokeStyle = `rgba(242,61,92,${.5 * (1 - f)})`;
        k.lineWidth = 2;
        k.beginPath();
        k.arc(HX, HY, 15 + 18 * eOut(f), 0, 7);
        k.stroke();
        for (let i = 0; i < 6; i++) {
          const an = -Math.PI / 2 + i * Math.PI / 3, r = 24 + 13 * eOut(f);
          k.fillStyle = [ HEART, "#FFB020", C.acc ][i % 3];
          k.globalAlpha = 1 - f;
          k.beginPath();
          k.arc(HX + Math.cos(an) * r, HY + Math.sin(an) * r, 2.4 * (1 - .5 * f), 0, 7);
          k.fill();
        }
        k.globalAlpha = 1;
      }
      k.save();
      k.translate(HX, HY + 2);
      k.scale(sc, sc);
      heartPath(k, 14.5);
      if (liked) {
        k.fillStyle = HEART;
        k.fill();
      } else {
        k.lineWidth = 2.4;
        k.strokeStyle = C.ink;
        k.lineJoin = "round";
        k.stroke();
      }
      k.restore();
      const nf = liked ? eOut(P(d, .05, .35)) : eOut(P(d2, .05, .35)), up = liked;
      k.save();
      k.beginPath();
      k.rect(292, HY - 13, 60, 26);
      k.clip();
      const A = up ? "128" : "129", Bn = up ? "129" : "128", dir = up ? -1 : 1, sh = 26 * nf * dir;
      const fA = `800 18px ${EN}`;
      if (u < ON || d2 >= 0 && nf >= 1 || liked && nf >= 1) txt(k, liked ? "129" : "128", 294, HY + 1, fA, liked ? HEART : C.ink, "left", "middle"); else {
        txt(k, A, 294, HY + 1 + sh, fA, up ? C.ink : HEART, "left", "middle");
        txt(k, Bn, 294, HY + 1 + sh - 26 * dir, fA, up ? HEART : C.ink, "left", "middle");
      }
      k.restore();
      click(k, cx, cy, u, [ ON, OFF ]);
    });
  };
  // @element 23
    CELLS[22] = (k, w, h, u) => {
    u = snapU(u);
    frame(k);
    const T = CYC / 3, f = mod(u, T) / T;
    view(k, () => {
      k.fillStyle = "#FFF4EA";
      k.fillRect(0, 0, VW, VH);
      txt(k, MotionLocale.text("copy_107"), 40, 40, `800 22px ${FONT}`, C.ink);
      txt(k, MotionLocale.text("copy_112"), 40, 70, `800 22px ${FONT}`, C.ink);
      bars(k, 40, 84, 170, 2, "#EAD9CB");
      pic(k, 286, 10, 200, 92, 1, 10);
      const mx = VW / 2;
      txt(k, MotionLocale.text("SCROLL"), mx, 116, `800 11px ${EN}`, C.ink, "center", "middle", "3px");
      k.strokeStyle = C.ink;
      k.lineWidth = 2.2;
      rr(k, mx - 12, 126, 24, 38, 12);
      k.stroke();
      const dy = eIOs(clamp(f / .7)) * 14, da = 1 - clamp((f - .45) / .3);
      k.fillStyle = `rgba(255,90,44,${da})`;
      rr(k, mx - 2.5, 133 + dy, 5, 9, 2.5);
      k.fill();
      [ mx - 40, mx + 40 ].forEach(x => {
        for (let j = 0; j < 2; j++) {
          const ff = mod(f + j * .5, 1), yy = 128 + ff * 24, al = Math.sin(Math.PI * ff);
          k.strokeStyle = `rgba(28,35,51,${.8 * al})`;
          k.lineWidth = 2.5;
          k.lineCap = "round";
          k.lineJoin = "round";
          k.beginPath();
          k.moveTo(x - 8, yy);
          k.lineTo(x, yy + 8);
          k.lineTo(x + 8, yy);
          k.stroke();
        }
      });
    });
  };
  // @element 24
    function cloud(k, x, y, s, a) {
    k.fillStyle = `rgba(255,255,255,${a})`;
    k.beginPath();
    k.ellipse(x, y, 30 * s, 10 * s, 0, 0, 7);
    k.ellipse(x - 12 * s, y - 6 * s, 14 * s, 11 * s, 0, 0, 7);
    k.ellipse(x + 8 * s, y - 10 * s, 17 * s, 14 * s, 0, 0, 7);
    k.fill();
  }
  CELLS[23] = (k, w, h, u) => {
    u = snapU(u);
    frame(k);
    const f = u / CYC;
    view(k, () => {
      const g = k.createLinearGradient(0, 0, 0, 120);
      g.addColorStop(0, "#7C9EF4");
      g.addColorStop(1, "#DCE5FF");
      k.fillStyle = g;
      k.fillRect(0, 0, VW, VH);
      k.fillStyle = "rgba(255,240,230,.95)";
      k.beginPath();
      k.arc(400, 66, 20, 0, 7);
      k.fill();
      for (let x = -170; x < VW + 170; x += 170) {
        const xx = x + mod(f * 170, 170);
        cloud(k, xx + 40, 30, .7, .75);
        cloud(k, xx + 120, 58, .55, .6);
      }
      for (let x = -340; x < VW + 340; x += 340) {
        const xx = x + mod(f * 340, 340);
        cloud(k, xx + 90, 44, 1.15, .95);
        cloud(k, xx + 260, 86, .9, .9);
      }
      mount(k, VW, 132, [ [ 0, .78 ], [ .18, .66 ], [ .36, .76 ], [ .6, .62 ], [ .82, .74 ], [ 1, .68 ] ], "#6E8CEB", 0);
      const sea = (y0, A, L, ph, col) => {
        k.fillStyle = col;
        k.beginPath();
        k.moveTo(0, VH + 1);
        for (let x = 0; x <= VW + 4; x += 4) k.lineTo(x, y0 + A * Math.sin(2 * Math.PI * x / L + ph));
        k.lineTo(VW, VH + 1);
        k.closePath();
        k.fill();
      };
      sea(118, 2.5, 90, -2 * Math.PI * f, "#4B6BDB");
      sea(130, 3, 60, 2 * Math.PI * f * 2, "#3B5CCF");
      sea(146, 2.5, 120, -2 * Math.PI * f, "#2E4DB8");
      k.fillStyle = "rgba(28,35,51,.12)";
      k.fillRect(0, 0, VW, VH);
      {
        const sg = k.createLinearGradient(0, 0, 300, 0);
        sg.addColorStop(0, "rgba(20,28,64,.45)");
        sg.addColorStop(1, "rgba(20,28,64,0)");
        k.fillStyle = sg;
        k.fillRect(0, 0, 300, VH);
      }
      k.save();
      k.shadowColor = "rgba(16,24,60,.55)";
      k.shadowBlur = 10;
      k.shadowOffsetY = 2;
      txt(k, MotionLocale.text("copy_110"), 34, 60, `800 28px ${FONT}`, "#fff", "left", "alphabetic", "1px");
      k.restore();
      bars(k, 34, 74, 160, 1, "rgba(255,255,255,.85)");
      btn(k, 34, 92, 96, 26, MotionLocale.text("copy_134"));
      k.fillStyle = "rgba(14,18,28,.5)";
      rr(k, 420, 134, 76, 24, 12);
      k.fill();
      k.fillStyle = "#fff";
      k.fillRect(435, 140, 3.5, 12);
      k.fillRect(442, 140, 3.5, 12);
      k.beginPath();
      k.moveTo(462, 143);
      k.lineTo(466, 143);
      k.lineTo(471, 139);
      k.lineTo(471, 153);
      k.lineTo(466, 149);
      k.lineTo(462, 149);
      k.closePath();
      k.fill();
      k.strokeStyle = "#fff";
      k.lineWidth = 1.6;
      k.lineCap = "round";
      k.beginPath();
      k.moveTo(476, 143);
      k.lineTo(482, 149);
      k.moveTo(482, 143);
      k.lineTo(476, 149);
      k.stroke();
    });
  };
  // @end
    return {
    width: CW,
    height: CH,
    cycle: LOOP,
    cells: CELLS,
    fonts: []
  };
});
