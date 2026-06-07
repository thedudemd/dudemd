'use client'
import { useEffect } from 'react'
import { supabase } from '@/lib/supabase/client'

export default function AuthConfirm() {
  useEffect(() => {
    async function handleSession() {
      // Wait for Supabase to process the URL hash/tokens
      const { data: { session } } = await supabase.auth.getSession()
      if (session) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('onboarding_complete')
          .eq('id', session.user.id)
          .single()
        if (!profile?.onboarding_complete) {
          window.location.href = `/welcome?uid=${session.user.id}`
        } else {
          window.location.href = '/'
        }
      } else {
        // Give it another second for the session to settle
        setTimeout(async () => {
          const { data: { session: session2 } } = await supabase.auth.getSession()
          if (session2) {
            const { data: profile } = await supabase
              .from('profiles')
              .select('onboarding_complete')
              .eq('id', session2.user.id)
              .single()
            if (!profile?.onboarding_complete) {
              window.location.href = `/welcome?uid=${session2.user.id}`
            } else {
              window.location.href = '/'
            }
          } else {
            window.location.href = '/signin?error=auth_failed'
          }
        }, 1500)
      }
    }
    handleSession()
  }, [])

  return (
    <div style={{ minHeight: '100vh', backgroundColor: 'var(--color-cream)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ width: 32, height: 32, border: '3px solid var(--color-gold)', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
      <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
    </div>
  )
}
