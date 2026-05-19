/**
 * LIMPEZA DE ENTRADAS RUINS + RECONSTRUÇÃO CORRETA
 * 
 * O script anterior criou nomes duplicados/errados para as seleções da COPA 2026
 * que já tinham I/II no nome. Ex: "Colombia COPA 2026 I I" e "Colombia COPA 2026 I II"
 * 
 * Este script:
 * 1. Remove todas as entradas com nomes que terminam com " I I", " I II", " II I" etc.
 * 2. Restaura o nome correto das entradas que foram renomeadas incorretamente
 * 3. Aplica as correções corretas para os casos reais (cores de camisas)
 */

const headers = {
  'apikey': process.env.SUPABASE_SERVICE_ROLE_KEY,
  'Authorization': `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`,
  'Content-Type': 'application/json',
  'Prefer': 'return=minimal'
};
const baseUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/camisas`;

async function getAllCamisas() {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/camisetas?select=id,nome,imagem_url,categoria,preco&order=nome`,
    { headers }
  );
  return res.json();
}

async function deleteById(id) {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/camisetas?id=eq.${id}`,
    { method: 'DELETE', headers }
  );
  return res.ok;
}

async function updateById(id, fields) {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/camisetas?id=eq.${id}`,
    { method: 'PATCH', headers, body: JSON.stringify(fields) }
  );
  return res.ok;
}

