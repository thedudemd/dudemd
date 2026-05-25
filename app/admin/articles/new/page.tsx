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
  const [allArticles, setAllArticles] = useState<any[]>([])
  const [pillarArticles, setPillarArticles] = useState<any[]>([])
  const [saving, setSaving] = useState(false)
  const [autoSaved, setAutoSaved] = useState('')
  const [suggestions, setSuggestions] = useState({existing: [], topics: []})
  const [suggestLoading, setSuggestLoading] = useState(false)
  const [suggestKeyword, setSuggestKeyword] = useState('')
  const [seoScore, setSeoScore] = useState(0)
  const [aeoScore, setAeoScore] = useState(0)
  const [readabilityScore, setReadabilityScore] = useState(0)
  const [canvaDesigns, setCanvaDesigns] = useState<any[]>([])
  const [showCanvaPicker, setShowCanvaPicker] = useState(false)
  const [showMediaLibrary, setShowMediaLibrary] = useState(false)
  const [mediaFiles, setMediaFiles] = useState<any[]>([])
  const searchParams = useSearchParams()

  const [form, setForm] = useState({
    title: '', slug: '', excerpt: '', cover_image_url: '', category_id: '', author_id: '',
    meta_title: '', meta_description: '', status: 'draft',
    social_title: '', social_description: '', facebook_teaser_text: '', teaser_hook: '',
    pillar_topic_id: '', related_post_ids: [] as string[], next_recommended_id: '',
    cornerstone_article_id: '', monetization_type: 'none', cta_type: 'newsletter',
    article_template: 'standard', is_pillar_content: false, is_cornerstone: false,
  })

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
      const { data: articles } = await supabase.from('articles').select('id, title, is_pillar_content').order('title')
      const { data: pillars } = await supabase.from('articles').select('id, title').eq('is_pillar_content', true).order('title')
      setCategories(cats || [])
      setAuthors(auths || [])
      setAllArticles(articles || [])
      setPillarArticles(pillars || [])
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

  const getReadTime = () => {
    const words = (editor?.getText() || '').split(/\s+/).length
    return `${Math.ceil(words / 200)} min read`
  }

  async function handleSave(status: 'draft' | 'review' | 'published') {
    setSaving(true)
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) { router.push('/admin/login'); return }
    const payload = {
      ...form,
      content: editor?.getHTML() || '',
      read_time: getReadTime(),
      status,
      published: status === 'published',
      published_at: status === 'published' ? new Date().toISOString() : null,
      pillar_topic_id: form.pillar_topic_id || null,
      next_recommended_id: form.next_recommended_id || null,
      cornerstone_article_id: form.cornerstone_article_id || null,
      related_post_ids: form.related_post_ids.length > 0 ? form.related_post_ids : null,
    }
    const { error } = await supabase.from('articles').insert(payload)
    if (error) { alert('Error: ' + error.message); setSaving(false) }
    else { localStorage.removeItem(`draft_${session.user.id}`); router.push('/admin') }
  }

  const handleRelatedPostToggle = (articleId: string) => {
    setForm(prev => ({
      ...prev,
      related_post_ids: prev.related_post_ids.includes(articleId)
        ? prev.related_post_ids.filter(id => id !== articleId)
        : [...prev.related_post_ids, articleId]
    }))
  }

  const openCanvaEditor = () => { window.location.href = '/api/canva/auth' }
  const selectCanvaDesign = (design: any) => { setForm({ ...form, cover_image_url: design.thumbnail.url }); setShowCanvaPicker(false) }
  const loadMediaLibrary = async () => { const { data } = await supabase.storage.from('media').list(); setMediaFiles(data || []); setShowMediaLibrary(true) }
  const insertMediaImage = (file: any) => { const publicURL = supabase.storage.from('media').getPublicUrl(file.name).data.publicUrl; editor?.chain().focus().setImage({ src: publicURL }).run(); setShowMediaLibrary(false) }

  const inp: any = { width: '100%', padding: '0.75rem', border: '1px solid #ede8df', fontSize: '14px', outline: 'none', boxSizing: 'border-box', backgroundColor: '#fff', fontFamily: 'inherit' }
  const lbl: any = { display: 'block', fontSize: '12px', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#4A5563', marginBottom: '0.5rem' }
  const section: any = { marginBottom: '2rem', padding: '1.5rem', backgroundColor: '#f7f4ee', border: '1px solid #ede8df' }

  return (
    <div style={{ backgroundColor: '#fff', minHeight: '100vh', padding: '2rem' }}>
      <div style={{ maxWidth: '900px', margin: '0 auto' }}>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 700, color: '#0e1a2b', marginBottom: '1rem' }}>Create New Article</h1>
        {autoSaved && <p style={{ fontSize: '12px', color: '#9a9085', marginBottom: '1rem' }}>Auto-saved at {autoSaved}</p>}

        {/* ARTICLE TEMPLATE */}
        <div style={section}>
          <label style={lbl}>Article Template</label>
          <select style={inp} value={form.article_template} onChange={e => setForm({...form, article_template: e.target.value})}>
            <option value="standard">Standard Article</option>
            <option value="pillar">Pillar Article (Main Topic Hub)</option>
            <option value="supporting">Supporting Article</option>
            <option value="news_brief">News Brief</option>
            <option value="roundup">Roundup / Listicle</option>
            <option value="explainer">Explainer / How-To</option>
            <option value="affiliate_review">Affiliate / Product Review</option>
          </select>
        </div>

        {/* BASIC INFO */}
        <div style={section}>
          <label style={lbl}>Title</label>
          <input type="text" style={inp} value={form.title} onChange={e => setForm({...form, title: e.target.value, slug: generateSlug(e.target.value)})} />
          <label style={{...lbl, marginTop: '1rem'}}>Slug (URL)</label>
          <input type="text" style={inp} value={form.slug} onChange={e => setForm({...form, slug: e.target.value})} />
          <label style={{...lbl, marginTop: '1rem'}}>Teaser Hook (Social/Homepage)</label>
          <input type="text" style={inp} placeholder="Compelling one-liner to grab attention" value={form.teaser_hook} onChange={e => setForm({...form, teaser_hook: e.target.value})} />
          <label style={{...lbl, marginTop: '1rem'}}>Excerpt</label>
          <textarea style={{...inp, minHeight: '80px'}} value={form.excerpt} onChange={e => setForm({...form, excerpt: e.target.value})} />
          <label style={{...lbl, marginTop: '1rem'}}>Cover Image URL</label>
          <input type="text" style={inp} value={form.cover_image_url} onChange={e => setForm({...form, cover_image_url: e.target.value})} />
          <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
            <button onClick={openCanvaEditor} style={{ padding: '0.5rem 1rem', backgroundColor: '#00C4CC', color: '#fff', border: 'none', fontSize: '12px', fontWeight: 600, cursor: 'pointer' }}>Design in Canva</button>
            <button onClick={loadMediaLibrary} style={{ padding: '0.5rem 1rem', backgroundColor: '#4A5563', color: '#fff', border: 'none', fontSize: '12px', fontWeight: 600, cursor: 'pointer' }}>Media Library</button>
          </div>
        </div>

        {/* TAXONOMY */}
        <div style={section}>
          <label style={lbl}>Category</label>
          <select style={inp} value={form.category_id} onChange={e => setForm({...form, category_id: e.target.value})}>
            <option value="">Select Category</option>
            {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
          <label style={{...lbl, marginTop: '1rem'}}>Author</label>
          <select style={inp} value={form.author_id} onChange={e => setForm({...form, author_id: e.target.value})}>
            <option value="">Select Author</option>
            {authors.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
          </select>
        </div>

        {/* CONTENT STRUCTURE */}
        <div style={section}>
          <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <input type="checkbox" checked={form.is_pillar_content} onChange={e => setForm({...form, is_pillar_content: e.target.checked})} />
              <span style={{ fontSize: '14px', color: '#0e1a2b' }}>This is a Pillar Article</span>
            </label>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <input type="checkbox" checked={form.is_cornerstone} onChange={e => setForm({...form, is_cornerstone: e.target.checked})} />
              <span style={{ fontSize: '14px', color: '#0e1a2b' }}>This is Cornerstone Content</span>
            </label>
          </div>
          {!form.is_pillar_content && (
            <>
              <label style={lbl}>Parent Pillar Topic (optional)</label>
              <select style={inp} value={form.pillar_topic_id} onChange={e => setForm({...form, pillar_topic_id: e.target.value})}>
                <option value="">None (standalone article)</option>
                {pillarArticles.map(p => <option key={p.id} value={p.id}>{p.title}</option>)}
              </select>
            </>
          )}
          <label style={{...lbl, marginTop: '1rem'}}>Related Articles (Multi-Select)</label>
          <div style={{ maxHeight: '200px', overflowY: 'auto', border: '1px solid #ede8df', padding: '0.75rem', backgroundColor: '#fff' }}>
            {allArticles.map(a => (
              <label key={a.id} style={{ display: 'block', padding: '0.5rem 0', fontSize: '14px' }}>
                <input type="checkbox" checked={form.related_post_ids.includes(a.id)} onChange={() => handleRelatedPostToggle(a.id)} style={{ marginRight: '0.5rem' }} />
                {a.title} {a.is_pillar_content && <span style={{ color: '#c9b28f', fontSize: '11px' }}>[PILLAR]</span>}
              </label>
            ))}
          </div>
          <label style={{...lbl, marginTop: '1rem'}}>Next Recommended Article</label>
          <select style={inp} value={form.next_recommended_id} onChange={e => setForm({...form, next_recommended_id: e.target.value})}>
            <option value="">None</option>
            {allArticles.map(a => <option key={a.id} value={a.id}>{a.title}</option>)}
          </select>
          <label style={{...lbl, marginTop: '1rem'}}>Link to Cornerstone Article</label>
          <select style={inp} value={form.cornerstone_article_id} onChange={e => setForm({...form, cornerstone_article_id: e.target.value})}>
            <option value="">None</option>
            {allArticles.filter(a => a.is_cornerstone).map(a => <option key={a.id} value={a.id}>{a.title}</option>)}
          </select>
        </div>

        {/* MONETIZATION */}
        <div style={section}>
          <label style={lbl}>Monetization Type</label>
          <select style={inp} value={form.monetization_type} onChange={e => setForm({...form, monetization_type: e.target.value})}>
            <option value="none">None</option>
            <option value="affiliate">Affiliate Links</option>
            <option value="sponsored">Sponsored Content</option>
            <option value="lead_magnet">Lead Magnet</option>
            <option value="product_review">Product Review</option>
          </select>
          <label style={{...lbl, marginTop: '1rem'}}>Primary CTA Type</label>
          <select style={inp} value={form.cta_type} onChange={e => setForm({...form, cta_type: e.target.value})}>
            <option value="newsletter">Newsletter Signup</option>
            <option value="download">Download Resource</option>
            <option value="product">Product Purchase</option>
            <option value="course">Course Enrollment</option>
            <option value="consultation">Book Consultation</option>
            <option value="affiliate">Affiliate Product</option>
            <option value="none">None</option>
          </select>
        </div>

        {/* SEO */}
        <div style={section}>
          <label style={lbl}>Meta Title (SEO)</label>
          <input type="text" style={inp} placeholder="Leave blank to use article title" value={form.meta_title} onChange={e => setForm({...form, meta_title: e.target.value})} />
          <label style={{...lbl, marginTop: '1rem'}}>Meta Description (SEO)</label>
          <textarea style={{...inp, minHeight: '60px'}} placeholder="Leave blank to use excerpt" value={form.meta_description} onChange={e => setForm({...form, meta_description: e.target.value})} />
        </div>

        {/* SOCIAL */}
        <div style={section}>
          <label style={lbl}>Social Title (Facebook/Twitter)</label>
          <input type="text" style={inp} placeholder="Leave blank to use meta title" value={form.social_title} onChange={e => setForm({...form, social_title: e.target.value})} />
          <label style={{...lbl, marginTop: '1rem'}}>Social Description</label>
          <textarea style={{...inp, minHeight: '60px'}} placeholder="Leave blank to use meta description" value={form.social_description} onChange={e => setForm({...form, social_description: e.target.value})} />
          <label style={{...lbl, marginTop: '1rem'}}>Facebook Teaser Text (2-3 sentences max)</label>
          <textarea style={{...inp, minHeight: '80px'}} placeholder="Optimized teaser for Facebook posts" value={form.facebook_teaser_text} onChange={e => setForm({...form, facebook_teaser_text: e.target.value})} />
        </div>

        {/* CONTENT EDITOR */}
        <div style={section}>
          <label style={lbl}>Article Content</label>
          <div style={{ border: '1px solid #ede8df', borderRadius: '4px', padding: '1rem', minHeight: '400px', backgroundColor: '#fff', marginBottom: '0.5rem' }}>
            <EditorContent editor={editor} />
          </div>
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            <button onClick={() => editor?.chain().focus().toggleBold().run()} style={{ padding: '0.5rem', border: '1px solid #ede8df', backgroundColor: editor?.isActive('bold') ? '#0e1a2b' : '#fff', color: editor?.isActive('bold') ? '#fff' : '#0e1a2b', cursor: 'pointer', fontWeight: 700 }}>B</button>
            <button onClick={() => editor?.chain().focus().toggleItalic().run()} style={{ padding: '0.5rem', border: '1px solid #ede8df', backgroundColor: editor?.isActive('italic') ? '#0e1a2b' : '#fff', color: editor?.isActive('italic') ? '#fff' : '#0e1a2b', cursor: 'pointer', fontStyle: 'italic' }}>I</button>
            <button onClick={() => editor?.chain().focus().toggleUnderline().run()} style={{ padding: '0.5rem', border: '1px solid #ede8df', backgroundColor: editor?.isActive('underline') ? '#0e1a2b' : '#fff', color: editor?.isActive('underline') ? '#fff' : '#0e1a2b', cursor: 'pointer', textDecoration: 'underline' }}>U</button>
            <button onClick={() => { const url = prompt('URL:'); if (url) editor?.chain().focus().setLink({ href: url }).run() }} style={{ padding: '0.5rem', border: '1px solid #ede8df', backgroundColor: '#fff', cursor: 'pointer', fontSize: '12px' }}>Link</button>
            <button onClick={() => { const url = prompt('Image URL:'); if (url) editor?.chain().focus().setImage({ src: url }).run() }} style={{ padding: '0.5rem', border: '1px solid #ede8df', backgroundColor: '#fff', cursor: 'pointer', fontSize: '12px' }}>Image</button>
          </div>
          <div style={{ marginTop: '1rem', padding: '1rem', backgroundColor: '#fff', border: '1px solid #ede8df' }}>
            <div style={{ display: 'flex', gap: '2rem', marginBottom: '0.5rem' }}>
              <div><span style={{ fontSize: '12px', color: '#4A5563' }}>SEO: </span><span style={{ fontSize: '14px', fontWeight: 700, color: seoScore > 70 ? '#4ade80' : seoScore > 40 ? '#fbbf24' : '#ef4444' }}>{seoScore}/100</span></div>
              <div><span style={{ fontSize: '12px', color: '#4A5563' }}>AEO: </span><span style={{ fontSize: '14px', fontWeight: 700, color: aeoScore > 70 ? '#4ade80' : aeoScore > 40 ? '#fbbf24' : '#ef4444' }}>{aeoScore}/100</span></div>
              <div><span style={{ fontSize: '12px', color: '#4A5563' }}>Readability: </span><span style={{ fontSize: '14px', fontWeight: 700, color: readabilityScore > 70 ? '#4ade80' : readabilityScore > 40 ? '#fbbf24' : '#ef4444' }}>{readabilityScore}/100</span></div>
            </div>
          </div>
        </div>

        {/* SUGGESTIONS */}
        <div style={section}>
          <label style={lbl}>Article Suggestions</label>
          <input type="text" placeholder="Enter keyword for suggestions" style={inp} value={suggestKeyword} onChange={e => setSuggestKeyword(e.target.value)} />
          <button onClick={fetchSuggestions} disabled={suggestLoading} style={{ marginTop: '0.5rem', padding: '0.5rem 1rem', backgroundColor: '#0e1a2b', color: '#fff', border: 'none', fontSize: '12px', fontWeight: 600, cursor: 'pointer' }}>
            {suggestLoading ? 'Loading...' : 'Get Suggestions'}
          </button>
          {suggestions.existing.length > 0 && (
            <div style={{ marginTop: '1rem', padding: '1rem', backgroundColor: '#fff', border: '1px solid #ede8df' }}>
              <p style={{ fontSize: '12px', fontWeight: 600, marginBottom: '0.5rem', color: '#0e1a2b' }}>Existing Articles to Link:</p>
              {suggestions.existing.map((s: any, i: number) => <p key={i} style={{ fontSize: '12px', color: '#4A5563', marginBottom: '0.25rem' }}>• {s}</p>)}
            </div>
          )}
          {suggestions.topics.length > 0 && (
            <div style={{ marginTop: '1rem', padding: '1rem', backgroundColor: '#fff', border: '1px solid #ede8df' }}>
              <p style={{ fontSize: '12px', fontWeight: 600, marginBottom: '0.5rem', color: '#0e1a2b' }}>New Topic Ideas:</p>
              {suggestions.topics.map((t: any, i: number) => <p key={i} style={{ fontSize: '12px', color: '#4A5563', marginBottom: '0.25rem' }}>• {t}</p>)}
            </div>
          )}
        </div>

        {/* ACTIONS */}
        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
          <button onClick={() => handleSave('draft')} disabled={saving} style={{ padding: '0.85rem 1.5rem', backgroundColor: '#9a9085', color: '#fff', fontWeight: 600, fontSize: '14px', border: 'none', cursor: 'pointer' }}>
            {saving ? 'Saving...' : 'Save as Draft'}
          </button>
          <button onClick={() => handleSave('review')} disabled={saving} style={{ padding: '0.85rem 1.5rem', backgroundColor: '#c9b28f', color: '#0e1a2b', fontWeight: 600, fontSize: '14px', border: 'none', cursor: 'pointer' }}>
            {saving ? 'Submitting...' : 'Submit for Review'}
          </button>
          <button onClick={() => handleSave('published')} disabled={saving} style={{ padding: '0.85rem 1.5rem', backgroundColor: '#0e1a2b', color: '#f7f4ee', fontWeight: 600, fontSize: '14px', border: 'none', cursor: 'pointer' }}>
            {saving ? 'Publishing...' : 'Publish Now'}
          </button>
        </div>
      </div>

      {/* CANVA PICKER MODAL */}
      {showCanvaPicker && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ backgroundColor: '#fff', padding: '2rem', maxWidth: '600px', maxHeight: '80vh', overflowY: 'auto', borderRadius: '8px' }}>
            <h3 style={{ marginBottom: '1rem', fontSize: '1.25rem', fontWeight: 700 }}>Select Canva Design</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem' }}>
              {canvaDesigns.map(d => (
                <div key={d.id} onClick={() => selectCanvaDesign(d)} style={{ cursor: 'pointer', border: '2px solid #ede8df', borderRadius: '4px', overflow: 'hidden', transition: 'border 0.2s' }}>
                  <img src={d.thumbnail.url} alt={d.name} style={{ width: '100%', display: 'block' }} />
                </div>
              ))}
            </div>
            <button onClick={() => setShowCanvaPicker(false)} style={{ marginTop: '1rem', padding: '0.5rem 1rem', backgroundColor: '#4A5563', color: '#fff', border: 'none', cursor: 'pointer', fontSize: '14px', fontWeight: 600 }}>Close</button>
          </div>
        </div>
      )}

      {/* MEDIA LIBRARY MODAL */}
      {showMediaLibrary && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ backgroundColor: '#fff', padding: '2rem', maxWidth: '600px', maxHeight: '80vh', overflowY: 'auto', borderRadius: '8px' }}>
            <h3 style={{ marginBottom: '1rem', fontSize: '1.25rem', fontWeight: 700 }}>Media Library</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.5rem' }}>
              {mediaFiles.map(f => (
                <div key={f.name} onClick={() => insertMediaImage(f)} style={{ cursor: 'pointer', border: '1px solid #ede8df', padding: '0.5rem', borderRadius: '4px', fontSize: '12px', wordBreak: 'break-all' }}>
                  {f.name}
                </div>
              ))}
            </div>
            <button onClick={() => setShowMediaLibrary(false)} style={{ marginTop: '1rem', padding: '0.5rem 1rem', backgroundColor: '#4A5563', color: '#fff', border: 'none', cursor: 'pointer', fontSize: '14px', fontWeight: 600 }}>Close</button>
          </div>
        </div>
      )}
    </div>
  )
}

export default function NewArticlePage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <NewArticleInner />
    </Suspense>
  )
}
