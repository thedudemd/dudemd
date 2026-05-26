// @ts-nocheck
'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase/client'
import AdminShell from '@/components/admin/AdminShell'

export default function AudienceAdmin() {
  const [tab, setTab] = useState('readers')
  const [readers, setReaders] = useState<any[]>([])
  const [segments, setSegments] = useState<any[]>([])
  const [selectedReader, setSelectedReader] = useState<any>(null)
  const [readerEvents, setReaderEvents] = useState<any[]>([])
  const [filter, setFilter] = useState({ category: 'all', engagement: 'all' })
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    async function load() {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) { router.push('/admin/login'); return }
      const { data: profiles } = await supabase.from('profiles').select('*').order('created_at', { ascending: false })
      const { data: scores } = await supabase.from('user_scores').select('*')
      const { data: events } = await supabase.from('user_events').select('user_id, event_type, created_at')
      const scoresMap = new Map((scores || []).map(s => [s.user_id, s.category_scores || {}]))
      const eventsMap = new Map()
      ;(events || []).forEach(e => { if (!e.user_id) return; const arr = eventsMap.get(e.user_id) || []; arr.push(e); eventsMap.set(e.user_id, arr) })
      const enriched = (profiles || []).map(p => {
        const cats = scoresMap.get(p.id) || {}
        const totalScore = Object.values(cats).reduce((a: any, b: any) => a + b, 0) as number
        const topCat = Object.entries(cats).sort((a: any, b: any) => b[1] - a[1])[0]
        const userEvents = eventsMap.get(p.id) || []
        return { ...p, total_score: totalScore, top_category: topCat?.[0] || null, category_scores: cats, event_count: userEvents.length, engagement: totalScore > 30 ? 'high' : totalScore > 10 ? 'medium' : 'low' }
      })
      setReaders(enriched)
      const catCounts: Record<string, number> = {}
      enriched.forEach(r => { if (r.top_category) catCounts[r.top_category] = (catCounts[r.top_category] || 0) + 1 })
      const segs: any[] = Object.entries(catCounts).map(([cat, count]) => ({ name: `${cat.charAt(0).toUpperCase() + cat.slice(1)} Readers`, key: cat, count }))
      segs.push({ name: 'Highly Engaged', key: '__high__', count: enriched.filter(r => r.engagement === 'high').length })
      segs.push({ name: 'Newsletter Subscribers', key: '__newsletter__', count: enriched.filter(r => r.newsletter_subscribed !== false).length })
      setSegments(segs)
      setLoading(false)
    }
    load()
  }, [])

  async function viewReader(reader: any) {
    setSelectedReader(reader)
    const { data: events } = await supabase.from('user_events').select('*').eq('user_id', reader.id).order('created_at', { ascending: false }).limit(50)
    setReaderEvents(events || [])
  }

  const filtered = readers.filter(r => {
    if (filter.category !== 'all' && r.top_category !== filter.category) return false
    if (filter.engagement !== 'all' && r.engagement !== filter.engagement) return false
    return true
  })

  const tabBtn = (active: boolean) => ({ padding: '0.6rem 1.25rem', fontSize: '12px', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase' as const, border: 'none', cursor: 'pointer', backgroundColor: active ? '#0e1a2b' : 'transparent', color: active ? '#f7f4ee' : '#4A5563', borderBottom: active ? 'none' : '2px solid #e8e4de' })
  const allCategories = Array.from(new Set(readers.map(r => r.top_category).filter(Boolean)))

  return (
    <AdminShell>
      <div style={{ padding: '2rem 2.5rem' }}>
        <h1 style={{ fontFamily: 'Georgia, serif', fontSize: '1.75rem', fontWeight: 700, color: '#0e1a2b', marginBottom: '1.5rem' }}>Audience</h1>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem', marginBottom: '2rem' }}>
          {[{ label: 'Total Readers', value: readers.length, color: '#0e1a2b' }, { label: 'Highly Engaged', value: readers.filter(r => r.engagement === 'high').length, color: '#c9b28f' }, { label: 'Newsletter Subs', value: readers.filter(r => r.newsletter_subscribed !== false).length, color: '#2d7a3a' }, { label: 'Active Segments', value: segments.length, color: '#4A5563' }].map(s => (
            <div key={s.label} style={{ backgroundColor: '#fff', border: '1px solid #e8e4de', padding: '1.25rem' }}>
              <p style={{ fontSize: '10px', fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', color: '#9a9085', marginBottom: '0.5rem' }}>{s.label}</p>
              <p style={{ fontSize: '2rem', fontWeight: 800, color: s.color, fontFamily: 'Georgia, serif', margin: 0 }}>{s.value}</p>
            </div>
          ))}
        </div>
        <div style={{ display: 'flex', borderBottom: '2px solid #e8e4de', marginBottom: '2rem' }}>
          <button style={tabBtn(tab === 'readers')} onClick={() => setTab('readers')}>Readers</button>
          <button style={tabBtn(tab === 'segments')} onClick={() => setTab('segments')}>Segments</button>
        </div>
        {loading && <p style={{ color: '#9a9085' }}>Loading...</p>}
        {tab === 'readers' && !loading && (
          <div>
            <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem' }}>
              <select value={filter.category} onChange={e => setFilter({ ...filter, category: e.target.value })} style={{ padding: '0.5rem 0.75rem', border: '1px solid #e8e4de', fontSize: '13px', backgroundColor: '#fff' }}>
                <option value="all">All Categories</option>
                {allCategories.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
              <select value={filter.engagement} onChange={e => setFilter({ ...filter, engagement: e.target.value })} style={{ padding: '0.5rem 0.75rem', border: '1px solid #e8e4de', fontSize: '13px', backgroundColor: '#fff' }}>
                <option value="all">All Engagement</option>
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>
              <p style={{ fontSize: '12px', color: '#9a9085', marginLeft: 'auto', alignSelf: 'center' }}>{filtered.length} readers</p>
            </div>
            <div style={{ backgroundColor: '#fff', border: '1px solid #e8e4de' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr 1fr 80px', gap: '1rem', padding: '0.75rem 1.5rem', borderBottom: '1px solid #e8e4de', backgroundColor: '#f7f4ee' }}>
                {['Reader', 'Top Category', 'Score', 'Events', 'Engagement', ''].map(h => <span key={h} style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#9a9085' }}>{h}</span>)}
              </div>
              {filtered.length === 0 ? <p style={{ padding: '2rem', color: '#9a9085', textAlign: 'center' }}>No readers match these filters.</p> : filtered.map(r => (
                <div key={r.id} style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr 1fr 80px', gap: '1rem', padding: '0.875rem 1.5rem', borderBottom: '1px solid #f0ede8', alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    {r.avatar_url ? <img src={r.avatar_url} style={{ width: 32, height: 32, borderRadius: '50%', objectFit: 'cover' }} /> : <div style={{ width: 32, height: 32, borderRadius: '50%', backgroundColor: '#0e1a2b', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#c9b28f', fontWeight: 700, fontSize: '13px' }}>{(r.full_name?.charAt(0) || '?').toUpperCase()}</div>}
                    <div>
                      <p style={{ fontSize: '13px', fontWeight: 600, color: '#0e1a2b', margin: 0 }}>{r.full_name || 'Anonymous'}</p>
                      <p style={{ fontSize: '11px', color: '#9a9085', margin: 0 }}>{r.email}</p>
                    </div>
                  </div>
                  <span style={{ fontSize: '12px', color: '#4A5563', textTransform: 'capitalize' }}>{r.top_category || '—'}</span>
                  <span style={{ fontSize: '13px', fontWeight: 700, color: '#0e1a2b' }}>{r.total_score}</span>
                  <span style={{ fontSize: '12px', color: '#9a9085' }}>{r.event_count}</span>
                  <span style={{ fontSize: '11px', fontWeight: 700, color: r.engagement === 'high' ? '#c9b28f' : r.engagement === 'medium' ? '#4A5563' : '#9a9085', textTransform: 'uppercase' }}>{r.engagement}</span>
                  <button onClick={() => viewReader(r)} style={{ fontSize: '11px', fontWeight: 700, color: '#0e1a2b', background: 'none', border: '1px solid #0e1a2b', cursor: 'pointer', padding: '0.3rem 0.6rem' }}>View</button>
                </div>
              ))}
            </div>
          </div>
        )}
        {tab === 'segments' && !loading && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1rem' }}>
            {segments.map(seg => (
              <div key={seg.key} style={{ backgroundColor: '#fff', border: '1px solid #e8e4de', padding: '1.5rem' }}>
                <p style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#9a9085', marginBottom: '0.5rem' }}>Segment</p>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#0e1a2b', marginBottom: '0.5rem', fontFamily: 'Georgia, serif' }}>{seg.name}</h3>
                <p style={{ fontSize: '2rem', fontWeight: 800, color: '#c9b28f', fontFamily: 'Georgia, serif', margin: '0.5rem 0' }}>{seg.count}</p>
                <p style={{ fontSize: '12px', color: '#9a9085', margin: 0 }}>readers in this segment</p>
                <button onClick={() => router.push('/admin/newsletter')} style={{ marginTop: '1rem', width: '100%', padding: '0.6rem', backgroundColor: '#0e1a2b', color: '#f7f4ee', border: 'none', fontSize: '11px', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', cursor: 'pointer' }}>Send Newsletter →</button>
              </div>
            ))}
          </div>
        )}
        {selectedReader && (
          <div onClick={() => setSelectedReader(null)} style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '2rem' }}>
            <div onClick={e => e.stopPropagation()} style={{ backgroundColor: '#fff', maxWidth: '640px', width: '100%', maxHeight: '85vh', overflowY: 'auto', padding: '2rem', position: 'relative' }}>
              <button onClick={() => setSelectedReader(null)} style={{ position: 'absolute', top: '1rem', right: '1rem', background: 'none', border: 'none', fontSize: '24px', cursor: 'pointer', color: '#9a9085' }}>×</button>
              <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', marginBottom: '1.5rem' }}>
                {selectedReader.avatar_url ? <img src={selectedReader.avatar_url} style={{ width: 60, height: 60, borderRadius: '50%', objectFit: 'cover' }} /> : <div style={{ width: 60, height: 60, borderRadius: '50%', backgroundColor: '#0e1a2b', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#c9b28f', fontWeight: 700, fontSize: '20px' }}>{(selectedReader.full_name?.charAt(0) || '?').toUpperCase()}</div>}
                <div>
                  <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#0e1a2b', margin: 0 }}>{selectedReader.full_name || 'Anonymous'}</h2>
                  <p style={{ fontSize: '13px', color: '#9a9085', margin: 0 }}>{selectedReader.email}</p>
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', marginBottom: '1.5rem' }}>
                <div style={{ padding: '1rem', backgroundColor: '#f7f4ee' }}>
                  <p style={{ fontSize: '10px', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#9a9085', margin: 0 }}>Score</p>
                  <p style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0e1a2b', margin: '0.25rem 0 0', fontFamily: 'Georgia, serif' }}>{selectedReader.total_score}</p>
                </div>
                <div style={{ padding: '1rem', backgroundColor: '#f7f4ee' }}>
                  <p style={{ fontSize: '10px', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#9a9085', margin: 0 }}>Events</p>
                  <p style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0e1a2b', margin: '0.25rem 0 0', fontFamily: 'Georgia, serif' }}>{selectedReader.event_count}</p>
                </div>
                <div style={{ padding: '1rem', backgroundColor: '#f7f4ee' }}>
                  <p style={{ fontSize: '10px', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#9a9085', margin: 0 }}>Engagement</p>
                  <p style={{ fontSize: '1.2rem', fontWeight: 800, color: '#c9b28f', margin: '0.25rem 0 0', fontFamily: 'Georgia, serif', textTransform: 'uppercase' }}>{selectedReader.engagement}</p>
                </div>
              </div>
              {Object.keys(selectedReader.category_scores).length > 0 && (
                <div style={{ marginBottom: '1.5rem' }}>
                  <p style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#9a9085', marginBottom: '0.75rem' }}>Category Interest</p>
                  {Object.entries(selectedReader.category_scores).sort((a: any, b: any) => b[1] - a[1]).map(([cat, score]: any) => (
                    <div key={cat} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem 0', borderBottom: '1px solid #f0ede8' }}>
                      <span style={{ fontSize: '13px', textTransform: 'capitalize', color: '#0e1a2b' }}>{cat}</span>
                      <span style={{ fontSize: '13px', fontWeight: 700, color: '#c9b28f' }}>{score}</span>
                    </div>
                  ))}
                </div>
              )}
              <div>
                <p style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#9a9085', marginBottom: '0.75rem' }}>Recent Activity</p>
                {readerEvents.length === 0 ? <p style={{ fontSize: '13px', color: '#9a9085' }}>No activity yet.</p> : readerEvents.slice(0, 15).map((e, i) => (
                  <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem 0', borderBottom: '1px solid #f0ede8', fontSize: '12px' }}>
                    <span style={{ color: '#0e1a2b' }}>{e.event_type} {e.article_slug ? `· ${e.article_slug}` : ''}</span>
                    <span style={{ color: '#9a9085' }}>{new Date(e.created_at).toLocaleDateString()}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminShell>
  )
}
