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
      const p0 = jar['sb-bicljoujevywrkzjeaoy-auth-token.0'] || ''
      const p1 = jar['sb-bicljoujevywrkzjeaoy-auth-token.1'] || ''
      raw = p0.replace('base64-', '') + decodeURIComponent(p1)
    }
    const parsed = JSON.parse(atob(raw))
    return { token: parsed.access_token, uid: parsed.user?.id }
  } catch {}
  return null
}

export default function AccountPage() {
  const [profile, setProfile] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [auth, setAuth] = useState<any>(null)
  const [fullName, setFullName] = useState('')
  const [avatarUrl, setAvatarUrl] = useState('')
  const [uploading, setUploading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [deleteInput, setDeleteInput] = useState('')
  const [showDelete, setShowDelete] = useState(false)
  const [deleting, setDeleting] = useState(false)

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
      }
      setLoading(false)
    }).catch(() => setLoading(false))
  }, [])

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

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    await fetch(`${SUPABASE_URL}/rest/v1/profiles?id=eq.${auth.uid}`, {
      method: 'PATCH',
      headers: { apikey: SUPABASE_ANON_KEY, Authorization: `Bearer ${auth.token}`, 'Content-Type': 'application/json', Prefer: 'return=minimal' },
      body: JSON.stringify({ full_name: fullName, avatar_url: avatarUrl })
    })
    setProfile({ ...profile, full_name: fullName, avatar_url: avatarUrl })
    setSaving(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 3000)
  }

  async function handleUnsubscribe() {
    await fetch(`${SUPABASE_URL}/rest/v1/profiles?id=eq.${auth.uid}`, {
      method: 'PATCH',
      headers: { apikey: SUPABASE_ANON_KEY, Authorization: `Bearer ${auth.token}`, 'Content-Type': 'application/json', Prefer: 'return=minimal' },
      body: JSON.stringify({ newsletter_subscribed: false })
    })
    await fetch(`${SUPABASE_URL}/rest/v1/subscribers?email=eq.${profile.email}`, {
      method: 'PATCH',
      headers: { apikey: SUPABASE_ANON_KEY, Authorization: `Bearer ${auth.token}`, 'Content-Type': 'application/json', Prefer: 'return=minimal' },
      body: JSON.stringify({ unsubscribed: true })
    })
    setProfile({ ...profile, newsletter_subscribed: false })
  }

  async function handleResubscribe() {
    await fetch(`${SUPABASE_URL}/rest/v1/profiles?id=eq.${auth.uid}`, {
      method: 'PATCH',
      headers: { apikey: SUPABASE_ANON_KEY, Authorization: `Bearer ${auth.token}`, 'Content-Type': 'application/json', Prefer: 'return=minimal' },
      body: JSON.stringify({ newsletter_subscribed: true })
    })
    await fetch(`${SUPABASE_URL}/rest/v1/subscribers?email=eq.${profile.email}`, {
      method: 'PATCH',
      headers: { apikey: SUPABASE_ANON_KEY, Authorization: `Bearer ${auth.token}`, 'Content-Type': 'application/json', Prefer: 'return=minimal' },
      body: JSON.stringify({ unsubscribed: false })
    })
    setProfile({ ...profile, newsletter_subscribed: true })
  }

  async function handleDeleteAccount() {
    if (deleteInput !== 'DELETE') return
    setDeleting(true)
    await fetch(`${SUPABASE_URL}/rest/v1/subscribers?email=eq.${profile.email}`, {
      method: 'DELETE',
      headers: { apikey: SUPABASE_ANON_KEY, Authorization: `Bearer ${auth.token}` }
    })
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
  const inp: any = { width: '100%', padding: '0.85rem', border: '1px solid var(--color-border)', fontSize: '15px', outline: 'none', boxSizing: 'border-box', backgroundColor: '#fff', fontFamily: 'inherit', color: 'var(--color-navy)' }
  const sectionTitle: any = { fontSize: '11px', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#9a9085', marginBottom: '1.25rem' }
  const card: any = { backgroundColor: '#fff', border: '1px solid var(--color-border)', padding: '1.5rem', marginBottom: '1.5rem' }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: 'var(--color-cream)' }}>
      <div style={{ maxWidth: '560px', margin: '0 auto', padding: '3rem 1.5rem' }}>

        {/* AVATAR + NAME HEADER */}
        <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
          <div style={{ position: 'relative', display: 'inline-block', marginBottom: '1rem' }}>
            {avatarUrl ? (
              <img src={avatarUrl} alt={firstName} style={{ width: 90, height: 90, borderRadius: '50%', objectFit: 'cover', border: '3px solid var(--color-gold)' }} />
            ) : (
              <div style={{ width: 90, height: 90, borderRadius: '50%', backgroundColor: 'var(--color-navy)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 36, fontWeight: 700, color: 'var(--color-gold)' }}>
                {firstName.charAt(0).toUpperCase()}
              </div>
            )}
          </div>
          <h1 style={{ fontFamily: 'Georgia, serif', fontSize: '1.5rem', fontWeight: 700, color: 'var(--color-navy)', margin: '0 0 0.25rem' }}>{fullName || firstName}</h1>
          <p style={{ fontSize: '13px', color: '#9a9085', margin: 0 }}>{profile?.email}</p>
        </div>

        {/* EDIT PROFILE */}
        <div style={card}>
          <p style={sectionTitle}>Edit Profile</p>
          <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--color-slate)', marginBottom: '0.4rem' }}>Full Name</label>
              <input style={inp} value={fullName} onChange={e => setFullName(e.target.value)} placeholder="Your full name" />
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
            <button type="submit" disabled={saving} style={{ padding: '0.875rem', backgroundColor: 'var(--color-navy)', color: 'var(--color-cream)', fontWeight: 700, fontSize: '13px', letterSpacing: '0.08em', textTransform: 'uppercase', border: 'none', cursor: 'pointer', marginTop: '0.5rem' }}>
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
            {saved && <p style={{ fontSize: '13px', color: '#2d7a3a', textAlign: 'center', margin: 0 }}>✓ Profile updated successfully.</p>}
          </form>
        </div>

        {/* NEWSLETTER */}
        <div style={card}>
          <p style={sectionTitle}>Newsletter</p>
          {profile?.newsletter_subscribed !== false ? (
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <p style={{ fontSize: '14px', fontWeight: 600, color: 'var(--color-navy)', margin: '0 0 0.25rem' }}>You're subscribed ✓</p>
                <p style={{ fontSize: '12px', color: '#9a9085', margin: 0 }}>Weekly men's wellness delivered to your inbox.</p>
              </div>
              <button onClick={handleUnsubscribe} style={{ padding: '0.5rem 1rem', border: '1px solid #a32d2d', backgroundColor: '#fff', color: '#a32d2d', fontSize: '12px', fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', cursor: 'pointer', flexShrink: 0 }}>
                Unsubscribe
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <p style={{ fontSize: '14px', fontWeight: 600, color: '#9a9085', margin: '0 0 0.25rem' }}>Not subscribed</p>
                <p style={{ fontSize: '12px', color: '#9a9085', margin: 0 }}>Want weekly men's wellness in your inbox?</p>
              </div>
              <button onClick={handleResubscribe} style={{ padding: '0.5rem 1rem', border: '1px solid var(--color-navy)', backgroundColor: 'var(--color-navy)', color: 'var(--color-cream)', fontSize: '12px', fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', cursor: 'pointer', flexShrink: 0 }}>
                Subscribe
              </button>
            </div>
          )}
        </div>

        {/* SIGN OUT */}
        <button onClick={handleSignOut} style={{ width: '100%', padding: '0.875rem', backgroundColor: 'transparent', border: '1px solid var(--color-navy)', color: 'var(--color-navy)', fontWeight: 700, fontSize: '13px', letterSpacing: '0.08em', textTransform: 'uppercase', cursor: 'pointer', marginBottom: '1rem' }}>
          Sign Out
        </button>

        {/* DELETE ACCOUNT */}
        {!showDelete ? (
          <button onClick={() => setShowDelete(true)} style={{ width: '100%', padding: '0.5rem', backgroundColor: 'transparent', border: 'none', color: '#9a9085', fontSize: '12px', cursor: 'pointer', textDecoration: 'underline' }}>
            Delete My Account
          </button>
        ) : (
          <div style={{ ...card, border: '1px solid #a32d2d' }}>
            <p style={{ fontSize: '14px', fontWeight: 700, color: '#a32d2d', marginBottom: '0.5rem' }}>⚠️ Delete Account</p>
            <p style={{ fontSize: '13px', color: 'var(--color-slate)', marginBottom: '1.25rem', lineHeight: 1.6 }}>This permanently deletes your account and removes you from our newsletter. This cannot be undone.</p>
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
    </div>
  )
}
