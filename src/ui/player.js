// Player de intervalos (Circuito Militar, Séries Guiadas, Desafios e Simulado TAF)
import { $, ptop } from "./dom.js";
import { openSheet, closeSheet, registerPlayerHooks } from "./sheet.js";
import { stopTimer } from "./timer.js";
import { audio, beep, speak, cancelSpeech, lockScreen, releaseWakeLock, NUM } from "../services/audio.js";
import { state, save } from "../services/storage.js";
import { circCfg } from "../services/planner.js";
import { tempoOf } from "../data/tempo.js";
import { TIP } from "../data/exercises.js";
import { UNILAT } from "../data/poses.js";
import { figure } from "../engine/figure2d.js";
import { V3 } from "../engine/viewer3d.js";

let player = null;
const LEAD = 1.4, VLAT = 0.48; // VLAT: atraso médio da voz até começar a soar

// Dica falada antes de cada exercício: técnica curta + respiração (+ aviso de troca de lado)
function brief(w) {
  if (!w) return "";
  const tp = tempoOf(w.fam, w.name);
  const ar = !tp || tp.K || (!tp.iso && tp.rep < 2.2) ? "" : tp.iso ? "Respire normalmente." : "Solte o ar na força.";
  return [TIP.get(w.name) || "", ar, UNILAT.has(w.fam) ? "Na metade, troque de lado." : ""].filter(Boolean).join(" ");
}

export function isPlayerActive() {
  return !!player;
}

export function stopPlayer() {
  if (player) {
    clearInterval(player.id);
    clearInterval(player.rid);
    player = null;
    cancelSpeech();
  }
  releaseWakeLock();
}

registerPlayerHooks(stopPlayer, isPlayerActive);

