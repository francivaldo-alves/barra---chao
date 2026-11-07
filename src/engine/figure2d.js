// Renderizador anatômico 2D (SVG) com coluna articulada, fisionomia humana real, expressões faciais dinâmicas e músculos específicos
import { add, prepare, famFrame } from "./kinematics2d.js";
import { MIRROR, FRONTV, MUS, spineCurveOf, famFor, D2 } from "../data/poses.js";
import { tempoOf, tempoPhase } from "../data/tempo.js";
import { V3 } from "./viewer3d.js";

const NS = "http://www.w3.org/2000/svg";
const Y = y => 140 - y;
const S = p => [p[0], Y(p[1])];

function el(tag, attrs, parent) {
  const e = document.createElementNS(NS, tag);
  for (const k in attrs) e.setAttribute(k, attrs[k]);
  if (parent) parent.appendChild(e);
  return e;
}

function addDefs(svg) {
  const defs = el("defs", {}, svg);
  const sk = el("linearGradient", { id: "skGrad", x1: "0%", y1: "0%", x2: "100%", y2: "100%" }, defs);
  el("stop", { offset: "0%", "stop-color": "var(--skin-hi)" }, sk);
  el("stop", { offset: "55%", "stop-color": "var(--skin)" }, sk);
  el("stop", { offset: "100%", "stop-color": "var(--skin-b)" }, sk);

  const so = el("linearGradient", { id: "soGrad", x1: "0%", y1: "0%", x2: "0%", y2: "100%" }, defs);
  el("stop", { offset: "0%", "stop-color": "var(--shorts)" }, so);
  el("stop", { offset: "100%", "stop-color": "var(--shorts-b)" }, so);
}

function capsule(p, q, r1, r2) {
  const P = S(p), Q = S(q);
  let dx = Q[0] - P[0], dy = Q[1] - P[1];
  const l = Math.hypot(dx, dy) || 0.001;
  dx /= l; dy /= l;
  const nx = -dy, ny = dx;
  const f = n => n.toFixed(1);
  return `M${f(P[0] + nx * r1)},${f(P[1] + ny * r1)}L${f(Q[0] + nx * r2)},${f(Q[1] + ny * r2)}A${r2},${r2} 0 0 0 ${f(Q[0] - nx * r2)},${f(Q[1] - ny * r2)}L${f(P[0] - nx * r1)},${f(P[1] - ny * r1)}A${r1},${r1} 0 0 0 ${f(P[0] + nx * r1)},${f(P[1] + ny * r1)}Z`;
}

// Curva suave fechada (Catmull-Rom)
function spline(pts) {
  if (!pts || pts.length < 3) return "";
  const n = pts.length, f = x => x.toFixed(1);
  let d = `M${f(pts[0][0])},${f(pts[0][1])}`;
  for (let i = 0; i < n; i++) {
    const p0 = pts[(i - 1 + n) % n], p1 = pts[i], p2 = pts[(i + 1) % n], p3 = pts[(i + 2) % n];
    d += `C${f(p1[0] + (p2[0] - p0[0]) / 6)},${f(p1[1] + (p2[1] - p0[1]) / 6)} ${f(p2[0] - (p3[0] - p1[0]) / 6)},${f(p2[1] - (p3[1] - p1[1]) / 6)} ${f(p2[0])},${f(p2[1])}`;
  }
  return d + "Z";
}

// Curva aberta suave para linhas anatômicas internas
function openSpline(pts) {
  if (!pts || pts.length < 2) return "";
  const f = x => x.toFixed(1);
  let d = `M${f(pts[0][0])},${f(pts[0][1])}`;
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[Math.max(0, i - 1)], p1 = pts[i], p2 = pts[i + 1], p3 = pts[Math.min(pts.length - 1, i + 2)];
    d += `C${f(p1[0] + (p2[0] - p0[0]) / 6)},${f(p1[1] + (p2[1] - p0[1]) / 6)} ${f(p2[0] - (p3[0] - p1[0]) / 6)},${f(p2[1] - (p3[1] - p1[1]) / 6)} ${f(p2[0])},${f(p2[1])}`;
  }
  return d;
}

