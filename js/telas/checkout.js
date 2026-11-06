/*
 * Checkout simulado em quatro etapas. Cada etapa tem endereço próprio, então o
 * botão voltar do navegador funciona. Os dados digitados ficam só numa variável
 * enquanto a página está aberta: nada é gravado, e a política de segurança da
 * página (CSP) impede formulários e conexões de enviar qualquer coisa para fora.
 */

import { coresDaCaixa, resumoDeValores, tenisDoProduto } from '../componentes.js';
import { CARTAO_DE_TESTE, DADOS_FICTICIOS, ENTREGAS, PAGAMENTOS, UFS } from '../dados.js';
import { el, formatarPreco } from '../dom.js';
import { calcularTotais, conferirCarrinho, fecharPedido, itensDoCarrinho } from '../estado.js';
import { mascaras, validar } from '../validacao.js';

const ETAPAS = [
  { id: 'dados', nome: 'Seus dados' },
  { id: 'entrega', nome: 'Entrega' },
  { id: 'pagamento', nome: 'Pagamento' },
  { id: 'revisao', nome: 'Revisão' },
];

const rascunhoVazio = () => ({
  dados: { nome: '', email: '', cpf: '', telefone: '' },
  entrega: { cep: '', endereco: '', numero: '', complemento: '', bairro: '', cidade: '', uf: '' },
  idEntrega: ENTREGAS[0].id,
  pagamento: 'pix',
  cartao: { numero: '', titular: '', validade: '', cvv: '' },
});

let rascunho = rascunhoVazio();

const REGRAS = {
  dados: { nome: validar.nome, email: validar.email, cpf: validar.cpf, telefone: validar.telefone },
  entrega: {
    cep: validar.cep,
    endereco: validar.obrigatorio('a rua'),
    numero: validar.obrigatorio('o número'),
    complemento: validar.opcional,
    bairro: validar.obrigatorio('o bairro'),
    cidade: validar.obrigatorio('a cidade'),
    uf: validar.obrigatorio('a UF'),
  },
  cartao: { numero: validar.cartao, titular: validar.obrigatorio('o nome impresso'), validade: (v) => validar.validade(v), cvv: validar.cvv },
};

function grupoValido(grupo) {
  return Object.entries(REGRAS[grupo]).every(([campo, regra]) => regra(rascunho[grupo][campo]) === '');
}

function etapaConcluida(id) {
  if (id === 'dados') return grupoValido('dados');
  if (id === 'entrega') return grupoValido('entrega');
  if (id === 'pagamento') return rascunho.pagamento === 'pix' || grupoValido('cartao');
  return false;
}

/** Primeira etapa que falta preencher. Impede pular etapas pelo endereço. */
function primeiraPendente() {
  return ETAPAS.find((etapa) => !etapaConcluida(etapa.id))?.id ?? 'revisao';
}

function campo(grupo, nome, { rotulo, tipo = 'text', mascara, modo, ajuda, opcoes, classe = '' }) {
  const id = `campo-${grupo}-${nome}`;
  const regra = REGRAS[grupo][nome];
  const erro = el('p', { class: 'campo__erro', id: `${id}-erro`, hidden: true });
  const ligados = [`${id}-erro`, ajuda && `${id}-ajuda`].filter(Boolean).join(' ');

  const atributos = {
    id,
    name: nome,
    autocomplete: 'off',
    'aria-describedby': ligados,
    'aria-required': regra === validar.opcional ? 'false' : 'true',
    onInput: (evento) => {
      if (mascara) evento.target.value = mascara(evento.target.value);
      rascunho[grupo][nome] = evento.target.value;
      if (!erro.hidden) conferir();
    },
    onBlur: () => {
      if (rascunho[grupo][nome] !== '') conferir();
    },
  };

  const entrada = opcoes
    ? el('select', { ...atributos, onChange: atributos.onInput }, el('option', { value: '' }, 'Selecione'), opcoes.map((uf) => el('option', { value: uf, selected: rascunho[grupo][nome] === uf }, uf)))
    : el('input', { ...atributos, type: tipo, inputmode: modo, value: rascunho[grupo][nome] });

  function conferir() {
    const mensagem = regra(rascunho[grupo][nome]);
    erro.textContent = mensagem;
    erro.hidden = !mensagem;
    if (mensagem) entrada.setAttribute('aria-invalid', 'true');
    else entrada.removeAttribute('aria-invalid');
    /* Avisa o formulário, para o resumo de erros acompanhar as correções. */
    entrada.dispatchEvent(new Event('conferido', { bubbles: true }));
    return !mensagem;
  }

  const raiz = el('div', { class: `campo ${classe}`.trim() },
    el('label', { for: id }, rotulo, regra === validar.opcional && el('span', { class: 'campo__opcional' }, ' (opcional)')),
    entrada,
    ajuda && el('p', { class: 'nota', id: `${id}-ajuda` }, ajuda),
    erro);
  raiz.conferir = conferir;
  raiz.entrada = entrada;
  raiz.preencher = (valor) => {
    entrada.value = valor;
    rascunho[grupo][nome] = valor;
    conferir();
  };
  raiz.campoNome = nome;
  raiz.valido = () => regra(rascunho[grupo][nome]) === '';
  return raiz;
}

