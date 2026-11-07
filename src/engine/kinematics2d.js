// Motor cinemático 2D do boneco (x à direita, y para cima, chão em y=0)

export const RAD = Math.PI / 180;
export const L = { torso: 40, neck: 13, ua: 22, fa: 22, th: 28, sh: 28, foot: 10 };

export const v = (a, l) => [Math.cos(a * RAD) * l, Math.sin(a * RAD) * l];
export const add = (p, q) => [p[0] + q[0], p[1] + q[1]];

export function ik2(r, t, l1, l2, bend) {
  const dx = t[0] - r[0], dy = t[1] - r[1], base = Math.atan2(dy, dx);
  let d = Math.hypot(dx, dy);
  d = Math.max(Math.abs(l1 - l2) + 0.01, Math.min(d, l1 + l2 - 0.01));
  const a = Math.acos((l1 * l1 + d * d - l2 * l2) / (2 * l1 * d)), ang = base + bend * a;
  return [
    [r[0] + l1 * Math.cos(ang), r[1] + l1 * Math.sin(ang)],
    [r[0] + d * Math.cos(base), r[1] + d * Math.sin(base)]
  ];
}

export function solve(p, ik) {
  const d = (k, def) => p[k] ?? def;
  const UA = d("UA", 270), FA = d("FA", 270), TH = d("TH", 270), SH = d("SH", 270);
  const J = { hip: [0, 0] };
  J.s = v(p.T, L.torso);
  J.h = add(J.s, v(p.T + d("hd", 0), L.neck));
  J.e = add(J.s, v(UA, L.ua));
  J.w = add(J.e, v(FA, L.fa));
  J.e2 = add(J.s, v(d("UA2", UA), L.ua));
  J.w2 = add(J.e2, v(d("FA2", FA), L.fa));
  J.k = v(TH, L.th);
  J.a = add(J.k, v(SH, L.sh));
  J.t = add(J.a, v(d("F", SH + 90), L.foot));
  const TH2 = d("TH2", TH), SH2 = d("SH2", SH);
  J.k2 = v(TH2, L.th);
  J.a2 = add(J.k2, v(SH2, L.sh));
  J.t2 = add(J.a2, v(d("F2", d("F", SH2 + 90)), L.foot));
  const o = [p.at[0] - J[p.root][0], p.at[1] - J[p.root][1]];
  for (const k in J) J[k] = add(J[k], o);
  if (ik.arm) {
    [J.e, J.w] = ik2(J.s, ik.arm, L.ua, L.fa, ik.arm[2]);
    if (p.UA2 == null) { J.e2 = J.e; J.w2 = J.w; }
  }
  if (ik.leg) {
    [J.k, J.a] = ik2(J.hip, ik.leg, L.th, L.sh, ik.leg[2]);
    J.t = add(J.a, v(d("F", 0), L.foot));
    if (ik.leg2) {
      [J.k2, J.a2] = ik2(J.hip, ik.leg2, L.th, L.sh, ik.leg2[2]);
      J.t2 = add(J.a2, v(d("F2", 0), L.foot));
    } else if (p.TH2 == null) {
      J.k2 = J.k; J.a2 = J.a; J.t2 = J.t;
    }
  }
  return J;
}

export function lerpPose(A, B, f) {
  const o = {};
  for (const k in A) {
    const a = A[k], b = B[k];
    o[k] = Array.isArray(a) ? a.map((x, i) => x + (b[i] - x) * f) : typeof a === "number" ? a + (b - a) * f : a;
  }
  return o;
}

export function lerpJ(A, B, f) {
  const o = {};
  for (const k in A) o[k] = [A[k][0] + (B[k][0] - A[k][0]) * f, A[k][1] + (B[k][1] - A[k][1]) * f];
  return o;
}

// Interpolação por ângulos das articulações: os membros nunca mudam de tamanho entre uma pose e outra.
export const nrm = a => ((a + 180) % 360 + 360) % 360 - 180;
export const angOf = (p, q) => Math.atan2(q[1] - p[1], q[0] - p[0]) / RAD;
export const crossS = (r, j, e) => (e[0] - r[0]) * (j[1] - r[1]) - (e[1] - r[1]) * (j[0] - r[0]);

