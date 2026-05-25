'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase/client'
import AdminShell from '@/components/admin/AdminShell'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export default function AdminDashboard() {
  const router = useRouter()
  const [stats, setStats] = useState({ total: 0, published: 0, draft: 0, review: 0 })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const { data: articles } = await supabase.from('articles').select('*')
      const all = articles || []
      setStats({
        total: all.length,
        published: all.filter((a: any) => a.status === 'published').length,
        draft: all.filter((a: any) => a.status === 'draft').length,
        review: all.filter((a: any) => a.status === 'review').length,
      })
      setLoading(false)
    }
    load()
  }, [])

  if (loading) return <AdminShell><p style={{ padding: '2rem', color: '#9a9085' }}>Loading...</p></AdminShell>

  return (
    <AdminShell>
      <div style={{ padding: '2rem 2.5rem' }}>
        <h1 style={{ fontFamily: 'Georgia, serif', fontSize: '1.75rem', fontWeight: 700, color: '#0e1a2b', marginBottom: '2rem' }}>Dashboard</h1>
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem', marginBottom: '2rem' }}>
          <div style={{ backgroundColor: '#fff', border: '1px solid #e8e4de', padding: '1.5rem' }}>
            <p style={{ fontSize: '10px', fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', color: '#9a9085', marginBottom: '0.5rem' }}>Total Articles</p>
            <p style={{ fontSize: '2rem', fontWeight: 800, color: '#0e1a2b', fontFamily: 'Georgia, serif', margin: 0 }}>{stats.total}</p>
          </div>
          <div style={{ backgroundColor: '#fff', border: '1px solid #e8e4de', padding: '1.5rem' }}>
            <p style={{ fontSize: '10px', fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', color: '#9a9085', marginBottom: '0.5rem' }}>Published</p>
            <p style={{ fontSize: '2rem', fontWeight: 800, color: '#2d7a3a', fontFamily: 'Georgia, serif', margin: 0 }}>{stats.published}</p>
          </div>
          <div style={{ backgroundColor: '#fff', border: '1px solid #e8e4de', padding: '1.5rem' }}>
            <p style={{ fontSize: '10px', fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', color: '#9a9085', marginBottom: '0.5rem' }}>In Review</p>
            <p style={{ fontSize: '2rem', fontWeight: 800, color: '#d4820a', fontFamily: 'Georgia, serif', margin: 0 }}>{stats.review}</p>
          </div>
          <div style={{ backgroundColor: '#fff', border: '1px solid #e8e4de', padding: '1.5rem' }}>
            <p style={{ fontSize: '10px', fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', color: '#9a9085', marginBottom: '0.5rem' }}>Drafts</p>
            <p style={{ fontSize: '2rem', fontWeight: 800, color: '#0e1a2b', fontFamily: 'Georgia, serif', margin: 0 }}>{stats.draft}</p>
          </div>
        </div>

        <div style={{ backgroundColor: '#0e1a2b', padding: '1.5rem' }}>
          <h2 style={{ fontFamily: 'Georgia, serif', fontSize: '1rem', fontWeight: 700, color: '#f7f4ee', margin: '0 0 1rem' }}>Quick Actions</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <Link href="/admin/articles/new" style={{ display: 'block', padding: '0.6rem 1rem', textDecoration: 'none', fontSize: '12px', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', textAlign: 'center', backgroundColor: '#c9b28f', color: '#0e1a2b' }}>+ New Article</Link>
            <Link href="/admin/media" style={{ display: 'block', padding: '0.6rem 1rem', textDecoration: 'none', fontSize: '12px', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', textAlign: 'center', backgroundColor: 'rgba(247,244,238,0.06)', color: 'rgba(247,244,238,0.55)', border: '1px solid rgba(247,244,238,0.08)' }}>Upload Media</Link>
            <Link href="/admin/flags" style={{ display: 'block', padding: '0.6rem 1rem', textDecoration: 'none', fontSize: '12px', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', textAlign: 'center', backgroundColor: 'rgba(247,244,238,0.06)', color: 'rgba(247,244,238,0.55)', border: '1px solid rgba(247,244,238,0.08)' }}>Feature Flags</Link>
          </div>
        </div>
      </div>
    </AdminShell>
  )
}
