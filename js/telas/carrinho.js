/* Carrinho: quantidades limitadas pelo estoque, cupom de exemplo e totais. */

import { coresDaCaixa, resumoDeValores, seletorQuantidade, tenisDoProduto } from '../componentes.js';
import { CUPONS } from '../dados.js';
import { avisar, el, formatarPreco } from '../dom.js';
import {
  alterarQuantidade, aplicarCupom, calcularTotais, conferirCarrinho, cupomAtual, estoqueDe, itensDoCarrinho, removerCupom, removerDoCarrinho,
} from '../estado.js';

export function telaCarrinho() {
  const raiz = el('div', { class: 'tela-carrinho' });
  let avisos = conferirCarrinho();

  function desenhar() {
    const itens = itensDoCarrinho();
    const blocoAvisos = avisos.length > 0 ? [el('ul', { class: 'alerta' }, avisos.map((texto) => el('li', {}, texto)))] : [];

    if (itens.length === 0) {
      raiz.replaceChildren(
        el('h1', { class: 'titulo-tela', tabindex: '-1' }, 'Carrinho'),
        ...blocoAvisos,
        el('div', { class: 'vazio' },
          el('h2', {}, 'Seu carrinho está vazio'),
          el('p', {}, 'Escolha um tênis e um tamanho na vitrine para continuar.'),
          el('a', { class: 'botao', href: '#/' }, 'Ir para a vitrine')));
      return;
    }

    const linhas = el('ul', { class: 'linhas' }, itens.map((item) => {
      const { produto, tamanho, quantidade } = item;
      return el('li', { class: 'linha', cssVars: coresDaCaixa(produto) },
        el('div', { class: 'linha__figura' }, tenisDoProduto(produto)),
        el('div', { class: 'linha__dados' },
          el('h2', { class: 'linha__nome' }, el('a', { href: `#/produto/${produto.id}` }, produto.nome)),
          el('p', { class: 'linha__detalhe' }, `Tamanho ${tamanho}, ${formatarPreco(produto.preco)} o par`)),
        seletorQuantidade({
          valor: quantidade,
          maximo: estoqueDe(produto.id, tamanho),
          rotulo: `pares de ${produto.nome} no tamanho ${tamanho}`,
          aoMudar: (nova) => {
            /* A tela é refeita: o foco volta ao botão que estava sendo usado. */
            const rotuloFoco = document.activeElement?.getAttribute('aria-label');
            alterarQuantidade(produto.id, tamanho, nova);
            desenhar();
            [...raiz.querySelectorAll('button')].find((botao) => botao.getAttribute('aria-label') === rotuloFoco && !botao.disabled)?.focus();
          },
        }),
        el('p', { class: 'linha__total' }, formatarPreco(produto.preco * quantidade)),
        el('button', {
          type: 'button',
          class: 'botao-texto linha__remover',
          'aria-label': `Remover ${produto.nome}, tamanho ${tamanho}`,
          onClick: () => {
            removerDoCarrinho(produto.id, tamanho);
            avisar(`${produto.nome}, tamanho ${tamanho}, saiu do carrinho.`);
            desenhar();
            raiz.querySelector('h1').focus();
          },
        }, 'Remover'));
    }));

    raiz.replaceChildren(
      el('h1', { class: 'titulo-tela', tabindex: '-1' }, 'Carrinho'),
      ...blocoAvisos,
      el('div', { class: 'carrinho__corpo' },
        linhas,
        el('aside', { class: 'resumo', 'aria-label': 'Resumo do carrinho' },
          blocoCupom(desenhar),
          resumoDeValores(calcularTotais(), { rotuloTotal: 'Total sem entrega' }),
          el('a', { class: 'botao botao--grande botao--largo', href: '#/checkout/dados' }, 'Continuar para os dados'),
          el('p', { class: 'nota' }, 'Compra simulada: nada é cobrado nem enviado.'))),
    );
  }

  desenhar();
  avisos = [];
  return raiz;
}

function blocoCupom(redesenhar) {
  const atual = cupomAtual();
  if (atual) {
    return el('div', { class: 'cupom cupom--ativo' },
      el('p', {}, el('strong', {}, atual), `: ${CUPONS[atual].descricao}.`),
      el('button', {
        type: 'button',
        class: 'botao-texto',
        onClick: () => {
          removerCupom();
          avisar('Cupom removido.');
          redesenhar();
        },
      }, 'Remover cupom'));
  }

  const erro = el('p', { class: 'campo__erro', id: 'erro-cupom', hidden: true });
  const entrada = el('input', { id: 'cupom', type: 'text', autocomplete: 'off', 'aria-describedby': 'erro-cupom dica-cupom' });
  return el('form', {
    class: 'cupom',
    novalidate: true,
    onSubmit: (evento) => {
      evento.preventDefault();
      if (!entrada.value.trim()) {
        erro.textContent = 'Digite um cupom. Para testar, use DEMO10.';
        erro.hidden = false;
        entrada.setAttribute('aria-invalid', 'true');
        entrada.focus();
      } else if (aplicarCupom(entrada.value)) {
        avisar('Cupom aplicado.');
        redesenhar();
      } else {
        erro.textContent = `O cupom ${entrada.value.trim().toUpperCase()} não existe. Para testar, use DEMO10.`;
        erro.hidden = false;
        entrada.setAttribute('aria-invalid', 'true');
        entrada.focus();
      }
    },
  },
  el('label', { for: 'cupom' }, 'Cupom de desconto'),
  el('div', { class: 'cupom__linha' }, entrada, el('button', { type: 'submit', class: 'botao botao--contorno' }, 'Aplicar')),
  erro,
  el('p', { class: 'nota', id: 'dica-cupom' }, 'Cupom de exemplo: DEMO10 dá 10% nos produtos.'));
}
