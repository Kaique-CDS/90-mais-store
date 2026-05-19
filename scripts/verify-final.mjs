// Verificação final do estado do banco + correção West Ham
const headers = {
  'apikey': process.env.SUPABASE_SERVICE_ROLE_KEY,
  'Authorization': `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`,
  'Content-Type': 'application/json',
  'Prefer': 'return=minimal'
};
const base = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/camisas`;

async function listPath(path) {
  const url = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/list/camisas`;
  const res = await fetch(url, { method: 'POST', headers, body: JSON.stringify({ prefix: path, limit: 100 }) });
  return res.ok ? res.json() : [];
}

async function updateById(id, fields) {
  const res = await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/camisetas?id=eq.${id}`, { method: 'PATCH', headers, body: JSON.stringify(fields) });
  return res.ok;
}

async function getByName(nome) {
  const res = await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/camisetas?nome=eq.${encodeURIComponent(nome)}&select=id,nome,imagem_url`, { headers });
  return res.json();
}

async function insertDB(fields) {
  const res = await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/camisetas`, {
    method: 'POST', headers: { ...headers, 'Prefer': 'return=representation' }, body: JSON.stringify(fields)
  });
  return res.json();
}

async function getAllCamisas() {
  const res = await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/camisetas?select=id,nome,imagem_url,categoria,preco&order=nome`, { headers });
  return res.json();
}

async function run() {
  // ── 1. West Ham ──────────────────────────────────────────────────────────────
  console.log('=== WEST HAM ===');
  // Encontra a pasta do West Ham no storage
  const europeuList = await listPath('Europeu');
  const westHamFolder = europeuList.find(i => i.name.toLowerCase().includes('west'));
  
  if (westHamFolder) {
    console.log(`Pasta encontrada: Europeu/${westHamFolder.name}`);
    const subfolders = await listPath(`Europeu/${westHamFolder.name}`);
    console.log('Subpastas:', subfolders.map(i => i.name));
    
    const season = subfolders.find(i => i.name.match(/\d/));
    if (season) {
      const variations = await listPath(`Europeu/${westHamFolder.name}/${season.name}`);
      console.log('Variações:', variations.map(i => i.name));
      
      const numerals = ['I', 'II', 'III'];
      for (let i = 0; i < variations.length && i < 3; i++) {
        const variation = variations[i].name;
        const nomeProduto = `West Ham 25/26 ${numerals[i]}`;
        // Verifica se há arquivo 1.jpg dentro da variação
        const files = await listPath(`Europeu/${westHamFolder.name}/${season.name}/${variation}`);
        const foto1 = files.find(f => f.name.match(/^1\.(jpg|jpeg|png)/i));
        if (!foto1) { console.log(`[SEM FOTO] ${nomeProduto}`); continue; }
        
        const storagePath = `Europeu/${westHamFolder.name}/${season.name}/${variation}/${foto1.name}`;
        const url = `${base}/${storagePath.replace(/ /g, '%20')}`;
        
        const rows = await getByName(nomeProduto);
        if (rows.length > 0) {
          const ok = await updateById(rows[0].id, { imagem_url: url });
          console.log(`[${ok ? '✅' : '❌'}] ${nomeProduto} => ${storagePath}`);
        } else {
          console.log(`[NÃO ENCONTRADO] ${nomeProduto}`);
        }
      }
    }
  } else {
    console.log('[NÃO ENCONTRADO] Pasta West Ham no storage!');
  }

  // ── 2. Verifica entradas que o full-analysis corrigiu bem ────────────────────
  console.log('\n=== VERIFICAÇÃO DE ENTRADAS COM COR ===');
  const all = await getAllCamisas();
  const comCor = all.filter(c => 
    c.nome.match(/ (Branca|Preta|Azul|Amarela|Amarelo|AZUL|Especial|Centenario|Branca|Vermelho)$/i)
  );
  console.log(`Camisas com cor no nome: ${comCor.length}`);
  comCor.forEach(c => console.log(`  [${c.imagem_url ? '✅' : '❌URL'}] ${c.nome}`));

  // ── 3. Camisas com nome duplicado ─────────────────────────────────────────────
  console.log('\n=== POSSÍVEIS DUPLICADOS AINDA ===');
  const nomeCount = {};
  for (const c of all) nomeCount[c.nome] = (nomeCount[c.nome] || 0) + 1;
  const dupes = Object.entries(nomeCount).filter(([, v]) => v > 1);
  if (dupes.length === 0) console.log('Nenhum duplicado encontrado!');
  else dupes.forEach(([nome, count]) => console.log(`  (${count}x) "${nome}"`));

  console.log(`\nTotal no banco: ${all.length} camisas`);
}

run();
