import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { dashboardFor } from '../lib/roles'
import api from '../lib/api'

export default function Login() {
  const [form, setForm]         = useState({ email:'', password:'' })
  const [error, setError]       = useState('')
  const [loading, setLoading]   = useState(false)
  const [retrying, setRetrying] = useState(false)
  const [showPw, setShowPw]     = useState(false)
  const navigate  = useNavigate()
  const { login } = useAuth()

  const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }))

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setLoading(true)
    setRetrying(false)
    try {
      let data
      try {
        const res = await api.post('/auth/login', form)
        data = res.data
      } catch (firstErr) {
        // Network error (server cold-starting or unreachable) — retry once
        if (!firstErr.response) {
          setRetrying(true)
          await new Promise(r => setTimeout(r, 2000))
          setRetrying(false)
          const res = await api.post('/auth/login', form)
          data = res.data
        } else {
          throw firstErr
        }
      }
      login(data.token, data.user)
      navigate(dashboardFor(data.user.role), { replace: true })
    } catch (err) {
      const isNetworkErr = !err.response
      setError(
        isNetworkErr
          ? 'Cannot reach the server. Please check your connection and try again.'
          : err.response?.data?.error || 'Something went wrong. Please try again.'
      )
    } finally {
      setLoading(false)
      setRetrying(false)
    }
  }

  return (
    <div style={{ paddingTop:'var(--nav)', background:'var(--off)', display:'flex', alignItems:'center', justifyContent:'center', minHeight:'calc(100vh - var(--nav))', padding:'48px 24px' }}>
      <div style={{ background:'var(--white)', borderRadius:22, boxShadow:'var(--sh-lg)', border:'1px solid var(--g100)', width:'100%', maxWidth:420, padding:44 }}>

        <div style={{ display:'flex', alignItems:'center', gap:11, marginBottom:28 }}>
          <img src="/logo.png" alt="AUSI" style={{ width:42, height:42, borderRadius:'50%', objectFit:'cover', flexShrink:0 }} />
          <div>
            <strong style={{ fontFamily:'var(--serif)', fontSize:17 }}>AUSI</strong>
            <div style={{ fontSize:11, color:'var(--g400)', marginTop:1 }}>Member Portal</div>
          </div>
        </div>

        <h2 className="h2" style={{ marginBottom:6 }}>Welcome back</h2>
        <p className="sub-sm" style={{ marginBottom:28 }}>Sign in to your AUSI account</p>

        <form onSubmit={handleSubmit}>
          <div className="fg">
            <label className="fl">Email Address</label>
            <input className="fi" type="email" placeholder="you@university.ac.in" value={form.email} onChange={set('email')} required />
          </div>
          <div className="fg">
            <label className="fl">Password</label>
            <div style={{ position:'relative' }}>
              <input className="fi" type={showPw ? 'text' : 'password'} placeholder="••••••••" value={form.password} onChange={set('password')} required style={{ paddingRight:44 }} />
              <button type="button" onClick={() => setShowPw(v => !v)} tabIndex={-1}
                style={{ position:'absolute', right:12, top:'50%', transform:'translateY(-50%)', background:'none', border:'none', cursor:'pointer', padding:4, color:'var(--g400)', display:'flex', alignItems:'center' }}>
                {showPw ? (
                  /* eye-off */
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/>
                    <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/>
                    <line x1="1" y1="1" x2="23" y2="23"/>
                  </svg>
                ) : (
                  /* eye */
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                    <circle cx="12" cy="12" r="3"/>
                  </svg>
                )}
              </button>
            </div>
          </div>

          <div style={{ textAlign:'right', margin:'-8px 0 20px' }}>
            <Link to="/forgot-password" style={{ fontSize:12, color:'var(--g400)', textDecoration:'none' }}>Forgot password?</Link>
          </div>

          {error && (
            <div style={{ background:'rgba(168,32,43,.08)', border:'1px solid rgba(168,32,43,.2)', borderRadius:9, padding:'10px 14px', fontSize:13, color:'var(--red)', marginBottom:16 }}>
              {error}
            </div>
          )}

          <button className="btn btn-primary" style={{ width:'100%', justifyContent:'center' }} type="submit" disabled={loading}>
            {retrying ? 'Connecting…' : loading ? 'Signing in…' : 'Sign In'}
          </button>
        </form>

        <p style={{ fontSize:13, color:'var(--g400)', textAlign:'center', marginTop:20 }}>
          No account?{' '}
          <Link to="/join" style={{ color:'var(--ink)', fontWeight:700 }}>Join AUSI →</Link>
        </p>
        <p style={{ fontSize:12, color:'var(--g400)', textAlign:'center', marginTop:8 }}>
          <Link to="/">← Back to AUSI website</Link>
        </p>
      </div>
    </div>
  )
}
