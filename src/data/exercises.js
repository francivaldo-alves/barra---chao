// Biblioteca de exercícios, progressões, instruções passo a passo e referências técnicas

const E = (n, f, d, t = "r") => ({ n, f, d, t });

export const LIB = {
  push: [
    E("Flexão na parede", "pushup_wall", "Quanto mais longe da parede, mais difícil."),
    E("Flexão de joelhos", "pushup_knee", "Quadril alinhado, peito vai até perto do chão."),
    E("Flexão negativa", "pushup_neg", "Desça em 4 segundos na prancha; apoie os joelhos e suba."),
    E("Flexão", "pushup", "Glúteo contraído, peito quase toca o chão."),
    E("Flexão aberta", "pushup", "Mãos bem mais abertas que os ombros."),
    E("Flexão com pausa", "pushup", "Pare 2 segundos com o peito a dois dedos do chão."),
    E("Flexão arqueira", "pushup_arch", "Mãos bem abertas: um braço faz a força, o outro fica estendido."),
    E("Flexão explosiva", "pushup_exp", "Empurre forte até as mãos saírem do chão."),
    E("Flexão pseudo-planche", "pushup", "Mãos na altura da cintura, ombros à frente das mãos.")
  ],
  tri: [
    E("Flexão de joelhos fechada", "pushup_knee", "Mãos na largura dos ombros, cotovelos colados ao corpo."),
    E("Flexão fechada", "pushup", "Mãos na largura dos ombros, cotovelos raspando o tronco."),
    E("Flexão esfinge", "sphinx", "Dos antebraços para a palma; só o tríceps empurra."),
    E("Flexão diamante", "pushup", "Mãos juntas sob o peito formando um diamante."),
    E("Flexão diamante com pausa", "pushup", "Pausa de 2 segundos embaixo.")
  ],
  shoulder: [
    E("Flexão escapular", "scap_push", "Braços retos na prancha: junte e afaste as escápulas."),
    E("Bear crawl parado", "bear", "Joelhos a 3 cm do chão.", "s"),
    E("Prancha para V invertido", "plank_dd", "Empurre o chão levando o quadril ao alto."),
    E("Pike push-up", "pike", "Quadril alto, cabeça vai à frente das mãos."),
    E("Pike push-up com pausa", "pike", "Pausa de 2 segundos com a cabeça perto do chão."),
    E("Flexão hindu", "hindu", "Movimento contínuo em onda, do V invertido até o peito aberto."),
    E("Pose do corvo (frog stand)", "crow", "Joelhos apoiados nos tríceps, equilibre tirando os pés do chão.", "s")
  ],
  back: [
    E("Elevação Y deitado", "prone_y", "Braços abertos em Y, polegares para cima e pernas no chão."),
    E("Superman alternado", "superman_alt", "Braço e perna opostos sobem juntos."),
    E("Back widow", "backwidow", "Empurre os cotovelos no chão para subir o tronco."),
    E("Superman com puxada", "superman", "Como uma barra deitado: cotovelos para trás e pausa de 2 s."),
    E("Superman segurado", "superman_iso", "Braços, peito e pernas fora do chão em isometria.", "s")
  ],
  squat: [
    E("Agachamento livre", "squat", "Calcanhares no chão, joelhos na linha dos pés."),
    E("Agachamento sumô", "sumo", "Pés bem afastados, joelhos para fora."),
    E("Agachamento isométrico na parede", "wall_sit", "Costas na parede, coxas paralelas ao chão.", "s"),
    E("Afundo reverso", "lunge_rev", "Passo para trás; mais fácil para os joelhos."),
    E("Afundo lateral", "side_lunge", "Dê um passo largo para o lado, desça a 90° e volte a juntar os pés."),
    E("Agachamento com pausa", "squat", "Pausa de 3 segundos embaixo."),
    E("Agachamento prisioneiro", "squat_pr", "Mãos atrás da cabeça, peito alto."),
    E("Afundo alternado", "lunge", "Passo à frente alternando as pernas."),
    E("Agachamento cossaco", "cossack", "Pernas abertas: agache fundo de um lado girando a ponta do outro pé para cima."),
    E("Flexão nórdica reversa", "rev_nordic", "Ajoelhado, incline o tronco e as coxas juntos para trás."),
    E("Pistol negativo", "pistol_neg", "Desça em uma perna em 4 s e apoie os dois pés para subir."),
    E("Pistol", "pistol", "Uma perna só na descida e na subida, a outra estendida à frente.")
  ],
  hinge: [
    E("Ponte de glúteo", "bridge", "Suba o quadril e aperte o glúteo por 1 s."),
    E("Coice de glúteo (4 apoios)", "kickback", "Coxa sobe até a linha do tronco; todas de um lado e depois do outro."),
    E("Ponte isométrica", "bridge_iso", "Segure no alto com ombros, quadril e joelhos alinhados.", "s"),
    E("Bom dia", "goodmorning", "Quadril para trás, costas retas."),
    E("Ponte unilateral", "bridge1", "Uma perna estendida no ar."),
    E("Levantamento terra unilateral", "rdl", "Corpo forma um T em uma perna."),
    E("Ponte unilateral com pausa", "bridge1", "Segure 3 s no alto."),
    E("Ponte completa (roda)", "wheel_bridge", "Mãos ao lado da cabeça; empurre o chão arquendo o corpo inteiro."),
    E("Flexão nórdica", "nordic", "Prenda os calcanhares sob um apoio e desça devagar controlando com o posterior.")
  ],
  calf: [
    E("Elevação de tibial", "tibialis", "Calcanhares à frente, puxe a ponta dos pés para cima."),
    E("Panturrilha em pé", "calf", "Suba na ponta dos pés e desça devagar."),
    E("Panturrilha com pausa", "calf", "Pausa de 2 s no alto."),
    E("Panturrilha unilateral", "calf1", "Uma perna, descida em 2 segundos.")
  ],
  core: [
    E("Abdominal supra", "crunch", "Só as escápulas saem do chão."),
    E("Prancha", "plank", "Sem afundar a lombar.", "s"),
    E("Dead bug", "deadbug", "Braço e perna opostos descem devagar."),
    E("Abdominal completo", "situp", "Suba até sentar, desça devagar."),
    E("Abdominal remador", "remador", "O abdominal do TAF: braços passam por fora dos joelhos."),
    E("Pernada (flutter kick)", "flutter", "Pernas retas a 15 cm do chão.", "s"),
    E("Prancha lateral", "side_plank", "Faça o tempo pedido de cada lado.", "s"),
    E("Prancha com elevação de perna", "plank_leg", "Alterne as pernas, quadril parado."),
    E("Prancha sobe e desce", "updown", "Alterne o braço que começa."),
    E("Prancha com toque no ombro", "shoulder_tap", "Quadril parado a cada toque."),
    E("Elevação de pernas", "legraise", "Pernas retas, lombar não descola."),
    E("Hollow body", "hollow", "Lombar colada no chão.", "s"),
    E("V-up", "vup", "Mãos tocam os pés no alto."),
    E("L-sit no chão", "lsit", "Empurre o chão ao lado do quadril e sustente as pernas fora do solo.", "s"),
    E("Dragon flag", "dragon_flag", "Apoiado nos ombros, suba e desça o corpo reto como uma prancha.")
  ],
  cond: [
    E("Marcha parada", "skip", "Sem saltos: um joelho de cada vez.", "s"),
    E("Polichinelo sem salto", "jack_step", "Uma perna de cada vez, sem impacto.", "s"),
    E("Polichinelo", "jack", "Ritmo constante, na ponta dos pés.", "s"),
    E("Corrida parada com joelho alto", "skip_run", "Joelhos na altura do quadril.", "s"),
    E("Mountain climber", "mclimb", "Quadril baixo, joelhos rápidos.", "s"),
    E("Lagarta (inchworm)", "inchworm", "Caminhe com as mãos até a prancha e volte."),
    E("Agachamento com salto", "jsquat", "Aterrisse macio e emende o próximo."),
    E("Sprawl", "sprawl", "Burpee sem salto, ritmo forte."),
    E("Burpee", "burpee", "Prancha firme, salto com braços para cima."),
    E("Afundo com salto", "jlunge", "Troque as pernas no ar."),
    E("Burpee com flexão", "burpee_pu", "Flexão completa no meio do movimento.")
  ],
  // Aquecimento com alongamento dinâmico: feito automaticamente antes de todo treino (player.js), nesta ordem.
  // Não entra no sorteio dos treinos (os modelos de treino não usam o grupo "mob").
  mob: [
    E("Marcha com elevação de joelhos", "skip", "Joelhos até a altura do quadril, braços acompanhando.", "s"),
    E("Círculos de braços", "arm_circle", "Braços estendidos sobem pela lateral até acima da cabeça e descem devagar.", "s"),
    E("Polichinelo de passo", "jack_step", "Uma perna de cada vez para o lado, sem saltar.", "s"),
    E("Balanço de perna", "leg_swing", "Apoie a mão numa parede e balance a perna para a frente e para trás, sem arquear a lombar.", "s"),
    E("Bom dia de mobilidade", "goodmorning", "Leve o quadril para trás com as costas retas até sentir alongar atrás da coxa.", "s"),
    E("Agachamento de mobilidade", "squat", "Desça devagar até onde for confortável, calcanhares no chão.", "s"),
    E("Afundo de mobilidade", "lunge", "Passo à frente alternando as pernas, tronco ereto.", "s")
  ]
};

