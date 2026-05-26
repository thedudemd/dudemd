'use client'
import { useState, Suspense } from 'react'
import Link from 'next/link'
import { useSearchParams, useRouter } from 'next/navigation'
import { createClient } from '@/lib/auth/supabase-auth'

function NewsletterInner() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [status, setStatus] = useState('idle')
  const [step, setStep] = useState('subscribe')
  const searchParams = useSearchParams()
  const router = useRouter()
  const from = searchParams.get('from') || '/'

  async function handleSubmit(e) {
    e.preventDefault()
    if (!email) return
    setStatus('loading')
    const supabase = createClient()

    // Check if user exists
    const { data: signInData, error: signInError } = await supabase.auth.signInWithOtp({
      email,
      options: { shouldCreateUser: false }
    })

    if (!signInError) {
      // User exists — tell them to sign in
      setStep('existing')
      setStatus('idle')
      return
    }

    // New user — subscribe them
    const res = await fetch('/api/newsletter/subscribe', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email })
    })

    const data = await res.json()
    if (data.exists) { setStep('existing'); setStatus('idle'); return }
    if (!res.ok) { setStatus('error'); return }

    setStep('success')
    setStatus('idle')
  }

  async function handleSetPassword(e) {
    e.preventDefault()
    if (!password) return
    setStatus('loading')
    const supabase = createClient()
    const { error } = await supabase.auth.signUp({ email, password })
    if (error) { setStatus('error'); return }
    setStatus('idle')
    setTimeout(() => router.push(from), 1500)
    setStep('done')
  }

  async function handleSkip() {
    router.push(from)
  }

  const inp: any = { padding: '0.85rem 1rem', backgroundColor: '#f7f4ee', border: '1px solid #ded9d0', color: '#0e1a2b', outline: 'none', fontSize: '15px', width: '100%', boxSizing: 'border-box' }
  const btn: any = { padding: '0.85rem 1.25rem', backgroundColor: '#0e1a2b', color: '#f7f4ee', fontWeight: 700, fontSize: '13px', letterSpacing: '0.1em', textTransform: 'uppercase', border: 'none', cursor: 'pointer', width: '100%' }

  return (
    <main style={{ backgroundColor: '#f7f4ee', minHeight: '100vh', padding: '4rem 0' }}>
      <style>{`
        @keyframes fadeInUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes checkDraw { from { stroke-dashoffset: 100; } to { stroke-dashoffset: 0; } }
        @keyframes circlePop { from { transform: scale(0); opacity: 0; } to { transform: scale(1); opacity: 1; } }
        .anim { animation: fadeInUp 0.4s ease forwards; }
        .success-circle { animation: circlePop 0.3s ease forwards; }
        .success-check { stroke-dasharray: 100; animation: checkDraw 0.4s ease 0.2s forwards; stroke-dashoffset: 100; }
      `}</style>
      <div className="container-content" style={{ maxWidth: '36rem' }}>
        <div style={{ marginBottom: '2rem' }}>
          <Link href="/" style={{ fontSize: '12px', color: '#9a9085', textDecoration: 'none' }}>← Back to Home</Link>
        </div>

        {step === 'subscribe' && (
          <div style={{ textAlign: 'center' }}>
            <h1 style={{ fontFamily: 'Georgia, serif', fontSize: 'clamp(2rem, 5vw, 3rem)', fontWeight: 700, color: '#0e1a2b', marginBottom: '1rem' }}>
              Men's Wellness That Doesn't Waste Your Time
            </h1>
            <p style={{ fontSize: '18px', color: '#4A5563', lineHeight: 1.65, marginBottom: '2rem' }}>
              Evidence-based health, fitness, and lifestyle advice delivered to your inbox. One email per week. No fluff.
            </p>
            <div style={{ backgroundColor: '#fff', padding: '2.5rem', border: '1px solid #ede8df', marginBottom: '2rem' }}>
              <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem', maxWidth: '24rem', margin: '0 auto' }}>
                <input type="email" placeholder="your@email.com" value={email} onChange={e => setEmail(e.target.value)} required style={inp} />
                <button type="submit" disabled={status === 'loading'} style={btn}>
                  {status === 'loading' ? 'Checking...' : 'Subscribe Free'}
                </button>
                {status === 'error' && <p style={{ fontSize: '13px', color: '#a32d2d' }}>Something went wrong. Try again.</p>}
              </form>
              <p style={{ fontSize: '12px', color: '#9a9085', marginTop: '1rem' }}>Unsubscribe anytime. No spam, ever.</p>
            </div>
          </div>
        )}

        {step === 'existing' && (
          <div className="anim" style={{ textAlign: 'center', padding: '3rem 0' }}>
            <div style={{ width: 80, height: 80, borderRadius: '50%', backgroundColor: '#ede8df', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem' }}>
              <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#0e1a2b" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
            </div>
            <h2 style={{ fontFamily: 'Georgia, serif', fontSize: '1.75rem', fontWeight: 700, color: '#0e1a2b', marginBottom: '0.75rem' }}>You already have an account.</h2>
            <p style={{ fontSize: '1rem', color: '#4A5563', lineHeight: 1.65, marginBottom: '2rem' }}>Sign in to access your DudeMD account.</p>
            <Link href="/signin" style={{ display: 'inline-block', padding: '0.85rem 2rem', backgroundColor: '#0e1a2b', color: '#f7f4ee', textDecoration: 'none', fontWeight: 700, fontSize: '13px', letterSpacing: '0.1em', textTransform: 'uppercase' }}>Sign In</Link>
          </div>
        )}

        {step === 'success' && (
          <div className="anim" style={{ textAlign: 'center', padding: '3rem 0' }}>
            <div className="success-circle" style={{ width: 80, height: 80, borderRadius: '50%', backgroundColor: '#c9b28f', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem' }}>
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none">
                <polyline className="success-check" points="4,12 9,17 20,6" stroke="#0e1a2b" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <h2 style={{ fontFamily: 'Georgia, serif', fontSize: '1.75rem', fontWeight: 700, color: '#0e1a2b', marginBottom: '0.75rem' }}>You're In.</h2>
            <p style={{ fontSize: '1.1rem', color: '#4A5563', lineHeight: 1.65 }}>Welcome to the DudeMD Community.</p>
            <p style={{ fontSize: '0.9rem', color: '#9a9085', marginTop: '0.5rem', marginBottom: '2rem' }}>Check your inbox for a welcome email.</p>
            <div style={{ backgroundColor: '#fff', padding: '2rem', border: '1px solid #ede8df', maxWidth: '24rem', margin: '0 auto', textAlign: 'left' }}>
              <p style={{ fontSize: '13px', fontWeight: 700, color: '#0e1a2b', marginBottom: '1rem', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Complete Your Account</p>
              <p style={{ fontSize: '13px', color: '#4A5563', marginBottom: '1rem' }}>Set a password to save your preferences and personalize your experience.</p>
              <form onSubmit={handleSetPassword} style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <input type="password" placeholder="Create a password" value={password} onChange={e => setPassword(e.target.value)} required style={inp} />
                <button type="submit" disabled={status === 'loading'} style={btn}>
                  {status === 'loading' ? 'Creating Account...' : 'Create Account'}
                </button>
              </form>
              <div style={{ textAlign: 'center', margin: '1rem 0', color: '#9a9085', fontSize: '12px' }}>or</div>
              <Link href={'/signin?from=' + encodeURIComponent(from)} style={{ display: 'block', padding: '0.85rem', textAlign: 'center', border: '1px solid #ede8df', color: '#0e1a2b', textDecoration: 'none', fontWeight: 600, fontSize: '13px' }}>Continue with Google</Link>
              <button onClick={handleSkip} style={{ display: 'block', width: '100%', marginTop: '0.75rem', padding: '0.5rem', backgroundColor: 'transparent', border: 'none', color: '#9a9085', fontSize: '12px', cursor: 'pointer', textAlign: 'center' }}>Skip for now</button>
            </div>
          </div>
        )}

        {step === 'done' && (
          <div className="anim" style={{ textAlign: 'center', padding: '3rem 0' }}>
            <h2 style={{ fontFamily: 'Georgia, serif', fontSize: '1.75rem', fontWeight: 700, color: '#0e1a2b', marginBottom: '0.75rem' }}>Account Created.</h2>
            <p style={{ fontSize: '1rem', color: '#4A5563' }}>Taking you back now...</p>
          </div>
        )}
      </div>
    </main>
  )
}

export default function NewsletterPage() {
  return <Suspense><NewsletterInner /></Suspense>
}
