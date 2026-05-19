/**
 * ANÁLISE E CORREÇÃO COMPLETA DO STORAGE
 * 
 * Escaneia TODO o bucket, encontra pastas com múltiplas variações (cores, I/II/III etc.)
 * que correspondem a produtos duplicados no banco, e:
 *   1. Renomeia os duplicados para incluir a variação (ex: "Corinthians RETRO 1998 Branca")
 *   2. Atualiza as URLs de cada entrada para apontar para a pasta correta
 *   3. Para o West Ham, busca a pasta nova e atualiza os 3 produtos
 */

const headers = {
  'apikey': process.env.SUPABASE_SERVICE_ROLE_KEY,
  'Authorization': `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`,
  'Content-Type': 'application/json',
  'Prefer': 'return=minimal'
};
const baseUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/camisas`;

// ── Storage helpers ──────────────────────────────────────────────────────────

async function listPath(path) {
  const url = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/list/camisas`;
  const res = await fetch(url, {
    method: 'POST', headers,
    body: JSON.stringify({ prefix: path, limit: 200, sortBy: { column: 'name', order: 'asc' } })
  });
  return res.ok ? res.json() : [];
}

async function scan(path = '') {
  const items = await listPath(path);
  let files = [];
  for (const item of items) {
    if (item.name === '.emptyFolderPlaceholder') continue;
    const fullPath = path ? `${path}/${item.name}` : item.name;
    if (!item.id && !item.metadata) {
      files.push(...await scan(fullPath));
    } else {
      files.push(fullPath);
    }
  }
  return files;
}

// ── DB helpers ───────────────────────────────────────────────────────────────

async function queryDB(filters) {
  const qs = Object.entries(filters).map(([k, v]) => `${k}=${v}`).join('&');
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/camisetas?${qs}&select=id,nome,imagem_url,categoria`,
    { headers }
  );
  return res.json();
}

async function updateDB(id, fields) {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/camisetas?id=eq.${id}`,
    { method: 'PATCH', headers, body: JSON.stringify(fields) }
  );
  return res.ok;
}

