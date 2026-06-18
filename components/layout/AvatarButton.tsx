'use client'
import Link from 'next/link'
import { useState, useEffect, useRef } from 'react'
import { SUPABASE_URL, SUPABASE_ANON_KEY, readClientAuth, clearClientAuth } from '@/lib/auth-cookie'

export default function AvatarButton() {
  const [profile, setProfile] = useState<{ full_name?: string; avatar_url?: string } | null>(null)
  const [menuOpen, setMenuOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const auth = readClientAuth()
    if (!auth) return
    fetch(`${SUPABASE_URL}/rest/v1/profiles?select=full_name,avatar_url&id=eq.${auth.uid}&limit=1`, {
      headers: { apikey: SUPABASE_ANON_KEY, Authorization: `Bearer ${auth.token}` }
    })
      .then(r => r.json())
      .then(rows => {
        if (rows?.[0]) {
          setProfile(rows[0])
          // Cache first name for next page load — used by pre-hydration script
          if (rows[0].full_name) {
            try { const n = rows[0].full_name.split(' ')[0]; localStorage.setItem('dudemd-first-name', n); window.dispatchEvent(new CustomEvent('dudemd-name-ready', { detail: n })) } catch {}
          }
        }
      })
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
    try { localStorage.removeItem('dudemd-first-name') } catch {}
    window.location.href = '/signin'
  }

  const [cachedName, setCachedName] = useState('')
  useEffect(() => {
    try { setCachedName(localStorage.getItem('dudemd-first-name') || '') } catch {}
  }, [])
  const firstName = profile?.full_name?.split(' ')[0] || cachedName
  const initial = firstName.charAt(0) || '·'

  return (
    <div ref={ref} style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
      <button
        onClick={() => setMenuOpen(v => !v)}
        className="icon-btn"
        title={firstName ? `${firstName}'s Account` : 'Account'}
        aria-label="Account menu"
        aria-expanded={menuOpen}
        style={{ display: 'flex', alignItems: 'center' }}
      >
        {profile?.avatar_url ? (
          <img src={profile.avatar_url} alt="" width={32} height={32} style={{ borderRadius: '50%', objectFit: 'cover' }} />
        ) : (
          <div style={{ width: 32, height: 32, borderRadius: '50%', backgroundColor: 'var(--color-gold)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--color-navy)' }} aria-hidden="true">{initial}</span>
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
