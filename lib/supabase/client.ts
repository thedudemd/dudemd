import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

declare global {
  var supabaseClient: ReturnType<typeof createClient> | undefined
}

export const supabase = globalThis.supabaseClient ?? createClient(supabaseUrl, supabaseAnonKey)
globalThis.supabaseClient = supabase
