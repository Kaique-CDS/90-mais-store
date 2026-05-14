import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("ERRO: NEXT_PUBLIC_SUPABASE_URL ou SUPABASE_SERVICE_ROLE_KEY não definidos em .env.local");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function run() {
  console.log("Iniciando varredura das camisas...");

  // Busca todas as camisas
  const { data: camisas, error } = await supabase
    .from("camisetas")
    .select("id, nome, imagem_url, total_fotos");

  if (error) {
    console.error("Erro ao buscar camisas:", error);
    process.exit(1);
  }

  console.log(`Encontradas ${camisas.length} camisas.`);

  for (const camisa of camisas) {
    // Se a camisa já tiver total_fotos preenchido (> 1)
    // O usuário pode querer reescrever tudo se houve novas fotos, mas a instrução 
    // "pular registros já preenchidos" implica pular se já foi processado.
    // Vamos processar se total_fotos for nulo ou igual a 1 (valor default).
    if (camisa.total_fotos && camisa.total_fotos > 1) {
      console.log(`[PULANDO] ${camisa.nome} - Já possui ${camisa.total_fotos} fotos.`);
      continue;
    }

    if (!camisa.imagem_url) {
      console.log(`[PULANDO] ${camisa.nome} - Não possui imagem_url.`);
      continue;
    }

    const urlMatch = camisa.imagem_url.match(/^(.*\/)(\d+)\.jpg$/i);
    if (!urlMatch) {
      console.log(`[PULANDO] ${camisa.nome} - Formato de URL não suporta scan seqüencial.`);
      continue;
    }

    const baseUrl = urlMatch[1];
    let maxFotos = 1;

    console.log(`[ESCANEANDO] ${camisa.nome} - ${baseUrl}`);

    // Testa de 1 até 15 para descobrir o limite
    for (let i = 1; i <= 15; i++) {
      const url = `${baseUrl}${i}.jpg`;
      try {
        const res = await fetch(url, { method: "HEAD" });
        if (res.ok) {
          maxFotos = i;
        } else {
          break; // Parar no primeiro 404
        }
      } catch (err) {
        break; // Erro de rede ou outro, para por segurança
      }
    }

    console.log(`   -> Encontradas ${maxFotos} fotos.`);

    if (maxFotos > 1 || (camisa.total_fotos === null)) {
      const { error: updateError } = await supabase
        .from("camisetas")
        .update({ total_fotos: maxFotos })
        .eq("id", camisa.id);

      if (updateError) {
        console.error(`   -> [ERRO AO SALVAR]`, updateError);
      } else {
        console.log(`   -> [SALVO NO BANCO]`);
      }
    }

    // Delay de 200ms para evitar sobrecarga no Supabase
    await delay(200);
  }

  console.log("Concluído!");
}

run();
