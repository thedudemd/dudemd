import Link from 'next/link'

export default function Footer() {
  return (
    <footer>
      <div style={{ backgroundColor: '#0e1a2b', padding: '4rem 0 2rem' }}>
        <div className="container-content">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '2rem', marginBottom: '3rem' }}>

            <div style={{ gridColumn: 'span 2' }}>
              <img src="/DudeMD.svg" alt="DudeMD" style={{ height: '36px', width: 'auto', marginBottom: '1rem' }} />
              <p style={{ fontSize: '13px', color: 'rgba(247,244,238,0.5)', marginBottom: '1.5rem', maxWidth: '22rem', lineHeight: 1.6 }}>
                Media for Men. Built Different. Evidence-based health, fitness, recovery, style and gear for real men.
              </p>
              <div style={{ display: 'flex', gap: '0.75rem' }}>
                {[
                  { label: 'Instagram', svg: <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/></svg> },
                  { label: 'X', svg: <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.737-8.844L1.254 2.25H8.08l4.253 5.622zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg> },
                  { label: 'Facebook', svg: <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg> },
                  { label: 'YouTube', svg: <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="currentColor"><path d="M23.495 6.205a3.007 3.007 0 0 0-2.088-2.088c-1.87-.501-9.396-.501-9.396-.501s-7.507-.01-9.396.501A3.007 3.007 0 0 0 .527 6.205a31.247 31.247 0 0 0-.522 5.805 31.247 31.247 0 0 0 .522 5.783 3.007 3.007 0 0 0 2.088 2.088c1.868.502 9.396.502 9.396.502s7.506 0 9.396-.502a3.007 3.007 0 0 0 2.088-2.088 31.247 31.247 0 0 0 .5-5.783 31.247 31.247 0 0 0-.5-5.805zM9.609 15.601V8.408l6.264 3.602z"/></svg> },
                  { label: 'TikTok', svg: <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 0 0-.79-.05 6.34 6.34 0 0 0-6.34 6.34 6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.33-6.34V8.69a8.18 8.18 0 0 0 4.78 1.52V6.76a4.85 4.85 0 0 1-1.01-.07z"/></svg> },
                ].map(({ label, svg }) => (
                  <a key={label} href="#" aria-label={label} style={{ width: '34px', height: '34px', borderRadius: '50%', border: '1px solid rgba(247,244,238,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'rgba(247,244,238,0.7)', textDecoration: 'none', transition: 'border-color 0.2s' }}>
                    {svg}
                  </a>
                ))}
              </div>
            </div>

            <div>
              <p style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#c9b28f', marginBottom: '1rem' }}>Categories</p>
              {['Health','Fitness','Recovery','Mental Health','Style','Gear'].map((item) => (
                <Link key={item} href={`/category/${item.toLowerCase().replace(' ','-')}`} style={{ display: 'block', fontSize: '13px', color: 'rgba(247,244,238,0.6)', textDecoration: 'none', marginBottom: '0.5rem' }}>
                  {item}
                </Link>
              ))}
            </div>

            <div>
              <p style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#c9b28f', marginBottom: '1rem' }}>Company</p>
              {['Our Story','Editorial Policy','Contact','Advertise','Newsletter'].map((item) => (
                <Link key={item} href={`/${item.toLowerCase().replace(' ','-')}`} style={{ display: 'block', fontSize: '13px', color: 'rgba(247,244,238,0.6)', textDecoration: 'none', marginBottom: '0.5rem' }}>
                  {item}
                </Link>
              ))}
            </div>

            <div>
              <p style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#c9b28f', marginBottom: '1rem' }}>Legal</p>
              {['Privacy Policy','Terms of Use','Cookie Policy','Sitemap'].map((item) => (
                <Link key={item} href={`/${item.toLowerCase().replace(/ /g,'-')}`} style={{ display: 'block', fontSize: '13px', color: 'rgba(247,244,238,0.6)', textDecoration: 'none', marginBottom: '0.5rem' }}>
                  {item}
                </Link>
              ))}
            </div>

          </div>

          {/* SEATTLE */}
          <div style={{ textAlign: 'center', padding: '2rem 0', borderTop: '1px solid rgba(247,244,238,0.1)', borderBottom: '1px solid rgba(247,244,238,0.1)', marginBottom: '1.5rem' }}>
            <p style={{ margin: '0 0 0.4rem 0', fontSize: '11px', fontWeight: 700, letterSpacing: '0.2em', textTransform: 'uppercase', color: 'rgba(247,244,238,0.35)' }}>
              FOUNDED IN <span style={{ fontFamily: 'Georgia, serif', fontSize: '18px', fontWeight: 400, textTransform: 'none', letterSpacing: '0.02em', color: 'rgba(247,244,238,0.65)', fontStyle: 'normal' }}>Seattle</span>
            </p>
            <p style={{ margin: 0, fontSize: '12px', color: 'rgba(247,244,238,0.3)', letterSpacing: '0.08em' }}>
              — <span style={{ fontFamily: 'Georgia, serif', fontStyle: 'italic', color: 'rgba(247,244,238,0.4)' }}>with love</span> <span style={{ color: '#c0392b' }}>♥</span> —
            </p>
          </div>

          {/* BOTTOM BAR */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
            <p style={{ fontSize: '11px', color: 'rgba(247,244,238,0.3)', margin: 0 }}>
              © {new Date().getFullYear()} DudeMD. All rights reserved.
            </p>

            {/* RISE MEDIA NETWORK — built in code */}
            <div style={{ textAlign: 'right' }}>
              <p style={{ margin: '0 0 2px 0', fontSize: '11px', color: 'rgba(247,244,238,0.25)', letterSpacing: '0.08em' }}>A publication of</p>
              <div style={{ display: 'inline-block' }}>
                <p style={{ margin: 0, fontSize: '18px', fontWeight: 800, letterSpacing: '0.15em', textTransform: 'uppercase', color: 'rgba(247,244,238,0.55)', lineHeight: 1, fontFamily: 'system-ui, sans-serif' }}>RISE</p>
                <p style={{ margin: 0, fontSize: '7px', fontWeight: 600, letterSpacing: '0.35em', textTransform: 'uppercase', color: 'rgba(247,244,238,0.3)', lineHeight: 1.4 }}>MEDIA &nbsp; NETWORK</p>
              </div>
            </div>
          </div>

        </div>
      </div>
    </footer>
  )
}