// Renderizador da tela principal (Perfil, Abas da Semana, Sessão do Dia e Cartões)
import { $, esc, seg, meter } from "./dom.js";
import { startTimer } from "./timer.js";
import { startSeries, startCircuit } from "./player.js";
import { openHow, openLib, openTAF, renderChal } from "./modals.js";
import { LIB, PAT } from "../data/exercises.js";
import { DAYS, DAYFULL, NIVEIS, OBJS, FORMATOS, INTENSIDADES, RESTR } from "../data/plans.js";
import { tempoOf, tempoShort, exIntensity, INT_LBL } from "../data/tempo.js";
import { figure } from "../engine/figure2d.js";
import { state, todayIdx, save } from "../services/storage.js";
import { circCfg, buildWeek, dayMinutes, dayIntensity, dayPct, adjustLevel } from "../services/planner.js";
import { speak } from "../services/audio.js";

export function setProfile(patch, resetLv) {
  state.profile = { ...state.profile, ...patch };
  if (resetLv) state.levels = {};
  if (!["formato", "voz", "ritmo", "peso", "parq"].some(k => k in patch)) state.done = {};
  save();
  render();
}

function tapSet(id, i, rest, name) {
  const k = `${state.selected}|${id}`, c = state.done[k] || 0;
  if (i < c) state.done[k] = i;
  else {
    state.done[k] = i + 1;
    startTimer(rest, name);
  }
  save();
  render();
}

