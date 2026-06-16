export const SUPABASE_URL = 'https://bicljoujevywrkzjeaoy.supabase.co'
export const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJpY2xqb3VqZXZ5d3JremplYW95Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzg4MDc1ODIsImV4cCI6MjA5NDM4MzU4Mn0.UIKVUyX6QClJmAYdQKg91t_kAT4itpuSk_fIemcPJ0g'

export function readClientAuth(): { uid: string; token: string } | null {
  if (typeof document === 'undefined') return null
  try {
    const jar: Record<string, string> = {}
    document.cookie.split(';').forEach(c => {
      const eq = c.indexOf('=')
      if (eq > -1) jar[c.substring(0, eq).trim()] = c.substring(eq + 1).trim()
    })
    let raw = ''
    if (jar['sb-bicljoujevywrkzjeaoy-auth-token']) {
      raw = jar['sb-bicljoujevywrkzjeaoy-auth-token'].replace('base64-', '')
    } else {
      const p0 = jar['sb-bicljoujevywrkzjeaoy-auth-token.0'] || ''
      const p1 = jar['sb-bicljoujevywrkzjeaoy-auth-token.1'] || ''
      raw = p0.replace('base64-', '') + decodeURIComponent(p1)
    }
    if (raw) {
      const parsed = JSON.parse(atob(raw))
      if (parsed?.access_token && parsed?.user?.id) {
        return { uid: parsed.user.id, token: parsed.access_token }
      }
    }
  } catch {}
  try {
    for (const key of ['dudemd-auth', 'sb-bicljoujevywrkzjeaoy-auth-token']) {
      const raw = localStorage.getItem(key)
      if (raw) {
        const parsed = JSON.parse(raw)
        if (parsed?.access_token && parsed?.user?.id) {
          return { uid: parsed.user.id, token: parsed.access_token }
        }
      }
    }
  } catch {}
  return null
}

export function clearClientAuth() {
  if (typeof document === 'undefined') return
  document.cookie.split(';').forEach(c => {
    const name = c.split('=')[0].trim()
    document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/`
    document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/; domain=.dudemd.com`
  })
  try {
    localStorage.removeItem('dudemd-auth')
    localStorage.removeItem('sb-bicljoujevywrkzjeaoy-auth-token')
  } catch {}
}
