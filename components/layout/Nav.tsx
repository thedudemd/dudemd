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
  const [mobileOpen, setMobileOpen] = useState(false)
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null)
  const [mobileExpanded, setMobileExpanded] = useState<string | null>(null)
  const [searchOpen, setSearchOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [aboutOpen, setAboutOpen] = useState(false)
  const pathname = usePathname()
  if (pathname?.startsWith('/admin')) return null

  return (
    <header style={{ backgroundColor: '#0e1a2b', position: 'sticky', top: 0, zIndex: 200 }}>
      <style>{`
        .nav-desktop { display: flex !important; }
        .nav-mobile-btn { display: none !important; }
        .nav-link { font-size: 13px; font-weight: 600; color: #f7f4ee; text-decoration: none; letter-spacing: 0.08em; text-transform: uppercase; padding-bottom: 2px; border-bottom: 2px solid transparent; }
        .nav-link:hover { border-bottom-color: #c9b28f; }
        .nav-item { position: relative; padding: 1.25rem 1rem; cursor: pointer; }
        .icon-btn { background: none; border: none; cursor: pointer; padding: 0.25rem; color: #f7f4ee; display: flex; align-items: center; opacity: 0.85; }
        .icon-btn:hover { opacity: 1; }
        @media (max-width: 768px) {
          .nav-desktop { display: none !important; }
          .nav-mobile-btn { display: block !important; }
        }
      `}</style>

      <div className="container-content" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: '4.5rem' }}>
        <Link href="/" style={{ textDecoration: 'none', flexShrink: 0 }}>
          <img src="/ude md.svg" alt="DudeMD" style={{ height: "60px", width: "auto", objectFit: "contain", filter: "brightness(0) saturate(100%) invert(78%) sepia(28%) saturate(500%) hue-rotate(5deg) brightness(95%) contrast(90%)" }} />
        </Link>

        {/* MAIN CATEGORY NAV */}
        <nav className="nav-desktop" style={{ gap: '0', alignItems: 'center' }}>
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

        {/* RIGHT SIDE */}
        <div className="nav-desktop" style={{ alignItems: 'center', gap: '1.25rem' }}>
          <Link href="/newsletter" style={{ fontSize: '12px', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#0e1a2b', backgroundColor: '#c9b28f', padding: '0.5rem 1.25rem', textDecoration: 'none', whiteSpace: 'nowrap' }}>
            Subscribe
          </Link>

          {/* ABOUT */}
          <div style={{ position: 'relative' }}
            onMouseEnter={() => setAboutOpen(true)}
            onMouseLeave={() => setAboutOpen(false)}>
            <Link href="/about" style={{ fontSize: '13px', fontWeight: 600, color: '#f7f4ee', textDecoration: 'none', letterSpacing: '0.08em', textTransform: 'uppercase', paddingBottom: '2px', borderBottom: aboutOpen ? '2px solid #c9b28f' : '2px solid transparent' }}>
              About
            </Link>
            {aboutOpen && (
              <div style={{ position: 'absolute', top: '100%', right: 0, backgroundColor: '#ffffff', borderTop: '3px solid #c9b28f', boxShadow: '0 8px 32px rgba(0,0,0,0.15)', zIndex: 999, minWidth: '180px', padding: '0.5rem 0', marginTop: 0 }}>
                {['Our Story', 'Editorial Policy', 'Contact', 'Advertise'].map((item) => (
                  <Link key={item} href={`/${item.toLowerCase().replace(/ /g, '-')}`}
                    style={{ display: 'block', fontSize: '14px', fontWeight: 500, color: '#0e1a2b', textDecoration: 'none', padding: '0.5rem 1.25rem', borderBottom: '1px solid #f0ede8' }}>
                    {item}
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* LOGIN ICON */}
          <button className="icon-btn" title="Sign In" onClick={() => {}}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
              <circle cx="12" cy="7" r="4"/>
            </svg>
          </button>

          {/* SEARCH ICON */}
          <button className="icon-btn" onClick={() => setSearchOpen(!searchOpen)}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
            </svg>
          </button>
        </div>

        {/* MOBILE HAMBURGER */}
        <button onClick={() => setMobileOpen(!mobileOpen)} className="nav-mobile-btn"
          style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '0.5rem' }}>
          <div style={{ width: '22px', height: '2px', backgroundColor: '#f7f4ee', margin: '4px 0' }} />
          <div style={{ width: '22px', height: '2px', backgroundColor: '#f7f4ee', margin: '4px 0' }} />
          <div style={{ width: '22px', height: '2px', backgroundColor: '#f7f4ee', margin: '4px 0' }} />
        </button>
      </div>

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

      {mobileOpen && (
        <div style={{ backgroundColor: '#0e1a2b', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
          <div className="container-content">
            {NAV_ITEMS.map((item) => (
              <div key={item.label}>
                <div onClick={() => setMobileExpanded(mobileExpanded === item.label ? null : item.label)}
                  style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.875rem 0', borderBottom: '1px solid rgba(255,255,255,0.08)', cursor: 'pointer' }}>
                  <span style={{ fontSize: '14px', fontWeight: 600, color: '#f7f4ee', letterSpacing: '0.08em', textTransform: 'uppercase' }}>{item.label}</span>
                  <span style={{ color: '#c9b28f', fontSize: '18px', lineHeight: 1 }}>{mobileExpanded === item.label ? '−' : '+'}</span>
                </div>
                {mobileExpanded === item.label && (
                  <div style={{ padding: '0.5rem 0 1rem 1rem' }}>
                    {item.subs.map((sub) => (
                      <Link key={sub} href={`/category/${item.label.toLowerCase()}/${sub.toLowerCase().replace(/ /g, '-')}`}
                        onClick={() => setMobileOpen(false)}
                        style={{ display: 'block', padding: '0.5rem 0', fontSize: '14px', color: '#c9b28f', textDecoration: 'none' }}>
                        {sub}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            ))}
            <Link href="/about" onClick={() => setMobileOpen(false)}
              style={{ display: 'block', padding: '0.875rem 0', fontSize: '14px', fontWeight: 600, color: '#f7f4ee', textDecoration: 'none', borderBottom: '1px solid rgba(255,255,255,0.08)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
              About
            </Link>
            <Link href="/login" onClick={() => setMobileOpen(false)}
              style={{ display: 'block', padding: '0.875rem 0', fontSize: '14px', fontWeight: 600, color: '#f7f4ee', textDecoration: 'none', borderBottom: '1px solid rgba(255,255,255,0.08)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
              Sign In
            </Link>
            <Link href="/newsletter" onClick={() => setMobileOpen(false)}
              style={{ display: 'block', margin: '1rem 0', padding: '0.875rem', backgroundColor: '#c9b28f', color: '#0e1a2b', fontWeight: 700, fontSize: '13px', letterSpacing: '0.08em', textTransform: 'uppercase', textDecoration: 'none', textAlign: 'center' }}>
              Subscribe
            </Link>
          </div>
        </div>
      )}
    </header>
  )
}
