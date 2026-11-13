/*
 * Tênis em 3D, modelados em código. São modelos inventados para esta apresentação:
 * nenhum copia um tênis de marca, e nenhum leva logo.
 * Um único desenhista WebGL atende a página inteira. As miniaturas são fotos tiradas uma vez
 * por modelo; na abertura e na página do produto o tênis é vivo, gira e se monta peça por peça.
 */
import * as THREE from '../assets/vendor/three.module.min.js';

const C = 2.9; // comprimento do tênis, do calcanhar (x negativo) à ponta
const mistura = (a, b, t) => a + (b - a) * t;
const suave = (a, b, v) => { const t = Math.min(1, Math.max(0, (v - a) / (b - a))); return t * t * (3 - 2 * t); };
/** Lê uma curva dada por pontos [u, valor], com passagem suave entre eles. */
function curva(pontos, u) {
  for (let i = 1; i < pontos.length; i++) {
    if (u <= pontos[i][0]) return mistura(pontos[i - 1][1], pontos[i][1], suave(pontos[i - 1][0], pontos[i][0], u));
  }
  return pontos[pontos.length - 1][1];
}

/* O que muda de uma silhueta para outra: altura do colarinho, da entressola e o bico. */
const FORMAS = {
  quadra: { colar: 0.92, salto: 0.3, frente: 0.2, bico: 0.3, garras: false },
  corrida: { colar: 0.86, salto: 0.5, frente: 0.2, bico: 0.24, garras: false },
  cano: { colar: 1.5, salto: 0.34, frente: 0.22, bico: 0.34, garras: false },
  skate: { colar: 0.8, salto: 0.2, frente: 0.18, bico: 0.3, garras: false },
  trilha: { colar: 1.05, salto: 0.44, frente: 0.3, bico: 0.3, garras: true },
};

const largura = (u) => {
  const base = curva([[0, 0.76], [0.35, 0.84], [0.72, 1], [1, 1]], u);
  const tras = u < 0.1 ? Math.sqrt(1 - ((0.1 - u) / 0.1) ** 2 * 0.75) : 1;
  const ponta = u > 0.74 ? Math.sqrt(Math.max(0, 1 - ((u - 0.74) / 0.26) ** 2)) : 1;
  return base * tras * Math.max(0.05, ponta);
};

/**
 * Casca fechada: fatias ao longo do comprimento, cada uma com base reta e um arco por cima.
 * `corte` (0 a 1, número ou função de u) achata o arco a partir daquela altura: serve para abrir
 * a boca do tênis e para fazer painéis que só aparecem na lateral.
 */
function casca({ de = 0, ate = 1, fatias = 44, volta = 34, alturaDe, baseDe, folga = 1, corte = 1 }) {
  const pos = [], idx = [], cortar = typeof corte === 'function' ? corte : () => corte;
  for (let i = 0; i <= fatias; i++) {
    const u = mistura(de, ate, i / fatias), x = (u - 0.5) * C, w = largura(u) * 0.5 * folga, h = alturaDe(u), y0 = baseDe(u), lim = cortar(u);
    for (let j = 0; j < volta; j++) {
      const a = (j / volta) * Math.PI * 2, s = Math.sin(a), c = Math.cos(a);
      const y = s > 0 ? y0 + h * Math.min(s, lim) ** 0.72 : y0;
      pos.push(x, y, w * Math.sign(c) * Math.abs(c) ** 0.8);
    }
  }
  for (let i = 0; i < fatias; i++) for (let j = 0; j < volta; j++) {
    const a = i * volta + j, b = i * volta + ((j + 1) % volta), c = a + volta, d = b + volta;
    idx.push(a, c, b, b, c, d);
  }
  for (const i of [0, fatias]) {   // tampas das duas pontas
    let cx = 0, cy = 0; for (let j = 0; j < volta; j++) { cx += pos[(i * volta + j) * 3]; cy += pos[(i * volta + j) * 3 + 1]; }
    pos.push(cx / volta, cy / volta, 0);
    const centro = pos.length / 3 - 1;
    for (let j = 0; j < volta; j++) { const a = i * volta + j, b = i * volta + ((j + 1) % volta); if (i === 0) idx.push(centro, a, b); else idx.push(centro, b, a); }
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); g.setIndex(idx); g.computeVertexNormals();
  return g;
}

