// Gerador de treinos semanais, prescrição de volume/intensidade e desafios
import { LIB } from "../data/exercises.js";
import { TPL, SPLIT, DAYMAP, SCHEME, INT_ADJ, RESTR, OLD_AVOID, FALLBACK } from "../data/plans.js";
import { exIntensity } from "../data/tempo.js";
import { state, weekId, save } from "./storage.js";

export const IA = () => INT_ADJ[state.profile.intens] || INT_ADJ.moderada;
export const old60 = () => state.profile.idade === "60+";

export function circCfg(n = 5) {
  const { profile } = state;
  const base = {
    forca: { r: 4, w: 30, p: 30, rr: 120 },
    hiper: { r: 3, w: 40, p: 20, rr: 90 },
    res: { r: 4, w: 45, p: 15, rr: 60 }
  }[profile.objetivo];
  const adj = {
    ini: { r: -1, w: -10 },
    int: { r: 0, w: 0 },
    avc: { r: 1, w: 5 }
  }[profile.nivel];
  const I = IA();
  let r = base.r + adj.r + I.r, w = base.w + adj.w + I.w, pa = base.p + I.p, rr = base.rr + I.rr;
  if (old60()) { w -= 5; pa += 10; rr += 30; }
  w = Math.max(20, w);
  pa = Math.max(10, pa);
  rr = Math.max(30, rr);
  r = Math.max(2, Math.min(6, r));
  if (profile.dur) {
    const per = n * w + (n - 1) * pa;
    r = Math.max(1, Math.min(8, Math.round((profile.dur * 60 - 300 + rr) / (per + rr))));
  }
  return { rounds: r, work: w, pause: pa, roundRest: rr };
}

export function allowedEx(ex) {
  const low = /sem salto|marcha/i.test(ex.n), R = state.profile.restr || {};
  for (const k in RESTR) {
    if (R[k] && RESTR[k].f.includes(ex.f) && !(k === "impacto" && low) && !(k === "joelho" && low)) return false;
  }
  if (old60() && OLD_AVOID.includes(ex.f) && !low) return false;
  return true;
}

export function baseLevel(key) {
  const len = LIB[key].length, frac = { ini: 0, int: 0.35, avc: 0.6 }[state.profile.nivel];
  return Math.min(len - 1, Math.max(0, Math.floor(frac * len) + (state.profile.objetivo === "forca" && state.profile.nivel !== "ini" ? 1 : 0)));
}

export const lvl = key => state.levels[key] ?? baseLevel(key);
export const effL = (key, L) => Math.max(0, Math.min(LIB[key].length - 1, L + IA().lv + (old60() ? -1 : 0)));

