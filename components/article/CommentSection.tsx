'use client'
import { useState, useEffect, useRef } from 'react'

const SUPABASE_URL = 'https://bicljoujevywrkzjeaoy.supabase.co'
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJpY2xqb3VqZXZ5d3JremplYW95Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzg4MDc1ODIsImV4cCI6MjA5NDM4MzU4Mn0.UIKVUyX6QClJmAYdQKg91t_kAT4itpuSk_fIemcPJ0g'

function getAuthFromCookie() {
  try {
    const jar: Record<string, string> = {}
    document.cookie.split(';').forEach(c => {
      const [k, ...v] = c.trim().split('=')
      jar[k] = v.join('=')
    })
    const projectRef = SUPABASE_URL.match(/https:\/\/([^.]+)\./)?.[1]
    const cookieName = `sb-${projectRef}-auth-token`
    let raw = jar[`${cookieName}.0`]
    let part1 = jar[`${cookieName}.1`]
    if (!raw) return null
    if (raw.startsWith('base64-')) raw = raw.slice(7)
    let full = raw
    if (part1) full += decodeURIComponent(part1)
    const parsed = JSON.parse(atob(full))
    return { uid: parsed?.user?.id, token: parsed?.access_token, name: parsed?.user?.user_metadata?.full_name || parsed?.user?.email }
  } catch (e) { return null }
}

type Comment = {
  id: string
  user_id: string
  content: string
  created_at: string
  full_name?: string
  username?: string
  avatar_url?: string
}

const PAGE_SIZE = 10

