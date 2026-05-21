import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

/**
 * API Route: /api/upload-camisa
 * 
 * Recebe multipart/form-data com:
 * - password: senha de admin
 * - nome: nome da camisa
 * - categoria: categoria (EUROPEUS, BRASILEIROS, etc.)
 * - preco: preço numérico
 * - storagePath: caminho base no storage (ex: Europeu/Barcelona/25-26/IV)
 * - images[]: array de imagens (File)
 * 
 * Processa:
 * 1. Valida senha
 * 2. Comprime imagens (já vêm comprimidas do cliente)
 * 3. Faz upload para Supabase Storage
 * 4. Insere registro no banco de dados
 * 5. Retorna o registro criado
 */

const ADMIN_PASSWORD = "90maisadmin";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
);

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();

    // ── 1. Autenticação ──
    const password = formData.get("password") as string;
    if (password !== ADMIN_PASSWORD) {
      return NextResponse.json({ error: "Senha incorreta" }, { status: 401 });
    }

    // ── 2. Extração dos campos ──
    const nome = (formData.get("nome") as string)?.trim();
    const categoria = (formData.get("categoria") as string)?.trim();
    const preco = parseFloat(formData.get("preco") as string);
    const storagePath = (formData.get("storagePath") as string)?.trim();
    const images = formData.getAll("images") as File[];

    if (!nome || !categoria || !storagePath || images.length === 0) {
      return NextResponse.json({ error: "Campos obrigatórios faltando" }, { status: 400 });
    }

    // ── 3. Upload das imagens para o Storage ──
    const uploadedUrls: string[] = [];

    for (let i = 0; i < images.length; i++) {
      const file = images[i];
      const ext = file.name.split(".").pop()?.toLowerCase() || "jpg";
      const fileName = `${i + 1}.${ext === "jpeg" ? "jpg" : ext}`;
      const fullPath = `${storagePath}/${fileName}`;

      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);

      const { error: uploadError } = await supabaseAdmin.storage
        .from("camisas")
        .upload(fullPath, buffer, {
          contentType: file.type || "image/jpeg",
          upsert: true,
        });

      if (uploadError) {
        console.error("Upload error:", uploadError);
        // Continua com as próximas imagens mesmo se uma falhar
        continue;
      }

      const { data: publicData } = supabaseAdmin.storage
        .from("camisas")
        .getPublicUrl(fullPath);

      uploadedUrls.push(publicData.publicUrl);
    }

    if (uploadedUrls.length === 0) {
      return NextResponse.json({ error: "Falha no upload de todas as imagens" }, { status: 500 });
    }

    // ── 4. Inserção no banco de dados ──
    const { data: inserted, error: dbError } = await supabaseAdmin
      .from("camisetas")
      .insert({
        nome,
        categoria,
        preco: isNaN(preco) ? 149.99 : preco,
        imagem_url: uploadedUrls[0], // Primeira imagem como capa
        total_fotos: uploadedUrls.length,
        galeria: uploadedUrls.length > 1 ? uploadedUrls.slice(1) : null,
      })
      .select()
      .single();

    if (dbError) {
      console.error("DB insert error:", dbError);
      return NextResponse.json({ error: `Erro no banco: ${dbError.message}` }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      record: inserted,
      uploadedCount: uploadedUrls.length,
      urls: uploadedUrls,
    });
  } catch (err) {
    console.error("Upload camisa error:", err);
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 });
  }
}

// Aumenta o limite de tamanho do body para aceitar múltiplas imagens
export const config = {
  api: {
    bodyParser: false,
  },
};
