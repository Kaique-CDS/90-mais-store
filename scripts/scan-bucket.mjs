const headers = {
  'apikey': process.env.SUPABASE_SERVICE_ROLE_KEY,
  'Authorization': `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`,
  'Content-Type': 'application/json'
};

async function listPath(path) {
  const url = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/list/camisas`;
  const res = await fetch(url, {
    method: 'POST',
    headers,
    body: JSON.stringify({ prefix: path, limit: 100, sortBy: { column: "name", order: "asc" } })
  });
  if (!res.ok) return [];
  const data = await res.json();
  return data;
}

async function scan(path = "") {
  const items = await listPath(path);
  let files = [];
  for (const item of items) {
    if (item.name === '.emptyFolderPlaceholder') continue;
    
    // Check if it's a file or folder. No metadata means it's a folder usually.
    if (!item.id && !item.metadata) {
      // Folder
      const subPath = path ? `${path}/${item.name}` : item.name;
      const subFiles = await scan(subPath);
      files.push(...subFiles);
    } else {
      // File
      const fullPath = path ? `${path}/${item.name}` : item.name;
      files.push(fullPath);
    }
  }
  return files;
}

async function run() {
  console.log("Iniciando varredura no bucket camisas...");
  const allFiles = await scan("");
  console.log(`Encontrados ${allFiles.length} arquivos no total.`);
  
  // Filtrar apenas os "1.jpg" ou "1.png" para facilitar a associação
  const fotos1 = allFiles.filter(f => f.match(/\/1\.(jpg|png|webp|jpeg)$/i) || f.match(/^1\.(jpg|png|webp|jpeg)$/i));
  console.log(`Encontrados ${fotos1.length} pastas com "1.jpg".`);
  
  console.log(JSON.stringify(fotos1, null, 2));
}

run();
