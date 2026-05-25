'use client'
import { useEffect, useState, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { useRouter } from 'next/navigation'
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
  const [suggestions, setSuggestions] = useState({existing: [], topics: []})
  const [suggestLoading, setSuggestLoading] = useState(false)
  const [suggestKeyword, setSuggestKeyword] = useState('')
  const [seoScore, setSeoScore] = useState(0)
  const [aeoScore, setAeoScore] = useState(0)
  const [readabilityScore, setReadabilityScore] = useState(0)
  const [form, setForm] = useState({ title: '', slug: '', excerpt: '', cover_image_url: '', category_id: '', author_id: '', meta_title: '', meta_description: '', status: 'draft' })
  const [canvaDesigns, setCanvaDesigns] = useState<any[]>([])
  const [showCanvaPicker, setShowCanvaPicker] = useState(false)
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

  async function fetchSuggestions() {
    if (!suggestKeyword.trim()) return
    setSuggestLoading(true)
    const res = await fetch('/api/suggest-articles', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ keyword: suggestKeyword })
    })
    const data = await res.json()
    setSuggestions(data)
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
      const draftKey = `draft_${session.user.id}`
      const saved = localStorage.getItem(draftKey)
      if (saved) {
        const draft = JSON.parse(saved)
        setForm(draft)
        if (editor && draft.content) editor.commands.setContent(draft.content)
      }
    }
    init()
  }, [editor])

  useEffect(() => {
    if (!form.title && !editor?.getText()) return
    const timer = setTimeout(async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) return
      localStorage.setItem(`draft_${session.user.id}`, JSON.stringify({ ...form, content: editor?.getHTML() || '' }))
      setAutoSaved(new Date().toLocaleTimeString())
    }, 3000)
    return () => clearTimeout(timer)
  }, [form, editor?.getHTML()])

  const generateSlug = (title: string) => title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
  const getReadTime = () => { const words = (editor?.getText() || '').split(/\s+/).length; return `${Math.ceil(words / 200)} min read` }

  async function handleSave(status: 'draft' | 'review' | 'published') {
    setSaving(true)
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) { router.push('/admin/login'); return }
    const payload = { ...form, content: editor?.getHTML() || '', read_time: getReadTime(), status, published: status === 'published', published_at: status === 'published' ? new Date().toISOString() : null }
    const { error } = await supabase.from('articles').insert(payload)
    if (error) { alert('Error: ' + error.message); setSaving(false) }
    else { localStorage.removeItem(`draft_${session.user.id}`); router.push('/admin') }
  }

  const openCanvaEditor = () => { window.location.href = '/api/canva/auth' }
  const selectCanvaDesign = (design: any) => { setForm({ ...form, cover_image_url: design.thumbnail.url }); setShowCanvaPicker(false) }

  return (
    <div style={{ backgroundColor: '#fff', minHeight: '100vh', padding: '2rem' }}>
      <div style={{ maxWidth: '900px', margin: '0 auto' }}>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 700, color: '#0e1a2b', marginBottom: '1rem' }}>Create New Article</h1>
        {autoSaved && <p style={{ fontSize: '12px', color: '#9a9085', marginBottom: '1rem' }}>Auto-saved at {autoSaved}</p>}
        <input type="text" placeholder="Title" style={{ width: '100%', padding: '0.75rem', border: '1px solid #ede8df', fontSize: '14px', marginBottom: '1rem' }} value={form.title} onChange={e => setForm({...form, title: e.target.value, slug: generateSlug(e.target.value)})} />
        <input type="text" placeholder="Slug" style={{ width: '100%', padding: '0.75rem', border: '1px solid #ede8df', fontSize: '14px', marginBottom: '1rem' }} value={form.slug} onChange={e => setForm({...form, slug: e.target.value})} />
        <textarea placeholder="Excerpt" style={{ width: '100%', padding: '0.75rem', border: '1px solid #ede8df', fontSize: '14px', minHeight: '80px', marginBottom: '1rem' }} value={form.excerpt} onChange={e => setForm({...form, excerpt: e.target.value})} />
        <input type="text" placeholder="Cover Image URL" style={{ width: '100%', padding: '0.75rem', border: '1px solid #ede8df', fontSize: '14px', marginBottom: '0.5rem' }} value={form.cover_image_url} onChange={e => setForm({...form, cover_image_url: e.target.value})} />
        <button onClick={openCanvaEditor} style={{ padding: '0.5rem 1rem', backgroundColor: '#00C4CC', color: '#fff', border: 'none', fontSize: '12px', fontWeight: 600, cursor: 'pointer', marginBottom: '1rem' }}>Design in Canva</button>
        <select style={{ width: '100%', padding: '0.75rem', border: '1px solid #ede8df', fontSize: '14px', marginBottom: '1rem' }} value={form.category_id} onChange={e => setForm({...form, category_id: e.target.value})}>
          <option value="">Select Category</option>
          {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
        <select style={{ width: '100%', padding: '0.75rem', border: '1px solid #ede8df', fontSize: '14px', marginBottom: '1rem' }} value={form.author_id} onChange={e => setForm({...form, author_id: e.target.value})}>
          <option value="">Select Author</option>
          {authors.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
        </select>
        <input type="text" placeholder="Meta Title" style={{ width: '100%', padding: '0.75rem', border: '1px solid #ede8df', fontSize: '14px', marginBottom: '1rem' }} value={form.meta_title} onChange={e => setForm({...form, meta_title: e.target.value})} />
        <textarea placeholder="Meta Description" style={{ width: '100%', padding: '0.75rem', border: '1px solid #ede8df', fontSize: '14px', minHeight: '60px', marginBottom: '1rem' }} value={form.meta_description} onChange={e => setForm({...form, meta_description: e.target.value})} />
        <div style={{ border: '1px solid #ede8df', padding: '1rem', minHeight: '400px', marginBottom: '0.5rem' }}><EditorContent editor={editor} /></div>
        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
          <button onClick={() => editor?.chain().focus().toggleBold().run()} style={{ padding: '0.5rem', border: '1px solid #ede8df', fontWeight: 700 }}>B</button>
          <button onClick={() => editor?.chain().focus().toggleItalic().run()} style={{ padding: '0.5rem', border: '1px solid #ede8df', fontStyle: 'italic' }}>I</button>
          <button onClick={() => editor?.chain().focus().toggleUnderline().run()} style={{ padding: '0.5rem', border: '1px solid #ede8df', textDecoration: 'underline' }}>U</button>
        </div>
        <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
          <div><span style={{ fontSize: '12px' }}>SEO: </span><span style={{ fontSize: '14px', fontWeight: 700 }}>{seoScore}/100</span></div>
          <div><span style={{ fontSize: '12px' }}>AEO: </span><span style={{ fontSize: '14px', fontWeight: 700 }}>{aeoScore}/100</span></div>
          <div><span style={{ fontSize: '12px' }}>Readability: </span><span style={{ fontSize: '14px', fontWeight: 700 }}>{readabilityScore}/100</span></div>
        </div>
        <input type="text" placeholder="Keyword for suggestions" style={{ width: '100%', padding: '0.75rem', border: '1px solid #ede8df', fontSize: '14px', marginBottom: '0.5rem' }} value={suggestKeyword} onChange={e => setSuggestKeyword(e.target.value)} />
        <button onClick={fetchSuggestions} disabled={suggestLoading} style={{ padding: '0.5rem 1rem', backgroundColor: '#0e1a2b', color: '#fff', border: 'none', fontSize: '12px', fontWeight: 600, cursor: 'pointer', marginBottom: '1rem' }}>{suggestLoading ? 'Loading...' : 'Get Suggestions'}</button>
        {suggestions.existing.length > 0 && <div>{suggestions.existing.map((s: any, i: number) => <p key={i} style={{ fontSize: '12px' }}>• {s}</p>)}</div>}
        {suggestions.topics.length > 0 && <div>{suggestions.topics.map((t: any, i: number) => <p key={i} style={{ fontSize: '12px' }}>• {t}</p>)}</div>}
        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
          <button onClick={() => handleSave('draft')} disabled={saving} style={{ padding: '0.85rem 1.5rem', backgroundColor: '#9a9085', color: '#fff', fontWeight: 600, fontSize: '14px', border: 'none', cursor: 'pointer' }}>Save Draft</button>
          <button onClick={() => handleSave('review')} disabled={saving} style={{ padding: '0.85rem 1.5rem', backgroundColor: '#c9b28f', color: '#0e1a2b', fontWeight: 600, fontSize: '14px', border: 'none', cursor: 'pointer' }}>Submit for Review</button>
          <button onClick={() => handleSave('published')} disabled={saving} style={{ padding: '0.85rem 1.5rem', backgroundColor: '#0e1a2b', color: '#f7f4ee', fontWeight: 600, fontSize: '14px', border: 'none', cursor: 'pointer' }}>Publish</button>
        </div>
      </div>
      {showCanvaPicker && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ backgroundColor: '#fff', padding: '2rem', maxWidth: '600px', maxHeight: '80vh', overflowY: 'auto' }}>
            <h3>Select Canva Design</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem' }}>
              {canvaDesigns.map(d => <div key={d.id} onClick={() => selectCanvaDesign(d)} style={{ cursor: 'pointer' }}><img src={d.thumbnail.url} alt={d.name} style={{ width: '100%' }} /></div>)}
            </div>
            <button onClick={() => setShowCanvaPicker(false)} style={{ marginTop: '1rem', padding: '0.5rem 1rem', backgroundColor: '#4A5563', color: '#fff', border: 'none', cursor: 'pointer' }}>Close</button>
          </div>
        </div>
      )}
    </div>
  )
}

export default function NewArticlePage() {
  return <Suspense fallback={<div>Loading...</div>}><NewArticleInner /></Suspense>
}
