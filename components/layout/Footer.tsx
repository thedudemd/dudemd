import Link from 'next/link'

export default function Footer() {
  return (
    <footer>
      <div style={{ backgroundColor: '#0e1a2b', padding: '4rem 0 2rem' }}>
        <div className="container-content">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '2rem', marginBottom: '3rem' }}>
            <div style={{ gridColumn: 'span 2' }}>
              <img src="/md-transparent.svg" alt="DudeMD" style={{ height: '120px', width: 'auto', marginBottom: '1rem', filter: 'brightness(0) saturate(100%) invert(78%) sepia(28%) saturate(500%) hue-rotate(5deg) brightness(95%) contrast(90%)' }} />
              <p style={{ fontSize: '13px', color: 'rgba(247,244,238,0.5)', marginBottom: '1.5rem', maxWidth: '22rem', lineHeight: 1.6 }}>Media for Men. Built Different. Evidence-based health, fitness, recovery, style and gear for real men.</p>
              <div style={{ display: 'flex', gap: '0.75rem' }}>
                {[
                  { label: 'Instagram', svg: <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/></svg> },
                  { label: 'X', svg: <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.737-8.844L1.254 2.25H8.08l4.253 5.622zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg> },
                  { label: 'Facebook', svg: <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg> },
                  { label: 'YouTube', svg: <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="currentColor"><path d="M23.495 6.205a3.007 3.007 0 0 0-2.088-2.088c-1.87-.501-9.396-.501-9.396-.501s-7.507-.01-9.396.501A3.007 3.007 0 0 0 .527 6.205a31.247 31.247 0 0 0-.522 5.805 31.247 31.247 0 0 0 .522 5.783 3.007 3.007 0 0 0 2.088 2.088c1.868.502 9.396.502 9.396.502s7.506 0 9.396-.502a3.007 3.007 0 0 0 2.088-2.088 31.247 31.247 0 0 0 .5-5.783 31.247 31.247 0 0 0-.5-5.805zM9.609 15.601V8.408l6.264 3.602z"/></svg> },
                  { label: 'TikTok', svg: <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 0 0-.79-.05 6.34 6.34 0 0 0-6.34 6.34 6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.33-6.34V8.69a8.18 8.18 0 0 0 4.78 1.52V6.76a4.85 4.85 0 0 1-1.01-.07z"/></svg> },
                ].map(({ label, svg }) => (
                  <a key={label} href="#" aria-label={label} style={{ width: '34px', height: '34px', borderRadius: '50%', border: '1px solid rgba(247,244,238,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'rgba(247,244,238,0.7)', textDecoration: 'none' }}>{svg}</a>
                ))}
              </div>
            </div>
            <div>
              <p style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#c9b28f', marginBottom: '1rem' }}>Categories</p>
              {['Health','Fitness','Recovery','Mental Health','Style','Gear'].map((item) => (
                <Link key={item} href={`/category/${item.toLowerCase().replace(' ','-')}`} style={{ display: 'block', fontSize: '13px', color: 'rgba(247,244,238,0.6)', textDecoration: 'none', marginBottom: '0.5rem' }}>{item}</Link>
              ))}
            </div>
            <div>
              <p style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#c9b28f', marginBottom: '1rem' }}>Company</p>
              {['Our Story','Editorial Policy','Contact','Advertise','Newsletter'].map((item) => (
                <Link key={item} href={`/${item.toLowerCase().replace(' ','-')}`} style={{ display: 'block', fontSize: '13px', color: 'rgba(247,244,238,0.6)', textDecoration: 'none', marginBottom: '0.5rem' }}>{item}</Link>
              ))}
            </div>
            <div>
              <p style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#c9b28f', marginBottom: '1rem' }}>Legal</p>
              {['Privacy Policy','Terms of Use','Cookie Policy','Sitemap'].map((item) => (
                <Link key={item} href={`/${item.toLowerCase().replace(/ /g,'-')}`} style={{ display: 'block', fontSize: '13px', color: 'rgba(247,244,238,0.6)', textDecoration: 'none', marginBottom: '0.5rem' }}>{item}</Link>
              ))}
            </div>
          </div>

          <div style={{ textAlign: 'center', padding: '2rem 0', borderTop: '1px solid rgba(247,244,238,0.1)', borderBottom: '1px solid rgba(247,244,238,0.1)', marginBottom: '1.5rem' }}>
            <p style={{ margin: 0, fontSize: '16px', color: '#f7f4ee' }}>
              <span style={{ fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.2em', fontSize: '13px' }}>FOUNDED IN </span>
              <span style={{ fontFamily: 'Georgia, serif', fontSize: '24px', fontWeight: 400, fontStyle: 'italic' }}>Seattle, </span>
              <span style={{ fontFamily: 'Georgia, serif', fontStyle: 'italic', fontSize: '20px' }}>with love </span>
              <span style={{ color: '#c0392b', fontSize: '22px' }}>♥</span>
            </p>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
            <p style={{ fontSize: '11px', color: 'rgba(247,244,238,0.3)', margin: 0 }}>© {new Date().getFullYear()} DudeMD. All rights reserved.</p>
            <div style={{ textAlign: 'right' }}>
              <p style={{ margin: '0 0 4px 0', fontSize: '9px', fontWeight: 400, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'rgba(247,244,238,0.4)' }}>A publication of</p>
              <img src="/rise-media.svg" alt="Rise Media Network" style={{ height: '50px', width: 'auto', display: 'inline-block', filter: 'brightness(0) invert(1)', opacity: 0.7 }} />
            </div>
          </div>

        </div>
      </div>
    </footer>
  )
}