/** Escreve o resumo de erros do formulário, ou o esconde se não houver mais erro. */
function escreverResumoErro(campos, resumoErro) {
  const quantos = campos.filter((item) => !item.valido()).length;
  resumoErro.textContent = quantos === 1 ? 'Corrija o campo destacado para continuar.' : `Corrija os ${quantos} campos destacados para continuar.`;
  resumoErro.hidden = quantos === 0;
}

/** Confere todos os campos e leva o foco ao primeiro com erro. */
function conferirCampos(campos, resumoErro) {
  const invalidos = campos.filter((item) => !item.conferir());
  escreverResumoErro(campos, resumoErro);
  invalidos[0]?.entrada.focus();
  return invalidos.length === 0;
}

/** Depois de aparecer, o resumo de erros acompanha cada correção. */
function resumoAcompanha(campos, resumoErro) {
  return () => {
    if (!resumoErro.hidden) escreverResumoErro(campos, resumoErro);
  };
}

function progresso(idAtual) {
  const posicao = ETAPAS.findIndex((etapa) => etapa.id === idAtual);
  return el('ol', { class: 'etapas' }, ETAPAS.map((etapa, i) => {
    const estado = i < posicao ? 'feita' : i === posicao ? 'atual' : 'futura';
    return el('li', { class: `etapas__item etapas__item--${estado}`, 'aria-current': i === posicao ? 'step' : null },
      i < posicao ? el('a', { href: `#/checkout/${etapa.id}` }, etapa.nome) : el('span', {}, etapa.nome));
  }));
}

function resumoLateral(idEntrega) {
  const itens = itensDoCarrinho();
  return el('aside', { class: 'resumo', 'aria-label': 'Resumo da compra' },
    el('h2', { class: 'resumo__titulo' }, 'Sua compra'),
    el('ul', { class: 'mini-itens' }, itens.map(({ produto, tamanho, quantidade }) => el('li', { class: 'mini-item', cssVars: coresDaCaixa(produto) },
      el('div', { class: 'mini-item__figura' }, tenisDoProduto(produto)),
      el('div', {},
        el('p', { class: 'mini-item__nome' }, produto.nome),
        el('p', { class: 'nota' }, `Tamanho ${tamanho}, ${quantidade} × ${formatarPreco(produto.preco)}`))))),
    resumoDeValores(calcularTotais(idEntrega), { mostrarFrete: idEntrega !== null, rotuloTotal: idEntrega === null ? 'Total sem entrega' : 'Total' }));
}

function moldura(idEtapa, titulo, conteudo, idEntrega = null) {
  return el('div', { class: 'tela-checkout' },
    el('h1', { class: 'titulo-tela', tabindex: '-1' }, titulo),
    progresso(idEtapa),
    el('p', { class: 'alerta alerta--simulacao' }, 'Compra simulada. Nenhum dado sai deste navegador e nenhum pagamento é feito. Não use dados reais.'),
    el('div', { class: 'checkout__corpo' }, conteudo, resumoLateral(idEntrega)));
}

function botaoFicticio(aoClicar) {
  return el('button', { type: 'button', class: 'botao botao--contorno botao--ficticio', onClick: aoClicar }, 'Preencher com dados fictícios');
}

function rodapeEtapa(voltarPara, rotuloVoltar, rotuloAvancar) {
  return el('div', { class: 'etapa__rodape' },
    el('a', { class: 'botao-texto', href: voltarPara }, rotuloVoltar),
    el('button', { type: 'submit', class: 'botao botao--grande' }, rotuloAvancar));
}

