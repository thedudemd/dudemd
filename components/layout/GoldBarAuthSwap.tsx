'use client'
import Link from 'next/link'
import { useState, useEffect } from 'react'

const SUPABASE_URL = 'https://bicljoujevywrkzjeaoy.supabase.co'
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJpY2xqb3VqZXZ5d3JremplYW95Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzg4MDc1ODIsImV4cCI6MjA5NDM4MzU4Mn0.UIKVUyX6QClJmAYdQKg91t_kAT4itpuSk_fIemcPJ0g'

export default function GoldBarAuthSwap() {
  const [session, setSession] = useState<any>(undefined)
  const [profile, setProfile] = useState<{full_name?: string} | null>(null)

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
    if (result) {
      setSession({ user: { id: result.uid } })
      fetch(`${SUPABASE_URL}/rest/v1/profiles?select=full_name&id=eq.${result.uid}&limit=1`, {
        headers: { apikey: SUPABASE_ANON_KEY, Authorization: `Bearer ${result.token}` }
      }).then(r => r.json()).then(p => { if (p?.[0]) setProfile(p[0]) }).catch(() => {})
    } else {
      setSession(null)
    }
  }, [])

  // Until session resolves, render nothing — static server gold bar shows through
  if (session === undefined) return null

  const firstName = profile?.full_name?.split(' ')[0] || ''
  const circlesHref = session
    ? `/circles?from=${encodeURIComponent(typeof window !== 'undefined' ? window.location.pathname : '/')}`
    : `/signin?redirect=/circles`

  return (
    <div style={{ position: 'absolute', inset: 0, backgroundColor: 'var(--color-gold)', padding: '0.4rem 0' }}>
      <div className="container-content">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1.5rem' }}>
          {session && profile ? (
            <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--color-navy)' }}>Welcome, <strong>{firstName}</strong></span>
          ) : <span />}
          <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
            <a href={circlesHref} style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--color-navy)', textDecoration: 'none' }}>Circles</a>
            <span style={{ color: 'rgba(14,26,43,0.3)', fontSize: '10px' }}>|</span>
            {!session && <Link href="/signin" style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--color-navy)', textDecoration: 'none' }}>Sign In</Link>}
            {!session && <span style={{ color: 'rgba(14,26,43,0.3)', fontSize: '10px' }}>|</span>}
            {!session && <Link href="/join" style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--color-navy)', textDecoration: 'none' }}>Subscribe</Link>}
            {session && <Link href="/account" style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--color-navy)', textDecoration: 'none' }}>My Account</Link>}
          </div>
        </div>
      </div>
    </div>
  )
}
