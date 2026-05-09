/**
 * Lógica de preços por tipo de camisa.
 *
 * Regras:
 * - Camisas com ano/número (ex: "AJAX 25-26 I") → R$ 149,99
 * - Camisas Retrô → R$ 199,99
 * - Camisas versão JOGADOR → R$ 219,00
 * - Camisas de Seleção → R$ 159,99
 * - Exceção: Seleção Brasileira → R$ 169,99
 */

const PRECO_PADRAO        = 149.99; // camisas de temporada (com ano/número)
const PRECO_RETRO         = 199.99;
const PRECO_JOGADOR       = 219.00;
const PRECO_SELECAO       = 159.99;
const PRECO_BRASIL        = 169.99;
const PRECO_JOGADOR_BRASIL = 229.99; // Jogador da Seleção Brasileira

/** Nomes/partes que identificam a Seleção Brasileira */
const BRASIL_KEYWORDS = ['brasil', 'seleção brasileira', 'cbf'];

/** Detecta se é camisa da Seleção Brasileira */
function isBrasil(nome: string): boolean {
  const lower = nome.toLowerCase();
  return BRASIL_KEYWORDS.some((k) => lower.includes(k));
}

/**
 * Retorna o preço correto baseado na categoria e nome do produto.
 * Passa a categoria normalizada (do getDisplayCategory) e o nome original.
 */
export function getPriceByCategory(
  displayCategory: string,
  nome: string,
  dbPreco: number,
): number {
  const cat = displayCategory.toUpperCase().trim();
  const nomeUpper = nome.toUpperCase();
  const isJogador = nomeUpper.includes('JOGADOR');

  // Camisa versão JOGADOR da Seleção Brasileira — caso especial, maior prioridade
  if (isJogador && isBrasil(nome)) return PRECO_JOGADOR_BRASIL;

  // Camisa versão JOGADOR (outros times)
  if (isJogador) return PRECO_JOGADOR;

  // Retrô
  if (cat === 'RETRO') return PRECO_RETRO;

  // Seleções (copa, seleções nacionais)
  if (cat === 'SELEÇÃO') {
    return isBrasil(nome) ? PRECO_BRASIL : PRECO_SELECAO;
  }

  // Demais (Brasileirão, Europeus, Resto do Mundo) → preço de temporada
  if (['BRASILEIRÃO', 'EUROPEUS', 'RESTO DO MUNDO'].includes(cat)) {
    return PRECO_PADRAO;
  }

  // Fallback: usa o preço do banco de dados
  return dbPreco;
}

/**
 * Retorna um preço "original" fictício para técnica de venda (riscado).
 * Adiciona ~20% ao preço real e arredonda para X9,99.
 */
export function getFakeOriginalPrice(preco: number): number {
  const inflated = preco * 1.22;
  // Arredonda para o inteiro mais próximo e termina em 9,99
  const base = Math.ceil(inflated / 10) * 10;
  return base - 0.01;
}