// Cabeça humana com perfil craniano, maçã do rosto e mandíbula definidos
const HEAD_SIDE = [
  [-4.0, -8.0], [-8.4, -2.4], [-8.8, 3.4], [-5.8, 8.2], [0.2, 9.8],
  [5.8, 7.8], [7.8, 3.8], [8.0, 1.5], [10.4, -0.8], [8.5, -2.1],
  [8.8, -3.3], [8.2, -4.8], [7.3, -7.4], [3.6, -9.2], [0.4, -9.5]
];
// Corte atlético moderno (fade lateral + topete texturizado com costeleta)
const HAIR_SIDE = [
  [-4.8, -5.2], [-9.4, -2.0], [-9.6, 3.8], [-6.4, 9.2], [0.4, 11.2],
  [6.6, 9.4], [8.8, 6.2], [6.8, 5.4], [3.4, 5.2], [0.8, 4.4],
  [-0.6, 2.2], [-0.8, 0.2], [-1.8, 0.4], [-2.6, 2.2], [-3.8, -1.8]
];
const HAIR_HI_SIDE = [
  [-5.2, 7.6], [0.4, 10.2], [6.0, 8.6], [4.2, 6.4], [-1.2, 6.2]
];

const HEAD_FRONT = [
  [0, -9.8], [-4.6, -8.2], [-6.8, -4.2], [-7.6, -0.5], [-7.7, 3.8],
  [-5.4, 8.4], [0, 9.8], [5.4, 8.4], [7.7, 3.8], [7.6, -0.5],
  [6.8, -4.2], [4.6, -8.2]
];
const HAIR_FRONT = [
  [-7.9, 1.2], [-8.4, 5.8], [-5.6, 10.2], [0, 11.5], [5.6, 10.2],
  [8.4, 5.8], [7.9, 1.2], [7.1, 4.2], [4.8, 6.4], [1.6, 6.1],
  [-1.8, 6.6], [-4.8, 6.2], [-7.1, 4.2]
];
const HAIR_HI_FRONT = [
  [-4.4, 9.2], [0, 10.6], [4.6, 9.0], [2.4, 7.2], [-2.2, 7.4]
];

// Perfis anatômicos com ventres musculares reais: [t (0..1), largura anterior, largura posterior]
const PROF = {
  thigh: [[0, 7.8, 8.4], [0.18, 8.7, 8.3], [0.45, 8.4, 7.4], [0.75, 6.6, 5.5], [0.92, 5.3, 4.7], [1, 5.0, 4.6]],
  shin: [[0, 5.0, 4.9], [0.15, 4.6, 6.2], [0.34, 4.3, 6.8], [0.58, 3.6, 4.6], [0.82, 2.9, 3.1], [1, 2.8, 2.9]],
  ua: [[0, 6.3, 5.8], [0.22, 6.0, 5.4], [0.48, 5.5, 5.1], [0.78, 4.3, 4.0], [1, 3.7, 3.6]],
  fa: [[0, 3.8, 3.9], [0.22, 4.4, 4.2], [0.55, 3.5, 3.3], [0.85, 2.7, 2.6], [1, 2.4, 2.4]],
  sleeve: [[0, 6.8, 6.3], [0.18, 6.4, 5.9], [0.40, 5.8, 5.5]],
  shorts: [[0, 8.6, 9.0], [0.22, 9.5, 9.0], [0.50, 9.0, 8.1]]
};

function limbPath(p, q, prof, side) {
  const dx = q[0] - p[0], dy = q[1] - p[1], l = Math.hypot(dx, dy) || 1, ux = dx / l, uy = dy / l, nx = -uy * side, ny = ux * side;
  const A = [], B = [];
  for (const [t, wf, wb] of prof) {
    const c = [p[0] + dx * t, p[1] + dy * t];
    A.push([c[0] + nx * wf, c[1] + ny * wf]);
    B.push([c[0] - nx * wb, c[1] - ny * wb]);
  }
  const f0 = prof[0], fl = prof[prof.length - 1], tl = fl[0];
  const capS = [p[0] - ux * (f0[1] + f0[2]) * 0.44, p[1] - uy * (f0[1] + f0[2]) * 0.44];
  const end = [p[0] + dx * tl, p[1] + dy * tl];
  const capE = [end[0] + ux * (fl[1] + fl[2]) * 0.44, end[1] + uy * (fl[1] + fl[2]) * 0.44];
  return spline([capS, ...A, capE, ...B.reverse()].map(S));
}

