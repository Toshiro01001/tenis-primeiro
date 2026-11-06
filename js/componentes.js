/* Peças de interface usadas em mais de uma tela. */

import { MARCAS, TAMANHOS, CATEGORIAS } from './dados.js';
import { el, formatarPreco } from './dom.js';
import { estoqueDe, estoqueTotal } from './estado.js';
import { desenharMarca, desenharTenis } from './tenis-svg.js';

export const nomeCategoria = (id) => CATEGORIAS.find((categoria) => categoria.id === id)?.nome ?? '';

/** Passa os dados da marca (cor e símbolo) para o desenho e para o CSS. */
export function tenisDoProduto(produto, descricao) {
  return desenharTenis({ ...produto, marcaSimbolo: MARCAS[produto.marca].simbolo }, { descricao });
}

export function coresDaCaixa(produto) {
  const marca = MARCAS[produto.marca];
  return { '--caixa': marca.caixa, '--tampa': marca.tampa, '--caixa-texto': marca.texto };
}

export function selo(preco, classeExtra = '') {
  return el('p', { class: `selo-preco ${classeExtra}`.trim() }, formatarPreco(preco));
}

function gradeDaCaixa(produto) {
  const disponiveis = TAMANHOS.filter((tamanho) => estoqueDe(produto.id, tamanho) > 0);
  const resumo = disponiveis.length ? `Tamanhos disponíveis: ${disponiveis.join(', ')}.` : 'Nenhum tamanho disponível.';
  return el(
    'div',
    { class: 'grade-caixa', role: 'img', 'aria-label': resumo },
    TAMANHOS.map((tamanho) => el('span', { class: estoqueDe(produto.id, tamanho) > 0 ? 'tem' : 'falta', 'aria-hidden': 'true' }, String(tamanho))),
  );
}

/** A peça central da vitrine: o tênis em cima da própria caixa, com a etiqueta na frente. */
export function cartaoProduto(produto, { titulo = 'h3' } = {}) {
  const esgotado = estoqueTotal(produto.id) === 0;
  const marca = MARCAS[produto.marca];
  return el(
    'article',
    { class: `caixa${esgotado ? ' caixa--esgotada' : ''}`, cssVars: coresDaCaixa(produto), 'data-produto': produto.id },
    el('div', { class: 'caixa__tenis' }, tenisDoProduto(produto)),
    el(
      'div',
      { class: 'caixa__corpo' },
      el(
        'div',
        { class: 'etiqueta' },
        el('p', { class: 'etiqueta__marca' }, desenharMarca(marca.simbolo, marca.icone), `${marca.nome}, ${nomeCategoria(produto.categoria).toLowerCase()}`),
        el(titulo, { class: 'etiqueta__nome' }, el('a', { href: `#/produto/${produto.id}`, class: 'caixa__link' }, produto.nome)),
        gradeDaCaixa(produto),
      ),
      esgotado ? el('p', { class: 'selo-preco selo-preco--esgotado' }, 'Esgotado') : selo(produto.preco),
    ),
  );
}

/** Botões de menos e mais, com limite. */
export function seletorQuantidade({ valor, minimo = 1, maximo, rotulo, aoMudar }) {
  const saida = el('output', { class: 'quantidade__valor', 'aria-live': 'polite' }, String(valor));
  let atual = valor;
  const menos = el('button', { type: 'button', class: 'quantidade__botao', 'aria-label': `Diminuir ${rotulo}`, onClick: () => mudar(atual - 1) }, '−');
  const mais = el('button', { type: 'button', class: 'quantidade__botao', 'aria-label': `Aumentar ${rotulo}`, onClick: () => mudar(atual + 1) }, '+');
  const raiz = el('div', { class: 'quantidade', role: 'group', 'aria-label': rotulo }, menos, saida, mais);
  let teto = maximo;

  function ajustarBotoes() {
    menos.disabled = atual <= minimo;
    mais.disabled = atual >= teto;
  }

  function mudar(novo) {
    const limitado = Math.max(minimo, Math.min(novo, teto));
    if (limitado === atual) return;
    atual = limitado;
    saida.textContent = String(atual);
    ajustarBotoes();
    aoMudar?.(atual);
  }

  ajustarBotoes();
  raiz.definirMaximo = (novoTeto) => {
    teto = Math.max(novoTeto, minimo);
    if (atual > teto) mudar(teto);
    ajustarBotoes();
  };
  raiz.lerValor = () => atual;
  return raiz;
}

/** Linhas de subtotal, desconto, frete e total. */
export function resumoDeValores({ subtotal, desconto, frete, total }, { mostrarFrete = false, rotuloTotal = 'Total' } = {}) {
  return el(
    'dl',
    { class: 'valores' },
    el('div', {}, el('dt', {}, 'Produtos'), el('dd', {}, formatarPreco(subtotal))),
    desconto > 0 && el('div', { class: 'valores__desconto' }, el('dt', {}, 'Desconto do cupom'), el('dd', {}, `-${formatarPreco(desconto)}`)),
    mostrarFrete && el('div', {}, el('dt', {}, 'Entrega'), el('dd', {}, frete === 0 ? 'Sem custo' : formatarPreco(frete))),
    el('div', { class: 'valores__total' }, el('dt', {}, rotuloTotal), el('dd', {}, formatarPreco(total))),
  );
}

/** Barras de código só decorativas, calculadas a partir do texto recebido. */
export function codigoDeBarras(texto) {
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('viewBox', '0 0 200 40');
  svg.setAttribute('preserveAspectRatio', 'none');
  svg.setAttribute('class', 'barras');
  svg.setAttribute('aria-hidden', 'true');
  let x = 0;
  let semente = [...texto].reduce((soma, letra) => soma * 31 + letra.charCodeAt(0), 7) >>> 0;
  while (x < 200) {
    semente = (semente * 1103515245 + 12345) >>> 0;
    const largura = 1 + ((semente >>> 16) % 4);
    const barra = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
    barra.setAttribute('x', x);
    barra.setAttribute('y', 0);
    barra.setAttribute('width', largura);
    barra.setAttribute('height', 40);
    svg.append(barra);
    x += largura + 1 + ((semente >>> 20) % 3);
  }
  return svg;
}