export function runPlayer(title, steps, onFinish) {
  audio();
  lockScreen();
  stopPlayer();
  stopTimer();

  const p = $("panel");
  p.innerHTML = ptop("Em andamento", title) + `<div class="player">
    <div class="phase" id="pphase"></div><div class="fig" id="pfig" style="cursor:default"></div><h3 id="pname"></h3>
    <div class="count" id="pcount">0</div><div class="pbar"><i id="pbar"></i></div><div class="upnext" id="pnext"></div>
    <div class="pctl"><button class="ghost" type="button" id="pvoice"></button><button class="ghost" type="button" id="ppause">Pausar</button><button class="ghost" type="button" id="pskip">Pular</button><button class="ghost" type="button" id="pstop">Encerrar</button></div></div>`;
  p.querySelector(".close").onclick = closeSheet;
  if ($("sheet").hidden) openSheet();

  player = { i: -1, left: 0, paused: false, id: null, rid: null, steps, at: 0, pauseAt: 0 };
  const total = steps.reduce((a, s) => a + s.sec, 0);
  let elapsed = 0;

  const endStep = () => {
    const st = steps[player.i];
    if (st && st.onEnd) {
      try { st.onEnd(); } catch (e) {}
    }
  };

  function draw() {
    $("pcount").textContent = player.left;
    $("pbar").style.width = `${Math.min(100, (elapsed / total) * 100)}%`;
  }

  function show(i) {
    player.i = i;
    const st = steps[i];
    player.left = st.sec;
    $("pskip").textContent = st.reps ? "Concluí" : "Pular";
    $("pphase").textContent = st.phase;
    $("pphase").className = "phase " + st.kind;
    $("pname").textContent = st.name;
    const fig = $("pfig");
    fig.innerHTML = "";
    const fam = st.fam || (steps[i + 1] && steps[i + 1].fam);
    const still = st.kind !== "work";
    let tpS = still ? null : tempoOf(fam, st.name);
    if (tpS && tpS.iso) {
      const ab = 1.2, ba = 1.0;
      tpS = { ...tpS, ab, ba, ha: 0, hb: Math.max(1, st.sec - ab - ba - LEAD), rep: Math.max(ab + ba + 1, st.sec - LEAD) };
    }
    st.tp = tpS;
    st.rt = still ? 0 : -LEAD;
    st.waiting = !still;
    st.waitT = 0;
    st.seg = -1;
    st.said = {};
    const clock = () => (player && player.steps === steps && player.i === i ? st.rt : 0);
    const mount = side => {
      fig.innerHTML = "";
      const fig2 = () => figure(fam, { ghost: still, label: st.name, side, tempo: tpS, clock }).node;
      if (fam && !(V3.ok() && !state.want2D && V3.mount(fig, fam, { name: st.name, side, tempo: tpS, clock, onFail: () => { fig.innerHTML = ""; fig.appendChild(fig2()); } }))) {
        fig.appendChild(fig2());
      }
    };
    mount(1);
    st.side2 = !still && UNILAT.has(fam) ? () => mount(2) : null;
    st.cd = {};
    player.at = performance.now();
    $("pphase").textContent = st.phase + (still ? " · posição inicial" : "");
    const nx = steps.slice(i + 1).find(s => s.kind === "work");
    $("pnext").textContent = nx ? `A seguir: ${nx.name}` : "Último bloco";
    beep(st.kind === "work" ? 988 : 660, st.kind === "work" ? 0.4 : 0.25);
    const nxw = steps.slice(i + 1).find(s => s.kind === "work");
    let txt =
      st.say ||
      (st.kind === "prep"
        ? `Prepare-se. Primeiro: ${st.name}.`
        : st.kind === "work"
        ? `${st.name}. Vai!`
        : st.round0
        ? `Fim da volta ${st.round0}. Descanse.`
        : nxw
        ? `Descanso. Próximo: ${nxw.name}.`
        : "Descanso.");
    // dica do próximo exercício só se é outro exercício e se cabe antes da contagem final (~14 letras por segundo)
    const prevW = steps.slice(0, i).reverse().find(s => s.kind === "work"), extra = st.kind !== "work" && nxw && prevW?.name !== nxw.name ? brief(nxw) : "";
    if (extra && (txt.length + extra.length) / 14 <= st.sec - 4) txt += " " + extra;
    speak(txt, {
        onEnd: () => {
          if (st.waiting) {
            st.waiting = false;
            st.rt = -0.15;
          }
        }
      }
    );
    draw();
  }

  // Um segundo por segundo do relógio real (setInterval atrasa com o 3D rodando); a fala da contagem sai VLAT antes para soar junto do bipe
  function second(cur) {
    if (player.left <= 3 && player.left > 0) {
      beep(520, 0.12);
    } else if (cur.kind === "work" && cur.sec >= (cur.side2 ? 8 : 20) && player.left === Math.floor(cur.sec / 2)) {
      // unilateral troca de lado mesmo em blocos curtos (a partir de 8 s, antes da contagem final)
      if (cur.side2) {
        speak("Troque de lado!");
        cur.side2();
      } else speak("Metade!");
    } else if (cur.kind === "work" && cur.sec >= 25 && player.left === 10) {
      speak("Dez segundos!");
    }
    if (player.left > 0) {
      draw();
      return false;
    }
    endStep();
    if (player.i + 1 < steps.length) {
      show(player.i + 1);
    } else {
      beep(1175, 0.6);
      speak("Treino concluído. Mandou bem!");
      stopPlayer();
      onFinish();
    }
    return true;
  }

  player.id = setInterval(() => {
    if (!player || player.paused) return;
    const cur = steps[player.i], r = cur.sec - (performance.now() - player.at) / 1000, n = Math.ceil(r - VLAT);
    if (n >= 1 && n <= 3 && !cur.cd[n]) {
      cur.cd[n] = 1;
      speak(NUM[n]);
    }
    while (player && player.left > Math.max(0, Math.ceil(r))) {
      player.left--;
      elapsed++;
      if (second(cur)) return;
    }
  }, 50);

  let lastR = performance.now();
  player.rid = setInterval(() => {
    const now = performance.now(), dt = Math.min(0.25, (now - lastR) / 1000);
    lastR = now;
    if (!player || player.paused) return;
    const st = steps[player.i];
    if (!st || st.kind !== "work") return;
    if (st.waiting) {
      st.waitT += dt;
      if (st.waitT >= 1.8) {
        st.waiting = false;
        st.rt = -0.15;
      } else {
        return;
      }
    }
    st.rt += dt;
    const tp = st.tp;
    if (!tp) return;
    const say = (k, txt) => {
      if (!st.said[k]) {
        st.said[k] = 1;
        if (player.left > 3) speak(txt);
      }
    };
    const tv = st.rt + VLAT;
    if (tv < 0) return;

    if (tp.iso) {
      if (tv >= 0 && tv < 0.5) say("e", "Entre na posição");
      else if (tv >= tp.ab && tv < tp.ab + 0.6) say("s", "Segure!");
      else if (tp.hb >= 12 && tv >= tp.ab + tp.hb / 2 - 0.3 && tv < tp.ab + tp.hb / 2 + 0.3) say("r", "Respire e mantenha");
      return;
    }

    const nv = Math.floor(tv / tp.rep), xv = tv % tp.rep;
    if (tp.K) {
      // Exercícios compostos (burpee, sprawl, agachamento com salto): guia o início e conta na metade final da repetição
      if (nv === 0 && xv < 0.45) say("k0", "Vai!");
      else if (tp.rep >= 1.8 && xv >= tp.rep * 0.52 && xv < tp.rep * 0.52 + 0.45) say("n" + (nv + 1), String(nv + 1));
    } else if (tp.rep >= 2.2) {
      // Exercícios cadenciados: antecipa o verbo na ida e conta a repetição exatamente na volta (fase concêntrica)
      if (xv < 0.45) {
        if (nv === 0 || tp.rep >= 2.6) say("v1_" + nv, tp.v1);
      } else if (xv >= tp.ab + tp.hb && xv < tp.ab + tp.hb + 0.45) {
        if (nv === 0) say("n1", `${tp.v2}, 1`);
        else say("n" + (nv + 1), String(nv + 1));
      }
    } else if (xv < 0.35 && (nv + 1) % 5 === 0) {
      // Exercícios rápidos (polichinelo, mountain climber, corrida): o bipe marca cada ciclo e a voz só de 5 em 5,
      // porque falar "vinte e três" leva mais que um ciclo e a voz ficava atrás do movimento
      say("n" + (nv + 1), String(nv + 1));
    }

    if (st.rt < 0) return;
    const n = Math.floor(st.rt / tp.rep), x = st.rt % tp.rep;
    const seg = tp.K ? 0 : x < tp.ab ? 0 : x < tp.ab + tp.hb ? 1 : x < tp.ab + tp.hb + tp.ba ? 2 : 3;
    const key = n * 4 + seg;
    if (key === st.seg || state.profile.ritmo === false) return;
    st.seg = key;
    if (seg === 0) {
      if (tp.rep < 1) return n % 2 ? undefined : beep(440, 0.05);
      beep(440, 0.06);
    } else if (seg === 2) {
      beep(700, 0.06);
    }
  }, 40);

  const vb = () => { $("pvoice").textContent = state.profile.voz === false ? "Voz: desligada" : "Voz: ligada"; };
  vb();
  $("pvoice").onclick = () => {
    state.profile.voz = state.profile.voz === false;
    save();
    vb();
    if (state.profile.voz) speak("Voz ligada.");
    else cancelSpeech();
  };
  $("ppause").onclick = () => {
    player.paused = !player.paused;
    if (player.paused) player.pauseAt = performance.now();
    else player.at += performance.now() - player.pauseAt;
    $("ppause").textContent = player.paused ? "Continuar" : "Pausar";
  };
  $("pskip").onclick = () => {
    if (!player) return;
    elapsed += player.left;
    endStep();
    if (player.i + 1 < steps.length) show(player.i + 1);
    else {
      stopPlayer();
      onFinish();
    }
  };
  $("pstop").onclick = closeSheet;
  show(0);
}

