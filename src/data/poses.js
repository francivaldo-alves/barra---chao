// Poses de referência, famílias de movimentos e mapeamento anatômico
import { RAD, lerpPose } from "../engine/kinematics2d.js";

const STAND = { root: "hip", at: [110, 60.4], T: 90, UA: -85, FA: -85, F: 0, ik: { leg: [112, 4, 1] } };
const SQ_HANDS = { root: "hip", at: [104, 26], T: 26, F: -10, ik: { leg: [112, 4, 1], arm: [140, 0, -1] } };
const PLANK_HI = { root: "a", at: [48, 9], T: 21, TH: 201, SH: 201, ik: { arm: [140, 0, -1] } };
const PUSH_LOW = { root: "a", at: [48, 9], T: 9, TH: 189, SH: 189, ik: { arm: [140, 0, -1] } };
const JUMP = { root: "hip", at: [110, 74], T: 92, UA: 80, FA: 82, TH: 272, SH: 268, F: 310 };
const PIKE_K = { root: "s", at: [114.6, 26.2], T: -36.5, F: 320, ik: { arm: [150, 0, -1], leg: [57, 9, 1] } };

// Famílias: A/B = início/fim (movimento de ida e volta). K = sequência de poses (movimentos compostos).
export const FAM = {
  pushup: { hi: "arm", ik: { arm: [146, 0, -1] }, A: { root: "a", at: [55, 9], T: 21, TH: 201, SH: 201 }, B: { T: 9, TH: 189, SH: 189 } },
  pushup_knee: { hi: "arm", ik: { arm: [146, 0, -1] }, A: { root: "k", at: [84, 4], T: 36, TH: 213, SH: 175, F: 230 }, B: { T: 25, TH: 200, SH: 178 } },
  // Flexão negativa: desce controlado na prancha alta, apoia os joelhos no chão embaixo e sobe de joelhos
  pushup_neg: {
    hi: "arm",
    K: [
      { root: "a", at: [55, 9], T: 21, TH: 201, SH: 201, ik: { arm: [146, 0, -1] } },
      { root: "a", at: [55, 9], T: 15, TH: 195, SH: 195, ik: { arm: [146, 0, -1] } },
      { root: "a", at: [55, 9], T: 9, TH: 189, SH: 189, ik: { arm: [146, 0, -1] } },
      // joelhos no chão com os dedos apoiados (calcanhar elevado): o pé não vira pelo piso ao sair da prancha
      { root: "k", at: [84, 4], T: 25, TH: 200, SH: 170, F: 300, ik: { arm: [146, 0, -1] } },
      { root: "k", at: [84, 4], T: 36, TH: 213, SH: 167, F: 300, ik: { arm: [146, 0, -1] } }
    ]
  },
  // Flexão explosiva: desce até o peito perto do chão e empurra forte descolando as mãos do solo no ar
  pushup_exp: {
    hi: "arm",
    K: [
      { root: "a", at: [55, 9], T: 21, TH: 201, SH: 201, ik: { arm: [146, 0, -1] } },
      { root: "a", at: [55, 9], T: 9, TH: 189, SH: 189, ik: { arm: [146, 0, -1] } },
      { root: "a", at: [55, 9], T: 31, TH: 207, SH: 207, UA: -68, FA: -62, hd: -6 },
      { root: "a", at: [55, 9], T: 12, TH: 192, SH: 192, ik: { arm: [146, 0, -1] } }
    ]
  },
  // Flexão arqueira: um braço dobra sustentando a carga enquanto o outro estende lateralmente, alternando os lados
  pushup_arch: {
    hi: "arm",
    K: [
      { root: "a", at: [55, 9], T: 21, TH: 201, SH: 201, ik: { arm: [146, 0, -1] } },
      { root: "a", at: [55, 9], T: 9, TH: 189, SH: 189, UA2: -22, FA2: -18, ik: { arm: [144, 0, -1] } },
      { root: "a", at: [55, 9], T: 21, TH: 201, SH: 201, ik: { arm: [146, 0, -1] } },
      { root: "a", at: [55, 9], T: 9, TH: 189, SH: 189, UA2: -22, FA2: -18, ik: { arm: [144, 0, -1] }, swap: true }
    ]
  },
  sphinx: { hi: "arm", K: [{ root: "a", at: [50, 9], T: 10, TH: 190, SH: 190, UA: 270, FA: 0 }, { root: "a", at: [50, 9], T: 19, TH: 199, SH: 199, ik: { arm: [158, 0, -1] } }] },
  pike: { hi: "arm", ik: { arm: [150, 0, -1], leg: [51, 4, 1] }, A: { root: "s", at: [114.6, 26.2], T: -36.5, F: 340, hd: 15 }, B: { at: [118, 20.5], T: -42, hd: 30 } },
  // Prancha para V invertido: mãos e pés permanecem fixos no solo enquanto o quadril sobe em pirâmide
  plank_dd: {
    hi: "arm",
    ik: { arm: [142, 0, -1], leg: [56, 9, 1] },
    A: { root: "s", at: [137.5, 41.5], T: 21, F: 290, hd: 0 },
    B: { at: [114, 32], T: -33, F: 305, hd: 12 }
  },
  hindu: { hi: "arm", K: [PIKE_K, { root: "a", at: [57, 9], T: 6, TH: 186, SH: 186, ik: { arm: [150, 0, -1] } }, { root: "a", at: [57, 9], T: 34, TH: 184, SH: 184, hd: 10, ik: { arm: [150, 0, -1] } }, { root: "a", at: [57, 9], T: 6, TH: 186, SH: 186, ik: { arm: [150, 0, -1] } }] },
  bear: { hi: "arm", ik: { arm: [137, 0, -1] }, A: { root: "a", at: [70, 8], T: 6, TH: 272, SH: 180.5, F: 285 }, B: { T: 10, SH: 187 } },
  // Superman com puxada: interpolação angular sem encolher membros no 2D e puxada W em 3D
  superman: {
    hi: "torso",
    pull3d: true,
    A: { root: "hip", at: [100, 7], T: 5, TH: 178, SH: 178, UA: 12, FA: 18, F: 225, hd: -2 },
    B: { T: 14, TH: 171, SH: 171, UA: 150, FA: 8, F: 270, hd: -6 }
  },
  superman_alt: { hi: "torso", A: { root: "hip", at: [100, 7], T: 6, TH: 172, SH: 172, TH2: 180, SH2: 180, UA: 2, FA: 2, UA2: 18, FA2: 18, F: 225, F2: 225 }, B: { TH: 180, SH: 180, TH2: 172, SH2: 172, UA: 18, FA: 18, UA2: 2, FA2: 2 } },
  // Elevação Y deitado: pernas permanecem apoiadas no chão enquanto peito e braços em Y sobem
  prone_y: { hi: "torso", A: { root: "hip", at: [100, 7], T: 2, TH: 180, SH: 180, UA: 0, FA: 0, F: 225 }, B: { T: 12, TH: 180, SH: 180, UA: 24, FA: 26 } },
  // Superman segurado (isometria): peito, braços e pernas ficam elevados fora do chão sustentando o arco dorsal
  superman_iso: { hi: "torso", A: { root: "hip", at: [100, 7], T: 12, TH: 171, SH: 169, UA: 16, FA: 18, F: 225 }, B: { T: 15, TH: 168, SH: 166, UA: 21, FA: 23 } },
  backwidow: { hi: "torso", ik: { leg: [70, 4, -1] }, A: { root: "hip", at: [100, 6], T: 0, UA: 185, FA: 90, F: 180 }, B: { T: 20, UA: 220, FA: 95 } },
  squat: { hi: "leg", ik: { leg: [112, 4, 1] }, A: { root: "hip", at: [110, 60.4], T: 90, UA: -85, FA: -85, F: 0 }, B: { at: [92, 31], T: 58, UA: 5, FA: 0 } },
  // Agachamento prisioneiro: mãos na nuca (sem cotovelo subindo acima do crânio)
  squat_pr: { hi: "leg", ik: { leg: [112, 4, 1] }, A: { root: "hip", at: [110, 60.4], T: 90, UA: 35, FA: 162, F: 0 }, B: { at: [92, 31], T: 58, UA: 3, FA: 130 } },
  sumo: { hi: "leg", ik: { leg: [92, 4, -1], leg2: [138, 4, 1] }, A: { root: "hip", at: [115, 53.5], T: 90, UA: 300, FA: 150, UA2: 240, FA2: 30, F: 200, F2: 340 }, B: { at: [115, 32] } },
  // Afundo lateral: começa em pé com pés próximos, dá um passo largo lateral (pés plantados), volta ao centro e alterna o lado
  side_lunge: {
    hi: "leg",
    K: [
      { root: "hip", at: [120, 58], T: 90, UA: 275, FA: 275, UA2: 265, FA2: 265, F: 195, F2: 345, ik: { leg: [111, 4, -1], leg2: [129, 4, 1] } },
      { root: "hip", at: [102, 33], T: 84, UA: 295, FA: 145, UA2: 245, FA2: 35, F: 190, F2: 350, ik: { leg: [86, 4, -1], leg2: [142, 4, 1] } },
      { root: "hip", at: [120, 58], T: 90, UA: 275, FA: 275, UA2: 265, FA2: 265, F: 195, F2: 345, ik: { leg: [111, 4, -1], leg2: [129, 4, 1] } },
      { root: "hip", at: [138, 33], T: 96, UA: 295, FA: 145, UA2: 245, FA2: 35, F: 190, F2: 350, ik: { leg: [98, 4, -1], leg2: [154, 4, 1] } }
    ]
  },
  // Agachamento cossaco: base bem aberta fixa, agacha fundo sobre um calcanhar enquanto o outro pé gira a ponta para cima (90°)
  cossack: {
    hi: "leg",
    K: [
      { root: "hip", at: [120, 46], T: 90, UA: 290, FA: 165, UA2: 250, FA2: 15, F: 195, F2: 345, ik: { leg: [82, 4, -1], leg2: [158, 4, 1] } },
      { root: "hip", at: [95, 21], T: 80, UA: 300, FA: 150, UA2: 240, FA2: 30, F: 185, F2: 90, ik: { leg: [82, 4, -1], leg2: [158, 4, 1] } },
      { root: "hip", at: [120, 46], T: 90, UA: 290, FA: 165, UA2: 250, FA2: 15, F: 195, F2: 345, ik: { leg: [82, 4, -1], leg2: [158, 4, 1] } },
      { root: "hip", at: [145, 21], T: 100, UA: 300, FA: 150, UA2: 240, FA2: 30, F: 90, F2: 355, ik: { leg: [82, 4, -1], leg2: [158, 4, 1] } }
    ]
  },
  pistol: { hi: "leg", ik: { leg: [112, 4, 1] }, A: { root: "hip", at: [108, 58], T: 90, TH2: -60, SH2: -70, UA: -80, FA: -80, F: 0, F2: 20 }, B: { at: [94, 20], T: 58, TH2: 2, SH2: 0, UA: 0, FA: 0, F2: 90 } },
  // Pistol negativo: desce equilibrando em uma perna só e apoia os dois pés no chão para subir
  pistol_neg: {
    hi: "leg",
    K: [
      { root: "hip", at: [108, 58], T: 90, TH2: -60, SH2: -70, UA: -80, FA: -80, F: 0, F2: 20, ik: { leg: [112, 4, 1] } },
      { root: "hip", at: [100, 38], T: 72, TH2: -20, SH2: -25, UA: -20, FA: -15, F: 0, F2: 60, ik: { leg: [112, 4, 1] } },
      { root: "hip", at: [94, 20], T: 58, TH2: 2, SH2: 0, UA: 0, FA: 0, F: 0, F2: 90, ik: { leg: [112, 4, 1] } },
      { root: "hip", at: [92, 28], T: 60, UA: 5, FA: 0, F: 0, F2: 0, ik: { leg: [112, 4, 1], leg2: [112, 4, 1] } },
      { root: "hip", at: [110, 60.4], T: 90, UA: -85, FA: -85, F: 0, F2: 0, ik: { leg: [112, 4, 1], leg2: [112, 4, 1] } }
    ]
  },
  bridge: { hi: "leg", ik: { leg: [84, 4, -1] }, A: { root: "s", at: [155, 8], T: 0, UA: 180, FA: 180, F: 180, hd: 0 }, B: { T: -22, hd: 22 } },
  // Ponte isométrica: sustenta o quadril elevado em linha reta dos ombros aos joelhos
  bridge_iso: { hi: "leg", ik: { leg: [84, 4, -1] }, A: { root: "s", at: [155, 8], T: -20, UA: 180, FA: 180, F: 180, hd: 20 }, B: { T: -23, hd: 23 } },
  bridge1: { hi: "leg", ik: { leg: [84, 4, -1] }, A: { root: "s", at: [155, 8], T: 0, UA: 180, FA: 180, F: 180, hd: 0, TH2: 150, SH2: 150, F2: 90 }, B: { T: -22, hd: 22, TH2: 158, SH2: 158 } },
  // Bom dia: mãos presas à nuca acompanhando a inclinação do tronco
  goodmorning: { hi: "leg", ik: { leg: [112, 4, 1] }, A: { root: "hip", at: [110, 60.4], T: 90, UA: 35, FA: 162, F: 0, hd: 0 }, B: { at: [100, 57], T: 12, UA: -43, FA: 84, hd: 10 } },
  rdl: { hi: "leg", ik: { leg: [112, 4, 1] }, A: { root: "hip", at: [110, 60.4], T: 90, UA: 270, FA: 270, TH2: 270, SH2: 270, F: 0, F2: 0 }, B: { at: [110, 58.6], T: 8, UA: 265, FA: 265, TH2: 178, SH2: 178, F2: -90 } },
  calf: { hi: "leg", A: { root: "t", at: [124, 4], T: 90, TH: 270, SH: 270, UA: 270, FA: 270, F: 0 }, B: { F: -40 } },
  calf1: { hi: "leg", A: { root: "t", at: [124, 4], T: 90, TH: 270, SH: 270, TH2: 300, SH2: 240, UA: 270, FA: 270, F: 0, F2: 330 }, B: { F: -40 } },
  plank: { hi: "torso", A: { root: "s", at: [144.4, 25.6], T: 26, TH: 180, SH: 180, UA: 270, FA: 0, F: 270, hd: -16 }, B: { T: 10, TH: 190, SH: 190, F: 280, hd: 0 } },
  // Prancha lateral: braço de cima alinhado ao quadril/corpo sem atravessar a escápula
  side_plank: { hi: "torso", A: { root: "s", at: [140, 22.4], T: 21, TH: 180, SH: 180, UA: 270, FA: 0, UA2: 195, FA2: 195, F: 270, hd: -13 }, B: { T: 8, TH: 188, SH: 188, UA2: 188, FA2: 188, F: 278, hd: 0 } },
  // Prancha com toque no ombro: mão livre parte da posição de prancha e sobe sob o peito até o ombro oposto
  shoulder_tap: { hi: "torso", ik: { arm: [146, 0, -1] }, A: { root: "a", at: [55, 9], T: 21, TH: 201, SH: 201, UA2: -82, FA2: -76 }, B: { UA2: -108, FA2: 38 } },
  hollow: { hi: "torso", A: { root: "hip", at: [110, 5], T: 4, TH: 176, SH: 176, UA: 0, FA: 0, F: 100 }, B: { T: 17, TH: 163, SH: 163, UA: 20, FA: 20, F: 120 } },
  deadbug: { hi: "torso", A: { root: "hip", at: [105, 6], T: 0, TH: 90, SH: 180, TH2: 90, SH2: 180, UA: 90, FA: 90, UA2: 90, FA2: 90, F: 90, F2: 90 }, B: { TH: 172, SH: 172, F: 100, UA2: 15, FA2: 15 } },
  legraise: { hi: "torso", A: { root: "hip", at: [110, 6], T: 0, TH: 178, SH: 178, UA: 180, FA: 180, F: 90 }, B: { TH: 95, SH: 95, F: 5 } },
  crunch: { hi: "torso", ik: { leg: [62, 4, -1] }, A: { root: "hip", at: [100, 6], T: 0, UA: 40, FA: 250, F: 180 }, B: { T: 28, UA: 68, FA: 278 } },
  situp: { hi: "torso", ik: { leg: [62, 4, -1] }, A: { root: "hip", at: [100, 6], T: 0, UA: 40, FA: 250, F: 180 }, B: { T: 80, UA: 120, FA: 330 } },
  remador: { hi: "torso", A: { root: "hip", at: [110, 6], T: 0, UA: 2, FA: 2, TH: 180, SH: 180, F: 90 }, B: { T: 96, UA: 192, FA: 186, TH: 132, SH: 252, F: 180 } },
  flutter: { hi: "torso", A: { root: "hip", at: [110, 6], T: 6, UA: 180, FA: 180, TH: 166, SH: 166, TH2: 177, SH2: 177, F: 100, F2: 100 }, B: { TH: 177, SH: 177, TH2: 166, SH2: 166 } },
  vup: { hi: "torso", A: { root: "hip", at: [110, 6], T: 0, UA: 2, FA: 2, TH: 180, SH: 180, F: 90 }, B: { T: 50, UA: 140, FA: 140, TH: 128, SH: 128, F: 38 } },
  jack: { hi: "leg", hop: 7, A: { root: "hip", at: [120, 60], T: 90, UA: 275, FA: 275, UA2: 265, FA2: 265, TH: 272, SH: 272, TH2: 268, SH2: 268, F: 0, F2: 180 }, B: { at: [120, 57], UA: 405, FA: 430, UA2: 135, FA2: 110, TH: 290, SH: 290, TH2: 250, SH2: 250 } },
  skip: { hi: "leg", A: { root: "hip", at: [118, 60], T: 92, TH: 15, SH: 275, TH2: -90, SH2: 270, UA: 235, FA: 270, UA2: 300, FA2: 420, F: 0, F2: 0 }, B: { TH: -90, SH: 270, TH2: 15, SH2: 275, UA: 300, FA: 420, UA2: 235, FA2: 270 } },
  mclimb: { hi: "leg", ik: { arm: [146, 0, -1] }, A: { root: "s", at: [142, 43.5], T: 22, TH: 320, SH: 190, F: 300, TH2: 202, SH2: 202, F2: 292 }, B: { TH: 202, SH: 202, F: 292, TH2: 320, SH2: 190, F2: 300 } },
  jsquat: { hi: "leg", K: [STAND, { root: "hip", at: [99, 43], T: 64, UA: 225, FA: 225, F: 0, ik: { leg: [112, 4, 1] } }, { root: "hip", at: [107, 58], T: 84, UA: 15, FA: 25, F: 0, ik: { leg: [112, 4, 1] } }, JUMP] },
  jlunge: {
    hi: "leg",
    K: [
      { root: "hip", at: [103, 29], T: 90, UA: -90, FA: -90, F: 0, F2: 280, ik: { leg: [140, 4, 1], leg2: [70, 9, 1] } },
      { root: "hip", at: [105, 64], T: 90, UA: -90, FA: -90, TH: 300, SH: 280, TH2: 250, SH2: 220, F: 330, F2: 320 },
      { root: "hip", at: [103, 29], T: 90, UA: -90, FA: -90, F: 280, F2: 0, ik: { leg: [70, 9, 1], leg2: [140, 4, 1] } },
      { root: "hip", at: [105, 64], T: 90, UA: -90, FA: -90, TH: 250, SH: 220, TH2: 300, SH2: 280, F: 320, F2: 330 }
    ]
  },
  sprawl: { hi: "torso", K: [STAND, SQ_HANDS, PLANK_HI, SQ_HANDS] },
  burpee: { hi: "torso", K: [STAND, SQ_HANDS, PLANK_HI, SQ_HANDS, STAND, JUMP] },
  burpee_pu: { hi: "torso", K: [STAND, SQ_HANDS, PLANK_HI, PUSH_LOW, PLANK_HI, SQ_HANDS, STAND, JUMP] },
  pushup_wall: { hi: "arm", ik: { arm: [172, 90, -1] }, A: { root: "a", at: [95, 4], T: 70, TH: 250, SH: 250, F: 0 }, B: { T: 60, TH: 240, SH: 240 } },
  wall_sit: { hi: "leg", ik: { leg: [112, 4, 1] }, A: { root: "hip", at: [85, 57], T: 90, UA: -88, FA: -88, F: 0 }, B: { at: [84, 32] } },
  kickback: { hi: "leg", ik: { arm: [127, 0, -1] }, A: { root: "k", at: [84, 4], T: 15, TH: 270, SH: 180, F: 202, TH2: 270, SH2: 180, F2: 202 }, B: { TH2: 193, SH2: 193, F2: 270 } },
  plank_leg: { hi: "leg", A: { root: "a", at: [50, 9], T: 10, TH: 190, SH: 190, UA: 270, FA: 0, TH2: 190, SH2: 190, F2: 280 }, B: { TH2: 174, SH2: 174, F2: 262 } },
  updown: { hi: "arm", K: [{ root: "a", at: [50, 9], T: 10, TH: 190, SH: 190, UA: 270, FA: 0 }, { root: "a", at: [50, 9], T: 21, TH: 201, SH: 201, ik: { arm: [141, 0, -1] } }] },
  inchworm: {
    hi: "arm",
    K: [
      { root: "hip", at: [80, 60], T: 90, UA: -85, FA: -85, F: 0, ik: { leg: [82, 4, 1] } },
      { root: "hip", at: [88, 59.5], T: -25, F: 0, ik: { leg: [82, 4, 1], arm: [126, 0, -1] } },
      { root: "s", at: [140.2, 26.2], T: -42, F: 340, ik: { arm: [175, 0, -1], leg: [82, 4, 1] } },
      { root: "a", at: [82, 9], T: 21, TH: 201, SH: 201, ik: { arm: [175, 0, -1] } },
      { root: "s", at: [140.2, 26.2], T: -42, F: 340, ik: { arm: [175, 0, -1], leg: [82, 4, 1] } },
      { root: "hip", at: [88, 59.5], T: -25, F: 0, ik: { leg: [82, 4, 1], arm: [126, 0, -1] } }
    ]
  },
  // Progressões clássicas de Calistenia (Recommended Routine / Convict Conditioning / dmdez)
  scap_push: {
    hi: "arm",
    ik: { arm: [145, 0, -1] },
    A: { root: "a", at: [55, 9], T: 23.5, TH: 198, SH: 198, hd: -6 },
    B: { T: 19.5, TH: 202, SH: 202, hd: 6 }
  },
  lsit: {
    hi: "torso",
    A: { root: "hip", at: [104, 6.5], T: 78, UA: 266, FA: 274, TH: -3, SH: -3, F: 85, hd: 4 },
    B: { at: [104, 11], T: 76, UA: 268, FA: 272, TH: 5, SH: 5, F: 90, hd: 8 }
  },
  wheel_bridge: {
    hi: "torso",
    ik: { leg: [78, 4, -1], arm: [158, 2, 1] },
    A: { root: "hip", at: [110, 18], T: 6, F: 180, hd: -10 },
    B: { at: [112, 36], T: -8, F: 180, hd: -26 }
  },
  nordic: {
    hi: "leg",
    A: { root: "k", at: [115, 4], TH: 266, SH: 168, F: 265, T: 86, UA: -65, FA: 55, hd: 0 },
    B: { TH: 234, SH: 168, F: 265, T: 52, UA: -35, FA: 25, hd: 6 }
  },
  rev_nordic: {
    hi: "leg",
    A: { root: "k", at: [122, 4], TH: 270, SH: 168, F: 265, T: 90, UA: -75, FA: -65, hd: 0 },
    B: { TH: 300, SH: 168, F: 265, T: 120, UA: 10, FA: 15, hd: -12 }
  },
  dragon_flag: {
    hi: "torso",
    A: { root: "s", at: [152, 8], T: -4, TH: 176, SH: 176, UA: 180, FA: 180, F: 86, hd: 8 },
    B: { T: -42, TH: 138, SH: 138, UA: 180, FA: 180, F: 48, hd: 36 }
  },
  tibialis: {
    hi: "leg",
    A: { root: "a", at: [118, 4], T: 88, TH: 278, SH: 278, UA: -86, FA: -84, F: -18 },
    B: { F: 28 }
  },
  crow: {
    hi: "arm",
    ik: { arm: [128, 0, -1] },
    A: { root: "hip", at: [96, 22], T: 20, TH: -10, SH: 205, F: 335, hd: 12 },
    B: { at: [102, 27], T: 12, TH: -18, SH: 186, F: 245, hd: 22 }
  }
};

