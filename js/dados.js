/*
 * Catálogo da loja de demonstração.
 * Todas as marcas, modelos, preços e quantidades abaixo são inventados.
 * Numa loja real, estes dados viriam de um banco de dados.
 */

export const TAMANHOS = [34, 35, 36, 37, 38, 39, 40, 41, 42, 43, 44];

export const CATEGORIAS = [
  { id: 'casual', nome: 'Casual' },
  { id: 'corrida', nome: 'Corrida' },
  { id: 'basquete', nome: 'Basquete' },
  { id: 'skate', nome: 'Skate' },
  { id: 'trilha', nome: 'Trilha' },
];

/* A cor da caixa identifica a marca na prateleira. */
export const MARCAS = {
  piuva: { nome: 'Piúva', simbolo: 'flor', caixa: '#d92e74', tampa: '#a81c55' },
  vazante: { nome: 'Vazante', simbolo: 'aguas', caixa: '#0b7f8c', tampa: '#075a64' },
  caranda: { nome: 'Carandá', simbolo: 'leque', caixa: '#ee5f1c', tampa: '#b94510' },
  tabocal: { nome: 'Tabocal', simbolo: 'gomo', caixa: '#3f8a35', tampa: '#2c6425' },
};

const TINTA = '#12133a';
const BRANCO = '#f7f8fc';

/** Monta o estoque a partir de uma lista alinhada com TAMANHOS (34 a 44). */
function grade(...quantidades) {
  return Object.fromEntries(TAMANHOS.map((tamanho, i) => [tamanho, quantidades[i] ?? 0]));
}

