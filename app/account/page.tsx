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

const NAV_ITEMS: { id: Tab; label: string; icon: string }[] = [
  { id: 'overview', label: 'Home', icon: '⌂' },
  { id: 'foryou', label: 'For You', icon: '✦' },
  { id: 'saved', label: 'Saved', icon: '◇' },
  { id: 'new', label: 'New', icon: '◎' },
  { id: 'community', label: 'Community', icon: '◈' },
  { id: 'settings', label: 'Settings', icon: '⚙' },
]

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
  const [moreOpen, setMoreOpen] = useState(false)

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
          .sort((a, b) => b[1] - a[1]).slice(0, 5).map(([slug]) => slug)
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
      method: 'POST', headers: { apikey: SUPABASE_ANON_KEY, Authorization: `Bearer ${auth.token}` }, body: file
    })
    if (res.ok) setAvatarUrl(`${SUPABASE_URL}/storage/v1/object/public/media/${path}`)
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
      if (Array.isArray(data) && data.length > 0) setUsernameError('Username already taken')
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
    setSaving(false); setSavedProfile(true)
    setTimeout(() => setSavedProfile(false), 3000)
  }

  async function handleUnsubscribe() {
    await fetch(`${SUPABASE_URL}/rest/v1/profiles?id=eq.${auth.uid}`, {
      method: 'PATCH', headers: { apikey: SUPABASE_ANON_KEY, Authorization: `Bearer ${auth.token}`, 'Content-Type': 'application/json', Prefer: 'return=minimal' },
      body: JSON.stringify({ newsletter_subscribed: false })
    })
    setProfile({ ...profile, newsletter_subscribed: false })
  }

  async function handleResubscribe() {
    await fetch(`${SUPABASE_URL}/rest/v1/profiles?id=eq.${auth.uid}`, {
      method: 'PATCH', headers: { apikey: SUPABASE_ANON_KEY, Authorization: `Bearer ${auth.token}`, 'Content-Type': 'application/json', Prefer: 'return=minimal' },
      body: JSON.stringify({ newsletter_subscribed: true })
    })
    setProfile({ ...profile, newsletter_subscribed: true })
  }

  async function handleDeleteAccount() {
    if (deleteInput !== 'DELETE') return
    setDeleting(true)
    await fetch(`${SUPABASE_URL}/rest/v1/profiles?id=eq.${auth.uid}`, {
      method: 'DELETE', headers: { apikey: SUPABASE_ANON_KEY, Authorization: `Bearer ${auth.token}` }
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
      <div style={{ width: 28, height: 28, border: '2px solid var(--color-gold)', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  )

  const firstName = fullName?.split(' ')[0] || 'Member'
  const memberYear = profile?.created_at ? new Date(profile.created_at).getFullYear() : '—'
  const activeNav = NAV_ITEMS.find(n => n.id === activeTab)

  function ArticleCard({ article, compact }: { article: any, compact?: boolean }) {
    const cat = article.categories
    const href = cat?.slug && article.slug ? `/articles/${cat.slug}/${article.slug}` : '#'
    const date = article.published_at ? new Date(article.published_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : ''
    if (compact) return (
      <a href={href} style={{ display: 'flex', gap: '0.75rem', textDecoration: 'none', color: 'inherit', padding: '0.75rem 0', borderBottom: '1px solid var(--color-border)', alignItems: 'center' }}>
        {article.cover_image_url && <img src={article.cover_image_url} alt={article.title} style={{ width: 52, height: 40, objectFit: 'cover', flexShrink: 0, borderRadius: 3 }} />}
        <div style={{ flex: 1, minWidth: 0 }}>
          {cat?.name && <p style={{ fontSize: '9px', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--color-gold)', margin: '0 0 0.2rem' }}>{cat.name}</p>}
          <p style={{ fontSize: '13px', fontWeight: 600, color: 'var(--color-navy)', margin: 0, lineHeight: 1.35, overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' as const }}>{article.title}</p>
        </div>
      </a>
    )
    return (
      <a href={href} style={{ display: 'flex', gap: '1rem', textDecoration: 'none', color: 'inherit', padding: '1.1rem 0', borderBottom: '1px solid var(--color-border)' }}>
        {article.cover_image_url && <img src={article.cover_image_url} alt={article.title} style={{ width: 88, height: 64, objectFit: 'cover', flexShrink: 0, borderRadius: 3 }} />}
        <div style={{ flex: 1, minWidth: 0 }}>
          {cat?.name && <p style={{ fontSize: '10px', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--color-gold)', margin: '0 0 0.35rem' }}>{cat.name}</p>}
          <p style={{ fontSize: '14px', fontWeight: 700, color: 'var(--color-navy)', margin: '0 0 0.35rem', lineHeight: 1.4, overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' as const }}>{article.title}</p>
          {date && <p style={{ fontSize: '11px', color: '#9a9085', margin: 0 }}>{date}</p>}
        </div>
      </a>
    )
  }

  function SectionLabel({ children }: { children: string }) {
    return <p style={{ fontSize: '10px', fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', color: '#9a9085', margin: '0 0 0.75rem', paddingBottom: '0.5rem', borderBottom: '1px solid var(--color-border)' }}>{children}</p>
  }

  function Spinner() {
    return <div style={{ textAlign: 'center', padding: '3rem 0' }}><div style={{ width: 24, height: 24, border: '2px solid var(--color-gold)', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.7s linear infinite', display: 'inline-block' }} /></div>
  }

  function OverviewTab() {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '0.75rem' }}>
          {[
            { label: 'Saved', value: savedArticles.length || '0', action: () => setActiveTab('saved') },
            { label: 'Member Since', value: memberYear },
            { label: 'Newsletter', value: profile?.newsletter_subscribed !== false ? 'Active' : 'Off' },
          ].map((s, i) => (
            <div key={i} onClick={s.action} style={{ backgroundColor: '#f5f3ef', border: '1px solid var(--color-border)', borderRadius: 4, padding: '1rem 0.75rem', textAlign: 'center', cursor: s.action ? 'pointer' : 'default' }}>
              <p style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--color-navy)', margin: '0 0 0.2rem', fontFamily: 'Georgia, serif', lineHeight: 1 }}>{s.value}</p>
              <p style={{ fontSize: '9px', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#9a9085', margin: 0 }}>{s.label}</p>
            </div>
          ))}
        </div>
        {recentArticles.length > 0 && (
          <div>
            <SectionLabel>Recently Read</SectionLabel>
            {recentArticles.map((a: any, i: number) => <ArticleCard key={i} article={a} compact />)}
          </div>
        )}
        <div>
          <SectionLabel>Your Hub</SectionLabel>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.6rem' }}>
            {[
              { label: 'For You', sub: 'Personalized feed', tab: 'foryou' as Tab },
              { label: 'Saved Articles', sub: `${savedArticles.length} bookmarked`, tab: 'saved' as Tab },
              { label: 'New Articles', sub: 'Latest from DudeMD', tab: 'new' as Tab },
              { label: 'Community', sub: 'Coming soon', tab: 'community' as Tab },
            ].map((item, i) => (
              <button key={i} onClick={() => setActiveTab(item.tab)} style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', padding: '1rem', backgroundColor: '#f5f3ef', border: '1px solid var(--color-border)', borderRadius: 4, cursor: 'pointer', textAlign: 'left' }}>
                <p style={{ fontSize: '13px', fontWeight: 700, color: 'var(--color-navy)', margin: '0 0 0.2rem' }}>{item.label}</p>
                <p style={{ fontSize: '11px', color: '#9a9085', margin: 0 }}>{item.sub}</p>
              </button>
            ))}
          </div>
        </div>
      </div>
    )
  }

  function FeedTab({ articles, loading: l, emptyMsg, label }: { articles: any[], loading: boolean, emptyMsg: string, label: string }) {
    if (l) return <Spinner />
    if (!articles.length) return (
      <div style={{ textAlign: 'center', padding: '4rem 1rem' }}>
        <p style={{ fontSize: '15px', fontWeight: 600, color: 'var(--color-navy)', marginBottom: '0.5rem' }}>{emptyMsg}</p>
        <a href="/" style={{ fontSize: '12px', color: 'var(--color-gold)', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', textDecoration: 'none' }}>Browse Articles →</a>
      </div>
    )
    return (
      <div>
        <SectionLabel>{label}</SectionLabel>
        {articles.map((a: any, i: number) => <ArticleCard key={i} article={a} />)}
      </div>
    )
  }

  function CommunityTab() {
    return (
      <div style={{ textAlign: 'center', padding: '4rem 1.5rem' }}>
        <div style={{ width: 56, height: 56, borderRadius: '50%', backgroundColor: 'var(--color-navy)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.25rem' }}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="var(--color-gold)" strokeWidth="1.5"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
        </div>
        <p style={{ fontSize: '17px', fontWeight: 700, color: 'var(--color-navy)', marginBottom: '0.5rem', fontFamily: 'Georgia, serif' }}>Community Coming Soon</p>
        <p style={{ fontSize: '13px', color: 'var(--color-slate)', lineHeight: 1.7, maxWidth: 300, margin: '0 auto 1.5rem' }}>Circles, Q&A, events, badges and more.</p>
        <span style={{ display: 'inline-block', padding: '0.4rem 1.1rem', backgroundColor: 'var(--color-gold)', color: 'var(--color-navy)', fontSize: '10px', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', borderRadius: 2 }}>Coming Soon</span>
      </div>
    )
  }

  function SettingsTab() {
    const inp: any = { width: '100%', padding: '0.8rem 1rem', border: '1px solid var(--color-border)', borderRadius: 4, fontSize: '14px', outline: 'none', boxSizing: 'border-box', backgroundColor: '#fff', fontFamily: 'inherit', color: 'var(--color-navy)' }
    const section: any = { backgroundColor: '#fff', border: '1px solid var(--color-border)', borderRadius: 6, padding: '1.5rem', marginBottom: '1rem' }
    return (
      <div>
        <div style={section}>
          <SectionLabel>Edit Profile</SectionLabel>
          <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '1.1rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--color-slate)', marginBottom: '0.4rem' }}>Full Name</label>
              <input style={inp} value={fullName} onChange={e => setFullName(e.target.value)} placeholder="Your full name" />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--color-slate)', marginBottom: '0.4rem' }}>
                Username <span style={{ fontWeight: 400, color: '#9a9085' }}>— your community handle</span>
              </label>
              <div style={{ position: 'relative' }}>
                <span style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#9a9085', fontSize: '14px', pointerEvents: 'none' }}>@</span>
                <input style={{ ...inp, paddingLeft: '1.75rem', border: `1px solid ${usernameError ? '#a32d2d' : 'var(--color-border)'}` }} defaultValue={username} onBlur={e => handleUsernameChange(e.target.value)} placeholder="yourhandle" maxLength={20} />
              </div>
              {usernameChecking && <p style={{ fontSize: '11px', color: '#9a9085', margin: '0.3rem 0 0' }}>Checking...</p>}
              {usernameError && <p style={{ fontSize: '11px', color: '#a32d2d', margin: '0.3rem 0 0' }}>{usernameError}</p>}
              {!usernameError && !usernameChecking && username && username !== profile?.username && <p style={{ fontSize: '11px', color: '#2d7a3a', margin: '0.3rem 0 0' }}>@{username} is available</p>}
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--color-slate)', marginBottom: '0.75rem' }}>Profile Photo</label>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                {avatarUrl ? (
                  <img src={avatarUrl} alt="preview" style={{ width: 48, height: 48, borderRadius: '50%', objectFit: 'cover', border: '2px solid var(--color-gold)' }} />
                ) : (
                  <div style={{ width: 48, height: 48, borderRadius: '50%', backgroundColor: 'var(--color-navy)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <span style={{ fontSize: 18, fontWeight: 700, color: 'var(--color-gold)' }}>{firstName.charAt(0)}</span>
                  </div>
                )}
                <label style={{ padding: '0.55rem 1rem', border: '1px solid var(--color-navy)', borderRadius: 4, backgroundColor: '#fff', color: 'var(--color-navy)', fontSize: '12px', fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', cursor: 'pointer' }}>
                  {uploading ? 'Uploading...' : 'Change Photo'}
                  <input type="file" accept="image/*" style={{ display: 'none' }} onChange={handleAvatarUpload} disabled={uploading} />
                </label>
              </div>
            </div>
            <button type="submit" disabled={saving || !!usernameError || usernameChecking} style={{ padding: '0.85rem', backgroundColor: 'var(--color-navy)', color: 'var(--color-cream)', fontWeight: 700, fontSize: '13px', letterSpacing: '0.08em', textTransform: 'uppercase', border: 'none', borderRadius: 4, cursor: 'pointer', opacity: saving || !!usernameError || usernameChecking ? 0.6 : 1 }}>
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
            {savedProfile && <p style={{ fontSize: '13px', color: '#2d7a3a', textAlign: 'center', margin: 0 }}>✓ Saved.</p>}
          </form>
        </div>
        <div style={section}>
          <SectionLabel>Newsletter</SectionLabel>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <p style={{ fontSize: '14px', fontWeight: 600, color: profile?.newsletter_subscribed !== false ? 'var(--color-navy)' : '#9a9085', margin: '0 0 0.2rem' }}>
                {profile?.newsletter_subscribed !== false ? 'Subscribed ✓' : 'Not subscribed'}
              </p>
              <p style={{ fontSize: '12px', color: '#9a9085', margin: 0 }}>Weekly men's wellness.</p>
            </div>
            {profile?.newsletter_subscribed !== false ? (
              <button onClick={handleUnsubscribe} style={{ padding: '0.5rem 1rem', border: '1px solid #a32d2d', borderRadius: 4, backgroundColor: '#fff', color: '#a32d2d', fontSize: '12px', fontWeight: 700, cursor: 'pointer' }}>Unsubscribe</button>
            ) : (
              <button onClick={handleResubscribe} style={{ padding: '0.5rem 1rem', border: '1px solid var(--color-navy)', borderRadius: 4, backgroundColor: 'var(--color-navy)', color: 'var(--color-cream)', fontSize: '12px', fontWeight: 700, cursor: 'pointer' }}>Subscribe</button>
            )}
          </div>
        </div>
        <button onClick={handleSignOut} style={{ width: '100%', padding: '0.85rem', backgroundColor: 'transparent', border: '1px solid var(--color-navy)', borderRadius: 4, color: 'var(--color-navy)', fontWeight: 700, fontSize: '13px', letterSpacing: '0.08em', textTransform: 'uppercase', cursor: 'pointer', marginBottom: '0.75rem' }}>Sign Out</button>
        {!showDelete ? (
          <button onClick={() => setShowDelete(true)} style={{ width: '100%', padding: '0.5rem', backgroundColor: 'transparent', border: 'none', color: '#9a9085', fontSize: '12px', cursor: 'pointer', textDecoration: 'underline' }}>Delete My Account</button>
        ) : (
          <div style={{ backgroundColor: '#fff', border: '1px solid #a32d2d', borderRadius: 6, padding: '1.5rem' }}>
            <p style={{ fontSize: '14px', fontWeight: 700, color: '#a32d2d', marginBottom: '0.5rem' }}>⚠️ Delete Account</p>
            <p style={{ fontSize: '13px', color: 'var(--color-slate)', marginBottom: '1.25rem', lineHeight: 1.6 }}>This permanently deletes your account and cannot be undone.</p>
            <p style={{ fontSize: '13px', fontWeight: 600, color: 'var(--color-navy)', marginBottom: '0.5rem' }}>Type DELETE to confirm:</p>
            <input style={{ ...inp, border: '1px solid #a32d2d', marginBottom: '1rem' }} value={deleteInput} onChange={e => setDeleteInput(e.target.value)} placeholder="DELETE" />
            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <button onClick={() => { setShowDelete(false); setDeleteInput('') }} style={{ flex: 1, padding: '0.75rem', border: '1px solid var(--color-border)', borderRadius: 4, backgroundColor: '#fff', color: 'var(--color-navy)', fontWeight: 700, fontSize: '13px', cursor: 'pointer' }}>Cancel</button>
              <button onClick={handleDeleteAccount} disabled={deleteInput !== 'DELETE' || deleting} style={{ flex: 1, padding: '0.75rem', borderRadius: 4, backgroundColor: deleteInput === 'DELETE' ? '#a32d2d' : '#f0ede8', color: deleteInput === 'DELETE' ? '#fff' : '#9a9085', border: 'none', fontWeight: 700, fontSize: '13px', cursor: deleteInput === 'DELETE' ? 'pointer' : 'not-allowed' }}>
                {deleting ? 'Deleting...' : 'Delete Forever'}
              </button>
            </div>
          </div>
        )}
      </div>
    )
  }

  function renderContent() {
    switch (activeTab) {
      case 'overview': return <OverviewTab />
      case 'saved': return <FeedTab articles={savedArticles.map((s:any)=>s.articles).filter(Boolean)} loading={savedLoading} emptyMsg="No saved articles yet" label={`${savedArticles.length} Saved Article${savedArticles.length !== 1 ? 's' : ''}`} />
      case 'foryou': return <FeedTab articles={forYouArticles} loading={forYouLoading} emptyMsg="Read some articles to personalize your feed" label="Picked For You" />
      case 'new': return <FeedTab articles={newArticles} loading={newLoading} emptyMsg="No articles yet" label="Latest from DudeMD" />
      case 'community': return <CommunityTab />
      case 'settings': return <SettingsTab />
    }
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f5f3ef' }}>
      <style>{`
        @keyframes spin { to { transform: rotate(360deg) } }
        @keyframes slideUp { from { transform: translateY(100%); opacity: 0 } to { transform: translateY(0); opacity: 1 } }
        .hub-sidebar-btn { display: flex; align-items: center; gap: 0.75rem; width: 100%; padding: 0.7rem 1rem; background: none; border: none; border-radius: 6px; cursor: pointer; font-size: 13px; font-weight: 600; color: var(--color-slate); text-align: left; transition: background 0.15s, color 0.15s; letter-spacing: 0.02em; }
        .hub-sidebar-btn:hover { background: rgba(14,26,43,0.05); color: var(--color-navy); }
        .hub-sidebar-btn.active { background: var(--color-navy); color: #fff; }
        .hub-nav-icon { font-size: 14px; width: 20px; text-align: center; opacity: 0.6; }
        .hub-sidebar-btn.active .hub-nav-icon { opacity: 1; color: var(--color-gold); }
        .hub-mobile-nav { display: none; position: fixed; bottom: 0; left: 0; right: 0; background: var(--color-navy); border-top: 1px solid rgba(255,255,255,0.08); z-index: 50; padding: 0 0 env(safe-area-inset-bottom); }
        .hub-mobile-nav-inner { display: flex; }
        .hub-mobile-btn { flex: 1; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 3px; padding: 0.6rem 0.25rem; background: none; border: none; cursor: pointer; color: rgba(255,255,255,0.45); font-size: 9px; font-weight: 700; letter-spacing: 0.08em; text-transform: uppercase; transition: color 0.15s; min-width: 0; }
        .hub-mobile-btn.active { color: var(--color-gold); }
        .hub-mobile-icon { font-size: 17px; line-height: 1; }
        .hub-more-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.4); z-index: 60; }
        .hub-more-drawer { position: fixed; bottom: 0; left: 0; right: 0; z-index: 70; background: #fff; border-radius: 16px 16px 0 0; padding: 1.25rem 1.5rem 2.5rem; animation: slideUp 0.22s ease; }
        @media (max-width: 768px) {
          .hub-desktop-layout { display: none !important; }
          .hub-mobile-layout { display: block !important; }
          .hub-mobile-nav { display: flex !important; }
        }
        @media (min-width: 769px) {
          .hub-mobile-layout { display: none !important; }
          .hub-desktop-layout { display: flex !important; }
        }
      `}</style>

      {/* ── DESKTOP ── */}
      <div className="hub-desktop-layout" style={{ display: 'flex', maxWidth: 1080, margin: '0 auto', padding: '2rem 1.5rem', gap: '1.75rem', alignItems: 'flex-start' }}>
        {/* Sidebar */}
        <div style={{ width: 210, flexShrink: 0, position: 'sticky', top: '1.5rem' }}>
          <div style={{ backgroundColor: '#fff', border: '1px solid var(--color-border)', borderRadius: 8, padding: '1.25rem', marginBottom: '0.75rem', textAlign: 'center' }}>
            {avatarUrl ? (
              <img src={avatarUrl} alt={firstName} style={{ width: 60, height: 60, borderRadius: '50%', objectFit: 'cover', border: '2px solid var(--color-gold)', margin: '0 auto 0.75rem', display: 'block' }} />
            ) : (
              <div style={{ width: 60, height: 60, borderRadius: '50%', backgroundColor: 'var(--color-navy)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 0.75rem' }}>
                <span style={{ fontSize: 22, fontWeight: 700, color: 'var(--color-gold)' }}>{firstName.charAt(0).toUpperCase()}</span>
              </div>
            )}
            <p style={{ fontSize: '14px', fontWeight: 700, color: 'var(--color-navy)', margin: '0 0 0.15rem', fontFamily: 'Georgia, serif' }}>{fullName || firstName}</p>
            {profile?.username && <p style={{ fontSize: '11px', color: 'var(--color-gold)', margin: '0 0 0.2rem', fontWeight: 600 }}>@{profile.username}</p>}
            <p style={{ fontSize: '11px', color: '#9a9085', margin: 0 }}>Member since {memberYear}</p>
          </div>
          <div style={{ backgroundColor: '#fff', border: '1px solid var(--color-border)', borderRadius: 8, padding: '0.5rem' }}>
            {NAV_ITEMS.map(item => (
              <button key={item.id} className={`hub-sidebar-btn${activeTab === item.id ? ' active' : ''}`} onClick={() => setActiveTab(item.id)}>
                <span className="hub-nav-icon">{item.icon}</span>
                {item.label}
              </button>
            ))}
            <div style={{ height: 1, backgroundColor: 'var(--color-border)', margin: '0.4rem 0.5rem' }} />
            <button onClick={handleSignOut} className="hub-sidebar-btn" style={{ color: '#9a9085' }}>
              <span className="hub-nav-icon" style={{ fontSize: 13 }}>↩</span>
              Sign Out
            </button>
          </div>
        </div>

        {/* Content */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ marginBottom: '1rem' }}>
            <h2 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--color-navy)', margin: 0, fontFamily: 'Georgia, serif', letterSpacing: '-0.01em' }}>{activeNav?.label}</h2>
          </div>
          <div style={{ backgroundColor: '#fff', border: '1px solid var(--color-border)', borderRadius: 8, padding: '1.5rem' }}>
            {renderContent()}
          </div>
        </div>
      </div>

      {/* ── MOBILE ── */}
      <div className="hub-mobile-layout" style={{ display: 'none', paddingBottom: 72 }}>
        <div style={{ backgroundColor: 'var(--color-navy)', padding: '1.1rem 1.25rem 0.9rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.875rem' }}>
            {avatarUrl ? (
              <img src={avatarUrl} alt={firstName} style={{ width: 42, height: 42, borderRadius: '50%', objectFit: 'cover', border: '2px solid var(--color-gold)', flexShrink: 0 }} />
            ) : (
              <div style={{ width: 42, height: 42, borderRadius: '50%', backgroundColor: 'rgba(255,255,255,0.1)', border: '2px solid var(--color-gold)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <span style={{ fontSize: 17, fontWeight: 700, color: 'var(--color-gold)' }}>{firstName.charAt(0).toUpperCase()}</span>
              </div>
            )}
            <div>
              <p style={{ fontSize: '14px', fontWeight: 700, color: '#fff', margin: '0 0 0.1rem', fontFamily: 'Georgia, serif' }}>{fullName || firstName}</p>
              <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.5)', margin: 0 }}>
                {profile?.username ? `@${profile.username} · ` : ''}Member since {memberYear}
              </p>
            </div>
          </div>
        </div>
        <div style={{ padding: '1rem 1.25rem 0.25rem' }}>
          <h2 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--color-navy)', margin: 0, fontFamily: 'Georgia, serif' }}>{activeNav?.label}</h2>
        </div>
        <div style={{ padding: '0.5rem 1.25rem 1rem' }}>
          {renderContent()}
        </div>
      </div>

      {/* Mobile bottom nav */}
      <nav className="hub-mobile-nav">
        <div className="hub-mobile-nav-inner">
          {NAV_ITEMS.slice(0, 4).map(item => (
            <button key={item.id} className={`hub-mobile-btn${activeTab === item.id ? ' active' : ''}`} onClick={() => setActiveTab(item.id)}>
              <span className="hub-mobile-icon">{item.icon}</span>
              {item.label}
            </button>
          ))}
          <button className={`hub-mobile-btn${(activeTab === 'community' || activeTab === 'settings') ? ' active' : ''}`} onClick={() => setMoreOpen(true)}>
            <span className="hub-mobile-icon">⋯</span>
            More
          </button>
        </div>
      </nav>

      {/* More drawer */}
      {moreOpen && (
        <>
          <div className="hub-more-overlay" onClick={() => setMoreOpen(false)} />
          <div className="hub-more-drawer">
            <div style={{ width: 36, height: 4, backgroundColor: '#e0dbd4', borderRadius: 2, margin: '0 auto 1.25rem' }} />
            <p style={{ fontSize: '10px', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#9a9085', marginBottom: '0.75rem' }}>More options</p>
            {NAV_ITEMS.slice(4).map(item => (
              <button key={item.id} onClick={() => { setActiveTab(item.id); setMoreOpen(false) }} style={{ display: 'flex', alignItems: 'center', gap: '0.875rem', width: '100%', padding: '0.875rem 0', borderBottom: '1px solid var(--color-border)', background: 'none', border: 'none', borderBottom: '1px solid var(--color-border)', cursor: 'pointer', textAlign: 'left' }}>
                <span style={{ fontSize: 18, width: 24, textAlign: 'center' }}>{item.icon}</span>
                <span style={{ fontSize: '15px', fontWeight: 600, color: 'var(--color-navy)' }}>{item.label}</span>
                <span style={{ marginLeft: 'auto', color: '#9a9085' }}>›</span>
              </button>
            ))}
            <button onClick={handleSignOut} style={{ display: 'flex', alignItems: 'center', gap: '0.875rem', width: '100%', padding: '0.875rem 0', background: 'none', border: 'none', cursor: 'pointer', marginTop: '0.25rem' }}>
              <span style={{ fontSize: 18, width: 24, textAlign: 'center' }}>↩</span>
              <span style={{ fontSize: '15px', fontWeight: 600, color: '#a32d2d' }}>Sign Out</span>
            </button>
          </div>
        </>
      )}
    </div>
  )
}
