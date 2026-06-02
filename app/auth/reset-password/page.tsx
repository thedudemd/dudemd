'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase/client'

export default function ResetPasswordPage() {
  const router = useRouter()
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [show, setShow] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [done, setDone] = useState(false)

  async function handleReset() {
    if (password.length < 8) { setError('At least 8 characters required'); return }
    if (password !== confirm) { setError('Passwords do not match'); return }
    setLoading(true)
    const { error: e } = await supabase.auth.updateUser({ password })
    if (e) { setError(e.message); setLoading(false); return }
    setDone(true)
    setTimeout(() => router.push('/'), 2000)
  }

  return (
    <main style={{ backgroundColor: 'var(--color-cream)', minHeight: '100vh', display: 'flex', alignItems: 'flex-start', justifyContent: 'center', paddingTop: '3rem', padding: '3rem 2rem' }}>
      <div style={{ width: '100%', maxWidth: '480px' }}>
        <div style={{ marginBottom: '1.5rem' }}>
          <Link href="/signin" style={{ fontSize: '12px', color: '#9a9085', textDecoration: 'none' }}>← Back to Sign In</Link>
        </div>
        <h1 style={{ fontFamily: 'Georgia, serif', fontSize: 'clamp(1.5rem, 4vw, 2rem)', fontWeight: 700, color: 'var(--color-navy)', marginBottom: '0.5rem', textAlign: 'center' }}>Set New Password</h1>
        <p style={{ fontSize: '15px', color: 'var(--color-slate)', marginBottom: '1.5rem', textAlign: 'center' }}>Choose a strong password.</p>
        {done ? (
          <div style={{ backgroundColor: '#e8f5ea', border: '1px solid #2d7a3a', padding: '1.5rem', textAlign: 'center' }}>
            <p style={{ color: '#2d7a3a', fontWeight: 700 }}>Password updated! Redirecting...</p>
          </div>
        ) : (
          <div style={{ backgroundColor: '#fff', padding: '2rem', border: '1px solid var(--color-border)' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ position: 'relative' }}>
                <label style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', color: 'var(--color-slate)', display: 'block', marginBottom: '0.4rem' }}>New Password</label>
                <input type={show ? 'text' : 'password'} placeholder="Min 8 characters" value={password} onChange={e => setPassword(e.target.value)} style={{ width: '100%', padding: '1rem', paddingRight: '3rem', border: '1px solid #ded9d0', outline: 'none', fontSize: '16px', boxSizing: 'border-box' }} />
                <button type="button" onClick={() => setShow(s => !s)} style={{ position: 'absolute', right: 12, bottom: 14, background: 'none', border: 'none', cursor: 'pointer', fontSize: 18 }}>{show ? 'Hide' : 'Show'}</button>
              </div>
              <div>
                <label style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', color: 'var(--color-slate)', display: 'block', marginBottom: '0.4rem' }}>Confirm Password</label>
                <input type="password" placeholder="Confirm password" value={confirm} onChange={e => setConfirm(e.target.value)} style={{ width: '100%', padding: '1rem', border: '1px solid #ded9d0', outline: 'none', fontSize: '16px', boxSizing: 'border-box' }} />
              </div>
              {error && <p style={{ fontSize: '13px', color: '#a32d2d' }}>{error}</p>}
              <button onClick={handleReset} disabled={loading} style={{ width: '100%', padding: '1rem', backgroundColor: 'var(--color-navy)', color: 'var(--color-cream)', fontWeight: 700, fontSize: '14px', letterSpacing: '0.1em', textTransform: 'uppercase', border: 'none', cursor: 'pointer' }}>{loading ? 'Updating...' : 'Update Password'}</button>
            </div>
          </div>
        )}
      </div>
    </main>
  )
}