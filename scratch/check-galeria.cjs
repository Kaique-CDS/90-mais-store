const SUPABASE_URL = 'https://bzdjxnenljqwtvbdonxl.supabase.co'
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ6ZGp4bmVubGpxd3R2YmRvbnhsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzgwMjU4MjYsImV4cCI6MjA5MzYwMTgyNn0.nEtRrbf5EYiI2_kxFQBbCeCTnixCZHIIoPP5jxdztCQ'

async function checkGaleria() {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/camisetas?nome=ilike.%25AJAX%25&select=nome,imagem_url,galeria`, {
    headers: {
      'apikey': SUPABASE_KEY,
      'Authorization': `Bearer ${SUPABASE_KEY}`
    }
  });
  const data = await res.json();
  console.log(JSON.stringify(data, null, 2));
}

checkGaleria().catch(console.error);
