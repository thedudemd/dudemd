interface TrendingPost {
  postUrl: string
  headline: string
  excerpt?: string
}

interface TrendingOnFacebookBlockProps {
  posts: TrendingPost[]
  title?: string
}

export default function TrendingOnFacebookBlock({ 
  posts, 
  title = "Trending on Facebook" 
}: TrendingOnFacebookBlockProps) {
  return (
    <div style={{
      backgroundColor: '#0e1a2b',
      padding: '2rem',
      borderRadius: '8px',
      margin: '3rem 0'
    }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '0.75rem',
        marginBottom: '1.5rem'
      }}>
        <svg width="24" height="24" viewBox="0 0 24 24" fill="#1877F2">
          <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
        </svg>
        <h3 style={{
          fontSize: '1.25rem',
          fontWeight: 700,
          color: '#f7f4ee',
          margin: 0
        }}>
          {title}
        </h3>
      </div>

      <div style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '1.5rem'
      }}>
        {posts.map((post, idx) => (
          <a 
            key={idx}
            href={post.postUrl}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: 'block',
              padding: '1.5rem',
              backgroundColor: 'rgba(255,255,255,0.05)',
              borderRadius: '6px',
              textDecoration: 'none',
              border: '1px solid rgba(255,255,255,0.1)',
              transition: 'all 0.2s'
            }}
          >
            <h4 style={{
              fontSize: '1rem',
              fontWeight: 600,
              color: '#f7f4ee',
              marginBottom: '0.5rem',
              lineHeight: 1.4
            }}>
              {post.headline}
            </h4>
            {post.excerpt && (
              <p style={{
                fontSize: '14px',
                color: 'rgba(247,244,238,0.7)',
                lineHeight: 1.6,
                margin: 0
              }}>
                {post.excerpt}
              </p>
            )}
          </a>
        ))}
      </div>
    </div>
  )
}
