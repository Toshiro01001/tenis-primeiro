/*
 * Regras dos campos do checkout. São funções puras: recebem um texto e devolvem
 * a mensagem de erro, ou uma string vazia se estiver tudo certo. Os dígitos
 * verificadores do CPF e do cartão são calculados de verdade.
 */

import { CARTAO_DE_TESTE } from './dados.js';

const soDigitos = (texto) => String(texto).replace(/\D/g, '');

export function cpfValido(texto) {
  const cpf = soDigitos(texto);
  if (cpf.length !== 11 || /^(\d)\1+$/.test(cpf)) return false;
  const digito = (tamanho) => {
    let soma = 0;
    for (let i = 0; i < tamanho; i += 1) soma += Number(cpf[i]) * (tamanho + 1 - i);
    const resto = (soma * 10) % 11;
    return resto === 10 ? 0 : resto;
  };
  return digito(9) === Number(cpf[9]) && digito(10) === Number(cpf[10]);
}

/* Algoritmo de Luhn: o mesmo cálculo que confere o último dígito de um cartão. */
export function luhnValido(texto) {
  const digitos = soDigitos(texto);
  if (digitos.length < 13) return false;
  let soma = 0;
  [...digitos].reverse().forEach((caractere, i) => {
    let valor = Number(caractere);
    if (i % 2 === 1) {
      valor *= 2;
      if (valor > 9) valor -= 9;
    }
    soma += valor;
  });
  return soma % 10 === 0;
}

export const validar = {
  nome(valor) {
    if (!valor.trim()) return 'Informe o nome completo.';
    return valor.trim().split(/\s+/).length < 2 ? 'Informe nome e sobrenome.' : '';
  },
  email(valor) {
    if (!valor.trim()) return 'Informe o e-mail.';
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(valor.trim()) ? '' : 'Use um e-mail no formato nome@exemplo.com.';
  },
  cpf(valor) {
    if (!valor.trim()) return 'Informe o CPF.';
    return cpfValido(valor) ? '' : 'CPF inválido: confira os 11 dígitos.';
  },
  telefone(valor) {
    const digitos = soDigitos(valor).length;
    if (!digitos) return 'Informe o telefone.';
    return digitos === 10 || digitos === 11 ? '' : 'Use DDD e número, como (65) 90000-0000.';
  },
  cep(valor) {
    if (!valor.trim()) return 'Informe o CEP.';
    return soDigitos(valor).length === 8 ? '' : 'O CEP tem 8 dígitos.';
  },
  obrigatorio(rotulo) {
    return (valor) => (valor.trim() ? '' : `Informe ${rotulo}.`);
  },
  opcional() {
    return '';
  },
  cartao(valor) {
    if (!soDigitos(valor)) return 'Informe o número do cartão de teste.';
    if (!luhnValido(valor)) return 'Este número não é válido. Use o cartão de teste.';
    return soDigitos(valor) === soDigitos(CARTAO_DE_TESTE) ? '' : 'Aceitamos só o cartão de teste. Não digite um cartão real aqui.';
  },
  validade(valor, hoje = new Date()) {
    const partes = /^(\d{2})\/(\d{2})$/.exec(valor.trim());
    if (!partes) return 'Use o formato MM/AA.';
    const mes = Number(partes[1]);
    const ano = 2000 + Number(partes[2]);
    if (mes < 1 || mes > 12) return 'O mês vai de 01 a 12.';
    const vencido = ano < hoje.getFullYear() || (ano === hoje.getFullYear() && mes < hoje.getMonth() + 1);
    return vencido ? 'Esta validade já passou.' : '';
  },
  cvv(valor) {
    return /^\d{3,4}$/.test(valor.trim()) ? '' : 'Use os 3 ou 4 dígitos do código.';
  },
};

/* Máscaras: formatam enquanto a pessoa digita. */
export const mascaras = {
  cpf(valor) {
    const d = soDigitos(valor).slice(0, 11);
    return d.replace(/^(\d{3})(\d)/, '$1.$2').replace(/^(\d{3})\.(\d{3})(\d)/, '$1.$2.$3').replace(/\.(\d{3})(\d{1,2})$/, '.$1-$2');
  },
  telefone(valor) {
    const d = soDigitos(valor).slice(0, 11);
    if (d.length <= 2) return d.length ? `(${d}` : '';
    const meio = d.length === 11 ? 7 : 6;
    if (d.length <= meio) return `(${d.slice(0, 2)}) ${d.slice(2)}`;
    return `(${d.slice(0, 2)}) ${d.slice(2, meio)}-${d.slice(meio)}`;
  },
  cep(valor) {
    const d = soDigitos(valor).slice(0, 8);
    return d.length > 5 ? `${d.slice(0, 5)}-${d.slice(5)}` : d;
  },
  cartao(valor) {
    return soDigitos(valor).slice(0, 16).replace(/(\d{4})(?=\d)/g, '$1 ');
  },
  validade(valor) {
    const d = soDigitos(valor).slice(0, 4);
    return d.length > 2 ? `${d.slice(0, 2)}/${d.slice(2)}` : d;
  },
  cvv(valor) {
    return soDigitos(valor).slice(0, 4);
  },
};