async function insertDB(fields) {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/camisetas`,
    { method: 'POST', headers: { ...headers, 'Prefer': 'return=representation' }, body: JSON.stringify(fields) }
  );
  return res.json();
}

// ── Lógica Principal ─────────────────────────────────────────────────────────

/**
 * Dada uma lista de arquivos do storage, retorna os "grupos com variações":
 * pastas cujo pai contém múltiplas subpastas de imagem (cores, I/II etc.)
 * 
 * Exemplo de saída:
 * {
 *   'Brasileirao/Corinthians/RETRO/1998': ['Branca', 'Preta'],
 *   'Europeu/West Ham/25-26': ['I', 'II', 'III'],
 * }
 */
function buildVariationGroups(allFiles) {
  // Encontra todos os arquivos de foto principal (1.jpg ou 1.png ou 1.jpeg)
  const fotos1 = allFiles.filter(f => f.match(/\/1\.(jpg|jpeg|png|webp)$/i));

  // Para cada foto, o "parent" é a pasta que a contém
  // O "grandparent" é a pasta acima dessa
  const groups = {}; // grandparent => [subfolder_name, ...]

  for (const foto of fotos1) {
    const parts = foto.split('/');
    // parts[-1] = filename (1.jpg)
    // parts[-2] = subfolder (Branca, Preta, I, II...)
    // parts[-3].. = grandparent path
    if (parts.length < 3) continue;
    const subfolder = parts[parts.length - 2];
    const grandparent = parts.slice(0, -2).join('/');

    if (!groups[grandparent]) groups[grandparent] = [];
    if (!groups[grandparent].includes(subfolder)) {
      groups[grandparent].push(subfolder);
    }
  }

  // Retorna apenas grupos com MAIS de 1 variação
  const multiVariation = {};
  for (const [parent, subs] of Object.entries(groups)) {
    if (subs.length > 1) multiVariation[parent] = subs;
  }
  return multiVariation;
}

/**
 * Converte um path de storage num "nome de produto" aproximado para busca no banco.
 * Ex: 'Brasileirao/Corinthians/RETRO/1998' => 'Corinthians RETRO 1998'
 * Ex: 'Europeu/West Ham/25-26' => 'West Ham 25/26'
 * Ex: 'Selecao/Brasil/COPA 2026' => 'Brasil COPA 2026'
 */
function pathToSearchName(storagePath) {
  const parts = storagePath.split('/');
  // Remove a raiz (Brasileirao, Europeu, Selecao, etc.)
  const meaningful = parts.slice(1);
  // Normaliza: troca traços por barras para temporadas
  return meaningful
    .join(' ')
    .replace(/(\d{2})-(\d{2})/g, '$1/$2') // 25-26 => 25/26
    .trim();
}

async function run() {
  console.log('=== ESCANEANDO BUCKET COMPLETO (pode demorar ~2 min) ===\n');
  const allFiles = await scan('');
  const foto1s = allFiles.filter(f => f.match(/\/1\.(jpg|jpeg|png|webp)$/i));
  console.log(`Total de arquivos no storage: ${allFiles.length}`);
  console.log(`Pastas com foto principal: ${foto1s.length}`);

  // 1. Corrige West Ham primeiro (pasta simples, sem variação de cor)
  console.log('\n─── West Ham ──────────────────────────────────────');
  const westHamPaths = foto1s.filter(f => f.toLowerCase().includes('west ham'));
  console.log('Pastas West Ham encontradas:', westHamPaths);

  if (westHamPaths.length > 0) {
    // Os 3 produtos: West Ham 25/26 I, II, III
    const numerals = ['I', 'II', 'III'];
    for (let i = 0; i < Math.min(westHamPaths.length, 3); i++) {
      const nomeProduto = `West Ham 25/26 ${numerals[i]}`;
      const path = westHamPaths[i];
      const url = `${baseUrl}/${path.replace(/ /g, '%20')}`;
      
      const rows = await queryDB({ nome: `eq.${encodeURIComponent(nomeProduto)}` });
      if (rows.length > 0) {
        const ok = await updateDB(rows[0].id, { imagem_url: url });
        console.log(`[${ok ? '✅' : '❌'}] ${nomeProduto} => ${path}`);
      } else {
        console.log(`[NÃO ENCONTRADO NO BANCO] ${nomeProduto}`);
      }
    }
  }

  // 2. Analisa grupos com múltiplas variações
  console.log('\n─── ANÁLISE DE VARIAÇÕES MÚLTIPLAS ──────────────────');
  const multiVariation = buildVariationGroups(allFiles);
  console.log(`Grupos com múltiplas variações: ${Object.keys(multiVariation).length}\n`);

  let totalCorrecoes = 0;

  for (const [parentPath, subfolders] of Object.entries(multiVariation)) {
    const searchName = pathToSearchName(parentPath);
    
    // Busca no banco entradas que contenham esse nome (case insensitive aproximado)
    // Usa ilike para encontrar variações do nome
    const nameParts = searchName.split(' ');
    // Pega pelo menos as 2 primeiras palavras significativas para buscar
    const searchTerm = nameParts.slice(0, 3).join(' ');
    
    const rows = await queryDB({ nome: `ilike.*${encodeURIComponent(searchTerm)}*` });
    
    if (rows.length === 0) continue;

    // Verifica se algum dos resultados é um "match" para esse path
    // (Precisa ser suficientemente parecido)
    const matchingRows = rows.filter(row => {
      const nomeUpper = row.nome.toUpperCase();
      const searchUpper = searchName.toUpperCase();
      // Pelo menos 2/3 das palavras do searchName precisam estar no nome
      const words = searchName.toUpperCase().split(' ');
      const matchCount = words.filter(w => nomeUpper.includes(w)).length;
      return matchCount >= Math.min(2, words.length);
    });

    if (matchingRows.length === 0) continue;

    // Verifica se há duplicatas (mesmo nome) com IDs diferentes
    const duplicates = {};
    for (const row of matchingRows) {
      if (!duplicates[row.nome]) duplicates[row.nome] = [];
      duplicates[row.nome].push(row);
    }

    // Processa apenas os grupos com duplicatas
    for (const [nome, dupeRows] of Object.entries(duplicates)) {
      if (dupeRows.length < 2 && subfolders.length < 2) continue;
      
      console.log(`\n📁 ${parentPath}`);
      console.log(`   Variações no storage: ${subfolders.join(', ')}`);
      console.log(`   No banco (${dupeRows.length}x): "${nome}"`);

      // Associa cada entrada duplicada do banco com uma subfolder
      const sorted = [...subfolders].sort(); // ordem alfabética
      
      for (let i = 0; i < Math.min(dupeRows.length, sorted.length); i++) {
        const row = dupeRows[i];
        const subfolder = sorted[i];
        const foto1Path = `${parentPath}/${subfolder}/1.${allFiles.find(f => f.startsWith(`${parentPath}/${subfolder}/1.`))?.split('.').pop() || 'jpg'}`;
        const newUrl = `${baseUrl}/${foto1Path.replace(/ /g, '%20')}`;
        
        // Novo nome: adiciona a variação ao final
        const newNome = `${nome} ${subfolder}`;
        
        const ok = await updateDB(row.id, { 
          nome: newNome,
          imagem_url: newUrl 
        });
        
        console.log(`   [${ok ? '✅' : '❌'}] "${nome}" => "${newNome}"`);
        console.log(`         URL: ${foto1Path}`);
        totalCorrecoes++;
      }

      // Se há mais subfolders do que entradas no banco, cria novas entradas
      if (sorted.length > dupeRows.length) {
        const extraSubfolders = sorted.slice(dupeRows.length);
        const baseRow = dupeRows[0];
        
        for (const subfolder of extraSubfolders) {
          const ext = allFiles.find(f => f.startsWith(`${parentPath}/${subfolder}/1.`))?.split('.').pop() || 'jpg';
          const foto1Path = `${parentPath}/${subfolder}/1.${ext}`;
          const newUrl = `${baseUrl}/${foto1Path.replace(/ /g, '%20')}`;
          const newNome = `${nome} ${subfolder}`;
          
          const inserted = await insertDB({
            nome: newNome,
            preco: baseRow.preco || 149.99,
            categoria: baseRow.categoria || 'BRASILEIROS',
            imagem_url: newUrl,
          });
          
          console.log(`   [${inserted ? '✅ CRIADO' : '❌'}] Nova entrada: "${newNome}"`);
          totalCorrecoes++;
        }
      }
    }
  }

  console.log(`\n\n=== CONCLUÍDO! ${totalCorrecoes} correções aplicadas. ===`);
}

run();
