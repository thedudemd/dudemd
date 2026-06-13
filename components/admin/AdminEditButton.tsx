'use client'
import { useState, useEffect } from 'react'

const SUPABASE_URL = 'https://bicljoujevywrkzjeaoy.supabase.co'
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJpY2xqb3VqZXZ5d3JremplYW95Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzg4MDc1ODIsImV4cCI6MjA5NDM4MzU4Mn0.UIKVUyX6QClJmAYdQKg91t_kAT4itpuSk_fIemcPJ0g'

function getAuthFromCookie() {
  try {
    const jar: Record<string, string> = {}
    document.cookie.split(';').forEach(c => {
      const [k, ...v] = c.trim().split('=')
      jar[k] = v.join('=')
    })
    const projectRef = SUPABASE_URL.match(/https:\/\/([^.]+)\./)?.[1]
    const cookieName = `sb-${projectRef}-auth-token`
    let raw = jar[`${cookieName}.0`]
    let part1 = jar[`${cookieName}.1`]
    if (!raw) return null
    if (raw.startsWith('base64-')) raw = raw.slice(7)
    let full = raw
    if (part1) full += decodeURIComponent(part1)
    const parsed = JSON.parse(atob(full))
    return { uid: parsed?.user?.id, token: parsed?.access_token }
  } catch (e) { return null }
}

export default function AdminEditButton({ href }: { href: string }) {
  const [isSuperAdmin, setIsSuperAdmin] = useState(false)

  useEffect(() => {
    const auth = getAuthFromCookie()
    if (!auth?.uid) return
    fetch(`${SUPABASE_URL}/rest/v1/profiles?id=eq.${auth.uid}&select=role`, {
      headers: { apikey: SUPABASE_ANON_KEY, Authorization: `Bearer ${auth.token}` }
    }).then(r => r.json()).then(data => {
      if (data?.[0]?.role === 'super_admin') setIsSuperAdmin(true)
    }).catch(() => {})
  }, [])

  if (!isSuperAdmin) return null

  return (
    <a
      href={href}
      style={{
        position: 'fixed',
        bottom: '1.5rem',
        right: '1.5rem',
        zIndex: 1000,
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
        backgroundColor: 'var(--color-navy)',
        color: 'var(--color-gold)',
        padding: '0.7rem 1.1rem',
        borderRadius: '999px',
        fontSize: '12px',
        fontWeight: 700,
        letterSpacing: '0.06em',
        textTransform: 'uppercase',
        textDecoration: 'none',
        boxShadow: '0 2px 10px rgba(0,0,0,0.25)'
      }}
    >
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
      </svg>
      Edit
    </a>
  )
}
