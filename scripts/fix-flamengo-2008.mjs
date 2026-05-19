const H = {
  'apikey': process.env.SUPABASE_SERVICE_ROLE_KEY,
  'Authorization': `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`,
  'Content-Type': 'application/json',
  'Prefer': 'return=minimal'
};
const BASE = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/camisas`;

async function listPath(path) {
  const res = await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/list/camisas`, {
    method: 'POST', headers: H,
    body: JSON.stringify({ prefix: path, limit: 100, sortBy: { column: 'name', order: 'asc' } })
  });
  return res.ok ? res.json() : [];
}

async function run() {
  // Flamengo RETRO 2008 tem I e II — atualizamos a entrada existente para I e criamos II
  const i1 = await listPath('Brasileirao/Flamengo/RETRO/2008/I');
  const i2 = await listPath('Brasileirao/Flamengo/RETRO/2008/II');
  const foto1 = i1.find(f => f.name.match(/\.(jpg|jpeg|png|webp)$/i));
  const foto2 = i2.find(f => f.name.match(/\.(jpg|jpeg|png|webp)$/i));
  
  console.log('Pasta I:', foto1?.name, '| Pasta II:', foto2?.name);

  if (foto1) {
    const url = `${BASE}/Brasileirao/Flamengo/RETRO/2008/I/${foto1.name}`;
    const rows = await fetch(
      `${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/camisetas?nome=eq.Flamengo%20RETRO%202008&select=id,nome`,
      { headers: H }
    ).then(r => r.json());

    if (rows.length > 0) {
      await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/camisetas?id=eq.${rows[0].id}`,
        { method: 'PATCH', headers: H, body: JSON.stringify({ nome: 'Flamengo RETRO 2008 I', imagem_url: url }) }
      );
      console.log(`✅ "Flamengo RETRO 2008 I" => ${url}`);
    }
  }

  if (foto2) {
    const url = `${BASE}/Brasileirao/Flamengo/RETRO/2008/II/${foto2.name}`;
    // Cria nova entrada para o II
    await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/camisetas`, {
      method: 'POST', headers: { ...H, 'Prefer': 'return=representation' },
      body: JSON.stringify({ nome: 'Flamengo RETRO 2008 II', categoria: 'RETRO', preco: 199.99, imagem_url: url })
    });
    console.log(`✅ "Flamengo RETRO 2008 II" criada => ${url}`);
  }

  // Também verificar Flamengo RETRO 1993 e 1994 (podem ter I/II também)
  for (const ano of ['1993', '1994', '1995']) {
    const subs = await listPath(`Brasileirao/Flamengo/RETRO/${ano}`);
    const fotosDireto = subs.filter(f => f.name.match(/\.(jpg|jpeg|png)$/i));
    const pastas = subs.filter(f => !f.name.match(/\.(jpg|jpeg|png)$/i));
    console.log(`Flamengo RETRO ${ano}: fotos=${fotosDireto.map(f=>f.name)}, pastas=${pastas.map(f=>f.name)}`);
  }
}
run();
