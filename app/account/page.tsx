'use client'
import { useEffect, useRef, useState } from 'react'

const SUPABASE_URL = 'https://bicljoujevywrkzjeaoy.supabase.co'
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJpY2xqb3VqZXZ5d3JremplYW95Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzg4MDc1ODIsImV4cCI6MjA5NDM4MzU4Mn0.UIKVUyX6QClJmAYdQKg91t_kAT4itpuSk_fIemcPJ0g'

const PROHIBITED_USERNAMES = new Set(['admin','administrator','root','system','owner','team','staff','mod','moderator','support','help','helpdesk','contact','billing','security','official','verified','info','webmaster','postmaster','hostmaster','abuse','spam','noreply','no-reply','api','app','apps','dashboard','settings','account','accounts','profile','profiles','user','users','login','logout','signin','signout','signup','register','auth','authentication','password','reset','reset-password','forgot-password','welcome','home','index','search','explore','discover','about','contact','privacy','terms','legal','cookies','sitemap','robots','status','docs','documentation','faq','help-center','support-center','admin-panel','cms','editor','writers','author','authors','article','articles','category','categories','tag','tags','topic','topics','feed','foryou','saved','bookmarks','library','community','communities','circle','circles','group','groups','forum','forums','discussion','discussions','chat','messages','notifications','inbox','qa','qna','question','questions','answer','answers','ask','members','member','followers','following','leaderboard','badges','reputation','events','event','assistant','ai','bot','coach','experts','expert','editorial','newsroom','press','media','upload','uploads','asset','assets','image','images','static','public','private','internal','test','testing','dev','stage','staging','demo','preview','null','undefined','default','guest','anonymous','me','my','self','www','web','mail','email','ftp','ssh','cdn','dudemd','dude-md','dude_md','officialdudemd','dudemdofficial','dudemdteam','teamdudemd','dudemdstaff','dudemdadmin','askdudemd','dudemdai','dudemdassistant','dudemdcommunity','dudemdhelp','dudemdsupport','dudedoc','drdudemd','doctor','doctors','founder','founders','brand','partner','partners','partnerships','advertise','advertising','sponsor','sponsors','jobs','careers','newsletter','newsletters','subscribe','subscriptions','membercare','customercare','trust','safety','compliance','moderation','report','reports'])

function getTokenAndUser() {
  try {
    const jar: Record<string, string> = {}
    document.cookie.split(';').forEach(c => {
      const eq = c.indexOf('=')
      jar[c.substring(0, eq).trim()] = c.substring(eq + 1).trim()
    })
    let raw = ''
    if (jar['sb-bicljoujevywrkzjeaoy-auth-token']) {
      raw = jar['sb-bicljoujevywrkzjeaoy-auth-token'].replace('base64-', '')
    } else {
      const p0 = jar['sb-bicljoujevywrkzjeaoy-auth-token.0'] || ''
      const p1 = jar['sb-bicljoujevywrkzjeaoy-auth-token.1'] || ''
      raw = p0.replace('base64-', '') + decodeURIComponent(p1)
    }
    const parsed = JSON.parse(atob(raw))
    return { token: parsed.access_token, uid: parsed.user?.id }
  } catch {}
  return null
}

function validateUsername(val: string): string | null {
  if (!val) return null
  if (val.length < 3) return 'At least 3 characters required'
  if (val.length > 20) return 'Maximum 20 characters'
  if (!/^[a-z0-9_]+$/.test(val)) return 'Lowercase letters, numbers, and underscores only'
  if (PROHIBITED_USERNAMES.has(val)) return 'That username is not available'
  return null
}

type Tab = 'overview' | 'saved' | 'foryou' | 'new' | 'community' | 'settings'

