// Serviço de Áudio (Web Audio API), Voz do Treinador (TTS pt-BR) e WakeLock da tela Android
import { state } from "./storage.js";

let actx = null;
let wake = null;
let cachedVoice = null;

export const NUM = ["", "um", "dois", "três"];

function pickVoice() {
  if (cachedVoice) return cachedVoice;
  try {
    const S = window.speechSynthesis;
    const vs = (S && S.getVoices()) || [];
    if (!vs.length) return null;
    // Prioriza vozes locais (offline) pt-BR para eliminar latência de rede
    cachedVoice =
      vs.find(x => /pt[-_]BR/i.test(x.lang) && x.localService) ||
      vs.find(x => /pt[-_]BR/i.test(x.lang)) ||
      vs.find(x => /^pt/i.test(x.lang) && x.localService) ||
      vs.find(x => /^pt/i.test(x.lang)) ||
      null;
  } catch (e) {}
  return cachedVoice;
}

export function audio() {
  try {
    actx = actx || new (window.AudioContext || window.webkitAudioContext)();
    if (actx.state === "suspended") actx.resume();
  } catch (e) {}
}

export function beep(freq = 880, dur = 0.25) {
  try {
    audio();
    const o = actx.createOscillator(), g = actx.createGain();
    o.frequency.value = freq;
    g.gain.value = 0.15;
    o.connect(g);
    g.connect(actx.destination);
    o.start();
    o.stop(actx.currentTime + dur);
  } catch (e) {}
}

// Uma velocidade só para toda fala (aviso, contagem e dica), assim a voz não muda de ritmo entre telas
export const RATE = 1.2;

export function speak(t, opts = {}) {
  const { rate = RATE, onEnd = null } = opts;
  if (state.profile.voz === false) {
    if (onEnd) setTimeout(onEnd, 150);
    return;
  }
  try {
    const S = window.speechSynthesis;
    if (!S || !window.SpeechSynthesisUtterance) {
      if (onEnd) setTimeout(onEnd, 150);
      return;
    }
    if (S.speaking || S.pending) S.cancel();
    const u = new SpeechSynthesisUtterance(t);
    u.lang = "pt-BR";
    u.rate = rate;
    u.pitch = 1;
    const v = pickVoice();
    if (v) u.voice = v;
    if (onEnd) {
      let done = false;
      const fin = () => {
        if (!done) {
          done = true;
          onEnd();
        }
      };
      u.onend = fin;
      u.onerror = fin;
    }
    S.speak(u);
  } catch (e) {
    if (onEnd) setTimeout(onEnd, 150);
  }
}

export function cancelSpeech() {
  try {
    window.speechSynthesis && window.speechSynthesis.cancel();
  } catch (e) {}
}

// Pré-carrega e faz cache das vozes no Android / Chrome / Windows
try {
  if (window.speechSynthesis) {
    pickVoice();
    window.speechSynthesis.onvoiceschanged = () => {
      cachedVoice = null;
      pickVoice();
    };
  }
} catch (e) {}

export async function lockScreen() {
  try {
    wake = await navigator.wakeLock?.request("screen");
  } catch (e) {}
}

export function releaseWakeLock() {
  try {
    wake && wake.release();
  } catch (e) {}
  wake = null;
}
