// @ts-nocheck
import type { Metadata } from 'next'
import Link from 'next/link'
import { supabase } from '@/lib/supabase/client'
import { supabaseServer } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import ArticleContent from '@/components/article/ArticleContent'
import StandardLayout from '@/components/article/layouts/StandardLayout'
import MagazineLayout from '@/components/article/layouts/MagazineLayout'
import LongFormLayout from '@/components/article/layouts/LongFormLayout'

export const revalidate = 60

async function getArticle(slug: string) {
  const { data } = await supabase
    .from('articles')
    .select('*, authors(name, slug, avatar_url, title, bio, twitter, instagram, linkedin, website), categories!articles_category_id_fkey(name, slug)')
    .eq('slug', slug)
    .eq('published', true)
    .single()
  return data
}

async function getClusterArticles(pillarId: string) {
  const { data } = await supabaseServer.from('articles').select('*, authors(name), categories!articles_category_id_fkey(name, slug)').eq('pillar_topic_id', pillarId).eq('published', true).order('title')
  return data || []
}

async function getParentPillar(pillarId: string) {
  const { data } = await supabaseServer.from('articles').select('title, slug, categories!articles_category_id_fkey(slug)').eq('id', pillarId).eq('published', true).single()
  return data || null
}

async function getRelated(categorySlug: string, currentSlug: string) {
  const { data } = await supabase
    .from('articles')
    .select('*, authors(name), categories!articles_category_id_fkey(name, slug)')
    .eq('is_editor_pick', true)
    .eq('published', true)
    .neq('slug', currentSlug)
    .limit(4)
  return data || []
}

export async function generateMetadata({ params }): Promise<Metadata> {
  const { slug, category } = await params
  const article = await getArticle(slug)
  if (!article) return {}
  return {
    title: article.social_title || article.meta_title || article.title,
    description: article.meta_description || article.excerpt,
    alternates: {
      canonical: `https://www.dudemd.com/articles/${category}/${slug}`,
    },
    openGraph: {
      type: 'article',
      title: article.social_title || article.meta_title || article.title,
      description: article.social_description || article.meta_description || article.excerpt,
      url: `https://www.dudemd.com/articles/${category}/${slug}`,
      siteName: 'DudeMD',
      images: [{ url: article.cover_image_url || 'https://www.dudemd.com/og-image.png', width: 1200, height: 630 }],
      publishedTime: article.published_at,
      modifiedTime: article.updated_at && new Date(article.updated_at) > new Date(article.published_at) ? article.updated_at : article.published_at,
      authors: article.authors?.name ? [article.authors.name] : [],
    },

    twitter: {
      card: 'summary_large_image',
      title: article.social_title || article.meta_title || article.title,
      description: article.meta_description || article.excerpt,
      images: [article.cover_image_url || 'https://www.dudemd.com/og-image.png'],
    },
  }
}

