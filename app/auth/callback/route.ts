import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/'
  const error = searchParams.get('error')

  // If there's an error param but also an access_token in the hash,
  // redirect to a client-side handler to process the implicit flow tokens
  if (error && request.url.includes('access_token')) {
    return NextResponse.redirect(`${origin}/auth/confirm${request.url.substring(request.url.indexOf('#'))}`)
  }

  if (code) {
    const cookieStore = await cookies()
    const supabase = createServerClient(
      'https://bicljoujevywrkzjeaoy.supabase.co',
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJpY2xqb3VqZXZ5d3JremplYW95Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzg4MDc1ODIsImV4cCI6MjA5NDM4MzU4Mn0.UIKVUyX6QClJmAYdQKg91t_kAT4itpuSk_fIemcPJ0g',
      {
        cookies: {
          getAll() { return cookieStore.getAll() },
          setAll(cookiesToSet: { name: string; value: string; options?: Record<string, unknown> }[]) {
            cookiesToSet.forEach(({ name, value }) =>
              cookieStore.set(name, value, {
                path: '/',
                sameSite: 'lax',
                secure: true,
                maxAge: 60 * 60 * 24 * 365,
              })
            )
          },
        },
      }
    )

    const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code)
    if (!exchangeError) {
      const { data: { session } } = await supabase.auth.getSession()
      if (session) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('onboarding_complete')
          .eq('id', session.user.id)
          .single()
        if (!profile?.onboarding_complete) {
          return NextResponse.redirect(`${origin}/welcome?uid=${session.user.id}`)
        }
      }
      return NextResponse.redirect(`${origin}${next}`)
    }
  }

  // Handle implicit flow - redirect to client page to process hash tokens
  return NextResponse.redirect(`${origin}/auth/confirm`)
}
