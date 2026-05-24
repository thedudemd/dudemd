'use client'
import Link from 'next/link'
import { useState } from 'react'
import { usePathname } from 'next/navigation'

const NAV_ITEMS = [
  {
    label: 'Health', href: '/category/health',
    subs: ['Testosterone', 'Heart Health', 'Sleep', 'Gut Health', 'Mental Health'],
    articles: [
      { slug: 'the-testosterone-guide', title: 'The Complete Testosterone Guide for Men Over 30', image: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=300&q=80' },
      { slug: 'stress-cortisol', title: 'Chronic Stress Is Wrecking Your Hormones', image: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=300&q=80' },
    ]
  },
  {
    label: 'Fitness', href: '/category/fitness',
    subs: ['Strength Training', 'Cardio', 'Nutrition', 'Supplements', 'Workout Gear'],
    articles: [
      { slug: 'strength-40s', title: "Strength Training in Your 40s: What Changes and What Doesn't", image: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=300&q=80' },
      { slug: 'protein-guide', title: 'How Much Protein Do You Actually Need?', image: 'https://images.unsplash.com/photo-1532550907401-a500c9a57435?w=300&q=80' },
    ]
  },
  {
    label: 'Recovery', href: '/category/recovery',
    subs: ['Sleep', 'Cold Exposure', 'Mobility', 'Stress Management'],
    articles: [
      { slug: 'sleep-recovery', title: 'The 7-Day Sleep Reset That Actually Works', image: 'https://images.unsplash.com/photo-1541781774459-bb2af2f05b55?w=300&q=80' },
      { slug: 'cold-exposure', title: 'Cold Exposure: Separating the Hype From the Science', image: 'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=300&q=80' },
    ]
  },
  {
    label: 'Style', href: '/category/style',
    subs: ['Grooming', 'Fashion', 'Watches', 'Shoes', 'Skincare'],
    articles: [
      { slug: 'grooming-routine', title: "A No-Nonsense Grooming Routine for Men Who Don't Have Time", image: 'https://images.unsplash.com/photo-1621607512022-6aecc4fed814?w=300&q=80' },
      { slug: 'gear-essentials', title: 'The 10 Gear Essentials Every Man Should Own', image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=300&q=80' },
    ]
  },
  {
    label: 'Gear', href: '/category/gear',
    subs: ['Tech', 'Outdoors', 'Home', 'Travel', 'Reviews'],
    articles: [
      { slug: 'gear-essentials', title: 'The 10 Gear Essentials Every Man Should Own in 2025', image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=300&q=80' },
      { slug: 'gut-health', title: "Your Gut Is Running Your Brain. Here's How to Fix It", image: 'https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=300&q=80' },
    ]
  },
]

export default function Nav() {
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null)
  const [drawerExpanded, setDrawerExpanded] = useState<string | null>(null)
  const [searchOpen, setSearchOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [aboutOpen, setAboutOpen] = useState(false)
  const pathname = usePathname()
  if (pathname?.startsWith('/admin')) return null

  return (
    <>
      <style>{`
        .nav-desktop { display: flex !important; }
        .nav-mobile-only { display: none !important; }
        .nav-link { font-size: 13px; font-weight: 600; color: #f7f4ee; text-decoration: none; letter-spacing: 0.08em; text-transform: uppercase; padding-bottom: 2px; border-bottom: 2px solid transparent; }
        .nav-link:hover { border-bottom-color: #c9b28f; }
        .nav-item { position: relative; padding: 1.25rem 1rem; cursor: pointer; }
        .icon-btn { background: none; border: none; cursor: pointer; padding: 0.25rem; color: #f7f4ee; display: flex; align-items: center; opacity: 0.85; }
        .icon-btn:hover { opacity: 1; }
        .drawer-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.5); z-index: 400; }
        .drawer { position: fixed; top: 0; left: 0; height: 100vh; width: 340px; max-width: 90vw; background: #0e1a2b; z-index: 500; overflow-y: auto; transform: translateX(-100%); transition: transform 0.3s ease; }
        .drawer.open { transform: translateX(0); }
        .drawer-item { border-bottom: 1px solid rgba(255,255,255,0.08); }
        .drawer-cat-header { display: flex; justify-content: space-between; align-items: center; padding: 1rem 1.5rem; cursor: pointer; }
        .drawer-cat-header:hover { background: rgba(255,255,255,0.04); }
        .drawer-sub-link { display: block; padding: 0.5rem 1.5rem 0.5rem 2.5rem; font-size: 14px; color: #c9b28f; text-decoration: none; }
        .drawer-sub-link:hover { color: #f7f4ee; }
        @media (max-width: 768px) {
          .nav-desktop { display: none !important; }
          .nav-mobile-only { display: flex !important; }
        }
      `}</style>

      <header style={{ backgroundColor: '#0e1a2b', position: 'sticky', top: 0, zIndex: 200 }}>
        <div className="container-content" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: '4.5rem' }}>

          {/* LOGO */}
          <Link href="/" style={{ textDecoration: 'none', flexShrink: 0 }}>
            <img src="/dude%20md.svg" alt="DudeMD" style={{ height: '60px', width: 'auto', objectFit: 'contain', filter: 'brightness(0) saturate(100%) invert(78%) sepia(28%) saturate(500%) hue-rotate(5deg) brightness(95%) contrast(90%)' }} />
          </Link>

          {/* DESKTOP NAV */}
          <nav className="nav-desktop" style={{ gap: 0, alignItems: 'center' }}>
            {NAV_ITEMS.map((item) => (
              <div key={item.label} className="nav-item"
                onMouseEnter={() => setActiveDropdown(item.label)}
                onMouseLeave={() => setActiveDropdown(null)}>
                <Link href={item.href} className="nav-link">{item.label}</Link>
                {activeDropdown === item.label && (
                  <div style={{ position: 'fixed', top: '4.5rem', left: 0, right: 0, backgroundColor: '#ffffff', borderTop: '3px solid #c9b28f', boxShadow: '0 8px 32px rgba(0,0,0,0.15)', zIndex: 999 }}>
                    <div className="container-content" style={{ display: 'flex', gap: '3rem', padding: '2rem 1rem' }}>
                      <div style={{ minWidth: '180px' }}>
                        <p style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#9a9085', marginBottom: '1rem' }}>Topics</p>
                        {item.subs.map((sub) => (
                          <Link key={sub} href={`/category/${item.label.toLowerCase()}/${sub.toLowerCase().replace(/ /g, '-')}`}
                            style={{ display: 'block', fontSize: '14px', fontWeight: 500, color: '#0e1a2b', textDecoration: 'none', padding: '0.4rem 0', borderBottom: '1px solid #f0ede8' }}>
                            {sub}
                          </Link>
                        ))}
                      </div>
                      <div style={{ flex: 1 }}>
                        <p style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#9a9085', marginBottom: '1rem' }}>Latest in {item.label}</p>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                          {item.articles.map((a) => (
                            <Link key={a.slug} href={`/articles/${a.slug}`} style={{ textDecoration: 'none', display: 'flex', gap: '0.75rem', alignItems: 'start' }}>
                              <img src={a.image} alt={a.title} style={{ width: '80px', height: '60px', objectFit: 'cover', flexShrink: 0 }} />
                              <p style={{ fontSize: '13px', fontWeight: 600, color: '#0e1a2b', lineHeight: 1.3, margin: 0 }}>{a.title}</p>
                            </Link>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </nav>

          {/* DESKTOP RIGHT */}
          <div className="nav-desktop" style={{ alignItems: 'center', gap: '1.25rem' }}>
            <Link href="/newsletter" style={{ fontSize: '12px', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#0e1a2b', backgroundColor: '#c9b28f', padding: '0.5rem 1.25rem', textDecoration: 'none', whiteSpace: 'nowrap' }}>
              Subscribe
            </Link>
            <div style={{ position: 'relative' }}
              onMouseEnter={() => setAboutOpen(true)}
              onMouseLeave={() => setAboutOpen(false)}>
              <Link href="/about" style={{ fontSize: '13px', fontWeight: 600, color: '#f7f4ee', textDecoration: 'none', letterSpacing: '0.08em', textTransform: 'uppercase', paddingBottom: '2px', borderBottom: aboutOpen ? '2px solid #c9b28f' : '2px solid transparent' }}>
                About
              </Link>
              {aboutOpen && (
                <div style={{ position: 'absolute', top: '100%', right: 0, backgroundColor: '#ffffff', borderTop: '3px solid #c9b28f', boxShadow: '0 8px 32px rgba(0,0,0,0.15)', zIndex: 999, minWidth: '180px', padding: '0.5rem 0', marginTop: 0 }}>
                  {['Our Story', 'Editorial Policy', 'Contact', 'Advertise'].map((it) => (
                    <Link key={it} href={`/${it.toLowerCase().replace(/ /g, '-')}`}
                      style={{ display: 'block', fontSize: '14px', fontWeight: 500, color: '#0e1a2b', textDecoration: 'none', padding: '0.5rem 1.25rem', borderBottom: '1px solid #f0ede8' }}>
                      {it}
                    </Link>
                  ))}
                </div>
              )}
            </div>
            <Link href="/signin" className="icon-btn" title="Sign In">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
              </svg>
            </Link>
            <button className="icon-btn" onClick={() => setSearchOpen(!searchOpen)}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
              </svg>
            </button>
            <button onClick={() => setDrawerOpen(true)} style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', color: '#f7f4ee', padding: '0.25rem 0' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <div style={{ width: '20px', height: '2px', backgroundColor: '#f7f4ee' }} />
                <div style={{ width: '20px', height: '2px', backgroundColor: '#f7f4ee' }} />
                <div style={{ width: '20px', height: '2px', backgroundColor: '#f7f4ee' }} />
              </div>
              <span style={{ fontSize: '12px', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase' }}>Menu</span>
            </button>
          </div>

          {/* MOBILE RIGHT */}
          <div className="nav-mobile-only" style={{ alignItems: 'center', gap: '1rem' }}>
            <button className="icon-btn" onClick={() => setSearchOpen(!searchOpen)}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
              </svg>
            </button>
            <button onClick={() => setDrawerOpen(true)} style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', color: '#f7f4ee', padding: '0.25rem 0' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <div style={{ width: '20px', height: '2px', backgroundColor: '#f7f4ee' }} />
                <div style={{ width: '20px', height: '2px', backgroundColor: '#f7f4ee' }} />
                <div style={{ width: '20px', height: '2px', backgroundColor: '#f7f4ee' }} />
              </div>
              <span style={{ fontSize: '12px', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase' }}>Menu</span>
            </button>
          </div>
        </div>

        {/* SEARCH BAR */}
        {searchOpen && (
          <div style={{ backgroundColor: '#0e1a2b', borderTop: '1px solid rgba(255,255,255,0.1)', padding: '1rem 0' }}>
            <div className="container-content">
              <div style={{ display: 'flex', maxWidth: '40rem', margin: '0 auto' }}>
                <input autoFocus type="text" placeholder="Search DudeMD..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
                  style={{ flex: 1, padding: '0.85rem 1rem', backgroundColor: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.2)', borderRight: 'none', color: '#f7f4ee', outline: 'none', fontSize: '15px' }} />
                <button style={{ padding: '0.85rem 1.5rem', backgroundColor: '#c9b28f', color: '#0e1a2b', fontWeight: 700, fontSize: '12px', letterSpacing: '0.08em', textTransform: 'uppercase', border: 'none', cursor: 'pointer' }}>Search</button>
              </div>
            </div>
          </div>
        )}
      </header>

      {/* DRAWER OVERLAY */}
      {drawerOpen && <div className="drawer-overlay" onClick={() => setDrawerOpen(false)} />}

      {/* DRAWER */}
      <div className={`drawer${drawerOpen ? ' open' : ''}`}>
        {/* DRAWER HEADER */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1.25rem 1.5rem', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
          <Link href="/" onClick={() => setDrawerOpen(false)} style={{ textDecoration: 'none' }}>
            <img src="/dude%20md.svg" alt="DudeMD" style={{ height: '44px', width: 'auto', objectFit: 'contain', filter: 'brightness(0) saturate(100%) invert(78%) sepia(28%) saturate(500%) hue-rotate(5deg) brightness(95%) contrast(90%)' }} />
          </Link>
          <button onClick={() => setDrawerOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#f7f4ee', fontSize: '24px', lineHeight: 1, padding: '0.25rem' }}>×</button>
        </div>

        {/* DRAWER CATEGORIES */}
        <div style={{ padding: '0.5rem 0' }}>
          {NAV_ITEMS.map((item) => (
            <div key={item.label} className="drawer-item">
              <div className="drawer-cat-header"
                onClick={() => setDrawerExpanded(drawerExpanded === item.label ? null : item.label)}>
                <Link href={item.href} onClick={() => setDrawerOpen(false)}
                  style={{ fontSize: '13px', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#f7f4ee', textDecoration: 'none' }}>
                  {item.label}
                </Link>
                <span style={{ color: '#c9b28f', fontSize: '20px', lineHeight: 1 }}>{drawerExpanded === item.label ? '−' : '+'}</span>
              </div>
              {drawerExpanded === item.label && (
                <div style={{ paddingBottom: '0.75rem' }}>
                  {item.subs.map((sub) => (
                    <Link key={sub} href={`/category/${item.label.toLowerCase()}/${sub.toLowerCase().replace(/ /g, '-')}`}
                      onClick={() => setDrawerOpen(false)}
                      className="drawer-sub-link">
                      {sub}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* DRAWER FOOTER LINKS */}
        <div style={{ borderTop: '1px solid rgba(255,255,255,0.1)', padding: '1rem 0' }}>
          {['Our Story', 'Editorial Policy', 'Advertise', 'Contact'].map((it) => (
            <Link key={it} href={`/${it.toLowerCase().replace(/ /g, '-')}`}
              onClick={() => setDrawerOpen(false)}
              style={{ display: 'block', padding: '0.6rem 1.5rem', fontSize: '13px', color: 'rgba(247,244,238,0.6)', textDecoration: 'none', letterSpacing: '0.06em' }}>
              {it}
            </Link>
          ))}
        </div>

        {/* DRAWER BOTTOM */}
        <div style={{ borderTop: '1px solid rgba(255,255,255,0.1)', padding: '1.25rem 1.5rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          <Link href="/signin" onClick={() => setDrawerOpen(false)}
            style={{ display: 'block', padding: '0.75rem', textAlign: 'center', border: '1px solid rgba(247,244,238,0.3)', color: '#f7f4ee', fontSize: '13px', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', textDecoration: 'none' }}>
            Sign In
          </Link>
          <Link href="/newsletter" onClick={() => setDrawerOpen(false)}
            style={{ display: 'block', padding: '0.75rem', textAlign: 'center', backgroundColor: '#c9b28f', color: '#0e1a2b', fontSize: '13px', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', textDecoration: 'none' }}>
            Subscribe
          </Link>
          {/* SOCIAL */}
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', paddingTop: '0.5rem' }}>
            {[
              { href: 'https://instagram.com/thedudemd_', label: 'Instagram', d: 'M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z' },
              { href: 'https://twitter.com/_dudemd', label: 'X', d: 'M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.748l7.73-8.835L1.254 2.25H8.08l4.261 5.636zm-1.161 17.52h1.833L7.084 4.126H5.117z' },
              { href: 'https://facebook.com/MyDudeMD', label: 'Facebook', d: 'M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z' },
              { href: 'https://tiktok.com/@TheDudeMd', label: 'TikTok', d: 'M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 00-.79-.05 6.34 6.34 0 00-6.34 6.34 6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.33-6.34V8.69a8.18 8.18 0 004.78 1.52V6.76a4.85 4.85 0 01-1.01-.07z' },
            ].map(({ href, label, d }) => (
              <a key={label} href={href} target="_blank" rel="noopener noreferrer"
                style={{ color: 'rgba(247,244,238,0.5)', display: 'flex', alignItems: 'center' }}
                aria-label={label}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d={d}/></svg>
              </a>
            ))}
          </div>
        </div>
      </div>
    </>
  )
}
