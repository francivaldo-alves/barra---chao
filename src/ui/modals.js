// Modais de Ficha ("Como fazer" 3D/2D), Biblioteca, Desafios e Simulado TAF
import { $, esc, meter, ptop } from "./dom.js";
import { openSheet, closeSheet, pushSheetBack, hasSheetBack } from "./sheet.js";
import { runPlayer, stopPlayer } from "./player.js";
import { FAM, keyPhases } from "../data/poses.js";
import { LIB, PAT, INFO, INFO_N, REF } from "../data/exercises.js";
import { CHAL } from "../data/challenges.js";
import { tempoOf, tempoTxt, tempoShort, exIntensity, INT_LBL } from "../data/tempo.js";
import { famFrame } from "../engine/kinematics2d.js";
import { figure, setBody } from "../engine/figure2d.js";
import { V3 } from "../engine/viewer3d.js";
import { state, save } from "../services/storage.js";
import { circCfg, old60, isRest, chalState, chalNext, chalDay } from "../services/planner.js";
import { speak } from "../services/audio.js";

export function openHow(key, idx, it, back) {
  const ex = LIB[key][idx], info = INFO_N[ex.n] || INFO[ex.f], p = $("panel");
  stopPlayer();
  if (back) pushSheetBack(back);

  const { profile } = state;
  p.innerHTML =
    ptop(`${PAT[key]} · nível ${idx + 1} de ${LIB[key].length}`, ex.n) +
    `
    <div class="stage"><div class="fig" id="stagefig"></div>
      <div class="legend" id="legend"><span><i style="background:var(--muscle)"></i>músculos que mais trabalham</span><span id="lg2"><i style="background:var(--muted);opacity:.4"></i>posição inicial</span></div>
      <div class="controls"><button class="ghost" type="button" id="p0">Posição inicial</button><button class="ghost" type="button" id="pp">Pausar</button><button class="ghost" type="button" id="spd">Câmera lenta</button>
        <span id="c3" hidden style="display:contents"><button class="ghost" type="button" id="spin">Girar sozinho</button><button class="ghost" type="button" id="vside">Lado</button><button class="ghost" type="button" id="vfront">Frente</button><button class="ghost" type="button" id="v34">3/4</button></span>
        <button class="ghost" type="button" id="mode2d" hidden>Ver em 2D</button></div>
      <p class="cred" id="cred3d" hidden>Corpo 3D: MakeHuman (CC0). Mapa muscular: Z-Anatomy / BodyParts3D (CC BY-SA 4.0), via ecorche-body.</p></div>
    <div class="sec"><h4>${FAM[ex.f].K ? "Sequência do movimento" : "Posições"}</h4><div class="poses" id="poses"></div><p class="cred" style="margin-top:6px">Toque numa posição para congelar o 3D nela.</p></div>
    ${it ? `<div class="tip"><b>Seu treino hoje:</b> ${profile.formato === "circ" ? `${circCfg().work} s por volta, ${circCfg().rounds} voltas` : `${it.sets} séries de ${it.dose}, descanso de ${it.rest} s`}.</div>` : ""}
    <div class="sec"><h4>Passo a passo</h4><ol class="steps">${info.s.map(x => `<li><span>${esc(x)}</span></li>`).join("")}</ol></div>
    <div class="tip"><b>Ritmo:</b> ${tempoTxt(tempoOf(ex.f, ex.n))}<br><b>Intensidade:</b> ${INT_LBL[exIntensity(key, idx)]} ${meter(exIntensity(key, idx))}</div>
    ${REF[ex.f] ? `<div class="tip ref"><b>Referência técnica:</b> ${esc(REF[ex.f])}</div>` : ""}
    <div class="tip"><b>Detalhe desta variação:</b> ${esc(ex.d)}</div>
    <div class="sec"><h4>Erros comuns</h4><ul class="errs">${info.e.map(x => `<li>${esc(x)}</li>`).join("")}</ul></div>
    <div class="sec"><h4>Músculos trabalhados</h4><div class="muscles">${info.m.map(x => `<span>${esc(x)}</span>`).join("")}</div></div>
    <div class="sec"><h4>Progressão</h4><div class="prog">${LIB[key].map((x, i) => `<button type="button" data-i="${i}" aria-current="${i === idx}"><b>${i + 1}</b>${esc(x.n)}</button>`).join("")}</div></div>`;

  p.querySelector(".close").onclick = hasSheetBack() ? () => history.back() : closeSheet;
  let use3 = V3.ok() && !state.want2D, sf = null;

  function holdAt(ph) {
    if (sf) {
      sf.paused = true;
      sf.phase = ph;
      setBody(sf.P, famFrame(sf.fam, ph), ph);
    } else {
      V3._phase(ph);
    }
    $("pp").textContent = "Continuar";
  }

  function fillPoses(is3) {
    const box = $("poses");
    if (!box) return;
    box.innerHTML = "";
    for (const [ph, lab] of keyPhases(ex.f)) {
      const b = document.createElement("button");
      b.type = "button";
      b.className = "pose";
      b.setAttribute("aria-label", `Ver ${lab}`);
      const url = is3 ? V3.snapshot(ph) : null;
      if (url) {
        const im = document.createElement("img");
        im.src = url;
        im.alt = lab;
        b.appendChild(im);
      } else {
        const f = document.createElement("div");
        f.className = "fig";
        const fg = figure(ex.f, { label: lab, name: ex.n });
        fg.f.paused = true;
        fg.f.phase = ph;
        setBody(fg.f.P, famFrame(fg.f.fam, ph), ph);
        f.appendChild(fg.node);
        b.appendChild(f);
      }
      const sp = document.createElement("span");
      sp.textContent = lab;
      b.appendChild(sp);
      b.onclick = () => holdAt(ph);
      box.appendChild(b);
    }
  }

  const setup = () => {
    const host = $("stagefig");
    host.innerHTML = "";
    sf = null;
    if (use3 && V3.mount(host, ex.f, { name: ex.n, tempo: tempoOf(ex.f, ex.n), spinBtn: $("spin"), onFail: () => { use3 = false; setup(); }, onReady: () => fillPoses(true) })) {
      host.setAttribute("role", "img");
      host.setAttribute("aria-label", `Animação 3D: ${ex.n}. Arraste para girar.`);
      $("lg2").innerHTML = "arraste para girar a câmera";
      $("cred3d").hidden = false;
      $("c3").hidden = false;
      $("mode2d").hidden = false;
      $("mode2d").textContent = "Ver em 2D";
    } else {
      V3.unmount();
      const fg = figure(ex.f, { ghost: true, label: ex.n, tempo: tempoOf(ex.f, ex.n) });
      host.appendChild(fg.node);
      sf = fg.f;
      fillPoses(false);
      $("lg2").innerHTML = '<i style="background:var(--muted);opacity:.4"></i>posição inicial';
      $("cred3d").hidden = true;
      $("c3").hidden = true;
      $("mode2d").hidden = !V3.ok();
      $("mode2d").textContent = "Ver em 3D";
    }
    $("pp").textContent = "Pausar";
    $("spd").textContent = "Câmera lenta";
  };

  setup();
  $("p0").onclick = () => holdAt(0);
  $("mode2d").onclick = () => { state.want2D = use3; use3 = !use3; setup(); };
  $("pp").onclick = () => { const pz = sf ? (sf.paused = !sf.paused) : V3.pause(); $("pp").textContent = pz ? "Continuar" : "Pausar"; };
  $("spd").onclick = () => { const sp = sf ? (sf.speed = sf.speed === 1 ? 0.4 : 1) : V3.slow(); $("spd").textContent = sp === 1 ? "Câmera lenta" : "Velocidade normal"; };
  $("spin").onclick = () => V3.toggleSpin();
  $("vside").onclick = () => V3.view("lado");
  $("vfront").onclick = () => V3.view("frente");
  $("v34").onclick = () => V3.view("34");
  p.querySelectorAll(".prog button").forEach(b => (b.onclick = () => openHow(key, +b.dataset.i, null, back)));
  if ($("sheet").hidden) openSheet();
  else p.scrollTop = 0;
}

