import Link from 'next/link'

export default function Footer() {
  return (
    <footer style={{ borderTop: '1px solid #ede8df', backgroundColor: '#f7f4ee', padding: '3rem 0' }}>
      <div className="container-content">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '2rem' }}>
          <div>
            <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '1.25rem', color: '#0e1a2b' }}>
              Dude<span style={{ color: '#c9b28f' }}>MD</span>
            </span>
            <p style={{ fontSize: '13px', color: '#9a9085', marginTop: '0.5rem', maxWidth: '20rem' }}>
              Media for Men. Built Different.
            </p>
          </div>
          <nav style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap' }}>
            {['Health','Fitness','Recovery','Mental Health','Style','Gear'].map((item) => (
              <Link key={item} href={`/category/${item.toLowerCase().replace(' ','-')}`} style={{ fontSize: '12px', color: '#9a9085', textDecoration: 'none' }}>
                {item}
              </Link>
            ))}
          </nav>
        </div>
        <div style={{ marginTop: '2rem', paddingTop: '1.5rem', borderTop: '1px solid #ede8df' }}>
          <p style={{ fontSize: '11px', color: '#9a9085' }}>© {new Date().getFullYear()} DudeMD. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}
