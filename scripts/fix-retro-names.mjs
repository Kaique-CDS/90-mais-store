/**
 * CORREÇÃO DEFINITIVA DOS NOMES DO CORINTHIANS E FLAMENGO RETRO
 * 
 * O script de análise gerou nomes errados como:
 * - "Corinthians RETRO 1998 1994 Branca" (deveria ser "Corinthians RETRO 1998 Branca")
 * - "Flamengo RETRO 1995 1993 Centenario" (deveria ser "Flamengo RETRO 1995 Centenario")
 * 
 * Este script corrige esses nomes de forma precisa.
 */

const headers = {
  'apikey': process.env.SUPABASE_SERVICE_ROLE_KEY,
  'Authorization': `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`,
  'Content-Type': 'application/json',
  'Prefer': 'return=minimal'
};
const base = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/camisas`;

// Mapeamento: nome_atual_errado => { nome_correto, imagem_url_correta }
const CORRECOES = [
  // ── CORINTHIANS RETRO (ano_duplicado + cor) ──────────────────────────────────
  { atual: 'Corinthians RETRO 1998 1994 Branca', correto: 'Corinthians RETRO 1998 Branca', path: 'Brasileirao/Corinthians/RETRO/1998/Branca/1.jpg' },
  { atual: 'Corinthians RETRO 1998 1994 Preta',  correto: 'Corinthians RETRO 1998 Preta',  path: 'Brasileirao/Corinthians/RETRO/1998/Preta/1.jpg' },
  { atual: 'Corinthians RETRO 1998 2011 Branca', correto: null, path: null }, // Duplicata — deletar
  { atual: 'Corinthians RETRO 1998 2011 Preta',  correto: null, path: null }, // Duplicata — deletar

  { atual: 'Corinthians RETRO 1999 1994 Branca', correto: 'Corinthians RETRO 1999 Branca', path: 'Brasileirao/Corinthians/RETRO/1999/Branca/1.jpg' },
  { atual: 'Corinthians RETRO 1999 1994 Preta',  correto: 'Corinthians RETRO 1999 Preta',  path: 'Brasileirao/Corinthians/RETRO/1999/Preta/1.jpg' },
  { atual: 'Corinthians RETRO 1999 2011 Branca', correto: null, path: null }, // Duplicata — deletar
  { atual: 'Corinthians RETRO 1999 2011 Preta',  correto: null, path: null }, // Duplicata — deletar

  { atual: 'Corinthians RETRO 2000 1994 Branca', correto: 'Corinthians RETRO 2000 Branca', path: 'Brasileirao/Corinthians/RETRO/2000/Branca/1.jpg' },
  { atual: 'Corinthians RETRO 2000 2011 Branca', correto: null, path: null }, // Duplicata — deletar
  // Preto 2000
  { atual: 'Corinthians RETRO 2000 Preto',       correto: 'Corinthians RETRO 2000 Preta',  path: 'Brasileirao/Corinthians/RETRO/2000/Preto/1.jpg' }, // já existe mas nome certo

  { atual: 'Corinthians RETRO 2010 1994 Centenario', correto: 'Corinthians RETRO 2010 Centenario', path: 'Brasileirao/Corinthians/RETRO/2010/Centenario/1.jpg' },
  { atual: 'Corinthians RETRO 2010 1994 Preta',      correto: 'Corinthians RETRO 2010 Preta',      path: 'Brasileirao/Corinthians/RETRO/2010/Preta/1.jpg' },
  { atual: 'Corinthians RETRO 2010 2011 Centenario', correto: null, path: null }, // Duplicata — deletar
  { atual: 'Corinthians RETRO 2010 2011 Preta',      correto: null, path: null }, // Duplicata — deletar

  { atual: 'Corinthians RETRO 2012 1994 Branca',  correto: 'Corinthians RETRO 2012 Branca',  path: 'Brasileirao/Corinthians/RETRO/2012/Branca/1.jpg' },
  { atual: 'Corinthians RETRO 2012 1994 Especial',correto: 'Corinthians RETRO 2012 Especial', path: 'Brasileirao/Corinthians/RETRO/2012/Especial/1.jpg' },
  { atual: 'Corinthians RETRO 2012 2011 Branca',  correto: null, path: null }, // Duplicata — deletar
  { atual: 'Corinthians RETRO 2012 2011 Especial',correto: null, path: null }, // Duplicata — deletar

  // ── FLAMENGO RETRO ─────────────────────────────────────────────────────────
  { atual: 'Flamengo RETRO 1995 1993 Centenario', correto: null, path: null }, // Duplicata — deletar
  { atual: 'Flamengo RETRO 1995 1994 Centenario', correto: null, path: null }, // Duplicata — deletar
  // "Flamengo RETRO 1995 Centenario" já deve estar correto — verificar
];

async function getByNome(nome) {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/camisetas?nome=eq.${encodeURIComponent(nome)}&select=id,nome,imagem_url`,
    { headers }
  );
  return res.json();
}

async function updateById(id, fields) {
  const res = await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/camisetas?id=eq.${id}`, { method: 'PATCH', headers, body: JSON.stringify(fields) });
  return res.ok;
}

async function deleteById(id) {
  const res = await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/camisetas?id=eq.${id}`, { method: 'DELETE', headers });
  return res.ok;
}

async function run() {
  console.log('Aplicando correções de nomes...\n');

  for (const c of CORRECOES) {
    const rows = await getByNome(c.atual);
    if (!rows?.length) {
      console.log(`[NÃO EXISTE] "${c.atual}" — já foi corrigido ou não existe`);
      continue;
    }

    for (const row of rows) {
      if (c.correto === null) {
        // Deletar duplicata
        const ok = await deleteById(row.id);
        console.log(`[${ok ? '🗑️ DELETADO' : '❌'}] "${row.nome}"`);
      } else {
        // Renomear e corrigir URL
        const url = c.path ? `${base}/${c.path.replace(/ /g, '%20')}` : row.imagem_url;
        const ok = await updateById(row.id, { nome: c.correto, imagem_url: url });
        console.log(`[${ok ? '✅' : '❌'}] "${c.atual}" => "${c.correto}"`);
      }
    }
  }

  // Verificar estado final
  const allRes = await fetch(
    `${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/camisetas?nome=ilike.*Corinthians*RETRO*&select=id,nome,imagem_url&order=nome`,
    { headers }
  );
  const corinthians = await allRes.json();
  console.log(`\n=== CORINTHIANS RETRO FINAL (${corinthians.length} entradas) ===`);
  corinthians.forEach(c => console.log(`  ${c.nome}`));
}

run();
