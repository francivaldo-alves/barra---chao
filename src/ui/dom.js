// Utilitários de DOM e componentes visuais comuns

export const $ = id => document.getElementById(id);

export const esc = s => String(s).replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));

export function seg(node, opts, cur, on) {
  node.innerHTML = "";
  opts.forEach(([x, l]) => {
    const b = document.createElement("button");
    b.type = "button";
    b.textContent = l;
    b.setAttribute("aria-pressed", String(x == cur));
    b.onclick = () => on(x);
    node.appendChild(b);
  });
}

export const meter = v => `<span class="meter m${v}" aria-label="Intensidade ${v} de 5">${[1, 2, 3, 4, 5].map(i => `<i class="${i <= v ? "on" : ""}"></i>`).join("")}</span>`;

export const ptop = (label, title) => `<div class="panel-top"><div><span class="label">${label}</span><h2>${esc(title)}</h2></div><button class="close" type="button" aria-label="Fechar">×</button></div>`;
