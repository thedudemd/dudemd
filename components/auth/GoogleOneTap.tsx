'use client'

import { useEffect } from 'react'
import { createClient } from '@/lib/auth/supabase-auth'

declare global {
  interface Window {
    google?: any
  }
}

export default function GoogleOneTap() {
  useEffect(() => {
    const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID
    if (clientId === undefined) return

    const script = document.createElement('script')
    script.src = 'https://accounts.google.com/gsi/client'
    script.async = true
    script.defer = true
    script.onload = () => {
      if (window.google === undefined) return
      window.google.accounts.id.initialize({
        client_id: clientId,
        callback: async (response: any) => {
          const supabase = createClient()
          const { error } = await supabase.auth.signInWithIdToken({
            provider: 'google',
            token: response.credential,
          })
          if (error === null) window.location.reload()
        },
        auto_select: false,
        cancel_on_tap_outside: true,
      })
      window.google.accounts.id.prompt()
    }
    document.head.appendChild(script)
    return () => { document.head.removeChild(script) }
  }, [])

  return null
}
