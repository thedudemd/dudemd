'use client'
import Link from 'next/link'
import { useState, useEffect } from 'react'
import { SUPABASE_URL, SUPABASE_ANON_KEY, readClientAuth, clearClientAuth } from '@/lib/auth-cookie'

type NavItem = { label: string; href: string; subs: string[] }

const SOCIALS = [
  { href: 'https://instagram.com/mydudemd', label: 'Instagram', d: 'M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z' },
  { href: 'https://twitter.com/mydudemd', label: 'X', d: 'M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.748l7.73-8.835L1.254 2.25H8.08l4.261 5.636zm-1.161 17.52h1.833L7.084 4.126H5.117z' },
  { href: 'https://facebook.com/MyDudeMD', label: 'Facebook', d: 'M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z' },
  { href: 'https://tiktok.com/@TheDudeMd', label: 'TikTok', d: 'M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 00-.79-.05 6.34 6.34 0 00-6.34 6.34 6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.33-6.34V8.69a8.18 8.18 0 004.78 1.52V6.76a4.85 4.85 0 01-1.01-.07z' },
]

export default function NavDrawer({ navItems }: { navItems: NavItem[] }) {
  const [open, setOpen] = useState(false)
  const [expanded, setExpanded] = useState<string | null>(null)
  const [loggedIn, setLoggedIn] = useState<boolean | null>(null)

  useEffect(() => {
    setLoggedIn(!!readClientAuth())
  }, [])

  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => { document.body.style.overflow = '' }
  }, [open])

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') setOpen(false)
    }
    if (open) document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [open])

  function handleSignOut() {
    clearClientAuth()
    window.location.href = '/signin'
  }

  function close() { setOpen(false) }

  return (
    <>
      <style>{`
        .drawer-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.5); z-index: 40; }
        .drawer { position: fixed; top: 0; left: 0; bottom: 0; width: 100%; max-width: 22rem; background: var(--color-navy); z-index: 50; transform: translateX(-100%); transition: transform 0.3s ease; overflow-y: auto; visibility: hidden; }
        .drawer.open { transform: translateX(0); visibility: visible; }
        .drawer-item { border-bottom: 1px solid rgba(255,255,255,0.1); }
        .drawer-cat-header { display: flex; justify-content: space-between; align-items: center; padding: 0.85rem 1.5rem; cursor: pointer; }
        .drawer-sub-link { display: block; padding: 0.5rem 1.5rem 0.5rem 2.5rem; font-size: 12px; color: rgba(247,244,238,0.7); text-decoration: none; letter-spacing: 0.04em; }
      `}</style>

      <button
        onClick={() => setOpen(true)}
        aria-label="Open menu"
        aria-expanded={open}
        style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--color-cream)', padding: '0.25rem 0' }}
      >
        <span style={{ display: 'flex', flexDirection: 'column', gap: '4px' }} aria-hidden="true">
          <span style={{ width: '20px', height: '2px', backgroundColor: 'var(--color-cream)' }} />
          <span style={{ width: '20px', height: '2px', backgroundColor: 'var(--color-cream)' }} />
          <span style={{ width: '20px', height: '2px', backgroundColor: 'var(--color-cream)' }} />
        </span>
        <span style={{ fontSize: '12px', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase' }}>Menu</span>
      </button>

      {open && <div className="drawer-overlay" onClick={close} aria-hidden="true" />}

      <aside
        className={`drawer${open ? ' open' : ''}`}
        aria-hidden={!open}
        aria-label="Site menu"
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1.25rem 1.5rem', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
          <Link href="/" onClick={close} style={{ textDecoration: 'none' }}>
            <img src="/dude-md.svg" alt="DudeMD" style={{ height: '44px', width: 'auto', objectFit: 'contain', filter: 'brightness(0) saturate(100%) invert(76%) sepia(20%) saturate(600%) hue-rotate(350deg) brightness(95%) contrast(88%)' }} />
          </Link>
          <button onClick={close} aria-label="Close menu" style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-cream)', fontSize: '24px', lineHeight: 1, padding: '0.25rem' }}>×</button>
        </div>

        <div style={{ padding: '0.5rem 0' }}>
          {navItems.map((item) => (
            <div key={item.label} className="drawer-item">
              <div className="drawer-cat-header" onClick={() => setExpanded(expanded === item.label ? null : item.label)}>
                <Link href={item.href} onClick={close} style={{ fontSize: '13px', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--color-cream)', textDecoration: 'none' }}>
                  {item.label}
                </Link>
                <span style={{ color: 'var(--color-gold)', fontSize: '20px', lineHeight: 1 }} aria-hidden="true">{expanded === item.label ? '−' : '+'}</span>
              </div>
              {expanded === item.label && (
                <div style={{ paddingBottom: '0.75rem' }}>
                  {item.subs.map((sub) => (
                    <Link key={sub} href={item.href} onClick={close} className="drawer-sub-link">{sub}</Link>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>

        <div style={{ borderTop: '1px solid rgba(255,255,255,0.1)', padding: '1rem 0' }}>
          {['About Us', 'Editorial Policy', 'Advertise', 'Contact'].map((it) => (
            <Link key={it} href={`/${it.toLowerCase().replace(/ /g, '-')}`} onClick={close}
              style={{ display: 'block', padding: '0.6rem 1.5rem', fontSize: '13px', color: 'rgba(247,244,238,0.6)', textDecoration: 'none', letterSpacing: '0.06em' }}>{it}</Link>
          ))}
        </div>

        <div style={{ borderTop: '1px solid rgba(255,255,255,0.1)', padding: '1.25rem 1.5rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {loggedIn === null ? null : loggedIn === false ? (
            <Link href="/signin" onClick={close} style={{ display: 'block', padding: '0.75rem', textAlign: 'center', border: '1px solid rgba(247,244,238,0.3)', color: 'var(--color-cream)', fontSize: '13px', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', textDecoration: 'none' }}>
              Sign In
            </Link>
          ) : (
            <>
              <Link href="/account" onClick={close} style={{ display: 'block', padding: '0.75rem', textAlign: 'center', border: '1px solid rgba(247,244,238,0.3)', color: 'var(--color-cream)', fontSize: '13px', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', textDecoration: 'none' }}>
                My Account
              </Link>
              <button onClick={() => { handleSignOut(); close() }} style={{ display: 'block', width: '100%', padding: '0.75rem', textAlign: 'center', backgroundColor: 'transparent', border: '1px solid rgba(163,45,45,0.5)', color: '#f09595', fontSize: '13px', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', cursor: 'pointer' }}>
                Sign Out
              </button>
            </>
          )}
          {loggedIn === false && (
            <Link href="/join" onClick={close} style={{ display: 'block', padding: '0.75rem', textAlign: 'center', backgroundColor: 'var(--color-gold)', color: 'var(--color-navy)', fontSize: '13px', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', textDecoration: 'none' }}>
              Subscribe
            </Link>
          )}
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', paddingTop: '0.5rem' }}>
            {SOCIALS.map(({ href, label, d }) => (
              <a key={label} href={href} target="_blank" rel="noopener noreferrer" style={{ color: 'rgba(247,244,238,0.5)', display: 'flex', alignItems: 'center' }} aria-label={label}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d={d}/></svg>
              </a>
            ))}
          </div>
        </div>
      </aside>
    </>
  )
}
