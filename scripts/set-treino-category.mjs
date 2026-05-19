// Atualiza categoria das camisas de TREINO para 'TREINO'
const headers = {
  'apikey': process.env.SUPABASE_SERVICE_ROLE_KEY,
  'Authorization': `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`,
  'Content-Type': 'application/json',
  'Prefer': 'return=minimal'
};

async function run() {
  // Busca todas as camisas com TREINO no nome
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/camisetas?select=id,nome,categoria&nome=ilike.*Treino*`,
    { headers }
  );
  const camisas = await res.json();
  console.log(`Encontradas ${camisas.length} camisas de Treino.`);

  for (const c of camisas) {
    const updateRes = await fetch(
      `${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/camisetas?id=eq.${c.id}`,
      { method: 'PATCH', headers, body: JSON.stringify({ categoria: 'TREINO' }) }
    );
    if (updateRes.ok) console.log(`[OK] ${c.nome} -> TREINO`);
    else console.log(`[ERRO] ${c.nome}`);
  }
  console.log('Concluído!');
}

run();