export function toParams(J) {
  return {
    hip: J.hip.slice(),
    T: angOf(J.hip, J.s),
    hd: nrm(angOf(J.s, J.h) - angOf(J.hip, J.s)),
    UA: angOf(J.s, J.e),
    FA: angOf(J.e, J.w),
    UA2: angOf(J.s, J.e2),
    FA2: angOf(J.e2, J.w2),
    TH: angOf(J.hip, J.k),
    SH: angOf(J.k, J.a),
    TH2: angOf(J.hip, J.k2),
    SH2: angOf(J.k2, J.a2),
    Fr: nrm(angOf(J.a, J.t) - angOf(J.k, J.a)),
    Fr2: nrm(angOf(J.a2, J.t2) - angOf(J.k2, J.a2))
  };
}

export function lerpParams(A, B, f) {
  const o = { hip: [A.hip[0] + (B.hip[0] - A.hip[0]) * f, A.hip[1] + (B.hip[1] - A.hip[1]) * f] };
  for (const k in A) if (k !== "hip") o[k] = A[k] + nrm(B[k] - A[k]) * f;
  return o;
}

export const fromParams = p => solve({ ...p, F: p.SH + p.Fr, F2: p.SH2 + p.Fr2, root: "hip", at: p.hip }, {});

export const LIMBS = [
  ["w", "e", "s", L.ua, L.fa, -1],
  ["w2", "e2", "s", L.ua, L.fa, -1],
  ["a", "k", "hip", L.th, L.sh, 1],
  ["a2", "k2", "hip", L.th, L.sh, 1]
];

export function bendOf(J1, J2, end, mid, root, def) {
  const c1 = crossS(J1[root], J1[mid], J1[end]), c2 = crossS(J2[root], J2[mid], J2[end]);
  const c = Math.abs(c1) > 40 ? c1 : Math.abs(c2) > 40 ? c2 : def;
  return c > 0 ? 1 : -1;
}

// Mantém mãos e pés acima do chão (o boneco nunca atravessa o piso).
export function floorGuard(J) {
  for (const [end, mid, root, l1, l2, def] of LIMBS) {
    if (J[end][1] < 2 && (end[0] === "a" || J[end][1] < 0)) {
      const y = end[0] === "a" ? 2 : 0, c = crossS(J[root], J[mid], J[end]);
      const tk = end === "a" ? "t" : end === "a2" ? "t2" : null;
      const fa = tk ? angOf(J[end], J[tk]) : 0;
      const r = ik2(J[root], [J[end][0], y], l1, l2, Math.abs(c) > 1 ? (c > 0 ? 1 : -1) : def);
      J[mid] = r[0];
      J[end] = r[1];
      if (tk) J[tk] = add(J[end], v(fa, L.foot));
    }
  }
  // pé abaixo do chão: apoia a ponta no piso escolhendo o lado que deixa o tornozelo mais natural
  for (const [k, a, t] of [["k", "a", "t"], ["k2", "a2", "t2"]]) {
    if (J[t][1] < 0) {
      const dy = Math.max(0, J[a][1]);
      if (dy >= L.foot) continue;
      const fx = Math.sqrt(L.foot * L.foot - dy * dy), c = [[J[a][0] + fx, 0], [J[a][0] - fx, 0]];
      // empate (pé apontando reto para o chão) favorece o lado do joelho, apoiando os dedos sem o pé trocar de lado
      const near = q => Math.hypot(q[0] - J[t][0], q[1] - J[t][1]) - ((q[0] - J[a][0]) * (J[k][0] - J[a][0]) > 0 ? 4 : 0);
      J[t] = near(c[0]) <= near(c[1]) ? c[0] : c[1];
    }
  }
  return J;
}

