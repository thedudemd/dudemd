'use client'
import Link from 'next/link'
import { useState, useEffect, useRef } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import NotificationBell from '@/components/NotificationBell'

const SUPABASE_URL = 'https://bicljoujevywrkzjeaoy.supabase.co'
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJpY2xqb3VqZXZ5d3JremplYW95Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzg4MDc1ODIsImV4cCI6MjA5NDM4MzU4Mn0.UIKVUyX6QClJmAYdQKg91t_kAT4itpuSk_fIemcPJ0g'

export default function NavClient({ navItems }: { navItems: any[] }) {
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [drawerExpanded, setDrawerExpanded] = useState<string | null>(null)
  const [searchOpen, setSearchOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [userOpen, setUserOpen] = useState(false)
  const [profile, setProfile] = useState<{full_name?: string, avatar_url?: string} | null>(null)
  const [session, setSession] = useState<any>(undefined)
  const userRef = useRef<HTMLDivElement>(null)
  const pathname = usePathname()
  const router = useRouter()

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
        if (parsed.access_token && parsed.user?.id) return { token: parsed.access_token, uid: parsed.user.id }
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
      fetch(`${SUPABASE_URL}/rest/v1/profiles?select=full_name,avatar_url&id=eq.${result.uid}&limit=1`, {
        headers: { apikey: SUPABASE_ANON_KEY, Authorization: `Bearer ${result.token}` }
      }).then(r => r.json()).then(profiles => {
        if (profiles?.[0]) setProfile(profiles[0])
      }).catch(() => {})
    } else {
      setSession(null)
    }
  }, [])

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (userRef.current && !userRef.current.contains(e.target as Node)) setUserOpen(false)
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  function handleSignOut() {
    document.cookie.split(';').forEach(c => {
      const name = c.split('=')[0].trim()
      document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/`
      document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/; domain=.dudemd.com`
    })
    localStorage.removeItem('dudemd-auth')
    localStorage.removeItem('sb-bicljoujevywrkzjeaoy-auth-token')
    window.location.href = '/signin'
  }

  function handleSearch(e: React.FormEvent) {
    e.preventDefault()
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`)
      setSearchOpen(false)
      setSearchQuery('')
    }
  }

  if (pathname?.startsWith('/admin')) return null
  const firstName = profile?.full_name?.split(' ')[0] || ''

  return (
    <>
      <style>{`
        .container-content { max-width: 1200px; margin: 0 auto; padding: 0 1.5rem; }
        .icon-btn { background: none; border: none; cursor: pointer; color: var(--color-cream); padding: 0.25rem; display: flex; align-items: center; }
        .drawer-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.5); z-index: 40; }
        .drawer { position: fixed; top: 0; left: 0; bottom: 0; width: 100%; max-width: 22rem; background: var(--color-navy); z-index: 50; transform: translateX(-100%); transition: transform 0.3s ease; overflow-y: auto; }
        .drawer.open { transform: translateX(0); }
        .drawer-item { border-bottom: 1px solid rgba(255,255,255,0.1); }
        .drawer-cat-header { display: flex; justify-content: space-between; align-items: center; padding: 0.85rem 1.5rem; cursor: pointer; }
        .drawer-sub-link { display: block; padding: 0.5rem 1.5rem 0.5rem 2.5rem; font-size: 12px; color: rgba(247,244,238,0.7); text-decoration: none; letter-spacing: 0.04em; }
        .nav-auth-slot { width: 32px; height: 32px; display: flex; align-items: center; justify-content: center; }
      `}</style>

      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        {/* Fixed 32px slot — no width change between states, no shift */}
        <div className="nav-auth-slot">
          {session === undefined ? null : session === null ? (
            <Link href="/signin" className="icon-btn" title="Sign In">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
              </svg>
            </Link>
          ) : (
            <div ref={userRef} style={{ position: 'relative', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <NotificationBell />
              <button onClick={() => setUserOpen(!userOpen)} className="icon-btn" title={`${firstName}'s Account`} style={{ display: 'flex', alignItems: 'center' }}>
                {profile?.avatar_url ? (
                  <img src={profile.avatar_url} alt={firstName} style={{ width: 32, height: 32, borderRadius: '50%', objectFit: 'cover' }} />
                ) : (
                  <div style={{ width: 32, height: 32, borderRadius: '50%', backgroundColor: 'var(--color-gold)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--color-navy)' }}>{firstName.charAt(0)}</span>
                  </div>
                )}
              </button>
              {userOpen && (
                <div style={{ position: 'absolute', top: '100%', right: 0, marginTop: '0.5rem', backgroundColor: '#fff', border: '1px solid var(--color-border)', borderRadius: '4px', minWidth: '160px', zIndex: 50, boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
                  <Link href="/account" onClick={() => setUserOpen(false)} style={{ display: 'block', fontSize: '14px', fontWeight: 500, color: 'var(--color-navy)', padding: '0.6rem 1.25rem', textDecoration: 'none', borderBottom: '1px solid var(--color-border)' }}>My Account</Link>
                  <div onMouseDown={(e) => { e.preventDefault(); handleSignOut() }} style={{ display: 'block', fontSize: '14px', fontWeight: 500, color: '#a32d2d', padding: '0.6rem 1.25rem', cursor: 'pointer' }}>Sign Out</div>
                </div>
              )}
            </div>
          )}
        </div>

        <button className="icon-btn" onClick={() => setSearchOpen(!searchOpen)}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
          </svg>
        </button>

        <button onClick={() => setDrawerOpen(true)} style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--color-cream)', padding: '0.25rem 0' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <div style={{ width: '20px', height: '2px', backgroundColor: 'var(--color-cream)' }} />
            <div style={{ width: '20px', height: '2px', backgroundColor: 'var(--color-cream)' }} />
            <div style={{ width: '20px', height: '2px', backgroundColor: 'var(--color-cream)' }} />
          </div>
          <span style={{ fontSize: '12px', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase' }}>Menu</span>
        </button>
      </div>

      {searchOpen && (
        <div style={{ position: 'absolute', left: 0, right: 0, top: '100%', backgroundColor: 'var(--color-navy)', borderTop: '1px solid rgba(255,255,255,0.1)', padding: '1rem 0', zIndex: 25 }}>
          <div className="container-content">
            <form onSubmit={handleSearch} style={{ display: 'flex', maxWidth: '40rem', margin: '0 auto' }}>
              <input autoFocus type="text" placeholder="Search DudeMD..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} style={{ flex: 1, padding: '0.85rem 1rem', backgroundColor: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.2)', borderRight: 'none', color: 'var(--color-cream)', outline: 'none', fontSize: '15px' }} />
              <button type="submit" style={{ padding: '0.85rem 1.5rem', backgroundColor: 'var(--color-gold)', color: 'var(--color-navy)', fontWeight: 700, fontSize: '12px', letterSpacing: '0.08em', textTransform: 'uppercase', border: 'none', cursor: 'pointer' }}>Search</button>
            </form>
          </div>
        </div>
      )}

      {drawerOpen && <div className="drawer-overlay" onClick={() => setDrawerOpen(false)} />}

      <div className={`drawer${drawerOpen ? ' open' : ''}`}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1.25rem 1.5rem', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
          <Link href="/" onClick={() => setDrawerOpen(false)} style={{ textDecoration: 'none' }}>
            <img src="/dude-md.svg" alt="DudeMD" style={{ height: '44px', width: 'auto', objectFit: 'contain', filter: 'brightness(0) saturate(100%) invert(76%) sepia(20%) saturate(600%) hue-rotate(350deg) brightness(95%) contrast(88%)' }} />
          </Link>
          <button onClick={() => setDrawerOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-cream)', fontSize: '24px', lineHeight: 1, padding: '0.25rem' }}>×</button>
        </div>
        <div style={{ padding: '0.5rem 0' }}>
          {navItems.map((item) => (
            <div key={item.label} className="drawer-item">
              <div className="drawer-cat-header" onClick={() => setDrawerExpanded(drawerExpanded === item.label ? null : item.label)}>
                <Link href={item.href} onClick={() => setDrawerOpen(false)} style={{ fontSize: '13px', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--color-cream)', textDecoration: 'none' }}>{item.label}</Link>
                <span style={{ color: 'var(--color-gold)', fontSize: '20px', lineHeight: 1 }}>{drawerExpanded === item.label ? '−' : '+'}</span>
              </div>
              {drawerExpanded === item.label && (
                <div style={{ paddingBottom: '0.75rem' }}>
                  {item.subs.map((sub: string) => (
                    <Link key={sub} href={item.href} onClick={() => setDrawerOpen(false)} className="drawer-sub-link">{sub}</Link>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
        <div style={{ borderTop: '1px solid rgba(255,255,255,0.1)', padding: '1rem 0' }}>
          {['About Us', 'Editorial Policy', 'Advertise', 'Contact'].map((it) => (
            <Link key={it} href={`/${it.toLowerCase().replace(/ /g, '-')}`} onClick={() => setDrawerOpen(false)} style={{ display: 'block', padding: '0.6rem 1.5rem', fontSize: '13px', color: 'rgba(247,244,238,0.6)', textDecoration: 'none', letterSpacing: '0.06em' }}>{it}</Link>
          ))}
        </div>
        <div style={{ borderTop: '1px solid rgba(255,255,255,0.1)', padding: '1.25rem 1.5rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {session === undefined ? null : session === null ? (
            <Link href="/signin" onClick={() => setDrawerOpen(false)} style={{ display: 'block', padding: '0.75rem', textAlign: 'center', border: '1px solid rgba(247,244,238,0.3)', color: 'var(--color-cream)', fontSize: '13px', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', textDecoration: 'none' }}>Sign In</Link>
          ) : (
            <>
              <Link href="/account" onClick={() => setDrawerOpen(false)} style={{ display: 'block', padding: '0.75rem', textAlign: 'center', border: '1px solid rgba(247,244,238,0.3)', color: 'var(--color-cream)', fontSize: '13px', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', textDecoration: 'none' }}>My Account</Link>
              <button onClick={() => { handleSignOut(); setDrawerOpen(false) }} style={{ display: 'block', width: '100%', padding: '0.75rem', textAlign: 'center', backgroundColor: 'transparent', border: '1px solid rgba(163,45,45,0.5)', color: '#f09595', fontSize: '13px', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', cursor: 'pointer' }}>Sign Out</button>
            </>
          )}
          {!session && <Link href="/join" onClick={() => setDrawerOpen(false)} style={{ display: 'block', padding: '0.75rem', textAlign: 'center', backgroundColor: 'var(--color-gold)', color: 'var(--color-navy)', fontSize: '13px', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', textDecoration: 'none' }}>Subscribe</Link>}
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', paddingTop: '0.5rem' }}>
            {[
              { href: 'https://instagram.com/mydudemd', label: 'Instagram', d: 'M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z' },
              { href: 'https://twitter.com/mydudemd', label: 'X', d: 'M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.748l7.73-8.835L1.254 2.25H8.08l4.261 5.636zm-1.161 17.52h1.833L7.084 4.126H5.117z' },
              { href: 'https://facebook.com/MyDudeMD', label: 'Facebook', d: 'M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z' },
              { href: 'https://tiktok.com/@TheDudeMd', label: 'TikTok', d: 'M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 00-.79-.05 6.34 6.34 0 00-6.34 6.34 6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.33-6.34V8.69a8.18 8.18 0 004.78 1.52V6.76a4.85 4.85 0 01-1.01-.07z' },
            ].map(({ href, label, d }) => (
              <a key={label} href={href} target="_blank" rel="noopener noreferrer" style={{ color: 'rgba(247,244,238,0.5)', display: 'flex', alignItems: 'center' }} aria-label={label}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d={d}/></svg>
              </a>
            ))}
          </div>
        </div>
      </div>
    </>
  )
}
