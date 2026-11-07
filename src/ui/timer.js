// Timer fixo de descanso entre séries
import { $ } from "./dom.js";
import { audio, beep, speak } from "../services/audio.js";

let tEnd = 0;
let tId = null;

function tick() {
  const left = Math.max(0, Math.ceil((tEnd - Date.now()) / 1000));
  $("tval").textContent = `${Math.floor(left / 60)}:${String(left % 60).padStart(2, "0")}`;
  if (left <= 0) {
    clearInterval(tId);
    tId = null;
    beep();
    speak("Próxima série. Vamos!");
    $("tlbl").textContent = "Bora, próxima série";
    setTimeout(() => {
      if (Date.now() >= tEnd) $("timer").hidden = true;
    }, 4000);
  }
}

export function startTimer(sec, name) {
  audio();
  speak(`Descanse ${sec} segundos.`);
  tEnd = Date.now() + sec * 1000;
  $("tlbl").textContent = "Descanso · " + name;
  $("timer").hidden = false;
  clearInterval(tId);
  tick();
  tId = setInterval(tick, 250);
}

export function stopTimer() {
  clearInterval(tId);
  tId = null;
  $("timer").hidden = true;
}

export function initTimer() {
  $("tplus").onclick = () => {
    tEnd = Math.max(tEnd, Date.now()) + 15000;
    $("timer").hidden = false;
    if (!tId) tId = setInterval(tick, 250);
    tick();
  };
  $("tskip").onclick = stopTimer;
}