function montarTenis(produto) {
  const f = FORMAS[produto.silhueta] ?? FORMAS.quadra, cor = produto.cores;
  const tinta = (hex, extra = {}) => new THREE.MeshStandardMaterial({ color: hex, roughness: 0.48, metalness: 0.1, transparent: true, ...extra });
  const levanta = (u) => suave(0.74, 1, u) * 0.16;                       // a ponta sobe um pouco do chão
  const sola = (u) => curva([[0, f.salto], [0.55, mistura(f.salto, f.frente, 0.6)], [1, f.frente]], u);
  const corpo = (u) => curva([[0, f.colar * 0.95], [0.1, f.colar], [0.34, f.colar * 0.94], [0.52, 0.66], [0.8, f.bico], [1, 0.12]], u);
  const boca = (u) => mistura(0.78, 1, suave(0.33, 0.43, u));           // o arco é achatado atrás: ali fica a boca
  const topo = (u) => levanta(u) + 0.07 + sola(u) * 0.55;
  const grupo = new THREE.Group();
  const peca = (nome, geometria, material, fuga, ordem) => {
    const m = new THREE.Mesh(geometria, material); m.name = nome; m.userData = { fuga: new THREE.Vector3(...fuga), ordem };
    grupo.add(m); return m;
  };
  const painel = (de, ate, corte, folga = 1.035) => casca({ de, ate, fatias: 22, alturaDe: (u) => corpo(u) * 1.02, baseDe: topo, folga, corte });

  peca('sola', casca({ alturaDe: () => 0.08, baseDe: levanta, folga: 1.07 }), tinta(cor.sola, { roughness: 0.95, metalness: 0 }), [0, -1.5, 0], 0);
  peca('entressola', casca({ alturaDe: (u) => sola(u) * 0.7, baseDe: (u) => levanta(u) + 0.07, folga: 1.05 }), tinta(cor.entressola, { roughness: 0.7 }), [0, -0.9, 0], 1);
  peca('friso', casca({ alturaDe: () => 0.035, baseDe: (u) => levanta(u) + 0.07 + sola(u) * 0.3, folga: 1.062, corte: 0.6 }), tinta(cor.detalhe, { metalness: 0.5, roughness: 0.3 }), [0, -0.6, 0], 1.5);
  peca('cabedal', casca({ alturaDe: corpo, baseDe: topo, fatias: 60, corte: boca }), tinta(cor.cabedal), [0, 0.7, 0], 2);
  // painel lateral em cunha: sobe do meio do pé até o calcanhar (desenho próprio, não é marca de ninguém)
  peca('faixa', painel(0.16, 0.66, (u) => mistura(0.62, 0.12, suave(0.16, 0.66, u))), tinta(cor.painel), [0, 0.5, 1.3], 3);
  peca('biqueira', painel(0.76, 1, 1, 1.03), tinta(cor.painel), [1.2, 0.5, 0], 4);
  peca('calcanhar', painel(0, 0.17, 0.7, 1.045), tinta(cor.detalhe, { metalness: 0.45, roughness: 0.3 }), [-1.2, 0.5, 0], 5);
  // faixa dos ilhoses e lingueta: cascas mais estreitas e um pouco mais altas, que só aparecem por cima
  peca('ilhoses', casca({ de: 0.42, ate: 0.74, fatias: 20, alturaDe: (u) => corpo(u) * 1.035, baseDe: topo, folga: 0.56 }), tinta(cor.painel, { roughness: 0.6 }), [0.2, 1.2, 0], 6);
  peca('lingueta', casca({ de: 0.31, ate: 0.47, fatias: 12, alturaDe: (u) => corpo(u) * 1.03 + mistura(0.13, 0.02, suave(0.31, 0.47, u)), baseDe: topo, folga: 0.44 }), tinta(cor.linguetaCor ?? cor.painel), [0.3, 1.8, 0], 7);

  // boca do tênis: colarinho acolchoado e o forro escuro por dentro
  const uBoca = 0.19, xBoca = (uBoca - 0.5) * C, yBoca = topo(uBoca) + corpo(uBoca) * 0.78 ** 0.72;
  const anel = new THREE.TorusGeometry(0.3, 0.07, 14, 40); anel.rotateX(Math.PI / 2); anel.scale(1.5, 1, 0.86);
  peca('colar', anel, tinta(cor.detalhe, { roughness: 0.7 }), [0, 1.5, 0], 6).position.set(xBoca, yBoca, 0);
  const fundo = new THREE.CylinderGeometry(0.3, 0.3, 0.03, 40); fundo.scale(1.5, 1, 0.86);
  peca('forro', fundo, tinta(cor.forro, { roughness: 1, metalness: 0 }), [0, 1.5, 0], 6).position.set(xBoca, yBoca + 0.005, 0);
  // cadarço: fios roliços atravessando a faixa dos ilhoses, cada um deitado na inclinação do peito do pé
  for (let i = 0; i < 6; i++) {
    const u = 0.46 + i * 0.05, d = 0.01, sobe = (v) => topo(v) + corpo(v) * 1.035;
    const fio = new THREE.CapsuleGeometry(0.026, largura(u) * 0.36, 4, 10); fio.rotateX(Math.PI / 2);
    const m = peca('cadarco', fio, tinta(cor.cadarco, { roughness: 0.9, metalness: 0 }), [0, 2 + i * 0.12, 0], 8 + i * 0.3);
    m.position.set((u - 0.5) * C, sobe(u) + 0.006, 0); m.rotation.z = Math.atan2(sobe(u + d) - sobe(u - d), 2 * d * C);
  }
  if (f.garras) for (let i = 0; i < 9; i++) {
    const u = 0.08 + i * 0.105, g = new THREE.BoxGeometry(0.13, 0.09, largura(u) * 0.9);
    peca('garra', g, tinta(cor.sola, { roughness: 1 }), [0, -1.9, 0], 0).position.set((u - 0.5) * C, levanta(u) - 0.03, 0);
  }
  grupo.children.forEach((m) => { m.userData.casa = m.position.clone(); });
  // centraliza o modelo na altura, para o cano alto não sair do quadro
  grupo.userData.centro = (0.07 + f.salto * 0.55 + f.colar) / 2;
  return grupo;
}

