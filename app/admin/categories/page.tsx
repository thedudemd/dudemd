// @ts-nocheck
'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase/client'
import AdminShell from '@/components/admin/AdminShell'

export default function CategoriesAdmin() {
  const [cats, setCats] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState<any>(null)
  const [saving, setSaving] = useState(false)
  const router = useRouter()

  useEffect(() => { load() }, [])

  async function load() {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) { router.push('/admin/login'); return }
    const { data } = await supabase.from('categories').select('*').order('parent_id', { nullsFirst: true }).order('sort_order').order('name')
    setCats(data || [])
    setLoading(false)
  }

  const parents = cats.filter(c => !c.parent_id)
  const getSubs = (parentId: string) => cats.filter(c => c.parent_id === parentId)

  function newItem(parentId = null) {
    setEditing({ name: '', slug: '', parent_id: parentId, sort_order: 0, enabled: true, indexable: true, description: '', cover_image_url: '', show_in_nav: false })
  }

  async function save() {
    if (!editing.name || !editing.slug) return alert('Name and slug required')
    setSaving(true)
    if (editing.id) {
      await supabase.from('categories').update({ name: editing.name, slug: editing.slug, parent_id: editing.parent_id || null, sort_order: editing.sort_order, enabled: editing.enabled, indexable: editing.indexable, description: editing.description, cover_image_url: editing.cover_image_url, show_in_nav: editing.show_in_nav }).eq('id', editing.id)
    } else {
      const { error: insertErr } = await supabase.from('categories').insert({ name: editing.name, slug: editing.slug, parent_id: editing.parent_id || null, sort_order: editing.sort_order, enabled: editing.enabled, indexable: editing.indexable, description: editing.description, cover_image_url: editing.cover_image_url, show_in_nav: editing.show_in_nav })
      if (insertErr) { alert('Error: ' + insertErr.message); setSaving(false); return }
    }
    setEditing(null)
    setSaving(false)
    load()
  }

  async function remove(id: string) {
    if (!confirm('Delete this category? Articles using it will not be deleted.')) return
    await supabase.from('categories').delete().eq('id', id)
    load()
  }

  const inp: any = { width: '100%', padding: '0.65rem', border: '1px solid #e8e4de', fontSize: '13px', outline: 'none', boxSizing: 'border-box', backgroundColor: '#fff' }
  const lbl: any = { display: 'block', fontSize: '10px', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#9a9085', marginBottom: '0.35rem' }

  return (
    <AdminShell>
      <div style={{ padding: '2rem 2.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <h1 style={{ fontFamily: 'Georgia, serif', fontSize: '1.75rem', fontWeight: 700, color: '#0e1a2b', margin: 0 }}>Categories</h1>
          <button onClick={() => newItem()} style={{ padding: '0.6rem 1.25rem', backgroundColor: '#0e1a2b', color: '#f7f4ee', border: 'none', fontWeight: 700, fontSize: '12px', letterSpacing: '0.08em', textTransform: 'uppercase', cursor: 'pointer' }}>+ New Category</button>
        </div>

        {loading ? <p style={{ color: '#9a9085' }}>Loading...</p> : (
          <div style={{ backgroundColor: '#fff', border: '1px solid #e8e4de' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr 120px', gap: '1rem', padding: '0.65rem 1.25rem', borderBottom: '1px solid #e8e4de', backgroundColor: '#f7f4ee' }}>
              {['Category', 'Slug', 'Status', 'SEO', ''].map(h => <span key={h} style={{ fontSize: '10px', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#9a9085' }}>{h}</span>)}
            </div>
            {parents.map(p => (
              <>
                <div key={p.id} style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr 120px', gap: '1rem', padding: '0.75rem 1.25rem', borderBottom: '1px solid #f0ede8', alignItems: 'center', backgroundColor: '#fafaf8' }}>
                  <span style={{ fontSize: '14px', fontWeight: 700, color: '#0e1a2b' }}>{p.name}</span>
                  <span style={{ fontSize: '11px', color: '#9a9085' }}>{p.slug}</span>
                  <span style={{ fontSize: '11px', fontWeight: 700, color: p.enabled ? '#2d7a3a' : '#9a9085' }}>{p.enabled ? 'Active' : 'Disabled'}</span>
                  <span style={{ fontSize: '11px', color: p.indexable ? '#4A5563' : '#a32d2d' }}>{p.indexable ? 'Indexed' : 'noindex'}</span>
                  <div style={{ display: 'flex', gap: '0.4rem' }}>
                    <button onClick={() => setEditing(p)} style={{ fontSize: '11px', fontWeight: 700, color: '#0e1a2b', background: 'none', border: '1px solid #0e1a2b', cursor: 'pointer', padding: '0.25rem 0.5rem' }}>Edit</button>
                    <button onClick={() => newItem(p.id)} style={{ fontSize: '11px', fontWeight: 700, color: '#c9b28f', background: 'none', border: '1px solid #c9b28f', cursor: 'pointer', padding: '0.25rem 0.5rem' }}>+ Sub</button>
                    <button onClick={() => remove(p.id)} style={{ fontSize: '11px', fontWeight: 700, color: '#a32d2d', background: 'none', border: 'none', cursor: 'pointer', padding: '0.25rem 0.25rem' }}>×</button>
                  </div>
                </div>
                {getSubs(p.id).map(s => (
                  <div key={s.id} style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr 120px', gap: '1rem', padding: '0.6rem 1.25rem', borderBottom: '1px solid #f0ede8', alignItems: 'center' }}>
                    <span style={{ fontSize: '13px', color: '#4A5563', paddingLeft: '1rem' }}>↳ {s.name}</span>
                    <span style={{ fontSize: '11px', color: '#9a9085' }}>{s.slug}</span>
                    <span style={{ fontSize: '11px', fontWeight: 700, color: s.enabled ? '#2d7a3a' : '#9a9085' }}>{s.enabled ? 'Active' : 'Disabled'}</span>
                    <span style={{ fontSize: '11px', color: s.indexable ? '#4A5563' : '#a32d2d' }}>{s.indexable ? 'Indexed' : 'noindex'}</span>
                    <div style={{ display: 'flex', gap: '0.4rem' }}>
                      <button onClick={() => setEditing(s)} style={{ fontSize: '11px', fontWeight: 700, color: '#0e1a2b', background: 'none', border: '1px solid #0e1a2b', cursor: 'pointer', padding: '0.25rem 0.5rem' }}>Edit</button>
                      <button onClick={() => remove(s.id)} style={{ fontSize: '11px', fontWeight: 700, color: '#a32d2d', background: 'none', border: 'none', cursor: 'pointer', padding: '0.25rem 0.25rem' }}>×</button>
                    </div>
                  </div>
                ))}
              </>
            ))}
          </div>
        )}

        {editing && (
          <div onClick={() => !saving && setEditing(null)} style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '2rem' }}>
            <div onClick={e => e.stopPropagation()} style={{ backgroundColor: '#fff', maxWidth: '540px', width: '100%', padding: '2rem', maxHeight: '90vh', overflowY: 'auto' }}>
              <h2 style={{ fontFamily: 'Georgia, serif', fontSize: '1.25rem', fontWeight: 700, color: '#0e1a2b', marginBottom: '1.25rem' }}>{editing.id ? 'Edit' : 'New'} {editing.parent_id ? 'Subcategory' : 'Category'}</h2>
              <div style={{ marginBottom: '0.875rem' }}><label style={lbl}>Name</label><input style={inp} value={editing.name} onChange={e => setEditing({ ...editing, name: e.target.value, slug: editing.id ? editing.slug : (editing.parent_id ? (cats.find(p=>p.id===editing.parent_id)?.slug||'') + '-' : '') + e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, '-') })} /></div>
              <div style={{ marginBottom: '0.875rem' }}><label style={lbl}>Slug</label><input style={inp} value={editing.slug} onChange={e => setEditing({ ...editing, slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '') })} /></div>
              <div style={{ marginBottom: '0.875rem' }}><label style={lbl}>Parent Category</label>
                <select style={inp} value={editing.parent_id || ''} onChange={e => setEditing({ ...editing, parent_id: e.target.value || null })}>
                  <option value="">— Top Level Category —</option>
                  {parents.filter(p => p.id !== editing.id).map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                </select>
              </div>
              <div style={{ marginBottom: '0.875rem' }}><label style={lbl}>Description (optional)</label><textarea style={{ ...inp, minHeight: 80, resize: 'vertical' }} value={editing.description || ''} onChange={e => setEditing({ ...editing, description: e.target.value })} /></div>
              <div style={{ marginBottom: '0.875rem' }}><label style={lbl}>Sort Order</label><input type="number" style={inp} value={editing.sort_order} onChange={e => setEditing({ ...editing, sort_order: parseInt(e.target.value) || 0 })} /></div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.25rem' }}>
                <div><label style={lbl}>Status</label>
                  <button type="button" onClick={() => setEditing({ ...editing, enabled: !editing.enabled })} style={{ width: '100%', padding: '0.65rem', border: '1px solid ' + (editing.enabled ? '#2d7a3a' : '#e8e4de'), backgroundColor: editing.enabled ? '#e8f5ea' : '#fff', color: editing.enabled ? '#2d7a3a' : '#9a9085', fontWeight: 700, fontSize: '12px', cursor: 'pointer' }}>{editing.enabled ? '✓ Active' : 'Disabled'}</button>
                  <button type="button" onClick={() => setEditing({ ...editing, show_in_nav: !editing.show_in_nav })} style={{ width: '100%', padding: '0.65rem', border: '1px solid ' + (editing.show_in_nav ? '#0e1a2b' : '#e8e4de'), backgroundColor: editing.show_in_nav ? '#2d7a3a' : '#fff', color: editing.show_in_nav ? '#fff' : '#9a9085', fontWeight: 700, fontSize: '12px', cursor: 'pointer' }}>{editing.show_in_nav ? '✓ Show in Nav' : 'Hidden from Nav'}</button>
                </div>
                <div><label style={lbl}>Search Engines</label>
                  <button type="button" onClick={() => setEditing({ ...editing, indexable: !editing.indexable })} style={{ width: '100%', padding: '0.65rem', border: '1px solid ' + (editing.indexable ? '#2d7a3a' : '#a32d2d'), backgroundColor: editing.indexable ? '#e8f5ea' : '#fdecea', color: editing.indexable ? '#2d7a3a' : '#a32d2d', fontWeight: 700, fontSize: '12px', cursor: 'pointer' }}>{editing.indexable ? '✓ Indexed' : '✗ noindex'}</button>
                </div>
              </div>
              <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
                <button onClick={() => setEditing(null)} disabled={saving} style={{ padding: '0.65rem 1.25rem', border: '1px solid #e8e4de', backgroundColor: '#fff', color: '#0e1a2b', fontWeight: 700, fontSize: '12px', cursor: 'pointer' }}>Cancel</button>
                <button onClick={save} disabled={saving} style={{ padding: '0.65rem 1.25rem', backgroundColor: '#0e1a2b', color: '#f7f4ee', border: 'none', fontWeight: 700, fontSize: '12px', cursor: 'pointer' }}>{saving ? 'Saving...' : 'Save'}</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminShell>
  )
}
