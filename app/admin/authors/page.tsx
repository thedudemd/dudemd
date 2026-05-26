'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase/client'

export default function AuthorsPage() {
  const [authors, setAuthors] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    async function load() {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) { router.push('/admin/login'); return }
      const { data } = await supabase.from('authors').select('*').order('name')
      setAuthors(data || [])
      setLoading(false)
    }
    load()
  }, [])

  async function handleDelete(id: string) {
    if (!confirm('Delete this author?')) return
    await supabase.from('authors').delete().eq('id', id)
    setAuthors(authors.filter(a => a.id !== id))
  }

  const lbl: any = { fontSize: '11px', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#9a9085' }

  return (
    <div style={{ padding: '2rem', backgroundColor: '#f7f4ee', minHeight: '100vh' }}>
      <div style={{ maxWidth: '900px', margin: '0 auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
          <div>
            <Link href="/admin" style={{ fontSize: '12px', color: '#9a9085', textDecoration: 'none' }}>← Dashboard</Link>
            <h1 style={{ fontSize: '1.75rem', fontWeight: 700, color: '#0e1a2b', marginTop: '0.5rem' }}>Authors</h1>
          </div>
          <Link href="/admin/authors/new" style={{ padding: '0.75rem 1.5rem', backgroundColor: '#0e1a2b', color: '#f7f4ee', textDecoration: 'none', fontWeight: 700, fontSize: '13px', letterSpacing: '0.08em', textTransform: 'uppercase' }}>+ Add Author</Link>
        </div>

        {loading ? <p>Loading...</p> : authors.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '4rem', backgroundColor: '#fff', border: '1px solid #ede8df' }}>
            <p style={{ color: '#9a9085', marginBottom: '1rem' }}>No authors yet.</p>
            <Link href="/admin/authors/new" style={{ color: '#0e1a2b', fontWeight: 700 }}>Add your first author →</Link>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {authors.map(a => (
              <div key={a.id} style={{ backgroundColor: '#fff', border: '1px solid #ede8df', padding: '1.25rem 1.5rem', display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
                {a.avatar_url ? (
                  <img src={a.avatar_url} alt={a.name} style={{ width: 52, height: 52, borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }} />
                ) : (
                  <div style={{ width: 52, height: 52, borderRadius: '50%', backgroundColor: '#c9b28f', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <span style={{ fontSize: 20, fontWeight: 700, color: '#0e1a2b' }}>{a.name?.charAt(0)}</span>
                  </div>
                )}
                <div style={{ flex: 1 }}>
                  <p style={{ fontWeight: 700, color: '#0e1a2b', marginBottom: '0.25rem' }}>{a.name}</p>
                  {a.title && <p style={{ fontSize: '13px', color: '#4A5563' }}>{a.title}</p>}
                  {a.bio && <p style={{ fontSize: '12px', color: '#9a9085', marginTop: '0.25rem' }}>{a.bio.substring(0, 100)}{a.bio.length > 100 ? '...' : ''}</p>}
                </div>
                <div style={{ display: 'flex', gap: '0.75rem', flexShrink: 0 }}>
                  <Link href={`/admin/authors/edit?id=${a.id}`} style={{ padding: '0.5rem 1rem', border: '1px solid #0e1a2b', color: '#0e1a2b', textDecoration: 'none', fontSize: '12px', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase' }}>Edit</Link>
                  <button onClick={() => handleDelete(a.id)} style={{ padding: '0.5rem 1rem', border: '1px solid #a32d2d', color: '#a32d2d', backgroundColor: 'transparent', fontSize: '12px', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', cursor: 'pointer' }}>Delete</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
