// Desafios progressivos de múltiplos dias

export const CHAL = [
  {
    id: "push30",
    n: "30 dias de flexão",
    d: "Flexões, tríceps e ombros com variações sorteadas a cada dia e folgas para recuperar.",
    days: 30,
    slots: [{ k: "push", sets: 3 }, { k: "push", sets: 3 }, { k: "tri", sets: 3 }, { k: "shoulder", sets: 2 }],
    r: { ini: 6, int: 10, avc: 15 },
    t: { ini: 20, int: 30, avc: 40 },
    g: 0.06,
    test: [{ k: "push", name: "Flexão" }]
  },
  {
    id: "abs30",
    n: "30 dias de abdômen",
    d: "Abdômen e core com exercícios diferentes a cada dia: supra, pranchas, elevações e cardio.",
    days: 30,
    slots: [{ k: "core", sets: 3 }, { k: "core", sets: 3 }, { k: "core", sets: 2 }, { k: "cond", sets: 2 }],
    r: { ini: 10, int: 15, avc: 22 },
    t: { ini: 20, int: 30, avc: 45 },
    g: 0.05,
    test: [{ k: "core", name: "Prancha" }, { k: "core", name: "Abdominal supra" }]
  },
  {
    id: "squat30",
    n: "30 dias de pernas",
    d: "Agachamentos, afundos, pontes e panturrilha, sorteados a cada dia.",
    days: 30,
    slots: [{ k: "squat", sets: 3 }, { k: "squat", sets: 3 }, { k: "hinge", sets: 3 }, { k: "calf", sets: 2 }],
    r: { ini: 10, int: 15, avc: 20 },
    t: { ini: 20, int: 30, avc: 45 },
    g: 0.06,
    test: [{ k: "squat", name: "Agachamento livre" }]
  },
  {
    id: "taf21",
    n: "21 dias rumo ao TAF",
    d: "Flexão e abdominal remador todo dia, mais exercícios sorteados de força e fôlego.",
    days: 21,
    slots: [{ k: "push", name: "Flexão", sets: 4 }, { k: "core", name: "Abdominal remador", sets: 4 }, { k: "tri", sets: 2 }, { k: "cond", sets: 2 }],
    r: { ini: 8, int: 12, avc: 18 },
    t: { ini: 20, int: 30, avc: 40 },
    g: 0.06,
    test: [{ k: "push", name: "Flexão" }, { k: "core", name: "Abdominal remador" }]
  },
  {
    id: "cardio14",
    n: "14 dias de cardio",
    d: "Fôlego e queima com quatro exercícios de condicionamento sorteados por dia.",
    days: 14,
    slots: [{ k: "cond", sets: 2 }, { k: "cond", sets: 2 }, { k: "cond", sets: 2 }, { k: "cond", sets: 2 }],
    r: { ini: 8, int: 12, avc: 16 },
    t: { ini: 30, int: 40, avc: 50 },
    g: 0.05,
    test: [{ k: "cond", name: "Burpee" }]
  },
  {
    id: "cali30",
    n: "30 dias de Calistenia & Skills",
    d: "Progressões clássicas de controle corporal: L-sit, parada de sapo (crow), ponte, flexão escapular e força unilateral.",
    days: 30,
    slots: [{ k: "shoulder", sets: 3 }, { k: "core", sets: 3 }, { k: "push", sets: 3 }, { k: "hinge", sets: 2 }],
    r: { ini: 6, int: 10, avc: 14 },
    t: { ini: 15, int: 25, avc: 40 },
    g: 0.05,
    test: [{ k: "core", name: "L-sit no chão" }, { k: "shoulder", name: "Pose do corvo (frog stand)" }]
  }
];
