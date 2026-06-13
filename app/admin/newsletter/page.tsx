// @ts-nocheck
'use client'
import { useEffect, useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase/client'
import AdminShell from '@/components/admin/AdminShell'
import EmailEditor from 'react-email-editor'

export default function NewsletterAdmin() {
  const [tab, setTab] = useState('compose')
  const [subscribers, setSubscribers] = useState([])
  const [categories, setCategories] = useState([])
  const [categoryMap, setCategoryMap] = useState({})
  const [subject, setSubject] = useState('')
  const [sending, setSending] = useState(false)
  const [sent, setSent] = useState(false)
  const [stats, setStats] = useState({ total: 0, active: 0, unsubscribed: 0 })
  const [selectedSegment, setSelectedSegment] = useState('all')
  const [audienceCount, setAudienceCount] = useState(0)
  const [filterCategory, setFilterCategory] = useState('all')
  const emailEditorRef = useRef(null)
  const router = useRouter()

  useEffect(() => {
    async function load() {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) { router.push('/admin/login'); return }

      const { data: cats } = await supabase.from('categories').select('id, name, slug').order('name')
      const catMap = {}
      ;(cats || []).forEach(c => { catMap[c.id] = c })
      setCategories(cats || [])
      setCategoryMap(catMap)

      const { data } = await supabase.from('newsletter_subscribers').select('*').order('created_at', { ascending: false })
      const all = data || []
      setSubscribers(all)
      const activeCount = all.filter(s => s.status === 'active').length
      setStats({ total: all.length, active: activeCount, unsubscribed: all.length - activeCount })
      setAudienceCount(activeCount)
    }
    load()
  }, [])

  async function handleSend() {
    if (!subject) return alert('Subject required')
    if (!emailEditorRef.current) return
    emailEditorRef.current.editor.exportHtml(async ({ html }) => {
      if (!confirm(`Send to ${audienceCount} subscribers?`)) return
      setSending(true)
      const res = await fetch('/api/newsletter/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ subject, body: html, segment: selectedSegment })
      })
      setSending(false)
      if (res.ok) { setSent(true); setSubject('') }
      else { const err = await res.json(); alert('Send failed: ' + JSON.stringify(err)) }
    })
  }

  async function handleSegmentChange(seg) {
    setSelectedSegment(seg)
    if (seg === 'all') {
      setAudienceCount(stats.active)
      return
    }
    const { data, count } = await supabase
      .from('newsletter_subscribers')
      .select('id', { count: 'exact', head: true })
      .eq('status', 'active')
      .contains('subscribed_categories', [seg])
    setAudienceCount(count || 0)
  }

  const tabBtn = (active) => ({ padding: '0.6rem 1.25rem', fontSize: '12px', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', border: 'none', cursor: 'pointer', backgroundColor: active ? '#0e1a2b' : 'transparent', color: active ? '#f7f4ee' : '#4A5563', borderBottom: active ? 'none' : '2px solid #e8e4de' })
  const inp = { width: '100%', padding: '0.75rem', border: '1px solid #e8e4de', fontSize: '14px', outline: 'none', boxSizing: 'border-box', backgroundColor: '#fff', fontFamily: 'inherit' }

  const filteredSubscribers = filterCategory === 'all'
    ? subscribers
    : subscribers.filter(s => Array.isArray(s.subscribed_categories) && s.subscribed_categories.includes(filterCategory))

  return (
    <AdminShell>
      <div style={{ padding: '2rem 2.5rem' }}>
        <h1 style={{ fontFamily: 'Georgia, serif', fontSize: '1.75rem', fontWeight: 700, color: '#0e1a2b', marginBottom: '1.5rem' }}>Newsletter</h1>

        {/* STATS */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem', marginBottom: '2rem' }}>
          {[
            { label: 'Total Subscribers', value: stats.total, color: '#0e1a2b' },
            { label: 'Active', value: stats.active, color: '#2d7a3a' },
            { label: 'Unsubscribed', value: stats.unsubscribed, color: '#9a9085' },
            { label: 'Current Audience', value: audienceCount, color: '#c9b28f' }
          ].map(s => (
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
          <div>
            {sent && <div style={{ backgroundColor: '#e8f5ea', border: '1px solid #2d7a3a', padding: '1rem', marginBottom: '1.5rem', color: '#2d7a3a', fontWeight: 600 }}>Campaign sent successfully!</div>}

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#9a9085', marginBottom: '0.5rem' }}>Subject Line</label>
                <input style={inp} value={subject} onChange={e => setSubject(e.target.value)} placeholder="This week on DudeMD..." />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#9a9085', marginBottom: '0.5rem' }}>Send To</label>
                <select style={{ ...inp }} value={selectedSegment} onChange={e => handleSegmentChange(e.target.value)}>
                  <option value="all">All Subscribers ({stats.active})</option>
                  {categories.map(cat => <option key={cat.id} value={cat.id}>{cat.name} subscribers</option>)}
                </select>
              </div>
            </div>

            {/* DRAG AND DROP EMAIL EDITOR */}
            <div style={{ border: '1px solid #e8e4de', marginBottom: '1.5rem' }}>
              <div style={{ padding: '0.75rem 1rem', backgroundColor: '#f7f4ee', borderBottom: '1px solid #e8e4de' }}>
                <p style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#9a9085', margin: 0 }}>Email Designer — Drag & Drop</p>
              </div>
              <EmailEditor
                ref={emailEditorRef}
                minHeight={600}
                options={{
                  appearance: {
                    theme: 'light',
                    panels: { tools: { dock: 'left' } }
                  },
                  features: { preview: true },
                  fonts: { showDefaultFonts: true },
                  customCSS: [],
                }}
              />
            </div>

            <button onClick={handleSend} disabled={sending} style={{ padding: '0.875rem 2rem', backgroundColor: '#0e1a2b', color: '#f7f4ee', border: 'none', fontWeight: 700, fontSize: '13px', letterSpacing: '0.08em', textTransform: 'uppercase', cursor: 'pointer' }}>
              {sending ? 'Sending...' : `Send to ${audienceCount} Subscribers`}
            </button>
          </div>
        )}

        {/* SUBSCRIBERS TAB */}
        {tab === 'subscribers' && (
          <div>
            <div style={{ marginBottom: '1rem' }}>
              <select style={{ ...inp, width: '240px' }} value={filterCategory} onChange={e => setFilterCategory(e.target.value)}>
                <option value="all">All Categories</option>
                {categories.map(cat => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
              </select>
            </div>
            <div style={{ backgroundColor: '#fff', border: '1px solid #e8e4de' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '2fr 1.5fr 1fr 1fr 1fr', gap: '1rem', padding: '0.75rem 1.5rem', borderBottom: '1px solid #e8e4de', backgroundColor: '#f7f4ee' }}>
                {['Email', 'Categories', 'Source', 'Date', 'Status'].map(h => <span key={h} style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#9a9085' }}>{h}</span>)}
              </div>
              {filteredSubscribers.length === 0 ? (
                <p style={{ padding: '2rem', color: '#9a9085', textAlign: 'center' }}>No subscribers yet.</p>
              ) : filteredSubscribers.map(s => (
                <div key={s.id} style={{ display: 'grid', gridTemplateColumns: '2fr 1.5fr 1fr 1fr 1fr', gap: '1rem', padding: '0.875rem 1.5rem', borderBottom: '1px solid #f0ede8', alignItems: 'center', opacity: s.status === 'active' ? 1 : 0.5 }}>
                  <span style={{ fontSize: '13px', color: '#0e1a2b' }}>{s.email}{s.user_id && <span style={{ display: 'inline-block', width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#c9b28f', marginLeft: '6px' }} />}</span>
                  <span style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                    {(s.subscribed_categories || []).map(cid => categoryMap[cid] && (
                      <span key={cid} style={{ fontSize: '10px', fontWeight: 700, padding: '2px 8px', borderRadius: '999px', backgroundColor: '#c9b28f33', color: '#8a7550' }}>{categoryMap[cid].name}</span>
                    ))}
                  </span>
                  <span style={{ fontSize: '12px', color: '#4A5563' }}>{s.source || 'direct'}</span>
                  <span style={{ fontSize: '12px', color: '#9a9085' }}>{new Date(s.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                  <span style={{ fontSize: '11px', fontWeight: 700, color: s.status === 'active' ? '#2d7a3a' : '#9a9085' }}>{s.status === 'active' ? 'Active' : 'Unsubscribed'}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </AdminShell>
  )
}
