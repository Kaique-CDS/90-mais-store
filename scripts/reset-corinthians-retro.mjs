/**
 * LIMPEZA TOTAL DO CORINTHIANS RETRO
 * Deleta TUDO relacionado ao Corinthians RETRO e recria do zero com nomes corretos
 */
const headers = {
  'apikey': process.env.SUPABASE_SERVICE_ROLE_KEY,
  'Authorization': `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`,
  'Content-Type': 'application/json',
  'Prefer': 'return=minimal'
};
const base = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/camisas`;

async function getAllByIlike(pattern) {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/camisetas?nome=ilike.*${encodeURIComponent(pattern)}*&select=id,nome&order=nome`,
    { headers }
  );
  return res.json();
}

async function deleteById(id) {
  const res = await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/camisetas?id=eq.${id}`, { method: 'DELETE', headers });
  return res.ok;
}

async function insertDB(fields) {
  const res = await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/camisetas`, {
    method: 'POST', headers: { ...headers, 'Prefer': 'return=representation' }, body: JSON.stringify(fields)
  });
  return res.ok || res.status === 201;
}

// Mapeamento definitivo baseado na estrutura real do storage
// Cada linha = uma entrada no banco, com nome e path corretos
const CORINTHIANS_RETRO = [
  // 1990 — tem BRANCA e PRETA
  { nome: 'Corinthians RETRO 1990 Branca', path: 'Brasileirao/Corinthians/RETRO/1990/Branca/1.jpeg' },
  { nome: 'Corinthians RETRO 1990 Preta',  path: 'Brasileirao/Corinthians/RETRO/1990/PRETA/1.jpg' },
  // 1992 — apenas Preta
  { nome: 'Corinthians RETRO 1992',        path: 'Brasileirao/Corinthians/RETRO/1992/Preta/1.jpg' },
  // 1994 — sem subfolder de cor
  { nome: 'Corinthians RETRO 1994',        path: 'Brasileirao/Corinthians/RETRO/1994/1.jpg' },
  // 1996 — apenas BRANCA
  { nome: 'Corinthians RETRO 1996',        path: 'Brasileirao/Corinthians/RETRO/1996/BRANCA/1.jpg' },
  // 1998 — BRANCA e PRETA
  { nome: 'Corinthians RETRO 1998 Branca', path: 'Brasileirao/Corinthians/RETRO/1998/Branca/1.jpg' },
  { nome: 'Corinthians RETRO 1998 Preta',  path: 'Brasileirao/Corinthians/RETRO/1998/Preta/1.jpg' },
  // 1999 — BRANCA e PRETA
  { nome: 'Corinthians RETRO 1999 Branca', path: 'Brasileirao/Corinthians/RETRO/1999/Branca/1.jpg' },
  { nome: 'Corinthians RETRO 1999 Preta',  path: 'Brasileirao/Corinthians/RETRO/1999/Preta/1.jpg' },
  // 2000 — BRANCA e PRETA
  { nome: 'Corinthians RETRO 2000 Branca', path: 'Brasileirao/Corinthians/RETRO/2000/Branca/1.jpg' },
  { nome: 'Corinthians RETRO 2000 Preta',  path: 'Brasileirao/Corinthians/RETRO/2000/Preto/1.jpg' },
  // 2010 — CENTENARIO e PRETA
  { nome: 'Corinthians RETRO 2010 Centenario', path: 'Brasileirao/Corinthians/RETRO/2010/Centenario/1.jpg' },
  { nome: 'Corinthians RETRO 2010 Preta',      path: 'Brasileirao/Corinthians/RETRO/2010/Preta/1.jpg' },
  // 2011 — sem subfolder de cor
  { nome: 'Corinthians RETRO 2011',            path: 'Brasileirao/Corinthians/RETRO/2011/1.jpg' },
  // 2012 — BRANCA e ESPECIAL
  { nome: 'Corinthians RETRO 2012 Branca',   path: 'Brasileirao/Corinthians/RETRO/2012/Branca/1.jpg' },
  { nome: 'Corinthians RETRO 2012 Especial', path: 'Brasileirao/Corinthians/RETRO/2012/Especial/1.jpg' },
];

async function run() {
  // PASSO 1: Deletar TUDO que é Corinthians RETRO
  console.log('Deletando todas as entradas Corinthians RETRO...');
  const all = await getAllByIlike('Corinthians RETRO');
  console.log(`  Encontradas: ${all.length}`);
  all.forEach(c => console.log(`  - "${c.nome}"`));
  
  for (const c of all) {
    await deleteById(c.id);
  }
  console.log(`  ✅ Deletadas: ${all.length}\n`);

  // Também limpa as "Corinthians RETRO 1990 Branca" e "Corinthians RETRO 1994 Branca" que foram criadas antes
  const extraBranca = await getAllByIlike('Corinthians RETRO 1990');
  for (const c of extraBranca) await deleteById(c.id);
  const extra1994 = await getAllByIlike('Corinthians RETRO 1994');
  for (const c of extra1994) await deleteById(c.id);

  // PASSO 2: Recriar do zero com nomes e URLs corretos
  console.log('Recriando entradas Corinthians RETRO com nomes corretos...');
  let created = 0;
  for (const entry of CORINTHIANS_RETRO) {
    const url = `${base}/${entry.path.replace(/ /g, '%20')}`;
    const ok = await insertDB({
      nome: entry.nome,
      categoria: 'BRASILEIROS',
      preco: 199.99,
      imagem_url: url,
    });
    console.log(`[${ok ? '✅' : '❌'}] ${entry.nome}`);
    if (ok) created++;
  }

  console.log(`\n✅ Criadas: ${created}/${CORINTHIANS_RETRO.length}`);
  console.log('\nCorinthians RETRO recriado com sucesso!');
}

run();
