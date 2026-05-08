/**
 * Mapeamento de categorias: converte valores do DB (antigos ou novos)
 * para as categorias de exibição da loja.
 */

export const CATEGORIES = [
  'TUDO',
  'BRASILEIRÃO',
  'EUROPEUS',
  'SELEÇÃO',
  'RESTO DO MUNDO',
  'RETRO',
] as const

export type Category = (typeof CATEGORIES)[number]

// Times que ficam em BRASILEIRÃO
const BRASILEIRAO_TEAMS = [
  'Atletico Mg',
  'Bahia',
  'Botafogo',
  'Corinthians',
  'Cruzeiro',
  'Flamengo',
  'Fluminense',
  'Gremio',
  'Internacional',
  'Palmeiras',
  'Santos',
  'Sao Paulo',
  'Vasco',
]

/**
 * Retorna a categoria de exibição a partir dos campos do DB.
 * Suporta tanto valores antigos (NACIONAL / INTERNACIONAL)
 * quanto os novos (BRASILEIRÃO / EUROPEUS / etc.).
 */
export function getDisplayCategory(categoria: string | undefined, nome: string): string {
  const cat = (categoria ?? '').toUpperCase().trim()

  // Categorias novas (se o DB já estiver atualizado)
  const newCats = ['BRASILEIRÃO', 'EUROPEUS', 'SELEÇÃO', 'RESTO DO MUNDO', 'RETRO']
  if (newCats.includes(cat)) return cat

  // RETRO — mantém
  if (cat === 'RETRO') return 'RETRO'

  // NACIONAL → BRASILEIRÃO ou RESTO DO MUNDO
  if (cat === 'NACIONAL') {
    const isBrasileiro = BRASILEIRAO_TEAMS.some((t) => nome.startsWith(t))
    return isBrasileiro ? 'BRASILEIRÃO' : 'RESTO DO MUNDO'
  }

  // INTERNACIONAL → SELEÇÃO (Copa) ou EUROPEUS (clubes)
  if (cat === 'INTERNACIONAL') {
    return nome.toUpperCase().includes('COPA') ? 'SELEÇÃO' : 'EUROPEUS'
  }

  return cat || 'OUTRO'
}

/**
 * Retorna true se a camisa bate com a categoria ativa no filtro.
 */
export function matchesCategory(
  categoria: string | undefined,
  nome: string,
  activeCategory: string,
): boolean {
  if (activeCategory === 'TUDO') return true
  return getDisplayCategory(categoria, nome) === activeCategory
}
