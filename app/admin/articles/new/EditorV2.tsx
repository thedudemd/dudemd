'use client'
import { useEffect, useState, Suspense, useRef, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase/client'
import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import LinkExtension from '@tiptap/extension-link'
import Placeholder from '@tiptap/extension-placeholder'
import Underline from '@tiptap/extension-underline'
import TextAlign from '@tiptap/extension-text-align'
import TextStyle from '@tiptap/extension-text-style'
import Color from '@tiptap/extension-color'
import Highlight from '@tiptap/extension-highlight'
import Subscript from '@tiptap/extension-subscript'
import Superscript from '@tiptap/extension-superscript'
import HorizontalRule from '@tiptap/extension-horizontal-rule'
import CharacterCount from '@tiptap/extension-character-count'
import { FontSize } from '@/lib/tiptap/FontSize'
import { ResizableImage } from '@/lib/tiptap/ResizableImage'

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string; next: string | null; nextLabel: string | null }> = {
  draft:            { label: 'Draft',            color: '#9a9085', bg: '#f0ede8', next: 'in_review',        nextLabel: 'Submit for Review' },
  in_review:        { label: 'In Review',         color: '#d4820a', bg: '#fef3e2', next: 'ready_to_publish', nextLabel: 'Approve' },
  ready_to_publish: { label: 'Ready to Publish',  color: '#2d7a3a', bg: '#e8f5ea', next: 'published',        nextLabel: 'Publish Now' },
  published:        { label: 'Published',          color: '#0e1a2b', bg: '#c9b28f', next: null,               nextLabel: null },
}

function ToolbarDivider() {
  return <span style={{ width: 1, height: 20, backgroundColor: '#e8e4de', margin: '0 4px', flexShrink: 0 }} />
}

function ToolbarBtn({ active, onClick, title, children, disabled }: any) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      title={title}
      style={{
        padding: '5px 8px',
        fontSize: '12px',
        fontWeight: 600,
        backgroundColor: active ? '#0e1a2b' : 'transparent',
        color: active ? '#f7f4ee' : '#4A5563',
        border: 'none',
        cursor: disabled ? 'not-allowed' : 'pointer',
        borderRadius: 3,
        lineHeight: 1,
        opacity: disabled ? 0.4 : 1,
        transition: 'background 0.1s',
        whiteSpace: 'nowrap' as const,
      }}
    >
      {children}
    </button>
  )
}

