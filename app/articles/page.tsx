import type { Metadata } from 'next'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'

export const metadata: Metadata = { title: 'Articles — DudeMD' }

export const revalidate = 60

export default async function ArticlesPage() {
  const supabase = await createClient()
  const { data: articles } = await supabase
    .from('articles')
    .select('*, authors(name), categories(name, slug)')
    .eq('published', true)
    .order('published_at', { ascending: false })

  const all = articles || []

  return (
    <div className="container-content" style={{ padding: '3rem 1rem' }}>
      <h1 style={{ fontFamily: 'Georgia, serif', fontWeight: 700, fontSize: 'clamp(1.75rem, 4vw, 2.5rem)', color: '#0e1a2b', marginBottom: '2rem' }}>All Articles</h1>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '2rem' }}>
        {all.map((a) => (
          <article key={a.slug}>
            <Link href={
