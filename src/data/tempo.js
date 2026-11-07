// Ritmo (tempo de execução) e cálculo de intensidade de cada exercício
import { LIB, TIP } from "./exercises.js";
import { FAM } from "./poses.js";
import { state } from "../services/storage.js";

// [ida A→B, pausa em B, volta B→A, pausa em A, verbo da ida, verbo da volta] em segundos.
// Padrão único por tipo de movimento, para todos andarem na mesma cadência:
//   força: excêntrica 1,5 s · concêntrica 1,0 s · pausas 0,2 s (≈ 2,9 s/rep)
//   pico: concêntrica 1,0 s · segura 0,6 s no topo · excêntrica 1,5 s (posteriores, glúteo, panturrilha, escápula)
//   avançado: excêntrica 2,0 s · concêntrica 1,3 s · pausas 0,3 s
//   cardio: 0,6 s por meia-volta, sem pausa
// Números = segundos por transição entre poses-chave dos movimentos em sequência (K).
const desce = (v1 = "desce", v2 = "sobe") => [1.5, 0.2, 1.0, 0.2, v1, v2];
const sobe = (v1 = "sobe", v2 = "desce") => [1.0, 0.2, 1.5, 0.2, v1, v2];
const pico = (v1 = "sobe", v2 = "desce") => [1.0, 0.6, 1.5, 0.2, v1, v2];
const desceAv = (v1 = "desce", v2 = "sobe") => [2.0, 0.3, 1.3, 0.3, v1, v2];
const sobeAv = (v1 = "sobe", v2 = "desce") => [1.3, 0.3, 2.0, 0.3, v1, v2];
const cardio = (v1, v2) => [0.6, 0, 0.6, 0, v1, v2];
const SEG_CTRL = 1.0, SEG_DIN = 0.6, SEG_FORCA = 1.25; // força: média de 1,5 s descendo e 1,0 s subindo

export const TEMPO = {
  pushup_wall: desce("inclina", "empurra"),
  pushup: desce(),
  pushup_knee: desce(),
  pushup_neg: [2, 2, 1, 1, 1], // segundos por etapa: desce 4 s na prancha (como diz a dica), apoia os joelhos, sobe, volta à prancha
  pushup_exp: 0.7, // 4 fases dinâmicas com fase aérea pliométrica
  pushup_arch: SEG_FORCA, // alterna esquerda e direita
  pike: desce(),
  sphinx: sobe(),
  plank_dd: pico("sobe", "desce"),
  superman: pico(),
  superman_alt: [1.0, 0.6, 1.0, 0.6, "sobe", "troca"],
  prone_y: pico(),
  backwidow: pico(),
  squat: desce(),
  squat_pr: desce(),
  sumo: desce(),
  lunge: SEG_FORCA,
  lunge_rev: SEG_FORCA,
  side_lunge: SEG_FORCA,
  cossack: 1.35,
  pistol: desceAv(),
  pistol_neg: 1.0, // 5 fases × 1,0s = descida lenta unilateral + subida com os dois pés
  bridge: pico(),
  bridge1: pico(),
  goodmorning: desce("inclina", "volta"),
  rdl: desce("inclina", "volta"),
  calf: pico(),
  calf1: pico(),
  tibialis: pico("puxa", "desce"),
  kickback: pico(),
  plank_leg: pico(),
  scap_push: pico("empurra", "retrai"),
  shoulder_tap: SEG_CTRL, // alterna os braços: 1 s sobe a mão, 1 s volta
  deadbug: desce("estende", "volta"),
  legraise: sobe(),
  crunch: sobe(),
  situp: sobe(),
  remador: sobe("fecha", "estende"),
  vup: sobe(),
  wheel_bridge: [1.3, 0.6, 2.0, 0.3, "sobe", "desce"],
  nordic: desceAv(),
  rev_nordic: desceAv("inclina", "volta"),
  dragon_flag: sobeAv(),
  jack: cardio("abre", "fecha"),
  skip: cardio("sobe", "troca"),
  mclimb: cardio("puxa", "troca"),
  flutter: cardio("bate", "bate"),
  skip_run: [0.45, 0, 0.45, 0, "sobe", "troca"], // corrida: mais rápida que a marcha de propósito
  jack_step: SEG_DIN,
  jsquat: SEG_DIN,
  jlunge: SEG_DIN,
  sprawl: SEG_DIN,
  burpee: SEG_DIN,
  burpee_pu: SEG_DIN,
  hindu: SEG_CTRL,
  inchworm: SEG_CTRL,
  updown: SEG_CTRL
};

export const ISO = new Set(["plank", "side_plank", "hollow", "bear", "wall_sit", "lsit", "crow", "superman_iso", "bridge_iso"]);

