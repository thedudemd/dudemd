'use client'

import { useState, useEffect, useRef } from 'react'
import { signInWithGoogle, signInWithApple, signInWithFacebook, signInWithEmailPassword } from '@/lib/auth/supabase-auth'

function GoogleIcon() {
  return (
    <svg viewBox="0 0 24 24" style={{width:20,height:20,flexShrink:0}} xmlns="http://www.w3.org/2000/svg">
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
    </svg>
  )
}

function AppleIcon() {
  return (
    <svg viewBox="0 0 24 24" style={{width:20,height:20,flexShrink:0,fill:'#f7f4ee'}} xmlns="http://www.w3.org/2000/svg">
      <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
    </svg>
  )
}

function FacebookIcon() {
  return (
    <svg viewBox="0 0 24 24" style={{width:20,height:20,flexShrink:0,fill:'#fff'}} xmlns="http://www.w3.org/2000/svg">
      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
    </svg>
  )
}

export default function SignInPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const videoRef = useRef<HTMLVideoElement>(null)

  useEffect(() => {
    const v = videoRef.current
    if (!v) return
    v.load()
    v.play().catch(() => {})
  }, [])

  async function handleGoogle() {
    try { setLoading('google'); setError(null); await signInWithGoogle() }
    catch (err) { console.error("Google auth error:", err); setError('Google sign-in failed.'); setLoading(null) }
  }
  async function handleApple() {
    try { setLoading('apple'); setError(null); await signInWithApple() }
    catch { setError('Apple sign-in not yet available.'); setLoading(null) }
  }
  async function handleFacebook() {
    try { setLoading('facebook'); setError(null); await signInWithFacebook() }
    catch { setError('Facebook sign-in not yet available.'); setLoading(null) }
  }
  async function handleEmailPassword(e: React.FormEvent) {
    e.preventDefault()
    if (!email || !password) { setError('Email and password required'); return }
    try {
      setLoading('magic'); setError(null)
      await signInWithEmailPassword(email, password)
      window.location.href = '/'
    } catch (err: any) {
      setError(err.message || 'Sign in failed.')
    } finally { setLoading(null) }
  }

  const btn: React.CSSProperties = {display:'flex',alignItems:'center',justifyContent:'center',gap:10,padding:'12px 16px',borderRadius:8,fontSize:13,fontWeight:500,cursor:'pointer',border:'none',width:'100%'}

  return (
    <>
      <style>{`
        .signin-wrapper { display:flex; width:100%; min-height:calc(100vh - 120px); font-family:system-ui,sans-serif; }
        .signin-left { width:45%; background-color:#f7f4ee; display:flex; flex-direction:column; justify-content:center; padding:40px 48px; box-sizing:border-box; }
        .signin-right { width:55%; position:relative; overflow:hidden; background:#0e1a2b; min-height:calc(100vh - 120px); }
        @media (max-width:768px) {
          .signin-wrapper { flex-direction:column; }
          .signin-left { width:100%; padding:40px 24px; }
          .signin-right { display:none; }
        }
      `}</style>
      <div className="signin-wrapper">
        <div className="signin-left">
          <div style={{display:'flex',flexDirection:'column',gap:18,maxWidth:'320px',width:'100%',margin:'0 auto'}}>
            <h1 style={{fontSize:26,fontWeight:700,color:'#0e1a2b',margin:0,textAlign:'center'}}>Sign in</h1>

            <div style={{height:1,background:'#d1cfc9'}}/>
            {error && <div style={{background:'#fdecea',color:'#a32d2d',border:'1px solid #f09595',borderRadius:8,padding:'10px 14px',fontSize:13}}>{error}</div>}
            <div style={{display:'flex',flexDirection:'column',gap:9}}>
              <button onClick={handleGoogle} disabled={loading!==null} style={{...btn,background:'#fff',border:'1px solid #d1cfc9',color:'#1B1D21'}}>
                <GoogleIcon/>{loading==='google'?'Connecting…':'Continue with Google'}
              </button>
              <button onClick={handleApple} disabled={loading!==null} style={{...btn,background:'#1B1D21',color:'#f7f4ee'}}>
                <AppleIcon/>{loading==='apple'?'Connecting…':'Continue with Apple'}
              </button>
              <button onClick={handleFacebook} disabled={loading!==null} style={{...btn,background:'#1877F2',color:'#fff'}}>
                <FacebookIcon/>{loading==='facebook'?'Connecting…':'Continue with Facebook'}
              </button>
            </div>
            <div style={{display:'flex',alignItems:'center',gap:8}}>
              <div style={{flex:1,height:1,background:'#d1cfc9'}}/>
              <span style={{fontSize:11,color:'#4A5563'}}>or</span>
              <div style={{flex:1,height:1,background:'#d1cfc9'}}/>
            </div>
            <div style={{display:'flex',flexDirection:'column',gap:8}}>
              <label style={{fontSize:10,fontWeight:600,textTransform:'uppercase',letterSpacing:'0.12em',color:'#4A5563'}}>Email address</label>
              <input type="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="you@example.com" style={{padding:'11px 14px',borderRadius:8,border:'1px solid #d1cfc9',fontSize:13,background:'#fff',color:'#0e1a2b',outline:'none',width:'100%',boxSizing:'border-box'}}/>
              <label style={{fontSize:10,fontWeight:600,textTransform:'uppercase',letterSpacing:'0.12em',color:'#4A5563'}}>Password</label>
              <input type="password" value={password} onChange={e=>setPassword(e.target.value)} placeholder="Your password" onKeyDown={e=>e.key==='Enter'&&handleEmailPassword(e)} style={{padding:'11px 14px',borderRadius:8,border:'1px solid #d1cfc9',fontSize:13,background:'#fff',color:'#0e1a2b',outline:'none',width:'100%',boxSizing:'border-box'}}/>
              <button onClick={handleEmailPassword} disabled={loading!==null||!email||!password} style={{...btn,background:'#0e1a2b',color:'#f7f4ee',fontWeight:600,opacity:(!email||!password||loading!==null)?0.5:1}}>
                {loading==='magic'?'Signing in…':'Sign In'}
              </button>
            </div>
            <p style={{fontSize:11,color:'#4A5563',textAlign:'center',margin:0,lineHeight:1.6}}>
              By signing in you agree to our <a href="/terms-of-use" style={{color:'#0e1a2b'}}>Terms</a> and <a href="/privacy-policy" style={{color:'#0e1a2b'}}>Privacy Policy</a>.
            </p>
            <p style={{fontSize:12,color:'#4A5563',textAlign:'center',margin:0}}>
              Don't have an account? <a href="/newsletter" style={{color:'#c9b28f',fontWeight:600}}>Sign up free</a>
            </p>
            <p style={{fontSize:10,color:'#4A5563',textAlign:'center',margin:0}}>© {new Date().getFullYear()} DudeMD. A Rise Media Network publication.</p>
          </div>
        </div>
        <div className="signin-right">
          <video ref={videoRef} autoPlay muted loop playsInline preload="auto" style={{position:'absolute',top:0,left:0,width:'100%',height:'100%',objectFit:'cover',objectPosition:'40% center'}}>
            <source src="https://res.cloudinary.com/dligiz9tp/video/upload/q_auto,vc_h264/v1779323453/Modern_Wellness_For_Real_Life_3_yrsn3z.mp4" type="video/mp4"/>
          </video>
          <div style={{position:'absolute',inset:0,background:'linear-gradient(to top,rgba(14,26,43,0.5) 0%,rgba(14,26,43,0.05) 40%,transparent 100%)'}}/>
        </div>
      </div>
    </>
  )
}