export const PRODUTOS = [
  {
    id: 'praca-88',
    nome: 'Praça 88',
    marca: 'piuva',
    categoria: 'casual',
    silhueta: 'quadra',
    preco: 38990,
    cor: 'Branco, rosa e amarelo',
    descricao: 'O cano baixo para o dia inteiro: calça rápido, combina com quase tudo e aguenta a volta a pé para casa.',
    ficha: [['Cabedal', 'Couro sintético'], ['Solado', 'Borracha colada e costurada'], ['Peso do par', '780 g (fictício)']],
    estoque: grade(2, 3, 4, 5, 6, 6, 5, 4, 3, 2, 1),
    cores: { cabedal: BRANCO, painel: '#e23a7c', detalhe: '#ffe11a', entressola: '#ffffff', sola: TINTA, cadarco: '#ffffff', forro: TINTA, linguetaCor: '#c9cde0', marca: '#e23a7c' },
  },
  {
    id: 'correnteza-3',
    nome: 'Correnteza 3',
    marca: 'vazante',
    categoria: 'corrida',
    silhueta: 'corrida',
    preco: 62990,
    cor: 'Azul-petróleo e laranja',
    descricao: 'Espuma alta no calcanhar e ponta curvada para treinos longos em asfalto. A malha respira bem no calor.',
    ficha: [['Cabedal', 'Malha respirável'], ['Entressola', 'Espuma de alto retorno'], ['Queda', '8 mm (fictício)']],
    estoque: grade(0, 2, 3, 4, 5, 5, 6, 5, 4, 2, 1),
    cores: { cabedal: '#0b7f8c', painel: '#075a64', detalhe: '#b5f2e6', entressola: BRANCO, sola: '#ff6a2b', cadarco: BRANCO, forro: TINTA, linguetaCor: '#075a64', marca: BRANCO, costura: BRANCO },
  },
  {
    id: 'garrafao-alto',
    nome: 'Garrafão Alto',
    marca: 'caranda',
    categoria: 'basquete',
    silhueta: 'cano',
    preco: 71990,
    cor: 'Vermelho e branco',
    descricao: 'Cano alto com gola acolchoada para segurar o tornozelo nas mudanças de direção embaixo da cesta.',
    ficha: [['Cabedal', 'Couro sintético reforçado'], ['Gola', 'Acolchoada'], ['Solado', 'Borracha para quadra']],
    estoque: grade(0, 0, 1, 2, 3, 4, 4, 5, 4, 3, 2),
    cores: { cabedal: BRANCO, painel: '#d3202f', detalhe: '#d3202f', entressola: '#ffffff', sola: '#d3202f', cadarco: '#ffffff', forro: TINTA, linguetaCor: '#d3202f', marca: '#d3202f' },
  },
  {
    id: 'manobra-vulc',
    nome: 'Manobra Vulc',
    marca: 'tabocal',
    categoria: 'skate',
    silhueta: 'skate',
    preco: 29990,
    cor: 'Mostarda e creme',
    descricao: 'Sola reta vulcanizada para sentir a prancha, com reforço de camurça no lado que mais gasta.',
    ficha: [['Cabedal', 'Camurça sintética'], ['Solado', 'Vulcanizado'], ['Biqueira', 'Borracha']],
    estoque: grade(1, 2, 3, 3, 4, 5, 5, 4, 3, 2, 0),
    cores: { cabedal: '#e0a526', painel: '#b67f12', detalhe: '#f3e3c0', entressola: '#fbf3e0', sola: '#7b4a12', cadarco: '#fbf3e0', forro: TINTA, linguetaCor: '#b67f12', marca: TINTA },
  },
  {
    id: 'canga-trek',
    nome: 'Canga Trek',
    marca: 'tabocal',
    categoria: 'trilha',
    silhueta: 'trilha',
    preco: 68990,
    cor: 'Musgo e ferrugem',
    descricao: 'Cano médio e cravos fundos para chão de terra e pedra solta. A borracha sobe na ponta para proteger os dedos.',
    ficha: [['Cabedal', 'Lona encerada'], ['Solado', 'Cravos de 5 mm'], ['Palmilha', 'Removível']],
    estoque: grade(0, 1, 2, 3, 4, 4, 5, 5, 4, 3, 2),
    cores: { cabedal: '#5b6b3a', painel: '#3e4a26', detalhe: '#c7561f', entressola: '#e8e4d4', sola: '#2a2a22', cadarco: '#e8c34a', forro: TINTA, linguetaCor: '#3e4a26', marca: '#e8e4d4', costura: '#e8e4d4' },
  },
  {
    id: 'praca-88-noite',
    nome: 'Praça 88 Noite',
    marca: 'piuva',
    categoria: 'casual',
    silhueta: 'quadra',
    preco: 41990,
    cor: 'Marinho e lilás',
    descricao: 'O mesmo cano baixo do Praça 88, em versão escura que esconde a poeira e vai bem com calça social.',
    ficha: [['Cabedal', 'Couro sintético fosco'], ['Solado', 'Borracha colada e costurada'], ['Peso do par', '790 g (fictício)']],
    estoque: grade(1, 1, 2, 3, 3, 4, 4, 3, 2, 1, 1),
    cores: { cabedal: '#20245e', painel: '#14173f', detalhe: '#b9a6f2', entressola: '#e8e8f4', sola: '#b9a6f2', cadarco: '#e8e8f4', forro: '#0b0c28', linguetaCor: '#14173f', marca: '#20245e', costura: '#e8e8f4' },
  },
  {
    id: 'cheia-leve',
    nome: 'Cheia Leve',
    marca: 'vazante',
    categoria: 'corrida',
    silhueta: 'corrida',
    preco: 54990,
    cor: 'Limão e cinza',
    descricao: 'O modelo mais leve da marca, feito para ritmo forte e distâncias curtas. Abre mão de um pouco de amortecimento.',
    ficha: [['Cabedal', 'Tela fina'], ['Entressola', 'Espuma leve'], ['Peso do par', '420 g (fictício)']],
    estoque: grade(1, 2, 2, 3, 3, 3, 3, 3, 2, 1, 0),
    cores: { cabedal: '#d6e84a', painel: '#8f9aa8', detalhe: TINTA, entressola: '#ffffff', sola: '#5d6673', cadarco: TINTA, forro: TINTA, linguetaCor: '#8f9aa8', marca: TINTA },
  },
  {
    id: 'tabela-mid',
    nome: 'Tabela Mid',
    marca: 'caranda',
    categoria: 'basquete',
    silhueta: 'cano',
    preco: 65990,
    cor: 'Roxo e amarelo',
    descricao: 'Gola baixa em relação ao Garrafão, para quem joga na velocidade e prefere o tornozelo mais solto.',
    ficha: [['Cabedal', 'Sintético perfurado'], ['Gola', 'Média'], ['Solado', 'Borracha para quadra']],
    estoque: grade(0, 0, 0, 2, 2, 3, 3, 4, 3, 2, 1),
    cores: { cabedal: '#5a2ca0', painel: '#3f1c78', detalhe: '#ffd21f', entressola: '#fff7d6', sola: '#ffd21f', cadarco: '#fff7d6', forro: TINTA, linguetaCor: '#3f1c78', marca: '#ffd21f', costura: '#fff7d6' },
  },
  {
    id: 'corrimao',
    nome: 'Corrimão',
    marca: 'tabocal',
    categoria: 'skate',
    silhueta: 'skate',
    preco: 27990,
    cor: 'Tijolo e branco',
    descricao: 'O mais simples e mais barato da loja: lona, sola reta e nada que atrapalhe. Laceia nos primeiros dias.',
    ficha: [['Cabedal', 'Lona'], ['Solado', 'Vulcanizado'], ['Biqueira', 'Borracha']],
    estoque: grade(2, 3, 3, 4, 4, 4, 4, 3, 3, 2, 1),
    cores: { cabedal: '#b5452a', painel: '#8c3019', detalhe: BRANCO, entressola: BRANCO, sola: TINTA, cadarco: BRANCO, forro: TINTA, linguetaCor: '#8c3019', marca: TINTA, costura: BRANCO },
  },
  {
    id: 'morro-alto',
    nome: 'Morro Alto',
    marca: 'tabocal',
    categoria: 'trilha',
    silhueta: 'trilha',
    preco: 74990,
    cor: 'Areia e azul',
    descricao: 'Para caminhadas de mais de um dia: cabedal duro, palmilha grossa e bastante espaço para os dedos.',
    ficha: [['Cabedal', 'Couro sintético e lona'], ['Solado', 'Cravos de 6 mm'], ['Palmilha', 'Dupla densidade']],
    estoque: grade(0, 0, 1, 1, 2, 2, 3, 2, 2, 1, 1),
    cores: { cabedal: '#d8c39a', painel: '#a58a58', detalhe: '#2a5fc4', entressola: '#f4efe2', sola: TINTA, cadarco: '#2a5fc4', forro: TINTA, linguetaCor: '#a58a58', marca: TINTA },
  },
  {
    id: 'rebote-alto',
    nome: 'Rebote Alto',
    marca: 'caranda',
    categoria: 'basquete',
    silhueta: 'cano',
    preco: 58990,
    cor: 'Grafite e laranja',
    descricao: 'Versão de entrada do cano alto, com sola mais dura. Boa para quadra de cimento, onde a borracha gasta mais.',
    ficha: [['Cabedal', 'Sintético'], ['Gola', 'Acolchoada'], ['Solado', 'Borracha dura']],
    estoque: grade(0, 0, 1, 2, 2, 3, 3, 3, 3, 2, 2),
    cores: { cabedal: '#3b3f4d', painel: '#25283a', detalhe: '#ff7a2b', entressola: '#eceef4', sola: '#ff7a2b', cadarco: '#ff7a2b', forro: TINTA, linguetaCor: '#25283a', marca: '#ff7a2b', costura: '#eceef4' },
  },
  {
    id: 'coreto-baixo',
    nome: 'Coreto Baixo',
    marca: 'piuva',
    categoria: 'casual',
    silhueta: 'quadra',
    preco: 34990,
    cor: 'Areia e verde',
    descricao: 'Cor neutra e sola creme para quem quer um tênis que não chame atenção. O mais fácil de combinar da marca.',
    ficha: [['Cabedal', 'Camurça sintética'], ['Solado', 'Borracha'], ['Peso do par', '740 g (fictício)']],
    estoque: grade(3, 3, 4, 4, 4, 3, 3, 2, 2, 1, 1),
    cores: { cabedal: '#e6d9bf', painel: '#2f6b4f', detalhe: '#2f6b4f', entressola: '#fbf3e0', sola: '#c89a5b', cadarco: '#fbf3e0', forro: TINTA, linguetaCor: '#c9b896', marca: '#fbf3e0' },
  },
  {
    id: 'meio-fio',
    nome: 'Meio-fio',
    marca: 'tabocal',
    categoria: 'skate',
    silhueta: 'skate',
    preco: 31990,
    cor: 'Azul-celeste e rosa',
    descricao: 'Cabedal duplo no lado da manobra e cadarço reforçado, que demora mais para arrebentar.',
    ficha: [['Cabedal', 'Camurça dupla'], ['Solado', 'Vulcanizado'], ['Cadarço', 'Reforçado']],
    estoque: grade(1, 1, 2, 2, 2, 3, 3, 2, 1, 0, 0),
    cores: { cabedal: '#7cc6ec', painel: '#3f8fc0', detalhe: '#f6a6c4', entressola: BRANCO, sola: '#e0568a', cadarco: BRANCO, forro: TINTA, linguetaCor: '#3f8fc0', marca: TINTA },
  },
  {
    id: 'estiagem-pro',
    nome: 'Estiagem Pro',
    marca: 'vazante',
    categoria: 'corrida',
    silhueta: 'corrida',
    preco: 79990,
    cor: 'Branco e azul',
    descricao: 'O topo de linha da marca, para prova. Este modelo começa esgotado para mostrar como a loja trata produto sem estoque.',
    ficha: [['Cabedal', 'Malha técnica'], ['Entressola', 'Espuma com placa rígida'], ['Peso do par', '440 g (fictício)']],
    estoque: grade(0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0),
    cores: { cabedal: BRANCO, painel: '#2a48d8', detalhe: '#2a48d8', entressola: '#ffffff', sola: '#2a48d8', cadarco: '#2a48d8', forro: TINTA, linguetaCor: '#c9cde0', marca: '#2a48d8' },
  },
];

