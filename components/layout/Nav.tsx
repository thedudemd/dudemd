import Link from 'next/link'
import NavDrawer from './NavDrawer'
import NavAuthSlot from './NavAuthSlot'
import { SUPABASE_URL, SUPABASE_ANON_KEY } from '@/lib/auth-cookie'

export default async function Nav() {
  let navItems: { label: string; href: string; subs: string[] }[] = []
  try {
    const catsRes = await fetch(
      `${SUPABASE_URL}/rest/v1/categories?select=id,name,slug&parent_id=is.null&enabled=eq.true&show_in_nav=eq.true&order=sort_order.asc,name.asc`,
      { headers: { apikey: SUPABASE_ANON_KEY, Authorization: `Bearer ${SUPABASE_ANON_KEY}` }, next: { revalidate: 300 } }
    )
    const cats = await catsRes.json()
    if (Array.isArray(cats)) {
      navItems = await Promise.all(cats.map(async (cat: any) => {
        const subsRes = await fetch(
          `${SUPABASE_URL}/rest/v1/categories?select=name,slug&parent_id=eq.${cat.id}&enabled=eq.true&order=sort_order.asc,name.asc`,
          { headers: { apikey: SUPABASE_ANON_KEY, Authorization: `Bearer ${SUPABASE_ANON_KEY}` }, next: { revalidate: 300 } }
        )
        const subs = await subsRes.json()
        return {
          label: cat.name,
          href: `/category/${cat.slug}`,
          subs: Array.isArray(subs) ? subs.map((s: any) => s.name) : [],
        }
      }))
    }
  } catch {}

  return (
    <>
      <style>{`
        .container-content { max-width: 1200px; margin: 0 auto; padding: 0 1.5rem; }
        .icon-btn { background: none; border: none; cursor: pointer; color: var(--color-cream); padding: 0.25rem; display: flex; align-items: center; }
        .desktop-nav { display: none !important; }
        @media (min-width: 900px) { .desktop-nav { display: flex !important; } }
        .nav-right { display: flex; align-items: center; gap: 0.75rem; }

        /* Logo: reserve dimensions + isolate to compositor layer to prevent filter re-eval flicker */
        .nav-logo {
          height: 64px;
          width: 200px;
          object-fit: contain;
          filter: brightness(0) saturate(100%) invert(76%) sepia(20%) saturate(600%) hue-rotate(350deg) brightness(95%) contrast(88%);
          transform: translateZ(0);
        }

        /* Auth-state-driven visibility — set by inline script BEFORE paint */
        html[data-auth-state="out"] .auth-out { display: flex; }
        html[data-auth-state="out"] .auth-in { display: none; }
        html[data-auth-state="in"] .auth-out { display: none; }
        html[data-auth-state="in"] .auth-in { display: flex; }
        /* Default (script blocked or no attr): show logged-out — safe fallback */
        html:not([data-auth-state]) .auth-out { display: flex; }
        html:not([data-auth-state]) .auth-in { display: none; }

        /* Welcome name from data-auth-name attribute */
        .gold-welcome-name::before { content: var(--auth-name, ""); }

        /* Notification badge slot — keeps its space even before count loads */
        .nav-bell { position: relative; display: flex; align-items: center; padding: 0.25rem; color: var(--color-cream); background: none; border: none; cursor: pointer; }
      `}</style>

      <header style={{ backgroundColor: 'var(--color-navy)', position: 'sticky', top: 0, zIndex: 20 }}>
        <div className="container-content">
          <div style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.75rem 0' }}>

            {/* Logo — server HTML, dimensions reserved, on own compositor layer */}
            <Link href="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center' }}>
              <img
                src="/dude-md.svg"
                alt="DudeMD — Modern Men's Wellness"
                width={200}
                height={64}
                fetchPriority="high"
                className="nav-logo"
              />
            </Link>

            {/* Desktop categories — server HTML */}
            <nav style={{ display: 'flex', gap: '2rem' }} className="desktop-nav" aria-label="Primary">
              {navItems.map((item) => (
                <Link key={item.label} href={item.href} style={{ fontSize: '13px', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--color-cream)', textDecoration: 'none' }}>
                  {item.label}
                </Link>
              ))}
            </nav>

            {/* Right side — both auth states rendered server-side, CSS picks one before paint */}
            <div className="nav-right">
              <NavAuthSlot />

              <Link href="/search" className="icon-btn" aria-label="Search" title="Search">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
                </svg>
              </Link>

              <NavDrawer navItems={navItems} />
            </div>
          </div>
        </div>

        {/* Gold bar — BOTH states server-rendered, CSS picks one before paint */}
        <div style={{ backgroundColor: 'var(--color-gold)', padding: '0.4rem 0' }}>
          <div className="container-content">

            {/* Logged-out version */}
            <div className="auth-out" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1.5rem' }}>
              <span />
              <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                <a href="/signin?redirect=/circles" style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--color-navy)', textDecoration: 'none' }}>Circles</a>
                <span style={{ color: 'rgba(14,26,43,0.3)', fontSize: '10px' }}>|</span>
                <Link href="/signin" style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--color-navy)', textDecoration: 'none' }}>Sign In</Link>
                <span style={{ color: 'rgba(14,26,43,0.3)', fontSize: '10px' }}>|</span>
                <Link href="/join" style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--color-navy)', textDecoration: 'none' }}>Subscribe</Link>
              </div>
            </div>

            {/* Logged-in version */}
            <div className="auth-in" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1.5rem' }}>
              <span style={{ fontSize: '11px', fontWeight: 500, color: 'var(--color-navy)' }}>
                Welcome, <span className="gold-welcome-name" suppressHydrationWarning />
              </span>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                <Link href="/circles" style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--color-navy)', textDecoration: 'none' }}>Circles</Link>
                <span style={{ color: 'rgba(14,26,43,0.3)', fontSize: '10px' }}>|</span>
                <Link href="/account" style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--color-navy)', textDecoration: 'none' }}>My Account</Link>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Welcome name is rendered via CSS attr() reading data-auth-name from <html>, set by pre-hydration script before paint */}
    </>
  )
}
