/* Vitrine: chamada de abertura, busca, filtros, ordenação e a parede de caixas. */

import { cartaoProduto, tenisDoProduto, coresDaCaixa } from '../componentes.js';
import { CATEGORIAS, MARCAS, PRODUTOS, TAMANHOS } from '../dados.js';
import { el, formatarPreco, normalizar, plural } from '../dom.js';
import { estoqueDe, estoqueTotal } from '../estado.js';

const PRECOS = PRODUTOS.map((produto) => produto.preco / 100);
const PRECO_MINIMO = Math.floor(Math.min(...PRECOS) / 10) * 10;
const PRECO_MAXIMO = Math.ceil(Math.max(...PRECOS) / 10) * 10;
const PASSO_PRECO = 10;

const ORDENACOES = {
  destaques: { nome: 'Destaques', comparar: null },
  'menor-preco': { nome: 'Menor preço', comparar: (a, b) => a.preco - b.preco },
  'maior-preco': { nome: 'Maior preço', comparar: (a, b) => b.preco - a.preco },
  nome: { nome: 'Nome, de A a Z', comparar: (a, b) => a.nome.localeCompare(b.nome, 'pt-BR') },
};

const filtrosVazios = () => ({
  busca: '',
  categorias: new Set(),
  marcas: new Set(),
  tamanhos: new Set(),
  precoMin: PRECO_MINIMO,
  precoMax: PRECO_MAXIMO,
  ordem: 'destaques',
});

/** Lê os filtros do endereço. Assim, uma busca filtrada pode ser enviada por link. */
function lerDoEndereco(parametros) {
  const lista = (nome) => (parametros.get(nome) ?? '').split(',').filter(Boolean);
  const filtros = filtrosVazios();
  filtros.busca = parametros.get('busca') ?? '';
  filtros.categorias = new Set(lista('categoria').filter((id) => CATEGORIAS.some((c) => c.id === id)));
  filtros.marcas = new Set(lista('marca').filter((id) => MARCAS[id]));
  filtros.tamanhos = new Set(lista('tamanho').map(Number).filter((t) => TAMANHOS.includes(t)));
  const minimo = Number(parametros.get('min'));
  const maximo = Number(parametros.get('max'));
  if (minimo >= PRECO_MINIMO && minimo <= PRECO_MAXIMO) filtros.precoMin = minimo;
  if (maximo >= PRECO_MINIMO && maximo <= PRECO_MAXIMO) filtros.precoMax = maximo;
  if (filtros.precoMin > filtros.precoMax) [filtros.precoMin, filtros.precoMax] = [PRECO_MINIMO, PRECO_MAXIMO];
  if (ORDENACOES[parametros.get('ordem')]) filtros.ordem = parametros.get('ordem');
  return filtros;
}

function escreverNoEndereco(filtros) {
  const parametros = new URLSearchParams();
  if (filtros.busca) parametros.set('busca', filtros.busca);
  if (filtros.categorias.size) parametros.set('categoria', [...filtros.categorias].join(','));
  if (filtros.marcas.size) parametros.set('marca', [...filtros.marcas].join(','));
  if (filtros.tamanhos.size) parametros.set('tamanho', [...filtros.tamanhos].join(','));
  if (filtros.precoMin !== PRECO_MINIMO) parametros.set('min', filtros.precoMin);
  if (filtros.precoMax !== PRECO_MAXIMO) parametros.set('max', filtros.precoMax);
  if (filtros.ordem !== 'destaques') parametros.set('ordem', filtros.ordem);
  const texto = parametros.toString();
  /* replaceState não dispara o roteador: a tela não é refeita a cada tecla. */
  history.replaceState(null, '', texto ? `#/?${texto}` : '#/');
}

function filtrarProdutos(filtros) {
  const termos = normalizar(filtros.busca).split(/\s+/).filter(Boolean);
  const resultado = PRODUTOS.filter((produto) => {
    const texto = normalizar(`${produto.nome} ${MARCAS[produto.marca].nome} ${produto.categoria} ${produto.cor}`);
    if (!termos.every((termo) => texto.includes(termo))) return false;
    if (filtros.categorias.size && !filtros.categorias.has(produto.categoria)) return false;
    if (filtros.marcas.size && !filtros.marcas.has(produto.marca)) return false;
    if (filtros.tamanhos.size && ![...filtros.tamanhos].some((t) => estoqueDe(produto.id, t) > 0)) return false;
    const preco = produto.preco / 100;
    return preco >= filtros.precoMin && preco <= filtros.precoMax;
  });
  const { comparar } = ORDENACOES[filtros.ordem];
  if (comparar) resultado.sort(comparar);
  /* Esgotado sempre vai para o fim, em qualquer ordem. */
  return resultado.sort((a, b) => Number(estoqueTotal(a.id) === 0) - Number(estoqueTotal(b.id) === 0));
}

