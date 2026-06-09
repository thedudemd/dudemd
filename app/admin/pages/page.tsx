// @ts-nocheck
'use client'
import { useEffect, useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase/client'
import AdminShell from '@/components/admin/AdminShell'
import RichTextEditor from '@/components/admin/RichTextEditor'

const BLOCK_TYPES = [
  { type: 'hero', label: 'Hero Section' },
  { type: 'two_column', label: 'Two Column' },
  { type: 'team_cards', label: 'Team Cards' },
  { type: 'stats', label: 'Stats / Numbers' },
  { type: 'mission', label: 'Mission / Values' },
]

function defaultBlock(type: string) {
  if (type === 'hero') return { type, headline: '', subheadline: '', bg_color: '#0e1a2b', text_color: '#f7f4ee', cta_text: '', cta_url: '', image_url: '' }
  if (type === 'two_column') return { type, image_url: '', image_side: 'left', headline: '', body: '', cta_text: '', cta_url: '' }
  if (type === 'team_cards') return { type, headline: 'Our Team', members: [{ name: '', title: '', bio: '', photo_url: '' }] }
  if (type === 'stats') return { type, headline: '', stats: [{ number: '', label: '' }, { number: '', label: '' }, { number: '', label: '' }] }
  if (type === 'mission') return { type, headline: '', body: '', accent_color: '#c9b28f' }
  return { type }
}


function ImageUploadInput({ value, onChange, placeholder }: { value: string, onChange: (url: string) => void, placeholder?: string }) {
  const [uploading, setUploading] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)
  const inp: any = { flex: 1, padding: '0.6rem 0.75rem', border: '1px solid #e8e4de', fontSize: '13px', outline: 'none', boxSizing: 'border-box', backgroundColor: '#fff', fontFamily: 'inherit' }

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    const form = new FormData()
    form.append('file', file)
    try {
      const res = await fetch('/api/upload-image', { method: 'POST', body: form })
      const data = await res.json()
      if (data.url) onChange(data.url)
      else alert('Upload failed: ' + (data.error || 'Unknown error'))
    } catch { alert('Upload failed') }
    setUploading(false)
    if (fileRef.current) fileRef.current.value = ''
  }

  return (
    <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', marginBottom: '0.5rem' }}>
      <input style={inp} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder || 'https://... or upload below'} />
      <button type="button" onClick={() => fileRef.current?.click()} disabled={uploading} style={{ padding: '0.6rem 0.75rem', backgroundColor: '#0e1a2b', color: '#f7f4ee', border: 'none', fontWeight: 700, fontSize: '11px', cursor: 'pointer', whiteSpace: 'nowrap', letterSpacing: '0.06em' }}>{uploading ? '...' : '↑ Upload'}</button>
      <input ref={fileRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleUpload} />
    </div>
  )
}

