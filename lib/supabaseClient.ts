/**
 * Configuração do cliente Supabase para o Frontend.
 * Usamos a NEXT_PUBLIC_SUPABASE_ANON_KEY pois é seguro expo-la no lado do cliente
 * (navegador). Para proteger os dados, as regras devem estar configuradas no
 * Row Level Security (RLS) dentro do painel do Supabase.
 */

import { createClient } from '@supabase/supabase-js'

// Variáveis de ambiente definidas no arquivo .env.local
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

// Checagem de segurança para evitar erros silenciosos se as variáveis não existirem
if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    'Variáveis de ambiente do Supabase não configuradas. ' +
    'Verifique NEXT_PUBLIC_SUPABASE_URL e NEXT_PUBLIC_SUPABASE_ANON_KEY no .env.local'
  )
}

// Inicializa a instância do cliente Supabase que será usada no app inteiro
export const supabase = createClient(supabaseUrl, supabaseAnonKey)