async function run() {
  console.log('Carregando todas as camisas do banco...');
  const all = await getAllCamisas();
  console.log(`Total: ${all.length} camisas\n`);

  // ── PASSO 1: Deletar entradas geradas incorretamente pelo script anterior ──
  // Padrão de nome inválido: termina com " I I", " I II", " II I", " II II", 
  // " 2004 2010", " 2010 2010", " 2010 2004", etc.
  const badPattern = / (I|II|III|IV|V|\d{4}) (I|II|III|IV|V|\d{4})$/;
  
  const badEntries = all.filter(c => badPattern.test(c.nome));
  console.log(`Entradas ruins para deletar: ${badEntries.length}`);
  badEntries.forEach(c => console.log(`  - "${c.nome}"`));

  let deleted = 0;
  for (const entry of badEntries) {
    const ok = await deleteById(entry.id);
    if (ok) deleted++;
  }
  console.log(`\n✅ Deletadas: ${deleted}/${badEntries.length}\n`);

  // ── PASSO 2: Restaurar os nomes que foram incorretamente renomeados ──
  // Ex: "Colombia COPA 2026 I I" foi deletado acima.
  // Mas "Colombia COPA 2026 I" pode ter sido renomeado para "Colombia COPA 2026 I I"
  // Então pode ter sumido. Preciso recriar as entradas originais que foram corrompidas.
  
  // Carrega estado atual após deleções
  const allAfter = await getAllCamisas();
  const nomes = new Set(allAfter.map(c => c.nome));
  
  // Lista de entradas que foram corrompidas e precisam ser restauradas
  // (detectamos pelo padrão: o nome correto deveria existir mas não existe mais)
  // Fazemos isso verificando se há entradas que terminam com " I" quando não deveriam
  // e restaurando seus nomes originais.
  //
  // Na prática, os casos afetados pelo bug são:
  // - Seleções que JÁ tinham I/II no nome (ex: "Colombia COPA 2026 I")
  //   foram renomeadas para "Colombia COPA 2026 I I" (errado) → deletamos acima
  //   e agora precisamos verificar se "Colombia COPA 2026 I" ainda existe
  
  console.log('─── Verificando entradas que podem ter sido perdidas ───');
  const expectedEntries = [
    // Seleções COPA 2026 que já tinham I/II no nome
    'Alemanha COPA 2026 I', 'Alemanha COPA 2026 II',
    'Argentina COPA 2026 I', 'Argentina COPA 2026 II',
    'Belgica COPA 2026 I', 'Belgica COPA 2026 II',
    'Brasil COPA 2026 I', 'Brasil COPA 2026 II', 'Brasil COPA 2026 Jogador',
    'Chile 2026 I',
    'Colombia COPA 2026 I', 'Colombia COPA 2026 II',
    'Croacia COPA 2026 I', 'Croacia COPA 2026 II',
    'Espanha COPA 2026 I', 'Espanha COPA 2026 II',
    'Estados Unidos 2026 I', 'Estados Unidos 2026 II',
    'França COPA 2026 I', 'França COPA 2026 II',
    'Holanda COPA 2026 I', 'Holanda COPA 2026 II',
    'Holanda RETRO 2004', 'Holanda RETRO 2010',
    'Inglaterra COPA 2026 I', 'Inglaterra COPA 2026 II',
    'Jamaica COPA 2026 I', 'Jamaica COPA 2026 II',
    'Japao COPA 2026 I', 'Japao COPA 2026 II',
    'Marrocos COPA 2026 I',
    'Mexico COPA 2026 I', 'Mexico COPA 2026 II',
    'Nigeria 2026 I', 'Nigeria 2026 II',
    'Noruega COPA 2026 I', 'Noruega COPA 2026 II',
    'Portugal COPA 2026 I', 'Portugal COPA 2026 II',
    'Uruguai COPA 2026 I', 'Uruguai COPA 2026 II',
  ];

  const missing = expectedEntries.filter(n => !nomes.has(n));
  console.log(`Entradas faltando: ${missing.length}`);
  missing.forEach(n => console.log(`  - "${n}"`));

  // As entradas faltando foram deletadas incorretamente — precisamos recriar
  // Vamos buscar no storage o caminho correto para cada uma
  // e recriar no banco com o nome correto
  
  // Mapeamento manual dos paths corretos para cada entrada que pode ter sumido
  const pathMap = {
    'Alemanha COPA 2026 I': 'Selecao/Alemanha/COPA 2026/I/1.jpg',
    'Alemanha COPA 2026 II': 'Selecao/Alemanha/COPA 2026/II/1.jpg',
    'Argentina COPA 2026 I': 'Selecao/Argentina/COPA 2026/I/1.jpg',
    'Argentina COPA 2026 II': 'Selecao/Argentina/COPA 2026/II/1.jpg',
    'Belgica COPA 2026 I': 'Selecao/Belgica/COPA 2026/I/1.jpg',
    'Belgica COPA 2026 II': 'Selecao/Belgica/COPA 2026/II/1.jpg',
    'Brasil COPA 2026 I': 'Selecao/Brasil/COPA 2026/I/1.jpg',
    'Brasil COPA 2026 II': 'Selecao/Brasil/COPA 2026/II/1.jpg',
    'Brasil COPA 2026 Jogador': 'Selecao/Brasil/COPA 2026/Jogador/I/1.jpg',
    'Chile 2026 I': 'Selecao/Chile/COPA 2026/I/1.jpg',
    'Colombia COPA 2026 I': 'Selecao/Colombia/COPA 2026/I/1.jpg',
    'Colombia COPA 2026 II': 'Selecao/Colombia/COPA 2026/II/1.jpg',
    'Croacia COPA 2026 I': 'Selecao/Croacia/COPA 2026/I/1.jpg',
    'Croacia COPA 2026 II': 'Selecao/Croacia/COPA 2026/II/1.jpg',
    'Espanha COPA 2026 I': 'Selecao/Espanha/COPA 2026/I/1.jpg',
    'Espanha COPA 2026 II': 'Selecao/Espanha/COPA 2026/II/1.jpg',
    'Estados Unidos 2026 I': 'Selecao/Estados%20Unidos/COPA%202026/I/1.jpg',
    'Estados Unidos 2026 II': 'Selecao/Estados%20Unidos/COPA%202026/II/1.jpg',
    'França COPA 2026 I': 'Selecao/Franca/COPA 2026/I/1.jpg',
    'França COPA 2026 II': 'Selecao/Franca/COPA 2026/II/1.jpg',
    'Holanda COPA 2026 I': 'Selecao/Holanda/COPA 2026/I/1.jpg',
    'Holanda COPA 2026 II': 'Selecao/Holanda/COPA 2026/II/1.jpg',
    'Holanda RETRO 2004': 'Selecao/Holanda/RETRO/2004/1.jpg',
    'Holanda RETRO 2010': 'Selecao/Holanda/RETRO/2010/1.jpg',
    'Inglaterra COPA 2026 I': 'Selecao/Inglaterra/COPA 2026/I/1.jpg',
    'Inglaterra COPA 2026 II': 'Selecao/Inglaterra/COPA 2026/II/1.jpg',
    'Jamaica COPA 2026 I': 'Selecao/Jamaica/COPA 2026/I/1.jpg',
    'Jamaica COPA 2026 II': 'Selecao/Jamaica/COPA 2026/II/1.jpg',
    'Japao COPA 2026 I': 'Selecao/Japao/COPA 2026/I/1.jpg',
    'Japao COPA 2026 II': 'Selecao/Japao/COPA 2026/II/1.jpg',
    'Marrocos COPA 2026 I': 'Selecao/Marrocos/COPA 2026/I/1.jpg',
    'Mexico COPA 2026 I': 'Selecao/Mexico/COPA 2026/I/1.jpg',
    'Mexico COPA 2026 II': 'Selecao/Mexico/COPA 2026/II/1.jpg',
    'Nigeria 2026 I': 'Selecao/Nigeria/COPA%202026/I/1.jpg',
    'Nigeria 2026 II': 'Selecao/Nigeria/COPA%202026/II/1.jpg',
    'Noruega COPA 2026 I': 'Selecao/Noruega/COPA 2026/I/1.jpg',
    'Noruega COPA 2026 II': 'Selecao/Noruega/COPA 2026/II/1.jpg',
    'Portugal COPA 2026 I': 'Selecao/Portugal/COPA 2026/I/1.jpg',
    'Portugal COPA 2026 II': 'Selecao/Portugal/COPA 2026/II/1.jpg',
    'Uruguai COPA 2026 I': 'Selecao/Uruguai/COPA 2026/I/1.jpg',
    'Uruguai COPA 2026 II': 'Selecao/Uruguai/COPA 2026/II/1.jpg',
  };

  let restored = 0;
  for (const nome of missing) {
    const path = pathMap[nome];
    if (!path) { console.log(`[SEM PATH] ${nome}`); continue; }
    const imagem_url = path.includes('%') ? `${baseUrl}/${path}` : `${baseUrl}/${path.replace(/ /g, '%20')}`;
    
    const insertRes = await fetch(
      `${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/camisetas`,
      { method: 'POST', headers: { ...headers, 'Prefer': 'return=representation' }, 
        body: JSON.stringify({ nome, imagem_url, categoria: 'SELEÇÃO', preco: 169.99 }) }
    );
    const ok = insertRes.ok || insertRes.status === 201;
    console.log(`[${ok ? '✅ RESTAURADO' : '❌'}] "${nome}"`);
    if (ok) restored++;
  }

  // ── PASSO 3: Corrigir nomes incorretos que restaram (ex: "Holanda RETRO 2010 2004") ──
  console.log('\n─── Corrigindo nomes com padrão de ano duplicado ainda restantes ───');
  const allFinal = await getAllCamisas();
  const stillBad = allFinal.filter(c => badPattern.test(c.nome));
  for (const c of stillBad) {
    const ok = await deleteById(c.id);
    console.log(`[${ok ? '🗑️ DELETADO' : '❌'}] "${c.nome}"`);
  }

  console.log(`\n✅ Restauradas: ${restored}/${missing.length}`);
  console.log('Concluído!');
}

run();
