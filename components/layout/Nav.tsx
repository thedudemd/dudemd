'use client'
import Link from 'next/link'
import { useState } from 'react'

const LINKS = ['Health', 'Fitness', 'Recovery', 'Style', 'Gear']

export default function Nav() {
  const [open, setOpen] = useState(false)

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Dancing+Script:wght@700&family=Playfair+Display:wght@900&display=swap');
        .dudemd-logo { text-decoration: none; display: flex; align-items: baseline; gap: 2px; }
        .dudemd-logo .dude { font-family: 'Dancing Script', cursive; font-size: clamp(32px, 5vw, 52px); color: #0e1a2b; line-height: 1; }
        .dudemd-logo .md { font-family: 'Playfair Display', serif; font-size: clamp(24px, 3.5vw, 38px); font-weight: 900; color: #0e1a2b; line-height: 1; letter-spacing: 0.02em; }
      `}</style>
      <header style={{ borderBottom: '1px solid #ede8df', backgroundColor: '#f7f4ee', position: 'sticky', top: 0, zIndex: 100 }}>
        <div className="container-content" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: '14px', paddingBottom: '14px' }}>
          <Link href="/" className="dudemd-logo">
            <span className="dude">Dude</span>
            <span className="md">MD</span>
          </Link>
          <nav style={{ display: 'flex', gap: '2rem' }} className="desktop-nav">
            {LINKS.map((item) => (
              <Link key={item} href={`/category/${item.toLowerCase()}`} style={{ fontSize: '13px', fontWeight: 500, color: '#4A5563', textDecoration: 'none', letterSpacing: '0.03em' }}>
                {item}
              </Link>
            ))}
          </nav>
          <button onClick={() => setOpen(!open)} className="mobile-menu-btn" style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '0.5rem' }}>
            <div style={{ width: '22px', height: '2px', backgroundColor: '#0e1a2b', margin: '4px 0' }} />
            <div style={{ width: '22px', height: '2px', backgroundColor: '#0e1a2b', margin: '4px 0' }} />
            <div style={{ width: '22px', height: '2px', backgroundColor: '#0e1a2b', margin: '4px 0' }} />
          </button>
        </div>
        {open && (
          <div style={{ backgroundColor: '#f7f4ee', borderTop: '1px solid #ede8df', padding: '1rem 0' }}>
            <div className="container-content">
              {LINKS.map((item) => (
                <Link key={item} href={`/category/${item.toLowerCase()}`} onClick={() => setOpen(false)} style={{ display: 'block', padding: '0.75rem 0', fontSize: '15px', fontWeight: 500, color: '#0e1a2b', textDecoration: 'none', borderBottom: '1px solid #ede8df' }}>
                  {item}
                </Link>
              ))}
            </div>
          </div>
        )}
      </header>
    </>
  )
}
