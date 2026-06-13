'use client'
import { useState, useEffect } from 'react'

const SUPABASE_URL = 'https://bicljoujevywrkzjeaoy.supabase.co'
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJpY2xqb3VqZXZ5d3JremplYW95Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzg4MDc1ODIsImV4cCI6MjA5NDM4MzU4Mn0.UIKVUyX6QClJmAYdQKg91t_kAT4itpuSk_fIemcPJ0g'

export default function OptinDisplay({ categoryId, isHomepage }: { categoryId?: string; isHomepage?: boolean }) {
  const [enabled, setEnabled] = useState(false)
  const [design, setDesign] = useState<any>(null)
  const [dismissed, setDismissed] = useState(false)
  const [showPopup, setShowPopup] = useState(false)
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle')
  const [errorMsg, setErrorMsg] = useState('')

  // Check feature flag
  useEffect(() => {
    fetch(`${SUPABASE_URL}/rest/v1/feature_flags?key=eq.newsletter_optins&select=enabled`, {
      headers: { apikey: SUPABASE_ANON_KEY, Authorization: `Bearer ${SUPABASE_ANON_KEY}` }
    }).then(r => r.json()).then(data => setEnabled(!!data?.[0]?.enabled)).catch(() => {})
  }, [])

  // Find matching design
  useEffect(() => {
    if (!enabled) return
    async function findDesign() {
      const headers = { apikey: SUPABASE_ANON_KEY, Authorization: `Bearer ${SUPABASE_ANON_KEY}` }

      if (isHomepage) {
        const res = await fetch(`${SUPABASE_URL}/rest/v1/optin_designs?show_on_homepage=eq.true&enabled=eq.true&select=*&limit=1`, { headers })
        const data = await res.json()
        if (data?.[0]) setDesign(data[0])
        return
      }

      if (categoryId) {
        const res = await fetch(`${SUPABASE_URL}/rest/v1/optin_designs?target_category=eq.${categoryId}&enabled=eq.true&select=*&limit=1`, { headers })
        const data = await res.json()
        if (data?.[0]) { setDesign(data[0]); return }
      }

      // Fallback to General (no target category, not a homepage-only design)
      const res2 = await fetch(`${SUPABASE_URL}/rest/v1/optin_designs?target_category=is.null&show_on_homepage=eq.false&enabled=eq.true&select=*&limit=1`, { headers })
      const data2 = await res2.json()
      if (data2?.[0]) setDesign(data2[0])
    }
    findDesign().catch(() => {})
  }, [enabled, categoryId, isHomepage])

  // Handle dismissal state + popup delay
  useEffect(() => {
    if (!design) return
    const key = `optin_dismissed_${design.id}`
    if (typeof window !== 'undefined' && localStorage.getItem(key)) {
      setDismissed(true)
      return
    }
    if (design.display_type === 'popup') {
      const t = setTimeout(() => setShowPopup(true), 4000)
      return () => clearTimeout(t)
    }
  }, [design])

  function dismiss() {
    if (design && typeof window !== 'undefined') localStorage.setItem(`optin_dismissed_${design.id}`, '1')
    setDismissed(true)
    setShowPopup(false)
  }

  async function handleSubmit() {
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setErrorMsg('Please enter a valid email address.')
      return
    }
    setStatus('submitting')
    setErrorMsg('')
    try {
      const res = await fetch('/api/newsletter/subscribe-optin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, designId: design.id })
      })
      if (res.ok) {
        setStatus('success')
      } else {
        const d = await res.json()
        setErrorMsg(d.error || 'Something went wrong. Please try again.')
        setStatus('error')
      }
    } catch (e) {
      setErrorMsg('Something went wrong. Please try again.')
      setStatus('error')
    }
  }

  if (!enabled || !design || dismissed) return null
  if (design.display_type === 'popup' && !showPopup) return null

  const isPopup = design.display_type === 'popup'

  const content = (
    <div style={{ backgroundColor: 'var(--color-cream)', maxWidth: isPopup ? '420px' : '100%', width: '100%', position: 'relative', boxShadow: isPopup ? '0 8px 30px rgba(0,0,0,0.2)' : 'none' }}>
      {isPopup && (
        <button onClick={dismiss} style={{ position: 'absolute', top: '0.5rem', right: '0.5rem', background: 'rgba(255,255,255,0.8)', border: 'none', cursor: 'pointer', fontSize: '20px', lineHeight: 1, color: 'var(--color-navy)', zIndex: 2, width: '28px', height: '28px', borderRadius: '50%' }}>×</button>
      )}

      {design.html && (
        <iframe srcDoc={design.html} style={{ width: '100%', border: 'none', minHeight: '220px', display: 'block' }} title="Newsletter signup" />
      )}

      {status === 'success' ? (
        <div style={{ padding: '1.5rem', textAlign: 'center' }}>
          <p style={{ fontSize: '14px', color: 'var(--color-navy)', fontWeight: 600, marginBottom: '1rem' }}>You're subscribed! Want to join our free community?</p>
          <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <a href="/join" style={{ padding: '0.6rem 1.5rem', backgroundColor: 'var(--color-navy)', color: 'var(--color-cream)', fontWeight: 700, fontSize: '12px', letterSpacing: '0.08em', textTransform: 'uppercase', textDecoration: 'none' }}>Create Account</a>
            <button onClick={dismiss} style={{ padding: '0.6rem 1.5rem', background: 'none', border: '1px solid var(--color-navy)', color: 'var(--color-navy)', fontWeight: 700, fontSize: '12px', letterSpacing: '0.08em', textTransform: 'uppercase', cursor: 'pointer' }}>No Thanks</button>
          </div>
        </div>
      ) : (
        <div style={{ padding: '1.25rem' }}>
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="your@email.com"
              style={{ flex: 1, minWidth: '180px', padding: '0.75rem', border: '1px solid var(--color-border)', fontSize: '14px', outline: 'none', boxSizing: 'border-box' }}
            />
            <button onClick={handleSubmit} disabled={status === 'submitting'} style={{ padding: '0.75rem 1.5rem', backgroundColor: 'var(--color-navy)', color: 'var(--color-cream)', fontWeight: 700, fontSize: '12px', letterSpacing: '0.08em', textTransform: 'uppercase', border: 'none', cursor: status === 'submitting' ? 'not-allowed' : 'pointer', opacity: status === 'submitting' ? 0.6 : 1 }}>
              {status === 'submitting' ? '...' : 'Subscribe'}
            </button>
          </div>
          {errorMsg && <p style={{ fontSize: '12px', color: '#c0392b', margin: '0.5rem 0 0' }}>{errorMsg}</p>}
        </div>
      )}
    </div>
  )

  if (isPopup) {
    return (
      <div onClick={dismiss} style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(14,26,43,0.6)', zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1.5rem' }}>
        <div onClick={e => e.stopPropagation()}>{content}</div>
      </div>
    )
  }

  return content
}
