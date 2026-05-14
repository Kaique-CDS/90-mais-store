/**
 * Utilitários para manipulação e otimização de imagens do Supabase.
 */

/**
 * Gera a URL para uma imagem sequencial (ex: 2.jpg, 3.jpg) baseada na imagem principal.
 * @param baseUrl URL da imagem principal (ex: .../1.jpg)
 * @param index Índice da imagem (1-based)
 * @returns Nova URL ou a original se não for possível converter
 */
export function getSequentialImageUrl(url: string, index: number): string {
  if (!url) return url;
  
  // Tenta encontrar o padrão /número.jpg no final da URL
  const match = url.match(/^(.*\/)(\d+)\.jpg$/i);
  if (!match) return url;

  const baseUrl = match[1];
  return `${baseUrl}${index}.jpg`;
}

/**
 * Adiciona parâmetros de transformação do Supabase para otimizar o carregamento.
 * Nota: Requer que a funcionalidade de Image Transformation esteja ativa no projeto Supabase.
 * Se não estiver ativa, os parâmetros serão ignorados pelo Supabase e a imagem original será entregue.
 */
export function getOptimizedImageUrl(url: string, width?: number, quality: number = 80): string {
  if (!url || !url.includes('supabase.co')) return url;

  // Se a URL já tiver parâmetros, não adicionamos mais para evitar conflitos
  if (url.includes('?')) return url;

  const params = new URLSearchParams();
  if (width) params.append('width', width.toString());
  params.append('quality', quality.toString());
  
  // Algumas configurações do Supabase usam o endpoint /render/image para transformações
  // Mas para simplicidade e compatibilidade com o que o usuário já tem no next.config.js,
  // vamos apenas anexar os parâmetros à URL pública.
  return `${url}?${params.toString()}`;
}
