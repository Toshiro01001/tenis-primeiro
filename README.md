# Pinhoso’s Kicks

![Página inicial da loja Pinhoso's Kicks](docs/tela.webp)

Fiz esta loja virtual de demonstração para mostrar, na prática, como uma loja na internet funciona: a pessoa escolhe um tênis, coloca no carrinho, fecha a compra e o pedido aparece do lado de quem vende. **Pinhoso’s Kicks é um nome fictício, e todas as marcas, modelos, preços, estoques e pedidos foram inventados.** Nada aqui está à venda, nenhum pagamento é feito e nenhum dado digitado sai do seu navegador.

Publicada em: <https://toshiro01001.github.io/tenis-primeiro/>

## Como testar em 2 minutos

1. Abra o site e clique em um tênis da vitrine. Se quiser, use a busca ou o botão **Filtros** para achar o seu número.
2. Escolha o tamanho e aperte **Adicionar ao carrinho**.
3. No carrinho, teste o cupom `DEMO10` (10% nos produtos) e aperte **Continuar para os dados**.
4. Em cada etapa da compra há um botão **Preencher com dados fictícios**, para você não precisar digitar nada seu. Só o cartão de teste `4242 4242 4242 4242` é aceito.
5. Confirme o pedido simulado. Depois abra **Lojista**, no topo, para ver o pedido e mexer no estoque como se fosse o dono da loja.

Se quiser recomeçar do zero, a área do lojista tem o botão **Restaurar dados de exemplo**.

## O que tem

- **Abertura:** role a página e o tênis se monta, peça por peça (solado, cabedal, cadarço e marca), com uma etiqueta para cada parte. Ao lado fica a **escolha rápida**: troque o modelo, escolha o tamanho e aperte **Adicionar ao carrinho** sem sair do topo. No celular, a escolha rápida aparece logo abaixo da abertura.
- **Vitrine:** tênis em cima da própria caixa, com busca, filtros (categoria, tamanho, faixa de preço, marca) e ordenação. Os filtros ficam no endereço, então uma busca pode ser enviada por link.
- **Página de produto:** escolha de tamanho e quantidade limitada ao estoque daquele tamanho. Produto sem estoque aparece como esgotado.
- **Carrinho:** fica salvo no navegador (feche a aba e volte, e continua lá), com o cupom de exemplo `DEMO10`.
- **Compra simulada em 4 etapas:** dados, entrega, pagamento e revisão, com conferência de cada campo e botão para preencher tudo com dados fictícios.
- **Resumo do pedido:** desenhado como etiqueta de expedição.
- **Área do lojista:** pedidos simulados, situação de cada pedido (recebido, separando, enviado, entregue) e edição do estoque por tamanho. Tem um botão para restaurar os dados de exemplo.
- **Como isto funciona:** botão na abertura e no rodapé com a explicação em linguagem simples e um bloco de detalhes técnicos para quem quiser ir mais fundo.

## Como funciona, em linguagem comum

É uma página só. O que muda é a parte do endereço depois do `#` (por exemplo, `#/carrinho`): o código lê essa parte e desenha a tela certa, sem recarregar a página. Por isso o site funciona em hospedagem gratuita de arquivos, como o GitHub Pages, sem precisar de servidor.

O catálogo é uma lista de produtos guardada no próprio site. Carrinho, cupom, estoque e pedidos ficam na memória do navegador (um espaço chamado `localStorage`, que só este site e só este aparelho enxergam). Se essa memória estiver bloqueada ou com dado estragado, a loja continua funcionando e ignora o que for inválido.

Na compra, cada campo tem a sua regra: o CPF e o número do cartão têm os dígitos conferidos de verdade, mas só o cartão de teste é aceito, e CPF, e-mail, endereço e cartão não são guardados em lugar nenhum. O pedido salvo guarda apenas nome, cidade e UF.

Os tênis não são fotos: são desenhos feitos em código (SVG, um formato de imagem que não perde qualidade ao ampliar), com cinco formatos e uma paleta de cores por modelo.

A montagem da abertura usa esse mesmo desenho. Cada camada do tênis começa fora do lugar, e o código devolve cada uma conforme a página rola. Não é vídeo nem uma sequência de imagens, então quase não pesa, nem no celular. Quem ativa "reduzir movimento" no aparelho vê o tênis já montado, sem a rolagem longa.

O visual mistura a identidade da loja (preto, dourado, vermelho, letra condensada, fita de obra e caixas de tênis) com um estilo de vitrine noturna: painéis de vidro, brilho vermelho atrás do tênis e elementos que surgem ao rolar.

## O que dá para adaptar a um negócio real

Os produtos e suas variações (tamanho de roupa, voltagem, sabor), as fotos, a identidade visual, os cupons, as opções de entrega e os relatórios da área do lojista.

## O que uma loja real precisaria a mais

Servidor e banco de dados, login do lojista, intermediador de pagamento (Pix e cartão de verdade), cálculo de frete, nota fiscal e política de privacidade. O código já está separado para receber essas partes.

## Detalhes técnicos

### Tecnologias

HTML, CSS e JavaScript puros (módulos ES), SVG e `localStorage`. Sem framework, sem etapa de build e sem CDN. A fonte é a [Archivo](https://github.com/Omnibus-Type/Archivo), licença SIL Open Font (`assets/fontes/OFL.txt`), servida do próprio repositório.

- Roteamento por hash (`#/produto/praca-88`, `#/checkout/entrega`). Cada etapa do checkout tem endereço próprio, e o código impede pular etapas pelo endereço.
- Os preços são guardados em centavos (inteiros), para não haver erro de arredondamento.
- O CPF usa os dígitos verificadores reais e o cartão usa o algoritmo de Luhn; as máscaras formatam enquanto se digita.
- As ilustrações são geradas por código em `js/tenis-svg.js`.

### Segurança e privacidade

- A política de segurança de conteúdo (CSP, na `<meta>` do `index.html`) só permite arquivos do próprio site e proíbe conexões e envio de formulários (`connect-src 'none'`, `form-action 'none'`). A página não tem como mandar dados para fora.
- Todo texto entra na tela por `textContent`, nunca por `innerHTML`.
- CPF, e-mail, endereço e cartão ficam só na memória enquanto a compra está aberta. O pedido salvo guarda apenas nome, cidade e UF.
- O repositório é público e não contém senhas, chaves nem dados pessoais.

### Organização dos arquivos

```
index.html            estrutura fixa: topo, rodapé e o diálogo "Como isto funciona"
404.html              página de endereço não encontrado do GitHub Pages
css/base.css          fonte, cores e tipografia
css/componentes.css   botões, caixa de tênis, campos, diálogo
css/telas.css         disposição de cada tela
css/tema.css          identidade (preto, dourado, vermelho, vidro e brilho) e a abertura, carregada por último
js/app.js             roteador
js/dados.js           catálogo, cupons, opções de entrega
js/estado.js          carrinho, estoque, pedidos e localStorage
js/validacao.js       regras e máscaras dos campos
js/tenis-svg.js       ilustrações dos tênis
js/dom.js             ajudantes para montar a tela com segurança
js/componentes.js     peças usadas em mais de uma tela
js/abertura.js        tênis que se monta com a rolagem e escolha rápida
js/telas/             uma tela por arquivo
assets/               ícone, fonte e textura de grão
tests/                teste de ponta a ponta
```

### Como rodar no seu computador

Precisa de um servidor local, porque módulos JavaScript não abrem direto do arquivo:

```bash
python3 -m http.server 8000
```

Depois abra <http://localhost:8000>. Não há instalação nem etapa de build.

### Testes

O teste percorre os fluxos reais em 1366x800, iPhone 13 e 320 px, e confere console limpo, ausência de rolagem lateral, estoque, validações e armazenamento bloqueado. Usa Playwright com Chromium instalados de forma global:

```bash
NODE_PATH=$(npm root -g) node tests/fluxos.test.cjs
```

---

Demonstração feita por [Mil e Uma Linhas!](https://mileumalinhas.com.br)

Desenvolvi este projeto e usei o Claude, da Anthropic, como ferramenta durante o desenvolvimento.
