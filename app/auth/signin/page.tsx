'use client'
import { useState } from 'react'
import { supabase } from '@/lib/supabase/client'
import Link from 'next/link'

export default function SignIn() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)

  async function handleGoogle() {
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}/auth/callback` }
    })
  }

  async function handleEmail() {
    if (!email) return
    setLoading(true)
    await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: `${window.location.origin}/auth/callback` }
    })
    setSent(true)
    setLoading(false)
  }

  return (
    <main style={{ minHeight: '100vh', backgroundColor: '#f7f4ee', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
      <div style={{ width: '100%', maxWidth: '400px' }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <Link href="/"><img src="/dude md.svg" alt="DudeMD" style={{ height: '60px', width: 'auto', marginBottom: '1rem' }} /></Link>
          <p style={{ fontSize: '13px', color: '#9a9085', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Sign in to your account</p>
        </div>
        {sent ? (
          <div style={{ backgroundColor: '#fff', border: '1px solid #ede8df', padding: '2rem', textAlign: 'center' }}>
            <p style={{ fontSize: '20px', marginBottom: '0.5rem' }}>📬</p>
            <p style={{ fontSize: '15px', fontWeight: 600, color: '#0e1a2b', marginBottom: '0.5rem' }}>Check your email</p>
            <p style={{ fontSize: '13px', color: '#9a9085' }}>We sent a magic link to <strong>{email}</strong></p>
          </div>
        ) : (
          <div style={{ backgroundColor: '#fff', border: '1px solid #ede8df', padding: '2rem' }}>
            <button onClick={handleGoogle} style={{ width: '100%', padding: '0.875rem', backgroundColor: '#fff', border: '1px solid #ede8df', cursor: 'pointer', fontSize: '14px', fontWeight: 600, color: '#0e1a2b', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
              <svg width="18" height="18" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
              Continue with Google
            </button>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
              <div style={{ flex: 1, height: '1px', backgroundColor: '#ede8df' }} />
              <span style={{ fontSize: '12px', color: '#9a9085' }}>or</span>
              <div style={{ flex: 1, height: '1px', backgroundColor: '#ede8df' }} />
            </div>
            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#4A5563', marginBottom: '0.5rem' }}>Email</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="your@email.com" style={{ width: '100%', padding: '0.75rem', border: '1px solid #ede8df', fontSize: '14px', outline: 'none', boxSizing: 'border-box' }} />
            </div>
            <button onClick={handleEmail} disabled={loading} style={{ width: '100%', padding: '0.875rem', backgroundColor: '#0e1a2b', color: '#f7f4ee', fontWeight: 700, fontSize: '13px', letterSpacing: '0.08em', textTransform: 'uppercase', border: 'none', cursor: 'pointer' }}>{loading ? 'Sending...' : 'Send Magic Link'}</button>
            <p style={{ fontSize: '12px', color: '#9a9085', textAlign: 'center', marginTop: '1.5rem' }}>By signing in you agree to our <Link href="/terms-of-use" style={{ color: '#c9b28f' }}>Terms</Link> and <Link href="/privacy-policy" style={{ color: '#c9b28f' }}>Privacy Policy</Link></p>
          </div>
        )}
      </div>
    </main>
  )
}