const contarFiltros = (f) => f.categorias.size + f.marcas.size + f.tamanhos.size
  + (f.precoMin !== PRECO_MINIMO || f.precoMax !== PRECO_MAXIMO ? 1 : 0);

function abertura(abrirComoFunciona) {
  const destaque = PRODUTOS[0];
  return el(
    'section',
    { class: 'abertura', 'aria-labelledby': 'titulo-loja' },
    el('div', { class: 'abertura__miolo' },
      el('h1', { id: 'titulo-loja', class: 'abertura__titulo', tabindex: '-1' },
        el('span', {}, 'Pinhoso’s '), el('span', {}, 'Kicks')),
      el('div', { class: 'abertura__tenis', cssVars: coresDaCaixa(destaque) }, tenisDoProduto(destaque)),
      el('div', { class: 'abertura__texto' },
        el('p', {}, 'Procure pelo seu número, monte o carrinho e vá até o fim da compra. É um teste: nenhum dinheiro muda de mão.'),
        el('p', { class: 'abertura__acoes' },
          el('a', { class: 'botao botao--dourado', href: `#/produto/${destaque.id}` }, `Ver o ${destaque.nome}, ${formatarPreco(destaque.preco)}`),
          el('button', { type: 'button', class: 'botao-texto botao-texto--claro', onClick: abrirComoFunciona }, 'Como isto funciona'))),
    ),
    el('div', { class: 'letreiro', 'aria-hidden': 'true' },
      el('div', { class: 'letreiro__trilho' }, Array.from({ length: 8 }, () => el('span', {}, 'Drop 01 / Só demonstração / Nada à venda')))),
  );
}

function grupoDeOpcoes(legenda, classe, opcoes, selecionados, aoMudar) {
  return el(
    'fieldset',
    { class: 'filtro' },
    el('legend', {}, legenda),
    el('div', { class: classe },
      opcoes.map(({ valor, texto, cor }) => el(
        'label',
        { class: 'opcao' },
        el('input', {
          type: 'checkbox',
          value: String(valor),
          checked: selecionados.has(valor),
          onChange: (evento) => {
            if (evento.target.checked) selecionados.add(valor);
            else selecionados.delete(valor);
            aoMudar();
          },
        }),
        el('span', { class: 'opcao__rotulo' }, cor && el('span', { class: 'opcao__cor', cssVars: { '--cor': cor } }), texto),
      ))),
  );
}

function faixaDePreco(filtros, aoMudar) {
  const textoMin = el('output', {}, `R$ ${filtros.precoMin}`);
  const textoMax = el('output', {}, `R$ ${filtros.precoMax}`);
  const trilho = el('div', { class: 'faixa__trilho' });

  const pintar = () => {
    const total = PRECO_MAXIMO - PRECO_MINIMO;
    trilho.style.setProperty('--de', `${((filtros.precoMin - PRECO_MINIMO) / total) * 100}%`);
    trilho.style.setProperty('--ate', `${((filtros.precoMax - PRECO_MINIMO) / total) * 100}%`);
    textoMin.textContent = `R$ ${filtros.precoMin}`;
    textoMax.textContent = `R$ ${filtros.precoMax}`;
    minimo.value = filtros.precoMin;
    maximo.value = filtros.precoMax;
  };

  const controle = (rotulo, valor, ajustar) => el('input', {
    type: 'range',
    'aria-label': rotulo,
    min: String(PRECO_MINIMO),
    max: String(PRECO_MAXIMO),
    step: String(PASSO_PRECO),
    value: String(valor),
    onInput: (evento) => {
      ajustar(Number(evento.target.value));
      pintar();
      aoMudar();
    },
  });

  /* Os dois controles nunca se cruzam: ficam ao menos um passo de distância. */
  const minimo = controle('Preço mínimo', filtros.precoMin, (v) => { filtros.precoMin = Math.min(v, filtros.precoMax - PASSO_PRECO); });
  const maximo = controle('Preço máximo', filtros.precoMax, (v) => { filtros.precoMax = Math.max(v, filtros.precoMin + PASSO_PRECO); });

  const raiz = el('fieldset', { class: 'filtro faixa' },
    el('legend', {}, 'Faixa de preço'),
    el('div', { class: 'faixa__valores' }, textoMin, textoMax),
    el('div', { class: 'faixa__controles' }, trilho, minimo, maximo));
  pintar();
  return raiz;
}

