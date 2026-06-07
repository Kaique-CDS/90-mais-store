import { NextRequest, NextResponse } from 'next/server';

export const revalidate = 86400; // Cache de 24h

/**
 * API Route: GET /api/images?url=<cloudinary_image_url>
 *
 * Usa a Cloudinary Admin API (server-side) para listar todas as imagens
 * da mesma pasta da imagem principal recebida.
 *
 * Funciona com URLs no formato:
 *   https://res.cloudinary.com/{cloud}/image/upload/{...transformations}/v123/{public_id}.jpg
 *   https://res.cloudinary.com/{cloud}/image/upload/{public_id}.jpg
 *
 * Retorna { urls: string[] } com todas as imagens encontradas na pasta.
 */

const CLOUD_NAME  = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME!;
const API_KEY     = process.env.CLOUDINARY_API_KEY!;
const API_SECRET  = process.env.CLOUDINARY_API_SECRET!;

/**
 * Extrai o public_id de uma URL do Cloudinary.
 * Remove prefixo de versão (v12345) e extensão (.jpg / .webp / etc).
 * Ex: ".../upload/v1234/Selecao/Brasil/2026/I/1.jpg" → "Selecao/Brasil/2026/I/1"
 */
function extractPublicId(url: string): string | null {
  try {
    // Decodifica a URL primeiro para lidar com caracteres acentuados (%C3%87 → Ç)
    const decoded = decodeURIComponent(url);
    const uploadMarker = '/upload/';
    const idx = decoded.indexOf(uploadMarker);
    if (idx === -1) return null;

    let path = decoded.slice(idx + uploadMarker.length);

    // Remove versão (vNNNNNN)
    path = path.replace(/^v\d+\//, '');

    // Remove extensão do arquivo
    path = path.replace(/\.[a-z]{2,5}$/i, '');

    return path || null;
  } catch {
    return null;
  }
}

/**
 * Dado um public_id (ex: "Selecao/Brasil/2026/I/1"),
 * retorna a pasta pai (ex: "Selecao/Brasil/2026/I").
 */
function getFolder(publicId: string): string {
  const parts = publicId.split('/');
  parts.pop(); // Remove o nome do arquivo
  return parts.join('/');
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const imageUrl = searchParams.get('url');

  if (!imageUrl) {
    return NextResponse.json({ urls: [] });
  }

  // Se não for URL do Cloudinary, retorna só a imagem original
  if (!imageUrl.includes('cloudinary.com')) {
    return NextResponse.json({ urls: [imageUrl] });
  }

  if (!CLOUD_NAME || !API_KEY || !API_SECRET) {
    console.error('[/api/images] Credenciais Cloudinary não configuradas.');
    return NextResponse.json({ urls: [imageUrl] });
  }

  try {
    const publicId = extractPublicId(imageUrl);
    if (!publicId) {
      return NextResponse.json({ urls: [imageUrl] });
    }

    const folder = getFolder(publicId);
    if (!folder) {
      // Imagem na raiz — retorna só ela
      return NextResponse.json({ urls: [imageUrl] });
    }

    // Cloudinary Admin API — lista recursos por prefixo de pasta
    // Docs: https://cloudinary.com/documentation/admin_api#browse_resources_in_a_folder
    const adminUrl = `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/resources/image?` +
      new URLSearchParams({
        type:        'upload',
        prefix:      folder + '/',
        max_results: '50',
      });

    // Autenticação Basic (api_key:api_secret em Base64)
    const credentials = Buffer.from(`${API_KEY}:${API_SECRET}`).toString('base64');

    const res = await fetch(adminUrl, {
      headers: { Authorization: `Basic ${credentials}` },
      // Cache no servidor: revalida a cada 24h (mesma política do revalidate acima)
      next: { revalidate: 86400 },
    });

    if (!res.ok) {
      console.error('[/api/images] Cloudinary Admin API error:', res.status, await res.text());
      return NextResponse.json({ urls: [imageUrl] });
    }

    const data = await res.json() as {
      resources: Array<{ secure_url: string; public_id: string }>;
    };

    if (!data.resources?.length) {
      return NextResponse.json({ urls: [imageUrl] });
    }

    // Ordena pelo public_id (garante ordem: 1, 2, 3...)
    const sorted = data.resources
      .sort((a, b) => a.public_id.localeCompare(b.public_id, undefined, { numeric: true }))
      .map((r) => r.secure_url);

    // Garante que a imagem principal está sempre na primeira posição
    const urls = Array.from(new Set([imageUrl, ...sorted])).filter(Boolean);

    return NextResponse.json({ urls });
  } catch (err) {
    console.error('[/api/images] Erro inesperado:', err);
    return NextResponse.json({ urls: [imageUrl] });
  }
}
