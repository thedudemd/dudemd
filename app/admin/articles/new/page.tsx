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
import TextStyle from '@tiptap/extension-text-style'
import Color from '@tiptap/extension-color'
import Highlight from '@tiptap/extension-highlight'
import Subscript from '@tiptap/extension-subscript'
import Superscript from '@tiptap/extension-superscript'
import HorizontalRule from '@tiptap/extension-horizontal-rule'
import CharacterCount from '@tiptap/extension-character-count'

function NewArticleInner() {
  const router = useRouter()
  const [categories, setCategories] = useState<any[]>([])
  const [subcategories, setSubcategories] = useState<any[]>([])
  const [tagInput, setTagInput] = useState("")
  const [authors, setAuthors] = useState<any[]>([])
  const [saving, setSaving] = useState(false)
  const [autoSaved, setAutoSaved] = useState('')
  const [suggestions, setSuggestions] = useState<{existing: string[], topics: string[]}>({existing: [], topics: []})
  const [suggestLoading, setSuggestLoading] = useState(false)
  const [suggestKeyword, setSuggestKeyword] = useState('')
  const [seoScore, setSeoScore] = useState(0)
  const [aeoScore, setAeoScore] = useState(0)
  const [readabilityScore, setReadabilityScore] = useState(0)
  const [form, setForm] = useState({ title: '', slug: '', excerpt: '', cover_image_url: '', category_id: '', author_id: '', meta_title: '', meta_description: '', status: 'draft', social_title: '', social_description: '', facebook_teaser_text: '', external_url: '', subcategory_id: '', layout: 'standard', tags: [] })
  const [canvaDesigns, setCanvaDesigns] = useState<any[]>([])
  const [showCanvaPicker, setShowCanvaPicker] = useState(false)
  const searchParams = useSearchParams()

  const editor = useEditor({
    extensions: [
      StarterKit, Underline, TiptapImage,
      LinkExtension.configure({ openOnClick: false }),
      Placeholder.configure({ placeholder: 'Write your article here...' }),
      TextAlign.configure({ types: ['heading', 'paragraph'] }),
      TextStyle, Color, Highlight.configure({ multicolor: true }), Subscript, Superscript, HorizontalRule, CharacterCount,
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
        setForm({ title: d.title||'', slug: d.slug||'', excerpt: d.excerpt||'', cover_image_url: d.cover_image_url||'', category_id: d.category_id||'', author_id: d.author_id||'', meta_title: d.meta_title||'', meta_description: d.meta_description||'', status: d.status||'draft', social_title: d.social_title||'', social_description: d.social_description||'', facebook_teaser_text: d.facebook_teaser_text||'', external_url: d.external_url||'', subcategory_id: d.subcategory_id||'', layout: d.layout||'standard', tags: d.tags||[] })
        if (editor && d.content) editor.commands.setContent(d.content)
        setAutoSaved('Draft restored')
        if (d.category_id) { supabase.from('categories').select('*').eq('parent_id', d.category_id).eq('enabled', true).order('sort_order').then(({data}) => setSubcategories(data||[])) }
        if (d.category_id) { supabase.from('categories').select('*').eq('parent_id', d.category_id).eq('enabled', true).order('sort_order').then(({data}) => setSubcategories(data||[])) }
      }
    }
    if (editor) loadDraft()
  }, [editor])

  async function handleChange(e: any) {
    const { name, value } = e.target
    setForm(f => ({ ...f, [name]: value }))
    if (name === 'category_id') {
      if (value) {
        const { data } = await supabase.from('categories').select('*').eq('parent_id', value).eq('enabled', true).order('sort_order')
        setSubcategories(data || [])
      } else {
        setSubcategories([])
      }
      setForm(f => ({ ...f, category_id: value, subcategory_id: '' }))
    }
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
                <button type="button" onClick={() => setForm(f => ({ ...f, layout: 'standard', tags: [] }))} style={{ padding: '0.75rem', border: '2px solid ' + (form.layout === 'standard' ? '#0e1a2b' : '#ede8df'), backgroundColor: form.layout === 'standard' ? '#0e1a2b' : '#fff', color: form.layout === 'standard' ? '#f7f4ee' : '#4A5563', cursor: 'pointer', textAlign: 'left' }}>
                  <div style={{ height: 55, marginBottom: '0.5rem', background: 'linear-gradient(180deg, #c9b28f 0%, #c9b28f 35%, #f7f4ee 35%)', borderRadius: 2 }} />
                  <div style={{ fontWeight: 700, fontSize: '12px', letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: '0.25rem' }}>Standard</div>
                  <div style={{ fontSize: '11px', opacity: 0.75, lineHeight: 1.4 }}>Best for most articles. Clean image on top. Ideal for SEO.</div>
                </button>
                <button type="button" onClick={() => setForm(f => ({ ...f, layout: 'magazine' }))} style={{ padding: '0.75rem', border: '2px solid ' + (form.layout === 'magazine' ? '#0e1a2b' : '#ede8df'), backgroundColor: form.layout === 'magazine' ? '#0e1a2b' : '#fff', color: form.layout === 'magazine' ? '#f7f4ee' : '#4A5563', cursor: 'pointer', textAlign: 'left' }}>
                  <div style={{ height: 55, marginBottom: '0.5rem', background: 'linear-gradient(180deg, #4A5563 0%, #0e1a2b 100%)', borderRadius: 2, display: 'flex', alignItems: 'flex-end', padding: '0.4rem' }}>
                    <div style={{ width: '70%', height: 6, background: '#f7f4ee', borderRadius: 2, opacity: 0.9 }} />
                  </div>
                  <div style={{ fontWeight: 700, fontSize: '12px', letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: '0.25rem' }}>Magazine</div>
                  <div style={{ fontSize: '11px', opacity: 0.75, lineHeight: 1.4 }}>Title overlays a full-screen image. Best for features and trending stories.</div>
                </button>
                <button type="button" onClick={() => setForm(f => ({ ...f, layout: 'longform' }))} style={{ padding: '0.75rem', border: '2px solid ' + (form.layout === 'longform' ? '#0e1a2b' : '#ede8df'), backgroundColor: form.layout === 'longform' ? '#0e1a2b' : '#fff', color: form.layout === 'longform' ? '#f7f4ee' : '#4A5563', cursor: 'pointer', textAlign: 'left' }}>
                  <div style={{ height: 55, marginBottom: '0.5rem', borderRadius: 2, overflow: 'hidden' }}>
                    <div style={{ height: '45%', background: '#0e1a2b', display: 'flex', alignItems: 'center', padding: '0 0.4rem' }}>
                      <div style={{ width: '60%', height: 4, background: '#c9b28f', borderRadius: 2 }} />
                    </div>
                    <div style={{ height: '55%', background: '#f7f4ee' }} />
                  </div>
                  <div style={{ fontWeight: 700, fontSize: '12px', letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: '0.25rem' }}>Long Form</div>
                  <div style={{ fontSize: '11px', opacity: 0.75, lineHeight: 1.4 }}>Dark intro header draws readers in. Best for deep dives. Strongest for AEO.</div>
                </button>
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
            </div>

            {/* CONTENT EDITOR */}
            <div>
              <label style={lbl}>Content</label>
              <div style={{ display: 'flex', gap: '0.25rem', flexWrap: 'wrap' as const, padding: '0.5rem', border: '1px solid #ede8df', borderBottom: 'none', backgroundColor: '#f7f4ee' }}>
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
                ].map(({ l, a, act }) => (
                  <button key={l} onClick={a} style={{ padding: '0.35rem 0.6rem', fontSize: '12px', fontWeight: 600, border: '1px solid #ede8df', backgroundColor: act() ? '#0e1a2b' : '#fff', color: act() ? '#fff' : '#0e1a2b', cursor: 'pointer' }}>{l}</button>
                ))}
                <select onChange={e => { if(e.target.value) editor?.chain().focus().updateAttributes('textStyle', { fontSize: e.target.value }).run(); else editor?.chain().focus().unsetMark('textStyle').run() }} style={{ padding: '0.3rem 0.4rem', fontSize: '12px', border: '1px solid #ede8df', backgroundColor: '#fff', cursor: 'pointer' }}><option value=''>Size</option>{['12','14','16','18','20','24','28','32','36'].map(s => <option key={s} value={s+'px'}>{s}</option>)}</select>
              </div>
              <div style={{ border: '1px solid #ede8df', backgroundColor: '#fff', minHeight: '500px', padding: '1rem' }}>
                <EditorContent editor={editor} />
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
                <div style={{ display: "flex", flexWrap: "wrap", gap: "0.4rem", marginBottom: "0.5rem" }}>{(form.tags||[]).map((t:string) => <span key={t} style={{ fontSize: "11px", backgroundColor: "#0e1a2b", color: "#f7f4ee", padding: "0.25rem 0.6rem", borderRadius: 20, display: "flex", alignItems: "center", gap: "0.35rem" }}>{t}<button type="button" onClick={() => setForm(f => ({...f, tags: f.tags.filter((x:string)=>x!==t)}))} style={{ background: "none", border: "none", color: "#c9b28f", cursor: "pointer", fontSize: 14, lineHeight: 1, padding: 0 }}>×</button></span>)}</div>
                <input value={tagInput} onChange={e=>setTagInput(e.target.value)} onKeyDown={e=>{if(e.key==="Enter"&&tagInput.trim()){e.preventDefault();setForm(f=>({...f,tags:[...(f.tags||[]),tagInput.trim()]}));setTagInput("")}}} placeholder="Type tag + Enter" style={inp} />
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
