// @ts-nocheck
'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase/client'
import dynamic from 'next/dynamic'

const Editor = dynamic(() => import('@tiptap/react').then((mod) => {
  const { useEditor, EditorContent } = mod
  const StarterKit = require('@tiptap/starter-kit').default

  return function EditorWrapper({ content, onChange }: any) {
    const editor = useEditor({
      extensions: [StarterKit],
      content,
      onUpdate: ({ editor }) => onChange(editor.getHTML()),
    })
    return <EditorContent editor={editor} style={{ border: '1px solid #ede8df', padding: '1rem', minHeight: '300px', backgroundColor: '#fff' }} />
  }
}), { ssr: false })

export default function NewArticlePage() {
  const router = useRouter()
  const [session, setSession] = useState<any>(null)
  const [categories, setCategories] = useState<any[]>([])
  const [authors, setAuthors] = useState<any[]>([])
  const [allArticles, setAllArticles] = useState<any[]>([])
  const [pillarArticles, setPillarArticles] = useState<any[]>([])
  const [saving, setSaving] = useState(false)
  const [editor, setEditor] = useState<any>(null)
  
  const [form, setForm] = useState({
    title: '',
    slug: '',
    excerpt: '',
    content: '',
    cover_image_url: '',
    category_id: '',
    author_id: '',
    meta_title: '',
    meta_description: '',
    social_title: '',
    social_description: '',
    facebook_teaser_text: '',
    teaser_hook: '',
    pillar_topic_id: '',
    related_post_ids: [] as string[],
    next_recommended_id: '',
    cornerstone_article_id: '',
    monetization_type: 'none',
    cta_type: 'newsletter',
    article_template: 'standard',
    is_pillar_content: false,
    is_cornerstone: false,
  })

  useEffect(() => {
    async function init() {
      const { data: { session } } = await supabase.auth.getSession()
      setSession(session)
      if (!session) { router.push('/admin/login'); return }
      
      const { data: cats } = await supabase.from('categories').select('*').order('name')
      const { data: auths } = await supabase.from('authors').select('*').order('name')
      const { data: articles } = await supabase.from('articles').select('id, title, is_pillar_content').order('title')
      const { data: pillars } = await supabase.from('articles').select('id, title').eq('is_pillar_content', true).order('title')
      
      setCategories(cats || [])
      setAuthors(auths || [])
      setAllArticles(articles || [])
      setPillarArticles(pillars || [])
    }
    init()
  }, [router])

  const generateSlug = (title: string) => title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
  
  const getReadTime = () => {
    const words = (editor?.getText() || '').split(/\s+/).length
    return `${Math.ceil(words / 200)} min read`
  }

  async function saveDraft() {
    setSaving(true)
    const draft = { ...form, content: editor?.getHTML() || '', read_time: getReadTime() }
    localStorage.setItem('draft_' + session.user.id, JSON.stringify(draft))
    setSaving(false)
    alert('Draft saved locally')
  }

  async function publish(status: 'draft' | 'published') {
    setSaving(true)
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
    else { localStorage.removeItem('draft_' + session.user.id); router.push('/admin') }
  }

  const handleRelatedPostToggle = (articleId: string) => {
    setForm(prev => ({
      ...prev,
      related_post_ids: prev.related_post_ids.includes(articleId)
        ? prev.related_post_ids.filter(id => id !== articleId)
        : [...prev.related_post_ids, articleId]
    }))
  }

  const inp: any = { width: '100%', padding: '0.75rem', border: '1px solid #ede8df', fontSize: '14px', outline: 'none', boxSizing: 'border-box', backgroundColor: '#fff', fontFamily: 'inherit' }
  const lbl: any = { display: 'block', fontSize: '12px', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#4A5563', marginBottom: '0.5rem' }
  const section: any = { marginBottom: '2rem', padding: '1.5rem', backgroundColor: '#f7f4ee', border: '1px solid #ede8df' }

  if (!session) return null

  return (
    <div style={{ backgroundColor: '#fff', minHeight: '100vh', padding: '2rem' }}>
      <div style={{ maxWidth: '900px', margin: '0 auto' }}>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 700, color: '#0e1a2b', marginBottom: '2rem' }}>Create New Article</h1>

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
        </div>

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
                <input 
                  type="checkbox" 
                  checked={form.related_post_ids.includes(a.id)}
                  onChange={() => handleRelatedPostToggle(a.id)}
                  style={{ marginRight: '0.5rem' }}
                />
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

        <div style={section}>
          <label style={lbl}>Meta Title (SEO)</label>
          <input type="text" style={inp} placeholder="Leave blank to use article title" value={form.meta_title} onChange={e => setForm({...form, meta_title: e.target.value})} />
          
          <label style={{...lbl, marginTop: '1rem'}}>Meta Description (SEO)</label>
          <textarea style={{...inp, minHeight: '60px'}} placeholder="Leave blank to use excerpt" value={form.meta_description} onChange={e => setForm({...form, meta_description: e.target.value})} />
        </div>

        <div style={section}>
          <label style={lbl}>Social Title (Facebook/Twitter)</label>
          <input type="text" style={inp} placeholder="Leave blank to use meta title" value={form.social_title} onChange={e => setForm({...form, social_title: e.target.value})} />
          
          <label style={{...lbl, marginTop: '1rem'}}>Social Description</label>
          <textarea style={{...inp, minHeight: '60px'}} placeholder="Leave blank to use meta description" value={form.social_description} onChange={e => setForm({...form, social_description: e.target.value})} />
          
          <label style={{...lbl, marginTop: '1rem'}}>Facebook Teaser Text (2-3 sentences max)</label>
          <textarea style={{...inp, minHeight: '80px'}} placeholder="Optimized teaser for Facebook posts" value={form.facebook_teaser_text} onChange={e => setForm({...form, facebook_teaser_text: e.target.value})} />
        </div>

        <div style={section}>
          <label style={lbl}>Article Content</label>
          <Editor content={form.content} onChange={(html: string) => { setForm({...form, content: html}); setEditor({ getHTML: () => html, getText: () => html.replace(/<[^>]*>/g, '') }) }} />
        </div>

        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
          <button onClick={saveDraft} disabled={saving} style={{ padding: '0.85rem 1.5rem', backgroundColor: '#4A5563', color: '#fff', fontWeight: 600, fontSize: '14px', border: 'none', cursor: 'pointer' }}>
            {saving ? 'Saving...' : 'Save Draft Locally'}
          </button>
          <button onClick={() => publish('draft')} disabled={saving} style={{ padding: '0.85rem 1.5rem', backgroundColor: '#9a9085', color: '#fff', fontWeight: 600, fontSize: '14px', border: 'none', cursor: 'pointer' }}>
            {saving ? 'Saving...' : 'Save as Draft'}
          </button>
          <button onClick={() => publish('published')} disabled={saving} style={{ padding: '0.85rem 1.5rem', backgroundColor: '#0e1a2b', color: '#f7f4ee', fontWeight: 600, fontSize: '14px', border: 'none', cursor: 'pointer' }}>
            {saving ? 'Publishing...' : 'Publish Now'}
          </button>
        </div>
      </div>
    </div>
  )
}
