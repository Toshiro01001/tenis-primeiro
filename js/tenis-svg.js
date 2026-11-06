/*
 * Ilustrações originais dos tênis, desenhadas à mão em SVG.
 *
 * Cada silhueta é uma lista de camadas (de trás para a frente). Cada camada diz
 * qual cor da paleta do produto usar. Assim, 5 desenhos viram 14 modelos: basta
 * trocar a paleta. Numa loja real, esta parte dá lugar às fotos dos produtos.
 */

const SVG_NS = 'http://www.w3.org/2000/svg';
const TINTA = '#060606';

/* Camadas: [cor, caminho, opções]. "cor" é uma chave da paleta ou uma cor literal. */
const SILHUETAS = {
  /* Cano baixo de quadra: linhas simples, biqueira costurada. */
  quadra: {
    camadas: [
      ['forro', 'M112 112 C136 136 176 142 214 118 L238 104 L256 150 L120 168 Z'],
      ['linguetaCor', 'M214 118 C226 92 250 76 276 80 C290 82 296 94 290 106 L330 150 L250 170 Z'],
      ['cabedal', 'M70 250 C60 208 62 150 80 110 C86 98 102 96 112 106 C136 132 176 138 212 116 L246 96 C254 92 262 94 268 100 L388 170 C420 182 470 176 520 184 C572 194 606 222 604 256 Z'],
      ['painel', 'M70 250 C62 216 62 176 72 140 C96 150 128 186 138 250 Z'],
      ['painel', 'M446 178 C480 176 500 180 520 184 C572 194 606 222 604 256 L470 256 C470 228 462 200 446 178 Z'],
      ['detalhe', 'M196 256 C206 214 240 182 292 168 L332 200 C300 212 276 232 266 256 Z'],
      ['painel', 'M212 116 L246 96 C254 92 262 94 268 100 L388 170 C396 176 402 180 410 184 L376 212 L232 132 Z'],
      ['entressola', 'M56 246 L608 250 C618 266 610 284 584 286 L88 286 C60 286 50 268 56 246 Z'],
      ['sola', 'M60 276 C64 284 74 286 88 286 L584 286 C596 286 604 282 609 276 C610 288 600 296 582 296 L86 296 C70 296 60 288 60 276 Z'],
    ],
    costuras: [
      'M454 190 C472 208 482 232 482 252',
      'M84 150 C106 164 132 200 146 248',
      'M210 250 C220 216 250 192 292 180',
    ],
    frisos: ['M62 262 L606 266'],
    cadarco: [[276, 118, 306, 96], [298, 132, 328, 110], [320, 145, 350, 124], [342, 158, 372, 137], [364, 171, 394, 150]],
    marca: { x: 262, y: 216, escala: 1 },
  },

  /* Cano alto de basquete: gola acolchoada e tira no tornozelo. */
  cano: {
    camadas: [
      ['forro', 'M112 58 C140 74 180 76 214 58 L236 96 L128 120 Z'],
      ['linguetaCor', 'M214 58 C224 32 250 22 276 28 C290 32 294 44 288 56 L332 142 L240 150 Z'],
      ['cabedal', 'M72 250 C62 200 70 120 84 62 C88 48 102 46 112 54 C140 74 178 74 212 56 L250 40 C258 36 266 40 268 48 L384 168 C416 182 474 176 522 184 C574 194 608 222 606 256 Z'],
      ['painel', 'M72 250 C64 208 66 160 74 118 C104 126 148 176 158 250 Z'],
      ['painel', 'M450 178 C484 176 504 180 522 184 C574 194 608 222 606 256 L474 256 C474 228 466 202 450 178 Z'],
      ['detalhe', 'M84 62 C88 48 102 46 112 54 C140 74 178 74 212 56 L232 48 L252 96 C208 118 134 122 76 100 Z'],
      ['painel', 'M250 40 C258 36 266 40 268 48 L384 168 C392 174 400 178 408 182 L372 214 L238 76 Z'],
      ['detalhe', 'M216 256 C228 216 260 192 306 180 L344 208 C314 218 292 234 284 256 Z'],
      ['entressola', 'M56 244 L610 250 C620 266 612 286 586 288 L90 288 C60 288 50 266 56 244 Z'],
      ['sola', 'M60 278 C64 286 76 288 90 288 L586 288 C598 288 606 284 611 278 C612 290 602 298 584 298 L88 298 C70 298 60 290 60 278 Z'],
    ],
    costuras: [
      'M458 190 C476 208 486 232 486 252',
      'M84 130 C112 142 152 190 166 248',
      'M80 88 C136 108 204 104 246 84',
    ],
    frisos: ['M62 264 L608 268'],
    cadarco: [[272, 66, 304, 46], [288, 90, 320, 70], [306, 112, 338, 92], [324, 134, 356, 114], [344, 154, 376, 134], [364, 172, 396, 152]],
    marca: { x: 226, y: 150, escala: 1.15 },
  },

  /* Corrida: entressola alta e curva, calcanhar em cunha, malha no peito do pé. */
  corrida: {
    camadas: [
      ['forro', 'M118 112 C142 132 178 134 212 112 L236 98 L250 150 L128 166 Z'],
      ['linguetaCor', 'M210 112 C224 88 248 76 270 82 C284 86 288 96 282 108 L330 150 L250 170 Z'],
      ['cabedal', 'M84 226 C72 188 74 150 90 106 C96 94 110 92 120 102 C144 128 178 130 210 110 L244 92 C252 88 260 90 266 96 L392 170 C430 186 490 176 536 188 C580 198 606 216 610 240 L560 236 Z'],
      ['detalhe', 'M84 226 C76 196 76 168 84 136 C110 142 136 180 142 232 Z'],
      ['painel', 'M170 232 C208 176 262 150 306 142 L352 170 C314 182 276 204 248 236 Z'],
      ['painel', 'M496 180 C512 182 524 184 536 188 C580 198 606 216 610 240 L520 236 C522 216 514 196 496 180 Z'],
      ['entressola', 'M62 226 C118 240 300 236 400 240 C470 242 560 230 612 232 C626 240 618 262 596 270 C540 290 470 292 400 288 L110 290 C70 290 46 256 62 226 Z'],
      ['detalhe', 'M88 258 C150 268 250 264 330 268 L320 289 L110 290 C98 290 88 276 88 258 Z'],
      ['sola', 'M78 280 C84 286 96 290 110 290 L400 288 C470 292 540 290 596 270 C606 276 600 286 586 290 C530 304 470 304 400 300 L108 302 C90 302 78 292 78 280 Z'],
    ],
    costuras: [
      'M180 226 C214 182 262 160 304 152',
      'M504 190 C520 202 530 218 530 232',
    ],
    frisos: ['M100 246 C180 252 300 250 400 254 C470 256 540 248 600 246'],
    cadarco: [[272, 112, 302, 92], [294, 126, 324, 106], [316, 140, 346, 120], [338, 154, 368, 134], [360, 168, 390, 148]],
    marca: { x: 410, y: 214, escala: 0.9 },
  },

  /* Skate: sola vulcanizada reta, remendo lateral de camurça e biqueira de borracha. */
  skate: {
    camadas: [
      ['forro', 'M104 124 C130 146 170 150 206 130 L232 118 L250 160 L114 176 Z'],
      ['linguetaCor', 'M206 130 C218 106 240 94 264 98 C278 100 284 112 278 122 L330 170 L240 180 Z'],
      ['cabedal', 'M64 252 C58 214 58 168 72 126 C78 112 94 110 104 120 C130 144 170 146 204 128 L238 112 C246 108 254 110 260 116 L376 180 C410 198 470 192 522 202 C566 210 594 232 596 254 Z'],
      ['painel', 'M64 252 C60 222 60 188 68 158 C94 164 132 198 142 252 Z'],
      ['painel', 'M204 128 L238 112 C246 108 254 110 260 116 L376 180 C386 186 396 192 406 196 L368 226 L226 146 Z'],
      ['detalhe', 'M176 250 L196 192 C232 184 276 190 316 206 L296 250 Z'],
      ['entressola', 'M50 248 L606 248 L606 284 C606 290 602 292 596 292 L60 292 C54 292 50 290 50 284 Z'],
      ['painel', 'M452 196 C480 196 504 198 522 202 C566 210 598 230 602 248 L606 248 L606 292 L556 292 C562 258 516 214 452 196 Z'],
      ['sola', 'M50 278 L606 278 L606 288 C606 294 602 296 596 296 L60 296 C54 296 50 294 50 288 Z'],
    ],
    costuras: [
      'M78 168 C104 178 136 208 150 248',
      'M60 262 L600 262',
    ],
    frisos: [],
    cadarco: [[268, 128, 298, 108], [288, 141, 318, 121], [310, 154, 340, 134], [332, 167, 362, 147], [354, 179, 384, 159]],
    marca: { x: 248, y: 222, escala: 0.8 },
  },

  /* Trilha: cano médio, solado com cravos e reforço de borracha na ponta. */
  trilha: {
    camadas: [
      ['forro', 'M112 82 C142 100 180 100 214 84 L238 112 L126 140 Z'],
      ['linguetaCor', 'M214 84 C226 58 250 50 274 56 C288 60 292 72 286 84 L332 152 L244 164 Z'],
      ['cabedal', 'M74 240 C64 190 72 134 84 88 C88 74 102 72 112 80 C142 100 178 98 212 82 L250 66 C258 62 266 66 268 72 L384 172 C420 188 480 180 530 190 C576 200 606 224 604 244 Z'],
      ['painel', 'M74 240 C66 200 68 160 76 124 C108 132 158 176 170 240 Z'],
      ['detalhe', 'M240 240 C256 204 296 182 344 174 L380 198 C344 208 318 222 304 240 Z'],
      ['painel', 'M250 66 C258 62 266 66 268 72 L384 172 C394 178 402 182 412 186 L378 216 L234 94 Z'],
      ['painel', 'M470 184 C494 184 514 186 530 190 C576 200 606 224 604 244 L612 262 L480 260 C486 230 482 204 470 184 Z'],
      ['entressola', 'M60 236 C150 246 300 240 420 244 C490 246 560 240 610 240 C622 250 616 268 592 272 L92 272 C66 272 52 256 60 236 Z'],
      ['sola', 'M66 266 L92 272 L592 272 L612 262 C616 276 606 282 598 284 L590 298 L552 298 L544 286 L498 286 L490 298 L452 298 L444 286 L398 286 L390 298 L352 298 L344 286 L298 286 L290 298 L252 298 L244 286 L198 286 L190 298 L152 298 L144 286 L108 286 L100 298 L78 296 Z'],
    ],
    costuras: [
      'M84 136 C116 148 164 188 178 236',
      'M478 194 C492 210 498 234 492 254',
      'M250 236 C266 208 300 192 342 184',
    ],
    frisos: ['M70 254 L600 256'],
    cadarco: [[270, 88, 302, 68], [286, 108, 318, 88], [306, 126, 338, 106], [326, 144, 358, 124], [348, 160, 380, 140], [368, 176, 400, 156]],
    marca: { x: 218, y: 178, escala: 1.05 },
  },
};

