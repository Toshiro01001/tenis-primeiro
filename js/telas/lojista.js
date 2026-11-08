/* Área do lojista: pedidos simulados e edição de estoque. Os totais são calculados na hora. */

import { coresDaCaixa, tenisDoProduto } from '../componentes.js';
import { MARCAS, PRODUTOS, STATUS_PEDIDO, TAMANHOS } from '../dados.js';
import { avisar, el, formatarPreco, normalizar, plural } from '../dom.js';
import {
  alterarStatus, definirEstoque, estoqueDe, estoqueGeral, estoqueTotal, listarPedidos, restaurarDemonstracao, totalSimulado,
} from '../estado.js';

function abaPedidos() {
  const pedidos = listarPedidos();
  if (pedidos.length === 0) {
    return el('div', { class: 'vazio' },
      el('h2', {}, 'Nenhum pedido simulado ainda'),
      el('p', {}, 'Faça uma compra de teste na vitrine. O pedido aparece aqui assim que for confirmado.'),
      el('a', { class: 'botao', href: '#/' }, 'Ir para a vitrine'));
  }
  const data = new Intl.DateTimeFormat('pt-BR', { dateStyle: 'short', timeStyle: 'short' });
  return el('ul', { class: 'pedidos' }, pedidos.map((pedido) => {
    const idStatus = `status-${pedido.numero}`;
    return el('li', { class: 'pedido' },
      el('div', { class: 'pedido__topo' },
        el('h2', {}, el('a', { href: `#/pedido/${pedido.numero}` }, pedido.numero)),
        el('p', { class: 'pedido__total' }, formatarPreco(pedido.total))),
      el('p', { class: 'nota' }, `${data.format(new Date(pedido.criadoEm))}, ${pedido.cliente.nome}, ${pedido.cliente.cidade}/${pedido.cliente.uf}`),
      el('ul', { class: 'pedido__itens' }, pedido.itens.map((item) => el('li', {}, `${item.quantidade} × ${item.nome}, tamanho ${item.tamanho}`))),
      el('div', { class: 'campo campo--status' },
        el('label', { for: idStatus }, 'Situação'),
        el('select', {
          id: idStatus,
          onChange: (evento) => {
            alterarStatus(pedido.numero, evento.target.value);
            avisar(`${pedido.numero}: situação alterada para ${evento.target.value.toLowerCase()}.`);
          },
        }, STATUS_PEDIDO.map((status) => el('option', { value: status, selected: status === pedido.status }, status)))));
  }));
}

function abaEstoque(aoMudar) {
  const lista = el('div', { class: 'estoque' });
  const busca = el('input', {
    id: 'busca-estoque',
    type: 'search',
    autocomplete: 'off',
    placeholder: 'Nome ou marca',
    onInput: desenhar,
  });

  function linhaProduto(produto) {
    const total = el('p', { class: 'estoque__total' }, plural(estoqueTotal(produto.id), 'par', 'pares'));
    return el('section', { class: 'estoque__produto', cssVars: coresDaCaixa(produto), 'aria-labelledby': `estoque-${produto.id}` },
      el('div', { class: 'estoque__cabeca' },
        el('div', { class: 'estoque__figura' }, tenisDoProduto(produto)),
        el('div', {},
          el('h2', { id: `estoque-${produto.id}` }, produto.nome),
          el('p', { class: 'nota' }, MARCAS[produto.marca].nome)),
        total),
      el('div', { class: 'estoque__grade' }, TAMANHOS.map((tamanho) => {
        const idCampo = `estoque-${produto.id}-${tamanho}`;
        return el('div', { class: 'estoque__celula' },
          el('label', { for: idCampo }, el('span', { class: 'invisivel' }, `${produto.nome}, tamanho `), String(tamanho)),
          el('input', {
            id: idCampo,
            type: 'number',
            min: '0',
            max: '999',
            step: '1',
            inputmode: 'numeric',
            value: String(estoqueDe(produto.id, tamanho)),
            class: estoqueDe(produto.id, tamanho) === 0 ? 'zerado' : null,
            onChange: (evento) => {
              const gravado = definirEstoque(produto.id, tamanho, evento.target.value);
              evento.target.value = String(gravado);
              evento.target.classList.toggle('zerado', gravado === 0);
              total.textContent = plural(estoqueTotal(produto.id), 'par', 'pares');
              aoMudar();
              avisar(`Estoque salvo: ${produto.nome}, tamanho ${tamanho}, ${plural(gravado, 'par', 'pares')}.`);
            },
          }));
      })));
  }

  function desenhar() {
    const termo = normalizar(busca.value);
    const filtrados = PRODUTOS.filter((produto) => normalizar(`${produto.nome} ${MARCAS[produto.marca].nome}`).includes(termo));
    lista.replaceChildren(...(filtrados.length ? filtrados.map(linhaProduto) : [el('p', { class: 'nota' }, `Nenhum modelo com "${busca.value}".`)]));
  }

  desenhar();
  return el('div', {},
    el('p', { class: 'nota estoque__ajuda' }, 'Troque o número de pares de um tamanho e saia do campo: o estoque é salvo na hora, e a vitrine e o carrinho passam a respeitar o novo limite. Zero deixa o tamanho esgotado.'),
    el('div', { class: 'campo campo--busca-estoque' }, el('label', { for: 'busca-estoque' }, 'Procurar modelo'), busca),
    lista);
}

