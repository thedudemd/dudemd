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
    if (!clientId) return

    async function generateNonce(): Promise<[string, string]> {
      const nonce = btoa(String.fromCharCode(...crypto.getRandomValues(new Uint8Array(32))))
      const encoder = new TextEncoder()
      const encodedNonce = encoder.encode(nonce)
      const hashBuffer = await crypto.subtle.digest('SHA-256', encodedNonce)
      const hashArray = Array.from(new Uint8Array(hashBuffer))
      const hashedNonce = hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
      return [nonce, hashedNonce]
    }

    async function init() {
      const supabase = createClient()
      const { data: { session } } = await supabase.auth.getSession()
      if (session) return

      const [nonce, hashedNonce] = await generateNonce()

      const script = document.createElement('script')
      script.src = 'https://accounts.google.com/gsi/client'
      script.async = true
      script.defer = true
      script.onload = () => {
        if (!window.google) return
        window.google.accounts.id.initialize({
          client_id: clientId,
          callback: async (response: any) => {
            const { error } = await supabase.auth.signInWithIdToken({
              provider: 'google',
              token: response.credential,
              nonce,
            })
            if (!error) window.location.reload()
          },
          nonce: hashedNonce,
          use_fedcm_for_prompt: true,
          auto_select: false,
          cancel_on_tap_outside: false,
          context: 'signin',
          itp_support: true,
        })
        window.google.accounts.id.prompt()
      }
      document.head.appendChild(script)
    }

    init()
  }, [])

  return null
}
