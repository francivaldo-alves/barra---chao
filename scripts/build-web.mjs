// Monta a pasta www/ só com o que o app usa em tempo de execução (é o que vai dentro do APK).
// A lista vem do ASSETS do sw.js (lista única: o que fica offline é o que é copiado) e o nome do cache
// vira um hash do conteúdo, então o celular sempre troca para a versão nova sem mexer em número de versão.
// Uso: node scripts/build-web.mjs
import { copyFileSync, existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { createHash } from "node:crypto";
import { dirname, join, posix } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const out = join(root, "www");

const sw = readFileSync(join(root, "sw.js"), "utf8");
const block = sw.slice(sw.indexOf("const ASSETS")).split("];")[0];
const files = [...block.matchAll(/"\.\/([^"]*)"/g)].map(m => m[1]).filter(Boolean);
if (!files.includes("index.html")) throw new Error("ASSETS do sw.js não encontrado ou sem index.html");

const missing = files.filter(p => !existsSync(join(root, p)));
if (missing.length) {
  console.error(`Arquivos da lista ASSETS do sw.js que não existem:\n  ${missing.join("\n  ")}`);
  process.exit(1);
}

// Segue os imports/links a partir do index.html: arquivo usado pelo app e fora da lista quebraria o APK offline
const used = new Set(), refRe = /(?:from\s*|import\s*\(\s*|src=|href=|url\()["']?([^"')\s>]+\.(?:js|css|woff2|png|svg|webmanifest))/g;
const walk = p => {
  if (used.has(p) || !existsSync(join(root, p))) return used.add(p);
  used.add(p);
  if (!/\.(html|js|css)$/.test(p) || p.startsWith("vendor/")) return;
  for (const [, r] of readFileSync(join(root, p), "utf8").matchAll(refRe)) {
    if (!/^(https?:|data:|\/\/)/.test(r)) walk(posix.normalize(posix.join(posix.dirname(p), r)));
  }
};
walk("index.html");
const fora = [...used].filter(p => !files.includes(p));
if (fora.length) {
  console.error(`Arquivos usados pelo app que faltam na lista ASSETS do sw.js:\n  ${fora.join("\n  ")}`);
  process.exit(1);
}

rmSync(out, { recursive: true, force: true });
const hash = createHash("sha256");
for (const p of files) {
  mkdirSync(dirname(join(out, p)), { recursive: true });
  copyFileSync(join(root, p), join(out, p));
  hash.update(p).update(readFileSync(join(root, p)));
}

const ver = hash.digest("hex").slice(0, 10);
if (!sw.includes('"barra-e-chao-dev"')) throw new Error('sw.js sem o marcador CACHE_NAME "barra-e-chao-dev"');
writeFileSync(join(out, "sw.js"), sw.replace('"barra-e-chao-dev"', `"barra-e-chao-${ver}"`));
console.log(`www/ pronto: ${files.length} arquivos + sw.js (cache barra-e-chao-${ver})`);