function BlockEditor({ block, onChange, onDelete, onMoveUp, onMoveDown }: any) {
  const inp: any = { width: '100%', padding: '0.6rem 0.75rem', border: '1px solid #e8e4de', fontSize: '13px', outline: 'none', boxSizing: 'border-box', backgroundColor: '#fff', fontFamily: 'inherit', marginBottom: '0.5rem' }
  const lbl: any = { display: 'block', fontSize: '11px', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#9a9085', marginBottom: '0.3rem' }
  const ta: any = { ...inp, resize: 'vertical', minHeight: '80px' }

  return (
    <div style={{ border: '1px solid #e8e4de', backgroundColor: '#fafaf8', marginBottom: '1rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.75rem 1rem', backgroundColor: '#0e1a2b', color: '#f7f4ee' }}>
        <span style={{ fontSize: '12px', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#c9b28f' }}>{BLOCK_TYPES.find(b => b.type === block.type)?.label || block.type}</span>
        <div style={{ display: 'flex', gap: '0.4rem' }}>
          <button onClick={onMoveUp} style={{ background: 'none', border: '1px solid rgba(255,255,255,0.3)', color: '#f7f4ee', cursor: 'pointer', padding: '0.2rem 0.5rem', fontSize: '12px' }}>↑</button>
          <button onClick={onMoveDown} style={{ background: 'none', border: '1px solid rgba(255,255,255,0.3)', color: '#f7f4ee', cursor: 'pointer', padding: '0.2rem 0.5rem', fontSize: '12px' }}>↓</button>
          <button onClick={onDelete} style={{ background: 'none', border: '1px solid #a32d2d', color: '#fca5a5', cursor: 'pointer', padding: '0.2rem 0.5rem', fontSize: '12px' }}>Remove</button>
        </div>
      </div>
      <div style={{ padding: '1rem' }}>

        {block.type === 'hero' && (
          <>
            <label style={lbl}>Headline</label>
            <input style={inp} value={block.headline} onChange={e => onChange({ ...block, headline: e.target.value })} placeholder="Modern Wellness for Real Men" />
            <label style={lbl}>Subheadline</label>
            <textarea style={ta} value={block.subheadline} onChange={e => onChange({ ...block, subheadline: e.target.value })} placeholder="One or two lines of supporting copy" />
            <label style={lbl}>Background Image URL (optional — leave blank for solid color)</label>
            <ImageUploadInput value={block.image_url} onChange={url => onChange({ ...block, image_url: url })} placeholder="https://... or upload" />
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
              <div>
                <label style={lbl}>Background Color</label>
                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                  <input type="color" value={block.bg_color} onChange={e => onChange({ ...block, bg_color: e.target.value })} style={{ width: 36, height: 36, border: '1px solid #e8e4de', cursor: 'pointer', padding: 0 }} />
                  <input style={{ ...inp, marginBottom: 0, flex: 1 }} value={block.bg_color} onChange={e => onChange({ ...block, bg_color: e.target.value })} />
                </div>
              </div>
              <div>
                <label style={lbl}>Text Color</label>
                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                  <input type="color" value={block.text_color} onChange={e => onChange({ ...block, text_color: e.target.value })} style={{ width: 36, height: 36, border: '1px solid #e8e4de', cursor: 'pointer', padding: 0 }} />
                  <input style={{ ...inp, marginBottom: 0, flex: 1 }} value={block.text_color} onChange={e => onChange({ ...block, text_color: e.target.value })} />
                </div>
              </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginTop: '0.5rem' }}>
              <div><label style={lbl}>CTA Button Text</label><input style={inp} value={block.cta_text} onChange={e => onChange({ ...block, cta_text: e.target.value })} placeholder="Learn More" /></div>
              <div><label style={lbl}>CTA Button URL</label><input style={inp} value={block.cta_url} onChange={e => onChange({ ...block, cta_url: e.target.value })} placeholder="/articles" /></div>
            </div>
          </>
        )}

        {block.type === 'two_column' && (
          <>
            <label style={lbl}>Image URL</label>
            <ImageUploadInput value={block.image_url} onChange={url => onChange({ ...block, image_url: url })} placeholder="https://... or upload" />
            <label style={lbl}>Image Position</label>
            <select style={inp} value={block.image_side} onChange={e => onChange({ ...block, image_side: e.target.value })}>
              <option value="left">Image Left, Text Right</option>
              <option value="right">Text Left, Image Right</option>
            </select>
            <label style={lbl}>Headline</label>
            <input style={inp} value={block.headline} onChange={e => onChange({ ...block, headline: e.target.value })} placeholder="Section headline" />
            <label style={lbl}>Body Text</label>
            <textarea style={ta} value={block.body} onChange={e => onChange({ ...block, body: e.target.value })} placeholder="Write your content here..." />
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
              <div><label style={lbl}>CTA Text (optional)</label><input style={inp} value={block.cta_text} onChange={e => onChange({ ...block, cta_text: e.target.value })} placeholder="Read More" /></div>
              <div><label style={lbl}>CTA URL</label><input style={inp} value={block.cta_url} onChange={e => onChange({ ...block, cta_url: e.target.value })} placeholder="/about" /></div>
            </div>
          </>
        )}

        {block.type === 'team_cards' && (
          <>
            <label style={lbl}>Section Headline</label>
            <input style={inp} value={block.headline} onChange={e => onChange({ ...block, headline: e.target.value })} placeholder="Our Team" />
            {block.members.map((m: any, i: number) => (
              <div key={i} style={{ border: '1px solid #e8e4de', padding: '0.75rem', marginBottom: '0.75rem', backgroundColor: '#fff' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                  <span style={{ fontSize: '12px', fontWeight: 700, color: '#4A5563' }}>Team Member {i + 1}</span>
                  {block.members.length > 1 && <button onClick={() => onChange({ ...block, members: block.members.filter((_: any, j: number) => j !== i) })} style={{ background: 'none', border: 'none', color: '#a32d2d', cursor: 'pointer', fontSize: '12px' }}>Remove</button>}
                </div>
                <input style={inp} value={m.name} onChange={e => { const ms = [...block.members]; ms[i] = { ...ms[i], name: e.target.value }; onChange({ ...block, members: ms }) }} placeholder="Full Name" />
                <input style={inp} value={m.title} onChange={e => { const ms = [...block.members]; ms[i] = { ...ms[i], title: e.target.value }; onChange({ ...block, members: ms }) }} placeholder="Job Title" />
                <ImageUploadInput value={m.photo_url} onChange={url => { const ms = [...block.members]; ms[i] = { ...ms[i], photo_url: url }; onChange({ ...block, members: ms }) }} placeholder="Photo URL or upload" />
                <textarea style={ta} value={m.bio} onChange={e => { const ms = [...block.members]; ms[i] = { ...ms[i], bio: e.target.value }; onChange({ ...block, members: ms }) }} placeholder="Short bio..." />
              </div>
            ))}
            <button onClick={() => onChange({ ...block, members: [...block.members, { name: '', title: '', bio: '', photo_url: '' }] })} style={{ padding: '0.5rem 1rem', border: '1px solid #c9b28f', background: 'none', color: '#0e1a2b', fontWeight: 700, fontSize: '12px', cursor: 'pointer' }}>+ Add Team Member</button>
          </>
        )}

        {block.type === 'stats' && (
          <>
            <label style={lbl}>Section Headline (optional)</label>
            <input style={inp} value={block.headline} onChange={e => onChange({ ...block, headline: e.target.value })} placeholder="DudeMD By The Numbers" />
            {block.stats.map((s: any, i: number) => (
              <div key={i} style={{ display: 'grid', gridTemplateColumns: '1fr 2fr auto', gap: '0.5rem', alignItems: 'center', marginBottom: '0.5rem' }}>
                <input style={{ ...inp, marginBottom: 0 }} value={s.number} onChange={e => { const ss = [...block.stats]; ss[i] = { ...ss[i], number: e.target.value }; onChange({ ...block, stats: ss }) }} placeholder="50K+" />
                <input style={{ ...inp, marginBottom: 0 }} value={s.label} onChange={e => { const ss = [...block.stats]; ss[i] = { ...ss[i], label: e.target.value }; onChange({ ...block, stats: ss }) }} placeholder="Monthly Readers" />
                {block.stats.length > 1 && <button onClick={() => onChange({ ...block, stats: block.stats.filter((_: any, j: number) => j !== i) })} style={{ background: 'none', border: 'none', color: '#a32d2d', cursor: 'pointer', fontSize: '16px', padding: '0 0.5rem' }}>×</button>}
              </div>
            ))}
            <button onClick={() => onChange({ ...block, stats: [...block.stats, { number: '', label: '' }] })} style={{ padding: '0.5rem 1rem', border: '1px solid #c9b28f', background: 'none', color: '#0e1a2b', fontWeight: 700, fontSize: '12px', cursor: 'pointer', marginTop: '0.25rem' }}>+ Add Stat</button>
          </>
        )}

        {block.type === 'mission' && (
          <>
            <label style={lbl}>Headline</label>
            <input style={inp} value={block.headline} onChange={e => onChange({ ...block, headline: e.target.value })} placeholder="Our Mission" />
            <label style={lbl}>Body Text</label>
            <textarea style={{ ...ta, minHeight: '120px' }} value={block.body} onChange={e => onChange({ ...block, body: e.target.value })} placeholder="Write your mission or values statement here..." />
            <label style={lbl}>Accent Color</label>
            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
              <input type="color" value={block.accent_color} onChange={e => onChange({ ...block, accent_color: e.target.value })} style={{ width: 36, height: 36, border: '1px solid #e8e4de', cursor: 'pointer', padding: 0 }} />
              <input style={{ ...inp, marginBottom: 0, flex: 1 }} value={block.accent_color} onChange={e => onChange({ ...block, accent_color: e.target.value })} />
            </div>
          </>
        )}

      </div>
    </div>
  )
}

export default function PagesAdmin() {
  const [pages, setPages] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState<any>(null)
  const [creating, setCreating] = useState(false)
  const [saving, setSaving] = useState(false)
  const [editorMode, setEditorMode] = useState<'rich'|'blocks'>('rich')
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
    setEditing({ title: '', slug: '', content: '', blocks: [], parent_id: parentId, placement: 'hidden', published: true, indexable: true, meta_description: '', sort_order: 0 })
    setCreating(true)
    setEditorMode('rich')
  }

  function slugify(s: string) {
    return s.toLowerCase().trim().replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-').replace(/-+/g, '-')
  }

  function openEdit(page: any) {
    setEditing({ ...page, blocks: page.blocks || [] })
    setCreating(false)
    const hasBlocks = page.blocks && Array.isArray(page.blocks) && page.blocks.length > 0
    setEditorMode(hasBlocks ? 'blocks' : 'rich')
  }

  function addBlock(type: string) {
    const blocks = [...(editing.blocks || []), defaultBlock(type)]
    setEditing({ ...editing, blocks })
  }

  function updateBlock(i: number, updated: any) {
    const blocks = [...editing.blocks]
    blocks[i] = updated
    setEditing({ ...editing, blocks })
  }

  function deleteBlock(i: number) {
    setEditing({ ...editing, blocks: editing.blocks.filter((_: any, j: number) => j !== i) })
  }

  function moveBlock(i: number, dir: number) {
    const blocks = [...editing.blocks]
    const j = i + dir
    if (j < 0 || j >= blocks.length) return
    ;[blocks[i], blocks[j]] = [blocks[j], blocks[i]]
    setEditing({ ...editing, blocks })
  }

  async function save() {
    if (!editing.title || !editing.slug) return alert('Title and slug required')
    setSaving(true)
    const payload = { ...editing, blocks: editing.blocks || [], updated_at: new Date().toISOString() }
    if (creating) {
      const { error } = await supabase.from('static_pages').insert(payload)
      if (error) { alert('Error: ' + error.message); setSaving(false); return }
    } else {
      const { error } = await supabase.from('static_pages').update(payload).eq('id', editing.id)
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
            <button onClick={() => openEdit(page)} style={{ fontSize: '11px', fontWeight: 700, color: '#0e1a2b', background: 'none', border: '1px solid #0e1a2b', cursor: 'pointer', padding: '0.3rem 0.6rem' }}>Edit</button>
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

        {editing && (
          <div onClick={() => !saving && setEditing(null)} style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '2rem', overflowY: 'auto' }}>
            <div onClick={e => e.stopPropagation()} style={{ backgroundColor: '#fff', maxWidth: '1200px', width: '100%', padding: '2.5rem', position: 'relative', maxHeight: '95vh', overflowY: 'auto' }}>
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

              <div style={{ marginBottom: '1.5rem' }}>
                <label style={lbl}>Meta Description (SEO)</label>
                <input style={inp} value={editing.meta_description || ''} onChange={e => setEditing({ ...editing, meta_description: e.target.value })} placeholder="Brief description for search engines (150-160 chars)" maxLength={160} />
              </div>

              {/* Editor Mode Toggle */}
              <div style={{ display: 'flex', gap: '0', marginBottom: '1rem', border: '1px solid #e8e4de', width: 'fit-content' }}>
                <button onClick={() => setEditorMode('rich')} style={{ padding: '0.5rem 1.25rem', fontWeight: 700, fontSize: '12px', letterSpacing: '0.06em', textTransform: 'uppercase', border: 'none', cursor: 'pointer', backgroundColor: editorMode === 'rich' ? '#0e1a2b' : '#fff', color: editorMode === 'rich' ? '#f7f4ee' : '#4A5563' }}>Rich Text</button>
                <button onClick={() => setEditorMode('blocks')} style={{ padding: '0.5rem 1.25rem', fontWeight: 700, fontSize: '12px', letterSpacing: '0.06em', textTransform: 'uppercase', border: 'none', borderLeft: '1px solid #e8e4de', cursor: 'pointer', backgroundColor: editorMode === 'blocks' ? '#0e1a2b' : '#fff', color: editorMode === 'blocks' ? '#f7f4ee' : '#4A5563' }}>Page Builder</button>
              </div>

              {editorMode === 'rich' && (
                <div style={{ marginBottom: '1.5rem' }}>
                  <label style={lbl}>Content</label>
                  <RichTextEditor content={editing.content || ''} onChange={html => setEditing({ ...editing, content: html })} />
                </div>
              )}

              {editorMode === 'blocks' && (
                <div style={{ marginBottom: '1.5rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                    <label style={lbl}>Page Blocks</label>
                  </div>

                  {(editing.blocks || []).length === 0 && (
                    <div style={{ backgroundColor: '#f7f4ee', border: '1px dashed #c9b28f', padding: '2rem', textAlign: 'center', marginBottom: '1rem' }}>
                      <p style={{ fontSize: '14px', color: '#9a9085', margin: '0 0 0.5rem' }}>No blocks yet. Add one below.</p>
                    </div>
                  )}

                  {(editing.blocks || []).map((block: any, i: number) => (
                    <BlockEditor
                      key={i}
                      block={block}
                      onChange={(updated: any) => updateBlock(i, updated)}
                      onDelete={() => deleteBlock(i)}
                      onMoveUp={() => moveBlock(i, -1)}
                      onMoveDown={() => moveBlock(i, 1)}
                    />
                  ))}

                  <div style={{ backgroundColor: '#f7f4ee', border: '1px solid #e8e4de', padding: '1rem' }}>
                    <p style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#9a9085', marginBottom: '0.75rem' }}>Add Block</p>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                      {BLOCK_TYPES.map(bt => (
                        <button key={bt.type} onClick={() => addBlock(bt.type)} style={{ padding: '0.5rem 1rem', border: '1px solid #0e1a2b', backgroundColor: '#fff', color: '#0e1a2b', fontWeight: 700, fontSize: '12px', cursor: 'pointer', letterSpacing: '0.06em' }}>+ {bt.label}</button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem', marginBottom: '1.5rem' }}>
                <div>
                  <label style={lbl}>Sort Order</label>
                  <input style={inp} type="number" value={editing.sort_order || 0} onChange={e => setEditing({ ...editing, sort_order: parseInt(e.target.value) || 0 })} placeholder="0" />
                </div>
                <div>
                  <label style={lbl}>Placement</label>
                  <select style={inp} value={editing.placement} onChange={e => setEditing({ ...editing, placement: e.target.value })}>
                    <option value="hidden">Hidden (direct URL only)</option>
                    <option value="footer_company">Footer — Company</option>
                    <option value="footer_legal">Footer — Legal</option>
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
