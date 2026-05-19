/**
 * RESTAURAÇÃO COMPLETA
 * 1. Renomeia entradas com cor no nome de volta ao nome original
 * 2. Recria seleções perdidas
 * 3. Recria RETRO antigos deletados
 * 4. Corrige nomes errados (Napoli, Milan, Corinthians, Flamengo)
 */
const H = {
  'apikey': process.env.SUPABASE_SERVICE_ROLE_KEY,
  'Authorization': `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`,
  'Content-Type': 'application/json',
  'Prefer': 'return=minimal'
};
const BASE = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/camisas`;

const db = process.env.NEXT_PUBLIC_SUPABASE_URL + '/rest/v1/camisetas';

async function getAll() { return (await fetch(`${db}?select=id,nome,imagem_url,categoria,preco&order=nome`, { headers: H })).json(); }
async function del(id) { return (await fetch(`${db}?id=eq.${id}`, { method: 'DELETE', headers: H })).ok; }
async function patch(id, f) { return (await fetch(`${db}?id=eq.${id}`, { method: 'PATCH', headers: H, body: JSON.stringify(f) })).ok; }
async function ins(f) { return (await fetch(db, { method: 'POST', headers: { ...H, 'Prefer': 'return=representation' }, body: JSON.stringify(f) })).ok; }

function u(path) { return `${BASE}/${path.replace(/ /g, '%20')}`; }

async function run() {
  let all = await getAll();
  console.log(`DB atual: ${all.length} entradas\n`);

  // ── 1. RENOMEAR DE VOLTA (remover sufixo de cor das antigas) ─────────────────
  const RENAMES = [
    // Brasil RETRO - tirar Amarela/Azul/AZUL/Amarelo do final
    ['Brasil RETRO 1994 Amarela', 'Brasil RETRO 1994'],
    ['Brasil RETRO 1994 Azul',    'Brasil RETRO 1994'],
    ['Brasil RETRO 1998 Amarela', 'Brasil RETRO 1998'],
    ['Brasil RETRO 1998 Azul',    'Brasil RETRO 1998'],
    ['Brasil RETRO 2002 Amarelo', 'Brasil RETRO 2002'],
    ['Brasil RETRO 2002 AZUL',    'Brasil RETRO 2002'],
    ['Brasil RETRO 2004 Amarela', 'Brasil RETRO 2004'],
    ['Brasil RETRO 2004 Azul',    'Brasil RETRO 2004'],
    // Botafogo RETRO
    ['Botafogo RETRO 1995 BRANCA',   'Botafogo RETRO 1995'],
    ['Botafogo RETRO 1995 LISTRADA', 'Botafogo RETRO 1995'],
    ['Botafogo RETRO 1995 PRETA',    'Botafogo RETRO 1995'],
    // Vasco RETRO
    ['Vasco RETRO 1999 BRANCA', 'Vasco RETRO 1999'],
    ['Vasco RETRO 1999 PRETA',  'Vasco RETRO 1999'],
    // Flamengo RETRO
    ['Flamengo RETRO 1995 Centenario', 'Flamengo RETRO 1995'],
    // Corinthians 26/27 - nome errado
    ['Corinthians 26/27 I Treino', 'Corinthians 26/27 Treino'],
  ];

  console.log('=== RENOMEANDO ===');
  for (const [oldNome, newNome] of RENAMES) {
    const row = all.find(c => c.nome === oldNome);
    if (!row) { console.log(`[SKIP] "${oldNome}" não encontrado`); continue; }
    const ok = await patch(row.id, { nome: newNome });
    console.log(`[${ok ? '✅' : '❌'}] "${oldNome}" => "${newNome}"`);
  }

  // ── 2. DELETAR ENTRADAS INVÁLIDAS (Milan x9, Napoli x4 errados) ─────────────
  const TO_DELETE_PATTERNS = [
    // Milan RETRO gerados errado (9 entradas)
    'Milan RETRO 2006 1999', 'Milan RETRO 2006 2008', 'Milan RETRO 2006 2012',
    // Napoli gerados errado
    'Napoli 25/26 Coca Cola Especial', 'Napoli 25/26 Coca Cola I',
    'Napoli 25/26 Coca Cola II', 'Napoli 25/26 Coca Cola III',
  ];

  all = await getAll();
  console.log('\n=== DELETANDO INVÁLIDOS ===');
  for (const row of all) {
    if (TO_DELETE_PATTERNS.some(p => row.nome.startsWith(p))) {
      const ok = await del(row.id);
      console.log(`[${ok ? '🗑️' : '❌'}] "${row.nome}"`);
    }
  }

  // ── 3. RECRIAR SELEÇÕES PERDIDAS ─────────────────────────────────────────────
  const SELECOES = [
    // Brasil COPA 2026 I e II (Jogador já existe)
    { nome: 'Brasil COPA 2026 I',   cat: 'SELEÇÃO', preco: 169.99, path: 'Selecao/Brasil/COPA 2026/I/1.jpg' },
    { nome: 'Brasil COPA 2026 II',  cat: 'SELEÇÃO', preco: 169.99, path: 'Selecao/Brasil/COPA 2026/II/1.jpg' },
    // Alemanha
    { nome: 'Alemanha COPA 2026 I',  cat: 'SELEÇÃO', preco: 169.99, path: 'Selecao/Alemanha/COPA 2026/I/1.jpg' },
    { nome: 'Alemanha COPA 2026 II', cat: 'SELEÇÃO', preco: 169.99, path: 'Selecao/Alemanha/COPA 2026/II/1.jpg' },
    // Argentina
    { nome: 'Argentina COPA 2026 I',  cat: 'SELEÇÃO', preco: 169.99, path: 'Selecao/Argentina/COPA 2026/I/1.jpg' },
    { nome: 'Argentina COPA 2026 II', cat: 'SELEÇÃO', preco: 169.99, path: 'Selecao/Argentina/COPA 2026/II/1.jpg' },
    // Belgica
    { nome: 'Belgica COPA 2026 I',  cat: 'SELEÇÃO', preco: 169.99, path: 'Selecao/Belgica/COPA 2026/I/1.jpg' },
    { nome: 'Belgica COPA 2026 II', cat: 'SELEÇÃO', preco: 169.99, path: 'Selecao/Belgica/COPA 2026/II/1.jpg' },
    // Colombia
    { nome: 'Colombia COPA 2026 I',  cat: 'SELEÇÃO', preco: 169.99, path: 'Selecao/Colombia/COPA 2026/I/1.jpg' },
    { nome: 'Colombia COPA 2026 II', cat: 'SELEÇÃO', preco: 169.99, path: 'Selecao/Colombia/COPA 2026/II/1.jpg' },
    // Croacia
    { nome: 'Croacia COPA 2026 I',  cat: 'SELEÇÃO', preco: 169.99, path: 'Selecao/Croacia/COPA 2026/I/1.jpg' },
    { nome: 'Croacia COPA 2026 II', cat: 'SELEÇÃO', preco: 169.99, path: 'Selecao/Croacia/COPA 2026/II/1.jpg' },
    // Espanha
    { nome: 'Espanha COPA 2026 I',  cat: 'SELEÇÃO', preco: 169.99, path: 'Selecao/Espanha/COPA 2026/I/1.jpg' },
    { nome: 'Espanha COPA 2026 II', cat: 'SELEÇÃO', preco: 169.99, path: 'Selecao/Espanha/COPA 2026/II/1.jpg' },
    // França
    { nome: 'França COPA 2026 I',  cat: 'SELEÇÃO', preco: 169.99, path: 'Selecao/Franca/COPA 2026/I/1.jpg' },
    { nome: 'França COPA 2026 II', cat: 'SELEÇÃO', preco: 169.99, path: 'Selecao/Franca/COPA 2026/II/1.jpg' },
    // Holanda
    { nome: 'Holanda COPA 2026 I',  cat: 'SELEÇÃO', preco: 169.99, path: 'Selecao/Holanda/COPA 2026/I/1.jpg' },
    { nome: 'Holanda COPA 2026 II', cat: 'SELEÇÃO', preco: 169.99, path: 'Selecao/Holanda/COPA 2026/II/1.jpg' },
    // Inglaterra
    { nome: 'Inglaterra COPA 2026 I',  cat: 'SELEÇÃO', preco: 169.99, path: 'Selecao/Inglaterra/COPA 2026/I/1.jpg' },
    { nome: 'Inglaterra COPA 2026 II', cat: 'SELEÇÃO', preco: 169.99, path: 'Selecao/Inglaterra/COPA 2026/II/1.jpg' },
    // Jamaica
    { nome: 'Jamaica COPA 2026 I',  cat: 'SELEÇÃO', preco: 169.99, path: 'Selecao/Jamaica/COPA 2026/I/1.jpg' },
    { nome: 'Jamaica COPA 2026 II', cat: 'SELEÇÃO', preco: 169.99, path: 'Selecao/Jamaica/COPA 2026/II/1.jpg' },
    // Japao
    { nome: 'Japao COPA 2026 I',  cat: 'SELEÇÃO', preco: 169.99, path: 'Selecao/Japao/COPA 2026/I/1.jpg' },
    { nome: 'Japao COPA 2026 II', cat: 'SELEÇÃO', preco: 169.99, path: 'Selecao/Japao/COPA 2026/II/1.jpg' },
    // Marrocos
    { nome: 'Marrocos COPA 2026 I', cat: 'SELEÇÃO', preco: 169.99, path: 'Selecao/Marrocos/COPA 2026/I/1.jpg' },
    // Mexico
    { nome: 'Mexico COPA 2026 I',  cat: 'SELEÇÃO', preco: 169.99, path: 'Selecao/Mexico/COPA 2026/I/1.jpg' },
    { nome: 'Mexico COPA 2026 II', cat: 'SELEÇÃO', preco: 169.99, path: 'Selecao/Mexico/COPA 2026/II/1.jpg' },
    // Noruega
    { nome: 'Noruega COPA 2026 I',  cat: 'SELEÇÃO', preco: 169.99, path: 'Selecao/Noruega/COPA 2026/I/1.jpg' },
    { nome: 'Noruega COPA 2026 II', cat: 'SELEÇÃO', preco: 169.99, path: 'Selecao/Noruega/COPA 2026/II/1.jpg' },
    // Portugal
    { nome: 'Portugal COPA 2026 I',  cat: 'SELEÇÃO', preco: 169.99, path: 'Selecao/Portugal/COPA 2026/I/1.jpg' },
    { nome: 'Portugal COPA 2026 II', cat: 'SELEÇÃO', preco: 169.99, path: 'Selecao/Portugal/COPA 2026/II/1.jpg' },
    // Uruguai
    { nome: 'Uruguai COPA 2026 I',  cat: 'SELEÇÃO', preco: 169.99, path: 'Selecao/Uruguai/COPA 2026/I/1.jpg' },
    { nome: 'Uruguai COPA 2026 II', cat: 'SELEÇÃO', preco: 169.99, path: 'Selecao/Uruguai/COPA 2026/II/1.jpg' },
    // Chile e Estados Unidos e Nigeria já devem existir (foram adicionados hoje)
    // confirmar
    { nome: 'Chile 2026 I',         cat: 'SELEÇÃO', preco: 169.99, path: 'Selecao/Chile/COPA 2026/I/1.jpg' },
    { nome: 'Estados Unidos 2026 I', cat: 'SELEÇÃO', preco: 169.99, path: 'Selecao/Estados%20Unidos/COPA%202026/I/1.jpg' },
    { nome: 'Estados Unidos 2026 II',cat: 'SELEÇÃO', preco: 169.99, path: 'Selecao/Estados%20Unidos/COPA%202026/II/1.jpg' },
    { nome: 'Nigeria 2026 I',        cat: 'SELEÇÃO', preco: 169.99, path: 'Selecao/Nigeria/COPA%202026/I/1.jpg' },
    { nome: 'Nigeria 2026 II',       cat: 'SELEÇÃO', preco: 169.99, path: 'Selecao/Nigeria/COPA%202026/II/1.jpg' },
  ];

  all = await getAll();
  const existingNames = new Set(all.map(c => c.nome));
  console.log('\n=== RECRIANDO SELEÇÕES PERDIDAS ===');
  for (const s of SELECOES) {
    if (existingNames.has(s.nome)) { console.log(`[SKIP] "${s.nome}" já existe`); continue; }
    const imgUrl = s.path.startsWith('Selecao/Estados') || s.path.startsWith('Selecao/Nigeria')
      ? `${BASE}/${s.path}`
      : u(s.path);
    const ok = await ins({ nome: s.nome, categoria: s.cat, preco: s.preco, imagem_url: imgUrl });
    console.log(`[${ok ? '✅' : '❌'}] "${s.nome}"`);
  }

  // ── 4. RECRIAR RETRO ANTIGOS DELETADOS ────────────────────────────────────────
  const OLD_RETRO = [
    // Argentina RETRO
    { nome: 'Argentina RETRO 1994', cat: 'RETRO', preco: 199.99, path: 'Selecao/Argentina/RETRO/1994/1.jpg' },
    { nome: 'Argentina RETRO 2006', cat: 'RETRO', preco: 199.99, path: 'Selecao/Argentina/RETRO/2006/1.jpg' },
    { nome: 'Argentina RETRO 2012', cat: 'RETRO', preco: 199.99, path: 'Selecao/Argentina/RETRO/2012/1.jpg' },
    // Bayern Muchen RETRO
    { nome: 'Bayern Muchen RETRO 1995', cat: 'RETRO', preco: 199.99, path: 'Europeu/Bayern Muchen/RETRO/1995/1.jpg' },
    { nome: 'Bayern Muchen RETRO 1998', cat: 'RETRO', preco: 199.99, path: 'Europeu/Bayern Muchen/RETRO/1998/1.jpg' },
    // Chelsea RETRO
    { nome: 'Chelsea RETRO 2006', cat: 'RETRO', preco: 199.99, path: 'Europeu/Chelsea/RETRO/2006/1.jpg' },
    { nome: 'Chelsea RETRO 2008', cat: 'RETRO', preco: 199.99, path: 'Europeu/Chelsea/RETRO/2008/1.jpg' },
    // Flamengo RETRO (2 entradas adicionais — original tinha 3x "Flamengo RETRO 1995")
    { nome: 'Flamengo RETRO 1995', cat: 'RETRO', preco: 199.99, path: 'Brasileirao/Flamengo/RETRO/1995/Centenario/1.jpg' },
    { nome: 'Flamengo RETRO 1995', cat: 'RETRO', preco: 199.99, path: 'Brasileirao/Flamengo/RETRO/1995/Centenario/1.jpg' },
    // Flamengo RETRO outros anos
    { nome: 'Flamengo RETRO 1993', cat: 'RETRO', preco: 199.99, path: 'Brasileirao/Flamengo/RETRO/1993/1.jpg' },
    { nome: 'Flamengo RETRO 1994', cat: 'RETRO', preco: 199.99, path: 'Brasileirao/Flamengo/RETRO/1994/1.jpg' },
    { nome: 'Flamengo RETRO 2008', cat: 'RETRO', preco: 199.99, path: 'Brasileirao/Flamengo/RETRO/2008/1.jpg' },
    // Liverpool RETRO 1996
    { nome: 'Liverpool RETRO 1996', cat: 'RETRO', preco: 199.99, path: 'Europeu/Liverpool/RETRO/1996/1.jpg' },
    // Manchester United RETRO antigos
    { nome: 'Manchester United RETRO 1997', cat: 'RETRO', preco: 199.99, path: 'Europeu/Manchester United/RETRO/1997/1.jpg' },
    { nome: 'Manchester United RETRO 1998', cat: 'RETRO', preco: 199.99, path: 'Europeu/Manchester United/RETRO/1998/1.jpg' },
    { nome: 'Manchester United RETRO 2007', cat: 'RETRO', preco: 199.99, path: 'Europeu/Manchester United/RETRO/2007/1.jpg' },
    // Manchester United RETRO novos adicionados hoje
    { nome: 'Manchester United Retrô 1996 I',  cat: 'EUROPEUS', preco: 199.99, path: 'Europeu/Manchester United/RETRO/1996/I/1.jpg' },
    { nome: 'Manchester United Retrô 1996 II', cat: 'EUROPEUS', preco: 199.99, path: 'Europeu/Manchester United/RETRO/1996/II/1.jpg' },
    { nome: 'Manchester United Retrô 2008 I',  cat: 'EUROPEUS', preco: 199.99, path: 'Europeu/Manchester United/RETRO/2008/1.png' },
    // Milan RETRO (deletar os errados e recriar 4 corretos)
    { nome: 'Milan RETRO 1999', cat: 'RETRO', preco: 199.99, path: 'Europeu/Milan/RETRO/1999/1.jpg' },
    { nome: 'Milan RETRO 2006', cat: 'RETRO', preco: 199.99, path: 'Europeu/Milan/RETRO/2006/Home/1.jpg' },
    { nome: 'Milan RETRO 2006', cat: 'RETRO', preco: 199.99, path: 'Europeu/Milan/RETRO/2006/Away/1.jpg' },
    { nome: 'Milan RETRO 2006', cat: 'RETRO', preco: 199.99, path: 'Europeu/Milan/RETRO/2006/Third/1.jpg' },
    { nome: 'Milan RETRO 2008', cat: 'RETRO', preco: 199.99, path: 'Europeu/Milan/RETRO/2008/1.jpg' },
    { nome: 'Milan RETRO 2012', cat: 'RETRO', preco: 199.99, path: 'Europeu/Milan/RETRO/2012/1.jpg' },
    // Napoli 25/26 Coca Cola (única entrada correta)
    { nome: 'Napoli 25/26 Coca Cola', cat: 'EUROPEUS', preco: 149.99, path: 'Europeu/Napoli/25-26/Especial Coca-Cola/1.jpg' },
    // Palmeiras RETRO
    { nome: 'Palmeiras RETRO 1993', cat: 'RETRO', preco: 199.99, path: 'Brasileirao/Palmeiras/RETRO/1993/1.jpg' },
    { nome: 'Palmeiras RETRO 1995', cat: 'RETRO', preco: 199.99, path: 'Brasileirao/Palmeiras/RETRO/1995/1.jpg' },
    { nome: 'Palmeiras RETRO 1999', cat: 'RETRO', preco: 199.99, path: 'Brasileirao/Palmeiras/RETRO/1999/1.jpg' },
    // Real Madrid RETRO antigos
    { nome: 'Real Madrid RETRO 1998', cat: 'RETRO', preco: 199.99, path: 'Europeu/Real Madrid/RETRO/1998/1.jpg' },
    { nome: 'Real Madrid RETRO 1999', cat: 'RETRO', preco: 199.99, path: 'Europeu/Real Madrid/RETRO/1999/1.jpg' },
    // Real Madrid Retrô novos
    { nome: 'Real Madrid Retrô 2006 II',  cat: 'EUROPEUS', preco: 199.99, path: 'Europeu/Real Madrid/RETRO/2006/II/1.jpg' },
    { nome: 'Real Madrid Retrô 2006 III', cat: 'EUROPEUS', preco: 199.99, path: 'Europeu/Real Madrid/RETRO/2006/III/1.jpg' },
    { nome: 'Real Madrid Retrô 2012 I',   cat: 'EUROPEUS', preco: 199.99, path: 'Europeu/Real Madrid/RETRO/2012/I/1.jpg' },
    { nome: 'Real Madrid Retrô 2012 II',  cat: 'EUROPEUS', preco: 199.99, path: 'Europeu/Real Madrid/RETRO/2012/II/1.jpg' },
    { nome: 'Real Madrid Retrô 2012 III', cat: 'EUROPEUS', preco: 199.99, path: 'Europeu/Real Madrid/RETRO/2006/III/1.jpg' },
    // Roma RETRO
    { nome: 'Roma RETRO 1990', cat: 'RETRO', preco: 199.99, path: 'Europeu/Roma/RETRO/1990/1.jpg' },
    { nome: 'Roma RETRO 1999', cat: 'RETRO', preco: 199.99, path: 'Europeu/Roma/RETRO/1999/1.jpg' },
    // Sao Paulo RETRO
    { nome: 'Sao Paulo RETRO 1999', cat: 'RETRO', preco: 199.99, path: 'Brasileirao/Sao Paulo/RETRO/1999/1.jpg' },
    { nome: 'Sao Paulo RETRO 2000', cat: 'RETRO', preco: 199.99, path: 'Brasileirao/Sao Paulo/RETRO/2000/1.jpg' },
    { nome: 'Sao Paulo RETRO 2008', cat: 'RETRO', preco: 199.99, path: 'Brasileirao/Sao Paulo/RETRO/2008/1.jpg' },
    // Valencia e Boca Juniors novos (verificar se existem)
    { nome: 'Valencia 25/26 I',     cat: 'EUROPEUS', preco: 149.99, path: 'Europeu/Valencia/25-26/I/1.jpg' },
    { nome: 'Valencia 25/26 II',    cat: 'EUROPEUS', preco: 149.99, path: 'Europeu/Valencia/25-26/II/1.jpg' },
    { nome: 'Boca Juniors 25/26 III', cat: 'EUROPEUS', preco: 149.99, path: 'Outros lugares do mundo/Boca juniors/25-26/III/1.jpg' },
  ];

  all = await getAll();
  const existingNamesNow = new Set(all.map(c => c.nome));
  console.log('\n=== RECRIANDO RETRO E OUTRAS PERDIDAS ===');
  // Para "Milan RETRO 2006" e "Flamengo RETRO 1995" que podem ter múltiplas, contamos
  const countMap = {};
  all.forEach(c => countMap[c.nome] = (countMap[c.nome] || 0) + 1);

  for (const s of OLD_RETRO) {
    // Para entradas que precisam existir MÚLTIPLAS vezes (ex: Milan RETRO 2006 x3)
    // verificamos quantas já existem
    const needed = OLD_RETRO.filter(x => x.nome === s.nome).length;
    const existing = countMap[s.nome] || 0;
    if (existing >= needed) { console.log(`[SKIP] "${s.nome}" já tem ${existing} entradas`); continue; }
    const ok = await ins({ nome: s.nome, categoria: s.cat, preco: s.preco, imagem_url: u(s.path) });
    console.log(`[${ok ? '✅' : '❌'}] "${s.nome}"`);
    countMap[s.nome] = (countMap[s.nome] || 0) + 1;
  }

  const final = await getAll();
  console.log(`\n✅ CONCLUÍDO! Total final: ${final.length} camisas`);
}

run();
