// Visualizador 3D com biomecânica humana real, coluna articulada e prevenção de torção de malha
import { L, prepare, famFrame } from "./kinematics2d.js";
import { MIRROR, FRONTV, MUS, spineCurveOf, famFor } from "../data/poses.js";
import { tempoOf, tempoPhase } from "../data/tempo.js";

export const V3 = (() => {
  const MODEL_URL = "models/male-glb.js", K = 0.0157;
  const GROUPS = {
    quad: [426, 427, 428, 430, 431, 432],
    glute: [406, 410, 405, 408, 409, 412],
    ham: [450, 452, 454, 455, 456, 457],
    calf: [472, 473, 475, 476, 478, 479],
    pec: [225, 226, 227, 228, 229, 230],
    delt: [279, 280, 281, 282, 283, 284],
    bi: [295, 296, 297, 298, 299, 301],
    tri: [304, 305, 307, 308],
    fore: [313, 315, 319, 320, 321, 322, 331, 332, 334, 336, 337, 338, 339, 342, 343, 344],
    lat: [216, 222, 293, 294],
    trap: [203, 204, 205, 206, 207, 208],
    lowback: [163, 166, 169, 170],
    abs: [252, 253],
    obl: [256, 257, 238, 245]
  };
  const lin = c => c.map(x => x <= 0.04045 ? x / 12.92 : Math.pow((x + 0.055) / 1.055, 2.4));
  const VARS = [
    [/diamante/i, { hz: -0.85, el: 0.9 }],
    [/fechad/i, { hz: -0.4, el: 0 }],
    [/abert/i, { hz: 0.7, el: 0.8 }],
    [/arqueir/i, { hz: 0.5, el: 0.3, arch: 1, sh: 9 }],
    [/planche/i, { el: 0 }] // recuo das mãos vem de HAND_X (famFor)
  ];
  const varOf = n => (VARS.find(([r]) => r.test(n || "")) || [0, {}])[1];
  let vr = {};
  const FLARE = { pushup: 0.5, pushup_knee: 0.5, pushup_neg: 0.5, pushup_exp: 0.5, pushup_arch: 0.45, burpee_pu: 0.5, hindu: 0.42, pike: 0.3, crow: 0.35 };
  const ELBOW_OUT = { squat_pr: 15, goodmorning: 15, crunch: 13, situp: 13 };
  const NO_PLANK_IK = new Set(["side_plank", "lsit", "wheel_bridge", "dragon_flag", "scap_push", "pushup_arch"]);
  const SKIN = lin([0.81, 0.57, 0.42]),
    SKIN_WARM = lin([0.78, 0.46, 0.36]),
    SKIN_SHADE = lin([0.64, 0.41, 0.29]),
    SHORTS = lin([0.18, 0.23, 0.14]),
    WAIST = lin([0.09, 0.11, 0.08]),
    TRIM = lin([0.74, 0.57, 0.20]),
    SHOE_UPPER = lin([0.11, 0.13, 0.11]),
    SHOE_SOLE = lin([0.86, 0.80, 0.68]),
    SOCK = lin([0.22, 0.24, 0.20]),
    HAIR = lin([0.09, 0.07, 0.05]),
    HAIR_HI = lin([0.20, 0.14, 0.10]),
    SCLERA = lin([0.92, 0.89, 0.86]),
    IRIS = lin([0.25, 0.16, 0.10]),
    PUPIL = lin([0.06, 0.04, 0.04]),
    BROW = lin([0.15, 0.10, 0.07]),
    LIPS = lin([0.62, 0.33, 0.28]),
    BEARD_SHADE = lin([0.52, 0.36, 0.27]),
    RED = lin([0.84, 0.17, 0.13]);

  const ok = () => {
    try {
      if (!window.THREE || !THREE.GLTFLoader) return false;
      const c = document.createElement("canvas");
      return !!(c.getContext("webgl") || c.getContext("experimental-webgl"));
    } catch (e) {
      return false;
    }
  };

  let wall = null, tp3 = null, tt3 = 0, clk3 = null, shortsMask = null, R = null, scene, cam, outer, inner, mesh, bones = {}, bind = {}, colorAttr, baseCol, muscleArr, state = "idle", fam = null, famKey = "", host = null, pend = null,
    phase = 0, last = 0, paused = false, speed = 1, spin = false, az = 0, el = 0.26, baseAz = 0, target = null, dist = 200, drag = null, size = [0, 0], airborne = false;

  const V = (x, y, z) => new THREE.Vector3(x, y, z);
  const Q = () => new THREE.Quaternion();
  let spinBtn = null;
  const updSpin = () => { if (spinBtn) spinBtn.textContent = spin ? "Parar de girar" : "Girar sozinho"; };

  function stage() {
    R = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    R.setPixelRatio(Math.min(2, window.devicePixelRatio || 1));
    R.shadowMap.enabled = true;
    R.shadowMap.type = THREE.PCFSoftShadowMap;
    R.outputEncoding = THREE.sRGBEncoding;
    R.toneMapping = THREE.ACESFilmicToneMapping;
    R.toneMappingExposure = 1.06;
    scene = new THREE.Scene();
    cam = new THREE.PerspectiveCamera(30, 1.3, 1, 3000);
    scene.add(new THREE.HemisphereLight(0xfff4e8, 0x3c3a28, 0.78));
    const sun = new THREE.DirectionalLight(0xfff2e0, 1.28);
    sun.position.set(90, 190, 130);
    sun.castShadow = true;
    sun.shadow.bias = -0.0004;
    sun.shadow.mapSize.set(1024, 1024);
    Object.assign(sun.shadow.camera, { left: -160, right: 160, top: 160, bottom: -160, near: 10, far: 500 });
    scene.add(sun);
    const rim = new THREE.DirectionalLight(0xdfe8ff, 0.72);
    rim.position.set(-140, 120, -160);
    scene.add(rim);
    const fill = new THREE.DirectionalLight(0xffffff, 0.28);
    fill.position.set(-80, 30, 140);
    scene.add(fill);
    const floor = new THREE.Mesh(new THREE.CircleGeometry(170, 48), new THREE.ShadowMaterial({ opacity: 0.4 }));
    floor.rotation.x = -Math.PI / 2;
    floor.receiveShadow = true;
    scene.add(floor);
    outer = new THREE.Group();
    scene.add(outer);
    wall = new THREE.Mesh(new THREE.BoxGeometry(3, 190, 150), new THREE.MeshStandardMaterial({ color: new THREE.Color("#BDB8A0").convertSRGBToLinear(), roughness: 0.9 }));
    wall.receiveShadow = true;
    wall.visible = false;
    scene.add(wall);
    const c = R.domElement;
    c.style.touchAction = "none";
    c.style.display = "block";
    c.style.width = "100%";
    c.style.cursor = "grab";
    c.addEventListener("pointerdown", e => {
      drag = { x: e.clientX, y: e.clientY, az, el };
      c.setPointerCapture(e.pointerId);
      spin = false;
      c.style.cursor = "grabbing";
      updSpin();
    });
    c.addEventListener("pointermove", e => {
      if (!drag) return;
      az = drag.az - (e.clientX - drag.x) * 0.011;
      el = Math.max(-0.05, Math.min(1.2, drag.el + (e.clientY - drag.y) * 0.008));
    });
    const end = () => { drag = null; c.style.cursor = "grab"; };
    c.addEventListener("pointerup", end);
    c.addEventListener("pointercancel", end);
  }

  function load() {
    state = "loading";
    const fail = () => { state = "fail"; fallback(); };
    const done = g => {
      try {
        setup(g);
        state = "ready";
        if (pend) {
          const p = pend;
          pend = null;
          if (p.c.isConnected) mount(p.c, p.k, p.o);
        }
      } catch (e) {
        fail();
      }
    };
    const parse = () => {
      try {
        const bin = atob(window.__MALE_GLB), u = new Uint8Array(bin.length);
        for (let i = 0; i < bin.length; i++) u[i] = bin.charCodeAt(i);
        new THREE.GLTFLoader().parse(u.buffer, "", done, fail);
      } catch (e) {
        fail();
      }
    };
    if (window.__MALE_GLB) return parse();
    const sc = document.createElement("script");
    sc.src = MODEL_URL;
    sc.onload = () => window.__MALE_GLB ? parse() : fail();
    sc.onerror = fail;
    document.head.appendChild(sc);
  }

  function fallback() {
    if (pend && pend.c.isConnected && pend.o.onFail) pend.o.onFail();
    pend = null;
  }

  function setup(g) {
    inner = g.scene;
    inner.scale.setScalar(1 / K);
    outer.add(inner);
    inner.traverse(o => {
      if (o.isSkinnedMesh) mesh = o;
      if (o.isBone) bones[o.name] = o;
    });
    const geo = mesh.geometry, pos = geo.attributes.position, n = pos.count;
    if (!geo.attributes.normal) geo.computeVertexNormals();
    const norm = geo.attributes.normal;
    muscleArr = geo.attributes._muscle ? geo.attributes._muscle.array : new Float32Array(n);
    baseCol = new Float32Array(n * 3);
    shortsMask = new Float32Array(n);
    const ss = (a, b, v) => { const t = Math.max(0, Math.min(1, (v - a) / (b - a))); return t * t * (3 - 2 * t); };
    const mixc = (a, b, t) => a.map((v, k) => v + (b[k] - v) * t);

    for (let i = 0; i < n; i++) {
      const x = pos.getX(i), y = pos.getY(i), z = pos.getZ(i), ax = Math.abs(x);
      const ny = norm ? norm.getY(i) : 0, nz = norm ? norm.getZ(i) : 0;
      const mId = Math.round(muscleArr[i]);
      // Tom de pele bronzeado atlético com calor subcutâneo e relevo muscular
      const tone = (mId > 0 ? 0.05 : 0) + Math.max(0, -ny) * 0.10 + (1 - Math.abs(nz)) * 0.04;
      let c = mixc(SKIN, SKIN_SHADE, Math.min(0.42, tone));
      // Rubor natural no rosto (maçãs do rosto/nariz) e ombros/peitoral superior
      const cheekWarm = y > 1.60 && y < 1.66 && z > 0.08 ? 0.22 * ss(0.01, 0.055, ax) * (1 - ss(0.055, 0.085, ax)) : 0;
      const bodyWarm = y > 1.25 && y < 1.48 && ny > 0.2 ? 0.10 * ny : 0;
      if (cheekWarm + bodyWarm > 0) c = mixc(c, SKIN_WARM, Math.min(0.32, cheekWarm + bodyWarm));

      const sh = ax < 0.215 ? ss(0.615, 0.63, y) * (1 - ss(0.985, 0.998, y)) : 0;
      const shoeTop = 0.082 - Math.max(0, z - 0.02) * 0.12;
      const shoe = y < 0.112 ? 1 - ss(0.102, 0.112, y) : 0;
      if (sh > 0) {
        const waist = ss(0.945, 0.96, y);
        const hem = 1 - ss(0.625, 0.642, y);
        const stripe = ax > 0.155 && ax < 0.182 && y > 0.642 && y < 0.945 && Math.abs(z) < 0.032 ? 0.85 : 0;
        let sc = mixc(SHORTS, SHORTS.map(v => v * 0.62), Math.max(0, -ny) * 0.45 + 0.5 * hem);
        if (stripe > 0) sc = mixc(sc, TRIM, stripe);
        if (waist > 0) sc = mixc(sc, WAIST, waist);
        c = mixc(c, sc, sh);
        shortsMask[i] = sh;
      } else if (shoe > 0) {
        // Tênis esportivo 3D fechado (biqueira escura sem dedos brancos), solado na base e meia curta
        const sole = y < 0.0085 ? 1 : y < 0.022 && ny < -0.22 ? 1 - ss(0.015, 0.022, y) : 0;
        const sock = ss(shoeTop - 0.005, shoeTop + 0.005, y);
        const sideStripe = y > 0.022 && y < 0.052 && z > -0.02 && z < 0.075 && ax > 0.088 ? 0.85 : 0;
        let sc = mixc(SHOE_UPPER, SHOE_UPPER.map(v => v * 1.45), Math.max(0, ny) * 0.38);
        if (sideStripe > 0) sc = mixc(sc, TRIM, sideStripe);
        if (sole > 0) sc = mixc(sc, SHOE_SOLE, sole);
        if (sock > 0) sc = mixc(sc, SOCK, sock);
        c = mixc(c, sc, shoe);
        shortsMask[i] = shoe;
      } else if (y > 1.555 && (z < -0.002 + (y - 1.56) * 0.84 || (y > 1.685 && z < 0.105)) && !(ax > 0.072 && y < 1.662)) {
        // Cabelo com corte degradê (fade lateral) e brilho no topo
        const fade = y < 1.635 ? ss(1.555, 1.635, y) : 1;
        const sheen = Math.max(0, ny) * 0.45;
        const hc = mixc(HAIR, HAIR_HI, sheen);
        c = mixc(c, hc, 0.35 + 0.65 * fade);
      } else if (z > 0.114 && Math.abs(ax - 0.034) < 0.018 && y > 1.661 - (ax - 0.025) * 0.08 && y < 1.6695 - (ax - 0.025) * 0.05) {
        // Sobrancelhas arqueadas e definidas
        c = BROW;
      } else if (z > 0.111 && Math.abs(ax - 0.032) < 0.0105 && Math.abs(y - 1.647) < 0.0046) {
        // Olhos com esclera, íris castanho-âmbar e pupila escura
        const ed = Math.hypot((ax - 0.0315) / 0.0055, (y - 1.647) / 0.0038);
        if (ed < 0.45) c = PUPIL;
        else if (ed < 1.0) c = IRIS;
        else c = SCLERA;
      } else if (z > 0.110 && ax < 0.023 && y > 1.593 && y < 1.606) {
        // Lábios definidos com linha central mais escura
        const lipCenter = 1 - Math.min(1, Math.abs(y - 1.5995) / 0.0022);
        c = mixc(LIPS, BROW, lipCenter * 0.35);
      } else if (y > 1.566 && y < 1.616 && z > 0.035 && ax < 0.068) {
        // Sombra sutil de barba cerrada / contorno mandibular
        const jaw = ss(1.566, 1.582, y) * (1 - ss(1.605, 1.616, y)) * ss(0.035, 0.075, z);
        c = mixc(c, BEARD_SHADE, jaw * 0.28);
      }
      baseCol.set(c, i * 3);
    }
    colorAttr = new THREE.BufferAttribute(new Float32Array(baseCol), 3);
    geo.setAttribute("color", colorAttr);
    mesh.material = new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.56, metalness: 0.02, skinning: true });
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    mesh.frustumCulled = false;
    inner.updateMatrixWorld(true);
    const Z = V(0, 0, 1), Yv = V(0, 1, 0);
    for (const nm in bones) {
      const b = bones[nm], q = Q();
      b.getWorldQuaternion(q);
      const ax = V(1, 0, 0).applyQuaternion(q);
      bind[nm] = { q, local: b.quaternion.clone(), pos: b.position.clone(), ax };
    }
    const lim = ["Thigh", "Shin", "UpperArm", "ForeArm"];
    const mk = (nm, a0, r0) => {
      const B = bind[nm];
      if (!B) return;
      const f = frameQ(a0, r0);
      B.C = f.invert().multiply(B.q.clone());
    };
    for (const nm of ["Pelvis", "Spine_Lower", "Spine_Upper", "Neck", "Head"]) {
      mk(nm, nm === "Neck" || nm === "Head" ? Yv : bind[nm].ax, Z);
    }
    for (const sd of ["_R", "_L"]) {
      for (const l of lim) mk(l + sd, bind[l + sd].ax, Z);
      mk("Foot" + sd, Z, Yv);
      mk("Hand" + sd, bind["Hand" + sd].ax, sd === "_R" ? V(1, 0, 0) : V(-1, 0, 0));
    }
    bones.Pelvis.parent.updateMatrixWorld(true);
    bind.pelvisParentInv = bones.Pelvis.parent.matrixWorld.clone().invert();
  }

  let _m = null;
  function frameQ(a, r) {
    _m = _m || new THREE.Matrix4();
    const X = a.clone().normalize();
    const Yy = r.clone().sub(X.clone().multiplyScalar(r.dot(X)));
    if (Yy.lengthSq() < 1e-6) {
      Yy.set(0, Math.abs(X.z) > 0.9 ? 1 : 0, Math.abs(X.z) > 0.9 ? 0 : 1);
      Yy.sub(X.clone().multiplyScalar(Yy.dot(X)));
    }
    Yy.normalize();
    const Zz = X.clone().cross(Yy);
    _m.makeBasis(X, Yy, Zz);
    return Q().setFromRotationMatrix(_m);
  }

  const W = {};
  function aim(nm, a, r) {
    const B = bind[nm], b = bones[nm];
    if (!B || !b) return;
    const wq = frameQ(a, r).multiply(B.C);
    W[nm] = wq;
    const pq = Q();
    b.parent.getWorldQuaternion(pq);
    b.quaternion.copy(pq.invert().multiply(wq));
    b.updateMatrixWorld(true);
  }

  function keep(nm) {
    const b = bones[nm];
    if (b) {
      b.quaternion.copy(bind[nm].local);
      b.updateMatrixWorld(true);
    }
  }

  function targets(J) {
    const isF = FRONTV.has(famKey), m = MIRROR.has(famKey) ? -1 : 1;
    const cx = isF && fam && fam.KJ ? fam.KJ[0].hip[0] : J.hip[0];
    const v3 = (q, z = 0) => isF ? V(0, q[1], q[0] - cx) : V(q[0], q[1], z);
    const u = v3(J.s).sub(v3(J.hip)).normalize();
    let front = isF ? V(1, 0, 0) : V(u.y * m, -u.x * m, 0);
    const hu = v3(J.h).sub(v3(J.s)).normalize();
    let hf = isF ? V(1, 0, 0) : V(hu.y * m, -hu.x * m, 0);

    // Prancha lateral: gira o tronco e a cabeça de lado (plano coronal voltado para +Z)
    // no outro lado (fam.swap) o peito vira para -Z e o braço de baixo passa a ser o direito
    const zs = fam.swap ? -1 : 1, dn = fam.swap ? "R" : "L";
    if (famKey === "side_plank") {
      front = V(0, 0, zs).sub(u.clone().multiplyScalar(u.z * zs)).normalize();
      hf = V(0, 0, zs).sub(hu.clone().multiplyScalar(hu.z * zs)).normalize();
    }

    const left = u.clone().cross(front).normalize();
    const T = { hip: v3(J.hip), u, front, hu, hf, left, isF, m, zs, dn };
    const map = m === 1 || isF ? { R: "", L: "2" } : { R: "2", L: "" };

    for (const sd of ["R", "L"]) {
      const s = map[sd], o = isF ? (sd === "R" ? -10.5 : 10.5) : 0;
      const same = isF && Math.hypot(J.w[0] - J.w2[0], J.w[1] - J.w2[1]) < 0.01;
      const src = k => same && sd === "L" ? [2 * J.s[0] - J[k][0], J[k][1]] : J[k + s];
      const ls = isF && J.a[0] < J.a2[0] ? (s ? "" : "2") : s;
      const p = k => v3(isF && (k === "e" || k === "w") ? [src(k)[0] + o, src(k)[1] - 3] : isF && (k === "k" || k === "a" || k === "t") ? J[k + ls] : J[k + s]);
      const sh = isF ? v3([J.s[0] + o, J.s[1] - 3]) : v3(J.s);
      const hp = isF ? v3([J.hip[0] + (sd === "R" ? -5 : 5), J.hip[1]]) : v3(J.hip);
      T[sd] = { s: sh, e: p("e"), w: p("w"), hp, k: p("k"), a: p("a"), t: p("t"), wy: J["w" + s][1] };

      // Superman com puxada: cotovelos abrem e puxam em W para trás junto às costelas
      if ((fam.proj || fam.pull3d) && !isF) {
        const tt = T[sd], K0 = fam.KJ[0].w[0], K1 = fam.KJ[1].w[0];
        const f = Math.max(0, Math.min(1, (K0 - J.w[0]) / ((K0 - K1) || 1)));
        const lt = V(0, 0, sd === "R" ? 1 : -1), up = V(0, 1, 0), fw = V(u.x, u.y, 0).normalize();
        const dir = (a, b, c) => fw.clone().multiplyScalar(a).add(up.clone().multiplyScalar(b)).add(lt.clone().multiplyScalar(c)).normalize();
        const mix = (a, b) => a.lerp(b, f).normalize();
        const ua = mix(dir(1, 0.18, 0.08), dir(-0.55, 0.25, 0.8));
        const fa = mix(dir(1, 0.18, 0), dir(0.85, 0.2, 0.1));
        tt.e = tt.s.clone().add(ua.multiplyScalar(L.ua));
        tt.w = tt.e.clone().add(fa.multiplyScalar(L.fa));
        tt.wy = tt.w.y;
      }

      // Prancha lateral em 3D: com cabeça em +X e peito em +Z, o lado ESQUERDO (L) fica embaixo apoiando no chão e o DIREITO (R) fica em cima
      if (famKey === "side_plank") {
        const tt = T[sd];
        if (sd === dn) {
          tt.e = tt.s.clone().add(V(0, -L.ua, 0));
          tt.w = tt.e.clone().add(V(0, 0, L.fa * zs));
          tt.wy = 0;
        } else {
          tt.e = tt.s.clone().add(u.clone().multiplyScalar(-L.ua));
          tt.w = tt.e.clone().add(u.clone().multiplyScalar(-L.fa));
          tt.wy = 25;
        }
      }

      // Toque no ombro em 3D: a mão livre sobe sob o peitoral e cruza o eixo Z até o ombro oposto
      if (famKey === "shoulder_tap") {
        const tt = T[sd], f = Math.max(0, Math.min(1, (tt.wy - 2) / 34)), z = sd === "L" ? 1 : -1;
        tt.e.z += 5 * f * z;
        tt.w.z += -15 * f * z;
      }

      // L-Sit em 3D: braços apoiados verticalmente ao lado externo do quadril
      if (famKey === "lsit") {
        const tt = T[sd], zOut = sd === "R" ? -10.5 : 10.5;
        tt.e.x = tt.s.x + 1;
        tt.w.x = tt.s.x + 2;
        tt.e.z += zOut * 0.9;
        tt.w.z += zOut;
        tt.wy = 0;
      }

      // Elevação Y deitado em 3D: braços abrem na diagonal (45°) formando um Y real
      if (famKey === "prone_y") {
        const tt = T[sd], zSide = sd === "R" ? 1 : -1;
        tt.e.z += zSide * 8;
        tt.w.z += zSide * 16;
      }

      // Flexão arqueira em 3D: mãos bem afastadas; um braço dobra enquanto o outro estende lateralmente
      if (famKey === "pushup_arch") {
        const tt = T[sd], zSide = sd === "R" ? 1 : -1;
        const fExt = Math.max(0, Math.min(1, (tt.wy - 2) / 14));
        tt.e.z += zSide * (5 + 11 * fExt);
        tt.w.z += zSide * (8 + 19 * fExt);
        if (fExt > 0.05) {
          tt.e.x = tt.s.x + (1 - fExt) * (tt.e.x - tt.s.x);
          tt.w.x = tt.s.x + (1 - fExt) * (tt.w.x - tt.s.x) + 1.5 * fExt;
          tt.e.y = tt.s.y * 0.55;
          tt.w.y = 2.5;
          tt.wy = 0;
        }
      }

      // Pose do Corvo (Crow / Frog Stand) em 3D: joelhos apoiados na parte externa dos tríceps
      if (famKey === "crow") {
        const tt = T[sd], zSide = sd === "R" ? -1 : 1;
        tt.e.z += zSide * 4.5;
        tt.w.z += zSide * 3.5;
        tt.k.z += zSide * 8.0;
        tt.a.z += zSide * 3.0;
      }

      // Vista frontal (sumô / afundo lateral / cossaco): projeta o joelho e o pé na diagonal (+X e ±Z)
      if (isF) {
        const tt = T[sd];
        const f = Math.max(0, Math.min(18, 20 - Math.abs(tt.w.z) * 0.75));
        tt.w.x += f;
        tt.e.x += f * 0.5;
        if (famKey === "sumo" || famKey === "side_lunge" || famKey === "cossack") {
          const drop = Math.max(0, (54 - J.hip[1]) / 24);
          const kneeBend = Math.max(0, 1 - Math.abs(tt.k.y - tt.a.y) / L.sh);
          tt.k.x += 5.0 * drop + 6.0 * kneeBend;
          // No agachamento cossaco, o pé da perna estendida gira o calcanhar no chão com a ponta apontando para cima (+Y)
          const toeUp = famKey === "cossack" && (tt.t.y - tt.a.y) > 5;
          if (toeUp) {
            tt.t.set(tt.a.x + 3.5, tt.a.y + 9.5, tt.a.z);
          } else {
            tt.t.set(tt.a.x + 8.5, Math.max(1.5, tt.a.y - 2.5), tt.a.z + (sd === "R" ? -4.0 : 4.0));
          }
        }
      }
    }
    return T;
  }

  function limbN(d, T) {
    return T.isF ? V(1, 0, 0) : V(-d.y * T.m, d.x * T.m, 0);
  }

  // Normal anatômica estabilizada para o braço/antebraço (evita torção "candy-wrapper" no cotovelo e punho)
  function armRef(ua, fa, lat, T) {
    const base = limbN(ua, T);
    const cross = ua.clone().cross(fa);
    if (cross.lengthSq() > 0.04) {
      const hinge = fa.clone().cross(cross).normalize();
      if (hinge.dot(base) < 0) hinge.negate();
      return base.clone().lerp(hinge, 0.55).add(lat.clone().multiplyScalar(0.18)).normalize();
    }
    return base.clone().add(lat.clone().multiplyScalar(0.18)).normalize();
  }

  let hip0For = null, hip0 = 0;
  function pose(J, uOv) {
    const T = targets(J);
    if (uOv) {
      T.u = uOv;
      if (famKey !== "side_plank") {
        T.front = V(uOv.y * T.m, -uOv.x * T.m, 0);
      }
      T.left = uOv.clone().cross(T.front).normalize();
    }
    if (hip0For !== famKey) {
      hip0For = famKey;
      hip0 = T.isF ? 0 : famFrame(fam, 0).hip[0];
    }
    const pb = bones.Pelvis;
    pb.position.copy(T.hip.clone().sub(V(hip0, 0, 0)).applyMatrix4(bind.pelvisParentInv));

    // Coluna vertebral articulada: distribui a curvatura entre Pelve, Lombar e Torácica
    const bend = T.isF || famKey === "side_plank" ? 0 : spineCurveOf(famKey, J);
    const axisZ = T.left.clone();
    const uPelvis = T.u.clone().applyAxisAngle(axisZ, -bend * 0.042).normalize();
    const fPelvis = T.front.clone().applyAxisAngle(axisZ, -bend * 0.042).normalize();
    const uLow = T.u.clone().applyAxisAngle(axisZ, bend * 0.012).normalize();
    const fLow = T.front.clone().applyAxisAngle(axisZ, bend * 0.012).normalize();
    const uUp = T.u.clone().applyAxisAngle(axisZ, bend * 0.055).normalize();
    const fUp = T.front.clone().applyAxisAngle(axisZ, bend * 0.055).normalize();

    aim("Pelvis", uPelvis, fPelvis);
    aim("Spine_Lower", uLow, fLow);
    aim("Spine_Upper", uUp, fUp);
    aim("Neck", uUp.clone().add(T.hu).normalize(), fUp.clone().add(T.hf));
    aim("Head", T.hu, T.hf);

    for (const sd of ["R", "L"]) {
      const t = T[sd], S = "_" + sd;
      const medial = sd === "R" ? T.left.clone() : T.left.clone().negate(), lat = medial.clone().negate();
      const eo = ELBOW_OUT[famKey] || 0;
      const E = eo ? t.s.clone().add(uUp.clone().multiplyScalar(7)).add(lat.clone().multiplyScalar(eo + 5)).sub(fUp.clone().multiplyScalar(2)) : t.e.clone();
      const Wr = t.w.clone().add(lat.clone().multiplyScalar(eo ? 3 : 0));
      const ua = famKey === "side_plank"
        ? (sd === T.dn ? V(0, -1, 0) : T.u.clone().negate().add(lat.clone().multiplyScalar(0.08)).normalize())
        : E.clone().sub(t.s).normalize().add(lat.clone().multiplyScalar(FLARE[famKey] || 0.14)).normalize();
      const fa = famKey === "side_plank"
        ? (sd === T.dn ? V(0, 0, T.zs) : T.u.clone().negate())
        : Wr.clone().sub(E).normalize();
      {
        keep("Clavicle" + S);
        const cb = bones["Clavicle" + S], wq = Q();
        cb.getWorldQuaternion(wq);
        const elev = Math.acos(Math.max(-1, Math.min(1, ua.dot(uUp.clone().negate())))), tt = Math.max(0, Math.min(1, (elev - 1.1) / 1.6)) * 0.45;
        if (tt > 0 && famKey !== "side_plank") {
          const ax = V(1, 0, 0).applyQuaternion(wq), qq = Q().setFromUnitVectors(ax, ua), qs = Q().slerp(qq, tt), nw = qs.multiply(wq), pq = Q();
          cb.parent.getWorldQuaternion(pq);
          cb.quaternion.copy(pq.invert().multiply(nw));
          cb.updateMatrixWorld(true);
        }
      }
      let aRef = armRef(ua, fa, lat, T), fRef = aRef;
      if (famKey === "side_plank") {
        aRef = V(0, 0, T.zs);
        fRef = sd === T.dn ? V(0, 1, 0) : V(0, 0, T.zs);
      } else if (famKey === "wheel_bridge") {
        aRef = V(-1, 0, sd === "R" ? -0.25 : 0.25).normalize();
        fRef = aRef;
      }
      aim("UpperArm" + S, ua, aRef);
      if (eo) {
        const elPos = wp("ForeArm" + S), hd = wp("Head").add(lat.clone().multiplyScalar(4.5)).sub(T.hf.clone().multiplyScalar(4)).sub(T.hu.clone().multiplyScalar(1));
        fa.copy(hd.sub(elPos).normalize());
        fRef = armRef(ua, fa, lat, T);
      }
      aim("ForeArm" + S, fa, fRef);
      // Mão alinhada suavemente ao antebraço para evitar torção de pulso
      const hRef = fRef.clone().lerp(medial, 0.55).normalize();
      aim("Hand" + S, fa, hRef);
      if (famKey === "side_plank") {
        if (sd === T.dn) {
          aim("Hand" + S, V(0, 0, T.zs), V(0, -1, 0));
        } else {
          aim("Hand" + S, T.u.clone().negate(), medial);
        }
      } else if (famKey === "wheel_bridge") {
        aim("Hand" + S, V(-1, 0, 0), V(0, -1, 0).add(medial.clone().multiplyScalar(0.2)));
      } else if (famKey === "lsit") {
        aim("Hand" + S, V(1, 0, 0), V(0, -1, 0).add(medial.clone().multiplyScalar(0.2)));
      } else if (t.wy < 6 && !T.isF && !eo) {
        const hb = bones["Hand" + S], q0 = hb.quaternion.clone(), fw = V(T.u.x, 0, T.u.z);
        if (fw.lengthSq() < 1e-4) fw.copy(T.front).setY(0);
        fw.normalize();
        aim("Hand" + S, fw, V(0, -1, 0).add(medial.clone().multiplyScalar(0.2)));
        hb.quaternion.copy(q0.slerp(hb.quaternion, sm((6 - t.wy) / 5)));
        hb.updateMatrixWorld(true);
      }
      for (const f of ["Fingers_Proximal", "Fingers_Distal", "Thumb"]) keep(f + S);
      const th = t.k.clone().sub(t.hp).normalize(), sn = t.a.clone().sub(t.k).normalize();
      const ft = famKey === "side_plank" ? T.front.clone() : t.t.clone().sub(t.a).normalize();
      const legRef = famKey === "side_plank"
        ? T.front.clone()
        : T.isF && (famKey === "sumo" || famKey === "side_lunge" || famKey === "cossack")
        ? V(1, 0, sd === "R" ? -0.35 : 0.35).normalize()
        : limbN(th, T);
      const shinRef = famKey === "side_plank"
        ? T.front.clone()
        : T.isF
        ? legRef
        : limbN(sn, T);
      aim("Thigh" + S, th, legRef);
      aim("Shin" + S, sn, shinRef);
      // Estabiliza o vetor vertical do pé quando apoiado de sola no solo (evita torcer quando de joelhos)
      const shinUp = t.k.clone().sub(t.a).normalize();
      const flatFoot = Math.max(0, 1 - Math.abs(ft.y) * 1.35);
      const footGrounded = sm((8 - Math.min(t.a.y, t.t.y)) / 6) * flatFoot;
      const footUp = famKey === "side_plank"
        ? shinUp
        : shinUp.lerp(V(0, 1, 0), footGrounded * 0.65).normalize();
      aim("Foot" + S, ft, footUp);
    }
  }

  function wp(nm, addVec) {
    const p = V();
    bones[nm].getWorldPosition(p);
    if (addVec) p.add(addVec);
    return p;
  }

  function contacts() {
    const out = [];
    const pts = (p, pad, kind) => out.push({ p, y: p.y - pad, kind });
    for (const S of ["_R", "_L"]) {
      const an = wp("Foot" + S);
      const toe = wp("Foot" + S, W["Foot" + S] ? V(0, 0, 1).applyQuaternion(W["Foot" + S].clone().multiply(bind["Foot" + S].C.clone().invert())).multiplyScalar(13) : null);
      pts(an, 4.6, "foot");
      pts(toe, 1.3, "foot");
      const hd = wp("Hand" + S), fq = Q();
      bones["Hand" + S].getWorldQuaternion(fq);
      const hx = V(1, 0, 0).applyQuaternion(fq);
      pts(hd.clone().add(hx.clone().multiplyScalar(5)), 1.4, "hand");
      pts(hd.clone().add(hx.clone().multiplyScalar(10)), 0.8, "hand");
      pts(wp("Shin" + S), 3.2, "knee");
      pts(wp("ForeArm" + S), 2.6, "body");
      pts(wp("UpperArm" + S), 4, "body");
    }
    const hq = Q();
    bones.Head.getWorldQuaternion(hq);
    pts(wp("Head").add(V(1, 0, 0).applyQuaternion(hq).multiplyScalar(6)), 7, "body");
    pts(wp("Pelvis"), famKey === "lsit" ? 1.5 : 7, "body");
    pts(wp("Spine_Upper"), 6.5, "body");
    return out;
  }

  const sm = x => { x = Math.max(0, Math.min(1, x)); return x * x * (3 - 2 * x); };

  function solveFrame(ph) {
    outer.position.set(0, 0, 0);
    outer.rotation.set(0, 0, 0);
    outer.updateMatrixWorld(true);
    const J = famFrame(fam, ph);
    pose(J);
    let C = contacts();
    const handDown = !ELBOW_OUT[famKey] && !NO_PLANK_IK.has(famKey) && (J.w[1] < 6 || J.w2[1] < 6);
    const footDown = Math.min(J.a[1], J.a2[1], J.t[1], J.t2[1], J.k[1], J.k2[1]) < 7;
    let th = 0, piv = null;
    const kb = (h, k, a) => {
      const v1 = [k[0] - h[0], k[1] - h[1]], v2 = [a[0] - k[0], a[1] - k[1]];
      return Math.acos(Math.max(-1, Math.min(1, (v1[0] * v2[0] + v1[1] * v2[1]) / Math.hypot(...v1) / Math.hypot(...v2))));
    };
    const hw = y => sm((6 - y) / 5);
    const kmax = Math.max(kb(J.hip, J.k, J.a), kb(J.hip, J.k2, J.a2)), pw = sm((0.75 - kmax) / 0.3);
    if (handDown && footDown && pw > 0 && !FRONTV.has(famKey)) {
      const hs = C.filter(c => c.kind === "hand").sort((a, b) => a.y - b.y)[0];
      const fs = C.filter(c => c.kind === "foot" || c.kind === "knee").sort((a, b) => a.y - b.y)[0];
      const dx = hs.p.x - fs.p.x, dy = hs.y - fs.y;
      if (Math.abs(dx) > 10) {
        th = -Math.atan(dy / dx);
        th = Math.max(-0.5, Math.min(0.5, th)) * pw * hw(Math.min(J.w[1], J.w2[1]));
        piv = V(fs.p.x, fs.y, 0);
      }
    }
    if (piv) {
      outer.rotation.z = th;
      const rp = piv.clone().applyAxisAngle(V(0, 0, 1), th);
      outer.position.set(piv.x - rp.x, piv.y - rp.y, 0);
      outer.updateMatrixWorld(true);
      C = contacts();
    }
    const bw = piv ? 1 - pw : 1;
    if (handDown && bw > 0 && !FRONTV.has(famKey) && !ELBOW_OUT[famKey]) {
      const nonHand = C.filter(c => c.kind !== "hand");
      let lift = footDown && nonHand.length ? -Math.min(...nonHand.map(c => c.y)) : -Math.min(...C.map(c => c.y));
      const T = targets(J);
      if (footDown && famKey !== "crow") {
        const hp = wp("Pelvis"), sh = wp("UpperArm_R").add(wp("UpperArm_L")).multiplyScalar(0.5);
        const r = wp("ForeArm_R").distanceTo(wp("UpperArm_R")) + wp("Hand_R").distanceTo(wp("ForeArm_R"));
        const want = -lift + 2.6 + 0.93 * r;
        if (sh.y > want) {
          const Lt = sh.distanceTo(hp), sx = Math.sign(sh.x - hp.x) || 1, sy = Math.max(-0.95, Math.min(0.95, (want - hp.y) / Lt));
          const nu = V(sx * Math.sqrt(1 - sy * sy), sy, 0);
          const tq = Q().slerp(Q().setFromUnitVectors(sh.clone().sub(hp).setZ(0).normalize(), nu), hw(Math.min(J.w[1], J.w2[1])));
          const op = outer.position.clone(), orz = outer.rotation.z;
          outer.position.set(0, 0, 0); outer.rotation.z = 0; outer.updateMatrixWorld(true);
          pose(J, T.u.clone().applyQuaternion(tq).normalize());
          outer.position.copy(op); outer.rotation.z = orz; outer.updateMatrixWorld(true);
          C = contacts();
          lift = -Math.min(...C.filter(c => c.kind !== "hand").map(c => c.y));
          Object.assign(T, targets(J));
          T.u.applyQuaternion(tq);
          T.front = V(T.u.y * T.m, -T.u.x * T.m, 0);
          T.left = T.u.clone().cross(T.front).normalize();
        }
      }
      for (const sd of ["R", "L"]) {
        const S = "_" + sd, t = T[sd];
        if (t.wy >= 6 || (famKey === "shoulder_tap" && t.wy > 2)) continue;
        const sh = wp("UpperArm" + S), l = wp("ForeArm" + S).distanceTo(sh) + wp("Hand" + S).distanceTo(wp("ForeArm" + S));
        const fy = 2.6 - lift, hh = sh.y - fy, hmax = Math.sqrt(Math.max(0, Math.pow(0.97 * l, 2) - hh * hh)), want2 = Math.abs(t.w.x - t.s.x) * 0.75, sgn = Math.sign(t.w.x - t.s.x) || 1;
        armTo(sd, T, V(sh.x + sgn * Math.min(want2, hmax), fy, sh.z), bw * hw(t.wy));
      }
      C = contacts();
    }
    const minY = Math.min(...C.map(c => c.y));
    const low2D = Math.min(J.t[1], J.t2[1], J.w[1], J.w2[1], J.k[1] - 3, J.k2[1] - 3, J.hip[1] - 7, J.s[1] - 7), air = Math.max(0, low2D - 2);
    outer.position.y += -minY + air;
    outer.updateMatrixWorld(true);
    if (!noPin && !NO_PLANK_IK.has(famKey) && famKey !== "crow") {
      pinHands(J, ph, footDown ? sm((1.4 - kmax) / 0.5) : 0);
      if (famKey === "pushup_wall") wallHands(J, ph);
    }
    return -minY;
  }

  function armTo(sd, T, tg, wt, hand) {
    const S = "_" + sd, AB = ["UpperArm", "ForeArm", "Hand"].map(n => bones[n + S]), q0 = AB.map(b => b.quaternion.clone());
    const sh = wp("UpperArm" + S), l1 = wp("ForeArm" + S).distanceTo(sh), l2 = wp("Hand" + S).distanceTo(wp("ForeArm" + S));
    const d = tg.clone().sub(sh), dl = Math.min(d.length(), l1 + l2 - 0.01), dir = d.clone().normalize();
    const elVal = hand ? 0 : vr.el ?? 0.25;
    const pole = hand ? V(0, -1, 0) : V(-(Math.sign(T.u.x) || 1) * (1 - elVal), 0, (sd === "R" ? 1 : -1) * elVal);
    pole.sub(dir.clone().multiplyScalar(pole.dot(dir)));
    if (pole.lengthSq() < 1e-4) pole.set(-dir.y, dir.x, 0);
    pole.normalize();
    const ca = (l1 * l1 + dl * dl - l2 * l2) / (2 * l1 * dl), aa = Math.acos(Math.max(-1, Math.min(1, ca)));
    const elb = sh.clone().add(dir.clone().multiplyScalar(Math.cos(aa) * l1)).add(pole.clone().multiplyScalar(Math.sin(aa) * l1));
    const wr = sh.clone().add(dir.clone().multiplyScalar(dl));
    const ua = elb.clone().sub(sh).normalize(), fa = wr.clone().sub(elb).normalize();
    const medial = sd === "R" ? T.left.clone() : T.left.clone().negate(), lat = medial.clone().negate();
    const ref = armRef(ua, fa, lat, T);
    aim("UpperArm" + S, ua, ref);
    aim("ForeArm" + S, fa, ref);
    const fw = V(T.u.x, 0, 0);
    if (fw.lengthSq() < 1e-4) fw.set(1, 0, 0);
    aim("Hand" + S, hand ? hand[0] : fw.normalize(), hand ? hand[1].clone().add(medial.multiplyScalar(0.2)) : V(0, -1, 0).add(medial.multiplyScalar(0.2)));
    for (const f of ["Fingers_Proximal", "Fingers_Distal", "Thumb"]) keep(f + S);
    if (wt < 1) {
      AB.forEach((b, i) => {
        b.quaternion.copy(q0[i].slerp(b.quaternion, wt));
        b.updateMatrixWorld(true);
      });
    }
  }

  let wallFor = null, wallAt = null;
  function wallSetup() {
    wallFor = famKey; noPin = true; solveFrame(0); wallAt = {};
    for (const sd of ["R", "L"]) {
      const S = "_" + sd, sh = wp("UpperArm" + S), l = wp("ForeArm" + S).distanceTo(sh) + wp("Hand" + S).distanceTo(wp("ForeArm" + S));
      wallAt[sd] = V(sh.x + Math.sqrt(Math.pow(0.95 * l, 2) - 9), sh.y - 3, sh.z * 1.15);
    }
    wallAt.x = Math.max(wallAt.R.x, wallAt.L.x) + 2;
    noPin = false;
  }

  function wallHands(J, ph) {
    if (wallFor !== famKey) { wallSetup(); solveFrame(ph); return; }
    const T = targets(J);
    for (const sd of ["R", "L"]) armTo(sd, T, V(wallAt.x - 2, wallAt[sd].y, wallAt[sd].z), 1, [V(0, 1, 0), V(1, 0, 0)]);
  }

  const PIN_N = 240;
  let pinFor = null, pins = null, noPin = false;
  function buildPins() {
    pinFor = famKey; pins = { at: {} }; noPin = true;
    const wy = { R: [], L: [] };
    for (let i = 0; i < PIN_N; i++) {
      const T = targets(famFrame(fam, i / PIN_N));
      wy.R.push(T.R.wy); wy.L.push(T.L.wy);
    }
    for (const sd of ["R", "L"]) {
      const y = wy[sd], td = new Int16Array(PIN_N).fill(-1);
      for (let i = 0; i < PIN_N; i++) {
        if (y[i] >= 6) continue;
        let s = i, n = 0;
        while (n < PIN_N && y[(s - 1 + PIN_N) % PIN_N] < 6) { s = (s - 1 + PIN_N) % PIN_N; n++; }
        if (n >= PIN_N) s = 0;
        let k = s, m = 0;
        while (m < PIN_N && y[k] >= 1 && y[k] < 6) { k = (k + 1) % PIN_N; m++; }
        if (y[k] < 1) td[i] = k;
      }
      pins[sd] = td;
      for (const k of td) {
        if (k >= 0 && !pins.at[sd + k]) {
          solveFrame(k / PIN_N);
          pins.at[sd + k] = wp("Hand_" + sd);
          pins.at[sd + k].wx = targets(famFrame(fam, k / PIN_N))[sd].w.x;
        }
      }
    }
    noPin = false;
  }

  function pinHands(J, ph, rw) {
    const lw = sm((J.hip[1] - 9) / 6);
    if (FRONTV.has(famKey) || ELBOW_OUT[famKey] || lw <= 0) return;
    if (pinFor !== famKey) { buildPins(); solveFrame(ph); return; }
    const T = targets(J), goals = [];
    if (vr.sh) {
      const dp = sm((J.s[1] - fam.KJ[0].s[1]) / (fam.KJ[1].s[1] - fam.KJ[0].s[1]));
      outer.position.z = -vr.sh * dp;
      outer.updateMatrixWorld(true);
    }
    for (const sd of ["R", "L"]) {
      const t = T[sd], k = pins[sd][Math.floor((ph % 1) * PIN_N)];
      if (t.wy >= 6 || k < 0 || (famKey === "shoulder_tap" && t.wy > 2)) continue;
      const a = pins.at[sd + k], g = a.clone().setX(a.x + t.w.x - a.wx + (vr.hx || 0) * (Math.sign(T.u.x) || 1));
      if (vr.hz && (!vr.arch || sd === "R")) g.z *= 1 + vr.hz;
      goals.push([sd, g, sm((6 - t.wy) / 5) * lw]);
    }
    if (rw > 0) reachTilt(goals.filter(q => q[2] > 0).map(([sd, g, w]) => [sd, g, w * rw]));
    for (const [sd, g, w] of goals) armTo(sd, T, g, w);
  }

  function reachTilt(goals) {
    if (!goals.length) return;
    const F = contacts().filter(c => c.kind === "foot" || c.kind === "knee").sort((a, b) => a.y - b.y);
    if (!F.length) return;
    const pv = F[0].p.clone().setZ(0);
    const ex = () => Math.max(...goals.map(([sd, g]) => {
      const S = "_" + sd, sh = wp("UpperArm" + S), l = wp("ForeArm" + S).distanceTo(sh) + wp("Hand" + S).distanceTo(wp("ForeArm" + S));
      return sh.distanceTo(g) - 0.97 * l;
    }));
    if (ex() <= 0) return;
    const p0 = outer.position.clone(), r0 = outer.rotation.z;
    const set = th => {
      outer.rotation.z = r0 + th;
      outer.position.copy(pv).add(p0.clone().sub(pv).applyAxisAngle(V(0, 0, 1), th));
      outer.updateMatrixWorld(true);
    };
    let best = 0, be = ex();
    for (let i = 1; i <= 25 && be > 0; i++) {
      for (const th of [i * 0.01, -i * 0.01]) {
        set(th);
        const e = ex();
        if (e < be) { be = e; best = th; }
      }
    }
    if (be <= 0) {
      let lo = best - Math.sign(best) * 0.01, hi = best;
      for (let i = 0; i < 10; i++) {
        const m = (lo + hi) / 2;
        set(m);
        if (ex() > 0) lo = m; else hi = m;
      }
      best = hi;
    }
    set(best * Math.max(...goals.map(q => q[2])));
  }

  function frameCam() {
    airborne = false;
    const box = new THREE.Box3();
    for (let i = 0; i < 20; i++) {
      solveFrame(i / 20);
      for (const nm of ["Head", "Hand_R", "Hand_L", "Foot_R", "Foot_L", "Pelvis", "Shin_R", "Shin_L", "UpperArm_R", "UpperArm_L"]) {
        box.expandByPoint(wp(nm));
      }
    }
    box.expandByScalar(9);
    box.min.y = Math.min(box.min.y, 0);
    target = box.getCenter(V());
    const r = box.getSize(V()).length() / 2 + 6;
    dist = (r / Math.sin((cam.fov * Math.PI) / 360)) * 0.9;
    baseAz = FRONTV.has(famKey) ? Math.PI / 2 + 0.55 : famKey === "pushup_wall" ? -0.5 : 0.62;
    az = baseAz;
    el = 0.22;
  }

  function highlight() {
    const ids = new Set();
    for (const g of (MUS[famKey] || [])) for (const id of (GROUPS[g] || [])) ids.add(id);
    const a = colorAttr.array;
    a.set(baseCol);
    for (let i = 0; i < muscleArr.length; i++) {
      if (ids.has(Math.round(muscleArr[i]))) {
        const o = i * 3, sh = shortsMask[i];
        a.set(sh ? [0, 1, 2].map(k => RED[k] + (baseCol[o + k] * 0.78 + RED[k] * 0.22 - RED[k]) * sh) : RED, o);
      }
    }
    colorAttr.needsUpdate = true;
  }

  function resize() {
    if (!host) return;
    const w = host.clientWidth || 320, h = Math.round(w / 1.25);
    if (w === size[0] && h === size[1]) return;
    size = [w, h];
    R.setSize(w, h, false);
    R.domElement.style.height = h + "px";
    cam.aspect = w / h;
    cam.updateProjectionMatrix();
  }

  function render() {
    if (!host || state !== "ready") return;
    resize();
    cam.position.set(target.x + dist * Math.sin(az) * Math.cos(el), target.y + dist * Math.sin(el), target.z + dist * Math.cos(az) * Math.cos(el));
    cam.lookAt(target);
    R.render(scene, cam);
  }

  function mount(container, key, opts = {}) {
    if (!ok() || state === "fail") return false;
    if (!R) stage();
    host = container;
    spinBtn = opts.spinBtn || null;
    if (state !== "ready") {
      pend = { c: container, k: key, o: opts };
      container.innerHTML = '<div class="loading3d">Carregando corpo 3D…</div>';
      if (state === "idle") load();
      return true;
    }
    famKey = key;
    fam = prepare(famFor(key, opts.name, opts.side));
    vr = varOf(opts.name);
    {
      const t = opts.tempo !== undefined ? opts.tempo : tempoOf(key);
      tp3 = t || null;
      tt3 = 0;
      clk3 = typeof opts.clock === "function" ? opts.clock : null;
    }
    container.innerHTML = "";
    container.appendChild(R.domElement);
    size = [0, 0];
    const WX = { pushup_wall: 175, wall_sit: 73.5 };
    wall.visible = false;
    highlight();
    frameCam();
    phase = 0;
    paused = false;
    speed = 1;
    spin = !!opts.spin;
    updSpin();
    solveFrame(0);
    render();
    if (key in WX) {
      let x;
      if (key === "pushup_wall") x = wallAt.x + 1.5;
      else {
        const J0 = famFrame(fam, 0), hw = wp("Pelvis");
        x = hw.x + (WX[key] - J0.hip[0]) - 1.5;
      }
      wall.position.set(x, 95, 0);
      wall.visible = true;
      render();
    }
    if (opts.hold != null) {
      phase = opts.hold;
      paused = true;
      solveFrame(phase);
      render();
    }
    if (opts.onReady) opts.onReady();
    return true;
  }

  function snapshot(p) {
    if (state !== "ready" || !host) return null;
    const k = [phase, az, el];
    az = baseAz;
    el = 0.22;
    solveFrame(p);
    render();
    let url = null;
    try { url = R.domElement.toDataURL("image/png"); } catch (e) {}
    [phase, az, el]=k;
    solveFrame(phase);
    render();
    return url;
  }

  return {
    ok,
    mount,
    snapshot,
    ready: () => state === "ready" && !!host,
    unmount() { host = null; spinBtn = null; pend = null; },
    tick(now) {
      const dt = Math.min(120, Math.max(0, now - last));
      last = now;
      if (!host || state !== "ready") return;
      if (!host.isConnected) { host = null; return; }
      if (clk3) {
        const t = clk3();
        phase = !(t > 0) ? 0 : tp3 ? tempoPhase(tp3, t) : (t / 2.6) % 1;
      } else if (!paused) {
        if (tp3) {
          tt3 += (dt / 1000) * speed;
          phase = tempoPhase(tp3, tt3);
        } else {
          const per = fam.K ? 1050 * fam.K.length : 2600;
          phase = (phase + (dt / per) * speed) % 1;
        }
      }
      if (spin && !drag) az += dt * 0.00035;
      solveFrame(phase);
      render();
    },
    _phase(p) {
      phase = p;
      paused = true;
      if (host && state === "ready") {
        solveFrame(p);
        render();
      }
    },
    pause() { paused = !paused; return paused; },
    slow() { speed = speed === 1 ? 0.4 : 1; return speed; },
    toggleSpin() { spin = !spin; updSpin(); },
    reset() { az = baseAz; el = 0.22; },
    view(kind) { az = kind === "lado" ? 0 : kind === "frente" ? Math.PI / 2 : baseAz; el = 0.22; }
  };
})();
