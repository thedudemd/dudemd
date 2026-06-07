'use client'
import { useState, useEffect, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'

function ConfirmEmailInner() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const token = searchParams.get('token')
  const uid = searchParams.get('uid')
  const email = searchParams.get('email')

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  useEffect(() => {
    if (!token || !uid || !email) {
      setError('Invalid confirmation link. Please request a new one.')
      setLoading(false)
      return
    }
    handleConfirm()
  }, [])

  async function handleConfirm() {
    try {
      const res = await fetch('/api/auth/confirm-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, userId: uid, newEmail: decodeURIComponent(email!) })
      })
      const data = await res.json()
      if (data.success) {
        setSuccess(true)
        setTimeout(() => router.push('/account'), 3000)
      } else {
        setError(data.error || 'Confirmation failed. Please request a new link.')
      }
    } catch {
      setError('Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: 'var(--color-cream)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem 1.5rem', fontFamily: 'system-ui, sans-serif' }}>
      <div style={{ width: '100%', maxWidth: '420px', backgroundColor: '#fff', padding: '2rem', border: '1px solid var(--color-border)', borderRadius: 8, textAlign: 'center' }}>
        <img src="/dude-md.svg" alt="DudeMD" style={{ height: 48, width: 'auto', marginBottom: '1.5rem' }} />

        {loading && (
          <>
            <div style={{ width: 32, height: 32, border: '3px solid var(--color-gold)', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto 1rem' }} />
            <p style={{ fontSize: '14px', color: 'var(--color-slate)' }}>Confirming your email...</p>
            <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
          </>
        )}

        {success && (
          <>
            <div style={{ width: 56, height: 56, backgroundColor: 'var(--color-navy)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem' }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--color-gold)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6L9 17l-5-5"/></svg>
            </div>
            <h1 style={{ fontSize: '22px', fontWeight: 700, color: 'var(--color-navy)', margin: '0 0 0.5rem' }}>Email Updated!</h1>
            <p style={{ fontSize: '14px', color: 'var(--color-slate)', margin: 0 }}>Redirecting to your account...</p>
          </>
        )}

        {error && (
          <>
            <p style={{ fontSize: '16px', fontWeight: 700, color: '#a32d2d', margin: '0 0 0.5rem' }}>Confirmation Failed</p>
            <p style={{ fontSize: '14px', color: 'var(--color-slate)', margin: '0 0 1.5rem' }}>{error}</p>
            <a href="/account" style={{ fontSize: '13px', color: 'var(--color-gold)', textDecoration: 'underline' }}>← Back to Account</a>
          </>
        )}
      </div>
    </div>
  )
}

export default function ConfirmEmailPage() {
  return <Suspense><ConfirmEmailInner /></Suspense>
}