// Sub-contorno anatômico para destacar um músculo específico num segmento (p -> q)
function muscleBelly(p, q, side, t0, t1, frontSide, wMax, wIn = 0.8) {
  const dx = q[0] - p[0], dy = q[1] - p[1], l = Math.hypot(dx, dy) || 1, ux = dx / l, uy = dy / l;
  const sgn = frontSide * side, nx = -uy * sgn, ny = ux * sgn;
  const steps = [0, 0.25, 0.5, 0.75, 1];
  const outer = [], inner = [];
  for (const s of steps) {
    const t = t0 + (t1 - t0) * s;
    const env = Math.sin(s * Math.PI);
    const wOut = wMax * (0.35 + 0.65 * env);
    const wMid = wIn * (1 - 0.5 * env);
    const c = [p[0] + dx * t, p[1] + dy * t];
    outer.push(S([c[0] + nx * wOut, c[1] + ny * wOut]));
    inner.push(S([c[0] + nx * wMid, c[1] + ny * wMid]));
  }
  return spline([...outer, ...inner.reverse()]);
}

const SHOE = [[-4.2, -1.5], [-4.9, 2.2], [-2.2, 4.7], [3.0, 3.8], [7.6, 2.0], [10.8, 0.7], [11.6, -1.2], [9.8, -2.6], [3.0, -2.7], [-2.8, -2.6]];
const SOLE = [[-4.3, -1.7], [11.6, -1.3], [11.1, -3.3], [3.0, -3.6], [-3.5, -3.4]];

const TORSO_SIDE = [[6.5, 6.5], [5.8, 13.5], [6.5, 20.5], [8.7, 27.5], [8.4, 34.0], [5.2, 39.2], [1.6, 42.2], [-3.2, 42.0], [-7.0, 38.6], [-9.2, 32.0], [-9.0, 24.5], [-6.8, 17.0], [-7.5, 10.0], [-7.3, 6.5]];
const SHORTS_SIDE = [[7.3, 12.2], [7.8, 4.2], [7.2, -3.0], [3.2, -6.4], [-4.4, -6.0], [-10.2, -2.2], [-11.0, 5.2], [-8.8, 12.2]];
const WAIST_SIDE = [[7.4, 12.6], [7.5, 9.2], [-8.9, 9.2], [-8.7, 12.6]];

const TORSO_FRONT = [[-8.8, 6.5], [-8.8, 14.0], [-10.8, 24.0], [-13.0, 33.0], [-11.4, 38.8], [-4.2, 41.8], [4.2, 41.8], [11.4, 38.8], [13.0, 33.0], [10.8, 24.0], [8.8, 14.0], [8.8, 6.5]];
const SHORTS_FRONT = [[-9.5, 12.2], [-11.0, 2.0], [-10.4, -6.0], [0, -4.0], [10.4, -6.0], [11.0, 2.0], [9.5, 12.2]];
const WAIST_FRONT = [[-9.6, 12.6], [9.6, 12.6], [9.9, 9.2], [-9.9, 9.2]];

export function makeBody(g, hi, key) {
  const P = { hi, key }, mk = cls => el("path", { class: cls }, g);
  P.shadow = el("ellipse", { class: "shadow", ry: 3.2 }, g);
  P.uaB = mk("sk b"); P.faB = mk("sk b"); P.slB = mk("sh b"); P.haB = mk("sk b");
  P.thB = mk("sk b"); P.shB = mk("sk b"); P.soB = mk("so b"); P.shoeB = mk("shoe b"); P.soleB = mk("sole");
  P.hips = mk("so"); P.torso = mk("sh"); P.neck = mk("sk");
  P.face = mk("sk face"); P.jaw = mk("jaw"); P.ear = mk("sk b");
  P.hair = mk("hair"); P.hairHi = mk("hair-hi");
  P.sclera = mk("sclera"); P.sclera2 = mk("sclera");
  P.eye = el("circle", { r: 1.05, class: "eye" }, g);
  P.eye2 = el("circle", { r: 1.05, class: "eye" }, g);
  P.eyeHi = el("circle", { r: 0.38, class: "eye-hi" }, g);
  P.eyeHi2 = el("circle", { r: 0.38, class: "eye-hi" }, g);
  P.brow = mk("brow"); P.nose = mk("nose"); P.mouth = mk("mouth");
  P.th = mk("sk"); P.sh = mk("sk"); P.so = mk("so"); P.waist = mk("waist"); P.trim = mk("trim");
  P.shoe = mk("shoe"); P.sole = mk("sole");
  P.ua = mk("sk"); P.fa = mk("sk"); P.sl = mk("sh"); P.ha = mk("sk");
  P.anat = mk("anat");
  P.hl = [];
  for (let i = 0; i < 6; i++) P.hl.push(mk("hl"));
  return P;
}

