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
import Color from '@tiptap/extension-color'
import TextStyle from '@tiptap/extension-text-style'
import Highlight from '@tiptap/extension-highlight'
import Typography from '@tiptap/extension-typography'
import CharacterCount from '@tiptap/extension-character-count'
import HorizontalRule from '@tiptap/extension-horizontal-rule'
import Subscript from '@tiptap/extension-subscript'
import Superscript from '@tiptap/extension-superscript'

function NewArticleInner() {
  const router = useRouter()
  const [categories, setCategories] = useState<any[]>([])
  const [subcategories, setSubcategories] = useState<any[]>([])
  const [authors, setAuthors] = useState<any[]>([])
  const [saving, setSaving] = useState(false)
  const [autoSaved, setAutoSaved] = useState('')
  const [suggestions, setSuggestions] = useState<{existing: string[], topics: string[]}>({existing: [], topics: []})
  const [suggestLoading, setSuggestLoading] = useState(false)
  const [suggestKeyword, setSuggestKeyword] = useState('')
  const [seoScore, setSeoScore] = useState(0)
  const [aeoScore, setAeoScore] = useState(0)
  const [readabilityScore, setReadabilityScore] = useState(0)
  const [form, setForm] = useState({ title: '', slug: '', excerpt: '', cover_image_url: '', category_id: '', author_id: '', meta_title: '', meta_description: '', status: 'draft', social_title: '', social_description: '', facebook_teaser_text: '', external_url: '', subcategory_id: '', layout: 'standard' })
  const [canvaDesigns, setCanvaDesigns] = useState<any[]>([])
  const [showCanvaPicker, setShowCanvaPicker] = useState(false)
  const searchParams = useSearchParams()

  const editor = useEditor({
    extensions: [
      StarterKit, Underline, TiptapImage,
      LinkExtension.configure({ openOnClick: false }),
      Placeholder.configure({ placeholder: 'Write your article here...' }),
      TextAlign.configure({ types: ['heading', 'paragraph'] }),
    Color,
    TextStyle,
    Highlight.configure({ multicolor: true }),
    Typography,
    CharacterCount,
    HorizontalRule,
    Subscript,
    Superscript,
    ],
    content: '',
    onUpdate: ({ editor }) => {
      const text = editor.getText()
      const words = text.split(/\s+/).filter(Boolean).length
      calcScores(form.title, text, words)
    },
  })

  function calcScores(title: string, content: string, words: number) {
    const tl = title.toLowerCase()
    const cl = content.toLowerCase()
    const sentences = content.split(/[.!?]+/).filter(Boolean)
    const paragraphs = content.split(/\n+/).filter(Boolean)
    const hasH2 = content.includes('<h2')
    const hasH3 = content.includes('<h3')
    const hasLinks = content.includes('<a ')
    const hasImages = content.includes('<img')
    const metaDescLen = form.meta_description.length
    const metaTitleLen = form.meta_title.length

    // SEO Score (100 points)
    let seo = 0
    if (title.length >= 30 && title.length <= 65) seo += 15       // Title length optimal
    else if (title.length > 0) seo += 7
    if (metaTitleLen >= 30 && metaTitleLen <= 65) seo += 15        // Meta title optimal
    else if (metaTitleLen > 0) seo += 7
    if (metaDescLen >= 120 && metaDescLen <= 160) seo += 15        // Meta desc optimal
    else if (metaDescLen > 0) seo += 7
    if (words >= 800) seo += 15                                     // Long form content
    else if (words >= 300) seo += 8
    if (form.excerpt.length > 50) seo += 10                        // Has excerpt
    if (hasH2) seo += 10                                           // Has H2 headings
    if (hasH3) seo += 5                                            // Has H3 headings
    if (hasLinks) seo += 10                                        // Has links
    if (hasImages) seo += 5                                        // Has images
    setSeoScore(Math.min(100, seo))

    // AEO Score (100 points) - Answer Engine Optimization
    let aeo = 0
    const questionWords = ['?', 'how', 'what', 'why', 'when', 'where', 'who', 'which', 'best', 'top', 'vs', 'versus', 'guide', 'tips', 'ways']
    const questionMatches = questionWords.filter(w => tl.includes(w)).length
    aeo += Math.min(20, questionMatches * 5)                       // Question intent in title
    if (content.includes('?')) aeo += 15                           // Questions in content
    if (words >= 800) aeo += 20                                    // Comprehensive content
    else if (words >= 400) aeo += 10
    if (form.excerpt.length >= 100) aeo += 15                      // Detailed excerpt
    else if (form.excerpt.length > 0) aeo += 7
    if (hasH2 && hasH3) aeo += 15                                  // Structured headings
    else if (hasH2) aeo += 8
    const listItems = (content.match(/<li/g) || []).length
    if (listItems >= 3) aeo += 15                                  // Has lists (featured snippets)
    setAeoScore(Math.min(100, aeo))

    // Readability Score (100 points)
    const avg = sentences.length > 0 ? words / sentences.length : 0
    let read = 100
    if (avg > 30) read -= 30
    else if (avg > 25) read -= 20
    else if (avg > 20) read -= 10
    if (words < 300) read -= 25
    else if (words < 150) read -= 40
    const longSentences = sentences.filter(s => s.split(' ').length > 30).length
    const longPct = sentences.length > 0 ? longSentences / sentences.length : 0
    if (longPct > 0.3) read -= 15
    if (paragraphs.length < 3 && words > 200) read -= 10
    setReadabilityScore(Math.max(0, Math.min(100, read)))
  }

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
        setForm({ title: d.title||'', slug: d.slug||'', excerpt: d.excerpt||'', cover_image_url: d.cover_image_url||'', category_id: d.category_id||'', author_id: d.author_id||'', meta_title: d.meta_title||'', meta_description: d.meta_description||'', status: d.status||'draft', social_title: d.social_title||'', social_description: d.social_description||'', facebook_teaser_text: d.facebook_teaser_text||'', external_url: d.external_url||'', subcategory_id: d.subcategory_id||'', layout: d.layout||'standard' })
        if (editor && d.content) editor.commands.setContent(d.content)
        setAutoSaved('Draft restored')
      }
    }
    if (editor) loadDraft()
  }, [editor])

  function handleChange(e: any) {
    const { name, value } = e.target
    setForm(f => ({ ...f, [name]: value }))
  }

  function handleTitleChange(e: any) {
    const title = e.target.value
    const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
    setForm(f => ({ ...f, title, slug, meta_title: title, social_title: title }))
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
            <button onClick={() => handleSave('draft')} disabled={saving} style={{ fontSize: '12px', fontWeight: 700, color: '#f7f4ee', backgroundColor: 'transparent', border: '1px solid rgba(247,244,238,0.3)', padding: '0.5rem 1rem', cursor: 'pointer', letterSpacing: '0.08em', textTransform: 'uppercase' }}>Save Draft</button>
            <button onClick={() => handleSave('published')} disabled={saving} style={{ fontSize: '12px', fontWeight: 700, color: '#0e1a2b', backgroundColor: '#c9b28f', border: 'none', padding: '0.5rem 1rem', cursor: 'pointer', letterSpacing: '0.08em', textTransform: 'uppercase' }}>{saving ? 'Publishing...' : 'Publish'}</button>
          </div>
        </div>
      </header>

      <div className="container-content" style={{ paddingTop: '2rem', paddingBottom: '4rem' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: '2rem', alignItems: 'start' }}>

          {/* LEFT COLUMN */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div style={{ padding: '1.25rem', backgroundColor: '#f7f4ee', border: '1px solid #ede8df' }}>
              <label style={lbl}>Choose Article Layout</label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.75rem', marginTop: '0.5rem' }}>
                {[
                  { value: 'standard', label: 'Standard', desc: 'Best for most articles. Ideal for SEO.', preview: '<rect x="0" y="0" width="80" height="45" fill="#e8e4de"/><rect x="0" y="0" width="80" height="18" fill="#c9b28f" opacity="0.5"/><rect x="5" y="22" width="50" height="3" fill="#0e1a2b" rx="1"/><rect x="5" y="28" width="70" height="2" fill="#9a9085" rx="1"/><rect x="5" y="33" width="60" height="2" fill="#9a9085" rx="1"/><rect x="5" y="38" width="65" height="2" fill="#9a9085" rx="1"/>' },
                  { value: 'magazine', label: 'Magazine', desc: 'Bold visual impact. Title on full-screen image. Best for features.', preview: '<rect x="0" y="0" width="80" height="45" fill="#4A5563"/><rect x="0" y="0" width="80" height="45" fill="url(#g)" opacity="0.8"/><defs><linearGradient id="g" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="transparent"/><stop offset="100%" stop-color="#0e1a2b"/></linearGradient></defs><rect x="5" y="28" width="55" height="4" fill="#f7f4ee" rx="1"/><rect x="5" y="35" width="40" height="2" fill="rgba(247,244,238,0.6)" rx="1"/>' },
                  { value: 'longform', label: 'Long Form', desc: 'Best for deep dives. Dark header draws readers in. Strongest for AEO.', preview: '<rect x="0" y="0" width="80" height="45" fill="#f7f4ee"/><rect x="0" y="0" width="80" height="20" fill="#0e1a2b"/><rect x="5" y="6" width="45" height="3" fill="#c9b28f" rx="1"/><rect x="5" y="12" width="60" height="3" fill="#f7f4ee" rx="1"/><rect x="5" y="25" width="70" height="2" fill="#9a9085" rx="1"/><rect x="5" y="30" width="65" height="2" fill="#9a9085" rx="1"/><rect x="5" y="35" width="60" height="2" fill="#9a9085" rx="1"/>' },
                  { value: 'magazine', label: 'Magazine', desc: 'Bold visual impact. Title overlays a full-screen image. Best for features and trending stories.' },
                  { value: 'longform', label: 'Long Form', desc: 'Best for deep dives and guides. Dark intro header draws readers in. Strongest for AEO.' },
                ].map(opt => (
                  <button key={opt.value} type="button" onClick={() => setForm(f => ({ ...f, layout: opt.value }))} style={{ padding: "0.75rem", border: "2px solid " + (form.layout === opt.value ? "#0e1a2b" : "#ede8df"), backgroundColor: form.layout === opt.value ? "#0e1a2b" : "#fff", color: form.layout === opt.value ? "#f7f4ee" : "#4A5563", cursor: "pointer", textAlign: "left" }}>
                    <svg viewBox="0 0 80 45" style={{ width: "100%", height: 60, display: "block", marginBottom: "0.5rem" }} dangerouslySetInnerHTML={{ __html: opt.preview }} />
                    <div style={{ fontWeight: 700, fontSize: "12px", letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: "0.25rem" }}>{opt.label}</div>
                    <div style={{ fontSize: "11px", opacity: 0.75, lineHeight: 1.4 }}>{opt.desc}</div>
                ))}
              </div>
            </div>
            <div>
              <label style={lbl}>Title</label>
              <input name="title" value={form.title} onChange={handleTitleChange} placeholder="Article title..." style={{ ...inp, fontSize: '20px', fontWeight: 600 }} />
            </div>
            <div>
              <label style={lbl}>Slug</label>
              <input name="slug" value={form.slug} onChange={handleChange} style={inp} />
            </div>
            <div>
              <label style={lbl}>Excerpt</label>
              <textarea name="excerpt" value={form.excerpt} onChange={handleChange} rows={2} placeholder="Brief description..." style={{ ...inp, resize: 'vertical' as const }} />
            {/* CONTENT EDITOR */}
            <div>
              <label style={lbl}>Content</label>
              <style>{`
                .editor-btn { padding: 0.3rem 0.5rem; background: transparent; border: none; cursor: pointer; border-radius: 3px; color: #f7f4ee; display:inline-flex; align-items:center; justify-content:center; font-size:12px; font-weight:600; transition: background 0.1s; }
                .editor-btn:hover { background: rgba(201,178,143,0.2); }
                .editor-btn.active { background: #c9b28f; color: #0e1a2b; }
                .editor-divider { width:1px; height:18px; background:rgba(255,255,255,0.15); margin:0 0.25rem; flex-shrink:0; }
                .ProseMirror { outline: none; min-height: 480px; }
                .ProseMirror h1 { font-family: Georgia, serif; font-size: 2rem; font-weight: 700; margin: 1.5rem 0 0.75rem; }
                .ProseMirror h2 { font-family: Georgia, serif; font-size: 1.5rem; font-weight: 700; margin: 1.25rem 0 0.5rem; }
                .ProseMirror h3 { font-family: Georgia, serif; font-size: 1.2rem; font-weight: 700; margin: 1rem 0 0.5rem; }
                .ProseMirror p { margin: 0 0 1rem; line-height: 1.8; }
                .ProseMirror blockquote { border-left: 3px solid #c9b28f; padding-left: 1rem; margin: 1.5rem 0; color: #4A5563; font-style: italic; }
                .ProseMirror ul, .ProseMirror ol { padding-left: 1.5rem; margin: 0 0 1rem; }
                .ProseMirror li { margin-bottom: 0.4rem; line-height: 1.7; }
                .ProseMirror hr { border: none; border-top: 2px solid #ede8df; margin: 2rem 0; }
                .ProseMirror code { background: #f0ede8; padding: 0.15rem 0.4rem; border-radius: 3px; font-size: 0.9em; }
                .ProseMirror mark { background: #fff3cd; padding: 0.1rem 0.2rem; border-radius: 2px; }
                .ProseMirror p.is-editor-empty:first-child::before { content: attr(data-placeholder); color: #9a9085; pointer-events: none; float: left; height: 0; }
              `}</style>
              {/* TOOLBAR */}
              <div style={{ display: 'flex', gap: '0.1rem', flexWrap: 'wrap', padding: '0.5rem 0.75rem', border: '1px solid #ede8df', borderBottom: 'none', backgroundColor: '#1B1D21', alignItems: 'center' }}>
                {/* Format */}
                <button className={`editor-btn${editor?.isActive('bold') ? ' active' : ''}`} onClick={() => editor?.chain().focus().toggleBold().run()} title="Bold (Cmd+B)"><b>B</b></button>
                <button className={`editor-btn${editor?.isActive('italic') ? ' active' : ''}`} onClick={() => editor?.chain().focus().toggleItalic().run()} title="Italic (Cmd+I)"><i>I</i></button>
                <button className={`editor-btn${editor?.isActive('underline') ? ' active' : ''}`} onClick={() => editor?.chain().focus().toggleUnderline().run()} title="Underline (Cmd+U)"><u>U</u></button>
                <button className={`editor-btn${editor?.isActive('strike') ? ' active' : ''}`} onClick={() => editor?.chain().focus().toggleStrike().run()} title="Strikethrough"><s>S</s></button>
                <div className="editor-divider"/>
                {/* Headings */}
                <button className={`editor-btn${editor?.isActive('heading',{level:1}) ? ' active' : ''}`} onClick={() => editor?.chain().focus().toggleHeading({level:1}).run()} title="Heading 1">H1</button>
                <button className={`editor-btn${editor?.isActive('heading',{level:2}) ? ' active' : ''}`} onClick={() => editor?.chain().focus().toggleHeading({level:2}).run()} title="Heading 2">H2</button>
                <button className={`editor-btn${editor?.isActive('heading',{level:3}) ? ' active' : ''}`} onClick={() => editor?.chain().focus().toggleHeading({level:3}).run()} title="Heading 3">H3</button>
                <div className="editor-divider"/>
                {/* Lists */}
                <button className={`editor-btn${editor?.isActive('bulletList') ? ' active' : ''}`} onClick={() => editor?.chain().focus().toggleBulletList().run()} title="Bullet List">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="9" y1="6" x2="20" y2="6"/><line x1="9" y1="12" x2="20" y2="12"/><line x1="9" y1="18" x2="20" y2="18"/><circle cx="4" cy="6" r="1.5" fill="currentColor" stroke="none"/><circle cx="4" cy="12" r="1.5" fill="currentColor" stroke="none"/><circle cx="4" cy="18" r="1.5" fill="currentColor" stroke="none"/></svg>
                </button>
                <button className={`editor-btn${editor?.isActive('orderedList') ? ' active' : ''}`} onClick={() => editor?.chain().focus().toggleOrderedList().run()} title="Numbered List">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="10" y1="6" x2="21" y2="6"/><line x1="10" y1="12" x2="21" y2="12"/><line x1="10" y1="18" x2="21" y2="18"/><text x="2" y="8" fontSize="7" fill="currentColor" stroke="none">1</text><text x="2" y="14" fontSize="7" fill="currentColor" stroke="none">2</text><text x="2" y="20" fontSize="7" fill="currentColor" stroke="none">3</text></svg>
                </button>
                <button className={`editor-btn${editor?.isActive('blockquote') ? ' active' : ''}`} onClick={() => editor?.chain().focus().toggleBlockquote().run()} title="Blockquote">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M3 21c3 0 7-1 7-8V5c0-1.25-.756-2.017-2-2H4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2 1 0 1 0 1 1v1c0 1-1 2-2 2s-1 .008-1 1.031V20c0 1 0 1 1 1zm12 0c3 0 7-1 7-8V5c0-1.25-.757-2.017-2-2h-4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2h.75c0 2.25.25 4-2.75 4v3c0 1 0 1 1 1z"/></svg>
                </button>
                <div className="editor-divider"/>
                {/* Highlight + HR */}
                <button className={`editor-btn${editor?.isActive('highlight') ? ' active' : ''}`} onClick={() => editor?.chain().focus().toggleHighlight().run()} title="Highlight text">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                </button>
                <button className="editor-btn" onClick={() => editor?.chain().focus().setHorizontalRule().run()} title="Insert divider line">—</button>
                <button className={`editor-btn${editor?.isActive('subscript') ? ' active' : ''}`} onClick={() => editor?.chain().focus().toggleSubscript().run()} title="Subscript">X₂</button>
                <button className={`editor-btn${editor?.isActive('superscript') ? ' active' : ''}`} onClick={() => editor?.chain().focus().toggleSuperscript().run()} title="Superscript">X²</button>
                <div className="editor-divider"/>
                {/* Align */}
                <button className={`editor-btn${editor?.isActive({textAlign:'left'}) ? ' active' : ''}`} onClick={() => editor?.chain().focus().setTextAlign('left').run()} title="Align left">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="15" y2="12"/><line x1="3" y1="18" x2="18" y2="18"/></svg>
                </button>
                <button className={`editor-btn${editor?.isActive({textAlign:'center'}) ? ' active' : ''}`} onClick={() => editor?.chain().focus().setTextAlign('center').run()} title="Center">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="3" y1="6" x2="21" y2="6"/><line x1="6" y1="12" x2="18" y2="12"/><line x1="4" y1="18" x2="20" y2="18"/></svg>
                </button>
                <button className={`editor-btn${editor?.isActive({textAlign:'right'}) ? ' active' : ''}`} onClick={() => editor?.chain().focus().setTextAlign('right').run()} title="Align right">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="3" y1="6" x2="21" y2="6"/><line x1="9" y1="12" x2="21" y2="12"/><line x1="6" y1="18" x2="21" y2="18"/></svg>
                </button>
                <div className="editor-divider"/>
                {/* Undo/Redo */}
                <button className="editor-btn" onClick={() => editor?.chain().focus().undo().run()} title="Undo (Cmd+Z)">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="9 14 4 9 9 4"/><path d="M20 20v-7a4 4 0 0 0-4-4H4"/></svg>
                </button>
                <button className="editor-btn" onClick={() => editor?.chain().focus().redo().run()} title="Redo (Cmd+Shift+Z)">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="15 14 20 9 15 4"/><path d="M4 20v-7a4 4 0 0 1 4-4h12"/></svg>
                </button>
                <div style={{flex:1}}/>
                {/* Character count */}
                <span style={{fontSize:10,color:'rgba(247,244,238,0.4)',letterSpacing:'0.05em'}}>{editor?.storage?.characterCount?.words() || 0} words</span>
              </div>
              {/* WRITING AREA */}
              <div style={{ border: '1px solid #ede8df', minHeight: '520px', padding: form.layout === 'longform' ? '2.5rem 3rem' : form.layout === 'magazine' ? '2rem' : '1.75rem', backgroundColor: form.layout === 'longform' ? '#0e1a2b' : '#fff', color: form.layout === 'longform' ? '#f7f4ee' : '#0e1a2b', fontFamily: form.layout === 'magazine' ? 'Georgia, serif' : 'system-ui, sans-serif', lineHeight: 1.8, borderTop: 'none', fontSize: form.layout === 'longform' ? '17px' : '15px' }}>
                <EditorContent editor={editor} />
              </div>
              <div style={{ padding: '0.4rem 0.75rem', backgroundColor: '#f7f4ee', border: '1px solid #ede8df', borderTop: 'none', display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ fontSize: '11px', color: '#9a9085' }}>Tip: Select text to format • Cmd+B bold • Cmd+I italic • Cmd+Z undo</span>
                <span style={{ fontSize: '11px', color: '#9a9085', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{form.layout}</span>
              </div>
            </div>
              </div>
            </div>

            {/* AI ARTICLE SUGGESTIONS */}
            <div style={{ backgroundColor: '#fff', border: '1px solid #ede8df', padding: '1.5rem' }}>
              <p style={{ fontSize: '13px', fontWeight: 700, color: '#0e1a2b', marginBottom: '1rem', textTransform: 'uppercase' as const, letterSpacing: '0.08em' }}>AI Article Suggestions</p>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <input
                  type="text"
                  placeholder="Enter keyword..."
                  value={suggestKeyword}
                  onChange={(e) => setSuggestKeyword(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && fetchSuggestions(suggestKeyword)}
                  style={{ ...inp, flex: 1 }}
                />
                <button
                  onClick={() => fetchSuggestions(suggestKeyword)}
                  disabled={suggestLoading}
                  style={{ padding: '0.75rem 1.25rem', backgroundColor: '#0e1a2b', color: '#fff', border: 'none', fontWeight: 700, fontSize: '12px', letterSpacing: '0.08em', textTransform: 'uppercase' as const, cursor: 'pointer', whiteSpace: 'nowrap' as const }}
                >
                  {suggestLoading ? 'Loading...' : 'SUGGEST'}
                </button>
              </div>
              {suggestions.existing.length > 0 && (
                <div style={{ marginTop: '1.25rem' }}>
                  <p style={{ fontSize: '11px', fontWeight: 700, color: '#4A5563', marginBottom: '0.5rem', textTransform: 'uppercase' as const, letterSpacing: '0.08em' }}>Existing Articles to Link</p>
                  {suggestions.existing.map((article, idx) => (
                    <div key={idx} style={{ fontSize: '13px', color: '#0e1a2b', marginBottom: '0.4rem', paddingLeft: '0.75rem', borderLeft: '2px solid #c9b28f' }}>• {article}</div>
                  ))}
                </div>
              )}
              {suggestions.topics.length > 0 && (
                <div style={{ marginTop: '1.25rem' }}>
                  <p style={{ fontSize: '11px', fontWeight: 700, color: '#4A5563', marginBottom: '0.5rem', textTransform: 'uppercase' as const, letterSpacing: '0.08em' }}>New Topic Ideas</p>
                  {suggestions.topics.map((topic, idx) => (
                    <div key={idx} style={{ fontSize: '13px', color: '#0e1a2b', marginBottom: '0.4rem', paddingLeft: '0.75rem', borderLeft: '2px solid #c9b28f' }}>• {topic}</div>
                  ))}
                </div>
              )}
            </div>

            {/* SEO SETTINGS */}
            <div style={{ backgroundColor: '#fff', border: '1px solid #ede8df', padding: '1.5rem' }}>
              <p style={{ fontSize: '13px', fontWeight: 700, color: '#0e1a2b', marginBottom: '1rem', textTransform: 'uppercase' as const, letterSpacing: '0.08em' }}>SEO Settings</p>
              <div style={{ marginBottom: '1rem' }}>
                <label style={lbl}>Meta Title ({form.meta_title.length}/60)</label>
                <input name="meta_title" value={form.meta_title} onChange={handleChange} style={inp} />
              </div>
              <div>
                <label style={lbl}>Meta Description ({form.meta_description.length}/160)</label>
                <textarea name="meta_description" value={form.meta_description} onChange={handleChange} rows={3} style={{ ...inp, resize: 'vertical' as const }} />
              </div>
            </div>

            {/* FACEBOOK / SOCIAL */}
            <div style={{ backgroundColor: '#fff', border: '1px solid #ede8df', padding: '1.5rem' }}>
              <p style={{ fontSize: '13px', fontWeight: 700, color: '#0e1a2b', marginBottom: '1rem', textTransform: 'uppercase' as const, letterSpacing: '0.08em' }}>Facebook &amp; Social</p>
              <div style={{ marginBottom: '1rem' }}>
                <label style={lbl}>Social Title</label>
                <input name="social_title" value={form.social_title} onChange={handleChange} placeholder="Defaults to meta title" style={inp} />
              </div>
              <div style={{ marginBottom: '1rem' }}>
                <label style={lbl}>Social Description</label>
                <textarea name="social_description" value={form.social_description} onChange={handleChange} rows={2} placeholder="Defaults to meta description" style={{ ...inp, resize: 'vertical' as const }} />
              </div>
              <div>
                <label style={lbl}>Facebook Teaser Text</label>
                <textarea name="facebook_teaser_text" value={form.facebook_teaser_text} onChange={handleChange} rows={3} placeholder="2-3 sentence teaser for Facebook posts..." style={{ ...inp, resize: 'vertical' as const }} />
              </div>
            </div>
          </div>

          {/* RIGHT SIDEBAR */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', position: 'sticky', top: '1rem' }}>

            {/* ARTICLE SCORES */}
            <div style={{ backgroundColor: '#fff', border: '1px solid #ede8df', padding: '1.5rem' }}>
              <p style={{ fontSize: '13px', fontWeight: 700, color: '#0e1a2b', marginBottom: '1rem', textTransform: 'uppercase' as const, letterSpacing: '0.08em' }}>Article Scores</p>
              {[{ label: 'SEO', score: seoScore }, { label: 'AEO', score: aeoScore }, { label: 'Readability', score: readabilityScore }].map(({ label, score }) => (
                <div key={label} style={{ marginBottom: '1rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                    <span style={{ fontSize: '12px', fontWeight: 600, color: '#4A5563' }}>{label}</span>
                    <span style={{ fontSize: '12px', fontWeight: 700, color: scoreColor(score), backgroundColor: scoreBg(score), padding: '0.1rem 0.4rem' }}>{score}/100</span>
                  </div>
                  <div style={{ height: '6px', backgroundColor: '#f0ede8' }}>
                    <div style={{ height: '100%', width: `${score}%`, backgroundColor: scoreColor(score), transition: 'width 0.3s' }} />
                  </div>
                </div>
              ))}
            </div>

            {/* SETTINGS */}
            <div style={{ backgroundColor: '#fff', border: '1px solid #ede8df', padding: '1.5rem' }}>
              <p style={{ fontSize: '13px', fontWeight: 700, color: '#0e1a2b', marginBottom: '1rem', textTransform: 'uppercase' as const, letterSpacing: '0.08em' }}>Settings</p>
              <div style={{ marginBottom: '1rem' }}>
                <label style={lbl}>Tags</label>
                <input name="tags" placeholder="Type tag + Enter" style={inp} />
              </div>
              <div style={{ marginBottom: '1rem' }}>
                <label style={lbl}>Category</label>
                <select name="category_id" value={form.category_id} onChange={handleChange} style={inp}>
                  <option value="">Select...</option>
                  {categories.filter((cat: any) => !cat.parent_id).map((cat: any) => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
                </select>
              </div>
              {subcategories.length > 0 && (
                <div style={{ marginBottom: '1rem' }}>
                  <label style={lbl}>Subcategory (optional)</label>
                  <select name="subcategory_id" value={form.subcategory_id} onChange={handleChange} style={inp}>
                    <option value="">None</option>
                    {subcategories.map((s: any) => <option key={s.id} value={s.id}>{s.name}</option>)}
                  </select>
                </div>
              )}
              <div style={{ marginBottom: '1rem' }}>
                <label style={lbl}>Author</label>
                <select name="author_id" value={form.author_id} onChange={handleChange} style={inp}>
                  <option value="">Select...</option>
                  {authors.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
                </select>
              </div>
              <div>
                <label style={lbl}>Cover Image URL</label>
                <input name="cover_image_url" value={form.cover_image_url} onChange={handleChange} placeholder="https://..." style={inp} />
                {form.cover_image_url && <img src={form.cover_image_url} alt="preview" style={{ width: '100%', height: '120px', objectFit: 'cover', marginTop: '0.5rem' }} />}
                <a href="/api/canva/auth" style={{ display: 'block', marginTop: '0.75rem', padding: '0.6rem 1rem', backgroundColor: '#7B2FBE', color: '#fff', fontSize: '12px', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase' as const, textDecoration: 'none', textAlign: 'center' as const }}>🎨 Design in Canva</a>
                {showCanvaPicker && canvaDesigns.length > 0 && (
                  <div style={{ marginTop: '0.75rem', border: '1px solid #7B2FBE', padding: '1rem', backgroundColor: '#faf5ff' }}>
                    <p style={{ fontSize: '12px', fontWeight: 700, color: '#7B2FBE', marginBottom: '0.75rem', textTransform: 'uppercase' as const, letterSpacing: '0.08em' }}>Your Canva Designs</p>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.5rem' }}>
                      {canvaDesigns.map((d: any) => (
                        <div key={d.id} onClick={() => { setForm(f => ({ ...f, cover_image_url: d.thumbnail?.url || '' })); setShowCanvaPicker(false) }} style={{ cursor: 'pointer' }}>
                          <img src={d.thumbnail?.url} alt={d.title} style={{ width: '100%', aspectRatio: '1', objectFit: 'cover' }} />
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* ACTION BUTTONS */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <button onClick={() => handleSave('draft')} disabled={saving} style={{ width: '100%', padding: '0.875rem', backgroundColor: 'transparent', border: '1px solid #0e1a2b', color: '#0e1a2b', fontWeight: 700, fontSize: '13px', letterSpacing: '0.08em', textTransform: 'uppercase' as const, cursor: 'pointer' }}>Save as Draft</button>
              <button onClick={() => handleSave('review')} disabled={saving} style={{ width: '100%', padding: '0.875rem', backgroundColor: '#d4820a', color: '#fff', fontWeight: 700, fontSize: '13px', letterSpacing: '0.08em', textTransform: 'uppercase' as const, border: 'none', cursor: 'pointer' }}>Submit for Review</button>
              <button onClick={() => handleSave('published')} disabled={saving} style={{ width: '100%', padding: '0.875rem', backgroundColor: '#0e1a2b', color: '#f7f4ee', fontWeight: 700, fontSize: '13px', letterSpacing: '0.08em', textTransform: 'uppercase' as const, border: 'none', cursor: 'pointer' }}>{saving ? 'Publishing...' : 'Publish Article'}</button>
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
