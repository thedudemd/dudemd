'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'

export default function CirclesPage() {
  const [countdown, setCountdown] = useState(6)
  const [from, setFrom] = useState<string | null>(null)

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search)
      const f = params.get('from') || document.referrer || '/'
      setFrom(f)
    }
  }, [])

  useEffect(() => {
    if (from === null) return
    if (countdown <= 0) {
      window.location.href = from
      return
    }
    const t = setTimeout(() => setCountdown(c => c - 1), 1000)
    return () => clearTimeout(t)
  }, [countdown, from])

  return (
    <main style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'var(--color-cream)', padding: '4rem 2rem' }}>
      <div style={{ maxWidth: '480px', width: '100%', textAlign: 'center' }}>
        <div style={{ width: 64, height: 64, borderRadius: '50%', backgroundColor: 'var(--color-navy)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem' }}>
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="var(--color-gold)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
            <circle cx="9" cy="7" r="4"/>
            <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
            <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
          </svg>
        </div>
        <p style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--color-gold)', marginBottom: '0.75rem' }}>Coming Soon</p>
        <h1 style={{ fontFamily: 'Georgia, serif', fontSize: 'clamp(1.75rem, 4vw, 2.5rem)', fontWeight: 700, color: 'var(--color-navy)', marginBottom: '1rem', lineHeight: 1.2 }}>DudeMD Circles</h1>
        <p style={{ fontSize: '16px', color: 'var(--color-slate)', lineHeight: 1.7, marginBottom: '2rem' }}>
          Circles are community spaces where men connect around the topics that matter — fitness, mental health, relationships, career, and more. We're building it now.
        </p>
        <div style={{ backgroundColor: '#fff', border: '1px solid var(--color-border)', borderRadius: '8px', padding: '1.25rem', marginBottom: '2rem' }}>
          <p style={{ fontSize: '13px', color: '#9a9085', margin: 0 }}>Taking you back in <strong style={{ color: 'var(--color-navy)', fontSize: '18px' }}>{countdown}</strong> seconds...</p>
        </div>
        <button onClick={() => { window.location.href = from }} style={{ padding: '0.75rem 2rem', backgroundColor: 'var(--color-navy)', color: 'var(--color-cream)', fontWeight: 700, fontSize: '13px', letterSpacing: '0.08em', textTransform: 'uppercase', border: 'none', cursor: 'pointer', marginRight: '0.75rem' }}>
          Go Back Now
        </button>
        <Link href="/" style={{ fontSize: '13px', color: 'var(--color-gold)', fontWeight: 600, textDecoration: 'none' }}>Home</Link>
      </div>
    </main>
  )
}
