import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const token = request.cookies.get('canva_access_token')?.value

  if (!token) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
  }

  const res = await fetch('https://api.canva.com/rest/v1/designs?limit=20', {
    headers: { Authorization: `Bearer ${token}` },
  })

  const data = await res.json()
  return NextResponse.json(data)
}
