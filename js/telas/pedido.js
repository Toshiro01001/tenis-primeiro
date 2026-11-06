/* Resumo do pedido simulado, desenhado como uma etiqueta de expedição. */

import { codigoDeBarras } from '../componentes.js';
import { el, formatarPreco } from '../dom.js';
import { pedidoPorNumero } from '../estado.js';

export function telaPedido({ numero }) {
  const pedido = pedidoPorNumero(numero);
  if (!pedido) return null;

  const data = new Intl.DateTimeFormat('pt-BR', { dateStyle: 'short', timeStyle: 'short' }).format(new Date(pedido.criadoEm));

  return el('div', { class: 'tela-pedido' },
    el('h1', { class: 'titulo-tela', tabindex: '-1' }, 'Pedido simulado registrado'),
    el('p', { class: 'tela-pedido__lide' }, 'Nada foi cobrado nem enviado. O pedido ficou guardado só neste navegador e aparece na área do lojista.'),
    el('article', { class: 'expedicao' },
      el('header', { class: 'expedicao__topo' },
        el('div', {},
          el('p', { class: 'expedicao__rotulo' }, 'Pedido'),
          el('p', { class: 'expedicao__numero' }, pedido.numero)),
        el('p', { class: 'expedicao__carimbo' }, 'Simulação')),
      codigoDeBarras(pedido.numero),
      el('dl', { class: 'expedicao__dados' },
        el('div', {}, el('dt', {}, 'Para'), el('dd', {}, pedido.cliente.nome)),
        el('div', {}, el('dt', {}, 'Destino'), el('dd', {}, `${pedido.cliente.cidade}/${pedido.cliente.uf}`)),
        el('div', {}, el('dt', {}, 'Data'), el('dd', {}, data)),
        el('div', {}, el('dt', {}, 'Entrega'), el('dd', {}, pedido.entrega)),
        el('div', {}, el('dt', {}, 'Pagamento'), el('dd', {}, pedido.pagamento)),
        el('div', {}, el('dt', {}, 'Situação'), el('dd', {}, pedido.status))),
      el('ul', { class: 'expedicao__itens' }, pedido.itens.map((item) => el('li', {},
        el('span', {}, `${item.quantidade} × ${item.nome}, tamanho ${item.tamanho}`),
        el('span', {}, formatarPreco(item.preco * item.quantidade))))),
      el('dl', { class: 'valores' },
        el('div', {}, el('dt', {}, 'Produtos'), el('dd', {}, formatarPreco(pedido.subtotal))),
        pedido.desconto > 0 && el('div', { class: 'valores__desconto' }, el('dt', {}, `Cupom ${pedido.cupom}`), el('dd', {}, `-${formatarPreco(pedido.desconto)}`)),
        el('div', {}, el('dt', {}, 'Entrega'), el('dd', {}, pedido.frete === 0 ? 'Sem custo' : formatarPreco(pedido.frete))),
        el('div', { class: 'valores__total' }, el('dt', {}, 'Total simulado'), el('dd', {}, formatarPreco(pedido.total))))),
    el('p', { class: 'tela-pedido__acoes' },
      el('a', { class: 'botao', href: '#/lojista/pedidos' }, 'Ver na área do lojista'),
      el('a', { class: 'botao botao--contorno', href: '#/' }, 'Voltar à vitrine')));
}
