// Controle do Painel Inferior (Bottom Sheet) e botão Voltar do Android (popstate)
import { $ } from "./dom.js";
import { V3 } from "../engine/viewer3d.js";

let lastFocus = null;
let sheetBack = null;
let onStopPlayer = () => {};
let isPlayerRunning = () => false;

export function registerPlayerHooks(stopFn, activeFn) {
  onStopPlayer = stopFn;
  isPlayerRunning = activeFn;
}

export function hasSheetBack() {
  return !!sheetBack;
}

export function pushSheetBack(backFn) {
  if (backFn && !sheetBack) {
    const p = $("panel"), y = p.scrollTop;
    history.pushState({ sheet: 1 }, "");
    sheetBack = () => {
      backFn();
      $("panel").scrollTop = y;
    };
  }
}

export function openSheet() {
  if ($("sheet").hidden) history.pushState({ sheet: 1 }, "");
  lastFocus = document.activeElement;
  $("sheet").hidden = false;
  document.body.style.overflow = "hidden";
  $("panel").scrollTop = 0;
  const c = $("panel").querySelector(".close");
  if (c) c.focus();
}

export function closeSheet() {
  if (history.state && history.state.sheet) history.go(sheetBack ? -2 : -1);
  sheetBack = null;
  onStopPlayer();
  V3.unmount();
  $("sheet").hidden = true;
  document.body.style.overflow = "";
  $("panel").innerHTML = "";
  if (lastFocus && lastFocus.focus) lastFocus.focus();
}

export function initSheet() {
  window.addEventListener("popstate", () => {
    if ($("sheet").hidden) return;
    if (sheetBack) {
      const b = sheetBack;
      sheetBack = null;
      V3.unmount();
      b();
    } else {
      closeSheet();
    }
  });

  $("sheet").onclick = e => {
    if (e.target.id === "sheet" && !isPlayerRunning()) closeSheet();
  };

  document.addEventListener("keydown", e => {
    if (e.key === "Escape" && !$("sheet").hidden) closeSheet();
  });
}
