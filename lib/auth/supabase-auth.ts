import { createBrowserClient } from '@supabase/ssr'

const supabaseUrl = 'https://bicljoujevywrkzjeaoy.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJpY2xqb3VqZXZ5d3JremplYW95Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzg4MDc1ODIsImV4cCI6MjA5NDM4MzU4Mn0.UIKVUyX6QClJmAYdQKg91t_kAT4itpuSk_fIemcPJ0g'

export function createClient() {
  return createBrowserClient(supabaseUrl, supabaseAnonKey)
}

export async function signInWithGoogle() {
  const supabase = createClient()
  const { error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: { redirectTo: 'https://www.dudemd.com/auth/callback' },
  })
  if (error) throw error
}

export async function signInWithApple() {
  const supabase = createClient()
  const { error } = await supabase.auth.signInWithOAuth({
    provider: 'apple',
    options: { redirectTo: 'https://www.dudemd.com/auth/callback' },
  })
  if (error) throw error
}

export async function signInWithFacebook() {
  const supabase = createClient()
  const { error } = await supabase.auth.signInWithOAuth({
    provider: 'facebook',
    options: { redirectTo: 'https://www.dudemd.com/auth/callback', scopes: 'email,public_profile' },
  })
  if (error) throw error
}

export async function signInWithEmailPassword(email: string, password: string) {
  const supabase = createClient()
  const { error } = await supabase.auth.signInWithPassword({ email, password })
  if (error) throw error
}

export async function signOut() {
  const supabase = createClient()
  const { error } = await supabase.auth.signOut()
  if (error) throw error
}

export async function getSession() {
  const supabase = createClient()
  const { data: { session } } = await supabase.auth.getSession()
  return session
}