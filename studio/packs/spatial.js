/* Motion Prompt · spatial · yipoo original extensions · MIT License */
MotionPrompt.pack('spatial', function () {
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
  // @element 01
  CELLS[0] = scene('PERSPECTIVE FLIP', '透视翻卡', a => {
    const theta = a, corners = [[-76,-53,0],[76,-53,0],[76,53,0],[-76,53,0]].map(p => project(...rotate(p,theta)));
    ellipse(269.5, 177, 72 * Math.abs(Math.cos(a)) + 12, 6, '#080e1c', true);
    poly(corners, Math.cos(a) >= 0 ? C.blue : C.coral, C.ink);
    const s = Math.abs(Math.cos(a)); X.save(); X.translate(269.5,109); X.scale(Math.max(.001,s),1); text(Math.cos(a)>=0?'FRONT':'BACK',Math.cos(a)>=0?'正面':'背面',0,0,24,C.bg,'center'); X.restore();
  });
  // @element 02
  CELLS[1] = scene('COVERFLOW', '封面流', a => {
    const cards = []; for (let i=0;i<7;i++) { const q=a+i*TAU/7; cards.push({ x:Math.sin(q)*190,z:Math.cos(q)*105,q,i }); }
    cards.sort((a,b)=>b.z-a.z).forEach(c=>{ const p=project(c.x,7,c.z); const w=(35+34*Math.abs(Math.sin(c.q)))*p[2]; miniCard(p[0],p[1],w,91*p[2],[C.blue,C.mint,C.coral,C.gold][c.i%4],c.i+1); });
    line([[84,179],[455,179]],C.grid);
  });
  // @element 03
  CELLS[2] = scene('SOLID CUBE', '实体立方体', a => {
    const vs=[[-53,-53,-53],[53,-53,-53],[53,53,-53],[-53,53,-53],[-53,-53,53],[53,-53,53],[53,53,53],[-53,53,53]].map(p=>rotate(p,a,.35));
    const faces=[[0,1,2,3],[4,7,6,5],[0,4,5,1],[3,2,6,7],[1,5,6,2],[0,3,7,4]];
    faces.map((f,i)=>({f,i,z:f.reduce((s,j)=>s+vs[j][2],0)/4})).sort((a,b)=>b.z-a.z).forEach(({f,i})=>poly(f.map(j=>project(...vs[j])),[C.blue,C.mint,C.coral,C.gold,'#5268b0','#529f9c'][i],C.bg));
    ellipse(269.5,186,77,6,'#080e1c',true);
  });
  // @element 04
  CELLS[3] = scene('ISOMETRIC LAYERS', '等距分层', a => {
    const spread=10+10*(1-Math.cos(a));
    for(let i=0;i<5;i++){const y=158-i*spread, col=[C.blue,C.mint,C.coral,C.gold,C.ink][i]; const top=[[180,y],[269,y-35],[359,y],[269,y+35]];poly([[180,y],[269,y+35],[359,y],[359,y+7],[269,y+42],[180,y+7]],'#263b62');poly(top,col,C.bg); }
    line([[269,38],[269,185]],'#ffffff22');
  });
  // @element 05
  CELLS[4] = scene('DEPTH TUNNEL', '纵深隧道', a => {
    for(let i=0;i<14;i++){const q=((i/14+a/TAU)%1), s=.08+q*q*2.5, alpha=Math.sin(Math.PI*q);X.save();X.globalAlpha=alpha;line([[269-110*s,109-54*s],[269+110*s,109-54*s],[269+110*s,109+54*s],[269-110*s,109+54*s]],i%2?C.blue:C.mint,1.5,true);X.restore();}
    line([[0,0],[269,109],[539,208]],C.grid);line([[539,0],[269,109],[0,208]],C.grid);glow(269,109,3,C.ink);
  });
  // @element 06
  CELLS[5] = scene('DEPTH PARALLAX', '纵深视差', a => {
    dot(419+8*Math.sin(a),62,20,C.gold);
    [{y:113,amp:8,c:'#263d66',step:100},{y:143,amp:23,c:'#3b5e91',step:80},{y:179,amp:50,c:C.blue,step:64}].forEach((l,j)=>{const pts=[[-60,208]];for(let x=-100;x<660;x+=l.step)pts.push([x+l.amp*Math.sin(a),l.y-22*(1+Math.sin(x*.047+j))]);pts.push([660,208]);poly(pts,l.c);});
    for(let i=0;i<5;i++){const x=70+i*110+65*Math.sin(a);line([[x,174],[x,208]],C.bg,6);dot(x,170,12,C.mint);}
  });
  // @element 07
  CELLS[6] = scene('ORBITAL CARDS', '轨道卡片', a => {
    ellipse(269,110,184,51,C.grid); const cards=[];for(let i=0;i<6;i++){const q=a+i*TAU/6;cards.push({q,i,z:Math.sin(q)*90});}cards.sort((a,b)=>b.z-a.z).forEach(c=>{const scale=1-c.z/260;miniCard(269+Math.cos(c.q)*172,110-c.z*.37,52*scale,62*scale,[C.blue,C.mint,C.coral][c.i%3],c.i+1);});
    glow(269,110,10,C.gold);
  });
  // @element 08
  CELLS[7] = scene('THICK ACCORDION', '厚度折叠', a => {
    const theta=.18+.95*(.5-.5*Math.cos(a)), dx=59*Math.cos(theta), dy=45*Math.sin(theta), start=269-3*dx;
    for(let i=0;i<6;i++){const x=start+i*dx,y=95+(i%2?dy:0),y2=95+(i%2?0:dy);poly([[x,y],[x+dx,y2],[x+dx,y2+67],[x,y+67]],i%2?C.blue:C.mint,C.bg);poly([[x,y+67],[x+dx,y2+67],[x+dx,y2+73],[x,y+73]],'#31405e');}
  });
  // @element 09
  CELLS[8] = scene('ROTATING GLOBE', '旋转地球', a => {
    const r=71,cx=269,cy=113;dot(cx,cy,r,'#19365c');
    for(let lat=-2;lat<=2;lat++){const y=lat*22;ellipse(cx,cy+y,Math.sqrt(r*r-y*y),Math.sqrt(r*r-y*y)*.16,C.grid);}
    for(let j=0;j<12;j++){const q=a+j*TAU/12,pts=[];for(let i=0;i<=48;i++){const v=-Math.PI/2+i*Math.PI/48;const x=r*Math.cos(v)*Math.sin(q),z=Math.cos(v)*Math.cos(q);pts.push([cx+x,cy+r*Math.sin(v)]);if(i&&z>=0)line(pts.slice(-2),C.mint,1.2);}}
    for(let i=0;i<24;i++){const lon=a+i*2.39996,lat=Math.asin(-.9+1.8*i/23),z=Math.cos(lat)*Math.cos(lon);if(z>0)dot(cx+r*Math.cos(lat)*Math.sin(lon),cy+r*Math.sin(lat),2+z,C.gold);}
    ellipse(cx,cy,r,r,C.blue);
  });
  // @element 10
  CELLS[9] = scene('ELASTIC ROPE', '弹性绳索', a => {
    const pts=[];for(let i=0;i<=100;i++){const p=i/100;pts.push([80+379*p,61+70*Math.sin(Math.PI*p)+22*Math.sin(TAU*2*p-a)*Math.sin(Math.PI*p)]);}
    line(pts,C.mint,4);dot(80,61,6,C.ink);dot(459,61,6,C.ink);const p=pts[50];glow(p[0],p[1],14,C.coral);line([[80,45],[80,76]],C.grid,4);line([[459,45],[459,76]],C.grid,4);
  });
  // @element 11
  CELLS[10] = scene('PENDULUM', '单摆', a => {
    const angle=.7*Math.sin(a),x=269+118*Math.sin(angle),y=49+118*Math.cos(angle);floor(188);ellipse(269+(x-269)*.65,188,22,4,'#080e1c',true);line([[269,49],[x,y]],C.ink,2);dot(269,49,6,C.muted);glow(x,y,20,C.gold);line([[235,42],[303,42]],C.grid,5);
  });
  // @element 12
  CELLS[11] = scene('NEWTON CRADLE', '牛顿摆', a => {
    line([[165,44],[374,44]],C.muted,5);const left=Math.max(0,Math.sin(a)),right=Math.max(0,-Math.sin(a));
    for(let i=0;i<5;i++){const angle=i===0?-.72*left:i===4?.72*right:0,x=201+i*34+105*Math.sin(angle),y=44+105*Math.cos(angle);line([[201+i*34,44],[x,y]],C.muted,1.5);dot(x,y,17,[C.coral,C.blue,C.mint,C.blue,C.gold][i]);dot(x-5,y-6,4,'#ffffff66');}
    floor(180);
  });
  // @element 13
  CELLS[12] = scene('GRAVITY BOUNCE', '重力弹跳', a => {
    const p=(a/TAU*2)%1,y=164-123*4*p*(1-p),s=1-.22*Math.pow(Math.abs(2*p-1),18);floor(181);ellipse(269,181,24-11*4*p*(1-p),4,'#080e1c',true);X.save();X.translate(269,y);X.scale(1/s,s);glow(0,0,17,C.coral);X.restore();line([[328,42],[328,164]],C.grid);text('g = 8h/T²','g = 8h/T²',346,102,12);
  });
  // @element 14
  CELLS[13] = scene('COUPLED SPRINGS', '耦合弹簧', a => {
    const x1=205+24*Math.sin(a),x2=334-24*Math.sin(a);floor(161);line([[86,86],[86,159]],C.muted,5);line([[453,86],[453,159]],C.muted,5);spring(86,125,x1-21,125);spring(x1+21,125,x2-21,125,9,C.gold);spring(x2+21,125,453,125);rect(x1-21,104,42,42,9,C.blue);rect(x2-21,104,42,42,9,C.coral);dot(x1-12,153,5,C.muted);dot(x1+12,153,5,C.muted);dot(x2-12,153,5,C.muted);dot(x2+12,153,5,C.muted);
  });
  // @element 15
  CELLS[14] = scene('CLOTH WAVE', '布料波动', a => {
    const p=(i,j)=>[117+i*15+9*Math.sin(a+j*.45)*j/8,49+j*16+13*Math.sin(i*.45-a)*j/8];
    for(let j=0;j<8;j++)for(let i=0;i<20;i++)poly([p(i,j),p(i+1,j),p(i+1,j+1),p(i,j+1)],(i+j)%2?'#315d86':'#3f7395');
    for(let j=0;j<=8;j++)line(Array.from({length:21},(_,i)=>p(i,j)),'#79e6c755',1);for(let i=0;i<=20;i+=2)line(Array.from({length:9},(_,j)=>p(i,j)),'#79e6c755',1);line([p(0,0),p(20,0)],C.ink,3);[0,5,10,15,20].forEach(i=>dot(...p(i,0),3,C.gold));
  });
  // @element 16
  CELLS[15] = scene('ELASTIC COLLISION', '弹性碰撞', a => {
    const gap=44+126*(.5+.5*Math.cos(a)),x1=269-gap/2,x2=269+gap/2;floor(153);dot(x1,126,22,C.blue);dot(x2,126,22,C.coral);line([[x1-7,126],[x1+7,126]],C.ink,2);line([[x2-7,126],[x2+7,126]],C.ink,2);const impact=Math.pow(Math.max(0,-Math.cos(a)),30);X.save();X.globalAlpha=impact;for(let i=0;i<8;i++){const q=i*TAU/8;line([[269+Math.cos(q)*28,126+Math.sin(q)*28],[269+Math.cos(q)*42,126+Math.sin(q)*42]],C.gold,2);}X.restore();
    text('Approach · contact · rebound','靠近 · 接触 · 回弹',269,183,12,C.muted,'center');
  });
  // @element 17
  CELLS[16] = scene('PARTICLE ATTRACTOR', '粒子吸引', a => {
    const contraction=.5-.5*Math.cos(a);for(let i=0;i<100;i++){const q=i*2.39996+a, r=(24+Math.sqrt(i/99)*177)*(1-.83*contraction);const x=269+Math.cos(q)*r,y=113+Math.sin(q)*r*.4;dot(x,y,1.5+i%3*.5,i%3?C.blue:C.mint);}glow(269,113,8+4*contraction,C.gold);ellipse(269,113,194,78,C.grid);
  });
  // @element 18
  CELLS[17] = scene('PARTICLE EXPLOSION', '粒子散开', a => {
    const p=.5-.5*Math.cos(a);for(let j=0;j<7;j++)for(let i=0;i<13;i++){const bx=(i-6)*9,by=(j-3)*9,q=Math.atan2(by,bx),d=35+(i*17+j*23)%100,x=269+bx+Math.cos(q)*d*p,y=115+by+Math.sin(q)*d*p*.47;rect(x-2,y-2,4,4,1,[C.blue,C.coral,C.gold,C.mint][(i+j)%4]);}text('Scatter → reassemble','散开 → 重组',269,185,12,C.muted,'center');
  });
  // @element 19
  CELLS[18] = scene('PARTICLE SHAPE MORPH', '粒子形状变换', a => {
    const p=.5-.5*Math.cos(a);for(let i=0;i<120;i++){const q=i*TAU/120,cx=68*Math.cos(q),cy=68*Math.sin(q),hx=5*16*Math.pow(Math.sin(q),3),hy=-5*(13*Math.cos(q)-5*Math.cos(2*q)-2*Math.cos(3*q)-Math.cos(4*q));glow(269+mix(cx,hx,p),112+mix(cy,hy,p),2,i%3?C.coral:C.gold);}text('CIRCLE ↔ HEART','圆形 ↔ 爱心',269,190,12,C.muted,'center');
  });
  // @element 20
  CELLS[19] = scene('COMET TRAIL', '彗星轨迹', a => {
    const point=q=>[269+183*Math.cos(q),113+61*Math.sin(q)];ellipse(269,113,183,61,C.grid);for(let i=42;i>=0;i--){const p=point(a-i*.035);X.save();X.globalAlpha=Math.pow(1-i/43,2);dot(p[0],p[1],1+6*(1-i/43),i<9?C.ink:C.blue);X.restore();}const p=point(a);glow(p[0],p[1],7,C.ink);dot(269,113,15,C.gold);
  });
  // @element 21
  CELLS[20] = scene('MAGNETIC FIELD', '磁场流线', a => {
    for(let side of [-1,1])for(let j=0;j<5;j++){const h=27+j*13,pts=[];for(let n=0;n<=80;n++){const p=n/80;pts.push([213+112*p,112+side*h*Math.sin(Math.PI*p)]);}line(pts,C.grid,1.2);for(let k=0;k<3;k++){const p=(a/TAU+k/3+j*.06)%1;dot(213+112*p,112+side*h*Math.sin(Math.PI*p),2.7,C.mint);}}
    rect(184,98,57,28,5,C.coral);rect(298,98,57,28,5,C.blue);text('N','N',211,112,14,C.bg,'center');text('S','S',326,112,14,C.bg,'center');
  });
  // @element 22
  CELLS[21] = scene('FIREWORK BURSTS', '烟花绽放', a => {
    for(let b=0;b<3;b++){const p=(a/TAU+b/3)%1,cx=151+b*119,cy=79+(b%2)*18,col=[C.coral,C.gold,C.mint][b];if(p<.22){const v=p/.22;X.save();X.globalAlpha=clamp(v*8);glow(cx,196-(196-cy)*v,3,col);line([[cx,196-(196-cy)*v],[cx,208-(196-cy)*v]],col,2);X.restore();}else{const q=(p-.22)/.78;for(let i=0;i<32;i++){const theta=i*TAU/32,r=(47+i%4*5)*q,x=cx+Math.cos(theta)*r,y=cy+Math.sin(theta)*r+55*q*q;X.save();X.globalAlpha=Math.pow(1-q,1.4);line([[x-Math.cos(theta)*6,y-Math.sin(theta)*6],[x,y]],col,1.7);dot(x,y,2,col);X.restore();}}}
  });
  // @element 23
  CELLS[22] = scene('LIQUID MERGE', '液滴融合', a => {
    const d=25+75*(.5+.5*Math.cos(a)),cy=113;X.save();X.shadowColor=C.mint;X.shadowBlur=17;if(d<72){const k=1-d/72;X.beginPath();X.moveTo(269-d/2,cy-11*k);X.bezierCurveTo(250,cy-26*k,288,cy-26*k,269+d/2,cy-11*k);X.lineTo(269+d/2,cy+11*k);X.bezierCurveTo(288,cy+26*k,250,cy+26*k,269-d/2,cy+11*k);X.closePath();X.fillStyle=C.mint;X.fill();}dot(269-d/2,cy,27,C.mint);dot(269+d/2,cy,27,C.mint);X.restore();ellipse(269-d/2-8,cy-10,7,4,'#ffffff99',true);ellipse(269+d/2-8,cy-10,7,4,'#ffffff99',true);text('Surface tension','表面张力',269,179,12,C.muted,'center');
  });
  // @element 24
  CELLS[23] = scene('ORBITAL PARTICLES', '轨道粒子', a => {
    const particles=[];for(let j=0;j<3;j++){const r=j*Math.PI/3;const path=[];for(let i=0;i<=100;i++){const q=i*TAU/100,x=108*Math.cos(q),y=27*Math.sin(q);path.push([269+x*Math.cos(r)-y*Math.sin(r),113+x*Math.sin(r)+y*Math.cos(r)]);}line(path,C.grid,1.4);for(let k=0;k<4;k++){const q=a+j*.7+k*TAU/4,x=108*Math.cos(q),y=27*Math.sin(q);particles.push({x:269+x*Math.cos(r)-y*Math.sin(r),y:113+x*Math.sin(r)+y*Math.cos(r),z:Math.sin(q),c:[C.blue,C.mint,C.coral][j]});}}
    particles.filter(p=>p.z<0).forEach(p=>dot(p.x,p.y,3,p.c));glow(269,113,14,C.gold);particles.filter(p=>p.z>=0).forEach(p=>glow(p.x,p.y,4.5,p.c));
  });
  // @end
  return { width: CW, height: CH, cycle: CYC, cells: CELLS, fonts: [] };
});