function NewArticleV2Inner() {
  const router = useRouter()
  const [categories, setCategories] = useState<any[]>([])
  const [authors, setAuthors] = useState<any[]>([])
  const [saving, setSaving] = useState(false)
  const [focusMode, setFocusMode] = useState(false)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [showHtml, setShowHtml] = useState(false)
  const [uploading, setUploading] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)
  const [form, setForm] = useState({
    title: '', slug: '', excerpt: '', cover_image_url: '', category_id: '', author_id: '',
    meta_title: '', meta_description: '', status: 'draft', layout: 'standard',
    tags: [] as string[], show_hero: true, is_pillar_content: false, pillar_topic_id: '',
    review_note: ''
  })
  const tagInputRef = useRef<HTMLInputElement>(null)

  const editor = useEditor({
    extensions: [
      StarterKit.configure({ image: false }),
      Underline, ResizableImage,
      LinkExtension.configure({ openOnClick: false }),
      Placeholder.configure({ placeholder: 'Start writing your article...' }),
      TextAlign.configure({ types: ['heading', 'paragraph'] }),
      TextStyle, Color,
      Highlight.configure({ multicolor: true }),
      Subscript, Superscript, HorizontalRule, CharacterCount, FontSize,
    ],
    content: '',
    immediatelyRender: false,
  })

  useEffect(() => {
    supabase.from('categories').select('*').order('name').then(({ data }) => setCategories(data || []))
    supabase.from('authors').select('*').order('name').then(({ data }) => setAuthors(data || []))
  }, [])

  // Fullscreen API
  useEffect(() => {
    function onFSChange() { setIsFullscreen(!!document.fullscreenElement) }
    document.addEventListener('fullscreenchange', onFSChange)
    return () => document.removeEventListener('fullscreenchange', onFSChange)
  }, [])

  async function toggleFullscreen() {
    if (!document.fullscreenElement) {
      try { await document.documentElement.requestFullscreen() } catch {}
    } else {
      try { await document.exitFullscreen() } catch {}
    }
  }

  function slugify(s: string) {
    return s.toLowerCase().trim().replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-').replace(/-+/g, '-')
  }

  async function uploadImage(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    const form = new FormData()
    form.append('file', file)
    try {
      const res = await fetch('/api/upload-image', { method: 'POST', body: form })
      const data = await res.json()
      if (data.url) editor?.chain().focus().insertContent({ type: 'image', attrs: { src: data.url } }).run()
      else alert('Upload failed: ' + (data.error || 'Unknown error'))
    } catch { alert('Upload failed') }
    setUploading(false)
    if (fileRef.current) fileRef.current.value = ''
  }

  function setLink() {
    const url = window.prompt('URL:')
    if (url === null) return
    if (url === '') editor?.chain().focus().extendMarkRange('link').unsetLink().run()
    else editor?.chain().focus().extendMarkRange('link').setLink({ href: url }).run()
  }

  async function handleSave(status: string) {
    if (!form.category_id) { alert('Please select a category before saving.'); return }
    if (!form.author_id) { alert('Please select an author before saving.'); return }
    if (status === 'published' && !form.cover_image_url) { alert('Please add a cover image before publishing.'); return }
    setSaving(true)
    const finalSlug = form.slug || slugify(form.title)
    const { error } = await supabase.from('articles').insert({
      ...form,
      slug: finalSlug,
      content: editor?.getHTML() || '',
      read_time: Math.ceil((editor?.getText().split(/\s+/).filter(Boolean).length || 0) / 200) + ' min read',
      status,
      published: status === 'published',
      published_at: status === 'published' ? new Date().toISOString() : null,
      updated_at: new Date().toISOString(),
      category_id: form.category_id || null,
      author_id: form.author_id || null,
      is_pillar_content: form.is_pillar_content,
      pillar_topic_id: form.pillar_topic_id || null,
    })
    if (error) { alert('Error: ' + error.message); setSaving(false) }
    else router.push('/admin')
  }

  const wordCount = editor?.storage.characterCount?.words() || 0
  const statusConf = STATUS_CONFIG[form.status] || STATUS_CONFIG.draft

  const canvasStyle: any = {
    flex: 1,
    minHeight: '100vh',
    backgroundColor: '#fdfcfa',
    transition: 'all 0.2s ease',
  }

  const editorWrapStyle: any = {
    maxWidth: focusMode || isFullscreen ? '740px' : '860px',
    margin: '0 auto',
    padding: focusMode || isFullscreen ? '3rem 2rem 6rem' : '2rem 2rem 6rem',
    transition: 'all 0.2s ease',
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', backgroundColor: '#f7f4ee', overflow: 'hidden' }}>

      {/* TOP BAR */}
      <div style={{ backgroundColor: '#0e1a2b', padding: '0.6rem 1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0, zIndex: 50 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <Link href="/admin" style={{ color: 'rgba(247,244,238,0.5)', fontSize: '12px', textDecoration: 'none' }}>← Admin</Link>
          <span style={{ color: 'rgba(247,244,238,0.2)' }}>|</span>
          <span style={{ fontSize: '12px', color: 'rgba(247,244,238,0.7)' }}>New Article</span>
          <span style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase' as const, color: statusConf.color, backgroundColor: statusConf.bg, padding: '2px 8px', borderRadius: 3 }}>{statusConf.label}</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <button onClick={() => handleSave('draft')} disabled={saving} style={{ padding: '0.5rem 1rem', fontSize: '12px', fontWeight: 700, color: 'rgba(247,244,238,0.7)', backgroundColor: 'transparent', border: '1px solid rgba(247,244,238,0.2)', cursor: 'pointer', letterSpacing: '0.06em' }}>Save Draft</button>
          {statusConf.next && (
            <button onClick={() => handleSave(statusConf.next!)} disabled={saving} style={{ padding: '0.5rem 1rem', fontSize: '12px', fontWeight: 700, color: '#0e1a2b', backgroundColor: '#c9b28f', border: 'none', cursor: 'pointer', letterSpacing: '0.06em' }}>{statusConf.nextLabel}</button>
          )}
        </div>
      </div>

      {/* TOOLBAR */}
      <div style={{ backgroundColor: '#fff', borderBottom: '1px solid #e8e4de', padding: '4px 12px', display: 'flex', alignItems: 'center', flexWrap: 'wrap' as const, gap: '2px', flexShrink: 0, position: 'sticky' as const, top: 0, zIndex: 40, boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
        {/* Group 1: Text style */}
        <ToolbarBtn active={editor?.isActive('bold')} onClick={() => editor?.chain().focus().toggleBold().run()} title="Bold"><b>B</b></ToolbarBtn>
        <ToolbarBtn active={editor?.isActive('italic')} onClick={() => editor?.chain().focus().toggleItalic().run()} title="Italic"><i>I</i></ToolbarBtn>
        <ToolbarBtn active={editor?.isActive('underline')} onClick={() => editor?.chain().focus().toggleUnderline().run()} title="Underline"><u>U</u></ToolbarBtn>
        <ToolbarBtn active={editor?.isActive('strike')} onClick={() => editor?.chain().focus().toggleStrike().run()} title="Strikethrough"><s>S</s></ToolbarBtn>
        <ToolbarDivider />
        {/* Group 2: Structure */}
        <ToolbarBtn active={editor?.isActive('heading', { level: 1 })} onClick={() => editor?.chain().focus().toggleHeading({ level: 1 }).run()} title="Heading 1">H1</ToolbarBtn>
        <ToolbarBtn active={editor?.isActive('heading', { level: 2 })} onClick={() => editor?.chain().focus().toggleHeading({ level: 2 }).run()} title="Heading 2">H2</ToolbarBtn>
        <ToolbarBtn active={editor?.isActive('heading', { level: 3 })} onClick={() => editor?.chain().focus().toggleHeading({ level: 3 }).run()} title="Heading 3">H3</ToolbarBtn>
        <ToolbarBtn active={editor?.isActive('paragraph')} onClick={() => editor?.chain().focus().setParagraph().run()} title="Paragraph">P</ToolbarBtn>
        <ToolbarDivider />
        {/* Group 3: Lists & blocks */}
        <ToolbarBtn active={editor?.isActive('bulletList')} onClick={() => editor?.chain().focus().toggleBulletList().run()} title="Bullet List">• List</ToolbarBtn>
        <ToolbarBtn active={editor?.isActive('orderedList')} onClick={() => editor?.chain().focus().toggleOrderedList().run()} title="Numbered List">1. List</ToolbarBtn>
        <ToolbarBtn active={editor?.isActive('blockquote')} onClick={() => editor?.chain().focus().toggleBlockquote().run()} title="Blockquote">❝</ToolbarBtn>
        <ToolbarBtn active={false} onClick={() => editor?.chain().focus().setHorizontalRule().run()} title="Horizontal Rule">— HR</ToolbarBtn>
        <ToolbarDivider />
        {/* Group 4: Insert */}
        <ToolbarBtn active={editor?.isActive('link')} onClick={setLink} title="Link">🔗 Link</ToolbarBtn>
        <ToolbarBtn active={false} onClick={() => fileRef.current?.click()} disabled={uploading} title="Insert Image">{uploading ? '...' : '🖼 Image'}</ToolbarBtn>
        <input ref={fileRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={uploadImage} />
        <ToolbarDivider />
        {/* Group 5: Advanced */}
        <select onChange={e => editor?.chain().focus().setFontSize(e.target.value).run()} defaultValue="" style={{ fontSize: '11px', border: '1px solid #e8e4de', padding: '3px 4px', backgroundColor: '#fff', color: '#4A5563', cursor: 'pointer', borderRadius: 3 }}>
          <option value="" disabled>Size</option>
          {['12px','14px','16px','18px','20px','24px','28px','32px'].map(s => <option key={s} value={s}>{s}</option>)}
        </select>
        <input type="color" title="Text Color" onChange={e => editor?.chain().focus().setColor(e.target.value).run()} style={{ width: 24, height: 24, border: '1px solid #e8e4de', padding: 1, cursor: 'pointer', borderRadius: 3 }} />
        <input type="color" title="Highlight Color" onChange={e => editor?.chain().focus().setHighlight({ color: e.target.value }).run()} style={{ width: 24, height: 24, border: '1px solid #e8e4de', padding: 1, cursor: 'pointer', backgroundColor: '#ffe066', borderRadius: 3 }} />
        <ToolbarBtn active={editor?.isActive({ textAlign: 'left' })} onClick={() => editor?.chain().focus().setTextAlign('left').run()} title="Align Left">⬅</ToolbarBtn>
        <ToolbarBtn active={editor?.isActive({ textAlign: 'center' })} onClick={() => editor?.chain().focus().setTextAlign('center').run()} title="Align Center">↔</ToolbarBtn>
        <ToolbarBtn active={editor?.isActive({ textAlign: 'right' })} onClick={() => editor?.chain().focus().setTextAlign('right').run()} title="Align Right">➡</ToolbarBtn>
        <ToolbarBtn active={editor?.isActive('subscript')} onClick={() => editor?.chain().focus().toggleSubscript().run()} title="Subscript">x₂</ToolbarBtn>
        <ToolbarBtn active={editor?.isActive('superscript')} onClick={() => editor?.chain().focus().toggleSuperscript().run()} title="Superscript">x²</ToolbarBtn>
        <ToolbarDivider />
        {/* Group 6: Utility */}
        <span style={{ fontSize: '11px', color: '#9a9085', padding: '0 4px', whiteSpace: 'nowrap' as const }}>{wordCount} words</span>
        <ToolbarBtn active={showHtml} onClick={() => setShowHtml(!showHtml)} title="Toggle HTML">⟨/⟩</ToolbarBtn>
        <ToolbarBtn active={focusMode} onClick={() => setFocusMode(!focusMode)} title="Focus Mode">Focus</ToolbarBtn>
        <ToolbarBtn active={isFullscreen} onClick={toggleFullscreen} title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}>{isFullscreen ? '⊡ Exit' : '⛶ Full'}</ToolbarBtn>
        <ToolbarBtn active={false} onClick={() => editor?.chain().focus().undo().run()} title="Undo">↶</ToolbarBtn>
        <ToolbarBtn active={false} onClick={() => editor?.chain().focus().redo().run()} title="Redo">↷</ToolbarBtn>
      </div>

      {/* MAIN CONTENT */}
      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>

        {/* CANVAS */}
        <div style={canvasStyle} onClick={() => editor?.chain().focus().run()}>
          <div style={editorWrapStyle}>
            {/* Title */}
            <input
              value={form.title}
              onChange={e => { const t = e.target.value; setForm(f => ({ ...f, title: t, slug: slugify(t), meta_title: t, social_title: t })) }}
              placeholder="Article title..."
              style={{ width: '100%', fontSize: 'clamp(1.75rem, 4vw, 2.5rem)', fontFamily: 'Georgia, serif', fontWeight: 700, color: '#0e1a2b', border: 'none', outline: 'none', backgroundColor: 'transparent', lineHeight: 1.2, marginBottom: '1.5rem', boxSizing: 'border-box' as const }}
            />
            {/* Excerpt */}
            <textarea
              value={form.excerpt}
              onChange={e => setForm(f => ({ ...f, excerpt: e.target.value, meta_description: e.target.value }))}
              placeholder="Write a short excerpt or standfirst..."
              rows={2}
              style={{ width: '100%', fontSize: '18px', color: '#4A5563', fontStyle: 'italic', border: 'none', outline: 'none', backgroundColor: 'transparent', resize: 'none' as const, lineHeight: 1.6, marginBottom: '2rem', borderLeft: '3px solid #c9b28f', paddingLeft: '1rem', boxSizing: 'border-box' as const }}
            />
            {/* Body */}
            {showHtml ? (
              <textarea
                value={editor?.getHTML() || ''}
                onChange={e => editor?.commands.setContent(e.target.value)}
                style={{ width: '100%', minHeight: 400, fontSize: 13, fontFamily: 'monospace', border: '1px solid #e8e4de', padding: '1rem', outline: 'none', resize: 'vertical' as const, boxSizing: 'border-box' as const }}
              />
            ) : (
              <EditorContent editor={editor} />
            )}
          </div>
        </div>

        {/* RIGHT SIDEBAR — hidden in focus/fullscreen */}
        {!focusMode && !isFullscreen && (
          <div style={{ width: '320px', flexShrink: 0, backgroundColor: '#fff', borderLeft: '1px solid #e8e4de', overflowY: 'auto' as const, padding: '1.5rem' }}>

            {/* Status & Workflow */}
            <div style={{ marginBottom: '1.5rem', paddingBottom: '1.5rem', borderBottom: '1px solid #f0ede8' }}>
              <p style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase' as const, color: '#9a9085', marginBottom: '0.75rem' }}>Status</p>
              <div style={{ display: 'flex', flexWrap: 'wrap' as const, gap: '0.4rem' }}>
                {Object.entries(STATUS_CONFIG).map(([key, conf]) => (
                  <button key={key} type="button" onClick={() => setForm(f => ({ ...f, status: key }))} style={{ padding: '4px 10px', fontSize: '11px', fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase' as const, border: '1px solid', borderColor: form.status === key ? conf.color : '#e8e4de', backgroundColor: form.status === key ? conf.bg : '#fff', color: form.status === key ? conf.color : '#9a9085', cursor: 'pointer', borderRadius: 3 }}>{conf.label}</button>
                ))}
              </div>
            </div>

            {/* Category */}
            <div style={{ marginBottom: '1.25rem' }}>
              <label style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase' as const, color: '#9a9085', display: 'block', marginBottom: '0.4rem' }}>Category</label>
              <select value={form.category_id} onChange={e => setForm(f => ({ ...f, category_id: e.target.value }))} style={{ width: '100%', padding: '0.6rem', border: '1px solid #e8e4de', fontSize: '13px', outline: 'none', backgroundColor: '#fff' }}>
                <option value="">Select category...</option>
                {categories.filter((c: any) => !c.parent_id).map((c: any) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>

            {/* Author */}
            <div style={{ marginBottom: '1.25rem' }}>
              <label style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase' as const, color: '#9a9085', display: 'block', marginBottom: '0.4rem' }}>Author</label>
              <select value={form.author_id} onChange={e => setForm(f => ({ ...f, author_id: e.target.value }))} style={{ width: '100%', padding: '0.6rem', border: '1px solid #e8e4de', fontSize: '13px', outline: 'none', backgroundColor: '#fff' }}>
                <option value="">Select author...</option>
                {authors.map((a: any) => <option key={a.id} value={a.id}>{a.name}</option>)}
              </select>
            </div>

            {/* Layout */}
            <div style={{ marginBottom: '1.25rem' }}>
              <label style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase' as const, color: '#9a9085', display: 'block', marginBottom: '0.4rem' }}>Layout</label>
              <select value={form.layout} onChange={e => setForm(f => ({ ...f, layout: e.target.value }))} style={{ width: '100%', padding: '0.6rem', border: '1px solid #e8e4de', fontSize: '13px', outline: 'none', backgroundColor: '#fff' }}>
                <option value="standard">Standard</option>
                <option value="magazine">Magazine</option>
                <option value="longform">Long Form</option>
              </select>
            </div>

            {/* Cover Image */}
            <div style={{ marginBottom: '1.25rem', paddingBottom: '1.25rem', borderBottom: '1px solid #f0ede8' }}>
              <label style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase' as const, color: '#9a9085', display: 'block', marginBottom: '0.4rem' }}>Cover Image</label>
              <input value={form.cover_image_url} onChange={e => setForm(f => ({ ...f, cover_image_url: e.target.value }))} placeholder="https://..." style={{ width: '100%', padding: '0.6rem', border: '1px solid #e8e4de', fontSize: '13px', outline: 'none', boxSizing: 'border-box' as const }} />
              {form.cover_image_url && <img src={form.cover_image_url} alt="cover preview" style={{ width: '100%', aspectRatio: '16/9', objectFit: 'cover', marginTop: '0.5rem', display: 'block' }} />}
            </div>

            {/* SEO */}
            <div style={{ marginBottom: '1.25rem', paddingBottom: '1.25rem', borderBottom: '1px solid #f0ede8' }}>
              <p style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase' as const, color: '#9a9085', marginBottom: '0.75rem' }}>SEO</p>
              <label style={{ fontSize: '11px', color: '#9a9085', display: 'block', marginBottom: '0.3rem' }}>Meta Title</label>
              <input value={form.meta_title || ''} onChange={e => setForm(f => ({ ...f, meta_title: e.target.value }))} style={{ width: '100%', padding: '0.6rem', border: '1px solid #e8e4de', fontSize: '13px', outline: 'none', boxSizing: 'border-box' as const, marginBottom: '0.75rem' }} />
              <label style={{ fontSize: '11px', color: '#9a9085', display: 'block', marginBottom: '0.3rem' }}>Meta Description</label>
              <textarea value={form.meta_description || ''} onChange={e => setForm(f => ({ ...f, meta_description: e.target.value }))} rows={3} style={{ width: '100%', padding: '0.6rem', border: '1px solid #e8e4de', fontSize: '13px', outline: 'none', boxSizing: 'border-box' as const, resize: 'vertical' as const }} />
            </div>

            {/* Tags */}
            <div style={{ marginBottom: '1.25rem', paddingBottom: '1.25rem', borderBottom: '1px solid #f0ede8' }}>
              <p style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase' as const, color: '#9a9085', marginBottom: '0.75rem' }}>Tags</p>
              <div style={{ display: 'flex', flexWrap: 'wrap' as const, gap: '0.3rem', marginBottom: '0.5rem' }}>
                {(form.tags || []).map((t: string) => (
                  <span key={t} style={{ fontSize: '11px', backgroundColor: '#f0ede8', color: '#4A5563', padding: '3px 8px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    {t}
                    <button type="button" onClick={() => setForm(f => ({ ...f, tags: f.tags.filter(x => x !== t) }))} style={{ background: 'none', border: 'none', color: '#c9b28f', cursor: 'pointer', fontSize: 14, lineHeight: 1, padding: 0 }}>×</button>
                  </span>
                ))}
              </div>
              <input ref={tagInputRef} defaultValue="" onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); const val = (e.target as HTMLInputElement).value.trim(); if (val) { setForm(f => ({ ...f, tags: [...(f.tags || []), val] })); (e.target as HTMLInputElement).value = '' } } }} placeholder="Type tag + Enter" style={{ width: '100%', padding: '0.6rem', border: '1px solid #e8e4de', fontSize: '13px', outline: 'none', boxSizing: 'border-box' as const }} />
            </div>

            {/* Article Structure */}
            <div style={{ marginBottom: '1.25rem' }}>
              <p style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase' as const, color: '#9a9085', marginBottom: '0.75rem' }}>Article Structure</p>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', marginBottom: '0.5rem' }}>
                <input type="checkbox" checked={form.is_pillar_content} onChange={e => setForm(f => ({ ...f, is_pillar_content: e.target.checked, pillar_topic_id: e.target.checked ? '' : f.pillar_topic_id }))} style={{ accentColor: '#0e1a2b' }} />
                <span style={{ fontSize: '13px', color: '#0e1a2b', fontWeight: 600 }}>Pillar Article</span>
              </label>
              {!form.is_pillar_content && (
                <div>
                  <label style={{ fontSize: '11px', color: '#9a9085', display: 'block', marginBottom: '0.3rem' }}>Parent Pillar</label>
                  <p style={{ fontSize: '11px', color: '#9a9085', fontStyle: 'italic' }}>Set parent pillar after saving by editing this article.</p>
                </div>
              )}
            </div>

          </div>
        )}
      </div>

      <style jsx global>{`
        .ProseMirror { outline: none; min-height: 400px; font-size: 17px; line-height: 1.85; color: #1a1a1a; font-family: Georgia, serif; }
        .ProseMirror h1 { font-size: 2rem; font-weight: 700; margin: 2rem 0 1rem; line-height: 1.2; }
        .ProseMirror h2 { font-size: 1.5rem; font-weight: 700; margin: 1.75rem 0 0.75rem; }
        .ProseMirror h3 { font-size: 1.2rem; font-weight: 700; margin: 1.5rem 0 0.5rem; }
        .ProseMirror p { margin: 0.75rem 0; }
        .ProseMirror ul, .ProseMirror ol { padding-left: 1.5rem; margin: 0.75rem 0; }
        .ProseMirror blockquote { border-left: 3px solid #c9b28f; padding-left: 1.25rem; margin: 1.5rem 0; font-style: italic; color: #4A5563; }
        .ProseMirror a { color: #c9b28f; text-decoration: underline; }
        .ProseMirror img { max-width: 100%; height: auto; margin: 1.5rem 0; display: block; }
        .ProseMirror p.is-editor-empty:first-child::before { color: #c9b28f80; content: attr(data-placeholder); float: left; height: 0; pointer-events: none; font-style: italic; }
      `}</style>
    </div>
  )
}

export default function EditorV2() {
  return <Suspense><NewArticleV2Inner /></Suspense>
}
