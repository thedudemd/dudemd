
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
              <div style={{ display: 'flex', gap: '1rem' }}>
                {['Instagram','X','Facebook','YouTube'].map((label) => (
                  <a key={label} href="#" aria-label={label} style={{ width: '32px', height: '32px', borderRadius: '50%', border: '1px solid rgba(247,244,238,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'rgba(247,244,238,0.6)', fontSize: '10px', textDecoration: 'none' }}>
                    {label.charAt(0)}
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

          <div style={{ textAlign: 'center', padding: '2rem 0', borderTop: '1px solid rgba(247,244,238,0.1)', borderBottom: '1px solid rgba(247,244,238,0.1)', marginBottom: '1.5rem' }}>
            <p style={{ margin: 0, letterSpacing: '0.15em', textTransform: 'uppercase', fontSize: '11px', fontWeight: 700, color: 'rgba(247,244,238,0.4)' }}>
              FOUNDED IN{' '}
              <span style={{ fontFamily: 'Georgia, serif', fontSize: '16px', fontWeight: 400, textTransform: 'none', letterSpacing: '0.02em', color: 'rgba(247,244,238,0.7)', fontStyle: 'italic' }}>Seattle</span>
              {', '}
              <span style={{ fontFamily: 'Georgia, serif', fontStyle: 'italic', fontSize: '13px', textTransform: 'none', letterSpacing: '0', color: 'rgba(247,244,238,0.5)', fontWeight: 400 }}>with love</span>
              {' '}
              <span style={{ color: '#c0392b', fontSize: '13px' }}>♥</span>
            </p>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
            <p style={{ fontSize: '11px', color: 'rgba(247,244,238,0.3)', margin: 0 }}>
              © {new Date().getFullYear()} DudeMD. All rights reserved.
            </p>
            <p style={{ fontSize: '11px', color: 'rgba(247,244,238,0.3)', margin: 0, letterSpacing: '0.05em' }}>
              A <span style={{ color: 'rgba(247,244,238,0.5)', fontWeight: 600 }}>Rise Media Network</span> Publication
            </p>
          </div>

        </div>
      </div>
    </footer>
  )
}