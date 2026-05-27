import { supabase } from '@/lib/supabase/client'
import { MetadataRoute } from 'next'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const { data: articles } = await supabase
    .from('articles')
    .select('slug, published_at, updated_at, categories(slug)')
    .eq('published', true)

  const { data: categories } = await supabase
    .from('categories')
    .select('slug')

  const { data: pages } = await supabase
    .from('static_pages')
    .select('slug, updated_at')
    .eq('published', true)
    .eq('indexable', true)

  const { data: authors } = await supabase
    .from('authors')
    .select('slug')

  const articleUrls = (articles || []).map((a) => ({
    url: `https://www.dudemd.com/articles/${a.categories?.slug}/${a.slug}`,
    lastModified: new Date(a.updated_at || a.published_at),
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  }))

  const categoryUrls = (categories || []).map((c) => ({
    url: `https://www.dudemd.com/category/${c.slug}`,
    lastModified: new Date(),
    changeFrequency: 'daily' as const,
    priority: 0.9,
  }))

  const pageUrls = (pages || []).map((p) => ({
    url: `https://www.dudemd.com/${p.slug}`,
    lastModified: new Date(p.updated_at || new Date()),
    changeFrequency: 'monthly' as const,
    priority: 0.6,
  }))

  const authorUrls = (authors || []).map((a) => ({
    url: `https://www.dudemd.com/authors/${a.slug}`,
    lastModified: new Date(),
    changeFrequency: 'monthly' as const,
    priority: 0.5,
  }))

  return [
    { url: 'https://www.dudemd.com', lastModified: new Date(), changeFrequency: 'daily' as const, priority: 1.0 },
    ...categoryUrls,
    ...articleUrls,
    ...pageUrls,
    ...authorUrls,
  ]
}