export default function AccountPage() {
  const [profile, setProfile] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [auth, setAuth] = useState<any>(null)
  const [activeTab, setActiveTab] = useState<Tab>('overview')
  const [fullName, setFullName] = useState('')
  const [avatarUrl, setAvatarUrl] = useState('')
  const [username, setUsername] = useState('')
  const [usernameError, setUsernameError] = useState('')
  const [usernameChecking, setUsernameChecking] = useState(false)
  const usernameDebounceRef = useRef<any>(null)
  const [uploading, setUploading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [savedProfile, setSavedProfile] = useState(false)
  const [deleteInput, setDeleteInput] = useState('')
  const [showDelete, setShowDelete] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [savedArticles, setSavedArticles] = useState<any[]>([])
  const [savedLoading, setSavedLoading] = useState(false)
  const [newArticles, setNewArticles] = useState<any[]>([])
  const [newLoading, setNewLoading] = useState(false)
  const [forYouArticles, setForYouArticles] = useState<any[]>([])
  const [forYouLoading, setForYouLoading] = useState(false)
  const [recentArticles, setRecentArticles] = useState<any[]>([])
  const [recentLoading, setRecentLoading] = useState(false)

  useEffect(() => {
    const a = getTokenAndUser()
    if (!a?.uid) { window.location.href = '/signin'; return }
    setAuth(a)
    fetch(`${SUPABASE_URL}/rest/v1/profiles?select=*&id=eq.${a.uid}&limit=1`, {
      headers: { apikey: SUPABASE_ANON_KEY, Authorization: `Bearer ${a.token}` }
    }).then(r => r.json()).then(data => {
      if (data?.[0]) {
        setProfile(data[0])
        setFullName(data[0].full_name || '')
        setAvatarUrl(data[0].avatar_url || '')
        setUsername(data[0].username || '')
      }
      setLoading(false)
    }).catch(() => setLoading(false))
  }, [])

  useEffect(() => {
    if (!auth || activeTab !== 'overview') return
    setRecentLoading(true)
    fetch(`${SUPABASE_URL}/rest/v1/user_events?select=article_slug,created_at&user_id=eq.${auth.uid}&event_type=eq.view&order=created_at.desc&limit=40`, {
      headers: { apikey: SUPABASE_ANON_KEY, Authorization: `Bearer ${auth.token}` }
    }).then(r => r.json()).then(async events => {
      if (!Array.isArray(events) || events.length === 0) { setRecentLoading(false); return }
      const seen = new Set<string>()
      const slugs: string[] = []
      for (const e of events) {
        if (e.article_slug && !seen.has(e.article_slug)) {
          seen.add(e.article_slug)
          slugs.push(e.article_slug)
          if (slugs.length >= 6) break
        }
      }
      if (slugs.length === 0) { setRecentLoading(false); return }
      const filter = slugs.map(s => `slug.eq.${s}`).join(',')
      const res = await fetch(`${SUPABASE_URL}/rest/v1/articles?select=id,title,slug,cover_image_url,published_at,categories!articles_category_id_fkey(name,slug)&or=(${filter})&status=eq.published`, {
        headers: { apikey: SUPABASE_ANON_KEY, Authorization: `Bearer ${auth.token}` }
      })
      const articles = await res.json()
      if (!Array.isArray(articles)) { setRecentLoading(false); return }
      const sorted = slugs.map(s => articles.find((a: any) => a.slug === s)).filter(Boolean)
      setRecentArticles(sorted)
      setRecentLoading(false)
    }).catch(() => setRecentLoading(false))
  }, [auth, activeTab])

  useEffect(() => {
    if (!auth) return
    if (activeTab !== 'saved' && savedArticles.length > 0) return
    setSavedLoading(true)
    fetch(`${SUPABASE_URL}/rest/v1/saved_articles?select=article_id,saved_at,articles(id,title,slug,excerpt,cover_image_url,published_at,categories!articles_category_id_fkey(name,slug))&user_id=eq.${auth.uid}&order=saved_at.desc`, {
      headers: { apikey: SUPABASE_ANON_KEY, Authorization: `Bearer ${auth.token}` }
    }).then(r => r.json()).then(data => {
      setSavedArticles(Array.isArray(data) ? data : [])
      setSavedLoading(false)
    }).catch(() => setSavedLoading(false))
  }, [auth, activeTab])

  useEffect(() => {
    if (!auth || activeTab !== 'new') return
    setNewLoading(true)
    fetch(`${SUPABASE_URL}/rest/v1/articles?select=id,title,slug,excerpt,cover_image_url,published_at,categories!articles_category_id_fkey(name,slug)&status=eq.published&order=published_at.desc&limit=20`, {
      headers: { apikey: SUPABASE_ANON_KEY, Authorization: `Bearer ${auth.token}` }
    }).then(r => r.json()).then(data => {
      setNewArticles(Array.isArray(data) ? data : [])
      setNewLoading(false)
    }).catch(() => setNewLoading(false))
  }, [auth, activeTab])

  useEffect(() => {
    if (!auth || activeTab !== 'foryou') return
    setForYouLoading(true)
    fetch(`${SUPABASE_URL}/rest/v1/user_scores?select=category_scores&user_id=eq.${auth.uid}&limit=1`, {
      headers: { apikey: SUPABASE_ANON_KEY, Authorization: `Bearer ${auth.token}` }
    }).then(r => r.json()).then(async rows => {
      let topSlugs: string[] = []
      if (Array.isArray(rows) && rows[0]?.category_scores) {
        topSlugs = Object.entries(rows[0].category_scores as Record<string, number>)
          .sort((a, b) => b[1] - a[1])
          .slice(0, 5)
          .map(([slug]) => slug)
      }
      const res = await fetch(`${SUPABASE_URL}/rest/v1/articles?select=id,title,slug,excerpt,cover_image_url,published_at,categories!articles_category_id_fkey(name,slug)&status=eq.published&order=published_at.desc&limit=40`, {
        headers: { apikey: SUPABASE_ANON_KEY, Authorization: `Bearer ${auth.token}` }
      })
      const articles = await res.json()
      if (!Array.isArray(articles)) { setForYouArticles([]); setForYouLoading(false); return }
      if (topSlugs.length > 0) {
        const matched = articles.filter((a: any) => topSlugs.includes(a.categories?.slug))
        const rest = articles.filter((a: any) => !topSlugs.includes(a.categories?.slug))
        setForYouArticles([...matched, ...rest].slice(0, 20))
      } else {
        setForYouArticles(articles.slice(0, 20))
      }
      setForYouLoading(false)
    }).catch(() => setForYouLoading(false))
  }, [auth, activeTab])

  async function handleAvatarUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file || !auth) return
    setUploading(true)
    const ext = file.name.split('.').pop()
    const path = `avatars/${auth.uid}.${ext}`
    const res = await fetch(`${SUPABASE_URL}/storage/v1/object/media/${path}`, {
      method: 'POST',
      headers: { apikey: SUPABASE_ANON_KEY, Authorization: `Bearer ${auth.token}` },
      body: file
    })
    if (res.ok) {
      const url = `${SUPABASE_URL}/storage/v1/object/public/media/${path}`
      setAvatarUrl(url)
    }
    setUploading(false)
  }

  function handleUsernameChange(val: string) {
    const lower = val.toLowerCase().replace(/[^a-z0-9_]/g, '')
    setUsername(lower)
    setUsernameError('')
    const localError = validateUsername(lower)
    if (localError) { setUsernameError(localError); return }
    if (lower === profile?.username) return
    if (usernameDebounceRef.current) clearTimeout(usernameDebounceRef.current)
    setUsernameChecking(true)
    usernameDebounceRef.current = setTimeout(async () => {
      const res = await fetch(`${SUPABASE_URL}/rest/v1/profiles?select=id&username=eq.${lower}&limit=1`, {
        headers: { apikey: SUPABASE_ANON_KEY, Authorization: `Bearer ${auth.token}` }
      })
      const data = await res.json()
      setUsernameChecking(false)
      if (Array.isArray(data) && data.length > 0) {
        setUsernameError('Username already taken')
      }
    }, 500)
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    if (usernameError || usernameChecking) return
    const localError = validateUsername(username)
    if (username && localError) { setUsernameError(localError); return }
    setSaving(true)
    await fetch(`${SUPABASE_URL}/rest/v1/profiles?id=eq.${auth.uid}`, {
      method: 'PATCH',
      headers: { apikey: SUPABASE_ANON_KEY, Authorization: `Bearer ${auth.token}`, 'Content-Type': 'application/json', Prefer: 'return=minimal' },
      body: JSON.stringify({ full_name: fullName, avatar_url: avatarUrl, username: username || null })
    })
    setProfile({ ...profile, full_name: fullName, avatar_url: avatarUrl, username: username || null })
    setSaving(false)
    setSavedProfile(true)
    setTimeout(() => setSavedProfile(false), 3000)
  }

  async function handleUnsubscribe() {
    await fetch(`${SUPABASE_URL}/rest/v1/profiles?id=eq.${auth.uid}`, {
      method: 'PATCH',
      headers: { apikey: SUPABASE_ANON_KEY, Authorization: `Bearer ${auth.token}`, 'Content-Type': 'application/json', Prefer: 'return=minimal' },
      body: JSON.stringify({ newsletter_subscribed: false })
    })
    setProfile({ ...profile, newsletter_subscribed: false })
  }

  async function handleResubscribe() {
    await fetch(`${SUPABASE_URL}/rest/v1/profiles?id=eq.${auth.uid}`, {
      method: 'PATCH',
      headers: { apikey: SUPABASE_ANON_KEY, Authorization: `Bearer ${auth.token}`, 'Content-Type': 'application/json', Prefer: 'return=minimal' },
      body: JSON.stringify({ newsletter_subscribed: true })
    })
    setProfile({ ...profile, newsletter_subscribed: true })
  }

  async function handleDeleteAccount() {
    if (deleteInput !== 'DELETE') return
    setDeleting(true)
    await fetch(`${SUPABASE_URL}/rest/v1/profiles?id=eq.${auth.uid}`, {
      method: 'DELETE',
      headers: { apikey: SUPABASE_ANON_KEY, Authorization: `Bearer ${auth.token}` }
    })
    document.cookie.split(';').forEach(c => {
      const name = c.split('=')[0].trim()
      document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/`
      document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/; domain=.dudemd.com`
    })
    window.location.href = '/'
  }

  function handleSignOut() {
    localStorage.removeItem('dudemd-auth')
    document.cookie.split(';').forEach(c => {
      const name = c.split('=')[0].trim()
      document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/`
      document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/; domain=.dudemd.com`
    })
    window.location.href = '/'
  }

  if (loading) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'var(--color-cream)' }}>
      <div style={{ width: 32, height: 32, border: '3px solid var(--color-gold)', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
      <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
    </div>
  )

  const firstName = fullName?.split(' ')[0] || 'Member'
  const tabs: { id: Tab, label: string }[] = [
    { id: 'overview', label: 'Overview' },
    { id: 'saved', label: 'Saved' },
    { id: 'foryou', label: 'For You' },
    { id: 'new', label: 'New Articles' },
    { id: 'community', label: 'Community' },
    { id: 'settings', label: 'Settings' },
  ]

  function ArticleCard({ article }: { article: any }) {
    const cat = article.categories
    const href = cat?.slug && article.slug ? `/articles/${cat.slug}/${article.slug}` : '#'
    return (
      <a href={href} style={{ display: 'flex', gap: '1rem', textDecoration: 'none', color: 'inherit', padding: '1.25rem 0', borderBottom: '1px solid var(--color-border)' }}>
        {article.cover_image_url && (
          <img src={article.cover_image_url} alt={article.title} style={{ width: 80, height: 60, objectFit: 'cover', flexShrink: 0, borderRadius: 2 }} />
        )}
        <div style={{ flex: 1, minWidth: 0 }}>
          {cat?.name && <p style={{ fontSize: '10px', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--color-gold)', margin: '0 0 0.3rem' }}>{cat.name}</p>}
          <p style={{ fontSize: '14px', fontWeight: 700, color: 'var(--color-navy)', margin: '0 0 0.3rem', lineHeight: 1.4, overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>{article.title}</p>
          {article.published_at && <p style={{ fontSize: '11px', color: '#9a9085', margin: 0 }}>{new Date(article.published_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</p>}
        </div>
      </a>
    )
  }

  function RecentlyRead() {
    if (recentLoading) return <div style={{ fontSize: '13px', color: '#9a9085', padding: '1rem 0' }}>Loading...</div>
    if (!recentArticles.length) return null
    return (
      <div style={{ backgroundColor: '#fff', border: '1px solid var(--color-border)', padding: '1.5rem', marginBottom: '1.5rem' }}>
        <p style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#9a9085', marginBottom: '0.25rem' }}>Recently Read</p>
        {recentArticles.map((a: any, i: number) => (
          <a key={i} href={a.categories?.slug && a.slug ? `/articles/${a.categories.slug}/${a.slug}` : '#'} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.6rem 0', borderBottom: i < recentArticles.length - 1 ? '1px solid var(--color-border)' : 'none', textDecoration: 'none', color: 'inherit' }}>
            {a.cover_image_url && <img src={a.cover_image_url} alt={a.title} style={{ width: 44, height: 34, objectFit: 'cover', flexShrink: 0, borderRadius: 2 }} />}
            <div style={{ flex: 1, minWidth: 0 }}>
              {a.categories?.name && <p style={{ fontSize: '9px', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--color-gold)', margin: '0 0 0.2rem' }}>{a.categories.name}</p>}
              <p style={{ fontSize: '13px', fontWeight: 600, color: 'var(--color-navy)', margin: 0, overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>{a.title}</p>
            </div>
          </a>
        ))}
      </div>
    )
  }

  function OverviewTab() {
    return (
      <div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', marginBottom: '1.5rem' }}>
          {[
            { label: 'Saved', value: savedArticles.length || '—', action: () => setActiveTab('saved') },
            { label: 'Member Since', value: profile?.created_at ? new Date(profile.created_at).getFullYear() : '—' },
            { label: 'Newsletter', value: profile?.newsletter_subscribed !== false ? 'Active' : 'Off' },
          ].map((stat, i) => (
            <div key={i} onClick={stat.action} style={{ backgroundColor: '#fff', border: '1px solid var(--color-border)', padding: '1.25rem', textAlign: 'center', cursor: stat.action ? 'pointer' : 'default' }}>
              <p style={{ fontSize: '20px', fontWeight: 700, color: 'var(--color-navy)', margin: '0 0 0.25rem', fontFamily: 'Georgia, serif' }}>{stat.value}</p>
              <p style={{ fontSize: '10px', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#9a9085', margin: 0 }}>{stat.label}</p>
            </div>
          ))}
        </div>
        <RecentlyRead />
        <div style={{ backgroundColor: '#fff', border: '1px solid var(--color-border)', padding: '1.5rem' }}>
          <p style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#9a9085', marginBottom: '1rem' }}>Quick Links</p>
          {[
            { label: 'My Saved Articles', tab: 'saved' as Tab, icon: '🔖' },
            { label: 'For You Feed', tab: 'foryou' as Tab, icon: '✨' },
            { label: 'New on DudeMD', tab: 'new' as Tab, icon: '📰' },
            { label: 'Community (Coming Soon)', tab: 'community' as Tab, icon: '👥' },
          ].map((link, i) => (
            <button key={i} onClick={() => setActiveTab(link.tab)} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', width: '100%', padding: '0.75rem 0', borderBottom: i < 3 ? '1px solid var(--color-border)' : 'none', background: 'none', border: 'none', borderBottom: i < 3 ? '1px solid var(--color-border)' : 'none', cursor: 'pointer', textAlign: 'left' }}>
              <span style={{ fontSize: 18 }}>{link.icon}</span>
              <span style={{ fontSize: '14px', fontWeight: 600, color: 'var(--color-navy)' }}>{link.label}</span>
              <span style={{ marginLeft: 'auto', color: '#9a9085', fontSize: 16 }}>›</span>
            </button>
          ))}
        </div>
      </div>
    )
  }

  function SavedTab() {
    if (savedLoading) return <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--color-slate)' }}>Loading...</div>
    if (!savedArticles.length) return (
      <div style={{ textAlign: 'center', padding: '4rem 2rem' }}>
        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="var(--color-gold)" strokeWidth="1.5" style={{ marginBottom: '1rem' }}><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/></svg>
        <p style={{ fontSize: '16px', fontWeight: 700, color: 'var(--color-navy)', marginBottom: '0.5rem' }}>No saved articles yet</p>
        <p style={{ fontSize: '14px', color: 'var(--color-slate)' }}>Bookmark articles while reading to find them here.</p>
        <a href="/" style={{ display: 'inline-block', marginTop: '1.5rem', padding: '0.75rem 1.5rem', backgroundColor: 'var(--color-navy)', color: 'var(--color-cream)', fontWeight: 700, fontSize: '12px', letterSpacing: '0.08em', textTransform: 'uppercase', textDecoration: 'none' }}>Browse Articles</a>
      </div>
    )
    return (
      <div>
        <p style={{ fontSize: '12px', color: '#9a9085', marginBottom: '0.5rem' }}>{savedArticles.length} saved article{savedArticles.length !== 1 ? 's' : ''}</p>
        {savedArticles.map((item: any, i: number) => <ArticleCard key={i} article={item.articles} />)}
      </div>
    )
  }

  function ForYouTab() {
    if (forYouLoading) return <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--color-slate)' }}>Loading your feed...</div>
    if (!forYouArticles.length) return <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--color-slate)' }}>No articles found.</div>
    return (
      <div>
        <p style={{ fontSize: '12px', color: '#9a9085', marginBottom: '0.5rem' }}>Articles picked based on your reading habits</p>
        {forYouArticles.map((a: any, i: number) => <ArticleCard key={i} article={a} />)}
      </div>
    )
  }

  function NewArticlesTab() {
    if (newLoading) return <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--color-slate)' }}>Loading...</div>
    if (!newArticles.length) return <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--color-slate)' }}>No articles found.</div>
    return (
      <div>
        <p style={{ fontSize: '12px', color: '#9a9085', marginBottom: '0.5rem' }}>Latest published articles</p>
        {newArticles.map((a: any, i: number) => <ArticleCard key={i} article={a} />)}
      </div>
    )
  }

  function CommunityTab() {
    return (
      <div style={{ textAlign: 'center', padding: '4rem 2rem' }}>
        <div style={{ width: 60, height: 60, borderRadius: '50%', backgroundColor: 'var(--color-navy)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem' }}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--color-gold)" strokeWidth="1.5"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
        </div>
        <p style={{ fontSize: '18px', fontWeight: 700, color: 'var(--color-navy)', marginBottom: '0.5rem', fontFamily: 'Georgia, serif' }}>Community Coming Soon</p>
        <p style={{ fontSize: '14px', color: 'var(--color-slate)', lineHeight: 1.7, maxWidth: 320, margin: '0 auto 1.5rem' }}>Circles, Q&A, events, badges and more. The DudeMD community is being built right now.</p>
        <span style={{ display: 'inline-block', padding: '0.4rem 1rem', backgroundColor: 'var(--color-gold)', color: 'var(--color-navy)', fontSize: '10px', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase' }}>Coming Soon</span>
      </div>
    )
  }

  function SettingsTab() {
    const inp: any = { width: '100%', padding: '0.85rem', border: '1px solid var(--color-border)', fontSize: '15px', outline: 'none', boxSizing: 'border-box', backgroundColor: '#fff', fontFamily: 'inherit', color: 'var(--color-navy)' }
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        <div style={{ backgroundColor: '#fff', border: '1px solid var(--color-border)', padding: '1.5rem' }}>
          <p style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#9a9085', marginBottom: '1.25rem' }}>Edit Profile</p>
          <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--color-slate)', marginBottom: '0.4rem' }}>Full Name</label>
              <input style={inp} value={fullName} onChange={e => setFullName(e.target.value)} placeholder="Your full name" />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--color-slate)', marginBottom: '0.4rem' }}>
                Username
                <span style={{ fontWeight: 400, color: '#9a9085', marginLeft: '0.5rem' }}>— your public handle for future community features</span>
              </label>
              <div style={{ position: 'relative' }}>
                <span style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)', color: '#9a9085', fontSize: '15px', pointerEvents: 'none' }}>@</span>
                <input
                  style={{ ...inp, paddingLeft: '1.75rem', border: `1px solid ${usernameError ? '#a32d2d' : 'var(--color-border)'}` }}
                  value={username}
                  onChange={e => handleUsernameChange(e.target.value)}
                  placeholder="yourhandle"
                  maxLength={20}
                />
              </div>
              {usernameChecking && <p style={{ fontSize: '12px', color: '#9a9085', margin: '0.3rem 0 0' }}>Checking availability...</p>}
              {usernameError && <p style={{ fontSize: '12px', color: '#a32d2d', margin: '0.3rem 0 0' }}>{usernameError}</p>}
              {!usernameError && !usernameChecking && username && username !== profile?.username && (
                <p style={{ fontSize: '12px', color: '#2d7a3a', margin: '0.3rem 0 0' }}>@{username} is available</p>
              )}
              <p style={{ fontSize: '11px', color: '#9a9085', margin: '0.3rem 0 0' }}>3–20 characters. Letters, numbers, underscores only.</p>
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--color-slate)', marginBottom: '0.75rem' }}>Profile Picture</label>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                {avatarUrl ? (
                  <img src={avatarUrl} alt="preview" style={{ width: 52, height: 52, borderRadius: '50%', objectFit: 'cover', border: '2px solid var(--color-gold)', flexShrink: 0 }} />
                ) : (
                  <div style={{ width: 52, height: 52, borderRadius: '50%', backgroundColor: 'var(--color-navy)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <span style={{ fontSize: 20, fontWeight: 700, color: 'var(--color-gold)' }}>{firstName.charAt(0)}</span>
                  </div>
                )}
                <label style={{ padding: '0.6rem 1.25rem', border: '1px solid var(--color-navy)', backgroundColor: '#fff', color: 'var(--color-navy)', fontSize: '12px', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', cursor: 'pointer' }}>
                  {uploading ? 'Uploading...' : 'Upload Photo'}
                  <input type="file" accept="image/*" style={{ display: 'none' }} onChange={handleAvatarUpload} disabled={uploading} />
                </label>
              </div>
            </div>
            <button type="submit" disabled={saving || !!usernameError || usernameChecking} style={{ padding: '0.875rem', backgroundColor: 'var(--color-navy)', color: 'var(--color-cream)', fontWeight: 700, fontSize: '13px', letterSpacing: '0.08em', textTransform: 'uppercase', border: 'none', cursor: 'pointer', opacity: saving || !!usernameError || usernameChecking ? 0.6 : 1 }}>
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
            {savedProfile && <p style={{ fontSize: '13px', color: '#2d7a3a', textAlign: 'center', margin: 0 }}>✓ Profile updated successfully.</p>}
          </form>
        </div>
        <div style={{ backgroundColor: '#fff', border: '1px solid var(--color-border)', padding: '1.5rem' }}>
          <p style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#9a9085', marginBottom: '1.25rem' }}>Newsletter</p>
          {profile?.newsletter_subscribed !== false ? (
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <p style={{ fontSize: '14px', fontWeight: 600, color: 'var(--color-navy)', margin: '0 0 0.25rem' }}>Subscribed ✓</p>
                <p style={{ fontSize: '12px', color: '#9a9085', margin: 0 }}>Weekly men's wellness in your inbox.</p>
              </div>
              <button onClick={handleUnsubscribe} style={{ padding: '0.5rem 1rem', border: '1px solid #a32d2d', backgroundColor: '#fff', color: '#a32d2d', fontSize: '12px', fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', cursor: 'pointer' }}>Unsubscribe</button>
            </div>
          ) : (
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <p style={{ fontSize: '14px', fontWeight: 600, color: '#9a9085', margin: '0 0 0.25rem' }}>Not subscribed</p>
                <p style={{ fontSize: '12px', color: '#9a9085', margin: 0 }}>Want weekly men's wellness?</p>
              </div>
              <button onClick={handleResubscribe} style={{ padding: '0.5rem 1rem', border: '1px solid var(--color-navy)', backgroundColor: 'var(--color-navy)', color: 'var(--color-cream)', fontSize: '12px', fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', cursor: 'pointer' }}>Subscribe</button>
            </div>
          )}
        </div>
        <button onClick={handleSignOut} style={{ width: '100%', padding: '0.875rem', backgroundColor: 'transparent', border: '1px solid var(--color-navy)', color: 'var(--color-navy)', fontWeight: 700, fontSize: '13px', letterSpacing: '0.08em', textTransform: 'uppercase', cursor: 'pointer' }}>
          Sign Out
        </button>
        {!showDelete ? (
          <button onClick={() => setShowDelete(true)} style={{ width: '100%', padding: '0.5rem', backgroundColor: 'transparent', border: 'none', color: '#9a9085', fontSize: '12px', cursor: 'pointer', textDecoration: 'underline' }}>
            Delete My Account
          </button>
        ) : (
          <div style={{ backgroundColor: '#fff', border: '1px solid #a32d2d', padding: '1.5rem' }}>
            <p style={{ fontSize: '14px', fontWeight: 700, color: '#a32d2d', marginBottom: '0.5rem' }}>⚠️ Delete Account</p>
            <p style={{ fontSize: '13px', color: 'var(--color-slate)', marginBottom: '1.25rem', lineHeight: 1.6 }}>This permanently deletes your account. This cannot be undone.</p>
            <p style={{ fontSize: '13px', fontWeight: 600, color: 'var(--color-navy)', marginBottom: '0.5rem' }}>Type DELETE to confirm:</p>
            <input style={{ ...inp, border: '1px solid #a32d2d', marginBottom: '1rem' }} value={deleteInput} onChange={e => setDeleteInput(e.target.value)} placeholder="DELETE" />
            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <button onClick={() => { setShowDelete(false); setDeleteInput('') }} style={{ flex: 1, padding: '0.75rem', border: '1px solid var(--color-border)', backgroundColor: '#fff', color: 'var(--color-navy)', fontWeight: 700, fontSize: '13px', cursor: 'pointer' }}>Cancel</button>
              <button onClick={handleDeleteAccount} disabled={deleteInput !== 'DELETE' || deleting} style={{ flex: 1, padding: '0.75rem', backgroundColor: deleteInput === 'DELETE' ? '#a32d2d' : '#f0ede8', color: deleteInput === 'DELETE' ? '#fff' : '#9a9085', border: 'none', fontWeight: 700, fontSize: '13px', cursor: deleteInput === 'DELETE' ? 'pointer' : 'not-allowed' }}>
                {deleting ? 'Deleting...' : 'Delete Forever'}
              </button>
            </div>
          </div>
        )}
      </div>
    )
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: 'var(--color-cream)' }}>
      <style>{`
        @keyframes spin { to { transform: rotate(360deg) } }
        .hub-tab { background: none; border: none; cursor: pointer; padding: 0.75rem 0; font-size: 13px; font-weight: 600; letter-spacing: 0.06em; text-transform: uppercase; color: #9a9085; border-bottom: 2px solid transparent; transition: all 0.2s; white-space: nowrap; }
        .hub-tab.active { color: var(--color-navy); border-bottom-color: var(--color-gold); }
        .hub-tab:hover { color: var(--color-navy); }
        @media (max-width: 600px) { .hub-tab { font-size: 11px; padding: 0.75rem 0; } }
      `}</style>
      <div style={{ backgroundColor: 'var(--color-navy)', padding: '2.5rem 1.5rem 0' }}>
        <div style={{ maxWidth: '680px', margin: '0 auto' }}>
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: '1.25rem', marginBottom: '1.5rem' }}>
            {avatarUrl ? (
              <img src={avatarUrl} alt={firstName} style={{ width: 72, height: 72, borderRadius: '50%', objectFit: 'cover', border: '3px solid var(--color-gold)', flexShrink: 0 }} />
            ) : (
              <div style={{ width: 72, height: 72, borderRadius: '50%', backgroundColor: 'rgba(255,255,255,0.1)', border: '3px solid var(--color-gold)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <span style={{ fontSize: 28, fontWeight: 700, color: 'var(--color-gold)' }}>{firstName.charAt(0).toUpperCase()}</span>
              </div>
            )}
            <div style={{ flex: 1, paddingBottom: '0.25rem' }}>
              <h1 style={{ fontFamily: 'Georgia, serif', fontSize: 'clamp(1.25rem, 3vw, 1.75rem)', fontWeight: 700, color: '#fff', margin: '0 0 0.2rem' }}>{fullName || firstName}</h1>
              {profile?.username && <p style={{ fontSize: '13px', color: 'var(--color-gold)', margin: '0 0 0.2rem', fontWeight: 600 }}>@{profile.username}</p>}
              <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.6)', margin: 0 }}>Member since {profile?.created_at ? new Date(profile.created_at).getFullYear() : '—'}</p>
            </div>
          </div>
          <div style={{ display: 'flex', gap: '1.5rem', overflowX: 'auto', paddingBottom: '0', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
            {tabs.map(tab => (
              <button key={tab.id} className={`hub-tab${activeTab === tab.id ? ' active' : ''}`} onClick={() => setActiveTab(tab.id)}
                style={{ color: activeTab === tab.id ? '#fff' : 'rgba(255,255,255,0.5)', borderBottomColor: activeTab === tab.id ? 'var(--color-gold)' : 'transparent' }}>
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>
      <div style={{ maxWidth: '680px', margin: '0 auto', padding: '2rem 1.5rem' }}>
        {activeTab === 'overview' && <OverviewTab />}
        {activeTab === 'saved' && <SavedTab />}
        {activeTab === 'foryou' && <ForYouTab />}
        {activeTab === 'new' && <NewArticlesTab />}
        {activeTab === 'community' && <CommunityTab />}
        {activeTab === 'settings' && <SettingsTab />}
      </div>
    </div>
  )
}