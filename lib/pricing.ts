/**
 * Lógica de preços por tipo de camisa e categoria.
 * Centraliza as regras de negócio de precificação da loja.
 *
 * Regras atuais:
 * - Camisas padrão de temporada (ex: "AJAX 25-26 I") → R$ 149,99
 * - Camisas Retrô (qualquer categoria com RETRO/RETRÔ no nome) → R$ 199,99
 * - Camisas versão JOGADOR (qualquer clube/seleção, exceto Brasil) → R$ 219,00
 * - Camisas de Seleção Copa 2026 → R$ 169,99
 * - Camisas de Seleção Nacional → R$ 159,99
 * - Exceção Seleção Brasileira (Torcedor) → R$ 169,99
 * - Exceção Seleção Brasileira (Jogador) → R$ 229,99
 * - Camisas de Treino → R$ 149,99 (mesmo preço padrão)
 */

// Tabela constante de preços base (facilita alterações futuras num único lugar)
const PRECO_PADRAO        = 149.99; // camisas de temporada (com ano/número)
const PRECO_26_27         = 169.99; // camisas 26-27
const PRECO_RETRO         = 199.99;
const PRECO_JOGADOR       = 219.00;
const PRECO_SELECAO       = 159.99;
const PRECO_BRASIL        = 169.99;
const PRECO_JOGADOR_BRASIL = 229.99; // Versão premium Jogador da Seleção Brasileira

/** Palavras-chave usadas para identificar se uma camisa é da Seleção Brasileira */
const BRASIL_KEYWORDS = ['brasil', 'seleção brasileira', 'cbf'];

/**
 * Função auxiliar que detecta se é uma camisa da Seleção Brasileira
 * analisando o nome do produto.
 * 
 * @param nome O nome completo do produto.
 * @returns Verdadeiro (true) se for camisa do Brasil, falso (false) caso contrário.
 */
function isBrasil(nome: string): boolean {
  const lower = nome.toLowerCase();
  // Verifica se alguma das palavras-chave está presente no nome do produto
  return BRASIL_KEYWORDS.some((k) => lower.includes(k));
}

/**
 * Calcula e retorna o preço correto para um produto com base nas regras de negócio da loja.
 * 
 * Importante: o preço final no carrinho é uma composição deste valor 
 * (que é o base) + o modificador de tamanho (ex: G1 adiciona R$20) 
 * + personalização (se houver).
 * 
 * @param displayCategory A categoria já normalizada do produto (ex: 'SELEÇÃO').
 * @param nome O nome completo do produto (usado para identificar regras específicas, ex: "JOGADOR").
 * @param dbPreco O preço fallback salvo originalmente no banco de dados.
 * @returns O preço numérico calculado.
 */
export function getPriceByCategory(
  displayCategory: string,
  nome: string,
  dbPreco: number,
): number {
  const cat = displayCategory.toUpperCase().trim();
  const nomeUpper = nome.toUpperCase();
  const isJogador = nomeUpper.includes('JOGADOR');
  const isRetro = nomeUpper.includes('RETRO') || nomeUpper.includes('RETRÔ');

  // Regra 1: Camisas temporada 26-27 (maior prioridade)
  if (nomeUpper.includes('26-27') || nomeUpper.includes('26/27')) {
    return PRECO_26_27;
  }

  // Regra 2: Camisa versão JOGADOR da Seleção Brasileira
  if (isJogador && isBrasil(nome)) return PRECO_JOGADOR_BRASIL;

  // Regra 3: Camisa versão JOGADOR (outros times)
  if (isJogador) return PRECO_JOGADOR;

  // Regra 4: Retrô — detectado PELO NOME (cobre todas as categorias: Brasileiros, Europeus, Seleção, RETRO)
  if (isRetro) return PRECO_RETRO;

  // Regra 5: Seleções (Copa do mundo, seleções nacionais, etc)
  if (cat === 'SELEÇÕES') {
    // Retorna o preço diferenciado se for do Brasil, Copa 2026, ou o padrão
    if (isBrasil(nome)) return PRECO_BRASIL;
    if (nomeUpper.includes('2026')) return 169.99;
    return PRECO_SELECAO;
  }

  // Regra 6: Demais categorias (Brasileiros, Europeus, Outros, Treino) assumem o preço base
  if (['BRASILEIROS', 'EUROPEUS', 'OUTROS', 'TREINO'].includes(cat)) {
    return PRECO_PADRAO;
  }

  // Fallback de segurança: se nenhuma regra bater, usa o preço que veio do banco de dados
  return dbPreco;
}

/**
 * Retorna um preço "original" fictício maior para técnica de venda e gatilho de ancoragem 
 * (o famoso preço "De: R$ X por: R$ Y").
 * 
 * A fórmula atual adiciona um markup de 22% sobre o preço base e arredonda o valor 
 * para terminar sempre em "9,99" (ex: 249.99).
 * 
 * @param preco O preço atual/real do produto.
 * @returns O preço fictício ancorado (riscado na UI).
 */
export function getFakeOriginalPrice(preco: number): number {
  const inflated = preco * 1.22;
  // Arredonda para a dezena superior mais próxima e depois subtrai 0.01 para terminar em 9.99
  // Exemplo: se inflated for 180, Math.ceil(180/10)*10 = 180, e retorna 179.99
  const base = Math.ceil(inflated / 10) * 10;
  return base - 0.01;
}
