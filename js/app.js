/*
 * Ponto de entrada: o roteador.
 *
 * A página é uma só (index.html). O que muda é a parte do endereço depois do "#".
 * Ao mudar, o roteador escolhe a tela e a coloca dentro de <main>. Isso funciona em
 * hospedagem estática como o GitHub Pages, sem configurar nada no servidor.
 */

import { el } from './dom.js';
import { assinar, assinarOutraAba, totalDePares } from './estado.js';
import { telaCarrinho } from './telas/carrinho.js';
import { telaCheckout } from './telas/checkout.js';
import { telaLojista } from './telas/lojista.js';
import { telaPedido } from './telas/pedido.js';
import { telaProduto } from './telas/produto.js';
import { telaVitrine } from './telas/vitrine.js';
import { produtoPorId } from './dados.js';

const principal = document.getElementById('principal');
const contador = document.getElementById('contador-carrinho');
const dialogoComoFunciona = document.getElementById('como-funciona');

const NOME_LOJA = 'Pinhoso’s Kicks';

let primeiraTela = true;
let enderecoVitrine = '#/';
let rolagemVitrine = 0;
let ultimaRota = null;

function abrirComoFunciona() {
  dialogoComoFunciona.showModal();
  dialogoComoFunciona.scrollTop = 0;
}

function telaNaoEncontrada(mensagem) {
  return el('div', { class: 'vazio vazio--pagina' },
    el('h1', { tabindex: '-1' }, 'Esta página não existe'),
    el('p', {}, mensagem),
    el('a', { class: 'botao', href: '#/' }, 'Ir para a vitrine'));
}

/** Traduz o endereço em tela. Devolve { tela, titulo } ou { redirecionar }. */
function resolverRota() {
  const [caminho, busca = ''] = location.hash.replace(/^#\/?/, '').split('?');
  const [secao = '', parte] = caminho.split('/');
  const nomeRota = secao || 'vitrine';

  switch (secao) {
    case '':
      return { rota: nomeRota, titulo: 'Vitrine', tela: telaVitrine({ parametros: new URLSearchParams(busca), abrirComoFunciona }) };
    case 'produto': {
      const tela = telaProduto({ id: parte, voltar: enderecoVitrine });
      return tela
        ? { rota: nomeRota, titulo: produtoPorId(parte).nome, tela }
        : { rota: nomeRota, titulo: 'Produto não encontrado', tela: telaNaoEncontrada('Este modelo não está no catálogo da loja de demonstração.') };
    }
    case 'carrinho':
      return { rota: nomeRota, titulo: 'Carrinho', tela: telaCarrinho() };
    case 'checkout': {
      const resultado = telaCheckout({ etapa: parte });
      return resultado.redirecionar ? resultado : { rota: nomeRota, titulo: 'Compra simulada', tela: resultado.tela };
    }
    case 'pedido': {
      const tela = telaPedido({ numero: parte });
      return tela
        ? { rota: nomeRota, titulo: `Pedido ${parte}`, tela }
        : { rota: nomeRota, titulo: 'Pedido não encontrado', tela: telaNaoEncontrada('Pedidos simulados ficam só no navegador onde foram feitos.') };
    }
    case 'lojista':
      return { rota: nomeRota, titulo: 'Área do lojista', tela: telaLojista({ aba: parte, redesenhar: renderizar }) };
    default:
      return { rota: nomeRota, titulo: 'Página não encontrada', tela: telaNaoEncontrada('Confira o endereço ou volte para a vitrine.') };
  }
}

/** Outra aba mudou os dados: refaz a tela sem mexer na rolagem. */
function redesenharNoLugar() {
  const altura = window.scrollY;
  renderizar();
  window.scrollTo(0, altura);
}

function marcarNavegacao(rota) {
  document.querySelectorAll('[data-rota]').forEach((link) => {
    if (link.dataset.rota === rota) link.setAttribute('aria-current', 'page');
    else link.removeAttribute('aria-current');
  });
}

function renderizar() {
  const resolvido = resolverRota();
  if (resolvido.redirecionar) {
    location.replace(resolvido.redirecionar);
    return;
  }

  const { rota, titulo, tela } = resolvido;
  principal.replaceChildren(tela);
  document.title = `${titulo}: ${NOME_LOJA} (demonstração)`;
  marcarNavegacao(rota);

  const voltandoParaVitrine = rota === 'vitrine' && ultimaRota === 'produto';
  ultimaRota = rota;

  if (primeiraTela) {
    /* Na primeira carga o foco fica no começo da página, como em qualquer site. */
    primeiraTela = false;
    window.scrollTo(0, 0);
    setTimeout(() => document.documentElement.classList.add('ja-abriu'), 800);
    return;
  }

  if (voltandoParaVitrine) {
    window.scrollTo(0, rolagemVitrine);
    return;
  }

  window.scrollTo(0, 0);
  principal.querySelector('h1')?.focus({ preventScroll: true });
}

/*
 * Os filtros mudam o endereço sem disparar o roteador. Por isso, o endereço e a
 * rolagem da vitrine são lembrados no clique que sai dela: o "voltar" da página
 * de produto devolve a pessoa à mesma busca, na mesma altura.
 */
document.addEventListener('click', (evento) => {
  if (ultimaRota === 'vitrine' && evento.target.closest('a[href^="#/"]')) {
    enderecoVitrine = location.hash || '#/';
    rolagemVitrine = window.scrollY;
  }
}, true);

function atualizarContador() {
  const total = totalDePares();
  contador.textContent = String(total);
  contador.hidden = total === 0;
  contador.parentElement.setAttribute('aria-label', total === 1 ? 'Carrinho com 1 par' : `Carrinho com ${total} pares`);
}

function ligarDialogoComoFunciona() {
  document.querySelectorAll('[data-abrir-como-funciona]').forEach((botao) => botao.addEventListener('click', abrirComoFunciona));
  dialogoComoFunciona.querySelector('[data-fechar]').addEventListener('click', () => dialogoComoFunciona.close());
  /* Clique fora da caixa fecha o diálogo. */
  dialogoComoFunciona.addEventListener('click', (evento) => {
    if (evento.target === dialogoComoFunciona) dialogoComoFunciona.close();
  });
}

history.scrollRestoration = 'manual';
window.addEventListener('hashchange', renderizar);
assinar(atualizarContador);
assinarOutraAba(redesenharNoLugar);
atualizarContador();
ligarDialogoComoFunciona();
renderizar();
