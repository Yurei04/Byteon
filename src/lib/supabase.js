import { createBrowserClient } from '@supabase/ssr'
import { tabStorage } from './tabStorage'

export const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  {
    auth: {
      storage: tabStorage,
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
    },
  }
)