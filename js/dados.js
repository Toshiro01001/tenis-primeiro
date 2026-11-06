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
  piuva: { nome: 'Piúva', simbolo: 'flor', caixa: '#c8102e', tampa: '#8f0b21', texto: '#ffffff', icone: '#ff4d63' },
  vazante: { nome: 'Vazante', simbolo: 'aguas', caixa: '#1c1c1f', tampa: '#0d0d0f', texto: '#d9a92f', icone: '#f3eee2' },
  caranda: { nome: 'Carandá', simbolo: 'leque', caixa: '#d9a92f', tampa: '#a67c17', texto: '#0b0b0c', icone: '#e0b13a' },
  tabocal: { nome: 'Tabocal', simbolo: 'gomo', caixa: '#6e0f1c', tampa: '#4d0a14', texto: '#f3eee2', icone: '#d98a96' },
};

const TINTA = '#060606';
const BRANCO = '#f3eee2';

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
    cor: 'Preto, vermelho e dourado',
    descricao: 'O cano baixo para o dia inteiro: calça rápido, combina com quase tudo e aguenta a volta a pé para casa.',
    ficha: [['Cabedal', 'Couro sintético'], ['Solado', 'Borracha colada e costurada'], ['Peso do par', '780 g (fictício)']],
    estoque: grade(2, 3, 4, 5, 6, 6, 5, 4, 3, 2, 1),
    cores: { cabedal: '#18181b', painel: '#c8102e', detalhe: '#d9a92f', entressola: '#f3eee2', sola: '#18181b', cadarco: '#f3eee2', forro: '#0a0a0a', linguetaCor: '#3a3a3f', marca: '#d9a92f', costura: '#f3eee2' },
  },
  {
    id: 'correnteza-3',
    nome: 'Correnteza 3',
    marca: 'vazante',
    categoria: 'corrida',
    silhueta: 'corrida',
    preco: 62990,
    cor: 'Vermelho e dourado',
    descricao: 'Espuma alta no calcanhar e ponta curvada para treinos longos em asfalto. A malha respira bem no calor.',
    ficha: [['Cabedal', 'Malha respirável'], ['Entressola', 'Espuma de alto retorno'], ['Queda', '8 mm (fictício)']],
    estoque: grade(0, 2, 3, 4, 5, 5, 6, 5, 4, 2, 1),
    cores: { cabedal: '#c8102e', painel: '#6e0f1c', detalhe: '#d9a92f', entressola: '#f3eee2', sola: '#d9a92f', cadarco: '#f3eee2', forro: '#0a0a0a', linguetaCor: '#6e0f1c', marca: '#d9a92f', costura: '#f3eee2' },
  },
  {
    id: 'garrafao-alto',
    nome: 'Garrafão Alto',
    marca: 'caranda',
    categoria: 'basquete',
    silhueta: 'cano',
    preco: 71990,
    cor: 'Branco e vermelho',
    descricao: 'Cano alto com gola acolchoada para segurar o tornozelo nas mudanças de direção embaixo da cesta.',
    ficha: [['Cabedal', 'Couro sintético reforçado'], ['Gola', 'Acolchoada'], ['Solado', 'Borracha para quadra']],
    estoque: grade(0, 0, 1, 2, 3, 4, 4, 5, 4, 3, 2),
    cores: { cabedal: '#f3eee2', painel: '#c8102e', detalhe: '#c8102e', entressola: '#f3eee2', sola: '#c8102e', cadarco: '#f3eee2', forro: '#0a0a0a', linguetaCor: '#c8102e', marca: '#c8102e' },
  },
  {
    id: 'manobra-vulc',
    nome: 'Manobra Vulc',
    marca: 'tabocal',
    categoria: 'skate',
    silhueta: 'skate',
    preco: 29990,
    cor: 'Dourado e preto',
    descricao: 'Sola reta vulcanizada para sentir a prancha, com reforço de camurça no lado que mais gasta.',
    ficha: [['Cabedal', 'Camurça sintética'], ['Solado', 'Vulcanizado'], ['Biqueira', 'Borracha']],
    estoque: grade(1, 2, 3, 3, 4, 5, 5, 4, 3, 2, 0),
    cores: { cabedal: '#d9a92f', painel: '#a67c17', detalhe: '#18181b', entressola: '#f3eee2', sola: '#18181b', cadarco: '#18181b', forro: '#0a0a0a', linguetaCor: '#a67c17', marca: '#18181b' },
  },
  {
    id: 'canga-trek',
    nome: 'Canga Trek',
    marca: 'tabocal',
    categoria: 'trilha',
    silhueta: 'trilha',
    preco: 68990,
    cor: 'Grafite e dourado',
    descricao: 'Cano médio e cravos fundos para chão de terra e pedra solta. A borracha sobe na ponta para proteger os dedos.',
    ficha: [['Cabedal', 'Lona encerada'], ['Solado', 'Cravos de 5 mm'], ['Palmilha', 'Removível']],
    estoque: grade(0, 1, 2, 3, 4, 4, 5, 5, 4, 3, 2),
    cores: { cabedal: '#3a3a3f', painel: '#18181b', detalhe: '#d9a92f', entressola: '#f3eee2', sola: '#18181b', cadarco: '#d9a92f', forro: '#0a0a0a', linguetaCor: '#18181b', marca: '#d9a92f', costura: '#f3eee2' },
  },
  {
    id: 'praca-88-noite',
    nome: 'Praça 88 Noite',
    marca: 'piuva',
    categoria: 'casual',
    silhueta: 'quadra',
    preco: 41990,
    cor: 'Preto e cinza',
    descricao: 'O mesmo cano baixo do Praça 88, em versão escura que esconde a poeira e vai bem com calça social.',
    ficha: [['Cabedal', 'Couro sintético fosco'], ['Solado', 'Borracha colada e costurada'], ['Peso do par', '790 g (fictício)']],
    estoque: grade(1, 1, 2, 3, 3, 4, 4, 3, 2, 1, 1),
    cores: { cabedal: '#18181b', painel: '#26262a', detalhe: '#3a3a3f', entressola: '#26262a', sola: '#18181b', cadarco: '#f3eee2', forro: '#0a0a0a', linguetaCor: '#3a3a3f', marca: '#f3eee2', costura: '#d9a92f' },
  },
  {
    id: 'cheia-leve',
    nome: 'Cheia Leve',
    marca: 'vazante',
    categoria: 'corrida',
    silhueta: 'corrida',
    preco: 54990,
    cor: 'Branco e dourado',
    descricao: 'O modelo mais leve da marca, feito para ritmo forte e distâncias curtas. Abre mão de um pouco de amortecimento.',
    ficha: [['Cabedal', 'Tela fina'], ['Entressola', 'Espuma leve'], ['Peso do par', '420 g (fictício)']],
    estoque: grade(1, 2, 2, 3, 3, 3, 3, 3, 2, 1, 0),
    cores: { cabedal: '#f3eee2', painel: '#d9a92f', detalhe: '#18181b', entressola: '#f3eee2', sola: '#d9a92f', cadarco: '#18181b', forro: '#0a0a0a', linguetaCor: '#d9a92f', marca: '#d9a92f' },
  },
  {
    id: 'tabela-mid',
    nome: 'Tabela Mid',
    marca: 'caranda',
    categoria: 'basquete',
    silhueta: 'cano',
    preco: 65990,
    cor: 'Vinho e dourado',
    descricao: 'Gola baixa em relação ao Garrafão, para quem joga na velocidade e prefere o tornozelo mais solto.',
    ficha: [['Cabedal', 'Sintético perfurado'], ['Gola', 'Média'], ['Solado', 'Borracha para quadra']],
    estoque: grade(0, 0, 0, 2, 2, 3, 3, 4, 3, 2, 1),
    cores: { cabedal: '#6e0f1c', painel: '#4d0a14', detalhe: '#d9a92f', entressola: '#f3eee2', sola: '#d9a92f', cadarco: '#f3eee2', forro: '#0a0a0a', linguetaCor: '#4d0a14', marca: '#d9a92f', costura: '#f3eee2' },
  },
  {
    id: 'corrimao',
    nome: 'Corrimão',
    marca: 'tabocal',
    categoria: 'skate',
    silhueta: 'skate',
    preco: 27990,
    cor: 'Preto e vermelho',
    descricao: 'O mais simples e mais barato da loja: lona, sola reta e nada que atrapalhe. Laceia nos primeiros dias.',
    ficha: [['Cabedal', 'Lona'], ['Solado', 'Vulcanizado'], ['Biqueira', 'Borracha']],
    estoque: grade(2, 3, 3, 4, 4, 4, 4, 3, 3, 2, 1),
    cores: { cabedal: '#18181b', painel: '#c8102e', detalhe: '#f3eee2', entressola: '#f3eee2', sola: '#c8102e', cadarco: '#c8102e', forro: '#0a0a0a', linguetaCor: '#c8102e', marca: '#f3eee2', costura: '#d9a92f' },
  },
  {
    id: 'morro-alto',
    nome: 'Morro Alto',
    marca: 'tabocal',
    categoria: 'trilha',
    silhueta: 'trilha',
    preco: 74990,
    cor: 'Creme e vermelho',
    descricao: 'Para caminhadas de mais de um dia: cabedal duro, palmilha grossa e bastante espaço para os dedos.',
    ficha: [['Cabedal', 'Couro sintético e lona'], ['Solado', 'Cravos de 6 mm'], ['Palmilha', 'Dupla densidade']],
    estoque: grade(0, 0, 1, 1, 2, 2, 3, 2, 2, 1, 1),
    cores: { cabedal: '#e6dcc6', painel: '#b9ad94', detalhe: '#c8102e', entressola: '#f3eee2', sola: '#18181b', cadarco: '#c8102e', forro: '#0a0a0a', linguetaCor: '#b9ad94', marca: '#c8102e' },
  },
  {
    id: 'rebote-alto',
    nome: 'Rebote Alto',
    marca: 'caranda',
    categoria: 'basquete',
    silhueta: 'cano',
    preco: 58990,
    cor: 'Grafite e vermelho',
    descricao: 'Versão de entrada do cano alto, com sola mais dura. Boa para quadra de cimento, onde a borracha gasta mais.',
    ficha: [['Cabedal', 'Sintético'], ['Gola', 'Acolchoada'], ['Solado', 'Borracha dura']],
    estoque: grade(0, 0, 1, 2, 2, 3, 3, 3, 3, 2, 2),
    cores: { cabedal: '#3a3a3f', painel: '#26262a', detalhe: '#c8102e', entressola: '#f3eee2', sola: '#c8102e', cadarco: '#c8102e', forro: '#0a0a0a', linguetaCor: '#26262a', marca: '#c8102e', costura: '#d9a92f' },
  },
  {
    id: 'coreto-baixo',
    nome: 'Coreto Baixo',
    marca: 'piuva',
    categoria: 'casual',
    silhueta: 'quadra',
    preco: 34990,
    cor: 'Creme e preto',
    descricao: 'Cor neutra e sola creme para quem quer um tênis que não chame atenção. O mais fácil de combinar da marca.',
    ficha: [['Cabedal', 'Camurça sintética'], ['Solado', 'Borracha'], ['Peso do par', '740 g (fictício)']],
    estoque: grade(3, 3, 4, 4, 4, 3, 3, 2, 2, 1, 1),
    cores: { cabedal: '#e6dcc6', painel: '#18181b', detalhe: '#18181b', entressola: '#f3eee2', sola: '#d9a92f', cadarco: '#f3eee2', forro: '#0a0a0a', linguetaCor: '#b9ad94', marca: '#d9a92f' },
  },
  {
    id: 'meio-fio',
    nome: 'Meio-fio',
    marca: 'tabocal',
    categoria: 'skate',
    silhueta: 'skate',
    preco: 31990,
    cor: 'Vermelho e branco',
    descricao: 'Cabedal duplo no lado da manobra e cadarço reforçado, que demora mais para arrebentar.',
    ficha: [['Cabedal', 'Camurça dupla'], ['Solado', 'Vulcanizado'], ['Cadarço', 'Reforçado']],
    estoque: grade(1, 1, 2, 2, 2, 3, 3, 2, 1, 0, 0),
    cores: { cabedal: '#c8102e', painel: '#6e0f1c', detalhe: '#f3eee2', entressola: '#f3eee2', sola: '#6e0f1c', cadarco: '#f3eee2', forro: '#0a0a0a', linguetaCor: '#6e0f1c', marca: '#f3eee2', costura: '#d9a92f' },
  },
  {
    id: 'estiagem-pro',
    nome: 'Estiagem Pro',
    marca: 'vazante',
    categoria: 'corrida',
    silhueta: 'corrida',
    preco: 79990,
    cor: 'Preto e dourado',
    descricao: 'O topo de linha da marca, para prova. Este modelo começa esgotado para mostrar como a loja trata produto sem estoque.',
    ficha: [['Cabedal', 'Malha técnica'], ['Entressola', 'Espuma com placa rígida'], ['Peso do par', '440 g (fictício)']],
    estoque: grade(0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0),
    cores: { cabedal: '#18181b', painel: '#d9a92f', detalhe: '#d9a92f', entressola: '#f3eee2', sola: '#d9a92f', cadarco: '#d9a92f', forro: '#0a0a0a', linguetaCor: '#d9a92f', marca: '#d9a92f', costura: '#f3eee2' },
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
