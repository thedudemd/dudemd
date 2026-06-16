'use client'
import Link from 'next/link'
import { useState, useEffect } from 'react'

const SUPABASE_URL = 'https://bicljoujevywrkzjeaoy.supabase.co'
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJpY2xqb3VqZXZ5d3JremplYW95Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzg4MDc1ODIsImV4cCI6MjA5NDM4MzU4Mn0.UIKVUyX6QClJmAYdQKg91t_kAT4itpuSk_fIemcPJ0g'

export default function GoldBarAuthSwap() {
  const [state, setState] = useState<'loading'|'out'|'in'>('loading')
  const [name, setName] = useState('')
  const [circlesHref, setCirclesHref] = useState('/signin?redirect=/circles')

  useEffect(() => {
    function getToken() {
      try {
        const jar: Record<string,string> = {}
        document.cookie.split(';').forEach(c => {
          const eq = c.indexOf('=')
          jar[c.substring(0,eq).trim()] = c.substring(eq+1).trim()
        })
        let raw = ''
        if (jar['sb-bicljoujevywrkzjeaoy-auth-token']) {
          raw = jar['sb-bicljoujevywrkzjeaoy-auth-token'].replace('base64-','')
        } else {
          const p0 = jar['sb-bicljoujevywrkzjeaoy-auth-token.0'] || ''
          const p1 = jar['sb-bicljoujevywrkzjeaoy-auth-token.1'] || ''
          raw = p0.replace('base64-','') + decodeURIComponent(p1)
        }
        const parsed = JSON.parse(atob(raw))
        if (parsed?.access_token && parsed?.user?.id) return { token: parsed.access_token, uid: parsed.user.id }
      } catch {}
      try {
        for (const key of ['dudemd-auth','sb-bicljoujevywrkzjeaoy-auth-token']) {
          const raw = localStorage.getItem(key)
          if (raw) {
            const parsed = JSON.parse(raw)
            if (parsed?.access_token && parsed?.user?.id) return { token: parsed.access_token, uid: parsed.user.id }
          }
        }
      } catch {}
      return null
    }

    const result = getToken()
    if (!result) { setState('out'); return }

    setCirclesHref(`/circles?from=${encodeURIComponent(window.location.pathname)}`)
    fetch(`${SUPABASE_URL}/rest/v1/profiles?select=full_name&id=eq.${result.uid}&limit=1`, {
      headers: { apikey: SUPABASE_ANON_KEY, Authorization: `Bearer ${result.token}` }
    }).then(r => r.json()).then(p => {
      if (p?.[0]?.full_name) setName(p[0].full_name.split(' ')[0])
      setState('in')
    }).catch(() => setState('in'))
  }, [])

  // While loading, show nothing — static server bar shows through
  if (state === 'loading') return null

  // Logged out — static server bar is already correct, just fix Circles href
  if (state === 'out') return null

  // Logged in — overlay the full gold bar with auth-aware content
  return (
    <div style={{ position: 'absolute', inset: 0, backgroundColor: 'var(--color-gold)', padding: '0.4rem 0' }}>
      <div className="container-content">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1.5rem' }}>
          {name ? <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--color-navy)' }}>Welcome, <strong>{name}</strong></span> : <span />}
          <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
            <a href={circlesHref} style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--color-navy)', textDecoration: 'none' }}>Circles</a>
            <span style={{ color: 'rgba(14,26,43,0.3)', fontSize: '10px' }}>|</span>
            <Link href="/account" style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--color-navy)', textDecoration: 'none' }}>My Account</Link>
          </div>
        </div>
      </div>
    </div>
  )
}
