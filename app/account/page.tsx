'use client'
import { useEffect, useState } from 'react'

const SUPABASE_URL = 'https://bicljoujevywrkzjeaoy.supabase.co'
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJpY2xqb3VqZXZ5d3JremplYW95Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzg4MDc1ODIsImV4cCI6MjA5NDM4MzU4Mn0.UIKVUyX6QClJmAYdQKg91t_kAT4itpuSk_fIemcPJ0g'

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
      const part0 = jar['sb-bicljoujevywrkzjeaoy-auth-token.0'] || ''
      const part1 = jar['sb-bicljoujevywrkzjeaoy-auth-token.1'] || ''
      raw = part0.replace('base64-', '') + decodeURIComponent(part1)
    }
    const parsed = JSON.parse(atob(raw))
    return { token: parsed.access_token, uid: parsed.user?.id }
  } catch {}
  return null
}

export default function AccountPage() {
  const [profile, setProfile] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [editing, setEditing] = useState(false)
  const [form, setForm] = useState({ full_name: '', avatar_url: '' })
  const [auth, setAuth] = useState<any>(null)

  useEffect(() => {
    const a = getTokenAndUser()
    if (!a?.uid) { window.location.href = '/signin'; return }
    setAuth(a)
    fetch(`${SUPABASE_URL}/rest/v1/profiles?select=*&id=eq.${a.uid}&limit=1`, {
      headers: { apikey: SUPABASE_ANON_KEY, Authorization: `Bearer ${a.token}` }
    }).then(r => r.json()).then(data => {
      if (data?.[0]) { setProfile(data[0]); setForm({ full_name: data[0].full_name || '', avatar_url: data[0].avatar_url || '' }) }
      setLoading(false)
    }).catch(() => setLoading(false))
  }, [])

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    await fetch(`${SUPABASE_URL}/rest/v1/profiles?id=eq.${auth.uid}`, {
      method: 'PATCH',
      headers: { apikey: SUPABASE_ANON_KEY, Authorization: `Bearer ${auth.token}`, 'Content-Type': 'application/json', Prefer: 'return=minimal' },
      body: JSON.stringify({ full_name: form.full_name, avatar_url: form.avatar_url })
    })
    setProfile({ ...profile, ...form })
    setSaving(false)
    setSaved(true)
    setEditing(false)
    setTimeout(() => setSaved(false), 3000)
  }

  function handleSignOut() {
    document.cookie.split(';').forEach(c => {
      const name = c.split('=')[0].trim()
      document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/`
      document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/; domain=.dudemd.com`
    })
    window.location.href = '/signin'
  }

  if (loading) return (
    <div style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#f7f4ee' }}>
      <div style={{ width: 32, height: 32, border: '3px solid #c9b28f', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
      <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
    </div>
  )

  const firstName = profile?.full_name?.split(' ')[0] || 'Member'
  const inp: any = { width: '100%', padding: '0.75rem', border: '1px solid #ede8df', fontSize: '14px', outline: 'none', boxSizing: 'border-box', backgroundColor: '#f7f4ee', fontFamily: 'inherit' }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f7f4ee' }}>
      <div style={{ maxWidth: '640px', margin: '0 auto', padding: '3rem 1.5rem' }}>

        {/* HEADER */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', marginBottom: '2.5rem', paddingBottom: '2.5rem', borderBottom: '1px solid #ede8df' }}>
          {profile?.avatar_url ? (
            <img src={profile.avatar_url} alt={firstName} style={{ width: 72, height: 72, borderRadius: '50%', objectFit: 'cover', border: '3px solid #c9b28f' }} />
          ) : (
            <div style={{ width: 72, height: 72, borderRadius: '50%', backgroundColor: '#0e1a2b', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28, fontWeight: 700, color: '#c9b28f', flexShrink: 0 }}>
              {firstName.charAt(0).toUpperCase()}
            </div>
          )}
          <div style={{ flex: 1 }}>
            <h1 style={{ fontSize: '24px', fontWeight: 700, color: '#0e1a2b', margin: '0 0 0.25rem' }}>{profile?.full_name || firstName}</h1>
            <p style={{ fontSize: '13px', color: '#4A5563', margin: 0 }}>{profile?.email}</p>
            <p style={{ fontSize: '11px', color: '#9a9085', margin: '0.25rem 0 0', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Member since {new Date(profile?.created_at).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</p>
          </div>
          <button onClick={() => setEditing(!editing)} style={{ padding: '0.5rem 1rem', border: '1px solid #0e1a2b', backgroundColor: 'transparent', color: '#0e1a2b', fontSize: '12px', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', cursor: 'pointer', flexShrink: 0 }}>
            {editing ? 'Cancel' : 'Edit Profile'}
          </button>
        </div>

        {/* EDIT FORM */}
        {editing && (
          <div style={{ backgroundColor: '#fff', border: '1px solid #ede8df', padding: '1.5rem', marginBottom: '1.5rem' }}>
            <p style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#9a9085', marginBottom: '1rem' }}>Edit Profile</p>
            <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#4A5563', marginBottom: '0.4rem', letterSpacing: '0.06em', textTransform: 'uppercase' }}>Full Name</label>
                <input style={inp} value={form.full_name} onChange={e => setForm({...form, full_name: e.target.value})} placeholder="Your full name" />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#4A5563', marginBottom: '0.4rem', letterSpacing: '0.06em', textTransform: 'uppercase' }}>Avatar URL (optional)</label>
                <input style={inp} value={form.avatar_url} onChange={e => setForm({...form, avatar_url: e.target.value})} placeholder="https://..." />
                {form.avatar_url && <img src={form.avatar_url} alt="preview" style={{ width: 52, height: 52, borderRadius: '50%', objectFit: 'cover', marginTop: '0.5rem', border: '2px solid #c9b28f' }} />}
              </div>
              <button type="submit" disabled={saving} style={{ padding: '0.875rem', backgroundColor: '#0e1a2b', color: '#f7f4ee', fontWeight: 700, fontSize: '13px', letterSpacing: '0.08em', textTransform: 'uppercase', border: 'none', cursor: 'pointer' }}>
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
              {saved && <p style={{ fontSize: '13px', color: '#2d7a3a', textAlign: 'center' }}>Profile updated.</p>}
            </form>
          </div>
        )}

        {/* ACCOUNT DETAILS */}
        <div style={{ backgroundColor: '#fff', border: '1px solid #ede8df', padding: '1.5rem', marginBottom: '1.5rem' }}>
          <p style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#9a9085', marginBottom: '1rem' }}>Account Details</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px', paddingBottom: '0.75rem', borderBottom: '1px solid #f0ede8' }}>
              <span style={{ color: '#4A5563' }}>Full Name</span>
              <span style={{ color: '#0e1a2b', fontWeight: 500 }}>{profile?.full_name || '—'}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px', paddingBottom: '0.75rem', borderBottom: '1px solid #f0ede8' }}>
              <span style={{ color: '#4A5563' }}>Email</span>
              <span style={{ color: '#0e1a2b', fontWeight: 500 }}>{profile?.email || '—'}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px' }}>
              <span style={{ color: '#4A5563' }}>Newsletter</span>
              <span style={{ color: profile?.newsletter_subscribed ? '#2d7a3a' : '#9a9085', fontWeight: 500 }}>{profile?.newsletter_subscribed ? 'Subscribed' : 'Not subscribed'}</span>
            </div>
          </div>
        </div>

        {/* COMING SOON */}
        <div style={{ backgroundColor: '#fff', border: '1px solid #ede8df', padding: '1.5rem', marginBottom: '1.5rem' }}>
          <p style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#9a9085', marginBottom: '0.5rem' }}>Coming Soon</p>
          <p style={{ fontSize: '13px', color: '#4A5563', margin: 0, lineHeight: 1.6 }}>Saved articles, personalized feed, membership perks, and more — coming soon to The Dude Community.</p>
        </div>

        {/* SIGN OUT */}
        <button onClick={handleSignOut} style={{ width: '100%', padding: '0.875rem', backgroundColor: 'transparent', border: '1px solid rgba(163,45,45,0.4)', color: '#a32d2d', fontWeight: 700, fontSize: '13px', letterSpacing: '0.08em', textTransform: 'uppercase', cursor: 'pointer' }}>
          Sign Out
        </button>
      </div>
    </div>
  )
}
