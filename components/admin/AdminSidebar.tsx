'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase/client'

const nav = [
  {
    group: 'Overview',
    items: [
      { label: 'Dashboard', href: '/admin', icon: '◈', exact: true },
    ]
  },
  {
    group: 'Content',
    items: [
      { label: 'Articles', href: '/admin/articles', icon: '▤' },
      { label: 'Media Library', href: '/admin/media', icon: '⊞' },
      { label: 'Categories', href: '/admin/categories', icon: '◉' },
      { label: 'Pages', href: '/admin/pages', icon: '☷' },
      { label: 'Comments', href: '/admin/comments', icon: '◎', soon: true },
    ]
  },
  {
    group: 'Audience',
    items: [
      { label: 'Audience', href: '/admin/audience', icon: '⊙' },
      { label: 'Subscribers', href: '/admin/subscribers', icon: '◈' },
      { label: 'Analytics', href: '/admin/analytics', icon: '▲' },
      { label: 'Newsletter', href: '/admin/newsletter', icon: '◻' },
      { label: 'Affiliates', href: '/admin/affiliates', icon: '◆' },
      { label: 'System Emails', href: '/admin/system-emails', icon: '✉' },
      { label: 'Opt-in Designer', href: '/admin/newsletter-optins', icon: '◫' },
    ]
  },
  {
    group: 'Monetization',
    items: [
      { label: 'Membership', href: '/admin/membership', icon: '◆', soon: true },
      { label: 'Ad Manager', href: '/admin/ads', icon: '⬡', soon: true },
      { label: 'Sponsorships', href: '/admin/sponsorships', icon: '◇', soon: true },
      { label: 'Affiliate', href: '/admin/affiliate', icon: '⊕', soon: true },
    ]
  },
  {
    group: 'AI & SEO',
    items: [
      { label: 'AI Scoring', href: '/admin/ai-scoring', icon: '⬡', soon: true },
      { label: 'AEO Dashboard', href: '/admin/aeo', icon: '◈', soon: true },
      { label: 'Keyword Tracker', href: '/admin/keywords', icon: '▦', soon: true },
      { label: 'Internal Links', href: '/admin/links', icon: '⊗', soon: true },
    ]
  },
  {
    group: 'Social',
    items: [
      { label: 'Facebook', href: '/admin/facebook', icon: '◉', soon: true },
      { label: 'Social Scheduler', href: '/admin/social', icon: '◎', soon: true },
    ]
  },
  {
    group: 'Platform',
    items: [
      { label: 'Feature Controls', href: '/admin/flags', icon: '⊛' },
      { label: 'Launch Center', href: '/admin/launch', icon: '🚀' },
      { label: 'Writers & Roles', href: '/admin/writers', icon: '◈' },
      { label: 'Authors', href: '/admin/authors', icon: '◎' },
      { label: 'Settings', href: '/admin/settings', icon: '◎' },
      { label: 'Audit Log', href: '/admin/audit', icon: '▤', soon: true },
    ]
  },
]

