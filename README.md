# Barra & Chão

Aplicativo mobile-first de calistenia, circuito militar, desafios progressivos e simulado TAF com animações anatômicas em **2D (SVG)** e **3D (Three.js + MakeHuman/Z-Anatomy)**, 100% offline.

## Arquitetura Modular

O projeto foi refatorado em módulos ES6 nativos e folhas de estilo separadas por responsabilidade:

```text
├── index.html                  # Estrutura HTML limpa + metadados mobile/PWA
├── manifest.webmanifest        # Manifesto PWA para instalação no Android
├── sw.js                       # Service Worker para funcionamento 100% offline
├── capacitor.config.json       # Capacitor: empacota a pasta www/ gerada pelo build
├── scripts/build-web.mjs       # Monta www/ só com os arquivos do app (npm run build)
├── package.json                # Scripts de teste e integração Android
├── assets/
│   ├── icon.svg                # Ícone vetorial do app
│   ├── *.png                   # Ícones e splash do Android/PWA (gerados de assets/logo/*.svg)
│   └── logo/                   # SVGs-fonte do ícone e da splash
├── vendor/                     # Dependências locais para uso 100% offline
│   ├── three.min.js
│   └── GLTFLoader.js
├── models/
│   └── male-glb.js             # Modelo 3D corporal com mapa muscular
├── styles/
│   ├── fonts/                  # Barlow e Big Shoulders Display (woff2, latin) + licenças OFL
│   ├── variables.css           # Tokens de cor (claro/escuro), fontes e safe-areas Android
│   ├── base.css                # Reset, tipografia, cabeçalho e painel de ajustes
│   ├── workout.css             # Hero, navegação semanal, cartões de exercícios e desafios
│   └── modals.css              # Painel inferior (sheet), visualizador 3D, player, TAF e timer
├── src/
│   ├── main.js                 # Bootstrap do app, ciclo de vida e registro do Service Worker
│   ├── data/
│   │   ├── poses.js            # Poses base, famílias de movimento (FAM) e grupos musculares
│   │   ├── exercises.js        # Biblioteca de progressões (LIB), instruções (INFO) e referências (REF)
│   │   ├── tempo.js            # Ritmo de execução (TEMPO), isometrias e cálculo de intensidade
│   │   ├── plans.js            # Divisões semanais (SPLIT/TPL), objetivos e restrições/cuidados
│   │   └── challenges.js       # Desafios de 14, 21 e 30 dias
│   ├── engine/
│   │   ├── kinematics2d.js     # Solver de cinemática inversa (IK) 2D e interpolação de poses
│   │   ├── figure2d.js         # Renderizador SVG 2D e loop de animação
│   │   └── viewer3d.js         # Motor 3D WebGL (Three.js) com destaque muscular
│   ├── services/
│   │   ├── storage.js          # Persistência no localStorage e estado reativo central
│   │   ├── planner.js          # Sorteio determinístico de treinos semanais e prescrição de cargas
│   │   └── audio.js            # Voz do treinador (Web Speech API pt-BR), bipes e Screen WakeLock
│   └── ui/
│       ├── dom.js              # Utilitários de DOM e componentes base
│       ├── sheet.js            # Modal inferior integrado ao botão Voltar do Android (popstate)
│       ├── timer.js            # Cronômetro flutuante de descanso entre séries
│       ├── player.js           # Player guiado de circuito militar, séries, desafios e TAF
│       ├── modals.js           # Telas de "Como fazer" (2D/3D), Biblioteca, Desafios e TAF
│       └── app.js              # Renderização da tela principal e controles de perfil
└── tests/
    └── anim-check.js           # Teste automatizado de integridade cinemática 2D
```

## Como rodar no Android

### Opção 1: Gerar APK / Projeto Android Nativo com Capacitor
Requer Node.js 22+ e Android Studio. O APK leva só a pasta `www/`, montada por `npm run build` a partir da lista `ASSETS` do `sw.js` (lista única: o que fica offline é o que vai no APK). O build falha se o app usar um arquivo que não está nessa lista, e gera o nome do cache a partir do conteúdo, então não há número de versão para atualizar à mão.

1. Instale as dependências (versões fixadas no `package.json`):
   ```bash
   npm install
   ```
2. Crie a plataforma Android (já roda o build):
   ```bash
   npm run cap:init
   ```
3. Gere o ícone e a tela de abertura a partir de `assets/` (icon-only, icon-foreground, icon-background, splash, splash-dark) e sincronize:
   ```bash
   npm run cap:icons
   npm run cap:sync
   ```
   Para mudar o logo, edite os SVGs em `assets/logo/`, exporte de novo os PNGs em `assets/` (mesmo nome, 1024×1024 para ícones e 2732×2732 para splash) e rode `npm run cap:icons`.
4. Abra no Android Studio e gere o APK em **Build › Build APK(s)**:
   ```bash
   npm run cap:open
   ```

Depois de mudar qualquer arquivo do app, rode `npm run cap:sync` antes de gerar o APK de novo. Arquivo novo usado pelo app só precisa entrar na lista `ASSETS` do `sw.js`.

Para publicar na Play Store, gere um AAB assinado (**Build › Generate Signed Bundle**). Guarde a chave (`.jks`) e as senhas fora da pasta do projeto, com backup: sem ela não dá para publicar atualizações.

### Opção 2: Instalar direto como PWA Offline no Android
Rode `npm run build` e sirva a pasta `www/` em qualquer servidor estático (ex.: `npx serve www` ou GitHub Pages / Netlify) e abra no Chrome do Android. Toque em **"Adicionar à tela inicial / Instalar aplicativo"**. O Service Worker (`sw.js`) fará o cache de todos os módulos e do modelo 3D para rodar 100% offline.