export default function CommentSection({ articleId }: { articleId: string }) {
  const [enabled, setEnabled] = useState(false)
  const [comments, setComments] = useState<Comment[]>([])
  const [loaded, setLoaded] = useState(false)
  const [loading, setLoading] = useState(false)
  const [hasMore, setHasMore] = useState(true)
  const [offset, setOffset] = useState(0)
  const [newComment, setNewComment] = useState('')
  const [posting, setPosting] = useState(false)
  const [auth, setAuth] = useState<{ uid?: string; token?: string; name?: string } | null>(null)
  const sectionRef = useRef<HTMLDivElement>(null)

  // Check feature flag on mount
  useEffect(() => {
    fetch(`${SUPABASE_URL}/rest/v1/feature_flags?key=eq.article_comments&select=enabled`, {
      headers: { apikey: SUPABASE_ANON_KEY, Authorization: `Bearer ${SUPABASE_ANON_KEY}` }
    }).then(r => r.json()).then(data => setEnabled(!!data?.[0]?.enabled)).catch(() => setEnabled(false))
    setAuth(getAuthFromCookie())
  }, [])

  // Lazy-load comments when section scrolls near view
  useEffect(() => {
    if (!enabled || loaded || !sectionRef.current) return
    const observer = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting) {
        loadComments(0)
        observer.disconnect()
      }
    }, { rootMargin: '200px' })
    observer.observe(sectionRef.current)
    return () => observer.disconnect()
  }, [enabled, loaded])

  async function loadComments(startOffset: number) {
    setLoading(true)
    try {
      const res = await fetch(`${SUPABASE_URL}/rest/v1/article_comments?article_id=eq.${articleId}&parent_id=is.null&select=*&order=created_at.desc&limit=${PAGE_SIZE}&offset=${startOffset}`, {
        headers: { apikey: SUPABASE_ANON_KEY, Authorization: `Bearer ${SUPABASE_ANON_KEY}` }
      })
      const data: Comment[] = await res.json()

      if (data.length > 0) {
        const userIds = Array.from(new Set(data.map(c => c.user_id)))
        const profilesRes = await fetch(`${SUPABASE_URL}/rest/v1/profiles?id=in.(${userIds.join(',')})&select=id,full_name,username,avatar_url`, {
          headers: { apikey: SUPABASE_ANON_KEY, Authorization: `Bearer ${SUPABASE_ANON_KEY}` }
        })
        const profiles = await profilesRes.json()
        const profileMap: Record<string, any> = {}
        profiles.forEach((p: any) => { profileMap[p.id] = p })
        data.forEach(c => {
          const p = profileMap[c.user_id]
          c.full_name = p?.full_name
          c.username = p?.username
          c.avatar_url = p?.avatar_url
        })
      }

      setComments(prev => startOffset === 0 ? data : [...prev, ...data])
      setHasMore(data.length === PAGE_SIZE)
      setOffset(startOffset + data.length)
      setLoaded(true)
    } catch (e) {
      setLoaded(true)
    }
    setLoading(false)
  }

  async function handlePost() {
    if (!auth?.uid || !newComment.trim()) return
    setPosting(true)
    try {
      const res = await fetch(`${SUPABASE_URL}/rest/v1/article_comments`, {
        method: 'POST',
        headers: { apikey: SUPABASE_ANON_KEY, Authorization: `Bearer ${auth.token}`, 'Content-Type': 'application/json', Prefer: 'return=representation' },
        body: JSON.stringify({ article_id: articleId, user_id: auth.uid, content: newComment.trim() })
      })
      const data = await res.json()
      if (data?.[0]) {
        setComments(prev => [{ ...data[0], full_name: auth.name }, ...prev])
        setNewComment('')
      }
    } catch (e) {}
    setPosting(false)
  }

  function timeAgo(dateStr: string) {
    const diff = Date.now() - new Date(dateStr).getTime()
    const mins = Math.floor(diff / 60000)
    if (mins < 1) return 'just now'
    if (mins < 60) return `${mins}m ago`
    const hours = Math.floor(mins / 60)
    if (hours < 24) return `${hours}h ago`
    const days = Math.floor(hours / 24)
    if (days < 30) return `${days}d ago`
    return new Date(dateStr).toLocaleDateString()
  }

  if (!enabled) return null

  return (
    <section ref={sectionRef} style={{ borderTop: '1px solid var(--color-border)', padding: '3rem 0' }}>
      <div className="container-content">
        <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '1.25rem', color: 'var(--color-navy)', marginBottom: '1.5rem' }}>
          Join the Conversation {comments.length > 0 && `(${comments.length})`}
        </h2>

        {auth?.uid ? (
          <div style={{ marginBottom: '2rem' }}>
            <textarea
              value={newComment}
              onChange={e => setNewComment(e.target.value)}
              placeholder="Share your thoughts..."
              rows={3}
              style={{ width: '100%', padding: '0.75rem', border: '1px solid var(--color-border)', fontFamily: 'var(--font-body)', fontSize: '14px', color: 'var(--color-charcoal)', resize: 'vertical', boxSizing: 'border-box', outline: 'none' }}
            />
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '0.5rem' }}>
              <button onClick={handlePost} disabled={posting || !newComment.trim()} style={{ padding: '0.6rem 1.5rem', backgroundColor: 'var(--color-navy)', color: 'var(--color-cream)', fontWeight: 700, fontSize: '12px', letterSpacing: '0.08em', textTransform: 'uppercase', border: 'none', cursor: posting || !newComment.trim() ? 'not-allowed' : 'pointer', opacity: posting || !newComment.trim() ? 0.5 : 1 }}>
                {posting ? 'Posting...' : 'Post Comment'}
              </button>
            </div>
          </div>
        ) : (
          <div style={{ backgroundColor: 'var(--color-cream)', border: '1px solid var(--color-border)', padding: '1.5rem', marginBottom: '2rem', textAlign: 'center' }}>
            <p style={{ fontSize: '14px', color: 'var(--color-slate)', marginBottom: '1rem' }}>Sign in to join the conversation.</p>
            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center', flexWrap: 'wrap' }}>
              <a href="/join" style={{ padding: '0.6rem 1.5rem', backgroundColor: 'var(--color-navy)', color: 'var(--color-cream)', fontWeight: 700, fontSize: '12px', letterSpacing: '0.08em', textTransform: 'uppercase', textDecoration: 'none' }}>Join Free</a>
              <a href="/signin" style={{ padding: '0.6rem 1.5rem', backgroundColor: 'transparent', color: 'var(--color-navy)', fontWeight: 700, fontSize: '12px', letterSpacing: '0.08em', textTransform: 'uppercase', textDecoration: 'none', border: '1px solid var(--color-navy)' }}>Sign In</a>
            </div>
          </div>
        )}

        {comments.map(c => (
          <div key={c.id} style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.5rem', alignItems: 'flex-start' }}>
            <div style={{ width: '36px', height: '36px', borderRadius: '50%', backgroundColor: 'var(--color-navy)', color: 'var(--color-gold)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '14px', flexShrink: 0, overflow: 'hidden' }}>
              {c.avatar_url ? <img src={c.avatar_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : (c.full_name || c.username || '?')[0]?.toUpperCase()}
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'baseline', marginBottom: '0.25rem' }}>
                <span style={{ fontWeight: 700, fontSize: '13px', color: 'var(--color-navy)' }}>{c.full_name || c.username || 'DudeMD Reader'}</span>
                <span style={{ fontSize: '11px', color: '#9a9085' }}>{timeAgo(c.created_at)}</span>
              </div>
              <p style={{ fontSize: '14px', color: 'var(--color-charcoal)', lineHeight: 1.6, margin: 0, whiteSpace: 'pre-wrap' }}>{c.content}</p>
            </div>
          </div>
        ))}

        {loaded && comments.length === 0 && (
          <p style={{ fontSize: '14px', color: '#9a9085', textAlign: 'center', padding: '1rem 0' }}>No comments yet. Be the first to share your thoughts.</p>
        )}

        {hasMore && comments.length > 0 && (
          <div style={{ textAlign: 'center' }}>
            <button onClick={() => loadComments(offset)} disabled={loading} style={{ padding: '0.6rem 1.5rem', backgroundColor: 'transparent', color: 'var(--color-navy)', fontWeight: 700, fontSize: '12px', letterSpacing: '0.08em', textTransform: 'uppercase', border: '1px solid var(--color-navy)', cursor: 'pointer' }}>
              {loading ? 'Loading...' : 'Load More Comments'}
            </button>
          </div>
        )}
      </div>
    </section>
  )
}
