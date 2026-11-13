/*
 * Efeitos da identidade "subsolo". Três vêm de construções do GetLayers:
 *  - a mira (ferramenta Custom Cursors, predefinição Crosshair HUD);
 *  - as palavras que saltam nos títulos (ferramenta Text Animations, predefinição Pop Words,
 *    refeita sem biblioteca com a mesma mola: tensão 340, atrito 14, 55 ms entre palavras);
 *  - a grade que acende sob o ponteiro (estilo Artefakt).
 */
const calmo = matchMedia('(prefers-reduced-motion: reduce)');
const fino = matchMedia('(hover: hover) and (pointer: fine)');

/* Grade: o CSS desenha, aqui só se diz onde está o ponteiro. */
addEventListener('pointermove', (e) => {
  document.documentElement.style.setProperty('--mx', `${e.clientX}px`);
  document.documentElement.style.setProperty('--my', `${e.clientY}px`);
}, { passive: true });

/* Mira: linhas de ponta a ponta na posição exata do ponteiro, uma caixa no centro e as coordenadas.
   A seta do sistema continua visível; a mira é só uma camada por cima, que não recebe cliques. */
let mira = null;
function ligarMira() {
  if (mira || calmo.matches || !fino.matches) return;
  const tela = document.createElement('canvas');
  tela.className = 'mira'; tela.setAttribute('aria-hidden', 'true'); document.body.append(tela);
  const p = tela.getContext('2d');
  let x = -100, y = -100, sobre = false, raf = 0, sujo = true;
  const medir = () => { const d = Math.min(devicePixelRatio || 1, 2); tela.width = innerWidth * d; tela.height = innerHeight * d; p.setTransform(d, 0, 0, d, 0, 0); sujo = true; };
  const mover = (e) => { x = e.clientX; y = e.clientY; sobre = !!e.target.closest?.('a, button, input'); sujo = true; };
  const sair = () => { x = -100; y = -100; sujo = true; };
  const quadro = () => {
    raf = requestAnimationFrame(quadro);
    if (!sujo) return; sujo = false;
    p.clearRect(0, 0, innerWidth, innerHeight);
    if (x < 0) return;
    const caixa = sobre ? 26 : 16;
    p.strokeStyle = 'rgba(255,255,255,0.3)'; p.lineWidth = 1; p.beginPath();
    p.moveTo(0, y + 0.5); p.lineTo(x - caixa, y + 0.5); p.moveTo(x + caixa, y + 0.5); p.lineTo(innerWidth, y + 0.5);
    p.moveTo(x + 0.5, 0); p.lineTo(x + 0.5, y - caixa); p.moveTo(x + 0.5, y + caixa); p.lineTo(x + 0.5, innerHeight); p.stroke();
    p.strokeStyle = sobre ? '#eaff00' : '#ffffff'; p.strokeRect(x - caixa / 2 + 0.5, y - caixa / 2 + 0.5, caixa, caixa);
    p.fillStyle = '#ffffff'; p.font = '600 11px Archivo, sans-serif';
    p.fillText(`${String(Math.round(x)).padStart(4, '0')} ${String(Math.round(y)).padStart(4, '0')}`, Math.min(x + 14, innerWidth - 74), Math.max(y - 14, 12));
  };
  addEventListener('pointermove', mover, { passive: true }); addEventListener('resize', medir);
  document.documentElement.addEventListener('pointerleave', sair);
  medir(); raf = requestAnimationFrame(quadro);
  mira = () => { cancelAnimationFrame(raf); removeEventListener('pointermove', mover); removeEventListener('resize', medir); document.documentElement.removeEventListener('pointerleave', sair); tela.remove(); mira = null; };
}
const conferirMira = () => { if (calmo.matches || !fino.matches) mira?.(); else ligarMira(); };
calmo.addEventListener('change', conferirMira); fino.addEventListener('change', conferirMira); conferirMira();

/* Palavras que saltam: cada palavra do título vai de pequena e invisível ao lugar, numa mola. */
function saltar(titulo) {
  if (titulo.dataset.salto || titulo.children.length || !titulo.textContent.trim()) return;
  titulo.dataset.salto = '1';
  const texto = titulo.textContent;
  titulo.setAttribute('aria-label', texto);
  const palavras = texto.trim().split(/\s+/).map((t) => { const s = document.createElement('span'); s.className = 'salto'; s.setAttribute('aria-hidden', 'true'); s.textContent = t; return s; });
  titulo.replaceChildren(...palavras.flatMap((s, i) => (i ? [' ', s] : [s])));
  if (calmo.matches) return;   // quem pede menos movimento vê as plaquinhas já no lugar
  palavras.forEach((s, i) => {
    let pos = 0.4, vel = 0, antes = 0;
    s.style.opacity = '0'; s.style.transform = 'scale(0.4)';
    const passo = (t) => {
      if (!antes) antes = t;
      let dt = Math.min(0.032, (t - antes) / 1000); antes = t;
      for (; dt > 0; dt -= 0.004) { const h = Math.min(0.004, dt); vel += (340 * (1 - pos) - 14 * vel) * h; pos += vel * h; }
      s.style.transform = `scale(${pos.toFixed(4)})`; s.style.opacity = String(Math.min(1, Math.max(0, (pos - 0.4) / 0.6 * 1.6)));
      if (Math.abs(1 - pos) > 0.001 || Math.abs(vel) > 0.01) requestAnimationFrame(passo); else { s.style.transform = ''; s.style.opacity = ''; }
    };
    setTimeout(() => requestAnimationFrame(passo), i * 55);
  });
}
const principal = document.getElementById('principal');
const varrer = () => principal.querySelectorAll('h1, h2').forEach(saltar);
new MutationObserver(varrer).observe(principal, { childList: true, subtree: true }); varrer();
