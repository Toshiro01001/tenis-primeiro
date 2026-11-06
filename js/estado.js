/*
 * Estado da loja: carrinho, cupom, estoque e pedidos simulados.
 *
 * Tudo fica no localStorage do navegador de quem está testando. Nada vai para a
 * internet. Se o localStorage estiver bloqueado (janela privada, por exemplo),
 * a loja continua funcionando na memória até a página fechar.
 *
 * Numa loja real, estas mesmas funções conversariam com um servidor.
 */

import { CUPONS, ENTREGAS, PAGAMENTOS, PRODUTOS, STATUS_PEDIDO, produtoPorId } from './dados.js';

const CHAVES = { carrinho: 'pk.carrinho', cupom: 'pk.cupom', estoque: 'pk.estoque', pedidos: 'pk.pedidos' };

function lerSalvo(chave) {
  try {
    const texto = window.localStorage.getItem(chave);
    return texto === null ? null : JSON.parse(texto);
  } catch {
    return null;
  }
}

function salvar(chave, valor) {
  try {
    window.localStorage.setItem(chave, JSON.stringify(valor));
  } catch {
    /* Sem armazenamento: o estado segue só na memória. */
  }
}

function apagarSalvo(chave) {
  try {
    window.localStorage.removeItem(chave);
  } catch {
    /* Nada a apagar. */
  }
}

/* Leitura defensiva: dado salvo é tratado como desconhecido e conferido campo a campo. */

const inteiroValido = (n) => Number.isInteger(n) && n >= 0 && n <= 9999;

function carregarEstoque() {
  const salvo = lerSalvo(CHAVES.estoque);
  const estoque = {};
  for (const produto of PRODUTOS) {
    estoque[produto.id] = { ...produto.estoque };
    const doProduto = salvo?.[produto.id];
    if (!doProduto) continue;
    for (const tamanho of Object.keys(produto.estoque)) {
      if (inteiroValido(doProduto[tamanho])) estoque[produto.id][tamanho] = doProduto[tamanho];
    }
  }
  return estoque;
}

function carregarCarrinho() {
  const salvo = lerSalvo(CHAVES.carrinho);
  if (!Array.isArray(salvo)) return [];
  return salvo
    .filter((item) => produtoPorId(item?.id) && item.tamanho in produtoPorId(item.id).estoque && inteiroValido(item.quantidade) && item.quantidade > 0)
    .map(({ id, tamanho, quantidade }) => ({ id, tamanho: Number(tamanho), quantidade }));
}

function carregarCupom() {
  const salvo = lerSalvo(CHAVES.cupom);
  return typeof salvo === 'string' && CUPONS[salvo] ? salvo : null;
}

function carregarPedidos() {
  const salvo = lerSalvo(CHAVES.pedidos);
  if (!Array.isArray(salvo)) return [];
  return salvo.filter((pedido) => typeof pedido?.numero === 'string' && Array.isArray(pedido.itens) && Number.isInteger(pedido.total));
}

let carrinho = carregarCarrinho();
let cupom = carregarCupom();
let estoque = carregarEstoque();
let pedidos = carregarPedidos();

const ouvintes = new Set();

/** Avisa quem depende do estado (como o contador do carrinho no topo). */
export function assinar(funcao) {
  ouvintes.add(funcao);
  return () => ouvintes.delete(funcao);
}

function notificar() {
  ouvintes.forEach((funcao) => funcao());
}

let aoMudarEmOutraAba = () => {};

/** Registra o que fazer quando outra aba da loja alterar os dados (redesenhar a tela). */
export function assinarOutraAba(funcao) {
  aoMudarEmOutraAba = funcao;
}

/* Se a loja estiver aberta em outra aba, as mudanças de lá chegam aqui. */
window.addEventListener('storage', (evento) => {
  if (evento.key && !Object.values(CHAVES).includes(evento.key)) return;
  carrinho = carregarCarrinho();
  cupom = carregarCupom();
  estoque = carregarEstoque();
  pedidos = carregarPedidos();
  notificar();
  aoMudarEmOutraAba();
});

/* Estoque */

export function estoqueDe(id, tamanho) {
  return estoque[id]?.[tamanho] ?? 0;
}

export function estoqueTotal(id) {
  return Object.values(estoque[id] ?? {}).reduce((soma, n) => soma + n, 0);
}

export function estoqueGeral() {
  return PRODUTOS.reduce((soma, produto) => soma + estoqueTotal(produto.id), 0);
}

/** Alteração feita na área do lojista. Devolve o valor que ficou gravado. */
export function definirEstoque(id, tamanho, quantidade) {
  const valor = Math.min(Math.max(Math.trunc(Number(quantidade)) || 0, 0), 999);
  estoque[id][tamanho] = valor;
  salvar(CHAVES.estoque, estoque);
  notificar();
  return valor;
}

/* Carrinho */

export const itensDoCarrinho = () => carrinho.map((item) => ({ ...item, produto: produtoPorId(item.id) }));

export const totalDePares = () => carrinho.reduce((soma, item) => soma + item.quantidade, 0);

export function quantidadeNoCarrinho(id, tamanho) {
  return carrinho.find((item) => item.id === id && item.tamanho === tamanho)?.quantidade ?? 0;
}

function gravarCarrinho() {
  salvar(CHAVES.carrinho, carrinho);
  notificar();
}

