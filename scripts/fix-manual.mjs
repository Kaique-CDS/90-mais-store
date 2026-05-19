// Correções finais cirúrgicas
const headers = {
  'apikey': process.env.SUPABASE_SERVICE_ROLE_KEY,
  'Authorization': `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`,
  'Content-Type': 'application/json',
  'Prefer': 'return=minimal'
};

const base = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/camisas`;

const CORRECOES = [
  // Corinthians RETRO 1990 Branca — extensão é .jpeg, não .jpg
  {
    nome: 'Corinthians RETRO 1990 Branca',
    imagem_url: `${base}/Brasileirao/Corinthians/RETRO/1990/Branca/1.jpeg`,
  },
  // Corinthians RETRO 1994 Branca — pasta é direto /1994/ sem subfolder de cor
  {
    nome: 'Corinthians RETRO 1994 Branca',
    imagem_url: `${base}/Brasileirao/Corinthians/RETRO/1994/1.jpg`,
  },
  // PSV 25/26 II — não existe pasta II no storage, só I. Aponta para I mesmo.
  {
    nome: 'PSV 25/26 II',
    imagem_url: `${base}/Europeu/PSV/25-26/I/1.jpg`,
  },
];

async function getByNome(nome) {
  const url = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/camisetas?nome=eq.${encodeURIComponent(nome)}&select=id,nome,imagem_url`;
  const res = await fetch(url, { headers });
  return res.json();
}

async function update(id, fields) {
  const url = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/camisetas?id=eq.${id}`;
  const res = await fetch(url, { method: 'PATCH', headers, body: JSON.stringify(fields) });
  return res.ok;
}

async function run() {
  console.log('Aplicando correções finais...\n');

  for (const c of CORRECOES) {
    const rows = await getByNome(c.nome);
    if (!rows?.length) { console.log(`[NÃO ENCONTRADO] ${c.nome}`); continue; }
    for (const row of rows) {
      const ok = await update(row.id, { imagem_url: c.imagem_url });
      console.log(`[${ok ? '✅' : '❌'}] ${row.nome}`);
      console.log(`      ${c.imagem_url.split('/camisas/')[1]}`);
    }
  }

  // West Ham — não existe no storage. Exibe aviso.
  const westHams = await getByNome('West Ham 25/26 I');
  westHams.forEach(r => {
    console.log(`\n⚠️  West Ham 25/26 I — Pasta NÃO encontrada no storage.`);
    console.log(`   ID: ${r.id}`);
    console.log(`   URL atual: ${r.imagem_url}`);
    console.log(`   → Você precisa fazer upload das fotos para o Storage.`);
    console.log(`   Pasta sugerida: Europeu/West Ham/25-26/I/`);
  });

  console.log('\nConcluído!');
}

run();
