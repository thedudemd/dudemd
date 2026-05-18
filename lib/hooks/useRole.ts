import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase/client'

export type Role = 'super_admin' | 'editor' | 'writer' | 'contributor' | null

export function useRole() {
  const [role, setRole] = useState<Role>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function getRole() {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) { setLoading(false); return }
      const { data } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', session.user.id)
        .single()
      setRole(data?.role || null)
      setLoading(false)
    }
    getRole()
  }, [])

  return { role, loading, isAdmin: role === 'super_admin', isEditor: role === 'editor' || role === 'super_admin' }
}