export const CUPONS = {
  DEMO10: { percentual: 10, descricao: '10% de desconto nos produtos' },
};

export const ENTREGAS = [
  { id: 'economica', nome: 'Entrega econômica', prazo: '7 a 10 dias úteis', preco: 1990 },
  { id: 'expressa', nome: 'Entrega expressa', prazo: '2 a 3 dias úteis', preco: 3990 },
  { id: 'retirada', nome: 'Retirar na loja', prazo: 'Pronto em 1 dia útil', preco: 0 },
];

export const PAGAMENTOS = {
  pix: 'Pix simulado',
  cartao: 'Cartão de teste',
};

/* Números de teste: passam na validação, mas não pertencem a ninguém de propósito. */
export const CARTAO_DE_TESTE = '4242 4242 4242 4242';

export const DADOS_FICTICIOS = {
  dados: { nome: 'Cliente Fictício', email: 'cliente@example.com', cpf: '111.444.777-35', telefone: '(65) 90000-0000' },
  entrega: { cep: '78000-000', endereco: 'Rua de Exemplo', numero: '123', complemento: '', bairro: 'Centro', cidade: 'Cuiabá', uf: 'MT' },
  cartao: { numero: CARTAO_DE_TESTE, titular: 'CLIENTE FICTICIO', validade: '12/35', cvv: '123' },
};

export const UFS = ['AC', 'AL', 'AM', 'AP', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA', 'MG', 'MS', 'MT', 'PA', 'PB', 'PE', 'PI', 'PR', 'RJ', 'RN', 'RO', 'RR', 'RS', 'SC', 'SE', 'SP', 'TO'];

export const STATUS_PEDIDO = ['Recebido', 'Separando', 'Enviado', 'Entregue'];

export function produtoPorId(id) {
  return PRODUTOS.find((produto) => produto.id === id);
}
