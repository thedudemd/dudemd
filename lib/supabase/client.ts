import { createClient } from '@supabase/supabase-js'

export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  {
    auth: {
      persistSession: true,
      storageKey: 'dudemd-auth',
      storage: typeof window !== 'undefined' ? window.localStorage : undefined,
      autoRefreshToken: true,
      detectSessionInUrl: true,
    }
  }
)

// Clear stale sessions that can't be refreshed
if (typeof window !== 'undefined') {
  supabase.auth.getSession().then(({ data: { session }, error }) => {
    if (error || (!session && localStorage.getItem('dudemd-auth'))) {
      localStorage.removeItem('dudemd-auth')
    }
  })
}