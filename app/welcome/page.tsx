'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Suspense } from 'react'

const SUPABASE_URL = 'https://bicljoujevywrkzjeaoy.supabase.co'
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJpY2xqb3VqZXZ5d3JremplYW95Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzg4MDc1ODIsImV4cCI6MjA5NDM4MzU4Mn0.UIKVUyX6QClJmAYdQKg91t_kAT4itpuSk_fIemcPJ0g'

function getTokenFromCookie(): string | null {
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
    return parsed.access_token || null
  } catch (e) {
    console.error('Cookie parse error:', e)
  }
  return null
}

function WelcomeInner() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const uid = searchParams.get('uid')
  const [step, setStep] = useState(1)
  const [firstName, setFirstName] = useState('')
  const [newsletter, setNewsletter] = useState(true)
  const [weeklyTips, setWeeklyTips] = useState(true)
  const [loading, setLoading] = useState(false)
  const [checking, setChecking] = useState(true)
  const [token, setToken] = useState<string | null>(null)

  useEffect(() => {
    if (!uid) { router.push('/signin'); return }
    
    // Try to get token with retries since cookie may not be set yet
    let attempts = 0
    const tryGetToken = () => {
      const t = getTokenFromCookie()
      if (t) {
        setToken(t)
        // Load existing profile data
        fetch(`${SUPABASE_URL}/rest/v1/profiles?select=full_name,onboarding_complete&id=eq.${uid}&limit=1`, {
          headers: { apikey: SUPABASE_ANON_KEY, Authorization: `Bearer ${t}` }
        }).then(r => r.json()).then(profiles => {
          const profile = profiles?.[0]
          if (profile?.onboarding_complete) { router.push('/'); return }
          if (profile?.full_name) setFirstName(profile.full_name.split(' ')[0] || '')
          setChecking(false)
        }).catch(() => setChecking(false))
      } else if (attempts < 10) {
        attempts++
        setTimeout(tryGetToken, 300)
      } else {
        // No token after 3 seconds — just show the form anyway
        setChecking(false)
      }
    }
    tryGetToken()
  }, [uid])

  useEffect(() => {
    if (step === 3) {
      const t = setTimeout(() => router.push('/'), 3000)
      return () => clearTimeout(t)
    }
  }, [step])

  async function handleComplete() {
    if (!uid) return
    setLoading(true)
    try {
      const t = token || getTokenFromCookie()
      const headers: Record<string, string> = { 
        apikey: SUPABASE_ANON_KEY,
        'Content-Type': 'application/json',
        Prefer: 'return=minimal'
      }
      if (t) headers.Authorization = `Bearer ${t}`
      
      const res = await fetch(`${SUPABASE_URL}/rest/v1/profiles?id=eq.${uid}`, {
        method: 'PATCH',
        headers,
        body: JSON.stringify({
          full_name: firstName,
          newsletter_subscribed: newsletter,
          onboarding_complete: true,
        }),
      })
      if (res.ok) setStep(3)
      else { alert('Something went wrong.'); setLoading(false) }
    } catch {
      alert('Something went wrong.')
      setLoading(false)
    }
  }

  if (checking) return (
    <div style={{ minHeight: '100vh', backgroundColor: 'var(--color-cream)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ width: 32, height: 32, border: '3px solid var(--color-gold)', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
      <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
    </div>
  )

  const btn: React.CSSProperties = { width: '100%', padding: '0.875rem', backgroundColor: 'var(--color-navy)', color: 'var(--color-cream)', fontWeight: 700, fontSize: '13px', letterSpacing: '0.1em', textTransform: 'uppercase', border: 'none', cursor: 'pointer', marginTop: '1.5rem' }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: 'var(--color-cream)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '2rem 1.5rem', fontFamily: 'system-ui, sans-serif' }}>
      <div style={{ width: '100%', maxWidth: '420px' }}>
        {step !== 3 && (
          <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', marginBottom: '2rem' }}>
            {[1, 2].map(s => (
              <div key={s} style={{ width: s === step ? '24px' : '8px', height: '8px', borderRadius: '4px', backgroundColor: s === step ? 'var(--color-navy)' : s < step ? 'var(--color-gold)' : '#d1cfc9', transition: 'all 0.3s' }} />
            ))}
          </div>
        )}
        {step === 1 && (
          <div style={{ backgroundColor: '#fff', padding: '2rem', border: '1px solid var(--color-border)' }}>
            <h1 style={{ fontSize: '24px', fontWeight: 700, color: 'var(--color-navy)', margin: '0 0 0.5rem', textAlign: 'center' }}>What should we call you?</h1>
            <p style={{ fontSize: '14px', color: 'var(--color-slate)', textAlign: 'center', margin: '0 0 1.5rem' }}>You can update this at any time in your profile.</p>
            <label style={{ display: 'block', fontSize: '11px', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--color-slate)', marginBottom: '0.5rem' }}>First Name</label>
            <input type="text" value={firstName} onChange={e => setFirstName(e.target.value)} onKeyDown={e => e.key === 'Enter' && firstName.trim() && setStep(2)} placeholder="Enter your first name" autoFocus
              style={{ width: '100%', padding: '0.875rem', border: '1px solid var(--color-border)', fontSize: '15px', color: 'var(--color-navy)', outline: 'none', boxSizing: 'border-box', backgroundColor: 'var(--color-cream)' }} />
            <button onClick={() => firstName.trim() && setStep(2)} disabled={!firstName.trim()} style={{ ...btn, opacity: firstName.trim() ? 1 : 0.5 }}>Continue</button>
          </div>
        )}
        {step === 2 && (
          <div style={{ backgroundColor: '#fff', padding: '2rem', border: '1px solid var(--color-border)' }}>
            <h1 style={{ fontSize: '24px', fontWeight: 700, color: 'var(--color-navy)', margin: '0 0 0.5rem', textAlign: 'center' }}>Set your preferences</h1>
            <p style={{ fontSize: '14px', color: 'var(--color-slate)', textAlign: 'center', margin: '0 0 1.5rem' }}>You can update your selections at any time.</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '1.5rem' }}>
              <label style={{ display: 'flex', gap: '0.875rem', alignItems: 'flex-start', cursor: 'pointer' }}>
                <div onClick={() => setNewsletter(!newsletter)} style={{ width: '22px', height: '22px', flexShrink: 0, border: `2px solid ${newsletter ? 'var(--color-navy)' : '#d1cfc9'}`, backgroundColor: newsletter ? 'var(--color-navy)' : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', marginTop: '1px', cursor: 'pointer' }}>
                  {newsletter && <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M2 6l3 3 5-5" stroke="var(--color-cream)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>}
                </div>
                <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--color-navy)', lineHeight: 1.5, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Subscribe to the DudeMD newsletter. Get the best in men's wellness, style, and gear delivered weekly.</span>
              </label>
              <label style={{ display: 'flex', gap: '0.875rem', alignItems: 'flex-start', cursor: 'pointer' }}>
                <div onClick={() => setWeeklyTips(!weeklyTips)} style={{ width: '22px', height: '22px', flexShrink: 0, border: `2px solid ${weeklyTips ? 'var(--color-navy)' : '#d1cfc9'}`, backgroundColor: weeklyTips ? 'var(--color-navy)' : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', marginTop: '1px', cursor: 'pointer' }}>
                  {weeklyTips && <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M2 6l3 3 5-5" stroke="var(--color-cream)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>}
                </div>
                <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--color-navy)', lineHeight: 1.5, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Sign up to receive DudeMD's weekly wellness tips and personalized content.</span>
              </label>
            </div>
            <p style={{ fontSize: '11px', color: 'var(--color-slate)', lineHeight: 1.6, margin: '0 0 0.5rem' }}>
              By creating an account, you agree to our <a href="/terms-of-use" style={{ color: 'var(--color-gold)' }}>Terms of Use</a> and acknowledge our <a href="/privacy-policy" style={{ color: 'var(--color-gold)' }}>Privacy Policy</a>.
            </p>
            <button onClick={handleComplete} disabled={loading} style={{ ...btn, opacity: loading ? 0.7 : 1 }}>{loading ? 'Setting up your account...' : 'Create Account'}</button>
            <button onClick={() => setStep(1)} style={{ width: '100%', padding: '0.5rem', background: 'none', border: 'none', fontSize: '12px', color: 'var(--color-slate)', cursor: 'pointer', marginTop: '0.75rem', textDecoration: 'underline' }}>Back</button>
          </div>
        )}
        {step === 3 && (
          <div style={{ backgroundColor: '#fff', padding: '3rem 2rem', border: '1px solid var(--color-border)', textAlign: 'center' }}>
            <div style={{ width: '64px', height: '64px', backgroundColor: 'var(--color-navy)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem' }}>
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="var(--color-gold)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6L9 17l-5-5"/></svg>
            </div>
            <h1 style={{ fontSize: '26px', fontWeight: 700, color: 'var(--color-navy)', margin: '0 0 0.75rem' }}>Welcome to The Dude Community{firstName ? `, ${firstName}` : ''}!</h1>
            <p style={{ fontSize: '14px', color: 'var(--color-slate)', lineHeight: 1.6, margin: '0 0 1.5rem' }}>You're now part of a community built for real men living real lives. We're glad you're here.</p>
            <p style={{ fontSize: '12px', color: '#9a9085' }}>Taking you home in a moment...</p>
            <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
          </div>
        )}
      </div>
    </div>
  )
}

export default function WelcomePage() {
  return <Suspense><WelcomeInner /></Suspense>
}