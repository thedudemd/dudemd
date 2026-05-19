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
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [deleteInput, setDeleteInput] = useState('')

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

  async function handleDelete() {
    if (!deleteId) return
    await supabase.from('articles').delete().eq('id', deleteId)
    setArticles(articles.filter(a => a.id !== deleteId))
    setDeleteId(null)
    setDeleteInput('')
  }

  const isAdmin = role === 'super_admin' || role === 'editorial_chief_admin'
  const isEditor = role === 'editor' || isAdmin
  const filtered = filter === 'all' ? articles : articles.filter(a => a.status === filter)

  if (loading) return <div style={{ minHeight: '100vh', backgroundColor: '#0e1a2b', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><p style={{ color: '#f7f4ee' }}>Loading...</p></div>

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f7f4ee' }}>

      {/* DELETE CONFIRMATION MODAL */}
      {deleteId && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.6)', zIndex: 1000, display: 'flex', alignI
