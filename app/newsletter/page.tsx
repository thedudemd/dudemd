'use client'
import { useState } from 'react'
import Link from 'next/link'

export default function NewsletterPage() {
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!email) return
    setStatus('loading')
    const res = await fetch('/api/newsletter/subscribe', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email })
    })
    if (res.ok) setStatus('success')
    else setStatus('error')
  }

  return (
    <main style={{ backgroundColor: '#f7f4ee', minHeight: '100vh', padding: '4rem 0' }}>
      <style>{`
        @keyframes fadeInUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes checkDraw { from { stroke-dashoffset: 100; } to { stroke-dashoffset: 0; } }
        @keyframes circlePop { from { transform: scale(0); opacity: 0; } to { transform: scale(1); opacity: 1; } }
        .success-wrap { animation: fadeInUp 0.4s ease forwards; }
        .success-circle { animation: circlePop 0.3s ease forwards; }
        .success-check { stroke-dasharray: 100; animation: checkDraw 0.4s ease 0.2s forwards; stroke-dashoffset: 100; }
      `}</style>
      <div className="container-content" style={{ maxWidth: '36rem' }}>
        <div style={{ marginBottom: '2rem' }}>
          <Link href="/" style={{ fontSize: '12px', color: '#9a9085', textDecoration: 'none' }}>← Back to Home</Link>
        </div>
        {status === 'success' ? (
          <div className="success-wrap" style={{ textAlign: 'center', padding: '3rem 0' }}>
            <div className="success-circle" style={{ width: 80, height: 80, borderRadius: '50%', backgroundColor: '#c9b28f', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem' }}>
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none">
                <polyline className="success-check" points="4,12 9,17 20,6" stroke="#0e1a2b" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <h2 style={{ fontFamily: 'Georgia, serif', fontSize: '1.75rem', fontWeight: 700, color: '#0e1a2b', marginBottom: '0.75rem' }}>You are In.</h2>
            <p style={{ fontSize: '1.1rem', color: '#4A5563', lineHeight: 1.65 }}>Welcome to the DudeMD Community.</p>
            <p style={{ fontSize: '0.9rem', color: '#9a9085', marginTop: '0.5rem' }}>Check your inbox for a welcome email.</p>
            <Link href="/" style={{ display: 'inline-block', marginTop: '2rem', padding: '0.75rem 1.5rem', backgroundColor: '#0e1a2b', color: '#f7f4ee', textDecoration: 'none', fontWeight: 700, fontSize: '12px', letterSpacing: '0.1em', textTransform: 'uppercase' }}>Read Latest Articles</Link>
          </div>
        ) : (
          <div style={{ textAlign: 'center' }}>
            <h1 style={{ fontFamily: 'Georgia, serif', fontSize: 'clamp(2rem, 5vw, 3rem)', fontWeight: 700, color: '#0e1a2b', marginBottom: '1rem' }}>
              Men's Wellness That Does Not Waste Your Time
            </h1>
            <p style={{ fontSize: '18px', color: '#4A5563', lineHeight: 1.65, marginBottom: '2rem' }}>
              Evidence-based health, fitness, and lifestyle advice delivered to your inbox. One email per week. No fluff.
            </p>
            <div style={{ backgroundColor: '#fff', padding: '2.5rem', border: '1px solid #ede8df', marginBottom: '2rem' }}>
              <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem', maxWidth: '24rem', margin: '0 auto' }}>
                <input type="email" placeholder="your@email.com" value={email} onChange={e => setEmail(e.target.value)} required style={{ padding: '0.85rem 1rem', backgroundColor: '#f7f4ee', border: '1px solid #ded9d0', color: '#0e1a2b', outline: 'none', fontSize: '15px' }} />
                <button type="submit" disabled={status === 'loading'} style={{ padding: '0.85rem 1.25rem', backgroundColor: '#0e1a2b', color: '#f7f4ee', fontWeight: 700, fontSize: '13px', letterSpacing: '0.1em', textTransform: 'uppercase', border: 'none', cursor: 'pointer' }}>
                  {status === 'loading' ? 'Subscribing...' : 'Subscribe Free'}
                </button>
                {status === 'error' && <p style={{ fontSize: '13px', color: '#a32d2d' }}>Something went wrong. Try again.</p>}
              </form>
              <p style={{ fontSize: '12px', color: '#9a9085', marginTop: '1rem' }}>Unsubscribe anytime. No spam, ever.</p>
            </div>
            <div style={{ textAlign: 'left', fontSize: '15px', color: '#1B1D21', lineHeight: 1.7 }}>
              <h2 style={{ fontFamily: 'Georgia, serif', fontSize: '1.25rem', fontWeight: 700, color: '#0e1a2b', marginBottom: '1rem' }}>What You will Get</h2>
              <ul style={{ paddingLeft: '1.5rem' }}>
                <li style={{ marginBottom: '0.5rem' }}>Weekly deep dives on health optimization</li>
                <li style={{ marginBottom: '0.5rem' }}>Science-backed fitness and nutrition strategies</li>
                <li style={{ marginBottom: '0.5rem' }}>Recovery protocols that actually work</li>
                <li style={{ marginBottom: '0.5rem' }}>Gear reviews and recommendations</li>
                <li style={{ marginBottom: '0.5rem' }}>Early access to new articles</li>
              </ul>
            </div>
          </div>
        )}
      </div>
    </main>
  )
}
