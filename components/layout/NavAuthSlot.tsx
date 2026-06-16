'use client'
import Link from 'next/link'
import { useState, useEffect, useRef } from 'react'
import NotificationBell from '@/components/NotificationBell'
import { SUPABASE_URL, SUPABASE_ANON_KEY, readClientAuth, clearClientAuth } from '@/lib/auth-cookie'

type Profile = { full_name?: string; avatar_url?: string }

export default function NavAuthSlot() {
  const [session, setSession] = useState<{ uid: string } | null | 'loading'>('loading')
  const [profile, setProfile] = useState<Profile | null>(null)
  const [menuOpen, setMenuOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const auth = readClientAuth()
    if (!auth) {
      setSession(null)
      return
    }
    setSession({ uid: auth.uid })
    fetch(`${SUPABASE_URL}/rest/v1/profiles?select=full_name,avatar_url&id=eq.${auth.uid}&limit=1`, {
      headers: { apikey: SUPABASE_ANON_KEY, Authorization: `Bearer ${auth.token}` }
    })
      .then(r => r.json())
      .then(rows => { if (rows?.[0]) setProfile(rows[0]) })
      .catch(() => {})
  }, [])

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setMenuOpen(false)
    }
    document.addEventListener('mousedown', onClick)
    return () => document.removeEventListener('mousedown', onClick)
  }, [])

  function handleSignOut() {
    clearClientAuth()
    window.location.href = '/signin'
  }

  // Loading: invisible placeholder, same width as sign-in icon, prevents layout shift
  if (session === 'loading') {
    return <div style={{ width: 28, height: 28, visibility: 'hidden' }} aria-hidden="true" />
  }

  // Logged out: sign-in icon
  if (session === null) {
    return (
      <Link href="/signin" className="icon-btn nav-fade-in" title="Sign In" aria-label="Sign In">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
        </svg>
      </Link>
    )
  }

  // Logged in: bell + avatar cluster
  const firstName = profile?.full_name?.split(' ')[0] || ''

  return (
    <div ref={ref} className="nav-fade-in" style={{ position: 'relative', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
      <NotificationBell />
      <button
        onClick={() => setMenuOpen(v => !v)}
        className="icon-btn"
        title={firstName ? `${firstName}'s Account` : 'Account'}
        aria-label="Account menu"
        aria-expanded={menuOpen}
        style={{ display: 'flex', alignItems: 'center' }}
      >
        {profile?.avatar_url ? (
          <img src={profile.avatar_url} alt="" style={{ width: 32, height: 32, borderRadius: '50%', objectFit: 'cover' }} />
        ) : (
          <div style={{ width: 32, height: 32, borderRadius: '50%', backgroundColor: 'var(--color-gold)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--color-navy)' }} aria-hidden="true">{firstName.charAt(0) || '·'}</span>
          </div>
        )}
      </button>
      {menuOpen && (
        <div role="menu" style={{ position: 'absolute', top: '100%', right: 0, marginTop: '0.5rem', backgroundColor: '#fff', border: '1px solid var(--color-border)', borderRadius: '4px', minWidth: '160px', zIndex: 50, boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
          <Link href="/account" onClick={() => setMenuOpen(false)} role="menuitem"
            style={{ display: 'block', fontSize: '14px', fontWeight: 500, color: 'var(--color-navy)', padding: '0.6rem 1.25rem', textDecoration: 'none', borderBottom: '1px solid var(--color-border)' }}>
            My Account
          </Link>
          <button
            onMouseDown={(e) => { e.preventDefault(); handleSignOut() }}
            role="menuitem"
            style={{ display: 'block', width: '100%', textAlign: 'left', fontSize: '14px', fontWeight: 500, color: '#a32d2d', padding: '0.6rem 1.25rem', cursor: 'pointer', background: 'none', border: 'none' }}
          >
            Sign Out
          </button>
        </div>
      )}
    </div>
  )
}
