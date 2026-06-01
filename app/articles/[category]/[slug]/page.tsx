// @ts-nocheck
import type { Metadata } from 'next'
import Link from 'next/link'
import { supabase } from '@/lib/supabase/client'
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

async function getRelated(categorySlug: string, currentSlug: string) {
  const { data: category } = await supabase
    .from('categories')
    .select('id')
    .eq('slug', categorySlug)
    .single()
  if (!category) return []
  const { data } = await supabase
    .from('articles')
    .select('*, authors(name), categories!articles_category_id_fkey(name, slug)')
    .eq('category_id', category.id)
    .eq('published', true)
    .neq('slug', currentSlug)
    .limit(3)
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
      images: article.cover_image_url ? [{ url: article.cover_image_url, width: 1200, height: 630 }] : [],
      publishedTime: article.published_at,
      modifiedTime: article.updated_at && new Date(article.updated_at) > new Date(article.published_at) ? article.updated_at : article.published_at,
      authors: article.authors?.name ? [article.authors.name] : [],
    },
    other: {
      'fb:app_id': ['2107832130079548'],
      'fb:pages': ['849615384891054'],
      'article:publisher': ['https://www.facebook.com/MyDudeMD'],
    },
    twitter: {
      card: 'summary_large_image',
      title: article.social_title || article.meta_title || article.title,
      description: article.meta_description || article.excerpt,
      images: article.cover_image_url ? [article.cover_image_url] : [],
    },
  }
}

