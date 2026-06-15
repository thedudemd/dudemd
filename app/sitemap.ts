import { MetadataRoute } from 'next'
import { createClient } from '@supabase/supabase-js'

const SITE_URL = 'https://www.dudemd.com'
const BATCH_SIZE = 1000

function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}

async function fetchAllArticles() {
  const supabase = getSupabase()
  let results: any[] = []
  let batch = 0
  while (true) {
    const { data, error } = await supabase
      .from('articles')
      .select('slug, published_at, updated_at, categories!articles_category_id_fkey(slug)')
      .eq('published', true)
      .order('id')
      .range(batch * BATCH_SIZE, batch * BATCH_SIZE + BATCH_SIZE - 1)
    if (error || !data || data.length === 0) break
    results = results.concat(data)
    if (data.length < BATCH_SIZE) break
    batch++
  }
  return results
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const supabase = getSupabase()
  let articles: any[] = []
  try { articles = await fetchAllArticles() } catch (e) { console.error('Sitemap articles error', e) }
  // Only include categories that have at least one published article
  let categories: any[] = []
  try {
    const { data: artCats } = await supabase
      .from('articles')
      .select('categories!articles_category_id_fkey(slug, parent_id)')
      .eq('published', true)
    const seen = new Set<string>()
    const catList: any[] = []
    ;(artCats || []).forEach((a: any) => {
      const cat = a.categories
      if (cat?.slug && !seen.has(cat.slug)) {
        seen.add(cat.slug)
        catList.push(cat)
      }
    })
    categories = catList
  } catch (e) { console.error('Sitemap categories error', e) }
  let pages: any[] = []
  try { const { data } = await supabase.from('static_pages').select('slug, updated_at').eq('published', true); pages = data || [] } catch (e) {}

  const articleUrls: MetadataRoute.Sitemap = articles
    .filter(a => a.categories?.slug && a.slug)
    .map(a => ({
      url: `${SITE_URL}/articles/${a.categories.slug}/${a.slug}`,
      lastModified: new Date(a.updated_at || a.published_at),
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    }))

  const categoryUrls: MetadataRoute.Sitemap = categories
    .filter(c => !c.parent_id && c.slug)
    .map(c => ({ url: `${SITE_URL}/category/${c.slug}`, changeFrequency: 'daily' as const, priority: 0.9 }))

  const subcategoryUrls: MetadataRoute.Sitemap = categories
    .filter(c => c.parent_id && c.slug)
    .map(c => ({ url: `${SITE_URL}/category/${c.slug}`, changeFrequency: 'weekly' as const, priority: 0.7 }))

  const pageUrls: MetadataRoute.Sitemap = pages
    .filter(p => p.slug && !['404', 'admin'].includes(p.slug))
    .map(p => ({
      url: `${SITE_URL}/${p.slug}`,
      lastModified: p.updated_at ? new Date(p.updated_at) : undefined,
      changeFrequency: 'monthly' as const,
      priority: 0.6,
    }))

  return [
    { url: SITE_URL, changeFrequency: 'daily' as const, priority: 1.0 },
    ...categoryUrls,
    ...subcategoryUrls,
    ...articleUrls,
    ...pageUrls,
  ]
}
