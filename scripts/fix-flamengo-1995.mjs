// Corrige Flamengo RETRO 1995 — tem 4 variações: Centenario, I, II, III
// O DB tem 3 entradas "Flamengo RETRO 1995" (renomeadas de volta do Centenario)
// Vamos garantir que todas as 4 variações existam no banco com URLs corretas

const H = {
  'apikey': process.env.SUPABASE_SERVICE_ROLE_KEY,
  'Authorization': `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`,
  'Content-Type': 'application/json',
  'Prefer': 'return=minimal'
};
const BASE = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/camisas`;
const DB = process.env.NEXT_PUBLIC_SUPABASE_URL + '/rest/v1/camisetas';

async function run() {
  // Pega entradas atuais do Flamengo RETRO 1995
  const rows = await fetch(`${DB}?nome=eq.Flamengo%20RETRO%201995&select=id,nome,imagem_url`, { headers: H }).then(r => r.json());
  console.log(`Entradas atuais "Flamengo RETRO 1995": ${rows.length}`);
  rows.forEach(r => console.log(`  [${r.id}] ${r.imagem_url}`));

  // As 4 variações no storage
  const VARS = ['Centenario', 'I', 'II', 'III'];
  
  // Atualiza as entradas existentes com as variações corretas
  for (let i = 0; i < Math.min(rows.length, VARS.length); i++) {
    const url = `${BASE}/Brasileirao/Flamengo/RETRO/1995/${VARS[i]}/1.jpg`;
    const ok = await fetch(`${DB}?id=eq.${rows[i].id}`, {
      method: 'PATCH', headers: H, body: JSON.stringify({ imagem_url: url })
    }).then(r => r.ok);
    console.log(`[${ok ? '✅' : '❌'}] Flamengo RETRO 1995 (${VARS[i]}) => ${url}`);
  }

  // Cria entradas adicionais se houver mais variações do que entradas
  for (let i = rows.length; i < VARS.length; i++) {
    const url = `${BASE}/Brasileirao/Flamengo/RETRO/1995/${VARS[i]}/1.jpg`;
    const ok = await fetch(DB, {
      method: 'POST', headers: { ...H, 'Prefer': 'return=representation' },
      body: JSON.stringify({ nome: 'Flamengo RETRO 1995', categoria: 'RETRO', preco: 199.99, imagem_url: url })
    }).then(r => r.ok);
    console.log(`[${ok ? '✅ CRIADO' : '❌'}] Flamengo RETRO 1995 (${VARS[i]})`);
  }
}
run();
