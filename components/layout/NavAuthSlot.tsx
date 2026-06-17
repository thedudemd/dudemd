import Link from 'next/link'
import NotificationBell from '@/components/NotificationBell'
import AvatarButton from './AvatarButton'

// Server component — renders BOTH auth states.
// CSS rules (defined in Nav.tsx) hide/show via html[data-auth-state] attribute set by pre-hydration script.
// Result: correct UI from first paint, no client-side state transition, no layout shift.
export default function NavAuthSlot() {
  return (
    <>
      {/* Logged-out: just a sign-in icon */}
      <Link href="/signin" className="icon-btn auth-out" title="Sign In" aria-label="Sign In">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
        </svg>
      </Link>

      {/* Logged-in: bell + avatar — both server-rendered shells, populate data after */}
      <div className="auth-in" style={{ alignItems: 'center', gap: '0.5rem' }}>
        <NotificationBell />
        <AvatarButton />
      </div>
    </>
  )
}
