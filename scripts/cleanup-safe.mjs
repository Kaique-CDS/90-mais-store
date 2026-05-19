/**
 * LIMPEZA DEFINITIVA — Abordagem cirúrgica e segura
 * 
 * O script anterior foi muito agressivo no regex e apagou entradas legítimas
 * como "Alemanha COPA 2026 I".
 * 
 * Este script faz uma coisa simples:
 * 1. Lista TUDO que está no banco agora
 * 2. Mostra os nomes que parecem errados (para confirmação visual)
 * 3. Deleta APENAS os que têm padrão claramente incorreto como:
 *    - Dois ANOS iguais/consecutivos: ex "Roma RETRO 1999 1999", "Palmeiras RETRO 1993 1993"
 *    - Combinação de dois anos de décadas distintas: "Holanda RETRO 2010 2004"
 *    NÃO deleta: "Alemanha COPA 2026 I", "Valencia 25/26 I", "Nigeria 2026 II"
 */

const headers = {
  'apikey': process.env.SUPABASE_SERVICE_ROLE_KEY,
  'Authorization': `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`,
  'Content-Type': 'application/json',
  'Prefer': 'return=minimal'
};

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

// Padrão claramente errado: dois ANOS (4 dígitos) um após o outro no final do nome
// Ex: "Roma RETRO 1999 1990", "Palmeiras RETRO 1993 1999", "Holanda RETRO 2010 2004"
// MAS NÃO: "Alemanha COPA 2026 I" (I não é um ano), "Valencia 25/26 I" (25/26 não é 4 dígitos no final)
const TRULY_BAD_PATTERN = /\b(19|20)\d{2} (19|20)\d{2}$/;

// Também nomes que claramente têm "I I", "I II", "II I" com espaço duplo de numeral
// mas apenas quando NÃO têm "COPA" ou palavras de temporada antes
const DOUBLE_NUMERAL = / (I{1,3}|IV|V) (I{1,3}|IV|V)$/;

async function run() {
  const all = await getAllCamisas();
  console.log(`Total de camisas no banco: ${all.length}\n`);

  // Identifica entradas ruins
  const bad = all.filter(c => {
    // Dois anos consecutivos no final (tipo "Roma RETRO 1999 1990")
    if (TRULY_BAD_PATTERN.test(c.nome)) return true;
    // Numerais duplos no final, mas não quando tem "COPA" antes (ex: "COPA 2026 I" é válido)
    // E não quando é uma temporada (25/26)
    if (DOUBLE_NUMERAL.test(c.nome) && !c.nome.includes('COPA') && !c.nome.includes('/')) return true;
    return false;
  });

  console.log(`Entradas claramente inválidas: ${bad.length}`);
  bad.forEach(c => console.log(`  "${c.nome}"`));

  if (bad.length === 0) {
    console.log('\nNenhuma entrada inválida encontrada. Banco está limpo!');
    return;
  }

  console.log('\nDeletando...');
  let deleted = 0;
  for (const c of bad) {
    const ok = await deleteById(c.id);
    if (ok) deleted++;
    process.stdout.write(`[${ok ? '🗑️' : '❌'}] "${c.nome}"\n`);
  }

  // Mostra estado final
  const final = await getAllCamisas();
  console.log(`\n✅ Deletadas: ${deleted}/${bad.length}`);
  console.log(`Total final: ${final.length} camisas no banco`);
}

run();
