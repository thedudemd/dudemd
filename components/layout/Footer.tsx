import Link from 'next/link'
import { supabaseServer } from '@/lib/supabase/server'

export default async function Footer() {
  const { data: categories } = await supabaseServer.from("categories").select("name,slug").is("parent_id",null).eq("enabled",true).order("sort_order").order("name")
  const { data: companyPages } = await supabaseServer.from("static_pages").select("title,slug").eq("placement","footer_company").eq("published",true).order("sort_order").order("title")
  const { data: legalPages } = await supabaseServer.from("static_pages").select("title,slug").eq("placement","footer_legal").eq("published",true).order("sort_order").order("title")
  return (
    <footer>
      <div style={{ backgroundColor: 'var(--color-navy)', padding: '4rem 0 2rem' }}>
        <div className="container-content">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '2rem', marginBottom: '3rem' }}>
            <div style={{ gridColumn: 'span 2' }}>
              <img src="/md-transparent.svg" alt="DudeMD" style={{ height: '120px', width: 'auto', marginBottom: '1rem', filter: 'brightness(0) saturate(100%) invert(78%) sepia(28%) saturate(500%) hue-rotate(5deg) brightness(95%) contrast(90%)' }} />
              <p style={{ fontSize: '13px', color: 'rgba(247,244,238,0.5)', marginBottom: '1.5rem', maxWidth: '22rem', lineHeight: 1.6 }}> Modern Men's Wellness for Real Life.</p>
              <div style={{ display: 'flex', gap: '0.75rem' }}>
                {[
                  { label: 'Instagram', url: 'https://instagram.com/mydudemd', svg: <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/></svg> },
                  { label: 'X', url: 'https://twitter.com/mydudemd', svg: <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.737-8.844L1.254 2.25H8.08l4.253 5.622zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg> },
                  { label: 'Facebook', url: 'https://facebook.com/MyDudeMD', svg: <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg> },
                  { label: 'YouTube', url: 'https://youtube.com/@dudemd', svg: <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="currentColor"><path d="M23.495 6.205a3.007 3.007 0 0 0-2.088-2.088c-1.87-.501-9.396-.501-9.396-.501s-7.507-.01-9.396.501A3.007 3.007 0 0 0 .527 6.205a31.247 31.247 0 0 0-.522 5.805 31.247 31.247 0 0 0 .522 5.783 3.007 3.007 0 0 0 2.088 2.088c1.868.502 9.396.502 9.396.502s7.506 0 9.396-.502a3.007 3.007 0 0 0 2.088-2.088 31.247 31.247 0 0 0 .5-5.783 31.247 31.247 0 0 0-.5-5.805zM9.609 15.601V8.408l6.264 3.602z"/></svg> },
                  { label: 'TikTok', url: 'https://tiktok.com/@TheDudeMd', svg: <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 0 0-.79-.05 6.34 6.34 0 0 0-6.34 6.34 6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.33-6.34V8.69a8.18 8.18 0 0 0 4.78 1.52V6.76a4.85 4.85 0 0 1-1.01-.07z"/></svg> },
                ].map(({ label, url, svg }) => (
                  <a key={label} href={url} target="_blank" rel="noopener noreferrer" aria-label={label} style={{ width: '34px', height: '34px', borderRadius: '50%', border: '1px solid rgba(247,244,238,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'rgba(247,244,238,0.7)', textDecoration: 'none' }}>{svg}</a>
                ))}
              </div>
            </div>
            <div>
              <p style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--color-gold)', marginBottom: '1rem' }}>Categories</p>
              {(categories || []).map((cat) => (
                <Link key={cat.slug} href={`/category/${cat.slug}`} style={{ display: 'block', fontSize: '13px', color: 'rgba(247,244,238,0.6)', textDecoration: 'none', marginBottom: '0.5rem' }}>{cat.name}</Link>
              ))}
            </div>
            <div>
              <p style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--color-gold)', marginBottom: '1rem' }}>Company</p>
              {(companyPages || []).map((page) => (
                <Link key={page.slug} href={`/${page.slug}`} style={{ display: 'block', fontSize: '13px', color: 'rgba(247,244,238,0.6)', textDecoration: 'none', marginBottom: '0.5rem' }}>{page.title}</Link>
              ))}
            </div>
            <div>
              <p style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--color-gold)', marginBottom: '1rem' }}>Legal</p>
              {(legalPages || []).map((page) => (
                <Link key={page.slug} href={`/${page.slug}`} style={{ display: 'block', fontSize: '13px', color: 'rgba(247,244,238,0.6)', textDecoration: 'none', marginBottom: '0.5rem' }}>{page.title}</Link>
              ))}
            </div>
          </div>

          <div style={{ textAlign: 'center', padding: '2rem 0', borderTop: '1px solid rgba(247,244,238,0.1)', borderBottom: '1px solid rgba(247,244,238,0.1)', marginBottom: '1.5rem' }}>
            <p style={{ margin: 0, fontSize: '16px', color: 'var(--color-cream)' }}>
              <span style={{ fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.2em', fontSize: '13px' }}>FOUNDED IN </span>
              <span style={{ fontFamily: 'Georgia, serif', fontSize: '24px', fontWeight: 400, fontStyle: 'italic' }}>Seattle, </span>
              <span style={{ fontFamily: 'Georgia, serif', fontStyle: 'italic', fontSize: '20px' }}>with love </span>
              <span style={{ color: '#c0392b', fontSize: '22px' }}>♥</span>
            </p>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
            <p style={{ fontSize: '11px', color: 'rgba(247,244,238,0.3)', margin: 0 }}>© {new Date().getFullYear()} DudeMD. All rights reserved.</p>
            <div style={{ textAlign: 'right' }}>
              <p style={{ margin: '0 0 -28px 0', textAlign: 'center', fontSize: '9px', fontWeight: 400, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'rgba(247,244,238,0.4)' }}>A publication of</p>
              <svg viewBox="0 0 1536 1024" style={{ height: '100px', width: 'auto', display: 'inline-block', opacity: 0.7 }} role="img" aria-label="Rise Media Network">
<g fill="#FF000C"><g><g><path d="M427.3,511.01c41.94-8.75,69.3-37.56,66.59-78.55c-1.4-21.15-10.16-39.05-29.38-51.62c-18.4-12.04-43.97-18.4-73.93-18.4H239.04v34.6h148.92c36.54,0,67.75,4.63,65.53,46.63c-2.15,40.55-47.98,36.28-65.53,36.28H239.04v106.31h43.45l-0.33-71.71h94l73.75,71.71h54.92L427.3,511.01z"/></g><rect x="608.67" y="362.44" width="40.36" height="223.83"/><path d="M957.59,474.57c-20.15-8.91-45.84-13.37-70.69-17.68c-36.98-6.42-71.92-12.48-71.92-31.15c0-19.28,27.22-31.73,69.35-31.73c39.91,0,67.49,15.91,79.27,22.71c1.4,0.81,2.6,1.5,3.58,2.02l5.1,2.72l17.08-29.38l-4.12-3.22c-1.54-1.2-38.42-29.45-102.74-29.45c-30.76,0-57.14,5.88-76.29,17.01c-20.67,12.01-31.6,29.26-31.6,49.89c0,21.88,12.06,37.86,36.88,48.84c20.39,9.03,46.3,13.41,71.36,17.65c36.41,6.16,70.81,11.97,70.81,30.16c0,28.64-52.18,31.73-74.61,31.73c-45.04,0-77.94-20.08-88.75-26.68c-0.58-0.36-1.1-0.67-1.54-0.93l-5.22-3.13l-17.14,29.49l3.88,3.25c1.59,1.33,39.74,32.61,109.38,32.61c72.68,0,114.36-24.38,114.36-66.9C994.04,501.06,982.12,485.42,957.59,474.57z"/><polygon points="1127.64,551.67 1127.64,490.14 1249.15,490.14 1249.15,455.54 1127.64,455.54 1127.64,397.04 1293.72,397.04 1293.72,362.44 1087.28,362.44 1087.28,586.27 1296.96,586.27 1296.96,551.67"/></g></g>
<g fill="#c9b28f"><g><path d="M240.44,621.22h12.45l13.29,24.12l12.53-24.12h12.72v42.57h-8.55v-31.67l-14.39,24.06h-4.67l-15.43-23.78v31.39h-7.95V621.22z"/><path d="M339.18,621.16h35.31v8.23h-26.75v8.12h25.33v8.23h-25.33v9.82h27.41v8.23h-35.96V621.16z"/><path d="M420.07,663.79v-42.57h24.29c11.35,0,20.56,9.54,20.56,21.29s-9.21,21.29-20.56,21.29H420.07z M443.48,655.56c6.96,0,12.61-5.85,12.61-13.06s-5.65-13.06-12.61-13.06h-14.91v26.11H443.48z"/><path d="M517.18,663.79h-8.5v-42.57h8.5V663.79z"/><path d="M585.32,621.22h9.1l19.41,42.57h-9.38l-3.84-8.34h-22.15l-3.78,8.34h-8.77L585.32,621.22z M596.89,647.28l-7.35-16.06l-7.29,16.06H596.89z"/><path d="M726.67,663.79v-42.57h11.62L757.15,650v-28.78h7.95v42.57h-9.05l-21.44-32.75v32.75H726.67z"/><path d="M812.63,621.16h35.31v8.23h-26.75v8.12h25.33v8.23h-25.33v9.82h27.41v8.23h-35.97V621.16z"/><path d="M927.54,621.22v8.23h-16.78v34.34h-8.5v-34.34h-16.72v-8.23H927.54z"/><path d="M964.07,621.22h8.88l10.47,30.2l10.42-30.2h8.55l10.47,30.2l10.42-30.2h8.28l-14.75,42.57h-8.55l-10.47-30.2l-10.42,30.2h-8.55L964.07,621.22z"/><path d="M1093.45,620.14c13.65,0,23.9,9.42,23.9,22.19c0,12.83-10.25,22.25-23.9,22.25c-13.71,0-23.9-9.42-23.9-22.25C1069.55,629.57,1079.75,620.14,1093.45,620.14z M1078.38,642.34c0,8,6.03,14.02,15.08,14.02c9.05,0,15.08-6.02,15.08-14.02c0-7.95-6.03-13.96-15.08-13.96C1084.41,628.37,1078.38,634.39,1078.38,642.34z"/><path d="M1162.91,621.22h25.82c7.4,0,13.38,6.19,13.38,13.85c0,6.7-4.61,12.26-10.69,13.57l14.09,15.16h-11.62l-13.87-14.93h-8.61v14.93h-8.5V621.22z M1171.4,640.69h16.45c3.02,0,5.43-2.55,5.43-5.62c0-3.12-2.41-5.62-5.43-5.62h-16.45V640.69z"/><path d="M1246.23,663.79v-42.57h8.5v17.94l20.18-17.94h12.12l-20.67,18.39l22.48,24.18h-11.62l-17.21-18.5l-5.26,4.71v13.79H1246.23z"/></g></g>
</svg>
            </div>
          </div>

        </div>
      </div>
    </footer>
  )
}
