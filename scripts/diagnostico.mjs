// Checa duplicatas no banco e as camisas novas para diagnóstico
const headers = {
  'apikey': process.env.SUPABASE_SERVICE_ROLE_KEY,
  'Authorization': `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`,
};

async function run() {
  // Busca todas
  const res = await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/camisetas?select=id,nome,imagem_url&order=nome`, { headers });
  const camisas = await res.json();

  // Encontra duplicatas pelo nome
  const seen = {};
  const duplicatas = [];
  for (const c of camisas) {
    if (seen[c.nome]) duplicatas.push(c.nome);
    seen[c.nome] = true;
  }

  console.log('=== DUPLICATAS ===');
  if (duplicatas.length === 0) console.log('Nenhuma duplicata encontrada.');
  else duplicatas.forEach(n => console.log(' -', n));

  console.log('\n=== CAMISAS COM imagem_url QUEBRADA (string vazia ou não começa com http) ===');
  const semFoto = camisas.filter(c => !c.imagem_url || !c.imagem_url.startsWith('http'));
  semFoto.forEach(c => console.log(' -', c.nome, '| url:', c.imagem_url));
  
  console.log('\n=== CAMISAS COM "RETRO" NO NOME (verificação de preço) ===');
  const retros = camisas.filter(c => c.nome.toUpperCase().includes('RETRO') || c.nome.toUpperCase().includes('RETRÔ'));
  retros.forEach(c => console.log(' -', c.nome));
  
  console.log('\n=== CAMISAS COM "TREINO" NO NOME ===');
  const treinos = camisas.filter(c => c.nome.toUpperCase().includes('TREINO'));
  treinos.forEach(c => console.log(' -', c.nome));

  console.log(`\nTotal geral: ${camisas.length}`);
}

run();