for (const k in FAM) {
  const f = FAM[k];
  if (f.A) f.B = { ...f.A, ...f.B };
}

// Variantes sem salto / com salto que partem de uma família pronta
{
  const A = FAM.skip.A, B = FAM.skip.B;
  const mid = { ...lerpPose(A, B, 0.5), TH: -90, SH: 270, TH2: -90, SH2: 270, F: 0, F2: 0 };
  FAM.skip = { hi: "leg", K: [A, mid, B, mid] };
  FAM.skip_run = { ...FAM.skip, hop: 5 };
}
{
  const A = FAM.jack.A, B = FAM.jack.B;
  const step = open => ({
    ...B,
    ik: {
      leg: open ? [B.at[0] + 56 * Math.cos(B.TH * RAD), 1.5, 1] : [A.at[0] + 56 * Math.cos(A.TH * RAD), 4, -1],
      leg2: open ? [A.at[0] + 56 * Math.cos(A.TH2 * RAD), 4, 1] : [B.at[0] + 56 * Math.cos(B.TH2 * RAD), 1.5, -1]
    }
  });
  FAM.jack_step = { hi: "leg", K: [A, step(true), A, step(false)] };
}
{
  // Afundos com passo real e pernas alternadas: em pé → passo à frente (lunge) ou para trás (lunge_rev) → em pé.
  // Embaixo: tronco 33 à frente do pé de trás e 37 atrás do pé da frente, joelho de trás a ~9 do chão.
  const low = (hipX, front, back, swap) => ({
    root: "hip", at: [hipX, 29], T: 90, UA: -90, FA: -90, F: swap ? 280 : 0, F2: swap ? 0 : 280,
    ik: swap ? { leg: [back, 10, 1], leg2: [front, 4, 1] } : { leg: [front, 4, 1], leg2: [back, 10, 1] }
  });
  FAM.lunge = { hi: "leg", K: [STAND, low(145, 182, 112), STAND, low(145, 182, 112, true)] };
  FAM.lunge_rev = { hi: "leg", K: [STAND, low(79, 112, 42), STAND, low(79, 112, 42, true)] };
}
{
  // Toque no ombro alternando os braços: as duas mãos partem do mesmo apoio e cada toque usa um braço
  const { A, B, ik } = FAM.shoulder_tap, { UA2, FA2, ...A0 } = A, a = { ...A0, ik }, b = { ...B, ik };
  FAM.shoulder_tap = { hi: "torso", K: [a, b, a, { ...b, swap: true }] };
}
{
  // Escalador como sequência: o pé que avança tira do chão em arco em vez de raspar o piso
  const { A, B, ik } = FAM.mclimb;
  FAM.mclimb = { hi: "leg", K: [{ ...A, ik }, { ...B, ik }] };
}