function dialogoRestaurar(redesenhar) {
  const dialogo = el('dialog', { class: 'dialogo dialogo--curto', 'aria-labelledby': 'titulo-restaurar' },
    el('h2', { id: 'titulo-restaurar' }, 'Restaurar os dados de exemplo?'),
    el('p', {}, 'O carrinho e os pedidos simulados deste navegador serão apagados, e o estoque volta ao inicial.'),
    el('div', { class: 'dialogo__acoes' },
      el('button', { type: 'button', class: 'botao botao--contorno', onClick: () => dialogo.close() }, 'Manter como está'),
      el('button', {
        type: 'button',
        class: 'botao',
        id: 'confirmar-restaurar',
        onClick: () => {
          dialogo.close();
          restaurarDemonstracao();
          avisar('Dados de exemplo restaurados.');
          redesenhar();
        },
      }, 'Restaurar dados')));
  return dialogo;
}

export function telaLojista({ aba, redesenhar }) {
  const atual = aba === 'estoque' ? 'estoque' : 'pedidos';
  const pares = el('dd', {}, plural(estoqueGeral(), 'par', 'pares'));
  const dialogo = dialogoRestaurar(redesenhar);
  const pedidos = listarPedidos();

  return el('div', { class: 'tela-lojista' },
    el('h1', { class: 'titulo-tela', tabindex: '-1' }, 'Área do lojista'),
    el('p', { class: 'alerta alerta--simulacao' }, 'Este é o lado de quem vende: aqui o dono da loja acompanha os pedidos e ajusta o estoque de cada tamanho. É demonstração, sem senha, e mostra só o que foi feito neste navegador. Uma loja real teria login e servidor.'),
    el('dl', { class: 'painel' },
      el('div', {}, el('dt', {}, 'Pedidos simulados'), el('dd', {}, String(pedidos.length))),
      el('div', {}, el('dt', {}, 'Total simulado'), el('dd', {}, formatarPreco(totalSimulado()))),
      el('div', {}, el('dt', {}, 'Em estoque'), pares)),
    el('nav', { class: 'abas', 'aria-label': 'Seções do lojista' },
      el('a', { class: 'abas__item', href: '#/lojista/pedidos', 'aria-current': atual === 'pedidos' ? 'page' : null }, 'Pedidos'),
      el('a', { class: 'abas__item', href: '#/lojista/estoque', 'aria-current': atual === 'estoque' ? 'page' : null }, 'Estoque')),
    atual === 'pedidos' ? abaPedidos() : abaEstoque(() => { pares.textContent = plural(estoqueGeral(), 'par', 'pares'); }),
    el('p', { class: 'tela-lojista__rodape' },
      el('button', { type: 'button', class: 'botao-texto', onClick: () => dialogo.showModal() }, 'Restaurar dados de exemplo')),
    dialogo);
}
