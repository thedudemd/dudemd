'use client'
import { useEffect, useState, Suspense, useRef } from 'react'
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
import { FontSize } from '@/lib/tiptap/FontSize'
import { ResizableImage } from '@/lib/tiptap/ResizableImage'

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
  const [form, setForm] = useState({ title: '', slug: '', excerpt: '', cover_image_url: '', category_id: '', author_id: '', meta_title: '', meta_description: '', status: 'draft', social_title: '', social_description: '', facebook_teaser_text: '', external_url: '', subcategory_id: '', layout: 'standard', tags: [] as string[], show_hero: true })
  const [canvaDesigns, setCanvaDesigns] = useState<any[]>([])
  const [showCanvaPicker, setShowCanvaPicker] = useState(false)
  const [imgUploading, setImgUploading] = useState(false)
  const imgInputRef = useRef<HTMLInputElement>(null)
  const [showImgSearch, setShowImgSearch] = useState(false)
  const [imgSearchQuery, setImgSearchQuery] = useState('')
  const [imgSearchResults, setImgSearchResults] = useState<any[]>([])
  const [imgSearchLoading, setImgSearchLoading] = useState(false)
  const [imgSearchPage, setImgSearchPage] = useState(1)
  const [imgSearchHasMore, setImgSearchHasMore] = useState(false)
  const [selectedImg, setSelectedImg] = useState<any>(null)
  const [imgAlt, setImgAlt] = useState('')
  const [imgCaption, setImgCaption] = useState('')
  const [imgTitle, setImgTitle] = useState('')
  const [showAddCat, setShowAddCat] = useState(false)
  const [newCatName, setNewCatName] = useState('')
  const [newCatParent, setNewCatParent] = useState('')
  const [addingCat, setAddingCat] = useState(false)
  const [fullscreen, setFullscreen] = useState(false)
  const searchParams = useSearchParams()

  const editor = useEditor({
    extensions: [
      StarterKit, Underline, ResizableImage,
      LinkExtension.configure({ openOnClick: false }),
      Placeholder.configure({ placeholder: 'Write your article here...' }),
      TextAlign.configure({ types: ['heading', 'paragraph'] }),
      TextStyle, Color, Highlight.configure({ multicolor: true }), Subscript, Superscript, CharacterCount, FontSize,
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
    const sentences = content.split(/[.!?]+/).filter(Boolean)
    const paragraphs = content.split(/\n+/).filter(Boolean)
    const hasH2 = content.includes('<h2')
    const hasH3 = content.includes('<h3')
    const hasLinks = content.includes('<a ')
    const hasImages = content.includes('<img')
    const metaDescLen = form.meta_description.length
    const metaTitleLen = form.meta_title.length
    let seo = 0
    if (title.length >= 30 && title.length <= 65) seo += 15
    else if (title.length > 0) seo += 7
    if (metaTitleLen >= 30 && metaTitleLen <= 65) seo += 15
    else if (metaTitleLen > 0) seo += 7
    if (metaDescLen >= 120 && metaDescLen <= 160) seo += 15
    else if (metaDescLen > 0) seo += 7
    if (words >= 800) seo += 15
    else if (words >= 300) seo += 8
    if (form.excerpt.length > 50) seo += 10
    if (hasH2) seo += 10
    if (hasH3) seo += 5
    if (hasLinks) seo += 10
    if (hasImages) seo += 5
    setSeoScore(Math.min(100, seo))
    let aeo = 0
    const questionWords = ['?', 'how', 'what', 'why', 'when', 'where', 'who', 'which', 'best', 'top', 'vs', 'versus', 'guide', 'tips', 'ways']
    const questionMatches = questionWords.filter(w => tl.includes(w)).length
    aeo += Math.min(20, questionMatches * 5)
    if (content.includes('?')) aeo += 15
    if (words >= 800) aeo += 20
    else if (words >= 400) aeo += 10
    if (form.excerpt.length >= 100) aeo += 15
    else if (form.excerpt.length > 0) aeo += 7
    if (hasH2 && hasH3) aeo += 15
    else if (hasH2) aeo += 8
    const listItems = (content.match(/<li/g) || []).length
    if (listItems >= 3) aeo += 15
    setAeoScore(Math.min(100, aeo))
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

  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file || !editor) return
    setImgUploading(true)
    try {
      const fd = new FormData()
      fd.append('file', file)
      const res = await fetch('/api/upload-image', { method: 'POST', body: fd })
      const data = await res.json()
      if (data.url) { editor.chain().focus().setImage({ src: data.url }).run() }
      else { alert('Upload failed: ' + (data.error || 'Unknown error')) }
    } catch (err) { alert('Upload failed') }
    setImgUploading(false)
    if (imgInputRef.current) imgInputRef.current.value = ''
  }

  async function handleDrop(e: React.DragEvent<HTMLDivElement>) {
    const file = e.dataTransfer.files?.[0]
    if (!file || !editor) return
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
    if (!allowedTypes.includes(file.type)) return
    e.preventDefault()
    e.stopPropagation()
    setImgUploading(true)
    try {
      const fd = new FormData()
      fd.append('file', file)
      const res = await fetch('/api/upload-image', { method: 'POST', body: fd })
      const data = await res.json()
      if (data.url) { editor.chain().focus().setImage({ src: data.url }).run() }
      else { alert('Upload failed: ' + (data.error || 'Unknown error')) }
    } catch (err) { alert('Upload failed') }
    setImgUploading(false)
  }

  async function searchUnsplash(q: string, page = 1) {
    if (q.trim().length < 2) return
    setImgSearchLoading(true)
    try {
      const res = await fetch('/api/unsplash?query=' + encodeURIComponent(q) + '&page=' + page)
      const data = await res.json()
      if (page === 1) {
        setImgSearchResults(data.results || [])
      } else {
        setImgSearchResults(prev => [...prev, ...(data.results || [])])
      }
      setImgSearchHasMore((data.results || []).length === 30)
      setImgSearchPage(page)
    } catch(e) {}
    setImgSearchLoading(false)
  }

  function selectUnsplashImage(photo: any) {
    setSelectedImg(photo)
    const articleKeyword = form.title ? form.title.toLowerCase().replace(/[^a-z0-9 ]/g, '').split(' ').slice(0,6).join(' ') : ''
    const fallback = photo.alt_description || photo.photographer
    setImgAlt(articleKeyword || fallback)
    setImgTitle(articleKeyword || fallback)
    setImgCaption('')
  }

  async function insertUnsplashImage() {
    if (!selectedImg || !editor) return
    await fetch('/api/unsplash?action=download&downloadUrl=' + encodeURIComponent(selectedImg.download_url))
    const imgHtml = '<img src="' + selectedImg.url + '" alt="' + imgAlt + '" title="' + imgTitle + '" />' + (imgCaption ? '<p><em>' + imgCaption + '</em></p>' : '')
    editor.chain().focus().insertContent(imgHtml).run()
    setShowImgSearch(false)
    setSelectedImg(null)
    setImgSearchResults([])
    setImgSearchQuery('')
  }

  async function handleAddCategory() {
    if (!newCatName.trim()) return
    setAddingCat(true)
    const { data, error } = await supabase.from('categories').insert({
      name: newCatName.trim(),
      slug: newCatName.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      parent_id: newCatParent || null,
      enabled: true,
      sort_order: 0
    }).select().single()
    if (error) { alert('Error: ' + error.message) }
    else {
      if (newCatParent) {
        setSubcategories(s => [...s, data])
      } else {
        setCategories(cats => [...cats, data])
      }
      setNewCatName('')
      setNewCatParent('')
      setShowAddCat(false)
    }
    setAddingCat(false)
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
      }
    }
    if (editor) loadDraft()
  }, [editor])

  async function handleChange(e: any) {
    const { name, value } = e.target
    if (name === 'excerpt') {
      setForm(f => ({ ...f, excerpt: value, meta_description: value, social_description: value }))
      return
    }
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
    setForm(f => ({ ...f, title, slug, meta_title: title, social_title: title, meta_description: f.excerpt || f.meta_description, social_description: f.excerpt || f.social_description }))
  }

  function getWordCount() { return editor ? editor.getText().split(/\s+/).filter(Boolean).length : 0 }
  function getReadTime() { return Math.ceil(getWordCount() / 200) + ' min read' }
  function scoreColor(s: number) { return s >= 80 ? '#2d7a3a' : s >= 50 ? '#d4820a' : '#c0392b' }
  function scoreBg(s: number) { return s >= 80 ? '#e8f5ea' : s >= 50 ? '#fef3e2' : '#fdecea' }

  async function handleSave(status: string) {
    if (status === "published" && !form.cover_image_url) {
      alert("Please add a cover image before publishing.")
      return
    }
    setSaving(true)
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) { router.push('/admin/login'); return }
    // Ensure unique slug
    let finalSlug = form.slug
    const { data: existing } = await supabase.from('articles').select('id').eq('slug', finalSlug)
    if (existing && existing.length > 0) {
      finalSlug = finalSlug + '-' + Date.now().toString().slice(-4)
      setForm(f => ({ ...f, slug: finalSlug }))
    }
    const cleanForm = { ...form, slug: finalSlug, category_id: form.category_id || null, subcategory_id: form.subcategory_id || null, author_id: form.author_id || null }
    const { error } = await supabase.from('articles').insert({ ...cleanForm, content: editor?.getHTML() || '', read_time: getReadTime(), status, published: status === 'published', published_at: status === 'published' ? new Date().toISOString() : null })
    if (error) { alert('Error: ' + error.message); setSaving(false) }
    else { localStorage.removeItem('draft_' + session.user.id); router.push('/admin') }
  }

  const inp: any = { width: '100%', padding: '0.75rem', border: '1px solid #ede8df', fontSize: '14px', outline: 'none', boxSizing: 'border-box', backgroundColor: '#fff', fontFamily: 'inherit' }
  const lbl: any = { display: 'block', fontSize: '12px', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#4A5563', marginBottom: '0.5rem' }

  return (
    <>
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
              <button onClick={() => setFullscreen(f => !f)} style={{ fontSize: '12px', fontWeight: 700, color: '#f7f4ee', backgroundColor: 'transparent', border: '1px solid rgba(247,244,238,0.3)', padding: '0.5rem 1rem', cursor: 'pointer', letterSpacing: '0.08em', textTransform: 'uppercase' }}>{fullscreen ? '⊠ Exit' : '⛶ Focus'}</button>
            </div>
          </div>
        </header>
        <div className="container-content" style={{ paddingTop: '2rem', paddingBottom: '4rem' }}>
          <div style={{ display: 'grid', gridTemplateColumns: fullscreen ? '1fr' : '1fr 300px', gap: '2rem', alignItems: 'start' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <div style={{ display: fullscreen ? 'none' : 'block', padding: '1.25rem', backgroundColor: '#f7f4ee', border: '1px solid #ede8df' }}>
                <label style={lbl}>Choose Article Layout</label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.75rem', marginTop: '0.5rem' }}>
                  <button type="button" onClick={() => setForm(f => ({ ...f, layout: 'standard' }))} style={{ padding: '0.75rem', border: '2px solid ' + (form.layout === 'standard' ? '#0e1a2b' : '#ede8df'), backgroundColor: form.layout === 'standard' ? '#0e1a2b' : '#fff', color: form.layout === 'standard' ? '#f7f4ee' : '#4A5563', cursor: 'pointer', textAlign: 'left' }}>
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
              <div style={{ display: fullscreen ? 'none' : 'block' }}>
                <label style={lbl}>Title</label>
                <input name="title" value={form.title} onChange={handleTitleChange} placeholder="Article title..." style={{ ...inp, fontSize: '20px', fontWeight: 600 }} />
              </div>
              <div style={{ display: fullscreen ? 'none' : 'block' }}>
                <label style={lbl}>Slug</label>
                <input name="slug" value={form.slug} onChange={handleChange} style={inp} />
              </div>
              <div style={{ display: fullscreen ? 'none' : 'block' }}>
                <label style={lbl}>Excerpt</label>
                <textarea name="excerpt" value={form.excerpt} onChange={handleChange} rows={2} placeholder="Brief description..." style={{ ...inp, resize: 'vertical' as const }} />
              </div>
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
                  { l: '⬅ Img', a: () => { const img = document.querySelector('.ProseMirror img.ProseMirror-selectednode') as HTMLImageElement; if(img){ img.classList.remove('float-right','float-none'); img.classList.add('float-left'); } }, act: () => false },
                  { l: 'Img ➡', a: () => { const img = document.querySelector('.ProseMirror img.ProseMirror-selectednode') as HTMLImageElement; if(img){ img.classList.remove('float-left','float-none'); img.classList.add('float-right'); } }, act: () => false },
                  { l: '⊡ Img', a: () => { const img = document.querySelector('.ProseMirror img.ProseMirror-selectednode') as HTMLImageElement; if(img){ img.classList.remove('float-left','float-right'); img.classList.add('float-none'); } }, act: () => false },
                  ].map(({ l, a, act }) => (
                    <button key={l} onClick={a} style={{ padding: '0.35rem 0.6rem', fontSize: '12px', fontWeight: 600, border: '1px solid #ede8df', backgroundColor: act() ? '#0e1a2b' : '#fff', color: act() ? '#fff' : '#0e1a2b', cursor: 'pointer' }}>{l}</button>
                  ))}
                  <select onChange={e => { if(e.target.value) (editor?.chain().focus() as any).setFontSize(e.target.value).run(); else (editor?.chain().focus() as any).unsetFontSize().run() }} style={{ padding: '0.3rem 0.4rem', fontSize: '12px', border: '1px solid #ede8df', backgroundColor: '#fff', cursor: 'pointer' }}>
                    <option value=''>Size</option>
                    {['12','14','16','18','20','24','28','32','36'].map(s => <option key={s} value={s+'px'}>{s}</option>)}
                  </select>
                  <input ref={imgInputRef} type='file' accept='image/jpeg,image/png,image/webp,image/gif' style={{ display: 'none' }} onChange={handleImageUpload} />
                  <button type='button' onClick={() => imgInputRef.current?.click()} disabled={imgUploading} style={{ padding: '0.35rem 0.6rem', fontSize: '12px', fontWeight: 600, border: '1px solid #ede8df', backgroundColor: '#fff', color: '#0e1a2b', cursor: 'pointer' }}>{imgUploading ? 'Uploading...' : '📷 Image'}</button>
                  <button type='button' onClick={() => setShowImgSearch(true)} style={{ padding: '0.35rem 0.6rem', fontSize: '12px', fontWeight: 600, border: '1px solid #0e1a2b', backgroundColor: '#0e1a2b', color: '#f7f4ee', cursor: 'pointer' }}>🔍 Search Images</button>
                </div>
                <div onDragOver={e => e.preventDefault()} onDrop={handleDrop} style={{ border: '1px solid #ede8df', backgroundColor: '#fff', minHeight: fullscreen ? 'calc(100vh - 200px)' : '500px', padding: '1rem' }}>
                  <EditorContent editor={editor} />
                </div>
              </div>
              <div style={{ display: fullscreen ? 'none' : 'block', backgroundColor: '#fff', border: '1px solid #ede8df', padding: '1.5rem' }}>
                <p style={{ fontSize: '13px', fontWeight: 700, color: '#0e1a2b', marginBottom: '1rem', textTransform: 'uppercase' as const, letterSpacing: '0.08em' }}>AI Article Suggestions</p>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <input type="text" placeholder="Enter keyword..." value={suggestKeyword} onChange={(e) => setSuggestKeyword(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && fetchSuggestions(suggestKeyword)} style={{ ...inp, flex: 1 }} />
                  <button onClick={() => fetchSuggestions(suggestKeyword)} disabled={suggestLoading} style={{ padding: '0.75rem 1.25rem', backgroundColor: '#0e1a2b', color: '#fff', border: 'none', fontWeight: 700, fontSize: '12px', letterSpacing: '0.08em', textTransform: 'uppercase' as const, cursor: 'pointer', whiteSpace: 'nowrap' as const }}>{suggestLoading ? 'Loading...' : 'SUGGEST'}</button>
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
              <div style={{ display: fullscreen ? 'none' : 'block', backgroundColor: '#fff', border: '1px solid #ede8df', padding: '1.5rem' }}>
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
              <div style={{ display: fullscreen ? 'none' : 'block', backgroundColor: '#fff', border: '1px solid #ede8df', padding: '1.5rem' }}>
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
            <div style={{ display: fullscreen ? 'none' : 'flex', flexDirection: 'column', gap: '1.5rem', position: 'sticky', top: '1rem' }}>
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
              <div style={{ backgroundColor: '#fff', border: '1px solid #ede8df', padding: '1.5rem' }}>
                <p style={{ fontSize: '13px', fontWeight: 700, color: '#0e1a2b', marginBottom: '1rem', textTransform: 'uppercase' as const, letterSpacing: '0.08em' }}>Settings</p>
                <div style={{ marginBottom: '1rem' }}>
                  <label style={lbl}>Tags</label>
                  <div style={{ display: 'flex', flexWrap: 'wrap' as const, gap: '0.4rem', marginBottom: '0.5rem' }}>
                    {(form.tags||[]).map((t:string) => (
                      <span key={t} style={{ fontSize: '11px', backgroundColor: '#0e1a2b', color: '#f7f4ee', padding: '0.25rem 0.6rem', borderRadius: 20, display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                        {t}
                        <button type="button" onClick={() => setForm(f => ({...f, tags: f.tags.filter((x:string)=>x!==t)}))} style={{ background: 'none', border: 'none', color: '#c9b28f', cursor: 'pointer', fontSize: 14, lineHeight: 1, padding: 0 }}>×</button>
                      </span>
                    ))}
                  </div>
                  <input value={tagInput} onChange={e=>setTagInput(e.target.value)} onKeyDown={e=>{if(e.key==='Enter'&&tagInput.trim()){e.preventDefault();setForm(f=>({...f,tags:[...(f.tags||[]),tagInput.trim()]}));setTagInput('')}}} placeholder="Type tag + Enter" style={inp} />
                </div>
                <div style={{ marginBottom: '1rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                    <span style={{ fontSize: '12px', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#4A5563' }}>Category</span>
                    <button type='button' onClick={() => setShowAddCat(s => !s)} style={{ fontSize: '11px', color: '#c9b28f', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 700 }}>+ Add</button>
                  </div>
                  {showAddCat && (
                    <div style={{ backgroundColor: '#f7f4ee', border: '1px solid #ede8df', padding: '0.75rem', marginBottom: '0.75rem' }}>
                      <input type='text' placeholder='Category name' value={newCatName} onChange={e => setNewCatName(e.target.value)} style={{ ...inp, marginBottom: '0.5rem', fontSize: '13px' }} />
                      <select value={newCatParent} onChange={e => setNewCatParent(e.target.value)} style={{ ...inp, marginBottom: '0.5rem', fontSize: '13px' }}>
                        <option value=''>Parent category (leave blank for top-level)</option>
                        {categories.filter(cat => !cat.parent_id).map(cat => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
                      </select>
                      <button type='button' onClick={handleAddCategory} disabled={addingCat} style={{ width: '100%', padding: '0.5rem', backgroundColor: '#0e1a2b', color: '#f7f4ee', border: 'none', fontWeight: 700, fontSize: '12px', cursor: 'pointer' }}>{addingCat ? 'Adding...' : 'Add Category'}</button>
                    </div>
                  )}
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
                  <button type='button' onClick={() => setForm(f => ({...f, show_hero: !f.show_hero}))} style={{ width: '100%', marginTop: '0.5rem', padding: '0.5rem', border: '1px solid ' + (form.show_hero ? '#2d7a3a' : '#e8e4de'), backgroundColor: form.show_hero ? '#e8f5ea' : '#fff', color: form.show_hero ? '#2d7a3a' : '#9a9085', fontWeight: 700, fontSize: '11px', cursor: 'pointer', letterSpacing: '0.06em', textTransform: 'uppercase' }}>{form.show_hero ? '✓ Show as Hero Image' : 'Hide Hero Image'}</button>
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
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <button onClick={() => handleSave('draft')} disabled={saving} style={{ width: '100%', padding: '0.875rem', backgroundColor: 'transparent', border: '1px solid #0e1a2b', color: '#0e1a2b', fontWeight: 700, fontSize: '13px', letterSpacing: '0.08em', textTransform: 'uppercase' as const, cursor: 'pointer' }}>Save as Draft</button>
                <button onClick={() => handleSave('review')} disabled={saving} style={{ width: '100%', padding: '0.875rem', backgroundColor: '#d4820a', color: '#fff', fontWeight: 700, fontSize: '13px', letterSpacing: '0.08em', textTransform: 'uppercase' as const, border: 'none', cursor: 'pointer' }}>Submit for Review</button>
                <button onClick={() => handleSave('published')} disabled={saving} style={{ width: '100%', padding: '0.875rem', backgroundColor: '#0e1a2b', color: '#f7f4ee', fontWeight: 700, fontSize: '13px', letterSpacing: '0.08em', textTransform: 'uppercase' as const, border: 'none', cursor: 'pointer' }}>{saving ? 'Publishing...' : 'Publish Article'}</button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {showImgSearch && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.7)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
          <div style={{ backgroundColor: '#fff', width: '100%', maxWidth: '860px', maxHeight: '90vh', overflowY: 'auto', padding: '2rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <p style={{ fontSize: '16px', fontWeight: 700, color: '#0e1a2b', textTransform: 'uppercase', letterSpacing: '0.08em', margin: 0 }}>Search Images</p>
              <button type='button' onClick={() => { setShowImgSearch(false); setSelectedImg(null); setImgSearchResults([]); }} style={{ background: 'none', border: 'none', fontSize: '20px', cursor: 'pointer', color: '#4A5563' }}>✕</button>
            </div>
            <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem' }}>
              <input type='text' placeholder='Search images...' value={imgSearchQuery} onChange={e => setImgSearchQuery(e.target.value)} onKeyDown={e => e.key === 'Enter' && searchUnsplash(imgSearchQuery)} style={{ flex: 1, padding: '0.75rem', border: '1px solid #ede8df', fontSize: '14px', outline: 'none' }} />
              <button type='button' onClick={() => searchUnsplash(imgSearchQuery)} disabled={imgSearchLoading} style={{ padding: '0.75rem 1.5rem', backgroundColor: '#0e1a2b', color: '#fff', border: 'none', fontWeight: 700, fontSize: '12px', letterSpacing: '0.08em', textTransform: 'uppercase', cursor: 'pointer' }}>{imgSearchLoading ? 'Searching...' : 'Search'}</button>
            </div>
            {!selectedImg && imgSearchResults.length > 0 && (
              <>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.75rem', marginBottom: '1rem' }}>
                {imgSearchResults.map((photo: any) => (
                  <div key={photo.id} onClick={() => selectUnsplashImage(photo)} style={{ cursor: 'pointer', border: '3px solid transparent', overflow: 'hidden' }}>
                    <img src={photo.thumb} alt={photo.alt_description} style={{ width: '100%', height: '140px', objectFit: 'cover', display: 'block' }} />
                    <div style={{ padding: '0.4rem', fontSize: '10px', color: '#4A5563', backgroundColor: '#f7f4ee' }}>by {photo.photographer}</div>
                  </div>
                ))}
              </div>
              {imgSearchHasMore && (
                <button type='button' onClick={() => searchUnsplash(imgSearchQuery, imgSearchPage + 1)} disabled={imgSearchLoading} style={{ width: '100%', padding: '0.75rem', backgroundColor: '#f7f4ee', border: '1px solid #ede8df', color: '#0e1a2b', fontWeight: 700, fontSize: '12px', cursor: 'pointer', marginBottom: '1rem' }}>{imgSearchLoading ? 'Loading...' : 'Load More'}</button>
              )}
              </>
            )}
            {selectedImg && (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                <div>
                  <img src={selectedImg.thumb} alt={selectedImg.alt_description} style={{ width: '100%', height: '200px', objectFit: 'cover', display: 'block', marginBottom: '0.5rem' }} />
                  <p style={{ fontSize: '11px', color: '#4A5563', margin: 0 }}>Photo by <a href={selectedImg.photographer_url} target='_blank' rel='noopener noreferrer' style={{ color: '#0e1a2b' }}>{selectedImg.photographer}</a> on <a href={selectedImg.unsplash_url} target='_blank' rel='noopener noreferrer' style={{ color: '#0e1a2b' }}>Unsplash</a></p>
                  <button type='button' onClick={() => setSelectedImg(null)} style={{ marginTop: '0.75rem', fontSize: '11px', color: '#4A5563', background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline', padding: 0 }}>← Back to results</button>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <p style={{ fontSize: '11px', fontWeight: 700, color: '#0e1a2b', textTransform: 'uppercase', letterSpacing: '0.08em', margin: 0 }}>Image SEO</p>
                  <div>
                    <label style={{ fontSize: '11px', fontWeight: 700, color: '#4A5563', display: 'block', marginBottom: '0.35rem', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Alt Text</label>
                    <input type='text' value={imgAlt} onChange={e => setImgAlt(e.target.value)} style={{ width: '100%', padding: '0.6rem', border: '1px solid #ede8df', fontSize: '13px', outline: 'none', boxSizing: 'border-box' }} />
                  </div>
                  <div>
                    <label style={{ fontSize: '11px', fontWeight: 700, color: '#4A5563', display: 'block', marginBottom: '0.35rem', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Title Attribute</label>
                    <input type='text' value={imgTitle} onChange={e => setImgTitle(e.target.value)} style={{ width: '100%', padding: '0.6rem', border: '1px solid #ede8df', fontSize: '13px', outline: 'none', boxSizing: 'border-box' }} />
                  </div>
                  <div>
                    <label style={{ fontSize: '11px', fontWeight: 700, color: '#4A5563', display: 'block', marginBottom: '0.35rem', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Caption</label>
                    <input type='text' value={imgCaption} onChange={e => setImgCaption(e.target.value)} style={{ width: '100%', padding: '0.6rem', border: '1px solid #ede8df', fontSize: '13px', outline: 'none', boxSizing: 'border-box' }} />
                  </div>
                  <button type='button' onClick={insertUnsplashImage} style={{ padding: '0.875rem', backgroundColor: '#0e1a2b', color: '#f7f4ee', border: 'none', fontWeight: 700, fontSize: '13px', letterSpacing: '0.08em', textTransform: 'uppercase', cursor: 'pointer', marginTop: 'auto' }}>Insert Image</button>
                </div>
              </div>
            )}
            <p style={{ fontSize: '10px', color: '#4A5563', marginTop: '1.5rem', borderTop: '1px solid #ede8df', paddingTop: '1rem' }}>Photos by <a href='https://unsplash.com?utm_source=dudemd&utm_medium=referral' target='_blank' rel='noopener noreferrer' style={{ color: '#0e1a2b' }}>Unsplash</a></p>
          </div>
        </div>
      )}
    </>
  )
}

export default function NewArticle() {
  return <Suspense><NewArticleInner /></Suspense>
}
