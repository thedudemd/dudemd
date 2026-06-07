'use client'
import { useState, useEffect, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'

function ConfirmEmailInner() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const token = searchParams.get('token')
  const uid = searchParams.get('uid')
  const email = searchParams.get('email')

  const [code, setCode] = useState(token || '')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [autoConfirming, setAutoConfirming] = useState(!!token)

  useEffect(() => {
    if (token && uid && email) {
      // Auto-confirm if all params present (link click)
      handleConfirm(token)
    }
  }, [])

  async function handleConfirm(codeToUse?: string) {
    const useCode = codeToUse || code
    if (!useCode || !uid || !email) { setError('Missing confirmation details.'); setAutoConfirming(false); return }
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/auth/confirm-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: useCode, userId: uid, newEmail: decodeURIComponent(email) })
      })
      const data = await res.json()
      if (data.success) {
        setSuccess(true)
        setTimeout(() => router.push('/account?tab=settings'), 3000)
      } else {
        setError(data.error || 'Confirmation failed.')
        setAutoConfirming(false)
      }
    } catch {
      setError('Something went wrong. Please try again.')
      setAutoConfirming(false)
    } finally {
      setLoading(false)
    }
  }

  const inp: React.CSSProperties = { width: '100%', padding: '0.8rem 1rem', border: '1px solid #d1cfc9', borderRadius: 4, fontSize: '14px', outline: 'none', boxSizing: 'border-box', backgroundColor: '#fff', fontFamily: 'inherit', color: '#0e1a2b', textAlign: 'center', letterSpacing: '0.3em', fontSize: '1.5rem' }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: 'var(--color-cream)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem 1.5rem', fontFamily: 'system-ui, sans-serif' }}>
      <div style={{ width: '100%', maxWidth: '420px', backgroundColor: '#fff', padding: '2rem', border: '1px solid var(--color-border)', borderRadius: 8 }}>
        <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
          <img src="/dude-md.svg" alt="DudeMD" style={{ height: 48, width: 'auto', marginBottom: '1rem' }} />
          <h1 style={{ fontSize: '22px', fontWeight: 700, color: 'var(--color-navy)', margin: '0 0 0.5rem' }}>Confirm Email Change</h1>
          {email && <p style={{ fontSize: '14px', color: 'var(--color-slate)', margin: 0 }}>Confirming: <strong>{decodeURIComponent(email)}</strong></p>}
        </div>

        {autoConfirming && !error && !success && (
          <div style={{ textAlign: 'center', padding: '2rem 0' }}>
            <div style={{ width: 32, height: 32, border: '3px solid var(--color-gold)', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto' }} />
            <p style={{ fontSize: '14px', color: 'var(--color-slate)', marginTop: '1rem' }}>Confirming your email...</p>
            <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
          </div>
        )}

        {success && (
          <div style={{ textAlign: 'center', padding: '1rem 0' }}>
            <div style={{ width: 56, height: 56, backgroundColor: 'var(--color-navy)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem' }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--color-gold)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6L9 17l-5-5"/></svg>
            </div>
            <p style={{ fontSize: '16px', fontWeight: 700, color: 'var(--color-navy)', margin: '0 0 0.5rem' }}>Email updated!</p>
            <p style={{ fontSize: '14px', color: 'var(--color-slate)', margin: 0 }}>Redirecting to your account...</p>
          </div>
        )}

        {!autoConfirming && !success && (
          <div>
            <p style={{ fontSize: '14px', color: 'var(--color-slate)', marginBottom: '1.25rem', lineHeight: 1.6 }}>Enter the 6-digit code we sent to your new email address.</p>
            <input
              style={inp}
              value={code}
              onChange={e => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
              placeholder="000000"
              maxLength={6}
              inputMode="numeric"
            />
            {error && <p style={{ fontSize: '13px', color: '#a32d2d', margin: '0.5rem 0 0' }}>{error}</p>}
            <button
              onClick={() => handleConfirm()}
              disabled={loading || code.length !== 6}
              style={{ width: '100%', padding: '0.85rem', backgroundColor: 'var(--color-navy)', color: 'var(--color-cream)', fontWeight: 700, fontSize: '13px', letterSpacing: '0.08em', textTransform: 'uppercase', border: 'none', borderRadius: 4, cursor: 'pointer', marginTop: '1rem', opacity: code.length !== 6 || loading ? 0.5 : 1 }}
            >
              {loading ? 'Confirming...' : 'Confirm Email Change'}
            </button>
          </div>
        )}

        {error && !autoConfirming && (
          <div style={{ marginTop: '1rem', textAlign: 'center' }}>
            <a href="/account?tab=settings" style={{ fontSize: '13px', color: 'var(--color-gold)', textDecoration: 'underline' }}>← Back to Settings</a>
          </div>
        )}
      </div>
    </div>
  )
}

export default function ConfirmEmailPage() {
  return <Suspense><ConfirmEmailInner /></Suspense>
}
