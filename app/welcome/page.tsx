'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

const SUPABASE_URL = 'https://bicljoujevywrkzjeaoy.supabase.co'
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJpY2xqb3VqZXZ5d3JremplYW95Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzg4MDc1ODIsImV4cCI6MjA5NDM4MzU4Mn0.UIKVUyX6QClJmAYdQKg91t_kAT4itpuSk_fIemcPJ0g'

async function dbQuery(path: string, options?: RequestInit) {
  return fetch(`${SUPABASE_URL}/rest/v1/${path}`, {
    ...options,
    headers: {
      apikey: SUPABASE_ANON_KEY,
      'Content-Type': 'application/json',
      ...(options?.headers || {}),
    },
  })
}

function getTokenFromCookie(): string | null {
  try {
    const cookies = document.cookie.split(';')
    for (const cookie of cookies) {
      const [name, value] = cookie.trim().split('=')
      if (name.trim() === 'sb-bicljoujevywrkzjeaoy-auth-token.0') {
        const decoded = atob(value.replace('base64-', ''))
        const parsed = JSON.parse(decoded)
        return parsed.access_token || null
      }
    }
  } catch {}
  return null
}

function getUserIdFromToken(token: string): string | null {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]))
    return payload.sub || null
  } catch {}
  return null
}

export default function WelcomePage() {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [firstName, setFirstName] = useState('')
  const [newsletter, setNewsletter] = useState(true)
  const [weeklyTips, setWeeklyTips] = useState(true)
  const [loading, setLoading] = useState(false)
  const [checking, setChecking] = useState(true)
  const [userId, setUserId] = useState<string | null>(null)
  const [accessToken, setAccessToken] = useState<string | null>(null)

  useEffect(() => {
    async function check() {
      try {
        const token = getTokenFromCookie()
        if (!token) { router.push('/signin'); return }
        const uid = getUserIdFromToken(token)
        if (!uid) { router.push('/signin'); return }
        setUserId(uid)
        setAccessToken(token)
        const res = await dbQuery(`profiles?select=*&id=eq.${uid}&limit=1`, {
          headers: { Authorization: `Bearer ${token}` }
        })
        const profiles = await res.json()
        const profile = profiles?.[0]
        if (profile?.onboarding_complete) { router.push('/'); return }
        if (profile?.full_name) {
          setFirstName(profile.full_name.split(' ')[0] || '')
        }
        setChecking(false)
      } catch {
        router.push('/signin')
      }
    }
    check()
  }, [])

  useEffect(() => {
    if (step === 3) {
      const t = setTimeout(() => router.push('/'), 3000)
      return () => clearTimeout(t)
    }
  }, [step])

  async function handleComplete() {
    if (!userId || !accessToken) return
    setLoading(true)
    try {
      const res = await dbQuery(`profiles?id=eq.${userId}`, {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          Prefer: 'return=minimal',
        },
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
    <div style={{ minHeight: '100vh', backgroundColor: '#f7f4ee', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ width: 32, height: 32, border: '3px solid #c9b28f', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
      <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
    </div>
  )

  const btn: React.CSSProperties = { width: '100%', padding: '0.875rem', backgroundColor: '#0e1a2b', color: '#f7f4ee', fontWeight: 700, fontSize: '13px', letterSpacing: '0.1em', textTransform: 'uppercase', border: 'none', cursor: 'pointer', marginTop: '1.5rem' }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f7f4ee', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '2rem 1.5rem', fontFamily: 'system-ui, sans-serif' }}>
      <div style={{ width: '100%', maxWidth: '420px' }}>
        {step !== 3 && (
          <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', marginBottom: '2rem' }}>
            {[1, 2].map(s => (
              <div key={s} style={{ width: s === step ? '24px' : '8px', height: '8px', borderRadius: '4px', backgroundColor: s === step ? '#0e1a2b' : s < step ? '#c9b28f' : '#d1cfc9', transition: 'all 0.3s' }} />
            ))}
          </div>
        )}
        {step === 1 && (
          <div style={{ backgroundColor: '#fff', padding: '2rem', border: '1px solid #ede8df' }}>
            <h1 style={{ fontSize: '24px', fontWeight: 700, color: '#0e1a2b', margin: '0 0 0.5rem', textAlign: 'center' }}>What should we call you?</h1>
            <p style={{ fontSize: '14px', color: '#4A5563', textAlign: 'center', margin: '0 0 1.5rem' }}>You can update this at any time in your profile.</p>
            <label style={{ display: 'block', fontSize: '11px', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#4A5563', marginBottom: '0.5rem' }}>First Name</label>
            <input type="text" value={firstName} onChange={e => setFirstName(e.target.value)} onKeyDown={e => e.key === 'Enter' && firstName.trim() && setStep(2)} placeholder="Enter your first name" autoFocus
              style={{ width: '100%', padding: '0.875rem', border: '1px solid #ede8df', fontSize: '15px', color: '#0e1a2b', outline: 'none', boxSizing: 'border-box', backgroundColor: '#f7f4ee' }} />
            <button onClick={() => firstName.trim() && setStep(2)} disabled={!firstName.trim()} style={{ ...btn, opacity: firstName.trim() ? 1 : 0.5 }}>Continue</button>
          </div>
        )}
        {step === 2 && (
          <div style={{ backgroundColor: '#fff', padding: '2rem', border: '1px solid #ede8df' }}>
            <h1 style={{ fontSize: '24px', fontWeight: 700, color: '#0e1a2b', margin: '0 0 0.5rem', textAlign: 'center' }}>Set your preferences</h1>
            <p style={{ fontSize: '14px', color: '#4A5563', textAlign: 'center', margin: '0 0 1.5rem' }}>You can update your selections at any time.</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '1.5rem' }}>
              <label style={{ display: 'flex', gap: '0.875rem', alignItems: 'flex-start', cursor: 'pointer' }}>
                <div onClick={() => setNewsletter(!newsletter)} style={{ width: '22px', height: '22px', flexShrink: 0, border: `2px solid ${newsletter ? '#0e1a2b' : '#d1cfc9'}`, backgroundColor: newsletter ? '#0e1a2b' : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', marginTop: '1px', cursor: 'pointer' }}>
                  {newsletter && <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M2 6l3 3 5-5" stroke="#f7f4ee" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>}
                </div>
                <span style={{ fontSize: '13px', fontWeight: 600, color: '#0e1a2b', lineHeight: 1.5, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Subscribe to the DudeMD newsletter. Get the best in men's wellness, style, and gear delivered weekly.</span>
              </label>
              <label style={{ display: 'flex', gap: '0.875rem', alignItems: 'flex-start', cursor: 'pointer' }}>
                <div onClick={() => setWeeklyTips(!weeklyTips)} style={{ width: '22px', height: '22px', flexShrink: 0, border: `2px solid ${weeklyTips ? '#0e1a2b' : '#d1cfc9'}`, backgroundColor: weeklyTips ? '#0e1a2b' : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', marginTop: '1px', cursor: 'pointer' }}>
                  {weeklyTips && <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M2 6l3 3 5-5" stroke="#f7f4ee" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>}
                </div>
                <span style={{ fontSize: '13px', fontWeight: 600, color: '#0e1a2b', lineHeight: 1.5, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Sign up to receive DudeMD's weekly wellness tips and personalized content.</span>
              </label>
            </div>
            <p style={{ fontSize: '11px', color: '#4A5563', lineHeight: 1.6, margin: '0 0 0.5rem' }}>
              By creating an account, you agree to our <a href="/terms-of-use" style={{ color: '#c9b28f' }}>Terms of Use</a> and acknowledge our <a href="/privacy-policy" style={{ color: '#c9b28f' }}>Privacy Policy</a>.
            </p>
            <button onClick={handleComplete} disabled={loading} style={{ ...btn, opacity: loading ? 0.7 : 1 }}>{loading ? 'Setting up your account...' : 'Create Account'}</button>
            <button onClick={() => setStep(1)} style={{ width: '100%', padding: '0.5rem', background: 'none', border: 'none', fontSize: '12px', color: '#4A5563', cursor: 'pointer', marginTop: '0.75rem', textDecoration: 'underline' }}>Back</button>
          </div>
        )}
        {step === 3 && (
          <div style={{ backgroundColor: '#fff', padding: '3rem 2rem', border: '1px solid #ede8df', textAlign: 'center' }}>
            <div style={{ width: '64px', height: '64px', backgroundColor: '#0e1a2b', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem' }}>
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#c9b28f" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6L9 17l-5-5"/></svg>
            </div>
            <h1 style={{ fontSize: '26px', fontWeight: 700, color: '#0e1a2b', margin: '0 0 0.75rem' }}>Welcome to The Dude Community{firstName ? `, ${firstName}` : ''}!</h1>
            <p style={{ fontSize: '14px', color: '#4A5563', lineHeight: 1.6, margin: '0 0 1.5rem' }}>You're now part of a community built for real men living real lives. We're glad you're here.</p>
            <p style={{ fontSize: '12px', color: '#9a9085' }}>Taking you home in a moment...</p>
            <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
          </div>
        )}
      </div>
    </div>
  )
}