function etapaDados() {
  const resumoErro = el('p', { class: 'campo__erro campo__erro--geral', role: 'alert', hidden: true });
  const campos = [
    campo('dados', 'nome', { rotulo: 'Nome completo', classe: 'campo--largo' }),
    campo('dados', 'email', { rotulo: 'E-mail', tipo: 'email', modo: 'email' }),
    campo('dados', 'telefone', { rotulo: 'Telefone com DDD', tipo: 'tel', modo: 'tel', mascara: mascaras.telefone }),
    campo('dados', 'cpf', { rotulo: 'CPF', modo: 'numeric', mascara: mascaras.cpf, ajuda: 'O cálculo dos dígitos é real. Para testar, use o botão de dados fictícios.' }),
  ];
  return moldura('dados', 'Seus dados', el('form', {
    class: 'etapa',
    novalidate: true,
    onConferido: resumoAcompanha(campos, resumoErro),
    onSubmit: (evento) => {
      evento.preventDefault();
      if (conferirCampos(campos, resumoErro)) location.hash = '#/checkout/entrega';
    },
  },
  botaoFicticio(() => campos.forEach((item) => item.preencher(DADOS_FICTICIOS.dados[item.campoNome]))),
  el('div', { class: 'etapa__campos' }, campos),
  resumoErro,
  rodapeEtapa('#/carrinho', 'Voltar ao carrinho', 'Continuar para a entrega')));
}

function etapaEntrega() {
  const resumoErro = el('p', { class: 'campo__erro campo__erro--geral', role: 'alert', hidden: true });
  const campos = [
    campo('entrega', 'cep', { rotulo: 'CEP', modo: 'numeric', mascara: mascaras.cep, classe: 'campo--curto' }),
    campo('entrega', 'endereco', { rotulo: 'Rua', classe: 'campo--largo' }),
    campo('entrega', 'numero', { rotulo: 'Número', classe: 'campo--curto' }),
    campo('entrega', 'complemento', { rotulo: 'Complemento' }),
    campo('entrega', 'bairro', { rotulo: 'Bairro' }),
    campo('entrega', 'cidade', { rotulo: 'Cidade' }),
    campo('entrega', 'uf', { rotulo: 'UF', opcoes: UFS, classe: 'campo--curto' }),
  ];
  const opcoes = el('fieldset', { class: 'escolhas' },
    el('legend', {}, 'Como receber (prazos e valores fictícios)'),
    ENTREGAS.map((opcao) => el('label', { class: 'escolha' },
      el('input', {
        type: 'radio',
        name: 'entrega',
        value: opcao.id,
        checked: rascunho.idEntrega === opcao.id,
        onChange: () => {
          rascunho.idEntrega = opcao.id;
          atualizarResumo();
        },
      }),
      el('span', { class: 'escolha__texto' },
        el('strong', {}, opcao.nome),
        el('span', {}, opcao.prazo)),
      el('span', { class: 'escolha__preco' }, opcao.preco === 0 ? 'Sem custo' : formatarPreco(opcao.preco)))));

  const tela = moldura('entrega', 'Entrega', el('form', {
    class: 'etapa',
    novalidate: true,
    onConferido: resumoAcompanha(campos, resumoErro),
    onSubmit: (evento) => {
      evento.preventDefault();
      if (conferirCampos(campos, resumoErro)) location.hash = '#/checkout/pagamento';
    },
  },
  botaoFicticio(() => campos.forEach((item) => item.preencher(DADOS_FICTICIOS.entrega[item.campoNome]))),
  el('div', { class: 'etapa__campos' }, campos),
  opcoes,
  resumoErro,
  rodapeEtapa('#/checkout/dados', 'Voltar aos dados', 'Continuar para o pagamento')), rascunho.idEntrega);

  function atualizarResumo() {
    tela.querySelector('.resumo').replaceWith(resumoLateral(rascunho.idEntrega));
  }
  return tela;
}

