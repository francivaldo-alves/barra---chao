// Regras do boneco 2D usadas pelo teste de terminal (anim-check.js) e pela página visual (check.html):
// membros sem esticar, sem saltos entre quadros, nada abaixo do chão, amplitude articular e curvatura anatômica válidas.
import { L, famFrame, angOf, nrm } from "../src/engine/kinematics2d.js";
import { FAM, MIRROR, FRONTV, spineCurveOf, famFor, D2 } from "../src/data/poses.js";
import { LIB } from "../src/data/exercises.js";

const D = (p, q) => Math.hypot(p[0] - q[0], p[1] - q[1]);
const segs = [
  ["s", "e", L.ua],
  ["e", "w", L.fa],
  ["s", "e2", L.ua],
  ["e2", "w2", L.fa],
  ["hip", "k", L.th],
  ["k", "a", L.sh],
  ["hip", "k2", L.th],
  ["k2", "a2", L.sh],
  ["a", "t", L.foot],
  ["a2", "t2", L.foot],
  ["hip", "s", L.torso],
  ["s", "h", L.neck]
];

// Amplitude articular no plano sagital (graus; + = flexão / dorsiflexão). Base AAOS com margem passiva;
// o pé é um segmento único (inclui os dedos), por isso o tornozelo tem folga para dedos apoiados/estendidos.
const ROM = { ombro: [-60, 195], cotov: [-5, 155], quadril: [-30, 150], joelho: [-5, 160], tornoz: [-75, 50], pesc: [-45, 45] };
// superman: no 2D é a projeção da puxada W (o 3D faz o W real); wheel_bridge: a linha do tronco inclui a extensão torácica
const ROM_EXC = { superman: ["ombro", "cotov"], wheel_bridge: ["ombro"] };

function romOf(k, J0) {
  const m = MIRROR.has(k) ? -1 : 1, J = {}, o = [];
  for (const j in J0) J[j] = [m * J0[j][0], J0[j][1]];
  const T = angOf(J.hip, J.s);
  for (const [e, w, n] of [["e", "w", ""], ["e2", "w2", "2"]]) {
    const sh = ((angOf(J.s, J[e]) - T - 180) % 360 + 360) % 360;
    o.push(["ombro" + n, sh > 270 ? sh - 360 : sh], ["cotov" + n, nrm(angOf(J[e], J[w]) - angOf(J.s, J[e]))]);
  }
  for (const [kn, a, t, n] of [["k", "a", "t", ""], ["k2", "a2", "t2", "2"]]) {
    o.push(["quadril" + n, nrm(angOf(J.hip, J[kn]) - T - 180)], ["joelho" + n, nrm(angOf(J.hip, J[kn]) - angOf(J[kn], J[a]))], ["tornoz" + n, nrm(angOf(J[a], J[t]) - angOf(J[kn], J[a]) - 90)]);
  }
  o.push(["pesc", nrm(angOf(J.s, J.h) - T)]);
  return o;
}


// todas as famílias + variantes usadas pela biblioteca (pegada, outro lado) + desenhos só do 2D
export const ALL = Object.keys(FAM).map(k => [k, FAM[k], k, {}]);
for (const g in LIB) for (const ex of LIB[g]) {
  for (const side of [1, 2]) {
    const f = famFor(ex.f, ex.n, side);
    if (f !== FAM[ex.f] && !ALL.some(([, q]) => q === f)) ALL.push([ex.f, f, ex.n + (side === 2 ? " (outro lado)" : ""), { name: ex.n, side }]);
  }
}
for (const k in D2) ALL.push([k, D2[k], k + " (2D)", {}]);

// N quadros por movimento; devolve a lista de defeitos (vazia = tudo certo)
export function runChecks(N = 2000) {
  const bad = [];
  for (const [k, fam, nome] of ALL) {
  let prev = null;
  for (let i = 0; i <= N; i++) {
    const ph = i / N, J = famFrame(fam, ph), at = `${nome} fase ${ph.toFixed(3)}`;
    for (const [a, b, l] of segs) {
      if (Math.abs(D(J[a], J[b]) - l) > 0.05) {
        bad.push(`${at}: ${a}-${b} com ${D(J[a], J[b]).toFixed(2)} (esperado ${l})`);
      }
    }
    for (const j in J) {
      if (J[j][1] < -0.5) bad.push(`${at}: ${j} abaixo do chão (y=${J[j][1].toFixed(1)})`);
    }
    if (prev) {
      for (const j in J) {
        if (D(J[j], prev[j]) > 1) bad.push(`${at}: ${j} saltou ${D(J[j], prev[j]).toFixed(2)}`);
      }
    }
    if (!FRONTV.has(k)) {
      for (const [j, x] of romOf(k, J)) {
        const [lo, hi] = ROM[j.replace(/2$/, "")];
        if ((x < lo || x > hi) && !ROM_EXC[nome]?.includes(j.replace(/2$/, ""))) bad.push(`${at}: ${j} fora da amplitude articular (${x.toFixed(0)}°)`);
      }
    }
    const bend = spineCurveOf(k, J);
    if (Math.abs(bend) > 8) {
      bad.push(`${at}: curvatura da coluna fora do limite anatômico (${bend.toFixed(2)})`);
    }
    prev = J;
  }
}
  return bad;
}
