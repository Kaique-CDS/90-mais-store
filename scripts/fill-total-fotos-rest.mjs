const headers = {
  'apikey': process.env.SUPABASE_SERVICE_ROLE_KEY,
  'Authorization': `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`,
  'Content-Type': 'application/json',
  'Prefer': 'return=minimal'
};

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function run() {
  console.log("Iniciando varredura das camisas...");

  const url = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/camisetas?select=id,nome,imagem_url,total_fotos`;
  const res = await fetch(url, { headers });
  const camisas = await res.json();

  console.log(`Encontradas ${camisas.length} camisas.`);

  for (const camisa of camisas) {
    if (camisa.total_fotos && camisa.total_fotos > 1) {
      continue;
    }

    if (!camisa.imagem_url) {
      continue;
    }

    const urlMatch = camisa.imagem_url.match(/^(.*\/)1\.(jpg|jpeg|png|webp)$/i);
    if (!urlMatch) {
      continue;
    }

    const baseUrl = urlMatch[1];
    const ext = urlMatch[2];
    let maxFotos = 1;

    for (let i = 2; i <= 15; i++) {
      const testUrl = `${baseUrl}${i}.${ext}`;
      try {
        const check = await fetch(testUrl, { method: "HEAD" });
        if (check.ok) {
          maxFotos = i;
        } else {
          break; 
        }
      } catch (err) {
        break; 
      }
    }

    if (maxFotos > 1 || (camisa.total_fotos === null)) {
      const updateUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/camisetas?id=eq.${camisa.id}`;
      await fetch(updateUrl, {
        method: 'PATCH',
        headers,
        body: JSON.stringify({ total_fotos: maxFotos })
      });
      console.log(`[ATUALIZADO] ${camisa.nome} - ${maxFotos} fotos.`);
    }
  }

  console.log("Concluído!");
}

run();