/* ----- desenhista único ----- */
let R = null, cena, cam, falhou = false;
const modelos = new Map(), fotos = new Map();
function palco() {
  if (R || falhou) return R;
  // sonda antes, para não encher o console de erro em aparelho sem WebGL
  const sonda = document.createElement('canvas'), gl = sonda.getContext('webgl2') || sonda.getContext('webgl');
  if (!gl) { falhou = true; return null; }
  gl.getExtension('WEBGL_lose_context')?.loseContext();
  try {
    R = new THREE.WebGLRenderer({ antialias: true, alpha: true, preserveDrawingBuffer: true });
  } catch { falhou = true; return null; }
  R.setClearColor(0x000000, 0);
  cena = new THREE.Scene();
  cam = new THREE.PerspectiveCamera(26, 2, 0.1, 40); cam.position.set(0, 0.25, 5.3); cam.lookAt(0, 0, 0);
  cena.add(new THREE.HemisphereLight(0xffffff, 0x3a3a3a, 1.9));
  const chave = new THREE.DirectionalLight(0xffffff, 2.4); chave.position.set(3, 5, 6); cena.add(chave);
  const contra = new THREE.DirectionalLight(0xeaff00, 2.2); contra.position.set(-5, 2, -4); cena.add(contra);   // contraluz ácida
  const fria = new THREE.DirectionalLight(0x7aa2ff, 0.9); fria.position.set(4, -2, -3); cena.add(fria);
  // reflexos: um estúdio pintado em código (teto de luz, uma faixa ácida e uma fria), sem arquivo de imagem
  const estudio = new THREE.Scene(), luz = (cor, w, h, x, y, z) => { const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({ color: cor, side: THREE.DoubleSide })); m.position.set(x, y, z); m.lookAt(0, 0, 0); estudio.add(m); };
  estudio.background = new THREE.Color(0x050505);
  luz(0xffffff, 8, 4, 0, 6, 1); luz(0xeaff00, 2, 6, -6, 1, -2); luz(0x9db8ff, 2, 5, 6, 0, 2); luz(0x444444, 10, 3, 0, 1, 7);
  const pm = new THREE.PMREMGenerator(R); cena.environment = pm.fromScene(estudio, 0.03).texture; cena.environmentIntensity = 1.15; pm.dispose();
  return R;
}
export const tem3d = () => !!palco();
function modeloDe(produto) {
  if (!modelos.has(produto.id)) modelos.set(produto.id, montarTenis(produto));
  return modelos.get(produto.id);
}
function montar(grupo, t) {
  for (const m of grupo.children) {
    const k = Math.min(1, Math.max(0, (t - 0.04 * m.userData.ordem) / 0.3)), e = 1 - (1 - k) ** 3;
    m.position.copy(m.userData.casa).addScaledVector(m.userData.fuga, 1 - e);
    m.material.opacity = Math.min(1, e * 1.6);
  }
}
function desenhar(grupo, larg, alt, giro, tombo) {
  grupo.rotation.set(tombo, giro, 0); grupo.position.y = -grupo.userData.centro;
  cena.add(grupo);
  R.setSize(larg, alt, false); cam.aspect = larg / alt; cam.updateProjectionMatrix();
  R.render(cena, cam);
  cena.remove(grupo);
}

