// @ts-nocheck
import { redirect } from 'next/navigation'
import { supabase } from '@/lib/supabase/client'

export default async function OldArticleRedirect({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const { data } = await supabase
    .from('articles')
    .select('categories(slug)')
    .eq('slug', slug)
    .single()
  
  if (data?.categories?.slug) {
    redirect(`/articles/${data.categories.slug}/${slug}`)
  }
  
  redirect('/404')
}