export function telaVitrine({ parametros, abrirComoFunciona }) {
  const filtros = lerDoEndereco(parametros);
  const prateleira = el('div', { class: 'prateleira', id: 'prateleira' });
  const contador = el('p', { class: 'vitrine__contagem', role: 'status' });
  let botaoFiltros;
  let painel;
  let busca;
  let ordem;

  function atualizar() {
    const lista = filtrarProdutos(filtros);
    escreverNoEndereco(filtros);
    contador.textContent = `${plural(lista.length, 'modelo encontrado', 'modelos encontrados')}`;
    const ativos = contarFiltros(filtros);
    botaoFiltros.textContent = ativos ? `Filtros (${ativos})` : 'Filtros';
    limpar.hidden = ativos === 0 && !filtros.busca;
    if (lista.length === 0) {
      prateleira.replaceChildren(el('div', { class: 'vazio' },
        el('h2', {}, 'Nenhum tênis com esses filtros'),
        el('p', {}, 'Tire um filtro ou aumente a faixa de preço para ver mais modelos.'),
        el('button', { type: 'button', class: 'botao', onClick: limparTudo }, 'Limpar filtros')));
      return;
    }
    prateleira.replaceChildren(...lista.map((produto) => cartaoProduto(produto)));
  }

  function montarPainel() {
    return el('form', { class: 'filtros', id: 'painel-filtros', onSubmit: (evento) => evento.preventDefault() },
      grupoDeOpcoes('Categoria', 'opcoes', CATEGORIAS.map((c) => ({ valor: c.id, texto: c.nome })), filtros.categorias, atualizar),
      grupoDeOpcoes('Tamanho', 'opcoes opcoes--tamanhos', TAMANHOS.map((t) => ({ valor: t, texto: String(t) })), filtros.tamanhos, atualizar),
      faixaDePreco(filtros, atualizar),
      grupoDeOpcoes('Marca fictícia', 'opcoes', Object.entries(MARCAS).map(([id, marca]) => ({ valor: id, texto: marca.nome, cor: marca.caixa })), filtros.marcas, atualizar));
  }

  function limparTudo() {
    const novos = filtrosVazios();
    novos.ordem = filtros.ordem;
    Object.assign(filtros, novos);
    busca.value = '';
    const novoPainel = montarPainel();
    painel.replaceWith(novoPainel);
    painel = novoPainel;
    painel.classList.toggle('filtros--aberto', botaoFiltros.getAttribute('aria-expanded') === 'true');
    atualizar();
    busca.focus();
  }

  botaoFiltros = el('button', {
    type: 'button',
    class: 'botao botao--contorno vitrine__alternar',
    'aria-expanded': 'false',
    'aria-controls': 'painel-filtros',
    onClick: () => {
      const aberto = painel.classList.toggle('filtros--aberto');
      botaoFiltros.setAttribute('aria-expanded', String(aberto));
    },
  }, 'Filtros');

  const limpar = el('button', { type: 'button', class: 'botao-texto', onClick: limparTudo }, 'Limpar filtros');

  busca = el('input', {
    id: 'busca',
    type: 'search',
    placeholder: 'Modelo, marca ou cor',
    value: filtros.busca,
    autocomplete: 'off',
    onInput: (evento) => {
      filtros.busca = evento.target.value;
      atualizar();
    },
  });

  ordem = el('select', {
    id: 'ordem',
    onChange: (evento) => {
      filtros.ordem = evento.target.value;
      atualizar();
    },
  }, Object.entries(ORDENACOES).map(([id, { nome }]) => el('option', { value: id, selected: id === filtros.ordem }, nome)));

  painel = montarPainel();

  const raiz = el('div', { class: 'tela-vitrine' },
    abertura(abrirComoFunciona),
    el('section', { class: 'vitrine', id: 'vitrine', 'aria-label': 'Vitrine de tênis' },
      el('h2', { class: 'so-leitor' }, 'Modelos da vitrine'),
      el('div', { class: 'vitrine__barra' },
        el('div', { class: 'campo campo--busca' }, el('label', { for: 'busca' }, 'Buscar na loja'), busca),
        el('div', { class: 'campo campo--ordem' }, el('label', { for: 'ordem' }, 'Ordenar por'), ordem),
        botaoFiltros),
      el('div', { class: 'vitrine__estado' }, contador, limpar),
      el('div', { class: 'vitrine__corpo' }, painel, prateleira)));

  atualizar();
  return raiz;
}