export function openLib() {
  const p = $("panel");
  p.innerHTML = ptop("Tudo sem equipamento", "Biblioteca") + `<div id="libbody" style="display:grid;gap:20px"></div>`;
  p.querySelector(".close").onclick = closeSheet;
  const body = $("libbody");
  Object.keys(LIB).forEach(key => {
    const sec = document.createElement("div");
    sec.className = "sec";
    sec.innerHTML = `<h4>${PAT[key]}</h4>`;
    const grid = document.createElement("div");
    grid.className = "libgrid";
    LIB[key].forEach((ex, i) => {
      const t = document.createElement("button");
      t.type = "button";
      t.className = "tile";
      const f = document.createElement("div");
      f.className = "fig";
      f.appendChild(figure(ex.f, { label: ex.n }).node);
      t.appendChild(f);
      const s = document.createElement("span");
      s.textContent = `${i + 1}. ${ex.n}`;
      t.appendChild(s);
      t.onclick = () => openHow(key, i, null, openLib);
      grid.appendChild(t);
    });
    sec.appendChild(grid);
    body.appendChild(sec);
  });
  openSheet();
}

export function renderChal() {
  const box = $("chal");
  if (!box) return;
  box.innerHTML = "";
  for (const c of CHAL) {
    const st = chalState(c.id), n = st.done.length, nx = chalNext(c), b = document.createElement("button");
    b.type = "button";
    b.className = "ch" + (n ? " started" : "");
    b.innerHTML = `<span class="days">${c.days}<small>dias</small></span><b>${esc(c.n)}</b><span class="sub">${n >= c.days ? "Concluído! 🏅" : n ? `Dia ${nx} de ${c.days}` : "Começar desafio"}</span><span class="bar2"><i style="width:${Math.round((n / c.days) * 100)}%"></i></span>`;
    b.onclick = () => openChallenge(c.id);
    box.appendChild(b);
  }
}

