import { createClient } from '@supabase/supabase-js'
import type { Database } from '../types/database.types'

const url = import.meta.env.VITE_SUPABASE_URL as string
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string

if (!url || !anonKey) {
  // Falha alto e cedo — melhor um erro claro no console do que um app
  // "meio funcionando" sem saber por quê.
  console.error(
    'VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY não configurados. Copie .env.example para .env.local e preencha.'
  )
}

export const supabase = createClient<Database>(url, anonKey, {
  auth: {
    // sessionStorage (em vez do localStorage padrão) sobrevive a um F5,
    // mas é limpo quando a aba/janela é fechada — login exigido de novo.
    storage: window.sessionStorage,
    persistSession: true,
    autoRefreshToken: true,
  },
})
