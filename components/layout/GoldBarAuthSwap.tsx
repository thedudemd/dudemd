'use client'
import { useState, useEffect } from 'react'

const SUPABASE_URL = 'https://bicljoujevywrkzjeaoy.supabase.co'
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJpY2xqb3VqZXZ5d3JremplYW95Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzg4MDc1ODIsImV4cCI6MjA5NDM4MzU4Mn0.UIKVUyX6QClJmAYdQKg91t_kAT4itpuSk_fIemcPJ0g'

export default function GoldBarAuthSwap() {
  const [name, setName] = useState<string | null>(null)

  useEffect(() => {
    function getTokenAndUser() {
      try {
        const jar: Record<string, string> = {}
        document.cookie.split(';').forEach(c => {
          const eq = c.indexOf('=')
          jar[c.substring(0, eq).trim()] = c.substring(eq + 1).trim()
        })
        let raw = ''
        if (jar['sb-bicljoujevywrkzjeaoy-auth-token']) {
          raw = jar['sb-bicljoujevywrkzjeaoy-auth-token'].replace('base64-', '')
        } else {
          const part0 = jar['sb-bicljoujevywrkzjeaoy-auth-token.0'] || ''
          const part1 = jar['sb-bicljoujevywrkzjeaoy-auth-token.1'] || ''
          raw = part0.replace('base64-', '') + decodeURIComponent(part1)
        }
        const parsed = JSON.parse(atob(raw))
        const token = parsed.access_token
        const uid = parsed.user?.id
        if (token && uid) return { token, uid }
      } catch {}
      try {
        for (const key of ['dudemd-auth', 'sb-bicljoujevywrkzjeaoy-auth-token']) {
          const raw = localStorage.getItem(key)
          if (raw) {
            const parsed = JSON.parse(raw)
            if (parsed.access_token && parsed.user?.id) return { token: parsed.access_token, uid: parsed.user.id }
          }
        }
      } catch {}
      return null
    }
    const result = getTokenAndUser()
    if (!result) return // logged out — static bar is already correct, do nothing
    fetch(`${SUPABASE_URL}/rest/v1/profiles?select=full_name&id=eq.${result.uid}&limit=1`, {
      headers: { apikey: SUPABASE_ANON_KEY, Authorization: `Bearer ${result.token}` }
    }).then(r => r.json()).then(p => {
      if (p?.[0]?.full_name) setName(p[0].full_name.split(' ')[0])
    }).catch(() => {})
  }, [])

  // Only render when logged in and name is loaded — just the Welcome text on the left
  if (!name) return null

  return (
    <span style={{ position: 'absolute', left: '1.5rem', top: '50%', transform: 'translateY(-50%)', fontSize: '11px', fontWeight: 700, color: 'var(--color-navy)' }}>
      Welcome, <strong>{name}</strong>
    </span>
  )
}
