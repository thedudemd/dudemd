'use client'
import { useState } from 'react'

export default function ContactPage({ page }: { page: any }) {
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' })
  const [sending, setSending] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState('')

  const inp: any = { width: '100%', padding: '0.875rem', border: '1px solid #e8e4de', fontSize: '15px', outline: 'none', boxSizing: 'border-box', backgroundColor: '#fff', fontFamily: 'inherit', color: '#0e1a2b' }
  const lbl: any = { display: 'block', fontSize: '12px', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#4A5563', marginBottom: '0.5rem' }

  async function handleSubmit() {
    if (!form.name || !form.email || !form.message) {
      setError('Please fill in your name, email, and message.')
      return
    }
    setSending(true)
    setError('')
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      })
      const data = await res.json()
      if (data.success) {
        setSent(true)
      } else {
        setError(data.error || 'Something went wrong. Please try again.')
      }
    } catch {
      setError('Something went wrong. Please try again.')
    }
    setSending(false)
  }

  return (
    <main style={{ minHeight: '70vh', backgroundColor: 'var(--color-cream)', padding: '4rem 0' }}>
      <div style={{ maxWidth: '680px', margin: '0 auto', padding: '0 1.5rem' }}>

        <div style={{ marginBottom: '2.5rem' }}>
          <p style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--color-gold)', marginBottom: '0.75rem' }}>Get In Touch</p>
          <h1 style={{ fontFamily: 'Georgia, serif', fontSize: 'clamp(2rem, 5vw, 2.75rem)', fontWeight: 700, color: 'var(--color-navy)', lineHeight: 1.15, marginBottom: '1rem' }}>{page.title || 'Contact Us'}</h1>
          <p style={{ fontSize: '16px', color: 'var(--color-slate)', lineHeight: 1.7 }}>Have a question, story idea, partnership inquiry, or just want to say hello? We'd love to hear from you.</p>
        </div>

        {sent ? (
          <div style={{ backgroundColor: '#fff', border: '1px solid #e8e4de', padding: '3rem', textAlign: 'center' }}>
            <p style={{ fontSize: '2rem', marginBottom: '1rem' }}>✓</p>
            <h2 style={{ fontFamily: 'Georgia, serif', fontSize: '1.5rem', fontWeight: 700, color: 'var(--color-navy)', marginBottom: '0.75rem' }}>Message Sent</h2>
            <p style={{ fontSize: '15px', color: 'var(--color-slate)', lineHeight: 1.6 }}>Thanks for reaching out. We'll get back to you as soon as we can.</p>
          </div>
        ) : (
          <div style={{ backgroundColor: '#fff', border: '1px solid #e8e4de', padding: '2.5rem' }}>
            <div style={{ marginBottom: '1.25rem' }}>
              <label style={lbl}>Name <span style={{ color: '#a32d2d' }}>*</span></label>
              <input style={inp} value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="Your full name" />
            </div>
            <div style={{ marginBottom: '1.25rem' }}>
              <label style={lbl}>Email <span style={{ color: '#a32d2d' }}>*</span></label>
              <input style={inp} type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} placeholder="your@email.com" />
            </div>
            <div style={{ marginBottom: '1.25rem' }}>
              <label style={lbl}>Subject</label>
              <input style={inp} value={form.subject} onChange={e => setForm({ ...form, subject: e.target.value })} placeholder="What's this about?" />
            </div>
            <div style={{ marginBottom: '1.5rem' }}>
              <label style={lbl}>Message <span style={{ color: '#a32d2d' }}>*</span></label>
              <textarea style={{ ...inp, minHeight: '160px', resize: 'vertical' }} value={form.message} onChange={e => setForm({ ...form, message: e.target.value })} placeholder="Tell us what's on your mind..." />
            </div>
            {error && <p style={{ fontSize: '13px', color: '#a32d2d', marginBottom: '1rem' }}>{error}</p>}
            <button onClick={handleSubmit} disabled={sending} style={{ width: '100%', padding: '1rem', backgroundColor: 'var(--color-navy)', color: 'var(--color-cream)', border: 'none', fontWeight: 700, fontSize: '13px', letterSpacing: '0.1em', textTransform: 'uppercase', cursor: sending ? 'not-allowed' : 'pointer', opacity: sending ? 0.7 : 1 }}>
              {sending ? 'Sending...' : 'Send Message'}
            </button>
          </div>
        )}
      </div>
    </main>
  )
}
