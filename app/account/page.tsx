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

type Tab = 'feed' | 'saved' | 'new' | 'community' | 'settings'

const NAV: { id: Tab; label: string }[] = [
  { id: 'feed', label: 'My Feed' },
  { id: 'saved', label: 'Saved' },
  { id: 'new', label: 'New' },
  { id: 'community', label: 'Community' },
  { id: 'settings', label: 'Settings' },
]

export default function AccountPage() {
  const [profile, setProfile] = useState<any>(null)
  const [newEmail, setNewEmail] = useState('')
  const [emailSending, setEmailSending] = useState(false)
  const [emailMsg, setEmailMsg] = useState('')
  const [emailError, setEmailError] = useState('')
  const [loading, setLoading] = useState(true)
  const [auth, setAuth] = useState<any>(null)
  const [activeTab, setActiveTab] = useState<Tab>('feed')
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
  const [feedArticles, setFeedArticles] = useState<any[]>([])
  const [feedLoading, setFeedLoading] = useState(false)
  const [recentSlugs, setRecentSlugs] = useState<string[]>([])
  const [moreOpen, setMoreOpen] = useState(false)
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [passwordMsg, setPasswordMsg] = useState('')
  const [passwordError, setPasswordError] = useState('')
  const [savingPassword, setSavingPassword] = useState(false)

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
    if (!auth) return
    setFeedLoading(true)
    Promise.all([
      fetch(`${SUPABASE_URL}/rest/v1/user_events?select=article_slug&user_id=eq.${auth.uid}&event_type=eq.view&order=created_at.desc&limit=20`, {
        headers: { apikey: SUPABASE_ANON_KEY, Authorization: `Bearer ${auth.token}` }
      }).then(r => r.json()),
      fetch(`${SUPABASE_URL}/rest/v1/user_scores?select=category_scores&user_id=eq.${auth.uid}&limit=1`, {
        headers: { apikey: SUPABASE_ANON_KEY, Authorization: `Bearer ${auth.token}` }
      }).then(r => r.json()),
      fetch(`${SUPABASE_URL}/rest/v1/articles?select=id,title,slug,excerpt,cover_image_url,published_at,categories!articles_category_id_fkey(name,slug)&status=eq.published&order=published_at.desc&limit=40`, {
        headers: { apikey: SUPABASE_ANON_KEY, Authorization: `Bearer ${auth.token}` }
      }).then(r => r.json())
    ]).then(([events, scores, articles]) => {
      const seen = new Set<string>()
      const slugs: string[] = []
      if (Array.isArray(events)) {
        for (const e of events) {
          if (e.article_slug && !seen.has(e.article_slug)) { seen.add(e.article_slug); slugs.push(e.article_slug) }
        }
      }
      setRecentSlugs(slugs)
      if (!Array.isArray(articles)) { setFeedLoading(false); return }
      let topSlugs: string[] = []
      if (Array.isArray(scores) && scores[0]?.category_scores) {
        topSlugs = Object.entries(scores[0].category_scores as Record<string, number>)
          .sort((a, b) => b[1] - a[1]).slice(0, 5).map(([s]) => s)
      }
      const readSet = new Set(slugs)
      const personalized = topSlugs.length > 0 ? articles.filter((a: any) => topSlugs.includes(a.categories?.slug) && !readSet.has(a.slug)) : []
      const rest = articles.filter((a: any) => !personalized.includes(a) && !readSet.has(a.slug))
      const recentRead = articles.filter((a: any) => readSet.has(a.slug))
      setFeedArticles([...personalized, ...rest, ...recentRead].slice(0, 24))
      setFeedLoading(false)
    }).catch(() => setFeedLoading(false))
  }, [auth])

  useEffect(() => {
    if (!auth || activeTab !== 'saved') return
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
    setUsername(lower); setUsernameError('')
    const err = validateUsername(lower)
    if (err) { setUsernameError(err); return }
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
    const err = validateUsername(username)
    if (username && err) { setUsernameError(err); return }
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

  async function handlePasswordChange(e: React.FormEvent) {
    e.preventDefault()
    setPasswordMsg(''); setPasswordError('')
    if (newPassword.length < 8) { setPasswordError('Password must be at least 8 characters.'); return }
    if (newPassword !== confirmPassword) { setPasswordError('Passwords do not match.'); return }
    setSavingPassword(true)
    const { supabase } = await import('@/lib/supabase/client')
    const { error } = await supabase.auth.updateUser({ password: newPassword })
    setSavingPassword(false)
    if (error) { setPasswordError(error.message); return }
    setPasswordMsg('Password updated successfully.')
    setNewPassword(''); setConfirmPassword('')
    setTimeout(() => setPasswordMsg(''), 4000)
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
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#f5f3ef' }}>
      <div style={{ width: 28, height: 28, border: '2px solid var(--color-gold)', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  )

  const firstName = fullName?.split(' ')[0] || 'Member'
  const memberYear = profile?.created_at ? new Date(profile.created_at).getFullYear() : '—'

  function FeedCard({ article }: { article: any }) {
    const cat = article.categories
    const href = cat?.slug && article.slug ? `/articles/${cat.slug}/${article.slug}` : '#'
    const date = article.published_at ? new Date(article.published_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : ''
    const isRead = recentSlugs.includes(article.slug)
    return (
      <a href={href} style={{ display: 'block', textDecoration: 'none', color: 'inherit', borderBottom: '1px solid var(--color-border)', paddingBottom: '1.25rem', marginBottom: '1.25rem' }}>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
          {article.cover_image_url && (
            <img src={article.cover_image_url} alt={article.title} style={{ width: 90, height: 66, objectFit: 'cover', flexShrink: 0, borderRadius: 3 }} />
          )}
          <div style={{ flex: 1, minWidth: 0 }}>
            {cat?.name && <p style={{ fontSize: '10px', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--color-gold)', margin: '0 0 0.35rem' }}>{cat.name}</p>}
            <p style={{ fontSize: '15px', fontWeight: 700, color: 'var(--color-navy)', margin: '0 0 0.35rem', lineHeight: 1.35, fontFamily: 'Georgia, serif' }}>{article.title}</p>
            {article.excerpt && <p style={{ fontSize: '13px', color: 'var(--color-slate)', margin: '0 0 0.45rem', lineHeight: 1.5, overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' as const }}>{article.excerpt}</p>}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              {date && <span style={{ fontSize: '11px', color: '#9a9085' }}>{date}</span>}
              {isRead && <span style={{ fontSize: '9px', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#9a9085', backgroundColor: '#ebe8e3', padding: '2px 5px', borderRadius: 2 }}>Read</span>}
            </div>
          </div>
        </div>
      </a>
    )
  }

  function Spinner() {
    return <div style={{ padding: '3rem 0', textAlign: 'center' }}><div style={{ width: 22, height: 22, border: '2px solid var(--color-gold)', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.7s linear infinite', display: 'inline-block' }} /></div>
  }

  function FeedTab() {
    if (feedLoading) return <Spinner />
    if (!feedArticles.length) return (
      <div style={{ textAlign: 'center', padding: '3rem 1rem' }}>
        <p style={{ fontSize: '15px', fontWeight: 600, color: 'var(--color-navy)', marginBottom: '0.5rem' }}>No articles yet.</p>
        <a href="/" style={{ fontSize: '12px', color: 'var(--color-gold)', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', textDecoration: 'none' }}>Browse DudeMD →</a>
      </div>
    )
    return <div>{feedArticles.map((a: any, i: number) => <FeedCard key={i} article={a} />)}</div>
  }

  function SavedTab() {
    if (savedLoading) return <Spinner />
    const articles = savedArticles.map((s: any) => s.articles).filter(Boolean)
    if (!articles.length) return (
      <div style={{ textAlign: 'center', padding: '3rem 1rem' }}>
        <p style={{ fontSize: '15px', fontWeight: 600, color: 'var(--color-navy)', marginBottom: '0.5rem' }}>No saved articles yet.</p>
        <p style={{ fontSize: '13px', color: '#9a9085', marginBottom: '1.5rem' }}>Bookmark articles while reading to find them here.</p>
        <a href="/" style={{ fontSize: '12px', color: 'var(--color-gold)', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', textDecoration: 'none' }}>Browse Articles →</a>
      </div>
    )
    return (
      <div>
        <p style={{ fontSize: '11px', color: '#9a9085', margin: '0 0 1.25rem' }}>{articles.length} saved article{articles.length !== 1 ? 's' : ''}</p>
        {articles.map((a: any, i: number) => <FeedCard key={i} article={a} />)}
      </div>
    )
  }

  function NewTab() {
    if (newLoading) return <Spinner />
    if (!newArticles.length) return <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--color-slate)' }}>No articles yet.</div>
    return <div>{newArticles.map((a: any, i: number) => <FeedCard key={i} article={a} />)}</div>
  }

  function CommunityTab() {
    return (
      <div style={{ textAlign: 'center', padding: '4rem 1.5rem' }}>
        <div style={{ width: 52, height: 52, borderRadius: '50%', backgroundColor: 'var(--color-navy)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.25rem' }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--color-gold)" strokeWidth="1.5"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
        </div>
        <p style={{ fontSize: '16px', fontWeight: 700, color: 'var(--color-navy)', marginBottom: '0.5rem', fontFamily: 'Georgia, serif' }}>Community Coming Soon</p>
        <p style={{ fontSize: '13px', color: 'var(--color-slate)', lineHeight: 1.7, maxWidth: 280, margin: '0 auto 1.5rem' }}>Circles, Q&A, events, and badges are being built right now.</p>
        <span style={{ display: 'inline-block', padding: '0.4rem 1rem', backgroundColor: 'var(--color-gold)', color: 'var(--color-navy)', fontSize: '10px', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase' }}>Coming Soon</span>
      </div>
    )
  }

  async function handleEmailChange(e: React.FormEvent) {
    e.preventDefault()
    if (!newEmail || !auth?.uid) return
    if (newEmail === profile?.email) { setEmailError('This is already your current email.'); return }
    setEmailSending(true); setEmailError(''); setEmailMsg('')
    try {
      const res = await fetch('/api/auth/change-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: auth.uid, newEmail })
      })
      const data = await res.json()
      if (data.success) { setEmailMsg('Confirmation email sent! Check your inbox and click the link to confirm.'); setNewEmail('') }
      else setEmailError(data.error || 'Failed to send confirmation.')
    } catch { setEmailError('Something went wrong. Please try again.') }
    finally { setEmailSending(false) }
  }

  function SettingsTab() {
    const inp: any = { width: '100%', padding: '0.8rem 1rem', border: '1px solid var(--color-border)', borderRadius: 4, fontSize: '14px', outline: 'none', boxSizing: 'border-box', backgroundColor: '#fff', fontFamily: 'inherit', color: 'var(--color-navy)' }
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        <div style={{ backgroundColor: '#fff', border: '1px solid var(--color-border)', borderRadius: 6, padding: '1.5rem' }}>
          <p style={{ fontSize: '10px', fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', color: '#9a9085', margin: '0 0 1.25rem', paddingBottom: '0.5rem', borderBottom: '1px solid var(--color-border)' }}>Edit Profile</p>
          <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
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
        <div style={{ backgroundColor: '#fff', border: '1px solid var(--color-border)', borderRadius: 6, padding: '1.5rem' }}>
          <p style={{ fontSize: '10px', fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', color: '#9a9085', margin: '0 0 1.25rem', paddingBottom: '0.5rem', borderBottom: '1px solid var(--color-border)' }}>Email Address</p>
          <p style={{ fontSize: '13px', color: 'var(--color-slate)', margin: '0 0 1rem' }}>Current: <strong style={{ color: 'var(--color-navy)' }}>{profile?.email || '—'}</strong></p>
          <form onSubmit={handleEmailChange} style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--color-slate)', marginBottom: '0.4rem' }}>New Email Address</label>
              <input type="email" style={inp} defaultValue={newEmail} onBlur={e => setNewEmail(e.target.value)} placeholder="Enter new email address" />
            </div>
            {emailError && <p style={{ fontSize: '12px', color: '#a32d2d', margin: 0 }}>{emailError}</p>}
            {emailMsg && <p style={{ fontSize: '12px', color: '#2d7a3a', margin: 0, lineHeight: 1.5 }}>✓ {emailMsg}</p>}
            <button type="submit" disabled={emailSending} style={{ padding: '0.85rem', backgroundColor: 'var(--color-navy)', color: 'var(--color-cream)', fontWeight: 700, fontSize: '13px', letterSpacing: '0.08em', textTransform: 'uppercase', border: 'none', borderRadius: 4, cursor: 'pointer', opacity: emailSending ? 0.6 : 1 }}>
              {emailSending ? 'Sending...' : 'Send Confirmation Email'}
            </button>
          </form>
        </div>
        <div style={{ backgroundColor: '#fff', border: '1px solid var(--color-border)', borderRadius: 6, padding: '1.5rem' }}>
          <p style={{ fontSize: '10px', fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', color: '#9a9085', margin: '0 0 1rem', paddingBottom: '0.5rem', borderBottom: '1px solid var(--color-border)' }}>Newsletter</p>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <p style={{ fontSize: '14px', fontWeight: 600, color: profile?.newsletter_subscribed !== false ? 'var(--color-navy)' : '#9a9085', margin: '0 0 0.2rem' }}>
                {profile?.newsletter_subscribed !== false ? 'Subscribed ✓' : 'Not subscribed'}
              </p>
              <p style={{ fontSize: '12px', color: '#9a9085', margin: 0 }}>Weekly men's wellness.</p>
            </div>
            {profile?.newsletter_subscribed !== false
              ? <button onClick={handleUnsubscribe} style={{ padding: '0.5rem 1rem', border: '1px solid #a32d2d', borderRadius: 4, backgroundColor: '#fff', color: '#a32d2d', fontSize: '12px', fontWeight: 700, cursor: 'pointer' }}>Unsubscribe</button>
              : <button onClick={handleResubscribe} style={{ padding: '0.5rem 1rem', border: '1px solid var(--color-navy)', borderRadius: 4, backgroundColor: 'var(--color-navy)', color: 'var(--color-cream)', fontSize: '12px', fontWeight: 700, cursor: 'pointer' }}>Subscribe</button>
            }
          </div>
        </div>
        <div style={{ backgroundColor: '#fff', border: '1px solid var(--color-border)', borderRadius: 6, padding: '1.5rem' }}>
          <p style={{ fontSize: '10px', fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', color: '#9a9085', margin: '0 0 1rem', paddingBottom: '0.5rem', borderBottom: '1px solid var(--color-border)' }}>Change Password</p>
          <form onSubmit={handlePasswordChange} style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--color-slate)', marginBottom: '0.4rem' }}>New Password</label>
              <input type="password" style={inp} value={newPassword} onChange={e => setNewPassword(e.target.value)} placeholder="Minimum 8 characters" />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--color-slate)', marginBottom: '0.4rem' }}>Confirm New Password</label>
              <input type="password" style={inp} value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} placeholder="Re-enter new password" />
            </div>
            {passwordError && <p style={{ fontSize: '12px', color: '#a32d2d', margin: 0 }}>{passwordError}</p>}
            {passwordMsg && <p style={{ fontSize: '12px', color: '#2d7a3a', margin: 0 }}>✓ {passwordMsg}</p>}
            <button type="submit" disabled={savingPassword} style={{ padding: '0.85rem', backgroundColor: 'var(--color-navy)', color: 'var(--color-cream)', fontWeight: 700, fontSize: '13px', letterSpacing: '0.08em', textTransform: 'uppercase', border: 'none', borderRadius: 4, cursor: 'pointer', opacity: savingPassword ? 0.6 : 1 }}>
              {savingPassword ? 'Updating...' : 'Update Password'}
            </button>
          </form>
        </div>
        <button onClick={handleSignOut} style={{ width: '100%', padding: '0.85rem', backgroundColor: 'transparent', border: '1px solid var(--color-navy)', borderRadius: 4, color: 'var(--color-navy)', fontWeight: 700, fontSize: '13px', letterSpacing: '0.08em', textTransform: 'uppercase', cursor: 'pointer' }}>Sign Out</button>
        {!showDelete ? (
          <button onClick={() => setShowDelete(true)} style={{ width: '100%', padding: '0.5rem', backgroundColor: 'transparent', border: 'none', color: '#9a9085', fontSize: '12px', cursor: 'pointer', textDecoration: 'underline' }}>Delete My Account</button>
        ) : (
          <div style={{ backgroundColor: '#fff', border: '1px solid #a32d2d', borderRadius: 6, padding: '1.5rem' }}>
            <p style={{ fontSize: '14px', fontWeight: 700, color: '#a32d2d', marginBottom: '0.5rem' }}>⚠️ Delete Account</p>
            <p style={{ fontSize: '13px', color: 'var(--color-slate)', marginBottom: '1.25rem', lineHeight: 1.6 }}>This permanently deletes your account.</p>
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
      case 'feed': return <FeedTab />
      case 'saved': return <SavedTab />
      case 'new': return <NewTab />
      case 'community': return <CommunityTab />
      case 'settings': return <SettingsTab />
    }
  }

  return (
    <div className="hub-page" style={{ backgroundColor: '#f5f3ef' }}>
      <style>{`
        @keyframes spin { to { transform: rotate(360deg) } }
        @keyframes slideUp { from { transform: translateY(100%); opacity: 0 } to { transform: translateY(0); opacity: 1 } }

        /* Desktop sidebar */
        .snav-btn { display: flex; align-items: center; gap: 0.65rem; width: 100%; padding: 0.65rem 0.875rem; background: none; border: none; border-radius: 5px; cursor: pointer; font-size: 13px; font-weight: 600; color: #4A5563; text-align: left; transition: background 0.12s, color 0.12s; }
        .snav-btn:hover { background: rgba(14,26,43,0.06); color: #0e1a2b; }
        .snav-btn.active { background: #0e1a2b; color: #fff; }
        .snav-dot { width: 5px; height: 5px; border-radius: 50%; background: currentColor; opacity: 0.35; flex-shrink: 0; }
        .snav-btn.active .snav-dot { background: #c9b28f; opacity: 1; }

        /* Mobile subnav — sits below site header, sticky */
        .mnav { display: none; background: #fff; border-bottom: 1px solid var(--color-border); overflow-x: auto; scrollbar-width: none; -webkit-overflow-scrolling: touch; }
        .mnav::-webkit-scrollbar { display: none; }
        .mnav-inner { display: flex; padding: 0 0.75rem; }
        .mnav-btn { padding: 0.8rem 0.875rem; background: none; border: none; border-bottom: 2px solid transparent; cursor: pointer; font-size: 13px; font-weight: 600; color: #9a9085; white-space: nowrap; transition: color 0.15s, border-color 0.15s; }
        .mnav-btn.active { color: #0e1a2b; border-bottom-color: #c9b28f; }
        .mnav-btn:hover { color: #0e1a2b; }

        /* More drawer */
        .more-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.35); z-index: 60; }
        .more-drawer { position: fixed; bottom: 0; left: 0; right: 0; z-index: 70; background: #fff; border-radius: 14px 14px 0 0; padding: 1.25rem 1.5rem 2.5rem; animation: slideUp 0.2s ease; }

        @media (max-width: 768px) {
          .hub-desktop { display: none !important; }
          .hub-mobile { display: block !important; }
          .mnav { display: block !important; }
        }
        @media (min-width: 769px) {
          .hub-page { min-height: 100vh; }
          
          
          .hub-mobile { display: none !important; }
          .hub-desktop { display: flex !important; }
        }
      `}</style>

      {/* ── DESKTOP ── */}
      <div className="hub-desktop" style={{ display: 'flex', maxWidth: 1060, width: '100%', margin: '0 auto', padding: '2rem 1.5rem', gap: '1.75rem', height: 'calc(100vh - 130px)', overflow: 'hidden' }}>

        {/* Sidebar — uses position:sticky on its own wrapper */}
        <div style={{ width: 200, flexShrink: 0, height: '100%', overflow: 'hidden' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>

            {/* Profile card — name + username + member since only, no avatar */}
            <div style={{ backgroundColor: '#fff', border: '1px solid var(--color-border)', borderRadius: 8, padding: '1.25rem' }}>
              <p style={{ fontSize: '15px', fontWeight: 700, color: 'var(--color-navy)', margin: '0 0 0.2rem', fontFamily: 'Georgia, serif' }}>{fullName || firstName}</p>
              {profile?.username && <p style={{ fontSize: '12px', color: 'var(--color-gold)', margin: '0 0 0.3rem', fontWeight: 600 }}>@{profile.username}</p>}
              <p style={{ fontSize: '11px', color: '#9a9085', margin: '0 0 0.75rem' }}>Member since {memberYear}</p>
              <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: '0.75rem', borderTop: '1px solid var(--color-border)' }}>
                <span style={{ fontSize: '11px', color: '#9a9085' }}>Newsletter</span>
                <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--color-navy)' }}>{profile?.newsletter_subscribed !== false ? 'Active' : 'Off'}</span>
              </div>
            </div>

            {/* Nav */}
            <div style={{ backgroundColor: '#fff', border: '1px solid var(--color-border)', borderRadius: 8, padding: '0.4rem' }}>
              {NAV.map(item => (
                <button key={item.id} className={`snav-btn${activeTab === item.id ? ' active' : ''}`} onClick={() => setActiveTab(item.id)}>
                  <span className="snav-dot" />
                  {item.label}
                </button>
              ))}
              <div style={{ height: 1, background: 'var(--color-border)', margin: '0.3rem 0.4rem' }} />
              <button onClick={handleSignOut} className="snav-btn" style={{ color: '#9a9085' }}>
                <span className="snav-dot" style={{ opacity: 0.25 }} />
                Sign Out
              </button>
            </div>
          </div>
        </div>

        {/* Main content */}
        <div style={{ flex: 1, minWidth: 0, overflowY: 'auto', height: '100%', paddingRight: '0.5rem' }}>
          <div style={{ marginBottom: '1rem' }}>
            <h2 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--color-navy)', margin: 0, fontFamily: 'Georgia, serif' }}>
              {activeTab === 'feed' ? 'Your Feed' : NAV.find(n => n.id === activeTab)?.label}
            </h2>
          </div>
          <div style={{ backgroundColor: '#fff', border: '1px solid var(--color-border)', borderRadius: 8, padding: '1.5rem' }}>
            {renderContent()}
          </div>
        </div>
      </div>

      {/* ── MOBILE ── */}
      <div className="hub-mobile" style={{ display: 'none' }}>

        {/* Sticky subnav — sits directly below the site header, no profile header */}
        <nav className="mnav" style={{ position: 'fixed', top: 117, zIndex: 30, left: 0, right: 0 }}>
          <div className="mnav-inner">
            {NAV.slice(0, 4).map(item => (
              <button key={item.id} className={`mnav-btn${activeTab === item.id ? ' active' : ''}`} onClick={() => setActiveTab(item.id)}>
                {item.label}
              </button>
            ))}
            <button className={`mnav-btn${activeTab === 'settings' ? ' active' : ''}`} onClick={() => setMoreOpen(true)}>
              More
            </button>
          </div>
        </nav>

        {/* Content — no labels, straight into feed */}
        <div style={{ padding: '1.25rem', paddingTop: '4rem' }}>
          {renderContent()}
        </div>
      </div>

      {/* More drawer */}
      {moreOpen && (
        <>
          <div className="more-overlay" onClick={() => setMoreOpen(false)} />
          <div className="more-drawer">
            <div style={{ width: 32, height: 3, backgroundColor: '#e0dbd4', borderRadius: 2, margin: '0 auto 1.25rem' }} />
            <button onClick={() => { setActiveTab('settings'); setMoreOpen(false) }} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', padding: '1rem 0', borderBottom: '1px solid var(--color-border)', background: 'none', border: 'none', borderBottom: '1px solid var(--color-border)', cursor: 'pointer' }}>
              <span style={{ fontSize: '15px', fontWeight: 600, color: 'var(--color-navy)' }}>Settings</span>
              <span style={{ color: '#9a9085' }}>›</span>
            </button>
            <button onClick={handleSignOut} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', padding: '1rem 0', background: 'none', border: 'none', cursor: 'pointer', marginTop: '0.25rem' }}>
              <span style={{ fontSize: '15px', fontWeight: 600, color: '#a32d2d' }}>Sign Out</span>
            </button>
          </div>
        </>
      )}
    </div>
  )
}
