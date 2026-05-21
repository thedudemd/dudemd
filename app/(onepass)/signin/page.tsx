'use client'

import { useState } from 'react'
import Image from 'next/image'
import { signInWithGoogle, signInWithApple, signInWithFacebook, signInWithMagicLink } from '@/lib/auth/supabase-auth'

function GoogleIcon() {
  return (
    <svg viewBox="0 0 24 24" className="w-5 h-5 flex-shrink-0" xmlns="http://www.w3.org/2000/svg">
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
    </svg>
  )
}

function AppleIcon() {
  return (
    <svg viewBox="0 0 24 24" className="w-5 h-5 flex-shrink-0" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
      <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
    </svg>
  )
}

function FacebookIcon() {
  return (
    <svg viewBox="0 0 24 24" className="w-5 h-5 flex-shrink-0" fill="#1877F2" xmlns="http://www.w3.org/2000/svg">
      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
    </svg>
  )
}

export default function SignInPage() {
  const [email, setEmail] = useState('')
  const [magicLinkSent, setMagicLinkSent] = useState(false)
  const [loading, setLoading] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  async function handleGoogle() {
    try { setLoading('google'); setError(null); await signInWithGoogle() }
    catch { setError('Google sign-in failed. Please try again.'); setLoading(null) }
  }

  async function handleApple() {
    try { setLoading('apple'); setError(null); await signInWithApple() }
    catch { setError('Apple sign-in is not yet available.'); setLoading(null) }
  }

  async function handleFacebook() {
    try { setLoading('facebook'); setError(null); await signInWithFacebook() }
    catch { setError('Facebook sign-in is not yet available.'); setLoading(null) }
  }

  async function handleMagicLink(e: React.FormEvent) {
    e.preventDefault()
    if (!email) return
    try {
      setLoading('magic'); setError(null)
      await signInWithMagicLink(email)
      setMagicLinkSent(true)
    } catch {
      setError('Could not send magic link. Please try again.')
    } finally {
      setLoading(null)
    }
  }

  return (
    <div className="min-h-screen flex">

      {/* LEFT PANEL */}
      <div
        className="flex flex-col justify-between w-full lg:w-[45%] px-8 py-10 sm:px-12"
        style={{ backgroundColor: '#f7f4ee' }}
      >
        <div />

        <div className="flex flex-col gap-5 max-w-sm w-full mx-auto">

          {/* Sign in heading */}
          <h1
            className="text-3xl font-bold text-center"
            style={{ color: '#0e1a2b', fontFamily: "'League Spartan', sans-serif" }}
          >
            Sign in
          </h1>

          {/* OnePass logo centered below heading */}
          <div className="flex justify-center">
            <Image
              src="/images/onepass-logo.png"
              alt="OnePass"
              width={200}
              height={62}
              className="object-contain"
              priority
            />
          </div>

          <div className="h-px w-full" style={{ backgroundColor: '#d1cfc9' }} />

          {error && (
            <div className="rounded-lg px-4 py-3 text-sm" style={{ backgroundColor: '#fdecea', color: '#a32d2d', border: '1px solid #f09595' }}>
              {error}
            </div>
          )}

          <div className="flex flex-col gap-3">
            <button
              onClick={handleGoogle}
              disabled={loading !== null}
              className="flex items-center justify-center gap-3 w-full py-3 px-4 rounded-lg border text-sm font-medium transition-all hover:shadow-sm active:scale-[0.98] disabled:opacity-60"
              style={{ borderColor: '#d1cfc9', backgroundColor: '#ffffff', color: '#1B1D21' }}
            >
              <GoogleIcon />
              {loading === 'google' ? 'Connecting…' : 'Continue with Google'}
            </button>

            <button
              onClick={handleApple}
              disabled={loading !== null}
              className="flex items-center justify-center gap-3 w-full py-3 px-4 rounded-lg border text-sm font-medium transition-all hover:opacity-90 active:scale-[0.98] disabled:opacity-60"
              style={{ borderColor: '#1B1D21', backgroundColor: '#1B1D21', color: '#f7f4ee' }}
            >
              <AppleIcon />
              {loading === 'apple' ? 'Connecting…' : 'Continue with Apple'}
            </button>

            <button
              onClick={handleFacebook}
              disabled={loading !== null}
              className="flex items-center justify-center gap-3 w-full py-3 px-4 rounded-lg border text-sm font-medium transition-all hover:opacity-90 active:scale-[0.98] disabled:opacity-60"
              style={{ borderColor: '#1877F2', backgroundColor: '#1877F2', color: '#ffffff' }}
            >
              <FacebookIcon />
              {loading === 'facebook' ? 'Connecting…' : 'Continue with Facebook'}
            </button>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex-1 h-px" style={{ backgroundColor: '#d1cfc9' }} />
            <span className="text-xs" style={{ color: '#4A5563' }}>or</span>
            <div className="flex-1 h-px" style={{ backgroundColor: '#d1cfc9' }} />
          </div>

          {magicLinkSent ? (
            <div className="rounded-lg p-4 text-sm text-center" style={{ backgroundColor: '#eef7ee', color: '#2d6a2d', border: '1px solid #b6ddb6' }}>
              ✓ Magic link sent to <strong>{email}</strong> — check your inbox.
            </div>
          ) : (
            <form onSubmit={handleMagicLink} className="flex flex-col gap-3">
              <div className="flex flex-col gap-1.5">
                <label
                  htmlFor="email"
                  className="text-xs font-semibold uppercase"
                  style={{ color: '#4A5563', letterSpacing: '0.12em' }}
                >
                  Email address
                </label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  required
                  className="w-full py-3 px-4 rounded-lg border text-sm outline-none focus:ring-2 focus:ring-[#c9b28f]"
                  style={{ borderColor: '#d1cfc9', backgroundColor: '#ffffff', color: '#0e1a2b' }}
                />
              </div>
              <button
                type="submit"
                disabled={loading !== null || !email}
                className="w-full py-3 px-4 rounded-lg text-sm font-semibold transition-all hover:opacity-90 active:scale-[0.98] disabled:opacity-50"
                style={{ backgroundColor: '#0e1a2b', color: '#f7f4ee' }}
              >
                {loading === 'magic' ? 'Sending…' : 'Send magic link'}
              </button>
            </form>
          )}

          <p className="text-xs text-center leading-relaxed" style={{ color: '#4A5563' }}>
            By signing in you agree to our{' '}
            <a href="/terms" className="underline underline-offset-2 hover:opacity-70 transition-opacity" style={{ color: '#0e1a2b' }}>Terms</a>
            {' '}and{' '}
            <a href="/privacy" className="underline underline-offset-2 hover:opacity-70 transition-opacity" style={{ color: '#0e1a2b' }}>Privacy Policy</a>.
          </p>
        </div>

        <div className="text-xs text-center lg:text-left" style={{ color: '#4A5563' }}>
          © {new Date().getFullYear()} DudeMD. A Rise Media Network publication.
        </div>
      </div>

      {/* RIGHT PANEL */}
      <div style={{width:"55%",position:"relative",overflow:"hidden",minHeight:"calc(100vh - 120px)",backgroundColor:"#0e1a2b"}}>
        <video
          autoPlay
          muted
          loop
          playsInline
          className="absolute inset-0 w-full h-full object-cover object-center"
        >
          <source src="https://res.cloudinary.com/dligiz9tp/video/upload/v1779320683/Modern_Wellness_For_Real_Life_3_dyoo0u.mp4" type="video/mp4" />
        </video>
        <div
          className="absolute inset-0"
          style={{ background: 'linear-gradient(to top, rgba(14,26,43,0.5) 0%, rgba(14,26,43,0.05) 35%, transparent 100%)' }}
        />
      </div>

    </div>
  )
}
