// Templates de plano semanal, divisões de treino e restrições/cuidados

export const TPL = {
  fullA: { n: "Corpo inteiro A", p: ["cond", "push|tri", "squat", "back", "core"] },
  fullB: { n: "Corpo inteiro B", p: ["cond", "tri|push", "hinge", "shoulder", "core"] },
  fullC: { n: "Corpo inteiro C", p: ["cond", "push-", "squat-", "back|shoulder", "calf|hinge", "core"] },
  upA: { n: "Superior A", p: ["cond", "push", "back", "tri|shoulder", "core"] },
  lowA: { n: "Inferior A", p: ["cond", "squat", "hinge", "calf", "core|cond"] },
  upB: { n: "Superior B", p: ["shoulder", "push-", "back-", "cond", "core"] },
  lowB: { n: "Inferior B", p: ["squat-", "hinge-", "cond", "calf", "core"] },
  pushD: { n: "Peito e ombros", p: ["cond", "push", "shoulder", "tri", "core|cond"] },
  backD: { n: "Costas e abdômen", p: ["cond", "back", "back-", "core", "core-"] },
  legsD: { n: "Pernas", p: ["cond", "squat", "hinge", "squat-", "calf"] }
};

export const SPLIT = {
  2: ["fullA", "fullB"],
  3: ["fullA", "fullB", "fullC"],
  4: ["upA", "lowA", "upB", "lowB"],
  5: ["pushD", "backD", "legsD", "upA", "lowB"],
  6: ["pushD", "backD", "legsD", "upB", "lowA", "fullA"]
};

export const DAYMAP = {
  2: [0, 3],
  3: [0, 2, 4],
  4: [0, 1, 3, 4],
  5: [0, 1, 2, 4, 5],
  6: [0, 1, 2, 3, 4, 5]
};

export const DAYS = ["Seg", "Ter", "Qua", "Qui", "Sex", "Sáb", "Dom"];
export const DAYFULL = ["Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado", "Domingo"];

export const NIVEIS = [["ini", "Iniciante"], ["int", "Intermediário"], ["avc", "Avançado"]];
export const OBJS = [["forca", "Força"], ["hiper", "Hipertrofia"], ["res", "Resistência"]];
export const FORMATOS = [["circ", "Circuito militar"], ["series", "Séries"]];

export const SCHEME = {
  forca: { s: 5, r: "4–6 reps", h: "20–30 s", rest: 120 },
  hiper: { s: 4, r: "10–15 reps", h: "30–45 s", rest: 75 },
  res: { s: 3, r: "20–30 reps", h: "45–60 s", rest: 40 }
};

export const INTENSIDADES = [["leve", "Leve"], ["moderada", "Moderada"], ["intensa", "Intensa"], ["maxima", "Máxima"]];

export const INT_ADJ = {
  leve: { r: -1, w: -10, p: 15, rr: 30, sets: -1, rest: 30, lv: -1, amt: 0.7 },
  moderada: { r: 0, w: 0, p: 0, rr: 0, sets: 0, rest: 0, lv: 0, amt: 1 },
  intensa: { r: 1, w: 5, p: -5, rr: -15, sets: 0, rest: -15, lv: 0, amt: 1.15 },
  maxima: { r: 1, w: 10, p: -5, rr: -30, sets: 1, rest: -30, lv: 1, amt: 1.3 }
};

export const RESTR = {
  impacto: { l: "Sem impacto (sem saltos)", f: ["jsquat", "jlunge", "burpee", "burpee_pu", "jack", "skip", "pushup_exp"] },
  joelho: { l: "Joelho sensível", f: ["pistol", "pistol_neg", "cossack", "jlunge", "jsquat", "burpee", "burpee_pu", "lunge", "skip", "nordic", "rev_nordic"] },
  lombar: { l: "Lombar sensível", f: ["superman", "superman_iso", "situp", "vup", "legraise", "flutter", "goodmorning", "remador", "hollow", "wheel_bridge", "dragon_flag"] },
  punho: { l: "Punho ou ombro sensível", f: ["pushup", "pushup_knee", "pushup_neg", "pushup_exp", "pushup_arch", "pushup_wall", "hindu", "pike", "plank_dd", "bear", "mclimb", "shoulder_tap", "burpee", "burpee_pu", "sprawl", "inchworm", "updown", "kickback", "sphinx", "scap_push", "lsit", "wheel_bridge", "crow"] }
};

export const OLD_AVOID = ["pistol", "pistol_neg", "cossack", "rdl", "jsquat", "jlunge", "burpee", "burpee_pu", "pushup_exp", "pushup_arch", "jack", "skip", "sprawl", "wheel_bridge", "dragon_flag", "nordic", "rev_nordic", "crow", "lsit"];

export const FALLBACK = {
  push: ["tri", "core"],
  tri: ["push", "core"],
  shoulder: ["back", "core"],
  back: ["core"],
  squat: ["hinge", "calf"],
  hinge: ["squat", "core"],
  calf: ["squat"],
  core: ["back", "hinge"],
  cond: ["squat", "core", "hinge"]
};
