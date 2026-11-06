/* Página de produto: escolha de tamanho, quantidade limitada pelo estoque e carrinho. */

import { cartaoProduto, coresDaCaixa, nomeCategoria, seletorQuantidade, selo, tenisDoProduto } from '../componentes.js';
import { MARCAS, PRODUTOS, TAMANHOS, produtoPorId } from '../dados.js';
import { avisar, el, plural } from '../dom.js';
import { adicionarAoCarrinho, estoqueDe, estoqueTotal, quantidadeNoCarrinho } from '../estado.js';
import { desenharMarca } from '../tenis-svg.js';

export function telaProduto({ id, voltar }) {
  const produto = produtoPorId(id);
  if (!produto) return null;

  const marca = MARCAS[produto.marca];
  const esgotado = estoqueTotal(produto.id) === 0;
  let tamanhoEscolhido = null;

  const erro = el('p', { class: 'campo__erro', id: 'erro-tamanho', hidden: true }, 'Escolha um tamanho antes de adicionar.');
  const situacao = el('p', { class: 'produto__situacao', role: 'status' }, esgotado ? 'Este modelo está esgotado em todos os tamanhos.' : 'Escolha o tamanho para ver quantos pares restam.');
  const atalhoCarrinho = el('a', { class: 'botao-texto', href: '#/carrinho', hidden: true }, 'Ver o carrinho');

  const quantidade = seletorQuantidade({ valor: 1, maximo: 1, rotulo: 'quantidade de pares' });

  const botaoAdicionar = el('button', {
    type: 'submit',
    class: 'botao botao--grande',
    disabled: esgotado,
  }, esgotado ? 'Esgotado' : 'Adicionar ao carrinho');

  function disponivelAgora() {
    return estoqueDe(produto.id, tamanhoEscolhido) - quantidadeNoCarrinho(produto.id, tamanhoEscolhido);
  }

  function atualizarSituacao() {
    const restam = estoqueDe(produto.id, tamanhoEscolhido);
    const livres = disponivelAgora();
    quantidade.definirMaximo(Math.max(livres, 1));
    botaoAdicionar.disabled = livres <= 0;
    if (livres <= 0) {
      situacao.textContent = `Todos os pares do tamanho ${tamanhoEscolhido} já estão no seu carrinho.`;
    } else if (restam === 1) {
      situacao.textContent = `Último par do tamanho ${tamanhoEscolhido} (estoque fictício).`;
    } else {
      situacao.textContent = `${plural(restam, 'par', 'pares')} do tamanho ${tamanhoEscolhido} em estoque (fictício).`;
    }
  }

  const tamanhos = el('fieldset', { class: 'tamanhos' },
    el('legend', {}, 'Tamanho'),
    el('div', { class: 'tamanhos__grade' },
      TAMANHOS.map((tamanho) => {
        const semEstoque = estoqueDe(produto.id, tamanho) === 0;
        return el('label', { class: 'tamanho' },
          el('input', {
            type: 'radio',
            name: 'tamanho',
            value: String(tamanho),
            disabled: semEstoque,
            'aria-describedby': 'erro-tamanho',
            onChange: () => {
              tamanhoEscolhido = tamanho;
              erro.hidden = true;
              atualizarSituacao();
            },
          }),
          el('span', { title: semEstoque ? 'Sem estoque neste tamanho' : null }, String(tamanho)));
      })));

  function adicionar(evento) {
    evento.preventDefault();
    if (esgotado) return;
    if (tamanhoEscolhido === null) {
      erro.hidden = false;
      tamanhos.querySelector('input:not(:disabled)')?.focus();
      return;
    }
    const pedida = quantidade.lerValor();
    const entraram = adicionarAoCarrinho(produto.id, tamanhoEscolhido, pedida);
    if (entraram > 0) {
      avisar(`${produto.nome}, tamanho ${tamanhoEscolhido}: ${plural(entraram, 'par adicionado', 'pares adicionados')} ao carrinho.`);
      atalhoCarrinho.hidden = false;
    }
    atualizarSituacao();
  }

  const relacionados = PRODUTOS
    .filter((outro) => outro.id !== produto.id && outro.categoria === produto.categoria)
    .slice(0, 3);

  return el('div', { class: 'tela-produto' },
    el('p', { class: 'migalha' }, el('a', { class: 'botao-texto', href: voltar }, 'Voltar à vitrine')),
    el('article', { class: 'produto' },
      el('div', { class: `produto__palco${esgotado ? ' caixa--esgotada' : ''}`, cssVars: coresDaCaixa(produto) },
        el('div', { class: 'produto__tenis' }, tenisDoProduto(produto, `Ilustração do tênis ${produto.nome}, cor ${produto.cor.toLowerCase()}`)),
        el('div', { class: 'produto__caixa' }, el('span', { class: 'produto__caixa-nome' }, marca.nome))),
      el('div', { class: 'produto__info' },
        el('p', { class: 'etiqueta__marca' }, desenharMarca(marca.simbolo, marca.caixa), `${marca.nome}, ${nomeCategoria(produto.categoria).toLowerCase()}`),
        el('h1', { class: 'produto__nome', tabindex: '-1' }, produto.nome),
        el('p', { class: 'produto__cor' }, produto.cor),
        selo(produto.preco, 'selo-preco--produto'),
        el('p', { class: 'produto__descricao' }, produto.descricao),
        el('form', { class: 'produto__compra', onSubmit: adicionar },
          tamanhos,
          erro,
          situacao,
          el('div', { class: 'produto__acoes' }, !esgotado && quantidade, botaoAdicionar),
          atalhoCarrinho),
        el('dl', { class: 'ficha' },
          produto.ficha.map(([chave, valor]) => el('div', {}, el('dt', {}, chave), el('dd', {}, valor)))),
        el('p', { class: 'nota' }, 'Marca, modelo, preço e estoque inventados para esta demonstração.'))),
    relacionados.length > 0 && el('section', { class: 'relacionados', 'aria-labelledby': 'titulo-relacionados' },
      el('h2', { id: 'titulo-relacionados' }, `Mais modelos na categoria ${nomeCategoria(produto.categoria).toLowerCase()}`),
      el('div', { class: 'prateleira prateleira--curta' }, relacionados.map((outro) => cartaoProduto(outro))))
  );
}
