// Corrige URLs com espaços para usar %20 (encoding correto para URL)
const headers = {
  'apikey': process.env.SUPABASE_SERVICE_ROLE_KEY,
  'Authorization': `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`,
  'Content-Type': 'application/json',
  'Prefer': 'return=minimal'
};

async function run() {
  // Busca todas as camisas que têm espaço na URL
  const res = await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/camisetas?select=id,nome,imagem_url&imagem_url=like.*%20*`, { headers });
  const camisas = await res.json();

  console.log(`Encontradas ${camisas.length} camisas com espaços na URL.`);

  for (const c of camisas) {
    // Substitui espaços por %20 na URL
    const fixedUrl = c.imagem_url.replace(/ /g, '%20');
    
    const updateRes = await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/camisetas?id=eq.${c.id}`, {
      method: 'PATCH',
      headers,
      body: JSON.stringify({ imagem_url: fixedUrl })
    });

    if (updateRes.ok) {
      console.log(`[OK] ${c.nome}`);
    } else {
      console.log(`[ERRO] ${c.nome}`);
    }
  }

  console.log('Concluído!');
}

run();
