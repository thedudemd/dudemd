// @ts-nocheck
'use client'
import { useEffect, useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase/client'
import AdminShell from '@/components/admin/AdminShell'
import EmailEditor from 'react-email-editor'

export default function OptinDesignerAdmin() {
  const [designs, setDesigns] = useState<any[]>([])
  const [categories, setCategories] = useState<any[]>([])
  const [activeId, setActiveId] = useState<string | null>(null)
  const [name, setName] = useState('')
  const [targetCategory, setTargetCategory] = useState('')
  const [enabled, setEnabled] = useState(false)
  const [showOnHomepage, setShowOnHomepage] = useState(false)
  const [displayType, setDisplayType] = useState('popup')
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [editorReady, setEditorReady] = useState(false)
  const [showNewModal, setShowNewModal] = useState(false)
  const [newName, setNewName] = useState('')
  const [newCategory, setNewCategory] = useState('')
  const emailEditorRef = useRef(null)
  const router = useRouter()

  useEffect(() => {
    async function load() {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) { router.push('/admin/login'); return }
      const { data: d } = await supabase.from('optin_designs').select('*').order('name')
      setDesigns(d || [])
      const { data: c } = await supabase.from('categories').select('id, name').order('name')
      setCategories(c || [])
    }
    load()
  }, [])

  function openDesign(id: string) {
    setActiveId(id)
    setSaved(false)
    const d = designs.find(x => x.id === id)
    setName(d?.name || '')
    setTargetCategory(d?.target_category || '')
    setEnabled(d?.enabled || false)
    setShowOnHomepage(d?.show_on_homepage || false)
    setDisplayType(d?.display_type || 'popup')
    setEditorReady(false)
  }

  function onEditorReady() {
    setEditorReady(true)
    const d = designs.find(x => x.id === activeId)
    if (d?.design && emailEditorRef.current) {
      emailEditorRef.current.editor.loadDesign(d.design)
    }
  }

  async function handleSave() {
    if (!activeId || !emailEditorRef.current) return
    emailEditorRef.current.editor.exportHtml(async ({ design, html }) => {
      setSaving(true)
      const { error } = await supabase.from('optin_designs').update({
        name, target_category: targetCategory || null, enabled, show_on_homepage: showOnHomepage, display_type: displayType, design, html
      }).eq('id', activeId)
      setSaving(false)
      if (error) { alert('Error: ' + error.message); return }
      setSaved(true)
      setDesigns(prev => prev.map(d => d.id === activeId ? { ...d, name, target_category: targetCategory || null, enabled, show_on_homepage: showOnHomepage, display_type: displayType, design, html } : d))
      setTimeout(() => setSaved(false), 2500)
    })
  }

  async function handleCreate() {
    if (!newName.trim()) return
    const { data, error } = await supabase.from('optin_designs').insert({
      name: newName.trim(), target_category: newCategory || null, enabled: false
    }).select().single()
    if (error) { alert('Error: ' + error.message); return }
    setDesigns(prev => [...prev, data])
    setShowNewModal(false)
    setNewName('')
    setNewCategory('')
    openDesign(data.id)
  }

  async function handleDelete(id: string) {
    if (!confirm('Delete this opt-in design?')) return
    await supabase.from('optin_designs').delete().eq('id', id)
    setDesigns(prev => prev.filter(d => d.id !== id))
    setActiveId(null)
  }

  const active = designs.find(d => d.id === activeId)
  const categoryName = (id: string | null) => id ? (categories.find(c => c.id === id)?.name || 'Unknown') : 'General (all pages)'

  return (
    <AdminShell>
      <div style={{ padding: '2rem 2.5rem', maxWidth: activeId ? '1600px' : '1100px' }}>
        {!activeId && (
          <>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
              <div>
                <h1 style={{ fontFamily: 'Georgia, serif', fontSize: '1.75rem', fontWeight: 700, color: '#0e1a2b', marginBottom: '0.25rem' }}>Opt-in Designer</h1>
                <p style={{ fontSize: '13px', color: '#9a9085', margin: 0 }}>Design newsletter signup popups, targeted by category.</p>
              </div>
              <button onClick={() => setShowNewModal(true)} style={{ padding: '0.6rem 1.25rem', backgroundColor: '#0e1a2b', color: '#f7f4ee', border: 'none', fontWeight: 700, fontSize: '12px', letterSpacing: '0.06em', textTransform: 'uppercase' }}>+ New Design</button>
            </div>

            {designs.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '3rem', color: '#9a9085', fontSize: '14px', backgroundColor: '#fff', border: '1px solid #e8e4de' }}>No opt-in designs yet. Click "+ New Design" to create one.</div>
            ) : (
              <div style={{ backgroundColor: '#fff', border: '1px solid #e8e4de' }}>
                {designs.map((d, i) => (
                  <button key={d.id} onClick={() => openDesign(d.id)} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', padding: '1rem 1.5rem', background: 'none', border: 'none', borderBottom: i < designs.length - 1 ? '1px solid #f0ede8' : 'none', cursor: 'pointer', textAlign: 'left' }}>
                    <div>
                      <p style={{ fontSize: '14px', fontWeight: 700, color: '#0e1a2b', margin: 0 }}>{d.name}</p>
                      <p style={{ fontSize: '12px', color: '#9a9085', margin: '0.25rem 0 0' }}>Target: {categoryName(d.target_category)}</p>
                    </div>
                    <span style={{ fontSize: '11px', fontWeight: 700, padding: '2px 8px', backgroundColor: d.enabled ? '#d4e8d6' : '#f0ede8', color: d.enabled ? '#2d7a3a' : '#9a9085', textTransform: 'uppercase' }}>{d.enabled ? 'Live' : 'Disabled'}</span>
                  </button>
                ))}
              </div>
            )}

            {showNewModal && (
              <div onClick={() => setShowNewModal(false)} style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(14,26,43,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 }}>
                <div onClick={e => e.stopPropagation()} style={{ backgroundColor: '#fff', padding: '2rem', maxWidth: '420px', width: '100%' }}>
                  <h3 style={{ fontFamily: 'Georgia, serif', fontSize: '1.2rem', fontWeight: 700, color: '#0e1a2b', marginBottom: '1rem' }}>New Opt-in Design</h3>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#4A5563', marginBottom: '0.4rem' }}>Name</label>
                  <input type="text" value={newName} onChange={e => setNewName(e.target.value)} placeholder="e.g. General Signup" style={{ width: '100%', padding: '0.6rem', border: '1px solid #ede8df', fontSize: '13px', marginBottom: '1rem', boxSizing: 'border-box' }} />
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#4A5563', marginBottom: '0.4rem' }}>Target Category</label>
                  <select value={newCategory} onChange={e => setNewCategory(e.target.value)} style={{ width: '100%', padding: '0.6rem', border: '1px solid #ede8df', fontSize: '13px', marginBottom: '1.5rem', boxSizing: 'border-box' }}>
                    <option value="">General (all pages)</option>
                    {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                  <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
                    <button onClick={() => setShowNewModal(false)} style={{ padding: '0.6rem 1.25rem', background: 'none', border: '1px solid #ede8df', fontSize: '12px', fontWeight: 600, cursor: 'pointer' }}>Cancel</button>
                    <button onClick={handleCreate} disabled={!newName.trim()} style={{ padding: '0.6rem 1.25rem', backgroundColor: '#0e1a2b', color: '#f7f4ee', border: 'none', fontWeight: 700, fontSize: '12px', textTransform: 'uppercase', cursor: 'pointer' }}>Create</button>
                  </div>
                </div>
              </div>
            )}
          </>
        )}

        {activeId && active && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.25rem', flexWrap: 'wrap' as const, gap: '1rem' }}>
              <div>
                <button onClick={() => setActiveId(null)} style={{ fontSize: '12px', color: '#9a9085', background: 'none', border: 'none', cursor: 'pointer', marginBottom: '0.5rem', padding: 0 }}>← Back to Opt-in Designs</button>
                <h2 style={{ fontFamily: 'Georgia, serif', fontSize: '1.3rem', fontWeight: 700, color: '#0e1a2b', margin: 0 }}>{active.name}</h2>
              </div>
              <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                {saved && <span style={{ fontSize: '12px', color: '#2d7a3a' }}>✓ Saved</span>}
                <button onClick={() => handleDelete(activeId)} style={{ padding: '0.6rem 1rem', background: 'none', border: '1px solid #e8e4de', color: '#c0392b', fontWeight: 600, fontSize: '12px', cursor: 'pointer' }}>Delete</button>
                <button onClick={handleSave} disabled={saving || !editorReady} style={{ padding: '0.6rem 1.25rem', backgroundColor: '#0e1a2b', color: '#f7f4ee', border: 'none', fontWeight: 700, fontSize: '12px', letterSpacing: '0.06em', textTransform: 'uppercase' as const, cursor: 'pointer' }}>{saving ? 'Saving...' : 'Save'}</button>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.25rem', flexWrap: 'wrap' as const }}>
              <div style={{ flex: 1, minWidth: '220px' }}>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase' as const, color: '#4A5563', marginBottom: '0.5rem' }}>Name</label>
                <input type="text" value={name} onChange={e => setName(e.target.value)} style={{ width: '100%', padding: '0.75rem', border: '1px solid #ede8df', fontSize: '14px', outline: 'none', boxSizing: 'border-box' as const }} />
              </div>
              <div style={{ flex: 1, minWidth: '220px' }}>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase' as const, color: '#4A5563', marginBottom: '0.5rem' }}>Target Category</label>
                <select value={targetCategory} onChange={e => setTargetCategory(e.target.value)} style={{ width: '100%', padding: '0.75rem', border: '1px solid #ede8df', fontSize: '14px', boxSizing: 'border-box' as const }}>
                  <option value="">General (all pages)</option>
                  {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              <div style={{ flex: 1, minWidth: '160px' }}>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase' as const, color: '#4A5563', marginBottom: '0.5rem' }}>Display Type</label>
                <select value={displayType} onChange={e => setDisplayType(e.target.value)} style={{ width: '100%', padding: '0.75rem', border: '1px solid #ede8df', fontSize: '14px', boxSizing: 'border-box' as const }}>
                  <option value="popup">Popup</option>
                  <option value="inline">Inline</option>
                </select>
              </div>
              <div style={{ display: 'flex', alignItems: 'flex-end', gap: '1.25rem', paddingBottom: '0.6rem' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontSize: '13px', fontWeight: 600, color: '#0e1a2b' }}>
                  <input type="checkbox" checked={enabled} onChange={e => setEnabled(e.target.checked)} style={{ width: 16, height: 16, accentColor: '#0e1a2b' }} />
                  Enabled
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontSize: '13px', fontWeight: 600, color: '#0e1a2b' }}>
                  <input type="checkbox" checked={showOnHomepage} onChange={e => setShowOnHomepage(e.target.checked)} style={{ width: 16, height: 16, accentColor: '#0e1a2b' }} />
                  Show on Homepage
                </label>
              </div>
            </div>

            <div style={{ backgroundColor: '#fef3e2', border: '1px solid #f0d9a8', padding: '0.875rem 1.25rem', marginBottom: '1.25rem', fontSize: '12px', color: '#4A5563' }}>
              Design your opt-in below — include an email input field and a submit button as part of the layout. Set <strong>Target Category</strong> to show this design only on pages in that category; leave as "General" to show it everywhere (when no category-specific design matches).
            </div>

            <div style={{ border: '1px solid #e8e4de' }}>
              <EmailEditor
                ref={emailEditorRef}
                minHeight={600}
                onReady={onEditorReady}
                options={{
                  displayMode: 'popup',
                  appearance: { theme: 'light', panels: { tools: { dock: 'left' } } },
                  features: { preview: true },
                }}
              />
            </div>
          </div>
        )}
      </div>
    </AdminShell>
  )
}
