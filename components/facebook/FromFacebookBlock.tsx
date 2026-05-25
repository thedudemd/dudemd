import FacebookPostEmbed from './FacebookPostEmbed'

interface FromFacebookBlockProps {
  postUrl: string
  context?: string
}

export default function FromFacebookBlock({ postUrl, context }: FromFacebookBlockProps) {
  return (
    <div style={{ 
      backgroundColor: '#f7f4ee', 
      padding: '2rem', 
      borderRadius: '8px',
      border: '1px solid #ede8df',
      margin: '2rem 0'
    }}>
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        gap: '0.5rem',
        marginBottom: '1rem'
      }}>
        <svg width="20" height="20" viewBox="0 0 24 24" fill="#1877F2">
          <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
        </svg>
        <span style={{ 
          fontSize: '11px', 
          fontWeight: 700, 
          letterSpacing: '0.12em', 
          textTransform: 'uppercase',
          color: '#1877F2'
        }}>
          From Facebook
        </span>
      </div>
      
      {context && (
        <p style={{ 
          fontSize: '14px', 
          color: '#4A5563', 
          lineHeight: 1.6,
          marginBottom: '1rem'
        }}>
          {context}
        </p>
      )}
      
      <FacebookPostEmbed postUrl={postUrl} />
    </div>
  )
}
