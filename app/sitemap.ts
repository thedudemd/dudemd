import { supabase } from '@/lib/supabase/client'
import { MetadataRoute } from 'next'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const { data: articles } = await supabase
    .from('articles')
    .select('slug, published_at, updated_at')
    .eq('published', true)

  const { data: categories } = await supabase
    .from('categories')
    .select('slug')

  const articleUrls = (articles || []).map((a) => ({
    url: `https://www.dudemd.com/articles/${a.slug}`,
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

  return [
    { url: 'https://www.dudemd.com', lastModified: new Date(), changeFrequency: 'daily' as const, priority: 1.0 },
    ...categoryUrls,
    ...articleUrls,
  ]
}
