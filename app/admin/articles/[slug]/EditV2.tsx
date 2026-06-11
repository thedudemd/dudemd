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

function SidebarSection({ sectionKey, title, summary, children, openSections, toggleSection }: { sectionKey: string, title: string, summary?: string, children: React.ReactNode, openSections: Record<string, boolean>, toggleSection: (key: string) => void }) {
  const isOpen = openSections[sectionKey]
  return (
    <div style={{ backgroundColor: '#fff', border: '1px solid #ede8df' }}>
      <button
        type="button"
        onClick={() => toggleSection(sectionKey)}
        style={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.875rem 1.25rem', background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left' }}
      >
        <span style={{ fontSize: '12px', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase' as const, color: '#0e1a2b' }}>{title}</span>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          {!isOpen && summary && <span style={{ fontSize: '11px', color: '#9a9085', maxWidth: '120px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' as const }}>{summary}</span>}
          <span style={{ fontSize: '14px', color: '#9a9085', transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s', display: 'inline-block' }}>▾</span>
        </div>
      </button>
      {isOpen && <div style={{ padding: '0 1.25rem 1.25rem' }}>{children}</div>}
    </div>
  )
}

function NewArticleInner({ slug }: { slug: string }) {
  const router = useRouter()
  const [categories, setCategories] = useState<any[]>([])
  const [subcategories, setSubcategories] = useState<any[]>([])
  const [tagInput, setTagInput] = useState("")
  const tagInputRef = useRef<HTMLInputElement>(null)
  const [connectedClusters, setConnectedClusters] = useState<any[]>([])
  const [clusterSearch, setClusterSearch] = useState('')
  const [clusterSearchResults, setClusterSearchResults] = useState<any[]>([])
  const [pillarDiscoverySearch, setPillarDiscoverySearch] = useState('')
  const [pillarDiscoveryResults, setPillarDiscoveryResults] = useState<any[]>([])
  const [authors, setAuthors] = useState<any[]>([])
  const [saving, setSaving] = useState(false)
  const [autoSaved, setAutoSaved] = useState('')
  const [suggestions, setSuggestions] = useState<{existing: string[], topics: string[]}>({existing: [], topics: []})
  const [suggestLoading, setSuggestLoading] = useState(false)
  const [suggestKeyword, setSuggestKeyword] = useState('')
  const [seoScore, setSeoScore] = useState(0)
  const [aeoScore, setAeoScore] = useState(0)
  const [readabilityScore, setReadabilityScore] = useState(0)
  const [form, setForm] = useState({ title: '', slug: '', excerpt: '', cover_image_url: '', category_id: '', author_id: '', meta_title: '', meta_description: '', status: 'draft', social_title: '', social_description: '', facebook_teaser_text: '', external_url: '', subcategory_id: '', layout: 'standard', tags: [] as string[], show_hero: true, is_pillar_content: false, is_cornerstone: false, pillar_topic_id: '', cornerstone_article_id: '', is_editor_pick: false })
  const [articleId, setArticleId] = useState('')
  const [canvaDesigns, setCanvaDesigns] = useState<any[]>([])
  const [showCanvaPicker, setShowCanvaPicker] = useState(false)
  const [imgUploading, setImgUploading] = useState(false)
  const imgInputRef = useRef<HTMLInputElement>(null)
  const suggestTimer = useRef<any>(null)
  const [showImgSearch, setShowImgSearch] = useState(false)
  const [showLinkModal, setShowLinkModal] = useState(false)
  const [linkUrl, setLinkUrl] = useState('')
  const [linkSearch, setLinkSearch] = useState('')
  const [linkResults, setLinkResults] = useState<any[]>([])
  const [linkSearching, setLinkSearching] = useState(false)
  const [linkTab, setLinkTab] = useState<'internal'|'external'>('internal')
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
  const [isFullscreen, setIsFullscreen] = useState(false)
  const STATUS_LABELS: Record<string, { label: string; color: string; bg: string }> = {
    draft:            { label: 'Draft',           color: '#9a9085', bg: '#f0ede8' },
    in_review:        { label: 'In Review',        color: '#d4820a', bg: '#fef3e2' },
    ready_to_publish: { label: 'Ready to Publish', color: '#2d7a3a', bg: '#e8f5ea' },
    published:        { label: 'Published',        color: '#0e1a2b', bg: '#c9b28f' },
  }
  const searchParams = useSearchParams()

  // Step C: new state
  const [recentDrafts, setRecentDrafts] = useState<any[]>([])
  const [pillarArticles, setPillarArticles] = useState<any[]>([])
  const [allArticles, setAllArticles] = useState<any[]>([])
  const [parentPillarData, setParentPillarData] = useState<any>(null)
  const [cornerstoneData, setCornerstoneData] = useState<any>(null)
  const [clusterArticles, setClusterArticles] = useState<any[]>([])
  const [clusterLoading, setClusterLoading] = useState(false)
  const [hasLoadedClusters, setHasLoadedClusters] = useState(false)
  const [draftsLoading, setDraftsLoading] = useState(false)
  const [wordTarget] = useState(800)
  const [showPublishConfirm, setShowPublishConfirm] = useState(false)
  const [pendingPublishStatus, setPendingPublishStatus] = useState<string | null>(null)

  // Step A: sidebar section collapse state
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    coverImage: false, settings: false, seo: false, social: false, aiSuggestions: false, scores: false,
    slugExcerpt: false, layout: false, myDrafts: false, articleStructure: false, internalLinking: false,
  })
  function toggleSection(key: string) {
    setOpenSections(s => ({ ...s, [key]: !s[key] }))
  }

  // Step B: cover image Unsplash search state (separate from in-editor search)
  const [coverSearchQuery, setCoverSearchQuery] = useState('')
  const [coverSearchResults, setCoverSearchResults] = useState<any[]>([])
  const [coverSearchLoading, setCoverSearchLoading] = useState(false)
  const [coverSearchPage, setCoverSearchPage] = useState(1)
  const [coverSearchHasMore, setCoverSearchHasMore] = useState(false)

  async function searchCoverUnsplash(q: string, page = 1) {
    if (q.trim().length < 2) return
    setCoverSearchLoading(true)
    try {
      const res = await fetch('/api/unsplash?query=' + encodeURIComponent(q) + '&page=' + page)
      const data = await res.json()
      if (page === 1) {
        setCoverSearchResults(data.results || [])
      } else {
        setCoverSearchResults(prev => [...prev, ...(data.results || [])])
      }
      setCoverSearchHasMore((data.results || []).length === 30)
      setCoverSearchPage(page)
    } catch(e) {}
    setCoverSearchLoading(false)
  }

  const editor = useEditor({
    extensions: [
      StarterKit, Underline, ResizableImage,
      LinkExtension.configure({ openOnClick: false, HTMLAttributes: { class: 'article-link' } }),
      Placeholder.configure({ placeholder: 'Write your article here...' }),
      TextAlign.configure({ types: ['heading', 'paragraph'] }),
      TextStyle, Color, Highlight.configure({ multicolor: true }), Subscript, Superscript, CharacterCount, FontSize,
    ],
    content: '',
    onUpdate: ({ editor }) => {
      const text = editor.getText()
      const words = text.split(/\s+/).filter(Boolean).length
      calcScores(form.title, text, words)
      if (suggestTimer.current) clearTimeout(suggestTimer.current)
      if (words >= 50) {
        suggestTimer.current = setTimeout(() => {
          const stopWords = new Set(['the','a','an','and','or','but','in','on','at','to','for','of','with','by','from','is','was','are','were','be','been','this','that','it','he','she','they','we','you','i','my','your','his','her','our'])
          const freq: Record<string, number> = {}
          text.toLowerCase().replace(/[^a-z0-9 ]/g, '').split(/\s+/).filter(w => w.length > 3 && !stopWords.has(w)).forEach(w => { freq[w] = (freq[w] || 0) + 1 })
          const topKeyword = Object.entries(freq).sort((a,b) => b[1]-a[1]).slice(0,1).map(([w]) => w)[0]
          if (topKeyword) fetchSuggestions(topKeyword)
        }, 3000)
      }
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
      if (data.url) { editor.chain().focus().insertContent({ type: 'image', attrs: { src: data.url } }).run() }
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
      if (data.url) { editor.chain().focus().insertContent({ type: 'image', attrs: { src: data.url } }).run() }
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
      // Fetch pillar articles for Article Structure section
      const { data: pillars } = await supabase
        .from('articles')
        .select('id, title')
        .eq('is_pillar_content', true)
        .order('title')
      setPillarArticles(pillars || [])
      const { data: allArts } = await supabase
        .from('articles')
        .select('id, title, is_cornerstone')
        .order('title')
      setAllArticles(allArts || [])
      // Fetch my drafts via author user_id mapping
      setDraftsLoading(true)
      const { data: authorRecord } = await supabase
        .from('authors')
        .select('id')
        .eq('user_id', session.user.id)
        .single()
      if (authorRecord) {
        const { data: drafts } = await supabase
          .from('articles')
          .select('id, title, slug, updated_at')
          .eq('status', 'draft')
          .eq('author_id', authorRecord.id)
          .order('updated_at', { ascending: false })
          .limit(8)
        setRecentDrafts(drafts || [])
      }
      setDraftsLoading(false)
    }
    init()
  }, [])

  // Load existing article for editing
  useEffect(() => {
    async function loadArticle() {
      const { data: article } = await (supabase.from as any)('articles').select('*').eq('slug', slug).single()
      if (!article) { router.push('/admin'); return }
      setArticleId(article.id)
      setForm({
        title: article.title || '', slug: article.slug || '', excerpt: article.excerpt || '',
        cover_image_url: article.cover_image_url || '', category_id: article.category_id || '',
        author_id: article.author_id || '', meta_title: article.meta_title || '',
        meta_description: article.meta_description || '', status: article.status || 'draft',
        social_title: article.social_title || '', social_description: article.social_description || '',
        facebook_teaser_text: article.facebook_teaser_text || '', external_url: article.external_url || '',
        subcategory_id: article.subcategory_id || '', layout: article.layout || 'standard',
        tags: article.tags || [], show_hero: article.show_hero !== false,
        is_pillar_content: article.is_pillar_content || false, is_cornerstone: article.is_cornerstone || false,
        pillar_topic_id: article.pillar_topic_id || '', cornerstone_article_id: article.cornerstone_article_id || '', is_editor_pick: article.is_editor_pick || false
      })
      if (article.category_id) {
        const { data: subs } = await supabase.from('categories').select('*').eq('parent_id', article.category_id).eq('enabled', true).order('sort_order')
        setSubcategories(subs || [])
      }
      if (editor && article.content) editor.commands.setContent(article.content)
    }
    if (editor && slug) loadArticle()
  }, [editor, slug])

  // Fetch parent pillar data when pillar_topic_id changes
  useEffect(() => {
    if (form.pillar_topic_id) fetchParentPillar(form.pillar_topic_id)
    else setParentPillarData(null)
  }, [form.pillar_topic_id])

  // Fetch cornerstone data when cornerstone_article_id changes
  useEffect(() => {
    if (form.cornerstone_article_id) fetchCornerstoneArticle(form.cornerstone_article_id)
    else setCornerstoneData(null)
  }, [form.cornerstone_article_id])

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

  async function searchArticlesByTitle(query: string, setPillar: boolean) {
    if (!query.trim()) { if (setPillar) setPillarDiscoveryResults([]); else setClusterSearchResults([]); return }
    const { data } = await supabase.from('articles').select('id,title,slug,status,categories!articles_category_id_fkey(slug)').ilike('title', '%' + query + '%').limit(8)
    if (setPillar) setPillarDiscoveryResults(data || [])
    else setClusterSearchResults(data || [])
  }

  async function handleSave(status: string) {
    if (status === "published" && !showPublishConfirm) {
      setPendingPublishStatus('published')
      setShowPublishConfirm(true)
      return
    }
    setShowPublishConfirm(false)
    setPendingPublishStatus(null)
    if (status === "published" && !form.category_id) {
      alert("Please select a category before publishing.")
      setShowPublishConfirm(false)
      return
    }
    if (status === "published" && !form.author_id) {
      alert("Please select an author before publishing.")
      setShowPublishConfirm(false)
      return
    }
    if (status === "published" && !form.category_id) {
      alert("Please select a category before publishing.")
      setShowPublishConfirm(false)
      return
    }
    if (status === "published" && !form.author_id) {
      alert("Please select an author before publishing.")
      setShowPublishConfirm(false)
      return
    }
    if (status === "published" && !form.cover_image_url && form.show_hero) {
      alert("Please add a cover image before publishing.")
      return
    }
    setSaving(true)
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) { router.push('/admin/login'); return }
    const cleanForm = { ...form, category_id: form.category_id || null, subcategory_id: form.subcategory_id || null, author_id: form.author_id || null }
    const { error } = await supabase.from('articles').update({ ...cleanForm, content: editor?.getHTML() || '', read_time: getReadTime(), status, published: status === 'published', published_at: status === 'published' ? new Date().toISOString() : null, updated_at: new Date().toISOString(), is_pillar_content: form.is_pillar_content, is_cornerstone: form.is_cornerstone, pillar_topic_id: form.pillar_topic_id || null, cornerstone_article_id: form.cornerstone_article_id || null, is_editor_pick: form.is_editor_pick }).eq('id', articleId)
    if (error) { alert('Error: ' + error.message); setSaving(false) }
    else { router.push('/admin') }
  }

  // Fullscreen API
  useEffect(() => {
    function onFSChange() { setIsFullscreen(!!document.fullscreenElement) }
    document.addEventListener('fullscreenchange', onFSChange)
    return () => document.removeEventListener('fullscreenchange', onFSChange)
  }, [])

  async function toggleTrueFullscreen() {
    if (!document.fullscreenElement) { try { await document.documentElement.requestFullscreen() } catch {} }
    else { try { await document.exitFullscreen() } catch {} }
  }

  const inp: any = { width: '100%', padding: '0.75rem', border: '1px solid #ede8df', fontSize: '14px', outline: 'none', boxSizing: 'border-box', backgroundColor: '#fff', fontFamily: 'inherit' }
  const lbl: any = { display: 'block', fontSize: '12px', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#4A5563', marginBottom: '0.5rem' }

  // Internal Linking helpers
  function isAlreadyLinked(href: string): boolean {
    if (!editor) return false
    return editor.getHTML().includes(`href="${href}"`) || editor.getHTML().includes(`href='${href}'`)
  }

  function insertInternalLink(href: string, fallbackText: string) {
    if (!editor) return
    const { from, to } = editor.state.selection
    const hasSelection = from !== to
    if (hasSelection) {
      editor.chain().focus().setLink({ href, target: '_self' }).run()
    } else {
      editor.chain().focus().insertContent(`<a href="${href}" target="_self">${fallbackText}</a> `).run()
    }
  }

  async function insertRelatedClusterBlock(clusters: any[]) {
    if (!editor || clusters.length === 0) return
    const items = clusters
      .map((a: any) => `<li><a href="/articles/${a.categories?.slug}/${a.slug}" target="_self">${a.title}</a></li>`)
      .join('')
    editor.chain().focus().insertContent(`<ul>${items}</ul>`).run()
  }

  async function fetchParentPillar(pillarId: string) {
    if (!pillarId) { setParentPillarData(null); return }
    const res = await fetch(
      `https://bicljoujevywrkzjeaoy.supabase.co/rest/v1/articles?select=id,title,slug,categories!articles_category_id_fkey(slug)&id=eq.${pillarId}&limit=1`,
      { headers: { apikey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJpY2xqb3VqZXZ5d3JremplYW95Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzg4MDc1ODIsImV4cCI6MjA5NDM4MzU4Mn0.UIKVUyX6QClJmAYdQKg91t_kAT4itpuSk_fIemcPJ0g' } }
    )
    const data = await res.json()
    setParentPillarData(data?.[0] || null)
  }

  async function fetchCornerstoneArticle(cornerstoneId: string) {
    if (!cornerstoneId) { setCornerstoneData(null); return }
    const res = await fetch(
      `https://bicljoujevywrkzjeaoy.supabase.co/rest/v1/articles?select=id,title,slug,categories!articles_category_id_fkey(slug)&id=eq.${cornerstoneId}&limit=1`,
      { headers: { apikey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJpY2xqb3VqZXZ5d3JremplYW95Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzg4MDc1ODIsImV4cCI6MjA5NDM4MzU4Mn0.UIKVUyX6QClJmAYdQKg91t_kAT4itpuSk_fIemcPJ0g' } }
    )
    const data = await res.json()
    setCornerstoneData(data?.[0] || null)
  }

  // Collapsible sidebar section component
  const categoryName = categories.find(c => c.id === form.category_id)?.name
  const authorName = authors.find(a => a.id === form.author_id)?.name

  return (
    <>
      <div style={{ minHeight: '100vh', backgroundColor: '#f7f4ee' }}>
        <header style={{ backgroundColor: '#0e1a2b', padding: '1rem 0', position: 'sticky' as const, top: 0, zIndex: 50 }}>
          <div className="container-content" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap' as const, rowGap: '0.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <Link href="/admin" style={{ fontSize: '12px', color: 'rgba(247,244,238,0.6)', textDecoration: 'none' }}>← Dashboard</Link>
              <span style={{ color: 'rgba(247,244,238,0.3)' }}>|</span>
              <span style={{ fontSize: '12px', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#c9b28f' }}>New Article</span>
              <span style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', color: STATUS_LABELS[form.status]?.color || '#9a9085', backgroundColor: STATUS_LABELS[form.status]?.bg || '#f0ede8', padding: '2px 8px', borderRadius: 3 }}>{STATUS_LABELS[form.status]?.label || 'Draft'}</span>
            </div>
            <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap' as const, rowGap: '0.5rem', justifyContent: 'flex-end' }}>
              <span style={{ fontSize: '12px', color: 'rgba(247,244,238,0.5)', whiteSpace: 'nowrap' as const }}>{getWordCount()} words · {getReadTime()}</span>
              {autoSaved && <span style={{ fontSize: '11px', color: 'rgba(247,244,238,0.4)', fontStyle: 'italic' }}>{autoSaved} <span style={{ color: 'rgba(247,244,238,0.25)' }}>(local only)</span></span>}
              <button onClick={() => handleSave('draft')} disabled={saving} style={{ fontSize: '12px', fontWeight: 700, color: '#f7f4ee', backgroundColor: 'transparent', border: '1px solid rgba(247,244,238,0.3)', padding: '0.5rem 1rem', cursor: 'pointer', letterSpacing: '0.08em', textTransform: 'uppercase' }}>Save Draft</button>
              <button onClick={() => handleSave('published')} disabled={saving} style={{ fontSize: '12px', fontWeight: 700, color: '#0e1a2b', backgroundColor: '#c9b28f', border: 'none', padding: '0.5rem 1rem', cursor: 'pointer', letterSpacing: '0.08em', textTransform: 'uppercase' }}>{saving ? 'Publishing...' : 'Publish'}</button>
              <button onClick={() => setFullscreen(f => !f)} style={{ fontSize: '12px', fontWeight: 700, color: '#f7f4ee', backgroundColor: 'transparent', border: '1px solid rgba(247,244,238,0.3)', padding: '0.5rem 1rem', cursor: 'pointer', letterSpacing: '0.08em', textTransform: 'uppercase' }}>{fullscreen ? '⊠ Exit Focus' : '⛶ Focus'}</button>
              <button onClick={toggleTrueFullscreen} style={{ fontSize: '12px', fontWeight: 700, color: '#f7f4ee', backgroundColor: 'transparent', border: '1px solid rgba(247,244,238,0.3)', padding: '0.5rem 1rem', cursor: 'pointer', letterSpacing: '0.08em', textTransform: 'uppercase' }}>{isFullscreen ? '⊡ Exit Full' : '⛶ Fullscreen'}</button>
            </div>
          </div>
        </header>
        <div className="container-content" style={{ paddingTop: '2rem', paddingBottom: '4rem' }}>
          <div key={fullscreen ? 'fs' : 'normal'} style={{ display: 'grid', gridTemplateColumns: fullscreen ? '1fr' : '1fr 300px', gap: '2rem', alignItems: 'start' }}>
            {/* LEFT COLUMN */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

              {/* TITLE — always visible, sticky below toolbar */}
              <div style={{ position: 'sticky' as const, top: '145px', zIndex: 30, backgroundColor: '#f7f4ee', paddingTop: '0.5rem', paddingBottom: '0.5rem', borderBottom: '1px solid #ede8df' }}>
                <label style={lbl}>Title</label>
                <input name="title" value={form.title} onChange={handleTitleChange} placeholder="Article title..." style={{ ...inp, fontSize: '20px', fontWeight: 600 }} />
              </div>

              {/* SLUG + EXCERPT — collapsed by default */}
              {!fullscreen && (
                <div style={{ backgroundColor: '#fff', border: '1px solid #ede8df' }}>
                  <button
                    type="button"
                    onClick={() => toggleSection('slugExcerpt')}
                    style={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.875rem 1.25rem', background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left' }}
                  >
                    <span style={{ fontSize: '12px', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase' as const, color: '#0e1a2b' }}>Slug & Excerpt</span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      {!openSections.slugExcerpt && form.slug && <span style={{ fontSize: '11px', color: '#9a9085', maxWidth: '180px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' as const }}>{form.slug}</span>}
                      <span style={{ fontSize: '14px', color: '#9a9085', transform: openSections.slugExcerpt ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s', display: 'inline-block' }}>▾</span>
                    </div>
                  </button>
                  {openSections.slugExcerpt && (
                    <div style={{ padding: '0 1.25rem 1.25rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                      <div>
                        <label style={lbl}>Slug</label>
                        <input name="slug" value={form.slug} onChange={handleChange} style={inp} />
                      </div>
                      <div>
                        <label style={lbl}>Excerpt</label>
                        <textarea name="excerpt" value={form.excerpt} onChange={handleChange} rows={2} placeholder="Brief description..." style={{ ...inp, resize: 'vertical' as const }} />
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* LAYOUT — collapsed by default */}
              {!fullscreen && (
                <div style={{ backgroundColor: '#fff', border: '1px solid #ede8df' }}>
                  <button
                    type="button"
                    onClick={() => toggleSection('layout')}
                    style={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.875rem 1.25rem', background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left' }}
                  >
                    <span style={{ fontSize: '12px', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase' as const, color: '#0e1a2b' }}>Article Layout</span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      {!openSections.layout && <span style={{ fontSize: '11px', color: '#9a9085' }}>{form.layout.charAt(0).toUpperCase() + form.layout.slice(1)}</span>}
                      <span style={{ fontSize: '14px', color: '#9a9085', transform: openSections.layout ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s', display: 'inline-block' }}>▾</span>
                    </div>
                  </button>
                  {openSections.layout && (
                    <div style={{ padding: '0 1.25rem 1.25rem' }}>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.75rem' }}>
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
                  )}
                </div>
              )}

              {/* EDITOR — always visible */}
              <div>
                <label style={lbl}>Content</label>
                <div style={{ display: 'flex', alignItems: 'center', gap: '2px', flexWrap: 'wrap' as const, padding: '4px 12px', border: '1px solid #ede8df', borderBottom: 'none', backgroundColor: '#fff', position: 'sticky' as const, top: '100px', zIndex: 40, boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
                  <ToolbarBtn active={!!editor?.isActive('bold')} onClick={() => editor?.chain().focus().toggleBold().run()} title="Bold"><b>B</b></ToolbarBtn>
                  <ToolbarBtn active={!!editor?.isActive('italic')} onClick={() => editor?.chain().focus().toggleItalic().run()} title="Italic"><i>I</i></ToolbarBtn>
                  <ToolbarBtn active={!!editor?.isActive('underline')} onClick={() => editor?.chain().focus().toggleUnderline().run()} title="Underline"><u>U</u></ToolbarBtn>
                  <ToolbarBtn active={!!editor?.isActive('strike')} onClick={() => editor?.chain().focus().toggleStrike().run()} title="Strikethrough"><s>S</s></ToolbarBtn>
                  <ToolbarDivider />
                  <ToolbarBtn active={!!editor?.isActive('heading', { level: 1 })} onClick={() => editor?.chain().focus().toggleHeading({ level: 1 }).run()} title="Heading 1">H1</ToolbarBtn>
                  <ToolbarBtn active={!!editor?.isActive('heading', { level: 2 })} onClick={() => editor?.chain().focus().toggleHeading({ level: 2 }).run()} title="Heading 2">H2</ToolbarBtn>
                  <ToolbarBtn active={!!editor?.isActive('heading', { level: 3 })} onClick={() => editor?.chain().focus().toggleHeading({ level: 3 }).run()} title="Heading 3">H3</ToolbarBtn>
                  <ToolbarBtn active={!!editor?.isActive('paragraph')} onClick={() => editor?.chain().focus().setParagraph().run()} title="Paragraph">P</ToolbarBtn>
                  <ToolbarDivider />
                  <ToolbarBtn active={!!editor?.isActive('bulletList')} onClick={() => editor?.chain().focus().toggleBulletList().run()} title="Bullet List">• List</ToolbarBtn>
                  <ToolbarBtn active={!!editor?.isActive('orderedList')} onClick={() => editor?.chain().focus().toggleOrderedList().run()} title="Numbered List">1. List</ToolbarBtn>
                  <ToolbarBtn active={!!editor?.isActive('blockquote')} onClick={() => editor?.chain().focus().toggleBlockquote().run()} title="Quote">❝</ToolbarBtn>
                  <ToolbarDivider />
                  <ToolbarBtn active={false} onClick={() => editor?.chain().focus().undo().run()} title="Undo">↶</ToolbarBtn>
                  <ToolbarBtn active={false} onClick={() => editor?.chain().focus().redo().run()} title="Redo">↷</ToolbarBtn>
                  <ToolbarDivider />
                  <ToolbarBtn active={false} onClick={() => { const img = document.querySelector('.ProseMirror img.ProseMirror-selectednode') as HTMLImageElement; if(img){ img.classList.remove('float-right','float-none'); img.classList.add('float-left'); } }} title="Float image left">⬅ Img</ToolbarBtn>
                  <ToolbarBtn active={false} onClick={() => { const img = document.querySelector('.ProseMirror img.ProseMirror-selectednode') as HTMLImageElement; if(img){ img.classList.remove('float-left','float-none'); img.classList.add('float-right'); } }} title="Float image right">Img ➡</ToolbarBtn>
                  <ToolbarBtn active={false} onClick={() => { const img = document.querySelector('.ProseMirror img.ProseMirror-selectednode') as HTMLImageElement; if(img){ img.classList.remove('float-left','float-right'); img.classList.add('float-none'); } }} title="Center image">⊡ Img</ToolbarBtn>
                  <ToolbarDivider />
                  <select onChange={e => { if(e.target.value) (editor?.chain().focus() as any).setFontSize(e.target.value).run(); else (editor?.chain().focus() as any).unsetFontSize().run() }} defaultValue="" style={{ fontSize: '11px', border: '1px solid #e8e4de', padding: '3px 4px', backgroundColor: '#fff', color: '#4A5563', cursor: 'pointer', borderRadius: 3 }}>
                    <option value=''>Size</option>
                    {['12','14','16','18','20','24','28','32','36'].map(s => <option key={s} value={s+'px'}>{s}</option>)}
                  </select>
                  <input type='color' title='Text Color' defaultValue='#000000' onChange={e => editor?.chain().focus().setColor(e.target.value).run()} style={{ width: 24, height: 24, padding: 1, border: '1px solid #e8e4de', cursor: 'pointer', borderRadius: 3 }} />
                  <ToolbarDivider />
                  <ToolbarBtn active={!!editor?.isActive({ textAlign: 'left' })} onClick={() => editor?.chain().focus().setTextAlign('left').run()} title="Align Left">⬅</ToolbarBtn>
                  <ToolbarBtn active={!!editor?.isActive({ textAlign: 'center' })} onClick={() => editor?.chain().focus().setTextAlign('center').run()} title="Align Center">↔</ToolbarBtn>
                  <ToolbarBtn active={!!editor?.isActive({ textAlign: 'right' })} onClick={() => editor?.chain().focus().setTextAlign('right').run()} title="Align Right">➡</ToolbarBtn>
                  <ToolbarBtn active={!!editor?.isActive('subscript')} onClick={() => editor?.chain().focus().toggleSubscript().run()} title="Subscript">x₂</ToolbarBtn>
                  <ToolbarBtn active={!!editor?.isActive('superscript')} onClick={() => editor?.chain().focus().toggleSuperscript().run()} title="Superscript">x²</ToolbarBtn>
                  <ToolbarDivider />
                  <input ref={imgInputRef} type='file' accept='image/jpeg,image/png,image/webp,image/gif' style={{ display: 'none' }} onChange={handleImageUpload} />
                  <ToolbarBtn active={false} onClick={() => imgInputRef.current?.click()} disabled={imgUploading} title="Insert Image">{imgUploading ? '...' : '🖼 Image'}</ToolbarBtn>
                  <ToolbarBtn active={false} onClick={() => setShowImgSearch(true)} title="Search Images">🔍 Search</ToolbarBtn>
                  <ToolbarBtn active={!!editor?.isActive('link')} onClick={() => { const prev = editor?.getAttributes('link').href || ''; setLinkUrl(prev); setLinkTab('internal'); setLinkSearch(''); setLinkResults([]); setShowLinkModal(true); }} title="Link">🔗 {editor?.isActive('link') ? 'Edit Link' : 'Link'}</ToolbarBtn>
                  {editor?.isActive('link') && <ToolbarBtn active={false} onClick={() => editor.chain().focus().unsetLink().run()} title="Remove Link">✕ Unlink</ToolbarBtn>}
                  <ToolbarDivider />
                  <span style={{ fontSize: '11px', color: '#9a9085', padding: '0 4px', whiteSpace: 'nowrap' as const }}>{getWordCount()} words</span>
                </div>
                <div onDragOver={e => e.preventDefault()} onDrop={handleDrop} style={{ border: '1px solid #ede8df', backgroundColor: '#fff', minHeight: fullscreen ? 'calc(100vh - 200px)' : '500px', padding: '1rem' }}>
                  <EditorContent editor={editor} />
                </div>
                {/* Word count progress */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginTop: '0.5rem' }}>
                  <div style={{ flex: 1, height: 4, backgroundColor: '#ede8df', borderRadius: 2, overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${Math.min(100, Math.round((getWordCount() / wordTarget) * 100))}%`, backgroundColor: getWordCount() >= wordTarget ? '#2d7a3a' : getWordCount() >= wordTarget * 0.5 ? '#d4820a' : '#c9b28f', transition: 'width 0.3s, background-color 0.3s', borderRadius: 2 }} />
                  </div>
                  <span style={{ fontSize: '12px', color: getWordCount() >= wordTarget ? '#2d7a3a' : '#9a9085', whiteSpace: 'nowrap' as const, fontWeight: 600 }}>
                    {getWordCount()} / {wordTarget} words {getWordCount() >= wordTarget ? '✓' : ''}
                  </span>
                </div>
              </div>

              {/* SEO SETTINGS — collapsed */}
              {!fullscreen && (
                <div style={{ backgroundColor: '#fff', border: '1px solid #ede8df' }}>
                  <button type="button" onClick={() => toggleSection('seo')} style={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.875rem 1.25rem', background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left' }}>
                    <span style={{ fontSize: '12px', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase' as const, color: '#0e1a2b' }}>SEO Settings</span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      {!openSections.seo && <span style={{ fontSize: '11px', padding: '0.1rem 0.4rem', backgroundColor: scoreBg(seoScore), color: scoreColor(seoScore), fontWeight: 700 }}>SEO {seoScore}/100</span>}
                      <span style={{ fontSize: '14px', color: '#9a9085', transform: openSections.seo ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s', display: 'inline-block' }}>▾</span>
                    </div>
                  </button>
                  {openSections.seo && (
                    <div style={{ padding: '0 1.25rem 1.25rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                      <div>
                        <label style={lbl}>Meta Title ({form.meta_title.length}/60)</label>
                        <input name="meta_title" value={form.meta_title} onChange={handleChange} style={inp} />
                      </div>
                      <div>
                        <label style={lbl}>Meta Description ({form.meta_description.length}/160)</label>
                        <textarea name="meta_description" value={form.meta_description} onChange={handleChange} rows={3} style={{ ...inp, resize: 'vertical' as const }} />
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* SOCIAL — collapsed */}
              {!fullscreen && (
                <div style={{ backgroundColor: '#fff', border: '1px solid #ede8df' }}>
                  <button type="button" onClick={() => toggleSection('social')} style={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.875rem 1.25rem', background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left' }}>
                    <span style={{ fontSize: '12px', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase' as const, color: '#0e1a2b' }}>Facebook & Social</span>
                    <span style={{ fontSize: '14px', color: '#9a9085', transform: openSections.social ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s', display: 'inline-block' }}>▾</span>
                  </button>
                  {openSections.social && (
                    <div style={{ padding: '0 1.25rem 1.25rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                      <div>
                        <label style={lbl}>Social Title</label>
                        <input name="social_title" value={form.social_title} onChange={handleChange} placeholder="Defaults to meta title" style={inp} />
                      </div>
                      <div>
                        <label style={lbl}>Social Description</label>
                        <textarea name="social_description" value={form.social_description} onChange={handleChange} rows={2} placeholder="Defaults to meta description" style={{ ...inp, resize: 'vertical' as const }} />
                      </div>
                      <div>
                        <label style={lbl}>Facebook Teaser Text</label>
                        <textarea name="facebook_teaser_text" value={form.facebook_teaser_text} onChange={handleChange} rows={3} placeholder="2-3 sentence teaser for Facebook posts..." style={{ ...inp, resize: 'vertical' as const }} />
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* AI SUGGESTIONS — collapsed */}
              {!fullscreen && (
                <div style={{ backgroundColor: '#fff', border: '1px solid #ede8df' }}>
                  <button type="button" onClick={() => toggleSection('aiSuggestions')} style={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.875rem 1.25rem', background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left' }}>
                    <span style={{ fontSize: '12px', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase' as const, color: '#0e1a2b' }}>AI Article Suggestions</span>
                    <span style={{ fontSize: '14px', color: '#9a9085', transform: openSections.aiSuggestions ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s', display: 'inline-block' }}>▾</span>
                  </button>
                  {openSections.aiSuggestions && (
                    <div style={{ padding: '0 1.25rem 1.25rem' }}>
                      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
                        <input type="text" placeholder="Enter keyword..." value={suggestKeyword} onChange={(e) => setSuggestKeyword(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && fetchSuggestions(suggestKeyword)} style={{ ...inp, flex: 1 }} />
                        <button onClick={() => fetchSuggestions(suggestKeyword)} disabled={suggestLoading} style={{ padding: '0.75rem 1.25rem', backgroundColor: '#0e1a2b', color: '#fff', border: 'none', fontWeight: 700, fontSize: '12px', letterSpacing: '0.08em', textTransform: 'uppercase' as const, cursor: 'pointer', whiteSpace: 'nowrap' as const }}>{suggestLoading ? 'Loading...' : 'SUGGEST'}</button>
                      </div>
                      {suggestions.existing.length > 0 && (
                        <div style={{ marginBottom: '1rem' }}>
                          <p style={{ fontSize: '11px', fontWeight: 700, color: '#4A5563', marginBottom: '0.5rem', textTransform: 'uppercase' as const, letterSpacing: '0.08em' }}>Existing Articles to Link <span style={{ fontWeight: 400, textTransform: 'none' as const, letterSpacing: 0 }}>— click to insert link</span></p>
                          {suggestions.existing.map((article, idx) => (
                            <button
                              key={idx}
                              type="button"
                              onClick={async () => {
                                const res = await fetch(`https://bicljoujevywrkzjeaoy.supabase.co/rest/v1/articles?select=title,slug,categories!articles_category_id_fkey(slug)&title=ilike.*${encodeURIComponent(article)}*&status=eq.published&limit=1`, { headers: { apikey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJpY2xqb3VqZXZ5d3JremplYW95Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzg4MDc1ODIsImV4cCI6MjA5NDM4MzU4Mn0.UIKVUyX6QClJmAYdQKg91t_kAT4itpuSk_fIemcPJ0g' } })
                                const data = await res.json()
                                if (data?.[0]) {
                                  const href = `/articles/${data[0].categories?.slug}/${data[0].slug}`
                                  editor?.chain().focus().setLink({ href, target: '_self' }).run()
                                }
                              }}
                              style={{ display: 'block', width: '100%', textAlign: 'left', fontSize: '13px', color: '#0e1a2b', marginBottom: '0.4rem', paddingLeft: '0.75rem', paddingTop: '0.35rem', paddingBottom: '0.35rem', borderLeft: '2px solid #c9b28f', background: 'none', border: 'none', borderLeft: '2px solid #c9b28f', cursor: 'pointer', borderRadius: 0 }}
                              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.backgroundColor = '#f7f4ee' }}
                              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.backgroundColor = 'transparent' }}
                            >🔗 {article}</button>
                          ))}
                        </div>
                      )}
                      {suggestions.topics.length > 0 && (
                        <div>
                          <p style={{ fontSize: '11px', fontWeight: 700, color: '#4A5563', marginBottom: '0.5rem', textTransform: 'uppercase' as const, letterSpacing: '0.08em' }}>New Topic Ideas</p>
                          {suggestions.topics.map((topic, idx) => (
                            <div key={idx} style={{ fontSize: '13px', color: '#0e1a2b', marginBottom: '0.4rem', paddingLeft: '0.75rem', borderLeft: '2px solid #c9b28f' }}>• {topic}</div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* RIGHT SIDEBAR */}
            <div style={{ display: fullscreen ? 'none' : 'flex', flexDirection: 'column', gap: '1rem', position: 'sticky', top: '1rem' }}>

              {/* STATUS — workflow */}
              <SidebarSection openSections={openSections} toggleSection={toggleSection} sectionKey="status" title="Workflow Status" summary={STATUS_LABELS[form.status]?.label || 'Draft'}>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', marginBottom: '0.75rem' }}>
                  {Object.entries(STATUS_LABELS).map(([key, conf]) => (
                    <button key={key} type="button" onClick={() => setForm(f => ({ ...f, status: key }))} style={{ padding: '4px 10px', fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', border: '1px solid', borderColor: form.status === key ? conf.color : '#e8e4de', backgroundColor: form.status === key ? conf.bg : '#fff', color: form.status === key ? conf.color : '#9a9085', cursor: 'pointer', borderRadius: 3 }}>{conf.label}</button>
                  ))}
                </div>
                <p style={{ fontSize: '11px', color: '#9a9085', margin: 0, lineHeight: 1.5 }}>Draft → In Review → Ready to Publish → Published</p>
              </SidebarSection>

              {/* SCORES — collapsed */}
              <SidebarSection openSections={openSections} toggleSection={toggleSection} sectionKey="scores" title="Article Scores" summary={`SEO ${seoScore} · AEO ${aeoScore} · Read ${readabilityScore}`}>
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
              </SidebarSection>

              {/* MY DRAFTS — collapsed */}
              <SidebarSection openSections={openSections} toggleSection={toggleSection} sectionKey="myDrafts" title="My Drafts" summary={recentDrafts.length > 0 ? `${recentDrafts.length} draft${recentDrafts.length > 1 ? 's' : ''}` : draftsLoading ? 'Loading...' : 'None'}>
                {draftsLoading ? (
                  <p style={{ fontSize: '13px', color: '#9a9085', margin: 0 }}>Loading...</p>
                ) : recentDrafts.length === 0 ? (
                  <p style={{ fontSize: '13px', color: '#9a9085', margin: 0 }}>No drafts found linked to your author profile.</p>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                    {recentDrafts.map((draft: any) => {
                      const updated = new Date(draft.updated_at)
                      const now = new Date()
                      const diffMs = now.getTime() - updated.getTime()
                      const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))
                      const diffHrs = Math.floor(diffMs / (1000 * 60 * 60))
                      const timeAgo = diffDays > 0 ? `${diffDays}d ago` : diffHrs > 0 ? `${diffHrs}h ago` : 'Just now'
                      return (
                        <a
                          key={draft.id}
                          href={`/admin/articles/${draft.id}/edit`}
                          style={{ display: 'block', padding: '0.6rem 0.75rem', border: '1px solid #ede8df', backgroundColor: '#fff', textDecoration: 'none', borderRadius: 2 }}
                          onMouseEnter={e => { (e.currentTarget as HTMLElement).style.backgroundColor = '#f7f4ee' }}
                          onMouseLeave={e => { (e.currentTarget as HTMLElement).style.backgroundColor = '#fff' }}
                        >
                          <div style={{ fontSize: '13px', fontWeight: 600, color: '#0e1a2b', marginBottom: '0.2rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' as const }}>{draft.title || 'Untitled'}</div>
                          <div style={{ fontSize: '11px', color: '#9a9085' }}>Draft · {timeAgo}</div>
                        </a>
                      )
                    })}
                  </div>
                )}
              </SidebarSection>

              {/* ARTICLE STRUCTURE — collapsed */}
              <SidebarSection openSections={openSections} toggleSection={toggleSection}                 sectionKey="articleStructure"
                title="Article Structure"
                summary={
                  form.is_pillar_content
                    ? form.is_cornerstone ? 'Pillar · Cornerstone' : 'Pillar Article'
                    : form.pillar_topic_id
                    ? `Cluster under ${pillarArticles.find((p: any) => p.id === form.pillar_topic_id)?.title || '...'}`
                    : form.is_cornerstone
                    ? 'Cornerstone'
                    : 'Standard Article'
                }
              >
                {/* Editor's Pick toggle */}
                <div style={{ marginBottom: '1rem', paddingBottom: '1rem', borderBottom: '1px solid #ede8df' }}>
                  <label style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem', cursor: 'pointer' }}>
                    <input type="checkbox" checked={form.is_editor_pick} onChange={e => setForm(f => ({ ...f, is_editor_pick: e.target.checked }))} style={{ marginTop: '2px', accentColor: '#0e1a2b', width: 16, height: 16, flexShrink: 0 }} />
                    <span>
                      <span style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#0e1a2b' }}>⭐ Editor's Pick</span>
                      <span style={{ display: 'block', fontSize: '12px', color: '#9a9085', marginTop: '0.15rem' }}>Show this article in the sidebar "Editor's Picks" on other article pages.</span>
                    </span>
                  </label>
                </div>

                {/* Pillar Content toggle */}
                <div style={{ marginBottom: '1rem' }}>
                  <label style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem', cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      checked={form.is_pillar_content}
                      onChange={e => {
                        const checked = e.target.checked
                        setForm(f => ({ ...f, is_pillar_content: checked, pillar_topic_id: checked ? '' : f.pillar_topic_id }))
                      }}
                      style={{ marginTop: '2px', accentColor: '#0e1a2b', width: 16, height: 16, flexShrink: 0 }}
                    />
                    <div>
                      <div style={{ fontSize: '13px', fontWeight: 700, color: '#0e1a2b' }}>Pillar Article</div>
                      <div style={{ fontSize: '11px', color: '#9a9085', lineHeight: 1.4, marginTop: '0.15rem' }}>This is a main topic hub. Cluster articles link to this.</div>
                    </div>
                  </label>
                  {form.is_pillar_content && (
                    <p style={{ fontSize: '12px', color: '#4A5563', fontStyle: 'italic' as const, margin: '0.5rem 0 0', lineHeight: 1.5 }}>This is the main hub article. Cluster articles should link back to this page.</p>
                  )}
                </div>

                {/* Cornerstone toggle */}
                <div style={{ marginBottom: '1rem' }}>
                  <label style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem', cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      checked={form.is_cornerstone}
                      onChange={e => setForm(f => ({ ...f, is_cornerstone: e.target.checked }))}
                      style={{ marginTop: '2px', accentColor: '#0e1a2b', width: 16, height: 16, flexShrink: 0 }}
                    />
                    <div>
                      <div style={{ fontSize: '13px', fontWeight: 700, color: '#0e1a2b' }}>Cornerstone Content</div>
                      <div style={{ fontSize: '11px', color: '#9a9085', lineHeight: 1.4, marginTop: '0.15rem' }}>High-priority evergreen content. Influences SEO weight.</div>
                    </div>
                  </label>
                </div>

                {/* Parent Pillar selector — only shown when not a pillar itself */}
                {!form.is_pillar_content && (
                  <div style={{ marginBottom: '1rem' }}>
                    <label style={{ ...lbl, marginBottom: '0.4rem' }}>Parent Pillar</label>
                    <select
                      value={form.pillar_topic_id}
                      onChange={e => setForm(f => ({ ...f, pillar_topic_id: e.target.value }))}
                      style={inp}
                    >
                      <option value="">None — standalone article</option>
                      {pillarArticles.map((p: any) => (
                        <option key={p.id} value={p.id}>{p.title}</option>
                      ))}
                    </select>
                    {pillarArticles.length === 0 && (
                      <p style={{ fontSize: '11px', color: '#9a9085', margin: '0.35rem 0 0' }}>No pillar articles exist yet. Create one first.</p>
                    )}
                    {form.pillar_topic_id
                      ? <p style={{ fontSize: '12px', color: '#4A5563', fontStyle: 'italic' as const, margin: '0.5rem 0 0', lineHeight: 1.5 }}>This is a cluster article. Add at least one link back to the parent pillar below.</p>
                      : <p style={{ fontSize: '12px', color: '#9a9085', fontStyle: 'italic' as const, margin: '0.5rem 0 0', lineHeight: 1.5 }}>Select a parent pillar to connect this article to a topic hub.</p>
                    }
                  </div>
                )}

                {/* Cornerstone Article selector */}
                <div>
                  <label style={{ ...lbl, marginBottom: '0.4rem' }}>Related Cornerstone Article</label>
                  <select
                    value={form.cornerstone_article_id}
                    onChange={e => setForm(f => ({ ...f, cornerstone_article_id: e.target.value }))}
                    style={inp}
                  >
                    <option value="">None</option>
                    {allArticles.filter((a: any) => a.is_cornerstone).map((a: any) => (
                      <option key={a.id} value={a.id}>{a.title}</option>
                    ))}
                  </select>
                  {allArticles.filter((a: any) => a.is_cornerstone).length === 0 && (
                    <p style={{ fontSize: '11px', color: '#9a9085', margin: '0.35rem 0 0' }}>No cornerstone articles exist yet.</p>
                  )}
                </div>

                {/* Connected Articles Panel */}
                <div style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid #ede8df' }}>
                  <p style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase' as const, color: '#4A5563', marginBottom: '0.5rem' }}>Connected Articles</p>

                  {/* New article — no ID yet */}
                  {!form.slug && (
                    <p style={{ fontSize: '12px', color: '#9a9085', fontStyle: 'italic' as const }}>Save this article as a draft first to see connected cluster articles.</p>
                  )}

                  {/* Pillar view — show clusters */}
                  {form.is_pillar_content && form.slug && (
                    <div>
                      {connectedClusters.length === 0
                        ? <p style={{ fontSize: '12px', color: '#9a9085', fontStyle: 'italic' as const }}>No cluster articles linked yet. Open a cluster article and set its Parent Pillar to this article.</p>
                        : connectedClusters.map((a: any) => (
                          <div key={a.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.5rem 0.75rem', backgroundColor: '#fff', border: '1px solid #ede8df', marginBottom: '0.35rem' }}>
                            <span style={{ fontSize: '13px', color: '#0e1a2b', lineHeight: 1.3 }}>{a.title}</span>
                            <span style={{ fontSize: '10px', fontWeight: 700, textTransform: 'uppercase' as const, color: a.status === 'published' ? '#2d7a3a' : '#9a9085', backgroundColor: a.status === 'published' ? '#e8f5ea' : '#f0ede8', padding: '2px 6px' }}>{a.status === 'published' ? 'Published' : 'Draft'}</span>
                          </div>
                        ))
                      }
                      <p style={{ fontSize: '11px', color: '#9a9085', fontStyle: 'italic' as const, marginTop: '0.5rem', marginBottom: '0.5rem' }}>Discover potential cluster articles (read-only):</p>
                      <input type="text" placeholder="Search articles..." value={pillarDiscoverySearch} onChange={e => { setPillarDiscoverySearch(e.target.value); searchArticlesByTitle(e.target.value, true) }} style={{ width: '100%', padding: '0.6rem 0.75rem', border: '1px solid #ede8df', fontSize: '13px', outline: 'none', boxSizing: 'border-box' as const }} />
                      {pillarDiscoveryResults.length > 0 && (
                        <div style={{ border: '1px solid #ede8df', borderTop: 'none', backgroundColor: '#fff' }}>
                          {pillarDiscoveryResults.map((a: any) => (
                            <div key={a.id} style={{ padding: '0.6rem 0.75rem', borderBottom: '1px solid #f0ede8', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                              <span style={{ fontSize: '13px', color: '#0e1a2b' }}>{a.title}</span>
                              <a href={'/admin/articles/' + a.slug + '/edit'} style={{ fontSize: '11px', color: '#c9b28f', textDecoration: 'none', fontWeight: 700 }}>Open →</a>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Cluster view — show parent pillar */}
                  {!form.is_pillar_content && form.slug && (
                    <div>
                      {form.pillar_topic_id
                        ? <p style={{ fontSize: '12px', color: '#2d7a3a', marginBottom: '0.5rem' }}>✓ Parent pillar set via selector above.</p>
                        : <p style={{ fontSize: '12px', color: '#9a9085', fontStyle: 'italic' as const, marginBottom: '0.5rem' }}>No parent pillar set. Use the Parent Pillar selector above.</p>
                      }
                    </div>
                  )}
                </div>

              </SidebarSection>

              {/* INTERNAL LINKING — collapsed */}
              <SidebarSection openSections={openSections} toggleSection={toggleSection}                 sectionKey="internalLinking"
                title="Internal Linking"
                summary={
                  !form.is_pillar_content && !form.pillar_topic_id && !form.cornerstone_article_id
                    ? 'Set article structure first'
                    : form.is_pillar_content
                    ? 'Pillar — link to cluster articles'
                    : form.pillar_topic_id && parentPillarData
                    ? `Links to: ${parentPillarData.title}`
                    : 'Ready'
                }
              >
                {/* Section hint */}
                <p style={{ fontSize: '11px', color: '#9a9085', margin: '0 0 1rem', lineHeight: 1.5 }}>Set relationships in Article Structure first, then insert the actual links here.</p>

                {/* No structure set at all */}
                {!form.is_pillar_content && !form.pillar_topic_id && !form.cornerstone_article_id && (
                  <p style={{ fontSize: '12px', color: '#9a9085', fontStyle: 'italic' as const, margin: 0 }}>Set article structure in the Article Structure section above to enable contextual linking.</p>
                )}

                {/* CLUSTER → PARENT PILLAR */}
                {!form.is_pillar_content && form.pillar_topic_id && (
                  <div style={{ marginBottom: '1rem' }}>
                    <p style={{ fontSize: '11px', fontWeight: 700, color: '#4A5563', textTransform: 'uppercase' as const, letterSpacing: '0.08em', marginBottom: '0.25rem' }}>Parent Pillar</p>
                    <p style={{ fontSize: '11px', color: '#9a9085', margin: '0 0 0.5rem', lineHeight: 1.5 }}>Insert a link back to the parent pillar inside the article body.</p>
                    {parentPillarData ? (() => {
                      const href = `/articles/${parentPillarData.categories?.slug}/${parentPillarData.slug}`
                      const linked = isAlreadyLinked(href)
                      return (
                        <div style={{ backgroundColor: '#f7f4ee', border: '1px solid #ede8df', padding: '0.75rem', borderRadius: 2, marginBottom: '0.5rem' }}>
                          <div style={{ fontSize: '13px', fontWeight: 600, color: '#0e1a2b', marginBottom: '0.35rem', lineHeight: 1.4 }}>{parentPillarData.title}</div>
                          {linked
                            ? <span style={{ fontSize: '11px', color: '#2d7a3a', fontWeight: 600 }}>✓ Already linked in this article</span>
                            : <button
                                type="button"
                                onClick={() => insertInternalLink(href, parentPillarData.title)}
                                style={{ padding: '0.4rem 0.75rem', backgroundColor: '#0e1a2b', color: '#f7f4ee', border: 'none', fontSize: '11px', fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase' as const, cursor: 'pointer', borderRadius: 2, whiteSpace: 'nowrap' as const }}
                              >Insert parent pillar link</button>
                          }
                        </div>
                      )
                    })() : (
                      <p style={{ fontSize: '12px', color: '#9a9085', fontStyle: 'italic' as const, margin: 0 }}>Loading parent pillar...</p>
                    )}
                  </div>
                )}

                {/* PILLAR → CLUSTER ARTICLES */}
                {form.is_pillar_content && (
                  <div style={{ marginBottom: '1rem' }}>
                    <p style={{ fontSize: '11px', color: '#9a9085', margin: '0 0 0.5rem', lineHeight: 1.5 }}>Load connected cluster articles, then insert links to them inside this article.</p>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                      <p style={{ fontSize: '11px', fontWeight: 700, color: '#4A5563', textTransform: 'uppercase' as const, letterSpacing: '0.08em', margin: 0 }}>Related Cluster Articles</p>
                      <button
                        type="button"
                        onClick={async () => {
                          setClusterLoading(true)
                          const savedSlug = form.slug
                          if (!savedSlug) { setClusterLoading(false); return }
                          const slugRes = await fetch(
                            `https://bicljoujevywrkzjeaoy.supabase.co/rest/v1/articles?select=id&slug=eq.${savedSlug}&limit=1`,
                            { headers: { apikey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJpY2xqb3VqZXZ5d3JremplYW95Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzg4MDc1ODIsImV4cCI6MjA5NDM4MzU4Mn0.UIKVUyX6QClJmAYdQKg91t_kAT4itpuSk_fIemcPJ0g' } }
                          )
                          const slugData = await slugRes.json()
                          const articleId = slugData?.[0]?.id
                          if (!articleId) { setClusterArticles([]); setHasLoadedClusters(true); setClusterLoading(false); return }
                          const res = await fetch(
                            `https://bicljoujevywrkzjeaoy.supabase.co/rest/v1/articles?select=id,title,slug,categories!articles_category_id_fkey(slug)&pillar_topic_id=eq.${articleId}&status=eq.published&order=title`,
                            { headers: { apikey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJpY2xqb3VqZXZ5d3JremplYW95Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzg4MDc1ODIsImV4cCI6MjA5NDM4MzU4Mn0.UIKVUyX6QClJmAYdQKg91t_kAT4itpuSk_fIemcPJ0g' } }
                          )
                          const data = await res.json()
                          setClusterArticles(Array.isArray(data) ? data : [])
                          setHasLoadedClusters(true)
                          setClusterLoading(false)
                        }}
                        style={{ fontSize: '11px', color: '#c9b28f', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 700 }}
                      >{clusterLoading ? 'Loading...' : 'Load'}</button>
                    </div>
                    {clusterArticles.length === 0 && !clusterLoading && (
                      <p style={{ fontSize: '12px', color: '#9a9085', fontStyle: 'italic' as const, margin: 0 }}>
                        {hasLoadedClusters
                          ? 'No cluster articles are connected yet.'
                          : 'Save this article as a draft first. Then connected cluster articles can appear here.'}
                      </p>
                    )}
                    {clusterArticles.length > 0 && (
                      <>
                        {clusterArticles.map((a: any) => {
                          const href = `/articles/${a.categories?.slug}/${a.slug}`
                          const linked = isAlreadyLinked(href)
                          return (
                            <div key={a.id} style={{ backgroundColor: '#f7f4ee', border: '1px solid #ede8df', padding: '0.75rem', borderRadius: 2, marginBottom: '0.5rem' }}>
                              <div style={{ fontSize: '13px', fontWeight: 600, color: '#0e1a2b', marginBottom: '0.35rem', lineHeight: 1.4 }}>{a.title}</div>
                              {linked
                                ? <span style={{ fontSize: '11px', color: '#2d7a3a', fontWeight: 600 }}>✓ Already linked in this article</span>
                                : <button
                                    type="button"
                                    onClick={() => insertInternalLink(href, a.title)}
                                    style={{ padding: '0.4rem 0.75rem', backgroundColor: '#0e1a2b', color: '#f7f4ee', border: 'none', fontSize: '11px', fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase' as const, cursor: 'pointer', borderRadius: 2, whiteSpace: 'nowrap' as const }}
                                  >Insert cluster article link</button>
                              }
                            </div>
                          )
                        })}
                        <button
                          type="button"
                          onClick={() => insertRelatedClusterBlock(clusterArticles)}
                          style={{ width: '100%', marginTop: '0.25rem', padding: '0.5rem', backgroundColor: '#f7f4ee', border: '1px solid #0e1a2b', color: '#0e1a2b', fontSize: '11px', fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase' as const, cursor: 'pointer', borderRadius: 2 }}
                        >Insert all cluster links as list</button>
                      </>
                    )}
                  </div>
                )}

                {/* CORNERSTONE LINK */}
                {form.cornerstone_article_id && (
                  <div>
                    <p style={{ fontSize: '11px', fontWeight: 700, color: '#4A5563', textTransform: 'uppercase' as const, letterSpacing: '0.08em', marginBottom: '0.25rem' }}>Cornerstone Article</p>
                    <p style={{ fontSize: '11px', color: '#9a9085', margin: '0 0 0.5rem', lineHeight: 1.5 }}>This article is related to a cornerstone article. Add a link to connect the topic.</p>
                    {cornerstoneData ? (() => {
                      const href = `/articles/${cornerstoneData.categories?.slug}/${cornerstoneData.slug}`
                      const linked = isAlreadyLinked(href)
                      return (
                        <div style={{ backgroundColor: '#f7f4ee', border: '1px solid #ede8df', padding: '0.75rem', borderRadius: 2, marginBottom: '0.5rem' }}>
                          <div style={{ fontSize: '13px', fontWeight: 600, color: '#0e1a2b', marginBottom: '0.35rem', lineHeight: 1.4 }}>{cornerstoneData.title}</div>
                          {linked
                            ? <span style={{ fontSize: '11px', color: '#2d7a3a', fontWeight: 600 }}>✓ Already linked in this article</span>
                            : <button
                                type="button"
                                onClick={() => insertInternalLink(href, cornerstoneData.title)}
                                style={{ padding: '0.4rem 0.75rem', backgroundColor: '#0e1a2b', color: '#f7f4ee', border: 'none', fontSize: '11px', fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase' as const, cursor: 'pointer', borderRadius: 2, whiteSpace: 'nowrap' as const }}
                              >Insert cornerstone link</button>
                          }
                        </div>
                      )
                    })() : (
                      <p style={{ fontSize: '12px', color: '#9a9085', fontStyle: 'italic' as const, margin: 0 }}>Loading cornerstone article...</p>
                    )}
                  </div>
                )}
              </SidebarSection>

              {/* SETTINGS (tags, category, author) — collapsed */}
              <SidebarSection openSections={openSections} toggleSection={toggleSection} sectionKey="settings" title="Settings" summary={[categoryName, authorName, form.tags.length ? `${form.tags.length} tag${form.tags.length > 1 ? 's' : ''}` : ''].filter(Boolean).join(' · ') || undefined}>
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
                  <input ref={tagInputRef} defaultValue="" onKeyDown={e=>{if(e.key==='Enter'){e.preventDefault();const val=(e.target as HTMLInputElement).value.trim();if(val){setForm(f=>({...f,tags:[...(f.tags||[]),val]}));(e.target as HTMLInputElement).value=''}}}} placeholder="Type tag + Enter" style={inp} />
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
                <div>
                  <label style={lbl}>Author</label>
                  <select name="author_id" value={form.author_id} onChange={handleChange} style={inp}>
                    <option value="">Select...</option>
                    {authors.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
                  </select>
                </div>
              </SidebarSection>

              {/* COVER IMAGE — collapsed, with Unsplash search above URL field */}
              <SidebarSection openSections={openSections} toggleSection={toggleSection} sectionKey="coverImage" title="Cover Image" summary={form.cover_image_url ? 'Image set ✓' : 'No image'}>
                {/* Step B: Unsplash search for cover image */}
                <div style={{ marginBottom: '1rem', paddingBottom: '1rem', borderBottom: '1px solid #ede8df' }}>
                  <label style={{ ...lbl, marginBottom: '0.5rem' }}>Search Unsplash</label>
                  <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.75rem' }}>
                    <input
                      type='text'
                      placeholder='Search cover images...'
                      value={coverSearchQuery}
                      onChange={e => setCoverSearchQuery(e.target.value)}
                      onKeyDown={e => e.key === 'Enter' && searchCoverUnsplash(coverSearchQuery)}
                      style={{ ...inp, flex: 1, fontSize: '13px', padding: '0.5rem 0.6rem' }}
                    />
                    <button
                      type='button'
                      onClick={() => searchCoverUnsplash(coverSearchQuery)}
                      disabled={coverSearchLoading}
                      style={{ padding: '0.5rem 0.75rem', backgroundColor: '#0e1a2b', color: '#fff', border: 'none', fontWeight: 700, fontSize: '11px', cursor: 'pointer', whiteSpace: 'nowrap' as const }}
                    >{coverSearchLoading ? '...' : 'Search'}</button>
                  </div>
                  {coverSearchResults.length > 0 && (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.5rem', marginBottom: '0.5rem' }}>
                      {coverSearchResults.map((photo: any) => (
                        <div
                          key={photo.id}
                          onClick={() => {
                            setForm(f => ({ ...f, cover_image_url: photo.url }))
                            setCoverSearchResults([])
                            setCoverSearchQuery('')
                          }}
                          style={{ cursor: 'pointer', border: '2px solid transparent', overflow: 'hidden', borderRadius: 2 }}
                          onMouseEnter={e => (e.currentTarget.style.border = '2px solid #c9b28f')}
                          onMouseLeave={e => (e.currentTarget.style.border = '2px solid transparent')}
                        >
                          <img src={photo.thumb} alt={photo.alt_description || ''} style={{ width: '100%', height: '100px', objectFit: 'cover', display: 'block' }} />
                        </div>
                      ))}
                    </div>
                  )}
                  {coverSearchHasMore && (
                    <button
                      type='button'
                      onClick={() => searchCoverUnsplash(coverSearchQuery, coverSearchPage + 1)}
                      disabled={coverSearchLoading}
                      style={{ width: '100%', padding: '0.5rem', backgroundColor: '#fff', color: '#0e1a2b', border: '1px solid #ede8df', fontWeight: 700, fontSize: '11px', cursor: 'pointer', marginBottom: '0.5rem' }}
                    >{coverSearchLoading ? 'Loading...' : 'Load More'}</button>
                  )}
                  {coverSearchResults.length > 0 && (
                    <p style={{ fontSize: '10px', color: '#9a9085', margin: 0 }}>Click an image to set as cover · Photos by <a href='https://unsplash.com?utm_source=dudemd&utm_medium=referral' target='_blank' rel='noopener noreferrer' style={{ color: '#9a9085' }}>Unsplash</a></p>
                  )}
                </div>

                {/* Manual URL field — unchanged */}
                <div>
                  <label style={lbl}>Article Cover URL</label>
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
              </SidebarSection>

              {/* SAVE BUTTONS */}
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

      {/* Publish confirmation dialog */}
      {showPublishConfirm && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1.5rem' }}>
          <div style={{ backgroundColor: '#fff', width: '100%', maxWidth: '400px', padding: '2rem', borderRadius: 4 }}>
            <h2 style={{ fontSize: '18px', fontWeight: 700, color: '#0e1a2b', margin: '0 0 0.75rem' }}>Publish Article?</h2>
            <p style={{ fontSize: '14px', color: '#4A5563', margin: '0 0 1.5rem', lineHeight: 1.6 }}>This will make the article live on dudemd.com immediately.</p>
            {!form.cover_image_url && form.show_hero && (
              <p style={{ fontSize: '13px', color: '#c0392b', margin: '0 0 1rem', fontWeight: 600 }}>⚠ No cover image is set. Add one or disable the hero image before publishing.</p>
            )}
            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <button
                onClick={() => { setShowPublishConfirm(false); setPendingPublishStatus(null) }}
                style={{ flex: 1, padding: '0.875rem', border: '1px solid #ede8df', backgroundColor: '#fff', color: '#4A5563', fontWeight: 700, fontSize: '13px', letterSpacing: '0.08em', textTransform: 'uppercase' as const, cursor: 'pointer' }}
              >Cancel</button>
              <button
                onClick={() => {
                  if (!form.cover_image_url && form.show_hero) return
                  handleSave('published')
                }}
                disabled={saving || (!form.cover_image_url && form.show_hero)}
                style={{ flex: 2, padding: '0.875rem', border: 'none', backgroundColor: (!form.cover_image_url && form.show_hero) ? '#ccc' : '#0e1a2b', color: '#f7f4ee', fontWeight: 700, fontSize: '13px', letterSpacing: '0.08em', textTransform: 'uppercase' as const, cursor: (!form.cover_image_url && form.show_hero) ? 'not-allowed' : 'pointer' }}
              >{saving ? 'Publishing...' : 'Publish Now'}</button>
            </div>
          </div>
        </div>
      )}

      {showLinkModal && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1.5rem' }}>
          <div style={{ backgroundColor: '#fff', width: '100%', maxWidth: '500px', padding: '1.5rem', position: 'relative' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <p style={{ fontWeight: 700, fontSize: '14px', color: '#0e1a2b', margin: 0, textTransform: 'uppercase', letterSpacing: '0.08em' }}>Insert Link</p>
              <button onClick={() => setShowLinkModal(false)} style={{ background: 'none', border: 'none', fontSize: '20px', cursor: 'pointer', color: '#4A5563' }}>✕</button>
            </div>
            <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
              <button onClick={() => setLinkTab('internal')} style={{ flex: 1, padding: '0.5rem', fontWeight: 700, fontSize: '12px', border: '1px solid #ede8df', backgroundColor: linkTab === 'internal' ? '#0e1a2b' : '#fff', color: linkTab === 'internal' ? '#fff' : '#0e1a2b', cursor: 'pointer', letterSpacing: '0.06em', textTransform: 'uppercase' as const }}>Internal Article</button>
              <button onClick={() => setLinkTab('external')} style={{ flex: 1, padding: '0.5rem', fontWeight: 700, fontSize: '12px', border: '1px solid #ede8df', backgroundColor: linkTab === 'external' ? '#0e1a2b' : '#fff', color: linkTab === 'external' ? '#fff' : '#0e1a2b', cursor: 'pointer', letterSpacing: '0.06em', textTransform: 'uppercase' as const }}>External URL</button>
            </div>
            {linkTab === 'internal' ? (
              <div>
                <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.75rem' }}>
                  <input autoFocus value={linkSearch} onChange={e => setLinkSearch(e.target.value)} onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); setLinkSearching(true); fetch(`https://bicljoujevywrkzjeaoy.supabase.co/rest/v1/articles?select=title,slug,categories!articles_category_id_fkey(slug)&title=ilike.*${encodeURIComponent(linkSearch)}*&status=eq.published&limit=8`, { headers: { apikey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJpY2xqb3VqZXZ5d3JremplYW95Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzg4MDc1ODIsImV4cCI6MjA5NDM4MzU4Mn0.UIKVUyX6QClJmAYdQKg91t_kAT4itpuSk_fIemcPJ0g' } }).then(r=>r.json()).then(d=>{ setLinkResults(Array.isArray(d)?d:[]); setLinkSearching(false); }).catch(()=>setLinkSearching(false)); } }} placeholder='Search article title...' style={{ flex: 1, padding: '0.6rem', border: '1px solid #ede8df', fontSize: '13px', outline: 'none' }} />
                  <button onClick={() => { setLinkSearching(true); fetch(`https://bicljoujevywrkzjeaoy.supabase.co/rest/v1/articles?select=title,slug,categories!articles_category_id_fkey(slug)&title=ilike.*${encodeURIComponent(linkSearch)}*&status=eq.published&limit=8`, { headers: { apikey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJpY2xqb3VqZXZ5d3JremplYW95Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzg4MDc1ODIsImV4cCI6MjA5NDM4MzU4Mn0.UIKVUyX6QClJmAYdQKg91t_kAT4itpuSk_fIemcPJ0g' } }).then(r=>r.json()).then(d=>{ setLinkResults(Array.isArray(d)?d:[]); setLinkSearching(false); }).catch(()=>setLinkSearching(false)); }} style={{ padding: '0.6rem 1rem', backgroundColor: '#0e1a2b', color: '#fff', border: 'none', fontWeight: 700, fontSize: '12px', cursor: 'pointer' }}>{linkSearching ? '...' : 'Search'}</button>
                </div>
                {linkResults.length > 0 && (
                  <div style={{ border: '1px solid #ede8df', maxHeight: '200px', overflowY: 'auto' }}>
                    {linkResults.map((a, i) => (
                      <button key={i} onClick={() => { const href = `/articles/${a.categories?.slug}/${a.slug}`; editor?.chain().focus().setLink({ href, target: '_self' }).run(); setShowLinkModal(false); }} style={{ display: 'block', width: '100%', padding: '0.6rem 0.75rem', textAlign: 'left', background: 'none', border: 'none', borderBottom: '1px solid #ede8df', fontSize: '13px', color: '#0e1a2b', cursor: 'pointer' }}>
                        {a.title}
                        <span style={{ display: 'block', fontSize: '11px', color: '#9a9085' }}>/articles/{a.categories?.slug}/{a.slug}</span>
                      </button>
                    ))}
                  </div>
                )}
                {linkResults.length === 0 && linkSearch && !linkSearching && <p style={{ fontSize: '12px', color: '#9a9085', margin: '0.5rem 0' }}>No results. Try a different search term.</p>}
              </div>
            ) : (
              <div>
                <input autoFocus value={linkUrl} onChange={e => setLinkUrl(e.target.value)} placeholder='https://example.com' style={{ width: '100%', padding: '0.6rem', border: '1px solid #ede8df', fontSize: '13px', outline: 'none', boxSizing: 'border-box' as const, marginBottom: '0.75rem' }} />
                <button onClick={() => { if (linkUrl) { editor?.chain().focus().setLink({ href: linkUrl, target: '_blank' }).run(); setShowLinkModal(false); } }} style={{ width: '100%', padding: '0.75rem', backgroundColor: '#0e1a2b', color: '#fff', border: 'none', fontWeight: 700, fontSize: '13px', cursor: 'pointer', letterSpacing: '0.08em', textTransform: 'uppercase' as const }}>Insert Link</button>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  )
}

export default function EditV2({ params }: { params: Promise<{ slug: string }> }) {
  const [slug, setSlug] = useState('')
  useEffect(() => { params.then(p => setSlug(p.slug)) }, [params])
  if (!slug) return null
  return <Suspense><NewArticleInner slug={slug} /></Suspense>
}
