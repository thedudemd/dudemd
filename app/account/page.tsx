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
  const [error, setError] = useState('')

  useEffect(() => {
    const auth = getTokenAndUser()
    if (!auth?.uid) { window.location.href = '/signin'; return }
    fetch(`${SUPABASE_URL}/rest/v1/profiles?select=*&id=eq.${auth.uid}&limit=1`, {
      headers: { apikey: SUPABASE_ANON_KEY, Authorization: `Bearer ${auth.token}` }
    }).then(r => r.json()).then(data => {
      if (data?.[0]) setProfile(data[0])
      else setError('Profile not found')
      setLoading(false)
    }).catch(() => { setError('Failed to load profile'); setLoading(false) })
  }, [])

  if (loading) return (
    <div style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#f7f4ee' }}>
      <div style={{ width: 32, height: 32, border: '3px solid #c9b28f', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
      <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
    </div>
  )

  if (error) return (
    <div style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#f7f4ee' }}>
      <p style={{ color: '#a32d2d' }}>{error}</p>
    </div>
  )

  const firstName = profile?.full_name?.split(' ')[0] || 'Member'

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f7f4ee', fontFamily: 'system-ui, sans-serif' }}>
      <div style={{ maxWidth: '640px', margin: '0 auto', padding: '3rem 1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', marginBottom: '2.5rem', paddingBottom: '2.5rem', borderBottom: '1px solid #ede8df' }}>
          {profile?.avatar_url ? (
            <img src={profile.avatar_url} alt={firstName} style={{ width: '72px', height: '72px', borderRadius: '50%', objectFit: 'cover', border: '3px solid #c9b28f' }} />
          ) : (
            <div style={{ width: '72px', height: '72px', borderRadius: '50%', backgroundColor: '#0e1a2b', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '28px', fontWeight: 700, color: '#c9b28f', flexShrink: 0 }}>
              {firstName.charAt(0).toUpperCase()}
            </div>
          )}
          <div>
            <h1 style={{ fontSize: '24px', fontWeight: 700, color: '#0e1a2b', margin: '0 0 0.25rem' }}>{profile?.full_name || firstName}</h1>
            <p style={{ fontSize: '13px', color: '#4A5563', margin: 0 }}>{profile?.email}</p>
            <p style={{ fontSize: '11px', color: '#9a9085', margin: '0.25rem 0 0', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Member since {new Date(profile?.created_at).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</p>
          </div>
        </div>

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
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px', paddingBottom: '0.75rem', borderBottom: '1px solid #f0ede8' }}>
              <span style={{ color: '#4A5563' }}>Sign in method</span>
              <span style={{ color: '#0e1a2b', fontWeight: 500, textTransform: 'capitalize' }}>{profile?.provider || '—'}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px' }}>
              <span style={{ color: '#4A5563' }}>Newsletter</span>
              <span style={{ color: profile?.newsletter_subscribed ? '#2d7a3a' : '#9a9085', fontWeight: 500 }}>{profile?.newsletter_subscribed ? 'Subscribed' : 'Not subscribed'}</span>
            </div>
          </div>
        </div>

        <div style={{ backgroundColor: '#fff', border: '1px solid #ede8df', padding: '1.5rem' }}>
          <p style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#9a9085', marginBottom: '0.5rem' }}>Coming Soon</p>
          <p style={{ fontSize: '13px', color: '#4A5563', margin: 0, lineHeight: 1.6 }}>Saved articles, personalized feed, membership perks, and more — coming soon to The Dude Community.</p>
        </div>
      </div>
    </div>
  )
}