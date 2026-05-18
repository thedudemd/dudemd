import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const code = searchParams.get('code')
  const state = searchParams.get('state')

  const savedState = request.cookies.get('canva_state')?.value
  const codeVerifier = request.cookies.get('canva_code_verifier')?.value

  if (!code || !state || state !== savedState || !codeVerifier) {
    return NextResponse.redirect(new URL('/admin/articles/new?canva=error', request.url))
  }

  const params = new URLSearchParams({
    grant_type: 'authorization_code',
    code,
    redirect_uri: `${process.env.NEXT_PUBLIC_SITE_URL}/api/canva/callback`,
    client_id: process.env.CANVA_CLIENT_ID!,
    client_secret: process.env.CANVA_CLIENT_SECRET!,
    code_verifier: codeVerifier,
  })

  const tokenRes = await fetch('https://api.canva.com/rest/v1/oauth/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: params.toString(),
  })

  const token = await tokenRes.json()

  if (!token.access_token) {
    return NextResponse.redirect(new URL('/admin/articles/new?canva=error', request.url))
  }

  const response = NextResponse.redirect(new URL('/admin/articles/new?canva=success', request.url))
  response.cookies.set('canva_access_token', token.access_token, { httpOnly: true, maxAge: 3600 })

  return response
}
