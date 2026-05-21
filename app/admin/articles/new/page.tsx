'use client'
import { useEffect, useState, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase/client'
import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import TiptapImage from '@tiptap/extension-image'
import LinkExtension from '@tiptap/extension-link'
import Placeholder from '@tiptap/extension-placeholder'
import Underline from '@tiptap/extension-underline'
import TextAlign from '@tiptap/extension-text-align'

function NewArticleInner() {
  const router = useRouter()
  const [categories, setCategories] = useState<any[]>([])
  const [authors, setAuthors] = useState<any[]>([])
  const [saving, setSaving] = useState(false)
  const [autoSaved, setAutoSaved] = useState('')
  const [suggestions, setSuggestions] = useState<{existing: any[], topics: string[]}>({ existing: [], topics: [] })
  const [suggestLoading, setSuggestLoading] = useState(false)
  const [suggestKeyword, setSuggestKeyword] = useState('')
  const [seoScore, setSeoScore] = useState(0)
  const [aeoScore, setAeoScore] = useState(0)
  const [readabilityScore, setReadabilityScore] = useState(0)
  const [form, setForm] = useState({ title: '', slug: '', excerpt: '', cover_image_url: '', category_id: '', author_id: '', meta_title: '', meta_description: '', status: 'draft', tags: [] as string[] })
  const [canvaDesigns, setCanvaDesigns] = useState<any[]>([])
  const [showCanvaPicker, setShowCanvaPicker] = useState(false)
  const [tagInput, setTagInput] = useState('')
  const searchParams = useSearchParams()

  const editor = useEditor({
    extensions: [
      StarterKit, Underline, TiptapImage,
      LinkExtension.configure({ openOnClick: false }),
      Placeholder.configure({ placeholder: 'Write your article here...' }),
      TextAlign.configure({ types: ['heading', 'paragraph'] }),
    ],
    content: '',
    onUpdate: ({ editor }) => {
      const text = editor.getText()
      const words = text.split(/\s+/).filter(Boolean).length
      calcScores(form.title, text, words)
    },
  })

  function calcScores(title: string, content: string, words: number) {
    let seo = 0
    if (title.length > 20) seo += 20
    if (form.meta_title.length > 0) seo += 20
    if (form.meta_description.length > 0) seo += 20
    if (words > 300) seo += 20
    if (form.excerpt.length > 0) seo += 20
    setSeoScore(seo)
    let aeo = 0
    const tl = title.toLowerCase()
    if (tl.includes('?') || tl.includes('how') || tl.includes('what') || tl.includes('why') || tl.includes('best')) aeo += 25
    if (content.includes('?')) aeo += 25
    if (words > 500) aeo += 25
    if (form.excerpt.length > 50) aeo += 25
    setAeoScore(aeo)
    const sentences = content.split(/[.!?]+/).filter(Boolean)
    const avg = sentences.length > 0 ? words / sentences.length : 0
    let read = 100
    if (avg > 25) read -= 30
    else if (avg > 20) read -= 15
    if (words < 300) read -= 20
    setReadabilityScore(Math.max(0, read))
  }

  useEffect(() => {
    if (searchParams.get('canva') === 'success') {
      fetch('/api/canva/designs').then(r => r.json()).then(d => {
        if (d.items) { setCanvaDesigns(d.items); setShowCanvaPicker(true) }
      })
    }
  }, [searchParams])

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

  useEffect(() => {
    if (!form.title && !editor?.getText()) return
    const timer = setTimeout(async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) return
      const draftKey = `draft_${session.user.id}`
      localStorage.setItem(draftKey, JSON.stringify({ ...form, content: editor?.getHTML() || '' }))
      setAutoSaved('Draft saved ' + new Date().toLocaleTimeString())
    }, 3000)
    return () => clearTimeout(timer)
  }, [form, editor])

  useEffect(() => {
    async function loadDraft() {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) return
      const draftKey = `draft_${session.user.id}`
      const saved = localStorage.getItem(draftKey)
      if (saved) {
        const d = JSON.parse(saved)
        setForm({ title: d.title||'', slug: d.slug||'', excerpt: d.excerpt||'', cover_image_url: d.cover_image_url||'', category_id: d.category_id||'', author_id: d.author_id||'', meta_title: d.meta_title||'', meta_description: d.meta_description||'', status: d.status||'draft', tags: d.tags||[] })
        if (editor && d.content) editor.commands.setContent(d.content)
        setAutoSaved('Draft restored')
      }
    }
    if (editor) loadDraft()
  }, [editor])

  async function fetchSuggestions(kw: string) {
    if (kw.trim().length < 3) return
    setSuggestLoading(true)
    try {
      const res = await fetch('/api/suggestions', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ keywords: kw, currentSlug: form.slug }) })
      const data = await res.json()
      setSuggestions(data)
    } catch(e) {}
    setSuggestLoading(false)
  }

  function handleChange(e: any) {
    const { name, value } = e.target
    setForm(f => ({ ...f, [name]: value }))
  }

  function handleTitleChange(e: any) {
    const title = e.target.value
    const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
    setForm(f => ({ ...f, title, slug, meta_title: title }))
  }

  function addTag(val: string) {
    const tag = val.trim().toLowerCase()
    if (tag && !form.tags.includes(tag)) {
      setForm(f => ({ ...f, tags: [...f.tags, tag] }))
    }
    setTagInput('')
  }

  function removeTag(tag: string) {
    setForm(f => ({ ...f, tags: f.tags.filter((t: string) => t !== tag) }))
  }

  function getWordCount() { return editor ? editor.getText().split(/\s+/).filter(Boolean).length : 0 }
  function getReadTime() { return Math.ceil(getWordCount() / 200) + ' min read' }
  function scoreColor(s: number) { return s >= 80 ? '#2d7a3a' : s >= 50 ? '#d4820a' : '#c0392b' }
  function scoreBg(s: number) { return s >= 80 ? '#e8f5ea' : s >= 50 ? '#fef3e2' : '#fdecea' }

  async function handleSave(status: string) {
    setSaving(true)
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) { router.push('/admin/login'); return }
    const { error } = await supabase.from('articles').insert({ ...form, content: editor?.getHTML() || '', read_time: getReadTime(), status, published: status === 'published', published_at: status === 'published' ? new Date().toISOString() : null })
    if (error) { alert('Error: ' + error.message); setSaving(false) }
    else { localStorage.removeItem('draft_' + session.user.id); router.push('/admin') }
  }

  const inp: any = { width: '100%', padding: '0.75rem', border: '1px solid #ede8df', fontSize: '14px', outline: 'none', boxSizing: 'border-box', backgroundColor: '#fff', fontFamily: 'inherit' }
  const lbl: any = { display: 'block', fontSize: '12px', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#4A5563', marginBottom: '0.5rem' }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f7f4ee' }}>
      <header style={{ backgroundColor: '#0e1a2b', padding: '1rem 0' }}>
        <div className="container-content" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <Link href="/admin" style={{ fontSize: '12px', color: 'rgba(247,244,238,0.6)', textDecoration: 'none' }}>← Dashboard</Link>
            <span style={{ color: 'rgba(247,244,238,0.3)' }}>|</span>
            <span style={{ fontSize: '12px', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#c9b28f' }}>New Article</span>
          </div>
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
            <span style={{ fontSize: '12px', color: 'rgba(247,244,238,0.5)' }}>{getWordCount()} words · {getReadTime()}</span>
            {autoSaved && <span style={{ fontSize: '11px', color: 'rgba(247,244,238,0.4)', fontStyle: 'italic' }}>{autoSaved}</span>}
            <button onClick={() => handleSave("draft")} disabled={saving} style={{ fontSize: '12px', fontWeight: 700, color: '#f7f4ee', backgroundColor: 'transparent', border: '1px solid rgba(247,244,238,0.3)', padding: '0.5rem 1rem', cursor: 'pointer', letterSpacing: '0.08em', textTransform: 'uppercase' }}>Save Draft</button>
            <button onClick={() => handleSave("published")} disabled={saving} style={{ fontSize: '12px', fontWeight: 700, color: '#0e1a2b', backgroundColor: '#c9b28f', border: 'none', padding: '0.5rem 1rem', cursor: 'pointer', letterSpacing: '0.08em', textTransform: 'uppercase' }}>{saving ? 'Publishing...' : 'Publish'}</button>
          </div>
        </div>
      </header>

      <div className="container-content" style={{ paddingTop: '2rem', paddingBottom: '4rem' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: '2rem', alignItems: 'start' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div><label style={lbl}>Title</label><input name="title" value={form.title} onChange={handleTitleChange} placeholder="Article title..." style={{ ...inp, fontSize: '20px', fontWeight: 600 }} /></div>
            <div><label style={lbl}>Slug</label><input name="slug" value={form.slug} onChange={handleChange} style={inp} /></div>
            <div><label style={lbl}>Excerpt</label><textarea name="excerpt" value={form.excerpt} onChange={handleChange} rows={2} placeholder="Brief description..." style={{ ...inp, resize: 'vertical' as const }} /></div>
            <div>
              <label style={lbl}>Content</label>
              <div style={{ display: 'flex', gap: '0.25rem', flexWrap: 'wrap', padding: '0.5rem', border: '1px solid #ede8df', borderBottom: 'none', backgroundColor: '#f7f4ee' }}>
                {[
                  { l: 'B', a: () => editor?.chain().focus().toggleBold().run(), act: () => !!editor?.isActive('bold') },
                  { l: 'I', a: () => editor?.chain().focus().toggleItalic().run(), act: () => !!editor?.isActive('italic') },
                  { l: 'U', a: () => editor?.chain().focus().toggleUnderline().run(), act: () => !!editor?.isActive('underline') },
                  { l: 'H1', a: () => editor?.chain().focus().toggleHeading({ level: 1 }).run(), act: () => !!editor?.isActive('heading', { level: 1 }) },
                  { l: 'H2', a: () => editor?.chain().focus().toggleHeading({ level: 2 }).run(), act: () => !!editor?.isActive('heading', { level: 2 }) },
                  { l: 'H3', a: () => editor?.chain().focus().toggleHeading({ level: 3 }).run(), act: () => !!editor?.isActive('heading', { level: 3 }) },
                  { l: '• List', a: () => editor?.chain().focus().toggleBulletList().run(), act: () => !!editor?.isActive('bulletList') },
                  { l: '1. List', a: () => editor?.chain().focus().toggleOrderedList().run(), act: () => !!editor?.isActive('orderedList') },
                  { l: '" Quote', a: () => editor?.chain().focus().toggleBlockquote().run(), act: () => !!editor?.isActive('blockquote') },
                  { l: 'Undo', a: () => editor?.chain().focus().undo().run(), act: () => false },
                  { l: 'Redo', a: () => editor?.chain().focus().redo().run(), act: () => false },
                ].map(({ l, a, act }) => <button key={l} onClick={a} className={act() ? 'tb on' : 'tb'}>{l}</button>)}
              </div>
              <div style={{ border: '1px solid #ede8df', backgroundColor: '#fff' }}><EditorContent editor={editor} /></div>
            </div>

            <div style={{ backgroundColor: '#fff', border: '1px solid #ede8df', padding: '1.5rem' }}>
              <p style={{ fontSize: '13px', fontWeight: 700, color: '#0e1a2b', marginBottom: '1rem', textTransform: 'uppercase', letterSpacing: '0.08em' }}>AI Article Suggestions</p>
              <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
                <input value={suggestKeyword} onChange={e => setSuggestKeyword(e.target.value)} onKeyDown={e => e.key === 'Enter' && fetchSuggestions(suggestKeyword)} placeholder="Enter keyword..." style={{ ...inp, fontSize: '13px' }} />
                <button onClick={() => fetchSuggestions(suggestKeyword)} disabled={suggestLoading} style={{ padding: '0.75rem 1rem', backgroundColor: '#0e1a2b', color: '#f7f4ee', fontSize: '12px', fontWeight: 700, border: 'none', cursor: 'pointer', textTransform: 'uppercase', letterSpacing: '0.08em', whiteSpace: 'nowrap' }}>{suggestLoading ? '...' : 'Suggest'}</button>
              </div>
              {suggestions.existing.length > 0 && (
                <div style={{ marginBottom: '1rem' }}>
                  <p style={{ fontSize: '11px', fontWeight: 700, color: '#9a9085', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.5rem' }}>Link to existing articles</p>
                  {suggestions.existing.map((a: any) => (
                    <a key={a.slug} href={`/articles/${a.slug}`} target="_blank" style={{ display: 'block', fontSize: '12px', color: '#c9b28f', textDecoration: 'none', marginBottom: '0.25rem', padding: '0.25rem 0', borderBottom: '1px solid #f0ede8' }}>→ {a.title}</a>
                  ))}
                </div>
              )}
              {suggestions.topics.length > 0 && (
                <div>
                  <p style={{ fontSize: '11px', fontWeight: 700, color: '#9a9085', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.5rem' }}>New article ideas</p>
                  {suggestions.topics.map((t: string) => (
                    <p key={t} style={{ fontSize: '12px', color: '#0e1a2b', marginBottom: '0.25rem', padding: '0.25rem 0', borderBottom: '1px solid #f0ede8', cursor: 'pointer' }}>+ {t}</p>
                  ))}
                </div>
              )}
            </div>

            <div style={{ backgroundColor: '#fff', border: '1px solid #ede8df', padding: '1.5rem' }}>
              <p style={{ fontSize: '13px', fontWeight: 700, color: '#0e1a2b', marginBottom: '1rem', textTransform: 'uppercase', letterSpacing: '0.08em' }}>SEO Settings</p>
              <div style={{ marginBottom: '1rem' }}><label style={lbl}>Meta Title ({form.meta_title.length}/60)</label><input name="meta_title" value={form.meta_title} onChange={handleChange} style={inp} /></div>
              <div><label style={lbl}>Meta Description ({form.meta_description.length}/160)</label><textarea name="meta_description" value={form.meta_description} onChange={handleChange} rows={2} style={{ ...inp, resize: 'vertical' as const }} /></div>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', position: 'sticky', top: '1rem' }}>
            <div style={{ backgroundColor: '#fff', border: '1px solid #ede8df', padding: '1.5rem' }}>
              <p style={{ fontSize: '13px', fontWeight: 700, color: '#0e1a2b', marginBottom: '1rem', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Article Scores</p>
              {[{ label: 'SEO', score: seoScore }, { label: 'AEO', score: aeoScore }, { label: 'Readability', score: readabilityScore }].map(({ label, score }) => (
                <div key={label} style={{ marginBottom: '1rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                    <span style={{ fontSize: '12px', fontWeight: 600, color: '#4A5563' }}>{label}</span>
                    <span style={{ fontSize: '12px', fontWeight: 700, color: scoreColor(score), backgroundColor: scoreBg(score), padding: '0.1rem 0.4rem' }}>{score}/100</span>
                  </div>
                  <div style={{ height: '6px', backgroundColor: '#f0ede8' }}><div style={{ height: '100%', width: `${score}%`, backgroundColor: scoreColor(score), transition: 'width 0.3s' }} /></div>
                </div>
              ))}
            </div>

            <div style={{ backgroundColor: '#fff', border: '1px solid #ede8df', padding: '1.5rem' }}>
              <p style={{ fontSize: '13px', fontWeight: 700, color: '#0e1a2b', marginBottom: '1rem', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Settings</p>
              <div style={{ marginBottom: '1rem' }}>
                <label style={lbl}>Tags</label>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', marginBottom: '0.5rem' }}>
                  {form.tags.map((t: string) => (
                    <span key={t} style={{ fontSize: '11px', backgroundColor: '#0e1a2b', color: '#f7f4ee', padding: '0.2rem 0.5rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                      {t}
                      <button onClick={() => removeTag(t)} style={{ background: 'none', border: 'none', color: '#c9b28f', cursor: 'pointer', fontSize: '13px', padding: 0, lineHeight: 1 }}>×</button>
                    </span>
                  ))}
                </div>
                <input value={tagInput} onChange={e => setTagInput(e.target.value)} onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addTag(tagInput) } }} placeholder="Type tag + Enter" style={{ ...inp, fontSize: '13px' }} />
              </div>
              <div style={{ marginBottom: '1rem' }}><label style={lbl}>Category</label><select name="category_id" value={form.category_id} onChange={handleChange} style={inp}><option value="">Select...</option>{categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}</select></div>
              <div style={{ marginBottom: '1rem' }}><label style={lbl}>Author</label><select name="author_id" value={form.author_id} onChange={handleChange} style={inp}><option value="">Select...</option>{authors.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}</select></div>
              <div>
                <label style={lbl}>Cover Image URL</label>
                <input name="cover_image_url" value={form.cover_image_url} onChange={handleChange} placeholder="https://..." style={inp} />
                {form.cover_image_url && <img src={form.cover_image_url} alt="preview" style={{ width: '100%', height: '120px', objectFit: 'cover', marginTop: '0.5rem' }} />}
                <a href="/api/canva/auth" style={{ display: 'block', marginTop: '0.75rem', padding: '0.6rem 1rem', backgroundColor: '#7B2FBE', color: '#fff', fontSize: '12px', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', textDecoration: 'none', textAlign: 'center' }}>🎨 Design in Canva</a>
                {showCanvaPicker && canvaDesigns.length > 0 && (
                  <div style={{ marginTop: '0.75rem', border: '1px solid #7B2FBE', padding: '1rem', backgroundColor: '#faf5ff' }}>
                    <p style={{ fontSize: '12px', fontWeight: 700, color: '#7B2FBE', marginBottom: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Your Canva Designs</p>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.5rem' }}>
                      {canvaDesigns.map((d: any) => (
                        <div key={d.id} onClick={() => { setForm(f => ({ ...f, cover_image_url: d.thumbnail?.url || '' })); setShowCanvaPicker(false) }} style={{ cursor: 'pointer' }}>
                          <img src={d.thumbnail?.url} alt={d.title} style={{ width: '100%', aspectRatio: '1', objectFit: 'cover' }} />
                          <p style={{ fontSize: '10px', color: '#4A5563', marginTop: '0.25rem', textAlign: 'center', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{d.title}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <button onClick={() => handleSave("draft")} disabled={saving} style={{ width: '100%', padding: '0.875rem', backgroundColor: 'transparent', border: '1px solid #0e1a2b', color: '#0e1a2b', fontWeight: 700, fontSize: '13px', letterSpacing: '0.08em', textTransform: 'uppercase', cursor: 'pointer' }}>Save as Draft</button>
              <button onClick={() => handleSave("review")} disabled={saving} style={{ width: '100%', padding: '0.875rem', backgroundColor: '#d4820a', color: '#fff', fontWeight: 700, fontSize: '13px', letterSpacing: '0.08em', textTransform: 'uppercase', border: 'none', cursor: 'pointer' }}>Submit for Review</button>
              <button onClick={() => handleSave("published")} disabled={saving} style={{ width: '100%', padding: '0.875rem', backgroundColor: '#0e1a2b', color: '#f7f4ee', fontWeight: 700, fontSize: '13px', letterSpacing: '0.08em', textTransform: 'uppercase', border: 'none', cursor: 'pointer' }}>{saving ? 'Publishing...' : 'Publish Article'}</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function NewArticle() {
  return <Suspense><NewArticleInner /></Suspense>
}