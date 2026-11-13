/*
 * Abertura da vitrine: o tênis se monta, peça por peça, conforme a pessoa rola a página,
 * e ao lado fica a escolha rápida (modelo, tamanho e "Adicionar ao carrinho").
 *
 * Não há vídeo nem sequência de imagens: é o mesmo desenho em SVG da loja, com cada camada
 * deslocada e devolvida ao lugar pelo próprio código. Por isso pesa quase nada no celular.
 * Quem pede menos movimento no aparelho vê o tênis já montado, sem a rolagem longa.
 */

import { MARCAS, PRODUTOS, TAMANHOS } from './dados.js';
import { avisar, el, formatarPreco } from './dom.js';
import { adicionarAoCarrinho, estoqueDe, quantidadeNoCarrinho } from './estado.js';
import { desenharMarca } from './tenis-svg.js';
import { tenisDoProduto } from './componentes.js';

const MODELOS = ['praca-88', 'correnteza-3', 'garrafao-alto', 'manobra-vulc'];
/* A abertura já começa com o solado e parte do cabedal no lugar: nunca aparece vazia. */
const INICIO = 0.3;
const calmo = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/* Devolve a função que posiciona as peças: 0 = tudo espalhado, 1 = tênis montado. */
function montavel(svg) {
  const camadas = [...svg.querySelector('g').children];
  const resto = [...svg.children].slice(1);
  const n = camadas.length;
  const peca = (elemento, dy, inicio) => ({ elemento, dy, inicio, opacidade: Number(elemento.getAttribute('opacity') || 1), posicao: elemento.getAttribute('transform') || '' });
  // Solado e entressola sobem de baixo; o resto desce de cima, um de cada vez; costuras, cadarço e marca por último.
  const pecas = camadas.map((c, i) => (i >= n - 2 ? peca(c, 90, (n - 1 - i) * 0.06) : peca(c, -(70 + i * 10), 0.12 + i * 0.07)));
  resto.forEach((r, i) => pecas.push(peca(r, -60, 0.12 + n * 0.07 + i * 0.05)));
  return (t) => {
    for (const p of pecas) {
      const k = Math.min(1, Math.max(0, (t - p.inicio) / 0.22));
      const e = 1 - (1 - k) ** 3;
      p.elemento.setAttribute('transform', `translate(0 ${(p.dy * (1 - e)).toFixed(1)}) ${p.posicao}`.trim());
      p.elemento.style.opacity = String(p.opacidade * e);
    }
  };
}

/* As etiquetas que aparecem durante a montagem usam a ficha do próprio modelo. */
function chamadas(produto) {
  const ficha = Object.fromEntries(produto.ficha);
  return [
    ['Solado', ficha.Solado ?? ficha.Entressola ?? 'Borracha'],
    ['Cabedal', ficha.Cabedal ?? 'Couro sintético'],
    ['Cadarço', produto.cores.cadarco === '#f3eee2' ? 'Creme' : 'Na cor do modelo'],
    ['Marca', MARCAS[produto.marca].nome],
  ];
}