export function prepare(fam) {
  if (fam.ready) return fam;
  if (fam.K) {
    fam.KJ = fam.K.map(p => {
      const J = solve(p, p.ik || {});
      if (p.swap) for (const [a, b] of SIDES) [J[a], J[b]] = [J[b], J[a]]; // pose espelhada no outro lado do corpo
      return J;
    });
    fam.KP = fam.KJ.map(toParams);
    const n = fam.KJ.length;
    fam.seg = fam.KJ.map((Ji, i) => {
      const Jj = fam.KJ[(i + 1) % n], c = [];
      for (const [end, mid, root, l1, l2, def] of LIMBS) {
        if (Math.abs(Ji[end][0] - Jj[end][0]) < 2.5 && Math.abs(Ji[end][1] - Jj[end][1]) < 8) { // apoio no mesmo lugar (pode só erguer o calcanhar)
          c.push([end, mid, root, l1, l2, Ji[end].slice(), bendOf(Ji, Jj, end, mid, root, def)]);
        }
      }
      return c;
    });
    // pé que troca de lugar no chão, decola ou aterrissa: segue reta até o apoio (com arco de passo/salto
    // quando sai e volta ao chão) em vez de arrastar no piso
    fam.swing = fam.KJ.map((Ji, i) => {
      const Jj = fam.KJ[(i + 1) % n], c = [];
      for (const [end, mid, root, l1, l2, def] of LIMBS) {
        const bent = J => Math.abs(crossS(J[root], J[mid], J[end])) > 40; // perna reta deixa a IK instável
        const lo = J => J[end][1] < 12, dx = Math.abs(Ji[end][0] - Jj[end][0]);
        if (end[0] === "a" && dx > 8 && ((lo(Ji) && bent(Ji)) || (lo(Jj) && bent(Jj)))) {
          c.push([end, mid, root, l1, l2, Ji[end].slice(), bendOf(Ji, Jj, end, mid, root, def), lo(Ji) && lo(Jj) ? Math.min(10, 0.25 * dx) : 0]);
        }
      }
      return c;
    });
  } else {
    fam.KJ = [solve(fam.A, fam.ik || {}), solve(fam.B, fam.ik || {})];
  }
  fam.ready = true;
  return fam;
}

// Outro lado do corpo (exercícios unilaterais): troca membros de perto/longe; na vista frontal também espelha em torno do quadril.
const SIDES = [["e", "e2"], ["w", "w2"], ["k", "k2"], ["a", "a2"], ["t", "t2"]];
export function famFrame(fam, phase) {
  const J = frameOf(fam, phase);
  if (!fam.swap) return J;
  if (fam.swap === "front") for (const k in J) J[k] = [2 * J.hip[0] - J[k][0], J[k][1]];
  for (const [a, b] of SIDES) [J[a], J[b]] = [J[b], J[a]];
  return J;
}

function frameOf(fam, phase) {
  prepare(fam);
  if (!fam.K) {
    const J = solve(lerpPose(fam.A, fam.B, 0.5 - 0.5 * Math.cos(phase * 2 * Math.PI)), fam.ik || {});
    if (fam.hop) {
      const h = fam.hop * Math.pow(Math.sin(phase * 2 * Math.PI), 2);
      for (const k in J) J[k] = [J[k][0], J[k][1] + h];
    }
    return floorGuard(J);
  }
  const n = fam.K.length, x = (phase % 1) * n, i = Math.floor(x), j = (i + 1) % n, e = 0.5 - 0.5 * Math.cos(Math.PI * (x - i));
  if (fam.proj) return floorGuard(lerpJ(fam.KJ[i], fam.KJ[j], e));
  const P = lerpParams(fam.KP[i], fam.KP[j], e), J = fromParams(P);
  if (fam.hop) {
    const h = fam.hop * Math.pow(Math.sin(phase * 2 * Math.PI), 2);
    for (const k in J) J[k] = [J[k][0], J[k][1] + h];
  }
  if (fam.pin) {
    const r = fam.pin, A = fam.K[i].at, B = fam.K[j].at;
    const o = [A[0] + (B[0] - A[0]) * e - J[r][0], A[1] + (B[1] - A[1]) * e - J[r][1]];
    for (const k in J) J[k] = add(J[k], o);
  }
  for (const [end, mid, root, l1, l2, tgt, b, lift = 0] of [...fam.seg[i], ...fam.swing[i]]) {
    const q = fam.KJ[j][end];
    const r = ik2(J[root], [tgt[0] + (q[0] - tgt[0]) * e, tgt[1] + (q[1] - tgt[1]) * e + lift * Math.sin(Math.PI * e)], l1, l2, b);
    J[mid] = r[0];
    J[end] = r[1];
    if (end === "a") J.t = add(J.a, v(angOf(J.k, J.a) + P.Fr, L.foot));
    if (end === "a2") J.t2 = add(J.a2, v(angOf(J.k2, J.a2) + P.Fr2, L.foot));
  }
  return floorGuard(J);
}
