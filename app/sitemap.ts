import { supabase } from '@/lib/supabase/client'
import { MetadataRoute } from 'next'

const BATCH_SIZE = 1000

async function fetchAllPublishedArticles() {
  let results: any[] = []
  let batch = 0
  while (true) {
    const { data, error } = await supabase
      .from('articles')
      .select('slug, published_at, updated_at, author_id, categories(slug)')
      .eq('published', true)
      .order('id')
      .range(batch * BATCH_SIZE, batch * BATCH_SIZE + BATCH_SIZE - 1)
    if (error || !data) break
    results = results.concat(data)
    if (data.length < BATCH_SIZE) break
    batch += 1
  }
  return results
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const articles = await fetchAllPublishedArticles()

  const { data: categories } = await supabase
    .from('categories')
    .select('slug, parent_id, enabled, indexable')
    .eq('enabled', true)
    .eq('indexable', true)

  const { data: pages } = await supabase
    .from('static_pages')
    .select('slug, updated_at')
    .eq('published', true)
    .eq('indexable', true)

  // Filter authors to those with at least one published article and a valid slug
  const authorIds = Array.from(new Set(articles.map((a) => a.author_id).filter(Boolean)))
  let authors: any[] = []
  if (authorIds.length > 0) {
    const { data } = await supabase
      .from('authors')
      .select('slug')
      .in('id', authorIds)
      .not('slug', 'is', null)
    authors = data || []
  }

  const articleUrls = articles.map((a) => ({
    url: `https://www.dudemd.com/articles/${a.categories?.slug}/${a.slug}`,
    lastModified: new Date(a.updated_at || a.published_at),
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  }))

  const categoryUrls = (categories || []).filter(c => !c.parent_id).map((c) => ({
    url: `https://www.dudemd.com/category/${c.slug}`,
    changeFrequency: 'daily' as const,
    priority: 0.9,
  }))

  const subcategoryUrls = (categories || []).filter(c => c.parent_id).map((c) => ({
    url: `https://www.dudemd.com/category/${c.slug}`,
    changeFrequency: 'weekly' as const,
    priority: 0.7,
  }))

  const pageUrls = (pages || []).map((p) => {
    const entry: any = {
      url: `https://www.dudemd.com/${p.slug}`,
      changeFrequency: 'monthly' as const,
      priority: 0.6,
    }
    if (p.updated_at) entry.lastModified = new Date(p.updated_at)
    return entry
  })

  const authorUrls = authors.map((a) => ({
    url: `https://www.dudemd.com/authors/${a.slug}`,
    changeFrequency: 'monthly' as const,
    priority: 0.5,
  }))

  return [
    { url: 'https://www.dudemd.com', changeFrequency: 'daily' as const, priority: 1.0 },
    ...categoryUrls,
    ...subcategoryUrls,
    ...articleUrls,
    ...pageUrls,
    ...authorUrls,
  ]
}
