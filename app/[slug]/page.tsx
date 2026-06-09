// @ts-nocheck
import type { Metadata } from 'next'
import Link from 'next/link'
import { createClient } from '@supabase/supabase-js'
import { notFound } from 'next/navigation'
import ContactPage from '@/components/ContactPage'

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

function BlockRenderer({ blocks }: { blocks: any[] }) {
  if (!blocks || blocks.length === 0) return null

  return (
    <>
      {blocks.map((block: any, i: number) => {

        if (block.type === 'hero') {
          const hasBg = block.image_url && block.image_url.trim()
          return (
            <div key={i} style={{
              position: 'relative',
              width: '100%',
              padding: '5rem 2rem',
              backgroundColor: block.bg_color || '#0e1a2b',
              backgroundImage: hasBg ? `url(${block.image_url})` : undefined,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              textAlign: 'center',
              overflow: 'hidden',
            }}>
              {hasBg && <div style={{ position: 'absolute', inset: 0, backgroundColor: 'rgba(14,26,43,0.65)' }} />}
              <div style={{ position: 'relative', zIndex: 1, maxWidth: '800px', margin: '0 auto' }}>
                {block.headline && <h1 style={{ fontFamily: 'Georgia, serif', fontSize: 'clamp(2rem, 5vw, 3.5rem)', fontWeight: 700, color: block.text_color || '#f7f4ee', lineHeight: 1.15, marginBottom: '1.25rem' }}>{block.headline}</h1>}
                {block.subheadline && <p style={{ fontSize: 'clamp(1rem, 2.5vw, 1.25rem)', color: block.text_color ? block.text_color + 'cc' : 'rgba(247,244,238,0.8)', lineHeight: 1.6, marginBottom: block.cta_text ? '2rem' : 0 }}>{block.subheadline}</p>}
                {block.cta_text && block.cta_url && (
                  <Link href={block.cta_url} style={{ display: 'inline-block', padding: '0.9rem 2.5rem', backgroundColor: '#c9b28f', color: '#0e1a2b', fontWeight: 700, fontSize: '13px', letterSpacing: '0.1em', textTransform: 'uppercase', textDecoration: 'none' }}>{block.cta_text}</Link>
                )}
              </div>
            </div>
          )
        }

        if (block.type === 'two_column') {
          const imageFirst = block.image_side === 'left'
          const imgEl = block.image_url ? (
            <div style={{ flex: 1, minWidth: 0 }}>
              <img src={block.image_url} alt={block.headline || ''} style={{ width: '100%', height: '100%', minHeight: '300px', objectFit: 'cover', display: 'block' }} />
            </div>
          ) : null
          const textEl = (
            <div style={{ flex: 1, minWidth: 0, padding: '3rem', display: 'flex', flexDirection: 'column', justifyContent: 'center', backgroundColor: '#fff' }}>
              {block.headline && <h2 style={{ fontFamily: 'Georgia, serif', fontSize: 'clamp(1.5rem, 3vw, 2.25rem)', fontWeight: 700, color: '#0e1a2b', lineHeight: 1.2, marginBottom: '1rem' }}>{block.headline}</h2>}
              {block.body && <p style={{ fontSize: '16px', color: '#4A5563', lineHeight: 1.75, marginBottom: block.cta_text ? '1.5rem' : 0 }}>{block.body}</p>}
              {block.cta_text && block.cta_url && (
                <Link href={block.cta_url} style={{ alignSelf: 'flex-start', padding: '0.75rem 1.75rem', backgroundColor: '#0e1a2b', color: '#f7f4ee', fontWeight: 700, fontSize: '12px', letterSpacing: '0.1em', textTransform: 'uppercase', textDecoration: 'none' }}>{block.cta_text}</Link>
              )}
            </div>
          )
          return (
            <div key={i} style={{ display: 'flex', flexWrap: 'wrap', minHeight: '400px' }}>
              {imageFirst ? <>{imgEl}{textEl}</> : <>{textEl}{imgEl}</>}
            </div>
          )
        }

        if (block.type === 'team_cards') {
          return (
            <div key={i} style={{ padding: '4rem 2rem', backgroundColor: '#f7f4ee' }}>
              <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
                {block.headline && <h2 style={{ fontFamily: 'Georgia, serif', fontSize: 'clamp(1.5rem, 3vw, 2rem)', fontWeight: 700, color: '#0e1a2b', textAlign: 'center', marginBottom: '3rem' }}>{block.headline}</h2>}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '2rem' }}>
                  {(block.members || []).map((m: any, j: number) => (
                    <div key={j} style={{ backgroundColor: '#fff', border: '1px solid #e8e4de', overflow: 'hidden' }}>
                      {m.photo_url && <img src={m.photo_url} alt={m.name} style={{ width: '100%', aspectRatio: '1/1', objectFit: 'cover', display: 'block' }} />}
                      <div style={{ padding: '1.25rem' }}>
                        {m.name && <p style={{ fontSize: '15px', fontWeight: 700, color: '#0e1a2b', margin: '0 0 0.25rem' }}>{m.name}</p>}
                        {m.title && <p style={{ fontSize: '12px', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#c9b28f', margin: '0 0 0.75rem' }}>{m.title}</p>}
                        {m.bio && <p style={{ fontSize: '13px', color: '#4A5563', lineHeight: 1.6, margin: 0 }}>{m.bio}</p>}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )
        }

        if (block.type === 'stats') {
          return (
            <div key={i} style={{ padding: '4rem 2rem', backgroundColor: '#0e1a2b' }}>
              <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
                {block.headline && <h2 style={{ fontFamily: 'Georgia, serif', fontSize: 'clamp(1.25rem, 2.5vw, 1.75rem)', fontWeight: 700, color: '#f7f4ee', textAlign: 'center', marginBottom: '2.5rem' }}>{block.headline}</h2>}
                <div style={{ display: 'grid', gridTemplateColumns: `repeat(${Math.min(block.stats?.length || 1, 4)}, 1fr)`, gap: '2rem', textAlign: 'center' }}>
                  {(block.stats || []).map((s: any, j: number) => (
                    <div key={j}>
                      <p style={{ fontFamily: 'Georgia, serif', fontSize: 'clamp(2rem, 5vw, 3.5rem)', fontWeight: 700, color: '#c9b28f', margin: '0 0 0.5rem', lineHeight: 1 }}>{s.number}</p>
                      <p style={{ fontSize: '13px', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'rgba(247,244,238,0.7)', margin: 0 }}>{s.label}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )
        }

        if (block.type === 'mission') {
          return (
            <div key={i} style={{ padding: '4rem 2rem', backgroundColor: '#fff' }}>
              <div style={{ maxWidth: '740px', margin: '0 auto', borderLeft: `4px solid ${block.accent_color || '#c9b28f'}`, paddingLeft: '2rem' }}>
                {block.headline && <h2 style={{ fontFamily: 'Georgia, serif', fontSize: 'clamp(1.5rem, 3vw, 2rem)', fontWeight: 700, color: '#0e1a2b', marginBottom: '1.25rem' }}>{block.headline}</h2>}
                {block.body && <p style={{ fontSize: '18px', color: '#4A5563', lineHeight: 1.8 }}>{block.body}</p>}
              </div>
            </div>
          )
        }

        return null
      })}
    </>
  )
}

export default async function StaticPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const page = await getPage(slug)
  if (!page) notFound()

  if (!page.published) {
    return (
      <main style={{ minHeight: '70vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'var(--color-cream)', padding: '4rem 2rem', textAlign: 'center' }}>
        <div>
          <p style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--color-gold)', marginBottom: '1rem' }}>Coming Soon</p>
          <h1 style={{ fontFamily: 'Georgia, serif', fontSize: '2rem', fontWeight: 700, color: 'var(--color-navy)', marginBottom: '1rem' }}>{page.title}</h1>
          <p style={{ fontSize: '15px', color: 'var(--color-slate)', marginBottom: '2rem' }}>This page is being prepared. Check back soon.</p>
          <Link href="/" style={{ display: 'inline-block', padding: '0.85rem 2rem', backgroundColor: 'var(--color-navy)', color: 'var(--color-cream)', textDecoration: 'none', fontWeight: 700, fontSize: '13px', letterSpacing: '0.08em', textTransform: 'uppercase' }}>Return to Home</Link>
        </div>
      </main>
    )
  }

  const children = await getChildren(page.id)
  const hasBlocks = page.blocks && Array.isArray(page.blocks) && page.blocks.length > 0

  if (slug === 'contact') {
    return <ContactPage page={page} />
  }

  return (
    <main style={{ minHeight: '70vh', backgroundColor: 'var(--color-cream)' }}>

      {hasBlocks ? (
        <>
          {children.length > 0 && (
            <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '1.5rem 1.5rem 0' }}>
              <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                <a href={`/${page.slug}`} style={{ padding: '0.5rem 1rem', fontSize: '12px', fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', textDecoration: 'none', backgroundColor: 'var(--color-navy)', color: 'var(--color-cream)' }}>{page.title}</a>
                {children.map((child: any) => (
                  <a key={child.id} href={`/${child.slug}`} style={{ padding: '0.5rem 1rem', fontSize: '12px', fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', textDecoration: 'none', backgroundColor: 'var(--color-cream)', color: 'var(--color-navy)', border: '1px solid var(--color-border)' }}>{child.title}</a>
                ))}
              </div>
            </div>
          )}
          <BlockRenderer blocks={page.blocks} />
        </>
      ) : (
        <div style={{ padding: '3rem 0' }}>
          <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '0 1.5rem' }}>
            <article style={{ backgroundColor: '#fff', padding: '3rem', border: '1px solid var(--color-border)' }}>
              <h1 style={{ fontFamily: 'Georgia, serif', fontSize: 'clamp(1.75rem, 4vw, 2.5rem)', fontWeight: 700, color: 'var(--color-navy)', marginBottom: '1.5rem' }}>{page.title}</h1>
              {children.length > 0 && (
                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '2rem', borderBottom: '1px solid var(--color-border)', paddingBottom: '1rem' }}>
                  <a href={`/${page.slug}`} style={{ padding: '0.5rem 1rem', fontSize: '12px', fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', textDecoration: 'none', backgroundColor: 'var(--color-navy)', color: 'var(--color-cream)' }}>{page.title}</a>
                  {children.map((child: any) => (
                    <a key={child.id} href={`/${child.slug}`} style={{ padding: '0.5rem 1rem', fontSize: '12px', fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', textDecoration: 'none', backgroundColor: 'var(--color-cream)', color: 'var(--color-navy)', border: '1px solid var(--color-border)' }}>{child.title}</a>
                  ))}
                </div>
              )}
              <div className="static-content" style={{ fontSize: '16px', color: 'var(--color-charcoal)', lineHeight: 1.8 }} dangerouslySetInnerHTML={{ __html: page.content || '' }} />
            </article>
          </div>
        </div>
      )}
    </main>
  )
}
