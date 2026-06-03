cat > ~/dudemd/components/NotificationBell.tsx << 'ENDOFFILE'
'use client'
import { useEffect, useRef, useState } from 'react'

const SUPABASE_URL = 'https://bicljoujevywrkzjeaoy.supabase.co'
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJpY2xqb3VqZXZ5d3JremplYW95Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzg4MDc1ODIsImV4cCI6MjA5NDM4MzU4Mn0.UIKVUyX6QClJmAYdQKg91t_kAT4itpuSk_fIemcPJ0g'

function getAuth() {
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
    return { uid: parsed.user?.id, token: parsed.access_token }
  } catch {}
  return null
}

export default function NotificationBell() {
  const [notifications, setNotifications] = useState<any[]>([])
  const [open, setOpen] = useState(false)
  const [auth, setAuth] = useState<any>(null)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const a = getAuth()
    if (!a?.uid) return
    setAuth(a)
    fetch(`${SUPABASE_URL}/rest/v1/notifications?select=*&user_id=eq.${a.uid}&order=created_at.desc&limit=10`, {
      headers: { apikey: SUPABASE_ANON_KEY, Authorization: `Bearer ${a.token}` }
    }).then(r => r.json()).then(data => {
      if (Array.isArray(data)) setNotifications(data)
    }).catch(() => {})
  }, [])

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  async function markAllRead() {
    if (!auth) return
    await fetch(`${SUPABASE_URL}/rest/v1/notifications?user_id=eq.${auth.uid}&read=eq.false`, {
      method: 'PATCH',
      headers: { apikey: SUPABASE_ANON_KEY, Authorization: `Bearer ${auth.token}`, 'Content-Type': 'application/json', Prefer: 'return=minimal' },
      body: JSON.stringify({ read: true })
    })
    setNotifications(prev => prev.map(n => ({ ...n, read: true })))
  }

  async function markRead(id: string) {
    if (!auth) return
    await fetch(`${SUPABASE_URL}/rest/v1/notifications?id=eq.${id}`, {
      method: 'PATCH',
      headers: { apikey: SUPABASE_ANON_KEY, Authorization: `Bearer ${auth.token}`, 'Content-Type': 'application/json', Prefer: 'return=minimal' },
      body: JSON.stringify({ read: true })
    })
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n))
  }

  if (!auth) return null

  const unread = notifications.filter(n => !n.read).length

  return (
    <div ref={ref} style={{ position: 'relative' }}>
      <button
        onClick={() => { setOpen(!open); if (!open && unread > 0) markAllRead() }}
        style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-cream)', padding: '0.25rem', display: 'flex', alignItems: 'center', position: 'relative' }}
        title="Notifications"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
          <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
        </svg>
        {unread > 0 && (
          <span style={{ position: 'absolute', top: -2, right: -2, backgroundColor: '#c9b28f', color: '#0e1a2b', fontSize: '10px', fontWeight: 700, borderRadius: '50%', width: 16, height: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', lineHeight: 1 }}>
            {unread > 9 ? '9+' : unread}
          </span>
        )}
      </button>

      {open && (
        <div style={{ position: 'absolute', top: '100%', right: 0, marginTop: '0.5rem', backgroundColor: '#fff', border: '1px solid var(--color-border)', width: '300px', zIndex: 100, boxShadow: '0 4px 16px rgba(0,0,0,0.12)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.75rem 1rem', borderBottom: '1px solid var(--color-border)' }}>
            <span style={{ fontSize: '12px', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--color-navy)' }}>Notifications</span>
            {unread > 0 && (
              <button onClick={markAllRead} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '11px', color: 'var(--color-gold)', fontWeight: 600 }}>Mark all read</button>
            )}
          </div>
          {notifications.length === 0 ? (
            <div style={{ padding: '2rem 1rem', textAlign: 'center', fontSize: '13px', color: '#9a9085' }}>No notifications yet</div>
          ) : (
            <div style={{ maxHeight: '320px', overflowY: 'auto' }}>
              {notifications.map(n => (
                
                  key={n.id}
                  href={n.link || '#'}
                  onClick={() => markRead(n.id)}
                  style={{ display: 'block', padding: '0.75rem 1rem', borderBottom: '1px solid var(--color-border)', textDecoration: 'none', backgroundColor: n.read ? '#fff' : '#faf8f5' }}
                >
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem' }}>
                    {!n.read && <span style={{ width: 6, height: 6, borderRadius: '50%', backgroundColor: 'var(--color-gold)', flexShrink: 0, marginTop: 5 }} />}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ fontSize: '13px', fontWeight: n.read ? 400 : 600, color: 'var(--color-navy)', margin: '0 0 0.2rem', overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>{n.title}</p>
                      <p style={{ fontSize: '11px', color: '#9a9085', margin: 0 }}>{new Date(n.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</p>
                    </div>
                  </div>
                </a>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
ENDOFFILE
echo "File created"</parameter>
<parameter name="description">Create NotificationBell component file directly</parameter>