// Dica curta de cada exercício pelo nome (voz do player e ritmo escrito na dica)
export const TIP = new Map(Object.values(LIB).flat().map(e => [e.n, e.d]));

export const PAT = {
  push: "Empurrar",
  tri: "Tríceps",
  shoulder: "Ombros",
  back: "Costas",
  squat: "Pernas",
  hinge: "Posterior",
  calf: "Panturrilha",
  core: "Abdômen",
  cond: "Condicionamento",
  mob: "Aquecimento"
};

export const INFO = {
  pushup_wall: { m: ["Peitoral", "Tríceps", "Ombro anterior"], s: ["De frente para a parede, a um passo e meio dela, mãos na altura do peito e um pouco mais abertas que os ombros.", "Incline o corpo reto em direção à parede dobrando os cotovelos.", "Empurre a parede e volte, sem dobrar o quadril."], e: ["Ficar perto demais da parede", "Quadril para trás"] },
  wall_sit: { m: ["Quadríceps", "Glúteos"], s: ["Encoste as costas numa parede e afaste os pés uns 50 cm dela.", "Deslize até as coxas ficarem paralelas ao chão, joelhos sobre os tornozelos.", "Segure o tempo pedido com as costas apoiadas e os braços soltos."], e: ["Joelhos passando muito da ponta dos pés", "Apoiar as mãos nas coxas"] },
  kickback: { m: ["Glúteos", "Posterior de coxa", "Core"], s: ["Fique em 4 apoios: mãos sob os ombros e joelhos sob o quadril.", "Leve uma perna para trás e para cima até a coxa ficar alinhada ao tronco.", "Volte devagar sem apoiar o joelho. Faça todas de um lado e troque."], e: ["Arquear a lombar para subir mais", "Girar o quadril para o lado"] },
  plank_leg: { m: ["Glúteos", "Abdômen", "Core"], s: ["Prancha nos antebraços, corpo reto.", "Eleve uma perna estendida até a altura do quadril, sem girar a pelve.", "Desça e alterne as pernas."], e: ["Quadril girando", "Subir a perna alto demais e arquear a lombar"] },
  updown: { m: ["Tríceps", "Ombros", "Core"], s: ["Comece na prancha nos antebraços.", "Apoie uma mão de cada vez e estenda os braços até a prancha alta.", "Desça um antebraço de cada vez e alterne o braço que começa."], e: ["Quadril balançando", "Mãos à frente dos ombros"] },
  pushup: { m: ["Peitoral", "Tríceps", "Ombro anterior", "Core"], s: ["Mãos no chão um pouco mais abertas que os ombros, corpo reto da cabeça aos pés.", "Desça dobrando os cotovelos para trás, a uns 45° do tronco, até o peito quase tocar o chão.", "Empurre o chão e estenda os braços, mantendo o quadril alinhado."], e: ["Quadril caído ou empinado", "Cotovelos abertos a 90° do corpo", "Descer só até a metade"] },
  pushup_knee: { m: ["Peitoral", "Tríceps", "Ombro anterior"], s: ["Joelhos no chão, mãos sob os ombros e quadril alinhado com o tronco.", "Desça o peito em direção ao chão com os cotovelos para trás.", "Empurre até estender os braços sem dobrar o quadril."], e: ["Quadril para cima (corpo em V)", "Cabeça caindo antes do peito"] },
  sphinx: { m: ["Tríceps", "Ombros", "Core"], s: ["Comece em prancha nos antebraços, mãos espalmadas à frente.", "Empurre o chão com as palmas até estender os braços, sem tirar as mãos do lugar.", "Volte devagar para os antebraços."], e: ["Quadril balançando", "Mãos mudando de posição"] },
  pike: { m: ["Ombros", "Tríceps", "Trapézio"], s: ["Faça um V invertido: mãos no chão, quadril alto e pernas o mais retas possível.", "Dobre os cotovelos levando a cabeça à frente das mãos, formando um triângulo.", "Empurre o chão e volte ao V."], e: ["Cotovelos abertos para os lados", "Quadril baixo, virando uma flexão comum"] },
  plank_dd: { m: ["Ombros", "Core", "Posterior de coxa"], s: ["Comece na prancha alta, braços estendidos.", "Empurre o chão e leve o quadril para cima e para trás, formando um V invertido.", "Volte para a prancha com controle."], e: ["Dobrar os braços", "Lombar arredondada no V"] },
  hindu: { m: ["Peitoral", "Ombros", "Tríceps", "Mobilidade"], s: ["Comece no V invertido, mãos e pés afastados.", "Desça o peito rente ao chão, como se passasse por baixo de uma cerca.", "Estenda os braços terminando com o peito aberto, quadril baixo.", "Volte pelo mesmo caminho até o V."], e: ["Cortar o caminho e não raspar o chão", "Lombar travada sem controle"] },
  bear: { m: ["Ombros", "Core", "Quadríceps"], s: ["Em quatro apoios: mãos sob os ombros, joelhos sob o quadril.", "Tire os joelhos 3 cm do chão mantendo as costas retas.", "Segure o tempo pedido respirando normalmente."], e: ["Quadril alto demais", "Joelhos encostando no chão"] },
  superman: { m: ["Lombar", "Dorsal", "Glúteos", "Ombros"], s: ["Deite de barriga para baixo, braços estendidos à frente.", "Tire peito e pernas do chão e puxe os cotovelos para trás, junto ao corpo, como numa barra.", "Segure 2 segundos e estenda os braços de novo."], e: ["Jogar a cabeça para trás", "Movimento rápido sem pausa"] },
  superman_alt: { m: ["Lombar", "Glúteos", "Ombros"], s: ["Deite de barriga para baixo, braços estendidos à frente.", "Suba juntos o braço direito e a perna esquerda.", "Desça e troque: braço esquerdo e perna direita."], e: ["Girar o quadril", "Levantar o pescoço"] },
  prone_y: { m: ["Trapézio", "Romboides", "Lombar"], s: ["Deite de barriga para baixo, braços em Y à frente e polegares para cima.", "Tire braços e peito do chão juntando as escápulas.", "Segure 1 a 2 segundos e desça devagar."], e: ["Encolher os ombros", "Usar impulso"] },
  backwidow: { m: ["Romboides", "Dorsal", "Trapézio"], s: ["Deite de costas, joelhos dobrados e cotovelos dobrados ao lado do corpo.", "Empurre os cotovelos contra o chão para levantar o tronco.", "Segure 1 segundo juntando as escápulas e desça devagar."], e: ["Usar o abdômen para subir", "Cotovelos longe do corpo"] },
  squat: { m: ["Quadríceps", "Glúteos", "Posterior de coxa"], s: ["Pés na largura dos ombros, pontas um pouco para fora.", "Desça levando o quadril para trás e para baixo, braços à frente para equilíbrio.", "Suba empurrando o chão com o pé inteiro."], e: ["Calcanhar saindo do chão", "Joelhos caindo para dentro"] },
  squat_pr: { m: ["Quadríceps", "Glúteos", "Postura"], s: ["Mãos atrás da cabeça, cotovelos abertos e peito alto.", "Desça até a coxa passar da linha do joelho sem fechar os cotovelos.", "Suba firme mantendo o peito aberto."], e: ["Puxar a cabeça com as mãos", "Tronco desabando para a frente"] },
  sumo: { m: ["Adutores", "Glúteos", "Quadríceps"], s: ["Visto de frente: pés bem afastados, pontas viradas para fora.", "Desça reto empurrando os joelhos para fora, na direção dos pés.", "Suba apertando o glúteo."], e: ["Joelhos fechando", "Tronco inclinado para a frente"] },
  lunge: { m: ["Quadríceps", "Glúteos", "Equilíbrio"], s: ["Em pé, dê um passo largo (à frente ou para trás, conforme a variação).", "Desça até o joelho de trás quase tocar o chão.", "Volte à posição inicial e troque de perna."], e: ["Joelho da frente caindo para dentro", "Tronco inclinando para a frente"] },
  cossack: { m: ["Adutores", "Glúteos", "Quadríceps"], s: ["Visto de frente: pés bem afastados, pontas para fora.", "Desça para um lado dobrando a perna; a outra fica estendida com a ponta do pé para cima.", "Volte ao centro e repita para o outro lado."], e: ["Calcanhar da perna dobrada saindo do chão", "Costas arredondadas"] },
  pistol: { m: ["Quadríceps", "Glúteos", "Core", "Equilíbrio"], s: ["Em uma perna só, a outra estendida à frente.", "Desça devagar com os braços à frente até sentar no calcanhar.", "Suba sem apoiar a outra perna. Na versão negativa, só desça e volte com as duas pernas."], e: ["Calcanhar levantando", "Desabar no fundo sem controle"] },
  bridge: { m: ["Glúteos", "Posterior de coxa", "Lombar"], s: ["Deite de costas, joelhos dobrados e pés no chão perto do quadril.", "Suba o quadril até formar uma linha dos ombros aos joelhos.", "Aperte o glúteo por 1 segundo em cima e desça devagar."], e: ["Arquear a lombar em vez de usar o glúteo", "Pés longe demais"] },
  bridge1: { m: ["Glúteos", "Posterior de coxa"], s: ["Deite de costas com um pé no chão e a outra perna estendida.", "Suba o quadril empurrando com o calcanhar do pé apoiado.", "Segure em cima e desça. Troque de lado."], e: ["Quadril torto para um lado", "Usar a lombar"] },
  goodmorning: { m: ["Posterior de coxa", "Glúteos", "Lombar"], s: ["Em pé, mãos atrás da cabeça, joelhos levemente dobrados.", "Leve o quadril para trás inclinando o tronco reto até sentir a parte de trás da coxa.", "Volte contraindo o glúteo."], e: ["Arredondar as costas", "Dobrar demais os joelhos"] },
  rdl: { m: ["Posterior de coxa", "Glúteos", "Equilíbrio"], s: ["Em pé numa perna, joelho de apoio levemente dobrado.", "Incline o tronco à frente enquanto a outra perna sobe para trás, corpo formando um T.", "Volte devagar sem apoiar o pé. Troque de lado."], e: ["Abrir o quadril para o lado", "Costas arredondadas"] },
  calf: { m: ["Panturrilhas"], s: ["Em pé, pés na largura do quadril.", "Suba na ponta dos pés o mais alto possível.", "Desça devagar até apoiar o calcanhar."], e: ["Movimento curto e rápido", "Joelhos dobrando"] },
  calf1: { m: ["Panturrilhas", "Equilíbrio"], s: ["Em pé numa perna só, a outra dobrada para trás.", "Suba na ponta do pé o mais alto possível.", "Desça em 2 segundos. Troque de lado."], e: ["Pressa na descida", "Perder o equilíbrio por olhar para baixo"] },
  plank: { m: ["Abdômen", "Core", "Ombros"], s: ["Antebraços no chão, cotovelos sob os ombros.", "Corpo reto da cabeça aos calcanhares, glúteo e abdômen contraídos.", "Respire normalmente e segure o tempo pedido."], e: ["Quadril caído", "Quadril alto demais"] },
  side_plank: { m: ["Oblíquos", "Core", "Glúteo médio"], s: ["Deite de lado, cotovelo sob o ombro e pés empilhados.", "Suba o quadril até o corpo ficar reto; braço de cima para o alto.", "Segure o tempo pedido e troque de lado."], e: ["Quadril caindo", "Ombro encolhido"] },
  shoulder_tap: { m: ["Core", "Ombros", "Antirrotação"], s: ["Prancha alta, pés um pouco afastados.", "Tire uma mão e toque o ombro oposto sem balançar o quadril.", "Volte a mão e alterne os lados."], e: ["Quadril girando a cada toque", "Pés juntos demais"] },
  hollow: { m: ["Abdômen", "Core"], s: ["Deite de costas e cole a lombar no chão.", "Tire ombros e pernas do chão, braços estendidos acima da cabeça.", "Segure o corpo em forma de banana o tempo pedido."], e: ["Lombar descolando do chão", "Prender a respiração"] },
  deadbug: { m: ["Abdômen", "Core"], s: ["De costas, braços para o teto e joelhos dobrados a 90°.", "Estenda um braço para trás e a perna oposta à frente, devagar.", "Volte e repita do outro lado, lombar sempre no chão."], e: ["Lombar arqueando", "Movimento rápido"] },
  legraise: { m: ["Abdômen inferior", "Flexores do quadril"], s: ["Deite de costas, braços ao lado do corpo, pernas estendidas.", "Suba as pernas retas até ficarem perpendiculares ao chão.", "Desça devagar sem deixar a lombar descolar."], e: ["Lombar arqueando na descida", "Usar impulso"] },
  crunch: { m: ["Abdômen superior"], s: ["Deite de costas, joelhos dobrados, mãos ao lado da cabeça.", "Enrole o tronco tirando só as escápulas do chão.", "Desça devagar sem relaxar totalmente."], e: ["Puxar o pescoço com as mãos", "Subir com impulso"] },
  situp: { m: ["Abdômen", "Flexores do quadril"], s: ["Deite de costas, joelhos dobrados, mãos ao lado da cabeça.", "Suba o tronco inteiro até ficar sentado.", "Desça vértebra por vértebra até as costas tocarem o chão."], e: ["Puxar a cabeça", "Pés saindo do chão"] },
  remador: { m: ["Abdômen", "Flexores do quadril"], s: ["Deite de costas com braços estendidos acima da cabeça e pernas retas.", "Suba o tronco e, ao mesmo tempo, dobre as pernas trazendo os joelhos ao peito; braços passam por fora dos joelhos.", "Volte à posição deitada estendendo braços e pernas. Esse é o abdominal do TAF."], e: ["Não estender totalmente ao voltar", "Braços não passando dos joelhos"] },
  flutter: { m: ["Abdômen inferior", "Flexores do quadril"], s: ["Deite de costas, mãos ao lado do quadril, ombros levemente fora do chão.", "Tire as pernas retas do chão uns 15 cm.", "Bata as pernas alternadamente para cima e para baixo, sem tocar o chão."], e: ["Lombar descolando", "Pernas altas demais, sem trabalho"] },
  vup: { m: ["Abdômen", "Flexores do quadril"], s: ["Deite estendido, braços acima da cabeça.", "Suba tronco e pernas retas ao mesmo tempo, tentando tocar os pés com as mãos.", "Desça controlando até estender de novo."], e: ["Dobrar os joelhos", "Cair de volta sem controle"] },
  jack: { m: ["Cardio", "Panturrilhas", "Ombros"], s: ["Visto de frente: em pé, pés juntos e braços ao lado do corpo.", "Salte abrindo as pernas e levando os braços acima da cabeça.", "Salte de volta à posição inicial em ritmo constante."], e: ["Pisar com o calcanhar", "Braços pela metade"] },
  skip: { m: ["Cardio", "Flexores do quadril", "Panturrilhas"], s: ["Corra parado no lugar, tronco ereto.", "Suba os joelhos até a altura do quadril.", "Balance os braços em oposição às pernas, pisando na ponta dos pés."], e: ["Joelhos baixos", "Tronco inclinado para trás"] },
  mclimb: { m: ["Cardio", "Core", "Ombros"], s: ["Prancha alta, mãos sob os ombros.", "Traga um joelho em direção ao peito e volte.", "Alterne as pernas rapidamente sem subir o quadril."], e: ["Quadril alto", "Mãos à frente dos ombros"] },
  jsquat: { m: ["Quadríceps", "Glúteos", "Potência"], s: ["Pés na largura dos ombros.", "Agache levando os braços para trás.", "Salte explosivo jogando os braços para cima e aterrisse macio, já descendo para o próximo."], e: ["Aterrissar com as pernas retas", "Joelhos para dentro na aterrissagem"] },
  jlunge: { m: ["Quadríceps", "Glúteos", "Potência"], s: ["Comece em afundo, uma perna à frente.", "Salte e troque as pernas no ar.", "Aterrisse em afundo com a outra perna à frente e repita."], e: ["Joelho de trás batendo no chão", "Tronco caindo para a frente"] },
  sprawl: { m: ["Cardio", "Corpo inteiro"], s: ["Em pé, agache e apoie as mãos no chão.", "Jogue as pernas para trás até a prancha alta.", "Traga os pés de volta e fique em pé."], e: ["Quadril afundando na prancha", "Costas arredondadas ao levantar"] },
  burpee: { m: ["Cardio", "Corpo inteiro"], s: ["Em pé, agache e apoie as mãos no chão.", "Jogue as pernas para trás até a prancha alta.", "Traga os pés de volta para perto das mãos.", "Salte com os braços para cima."], e: ["Quadril afundando na prancha", "Aterrissar duro"] },
  burpee_pu: { m: ["Cardio", "Peitoral", "Corpo inteiro"], s: ["Em pé, agache e apoie as mãos no chão.", "Jogue as pernas para trás e faça uma flexão completa.", "Traga os pés de volta para perto das mãos.", "Salte com os braços para cima."], e: ["Flexão pela metade", "Quadril chegando antes do peito"] },
  inchworm: { m: ["Ombros", "Core", "Posterior de coxa"], s: ["Em pé, dobre o tronco e apoie as mãos no chão perto dos pés.", "Caminhe com as mãos à frente até a prancha alta.", "Caminhe com as mãos de volta e fique em pé."], e: ["Dobrar muito os joelhos", "Quadril afundando na prancha"] },
  scap_push: { m: ["Serrátil anterior", "Ombros", "Core"], s: ["Comece na prancha alta com os braços totalmente estendidos.", "Sem dobrar os cotovelos, deixe o peito descer levemente juntando as escápulas.", "Empurre o chão afastando as escápulas ao máximo no alto (protração)."], e: ["Dobrar os cotovelos", "Deixar a lombar afundar"] },
  lsit: { m: ["Abdômen", "Tríceps", "Flexores do quadril", "Quadríceps"], s: ["Sente-se no chão com as pernas estendidas à frente e apoie as mãos ao lado do quadril.", "Empurre o chão deprimindo os ombros e tire o quadril do solo.", "Sustente as pernas retas (ou semi-fletidas na versão iniciante) formando um L."], e: ["Ombros encolhidos nas orelhas", "Dobrar os cotovelos"] },
  wheel_bridge: { m: ["Glúteos", "Lombar", "Ombros", "Mobilidade torácica"], s: ["Deite de costas, dobre os joelhos e apoie as mãos no chão ao lado das orelhas (dedos apontando para os ombros).", "Empurre o chão com mãos e pés ao mesmo tempo, subindo o quadril e o peito em arco.", "Sustente respirando sob controle e desça recolhendo o queixo."], e: ["Joelhos abrindo demais", "Subir sem abrir os ombros"] },
  nordic: { m: ["Posterior de coxa", "Glúteos", "Core"], s: ["Ajoelhe-se prendendo os tornozelos sob um sofá, barra baixa ou apoio firme.", "Mantenha quadril e tronco totalmente alinhados.", "Incline o corpo à frente o mais devagar possível segurando com o posterior de coxa; amorteça com as mãos no fim e volte."], e: ["Dobrar o quadril (jogar a bunda para trás)", "Cair rápido sem controle excêntrico"] },
  rev_nordic: { m: ["Quadríceps", "Flexores do quadril", "Core"], s: ["Ajoelhe-se com os pés apoiados atrás e o tronco alinhado às coxas.", "Contraia glúteos e abdômen e incline o corpo reto para trás, dobrando apenas os joelhos.", "Vá até onde mantém o controle e suba usando a força das coxas."], e: ["Arquear a lombar", "Dobrar o quadril ao subir"] },
  dragon_flag: { m: ["Abdômen completo", "Oblíquos", "Dorsal", "Core"], s: ["Deite de costas e segure um apoio firme atrás da cabeça.", "Suba o corpo inteiro reto (quadril e pernas alinhados) apoiando o peso na parte superior das costas/ombros.", "Desça devagar mantendo o corpo rígido como uma prancha, sem tocar a lombar no chão."], e: ["Dobrar o quadril na descida (perder a linha reta)", "Apoiar o peso no pescoço em vez dos ombros"] },
  tibialis: { m: ["Tibial anterior", "Tornozelos"], s: ["Em pé (ou com as costas apoiadas na parede), dê um passo à frente com os calcanhares.", "Sem dobrar os joelhos, puxe a ponta dos pés o mais alto possível em direção à canela.", "Segure 1 segundo no topo e desça devagar."], e: ["Dobrar os joelhos para roubar", "Movimento rápido sem pausar em cima"] },
  crow: { m: ["Ombros", "Tríceps", "Core", "Equilíbrio de braços"], s: ["Agache e apoie as mãos no chão na largura dos ombros com os dedos bem abertos.", "Apoie a parte interna dos joelhos na parte de trás dos braços (tríceps) e olhe um pouco à frente.", "Incline o peso para as mãos até os pés descolarem do chão e sustente o equilíbrio."], e: ["Olhar para baixo (para os pés)", "Saltar em vez de transferir o peso devagar"] },
  side_lunge: { m: ["Quadríceps", "Glúteos", "Adutores"], s: ["Comece em pé com os pés na largura do quadril.", "Dê um passo largo para o lado, levando o quadril para trás e dobrando o joelho de fora até cerca de 90°, mantendo os dois pés apoiados no chão.", "Empurre o chão com o calcanhar para voltar à posição em pé e alterne o lado."], e: ["Deixar o joelho cair para dentro", "Tirar a sola do pé estendido do chão"] },
  pushup_neg: { m: ["Peitoral", "Tríceps", "Ombro anterior", "Core"], s: ["Comece na prancha alta com o corpo alinhado dos pés à cabeça.", "Desça o corpo reto bem devagar (cerca de 3 a 4 segundos) até o peito quase tocar o chão.", "Apoie os joelhos no solo lá embaixo, empurre para subir e volte à prancha alta."], e: ["Desabar rápido na metade final", "Esquecer de alinhar o quadril na descida"] },
  pushup_exp: { m: ["Peitoral", "Tríceps", "Potência"], s: ["Comece na prancha alta, corpo firme.", "Desça controlado até o peito chegar perto do chão.", "Empurre o chão com força máxima até as mãos descolarem do solo e amorteça a queda dobrando os cotovelos."], e: ["Aterrissar com os cotovelos travados", "Deixar o quadril cair ao amortecer"] },
  pushup_arch: { m: ["Peitoral", "Tríceps", "Ombro anterior", "Core"], s: ["Apoie as mãos bem mais abertas que a largura dos ombros.", "Desça deslocando o peso para um lado: o braço de apoio dobra a 90° enquanto o outro fica totalmente estendido.", "Suba de volta ao centro e repita para o lado oposto."], e: ["Dobrar os dois braços igual a uma flexão aberta", "Girar o tronco ao descer"] },
  pistol_neg: { m: ["Quadríceps", "Glúteos", "Equilíbrio"], s: ["Em pé em uma perna só, estenda a outra perna à frente.", "Desça devagar (3 a 4 segundos) controlando com a perna de apoio até o fundo do agachamento.", "Apoie os dois pés no chão lá embaixo e suba com as duas pernas juntas."], e: ["Desabar no final da descida", "Tirar o calcanhar de apoio do chão"] },
  superman_iso: { m: ["Lombar", "Glúteos", "Trapézio"], s: ["Deite de barriga para baixo com braços e pernas estendidos.", "Tire braços, peito e coxas do chão ao mesmo tempo.", "Sustente a posição em isometria pelo tempo pedido respirando normalmente."], e: ["Jogar o pescoço para trás", "Prender a respiração"] },
  bridge_iso: { m: ["Glúteos", "Posterior de coxa", "Lombar"], s: ["Deite de costas com os joelhos dobrados e pés apoiados perto do quadril.", "Suba o quadril até alinhar ombros, quadril e joelhos.", "Segure parado no topo contraindo forte os glúteos durante todo o tempo."], e: ["Deixar o quadril cair aos poucos", "Empurrar com a ponta dos pés em vez dos calcanhares"] }
};

