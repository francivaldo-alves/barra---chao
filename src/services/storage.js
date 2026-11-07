// Persistência local (localStorage) e estado global do aplicativo

export const store = {
  get(k, d) {
    try {
      const x = localStorage.getItem("bc2_" + k);
      return x ? JSON.parse(x) : d;
    } catch (e) {
      return d;
    }
  },
  set(k, x) {
    try {
      localStorage.setItem("bc2_" + k, JSON.stringify(x));
    } catch (e) {}
  }
};

// Semana atual (segunda-feira como início): o treino muda sozinho a cada semana
export const weekId = (() => {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() - ((d.getDay() + 6) % 7));
  return Math.round(d.getTime() / 864e5);
})();

export const todayIdx = (new Date().getDay() + 6) % 7;

const savedProfile = store.get("profile", { nivel: "int", objetivo: "res", dias: 3, formato: "circ" });

export const state = {
  profile: {
    intens: "moderada",
    idade: "<40",
    dur: 0,
    peso: 70,
    restr: {},
    ...savedProfile
  },
  levels: store.get("levels", {}),
  done: store.get("done", {}),
  taf: store.get("taf", []),
  rerolls: store.get("rerolls", {}),
  chal: store.get("chal", {}),
  selected: todayIdx,
  want2D: false
};

// Se virou a semana, limpa progresso e sorteios da semana anterior
if (store.get("wk", null) !== weekId) {
  state.done = {};
  state.rerolls = {};
  store.set("wk", weekId);
  store.set("done", state.done);
  store.set("rerolls", state.rerolls);
}

export function save() {
  store.set("profile", state.profile);
  store.set("levels", state.levels);
  store.set("done", state.done);
  store.set("taf", state.taf);
  store.set("rerolls", state.rerolls);
  store.set("chal", state.chal);
}
