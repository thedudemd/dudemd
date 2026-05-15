import Link from 'next/link'

export default function Nav() {
  return (
    <header style={{ borderBottom: '1px solid #ede8df', backgroundColor: '#f7f4ee' }}>
      <div className="container-content" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: '4rem' }}>
        <Link href="/" style={{ textDecoration: 'none' }}>
          <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '1.5rem', color: '#0e1a2b', letterSpacing: '-0.02em' }}>
            Dude<span style={{ color: '#c9b28f' }}>MD</span>
          </span>
        </Link>
        <nav style={{ display: 'flex', gap: '2rem' }}>
          {['Health','Fitness','Style','Gear'].map((item) => (
            <Link key={item} href={`/category/${item.toLowerCase()}`} style={{ fontSize: '13px', fontWeight: 500, color: '#4A5563', textDecoration: 'none', letterSpacing: '0.02em' }}>
              {item}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  )
}
