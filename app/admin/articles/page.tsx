'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase/client'
import AdminShell from '@/components/admin/AdminShell'

export default function ArticlesPage() {
  const router = useRouter()
  const [articles, setArticles] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [deleteInput, setDeleteInput] = useState('')

  useEffect(() => {
    supabase.from('articles').select('*, authors(name), categories(name)').order('created_at', { ascending: false }).then(({ data }) => {
      setArticles(data || [])
      setLoading(false)
    })
  }, [])

  const filtered = filter === 'all' ? articles : articles.filter(a => a.status === filter)

  async function handleApprove(id: string) {
    await supabase.from('articles').update({ status: 'published', published: true, published_at: new Date().toISOString() }).eq('id', id)
    setArticles(articles.map(a => a.id === id ? { ...a, status: 'published', published: true } : a))
  }

  async function handleReject(id: string) {
    await supabase.from('articles').update({ status: 'draft' }).eq('id', id)
    setArticles(articles.map(a => a.id === id ? { ...a, status: 'draft' } : a))
  }

  async function handleDelete() {
    if (!deleteId) return
    await supabase.from('articles').delete().eq('id', deleteId)
    setArticles(articles.filter(a => a.id !== deleteId))
    setDeleteId(null)
    setDeleteInput('')
  }

  return (
    <AdminShell>
      {deleteId && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.6)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ backgroundColor: '#fff', padding: '2rem', width: '100%', maxWidth: '420px', margin: '1rem' }}>
            <p style={{ fontSize: '16px', fontWeight: 700, color: '#0e1a2b', marginBottom: '0.75rem' }}>Delete Article?</p>
            <p style={{ fontSize: '13px', color: '#4A5563', lineHeight: 1.6, marginBottom: '1.25rem' }}>This is permanent. Type <strong>DELETE</strong> to confirm.</p>
            <input value={deleteInput} onChange={e => setDeleteInput(e.target.value)} placeholder="Type DELETE to confirm" style={{ width: '100%', padding: '0.75rem', border: '1px solid #ede8df', fontSize: '14px', outline: 'none', boxSizing: 'border-box', marginBottom: '1rem', fontFamily: 'inherit' }} />
            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <button onClick={() => { setDeleteId(null); setDeleteInput('') }} style={{ flex: 1, padding: '0.75rem', backgroundColor: 'transparent', border: '1px solid #ede8df', cursor: 'pointer', fontSize: '13px', fontWeight: 600 }}>Cancel</button>
              <button onClick={handleDelete} disabled={deleteInput !== 'DELETE'} style={{ flex: 1, padding: '0.75rem', backgroundColor: deleteInput === 'DELETE' ? '#c0392b' : '#f0ede8', color: deleteInput === 'DELETE' ? '#fff' : '#9a9085', border: 'none', cursor: deleteInput === 'DELETE' ? 'pointer' : 'not-allowed', fontSize: '13px', fontWeight: 700 }}>Delete Forever</button>
            </div>
          </div>
        </div>
      )}

      <div style={{ padding: '2rem 2.5rem', maxWidth: '1400px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
          <div>
            <h1 style={{ fontFamily: 'Georgia, serif', fontSize: '1.75rem', fontWeight: 700, color: '#0e1a2b', margin: 0, marginBottom: '0.25rem' }}>Articles</h1>
            <p style={{ fontSize: '13px', color: '#9a9085', margin: 0 }}>{articles.length} total</p>
          </div>
          <Link href="/admin/articles/new" style={{ fontSize: '12px', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#0e1a2b', backgroundColor: '#c9b28f', padding: '0.625rem 1.25rem', textDecoration: 'none' }}>+ New Article</Link>
        </div>

        <div style={{ display: 'flex', gap: '0.375rem', marginBottom: '1.25rem' }}>
          {['all', 'draft', 'review', 'published'].map(f => (
            <button key={f} onClick={() => setFilter(f)} style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', padding: '0.4rem 0.875rem', border: '1px solid #e8e4de', cursor: 'pointer', backgroundColor: filter === f ? '#0e1a2b' : '#fff', color: filter === f ? '#f7f4ee' : '#9a9085' }}>
              {f === 'all' ? `All (${articles.length})` : f === 'draft' ? `Draft (${articles.filter(a => a.status === 'draft').length})` : f === 'review' ? `Review (${articles.filter(a => a.status === 'review').length})` : `Published (${articles.filter(a => a.status === 'published').length})`}
            </button>
          ))}
        </div>

        <div style={{ backgroundColor: '#fff', border: '1px solid #e8e4de' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr 1fr', gap: '1rem', padding: '0.75rem 1.5rem', borderBottom: '2px solid #e8e4de', backgroundColor: '#f7f4ee' }}>
            {['Title', 'Category', 'Author', 'Status', 'Actions'].map(h => (
              <span key={h} style={{ fontSize: '10px', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#9a9085' }}>{h}</span>
            ))}
          </div>
          {loading ? (
            <div style={{ padding: '3rem', textAlign: 'center' }}><p style={{ color: '#9a9085' }}>Loading...</p></div>
          ) : filtered.length === 0 ? (
            <div style={{ padding: '3rem', textAlign: 'center' }}>
              <p style={{ color: '#9a9085', fontSize: '14px', marginBottom: '1rem' }}>No articles found.</p>
              <Link href="/admin/articles/new" style={{ fontSize: '13px', fontWeight: 700, color: '#0e1a2b', backgroundColor: '#c9b28f', padding: '0.625rem 1.25rem', textDecoration: 'none' }}>Write your first article</Link>
            </div>
          ) : filtered.map((a, i) => (
            <div key={a.id} style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr 1fr', gap: '1rem', padding: '1rem 1.5rem', borderBottom: i < filtered.length - 1 ? '1px solid #f0ede8' : 'none', alignItems: 'center' }}>
              <div>
                <p style={{ fontSize: '13px', fontWeight: 600, color: '#0e1a2b', margin: 0, marginBottom: '0.2rem' }}>{a.title}</p>
                <p style={{ fontSize: '11px', color: '#9a9085', margin: 0 }}>{a.slug}</p>
              </div>
              <span style={{ fontSize: '12px', color: '#4A5563' }}>{a.categories?.name}</span>
              <span style={{ fontSize: '12px', color: '#4A5563' }}>{a.authors?.name}</span>
              <span style={{ fontSize: '10px', fontWeight: 700, color: a.status === 'published' ? '#2d7a3a' : a.status === 'review' ? '#d4820a' : '#9a9085', backgroundColor: a.status === 'published' ? '#e8f5ea' : a.status === 'review' ? '#fef3e2' : '#f0ede8', padding: '0.25rem 0.5rem', display: 'inline-block', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                {a.status === 'published' ? 'Published' : a.status === 'review' ? 'In Review' : 'Draft'}
              </span>
              <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                <Link href={`/admin/articles/${a.slug}`} style={{ fontSize: '12px', fontWeight: 600, color: '#0e1a2b', textDecoration: 'none' }}>Edit</Link>
                <a href={`/articles/${a.slug}`} target="_blank" style={{ fontSize: '12px', fontWeight: 600, color: '#c9b28f', textDecoration: 'none' }}>View</a>
                <button onClick={() => handleApprove(a.id)} style={{ fontSize: '12px', fontWeight: 600, color: '#2d7a3a', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>Approve</button>
                <button onClick={() => { setDeleteId(a.id); setDeleteInput('') }} style={{ fontSize: '12px', fontWeight: 600, color: '#c0392b', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>Delete</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </AdminShell>
  )
}