function etapaPagamento() {
  const resumoErro = el('p', { class: 'campo__erro campo__erro--geral', role: 'alert', hidden: true });
  const campos = [
    campo('cartao', 'numero', { rotulo: 'Número do cartão de teste', modo: 'numeric', mascara: mascaras.cartao, ajuda: `Só este número é aceito: ${CARTAO_DE_TESTE}. Nunca digite um cartão real.`, classe: 'campo--largo' }),
    campo('cartao', 'titular', { rotulo: 'Nome impresso', classe: 'campo--largo' }),
    campo('cartao', 'validade', { rotulo: 'Validade (MM/AA)', modo: 'numeric', mascara: mascaras.validade }),
    campo('cartao', 'cvv', { rotulo: 'Código de segurança', modo: 'numeric', mascara: mascaras.cvv }),
  ];
  const areaCartao = el('div', { class: 'etapa__cartao' },
    botaoFicticio(() => campos.forEach((item) => item.preencher(DADOS_FICTICIOS.cartao[item.campoNome]))),
    el('div', { class: 'etapa__campos' }, campos));
  const areaPix = el('p', { class: 'nota nota--caixa' }, 'No Pix simulado nenhum código é gerado. Ao confirmar, o pedido entra como se o pagamento tivesse sido aprovado.');

  function mostrar() {
    areaCartao.hidden = rascunho.pagamento !== 'cartao';
    areaPix.hidden = rascunho.pagamento !== 'pix';
    resumoErro.hidden = true;
  }

  const opcoes = el('fieldset', { class: 'escolhas' },
    el('legend', {}, 'Forma de pagamento (simulada)'),
    Object.entries(PAGAMENTOS).map(([id, nome]) => el('label', { class: 'escolha' },
      el('input', {
        type: 'radio',
        name: 'pagamento',
        value: id,
        checked: rascunho.pagamento === id,
        onChange: () => {
          rascunho.pagamento = id;
          mostrar();
        },
      }),
      el('span', { class: 'escolha__texto' }, el('strong', {}, nome)))));

  mostrar();
  return moldura('pagamento', 'Pagamento', el('form', {
    class: 'etapa',
    novalidate: true,
    onConferido: resumoAcompanha(campos, resumoErro),
    onSubmit: (evento) => {
      evento.preventDefault();
      if (rascunho.pagamento === 'pix' || conferirCampos(campos, resumoErro)) location.hash = '#/checkout/revisao';
    },
  },
  opcoes,
  areaPix,
  areaCartao,
  resumoErro,
  rodapeEtapa('#/checkout/entrega', 'Voltar à entrega', 'Revisar o pedido')), rascunho.idEntrega);
}

function etapaRevisao() {
  const { dados, entrega } = rascunho;
  const opcaoEntrega = ENTREGAS.find((opcao) => opcao.id === rascunho.idEntrega);
  const final = rascunho.pagamento === 'cartao' ? rascunho.cartao.numero.slice(-4) : '';
  const blocos = [
    ['Seus dados', '#/checkout/dados', [dados.nome, dados.email, dados.telefone]],
    ['Entrega', '#/checkout/entrega', [
      `${entrega.endereco}, ${entrega.numero}${entrega.complemento ? `, ${entrega.complemento}` : ''}`,
      `${entrega.bairro}, ${entrega.cidade}/${entrega.uf}, CEP ${entrega.cep}`,
      `${opcaoEntrega.nome}: ${opcaoEntrega.prazo.toLowerCase()}`,
    ]],
    ['Pagamento', '#/checkout/pagamento', [final ? `${PAGAMENTOS.cartao} com final ${final}` : PAGAMENTOS.pix]],
  ];

  return moldura('revisao', 'Revisão', el('form', {
    class: 'etapa',
    onSubmit: (evento) => {
      evento.preventDefault();
      const pedido = fecharPedido({
        nome: dados.nome.trim(),
        cidade: entrega.cidade.trim(),
        uf: entrega.uf,
        idEntrega: rascunho.idEntrega,
        pagamento: rascunho.pagamento,
      });
      if (!pedido) {
        location.hash = '#/carrinho';
        return;
      }
      rascunho = rascunhoVazio();
      location.hash = `#/pedido/${pedido.numero}`;
    },
  },
  el('div', { class: 'revisao' }, blocos.map(([titulo, destino, linhas]) => el('section', { class: 'revisao__bloco' },
    el('h2', {}, titulo),
    linhas.map((linha) => el('p', {}, linha)),
    el('a', { class: 'botao-texto', href: destino, 'aria-label': `Alterar ${titulo.toLowerCase()}` }, 'Alterar')))),
  rodapeEtapa('#/checkout/pagamento', 'Voltar ao pagamento', 'Confirmar pedido simulado')), rascunho.idEntrega);
}

const TELAS = { dados: etapaDados, entrega: etapaEntrega, pagamento: etapaPagamento, revisao: etapaRevisao };

/** Devolve a tela da etapa, ou um redirecionamento quando a etapa ainda não pode abrir. */
export function telaCheckout({ etapa }) {
  conferirCarrinho();
  if (itensDoCarrinho().length === 0) return { redirecionar: '#/carrinho' };
  if (!TELAS[etapa]) return { redirecionar: '#/checkout/dados' };
  const ordem = ETAPAS.map((item) => item.id);
  const pendente = primeiraPendente();
  if (ordem.indexOf(etapa) > ordem.indexOf(pendente)) return { redirecionar: `#/checkout/${pendente}` };
  return { tela: TELAS[etapa]() };
}
