// Escaneia todas as pastas das camisas problemáticas e retorna JSON com arquivos disponíveis
const H = {
  'apikey': process.env.SUPABASE_SERVICE_ROLE_KEY,
  'Authorization': `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`,
  'Content-Type': 'application/json'
};

async function listPath(path) {
  const res = await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/list/camisas`, {
    method: 'POST', headers: H,
    body: JSON.stringify({ prefix: path, limit: 200, sortBy: { column: 'name', order: 'asc' } })
  });
  return res.ok ? res.json() : [];
}

const BASE_URL = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/camisas`;

// Todas as pastas das camisas problemáticas
const FOLDERS = [
  // Seleções COPA 2026
  'Selecao/Alemanha/COPA 2026/II',
  'Selecao/Argentina/COPA 2026/I',
  'Selecao/Argentina/COPA 2026/II',
  'Selecao/Argentina/RETRO/1994',
  'Selecao/Argentina/RETRO/2006',
  'Selecao/Argentina/RETRO/2012',
  'Europeu/Bayern Muchen/RETRO/1995',
  'Europeu/Bayern Muchen/RETRO/1998',
  'Brasileirao/Botafogo/RETRO/1995/BRANCA',
  'Brasileirao/Botafogo/RETRO/1995/LISTRADA',
  'Brasileirao/Botafogo/RETRO/1995/PRETA',
  'Selecao/Brasil/COPA 2026/I',
  'Selecao/Brasil/COPA 2026/Jogador/I',
  'Selecao/Brasil/RETRO/1994/Amarela',
  'Selecao/Brasil/RETRO/1994/Azul',
  'Selecao/Brasil/RETRO/1998/Amarela',
  'Selecao/Brasil/RETRO/1998/Azul',
  'Selecao/Brasil/RETRO/2002/Amarelo',
  'Selecao/Brasil/RETRO/2002/AZUL',
  'Selecao/Brasil/RETRO/2004/Azul',
  'Europeu/Chelsea/RETRO/2006',
  'Europeu/Chelsea/RETRO/2008',
  'Selecao/Colombia/COPA 2026/I',
  'Selecao/Colombia/COPA 2026/II',
  'Brasileirao/Corinthians/RETRO/1996/BRANCA',
  'Brasileirao/Corinthians/RETRO/1998/Branca',
  'Brasileirao/Corinthians/RETRO/1998/Preta',
  'Brasileirao/Corinthians/RETRO/1999/Branca',
  'Brasileirao/Corinthians/RETRO/1999/Preta',
  'Brasileirao/Corinthians/RETRO/2000/Branca',
  'Brasileirao/Corinthians/RETRO/2000/Preto',
  'Brasileirao/Corinthians/RETRO/2010/Preta',
  'Brasileirao/Corinthians/RETRO/2012/Branca',
  'Brasileirao/Corinthians/RETRO/2012/Especial',
  'Selecao/Croacia/COPA 2026/I',
  'Selecao/Croacia/COPA 2026/II',
  'Brasileirao/Cruzeiro/25-26/II',
  'Selecao/Espanha/COPA 2026/I',
  'Selecao/Espanha/COPA 2026/II',
  'Brasileirao/Flamengo/RETRO/1993',
  'Brasileirao/Flamengo/RETRO/1994',
  'Brasileirao/Flamengo/RETRO/1995/I',
  'Brasileirao/Flamengo/RETRO/1995/II',
  'Brasileirao/Flamengo/RETRO/1995/III',
  'Brasileirao/Flamengo/RETRO/2008/I',
  'Selecao/Franca/COPA 2026/I',
  'Selecao/Holanda/RETRO/2010',
  'Selecao/Inglaterra/COPA 2026/I',
  'Selecao/Inglaterra/COPA 2026/II',
  'Selecao/Jamaica/COPA 2026/I',
  'Selecao/Jamaica/COPA 2026/II',
  'Selecao/Japao/COPA 2026/I',
  'Europeu/Manchester United/RETRO/2007',
  'Selecao/Mexico/COPA 2026/I',
  'Selecao/Mexico/COPA 2026/II',
  'Europeu/Milan/RETRO/1999',
  'Europeu/Milan/RETRO/2006/Home',
  'Europeu/Milan/RETRO/2006/Away',
  'Europeu/Milan/RETRO/2006/Third',
  'Europeu/Milan/RETRO/2008',
  'Europeu/Milan/RETRO/2012',
  'Brasileirao/Palmeiras/RETRO/1993',
  'Brasileirao/Palmeiras/RETRO/1995',
  'Brasileirao/Palmeiras/RETRO/1999',
  'Selecao/Portugal/COPA 2026/I',
  'Europeu/Real Madrid/RETRO/1999',
  'Europeu/Roma/RETRO/1990',
  'Brasileirao/Sao Paulo/RETRO/1999',
  'Brasileirao/Sao Paulo/RETRO/2000',
  'Brasileirao/Sao Paulo/RETRO/2008',
  'Europeu/Tottenham/25-26/Especial',
  'Selecao/Uruguai/COPA 2026/I',
  'Brasileirao/Vasco/RETRO/1999/PRETA',
];

async function run() {
  const result = {};
  for (const folder of FOLDERS) {
    const items = await listPath(folder);
    const fotos = items.filter(i => i.name.match(/\.(jpg|jpeg|png|webp)$/i)).map(i => i.name);
    if (fotos.length > 0) {
      result[folder] = fotos;
    } else {
      result[folder] = ['VAZIO'];
    }
  }
  
  // Imprime em formato legível
  for (const [folder, fotos] of Object.entries(result)) {
    const url1 = `${BASE_URL}/${folder.replace(/ /g, '%20')}/${fotos[0]}`;
    console.log(`${folder.split('/').pop()} | ${folder} | ${fotos.join(', ')} | ${url1}`);
  }
}
run();