export default async function ArticlePage({ params }: { params: Promise<{ slug: string; category: string }> }) {
  const { slug, category } = await params
  const article = await getArticle(slug)
  if (!article) notFound()
  const related = await getRelated(article.categories?.slug, slug)
  const clusterArticles = article.is_pillar_content ? await getClusterArticles(article.id) : []
  const parentPillar = article.pillar_topic_id ? await getParentPillar(article.pillar_topic_id) : null

  const articleSchema = {
    "@context": "https://schema.org",
    "@type": "Article",
    "headline": article.title,
    "description": article.excerpt,
    "image": article.cover_image_url,
    "datePublished": article.published_at,
    "dateModified": article.updated_at && new Date(article.updated_at) > new Date(article.published_at) ? article.updated_at : article.published_at,
    "author": {
      "@type": "Person",
      "name": article.authors?.name,
      "url": article.authors?.website || `https://www.dudemd.com/author/${article.authors?.slug}`,
      "image": article.authors?.avatar_url,
      "jobTitle": article.authors?.title,
      "sameAs": [
        article.authors?.twitter,
        article.authors?.instagram,
        article.authors?.linkedin
      ].filter(Boolean)
    },
    "publisher": {
      "@type": "Organization",
      "name": "DudeMD",
      "url": "https://www.dudemd.com",
      "logo": { "@type": "ImageObject", "url": "https://www.dudemd.com/og-image.png" }
    },
    "mainEntityOfPage": { "@type": "WebPage", "@id": `https://www.dudemd.com/articles/${category}/${slug}` }
  }

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://www.dudemd.com" },
      { "@type": "ListItem", "position": 2, "name": article.categories?.name, "item": `https://www.dudemd.com/category/${article.categories?.slug}` },
      { "@type": "ListItem", "position": 3, "name": article.title, "item": `https://www.dudemd.com/articles/${category}/${slug}` }
    ]
  }

  const faqSchema = article.faq_items && Array.isArray(article.faq_items) && article.faq_items.length > 0 ? {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": article.faq_items.map((item: any) => ({
      "@type": "Question",
      "name": item.question,
      "acceptedAnswer": { "@type": "Answer", "text": item.answer }
    }))
  } : null

  const schemas = [articleSchema, breadcrumbSchema]
  if (faqSchema) schemas.push(faqSchema)

  return (
    <main>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schemas) }} />
      <style>{`
        .article-grid { display: grid; grid-template-columns: 1fr; gap: 2rem; }
        .article-sidebar { order: 0; }
        @media (min-width: 900px) {
          .article-grid { grid-template-columns: minmax(0, 2fr) minmax(0, 1fr); gap: 4rem; }
          .article-sidebar { position: sticky; top: 6rem; }
        }
      `}</style>

      {article.layout === 'magazine' ? (
        <MagazineLayout article={article}>
          <div />
        </MagazineLayout>
      ) : article.layout === 'longform' ? (
        <LongFormLayout article={article}>
          <div />
        </LongFormLayout>
      ) : (
        <>{article.show_hero !== false && article.cover_image_url && (<div style={{ width: '100%', overflow: 'hidden' }}><img src={article.cover_image_url} alt={`Cover image for ${article.title}`} style={{ width: '100%', height: 'auto', maxHeight: '520px', objectFit: 'cover', objectPosition: 'center center', display: 'block', aspectRatio: '16/9' }} /></div>)}</>
      )}

      <div className="container-content" style={{ paddingTop: '2rem', paddingBottom: '4rem' }}>
        <div className="article-grid" style={{ alignItems: 'start' }}>
          <article>
            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', marginBottom: '1.5rem' }}>
              <Link href="/" style={{ fontSize: '12px', color: '#9a9085', textDecoration: 'none' }}>Home</Link>
              <span style={{ fontSize: '12px', color: '#9a9085' }}>›</span>
              <Link href={`/category/${article.categories?.slug}`} style={{ fontSize: '12px', color: '#9a9085', textDecoration: 'none' }}>{article.categories?.name}</Link>
              <span style={{ fontSize: '12px', color: '#9a9085' }}>›</span>
              <span style={{ fontSize: '12px', color: 'var(--color-slate)' }}>{article.title}</span>
            </div>

            <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', marginBottom: '1rem' }}>
              <span style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--color-gold)' }}>{article.categories?.name}</span>
              <span style={{ fontSize: '12px', color: '#9a9085' }}>{article.read_time}</span>
            </div>

            {(article.layout !== 'magazine' && article.layout !== 'longform') && (
              <h1 style={{ fontFamily: 'Georgia, serif', fontWeight: 700, fontSize: 'clamp(1.75rem, 4vw, 2.75rem)', lineHeight: 1.15, color: 'var(--color-navy)', marginBottom: '1.25rem' }}>
                {article.title}
              </h1>
            )}

            {(article.layout !== 'magazine' && article.layout !== 'longform') && (
              <p style={{ fontSize: '18px', color: 'var(--color-slate)', lineHeight: 1.65, marginBottom: '1.5rem', fontStyle: 'italic', borderLeft: '3px solid var(--color-gold)', paddingLeft: '1rem' }}>
                {article.excerpt}
              </p>
            )}

            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', paddingBottom: '1.5rem', borderBottom: '1px solid var(--color-border)', marginBottom: '2rem' }}>
              <div style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: 'var(--color-navy)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                {article.authors?.avatar_url ? (
                    <img src={article.authors.avatar_url} alt={article.authors.name} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }} />
                  ) : (
                    <span style={{ fontSize: '14px', fontWeight: 700, color: 'var(--color-gold)' }}>{article.authors?.name?.charAt(0)}</span>
                  )}
              </div>
              <div>
                <p style={{ fontSize: '14px', fontWeight: 600, color: 'var(--color-navy)', margin: 0 }}>
                  {article.authors?.slug ? (
                    <Link href={`/authors/${article.authors.slug}`} style={{ color: 'inherit', textDecoration: 'underline' }}>{article.authors.name}</Link>
                  ) : article.authors?.name}
                </p>
                <p style={{ fontSize: '12px', color: '#9a9085', margin: 0 }}>{new Date(article.published_at).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</p>
                {article.updated_at && new Date(article.updated_at) > new Date(article.published_at) && <p style={{ fontSize: '11px', color: '#9a9085', margin: '2px 0 0' }}>Updated: {new Date(article.updated_at).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</p>}
              </div>
            </div>

            <ArticleContent article={article} slug={slug} category={category} relatedArticles={related} parentPillar={parentPillar} />
          </article>

          <aside className="article-sidebar">
            <div style={{ backgroundColor: 'var(--color-navy)', padding: '1.5rem', marginBottom: '2rem' }}>
              <p style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--color-gold)', marginBottom: '0.5rem' }}>Free Newsletter</p>
              <p style={{ fontSize: '16px', fontWeight: 700, color: 'var(--color-cream)', lineHeight: 1.3, marginBottom: '1rem' }}>Men&apos;s health that doesn&apos;t waste your time.</p>
              <input type="email" placeholder="your@email.com" style={{ width: '100%', padding: '0.75rem', backgroundColor: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)', color: 'var(--color-cream)', outline: 'none', fontSize: '14px', marginBottom: '0.5rem', boxSizing: 'border-box' }} />
              <button style={{ width: '100%', padding: '0.75rem', backgroundColor: 'var(--color-gold)', color: 'var(--color-navy)', fontWeight: 700, fontSize: '12px', letterSpacing: '0.08em', textTransform: 'uppercase', border: 'none', cursor: 'pointer' }}>Join Free</button>
            </div>

            {related.length > 0 && (
              <div>
                <p style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#9a9085', borderBottom: '1px solid var(--color-border)', paddingBottom: '0.5rem', marginBottom: '1.25rem' }}>Editor's Picks</p>
                {related.map((a) => (
                  <Link key={a.slug} href={`/articles/${a.categories?.slug}/${a.slug}`} style={{ display: 'flex', gap: '0.75rem', textDecoration: 'none', marginBottom: '1.25rem', alignItems: 'start' }}>
                    <img src={a.cover_image_url} alt={`${a.title} thumbnail`} style={{ width: '72px', height: '54px', objectFit: 'cover', flexShrink: 0 }} />
                    <div>
                      <p style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--color-gold)', marginBottom: '0.25rem' }}>{a.categories?.name}</p>
                      <p style={{ fontSize: '13px', fontWeight: 600, color: 'var(--color-navy)', lineHeight: 1.3, margin: 0 }}>{a.title}</p>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </aside>
        </div>
      </div>

      {clusterArticles.length > 0 && (
        <section style={{ borderTop: '1px solid var(--color-border)', padding: '3rem 0', backgroundColor: '#fff' }}>
          <div className="container-content">
            <h2 style={{ fontFamily: 'Georgia, serif', fontWeight: 700, fontSize: '1.25rem', color: 'var(--color-navy)', marginBottom: '2rem' }}>Related Articles</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '2rem' }}>
              {clusterArticles.map((a) => (
                <article key={a.slug}>
                  {a.cover_image_url && (
                    <a href={'/articles/' + a.categories?.slug + '/' + a.slug}>
                      <img src={a.cover_image_url} alt={a.title + ' thumbnail'} style={{ width: '100%', aspectRatio: '16/10', objectFit: 'cover', display: 'block', marginBottom: '1rem' }} />
                    </a>
                  )}
                  <span style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--color-gold)' }}>{a.categories?.name}</span>
                  <h3 style={{ fontFamily: 'Georgia, serif', fontWeight: 700, fontSize: '1rem', lineHeight: 1.3, color: 'var(--color-navy)', marginTop: '0.4rem' }}>
                    <a href={'/articles/' + a.categories?.slug + '/' + a.slug} style={{ color: 'inherit', textDecoration: 'none' }}>{a.title}</a>
                  </h3>
                  {a.excerpt && <p style={{ fontSize: '13px', color: 'var(--color-slate)', lineHeight: 1.55, marginTop: '0.4rem' }}>{a.excerpt}</p>}
                </article>
              ))}
            </div>
          </div>
        </section>
      )}

    </main>
  )
}