export function startSeries(day, onRender) {
  const dayIdx = state.selected, steps = [];
  day.items.forEach((it, j) => {
    const k0 = `${dayIdx}|${it.id}`, s2 = it.ex.t === "s", nums = (it.dose.match(/\d+/g) || ["10", "12"]).map(Number), hi = nums[nums.length - 1];
    for (let k = (state.done[k0] || 0) + 1; k <= it.sets; k++) {
      steps.push({
        kind: "work",
        reps: !s2,
        phase: `Série ${k} de ${it.sets} · ${it.dose}`,
        name: it.ex.n,
        fam: it.ex.f,
        sec: s2 ? hi : Math.max(30, hi * 3),
        say: s2 ? `${it.ex.n}, série ${k}. Prepare!` : `${it.ex.n}, série ${k}. Vai!`,
        onEnd: () => {
          state.done[k0] = Math.max(state.done[k0] || 0, k);
          save();
        }
      });
      steps.push({
        kind: "rest",
        phase: "Descanso",
        name: k < it.sets ? `Próxima série: ${it.ex.n}` : day.items[j + 1] ? `Próximo: ${day.items[j + 1].ex.n}` : "Último",
        fam: k < it.sets ? it.ex.f : (day.items[j + 1] || it).ex.f,
        sec: it.rest
      });
    }
  });
  if (steps.length && steps[steps.length - 1].kind === "rest") steps.pop();
  if (!steps.length) {
    speak("Todas as séries de hoje já foram feitas.");
    return;
  }
  steps.unshift({ kind: "prep", phase: "Prepare-se", name: steps[0].name, fam: steps[0].fam, sec: 10 });
  runPlayer(day.name, steps, () => {
    if (onRender) onRender();
    $("panel").innerHTML = ptop("Missão cumprida", "Treino completo") + `<div class="tip">Todas as séries foram registradas. Faça a volta à calma e alongue.</div><button class="go" type="button" id="okc">Fechar</button>`;
    $("panel").querySelector(".close").onclick = closeSheet;
    $("okc").onclick = closeSheet;
  });
}

