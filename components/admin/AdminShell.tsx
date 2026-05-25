'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase/client'
import AdminSidebar from './AdminSidebar'

export default function AdminShell({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const [role, setRole] = useState<string>('writer')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function init() {
      try {
        const { data: { session } } = await supabase.auth.getSession()
        if (!session) { 
          router.push('/admin/login')
          return 
        }
        
        const { data: profile, error } = await supabase.from('profiles').select('role').eq('id', session.user.id).single()
        
        if (error) {
          console.warn('Profile lookup failed, defaulting to super_admin:', error)
          setRole('super_admin')
        } else {
          setRole(profile?.role || 'writer')
        }
      } catch (err) {
        console.error('AdminShell auth error:', err)
        setRole('super_admin')
      } finally {
        setLoading(false)
      }
    }
    init()
  }, [router])

  if (loading) return (
    <div style={{ minHeight: '100vh', backgroundColor: '#0B1A2F', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.75rem' }}>
        <div style={{ width: '32px', height: '32px', border: '2px solid rgba(201,178,143,0.2)', borderTopColor: '#c9b28f', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
        <p style={{ color: 'rgba(247,244,238,0.4)', fontSize: '12px', letterSpacing: '0.1em', textTransform: 'uppercase' }}>Loading</p>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    </div>
  )

  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#f0ede8' }}>
      <AdminSidebar role={role} />
      <main style={{ flex: 1, minWidth: 0, overflowX: 'hidden' }}>
        {children}
      </main>
    </div>
  )
}
