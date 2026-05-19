const url = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/camisetas?categoria=eq.SELEÇÃO&nome=ilike.*2026*`;
fetch(url, {
  method: 'PATCH',
  headers: {
    'apikey': process.env.SUPABASE_SERVICE_ROLE_KEY,
    'Authorization': `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({ preco: 169.99 })
}).then(async res => {
  if(res.ok) console.log('Sucesso na atualização das camisas da COPA 2026!');
  else console.error('Erro:', res.status, res.statusText, await res.text());
});
