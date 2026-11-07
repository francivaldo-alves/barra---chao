// Checa o motor do boneco 2D com as regras de anim-rules.js.
// Uso: node tests/anim-check.js
import { ALL, runChecks } from "./anim-rules.js";

const bad = runChecks();
if (bad.length) {
  // um exemplo por movimento + tipo de defeito
  const seen = new Map();
  for (const b of bad) seen.has(b.replace(/ fase [\d.]+|\(.*\)/g, "")) || seen.set(b.replace(/ fase [\d.]+|\(.*\)/g, ""), b);
  console.log([...seen.values()].join("\n"));
  console.log(`${bad.length} problemas`);
  process.exit(1);
}
console.log(`ok: ${ALL.length} movimentos sem defeitos (incluindo comprimentos 100% constantes e coluna articulada)`);
