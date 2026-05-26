// @ts-nocheck
'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase/client'
import AdminShell from '@/components/admin/AdminShell'

export default function NewsletterAdmin() {
  const [tab, setTab] = useState('compose')
  const [subscribers, setSubscribers] = useState<any[]>([])
  const [subject, setSubject] = useState('')
  const [body, setBody] = useState('')
  const [preview, setPreview] = useState(false)
  const [sending, setSending] = useState(false)
  const [sent, setSent] = useState(false)
  const [stats, setStats] = useState({ total: 0, active: 0, unsubscribed: 0 })
  const router = useRouter()

  useEffect(() => {
    async function load() {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) { router.push('/admin/login'); return }
      const { data } = await supabase.from('subscribers').select('*').order('created_at', { ascending: false })
      const all = data || []
      setSubscribers(all)
      setStats({
        total: all.length,
        active: all.filter((s: any) => !s.unsubscribed).length,
        unsubscribed: all.filter((s: any) => s.unsubscribed).length,
      })
    }
    load()
  }, [])

  async function handleSend() {
    if (!subject || !body) return alert('Subject and body required')
    if (!confirm(`Send to ${stats.active} active subscribers?`)) return
    setSending(true)
    const res = await fetch('/api/newsletter/send', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ subject, body })
    })
    setSending(false)
    if (res.ok) { setSent(true); setSubject(''); setBody('') }
    else alert('Send failed. Check Resend API.')
  }

  async function handleUnsubscribe(id: string) {
    await supabase.from('subscribers').update({ unsubscribed: true }).eq('id', id)
    setSubscribers(subscribers.map(s => s.id === id ? { ...s, unsubscribed: true } : s))
    setStats(prev => ({ ...prev, active: prev.active - 1, unsubscribed: prev.unsubscribed + 1 }))
  }

  async function handleDelete(id: string) {
    await supabase.from('subscribers').delete().eq('id', id)
    setSubscribers(subscribers.filter(s => s.id !== id))
    setStats(prev => ({ ...prev, total: prev.total - 1 }))
  }

  const inp: any = { width: '100%', padding: '0.75rem', border: '1px solid #e8e4de', fontSize: '14px', outline: 'none', boxSizing: 'border-box', backgroundColor: '#fff', fontFamily: 'inherit' }
  const lbl: any = { display: 'block', fontSize: '12px', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#4A5563', marginBottom: '0.5rem' }
  const tabBtn = (active: boolean) => ({ padding: '0.6rem 1.25rem', fontSize: '12px', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', border: 'none', cursor: 'pointer', backgroundColor: active ? '#0e1a2b' : 'transparent', color: active ? '#f7f4ee' : '#4A5563', borderBottom: active ? 'none' : '2px solid #e8e4de' })

  return (
    <AdminShell>
      <div style={{ padding: '2rem 2.5rem' }}>
        <h1 style={{ fontFamily: 'Georgia, serif', fontSize: '1.75rem', fontWeight: 700, color: '#0e1a2b', marginBottom: '1.5rem' }}>Newsletter</h1>

        {/* STATS */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', marginBottom: '2rem' }}>
          {[{ label: 'Total Subscribers', value: stats.total, color: '#0e1a2b' }, { label: 'Active', value: stats.active, color: '#2d7a3a' }, { label: 'Unsubscribed', value: stats.unsubscribed, color: '#9a9085' }].map(s => (
            <div key={s.label} style={{ backgroundColor: '#fff', border: '1px solid #e8e4de', padding: '1.25rem' }}>
              <p style={{ fontSize: '10px', fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', color: '#9a9085', marginBottom: '0.5rem' }}>{s.label}</p>
              <p style={{ fontSize: '2rem', fontWeight: 800, color: s.color, fontFamily: 'Georgia, serif', margin: 0 }}>{s.value}</p>
            </div>
          ))}
        </div>

        {/* TABS */}
        <div style={{ display: 'flex', borderBottom: '2px solid #e8e4de', marginBottom: '2rem' }}>
          <button style={tabBtn(tab === 'compose')} onClick={() => setTab('compose')}>Compose</button>
          <button style={tabBtn(tab === 'subscribers')} onClick={() => setTab('subscribers')}>Subscribers</button>
        </div>

        {/* COMPOSE TAB */}
        {tab === 'compose' && (
          <div style={{ maxWidth: '720px' }}>
            {sent && <div style={{ backgroundColor: '#e8f5ea', border: '1px solid #2d7a3a', padding: '1rem', marginBottom: '1.5rem', color: '#2d7a3a', fontWeight: 600 }}>Campaign sent successfully!</div>}
            <div style={{ backgroundColor: '#fff', border: '1px solid #e8e4de', padding: '1.5rem', marginBottom: '1.5rem' }}>
              <div style={{ marginBottom: '1.25rem' }}>
                <label style={lbl}>Subject Line</label>
                <input style={inp} value={subject} onChange={e => setSubject(e.target.value)} placeholder="This week on DudeMD..." />
              </div>
              <div style={{ marginBottom: '1.25rem' }}>
                <label style={lbl}>Email Body (HTML supported)</label>
                <textarea style={{ ...inp, minHeight: '320px', resize: 'vertical' }} value={body} onChange={e => setBody(e.target.value)} placeholder="Write your newsletter content here. HTML is supported." />
              </div>
              <div style={{ display: 'flex', gap: '1rem' }}>
                <button onClick={() => setPreview(!preview)} style={{ padding: '0.75rem 1.5rem', border: '1px solid #0e1a2b', backgroundColor: 'transparent', color: '#0e1a2b', fontWeight: 700, fontSize: '12px', letterSpacing: '0.08em', textTransform: 'uppercase', cursor: 'pointer' }}>
                  {preview ? 'Hide Preview' : 'Preview'}
                </button>
                <button onClick={handleSend} disabled={sending} style={{ padding: '0.75rem 1.5rem', backgroundColor: '#0e1a2b', color: '#f7f4ee', border: 'none', fontWeight: 700, fontSize: '12px', letterSpacing: '0.08em', textTransform: 'uppercase', cursor: 'pointer' }}>
                  {sending ? 'Sending...' : `Send to ${stats.active} Subscribers`}
                </button>
              </div>
            </div>
            {preview && body && (
              <div style={{ backgroundColor: '#fff', border: '1px solid #e8e4de', padding: '2rem' }}>
                <p style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#9a9085', marginBottom: '1rem' }}>Preview</p>
                <p style={{ fontSize: '18px', fontWeight: 700, color: '#0e1a2b', marginBottom: '1rem' }}>{subject || 'No subject'}</p>
                <div dangerouslySetInnerHTML={{ __html: body }} />
              </div>
            )}
          </div>
        )}

        {/* SUBSCRIBERS TAB */}
        {tab === 'subscribers' && (
          <div>
            <div style={{ backgroundColor: '#fff', border: '1px solid #e8e4de' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr', gap: '1rem', padding: '0.75rem 1.5rem', borderBottom: '1px solid #e8e4de', backgroundColor: '#f7f4ee' }}>
                {['Email', 'Source', 'Date', 'Actions'].map(h => <span key={h} style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#9a9085' }}>{h}</span>)}
              </div>
              {subscribers.length === 0 ? (
                <p style={{ padding: '2rem', color: '#9a9085', textAlign: 'center' }}>No subscribers yet.</p>
              ) : subscribers.map(s => (
                <div key={s.id} style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr', gap: '1rem', padding: '0.875rem 1.5rem', borderBottom: '1px solid #f0ede8', alignItems: 'center', opacity: s.unsubscribed ? 0.5 : 1 }}>
                  <span style={{ fontSize: '13px', color: '#0e1a2b' }}>{s.email}</span>
                  <span style={{ fontSize: '12px', color: '#4A5563' }}>{s.source || 'direct'}</span>
                  <span style={{ fontSize: '12px', color: '#9a9085' }}>{new Date(s.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    {!s.unsubscribed && <button onClick={() => handleUnsubscribe(s.id)} style={{ fontSize: '11px', fontWeight: 600, color: '#d4820a', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>Unsub</button>}
                    {s.unsubscribed && <span style={{ fontSize: '11px', color: '#9a9085' }}>Unsubscribed</span>}
                    <button onClick={() => handleDelete(s.id)} style={{ fontSize: '11px', fontWeight: 600, color: '#a32d2d', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>Delete</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </AdminShell>
  )
}