INFO.jack_step = INFO.jack;
INFO.arm_circle = { m: ["Ombros", "Escápulas"], s: ["Visto de frente: em pé, braços estendidos ao lado do corpo.", "Suba os braços pela lateral até acima da cabeça, sem encolher os ombros.", "Desça devagar pelo mesmo caminho e repita em ritmo contínuo."], e: ["Dobrar os cotovelos", "Arquear a lombar no alto"] };
INFO.leg_swing = { m: ["Posterior de coxa", "Flexores do quadril", "Glúteos"], s: ["Em pé, apoie uma mão numa parede e fique numa perna só.", "Balance a outra perna para a frente e para trás, aumentando a amplitude aos poucos.", "Na metade do tempo, troque de perna."], e: ["Arquear a lombar quando a perna vai para trás", "Chutar com força em vez de balançar"] };
INFO.lunge_rev = INFO.lunge;
INFO.skip_run = INFO.skip;

export const INFO_N = {
  "Marcha parada": { m: ["Cardio", "Flexores do quadril", "Core"], s: ["Em pé, tronco ereto.", "Marche no lugar elevando um joelho de cada vez até perto da altura do quadril.", "Balance os braços em oposição às pernas, sem saltar."], e: ["Inclinar o tronco para trás", "Joelhos baixos demais"] },
  "Polichinelo sem salto": { m: ["Cardio", "Ombros", "Pernas"], s: ["Em pé, pés juntos e braços ao lado do corpo.", "Leve uma perna para o lado e os braços acima da cabeça, sem saltar.", "Volte e repita para o outro lado em ritmo constante."], e: ["Encolher os ombros", "Perder o ritmo"] }
};