/* Símbolos das marcas fictícias. Cada um é desenho próprio, centrado em (0, 0). */
const MARCAS = {
  /* Piúva: flor de ipê de cinco pétalas. */
  flor(cor) {
    const grupo = criar('g');
    for (let i = 0; i < 5; i += 1) {
      const angulo = (i * 72 - 90) * (Math.PI / 180);
      grupo.append(criar('circle', { cx: (Math.cos(angulo) * 13).toFixed(1), cy: (Math.sin(angulo) * 13).toFixed(1), r: 9.5, fill: cor }));
    }
    grupo.append(criar('circle', { cx: 0, cy: 0, r: 6, fill: TINTA }));
    return grupo;
  },
  /* Vazante: duas linhas d'água de comprimentos diferentes. */
  aguas(cor) {
    const grupo = criar('g', { stroke: cor, 'stroke-width': 8, 'stroke-linecap': 'round', fill: 'none' });
    grupo.append(criar('path', { d: 'M-26 -8 L26 -8' }), criar('path', { d: 'M-12 8 L26 8' }));
    return grupo;
  },
  /* Carandá: leque de palmeira, meio disco com recortes. */
  leque(cor) {
    const grupo = criar('g', { fill: cor });
    grupo.append(criar('path', { d: 'M-24 12 A24 24 0 0 1 24 12 Z' }));
    const cortes = criar('g', { stroke: TINTA, 'stroke-width': 3, 'stroke-linecap': 'round' });
    cortes.append(
      criar('path', { d: 'M0 10 L-14 -4' }),
      criar('path', { d: 'M0 10 L0 -10' }),
      criar('path', { d: 'M0 10 L14 -4' }),
    );
    grupo.append(cortes);
    return grupo;
  },
  /* Tabocal: gomo de taboca, cápsula com um nó. */
  gomo(cor) {
    const grupo = criar('g', { transform: 'rotate(24)' });
    grupo.append(
      criar('rect', { x: -9, y: -24, width: 18, height: 48, rx: 9, fill: cor }),
      criar('path', { d: 'M-9 0 L9 0', stroke: TINTA, 'stroke-width': 3.5 }),
    );
    return grupo;
  },
};

