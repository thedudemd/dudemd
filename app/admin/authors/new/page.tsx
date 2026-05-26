'use client'
import { useEffect, useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase/client'

function AuthorFormInner() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const editId = searchParams.get('id')
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({
    name: '', slug: '', title: '', bio: '', avatar_url: '',
    twitter: '', instagram: '', linkedin: '', website: '', meta_description: ''
  })

  useEffect(() => {
    async function load() {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) { router.push('/admin/login'); return }
      if (editId) {
        const { data } = await supabase.from('authors').select('*').eq('id', editId).single()
        if (data) setForm({
          name: data.name || '', slug: data.slug || '', title: data.title || '',
          bio: data.bio || '', avatar_url: data.avatar_url || '',
          twitter: data.twitter || '', instagram: data.instagram || '',
          linkedin: data.linkedin || '', website: data.website || '',
          meta_description: data.meta_description || ''
        })
      }
    }
    load()
  }, [editId])

  const generateSlug = (name: string) => name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    if (editId) {
      const { error } = await supabase.from('authors').update(form).eq('id', editId)
      if (error) { alert(error.message); setSaving(false); return }
    } else {
      const { error } = await supabase.from('authors').insert(form)
      if (error) { alert(error.message); setSaving(false); return }
    }
    router.push('/admin/authors')
  }

  const inp: any = { width: '100%', padding: '0.75rem', border: '1px solid #ede8df', fontSize: '14px', outline: 'none', boxSizing: 'border-box', backgroundColor: '#fff', fontFamily: 'inherit' }
  const lbl: any = { display: 'block', fontSize: '12px', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#4A5563', marginBottom: '0.5rem' }
  const section: any = { backgroundColor: '#fff', border: '1px solid #ede8df', padding: '1.5rem', marginBottom: '1.5rem' }

  return (
    <div style={{ padding: '2rem', backgroundColor: '#f7f4ee', minHeight: '100vh' }}>
      <div style={{ maxWidth: '700px', margin: '0 auto' }}>
        <div style={{ marginBottom: '2rem' }}>
          <Link href="/admin/authors" style={{ fontSize: '12px', color: '#9a9085', textDecoration: 'none' }}>← Authors</Link>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 700, color: '#0e1a2b', marginTop: '0.5rem' }}>{editId ? 'Edit Author' : 'New Author'}</h1>
        </div>
        <form onSubmit={handleSave}>
          <div style={section}>
            <div style={{ marginBottom: '1rem' }}>
              <label style={lbl}>Full Name</label>
              <input style={inp} value={form.name} onChange={e => setForm({...form, name: e.target.value, slug: generateSlug(e.target.value)})} required />
            </div>
            <div style={{ marginBottom: '1rem' }}>
              <label style={lbl}>Slug</label>
              <input style={inp} value={form.slug} onChange={e => setForm({...form, slug: e.target.value})} required />
            </div>
            <div style={{ marginBottom: '1rem' }}>
              <label style={lbl}>Title / Role</label>
              <input style={inp} placeholder="e.g. Senior Health Editor" value={form.title} onChange={e => setForm({...form, title: e.target.value})} />
            </div>
            <div style={{ marginBottom: '1rem' }}>
              <label style={lbl}>Bio</label>
              <textarea style={{...inp, minHeight: '120px', resize: 'vertical'}} value={form.bio} onChange={e => setForm({...form, bio: e.target.value})} />
            </div>
            <div>
              <label style={lbl}>Avatar URL</label>
              <input style={inp} placeholder="https://..." value={form.avatar_url} onChange={e => setForm({...form, avatar_url: e.target.value})} />
              {form.avatar_url && <img src={form.avatar_url} alt="preview" style={{ width: 80, height: 80, borderRadius: '50%', objectFit: 'cover', marginTop: '0.75rem' }} />}
            </div>
          </div>

          <div style={section}>
            <p style={{ fontSize: '13px', fontWeight: 700, color: '#0e1a2b', marginBottom: '1rem', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Social Links</p>
            <div style={{ marginBottom: '1rem' }}>
              <label style={lbl}>Twitter / X</label>
              <input style={inp} placeholder="https://x.com/username" value={form.twitter} onChange={e => setForm({...form, twitter: e.target.value})} />
            </div>
            <div style={{ marginBottom: '1rem' }}>
              <label style={lbl}>Instagram</label>
              <input style={inp} placeholder="https://instagram.com/username" value={form.instagram} onChange={e => setForm({...form, instagram: e.target.value})} />
            </div>
            <div style={{ marginBottom: '1rem' }}>
              <label style={lbl}>LinkedIn</label>
              <input style={inp} placeholder="https://linkedin.com/in/username" value={form.linkedin} onChange={e => setForm({...form, linkedin: e.target.value})} />
            </div>
            <div>
              <label style={lbl}>Website</label>
              <input style={inp} placeholder="https://..." value={form.website} onChange={e => setForm({...form, website: e.target.value})} />
            </div>
          </div>

          <div style={section}>
            <p style={{ fontSize: '13px', fontWeight: 700, color: '#0e1a2b', marginBottom: '1rem', textTransform: 'uppercase', letterSpacing: '0.08em' }}>SEO</p>
            <label style={lbl}>Meta Description</label>
            <textarea style={{...inp, minHeight: '80px', resize: 'vertical'}} placeholder="Short description for search engines" value={form.meta_description} onChange={e => setForm({...form, meta_description: e.target.value})} />
          </div>

          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
            <Link href="/admin/authors" style={{ padding: '0.875rem 1.5rem', border: '1px solid #0e1a2b', color: '#0e1a2b', textDecoration: 'none', fontWeight: 700, fontSize: '13px', letterSpacing: '0.08em', textTransform: 'uppercase' }}>Cancel</Link>
            <button type="submit" disabled={saving} style={{ padding: '0.875rem 1.5rem', backgroundColor: '#0e1a2b', color: '#f7f4ee', fontWeight: 700, fontSize: '13px', letterSpacing: '0.08em', textTransform: 'uppercase', border: 'none', cursor: 'pointer' }}>
              {saving ? 'Saving...' : editId ? 'Update Author' : 'Create Author'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default function AuthorFormPage() {
  return <Suspense><AuthorFormInner /></Suspense>
}
