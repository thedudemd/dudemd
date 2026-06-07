'use client'
import { useState, useEffect, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'

function ConfirmEmailInner() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const token = searchParams.get('token')
  const uid = searchParams.get('uid')
  const email = searchParams.get('email')

  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading')
  const [errorMsg, setErrorMsg] = useState('')

  useEffect(() => {
    if (!token || !uid || !email) {
      setErrorMsg('Invalid confirmation link.')
      setStatus('error')
      return
    }
    fetch('/api/auth/confirm-email', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token, userId: uid, newEmail: decodeURIComponent(email) })
    })
      .then(r => r.json())
      .then(data => {
        if (data.success) {
          setStatus('success')
          setTimeout(() => router.push('/account'), 3000)
        } else {
          setErrorMsg(data.error || 'Confirmation failed.')
          setStatus('error')
        }
      })
      .catch(() => {
        setErrorMsg('Something went wrong. Please try again.')
        setStatus('error')
      })
  }, [])

  return (
    <div style={{ minHeight: '100vh', backgroundColor: 'var(--color-cream)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem 1.5rem', fontFamily: 'system-ui, sans-serif' }}>
      <div style={{ width: '100%', maxWidth: '420px', backgroundColor: '#fff', padding: '2.5rem 2rem', border: '1px solid var(--color-border)', textAlign: 'center' }}>
        

        {status === 'loading' && (
          <>
            <div style={{ width: 36, height: 36, border: '3px solid var(--color-gold)', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto 1rem' }} />
            <p style={{ fontSize: '15px', color: 'var(--color-slate)', margin: 0 }}>Confirming your email address...</p>
            <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
          </>
        )}

        {status === 'success' && (
          <>
            <div style={{ width: 60, height: 60, backgroundColor: 'var(--color-navy)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.25rem' }}>
              <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="var(--color-gold)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6L9 17l-5-5"/></svg>
            </div>
            <h1 style={{ fontSize: '22px', fontWeight: 700, color: 'var(--color-navy)', margin: '0 0 0.5rem' }}>Email Updated!</h1>
            <p style={{ fontSize: '14px', color: 'var(--color-slate)', margin: '0 0 0.5rem' }}>Your email address has been successfully changed to:</p>
            <p style={{ fontSize: '14px', fontWeight: 700, color: 'var(--color-navy)', margin: '0 0 1.5rem' }}>{email ? decodeURIComponent(email) : ''}</p>
            <p style={{ fontSize: '13px', color: '#9a9085', margin: 0 }}>Redirecting you back to your account...</p>
          </>
        )}

        {status === 'error' && (
          <>
            <h1 style={{ fontSize: '20px', fontWeight: 700, color: '#a32d2d', margin: '0 0 0.75rem' }}>Confirmation Failed</h1>
            <p style={{ fontSize: '14px', color: 'var(--color-slate)', margin: '0 0 1.5rem', lineHeight: 1.6 }}>{errorMsg}</p>
            <a href="/account" style={{ display: 'inline-block', padding: '0.75rem 1.5rem', backgroundColor: 'var(--color-navy)', color: 'var(--color-cream)', fontWeight: 700, fontSize: '13px', letterSpacing: '0.08em', textTransform: 'uppercase', textDecoration: 'none' }}>Back to Account</a>
          </>
        )}
      </div>
    </div>
  )
}

export default function ConfirmEmailPage() {
  return <Suspense><ConfirmEmailInner /></Suspense>
}