export function render() {
  const { profile, selected, done, rerolls } = state;

  seg($("nivel"), NIVEIS, profile.nivel, x => setProfile({ nivel: x }, true));
  seg($("objetivo"), OBJS, profile.objetivo, x => setProfile({ objetivo: x }, true));
  seg($("dias"), [2, 3, 4, 5, 6].map(n => [n, n + " dias"]), profile.dias, x => setProfile({ dias: x }, false));
  seg($("formato"), FORMATOS, profile.formato, x => setProfile({ formato: x }, false));
  seg($("intens"), INTENSIDADES, profile.intens, x => setProfile({ intens: x }, false));

  $("intens-hint").textContent = {
    leve: "Para começar, voltar de pausa ou dias de recuperação: menos volume, mais descanso, ritmo mais lento e exercícios mais fáceis.",
    moderada: "Equilíbrio entre esforço e recuperação. Boa escolha para a maioria dos dias.",
    intensa: "Mais voltas, menos descanso. Para quem já treina com regularidade.",
    maxima: "Volume alto, descanso curto e exercícios mais difíceis. Use em poucos dias da semana."
  }[profile.intens];

  seg($("dur"), [[0, "Livre"], [15, "15 min"], [25, "25 min"], [35, "35 min"], [45, "45 min"]], profile.dur || 0, x => setProfile({ dur: +x }, false));
  seg($("idade"), [["<40", "Até 39"], ["40-59", "40 a 59"], ["60+", "60 ou mais"]], profile.idade, x => setProfile({ idade: x }, false));

  {
    const box = $("restr");
    box.innerHTML = "";
    for (const k in RESTR) {
      const b = document.createElement("button");
      b.type = "button";
      b.textContent = RESTR[k].l;
      b.setAttribute("aria-pressed", String(!!(profile.restr || {})[k]));
      b.onclick = () => setProfile({ restr: { ...(profile.restr || {}), [k]: !(profile.restr || {})[k] } }, false);
      box.appendChild(b);
    }
  }

  $("peso").value = profile.peso || 70;
  $("peso").onchange = e => {
    const v = Math.round(+e.target.value);
    if (v >= 30 && v <= 250) setProfile({ peso: v }, false);
  };

  seg($("ritmo"), [[1, "Ligado"], [0, "Desligado"]], profile.ritmo === false ? 0 : 1, x => setProfile({ ritmo: !!x }, false));
  seg($("voz"), [[1, "Ligada"], [0, "Desligada"]], profile.voz === false ? 0 : 1, x => {
    setProfile({ voz: !!x }, false);
    if (x) speak("Voz do treinador ligada.");
  });

  renderChal();
  $("libcount").textContent = `${Object.values(LIB).reduce((a, l) => a + l.length, 0)} exercícios em 3D`;

  const nm = (arr, v) => arr.find(x => x[0] == v)[1];
  const nr = Object.values(profile.restr || {}).filter(Boolean).length;
  $("summary").innerHTML = `<span><b>${nm(NIVEIS, profile.nivel)}</b> · ${nm(INTENSIDADES, profile.intens)} · ${nm(OBJS, profile.objetivo)} · ${profile.dias} dias${profile.dur ? ` · ${profile.dur} min` : ""}${nr ? ` · ${nr} cuidado${nr > 1 ? "s" : ""}` : ""}</span><svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M4 20h4L19 9l-4-4L4 16z"/></svg>`;

  const plan = buildWeek(), week = $("week");
  week.innerHTML = "";
  plan.forEach((d, i) => {
    const b = document.createElement("button");
    b.type = "button";
    b.className = "day" + (d ? "" : " rest");
    b.setAttribute("role", "tab");
    b.setAttribute("aria-selected", String(i === selected));
    b.innerHTML = `<b>${DAYS[i]}</b><small>${d ? d.name.replace("Corpo inteiro", "Full") : "Folga"}</small>${d ? `<span class="bar"><i style="width:${dayPct(i, d)}%"></i></span>` : ""}`;
    b.onclick = () => {
      state.selected = i;
      render();
    };
    week.appendChild(b);
  });

  const day = plan[selected], s = $("session");
  if (!day) {
    s.innerHTML = `<section class="hero"><span class="eyebrow">${DAYFULL[selected]}${selected === todayIdx ? " · hoje" : ""}</span><h2>Dia de descanso</h2><p>Recuperação também é treino. Uma caminhada leve e 10 minutos de alongamento ajudam o corpo a voltar mais forte.</p></section>`;
    return;
  }

  const circ = profile.formato === "circ", c = circCfg(day.items.length), sc = { rest: day.items[0].rest };
  const pct = dayPct(selected, day), di = dayIntensity(day);

  s.innerHTML = `<div class="list"><section class="hero"><span class="eyebrow">${DAYFULL[selected]}${selected === todayIdx ? " · treino de hoje" : ""}</span><h2>${day.name}</h2>
      <div class="stats"><span class="stat">Intensidade <b>${INT_LBL[di.v]}</b>${meter(di.v)}</span><span class="stat"><b>~${dayMinutes(day)}</b> min</span><span class="stat">≈ <b>${di.kcal}</b> kcal</span><span class="stat"><b>${day.items.length}</b> exercícios</span>${circ ? `<span class="stat"><b>${c.rounds}</b> voltas · ${c.work}s/${c.pause}s</span>` : `<span class="stat">descanso <b>${sc.rest}s</b></span>`}</div>
      <p class="rpe">Esforço alvo: <b>${di.rpe} de 10</b>. As últimas repetições devem ficar difíceis, sem perder a técnica. Calorias estimadas para ${profile.peso || 70} kg.</p>
      <div class="hprog" aria-label="Progresso do dia: ${pct}%"><i style="width:${pct}%"></i></div>
      <div class="cta"><button class="go" id="startday" type="button"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7 4.5v15l13-7.5z"/></svg>${circ ? (pct > 0 && pct < 100 ? "Continuar circuito" : "Iniciar circuito") : pct > 0 && pct < 100 ? "Continuar treino" : "Iniciar treino guiado"}</button>
        <button class="shuffle" id="reroll" type="button"><span class="btn-ico"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 7h3.5c2 0 3.3 1 4.4 2.6l2.2 3.2C14.2 14.5 15.5 16 17.5 16H21M17.5 13l3.5 3-3.5 3M3 17h3.5c1.4 0 2.4-.5 3.3-1.4M13.2 8.4C14.1 7.5 15.1 7 16.5 7H21M17.5 4l3.5 3-3.5 3"/></svg></span>Sortear outro treino</button></div></section>
    <div class="warm"><b>Aquecimento (5–8 min):</b> 60 s de polichinelo, 60 s de corrida parada, 10 rotações de braço para cada lado, 10 agachamentos lentos e 20 s de prancha.</div>
    <div class="sec-title"><h3>Exercícios</h3><span>mesmo nível, variam toda semana</span></div>
    <div id="cards" class="list"></div>
    <div class="warm"><b>Volta à calma:</b> 2 min de respiração lenta e alongamento de peito, posterior de coxa e quadril.</div></div>`;

  $("startday").onclick = () => {
    if (circ) startCircuit(day, render);
    else startSeries(day, render);
  };

  $("reroll").onclick = () => {
    rerolls[selected] = (rerolls[selected] || 0) + 1;
    for (const k in done) if (k.startsWith(selected + "|")) delete done[k];
    save();
    render();
  };

  const cards = $("cards");
  day.items.forEach(it => {
    const k = `${selected}|${it.id}`, cnt = done[k] || 0, list = LIB[it.key], next = list[it.idx + 1];
    const card = document.createElement("article");
    card.className = "card" + (!circ && cnt >= it.sets ? " complete" : "");

    const fb = document.createElement("button");
    fb.type = "button";
    fb.className = "fig";
    fb.setAttribute("aria-label", "Como fazer: " + it.ex.n);
    fb.appendChild(figure(it.ex.f, { label: it.ex.n, tempo: tempoOf(it.ex.f, it.ex.n) }).node);
    fb.onclick = () => openHow(it.key, it.idx, it);
    card.appendChild(fb);

    const body = document.createElement("div");
    body.className = "card-body";
    const dose = circ ? `${c.work} s` : `${it.sets} × ${it.dose}`;
    const sub = circ ? `máximo de repetições com boa forma · nível ${it.idx + 1}/${list.length}` : `descanso ${it.rest}s · nível ${it.idx + 1}/${list.length}`;
    body.innerHTML = `<span class="chip"><span class="num">${String(day.items.indexOf(it) + 1).padStart(2, "0")}</span>${PAT[it.p]}${it.vol ? " · volume" : ""}</span><h3>${esc(it.ex.n)}</h3><div class="dose"><strong>${dose}</strong><span>${sub}</span></div><span class="rt">Ritmo ${tempoShort(tempoOf(it.ex.f, it.ex.n))} · intensidade ${meter(exIntensity(it.key, it.idx))}</span>`;

    const hb = document.createElement("button");
    hb.type = "button";
    hb.className = "howto";
    hb.textContent = "Como fazer";
    hb.onclick = () => openHow(it.key, it.idx, it);
    body.appendChild(hb);
    card.appendChild(body);

    if (!circ) {
      const sets = document.createElement("div");
      sets.className = "sets";
      for (let i = 0; i < it.sets; i++) {
        const b = document.createElement("button");
        b.type = "button";
        b.className = "set" + (i < cnt ? " on" : "");
        b.textContent = i + 1;
        b.setAttribute("aria-label", `Série ${i + 1}`);
        b.onclick = () => tapSet(it.id, i, it.rest, it.ex.n);
        sets.appendChild(b);
      }
      card.appendChild(sets);
    }

    const adj = document.createElement("div");
    adj.className = "adjust";
    adj.innerHTML = `<span class="next">${next ? "Próxima: " + esc(next.n) : "Última progressão da lista"}</span><div class="btns">
      <button type="button" data-a="-1" ${it.idx <= 0 ? "disabled" : ""}>Difícil demais</button>
      <button type="button" data-a="1" ${next ? "" : "disabled"}>Ficou fácil</button></div>`;
    adj.querySelectorAll("button").forEach(b => (b.onclick = () => {
      adjustLevel(it.key, +b.dataset.a);
      render();
    }));
    card.appendChild(adj);
    cards.appendChild(card);
  });
}

export function initAppControls() {
  const toggleSettings = open => {
    $("settings").hidden = !open;
    $("opensettings").setAttribute("aria-expanded", String(open));
    if (open) $("settings").scrollIntoView({ behavior: "smooth", block: "nearest" });
  };

  $("opensettings").onclick = () => toggleSettings($("settings").hidden);
  $("summary").onclick = () => toggleSettings(true);
  $("closesettings").onclick = () => toggleSettings(false);

  $("newweek").onclick = () => {
    state.done = {};
    save();
    render();
  };

  $("resetlv").onclick = () => {
    state.levels = {};
    save();
    render();
  };

  $("openlib").onclick = openLib;
  $("opentaf").onclick = openTAF;
}
