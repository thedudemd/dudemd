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
  parent_id?: string | null
  content: string
  created_at: string
  full_name?: string
  username?: string
  avatar_url?: string
  replies?: Comment[]
}

type ReactionData = { like: number; heart: number; care: number; userType: string | null }

const PAGE_SIZE = 10
const REPORT_REASONS = ['Spam', 'Harassment', 'Hate Speech', 'Other']
const REACTION_TYPES: { key: 'like' | 'heart' | 'care'; emoji?: string; label: string }[] = [
  { key: 'like', label: 'Like' },
  { key: 'heart', emoji: '\u2764\uFE0F', label: 'Heart' },
  { key: 'care', emoji: '\uD83E\uDD17', label: 'Care' },
]

export default function CommentSection({ articleId }: { articleId: string }) {
  const [enabled, setEnabled] = useState(false)
  const [comments, setComments] = useState<Comment[]>([])
  const [loaded, setLoaded] = useState(false)
  const [loading, setLoading] = useState(false)
  const [hasMore, setHasMore] = useState(true)
  const [offset, setOffset] = useState(0)
  const [newComment, setNewComment] = useState('')
  const [posting, setPosting] = useState(false)
  const [postError, setPostError] = useState<string | null>(null)
  const [replyingTo, setReplyingTo] = useState<string | null>(null)
  const [replyText, setReplyText] = useState('')
  const [replyPosting, setReplyPosting] = useState(false)
  const [replyError, setReplyError] = useState<string | null>(null)
  const [auth, setAuth] = useState<{ uid?: string; token?: string; name?: string } | null>(null)
  const [reportingFor, setReportingFor] = useState<string | null>(null)
  const [reportedIds, setReportedIds] = useState<Set<string>>(new Set())
  const [reactions, setReactions] = useState<Record<string, ReactionData>>({})
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

  async function fetchReactions(commentIds: string[]) {
    if (commentIds.length === 0) return
    const currentUid = getAuthFromCookie()?.uid
    try {
      const res = await fetch(`${SUPABASE_URL}/rest/v1/comment_reactions?comment_id=in.(${commentIds.join(',')})&select=comment_id,user_id,type`, {
        headers: { apikey: SUPABASE_ANON_KEY, Authorization: `Bearer ${SUPABASE_ANON_KEY}` }
      })
      const rows: { comment_id: string; user_id: string; type: string }[] = await res.json()
      const map: Record<string, ReactionData> = {}
      commentIds.forEach(id => { map[id] = { like: 0, heart: 0, care: 0, userType: null } })
      rows.forEach(r => {
        if (!map[r.comment_id]) map[r.comment_id] = { like: 0, heart: 0, care: 0, userType: null }
        if (r.type === 'like' || r.type === 'heart' || r.type === 'care') {
          map[r.comment_id][r.type]++
        }
        if (currentUid && r.user_id === currentUid) {
          map[r.comment_id].userType = r.type
        }
      })
      setReactions(prev => ({ ...prev, ...map }))
    } catch (e) {}
  }

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

      let allIds = data.map(c => c.id)

      // Fetch replies for these top-level comments
      if (data.length > 0) {
        const parentIds = data.map(c => c.id)
        const repliesRes = await fetch(`${SUPABASE_URL}/rest/v1/article_comments?parent_id=in.(${parentIds.join(',')})&select=*&order=created_at.asc`, {
          headers: { apikey: SUPABASE_ANON_KEY, Authorization: `Bearer ${SUPABASE_ANON_KEY}` }
        })
        const replies: Comment[] = await repliesRes.json()
        if (replies.length > 0) {
          const replyUserIds = Array.from(new Set(replies.map(r => r.user_id)))
          const replyProfilesRes = await fetch(`${SUPABASE_URL}/rest/v1/profiles?id=in.(${replyUserIds.join(',')})&select=id,full_name,username,avatar_url`, {
            headers: { apikey: SUPABASE_ANON_KEY, Authorization: `Bearer ${SUPABASE_ANON_KEY}` }
          })
          const replyProfiles = await replyProfilesRes.json()
          const replyProfileMap: Record<string, any> = {}
          replyProfiles.forEach((p: any) => { replyProfileMap[p.id] = p })
          replies.forEach(r => {
            const p = replyProfileMap[r.user_id]
            r.full_name = p?.full_name
            r.username = p?.username
            r.avatar_url = p?.avatar_url
          })
        }
        data.forEach(parent => {
          parent.replies = replies.filter(r => r.parent_id === parent.id)
        })
        allIds = [...allIds, ...replies.map(r => r.id)]
      }

      setComments(prev => startOffset === 0 ? data : [...prev, ...data])
      setHasMore(data.length === PAGE_SIZE)
      setOffset(startOffset + data.length)
      setLoaded(true)
      fetchReactions(allIds)
    } catch (e) {
      setLoaded(true)
    }
    setLoading(false)
  }

  async function handlePost() {
    if (!auth?.uid || !newComment.trim()) return
    setPosting(true)
    setPostError(null)
    try {
      const res = await fetch('/api/comments/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ articleId, content: newComment.trim(), token: auth.token })
      })
      const data = await res.json()
      if (!res.ok) {
        setPostError(data.error || 'Something went wrong. Please try again.')
      } else if (data.comment) {
        setComments(prev => [{ ...data.comment, full_name: auth.name }, ...prev])
        setReactions(prev => ({ ...prev, [data.comment.id]: { like: 0, heart: 0, care: 0, userType: null } }))
        setNewComment('')
      }
    } catch (e) {
      setPostError('Something went wrong. Please try again.')
    }
    setPosting(false)
  }

  async function handleDelete(commentId: string) {
    if (!auth?.token) return
    if (!confirm('Delete this comment?')) return
    try {
      const res = await fetch(`${SUPABASE_URL}/rest/v1/article_comments?id=eq.${commentId}`, {
        method: 'DELETE',
        headers: { apikey: SUPABASE_ANON_KEY, Authorization: `Bearer ${auth.token}` }
      })
      if (res.ok) {
        setComments(prev => prev.filter(c => c.id !== commentId))
      }
    } catch (e) {}
  }

  async function handleReply(parentId: string) {
    if (!auth?.uid || !replyText.trim()) return
    setReplyPosting(true)
    setReplyError(null)
    try {
      const res = await fetch('/api/comments/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ articleId, content: replyText.trim(), token: auth.token, parentId })
      })
      const data = await res.json()
      if (!res.ok) {
        setReplyError(data.error || 'Something went wrong. Please try again.')
      } else if (data.comment) {
        setComments(prev => prev.map(c => c.id === parentId ? { ...c, replies: [...(c.replies || []), { ...data.comment, full_name: auth.name }] } : c))
        setReactions(prev => ({ ...prev, [data.comment.id]: { like: 0, heart: 0, care: 0, userType: null } }))
        setReplyText('')
        setReplyingTo(null)
      }
    } catch (e) {
      setReplyError('Something went wrong. Please try again.')
    }
    setReplyPosting(false)
  }

  async function handleReport(commentId: string, reason: string) {
    if (!auth?.token || !auth?.uid) return
    try {
      const res = await fetch(`${SUPABASE_URL}/rest/v1/comment_reports`, {
        method: 'POST',
        headers: { apikey: SUPABASE_ANON_KEY, Authorization: `Bearer ${auth.token}`, 'Content-Type': 'application/json', Prefer: 'return=minimal' },
        body: JSON.stringify({ content_type: 'comment', content_id: commentId, reporter_id: auth.uid, reason })
      })
      if (res.ok) {
        setReportedIds(prev => new Set(prev).add(commentId))
        setReportingFor(null)
      }
    } catch (e) {}
  }

  async function handleReaction(commentId: string, type: 'like' | 'heart' | 'care') {
    if (!auth?.token || !auth?.uid) return
    const current = reactions[commentId] || { like: 0, heart: 0, care: 0, userType: null }
    const prevType = current.userType

    // Optimistic update
    const next: ReactionData = { ...current }
    if (prevType) next[prevType as 'like' | 'heart' | 'care'] = Math.max(0, next[prevType as 'like' | 'heart' | 'care'] - 1)
    if (prevType === type) {
      next.userType = null
    } else {
      next[type]++
      next.userType = type
    }
    setReactions(prev => ({ ...prev, [commentId]: next }))

    try {
      if (prevType === type) {
        await fetch(`${SUPABASE_URL}/rest/v1/comment_reactions?comment_id=eq.${commentId}&user_id=eq.${auth.uid}`, {
          method: 'DELETE',
          headers: { apikey: SUPABASE_ANON_KEY, Authorization: `Bearer ${auth.token}` }
        })
      } else {
        await fetch(`${SUPABASE_URL}/rest/v1/comment_reactions?on_conflict=comment_id,user_id`, {
          method: 'POST',
          headers: { apikey: SUPABASE_ANON_KEY, Authorization: `Bearer ${auth.token}`, 'Content-Type': 'application/json', Prefer: 'resolution=merge-duplicates,return=minimal' },
          body: JSON.stringify({ comment_id: commentId, user_id: auth.uid, type })
        })
      }
    } catch (e) {}
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

  function renderActions(c: Comment, isReply: boolean) {
    const fontSize = isReply ? '10px' : '11px'
    const isOwn = auth?.uid === c.user_id
    const isReported = reportedIds.has(c.id)
    return (
      <>
        {isOwn && (
          <button onClick={() => handleDelete(c.id)} style={{ marginLeft: 'auto', background: 'none', border: 'none', cursor: 'pointer', color: '#9a9085', fontSize, padding: 0, textDecoration: 'underline' }}>Delete</button>
        )}
        {!isOwn && auth?.uid && !isReported && (
          <button onClick={() => setReportingFor(reportingFor === c.id ? null : c.id)} style={{ marginLeft: 'auto', background: 'none', border: 'none', cursor: 'pointer', color: '#9a9085', fontSize, padding: 0, textDecoration: 'underline' }}>Report</button>
        )}
        {!isOwn && isReported && (
          <span style={{ marginLeft: 'auto', color: '#9a9085', fontSize, fontStyle: 'italic' }}>Reported</span>
        )}
      </>
    )
  }

  function renderReportMenu(c: Comment) {
    if (reportingFor !== c.id) return null
    return (
      <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginTop: '0.4rem' }}>
        {REPORT_REASONS.map(reason => (
          <button key={reason} onClick={() => handleReport(c.id, reason)} style={{ padding: '0.25rem 0.6rem', fontSize: '11px', border: '1px solid var(--color-border)', background: 'var(--color-cream)', color: 'var(--color-slate)', cursor: 'pointer' }}>
            {reason}
          </button>
        ))}
      </div>
    )
  }

  function renderReactionBar(c: Comment, isReply: boolean) {
    const r = reactions[c.id] || { like: 0, heart: 0, care: 0, userType: null }
    const iconSize = isReply ? 14 : 16
    return (
      <div style={{ display: 'flex', gap: '0.9rem', marginTop: '0.5rem', alignItems: 'center' }}>
        {REACTION_TYPES.map(rt => {
          const active = r.userType === rt.key
          const count = r[rt.key]
          const disabled = !auth?.uid
          return (
            <button
              key={rt.key}
              onClick={() => !disabled && handleReaction(c.id, rt.key)}
              disabled={disabled}
              title={rt.label}
              style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', background: 'none', border: 'none', cursor: disabled ? 'default' : 'pointer', padding: 0, fontSize: isReply ? '11px' : '12px', color: active ? 'var(--color-navy)' : '#9a9085', fontWeight: active ? 700 : 400 }}
            >
              {rt.key === 'like' ? (
                <svg width={iconSize} height={iconSize} viewBox="0 0 24 24" fill={active ? '#1877F2' : 'none'} stroke={active ? '#1877F2' : '#9a9085'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3H14z" />
                  <path d="M7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3" />
                </svg>
              ) : (
                <span style={{ fontSize: `${iconSize}px`, lineHeight: 1, filter: active ? 'none' : 'grayscale(1)', opacity: active ? 1 : 0.45 }}>{rt.emoji}</span>
              )}
              {count > 0 && <span>{count}</span>}
            </button>
          )
        })}
      </div>
    )
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
            {postError && (
              <p style={{ fontSize: '13px', color: '#c0392b', margin: '0.5rem 0 0' }}>{postError}</p>
            )}
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
                {renderActions(c, false)}
              </div>
              <p style={{ fontSize: '14px', color: 'var(--color-charcoal)', lineHeight: 1.6, margin: 0, whiteSpace: 'pre-wrap' }}>{c.content}</p>
              {renderReactionBar(c, false)}
              {renderReportMenu(c)}

              {auth?.uid && (
                <button onClick={() => { setReplyingTo(replyingTo === c.id ? null : c.id); setReplyText(''); setReplyError(null) }} style={{ marginTop: '0.4rem', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-gold)', fontSize: '12px', fontWeight: 700, padding: 0, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                  {replyingTo === c.id ? 'Cancel' : 'Reply'}
                </button>
              )}

              {replyingTo === c.id && (
                <div style={{ marginTop: '0.75rem' }}>
                  <textarea
                    value={replyText}
                    onChange={e => setReplyText(e.target.value)}
                    placeholder={`Reply to ${c.full_name || c.username || 'this comment'}...`}
                    rows={2}
                    style={{ width: '100%', padding: '0.6rem', border: '1px solid var(--color-border)', fontFamily: 'var(--font-body)', fontSize: '13px', color: 'var(--color-charcoal)', resize: 'vertical', boxSizing: 'border-box', outline: 'none' }}
                  />
                  {replyError && <p style={{ fontSize: '12px', color: '#c0392b', margin: '0.4rem 0 0' }}>{replyError}</p>}
                  <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '0.4rem' }}>
                    <button onClick={() => handleReply(c.id)} disabled={replyPosting || !replyText.trim()} style={{ padding: '0.45rem 1.25rem', backgroundColor: 'var(--color-navy)', color: 'var(--color-cream)', fontWeight: 700, fontSize: '11px', letterSpacing: '0.08em', textTransform: 'uppercase', border: 'none', cursor: replyPosting || !replyText.trim() ? 'not-allowed' : 'pointer', opacity: replyPosting || !replyText.trim() ? 0.5 : 1 }}>
                      {replyPosting ? 'Posting...' : 'Post Reply'}
                    </button>
                  </div>
                </div>
              )}

              {c.replies && c.replies.length > 0 && (
                <div style={{ marginTop: '1rem', paddingLeft: '1.25rem', borderLeft: '2px solid var(--color-border)' }}>
                  {c.replies.map(r => (
                    <div key={r.id} style={{ display: 'flex', gap: '0.6rem', marginBottom: '1rem', alignItems: 'flex-start' }}>
                      <div style={{ width: '28px', height: '28px', borderRadius: '50%', backgroundColor: 'var(--color-navy)', color: 'var(--color-gold)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '12px', flexShrink: 0, overflow: 'hidden' }}>
                        {r.avatar_url ? <img src={r.avatar_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : (r.full_name || r.username || '?')[0]?.toUpperCase()}
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'baseline', marginBottom: '0.25rem' }}>
                          <span style={{ fontWeight: 700, fontSize: '12px', color: 'var(--color-navy)' }}>{r.full_name || r.username || 'DudeMD Reader'}</span>
                          <span style={{ fontSize: '10px', color: '#9a9085' }}>{timeAgo(r.created_at)}</span>
                          {renderActions(r, true)}
                        </div>
                        <p style={{ fontSize: '13px', color: 'var(--color-charcoal)', lineHeight: 1.6, margin: 0, whiteSpace: 'pre-wrap' }}>{r.content}</p>
                        {renderReactionBar(r, true)}
                        {renderReportMenu(r)}
                      </div>
                    </div>
                  ))}
                </div>
              )}
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
