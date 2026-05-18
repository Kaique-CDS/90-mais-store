import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseClient';

/**
 * API Route: GET /api/images?url=<supabase_image_url>
 *
 * Faz a listagem dos arquivos do Storage do Supabase server-side,
 * evitando qualquer problema de CORS ou permissão no browser (mobile/desktop).
 *
 * Retorna { urls: string[] } com todas as imagens encontradas na pasta do produto.
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const imageUrl = searchParams.get('url');

  if (!imageUrl) {
    return NextResponse.json({ urls: [] });
  }

  try {
    // Extrai o caminho relativo da pasta dentro do bucket 'camisas'
    // Ex: .../public/camisas/Europeu/Ajax/25-26/I/1.jpg -> Europeu/Ajax/25-26/I
    const urlParts = imageUrl.split('/public/camisas/');
    if (urlParts.length < 2) {
      return NextResponse.json({ urls: [imageUrl] });
    }

    const fullPath = urlParts[1];
    const pathParts = fullPath.split('/');
    pathParts.pop(); // Remove o nome do arquivo (ex: 1.jpg)
    const folderPath = pathParts.join('/');
    const baseUrl = imageUrl.substring(0, imageUrl.lastIndexOf('/') + 1);

    // Listagem server-side — sem CORS, sem restrição de browser
    const { data: files, error } = await supabase.storage
      .from('camisas')
      .list(folderPath, {
        sortBy: { column: 'name', order: 'asc' },
      });

    if (error || !files) {
      return NextResponse.json({ urls: [imageUrl] });
    }

    const imageFiles = files
      .filter((f) => f.name.match(/\.(jpg|jpeg|png|webp)$/i))
      .map((f) => `${baseUrl}${f.name}`);

    const urls = Array.from(new Set([imageUrl, ...imageFiles])).filter(Boolean);

    return NextResponse.json({ urls });
  } catch {
    // Em qualquer erro, retorna ao menos a imagem principal
    return NextResponse.json({ urls: [imageUrl] });
  }
}