export function tempoOf(fk, name) {
  const n = (name || "").toLowerCase();
  if (ISO.has(fk) || /isom|segurad/.test(n)) {
    return { iso: true, ab: 1.2, hb: 2.8, ba: 1.0, ha: 0.6, rep: 5.6, v1: "entra", v2: "sai" };
  }
  const T = TEMPO[fk];
  if (T == null) return null;
  const profile = state.profile;
  const calmo = profile && (profile.intens === "leve" || profile.idade === "60+" || profile.nivel === "ini");
  const sl = calmo ? 1.15 : 1;
  if (typeof T === "number") {
    return { K: true, rep: T * FAM[fk].K.length * sl };
  }
  if (T.every(x => typeof x === "number")) {
    // sequência com tempo próprio por etapa (uma entrada por pose de FAM[fk].K)
    const segs = T.map(x => x * sl);
    return { K: true, segs, rep: segs.reduce((a, b) => a + b, 0) };
  }
  let [ab, hb, ba, ha, v1, v2] = T;
  const cardio = !hb && !ha && ab < 1, desc = /^(desce|inclina|estende)$/.test(v1); // desc: a ida é a descida
  if (cardio) { ab *= sl; ba *= sl; }
  else if (calmo) {
    // iniciante / 60+: descida controlada de 2 s e meio segundo parado embaixo
    if (desc) { ab = Math.max(ab, 2); hb = Math.max(hb, 0.5); } else { ba = Math.max(ba, 2); ha = Math.max(ha, 0.5); }
  }
  if (/marcha|sem salto/.test(n) && fk !== "skip") { ab *= 1.2; ba *= 1.2; }
  if (/pausa/.test(n)) hb = 2.0; // "com pausa" sem tempo escrito na dica
  if (/negativ/.test(n)) ab = 3.2;
  if (/explosiv/.test(n)) ba = 0.45;
  if (/salto/.test(n) && !/sem salto/.test(n)) ba = Math.min(ba, 0.65);
  // tempo escrito na dica do exercício manda ("Desça em 4 s", "Pausa de 3 segundos", "aperte por 1 s")
  const d = (TIP.get(name) || "").toLowerCase(), num = re => { const m = d.match(re); return m ? +m[1].replace(",", ".") : 0; };
  const sDesce = num(/(?:desç|descida)[^.;]*?(\d+(?:,\d+)?) ?s(?:egundos?)?\b/), sPara = num(/(?:paus|segur|pare|apert)[^.;]*?(\d+(?:,\d+)?) ?s(?:egundos?)?\b/);
  if (sDesce) desc ? (ab = sDesce) : (ba = sDesce);
  if (sPara) hb = sPara;
  return { ab, hb, ba, ha, v1, v2, rep: ab + hb + ba + ha };
}

export function tempoPhase(tp, t) {
  if (tp.segs) {
    let x = t % tp.rep, i = 0;
    while (i < tp.segs.length - 1 && x >= tp.segs[i]) x -= tp.segs[i++];
    return (i + Math.min(1, x / tp.segs[i])) / tp.segs.length;
  }
  if (tp.K) return (t / tp.rep) % 1;
  let x = t % tp.rep;
  const sm = u => u * u * (3 - 2 * u);
  if (x < tp.ab) return Math.acos(1 - 2 * sm(x / tp.ab)) / (2 * Math.PI);
  if ((x -= tp.ab) < tp.hb) return 0.5;
  if ((x -= tp.hb) < tp.ba) return 1 - Math.acos(1 - 2 * (1 - sm(x / tp.ba))) / (2 * Math.PI);
  return 0;
}

export const fmtS = x => String(+x.toFixed(1)).replace(".", ",");

export function tempoTxt(tp) {
  if (!tp) return "";
  if (tp.iso) return "Isometria: entre na posição em cerca de 1,5 s e segure parado, respirando normalmente";
  if (tp.K) return `Cerca de ${fmtS(tp.rep)} s por repetição (≈ ${Math.round(60 / tp.rep)} por minuto)`;
  return `${fmtS(tp.ab)} s ${tp.v1}${tp.hb ? ` · ${fmtS(tp.hb)} s pausa` : ""} · ${fmtS(tp.ba)} s ${tp.v2} (≈ ${Math.round(60 / tp.rep)} por minuto)`;
}

export const tempoShort = tp => !tp ? "" : tp.iso ? "isometria" : tp.K ? `${fmtS(tp.rep)} s/rep` : `${fmtS(tp.ab)}-${fmtS(tp.hb)}-${fmtS(tp.ba)}`;

export const INTENS = {
  jack_step: 2, skip_run: 4, pushup_wall: 1, burpee: 5, burpee_pu: 5, jlunge: 5, jsquat: 4,
  sprawl: 4, mclimb: 4, skip: 4, pistol: 4, pistol_neg: 3, jack: 3, inchworm: 2, pushup: 3, pushup_knee: 2,
  pushup_neg: 2, pushup_exp: 4, pushup_arch: 4,
  hindu: 3, pike: 3, sphinx: 2, plank_dd: 2, bear: 2, updown: 3, superman: 1, superman_alt: 1, superman_iso: 2,
  prone_y: 1, backwidow: 2, squat: 2, squat_pr: 2, sumo: 2, lunge: 3, lunge_rev: 2, side_lunge: 2, cossack: 3, wall_sit: 2,
  bridge: 1, bridge_iso: 1, bridge1: 2, goodmorning: 1, rdl: 2, kickback: 1, calf: 1, calf1: 1, plank: 2,
  side_plank: 2, shoulder_tap: 2, plank_leg: 2, crunch: 1, situp: 2, remador: 2, legraise: 2,
  hollow: 2, vup: 3, flutter: 2, deadbug: 1,
  scap_push: 2, lsit: 4, wheel_bridge: 4, nordic: 4, rev_nordic: 3, dragon_flag: 5, tibialis: 1, crow: 4
};

export function exIntensity(k, idx) {
  const f = LIB[k][idx].f, n = LIB[k].length;
  return Math.min(5, (INTENS[f] || 2) + (idx >= n * 0.66 ? 1 : 0));
}

export const INT_LBL = ["", "Leve", "Moderada", "Moderada", "Alta", "Muito alta"];
