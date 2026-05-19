'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase/client'

export default function AdminDashboard() {
  const router = useRouter()
  const [articles, setArticles] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<any>(null)
  const [role, setRole] = useState<string>('writer')
  const [filter, setFilter] = useState('all')

  useEffect(() => {
    async function init() {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) { router.push('/admin/login'); return }
      setUser(session.user)
      const { data: profile } = await supabase.from('profiles').select('role').eq('id', session.user.id).single()
      setRole(profile?.role || 'writer')
      const query = supabase.from('articles').select('*, authors(name), categories(name)').order('created_at', { ascending: false })
      const { data } = profile?.role === 'writer' || profile?.role === 'contributor'
        ? await query.eq('author_id', session.user.id)
        : await query
      setArticles(data || [])
      setLoading(false)
    }
    init()
  }, [])

  async function handleLogout() {
    await supabase.auth.signOut()
    router.push('/admin/login')
  }

  async function handleApprove(id: string) {
    await supabase.from('articles').update({ status: 'published', published: true, published_at: new Date().toISOString() }).eq('id', id)
    setArticles(articles.map(a => a.id === id ? { ...a, status: 'published', published: true } : a))
  }

  async function handleReject(id: string) {
    await supabase.from('articles').update({ status: 'draft' }).eq('id', id)
    setArticles(articles.map(a => a.id === id ? { ...a, status: 'draft' } : a))
  }

  async function handleDelete(id: string) {
    if (!confirm('Delete this article?')) return
    await supabase.from('articles').delete().eq('id', id)
    setArticles(articles.filter(a => a.id !== id))
  }

  const isAdmin = role === 'super_admin' || role === 'editorial_chief_admin'
  const isEditor = role === 'editor' || isAdmin
  const filtered = filter === 'all' ? articles : articles.filter(a => a.status === filter)

  if (loading) return <div style={{ minHeight: '100vh', backgroundColor: '#0e1a2b', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><p style={{ color: '#f7f4ee' }}>Loading...</p></div>

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f7f4ee' }}>
      <header style={{ backgroundColor: '#0e1a2b', padding: '1rem 0' }}>
        <div className="container-content" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <img src="/dude md.svg" alt="DudeMD" style={{ height: '32px', width: 'auto', filter: 'brightness(0) saturate(100%) invert(78%) sepia(28%) saturate(500%) hue-rotate(5deg) brightness(95%) contrast(90%)' }} />
            <span style={{ fontSize: '12px', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#c9b28f' }}>Editorial Studio</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
            <span style={{ fontSize: '11px', color: 'rgba(247,244,238,0.4)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>{role.replace(/_/g, ' ')}</span>
            <span style={{ fontSize: '12px', color: 'rgba(247,244,238,0.6)' }}>{user?.email}</span>
            <Link href="/admin/articles/new" style={{ fontSize: '12px', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#0e1a2b', backgroundColor: '#c9b28f', padding: '0.5rem 1rem', textDecoration: 'none' }}>+ New Article</Link>
            <Link href="/admin/media" style={{ fontSize: '12px', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'rgba(247,244,238,0.6)', textDecoration: 'none' }}>Media</Link>
            <button onClick={handleLogout} style={{ fontSize: '12px', color: 'rgba(247,244,238,0.6)', background: 'none', border: 'none', cursor: 'pointer' }}>Sign Out</button>
          </div>
        </div>
      </header>

      <div className="container-content" style={{ paddingTop: '2rem', paddingBottom: '4rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <h1 style={{ fontFamily: 'Georgia, serif', fontSize: '1.5rem', fontWeight: 700, color: '#0e1a2b' }}>Articles</h1>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            {['all', 'draft', 'review', 'published'].map(f => (
              <button key={f} onClick={() => setFilter(f)} style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', padding: '0.35rem 0.75rem', border: '1px solid #ede8df', cursor: 'pointer', backgroundColor: filter === f ? '#0e1a2b' : '#fff', color: filter === f ? '#f7f4ee' : '#9a9085' }}>{f}</button>
            ))}
          </div>
        </div>

        <div style={{ backgroundColor: '#fff', border: '1px solid #ede8df' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr 1fr', gap: '1rem', padding: '0.75rem 1.5rem', borderBottom: '2px solid #ede8df', backgroundColor: '#f7f4ee' }}>
            {['Title', 'Category', 'Author', 'Status', 'Actions'].map(h => <span key={h} style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#9a9085' }}>{h}</span>)}
          </div>
          {filtered.length === 0 ? (
            <div style={{ padding: '3rem', textAlign: 'center' }}>
              <p style={{ color: '#9a9085', fontSize: '14px', marginBottom: '1rem' }}>No articles yet.</p>
              <Link href="/admin/articles/new" style={{ fontSize: '13px', fontWeight: 700, color: '#0e1a2b', backgroundColor: '#c9b28f', padding: '0.625rem 1.25rem', textDecoration: 'none' }}>Write your first article</Link>
            </div>
          ) : filtered.map((a, i) => (
            <div key={a.id} style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr 1fr', gap: '1rem', padding: '1rem 1.5rem', borderBottom: i < filtered.length - 1 ? '1px solid #ede8df' : 'none', alignItems: 'center' }}>
              <div>
                <p style={{ fontSize: '14px', fontWeight: 600, color: '#0e1a2b', margin: 0, marginBottom: '0.25rem' }}>{a.title}</p>
                <p style={{ fontSize: '12px', color: '#9a9085', margin: 0 }}>{a.slug}</p>
              </div>
              <span style={{ fontSize: '13px', color: '#4A5563' }}>{a.categories?.name}</span>
              <span style={{ fontSize: '13px', color: '#4A5563' }}>{a.authors?.name}</span>
              <span style={{ fontSize: '11px', fontWeight: 700, color: a.status === 'published' ? '#2d7a3a' : a.status === 'review' ? '#d4820a' : '#9a9085', backgroundColor: a.status === 'published' ? '#e8f5ea' : a.status === 'review' ? '#fef3e2' : '#f0ede8', padding: '0.25rem 0.5rem', display: 'inline-block' }}>
                {a.status === 'published' ? 'Published' : a.status === 'review' ? 'In Review' : 'Draft'}
              </span>
              <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                <Link href={`/admin/articles/${a.slug}`} style={{ fontSize: '12px', fontWeight: 600, color: '#0e1a2b', textDecoration: 'none' }}>Edit</Link>
                <Link href={`/articles/${a.slug}`} target="_blank" style={{ fontSize: '12px', fontWeight: 600, color: '#c9b28f', textDecoration: 'none' }}>View</Link>
                {isEditor && a.status === 'review' && (
                  <button onClick={() => handleApprove(a.id)} style={{ fontSize: '12px', fontWeight: 600, color: '#2d7a3a', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>Approve</button>
                )}
                {isEditor && a.status === 'review' && (
                  <button onClick={() => handleReject(a.id)} style={{ fontSize: '12px', fontWeight: 600, color: '#c0392b', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>Reject</button>
                )}
                {isAdmin && (
                  <button onClick={() => handleDelete(a.id)} style={{ fontSize: '12px', fontWeight: 600, color: '#c0392b', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>Delete</button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
