// @ts-nocheck
'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase/client'
import AdminShell from '@/components/admin/AdminShell'

export default function PagesAdmin() {
  const [pages, setPages] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState<any>(null)
  const [creating, setCreating] = useState(false)
  const [saving, setSaving] = useState(false)
  const router = useRouter()

  useEffect(() => { load() }, [])

  async function load() {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) { router.push('/admin/login'); return }
    const { data } = await supabase.from('static_pages').select('*').order('sort_order').order('title')
    setPages(data || [])
    setLoading(false)
  }

  function newPage(parentId = null) {
    setEditing({
      title: '',
      slug: '',
      content: '',
      parent_id: parentId,
      placement: 'hidden',
      published: true,
      indexable: true,
      meta_description: '',
    })
    setCreating(true)
  }

  function slugify(s: string) {
    return s.toLowerCase().trim().replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-').replace(/-+/g, '-')
  }

  async function save() {
    if (!editing.title || !editing.slug) return alert('Title and slug required')
    setSaving(true)
    if (creating) {
      const { error } = await supabase.from('static_pages').insert({ ...editing, updated_at: new Date().toISOString() })
      if (error) { alert('Error: ' + error.message); setSaving(false); return }
    } else {
      const { error } = await supabase.from('static_pages').update({ ...editing, updated_at: new Date().toISOString() }).eq('id', editing.id)
      if (error) { alert('Error: ' + error.message); setSaving(false); return }
    }
    setEditing(null)
    setCreating(false)
    setSaving(false)
    load()
  }

  async function deletePage(id: string) {
    if (!confirm('Delete this page and all its subpages? This cannot be undone.')) return
    await supabase.from('static_pages').delete().eq('id', id)
    load()
  }

  const topLevel = pages.filter(p => !p.parent_id)
  const getChildren = (parentId: string) => pages.filter(p => p.parent_id === parentId)

  const inp: any = { width: '100%', padding: '0.75rem', border: '1px solid #e8e4de', fontSize: '14px', outline: 'none', boxSizing: 'border-box', backgroundColor: '#fff', fontFamily: 'inherit' }
  const lbl: any = { display: 'block', fontSize: '11px', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#9a9085', marginBottom: '0.5rem' }

  function PageRow({ page, depth = 0 }: { page: any, depth?: number }) {
    const children = getChildren(page.id)
    return (
      <>
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr 140px', gap: '1rem', padding: '0.875rem 1.5rem', borderBottom: '1px solid #f0ede8', alignItems: 'center' }}>
          <div style={{ paddingLeft: `${depth * 1.5}rem`, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            {depth > 0 && <span style={{ color: '#c9b28f' }}>↳</span>}
            <div>
              <p style={{ fontSize: '14px', fontWeight: 600, color: '#0e1a2b', margin: 0 }}>{page.title}</p>
              <p style={{ fontSize: '11px', color: '#9a9085', margin: 0 }}>/{page.slug}</p>
            </div>
          </div>
          <span style={{ fontSize: '11px', fontWeight: 700, color: page.published ? '#2d7a3a' : '#9a9085', textTransform: 'uppercase' }}>{page.published ? 'Published' : 'Hidden'}</span>
          <span style={{ fontSize: '11px', color: '#4A5563', textTransform: 'capitalize' }}>{page.placement}</span>
          <span style={{ fontSize: '11px', color: page.indexable ? '#4A5563' : '#a32d2d' }}>{page.indexable ? 'Indexed' : 'noindex'}</span>
          <div style={{ display: 'flex', gap: '0.4rem' }}>
            <button onClick={() => setEditing(page)} style={{ fontSize: '11px', fontWeight: 700, color: '#0e1a2b', background: 'none', border: '1px solid #0e1a2b', cursor: 'pointer', padding: '0.3rem 0.6rem' }}>Edit</button>
            <button onClick={() => newPage(page.id)} style={{ fontSize: '11px', fontWeight: 700, color: '#c9b28f', background: 'none', border: '1px solid #c9b28f', cursor: 'pointer', padding: '0.3rem 0.6rem' }}>+ Sub</button>
            <button onClick={() => deletePage(page.id)} style={{ fontSize: '11px', fontWeight: 700, color: '#a32d2d', background: 'none', border: 'none', cursor: 'pointer', padding: '0.3rem 0.4rem' }}>×</button>
          </div>
        </div>
        {children.map(c => <PageRow key={c.id} page={c} depth={depth + 1} />)}
      </>
    )
  }

  return (
    <AdminShell>
      <div style={{ padding: '2rem 2.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <h1 style={{ fontFamily: 'Georgia, serif', fontSize: '1.75rem', fontWeight: 700, color: '#0e1a2b', margin: 0 }}>Pages</h1>
          <button onClick={() => newPage()} style={{ padding: '0.6rem 1.25rem', backgroundColor: '#0e1a2b', color: '#f7f4ee', border: 'none', fontWeight: 700, fontSize: '12px', letterSpacing: '0.08em', textTransform: 'uppercase', cursor: 'pointer' }}>+ New Page</button>
        </div>

        {loading ? <p style={{ color: '#9a9085' }}>Loading...</p> : pages.length === 0 ? (
          <div style={{ backgroundColor: '#fff', border: '1px solid #e8e4de', padding: '3rem', textAlign: 'center' }}>
            <p style={{ color: '#9a9085', marginBottom: '1rem' }}>No pages yet. Create your first one.</p>
            <button onClick={() => newPage()} style={{ padding: '0.6rem 1.25rem', backgroundColor: '#0e1a2b', color: '#f7f4ee', border: 'none', fontWeight: 700, fontSize: '12px', cursor: 'pointer' }}>+ New Page</button>
          </div>
        ) : (
          <div style={{ backgroundColor: '#fff', border: '1px solid #e8e4de' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr 140px', gap: '1rem', padding: '0.75rem 1.5rem', borderBottom: '1px solid #e8e4de', backgroundColor: '#f7f4ee' }}>
              {['Page', 'Status', 'Placement', 'SEO', ''].map(h => <span key={h} style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#9a9085' }}>{h}</span>)}
            </div>
            {topLevel.map(p => <PageRow key={p.id} page={p} />)}
          </div>
        )}

        {/* EDITOR MODAL */}
        {editing && (
          <div onClick={() => !saving && setEditing(null)} style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '2rem', overflowY: 'auto' }}>
            <div onClick={e => e.stopPropagation()} style={{ backgroundColor: '#fff', maxWidth: '760px', width: '100%', padding: '2rem', position: 'relative', maxHeight: '90vh', overflowY: 'auto' }}>
              <h2 style={{ fontFamily: 'Georgia, serif', fontSize: '1.5rem', fontWeight: 700, color: '#0e1a2b', marginBottom: '1.5rem' }}>{creating ? 'New Page' : 'Edit Page'}</h2>

              <div style={{ marginBottom: '1rem' }}>
                <label style={lbl}>Title</label>
                <input style={inp} value={editing.title} onChange={e => { const t = e.target.value; setEditing({ ...editing, title: t, slug: creating || !editing.slug ? slugify(t) : editing.slug }) }} placeholder="About Us" />
              </div>

              <div style={{ marginBottom: '1rem' }}>
                <label style={lbl}>URL Slug</label>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span style={{ fontSize: '13px', color: '#9a9085' }}>dudemd.com/</span>
                  <input style={inp} value={editing.slug} onChange={e => setEditing({ ...editing, slug: slugify(e.target.value) })} placeholder="about-us" />
                </div>
              </div>

              <div style={{ marginBottom: '1rem' }}>
                <label style={lbl}>Parent Page (optional)</label>
                <select style={inp} value={editing.parent_id || ''} onChange={e => setEditing({ ...editing, parent_id: e.target.value || null })}>
                  <option value="">— Top Level Page —</option>
                  {pages.filter(p => p.id !== editing.id).map(p => <option key={p.id} value={p.id}>{p.title}</option>)}
                </select>
              </div>

              <div style={{ marginBottom: '1rem' }}>
                <label style={lbl}>Meta Description (SEO)</label>
                <input style={inp} value={editing.meta_description || ''} onChange={e => setEditing({ ...editing, meta_description: e.target.value })} placeholder="Brief description for search engines (150-160 chars)" maxLength={160} />
              </div>

              <div style={{ marginBottom: '1rem' }}>
                <label style={lbl}>Content (HTML supported)</label>
                <textarea style={{ ...inp, minHeight: 280, resize: 'vertical', fontFamily: 'monospace' }} value={editing.content || ''} onChange={e => setEditing({ ...editing, content: e.target.value })} placeholder="<h1>About Us</h1><p>Write your content here. HTML tags work.</p>" />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', marginBottom: '1.5rem' }}>
                <div>
                  <label style={lbl}>Placement</label>
                  <select style={inp} value={editing.placement} onChange={e => setEditing({ ...editing, placement: e.target.value })}>
                    <option value="hidden">Hidden (direct URL only)</option>
                    <option value="footer">Footer</option>
                    <option value="nav">Top Navigation</option>
                  </select>
                </div>
                <div>
                  <label style={lbl}>Published</label>
                  <button onClick={() => setEditing({ ...editing, published: !editing.published })} style={{ width: '100%', padding: '0.75rem', border: '1px solid ' + (editing.published ? '#2d7a3a' : '#e8e4de'), backgroundColor: editing.published ? '#e8f5ea' : '#fff', color: editing.published ? '#2d7a3a' : '#9a9085', fontWeight: 700, fontSize: '13px', cursor: 'pointer' }}>{editing.published ? '✓ Live' : 'Coming Soon'}</button>
                </div>
                <div>
                  <label style={lbl}>Search Engine</label>
                  <button onClick={() => setEditing({ ...editing, indexable: !editing.indexable })} style={{ width: '100%', padding: '0.75rem', border: '1px solid ' + (editing.indexable ? '#2d7a3a' : '#a32d2d'), backgroundColor: editing.indexable ? '#e8f5ea' : '#fdecea', color: editing.indexable ? '#2d7a3a' : '#a32d2d', fontWeight: 700, fontSize: '13px', cursor: 'pointer' }}>{editing.indexable ? '✓ Indexed' : '✗ noindex'}</button>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
                <button onClick={() => { setEditing(null); setCreating(false) }} disabled={saving} style={{ padding: '0.75rem 1.5rem', border: '1px solid #e8e4de', backgroundColor: '#fff', color: '#0e1a2b', fontWeight: 700, fontSize: '12px', cursor: 'pointer' }}>Cancel</button>
                <button onClick={save} disabled={saving} style={{ padding: '0.75rem 1.5rem', backgroundColor: '#0e1a2b', color: '#f7f4ee', border: 'none', fontWeight: 700, fontSize: '12px', letterSpacing: '0.08em', textTransform: 'uppercase', cursor: 'pointer' }}>{saving ? 'Saving...' : 'Save Page'}</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminShell>
  )
}