// Pegada pelo nome do exercício: no 2D (vista lateral) só aparece o avanço/recuo das mãos em relação ao ombro.
// Largura (aberta, fechada, arqueira) é feita no 3D (VARS em viewer3d.js), que usa os mesmos recuos.
export const HAND_X = [[/planche/i, -11], [/diamante/i, -6], [/fechad/i, -4], [/abert/i, 4]];
// Exercícios de um lado só: na metade da série o player troca para o outro lado (side = 2).
export const UNILAT = new Set(["bridge1", "calf1", "pistol", "pistol_neg", "rdl", "kickback", "plank_leg", "side_plank"]);
const famVar = new Map();
export function famFor(fk, name, side = 1) {
  const dx = (HAND_X.find(([r]) => r.test(name || "")) || [0, 0])[1], arm = FAM[fk].ik?.arm;
  const sw = side === 2 && UNILAT.has(fk) ? (FRONTV.has(fk) ? "front" : "side") : "";
  if ((!dx || !arm) && !sw) return FAM[fk];
  const key = fk + dx + sw;
  if (!famVar.has(key)) {
    const f = { ...FAM[fk], ready: false, vb: null, swap: sw };
    if (dx && arm) f.ik = { ...FAM[fk].ik, arm: [arm[0] + dx, ...arm.slice(1)] };
    famVar.set(key, f);
  }
  return famVar.get(key);
}