/** Coloca pares no carrinho, sem passar do estoque. Devolve quantos entraram. */
export function adicionarAoCarrinho(id, tamanho, quantidade = 1) {
  const noCarrinho = quantidadeNoCarrinho(id, tamanho);
  const entram = Math.min(quantidade, estoqueDe(id, tamanho) - noCarrinho);
  if (entram <= 0) return 0;
  if (noCarrinho) {
    carrinho = carrinho.map((item) => (item.id === id && item.tamanho === tamanho ? { ...item, quantidade: noCarrinho + entram } : item));
  } else {
    carrinho = [...carrinho, { id, tamanho, quantidade: entram }];
  }
  gravarCarrinho();
  return entram;
}

export function alterarQuantidade(id, tamanho, quantidade) {
  const limitada = Math.min(quantidade, estoqueDe(id, tamanho));
  carrinho = limitada <= 0
    ? carrinho.filter((item) => !(item.id === id && item.tamanho === tamanho))
    : carrinho.map((item) => (item.id === id && item.tamanho === tamanho ? { ...item, quantidade: limitada } : item));
  gravarCarrinho();
}

export function removerDoCarrinho(id, tamanho) {
  alterarQuantidade(id, tamanho, 0);
}

/**
 * Confere o carrinho contra o estoque atual (o lojista pode ter mudado o estoque
 * depois). Ajusta o que passou do limite e devolve avisos para mostrar na tela.
 */
export function conferirCarrinho() {
  const avisos = [];
  const ajustado = [];
  for (const item of carrinho) {
    const disponivel = estoqueDe(item.id, item.tamanho);
    const { nome } = produtoPorId(item.id);
    if (disponivel === 0) {
      avisos.push(`${nome}, tamanho ${item.tamanho}, esgotou e saiu do carrinho.`);
    } else if (item.quantidade > disponivel) {
      avisos.push(`${nome}, tamanho ${item.tamanho}: restam ${disponivel}, e a quantidade foi ajustada.`);
      ajustado.push({ ...item, quantidade: disponivel });
    } else {
      ajustado.push(item);
    }
  }
  if (avisos.length) {
    carrinho = ajustado;
    gravarCarrinho();
  }
  return avisos;
}

/* Cupom */

export const cupomAtual = () => cupom;

/** Devolve true se o cupom existir. */
export function aplicarCupom(texto) {
  const codigo = texto.trim().toUpperCase();
  if (!CUPONS[codigo]) return false;
  cupom = codigo;
  salvar(CHAVES.cupom, cupom);
  notificar();
  return true;
}

export function removerCupom() {
  cupom = null;
  apagarSalvo(CHAVES.cupom);
  notificar();
}

/* Totais, sempre em centavos */

export function calcularTotais(idEntrega = null) {
  const subtotal = carrinho.reduce((soma, item) => soma + produtoPorId(item.id).preco * item.quantidade, 0);
  const desconto = cupom ? Math.round((subtotal * CUPONS[cupom].percentual) / 100) : 0;
  const frete = ENTREGAS.find((opcao) => opcao.id === idEntrega)?.preco ?? 0;
  return { subtotal, desconto, frete, total: subtotal - desconto + frete };
}

/* Pedidos simulados */

export const listarPedidos = () => [...pedidos].reverse();

export const pedidoPorNumero = (numero) => pedidos.find((pedido) => pedido.numero === numero);

export const totalSimulado = () => pedidos.reduce((soma, pedido) => soma + pedido.total, 0);

/**
 * Fecha a compra simulada: baixa o estoque, esvazia o carrinho e guarda o pedido.
 * De propósito, guarda só nome, cidade e UF. CPF, e-mail, endereço e cartão nunca
 * são gravados. Devolve o pedido, ou null se o estoque mudou no meio do caminho.
 */
export function fecharPedido({ nome, cidade, uf, idEntrega, pagamento }) {
  if (carrinho.length === 0 || conferirCarrinho().length > 0) return null;

  const totais = calcularTotais(idEntrega);
  const ultimo = pedidos.reduce((maior, pedido) => Math.max(maior, Number(pedido.numero.slice(3)) || 0), 0);
  const pedido = {
    numero: `PK-${String(ultimo + 1).padStart(4, '0')}`,
    criadoEm: new Date().toISOString(),
    status: STATUS_PEDIDO[0],
    cliente: { nome, cidade, uf },
    entrega: ENTREGAS.find((opcao) => opcao.id === idEntrega).nome,
    pagamento: PAGAMENTOS[pagamento],
    cupom,
    itens: carrinho.map((item) => {
      const produto = produtoPorId(item.id);
      return { id: item.id, nome: produto.nome, tamanho: item.tamanho, quantidade: item.quantidade, preco: produto.preco };
    }),
    ...totais,
  };

  for (const item of carrinho) estoque[item.id][item.tamanho] -= item.quantidade;
  pedidos = [...pedidos, pedido];
  carrinho = [];
  cupom = null;

  salvar(CHAVES.estoque, estoque);
  salvar(CHAVES.pedidos, pedidos);
  salvar(CHAVES.carrinho, carrinho);
  apagarSalvo(CHAVES.cupom);
  notificar();
  return pedido;
}

export function alterarStatus(numero, status) {
  if (!STATUS_PEDIDO.includes(status)) return;
  pedidos = pedidos.map((pedido) => (pedido.numero === numero ? { ...pedido, status } : pedido));
  salvar(CHAVES.pedidos, pedidos);
  notificar();
}

/** Volta tudo ao começo da demonstração. */
export function restaurarDemonstracao() {
  Object.values(CHAVES).forEach(apagarSalvo);
  carrinho = [];
  cupom = null;
  pedidos = [];
  estoque = carregarEstoque();
  notificar();
}
