// Ponto de entrada principal (Bootstrap do App, Loop 2D/3D e Service Worker para Android Offline)
import { startAnimationLoop } from "./engine/figure2d.js";
import { initSheet } from "./ui/sheet.js";
import { initTimer } from "./ui/timer.js";
import { isPlayerActive } from "./ui/player.js";
import { initAppControls, render } from "./ui/app.js";

const bootDay = new Date().toDateString();

// Atualiza automaticamente caso o usuário reabra o app no dia seguinte
document.addEventListener("visibilitychange", () => {
  if (!document.hidden && !isPlayerActive() && new Date().toDateString() !== bootDay) {
    location.reload();
  }
});

// Inicializa componentes e renderiza interface
initSheet();
initTimer();
initAppControls();
startAnimationLoop();
render();

// Registra Service Worker para funcionamento 100% offline no Android (PWA / WebView)
if ("serviceWorker" in navigator && (location.protocol === "https:" || location.hostname === "localhost" || location.hostname === "127.0.0.1")) {
  let refreshing = false;
  navigator.serviceWorker.addEventListener("controllerchange", () => {
    if (!refreshing) {
      refreshing = true;
      window.location.reload();
    }
  });
  window.addEventListener("load", () => {
    navigator.serviceWorker
      .register("./sw.js", { updateViaCache: "none" })
      .then(reg => reg.update().catch(() => {}))
      .catch(() => {});
  });
}
