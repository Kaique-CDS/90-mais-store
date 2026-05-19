// Verifica paths específicos do Corinthians e busca West Ham
const headers = {
  'apikey': process.env.SUPABASE_SERVICE_ROLE_KEY,
  'Authorization': `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`,
  'Content-Type': 'application/json'
};

async function listPath(path) {
  const url = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/list/camisas`;
  const res = await fetch(url, { method: 'POST', headers, body: JSON.stringify({ prefix: path, limit: 100 }) });
  if (!res.ok) return [];
  return res.json();
}

async function scan(path = "") {
  const items = await listPath(path);
  let files = [];
  for (const item of items) {
    if (item.name === '.emptyFolderPlaceholder') continue;
    if (!item.id && !item.metadata) {
      const subPath = path ? `${path}/${item.name}` : item.name;
      const subFiles = await scan(subPath);
      files.push(...subFiles);
    } else {
      files.push(path ? `${path}/${item.name}` : item.name);
    }
  }
  return files;
}

async function run() {
  // Corinthians RETRO 1990 e 1994 existem?
  const corinthiansRetro = await scan('Brasileirao/Corinthians/RETRO');
  console.log('=== Corinthians RETRO (subpastas) ===');
  // Listar apenas primeiros arquivos de cada pasta
  const seen = new Set();
  corinthiansRetro.forEach(f => {
    const parts = f.split('/');
    const folder = parts.slice(0, -1).join('/'); // tudo menos o arquivo
    if (!seen.has(folder)) {
      seen.add(folder);
      console.log(' PASTA:', folder, '| 1o arquivo:', f);
    }
  });

  // West Ham — busca em todas as pastas conhecidas
  console.log('\n=== Buscando West Ham em Outros / Europeu ===');
  const outros = await listPath('Outros');
  const outrosNomes = outros.map(x => x.name);
  console.log('Outros:', outrosNomes.join(', '));
}

run();
