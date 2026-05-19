/**
 * Mapeamento de categorias: responsável por converter os valores que vêm do banco de dados 
 * (tanto no formato antigo quanto no novo) para as categorias de exibição padronizadas da loja.
 */

export const CATEGORIES = [
  'TUDO',
  'BRASILEIROS',
  'EUROPEUS',
  'SELEÇÃO',
  'OUTROS',
  'RETRO',
  'TREINO',
] as const

// Tipagem baseada no array de categorias constantes para garantir type safety
export type Category = (typeof CATEGORIES)[number]

/** 
 * Lista de times que pertencem ao Brasileirão.
 * Utilizada para categorizar os times que no banco de dados antigo 
 * vinham genericamente classificados apenas como "NACIONAL".
 */
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
 * Normaliza e retorna a categoria de exibição de um produto.
 * 
 * Esta função é um "adaptador" que suporta os dados antigos que estão no 
 * Supabase ("NACIONAL" e "INTERNACIONAL") e os mapeia para as novas 
 * categorias definidas da UI (ex: "BRASILEIROS" ou "OUTROS").
 * 
 * @param categoria A categoria como ela vem do banco de dados (ex: 'NACIONAL')
 * @param nome O nome completo do produto (ex: 'Flamengo 2024')
 * @returns A string padronizada da categoria para exibição (ex: 'BRASILEIROS')
 */
export function getDisplayCategory(categoria: string | undefined, nome: string): string {
  // Padroniza a string removendo espaços em branco e deixando em maiúsculas
  const cat = (categoria ?? '').toUpperCase().trim()

  // Se o banco de dados já estiver utilizando o formato das novas categorias, apenas retorna
  const newCats = ['BRASILEIROS', 'EUROPEUS', 'SELEÇÃO', 'OUTROS', 'RETRO', 'TREINO']
  if (newCats.includes(cat)) return cat

  // Transição de dados antigos
  if (cat === 'BRASILEIRÃO') return 'BRASILEIROS'
  if (cat === 'RESTO DO MUNDO') return 'OUTROS'

  // Se for categoria RETRO (já era usada anteriormente), mantemos igual
  if (cat === 'RETRO') return 'RETRO'

  // Transição do dado antigo "NACIONAL":
  // Verificamos se o início do nome da camisa bate com algum dos times do BRASILEIRAO_TEAMS
  if (cat === 'NACIONAL') {
    const isBrasileiro = BRASILEIRAO_TEAMS.some((t) => nome.startsWith(t))
    // Se não for do Brasileirão (ex: Boca Juniors classificado errado), vai para Resto do Mundo
    return isBrasileiro ? 'BRASILEIROS' : 'OUTROS'
  }

  // Transição do dado antigo "INTERNACIONAL":
  // Se contiver a palavra "COPA" no nome, tratamos como seleção. Senão, assumimos que é clube europeu.
  if (cat === 'INTERNACIONAL') {
    return nome.toUpperCase().includes('COPA') ? 'SELEÇÃO' : 'EUROPEUS'
  }

  // Fallback de segurança para quando a categoria não se encaixar em nada conhecido
  return cat || 'OUTROS'
}

/**
 * Função utilitária utilizada nos filtros do catálogo (Header e App/Page).
 * Verifica se uma determinada camisa pertence à categoria que o usuário clicou.
 * 
 * @param categoria A categoria do produto no banco de dados.
 * @param nome O nome do produto.
 * @param activeCategory A categoria que o usuário selecionou no Header (ex: "SELEÇÃO" ou "TUDO").
 * @returns Verdadeiro (true) se a camisa deve aparecer na tela, Falso (false) se deve ser escondida.
 */
export function matchesCategory(
  categoria: string | undefined,
  nome: string,
  activeCategory: string,
): boolean {
  // Se o usuário selecionou "TUDO", mostra independentemente da categoria
  if (activeCategory === 'TUDO') return true
  
  // Compara a categoria normalizada do produto com a categoria ativa
  return getDisplayCategory(categoria, nome) === activeCategory
}