export function hashStr(t) {
  let h = 2166136261;
  for (let i = 0; i < t.length; i++) {
    h ^= t.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

export function rng(seed) {
  return () => {
    seed = (seed + 0x6D2B79F5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function pickIdx(key, L, r, used, spread) {
  const len = LIB[key].length, wide = key === "cond" || key === "core";
  const lo = Math.max(0, L - (spread || 2)), hi = Math.min(len - 1, L + (spread ? 1 : wide ? 1 : 0)), cand = [];
  for (let i = lo; i <= hi; i++) {
    if (!used.has(LIB[key][i].n) && !used.has(LIB[key][i].f) && allowedEx(LIB[key][i])) cand.push(i);
  }
  if (!cand.length) {
    let best = -1, bd = 1e9;
    LIB[key].forEach((e, i) => {
      if (!used.has(e.n) && !used.has(e.f) && allowedEx(e) && Math.abs(i - L) < bd) {
        bd = Math.abs(i - L);
        best = i;
      }
    });
    if (best < 0) {
      LIB[key].forEach((e, i) => {
        if (!used.has(e.n) && allowedEx(e) && Math.abs(i - L) < bd) {
          bd = Math.abs(i - L);
          best = i;
        }
      });
    }
    return best;
  }
  const w = cand.map(i => i === L ? 1.5 : 1);
  let t = r() * w.reduce((a, b) => a + b, 0);
  for (let k = 0; k < cand.length; k++) {
    t -= w[k];
    if (t <= 0) return cand[k];
  }
  return cand[cand.length - 1];
}

export function safePick(key, L, r, used, spread) {
  for (const k of [key, ...(FALLBACK[key] || [])]) {
    const i = pickIdx(k, k === key ? L : effL(k, lvl(k)), r, used, spread);
    if (i >= 0) return [k, i];
  }
  return [key, 0];
}

export function buildWeek() {
  const { profile, rerolls } = state;
  const plan = Array(7).fill(null), sc = SCHEME[profile.objetivo];
  SPLIT[profile.dias].forEach((t, i) => {
    const tpl = TPL[t], dIdx = DAYMAP[profile.dias][i];
    const r = rng(hashStr(`${weekId}|${dIdx}|${rerolls[dIdx] || 0}|${profile.nivel}|${profile.objetivo}|${profile.dias}|${profile.intens}|${JSON.stringify(profile.restr || {})}|${profile.idade}`));
    const used = new Set();
    const items = tpl.p.map((raw, j) => {
      const alts = raw.split("|"), pick = alts[Math.floor(r() * alts.length)];
      const vol = pick.endsWith("-"), key = pick.replace("-", "");
      const [k2, idx] = safePick(key, effL(key, lvl(key) - (vol ? 1 : 0)), r, used);
      const ex = LIB[k2][idx];
      used.add(ex.n);
      used.add(ex.f);
      const I = IA(), light = k2 === "core" || k2 === "calf" || k2 === "cond";
      let sets = Math.max(2, sc.s - (profile.nivel === "ini" ? 1 : 0) + (vol ? 1 : 0) + I.sets);
      if (light) sets = Math.min(sets, 3);
      let rest = Math.max(profile.objetivo === "forca" ? 60 : 30, sc.rest + I.rest + (old60() ? 20 : 0));
      if (light) rest = Math.min(rest, old60() ? 60 : 45);
      return { id: `${raw}${j}`, p: k2, key: k2, idx, vol, ex, sets, dose: ex.t === "s" ? sc.h : sc.r, rest };
    });
    if (profile.dur && profile.formato !== "circ") {
      const est = items.reduce((a, it) => a + it.sets * (45 + it.rest), 0) + 300, f = (profile.dur * 60) / est;
      items.forEach(it => (it.sets = Math.max(1, Math.min(6, Math.round(it.sets * f)))));
    }
    plan[DAYMAP[profile.dias][i]] = { name: tpl.n, items };
  });
  return plan;
}

export const fmtMin = s => Math.round(s / 60);

export function dayMinutes(day) {
  if (state.profile.formato === "circ") {
    const n = day.items.length, c = circCfg(n);
    return fmtMin(c.rounds * (n * c.work + (n - 1) * c.pause) + (c.rounds - 1) * c.roundRest) + 8;
  }
  return fmtMin(day.items.reduce((a, it) => a + it.sets * (45 + it.rest), 0)) + 8;
}

export function dayIntensity(day) {
  const { profile } = state;
  const avg = day.items.reduce((a, it) => a + exIntensity(it.key, it.idx), 0) / day.items.length;
  const dens = profile.formato === "circ" ? (c => c.work / (c.work + c.pause))(circCfg(day.items.length)) : 45 / (45 + day.items[0].rest);
  const v = Math.max(
    1,
    Math.min(
      5,
      Math.round(
        avg * 0.75 +
          dens * 2 +
          { forca: -0.2, hiper: 0, res: 0.3 }[profile.objetivo] +
          ({ leve: -1, moderada: 0, intensa: 0.4, maxima: 1 }[profile.intens] || 0) +
          (old60() ? -0.5 : 0)
      )
    )
  );
  return {
    v,
    kcal: Math.round(([0, 3.5, 5, 6.5, 8, 9.5][v] * (profile.peso || 70) * dayMinutes(day)) / 60),
    rpe: { leve: "3–4", moderada: "5–6", intensa: "7–8", maxima: "8–9" }[profile.intens || "moderada"]
  };
}

export function dayPct(i, d) {
  if (state.profile.formato === "circ") {
    return Math.round(Math.min(1, (state.done[`${i}|circ`] || 0) / circCfg(d.items.length).rounds) * 100);
  }
  const tot = d.items.reduce((a, x) => a + x.sets, 0);
  const got = d.items.reduce((a, x) => a + Math.min(x.sets, state.done[`${i}|${x.id}`] || 0), 0);
  return Math.round((got / tot) * 100);
}

export function adjustLevel(key, d) {
  const off = IA().lv + (old60() ? -1 : 0);
  state.levels[key] = Math.min(LIB[key].length - 1, Math.max(0, effL(key, lvl(key)) + d)) - off;
  save();
}

// Funções de desafios
export const isRest = (c, d) => d < c.days && d % 4 === 0;
export const chalState = id => state.chal[id] || { done: [] };
export const chalNext = c => {
  const st = chalState(c.id);
  for (let d = 1; d <= c.days; d++) if (!st.done.includes(d)) return d;
  return c.days + 1;
};

export function chalDay(c, d) {
  if (isRest(c, d)) return null;
  let trained = 0;
  for (let i = 1; i < d; i++) if (!isRest(c, i)) trained++;
  const { profile, chal } = state;
  const lvlK = profile.nivel, grow = (1 + c.g * trained) * IA().amt * (old60() ? 0.8 : 1);
  const ur = rng(hashStr(c.id + "|t|" + d)), uu = new Set();
  const fix = (k, name) => {
    const list = LIB[k];
    const idx = Math.max(0, list.findIndex(e => e.n === name));
    if (allowedEx(list[idx])) return [k, idx];
    return safePick(k, effL(k, lvl(k)), ur, uu, 3);
  };
  if (d === c.days) {
    return c.test.map(it => {
      const [k, idx] = fix(it.k, it.name), ex = LIB[k][idx], s = ex.t === "s";
      uu.add(ex.n);
      return {
        k, idx, ex,
        amt: Math.round((s ? c.t[lvlK] : c.r[lvlK]) * grow),
        sets: 1, s, max: true,
        txt: s ? "máximo de tempo" : "máximo de repetições"
      };
    });
  }
  const r = rng(hashStr(`${c.id}|${d}|${lvlK}|${(chal[c.id] && chal[c.id].seed) || 0}|${JSON.stringify(profile.restr || {})}|${profile.idade}`));
  const used = new Set();
  return c.slots.map(it => {
    const [k, idx] = it.name ? fix(it.k, it.name) : safePick(it.k, effL(it.k, lvl(it.k)), r, used, 3);
    const ex = LIB[k][idx];
    used.add(ex.n); uu.add(ex.n);
    const s = ex.t === "s", amt = Math.round((s ? c.t[lvlK] : c.r[lvlK]) * grow);
    return {
      k, idx, ex, amt, sets: it.sets, s,
      txt: s ? `${it.sets} × ${amt} s` : `${it.sets} × ${amt} repetições`
    };
  });
}
