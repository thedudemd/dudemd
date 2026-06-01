import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const query = searchParams.get('query')
  const action = searchParams.get('action')
  const downloadUrl = searchParams.get('downloadUrl')

  if (action === 'download' && downloadUrl) {
    await fetch(`${downloadUrl}?client_id=${process.env.UNSPLASH_ACCESS_KEY}`)
    return NextResponse.json({ ok: true })
  }

  if (!query) return NextResponse.json({ results: [] })

  const res = await fetch(
    `https://api.unsplash.com/search/photos?query=${encodeURIComponent(query)}&per_page=12&orientation=landscape`,
    { headers: { Authorization: `Client-ID ${process.env.UNSPLASH_ACCESS_KEY}` } }
  )

  if (!res.ok) return NextResponse.json({ results: [] }, { status: res.status })

  const data = await res.json()

  const results = data.results.map((photo: any) => ({
    id: photo.id,
    url: photo.urls.regular,
    thumb: photo.urls.small,
    description: photo.description || photo.alt_description || '',
    alt_description: photo.alt_description || '',
    photographer: photo.user.name,
    photographer_url: `${photo.user.links.html}?utm_source=dudemd&utm_medium=referral`,
    unsplash_url: `https://unsplash.com?utm_source=dudemd&utm_medium=referral`,
    download_url: photo.links.download_location,
  }))

  return NextResponse.json({ results })
}
