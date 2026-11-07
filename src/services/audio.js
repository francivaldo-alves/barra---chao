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
    // Voz escolhida nos ajustes; senão prioriza vozes locais (offline) pt-BR para eliminar latência de rede
    cachedVoice =
      vs.find(x => x.voiceURI === state.profile.vozId) ||
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

// Uma velocidade só para toda fala (aviso, contagem e dica), assim a voz não muda de ritmo entre telas.
// 1,05: um pouco acima do normal para acompanhar o treino, sem o som acelerado/robótico de 1,2
export const RATE = 1.05;
// Tom da voz (ajustes): grave deixa a voz mais encorpada
export const TOM = { grave: 0.82, medio: 0.92, normal: 1 };
const pitchOf = () => TOM[state.profile.tom] || TOM.normal;

// No APK o WebView do Android não tem speechSynthesis: usa o TTS nativo pelo plugin local "Voz"
// (android/app/src/main/java/br/app/barraechao/VozPlugin.java), que também deixa escolher o mecanismo (Samsung, Google...)
function nativeTTS() {
  try {
    const C = window.Capacitor;
    return (C && C.isNativePlatform && C.isNativePlatform() && C.Plugins && C.Plugins.Voz) || null;
  } catch (e) {
    return null;
  }
}

// Mecanismo escolhido nos ajustes é aplicado uma vez ao abrir o app; as outras chamadas esperam por ele
let motorPronto = Promise.resolve();
{
  const N = nativeTTS();
  if (N && state.profile.vozMotor) motorPronto = N.setEngine({ engine: state.profile.vozMotor }).catch(() => {});
}

export function speak(t, opts = {}) {
  const { rate = RATE, onEnd = null } = opts;
  if (state.profile.voz === false) {
    if (onEnd) setTimeout(onEnd, 150);
    return;
  }
  let done = false;
  const fin = () => {
    if (!done && onEnd) {
      done = true;
      onEnd();
    }
  };
  const N = nativeTTS();
  if (N) {
    // a fala nova interrompe a anterior; sem voz escolhida o mecanismo usa a voz padrão dele em pt-BR
    N.speak({ text: t, rate, pitch: pitchOf(), voice: state.profile.vozId || null }).then(fin, fin);
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
    u.pitch = pitchOf();
    const v = pickVoice();
    if (v) u.voice = v;
    u.onend = fin;
    u.onerror = fin;
    S.speak(u);
  } catch (e) {
    if (onEnd) setTimeout(onEnd, 150);
  }
}

// Vozes em português do aparelho, para o seletor dos ajustes: [{ id, label }]
export async function listVoices() {
  const N = nativeTTS();
  let vs = [];
  try {
    if (N) {
      await motorPronto;
      vs = ((await N.getVoices()).voices || []).map(v => ({ voiceURI: v.id, lang: v.lang, localService: !v.network, installed: v.installed !== false }));
    } else if (window.speechSynthesis) vs = window.speechSynthesis.getVoices();
  } catch (e) {}
  return vs
    .filter(v => /^pt/i.test(v.lang))
    .map(v => {
      // no Android o nome identifica a voz: Google "pt-br-x-ptd-network", Samsung "pt-BR-SMTm00" (m = masculina, f = feminina)
      const id = v.voiceURI || "", code = (id.match(/-x-([a-z]+)-/i) || [])[1], sm = id.match(/SMT([mf])(\d+)/i);
      const where = v.localService === false || /network/i.test(id) ? "online, mais natural" : "offline";
      const nome = sm ? `Voz ${/m/i.test(sm[1]) ? "masculina" : "feminina"} ${+sm[2] + 1}` : code ? "Voz " + code.toUpperCase() : id || v.name;
      const baixar = v.installed === false ? " · baixar (precisa de internet)" : "";
      return { id, label: nome + " · " + v.lang.replace("_", "-") + " · " + where + baixar, installed: v.installed !== false };
    })
    .sort((a, b) => b.installed - a.installed || a.label.localeCompare(b.label)); // instaladas primeiro
}

// Mecanismos de voz instalados (só no APK): { engines: [{ id, label }], current } ou null no navegador
export async function listEngines() {
  const N = nativeTTS();
  if (!N) return null;
  try {
    await motorPronto;
    return await N.getEngines();
  } catch (e) {
    return null;
  }
}

// Abre a tela de download de vozes do mecanismo em uso (ou as configurações de voz do Android). Só no APK.
export function installVoices() {
  const N = nativeTTS();
  return N ? N.install().catch(() => {}) : Promise.resolve();
}

export function openVoiceSettings() {
  const N = nativeTTS();
  return N ? N.openSettings().catch(() => {}) : Promise.resolve();
}

// Troca o mecanismo (Samsung TTS, Google...); "" volta ao mecanismo padrão do Android
export function setEngine(id) {
  const N = nativeTTS();
  if (N) motorPronto = N.setEngine({ engine: id || null }).catch(() => {});
  return motorPronto;
}

// Troca de voz nos ajustes: a voz web em cache passa a ser escolhida de novo
export function voiceChanged() {
  cachedVoice = null;
}

export function cancelSpeech() {
  try {
    const N = nativeTTS();
    if (N) N.stop().catch(() => {});
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
