'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { createClient } from '@/lib/auth/supabase-auth'

export default function WelcomePage() {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [firstName, setFirstName] = useState('')
  const [newsletter, setNewsletter] = useState(true)
  const [weeklyTips, setWeeklyTips] = useState(true)
  const [loading, setLoading] = useState(false)
  const [checking, setChecking] = useState(true)

  useEffect(() => {
    async function check() {
      const supabase = createClient()
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) { router.push('/signin'); return }
      const { data: profile } = await supabase.from('profiles').select('*').eq('id', session.user.id).single()
      if (profile?.onboarding_complete) { router.push('/'); return }
      if (profile?.full_name) {
        const parts = profile.full_name.split(' ')
        setFirstName(parts[0] || '')
      }
      setChecking(false)
    }
    check()
  }, [])

  async function handleComplete() {
    setLoading(true)
    const supabase = createClient()
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) { router.push('/signin'); return }
    await supabase.from('profiles').update({
      full_name: firstName,
      newsletter_subscribed: newsletter,
      onboarding_complete: true,
    }).eq('id', session.user.id)
    router.push('/')
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

        {/* LOGO */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <Image src="/dude md.svg" alt="DudeMD" width={140} height={48} style={{ objectFit: 'contain', filter: 'brightness(0) saturate(100%) invert(8%) sepia(24%) saturate(1200%) hue-rotate(185deg) brightness(90%) contrast(95%)' }} priority />
        </div>

        {/* STEP INDICATORS */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', marginBottom: '2rem' }}>
          {[1, 2].map(s => (
            <div key={s} style={{ width: s === step ? '24px' : '8px', height: '8px', borderRadius: '4px', backgroundColor: s === step ? '#0e1a2b' : s < step ? '#c9b28f' : '#d1cfc9', transition: 'all 0.3s' }} />
          ))}
        </div>

        {/* STEP 1 — FIRST NAME */}
        {step === 1 && (
          <div style={{ backgroundColor: '#fff', padding: '2rem', border: '1px solid #ede8df' }}>
            <h1 style={{ fontSize: '24px', fontWeight: 700, color: '#0e1a2b', margin: '0 0 0.5rem', textAlign: 'center' }}>What should we call you?</h1>
            <p style={{ fontSize: '14px', color: '#4A5563', textAlign: 'center', margin: '0 0 1.5rem' }}>You can update this at any time in your profile.</p>
            <label style={{ display: 'block', fontSize: '11px', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#4A5563', marginBottom: '0.5rem' }}>First Name</label>
            <input
              type="text"
              value={firstName}
              onChange={e => setFirstName(e.target.value)}
              placeholder="Enter your first name"
              autoFocus
              style={{ width: '100%', padding: '0.875rem', border: '1px solid #ede8df', fontSize: '15px', color: '#0e1a2b', outline: 'none', boxSizing: 'border-box', backgroundColor: '#f7f4ee' }}
            />
            <button onClick={() => firstName.trim() && setStep(2)} disabled={!firstName.trim()} style={{ ...btn, opacity: firstName.trim() ? 1 : 0.5 }}>
              Continue
            </button>
          </div>
        )}

        {/* STEP 2 — PREFERENCES */}
        {step === 2 && (
          <div style={{ backgroundColor: '#fff', padding: '2rem', border: '1px solid #ede8df' }}>
            <h1 style={{ fontSize: '24px', fontWeight: 700, color: '#0e1a2b', margin: '0 0 0.5rem', textAlign: 'center' }}>Set your preferences</h1>
            <p style={{ fontSize: '14px', color: '#4A5563', textAlign: 'center', margin: '0 0 1.5rem' }}>You can update your selections at any time.</p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '1.5rem' }}>
              <label style={{ display: 'flex', gap: '0.875rem', alignItems: 'flex-start', cursor: 'pointer' }}>
                <div onClick={() => setNewsletter(!newsletter)}
                  style={{ width: '22px', height: '22px', flexShrink: 0, border: `2px solid ${newsletter ? '#0e1a2b' : '#d1cfc9'}`, backgroundColor: newsletter ? '#0e1a2b' : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', marginTop: '1px', cursor: 'pointer' }}>
                  {newsletter && <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M2 6l3 3 5-5" stroke="#f7f4ee" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>}
                </div>
                <span style={{ fontSize: '13px', fontWeight: 600, color: '#0e1a2b', lineHeight: 1.5, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                  Subscribe to the DudeMD newsletter. Get the best in men's wellness, style, and gear delivered weekly.
                </span>
              </label>

              <label style={{ display: 'flex', gap: '0.875rem', alignItems: 'flex-start', cursor: 'pointer' }}>
                <div onClick={() => setWeeklyTips(!weeklyTips)}
                  style={{ width: '22px', height: '22px', flexShrink: 0, border: `2px solid ${weeklyTips ? '#0e1a2b' : '#d1cfc9'}`, backgroundColor: weeklyTips ? '#0e1a2b' : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', marginTop: '1px', cursor: 'pointer' }}>
                  {weeklyTips && <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M2 6l3 3 5-5" stroke="#f7f4ee" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>}
                </div>
                <span style={{ fontSize: '13px', fontWeight: 600, color: '#0e1a2b', lineHeight: 1.5, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                  Sign up to receive DudeMD's weekly wellness tips and personalized content.
                </span>
              </label>
            </div>

            <p style={{ fontSize: '11px', color: '#4A5563', lineHeight: 1.6, margin: '0 0 0.5rem' }}>
              By creating an account, you agree to our <a href="/terms-of-use" style={{ color: '#c9b28f' }}>Terms of Use</a> and acknowledge our <a href="/privacy-policy" style={{ color: '#c9b28f' }}>Privacy Policy</a>. You agree to receive marketing and account-related emails from DudeMD.
            </p>

            <button onClick={handleComplete} disabled={loading} style={{ ...btn, opacity: loading ? 0.7 : 1 }}>
              {loading ? 'Setting up your account...' : 'Create Account'}
            </button>

            <button onClick={() => setStep(1)} style={{ width: '100%', padding: '0.5rem', background: 'none', border: 'none', fontSize: '12px', color: '#4A5563', cursor: 'pointer', marginTop: '0.75rem', textDecoration: 'underline' }}>
              Back
            </button>
          </div>
        )}

      </div>
    </div>
  )
}
