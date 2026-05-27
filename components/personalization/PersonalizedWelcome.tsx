'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'

const SUPABASE_URL = 'https://bicljoujevywrkzjeaoy.supabase.co'
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJpY2xqb3VqZXZ5d3JremplYW95Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzg4MDc1ODIsImV4cCI6MjA5NDM4MzU4Mn0.UIKVUyX6QClJmAYdQKg91t_kAT4itpuSk_fIemcPJ0g'

export default function PersonalizedWelcome() {
  const [profile, setProfile] = useState<any>(null)
  const [topCategory, setTopCategory] = useState<string | null>(null)

  useEffect(() => {
    async function load() {
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
        const token = parsed.access_token
        const uid = parsed.user?.id
        if (!token || !uid) return
        const profRes = await fetch(`${SUPABASE_URL}/rest/v1/profiles?select=full_name,avatar_url&id=eq.${uid}&limit=1`, {
          headers: { apikey: SUPABASE_ANON_KEY, Authorization: `Bearer ${token}` }
        })
        const profiles = await profRes.json()
        if (profiles?.[0]) setProfile(profiles[0])
        const scoreRes = await fetch(`${SUPABASE_URL}/rest/v1/user_scores?select=category_scores&user_id=eq.${uid}&limit=1`, {
          headers: { apikey: SUPABASE_ANON_KEY, Authorization: `Bearer ${token}` }
        })
        const scores = await scoreRes.json()
        if (scores?.[0]?.category_scores) {
          const cats = scores[0].category_scores
          const top = Object.entries(cats).sort((a: any, b: any) => b[1] - a[1])[0]
          if (top) setTopCategory(top[0])
        }
      } catch(e) {}
    }
    load()
  }, [])

  if (!profile) return null

  const firstName = profile.full_name?.split(' ')[0] || 'there'
  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening'

  return (
    <div style={{ backgroundColor: '#0e1a2b', borderBottom: '1px solid rgba(201,178,143,0.2)', padding: '0.75rem 0' }}>
      <div className="container-content" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>

          <span style={{ fontSize: '13px', color: '#f7f4ee' }}>
            {greeting}, <strong style={{ color: '#c9b28f' }}>{firstName}</strong>. Welcome back to DudeMD.
          </span>
        </div>
        {topCategory && (
          <Link href={`/category/${topCategory}`} style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#c9b28f', textDecoration: 'none' }}>
            Your Top: {topCategory} →
          </Link>
        )}
      </div>
    </div>
  )
}