function criar(nome, atributos = {}) {
  const elemento = document.createElementNS(SVG_NS, nome);
  for (const [chave, valor] of Object.entries(atributos)) elemento.setAttribute(chave, String(valor));
  return elemento;
}

/**
 * Monta o desenho de um tênis.
 * @param {{silhueta: string, cores: object, marcaSimbolo: string}} modelo
 * @param {{descricao?: string}} opcoes descrição em texto para leitores de tela
 */
export function desenharTenis(modelo, { descricao } = {}) {
  const forma = SILHUETAS[modelo.silhueta];
  const cores = modelo.cores;
  const svg = criar('svg', { viewBox: '30 10 600 300', class: 'tenis', focusable: 'false' });
  if (descricao) {
    svg.setAttribute('role', 'img');
    svg.setAttribute('aria-label', descricao);
  } else {
    svg.setAttribute('aria-hidden', 'true');
  }

  const tracado = criar('g', { stroke: TINTA, 'stroke-width': 4, 'stroke-linejoin': 'round', 'stroke-linecap': 'round' });
  for (const [cor, d] of forma.camadas) tracado.append(criar('path', { d, fill: cores[cor] ?? cor }));
  svg.append(tracado);

  const linhas = criar('g', { fill: 'none', stroke: cores.costura ?? TINTA, 'stroke-width': 2, 'stroke-dasharray': '6 5', 'stroke-linecap': 'round' });
  for (const d of forma.costuras) linhas.append(criar('path', { d }));
  svg.append(linhas);

  for (const d of forma.frisos) {
    svg.append(criar('path', { d, fill: 'none', stroke: TINTA, 'stroke-width': 3, opacity: 0.35 }));
  }

  const cadarcos = criar('g', { 'stroke-linecap': 'round' });
  for (const [x1, y1, x2, y2] of forma.cadarco) {
    cadarcos.append(
      criar('line', { x1, y1, x2, y2, stroke: TINTA, 'stroke-width': 13 }),
      criar('line', { x1, y1, x2, y2, stroke: cores.cadarco, 'stroke-width': 7 }),
    );
  }
  svg.append(cadarcos);

  const { x, y, escala } = forma.marca;
  const simbolo = MARCAS[modelo.marcaSimbolo](cores.marca);
  const lugar = criar('g', { transform: `translate(${x} ${y}) scale(${escala})` });
  lugar.append(simbolo);
  svg.append(lugar);

  return svg;
}

/** Símbolo da marca sozinho, para usar na etiqueta da caixa. */
export function desenharMarca(simbolo, cor) {
  const svg = criar('svg', { viewBox: '-30 -30 60 60', class: 'marca-simbolo', 'aria-hidden': 'true', focusable: 'false' });
  svg.append(MARCAS[simbolo](cor));
  return svg;
}
