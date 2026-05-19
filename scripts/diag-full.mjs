/**
 * DIAGNÓSTICO COMPLETO DO ESTADO ATUAL DO BANCO
 * Mostra tudo que existe agora para análise
 */
const headers = {
  'apikey': process.env.SUPABASE_SERVICE_ROLE_KEY,
  'Authorization': `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`,
};

async function run() {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/camisetas?select=id,nome,categoria,imagem_url&order=nome`,
    { headers }
  );
  const all = await res.json();
  console.log(`TOTAL: ${all.length} camisas\n`);
  all.forEach(c => {
    const url = c.imagem_url ? c.imagem_url.replace('https://bzdjxnenljqwtvbdonxl.supabase.co/storage/v1/object/public/camisas/', '') : 'SEM URL';
    console.log(`[${c.categoria}] "${c.nome}" => ${url}`);
  });
}
run();
