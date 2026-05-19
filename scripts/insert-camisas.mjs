const url = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/camisetas`;
const headers = {
  "apikey": process.env.SUPABASE_SERVICE_ROLE_KEY,
  "Authorization": `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`,
  "Content-Type": "application/json",
  "Prefer": "return=minimal"
};

const camisas = [
  // Brasileiros
  { nome: "Santos Retrô — Azul, Branca e Preta", categoria: "BRASILEIROS", preco: 199.99, imagem_url: "" },
  { nome: "São Paulo 26/27 II", categoria: "BRASILEIROS", preco: 159.99, imagem_url: "" },
  { nome: "Corinthians RETRO 1990 Branca", categoria: "BRASILEIROS", preco: 199.99, imagem_url: "" },
  { nome: "Corinthians RETRO 1994 Branca", categoria: "BRASILEIROS", preco: 199.99, imagem_url: "" },
  { nome: "Corinthians 26/27 I", categoria: "BRASILEIROS", preco: 159.99, imagem_url: "" },
  { nome: "Corinthians 26/27 Treino", categoria: "BRASILEIROS", preco: 159.99, imagem_url: "" },

  // Europeus
  { nome: "Boca Juniors 25/26 III", categoria: "EUROPEUS", preco: 149.99, imagem_url: "" },
  { nome: "West Ham 25/26 I", categoria: "EUROPEUS", preco: 149.99, imagem_url: "" },
  { nome: "West Ham 25/26 II", categoria: "EUROPEUS", preco: 149.99, imagem_url: "" },
  { nome: "West Ham 25/26 III", categoria: "EUROPEUS", preco: 149.99, imagem_url: "" },
  { nome: "Liverpool Retrô 2006", categoria: "EUROPEUS", preco: 199.99, imagem_url: "" },
  { nome: "Manchester United Retrô 1996 I", categoria: "EUROPEUS", preco: 199.99, imagem_url: "" },
  { nome: "Manchester United Retrô 1996 II", categoria: "EUROPEUS", preco: 199.99, imagem_url: "" },
  { nome: "Manchester United Retrô 2001 - (frente e verso)", categoria: "EUROPEUS", preco: 199.99, imagem_url: "" },
  { nome: "Manchester United Retrô 2008 I", categoria: "EUROPEUS", preco: 199.99, imagem_url: "" },
  { nome: "Atalanta I 25/26", categoria: "EUROPEUS", preco: 149.99, imagem_url: "" },
  { nome: "PSV 25/26 I", categoria: "EUROPEUS", preco: 149.99, imagem_url: "" },
  { nome: "PSV 25/26 II", categoria: "EUROPEUS", preco: 149.99, imagem_url: "" },
  { nome: "Napoli 25/26 Coca Cola", categoria: "EUROPEUS", preco: 149.99, imagem_url: "" },
  { nome: "Barcelona Retrô 2009", categoria: "EUROPEUS", preco: 199.99, imagem_url: "" },
  { nome: "Brighton 25/26 I", categoria: "EUROPEUS", preco: 149.99, imagem_url: "" },
  { nome: "Brighton 25/26 II", categoria: "EUROPEUS", preco: 149.99, imagem_url: "" },
  { nome: "Lille 25/26 I", categoria: "EUROPEUS", preco: 149.99, imagem_url: "" },
  { nome: "Olympique Marseille 25/26 I", categoria: "EUROPEUS", preco: 149.99, imagem_url: "" },
  { nome: "Olympique Marseille 25/26 II", categoria: "EUROPEUS", preco: 149.99, imagem_url: "" },
  { nome: "RB Leipzig 25/26 I", categoria: "EUROPEUS", preco: 149.99, imagem_url: "" },
  { nome: "RB Leipzig 25/26 II", categoria: "EUROPEUS", preco: 149.99, imagem_url: "" },
  { nome: "Real Madrid Retrô 2006 II", categoria: "EUROPEUS", preco: 199.99, imagem_url: "" },
  { nome: "Real Madrid Retrô 2006 III", categoria: "EUROPEUS", preco: 199.99, imagem_url: "" },
  { nome: "Real Madrid Retrô 2012 I", categoria: "EUROPEUS", preco: 199.99, imagem_url: "" },
  { nome: "Real Madrid Retrô 2012 II", categoria: "EUROPEUS", preco: 199.99, imagem_url: "" },
  { nome: "Real Madrid Retrô 2012 III", categoria: "EUROPEUS", preco: 199.99, imagem_url: "" },
  { nome: "Valencia 25/26 I", categoria: "EUROPEUS", preco: 149.99, imagem_url: "" },
  { nome: "Valencia 25/26 II", categoria: "EUROPEUS", preco: 149.99, imagem_url: "" },

  // Seleções
  { nome: "Chile 2026 I", categoria: "SELEÇÃO", preco: 159.99, imagem_url: "" },
  { nome: "Estados Unidos 2026 I", categoria: "SELEÇÃO", preco: 159.99, imagem_url: "" },
  { nome: "Estados Unidos 2026 II", categoria: "SELEÇÃO", preco: 159.99, imagem_url: "" },
  { nome: "Nigeria 2026 I", categoria: "SELEÇÃO", preco: 159.99, imagem_url: "" },
  { nome: "Nigeria 2026 II", categoria: "SELEÇÃO", preco: 159.99, imagem_url: "" },
];

async function run() {
  console.log(`Iniciando inserção de ${camisas.length} camisas...`);
  
  for (const c of camisas) {
    // Check if exists
    const checkUrl = `${url}?nome=eq.${encodeURIComponent(c.nome)}&select=id`;
    const checkRes = await fetch(checkUrl, { headers });
    const existing = await checkRes.json();
    
    if (existing && existing.length > 0) {
      console.log(`[PULANDO] ${c.nome} - Já existe no banco.`);
      continue;
    }
    
    // Insert
    const insertRes = await fetch(url, {
      method: "POST",
      headers,
      body: JSON.stringify(c)
    });

    if (!insertRes.ok) {
      const err = await insertRes.text();
      console.error(`[ERRO] Falha ao inserir ${c.nome}:`, err);
    } else {
      console.log(`[SUCESSO] Inserido: ${c.nome}`);
    }
  }
  
  console.log("Concluído!");
}

run();