// Referências técnicas (ângulos-chave usados por profissionais de educação física)
export const REF = {
  jack_step: "Uma perna de cada vez, sem impacto; braços acima da cabeça.",
  skip_run: "Coxa até a altura do quadril, apoio na ponta dos pés, pequeno salto a cada troca.",
  pushup_wall: "Corpo reto dos calcanhares à cabeça; cotovelos a 30–45° do tronco; quanto mais longe da parede, mais difícil.",
  wall_sit: "Coxas paralelas ao chão, joelhos a 90° e sobre os tornozelos; costas apoiadas na parede.",
  kickback: "Joelho de apoio sob o quadril; a coxa que sobe para alinhada ao tronco, sem arquear a lombar.",
  plank_leg: "Corpo reto na prancha; a perna sobe só até a linha do quadril.",
  updown: "Mãos sob os ombros na prancha alta, cotovelos sob os ombros na baixa; quadril estável.",
  pushup: "Embaixo, cotovelos perto de 90° e a 30–45° do tronco; corpo em linha reta da cabeça aos pés.",
  pushup_knee: "Embaixo, cotovelos perto de 90° e a 30–45° do tronco; corpo reto dos ombros aos joelhos.",
  sphinx: "Na prancha, cotovelos sob os ombros; estenda os braços até quase travar.",
  pike: "Quadril em V invertido (cerca de 90°); cotovelos vão para trás e a cabeça desce à frente das mãos.",
  plank_dd: "Na prancha, ombros sobre as mãos; no V, braços e costas em linha.",
  hindu: "Do V invertido até o peito rente ao chão, cotovelos próximos ao corpo.",
  bear: "Quadril e joelhos perto de 90°, joelhos a 3–5 cm do chão, costas retas.",
  squat: "Desça até a coxa ficar paralela ao chão (joelho perto de 90° ou menos), calcanhares no chão e joelhos na direção dos pés.",
  squat_pr: "Coxa paralela ao chão embaixo; peito alto e cotovelos abertos.",
  sumo: "Coxas paralelas ao chão, tronco ereto, joelhos abertos na direção dos pés.",
  lunge: "Embaixo, os dois joelhos perto de 90°; tronco ereto; joelho de trás a 2–3 cm do chão.",
  jlunge: "Aterrisse com os dois joelhos perto de 90° e o tronco ereto.",
  cossack: "Joelho flexionado profundo, perna estendida reta e calcanhar no chão.",
  pistol: "Desça até onde mantém o calcanhar no chão e a coluna neutra.",
  bridge: "No alto, ombros, quadril e joelhos em linha reta; joelhos perto de 90°, canelas na vertical.",
  bridge1: "No alto, ombros, quadril e joelho em linha reta; perna livre alinhada à coxa.",
  goodmorning: "Joelhos levemente flexionados; quadril vai para trás com a coluna neutra até o tronco ficar perto da horizontal.",
  rdl: "Joelho de apoio levemente flexionado; tronco e perna livre formam uma linha perto da horizontal.",
  calf: "Amplitude total: do calcanhar apoiado até a ponta dos pés.",
  calf1: "Amplitude total, descida controlada em 2 segundos.",
  plank: "Ombros sobre os cotovelos; corpo em linha reta, sem quadril caído ou alto.",
  side_plank: "Cotovelo sob o ombro; cabeça, quadril e pés em linha reta.",
  shoulder_tap: "Mãos sob os ombros; quadril parado a cada toque.",
  hollow: "Lombar colada no chão; pernas a 15–30 cm do chão.",
  deadbug: "Quadril e joelhos a 90°; lombar apoiada o tempo todo.",
  legraise: "Suba até cerca de 90° no quadril; desça sem arquear a lombar.",
  crunch: "Joelhos perto de 90°; o tronco sobe cerca de 30°, só as escápulas saem do chão.",
  situp: "Joelhos perto de 90° e pés no chão; suba até o tronco ficar quase vertical.",
  remador: "Embaixo, corpo totalmente estendido; no alto, joelhos ao peito e braços por fora dos joelhos.",
  flutter: "Lombar no chão; pernas retas a 15–20 cm do chão.",
  vup: "Tronco e pernas sobem juntos, formando um V perto de 90° no quadril.",
  skip: "Coxa até a altura do quadril (90°), apoio na ponta dos pés.",
  mclimb: "Prancha alta com mãos sob os ombros; joelho em direção ao peito sem subir o quadril.",
  jsquat: "Agache até o joelho chegar perto de 90° antes do salto; aterrisse com os joelhos flexionados.",
  sprawl: "Na prancha, corpo alinhado; volte com os pés perto das mãos.",
  burpee: "Na prancha, corpo alinhado; aterrisse do salto com os joelhos flexionados.",
  burpee_pu: "Flexão completa (cotovelos perto de 90°) com o corpo alinhado; aterrisse com os joelhos flexionados.",
  superman: "Movimento curto e controlado; pescoço neutro, olhar para o chão.",
  superman_alt: "Eleve pouco, sem girar o quadril; pescoço neutro.",
  prone_y: "Polegares para cima; eleve com as escápulas, pescoço neutro.",
  backwidow: "Cotovelos junto ao corpo; eleve o tronco só com as costas.",
  jack: "Aterrisse na ponta dos pés com os joelhos levemente flexionados.",
  inchworm: "Joelhos o mais estendidos possível; prancha alinhada no final.",
  scap_push: "Cotovelos travados a 180°; o movimento ocorre exclusivamente na cintura escapular (retração e protração).",
  lsit: "Braços estendidos com depressão escapular ativa; tronco e pernas formam um ângulo próximo de 90°.",
  wheel_bridge: "Empurre os ombros para abrir o ângulo torácico, distribuindo a extensão por toda a coluna e quadril.",
  nordic: "Linha reta dos joelhos aos ombros; controle a fase excêntrica por 3 a 4 segundos sem flexionar o quadril.",
  rev_nordic: "Quadril estendido em linha com os joelhos e ombros durante toda a inclinação para trás.",
  dragon_flag: "Apoio nas escápulas (nunca na cervical); quadril estendido mantendo o corpo em prancha rígida.",
  tibialis: "Dorsiflexão máxima do tornozelo com os joelhos estendidos.",
  crow: "Dedos abertos agarrando o chão; cotovelos alinhados sobre os punhos e olhar 30 cm à frente.",
  side_lunge: "Passo lateral amplo; joelho flexionado perto de 90° alinhado ao pé e ambos os pés plantados no chão.",
  pushup_neg: "Fase excêntrica lenta (3–4 s) em prancha reta; apoio dos joelhos para a fase concêntrica.",
  pushup_exp: "Impulso pliométrico tirando as mãos do solo; recepção suave com cotovelos semi-fletidos.",
  pushup_arch: "Braço de trabalho flete a 90° próximo ao tronco; braço de assistência permanece estendido a 180°.",
  pistol_neg: "Excêntrica unilateral controlada até o fundo; subida bilateral com os dois pés apoiados.",
  superman_iso: "Extensão isométrica de tronco e quadril com olhar voltado para o solo.",
  bridge_iso: "Quadril sustentado em extensão neutra alinhado aos joelhos e ombros."
};
REF.lunge_rev = REF.lunge;