export function abertura(abrirComoFunciona) {
  let atual = PRODUTOS.find((p) => p.id === MODELOS[0]);
  let tamanho = null;
  let progresso = calmo() ? 1 : INICIO;
  let posicionar = () => {};

  const bancada = el('div', { class: 'montagem__bancada' });
  const lista = el('ol', { class: 'montagem__chamadas', 'aria-hidden': 'true' });
  const barra = el('span', { class: 'montagem__barra' });
  const marca = el('p', { class: 'escolha-rapida__marca' });
  const nome = el('p', { class: 'escolha-rapida__nome' });
  const preco = el('p', { class: 'escolha-rapida__preco' });
  const modelos = el('div', { class: 'escolha-rapida__modelos', role: 'group', 'aria-label': 'Modelo' });
  const tamanhos = el('div', { class: 'escolha-rapida__tamanhos', role: 'group', 'aria-label': 'Tamanho' });
  const situacao = el('p', { class: 'escolha-rapida__situacao' });
  const detalhes = el('a', { class: 'botao-texto', href: '#/' }, 'Ver detalhes');
  const adicionar = el('button', { type: 'button', class: 'botao botao--dourado botao--largo', onClick: colocarNoCarrinho }, 'Adicionar ao carrinho');

  function desenharTenis() {
    const svg = tenisDoProduto(atual, `Tênis ${atual.nome}, ${atual.cor}`);
    bancada.replaceChildren(svg, lista, ...(svg.montar ? [el('p', { class: 'montagem__dica' }, 'Arraste o tênis para girar')] : []));
    posicionar = svg.montar ?? montavel(svg);   // o modelo 3D se monta sozinho; o desenho em SVG, peça por peça
    posicionar(progresso);
    lista.replaceChildren(...chamadas(atual).map(([rotulo, valor], i) => el('li', { 'data-em': String([0.22, 0.5, 0.78, 0.92][i]) }, el('b', {}, rotulo), ` ${valor}`)));
    ligarChamadas();
  }

  function ligarChamadas() {
    lista.querySelectorAll('li').forEach((li) => li.classList.toggle('ligada', progresso >= Number(li.dataset.em)));
    barra.style.setProperty('--progresso', progresso.toFixed(3));
  }

  function desenharEscolha() {
    const dadosMarca = MARCAS[atual.marca];
    marca.replaceChildren(desenharMarca(dadosMarca.simbolo, dadosMarca.icone), dadosMarca.nome);
    nome.textContent = atual.nome;
    preco.textContent = formatarPreco(atual.preco);
    detalhes.href = `#/produto/${atual.id}`;
    modelos.querySelectorAll('button').forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.id === atual.id)));
    const livres = TAMANHOS.filter((t) => estoqueDe(atual.id, t) - quantidadeNoCarrinho(atual.id, t) > 0);
    if (!livres.includes(tamanho)) tamanho = null;
    tamanhos.replaceChildren(...TAMANHOS.map((t) => el('button', {
      type: 'button',
      'aria-pressed': String(t === tamanho),
      disabled: !livres.includes(t),
      'aria-label': livres.includes(t) ? `Tamanho ${t}` : `Tamanho ${t}, sem estoque`,
      onClick: () => { tamanho = t; desenharEscolha(); },
    }, String(t))));
    situacao.textContent = livres.length ? (tamanho ? `Tamanho ${tamanho} escolhido.` : 'Escolha o tamanho.') : 'Este modelo está esgotado.';
    adicionar.disabled = !tamanho;
  }

  function colocarNoCarrinho() {
    if (!tamanho) return;
    const entrou = adicionarAoCarrinho(atual.id, tamanho, 1);
    if (entrou) avisar(`${atual.nome}, tamanho ${tamanho}: 1 par adicionado ao carrinho.`);
    else avisar(`Não há mais pares do ${atual.nome} no tamanho ${tamanho}.`);
    desenharEscolha();
  }

  modelos.append(...MODELOS.map((id) => {
    const p = PRODUTOS.find((x) => x.id === id);
    return el('button', {
      type: 'button',
      class: 'escolha-rapida__modelo',
      'data-id': id,
      'aria-label': `${p.nome}, ${p.cor}`,
      cssVars: { '--a': p.cores.cabedal, '--b': p.cores.painel },
      onClick: () => { atual = p; desenharTenis(); desenharEscolha(); },
    });
  }));

  const cartao = el('div', { class: 'escolha-rapida', role: 'region', 'aria-label': 'Escolha rápida' },
    marca, nome, preco,
    el('p', { class: 'escolha-rapida__rotulo' }, 'Modelo'), modelos,
    el('p', { class: 'escolha-rapida__rotulo' }, 'Tamanho'), tamanhos,
    situacao, adicionar, detalhes);
  // Em tela estreita a escolha rápida sai da parte fixa e fica logo abaixo da abertura, para não cobrir o tênis.
  const depois = el('div', { class: 'montagem__depois' });

  const secao = el('section', { class: `montagem${calmo() ? ' montagem--parada' : ''}`, 'aria-labelledby': 'titulo-loja' },
    el('div', { class: 'montagem__fixo' },
      el('div', { class: 'montagem__texto' },
        el('p', { class: 'selo-drop' }, 'Drop 01, só demonstração'),
        el('h1', { id: 'titulo-loja', class: 'montagem__titulo', tabindex: '-1' }, el('span', {}, 'Pinhoso’s'), el('span', { class: 'vazado' }, 'Kicks')),
        el('p', { class: 'montagem__lide' }, 'Loja de tênis de exemplo, com modelos 3D inventados e sem marca. Role a página e veja o tênis se montar. Escolha o modelo e o tamanho, monte o carrinho e vá até o fim da compra. Nenhum dinheiro muda de mão.'),
        el('p', { class: 'montagem__acoes' },
          el('button', { type: 'button', class: 'botao botao--dourado', onClick: () => document.getElementById('vitrine')?.scrollIntoView({ behavior: calmo() ? 'auto' : 'smooth' }) }, 'Ver a vitrine'),
          el('button', { type: 'button', class: 'botao botao--vidro', onClick: abrirComoFunciona }, 'Como isto funciona'))),
      bancada,
      cartao,
      el('p', { class: 'montagem__progresso', 'aria-hidden': 'true' }, 'Montagem', barra)));

  desenharTenis();
  desenharEscolha();

  const estreita = window.matchMedia('(max-width: 960px)');
  const colocarCartao = () => {
    if (estreita.matches) depois.append(cartao); else secao.querySelector('.montagem__fixo').append(cartao);
  };
  const aoMudarTela = () => {
    if (!secao.isConnected) { estreita.removeEventListener('change', aoMudarTela); return; }
    colocarCartao();
  };
  colocarCartao();
  estreita.addEventListener('change', aoMudarTela);

  if (!calmo()) {
    let pedido = false;
    const medir = () => {
      pedido = false;
      if (!secao.isConnected) { window.removeEventListener('scroll', aoRolar); window.removeEventListener('resize', aoRolar); return; }
      const caixa = secao.getBoundingClientRect();
      const percurso = caixa.height - window.innerHeight;
      progresso = percurso > 0 ? Math.min(1, INICIO + (1 - INICIO) * Math.max(0, -caixa.top / (percurso * 0.85))) : 1;
      posicionar(progresso);
      ligarChamadas();
    };
    function aoRolar() { if (!pedido) { pedido = true; requestAnimationFrame(medir); } }
    window.addEventListener('scroll', aoRolar, { passive: true });
    window.addEventListener('resize', aoRolar);
    requestAnimationFrame(medir);
  } else {
    ligarChamadas();
  }

  return el('div', { class: 'abertura-nova' },
    secao,
    depois,
    el('div', { class: 'letreiro', 'aria-hidden': 'true' },
      el('div', { class: 'letreiro__trilho' }, Array.from({ length: 8 }, () => el('span', {}, 'Drop 01 / Só demonstração / Nada à venda')))));
}