export default function AdminSidebar({ role }: { role: string }) {
  const pathname = usePathname()
  const router = useRouter()
  const [collapsed, setCollapsed] = useState(false)
  const [user, setUser] = useState<any>(null)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) setUser(session.user)
    })
  }, [])

  const isActive = (href: string, exact?: boolean) => {
    if (exact) return pathname === href
    return pathname.startsWith(href) && href !== '/admin'
  }

  async function handleLogout() {
    await supabase.auth.signOut()
    router.push('/admin/login')
  }

  const isAdmin = role === 'super_admin' || role === 'editorial_chief_admin'

  return (
    <aside style={{
      width: collapsed ? '60px' : '232px',
      minHeight: '100vh',
      backgroundColor: '#0B1A2F',
      display: 'flex',
      flexDirection: 'column',
      flexShrink: 0,
      transition: 'width 0.2s ease',
      position: 'sticky',
      top: 0,
      height: '100vh',
      overflowY: 'auto',
      overflowX: 'hidden',
      scrollbarWidth: 'thin',
      scrollbarColor: 'rgba(201,178,143,0.15) transparent',
      zIndex: 50,
    }}>

      <div style={{
        padding: collapsed ? '1.25rem 0' : '1.25rem 1.125rem',
        borderBottom: '1px solid rgba(247,244,238,0.06)',
        display: 'flex', alignItems: 'center',
        justifyContent: collapsed ? 'center' : 'space-between',
        flexShrink: 0
      }}>
        {!collapsed && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <img src="/dude-md.svg" alt="DudeMD" style={{ height: '24px', width: 'auto', filter: 'brightness(0) saturate(100%) invert(78%) sepia(28%) saturate(500%) hue-rotate(5deg) brightness(95%) contrast(90%)' }} />
            <span style={{ fontSize: '9px', fontWeight: 800, letterSpacing: '0.16em', textTransform: 'uppercase', color: 'rgba(201,178,143,0.5)', whiteSpace: 'nowrap' }}>Control Center</span>
          </div>
        )}
        <button
          onClick={() => setCollapsed(!collapsed)}
          style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(247,244,238,0.3)', fontSize: '12px', padding: '0.25rem', flexShrink: 0, lineHeight: 1 }}
        >
          {collapsed ? '▶' : '◀'}
        </button>
      </div>

      <nav style={{ flex: 1, padding: '0.5rem 0', overflowY: 'auto', overflowX: 'hidden' }}>
        {nav.map(({ group, items }) => {
          const visibleItems = items.filter(item => {
            if (!isAdmin && ['Feature Controls', 'Writers & Roles', 'Settings', 'Audit Log'].includes(item.label)) return false
            return true
          })
          if (visibleItems.length === 0) return null
          return (
            <div key={group} style={{ marginBottom: '0.125rem' }}>
              {!collapsed && (
                <div style={{
                  fontSize: '9px', fontWeight: 800, letterSpacing: '0.18em',
                  textTransform: 'uppercase', color: 'rgba(247,244,238,0.2)',
                  padding: '0.875rem 1.125rem 0.3rem'
                }}>
                  {group}
                </div>
              )}
              {collapsed && <div style={{ height: '0.5rem' }} />}
              {visibleItems.map(item => {
                const active = isActive(item.href, (item as any).exact)
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    title={item.label}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.625rem',
                      padding: collapsed ? '0.55rem 0' : '0.45rem 1.125rem',
                      justifyContent: collapsed ? 'center' : 'flex-start',
                      textDecoration: 'none',
                      backgroundColor: active ? 'rgba(201,178,143,0.08)' : 'transparent',
                      borderLeft: active ? '2px solid #c9b28f' : '2px solid transparent',
                      opacity: (item as any).soon && !active ? 0.4 : 1,
                    }}
                  >
                    <span style={{ fontSize: '12px', color: active ? '#c9b28f' : 'rgba(247,244,238,0.45)', flexShrink: 0, lineHeight: 1 }}>{item.icon}</span>
                    {!collapsed && (
                      <span style={{ fontSize: '12.5px', fontWeight: active ? 600 : 400, color: active ? '#f7f4ee' : 'rgba(247,244,238,0.5)', whiteSpace: 'nowrap' }}>
                        {item.label}
                        {(item as any).soon && <span style={{ fontSize: '9px', marginLeft: '0.4rem', color: 'rgba(247,244,238,0.2)', fontWeight: 400 }}>soon</span>}
                      </span>
                    )}
                  </Link>
                )
              })}
            </div>
          )
        })}
      </nav>

      {!collapsed && (
        <div style={{ padding: '0.75rem 1.125rem', borderTop: '1px solid rgba(247,244,238,0.06)' }}>
          <a href="/" target="_blank" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', textDecoration: 'none', opacity: 0.3 }}
            onMouseEnter={e => (e.currentTarget.style.opacity = '0.7')}
            onMouseLeave={e => (e.currentTarget.style.opacity = '0.3')}
          >
            <span style={{ fontSize: '11px', color: '#f7f4ee' }}>↗</span>
            <span style={{ fontSize: '11px', color: '#f7f4ee', fontWeight: 500 }}>dudemd.com</span>
          </a>
        </div>
      )}

      <div style={{
        padding: collapsed ? '1rem 0' : '1rem 1.125rem',
        borderTop: '1px solid rgba(247,244,238,0.06)',
        display: 'flex', alignItems: 'center', gap: '0.625rem',
        justifyContent: collapsed ? 'center' : 'flex-start',
        flexShrink: 0
      }}>
        <div style={{
          width: '28px', height: '28px', borderRadius: '50%',
          backgroundColor: 'rgba(201,178,143,0.12)',
          border: '1px solid rgba(201,178,143,0.25)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
        }}>
          <span style={{ fontSize: '11px', fontWeight: 700, color: '#c9b28f' }}>{user?.email?.charAt(0)?.toUpperCase() || 'A'}</span>
        </div>
        {!collapsed && (
          <div style={{ flex: 1, minWidth: 0 }}>
            <p style={{ fontSize: '11px', color: '#f7f4ee', margin: 0, fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user?.email}</p>
            <p style={{ fontSize: '9px', color: 'rgba(247,244,238,0.3)', margin: 0, textTransform: 'uppercase', letterSpacing: '0.1em' }}>{role?.replace(/_/g, ' ')}</p>
          </div>
        )}
        {!collapsed && (
          <button onClick={handleLogout} title="Sign out" style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(247,244,238,0.25)', fontSize: '13px', flexShrink: 0, padding: 0 }}>⏻</button>
        )}
      </div>
    </aside>
  )
}