export function setBody(P, J, phase = 0) {
  const d = (elNode, path) => elNode.setAttribute("d", path);
  const isF = FRONTV.has(P.key), m = MIRROR.has(P.key) ? -1 : 1;
  const u0 = [J.s[0] - J.hip[0], J.s[1] - J.hip[1]], ul = Math.hypot(u0[0], u0[1]) || 1, u = [u0[0] / ul, u0[1] / ul];
  const front = isF ? [0, 0] : [u[1] * m, -u[0] * m], lat = [u[1], -u[0]];

  // Nível de esforço instantâneo (0 = início/repouso, 1 = pico de contração) para expressão facial dinâmica
  const effort = Math.pow(Math.sin((phase % 1) * Math.PI), 2);

  // Curvatura anatômica da coluna (lombar + torácica)
  const bend = isF ? 0 : spineCurveOf(P.key, J);
  const midSpine = [
    (J.hip[0] + J.s[0]) * 0.5 - front[0] * bend,
    (J.hip[1] + J.s[1]) * 0.5 - front[1] * bend
  ];

  const TLraw = q => {
    if (isF) {
      return [J.hip[0] + lat[0] * q[0] + u[0] * q[1], J.hip[1] + lat[1] * q[0] + u[1] * q[1]];
    }
    const t = Math.max(-0.2, Math.min(1.15, q[1] / 40));
    const mt = 1 - t;
    const cx = mt * mt * J.hip[0] + 2 * mt * t * midSpine[0] + t * t * J.s[0];
    const cy = mt * mt * J.hip[1] + 2 * mt * t * midSpine[1] + t * t * J.s[1];
    const tx = 2 * mt * (midSpine[0] - J.hip[0]) + 2 * t * (J.s[0] - midSpine[0]);
    const ty = 2 * mt * (midSpine[1] - J.hip[1]) + 2 * t * (J.s[1] - midSpine[1]);
    const tl = Math.hypot(tx, ty) || 1, tux = tx / tl, tuy = ty / tl;
    const fnx = tuy * m, fny = -tux * m;
    const extraY = q[1] - t * 40;
    return [cx + fnx * q[0] + tux * extraY, cy + fny * q[0] + tuy * extraY];
  };
  const TL = q => S(TLraw(q));

  if (isF) {
    J = { ...J };
    const sh = (k, dx, dy) => { J[k] = [J[k][0] + dx, J[k][1] + dy]; };
    J.sR = [J.s[0] + 9, J.s[1] - 3];
    J.sL = [J.s[0] - 9, J.s[1] - 3];
    sh("e", 9, -3); sh("w", 9, -3); sh("e2", -9, -3); sh("w2", -9, -3);
    J.hipR = [J.hip[0] + 5, J.hip[1]];
    J.hipL = [J.hip[0] - 5, J.hip[1]];
  } else {
    J.sR = J.sL = J.s;
    J.hipR = J.hipL = J.hip;
  }

  const side = isF ? 1 : m, sym = pr => isF ? pr.map(([t, a, b]) => [t, (a + b) / 2, (a + b) / 2]) : pr;
  const L = (p, q, k) => limbPath(p, q, sym(PROF[k]), side);
  const shoePts = (a, t, k, poly) => {
    const fx = [t[0] - a[0], t[1] - a[1]], fl = Math.hypot(fx[0], fx[1]) || 1, ux = [fx[0] / fl, fx[1] / fl];
    let ny = [-ux[1], ux[0]];
    if ((J[k][0] - a[0]) * ny[0] + (J[k][1] - a[1]) * ny[1] < 0) ny = [-ny[0], -ny[1]];
    return spline(poly.map(([x, y]) => S([a[0] + ux[0] * x * 0.9 + ny[0] * y, a[1] + ux[1] * x * 0.9 + ny[1] * y])));
  };

  // Mão anatômica com palma e polegar discreto
  const hand = (e, w) => {
    const dx = w[0] - e[0], dy = w[1] - e[1], l = Math.hypot(dx, dy) || 1, ux = dx / l, uy = dy / l, nx = -uy * side, ny = ux * side;
    const pts = [
      [-1.2, -2.3], [1.5, -2.6], [4.6, -2.1], [5.8, -0.5], [5.2, 1.9], [2.4, 3.1], [0.4, 2.7], [-1.2, 1.8]
    ];
    return spline(pts.map(([x, y]) => S([w[0] + ux * x + nx * y, w[1] + uy * x + ny * y])));
  };

  // Sombra no chão
  const xs = [J.a, J.a2, J.t, J.t2, J.w, J.w2, J.hip, J.s].map(q => q[0]), cx = (Math.min(...xs) + Math.max(...xs)) / 2;
  P.shadow.setAttribute("cx", cx.toFixed(1));
  P.shadow.setAttribute("cy", Y(0).toFixed(1));
  P.shadow.setAttribute("rx", ((Math.max(...xs) - Math.min(...xs)) / 2 + 8).toFixed(1));

  // Lado de trás
  d(P.uaB, L(J.sL, J.e2, "ua"));
  d(P.faB, L(J.e2, J.w2, "fa"));
  d(P.slB, limbPath(J.sL, J.e2, sym(PROF.sleeve), side));
  d(P.haB, hand(J.e2, J.w2));
  d(P.thB, L(J.hipL, J.k2, "thigh"));
  d(P.shB, L(J.k2, J.a2, "shin"));
  d(P.soB, limbPath(J.hipL, J.k2, sym(PROF.shorts), side));
  d(P.shoeB, shoePts(J.a2, J.t2, "k2", SHOE));
  d(P.soleB, shoePts(J.a2, J.t2, "k2", SOLE));

  // Tronco e quadril articulados
  d(P.hips, spline((isF ? SHORTS_FRONT : SHORTS_SIDE).map(TL)));
  d(P.torso, spline((isF ? TORSO_FRONT : TORSO_SIDE).map(TL)));
  const neckTop = add(J.s, [u[0] * 8, u[1] * 8]);
  d(P.neck, capsule(add(J.s, [-u[0] * 2, -u[1] * 2]), neckTop, 4.0, 3.5));

  // Cabeça, Rosto e Expressões Faciais Dinâmicas
  const hu0 = [J.h[0] - J.s[0], J.h[1] - J.s[1]], hl = Math.hypot(hu0[0], hu0[1]) || 1, hu = [hu0[0] / hl, hu0[1] / hl], hf = [hu[1] * m, -hu[0] * m];
  const T = isF ? (q => S([J.h[0] + q[0], J.h[1] + q[1]])) : (q => S([J.h[0] + hf[0] * q[0] + hu[0] * q[1], J.h[1] + hf[1] * q[0] + hu[1] * q[1]])), f1 = x => x.toFixed(1);
  d(P.face, spline((isF ? HEAD_FRONT : HEAD_SIDE).map(T)));
  d(P.hair, spline((isF ? HAIR_FRONT : HAIR_SIDE).map(T)));
  d(P.hairHi, spline((isF ? HAIR_HI_FRONT : HAIR_HI_SIDE).map(T)));

  // Franzido dinâmico da sobrancelha no pico do esforço
  const bf = effort * 0.65;

  if (isF) {
    d(P.ear, "");
    // Esclera (branco dos olhos) amendoada
    d(P.sclera, spline([[-4.0, 1.3], [-2.8, 2.0], [-1.6, 1.3], [-2.8, 0.8]].map(T)));
    d(P.sclera2, spline([[1.6, 1.3], [2.8, 2.0], [4.0, 1.3], [2.8, 0.8]].map(T)));
    const e1 = T([-2.8, 1.4]), e2 = T([2.8, 1.4]);
    const h1 = T([-2.5, 1.7]), h2 = T([3.1, 1.7]);
    P.eye.setAttribute("cx", f1(e1[0])); P.eye.setAttribute("cy", f1(e1[1]));
    P.eye2.setAttribute("cx", f1(e2[0])); P.eye2.setAttribute("cy", f1(e2[1]));
    P.eyeHi.setAttribute("cx", f1(h1[0])); P.eyeHi.setAttribute("cy", f1(h1[1]));
    P.eyeHi2.setAttribute("cx", f1(h2[0])); P.eyeHi2.setAttribute("cy", f1(h2[1]));
    P.eye2.style.display = ""; P.eyeHi2.style.display = ""; P.sclera2.style.display = "";

    // Sobrancelhas esculpidas com expressão de foco
    const browL = spline([[-4.9, 3.2 + bf * 0.2], [-3.2, 4.1], [-1.3, 3.6 - bf], [-1.4, 3.0 - bf], [-3.2, 3.5]].map(T));
    const browR = spline([[4.9, 3.2 + bf * 0.2], [3.2, 4.1], [1.3, 3.6 - bf], [1.4, 3.0 - bf], [3.2, 3.5]].map(T));
    d(P.brow, browL + browR);

    // Nariz e maxilar
    d(P.nose, openSpline([[-0.4, 1.0], [-0.7, -1.6], [0, -2.0], [0.7, -1.6]].map(T)));
    d(P.jaw, openSpline([[-5.2, -3.5], [-3.4, -7.2], [0, -8.5], [3.4, -7.2], [5.2, -3.5]].map(T)));

    // Boca expressiva: sorriso confiante no início -> respiração focada no esforço
    if (effort > 0.55) {
      P.mouth.setAttribute("class", "mouth-open");
      d(P.mouth, spline([[-2.1, -4.5], [0, -4.1], [2.1, -4.5], [1.6, -5.6], [0, -5.8], [-1.6, -5.6]].map(T)));
    } else {
      P.mouth.setAttribute("class", "mouth");
      d(P.mouth, openSpline([[-2.2, -4.3], [0, -4.9 + bf * 0.4], [2.2, -4.3]].map(T)));
    }
  } else {
    d(P.ear, spline([[-1.2, 2.5], [-3.0, 1.5], [-3.1, -1.5], [-1.6, -2.7], [-0.3, 0]].map(T)));
    d(P.sclera, spline([[3.8, 1.6], [5.0, 2.3], [6.2, 1.7], [5.0, 1.1]].map(T)));
    d(P.sclera2, "");
    const e = T([5.1, 1.75]), eh = T([5.4, 2.0]);
    P.eye.setAttribute("cx", f1(e[0])); P.eye.setAttribute("cy", f1(e[1]));
    P.eyeHi.setAttribute("cx", f1(eh[0])); P.eyeHi.setAttribute("cy", f1(eh[1]));
    P.eye2.style.display = "none"; P.eyeHi2.style.display = "none"; P.sclera2.style.display = "none";

    // Sobrancelha esculpida de perfil (arqueada e determinada no esforço)
    d(P.brow, spline([[3.0, 3.5], [5.2, 4.2 - bf * 0.3], [7.3, 3.5 - bf * 0.8], [7.1, 2.9 - bf * 0.8], [5.1, 3.5 - bf * 0.2]].map(T)));

    // Contorno da narina e linha da mandíbula
    d(P.nose, openSpline([[7.6, -1.6], [8.6, -1.8], [9.2, -1.2]].map(T)));
    d(P.jaw, openSpline([[-0.8, -5.2], [2.8, -7.8], [6.2, -7.6]].map(T)));

    if (effort > 0.55) {
      P.mouth.setAttribute("class", "mouth-open");
      d(P.mouth, spline([[5.4, -4.6], [8.1, -4.3], [7.9, -5.4], [5.8, -5.3]].map(T)));
    } else {
      P.mouth.setAttribute("class", "mouth");
      d(P.mouth, openSpline([[5.3, -4.3], [6.8, -4.7 + bf * 0.3], [8.1, -4.4]].map(T)));
    }
  }

  // Lado da frente (perna, short com cós e faixa lateral, tênis com sola, braço)
  const th = L(J.hipR, J.k, "thigh"), shn = L(J.k, J.a, "shin"), ua = L(J.sR, J.e, "ua"), fa = L(J.e, J.w, "fa");
  d(P.th, th); d(P.sh, shn);
  d(P.so, limbPath(J.hipR, J.k, sym(PROF.shorts), side));
  d(P.waist, spline((isF ? WAIST_FRONT : WAIST_SIDE).map(TL)));
  // Faixa esportiva lateral no short
  {
    const dx = J.k[0] - J.hipR[0], dy = J.k[1] - J.hipR[1];
    const p1 = S([J.hipR[0] + dx * 0.06, J.hipR[1] + dy * 0.06]);
    const p2 = S([J.hipR[0] + dx * 0.48, J.hipR[1] + dy * 0.48]);
    d(P.trim, isF ? "" : `M${f1(p1[0])},${f1(p1[1])}L${f1(p2[0])},${f1(p2[1])}`);
  }
  d(P.shoe, shoePts(J.a, J.t, "k", SHOE));
  d(P.sole, shoePts(J.a, J.t, "k", SOLE));
  d(P.ua, ua); d(P.fa, fa);
  d(P.sl, limbPath(J.sR, J.e, sym(PROF.sleeve), side));
  d(P.ha, hand(J.e, J.w));

  // Linhas anatômicas sutis (peitoral, linha abdominal e separação muscular)
  if (P.hi) {
    let anatD = "";
    if (isF) {
      anatD += openSpline([[-7.5, 29], [-2.0, 27.5], [0, 28.5]].map(TL));
      anatD += openSpline([[7.5, 29], [2.0, 27.5], [0, 28.5]].map(TL));
      anatD += openSpline([[0, 27.5], [0, 13]].map(TL));
    } else {
      anatD += openSpline([[1.8, 29.5], [5.2, 26.8], [7.8, 27.8]].map(TL));
      anatD += openSpline([[3.8, 24.5], [3.6, 13.5]].map(TL));
    }
    d(P.anat, anatD);
  } else {
    d(P.anat, "");
  }

  // Destaque muscular anatômico específico por grupo (MUS[P.key])
  const H = [];
  if (P.hi) {
    const groups = MUS[P.key] || [];
    for (const g of groups) {
      if (g === "pec") {
        H.push(
          isF
            ? spline([[-9.5, 35], [-1.5, 35], [-1.0, 27.2], [-8.8, 27.5], [-10.2, 31]].map(TL)) +
              spline([[9.5, 35], [1.5, 35], [1.0, 27.2], [8.8, 27.5], [10.2, 31]].map(TL))
            : spline([[0.8, 36.5], [7.6, 34.5], [8.1, 27.2], [3.5, 26.8], [0.2, 30.5]].map(TL))
        );
      } else if (g === "abs") {
        H.push(
          isF
            ? spline([[-4.5, 26.5], [4.5, 26.5], [4.0, 11.5], [-4.0, 11.5]].map(TL))
            : spline([[2.2, 26.2], [6.4, 25.5], [5.8, 11.5], [1.8, 12.0]].map(TL))
        );
      } else if (g === "obl") {
        H.push(
          isF
            ? spline([[-8.8, 24.5], [-4.6, 24.0], [-4.2, 12.5], [-8.4, 13.0]].map(TL)) +
              spline([[8.8, 24.5], [4.6, 24.0], [4.2, 12.5], [8.4, 13.0]].map(TL))
            : spline([[-1.8, 24.5], [2.4, 24.0], [2.0, 12.2], [-2.2, 12.8]].map(TL))
        );
      } else if (g === "lat") {
        H.push(
          isF
            ? spline([[-11.8, 32.5], [-7.5, 31.0], [-6.8, 19.0], [-9.8, 22.0]].map(TL)) +
              spline([[11.8, 32.5], [7.5, 31.0], [6.8, 19.0], [9.8, 22.0]].map(TL))
            : spline([[-8.4, 33.0], [-1.5, 31.0], [-2.0, 18.5], [-7.2, 20.5]].map(TL))
        );
      } else if (g === "trap") {
        H.push(
          isF
            ? spline([[-8.5, 38.5], [0, 41.2], [8.5, 38.5], [4.5, 33.5], [-4.5, 33.5]].map(TL))
            : spline([[-6.8, 39.0], [0.5, 41.2], [-1.2, 30.0], [-8.4, 32.5]].map(TL))
        );
      } else if (g === "lowback") {
        H.push(
          isF
            ? spline([[-5.5, 20.5], [5.5, 20.5], [5.0, 10.5], [-5.0, 10.5]].map(TL))
            : spline([[-7.2, 22.0], [-2.2, 21.5], [-2.5, 10.2], [-7.0, 10.5]].map(TL))
        );
      } else if (g === "delt") {
        H.push(
          muscleBelly(J.sR, J.e, side, 0.0, 0.44, 1, 5.8, -2.5) +
          muscleBelly(J.sL, J.e2, side, 0.0, 0.44, 1, 5.8, -2.5)
        );
      } else if (g === "tri") {
        H.push(
          muscleBelly(J.sR, J.e, side, 0.16, 0.86, -1, 5.1, 0.2) +
          muscleBelly(J.sL, J.e2, side, 0.16, 0.86, -1, 5.1, 0.2)
        );
      } else if (g === "bi") {
        H.push(
          muscleBelly(J.sR, J.e, side, 0.20, 0.86, 1, 5.3, 0.2) +
          muscleBelly(J.sL, J.e2, side, 0.20, 0.86, 1, 5.3, 0.2)
        );
      } else if (g === "quad") {
        H.push(
          muscleBelly(J.hipR, J.k, side, 0.12, 0.88, 1, 8.2, 0.4) +
          muscleBelly(J.hipL, J.k2, side, 0.12, 0.88, 1, 8.2, 0.4)
        );
      } else if (g === "ham") {
        H.push(
          muscleBelly(J.hipR, J.k, side, 0.18, 0.86, -1, 7.4, 0.4) +
          muscleBelly(J.hipL, J.k2, side, 0.18, 0.86, -1, 7.4, 0.4)
        );
      } else if (g === "glute") {
        H.push(
          isF
            ? muscleBelly(J.hipR, J.k, side, 0.0, 0.32, -1, 8.2, -2.0) +
              muscleBelly(J.hipL, J.k2, side, 0.0, 0.32, -1, 8.2, -2.0)
            : spline([[-2.2, 8.8], [-9.4, 6.2], [-10.2, -1.8], [-4.5, -5.2], [0.8, -2.0]].map(TL))
        );
      } else if (g === "calf") {
        H.push(
          muscleBelly(J.k, J.a, side, 0.08, 0.68, -1, 6.5, 0.2) +
          muscleBelly(J.k2, J.a2, side, 0.08, 0.68, -1, 6.5, 0.2)
        );
      }
    }
  }
  P.hl.forEach((e, i) => e.setAttribute("d", H[i] || ""));
}

