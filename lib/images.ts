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

export function getOptimizedImageUrl(url: string, width?: number, quality: number = 80): string {
  // O componente <Image> do Next.js já faz a otimização automaticamente.
  // Adicionar parâmetros de query nativos do Supabase para o endpoint /object/public/ 
  // muitas vezes resulta em erro 400 (Bad Request) se a transformação de imagens
  // não estiver habilitada ou se a URL for processada pelo /_next/image.
  return url;
}
