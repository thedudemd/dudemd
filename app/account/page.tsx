'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/auth/supabase-auth'

export default function AccountPage() {
  const router = useRouter()
  const [profile, setProfile] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/signin'); return }
      const { data } = await supabase.from('profiles').select('*').eq('id', user.id).single()
      setProfile(data)
      setLoading(false)
    }
    load()
  }, [])

  if (loading) return (
    <div style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#f7f4ee' }}>
      <div style={{ width: 32, height: 32, border: '3px solid #c9b28f', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
      <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
    </div>
  )

  const firstName = profile?.full_name?.split(' ')[0] || 'Member'

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f7f4ee', fontFamily: 'system-ui, sans-serif' }}>
      <div style={{ maxWidth: '640px', margin: '0 auto', padding: '3rem 1.5rem' }}>

        {/* HEADER */}
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

        {/* DETAILS */}
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

        {/* MORE COMING */}
        <div style={{ backgroundColor: '#fff', border: '1px solid #ede8df', padding: '1.5rem', marginBottom: '2rem' }}>
          <p style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#9a9085', marginBottom: '0.5rem' }}>Coming Soon</p>
          <p style={{ fontSize: '13px', color: '#4A5563', margin: 0, lineHeight: 1.6 }}>Saved articles, personalized feed, membership perks, and more — coming soon to The Dude Community.</p>
        </div>

      </div>
    </div>
  )
}