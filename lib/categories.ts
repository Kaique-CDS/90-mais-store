/**
 * Mapeamento de categorias: responsável por converter os valores que vêm do banco de dados 
 * (tanto no formato antigo quanto no novo) para as categorias de exibição padronizadas da loja.
 */

export const CATEGORIES = [
  'TUDO',
  'BRASILEIROS',
  'EUROPEUS',
  'SELEÇÕES',
  'OUTROS',
  'RETRO',
  'TREINO',
] as const

// Tipagem baseada no array de categorias constantes para garantir type safety
export type Category = (typeof CATEGORIES)[number]

// Alias interno para compatibilidade com dados do banco (SELEÇÃO → SELEÇÕES)
export const SELECAO_DISPLAY = 'SELEÇÕES'

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
  'Athletico',
  'Athletico Pr',
  'Bragantino',
  'Fortaleza',
  'Ceara',
  'Vitoria',
  'Sport',
  'Coritiba',
  'Goias',
  'Atletico Go',
  'Cuiaba',
  'Juventude',
  'Criciuma',
  'Paysandu',
  'Remo',
  'Ponte Preta',
  'Guarani'
]

const SELECOES_TEAMS = [
  'Brasil', 'Argentina', 'Alemanha', 'Espanha', 'França', 'Franca', 'Inglaterra', 
  'Italia', 'Portugal', 'Holanda', 'Uruguai', 'Colombia', 'Chile', 'Mexico', 'Eua', 'Estados Unidos',
  'Japao', 'Croacia', 'Belgica', 'Marrocos', 'Senegal', 'Camaroes', 'Nigeria'
]

const EUROPEUS_TEAMS = [
  'Real Madrid', 'Barcelona', 'Atletico Madrid', 'Sevilla', 'Milan', 'Inter', 'Juventus',
  'Napoli', 'Roma', 'Lazio', 'Arsenal', 'Chelsea', 'Liverpool', 'Manchester', 'Tottenham', 'Aston Villa', 'Newcastle',
  'Brighton',
  'Bayern', 'Borussia', 'Bayer Leverkusen', 'Rb Leipzig', 'Psg', 'Paris', 'Lyon', 'Marseille', 'Monaco', 'Ajax', 'Psv', 'Feyenoord', 'Benfica',
  'Porto', 'Sporting'
]

/**
 * Normaliza e retorna a categoria de exibição de um produto.
 * 
 * Esta função é um "adaptador" que suporta os dados antigos que estão no 
 * Supabase ("NACIONAL" e "INTERNACIONAL") e os mapeia para as novas 
 * categorias definidas da UI (ex: "BRASILEIROS" ou "OUTROS").
 * Além disso, adivinha a categoria a partir do nome se estiver sem tag,
 * ou analisa o caminho (pasta) da imagem no Supabase Storage.
 * 
 * @param categoria A categoria como ela vem do banco de dados (ex: 'NACIONAL')
 * @param nome O nome completo do produto (ex: 'Flamengo 2024')
 * @param imagemUrl A URL ou caminho da imagem (ex: '.../Brasileirao/Santos/...')
 * @returns A string padronizada da categoria para exibição (ex: 'BRASILEIROS')
 */
export function getDisplayCategory(
  categoria: string | undefined,
  nome: string,
  imagemUrl?: string,
): string {
  const cat = (categoria ?? '').toUpperCase().trim()
  const nomeUpper = nome.toUpperCase()

  // 1. Força RETRO se tiver no nome
  if (nomeUpper.includes('RETRÔ') || nomeUpper.includes('RETRO')) {
    return 'RETRO'
  }

  // 2. Força TREINO se tiver no nome
  if (nomeUpper.includes('TREINO')) {
    return 'TREINO'
  }

  // 3. Analisa o caminho/pasta da imagem (Supabase Storage) se disponível
  if (imagemUrl) {
    const decodedUrl = decodeURIComponent(imagemUrl).toLowerCase()
    if (decodedUrl.includes('/brasileirao/')) {
      return 'BRASILEIROS'
    }
    if (decodedUrl.includes('/europeu/')) {
      return 'EUROPEUS'
    }
    if (decodedUrl.includes('/selecao/')) {
      return 'SELEÇÕES'
    }
    if (decodedUrl.includes('/outros lugares do mundo/')) {
      return 'OUTROS'
    }
  }

  // 4. Se o banco de dados já estiver utilizando o formato das novas categorias, apenas retorna
  const newCats = ['BRASILEIROS', 'EUROPEUS', 'SELEÇÃO', 'SELEÇÕES', 'OUTROS', 'RETRO', 'TREINO']
  if (cat === 'SELEÇÃO') return 'SELEÇÕES' // Normaliza para novo nome
  if (newCats.includes(cat)) return cat

  // 5. Transição de dados antigos EXPLICITOS
  if (cat === 'BRASILEIRÃO') return 'BRASILEIROS'
  if (cat === 'RESTO DO MUNDO') return 'OUTROS'

  // 6. Transição do dado antigo "NACIONAL":
  // O banco antigo tinha erros (ex: Boca Juniors como Nacional). 
  // Então só vira BRASILEIROS se o nome bater com um time BR, senão é OUTROS.
  if (cat === 'NACIONAL') {
    // Adiciona espaço após o time para evitar que "Sport" dê match em "Sporting"
    const isBrasileiro = BRASILEIRAO_TEAMS.some((t) => {
       const tUpper = t.toUpperCase();
       return nomeUpper.startsWith(tUpper + ' ') || nomeUpper === tUpper;
    })
    return isBrasileiro ? 'BRASILEIROS' : 'OUTROS'
  }

  // 7. Transição do dado antigo "INTERNACIONAL":
  if (cat === 'INTERNACIONAL') {
    const isSelecao = nomeUpper.includes('COPA') || SELECOES_TEAMS.some((t) => nomeUpper.startsWith(t.toUpperCase() + ' ') || nomeUpper === t.toUpperCase())
    return isSelecao ? 'SELEÇÕES' : 'EUROPEUS'
  }

  // 8. Adivinhação para produtos COMPLETAMENTE SEM CATEGORIA no banco de dados
  if (!cat) {
    const isBrasileiro = BRASILEIRAO_TEAMS.some((t) => nomeUpper.startsWith(t.toUpperCase() + ' ') || nomeUpper === t.toUpperCase())
    if (isBrasileiro) return 'BRASILEIROS'

    const isSelecao = SELECOES_TEAMS.some((t) => nomeUpper.startsWith(t.toUpperCase() + ' ') || nomeUpper === t.toUpperCase())
    if (isSelecao) return 'SELEÇÕES'

    const isEuropeu = EUROPEUS_TEAMS.some((t) => nomeUpper.startsWith(t.toUpperCase() + ' ') || nomeUpper === t.toUpperCase())
    if (isEuropeu) return 'EUROPEUS'
  }

  // Fallback de segurança
  return 'OUTROS'
}

/**
 * Função utilitária utilizada nos filtros do catálogo (Header e App/Page).
 * Verifica se uma determinada camisa pertence à categoria que o usuário clicou.
 */
export function matchesCategory(
  categoria: string | undefined,
  nome: string,
  activeCategory: string,
  imagemUrl?: string,
): boolean {
  if (activeCategory === 'TUDO') return true
  return getDisplayCategory(categoria, nome, imagemUrl) === activeCategory
}