export function openChallenge(id, sel) {
  const c = CHAL.find(x => x.id === id), st = chalState(id), nx = chalNext(c), p = $("panel");
  stopPlayer();
  sel = sel || Math.min(nx, c.days);
  const items = chalDay(c, sel), isDone = st.done.includes(sel), canDo = sel <= nx;
  let grid = "";
  for (let d = 1; d <= c.days; d++) {
    const cls = st.done.includes(d) ? "done" : d === nx ? "cur" : d > nx ? "lock" : "";
    grid += `<button type="button" class="dg ${cls}${isRest(c, d) ? " rest" : ""}" data-d="${d}" aria-pressed="${d === sel}" aria-label="Dia ${d}${isRest(c, d) ? ", folga" : ""}">${st.done.includes(d) ? "✓" : d}${isRest(c, d) ? "<small>folga</small>" : d === c.days ? "<small>teste</small>" : ""}</button>`;
  }
  p.innerHTML =
    ptop(`Desafio · ${st.done.length} de ${c.days} dias`, c.n) +
    `<p style="margin:0;color:var(--muted)">${esc(c.d)}</p>
    <div class="hprog" style="background:var(--soft)"><i style="width:${Math.round((st.done.length / c.days) * 100)}%;background:var(--done)"></i></div>
    ${Object.values(state.profile.restr || {}).some(Boolean) || old60() ? `<div class="tip">Adaptado aos seus cuidados: exercícios não indicados foram trocados por opções seguras.</div>` : ""}
    <div class="dgrid">${grid}</div>
    <div class="sec"><h4>${items ? `<span style="float:right">${meter(Math.round(items.reduce((a, x) => a + exIntensity(x.k, x.idx), 0) / items.length))}</span>` : ""}Dia ${sel}${items ? (sel === c.days ? " · teste final" : "") : " · folga"}</h4>${items ? `<div style="display:grid;gap:8px" id="citems"></div>` : `<div class="tip">Dia de recuperação. Caminhe 20 minutos e alongue. Músculo cresce no descanso.</div>`}</div>
    ${canDo ? `<div class="cbtns">${items ? `<button class="go" type="button" id="cgo"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7 4.5v15l13-7.5z"/></svg>${isDone ? "Refazer dia" : "Iniciar dia " + sel}</button>` : ""}${isDone ? "" : `<button class="ghost" type="button" id="cmark">${items ? "Marcar como feito" : "Concluir folga"}</button>`}</div>` : `<div class="tip">Conclua o dia ${nx} para liberar este.</div>`}
    ${st.done.length ? `<button class="ghost" type="button" id="creset" style="justify-self:start">Recomeçar desafio</button>` : ""}`;

  p.querySelector(".close").onclick = closeSheet;
  p.querySelectorAll(".dg").forEach(b => (b.onclick = () => openChallenge(id, +b.dataset.d)));

  if (items) {
    const box = $("citems");
    items.forEach(it => {
      const r = document.createElement("div");
      r.className = "citem";
      const f = document.createElement("div");
      f.className = "fig";
      f.appendChild(figure(it.ex.f, { label: it.ex.n, tempo: tempoOf(it.ex.f, it.ex.n) }).node);
      r.appendChild(f);
      const t = document.createElement("div");
      t.innerHTML = `<h4>${esc(it.ex.n)}</h4><div class="amt">${it.txt}</div><span class="rt">Ritmo ${tempoShort(tempoOf(it.ex.f, it.ex.n))} · ${meter(exIntensity(it.k, it.idx))}</span>`;
      const hb = document.createElement("button");
      hb.type = "button";
      hb.className = "howto";
      hb.textContent = "Como fazer";
      hb.onclick = () => openHow(it.k, it.idx, null, () => openChallenge(id, sel));
      t.appendChild(hb);
      r.appendChild(t);
      box.appendChild(r);
    });
  }

  const finish = () => {
    const s2 = chalState(id);
    if (!s2.done.includes(sel)) s2.done.push(sel);
    state.chal[id] = s2;
    save();
    renderChal();
    const fim = s2.done.length >= c.days;
    speak(fim ? `Desafio ${c.n} concluído. Parabéns!` : `Dia ${sel} concluído. Bom trabalho!`);
    p.innerHTML = ptop(c.n, fim ? "Desafio concluído 🏅" : `Dia ${sel} concluído`) + `<div class="tip">${fim ? `Você completou os ${c.days} dias. Faça o teste de novo daqui a uma semana para ver a evolução.` : `Faltam ${c.days - s2.done.length} dias. Volte amanhã para o dia ${chalNext(c)}.`}</div><button class="go" type="button" id="cok">Ver desafio</button>`;
    p.querySelector(".close").onclick = closeSheet;
    $("cok").onclick = () => openChallenge(id);
  };

  if ($("cmark")) $("cmark").onclick = finish;
  if ($("creset")) {
    $("creset").onclick = () => {
      state.chal[id] = { done: [], seed: ((state.chal[id] && state.chal[id].seed) || 0) + 1 };
      save();
      renderChal();
      openChallenge(id);
    };
  }
  if ($("cgo")) {
    $("cgo").onclick = () => {
      const steps = [{ kind: "prep", phase: "Prepare-se", name: items[0].ex.n, fam: items[0].ex.f, sec: 10, say: `Dia ${sel} do desafio. Primeiro: ${items[0].ex.n}. Fique na posição inicial.` }];
      items.forEach((it, j) => {
        for (let k = 1; k <= it.sets; k++) {
          const sec = it.max ? (it.s ? 180 : 60) : it.s ? it.amt : Math.max(25, Math.round(it.amt * 2.6));
          steps.push({
            kind: "work",
            reps: !it.s || it.max,
            phase: `${it.ex.n} · série ${k} de ${it.sets}`,
            name: it.max ? `${it.ex.n} · máximo` : it.s ? `${it.ex.n} · ${it.amt} s` : `${it.ex.n} · ${it.amt} repetições`,
            fam: it.ex.f,
            sec,
            say: it.max ? (it.s ? `${it.ex.n}. Segure o máximo que conseguir. Comece!` : `${it.ex.n}. Máximo de repetições em um minuto. Comece!`) : it.s ? `${it.ex.n}. Segure ${it.amt} segundos. Comece!` : `${it.ex.n}. ${it.amt} repetições. Comece!`
          });
          const last = j === items.length - 1 && k === it.sets;
          if (!last) {
            steps.push({
              kind: "rest",
              phase: "Descanso",
              name: k < it.sets ? `Próxima série: ${it.ex.n}` : `Próximo: ${items[j + 1].ex.n}`,
              fam: k < it.sets ? it.ex.f : items[j + 1].ex.f,
              sec: k < it.sets ? 30 : 45
            });
          }
        }
      });
      runPlayer(`${c.n} · dia ${sel}`, steps, finish);
    };
  }
  if ($("sheet").hidden) openSheet();
  else p.scrollTop = 0;
}

