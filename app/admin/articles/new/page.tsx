
'use client'
import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase/client'
import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Image from '@tiptap/extension-image'
import LinkExtension from '@tiptap/extension-link'
import Placeholder from '@tiptap/extension-placeholder'
import CharacterCount from '@tiptap/extension-character-count'
import Underline from '@tiptap/extension-underline'
import TextAlign from '@tiptap/extension-text-align'

export default function NewArticle() {
  const router = useRouter()
  const [categories, setCategories] = useState<any[]>([])
  const [authors, setAuthors] = useState<any[]>([])
  const [saving, setSaving] = useState(false)
  const [seoScore, setSeoScore] = useState(0)
  const [aeoScore, setAeoScore] = useState(0)
  const [readabilityScore, setReadabilityScore] = useState(0)
  const [form, setForm] = useState({
    title: '',
    slug: '',
    excerpt: '',
    cover_image_url: '',
    category_id: '',
    author_id: '',
    meta_title: '',
    meta_description: '',
  })

  const editor = useEditor({
    extensions: [
      StarterKit,
      Underline,
      Image,
      LinkExtension.configure({ openOnClick: false }),
      Placeholder.configure({ placeholder: 'Write your article here...' }),
      CharacterCount,
      TextAlign.configure({ types: ['heading', 'paragraph'] }),
    ],
    content: '',
    onUpdate: ({ editor }) => {
      const text = editor.getText()
      const wordCount = text.split(/\s+/).filter(Boolean).length
      calculateScores(form.title, text, wordCount)
    },
  })

  function calculateScores(title: string, content: string, wordCount: number) {
    // SEO Score
    let seo = 0
    if (title.length > 20) seo += 20
    if (form.meta_title.length > 0) seo += 20
    if (form.meta_description.length > 0) seo += 20
    if (wordCount > 300) seo += 20
    if (form.excerpt.length > 0) seo += 20
    setSeoScore(seo)

    // AEO Score
    let aeo = 0
    if (title.includes('?') || title.toLowerCase().includes('how') || title.toLowerCase().includes('what') || title.toLowerCase().includes('why') || title.toLowerCase().includes('best')) aeo += 25
    if (content.includes('?')) aeo += 25
    if (wordCount > 500) aeo += 25
    if (form.excerpt.length > 50) aeo += 25
    setAeoScore(aeo)

    // Readability Score
    const sentences = content.split(/[.!?]+/).filter(Boolean)
    const avgWordsPerSentence = sentences.length > 0 ? wordCount / sentences.length : 0
    let readability = 100
    if (avgWordsPerSentence > 25) readability -= 30
    else if (avgWordsPerSentence > 20) readability -= 15
    if (wordCount < 300) readability -= 20
    setReadabilityScore(Math.max(0, readability))
  }

  useEffect(() => {
    async function init() {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) { router.push('/admin/login'); return }
      const { data: cats } = await supabase.from('categories').select('*').order('name')
      const { data: auths } = await supabase.from('authors').select('*').order('name')
      setCategories(cats || [])
      setAuthors(auths || [])
    }
    init()
  }, [])

  function handleChange(e: any) {
    const { name, value } = e.target
    setForm(f => ({ ...f, [name]: value }))
  }

  function generateSlug(title: string) {
    return title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
  }

  function handleTitleChange(e: any) {
    const title = e.target.value
    setForm(f => ({ ...f, title, slug: generateSlug(title), meta_title: title }))
  }

  function getWordCount() {
    if (!editor) return 0
    return editor.getText().split(/\s+/).filter(Boolean).length
  }

  function getReadTime() {
    const words = getWordCount()
    const minutes = Math.ceil(words / 200)
    return `${minutes} min read`
  }

  function scoreColor(score: number) {
    if (score >= 80) return '#2d7a3a'
    if (score >= 50) return '#d4820a'
    return '#c0392b'
  }

  function scoreBg(score: number) {
    if (score >= 80) return '#e8f5ea'
    if (score >= 50) return '#fef3e2'
    return '#fdecea'
  }

  async function handleSave(publish: boolean) {
    setSaving(true)
    const content = editor?.getHTML() || ''
    const { error } = await supabase.from('articles').insert({
      ...form,
      content,
      read_time: getReadTime(),
      published: publish,
      published_at: publish ? new Date().toISOString() : null,
    })
    if (error) {
      alert('Error: ' + error.message)
      setSaving(false)
    } else {
      router.push('/admin')
    }
  }

  const inputStyle: any = { width: '100%', padding: '0.75rem', border: '1px solid #ede8df', fontSize: '14px', outline: 'none', boxSizing: 'border-box', backgroundColor: '#fff', fontFamily: 'inherit' }
  const labelStyle: any = { display: 'block', fontSize: '12px', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#4A5563', marginBottom: '0.5rem' }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f7f4ee' }}>
      <style>{`
        .ProseMirror { outline: none; min-height: 400px; padding: 1rem; font-size: 16px; line-height: 1.8; color: #1B1D21; }
        .ProseMirror p { margin-bottom: 1rem; }
        .ProseMirror h1 { font-size: 2rem; font-weight: 700; margin-bottom: 1rem; font-family: Georgia, serif; }
        .ProseMirror h2 { font-size: 1.5rem; font-weight: 700; margin-bottom: 0.75rem; font-family: Georgia, serif; }
        .ProseMirror h3 { font-size: 1.25rem; font-weight: 700; margin-bottom: 0.5rem; font-family: Georgia, serif; }
        .ProseMirror ul, .ProseMirror ol { padding-left: 1.5rem; margin-bottom: 1rem; }
        .ProseMirror blockquote { border-left: 3px solid #c9b28f; padding-left: 1rem; color: #4A5563; font-style: italic; margin: 1rem 0; }
        .ProseMirror p.is-editor-empty:first-child::before { content: attr(data-placeholder); color: #9a9085; pointer-events: none; float: left; height: 0; }
        .tiptap-btn { padding: 0.4rem 0.6rem; border: 1px solid #ede8df; background: #fff; cursor: pointer; font-size: 13px; border-radius: 3px; color: #0e1a2b; }
        .tiptap-btn:hover { background: #f7f4ee; }
        .tiptap-btn.active { background: #0e1a2b; color: #fff; }
      `}</style>

      <header style={{ backgroundColor: '#0e1a2b', padding: '1rem 0' }}>
        <div className="container-content" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <Link href="/admin" style={{ fontSize: '12px', color: 'rgba(247,244,238,0.6)', textDecoration: 'none' }}>← Dashboard</Link>
            <span style={{ color: 'rgba(247,244,238,0.3)' }}>|</span>
            <span style={{ fontSize: '12px', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#c9b28f' }}>New Article</span>
          </div>
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
            <span style={{ fontSize: '12px', color: 'rgba(247,244,238,0.5)' }}>{getWordCount()} words · {getReadTime()}</span>
            <button onClick={() => handleSave(false)} disabled={saving} style={{ fontSize: '12px', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#f7f4ee', backgroundColor: 'transparent', border: '1px solid rgba(247,244,238,0.3)', padding: '0.5rem 1rem', cursor: 'pointer' }}>
              Save Draft
            </button>
            <button onClick={() => handleSave(true)} disabled={saving} style={{ fontSize: '12px', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#0e1a2b', backgroundColor: '#c9b28f', border: 'none', padding: '0.5rem 1rem', cursor: 'pointer' }}>
              {saving ? 'Publishing...' : 'Publish'}
            </button>
          </div>
        </div>
      </header>

      <div className="container-content" style={{ paddingTop: '2rem', paddingBottom: '4rem' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: '2rem', alignItems: 'start' }}>

          {/* MAIN EDITOR */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div>
              <label style={labelStyle}>Title</label>
              <input name="title" value={form.title} onChange={handleTitleChange} placeholder="Article title..." style={{ ...inputStyle, fontSize: '20px', fontWeight: 600 }} />
            </div>
            <div>
              <label style={labelStyle}>Slug</label>
              <input name="slug" value={form.slug} onChange={handleChange} style={inputStyle} />
            </div>
            <div>
              <label style={labelStyle}>Excerpt</label>
              <textarea name="excerpt" value={form.excerpt} onChange={handleChange} rows={2} placeholder="Brief description shown in article cards..." style={{ ...inputStyle, resize: 'vertical' as const }} />
            </div>

            {/* RICH TEXT EDITOR */}
            <div>
              <label style={labelStyle}>Content</label>
              {/* TOOLBAR */}
              <div style={{ display: 'flex', gap: '0.25rem', flexWrap: 'wrap', padding: '0.5rem', border: '1px solid #ede8df', borderBottom: 'none', backgroundColor: '#f7f4ee' }}>
                {[
                  { label: 'B', action: () => editor?.chain().focus().toggleBold().run(), isActive: () => editor?.isActive('bold') },
                  { label: 'I', action: () => editor?.chain().focus().toggleItalic().run(), isActive: () => editor?.isActive('italic') },
                  { label: 'U', action: () => editor?.chain().focus().toggleUnderline().run(), isActive: () => editor?.isActive('underline') },
                  { label: 'H1', action: () => editor?.chain().focus().toggleHeading({ level: 1 }).run(), isActive: () => editor?.isActive('heading', { level: 1 }) },
                  { label: 'H2', action: () => editor?.chain().focus().toggleHeading({ level: 2 }).run(), isActive: () => editor?.isActive('heading', { level: 2 }) },
                  { label: 'H3', action: () => editor?.chain().focus().toggleHeading({ level: 3 }).run(), isActive: () => editor?.isActive('heading', { level: 3 }) },
                  { label: '• List', action: () => editor?.chain().focus().toggleBulletList().run(), isActive: () => editor?.isActive('bulletList') },
                  { label: '1. List', action: () => editor?.chain().focus().toggleOrderedList().run(), isActive: () => editor?.isActive('orderedList') },
                  { label: '" Quote', action: () => editor?.chain().focus().toggleBlockquote().run(), isActive: () => editor?.isActive('blockquote') },
                  { label: '↩ Undo', action: () => editor?.chain().focus().undo().run(), isActive: () => false },
                  { label: '↪ Redo', action: () => editor?.chain().focus().redo().run(), isActive: () => false },
                ].map(({ label, action, isActive }) => (
                  <button key={label} onClick={action} className={`tiptap-btn${isActive() ? ' active' : ''}`}>{label}</button>
                ))}
              </div>
              <div style={{ border: '1px solid #ede8df', backgroundColor: '#fff' }}>
                <EditorContent editor={editor} />
              </div>
            </div>

            {/* SEO FIELDS */}
            <div style={{ backgroundColor: '#fff', border: '1px solid #ede8df', padding: '1.5rem' }}>
              <p style={{ fontSize: '13px', fontWeight: 700, color: '#0e1a2b', marginBottom: '1rem', textTransform: 'uppercase', letterSpacing: '0.08em' }}>SEO Settings</p>
              <div style={{ marginBottom: '1rem' }}>
                <label style={labelStyle}>Meta Title <span style={{ color: '#9a9085', fontWeight: 400, textTransform: 'none', letterSpacing: 0 }}>({form.meta_title.length}/60)</span></label>
                <input name="meta_title" value={form.meta_title} onChange={handleChange} placeholder="SEO title..." style={{ ...inputStyle, borderColor: form.meta_title.length > 60 ? '#c0392b' : '#ede8df' }} />
              </div>
              <div>
                <label style={labelStyle}>Meta Description <span style={{ color: '#9a9085', fontWeight: 400, textTransform: 'none', letterSpacing: 0 }}>({form.meta_description.length}/160)</span></label>
                <textarea name="meta_description" value={form.meta_description} onChange={handleChange} rows={2} placeholder="SEO description..." style={{ ...inputStyle, resize: 'vertical' as const, borderColor: form.meta_description.length > 160 ? '#c0392b' : '#ede8df' }} />
              </div>
            </div>
          </div>

          {/* SIDEBAR */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', position: 'sticky', top: '1rem' }}>

            {/* SCORES */}
            <div style={{ backgroundColor: '#fff', border: '1px solid #ede8df', padding: '1.5rem' }}>
              <p style={{ fontSize: '13px', fontWeight: 700, color: '#0e1a2b', marginBottom: '1rem', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Article Scores</p>
              {[
                { label: 'SEO', score: seoScore },
                { label: 'AEO', score: aeoScore },
                { label: 'Readability', score: readabilityScore },
              ].map(({ label, score }) => (
                <div key={label} style={{ marginBottom: '1rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                    <span style={{ fontSize: '12px', fontWeight: 600, color: '#4A5563' }}>{label}</span>
                    <span style={{ fontSize: '12px', fontWeight: 700, color: scoreColor(score), backgroundColor: scoreBg(score), padding: '0.1rem 0.4rem', borderRadius: '3px' }}>{score}/100</span>
                  </div>
                  <div style={{ height: '6px', backgroundColor: '#f0ede8', borderRadius: '3px' }}>
                    <div style={{ height: '100%', width: `${score}%`, backgroundColor: scoreColor(score), borderRadius: '3px', transition: 'width 0.3s ease' }} />
                  </div>
                </div>
              ))}
            </div>

            {/* SETTINGS */}
            <div style={{ backgroundColor: '#fff', border: '1px solid #ede8df', padding: '1.5rem' }}>
              <p style={{ fontSize: '13px', fontWeight: 700, color: '#0e1a2b', marginBottom: '1rem', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Settings</p>
              <div style={{ marginBottom: '1rem' }}>
                <label style={labelStyle}>Category</label>
                <select name="category_id" value={form.category_id} onChange={handleChange} style={inputStyle}>
                  <option value="">Select category...</option>
                  {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              <div style={{ marginBottom: '1rem' }}>
                <label style={labelStyle}>Author</label>
                <select name="author_id" value={form.author_id} onChange={handleChange} style={inputStyle}>
                  <option value="">Select author...</option>
                  {authors.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
                </select>
              </div>
              <div style={{ marginBottom: '1rem' }}>
                <label style={labelStyle}>Cover Image URL</label>
                <input name="cover_image_url" value={form.cover_image_url} onChange={handleChange} placeholder="https://..." style={inputStyle} />
                {form.cover_image_url && <img src={form.cover_image_url} alt="preview" style={{ width: '100%', height: '120px', objectFit: 'cover', marginTop: '0.5rem' }} />}
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <button onClick={() => handleSave(false)} disabled={saving} style={{ width: '100%', padding: '0.875rem', backgroundColor: 'transparent', border: '1px solid #0e1a2b', color: '#0e1a2b', fontWeight: 700, fontSize: '13px', letterSpacing: '0.08em', textTransform: 'uppercase', cursor: 'pointer' }}>
                Save as Draft
              </button>
              <button onClick={() => handleSave(true)} disabled={saving} style={{ width: '100%', padding: '0.875rem', backgroundColor: '#0e1a2b', color: '#f7f4ee', fontWeight: 700, fontSize: '13px', letterSpacing: '0.08em', textTransform: 'uppercase', border: 'none', cursor: 'pointer' }}>
                {saving ? 'Publishing...' : 'Publish Article'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}