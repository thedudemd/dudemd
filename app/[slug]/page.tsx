// @ts-nocheck
import type { Metadata } from 'next'
import Link from 'next/link'
import { createClient } from '@supabase/supabase-js'
import { notFound } from 'next/navigation'

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!)

export const revalidate = 60

async function getPage(slug: string) {
  const { data } = await supabase.from('static_pages').select('*').eq('slug', slug).single()
  return data
}

async function getChildren(parentId: string) {
  const { data } = await supabase.from('static_pages').select('id, title, slug').eq('parent_id', parentId).eq('published', true).order('sort_order')
  return data || []
}

export async function generateMetadata({ params }): Promise<Metadata> {
  const { slug } = await params
  const page = await getPage(slug)
  if (!page) return {}
  return {
    title: page.title,
    description: page.meta_description || '',
    robots: page.indexable === false ? { index: false, follow: false } : { index: true, follow: true },
  }
}

export default async function StaticPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const page = await getPage(slug)
  if (!page) notFound()

  if (!page.published) {
    return (
      <main style={{ minHeight: '70vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#f7f4ee', padding: '4rem 2rem', textAlign: 'center' }}>
        <div>
          <p style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', color: '#c9b28f', marginBottom: '1rem' }}>Coming Soon</p>
          <h1 style={{ fontFamily: 'Georgia, serif', fontSize: '2rem', fontWeight: 700, color: '#0e1a2b', marginBottom: '1rem' }}>{page.title}</h1>
          <p style={{ fontSize: '15px', color: '#4A5563', marginBottom: '2rem' }}>This page is being prepared. Check back soon.</p>
          <Link href="/" style={{ display: 'inline-block', padding: '0.85rem 2rem', backgroundColor: '#0e1a2b', color: '#f7f4ee', textDecoration: 'none', fontWeight: 700, fontSize: '13px', letterSpacing: '0.08em', textTransform: 'uppercase' }}>Return to Home</Link>
        </div>
      </main>
    )
  }

  const children = await getChildren(page.id)

  return (
    <main style={{ minHeight: '70vh', backgroundColor: '#f7f4ee', padding: '3rem 0' }}>
      <div style={{ maxWidth: '740px', margin: '0 auto', padding: '0 1.5rem' }}>
        <article style={{ backgroundColor: '#fff', padding: '3rem', border: '1px solid #ede8df' }}>
          <h1 style={{ fontFamily: 'Georgia, serif', fontSize: 'clamp(1.75rem, 4vw, 2.5rem)', fontWeight: 700, color: '#0e1a2b', marginBottom: '1.5rem' }}>{page.title}</h1>
          {children.length > 0 && (
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '2rem', borderBottom: '1px solid #ede8df', paddingBottom: '1rem' }}>
              <a href={`/${page.slug}`} style={{ padding: '0.5rem 1rem', fontSize: '12px', fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', textDecoration: 'none', backgroundColor: '#0e1a2b', color: '#f7f4ee' }}>{page.title}</a>
              {children.map((child: any) => (
                <a key={child.id} href={`/${child.slug}`} style={{ padding: '0.5rem 1rem', fontSize: '12px', fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', textDecoration: 'none', backgroundColor: '#f7f4ee', color: '#0e1a2b', border: '1px solid #ede8df' }}>{child.title}</a>
              ))}
            </div>
          )}
          <div style={{ fontSize: '16px', color: '#1B1D21', lineHeight: 1.8 }} dangerouslySetInnerHTML={{ __html: page.content || '' }} />
        </article>
      </div>
    </main>
  )
}