const figs = [];

export function frameBox(fam) {
  if (fam.vb) return fam.vb;
  let x0 = 1e9, x1 = -1e9, y0 = 1e9, y1 = -1e9;
  for (let i = 0; i < 40; i++) {
    const J = famFrame(fam, i / 40);
    for (const k in J) {
      const q = S(J[k]);
      x0 = Math.min(x0, q[0]); x1 = Math.max(x1, q[0]);
      y0 = Math.min(y0, q[1]); y1 = Math.max(y1, q[1]);
    }
  }
  const pad = 13;
  x0 -= pad; x1 += pad; y0 -= pad;
  y1 = Math.max(y1 + 6, Y(0) + 8);
  let w = x1 - x0, h = y1 - y0;
  const R = 1.55;
  if (w / h < R) {
    const nw = h * R;
    x0 -= (nw - w) / 2;
    w = nw;
  } else {
    const nh = w / R;
    y0 -= nh - h;
    h = nh;
  }
  return (fam.vb = [x0, y0, w, h].map(n => +n.toFixed(1)));
}

export function figure(famKey, { ghost = false, label = "", name = label, side = 1, tempo, clock } = {}) {
  const fam = prepare(D2[famKey] || famFor(famKey, name, side));
  const wrap = document.createElement("div");
  const vb = frameBox(fam);
  const svg = el("svg", { viewBox: vb.join(" "), role: "img", "aria-label": label ? `Animação: ${label}` : "Animação do exercício" });
  addDefs(svg);
  el("line", { x1: vb[0], x2: vb[0] + vb[2], y1: Y(0), y2: Y(0), class: "p-line" }, svg);
  if (ghost) setBody(makeBody(el("g", { class: "ghost" }, svg), "", famKey), famFrame(fam, 0), 0);
  const P = makeBody(el("g", {}, svg), fam.hi, famKey);
  wrap.appendChild(svg);
  const tp = tempo !== undefined ? tempo : tempoOf(famKey);
  const f = { svg, fam, P, speed: 1, paused: false, phase: 0, t: 0, tp: tp || null, clock: typeof clock === "function" ? clock : null, last: performance.now() };
  setBody(P, famFrame(fam, 0), 0);
  figs.push(f);
  return { node: svg, f };
}