/** Miniatura: a foto é tirada uma vez por modelo, e só quando o cartão chega perto da tela. */
const naFila = 'IntersectionObserver' in globalThis ? new IntersectionObserver((itens) => {
  for (const item of itens) if (item.isIntersecting) { naFila.unobserve(item.target); item.target.revelar(); }
}, { rootMargin: '300px' }) : null;
export function fotoDoTenis(produto) {
  const tela = document.createElement('canvas'); tela.width = 640; tela.height = 320; tela.className = 'tenis tenis--foto';
  tela.setAttribute('aria-hidden', 'true');
  tela.revelar = () => {
    if (!fotos.has(produto.id)) {
      const g = modeloDe(produto); montar(g, 2);
      desenhar(g, 640, 320, -0.62, 0.16);
      const guarda = document.createElement('canvas'); guarda.width = 640; guarda.height = 320;
      guarda.getContext('2d').drawImage(R.domElement, 0, 0); fotos.set(produto.id, guarda);
    }
    tela.getContext('2d').drawImage(fotos.get(produto.id), 0, 0);
  };
  if (fotos.has(produto.id) || !naFila) tela.revelar(); else naFila.observe(tela);
  return tela;
}

/** Tênis vivo: gira sozinho, segue o ponteiro, deixa arrastar e se monta com `tela.montar(0 a 1)`. */
export function tenisVivo(produto, descricao) {
  const tela = document.createElement('canvas'); tela.className = 'tenis tenis--vivo'; tela.width = 960; tela.height = 480;
  tela.setAttribute('role', 'img'); tela.setAttribute('aria-label', descricao); tela.dataset.montado = '1';
  const pincel = tela.getContext('2d'), g = modeloDe(produto);
  const calmo = matchMedia('(prefers-reduced-motion: reduce)').matches;
  let giro = -0.62, tombo = 0.16, vel = 0, arrasto = null, alvoX = 0, alvoY = 0, progresso = 1, visto = false, antes = 0, escala = 1, folga = 0;
  tela.montar = (t) => { progresso = t; tela.dataset.montado = t >= 0.999 ? '1' : '0'; if (calmo) quadro(0); };
  tela.addEventListener('pointerdown', (e) => { arrasto = { x: e.clientX, giro }; tela.setPointerCapture(e.pointerId); });
  tela.addEventListener('pointermove', (e) => {
    const r = tela.getBoundingClientRect(); alvoX = (e.clientX - r.left) / r.width - 0.5; alvoY = (e.clientY - r.top) / r.height - 0.5;
    if (arrasto) { const novo = arrasto.giro + (e.clientX - arrasto.x) * 0.012; vel = novo - giro; giro = novo; }
  });
  const solta = () => { arrasto = null; }; tela.addEventListener('pointerup', solta); tela.addEventListener('pointercancel', solta);
  tela.addEventListener('pointerleave', () => { alvoX = 0; alvoY = 0; });
  function quadro(t) {
    if (!tela.isConnected) { if (visto) return; requestAnimationFrame(quadro); return; }
    visto = true;
    const ini = performance.now();
    if (ini < folga && !calmo) { requestAnimationFrame(quadro); return; }
    const dt = Math.min(0.05, (t - antes) / 1000 || 0); antes = t;
    if (!arrasto && !calmo) { giro += vel + dt * 0.35; vel *= 0.94; }
    const r = tela.getBoundingClientRect(), dpr = Math.min(devicePixelRatio || 1, 2);
    // fora da tela (ou em aba escondida) não se desenha nada: poupa bateria no celular
    if (!calmo && (r.bottom < 0 || r.top > innerHeight || r.width < 2)) { requestAnimationFrame(quadro); return; }
    const larg = Math.max(2, Math.round(r.width * dpr * escala)), alt = Math.max(2, Math.round(r.width * 0.5 * dpr * escala));
    if (tela.width !== larg) { tela.width = larg; tela.height = alt; }
    tombo += ((0.16 + alvoY * 0.5) - tombo) * 0.08;
    montar(g, progresso * 1.6);
    desenhar(g, larg, alt, giro + alvoX * 0.5, tombo);
    pincel.clearRect(0, 0, larg, alt); pincel.drawImage(R.domElement, 0, 0);
    // aparelho sem placa de vídeo desenha devagar: a imagem diminui e os quadros se espaçam, para a página não travar
    const gasto = performance.now() - ini;
    if (gasto > 24 && escala > 0.4) escala *= 0.8;
    folga = gasto > 40 ? performance.now() + gasto * 2 : 0;
    if (!calmo) requestAnimationFrame(quadro);
  }
  requestAnimationFrame(quadro);
  return tela;
}