export default async function ArticlePage({ params }: { params: Promise<{ slug: string; category: string }> }) {
  const { slug, category } = await params
  const article = await getArticle(slug)
  if (!article) notFound()
  const related = await getRelated(article.categories?.slug, slug)

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
        {article.show_hero !== false && article.cover_image_url && (<div style={{ width: '100%', overflow: 'hidden' }}><img src={article.cover_image_url} alt={`Cover image for ${article.title}`} style={{ width: '100%', height: 'auto', maxHeight: '520px', objectFit: 'cover', objectPosition: 'center center', display: 'block' }} /></div>)}
      )}

      <div className="container-content" style={{ paddingTop: '2rem', paddingBottom: '4rem' }}>
        <div className="article-grid" style={{ alignItems: 'start' }}>
          <article>
            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', marginBottom: '1.5rem' }}>
              <Link href="/" style={{ fontSize: '12px', color: '#9a9085', textDecoration: 'none' }}>Home</Link>
              <span style={{ fontSize: '12px', color: '#9a9085' }}>›</span>
              <Link href={`/category/${article.categories?.slug}`} style={{ fontSize: '12px', color: '#9a9085', textDecoration: 'none' }}>{article.categories?.name}</Link>
              <span style={{ fontSize: '12px', color: '#9a9085' }}>›</span>
              <span style={{ fontSize: '12px', color: '#4A5563' }}>{article.title}</span>
            </div>

            <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', marginBottom: '1rem' }}>
              <span style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#c9b28f' }}>{article.categories?.name}</span>
              <span style={{ fontSize: '12px', color: '#9a9085' }}>{article.read_time}</span>
            </div>

            <h1 style={{ fontFamily: 'Georgia, serif', fontWeight: 700, fontSize: 'clamp(1.75rem, 4vw, 2.75rem)', lineHeight: 1.15, color: '#0e1a2b', marginBottom: '1.25rem' }}>
              {article.title}
            </h1>

            <p style={{ fontSize: '18px', color: '#4A5563', lineHeight: 1.65, marginBottom: '1.5rem', fontStyle: 'italic', borderLeft: '3px solid #c9b28f', paddingLeft: '1rem' }}>
              {article.excerpt}
            </p>

            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', paddingBottom: '1.5rem', borderBottom: '1px solid #ede8df', marginBottom: '2rem' }}>
              <div style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: '#0e1a2b', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                {article.authors?.avatar_url ? (
                    <img src={article.authors.avatar_url} alt={article.authors.name} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }} />
                  ) : (
                    <span style={{ fontSize: '14px', fontWeight: 700, color: '#c9b28f' }}>{article.authors?.name?.charAt(0)}</span>
                  )}
              </div>
              <div>
                <p style={{ fontSize: '14px', fontWeight: 600, color: '#0e1a2b', margin: 0 }}>
                  {article.authors?.slug ? (
                    <Link href={`/authors/${article.authors.slug}`} style={{ color: 'inherit', textDecoration: 'underline' }}>{article.authors.name}</Link>
                  ) : article.authors?.name}
                </p>
                <p style={{ fontSize: '12px', color: '#9a9085', margin: 0 }}>{new Date(article.published_at).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</p>
                {article.updated_at && new Date(article.updated_at) > new Date(article.published_at) && <p style={{ fontSize: '11px', color: '#9a9085', margin: '2px 0 0' }}>Updated: {new Date(article.updated_at).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</p>}
              </div>
            </div>

            <ArticleContent article={article} slug={slug} category={category} relatedArticles={related} />
          </article>

          <aside className="article-sidebar">
            <div style={{ backgroundColor: '#0e1a2b', padding: '1.5rem', marginBottom: '2rem' }}>
              <p style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#c9b28f', marginBottom: '0.5rem' }}>Free Newsletter</p>
              <p style={{ fontSize: '16px', fontWeight: 700, color: '#f7f4ee', lineHeight: 1.3, marginBottom: '1rem' }}>Men&apos;s health that doesn&apos;t waste your time.</p>
              <input type="email" placeholder="your@email.com" style={{ width: '100%', padding: '0.75rem', backgroundColor: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)', color: '#f7f4ee', outline: 'none', fontSize: '14px', marginBottom: '0.5rem', boxSizing: 'border-box' }} />
              <button style={{ width: '100%', padding: '0.75rem', backgroundColor: '#c9b28f', color: '#0e1a2b', fontWeight: 700, fontSize: '12px', letterSpacing: '0.08em', textTransform: 'uppercase', border: 'none', cursor: 'pointer' }}>Join Free</button>
            </div>

            {related.length > 0 && (
              <div>
                <p style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#9a9085', borderBottom: '1px solid #ede8df', paddingBottom: '0.5rem', marginBottom: '1.25rem' }}>Related Articles</p>
                {related.map((a) => (
                  <Link key={a.slug} href={`/articles/${a.categories?.slug}/${a.slug}`} style={{ display: 'flex', gap: '0.75rem', textDecoration: 'none', marginBottom: '1.25rem', alignItems: 'start' }}>
                    <img src={a.cover_image_url} alt={`${a.title} thumbnail`} style={{ width: '72px', height: '54px', objectFit: 'cover', flexShrink: 0 }} />
                    <div>
                      <p style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#c9b28f', marginBottom: '0.25rem' }}>{a.categories?.name}</p>
                      <p style={{ fontSize: '13px', fontWeight: 600, color: '#0e1a2b', lineHeight: 1.3, margin: 0 }}>{a.title}</p>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </aside>
        </div>
      </div>

      {related.length > 0 && (
        <section style={{ borderTop: '1px solid #ede8df', padding: '3rem 0', backgroundColor: '#f7f4ee' }}>
          <div className="container-content">
            <h2 style={{ fontFamily: 'Georgia, serif', fontWeight: 700, fontSize: '1.25rem', color: '#0e1a2b', marginBottom: '2rem' }}>More to Read</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '2rem' }}>
              {related.map((a) => (
                <article key={a.slug}>
                  <Link href={`/articles/${a.categories?.slug}/${a.slug}`}>
                    <img src={a.cover_image_url} alt={`${a.title} thumbnail`} style={{ width: '100%', aspectRatio: '16/10', objectFit: 'cover', display: 'block', marginBottom: '1rem' }} />
                  </Link>
                  <span style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#c9b28f' }}>{a.categories?.name}</span>
                  <h3 style={{ fontFamily: 'Georgia, serif', fontWeight: 700, fontSize: '1rem', lineHeight: 1.3, color: '#0e1a2b', marginTop: '0.4rem' }}>
                    <Link href={`/articles/${a.categories?.slug}/${a.slug}`} style={{ color: 'inherit', textDecoration: 'none' }}>{a.title}</Link>
                  </h3>
                </article>
              ))}
            </div>
          </div>
        </section>
      )}
    </main>
  )
}
