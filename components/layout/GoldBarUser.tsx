'use client'
import Link from 'next/link'
import { useState, useEffect } from 'react'
import { SUPABASE_URL, SUPABASE_ANON_KEY, readClientAuth } from '@/lib/auth-cookie'

export default function GoldBarUser() {
  const [name, setName] = useState<string | null>(null)
  const [loggedIn, setLoggedIn] = useState(false)

  useEffect(() => {
    const auth = readClientAuth()
    if (!auth) return
    setLoggedIn(true)
    fetch(`${SUPABASE_URL}/rest/v1/profiles?select=full_name&id=eq.${auth.uid}&limit=1`, {
      headers: { apikey: SUPABASE_ANON_KEY, Authorization: `Bearer ${auth.token}` }
    })
      .then(r => r.json())
      .then(rows => {
        if (rows?.[0]?.full_name) setName(rows[0].full_name.split(' ')[0])
      })
      .catch(() => {})
  }, [])

  // Logged out — server bar is correct as-is, render nothing
  if (!loggedIn) return null

  const circlesHref = typeof window !== 'undefined'
    ? `/circles?from=${encodeURIComponent(window.location.pathname)}`
    : '/circles'

  return (
    <div className="gold-bar-overlay nav-fade-in">
      <div className="container-content">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1.5rem' }}>
          {name ? (
            <span style={{ fontSize: '11px', fontWeight: 500, color: 'var(--color-navy)' }}>
              Welcome, {name}
            </span>
          ) : <span />}
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
