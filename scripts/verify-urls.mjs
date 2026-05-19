// Verifica quais URLs das entradas recriadas estão quebradas (arquivo não existe no storage)
const H = { 'apikey': process.env.SUPABASE_SERVICE_ROLE_KEY, 'Authorization': `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}` };

const RECRIADAS = [
  'Flamengo RETRO 1993', 'Flamengo RETRO 1994', 'Flamengo RETRO 2008',
  'Liverpool RETRO 1996',
  'Manchester United RETRO 1997', 'Manchester United RETRO 1998', 'Manchester United RETRO 2007',
  'Milan RETRO 1999', 'Milan RETRO 2006', 'Milan RETRO 2008', 'Milan RETRO 2012',
  'Palmeiras RETRO 1993', 'Palmeiras RETRO 1995', 'Palmeiras RETRO 1999',
  'Real Madrid RETRO 1998', 'Real Madrid RETRO 1999',
  'Roma RETRO 1990', 'Roma RETRO 1999',
  'Sao Paulo RETRO 1999', 'Sao Paulo RETRO 2000', 'Sao Paulo RETRO 2008',
  'Argentina RETRO 1994', 'Argentina RETRO 2006', 'Argentina RETRO 2012',
  'Bayern Muchen RETRO 1995', 'Bayern Muchen RETRO 1998',
  'Chelsea RETRO 2006', 'Chelsea RETRO 2008',
  'Boca Juniors 25/26 III',
];

async function run() {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/camisetas?select=id,nome,imagem_url&order=nome`,
    { headers: H }
  );
  const all = await res.json();

  console.log('=== VERIFICANDO URLs DAS ENTRADAS RECRIADAS ===\n');
  
  // Pega apenas as entradas que nos interessam
  const toCheck = all.filter(c => RECRIADAS.some(n => c.nome.startsWith(n)));
  
  const seen = new Set();
  for (const c of toCheck) {
    if (seen.has(c.nome)) continue; // skip duplicatas do Milan RETRO 2006
    seen.add(c.nome);
    
    if (!c.imagem_url) { console.log(`[SEM URL] ${c.nome}`); continue; }
    
    // Faz HEAD request para checar se o arquivo existe
    try {
      const r = await fetch(c.imagem_url, { method: 'HEAD' });
      const status = r.ok ? '✅ OK' : `❌ ${r.status}`;
      console.log(`[${status}] ${c.nome}`);
      if (!r.ok) console.log(`    URL: ${c.imagem_url}`);
    } catch (e) {
      console.log(`[❌ ERRO] ${c.nome}: ${e.message}`);
    }
  }
}
run();
