/*
 * Teste de ponta a ponta da loja: percorre os fluxos de verdade em três telas.
 *
 * Como rodar (Playwright e Chromium instalados de forma global):
 *   NODE_PATH=$(npm root -g) node tests/fluxos.test.cjs
 * Para também salvar as capturas de tela:
 *   CAPTURAS=/caminho/da/pasta NODE_PATH=$(npm root -g) node tests/fluxos.test.cjs
 *
 * O próprio teste serve os arquivos em localhost, sem dependências além do Playwright.
 */

const fs = require('node:fs');
const http = require('node:http');
const path = require('node:path');
const { chromium, devices } = require('playwright');

const RAIZ = path.resolve(__dirname, '..');
const PASTA_CAPTURAS = process.env.CAPTURAS || null;
const TIPOS = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8', '.svg': 'image/svg+xml', '.woff2': 'font/woff2' };

const { defaultBrowserType: _ignorado, ...IPHONE_13 } = devices['iPhone 13'];
const TELAS = [
  { nome: 'computador', arquivo: 'computador', contexto: { viewport: { width: 1366, height: 800 }, deviceScaleFactor: 2 } },
  { nome: 'iPhone 13', arquivo: 'celular', contexto: { ...IPHONE_13, deviceScaleFactor: 2 } },
  { nome: '320 px', arquivo: '320px', contexto: { viewport: { width: 320, height: 640 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true } },
];

let passou = 0;
const falhas = [];

function conferir(rotulo, condicao, detalhe = '') {
  if (condicao) {
    passou += 1;
  } else {
    falhas.push(`${rotulo}${detalhe !== '' ? ` (${detalhe})` : ''}`);
    console.log(`  FALHOU: ${rotulo} ${detalhe}`);
  }
}

function iniciarServidor() {
  const servidor = http.createServer((pedido, resposta) => {
    const caminho = decodeURIComponent(pedido.url.split('?')[0]);
    const arquivo = path.join(RAIZ, caminho === '/' ? 'index.html' : caminho);
    if (!arquivo.startsWith(RAIZ) || !fs.existsSync(arquivo) || fs.statSync(arquivo).isDirectory()) {
      resposta.writeHead(404);
      resposta.end();
      return;
    }
    resposta.writeHead(200, { 'Content-Type': TIPOS[path.extname(arquivo)] || 'application/octet-stream' });
    fs.createReadStream(arquivo).pipe(resposta);
  });
  return new Promise((resolve) => servidor.listen(0, '127.0.0.1', () => resolve(servidor)));
}

/** Abre uma página que registra erros de console, erros de script e pedidos de rede. */
async function abrirPagina(contexto, tela, registro) {
  const pagina = await contexto.newPage();
  pagina.setDefaultTimeout(6000);
  pagina.on('console', (mensagem) => {
    if (['error', 'warning'].includes(mensagem.type())) registro.console.push(`${tela.nome}: ${mensagem.text()}`);
  });
  pagina.on('pageerror', (erro) => registro.console.push(`${tela.nome}: ${erro.message}`));
  pagina.on('requestfailed', (pedido) => registro.console.push(`${tela.nome}: falha em ${pedido.url()}`));
  pagina.on('request', (pedido) => {
    const url = new URL(pedido.url());
    if (url.hostname !== '127.0.0.1') registro.externos.push(pedido.url());
    if (pedido.method() !== 'GET') registro.envios.push(pedido.url());
  });
  return pagina;
}

async function semRolagemLateral(pagina, tela, rotulo) {
  /* Aproveita a passagem por cada tela para procurar lixo de programação no texto. */
  const lixo = await pagina.evaluate(() => (document.querySelector('main').innerText.match(/\b(false|true|undefined|null|NaN)\b|\[object/g) || []).join());
  conferir(`${tela.nome}, ${rotulo}: sem lixo no texto`, lixo === '', lixo);
  const medidas = await pagina.evaluate(() => ({
    pagina: document.documentElement.scrollWidth,
    corpo: document.body.scrollWidth,
    janela: document.documentElement.clientWidth,
  }));
  conferir(`${tela.nome}, ${rotulo}: sem rolagem lateral`, medidas.pagina <= medidas.janela && medidas.corpo <= medidas.janela, JSON.stringify(medidas));
}

/** No celular, botões e links em forma de botão precisam de ao menos 44 px de altura. */
async function alvosDeToque(pagina, tela, rotulo) {
  if (!tela.contexto.hasTouch) return;
  const pequenos = await pagina.evaluate(() => [...document.querySelectorAll('button, .botao, .botao-texto, .topo__nav a, .tamanho, .opcao')]
    .filter((alvo) => alvo.offsetParent !== null)
    .map((alvo) => ({ texto: (alvo.getAttribute('aria-label') || alvo.textContent).trim().slice(0, 30), altura: Math.round(alvo.getBoundingClientRect().height) }))
    .filter((alvo) => alvo.altura > 0 && alvo.altura < 44));
  conferir(`${tela.nome}, ${rotulo}: alvos de toque com 44 px`, pequenos.length === 0, JSON.stringify(pequenos));
}

async function capturar(pagina, tela, nome, inteira = true) {
  if (!PASTA_CAPTURAS) return;
  /* As capturas de 320 px servem para conferência, em subpasta. */
  const pasta = tela.arquivo === '320px' ? path.join(PASTA_CAPTURAS, '320px') : PASTA_CAPTURAS;
  fs.mkdirSync(pasta, { recursive: true });
  /* Para a captura: sem o aviso temporário e sem o topo fixo no meio da imagem. */
  await pagina.evaluate((inteiraPagina) => {
    document.getElementById('avisos').replaceChildren();
    if (inteiraPagina) window.scrollTo(0, 0);
  }, inteira);
  await pagina.waitForTimeout(120);
  await pagina.screenshot({ path: path.join(pasta, `${tela.arquivo}-${nome}.png`), fullPage: inteira });
}

const irPara = async (pagina, destino) => {
  await pagina.evaluate((hash) => { location.hash = hash; }, destino);
  await pagina.waitForTimeout(40);
};

const contagem = (pagina) => pagina.locator('.prateleira .caixa').count();

async function ajustarFaixa(pagina, rotulo, valor) {
  await pagina.locator(`input[aria-label="${rotulo}"]`).evaluate((controle, novo) => {
    controle.value = novo;
    controle.dispatchEvent(new Event('input', { bubbles: true }));
  }, String(valor));
}

async function abrirFiltrosSeFechados(pagina) {
  const alternar = pagina.locator('.vitrine__alternar');
  if (await alternar.isVisible() && (await alternar.getAttribute('aria-expanded')) === 'false') await alternar.click();
}

/** Arrasta de verdade o controle de preço máximo: com o mouse e, no celular, com o dedo. */
async function arrastarFaixa(pagina, tela) {
  await abrirFiltrosSeFechados(pagina);
  const trilho = pagina.locator('.faixa__controles');
  await trilho.scrollIntoViewIfNeeded();
  const caixa = await trilho.boundingBox();
  const y = caixa.y + caixa.height / 2;
  const deX = caixa.x + caixa.width - 12;
  const ateX = caixa.x + caixa.width * 0.5;
  if (tela.contexto.hasTouch) {
    const cdp = await pagina.context().newCDPSession(pagina);
    const toque = (type, x) => cdp.send('Input.dispatchTouchEvent', { type, touchPoints: type === 'touchEnd' ? [] : [{ x, y }] });
    await toque('touchStart', deX);
    for (let passo = 1; passo <= 8; passo += 1) await toque('touchMove', deX + ((ateX - deX) * passo) / 8);
    await toque('touchEnd');
  } else {
    await pagina.mouse.move(deX, y);
    await pagina.mouse.down();
    await pagina.mouse.move(ateX, y, { steps: 8 });
    await pagina.mouse.up();
  }
  const maximo = Number(await pagina.locator('input[aria-label="Preço máximo"]').inputValue());
  conferir(`${tela.nome}: controle de preço arrasta (${tela.contexto.hasTouch ? 'toque' : 'mouse'})`, maximo < 800 && maximo > 400, maximo);
  /* O segundo controle precisa continuar acessível depois do primeiro. */
  conferir(`${tela.nome}: arraste filtra a vitrine`, await contagem(pagina) < 14, await contagem(pagina));
}

const precoEmCentavos = (texto) => Number(texto.replace(/\D/g, ''));

async function fluxoVitrine(pagina, tela, base) {
  await pagina.goto(base);
  await pagina.waitForSelector('.caixa');
  await pagina.waitForTimeout(800);

  conferir(`${tela.nome}: rótulo de demonstração visível`, await pagina.getByText('Loja de demonstração: os produtos e preços são fictícios', { exact: true }).isVisible());
  conferir(`${tela.nome}: 14 modelos na vitrine`, await contagem(pagina) === 14);
  conferir(`${tela.nome}: nome da loja no título`, (await pagina.locator('h1').innerText()).replace(/\s+/g, ' ').toUpperCase() === 'PINHOSO’S KICKS');
  const rodape = pagina.locator('.rodape__assinatura');
  conferir(`${tela.nome}: assinatura no rodapé`, (await rodape.innerText()).trim() === 'Demonstração feita por Mil e Uma Linhas!');
  const link = rodape.locator('a');
  conferir(`${tela.nome}: link com rel seguro`, await link.getAttribute('href') === 'https://mileumalinhas.com.br' && await link.getAttribute('rel') === 'noopener noreferrer');
  await semRolagemLateral(pagina, tela, 'vitrine');
  await alvosDeToque(pagina, tela, 'vitrine');
  await capturar(pagina, tela, '01-vitrine-topo', false);
  await capturar(pagina, tela, '02-vitrine-inteira');

  await pagina.fill('#busca', 'praca');
  conferir(`${tela.nome}: busca ignora acentos`, await contagem(pagina) === 2, await contagem(pagina));
  conferir(`${tela.nome}: busca vai para o endereço`, (await pagina.evaluate(() => location.hash)).includes('busca=praca'));
  await pagina.reload();
  await pagina.waitForSelector('.caixa');
  conferir(`${tela.nome}: filtro sobrevive ao recarregar`, await contagem(pagina) === 2 && await pagina.inputValue('#busca') === 'praca');
  await pagina.fill('#busca', 'modelo que nao existe');
  conferir(`${tela.nome}: estado vazio da busca`, await pagina.getByRole('heading', { name: 'Nenhum tênis com esses filtros' }).isVisible());
  await pagina.locator('.vazio').getByRole('button', { name: 'Limpar filtros' }).click();
  conferir(`${tela.nome}: limpar volta aos 14`, await contagem(pagina) === 14);

  await abrirFiltrosSeFechados(pagina);
  await pagina.locator('.opcao', { hasText: 'Basquete' }).click();
  conferir(`${tela.nome}: filtro de categoria`, await contagem(pagina) === 3);
  await pagina.locator('.opcoes--tamanhos .opcao', { hasText: '34' }).click();
  conferir(`${tela.nome}: categoria e tamanho sem estoque dão vazio`, await contagem(pagina) === 0);
  await pagina.locator('.opcoes--tamanhos .opcao', { hasText: '34' }).click();
  await pagina.locator('.opcoes--tamanhos .opcao', { hasText: '36' }).click();
  conferir(`${tela.nome}: filtro de tamanho`, await contagem(pagina) === 2, await contagem(pagina));
  await capturar(pagina, tela, '03-vitrine-filtrada');
  await pagina.locator('.vitrine__estado').getByRole('button', { name: 'Limpar filtros' }).click();

  await abrirFiltrosSeFechados(pagina);
  await ajustarFaixa(pagina, 'Preço máximo', 300);
  conferir(`${tela.nome}: faixa de preço máxima`, await contagem(pagina) === 2, await contagem(pagina));
  await ajustarFaixa(pagina, 'Preço mínimo', 700);
  const faixa = await pagina.locator('.faixa__valores').innerText();
  conferir(`${tela.nome}: controles de preço não se cruzam`, faixa.includes('290') && faixa.includes('300'), faixa);
  await pagina.locator('.vitrine__estado').getByRole('button', { name: 'Limpar filtros' }).click();

  await arrastarFaixa(pagina, tela);
  await pagina.locator('.vitrine__estado').getByRole('button', { name: 'Limpar filtros' }).click();

  await pagina.selectOption('#ordem', 'menor-preco');
  let precos = (await pagina.locator('.prateleira .selo-preco:not(.selo-preco--esgotado)').allInnerTexts()).map(precoEmCentavos);
  conferir(`${tela.nome}: ordena do menor preço`, precos.every((preco, i) => i === 0 || precos[i - 1] <= preco) && precos[0] === 27990, precos.join());
  await pagina.selectOption('#ordem', 'maior-preco');
  precos = (await pagina.locator('.prateleira .selo-preco:not(.selo-preco--esgotado)').allInnerTexts()).map(precoEmCentavos);
  conferir(`${tela.nome}: ordena do maior preço`, precos.every((preco, i) => i === 0 || precos[i - 1] >= preco), precos.join());
  conferir(`${tela.nome}: esgotado fica no fim`, (await pagina.locator('.prateleira .caixa').last().getAttribute('data-produto')) === 'estiagem-pro');
  await pagina.selectOption('#ordem', 'nome');
  conferir(`${tela.nome}: ordena por nome`, (await pagina.locator('.etiqueta__nome').first().textContent()).trim() === 'Canga Trek');

  /* Sair para um produto e voltar mantém a busca. */
  await pagina.fill('#busca', 'vazante');
  await pagina.locator('.caixa', { hasText: 'Correnteza 3' }).locator('.caixa__tenis').scrollIntoViewIfNeeded();
  const rolagemAntes = await pagina.evaluate(() => window.scrollY);
  /* Clique por coordenada: o desenho do tênis também precisa levar ao produto. */
  const tenis = await pagina.locator('.caixa', { hasText: 'Correnteza 3' }).locator('.caixa__tenis').boundingBox();
  await pagina.mouse.click(tenis.x + tenis.width / 2, tenis.y + tenis.height / 2);
  await pagina.waitForSelector('.produto__nome');
  conferir(`${tela.nome}: rota do produto`, (await pagina.evaluate(() => location.hash)) === '#/produto/correnteza-3');
  conferir(`${tela.nome}: foco vai ao título ao trocar de tela`, await pagina.evaluate(() => document.activeElement?.tagName) === 'H1');
  await pagina.getByRole('link', { name: 'Voltar à vitrine' }).click();
  await pagina.waitForSelector('.caixa');
  conferir(`${tela.nome}: voltar mantém a busca`, await pagina.inputValue('#busca') === 'vazante' && await contagem(pagina) === 3, await contagem(pagina));
  const rolagemDepois = await pagina.evaluate(() => window.scrollY);
  conferir(`${tela.nome}: voltar mantém a rolagem`, Math.abs(rolagemDepois - rolagemAntes) <= 2, `${rolagemAntes} e ${rolagemDepois}`);
  await pagina.locator('.vitrine__estado').getByRole('button', { name: 'Limpar filtros' }).click();
  await pagina.selectOption('#ordem', 'destaques');
}

async function fluxoProduto(pagina, tela) {
  await irPara(pagina, '#/produto/praca-88');
  await pagina.waitForSelector('.produto__nome');
  await semRolagemLateral(pagina, tela, 'produto');
  await alvosDeToque(pagina, tela, 'produto');

  await pagina.getByRole('button', { name: 'Adicionar ao carrinho' }).click();
  conferir(`${tela.nome}: pede tamanho antes de adicionar`, await pagina.locator('#erro-tamanho').isVisible());
  await capturar(pagina, tela, '04-produto-sem-tamanho');

  await pagina.locator('.tamanho', { hasText: '44' }).click();
  conferir(`${tela.nome}: avisa último par`, (await pagina.locator('.produto__situacao').innerText()).includes('Último par'));
  conferir(`${tela.nome}: erro some ao escolher`, !(await pagina.locator('#erro-tamanho').isVisible()));
  conferir(`${tela.nome}: quantidade limitada pelo estoque`, await pagina.getByRole('button', { name: 'Aumentar quantidade de pares' }).isDisabled());
  await pagina.getByRole('button', { name: 'Adicionar ao carrinho' }).click();
  conferir(`${tela.nome}: contador do carrinho`, (await pagina.locator('#contador-carrinho').innerText()) === '1');
  conferir(`${tela.nome}: botão trava sem estoque livre`, await pagina.getByRole('button', { name: 'Adicionar ao carrinho' }).isDisabled());

  await pagina.locator('.tamanho', { hasText: '40' }).click();
  await pagina.getByRole('button', { name: 'Aumentar quantidade de pares' }).click();
  await pagina.getByRole('button', { name: 'Aumentar quantidade de pares' }).click();
  await pagina.getByRole('button', { name: 'Adicionar ao carrinho' }).click();
  conferir(`${tela.nome}: soma ao contador`, (await pagina.locator('#contador-carrinho').innerText()) === '4');
  await capturar(pagina, tela, '05-produto');

  await irPara(pagina, '#/produto/correnteza-3');
  await pagina.waitForSelector('.produto__nome');
  conferir(`${tela.nome}: tamanho sem estoque fica travado`, await pagina.locator('.tamanho input[value="34"]').isDisabled());
  conferir(`${tela.nome}: tamanho com estoque liberado`, await pagina.locator('.tamanho input[value="40"]').isEnabled());

  await irPara(pagina, '#/produto/estiagem-pro');
  await pagina.waitForSelector('.produto__nome');
  conferir(`${tela.nome}: produto esgotado não compra`, await pagina.getByRole('button', { name: 'Esgotado' }).isDisabled());

  await irPara(pagina, '#/produto/nao-existe');
  conferir(`${tela.nome}: produto inexistente tem resposta`, await pagina.getByRole('heading', { name: 'Esta página não existe' }).isVisible());
  await irPara(pagina, '#/rota-inventada');
  conferir(`${tela.nome}: rota inexistente tem resposta`, await pagina.getByRole('heading', { name: 'Esta página não existe' }).isVisible());
}

async function fluxoCarrinho(pagina, tela) {
  await pagina.reload();
  await irPara(pagina, '#/carrinho');
  await pagina.waitForSelector('.linha');
  conferir(`${tela.nome}: carrinho persiste ao recarregar`, await pagina.locator('.linha').count() === 2 && (await pagina.locator('#contador-carrinho').innerText()) === '4');
  await semRolagemLateral(pagina, tela, 'carrinho');
  await alvosDeToque(pagina, tela, 'carrinho');

  const linha40 = pagina.locator('.linha', { hasText: 'Tamanho 40' });
  const mais = linha40.getByRole('button', { name: /^Aumentar/ });
  await mais.click();
  await mais.click();
  conferir(`${tela.nome}: carrinho para no estoque`, (await linha40.locator('.quantidade__valor').innerText()) === '5' && await mais.isDisabled());
  await linha40.getByRole('button', { name: /^Diminuir/ }).click();
  await linha40.getByRole('button', { name: /^Diminuir/ }).click();
  await linha40.getByRole('button', { name: /^Diminuir/ }).click();
  conferir(`${tela.nome}: diminuir quantidade`, (await linha40.locator('.quantidade__valor').innerText()) === '2');

  await pagina.fill('#cupom', 'XPTO');
  await pagina.getByRole('button', { name: 'Aplicar' }).click();
  conferir(`${tela.nome}: cupom inválido explica o erro`, (await pagina.locator('#erro-cupom').innerText()).includes('não existe'));
  await pagina.fill('#cupom', 'demo10');
  await pagina.getByRole('button', { name: 'Aplicar' }).click();
  const desconto = await pagina.locator('.valores__desconto dd').innerText();
  conferir(`${tela.nome}: cupom dá 10% (3 pares de R$ 389,90)`, precoEmCentavos(desconto) === 11697, desconto);
  conferir(`${tela.nome}: total com cupom`, precoEmCentavos(await pagina.locator('.valores__total dd').innerText()) === 105273);
  await capturar(pagina, tela, '06-carrinho');

  await pagina.locator('.linha', { hasText: 'Tamanho 44' }).getByRole('button', { name: /^Remover/ }).click();
  conferir(`${tela.nome}: remover linha`, await pagina.locator('.linha').count() === 1);
  await pagina.reload();
  await pagina.waitForSelector('.valores__desconto');
  conferir(`${tela.nome}: cupom persiste ao recarregar`, await pagina.locator('.valores__desconto').isVisible());
}

async function fluxoCheckout(pagina, tela, base, registro) {
  await irPara(pagina, '#/checkout/revisao');
  await pagina.waitForSelector('.tela-checkout');
  conferir(`${tela.nome}: não pula etapas`, (await pagina.evaluate(() => location.hash)) === '#/checkout/dados');
  conferir(`${tela.nome}: aviso de simulação no checkout`, await pagina.getByText('Nenhum dado sai deste navegador').isVisible());
  await semRolagemLateral(pagina, tela, 'checkout, dados');
  await alvosDeToque(pagina, tela, 'checkout, dados');

  await pagina.getByRole('button', { name: 'Continuar para a entrega' }).click();
  conferir(`${tela.nome}: dados vazios não avançam`, (await pagina.evaluate(() => location.hash)) === '#/checkout/dados');
  conferir(`${tela.nome}: erro em cada campo`, await pagina.locator('.etapa__campos .campo__erro:visible').count() === 4);
  conferir(`${tela.nome}: foco no primeiro erro`, await pagina.evaluate(() => document.activeElement?.id) === 'campo-dados-nome');
  await capturar(pagina, tela, '07-checkout-erros');

  await pagina.fill('#campo-dados-nome', 'Fulano');
  await pagina.fill('#campo-dados-email', 'sem-arroba');
  await pagina.locator('#campo-dados-cpf').pressSequentially('11111111111');
  await pagina.locator('#campo-dados-telefone').pressSequentially('659');
  await pagina.getByRole('button', { name: 'Continuar para a entrega' }).click();
  conferir(`${tela.nome}: nome exige sobrenome`, (await pagina.locator('#campo-dados-nome-erro').innerText()).includes('sobrenome'));
  conferir(`${tela.nome}: e-mail inválido`, (await pagina.locator('#campo-dados-email-erro').innerText()).includes('formato'));
  conferir(`${tela.nome}: máscara de CPF`, await pagina.inputValue('#campo-dados-cpf') === '111.111.111-11');
  conferir(`${tela.nome}: CPF de dígitos repetidos recusado`, (await pagina.locator('#campo-dados-cpf-erro').innerText()).includes('inválido'));
  conferir(`${tela.nome}: telefone incompleto`, await pagina.locator('#campo-dados-telefone-erro').isVisible());

  await pagina.getByRole('button', { name: 'Preencher com dados fictícios' }).click();
  conferir(`${tela.nome}: dados fictícios limpam erros`, await pagina.locator('.etapa .campo__erro:visible').count() === 0);
  await pagina.getByRole('button', { name: 'Continuar para a entrega' }).click();
  await pagina.waitForSelector('#campo-entrega-cep');

  await semRolagemLateral(pagina, tela, 'checkout, entrega');
  await pagina.getByRole('button', { name: 'Continuar para o pagamento' }).click();
  conferir(`${tela.nome}: entrega vazia não avança`, await pagina.locator('.etapa__campos .campo__erro:visible').count() === 6, await pagina.locator('.etapa__campos .campo__erro:visible').count());
  await pagina.getByRole('button', { name: 'Preencher com dados fictícios' }).click();
  conferir(`${tela.nome}: UF selecionada`, await pagina.inputValue('#campo-entrega-uf') === 'MT');
  await pagina.locator('.escolha', { hasText: 'Entrega expressa' }).click();
  conferir(`${tela.nome}: frete entra no total`, (await pagina.locator('.resumo .valores').innerText()).includes('39,90'));
  await capturar(pagina, tela, '08-checkout-entrega');

  await pagina.getByRole('button', { name: 'Continuar para o pagamento' }).click();
  await pagina.waitForSelector('.escolhas');
  await pagina.goBack();
  await pagina.waitForSelector('#campo-entrega-cep');
  conferir(`${tela.nome}: botão voltar mantém os dados`, await pagina.inputValue('#campo-entrega-cep') === '78000-000');
  await pagina.goForward();
  await pagina.waitForSelector('.escolhas');

  await semRolagemLateral(pagina, tela, 'checkout, pagamento');
  await pagina.locator('.escolha', { hasText: 'Cartão de teste' }).click();
  await pagina.getByRole('button', { name: 'Revisar o pedido' }).click();
  conferir(`${tela.nome}: cartão vazio não avança`, await pagina.locator('.etapa__campos .campo__erro:visible').count() === 4);
  await pagina.locator('#campo-cartao-numero').pressSequentially('5555555555554444');
  await pagina.locator('#campo-cartao-numero').blur();
  conferir(`${tela.nome}: recusa cartão fora do teste`, (await pagina.locator('#campo-cartao-numero-erro').innerText()).includes('Não digite um cartão real'));
  await pagina.locator('#campo-cartao-validade').pressSequentially('0120');
  await pagina.locator('#campo-cartao-validade').blur();
  conferir(`${tela.nome}: recusa validade vencida`, (await pagina.locator('#campo-cartao-validade-erro').innerText()).includes('já passou'));
  conferir(`${tela.nome}: resumo de erros acompanha a contagem`, (await pagina.locator('.campo__erro--geral').innerText()).includes('4 campos'));
  await pagina.getByRole('button', { name: 'Preencher com dados fictícios' }).click();
  conferir(`${tela.nome}: resumo de erros some ao corrigir`, await pagina.locator('.etapa .campo__erro:visible').count() === 0);
  await capturar(pagina, tela, '09-checkout-pagamento');
  await pagina.getByRole('button', { name: 'Revisar o pedido' }).click();
  await pagina.waitForSelector('.revisao');

  await semRolagemLateral(pagina, tela, 'checkout, revisão');
  await alvosDeToque(pagina, tela, 'checkout, revisão');
  conferir(`${tela.nome}: revisão mostra só o final do cartão`, (await pagina.locator('.revisao').innerText()).includes('final 4242') && !(await pagina.locator('.revisao').innerText()).includes('4242 4242'));
  await capturar(pagina, tela, '10-checkout-revisao');

  await pagina.getByRole('button', { name: 'Confirmar pedido simulado' }).click();
  await pagina.waitForSelector('.expedicao');
  conferir(`${tela.nome}: número do pedido`, (await pagina.locator('.expedicao__numero').innerText()) === 'PK-0001');
  const textoPedido = await pagina.locator('.tela-pedido').innerText();
  conferir(`${tela.nome}: resumo diz que nada foi cobrado`, textoPedido.includes('Nada foi cobrado nem enviado'));
  /* 2 pares de R$ 389,90 = 77980; -10% = 70182; + 3990 de frete = 74172. */
  conferir(`${tela.nome}: total do pedido confere`, precoEmCentavos(await pagina.locator('.expedicao .valores__total dd').innerText()) === 74172);
  conferir(`${tela.nome}: carrinho esvaziado`, !(await pagina.locator('#contador-carrinho').isVisible()));
  await semRolagemLateral(pagina, tela, 'pedido');
  await capturar(pagina, tela, '11-pedido');

  const salvo = await pagina.evaluate(() => JSON.stringify({ ...localStorage }));
  conferir(`${tela.nome}: dados pessoais não ficam salvos`, !/111\.444|example\.com|Rua de Exemplo|4242|90000/.test(salvo));
  conferir(`${tela.nome}: nenhum envio de dados`, registro.envios.length === 0, registro.envios.join());
  conferir(`${tela.nome}: nenhum pedido para fora`, registro.externos.length === 0, registro.externos.join());

  await irPara(pagina, '#/produto/praca-88');
  await pagina.waitForSelector('.produto__nome');
  await pagina.locator('.tamanho', { hasText: '40' }).click();
  conferir(`${tela.nome}: estoque baixou com a compra`, (await pagina.locator('.produto__situacao').innerText()).startsWith('3 pares'), await pagina.locator('.produto__situacao').innerText());

  await irPara(pagina, '#/checkout/dados');
  await pagina.waitForSelector('.tela-carrinho');
  conferir(`${tela.nome}: checkout sem itens volta ao carrinho`, (await pagina.evaluate(() => location.hash)) === '#/carrinho');
  await semRolagemLateral(pagina, tela, 'carrinho vazio');
}

async function fluxoLojista(pagina, tela) {
  await irPara(pagina, '#/lojista');
  await pagina.waitForSelector('.pedido');
  conferir(`${tela.nome}: pedido aparece para o lojista`, (await pagina.locator('.pedido h2').first().innerText()) === 'PK-0001');
  await semRolagemLateral(pagina, tela, 'lojista, pedidos');
  await alvosDeToque(pagina, tela, 'lojista, pedidos');
  await pagina.selectOption('#status-PK-0001', 'Enviado');
  await pagina.reload();
  await pagina.waitForSelector('.pedido');
  conferir(`${tela.nome}: situação do pedido persiste`, await pagina.inputValue('#status-PK-0001') === 'Enviado');
  await capturar(pagina, tela, '12-lojista-pedidos');

  await pagina.getByRole('link', { name: 'Estoque' }).click();
  await pagina.waitForSelector('.estoque__produto');
  await semRolagemLateral(pagina, tela, 'lojista, estoque');
  await pagina.fill('#estoque-correnteza-3-34', '2');
  await pagina.locator('#estoque-correnteza-3-34').blur();
  conferir(`${tela.nome}: total do modelo acompanha`, (await pagina.locator('.estoque__produto', { hasText: 'Correnteza 3' }).locator('.estoque__total').innerText()) === '39 pares', await pagina.locator('.estoque__produto', { hasText: 'Correnteza 3' }).locator('.estoque__total').innerText());
  await pagina.fill('#estoque-correnteza-3-35', '-5');
  await pagina.locator('#estoque-correnteza-3-35').blur();
  conferir(`${tela.nome}: estoque negativo vira zero`, await pagina.inputValue('#estoque-correnteza-3-35') === '0');
  await pagina.fill('#busca-estoque', 'carandá');
  conferir(`${tela.nome}: busca do estoque`, await pagina.locator('.estoque__produto').count() === 3);
  await pagina.fill('#busca-estoque', '');
  await capturar(pagina, tela, '13-lojista-estoque');

  await irPara(pagina, '#/produto/correnteza-3');
  await pagina.waitForSelector('.produto__nome');
  conferir(`${tela.nome}: estoque novo libera tamanho`, await pagina.locator('.tamanho input[value="34"]').isEnabled());
  await pagina.locator('.tamanho', { hasText: '34' }).click();
  await pagina.getByRole('button', { name: 'Aumentar quantidade de pares' }).click();
  await pagina.getByRole('button', { name: 'Adicionar ao carrinho' }).click();

  /* O lojista reduz o estoque depois que o cliente colocou no carrinho. */
  await irPara(pagina, '#/lojista/estoque');
  await pagina.waitForSelector('.estoque__produto');
  await pagina.fill('#estoque-correnteza-3-34', '1');
  await pagina.locator('#estoque-correnteza-3-34').blur();
  await irPara(pagina, '#/carrinho');
  await pagina.waitForSelector('.linha');
  conferir(`${tela.nome}: carrinho se ajusta ao estoque novo`, (await pagina.locator('.alerta').innerText()).includes('restam 1') && (await pagina.locator('.quantidade__valor').innerText()) === '1');
  await pagina.locator('.linha__remover').click();

  await irPara(pagina, '#/lojista/estoque');
  await pagina.waitForSelector('.estoque__produto');
  await pagina.getByRole('button', { name: 'Restaurar dados de exemplo' }).click();
  await pagina.locator('#confirmar-restaurar').click();
  await pagina.waitForSelector('.estoque__produto');
  conferir(`${tela.nome}: restaurar volta o estoque`, await pagina.inputValue('#estoque-correnteza-3-34') === '0');
  await irPara(pagina, '#/lojista/pedidos');
  conferir(`${tela.nome}: restaurar apaga pedidos`, await pagina.getByRole('heading', { name: 'Nenhum pedido simulado ainda' }).isVisible());
}

async function fluxoComoFunciona(pagina, tela) {
  await irPara(pagina, '#/');
  await pagina.waitForSelector('.caixa');
  await pagina.locator('.abertura').getByRole('button', { name: 'Como isto funciona' }).click();
  const dialogo = pagina.locator('#como-funciona');
  conferir(`${tela.nome}: abre "Como isto funciona"`, await dialogo.isVisible());
  await capturar(pagina, tela, '14-como-funciona', false);
  await semRolagemLateral(pagina, tela, 'como funciona');
  await dialogo.getByRole('button', { name: 'Fechar' }).click();
  conferir(`${tela.nome}: fecha pelo botão`, !(await dialogo.isVisible()));
  await pagina.locator('.rodape').getByRole('button', { name: 'Como isto funciona' }).click();
  await pagina.keyboard.press('Escape');
  conferir(`${tela.nome}: fecha com Esc`, !(await dialogo.isVisible()));
}

/** Armazenamento bloqueado ou corrompido não pode derrubar a loja. */
async function fluxoArmazenamento(navegador, tela, base, registro) {
  const bloqueado = await navegador.newContext(tela.contexto);
  await bloqueado.addInitScript(() => {
    Object.defineProperty(window, 'localStorage', { get() { throw new DOMException('bloqueado', 'SecurityError'); } });
  });
  let pagina = await abrirPagina(bloqueado, tela, registro);
  await pagina.goto(`${base}#/produto/coreto-baixo`);
  await pagina.waitForSelector('.produto__nome');
  await pagina.locator('.tamanho', { hasText: '38' }).click();
  await pagina.getByRole('button', { name: 'Adicionar ao carrinho' }).click();
  conferir(`${tela.nome}: funciona sem localStorage`, (await pagina.locator('#contador-carrinho').innerText()) === '1');
  await bloqueado.close();

  const corrompido = await navegador.newContext(tela.contexto);
  await corrompido.addInitScript(() => {
    localStorage.setItem('pk.carrinho', '{ isto não é json');
    localStorage.setItem('pk.estoque', '{"praca-88":{"40":"<img src=x onerror=alert(1)>","41":-3}}');
    localStorage.setItem('pk.pedidos', '[{"numero":1},null]');
    localStorage.setItem('pk.cupom', '"INVENTADO"');
  });
  pagina = await abrirPagina(corrompido, tela, registro);
  await pagina.goto(`${base}#/produto/praca-88`);
  await pagina.waitForSelector('.produto__nome');
  await pagina.locator('.tamanho', { hasText: '40' }).click();
  conferir(`${tela.nome}: ignora dados salvos inválidos`, (await pagina.locator('.produto__situacao').innerText()).startsWith('5 pares'));
  await irPara(pagina, '#/lojista');
  conferir(`${tela.nome}: pedidos inválidos descartados`, await pagina.getByRole('heading', { name: 'Nenhum pedido simulado ainda' }).isVisible());
  await corrompido.close();
}

async function fluxoDuasAbas(navegador, tela, base, registro) {
  const contexto = await navegador.newContext(tela.contexto);
  const aba1 = await abrirPagina(contexto, tela, registro);
  const aba2 = await abrirPagina(contexto, tela, registro);
  await aba1.goto(`${base}#/produto/corrimao`);
  await aba2.goto(`${base}#/carrinho`);
  await aba1.waitForSelector('.produto__nome');
  await aba1.locator('.tamanho', { hasText: '40' }).click();
  await aba1.getByRole('button', { name: 'Adicionar ao carrinho' }).click();
  await aba2.waitForSelector('.linha');
  conferir(`${tela.nome}: carrinho sincroniza entre abas`, (await aba2.locator('#contador-carrinho').innerText()) === '1');
  await contexto.close();
}

async function fluxoTeclado(navegador, tela, base, registro) {
  const contexto = await navegador.newContext(tela.contexto);
  const pagina = await abrirPagina(contexto, tela, registro);
  await pagina.goto(`${base}#/produto/praca-88`);
  await pagina.waitForSelector('.produto__nome');
  await pagina.keyboard.press('Tab');
  conferir(`${tela.nome}: primeiro Tab no link de pular`, await pagina.evaluate(() => document.activeElement?.classList.contains('pular')));
  await pagina.locator('.tamanho input[value="38"]').focus();
  await pagina.keyboard.press('Space');
  conferir(`${tela.nome}: escolhe tamanho pelo teclado`, await pagina.locator('.tamanho input[value="38"]').isChecked());
  await pagina.keyboard.press('ArrowRight');
  conferir(`${tela.nome}: setas mudam o tamanho`, await pagina.locator('.tamanho input[value="39"]').isChecked());
  await contexto.close();
}

/** Regras dos campos, executadas no navegador. */
async function regrasDeValidacao(pagina, base) {
  await pagina.goto(base);
  const resultado = await pagina.evaluate(async () => {
    const { cpfValido, luhnValido, validar, mascaras } = await import('/js/validacao.js');
    return {
      cpfBom: cpfValido('111.444.777-35'),
      cpfDigitoErrado: cpfValido('111.444.777-36'),
      cpfRepetido: cpfValido('000.000.000-00'),
      cpfCurto: cpfValido('123'),
      luhnBom: luhnValido('4242 4242 4242 4242'),
      luhnRuim: luhnValido('4242 4242 4242 4241'),
      validadeMes: validar.validade('13/30'),
      validadeBoa: validar.validade('12/35', new Date('2026-11-05')),
      validadeVencida: validar.validade('10/26', new Date('2026-11-05')),
      validadeMesAtual: validar.validade('11/26', new Date('2026-11-15')),
      telefone10: mascaras.telefone('6532221111'),
      telefone11: mascaras.telefone('65999887766'),
      cep: mascaras.cep('78000000'),
      cartao: mascaras.cartao('4242424242424242999'),
    };
  });
  conferir('CPF válido aceito', resultado.cpfBom);
  conferir('CPF com dígito errado recusado', !resultado.cpfDigitoErrado);
  conferir('CPF repetido recusado', !resultado.cpfRepetido);
  conferir('CPF curto recusado', !resultado.cpfCurto);
  conferir('Luhn aceita número certo', resultado.luhnBom);
  conferir('Luhn recusa número errado', !resultado.luhnRuim);
  conferir('Validade: mês 13 recusado', resultado.validadeMes !== '');
  conferir('Validade futura aceita', resultado.validadeBoa === '');
  conferir('Validade vencida recusada', resultado.validadeVencida !== '');
  conferir('Validade no mês atual aceita', resultado.validadeMesAtual === '');
  conferir('Máscara de telefone fixo', resultado.telefone10 === '(65) 3222-1111', resultado.telefone10);
  conferir('Máscara de celular', resultado.telefone11 === '(65) 99988-7766', resultado.telefone11);
  conferir('Máscara de CEP', resultado.cep === '78000-000');
  conferir('Máscara de cartão corta o excesso', resultado.cartao === '4242 4242 4242 4242');
}

/** Regras do código e do texto, conferidas nos arquivos do repositório. */
function regrasDoCodigo() {
  const arquivos = [];
  const percorrer = (pasta) => {
    for (const nome of fs.readdirSync(pasta)) {
      if (['.git', 'node_modules', 'tests', 'fontes'].includes(nome)) continue;
      const caminho = path.join(pasta, nome);
      if (fs.statSync(caminho).isDirectory()) percorrer(caminho);
      else if (/\.(html|js|css|svg|md)$/.test(nome)) arquivos.push(caminho);
    }
  };
  percorrer(RAIZ);

  const procurar = (expressao, filtro = () => true) => arquivos
    .filter(filtro)
    .filter((arquivo) => expressao.test(fs.readFileSync(arquivo, 'utf8')))
    .map((arquivo) => path.relative(RAIZ, arquivo));

  /* Com limite de palavra, porque "espuma" contém o nome de uma das marcas. */
  const nomesProibidos = ['nike', 'adidas', 'air jordan', 'mizuno', 'puma'].join('|');
  let achados = procurar(new RegExp(`\\b(${nomesProibidos})\\b`, 'i'));
  conferir('Nenhuma marca real nos arquivos', achados.length === 0, achados.join());
  achados = procurar(/[–—]/);
  conferir('Nenhum travessão nos arquivos', achados.length === 0, achados.join());
  achados = procurar(/\.innerHTML|outerHTML|insertAdjacentHTML|document\.write|\beval\(/, (a) => a.endsWith('.js'));
  conferir('Sem innerHTML nem eval', achados.length === 0, achados.join());

  const pagina = fs.readFileSync(path.join(RAIZ, 'index.html'), 'utf8');
  conferir('CSP presente na página', pagina.includes('Content-Security-Policy'));
  conferir('Sem script nem estilo de terceiros', !/(src|href)="https?:\/\/(?!mileumalinhas\.com\.br)/.test(pagina));

  const leia = fs.readFileSync(path.join(RAIZ, 'README.md'), 'utf8').trim();
  conferir('README termina com a linha exigida', leia.endsWith('Desenvolvido por Rodrigo Terroso Junior. O Claude, da Anthropic, foi usado como ferramenta durante o desenvolvimento.'));
}

async function principal() {
  const servidor = await iniciarServidor();
  const base = `http://127.0.0.1:${servidor.address().port}/`;
  const navegador = await chromium.launch();
  const registroGeral = [];

  regrasDoCodigo();

  for (const tela of TELAS) {
    console.log(`Tela: ${tela.nome}`);
    const registro = { console: [], externos: [], envios: [] };
    const contexto = await navegador.newContext(tela.contexto);
    const pagina = await abrirPagina(contexto, tela, registro);

    await fluxoVitrine(pagina, tela, base);
    await fluxoProduto(pagina, tela);
    await fluxoCarrinho(pagina, tela);
    await fluxoCheckout(pagina, tela, base, registro);
    await fluxoLojista(pagina, tela);
    await fluxoComoFunciona(pagina, tela);
    if (tela.arquivo === 'computador') {
      await regrasDeValidacao(pagina, base);
      await fluxoTeclado(navegador, tela, base, registro);
    }
    await contexto.close();

    await fluxoArmazenamento(navegador, tela, base, registro);
    await fluxoDuasAbas(navegador, tela, base, registro);

    conferir(`${tela.nome}: console limpo`, registro.console.length === 0, registro.console.join(' | '));
    registroGeral.push(...registro.console);
  }

  await navegador.close();
  servidor.close();

  console.log(`\nConferências que passaram: ${passou}`);
  console.log(`Conferências que falharam: ${falhas.length}`);
  falhas.forEach((falha) => console.log(`  - ${falha}`));
  process.exit(falhas.length ? 1 : 0);
}

principal().catch((erro) => {
  console.error(erro);
  process.exit(2);
});