export function startCircuit(day, onRender) {
  const c = circCfg(day.items.length), steps = [{ kind: "prep", phase: "Prepare-se", name: day.items[0].ex.n, fam: day.items[0].ex.f, sec: 10 }], dayIdx = state.selected;
  for (let r = 1; r <= c.rounds; r++) {
    day.items.forEach((it, j) => {
      steps.push({ kind: "work", phase: `Volta ${r} de ${c.rounds} · trabalho`, name: it.ex.n, fam: it.ex.f, sec: c.work, round: r });
      if (j < day.items.length - 1) {
        steps.push({ kind: "rest", phase: "Pausa", name: "Próximo: " + day.items[j + 1].ex.n, fam: day.items[j + 1].ex.f, sec: c.pause });
      }
    });
    if (r < c.rounds) {
      steps.push({ kind: "rest", phase: `Descanso entre voltas`, name: "Respire. Água se precisar.", fam: day.items[0].ex.f, sec: c.roundRest, round0: r });
    }
  }
  runPlayer(day.name, steps, () => {
    state.done[`${dayIdx}|circ`] = c.rounds;
    save();
    if (onRender) onRender();
    $("panel").innerHTML = ptop("Missão cumprida", "Circuito completo") + `<div class="tip">${c.rounds} voltas de ${day.items.length} exercícios. Faça a volta à calma e marque um ✓ no dia.</div><button class="go" type="button" id="okc">Fechar</button>`;
    $("panel").querySelector(".close").onclick = closeSheet;
    $("okc").onclick = closeSheet;
  });
  const tick = setInterval(() => {
    if (!player) {
      clearInterval(tick);
      return;
    }
    const st = player.steps[player.i];
    if (st && st.round) {
      const full = st.round - 1;
      if (full > (state.done[`${dayIdx}|circ`] || 0)) {
        state.done[`${dayIdx}|circ`] = full;
        save();
      }
    }
  }, 1000);
}