// Desenho só do 2D: a puxada em W do superman não cabe na vista lateral, então o 2D mostra braços à frente (o 3D faz o W)
export const D2 = {
  superman: {
    hi: "torso",
    A: { root: "hip", at: [100, 7], T: 5, TH: 178, SH: 178, UA: 12, FA: 14, F: 225, hd: -2 },
    B: { root: "hip", at: [100, 7], T: 14, TH: 171, SH: 171, UA: 24, FA: 22, F: 225, hd: -6 }
  }
};

export const MIRROR = new Set(["backwidow", "bridge", "bridge_iso", "bridge1", "wheel_bridge", "hollow", "deadbug", "legraise", "crunch", "situp", "remador", "flutter", "vup", "dragon_flag"]);
export const FRONTV = new Set(["jack", "jack_step", "sumo", "side_lunge", "cossack"]);

// Músculos destacados em vermelho em cada movimento (para 2D e 3D)
export const MUS = {
  jack_step: ["calf", "delt"], skip_run: ["quad", "calf"], pushup_wall: ["pec", "tri", "delt"],
  wall_sit: ["quad", "glute"], kickback: ["glute", "ham"], plank_leg: ["glute", "abs"],
  updown: ["tri", "delt", "abs"], pushup: ["pec", "tri", "delt"], pushup_knee: ["pec", "tri", "delt"],
  pushup_neg: ["pec", "tri", "delt"], pushup_exp: ["pec", "tri", "delt"], pushup_arch: ["pec", "tri", "delt"],
  sphinx: ["tri"], pike: ["delt", "tri"], plank_dd: ["delt", "abs"], hindu: ["pec", "delt", "tri"],
  bear: ["delt", "abs", "quad"], superman: ["lowback", "glute", "lat"], superman_alt: ["lowback", "glute"],
  superman_iso: ["lowback", "glute", "trap"],
  prone_y: ["trap", "lowback"], backwidow: ["trap", "lat"], squat: ["quad", "glute"], squat_pr: ["quad", "glute"],
  sumo: ["quad", "glute"], lunge: ["quad", "glute"], lunge_rev: ["quad", "glute"], side_lunge: ["quad", "glute"], cossack: ["quad", "glute"], pistol: ["quad", "glute"], pistol_neg: ["quad", "glute"],
  bridge: ["glute", "ham"], bridge_iso: ["glute", "ham"], bridge1: ["glute", "ham"], goodmorning: ["ham", "glute", "lowback"],
  rdl: ["ham", "glute"], calf: ["calf"], calf1: ["calf"], plank: ["abs", "obl"], side_plank: ["obl", "abs"],
  shoulder_tap: ["abs", "obl", "delt"], hollow: ["abs"], deadbug: ["abs"], legraise: ["abs"],
  crunch: ["abs"], situp: ["abs"], remador: ["abs"], flutter: ["abs"], vup: ["abs"],
  jack: ["calf", "delt"], skip: ["quad", "calf"], mclimb: ["abs", "quad", "delt"],
  jsquat: ["quad", "glute", "calf"], jlunge: ["quad", "glute", "calf"], sprawl: ["pec", "quad", "abs"],
  burpee: ["pec", "quad", "abs"], burpee_pu: ["pec", "tri", "quad"], inchworm: ["delt", "abs", "ham"],
  scap_push: ["delt", "pec", "abs"], lsit: ["abs", "tri", "quad"], wheel_bridge: ["glute", "ham", "lowback", "delt"],
  nordic: ["ham", "glute"], rev_nordic: ["quad", "abs"], dragon_flag: ["abs", "obl", "lat"],
  tibialis: ["calf"], crow: ["delt", "tri", "abs"]
};