function tafResult() {
  const p = $("panel");
  p.innerHTML =
    ptop("Registre seu resultado", "Fim do simulado") +
    `
    <form id="tafform" class="taf-form"><label for="tf-f">Flexões válidas<input id="tf-f" type="number" inputmode="numeric" min="0" max="200" required></label>
    <label for="tf-a">Abdominais válidos<input id="tf-a" type="number" inputmode="numeric" min="0" max="200" required></label>
    <button class="go" type="submit" style="grid-column:1/-1">Salvar resultado</button></form>`;
  p.querySelector(".close").onclick = closeSheet;
  $("tafform").onsubmit = e => {
    e.preventDefault();
    const d = new Date();
    state.taf.push({ d: d.toLocaleDateString("pt-BR"), f: +$("tf-f").value || 0, a: +$("tf-a").value || 0 });
    save();
    openTAF();
  };
  $("tf-f").focus();
}

export function openTAF() {
  const p = $("panel");
  stopPlayer();
  const rows = state.taf
    .slice(-6)
    .reverse()
    .map(t => `<tr><td>${esc(t.d)}</td><td>${t.f}</td><td>${t.a}</td></tr>`)
    .join("");
  p.innerHTML =
    ptop("Teste de aptidão física", "Simulado TAF") +
    `
    <div class="tip">Duas provas clássicas do TAF, feitas em casa: <b>flexão de braço em 1 minuto</b> e <b>abdominal remador em 1 minuto</b>, com 2 minutos de descanso entre elas. Conte suas repetições válidas e registre no final. Os índices exigidos variam por concurso, idade e sexo; confira o edital.</div>
    <div class="libgrid"><button class="tile" type="button" data-k="push" data-i="3"><div class="fig" id="tf1"></div><span>Flexão de braço</span></button>
    <button class="tile" type="button" data-k="core" data-i="4"><div class="fig" id="tf2"></div><span>Abdominal remador</span></button></div>
    <button class="go" type="button" id="tafgo">Começar simulado</button>
    ${rows ? `<div class="sec"><h4>Seus resultados</h4><table class="hist"><thead><tr><th>Data</th><th>Flexões</th><th>Abdominais</th></tr></thead><tbody>${rows}</tbody></table></div>` : `<div class="sec"><h4>Seus resultados</h4><p style="margin:0;color:var(--muted)">Nenhum simulado registrado ainda. Faça o primeiro para ter uma referência.</p></div>`}`;
  $("tf1").appendChild(figure("pushup", { label: "Flexão" }).node);
  $("tf2").appendChild(figure("remador", { label: "Abdominal remador" }).node);
  p.querySelector(".close").onclick = closeSheet;
  p.querySelectorAll(".tile").forEach(b => (b.onclick = () => openHow(b.dataset.k, +b.dataset.i, null, openTAF)));
  $("tafgo").onclick = () =>
    runPlayer(
      "Simulado TAF",
      [
        { kind: "prep", phase: "Prepare-se · posição de flexão", name: "Flexão de braço", fam: "pushup", sec: 10 },
        { kind: "work", phase: "Prova 1 · conte as repetições", name: "Flexão de braço", fam: "pushup", sec: 60 },
        { kind: "rest", phase: "Descanso", name: "Próximo: abdominal remador", fam: "remador", sec: 120 },
        { kind: "work", phase: "Prova 2 · conte as repetições", name: "Abdominal remador", fam: "remador", sec: 60 }
      ],
      tafResult
    );
  if ($("sheet").hidden) openSheet();
}
