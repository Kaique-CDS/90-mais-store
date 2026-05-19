const fs = require('fs');

const headers = {
  'apikey': process.env.SUPABASE_SERVICE_ROLE_KEY,
  'Authorization': `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`,
  'Content-Type': 'application/json',
  'Prefer': 'return=minimal'
};

async function getEmptyCamisas() {
  const url = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/camisetas?imagem_url=eq.&select=id,nome`;
  const res = await fetch(url, { headers });
  return res.json();
}

async function listPath(path) {
  const url = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/list/camisas`;
  const res = await fetch(url, {
    method: 'POST',
    headers,
    body: JSON.stringify({ prefix: path, limit: 200, sortBy: { column: "name", order: "asc" } })
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
    if (!item.id && !item.metadata) {
      const subPath = path ? `${path}/${item.name}` : item.name;
      const subFiles = await scan(subPath);
      files.push(...subFiles);
    } else {
      const fullPath = path ? `${path}/${item.name}` : item.name;
      files.push(fullPath);
    }
  }
  return files;
}

function normalize(str) {
  return str.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/[^a-z0-9]/g, "");
}

async function run() {
  console.log("Baixando lista de camisas vazias...");
  const camisas = await getEmptyCamisas();
  console.log(`Temos ${camisas.length} camisas sem foto.`);
  if (camisas.length === 0) return;

  console.log("Escaneando bucket (isso pode levar um minuto)...");
  const allFiles = await scan("");
  const fotos1 = allFiles.filter(f => f.match(/\/1\.(jpg|png|webp|jpeg)$/i) || f.match(/^1\.(jpg|png|webp|jpeg)$/i));
  
  const bucketBaseUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/camisas`;
  
  let successCount = 0;

  for (const camisa of camisas) {
    // Tenta encontrar a pasta que mais se aproxima do nome da camisa
    // Nós podemos normalizar e testar se todas as palavras do nome da camisa estão na rota
    
    // Simplificar nome para partes vitais
    const parts = camisa.nome.replace('26/27', '26').replace('25/26', '26').replace('25-26', '26')
                  .replace(/—|-/g, ' ')
                  .split(' ')
                  .map(normalize)
                  .filter(p => p.length > 0 && p !== 'e' && p !== 'frente' && p !== 'verso');
    
    let bestMatch = null;
    let maxScore = 0;
    
    for (const foto of fotos1) {
      const pathNorm = normalize(foto);
      let score = 0;
      for (const p of parts) {
        if (pathNorm.includes(p)) score++;
      }
      // Bônus se a categoria bater ou palavras chaves
      if (score > maxScore) {
        maxScore = score;
        bestMatch = foto;
      }
    }

    // Se o score for muito bom (pelo menos metade das partes bateu), linkamos!
    if (bestMatch && maxScore >= Math.min(2, parts.length)) {
      const url = `${bucketBaseUrl}/${bestMatch.replace(/ /g, '%20')}`;
      
      const updateUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/camisetas?id=eq.${camisa.id}`;
      await fetch(updateUrl, {
        method: 'PATCH',
        headers,
        body: JSON.stringify({ imagem_url: url })
      });
      console.log(`[OK] ${camisa.nome} -> ${bestMatch}`);
      successCount++;
    } else {
      console.log(`[FALHOU] ${camisa.nome} (Melhor: ${bestMatch} score: ${maxScore}/${parts.length})`);
    }
  }
  
  console.log(`Concluído! ${successCount}/${camisas.length} linkadas com sucesso.`);
}

run();
