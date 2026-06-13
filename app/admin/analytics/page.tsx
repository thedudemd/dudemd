// @ts-nocheck
'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase/client'
import AdminShell from '@/components/admin/AdminShell'

export default function AnalyticsAdmin() {
  const [range, setRange] = useState('30')
  const [loading, setLoading] = useState(true)
  const [data, setData] = useState<any>({ events: [], articles: [], subs: [] })
  const router = useRouter()

  useEffect(() => {
    async function load() {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) { router.push('/admin/login'); return }
      const since = range === 'all' ? '2020-01-01' : new Date(Date.now() - Number(range) * 86400000).toISOString()
      const { data: events } = await supabase.from('user_events').select('*').gte('created_at', since)
      const { data: articles } = await supabase.from('articles').select('slug, title, categories!articles_category_id_fkey(name, slug)').eq('published', true)
      const { data: subs } = await supabase.from('newsletter_subscribers').select('created_at').gte('created_at', since)
      setData({ events: events || [], articles: articles || [], subs: subs || [] })
      setLoading(false)
    }
    load()
  }, [range])

  // Compute stats
  const views = data.events.filter(e => e.event_type === 'view')
  const scrolls = data.events.filter(e => e.event_type?.startsWith('scroll_'))
  const times = data.events.filter(e => e.event_type === 'time_on_page')
  const shares = data.events.filter(e => e.event_type === 'share')
  const totalReaders = new Set(data.events.map(e => e.user_id || e.session_id).filter(Boolean)).size
  const avgTime = times.length ? Math.round(times.reduce((a, e) => a + (e.metadata?.seconds || 0), 0) / times.length) : 0
  const scrollCount100 = data.events.filter(e => e.event_type === 'scroll_100').length

  // Top articles by views
  const articleViews: Record<string, number> = {}
  views.forEach(e => { if (e.article_slug) articleViews[e.article_slug] = (articleViews[e.article_slug] || 0) + 1 })
  const topArticles = Object.entries(articleViews).sort((a, b) => b[1] - a[1]).slice(0, 10)

  // Top categories
  const catViews: Record<string, number> = {}
  views.forEach(e => { if (e.category_slug) catViews[e.category_slug] = (catViews[e.category_slug] || 0) + 1 })
  const topCategories = Object.entries(catViews).sort((a, b) => b[1] - a[1]).slice(0, 8)

  // Shares by platform
  const platforms: Record<string, number> = {}
  shares.forEach(e => { const p = e.metadata?.platform || 'unknown'; platforms[p] = (platforms[p] || 0) + 1 })

  const card: any = { backgroundColor: '#fff', border: '1px solid #e8e4de', padding: '1.5rem' }
  const sectionTitle: any = { fontSize: '11px', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#9a9085', marginBottom: '1rem' }

  return (
    <AdminShell>
      <div style={{ padding: '2rem 2.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <h1 style={{ fontFamily: 'Georgia, serif', fontSize: '1.75rem', fontWeight: 700, color: '#0e1a2b', margin: 0 }}>Analytics</h1>
          <select value={range} onChange={e => setRange(e.target.value)} style={{ padding: '0.5rem 0.75rem', border: '1px solid #e8e4de', fontSize: '13px', backgroundColor: '#fff' }}>
            <option value="7">Last 7 days</option>
            <option value="30">Last 30 days</option>
            <option value="90">Last 90 days</option>
            <option value="all">All time</option>
          </select>
        </div>

        {loading ? <p style={{ color: '#9a9085' }}>Loading...</p> : (
          <>
            {/* STATS */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '1rem', marginBottom: '2rem' }}>
              {[
                { label: 'Total Views', value: views.length, color: '#0e1a2b' },
                { label: 'Unique Readers', value: totalReaders, color: '#c9b28f' },
                { label: 'Avg Time on Page', value: avgTime + 's', color: '#4A5563' },
                { label: 'Read to End', value: scrollCount100, color: '#2d7a3a' },
                { label: 'New Subscribers', value: data.subs.length, color: '#a36a2d' }
              ].map(s => (
                <div key={s.label} style={card}>
                  <p style={{ fontSize: '10px', fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', color: '#9a9085', marginBottom: '0.5rem' }}>{s.label}</p>
                  <p style={{ fontSize: '1.75rem', fontWeight: 800, color: s.color, fontFamily: 'Georgia, serif', margin: 0 }}>{s.value}</p>
                </div>
              ))}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1.5rem', marginBottom: '1.5rem' }}>
              {/* TOP ARTICLES */}
              <div style={card}>
                <p style={sectionTitle}>Top Articles</p>
                {topArticles.length === 0 ? <p style={{ fontSize: '13px', color: '#9a9085' }}>No data yet.</p> : topArticles.map(([slug, count], i) => {
                  const article = data.articles.find(a => a.slug === slug)
                  return (
                    <div key={slug} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.65rem 0', borderBottom: i < topArticles.length - 1 ? '1px solid #f0ede8' : 'none' }}>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p style={{ fontSize: '13px', color: '#0e1a2b', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{article?.title || slug}</p>
                        <p style={{ fontSize: '11px', color: '#9a9085', margin: 0, textTransform: 'capitalize' }}>{article?.categories?.name || ''}</p>
                      </div>
                      <span style={{ fontSize: '14px', fontWeight: 700, color: '#c9b28f', marginLeft: '1rem' }}>{count}</span>
                    </div>
                  )
                })}
              </div>

              {/* TOP CATEGORIES */}
              <div style={card}>
                <p style={sectionTitle}>Top Categories</p>
                {topCategories.length === 0 ? <p style={{ fontSize: '13px', color: '#9a9085' }}>No data yet.</p> : topCategories.map(([cat, count], i) => (
                  <div key={cat} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.65rem 0', borderBottom: i < topCategories.length - 1 ? '1px solid #f0ede8' : 'none' }}>
                    <span style={{ fontSize: '13px', color: '#0e1a2b', textTransform: 'capitalize' }}>{cat}</span>
                    <span style={{ fontSize: '14px', fontWeight: 700, color: '#c9b28f' }}>{count}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* SHARES + SCROLL */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
              <div style={card}>
                <p style={sectionTitle}>Shares by Platform</p>
                {Object.keys(platforms).length === 0 ? <p style={{ fontSize: '13px', color: '#9a9085' }}>No shares yet.</p> : Object.entries(platforms).sort((a, b) => b[1] - a[1]).map(([platform, count]) => (
                  <div key={platform} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.65rem 0', borderBottom: '1px solid #f0ede8' }}>
                    <span style={{ fontSize: '13px', color: '#0e1a2b', textTransform: 'capitalize' }}>{platform.replace('_', ' ')}</span>
                    <span style={{ fontSize: '14px', fontWeight: 700, color: '#c9b28f' }}>{count}</span>
                  </div>
                ))}
              </div>

              <div style={card}>
                <p style={sectionTitle}>Scroll Depth Distribution</p>
                {['25', '50', '75', '100'].map(d => {
                  const count = data.events.filter(e => e.event_type === `scroll_${d}`).length
                  const pct = views.length ? Math.round((count / views.length) * 100) : 0
                  return (
                    <div key={d} style={{ marginBottom: '0.75rem' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '0.25rem' }}>
                        <span style={{ color: '#4A5563' }}>{d}% scroll</span>
                        <span style={{ color: '#0e1a2b', fontWeight: 700 }}>{count} ({pct}%)</span>
                      </div>
                      <div style={{ height: 6, backgroundColor: '#f0ede8', overflow: 'hidden' }}>
                        <div style={{ width: `${pct}%`, height: '100%', backgroundColor: '#c9b28f' }} />
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </>
        )}
      </div>
    </AdminShell>
  )
}
