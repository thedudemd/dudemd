import Link from 'next/link'
import NavClient from './NavClient'

const SUPABASE_URL = 'https://bicljoujevywrkzjeaoy.supabase.co'
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJpY2xqb3VqZXZ5d3JremplYW95Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzg4MDc1ODIsImV4cCI6MjA5NDM4MzU4Mn0.UIKVUyX6QClJmAYdQKg91t_kAT4itpuSk_fIemcPJ0g'

export default async function Nav() {
  let navItems: any[] = []
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
        .drawer-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.5); z-index: 40; }
        .drawer { position: fixed; top: 0; left: 0; bottom: 0; width: 100%; max-width: 22rem; background: var(--color-navy); z-index: 50; transform: translateX(-100%); transition: transform 0.3s ease; overflow-y: auto; }
        .drawer.open { transform: translateX(0); }
        .drawer-item { border-bottom: 1px solid rgba(255,255,255,0.1); }
        .drawer-cat-header { display: flex; justify-content: space-between; align-items: center; padding: 0.85rem 1.5rem; cursor: pointer; }
        .drawer-sub-link { display: block; padding: 0.5rem 1.5rem 0.5rem 2.5rem; font-size: 12px; color: rgba(247,244,238,0.7); text-decoration: none; letter-spacing: 0.04em; }
        .desktop-nav { display: none !important; }
        @media (min-width: 900px) { .desktop-nav { display: flex !important; } }
        .nav-auth-slot { width: 32px; height: 32px; display: flex; align-items: center; justify-content: center; }
      `}</style>

      <header style={{ backgroundColor: 'var(--color-navy)', position: 'sticky', top: 0, zIndex: 20 }}>
        <div className="container-content">
          <div style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.75rem 0' }}>

            {/* Logo — server HTML */}
            <Link href="/" style={{ textDecoration: 'none' }}>
              <img src="/dude-md.svg" alt="DudeMD — Modern Men's Wellness" style={{ height: '64px', width: 'auto', objectFit: 'contain', filter: 'brightness(0) saturate(100%) invert(76%) sepia(20%) saturate(600%) hue-rotate(350deg) brightness(95%) contrast(88%)' }} />
            </Link>

            {/* Desktop categories — server HTML, in first paint */}
            <nav style={{ display: 'flex', gap: '2rem' }} className="desktop-nav">
              {navItems.map((item) => (
                <Link key={item.label} href={item.href} style={{ fontSize: '13px', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--color-cream)', textDecoration: 'none' }}>
                  {item.label}
                </Link>
              ))}
            </nav>

            {/* Right buttons — client */}
            <NavClient navItems={navItems} />
          </div>
        </div>

        {/* Gold bar — server HTML, default logged-out state */}
        <div style={{ backgroundColor: 'var(--color-gold)', padding: '0.4rem 0' }}>
          <div className="container-content">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1.5rem' }}>
              <span />
              <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                <a href="/signin?redirect=/circles" style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--color-navy)', textDecoration: 'none' }}>Circles</a>
                <span style={{ color: 'rgba(14,26,43,0.3)', fontSize: '10px' }}>|</span>
                <Link href="/signin" style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--color-navy)', textDecoration: 'none' }}>Sign In</Link>
                <span style={{ color: 'rgba(14,26,43,0.3)', fontSize: '10px' }}>|</span>
                <Link href="/join" style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--color-navy)', textDecoration: 'none' }}>Subscribe</Link>
              </div>
            </div>
          </div>
        </div>
      </header>
    </>
  )
}
