import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

/**
 * API Route: /api/upload-camisa
 *
 * Suporta 3 cenários sem quebrar:
 * 1. Time novo + camisa nova   → cria pasta nova, insere registro no banco
 * 2. Time existente + camisa nova  → cria subpasta nova, insere registro no banco
 * 3. Time existente + camisa existente → CONTINUA numeração (não sobrescreve),
 *    ATUALIZA o registro do banco existente (total_fotos + galeria)
 */

const ADMIN_PASSWORD = "90maisadmin";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
);

// ─── Helper: lista arquivos já existentes em uma pasta do storage ─────────────
async function listExistingFiles(storagePath: string): Promise<string[]> {
  const { data, error } = await supabaseAdmin.storage
    .from("camisas")
    .list(storagePath, { limit: 200, offset: 0 });

  if (error || !data) return [];

  return data
    .map((f) => f.name)
    .filter((n) => /\.(jpg|jpeg|png|webp)$/i.test(n));
}

// ─── Helper: encontra o maior número já usado nos arquivos (1.jpg, 2.jpg…) ───
function getNextFileIndex(existingFiles: string[]): number {
  if (existingFiles.length === 0) return 1;

  const nums = existingFiles
    .map((f) => parseInt(f.replace(/\.[^.]+$/, ""), 10))
    .filter((n) => !isNaN(n));

  return nums.length > 0 ? Math.max(...nums) + 1 : existingFiles.length + 1;
}

// ─── Helper: busca registro existente no banco cujo imagem_url aponte para o mesmo path ─
async function findExistingRecord(storagePath: string) {
  // Normaliza o path para fazer a busca por substring
  const pathFragment = storagePath.split("/").map(encodeURIComponent).join("/");

  const { data } = await supabaseAdmin
    .from("camisetas")
    .select("id, nome, imagem_url, total_fotos, galeria")
    .ilike("imagem_url", `%${storagePath}%`)
    .limit(1)
    .maybeSingle();

  return data ?? null;
}

// ─── Handler Principal ────────────────────────────────────────────────────────

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();

    // ── 1. Autenticação ──
    const password = formData.get("password") as string;
    if (password !== ADMIN_PASSWORD) {
      return NextResponse.json({ error: "Senha incorreta" }, { status: 401 });
    }

    // ── 2. Extração dos campos ──
    const nome       = (formData.get("nome")        as string)?.trim();
    const categoria  = (formData.get("categoria")   as string)?.trim();
    const preco      = parseFloat(formData.get("preco") as string);
    const storagePath = (formData.get("storagePath") as string)?.trim();
    const images     = formData.getAll("images") as File[];

    if (!nome || !categoria || !storagePath || images.length === 0) {
      return NextResponse.json({ error: "Campos obrigatórios faltando" }, { status: 400 });
    }

    // ── 3. Descobre arquivos já existentes na pasta (para não sobrescrever) ──
    const existingFiles = await listExistingFiles(storagePath);
    const startIndex    = getNextFileIndex(existingFiles);
    const pathAlreadyExisted = existingFiles.length > 0;

    // ── 4. Upload das imagens continuando a numeração ──
    const uploadedUrls: string[] = [];

    for (let i = 0; i < images.length; i++) {
      const file     = images[i];
      const fileName = `${startIndex + i}.jpg`; // sempre .jpg (já comprimido pelo cliente)
      const fullPath = `${storagePath}/${fileName}`;

      const arrayBuffer = await file.arrayBuffer();
      const buffer      = Buffer.from(arrayBuffer);

      const { error: uploadError } = await supabaseAdmin.storage
        .from("camisas")
        .upload(fullPath, buffer, {
          contentType: "image/jpeg",
          upsert: false, // NÃO sobrescreve — se já existe esse número exato, pula
        });

      if (uploadError) {
        // Se o erro for "already exists" tenta com upsert pontual
        if (uploadError.message?.includes("already exists") || (uploadError as any).statusCode === 409) {
          const { error: upsertError } = await supabaseAdmin.storage
            .from("camisas")
            .upload(fullPath, buffer, { contentType: "image/jpeg", upsert: true });
          if (upsertError) {
            console.error("Upsert error:", upsertError);
            continue;
          }
        } else {
          console.error("Upload error:", uploadError);
          continue;
        }
      }

      const { data: publicData } = supabaseAdmin.storage
        .from("camisas")
        .getPublicUrl(fullPath);

      uploadedUrls.push(publicData.publicUrl);
    }

    if (uploadedUrls.length === 0) {
      return NextResponse.json({ error: "Falha no upload de todas as imagens" }, { status: 500 });
    }

    // ── 5. Banco de dados: atualiza existente OU cria novo ──
    const existingRecord = pathAlreadyExisted ? await findExistingRecord(storagePath) : null;

    let dbResult: { action: string; record: Record<string, unknown> };

    if (existingRecord) {
      // ── ATUALIZA o registro existente ──
      // Adiciona as novas fotos à galeria existente e atualiza total_fotos
      const currentGaleria: string[] = existingRecord.galeria ?? [];
      const updatedGaleria = [...currentGaleria, ...uploadedUrls];
      const newTotal = (existingRecord.total_fotos ?? 1) + uploadedUrls.length;

      const { data: updated, error: updateError } = await supabaseAdmin
        .from("camisetas")
        .update({
          total_fotos: newTotal,
          galeria: updatedGaleria.length > 0 ? updatedGaleria : null,
        })
        .eq("id", existingRecord.id)
        .select()
        .single();

      if (updateError) {
        console.error("DB update error:", updateError);
        return NextResponse.json({ error: `Erro ao atualizar banco: ${updateError.message}` }, { status: 500 });
      }

      dbResult = { action: "updated", record: updated };

    } else {
      // ── INSERE novo registro ──
      const { data: inserted, error: insertError } = await supabaseAdmin
        .from("camisetas")
        .insert({
          nome,
          categoria,
          preco: isNaN(preco) ? 149.99 : preco,
          imagem_url: uploadedUrls[0],
          total_fotos: existingFiles.length + uploadedUrls.length,
          galeria: uploadedUrls.length > 1 ? uploadedUrls.slice(1) : null,
        })
        .select()
        .single();

      if (insertError) {
        console.error("DB insert error:", insertError);
        return NextResponse.json({ error: `Erro ao inserir no banco: ${insertError.message}` }, { status: 500 });
      }

      dbResult = { action: "inserted", record: inserted };
    }

    return NextResponse.json({
      success: true,
      action: dbResult.action,           // "inserted" ou "updated"
      pathAlreadyExisted,                // se a pasta já existia no storage
      record: dbResult.record,
      uploadedCount: uploadedUrls.length,
      startIndex,                        // índice a partir do qual as fotos foram salvas
      urls: uploadedUrls,
    });

  } catch (err) {
    console.error("Upload camisa error:", err);
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 });
  }
}
