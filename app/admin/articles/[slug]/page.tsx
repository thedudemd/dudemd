'use client'
import { useEffect, useState, Suspense } from 'react'
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

function EditArticleInner({ slug }: { slug: string }) {
  const router = useRouter()
  const [categories, setCategories] = useState<any[]>([])
  const [authors, setAuthors] = useState<any[]>([])
  const [saving, setSaving] = useState(false)
  const [loading, setLoading] = useState(true)
  const [articleId, setArticleId] = useState('')
  const [tagInput, setTagInput] = useState('')
  const [form, setForm] = useState({ title: '', slug: '', excerpt: '', cover_image_url: '', category_id: '', author_id: '', meta_title: '', meta_description: '', status: 'draft', tags: [] as string[] })

  const editor = useEditor({
    extensions: [
      StarterKit, Underline, TiptapImage,
      LinkExtension.configure({ openOnClick: false }),
      Placeholder.configure({ placeholder: 'Write your article here...' }),

      TextAlign.configure({ types: ['heading', 'paragraph'] }),
    ],
    content: '',
  })

  useEffect(() => {
    async function init() {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) { router.push('/admin/login'); return }
      const { data: cats } = await supabase.from('categories').select('*').order('name')
      const { data: auths } = await supabase.from('authors').select('*').order('name')
      setCategories(cats || [])
      setAuthors(auths || [])
      const { data: article } = await supabase.from('articles').select('*').eq('slug', slug).single()
      if (!article) { router.push('/admin'); return }
      setArticleId(article.id)
      setForm({
        title: article.title || '',
        slug: article.slug || '',
        excerpt: article.excerpt || '',
        cover_image_url: article.cover_image_url || '',
        category_id: article.category_id || '',
        author_id: article.author_id || '',
        meta_title: article.meta_title || '',
        meta_description: article.meta_description || '',
        status: article.status || 'draft',
        tags: article.tags || []
      })
      if (editor && article.content) editor.commands.setContent(article.content)
      setLoading(false)
    }
    if (editor) init()
  }, [editor])

  function handleChange(e: any) {
    const { name, value } = e.target
    setForm(f => ({ ...f, [name]: value }))
  }

  function handleTitleChange(e: any) {
    const title = e.target.value
    setForm(f => ({ ...f, title, meta_title: f.meta_title || title }))
  }

  function addTag(val: string) {
    const tag = val.trim().toLowerCase()
    if (tag && !form.tags.includes(tag)) setForm(f => ({ ...f, tags: [...f.tags, tag] }))
    setTagInput('')
  }

  function removeTag(tag: string) {
    setForm(f => ({ ...f, tags: f.tags.filter((t: string) => t !== tag) }))
  }

  function getWordCount() { return editor ? editor.getText().split(/\s+/).filter(Boolean).length : 0 }
  function getReadTime() { return Math.ceil(getWordCount() / 200) + ' min read' }

  async function handleSave(status: string) {
    setSaving(true)
    const { error } = await supabase.from('articles').update({
      ...form,
      content: editor?.getHTML() || '',
      read_time: getReadTime(),
      status,
      published: status === 'published',
      published_at: status === 'published' ? new Date().toISOString() : null
    }).eq('id', articleId)
    if (error) { alert('Error: ' + error.message); setSaving(false) }
    else { router.push('/admin') }
  }

  const inp: any = { width: '100%', padding: '0.75rem', border: '1px solid #ede8df', fontSize: '14px', outline: 'none', boxSizing: 'border-box', backgroundColor: '#fff', fontFamily: 'inherit' }
  const lbl: any = { display: 'block', fontSize: '12px', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#4A5563', marginBottom: '0.5rem' }

  if (loading) return <div style={{ minHeight: '100vh', backgroundColor: '#f7f4ee', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><p style={{ color: '#9a9085' }}>Loading...</p></div>

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f7f4ee' }}>
      <header style={{ backgroundColor: '#0e1a2b', padding: '1rem 0' }}>
        <div className="container-content" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <Link href="/admin" style={{ fontSize: '12px', color: 'rgba(247,244,238,0.6)', textDecoration: 'none' }}>← Dashboard</Link>
            <span style={{ color: 'rgba(247,244,238,0.3)' }}>|</span>
            <span style={{ fontSize: '12px', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#c9b28f' }}>Edit Article</span>
          </div>
          <div style={{ display: 'flex', gap: '1rem' }}>
            <button onClick={() => handleSave("draft")} disabled={saving} style={{ fontSize: '12px', fontWeight: 700, color: '#f7f4ee', backgroundColor: 'transparent', border: '1px solid rgba(247,244,238,0.3)', padding: '0.5rem 1rem', cursor: 'pointer', letterSpacing: '0.08em', textTransform: 'uppercase' }}>Save Draft</button>
            <button onClick={() => handleSave("published")} disabled={saving} style={{ fontSize: '12px', fontWeight: 700, color: '#0e1a2b', backgroundColor: '#c9b28f', border: 'none', padding: '0.5rem 1rem', cursor: 'pointer', letterSpacing: '0.08em', textTransform: 'uppercase' }}>{saving ? 'Saving...' : 'Update'}</button>
          </div>
        </div>
      </header>

      <div className="container-content" style={{ paddingTop: '2rem', paddingBottom: '4rem' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: '2rem', alignItems: 'start' }}>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div><label style={lbl}>Title</label><input name="title" value={form.title} onChange={handleTitleChange} placeholder="Article title..." style={{ ...inp, fontSize: '20px', fontWeight: 600 }} /></div>
            <div><label style={lbl}>Slug</label><input name="slug" value={form.slug} onChange={handleChange} style={inp} /></div>
            <div><label style={lbl}>Excerpt</label><textarea name="excerpt" value={form.excerpt} onChange={handleChange} rows={2} style={{ ...inp, resize: 'vertical' as const }} /></div>
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
              <p style={{ fontSize: '13px', fontWeight: 700, color: '#0e1a2b', marginBottom: '1rem', textTransform: 'uppercase', letterSpacing: '0.08em' }}>SEO Settings</p>
              <div style={{ marginBottom: '1rem' }}><label style={lbl}>Meta Title ({form.meta_title.length}/60)</label><input name="meta_title" value={form.meta_title} onChange={handleChange} style={inp} /></div>
              <div><label style={lbl}>Meta Description ({form.meta_description.length}/160)</label><textarea name="meta_description" value={form.meta_description} onChange={handleChange} rows={2} style={{ ...inp, resize: 'vertical' as const }} /></div>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', position: 'sticky', top: '1rem' }}>
            <div style={{ backgroundColor: '#fff', border: '1px solid #ede8df', padding: '1.5rem' }}>
              <p style={{ fontSize: '13px', fontWeight: 700, color: '#0e1a2b', marginBottom: '1rem', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Settings</p>
              <div style={{ marginBottom: '1rem' }}>
                <label style={lbl}>Tags</label>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', marginBottom: '0.5rem' }}>
                  {form.tags.map((t: string) => (
                    <span key={t} style={{ fontSize: '11px', backgroundColor: '#0e1a2b', color: '#f7f4ee', padding: '0.2rem 0.5rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                      {t}<button onClick={() => removeTag(t)} style={{ background: 'none', border: 'none', color: '#c9b28f', cursor: 'pointer', fontSize: '13px', padding: 0 }}>×</button>
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
              </div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <button onClick={() => handleSave("draft")} disabled={saving} style={{ width: '100%', padding: '0.875rem', backgroundColor: 'transparent', border: '1px solid #0e1a2b', color: '#0e1a2b', fontWeight: 700, fontSize: '13px', letterSpacing: '0.08em', textTransform: 'uppercase', cursor: 'pointer' }}>Save as Draft</button>
              <button onClick={() => handleSave("review")} disabled={saving} style={{ width: '100%', padding: '0.875rem', backgroundColor: '#d4820a', color: '#fff', fontWeight: 700, fontSize: '13px', letterSpacing: '0.08em', textTransform: 'uppercase', border: 'none', cursor: 'pointer' }}>Submit for Review</button>
              <button onClick={() => handleSave("published")} disabled={saving} style={{ width: '100%', padding: '0.875rem', backgroundColor: '#0e1a2b', color: '#f7f4ee', fontWeight: 700, fontSize: '13px', letterSpacing: '0.08em', textTransform: 'uppercase', border: 'none', cursor: 'pointer' }}>{saving ? 'Saving...' : 'Update Article'}</button>
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}

export default function EditArticle({ params }: { params: Promise<{ slug: string }> }) {
  const [slug, setSlug] = useState('')
  useEffect(() => { params.then(p => setSlug(p.slug)) }, [params])
  if (!slug) return null
  return <Suspense><EditArticleInner slug={slug} /></Suspense>
}