// Curvatura anatômica da coluna para cada família (+ = flexão abdominal/cifose, - = extensão dorsal/lordose)
export function spineCurveOf(fk, J) {
  const dy = J.s[1] - J.hip[1], dx = J.s[0] - J.hip[0], ang = Math.atan2(dy, dx) / RAD;
  if (fk === "crunch" || fk === "situp" || fk === "remador" || fk === "vup") {
    const f = Math.max(0, Math.min(1, ang / 45));
    return 6.5 * f;
  }
  if (fk === "hollow" || fk === "flutter" || fk === "legraise" || fk === "deadbug") return 3.2;
  if (fk === "scap_push") {
    const f = Math.max(0, Math.min(1, (23.5 - ang) / 4));
    return -2.6 + 6.8 * f;
  }
  if (fk === "lsit") return 2.2;
  if (fk === "crow") return 3.8;
  if (fk === "superman" || fk === "superman_alt" || fk === "superman_iso" || fk === "prone_y") {
    const f = Math.max(0, Math.min(1, (ang - 2) / 12));
    return -3.8 * (0.3 + 0.7 * f);
  }
  if (fk === "hindu") {
    return ang > 25 ? -5.0 * Math.min(1, (ang - 20) / 20) : ang < -20 ? 2.0 : 0;
  }
  if (fk === "bridge" || fk === "bridge_iso" || fk === "bridge1") return -2.2 * Math.max(0, Math.min(1, (J.hip[1] - 10) / 16));
  if (fk === "wheel_bridge") return -4.8 * Math.max(0, Math.min(1, (J.hip[1] - 8) / 20));
  if (fk === "inchworm") return ang < 0 ? 4.5 * Math.min(1, -ang / 35) : 0;
  return 0;
}

// Fases-chave de cada movimento: início/fim, ou cada etapa nos movimentos compostos
export function keyPhases(fk) {
  const f = FAM[fk];
  return f.K
    ? f.K.map((_, i) => [i / f.K.length, i === 0 ? "1 · Posição inicial" : `${i + 1} · Fase ${i + 1}`])
    : [[0, "Posição inicial"], [0.5, "Posição final"]];
}
