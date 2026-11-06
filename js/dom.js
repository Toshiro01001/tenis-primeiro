/*
 * Ajudantes pequenos para montar a tela com segurança.
 *
 * Todo texto entra por textContent (nós de texto), nunca por innerHTML. Assim, nem
 * o que a pessoa digita nem o que está salvo no navegador conseguem virar código.
 */

/** Cria um elemento: el('p', { class: 'x', onClick: fn }, 'texto', outroElemento). */
export function el(tag, atributos = {}, ...filhos) {
  const elemento = document.createElement(tag);
  for (const [chave, valor] of Object.entries(atributos)) {
    if (valor === false || valor === null || valor === undefined) continue;
    if (chave.startsWith('on')) {
      elemento.addEventListener(chave.slice(2).toLowerCase(), valor);
    } else if (chave === 'class') {
      elemento.className = valor;
    } else if (chave === 'cssVars') {
      for (const [nome, cor] of Object.entries(valor)) elemento.style.setProperty(nome, cor);
    } else if (chave === 'value' || chave === 'checked' || chave === 'disabled' || chave === 'selected') {
      elemento[chave] = valor;
    } else {
      elemento.setAttribute(chave, valor === true ? '' : String(valor));
    }
  }
  elemento.append(...filhos.flat().filter((filho) => filho !== null && filho !== undefined && filho !== false));
  return elemento;
}

const moeda = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });

/** Os preços ficam em centavos (números inteiros) para não haver erro de arredondamento. */
export function formatarPreco(centavos) {
  return moeda.format(centavos / 100);
}

/** Tira acentos e maiúsculas: "Praça" e "praca" passam a ser a mesma busca. */
export function normalizar(texto) {
  return String(texto).normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().trim();
}

/** "1 par", "2 pares" etc. */
export function plural(quantidade, singular, varios) {
  return `${quantidade} ${quantidade === 1 ? singular : varios}`;
}

let temporizadorAviso;

/** Mostra um aviso curto na tela e o anuncia para leitores de tela. */
export function avisar(mensagem) {
  const area = document.getElementById('avisos');
  area.replaceChildren(el('p', { class: 'aviso' }, mensagem));
  clearTimeout(temporizadorAviso);
  temporizadorAviso = setTimeout(() => area.replaceChildren(), 4500);
}

/** Link externo sempre com rel seguro. */
export function linkExterno(endereco, texto) {
  return el('a', { href: endereco, target: '_blank', rel: 'noopener noreferrer' }, texto);
}
