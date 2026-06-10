'use client'
import { useEffect } from 'react'

function getAuthFromCookie() {
  if (typeof document === 'undefined') return null
  const match = document.cookie.match(/dudemd-auth=([^;]+)/)
  if (!match) return null
  try {
    const parsed = JSON.parse(decodeURIComponent(match[1]))
    return { uid: parsed?.user?.id, token: parsed?.access_token }
  } catch { return null }
}

export default function SessionTracker() {
  useEffect(() => {
    if (sessionStorage.getItem('dudemd-session-tracked')) return
    const auth = getAuthFromCookie()
    if (!auth?.uid || !auth?.token) return

    const params = new URLSearchParams(window.location.search)
    const referrer = document.referrer || null
    const utm_source = params.get('utm_source')
    const utm_medium = params.get('utm_medium')
    const utm_campaign = params.get('utm_campaign')

    sessionStorage.setItem('dudemd-session-tracked', '1')

    fetch('/api/session/start', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ user_id: auth.uid, token: auth.token, referrer, utm_source, utm_medium, utm_campaign })
    }).catch(() => {})
  }, [])

  return null
}