let lastStep = 0;

function step(now) {
  lastStep = now;
  try { V3.tick(now); } catch (e) {}
  for (let i = figs.length - 1; i >= 0; i--) {
    const f = figs[i];
    if (!f.svg.isConnected) {
      if (now - f.last > 3000) figs.splice(i, 1);
      continue;
    }
    const dt = Math.min(120, Math.max(0, now - f.last));
    f.last = now;
    const fam = f.fam;
    if (f.clock) {
      const t = f.clock();
      f.phase = !(t > 0) ? 0 : f.tp ? tempoPhase(f.tp, t) : (t / 2.6) % 1;
      setBody(f.P, famFrame(fam, f.phase), f.phase);
      continue;
    }
    if (f.paused) continue;
    if (f.tp) {
      f.t += (dt / 1000) * f.speed;
      f.phase = tempoPhase(f.tp, f.t);
    } else {
      const per = fam.K ? 1050 * fam.K.length : 2600;
      f.phase = (f.phase + (dt / per) * f.speed) % 1;
    }
    setBody(f.P, famFrame(fam, f.phase), f.phase);
  }
}

export function startAnimationLoop() {
  function loop(now) {
    try { step(now); } catch (e) {}
    requestAnimationFrame(loop);
  }
  requestAnimationFrame(loop);
  setInterval(() => {
    const now = performance.now();
    if (now - lastStep > 90) {
      try { step(now); } catch (e) {}
    }
  }, 40);
}
