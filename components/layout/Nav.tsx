import { createClient } from '@/lib/supabase/server'
import NavClient from './NavClient'

const SUPABASE_URL = 'https://bicljoujevywrkzjeaoy.supabase.co'
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJpY2xqb3VqZXZ5d3JremplYW95Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzg4MDc1ODIsImV4cCI6MjA5NDM4MzU4Mn0.UIKVUyX6QClJmAYdQKg91t_kAT4itpuSk_fIemcPJ0g'

export default async function Nav() {
  let navItems: any[] = []
  try {
    const catsRes = await fetch(
      `${SUPABASE_URL}/rest/v1/categories?select=*&parent_id=is.null&enabled=eq.true&show_in_nav=eq.true&order=sort_order.asc,name.asc`,
      { headers: { apikey: SUPABASE_ANON_KEY, Authorization: `Bearer ${SUPABASE_ANON_KEY}` }, next: { revalidate: 300 } }
    )
    const cats = await catsRes.json()
    if (Array.isArray(cats)) {
      navItems = await Promise.all(cats.map(async (cat: any) => {
        const [subsRes, artsRes] = await Promise.all([
          fetch(`${SUPABASE_URL}/rest/v1/categories?select=name,slug&parent_id=eq.${cat.id}&enabled=eq.true&order=sort_order.asc,name.asc`,
            { headers: { apikey: SUPABASE_ANON_KEY, Authorization: `Bearer ${SUPABASE_ANON_KEY}` }, next: { revalidate: 300 } }),
          fetch(`${SUPABASE_URL}/rest/v1/articles?select=slug,title,cover_image_url&category_id=eq.${cat.id}&published=eq.true&order=published_at.desc&limit=2`,
            { headers: { apikey: SUPABASE_ANON_KEY, Authorization: `Bearer ${SUPABASE_ANON_KEY}` }, next: { revalidate: 300 } })
        ])
        const subs = await subsRes.json()
        const arts = await artsRes.json()
        return {
          label: cat.name,
          href: `/category/${cat.slug}`,
          subs: Array.isArray(subs) ? subs.map((s: any) => s.name) : [],
          articles: Array.isArray(arts) ? arts.map((a: any) => ({ slug: a.slug, title: a.title, image: a.cover_image_url || '' })) : []
        }
      }))
    }
  } catch {}
  return <NavClient navItems={navItems} />
}
