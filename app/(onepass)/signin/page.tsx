'use client'

import { useState, useEffect, useRef } from 'react'
import { signInWithGoogle, signInWithFacebook, signInWithEmailPassword } from '@/lib/auth/supabase-auth'
import { supabase } from '@/lib/supabase/client'

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
  const [showPassword, setShowPassword] = useState(false)
  const [resetSent, setResetSent] = useState(false)
  const [resetLoading, setResetLoading] = useState(false)
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
  async function handleFacebook() {
    try { setLoading('facebook'); setError(null); await signInWithFacebook() }
    catch { setError('Facebook sign-in not yet available.'); setLoading(null) }
  }
  async function handleForgotPassword() {
    if (!email) { setError('Enter your email first'); return }
    setResetLoading(true)
    setError(null)
    await supabase.auth.resetPasswordForEmail(email, { redirectTo: 'https://www.dudemd.com/auth/reset-password' })
    setResetSent(true)
    setResetLoading(false)
    setTimeout(() => setResetSent(false), 5000)
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
        .signin-left { width:45%; background-color:var(--color-cream); display:flex; flex-direction:column; justify-content:center; padding:40px 48px; box-sizing:border-box; }
        .signin-right { width:55%; position:relative; overflow:hidden; background:var(--color-navy); min-height:calc(100vh - 120px); }
        @media (max-width:768px) {
          .signin-wrapper { flex-direction:column; }
          .signin-left { width:100%; padding:40px 24px; }
          .signin-right { display:none; }
        }
      `}</style>
      <div className="signin-wrapper">
        <div className="signin-left">
          <div style={{display:'flex',flexDirection:'column',gap:18,maxWidth:'320px',width:'100%',margin:'0 auto'}}>
            <h1 style={{fontSize:26,fontWeight:700,color:'var(--color-navy)',margin:0,textAlign:'center'}}>Sign in</h1>
            <div style={{height:1,background:'#d1cfc9'}}/>
            {error && <div style={{background:'#fdecea',color:'#a32d2d',border:'1px solid #f09595',borderRadius:8,padding:'10px 14px',fontSize:13}}>{error}</div>}
            {resetSent && <div style={{background:'#e8f5ea',color:'#2d7a3a',border:'1px solid #2d7a3a',borderRadius:8,padding:'10px 14px',fontSize:13}}>Reset email sent — check your inbox</div>}
            <div style={{display:'flex',flexDirection:'column',gap:9}}>
              <button onClick={handleGoogle} disabled={loading!==null} style={{...btn,background:'#fff',border:'1px solid #d1cfc9',color:'var(--color-charcoal)'}}>
                <GoogleIcon/>{loading==='google'?'Connecting…':'Continue with Google'}
              </button>
              <button onClick={handleFacebook} disabled={loading!==null} style={{...btn,background:'#1877F2',color:'#fff'}}>
                <FacebookIcon/>{loading==='facebook'?'Connecting…':'Continue with Facebook'}
              </button>
              <button onClick={async()=>{try{setLoading('linkedin');setError(null);const{error}=await supabase.auth.signInWithOAuth({provider:'linkedin_oidc',options:{redirectTo:'https://www.dudemd.com/auth/confirm'}});if(error)throw error}catch{setError('LinkedIn sign-in failed.');setLoading(null)}}} disabled={loading!==null} style={{...btn,background:'#0A66C2',color:'#fff'}}>
                <svg viewBox="0 0 24 24" style={{width:20,height:20,flexShrink:0,fill:'#fff'}} xmlns="http://www.w3.org/2000/svg"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
                {loading==='linkedin'?'Connecting…':'Continue with LinkedIn'}
              </button>
            </div>
            <div style={{display:'flex',alignItems:'center',gap:8}}>
              <div style={{flex:1,height:1,background:'#d1cfc9'}}/>
              <span style={{fontSize:11,color:'var(--color-slate)'}}>or</span>
              <div style={{flex:1,height:1,background:'#d1cfc9'}}/>
            </div>
            <div style={{display:'flex',flexDirection:'column',gap:8}}>
              <label style={{fontSize:10,fontWeight:600,textTransform:'uppercase',letterSpacing:'0.12em',color:'var(--color-slate)'}}>Email address</label>
              <input type="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="you@example.com" style={{padding:'11px 14px',borderRadius:8,border:'1px solid #d1cfc9',fontSize:13,background:'#fff',color:'var(--color-navy)',outline:'none',width:'100%',boxSizing:'border-box'}}/>
              <div style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
                <label style={{fontSize:10,fontWeight:600,textTransform:'uppercase',letterSpacing:'0.12em',color:'var(--color-slate)'}}>Password</label>
                <button type="button" onClick={handleForgotPassword} disabled={resetLoading} style={{background:'none',border:'none',fontSize:11,color:resetSent?'#2d7a3a':'var(--color-gold)',cursor:'pointer',fontWeight:600,padding:0}}>{resetLoading?'Sending...':resetSent?'✓ Email sent!':'Forgot password?'}</button>
              </div>
              <div style={{position:'relative'}}>
                <input type={showPassword?'text':'password'} value={password} onChange={e=>setPassword(e.target.value)} placeholder="Your password" onKeyDown={e=>e.key==='Enter'&&handleEmailPassword(e)} style={{padding:'11px 40px 11px 14px',borderRadius:8,border:'1px solid #d1cfc9',fontSize:13,background:'#fff',color:'var(--color-navy)',outline:'none',width:'100%',boxSizing:'border-box'}}/>
                <button type="button" onClick={()=>setShowPassword(s=>!s)} style={{position:'absolute',right:10,top:'50%',transform:'translateY(-50%)',background:'none',border:'none',cursor:'pointer',fontSize:16,padding:0}}>{showPassword?'🙈':'👁'}</button>
              </div>
              <button onClick={handleEmailPassword} disabled={loading!==null||!email||!password} style={{...btn,background:'var(--color-navy)',color:'var(--color-cream)',fontWeight:600,opacity:(!email||!password||loading!==null)?0.5:1}}>
                {loading==='magic'?'Signing in…':'Sign In'}
              </button>
            </div>
            <p style={{fontSize:11,color:'var(--color-slate)',textAlign:'center',margin:0,lineHeight:1.6}}>
              By signing in you agree to our <a href="/terms-of-use" style={{color:'var(--color-navy)'}}>Terms</a> and <a href="/privacy-policy" style={{color:'var(--color-navy)'}}>Privacy Policy</a>.
            </p>
            <p style={{fontSize:12,color:'var(--color-slate)',textAlign:'center',margin:0}}>
              Don't have an account? <a href="/join" style={{color:'var(--color-gold)',fontWeight:600}}>Sign up free</a>
            </p>
            <p style={{fontSize:10,color:'var(--color-slate)',textAlign:'center',margin:0}}>© {new Date().getFullYear()} DudeMD. A Rise Media Network publication.</p>
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