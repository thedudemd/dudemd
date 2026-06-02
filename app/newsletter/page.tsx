'use client'
import { useState, Suspense } from 'react'
import Link from 'next/link'
import { useSearchParams, useRouter } from 'next/navigation'
import { createClient } from '@/lib/auth/supabase-auth'

function NewsletterInner() {
  const [step, setStep] = useState(0)
  const [email, setEmail] = useState('')
  const [firstName, setFirstName] = useState('')
  const [password, setPassword] = useState('')
  const [status, setStatus] = useState('idle')
  const searchParams = useSearchParams()
  const router = useRouter()
  const from = searchParams.get('from') || '/'

  async function handleEmail(e) {
    e.preventDefault()
    if (!email) return
    setStatus('loading')
    const res = await fetch('/api/newsletter/subscribe', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email })
    })
    const data = await res.json()
    setStatus('idle')
    if (data.exists) { setStep(4); return }
    if (!res.ok) { setStatus('error'); return }
    setStep(1)
  }

  async function handleAccount(e) {
    e.preventDefault()
    setStatus('loading')
    const supabase = createClient()
    const { error } = await supabase.auth.signUp({ email, password, options: { data: { full_name: firstName } } })
    if (error) { setStatus('error'); return }
    const { error: signInError } = await supabase.auth.signInWithPassword({ email, password })
    if (signInError) { setStatus('error'); return }
    // Save to profiles
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (session) {
        await supabase.from('profiles').upsert({ id: session.user.id, full_name: firstName, email, newsletter_subscribed: true })
      }
    } catch(e) {}
    setStatus('idle')
    setStep(5)
    setTimeout(() => { window.location.href = from }, 2000)
  }

  const slideStyle = (active: boolean) => ({
    transition: 'all 0.35s ease',
    opacity: active ? 1 : 0,
    transform: active ? 'translateY(0)' : 'translateY(20px)',
    display: active ? 'block' : 'none'
  })

  const inp: any = { width: '100%', padding: '1rem', border: '1px solid #ded9d0', backgroundColor: 'var(--color-cream)', color: 'var(--color-navy)', outline: 'none', fontSize: '16px', boxSizing: 'border-box' }
  const btn: any = { width: '100%', padding: '1rem', backgroundColor: 'var(--color-navy)', color: 'var(--color-cream)', fontWeight: 700, fontSize: '14px', letterSpacing: '0.1em', textTransform: 'uppercase', border: 'none', cursor: 'pointer', marginTop: '0.75rem' }

  return (
    <main style={{ backgroundColor: 'var(--color-cream)', minHeight: '100vh', display: 'flex', alignItems: 'flex-start', justifyContent: 'center', paddingTop: '3rem', paddingLeft: '2rem', paddingRight: '2rem', paddingBottom: '2rem' }}>
      <style>{`
        @keyframes fadeUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes checkDraw { from { stroke-dashoffset: 100; } to { stroke-dashoffset: 0; } }
        @keyframes circlePop { from { transform: scale(0); opacity: 0; } to { transform: scale(1); opacity: 1; } }
        .fade-up { animation: fadeUp 0.35s ease forwards; }
        .success-circle { animation: circlePop 0.3s ease forwards; }
        .success-check { stroke-dasharray: 100; animation: checkDraw 0.4s ease 0.2s forwards; stroke-dashoffset: 100; }
      `}</style>

      <div style={{ width: '100%', maxWidth: '480px' }}>
        <div style={{ marginBottom: '1.5rem' }}>
          <Link href="/" style={{ fontSize: '12px', color: '#9a9085', textDecoration: 'none' }}>← Back to DudeMD</Link>
        </div>

        {/* STEP 0 - EMAIL */}
        {step === 0 && (
          <div className="fade-up">
            <h1 style={{ fontFamily: 'Georgia, serif', fontSize: 'clamp(1.75rem, 5vw, 2.5rem)', fontWeight: 700, color: 'var(--color-navy)', marginBottom: '0.5rem', textAlign: 'center' }}>
              Join The Community
            </h1>
            <p style={{ fontSize: '15px', color: 'var(--color-slate)', lineHeight: 1.65, marginBottom: '1.5rem', textAlign: 'center' }}>
              Modern Men's Wellness for Real Life.
            </p>
            <div style={{ backgroundColor: '#fff', padding: '2rem', border: '1px solid var(--color-border)' }}>
              <form onSubmit={handleEmail} style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <input type="email" placeholder="your@email.com" value={email} onChange={e => setEmail(e.target.value)} required style={inp} autoFocus />
                <button type="submit" disabled={status === 'loading'} style={btn}>{status === 'loading' ? 'Checking...' : 'Get Started'}</button>
                {status === 'error' && <p style={{ fontSize: '13px', color: '#a32d2d', textAlign: 'center' }}>Something went wrong. Try again.</p>}
              </form>
              <p style={{ fontSize: '11px', color: '#9a9085', marginTop: '1.25rem', textAlign: 'center', lineHeight: 1.6 }}>
                🔒 Your information is secured. We never sell your data or spam you.<br/>
                <a href="/privacy-policy" style={{ color: 'var(--color-navy)', textDecoration: 'underline' }}>Privacy Policy</a> &amp; <a href="/terms-of-use" style={{ color: 'var(--color-navy)', textDecoration: 'underline' }}>Terms of Service</a>
              </p>
            </div>
          </div>
        )}

        {/* STEP 1 - FIRST NAME */}
        {step === 1 && (
          <div className="fade-up">
            <p style={{ fontSize: '13px', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--color-gold)', textAlign: 'center', marginBottom: '1rem' }}>Step 1 of 2</p>
            <h2 style={{ fontFamily: 'Georgia, serif', fontSize: 'clamp(1.5rem, 4vw, 2rem)', fontWeight: 700, color: 'var(--color-navy)', marginBottom: '0.5rem', textAlign: 'center' }}>
              What should we call you?
            </h2>
            <p style={{ fontSize: '15px', color: 'var(--color-slate)', textAlign: 'center', marginBottom: '2rem' }}>We'll use this to personalize your experience.</p>
            <div style={{ backgroundColor: '#fff', padding: '2rem', border: '1px solid var(--color-border)' }}>
              <form onSubmit={e => { e.preventDefault(); if (firstName.trim()) setStep(2) }} style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <input type="text" placeholder="First name" value={firstName} onChange={e => setFirstName(e.target.value)} required style={inp} autoFocus />
                <button type="submit" style={btn}>Continue →</button>
              </form>
            </div>
          </div>
        )}

        {/* STEP 2 - PASSWORD */}
        {step === 2 && (
          <div className="fade-up">
            <p style={{ fontSize: '13px', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--color-gold)', textAlign: 'center', marginBottom: '1rem' }}>Step 2 of 2</p>
            <h2 style={{ fontFamily: 'Georgia, serif', fontSize: 'clamp(1.5rem, 4vw, 2rem)', fontWeight: 700, color: 'var(--color-navy)', marginBottom: '0.5rem', textAlign: 'center' }}>
              Hey {firstName}, create a password
            </h2>
            <p style={{ fontSize: '15px', color: 'var(--color-slate)', textAlign: 'center', marginBottom: '2rem' }}>This saves your preferences and reading history.</p>
            <div style={{ backgroundColor: '#fff', padding: '2rem', border: '1px solid var(--color-border)' }}>
              <form onSubmit={handleAccount} style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <input type="password" placeholder="Create a password" value={password} onChange={e => setPassword(e.target.value)} required minLength={6} style={inp} autoFocus />
                <button type="submit" disabled={status === 'loading'} style={btn}>{status === 'loading' ? 'Creating Account...' : 'Create My Account'}</button>
                {status === 'error' && <p style={{ fontSize: '13px', color: '#a32d2d', textAlign: 'center' }}>Something went wrong. Try again.</p>}
              </form>
              <button onClick={() => { window.location.href = from }} style={{ display: 'block', width: '100%', marginTop: '0.75rem', padding: '0.5rem', backgroundColor: 'transparent', border: 'none', color: '#9a9085', fontSize: '12px', cursor: 'pointer', textAlign: 'center' }}>Skip for now</button>
            </div>
          </div>
        )}

        {/* STEP 4 - EXISTING USER */}
        {step === 4 && (
          <div className="fade-up" style={{ textAlign: 'center' }}>
            <div style={{ width: 80, height: 80, borderRadius: '50%', backgroundColor: 'var(--color-border)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem' }}>
              <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="var(--color-navy)" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
            </div>
            <h2 style={{ fontFamily: 'Georgia, serif', fontSize: '1.75rem', fontWeight: 700, color: 'var(--color-navy)', marginBottom: '0.75rem' }}>You're already a member.</h2>
            <p style={{ fontSize: '1rem', color: 'var(--color-slate)', marginBottom: '2rem' }}>Sign in to access your DudeMD account.</p>
            <Link href="/signin" style={{ display: 'inline-block', padding: '0.85rem 2rem', backgroundColor: 'var(--color-navy)', color: 'var(--color-cream)', textDecoration: 'none', fontWeight: 700, fontSize: '13px', letterSpacing: '0.1em', textTransform: 'uppercase' }}>Sign In</Link>
          </div>
        )}

        {/* STEP 5 - SUCCESS */}
        {step === 5 && (
          <div className="fade-up" style={{ textAlign: 'center', padding: '2rem 0' }}>
            <div className="success-circle" style={{ width: 80, height: 80, borderRadius: '50%', backgroundColor: 'var(--color-gold)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem' }}>
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none">
                <polyline className="success-check" points="4,12 9,17 20,6" stroke="var(--color-navy)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <h2 style={{ fontFamily: 'Georgia, serif', fontSize: '1.75rem', fontWeight: 700, color: 'var(--color-navy)', marginBottom: '0.75rem' }}>Welcome, {firstName}.</h2>
            <p style={{ fontSize: '1rem', color: 'var(--color-slate)' }}>You're now part of the DudeMD community.</p>
            <p style={{ fontSize: '0.85rem', color: 'var(--color-gold)', marginTop: '0.5rem' }}>Taking you back now...</p>
          </div>
        )}
      </div>
    </main>
  )
}

export default function NewsletterPage() {
  return <Suspense><NewsletterInner /></Suspense>
}
