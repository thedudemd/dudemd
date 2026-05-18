import { NextResponse } from 'next/server'
import { createHash, randomBytes } from 'crypto'

export async function GET() {
  const state = randomBytes(16).toString('hex')
  const codeVerifier = randomBytes(32).toString('hex')
  const codeChallenge = createHash('sha256').update(codeVerifier).digest('base64url')

  const params = new URLSearchParams({
    code_challenge_method: 's256',
    response_type: 'code',
    client_id: process.env.CANVA_CLIENT_ID!,
    code_challenge: codeChallenge,
    state,
  })

  const response = NextResponse.redirect(
    `https://www.canva.com/api/oauth/authorize?${params.toString()}`
  )

  response.cookies.set('canva_code_verifier', codeVerifier, { httpOnly: true, maxAge: 300 })
  response.cookies.set('canva_state', state, { httpOnly: true, maxAge: 300 })

  return response
}
