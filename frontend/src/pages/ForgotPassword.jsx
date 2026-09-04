import { useState, useRef, useEffect } from 'react'
import { Link } from 'react-router-dom'
import api from '../lib/api'

const inp = (hasErr) => ({
  width: '100%', boxSizing: 'border-box', padding: '11px 14px', fontSize: 14,
  color: 'var(--ink)', border: `1.5px solid ${hasErr ? 'var(--red)' : 'var(--g200)'}`,
  borderRadius: 8, outline: 'none', background: 'var(--white)', transition: 'border-color .15s',
})
const errStyle = { fontSize: 12, color: 'var(--red)', marginTop: 5, display: 'block' }
const lbl = { display: 'block', fontSize: 11.5, fontWeight: 700, color: 'var(--g500)', marginBottom: 6, letterSpacing: .5, textTransform: 'uppercase' }

/* ── Step 1: Enter email ──────────────────────────────────── */
function StepEmail({ onSent }) {
  const [email, setEmail]     = useState('')
  const [error, setError]     = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    if (!email.trim()) return setError('Email is required.')
    if (!/\S+@\S+\.\S+/.test(email)) return setError('Enter a valid email address.')
    setLoading(true)
    try {
      await api.post('/auth/forgot-password', { email: email.trim() })
      onSent(email.trim())
    } catch (err) {
      setError(err.response?.data?.error || 'Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} noValidate>
      <h2 style={{ fontFamily:'var(--serif)', fontSize:22, fontWeight:700, color:'var(--ink)', margin:'0 0 6px' }}>
        Forgot Password
      </h2>
      <p style={{ fontSize:13.5, color:'var(--g500)', margin:'0 0 28px', lineHeight:1.6 }}>
        Enter your registered email address and we'll send you a 6-digit code to reset your password.
      </p>

      <div style={{ marginBottom: 20 }}>
        <label style={lbl}>Email Address</label>
        <input
          type="email" value={email} onChange={e => setEmail(e.target.value)}
          placeholder="you@university.ac.in" style={inp(!!error)}
          autoFocus
        />
        {error && <span style={errStyle}>{error}</span>}
      </div>

      <button type="submit" disabled={loading}
        style={{ width:'100%', padding:'13px', background:'var(--ink)', color:'#fff', border:'none', borderRadius:8, fontWeight:700, fontSize:14.5, cursor: loading ? 'wait' : 'pointer', opacity: loading ? .7 : 1 }}>
        {loading ? 'Sending code…' : 'Send Reset Code'}
      </button>

      <p style={{ fontSize:13, color:'var(--g400)', textAlign:'center', marginTop:20 }}>
        Remembered it?{' '}
        <Link to="/login" style={{ color:'var(--ink)', fontWeight:700 }}>Sign in →</Link>
      </p>
    </form>
  )
}

/* ── OTP digit input ─────────────────────────────────────── */
function OtpInput({ value, onChange }) {
  const refs = [useRef(), useRef(), useRef(), useRef(), useRef(), useRef()]
  const digits = value.split('').concat(Array(6).fill('')).slice(0, 6)

  const handleKey = (i, e) => {
    if (e.key === 'Backspace') {
      const next = digits.slice(); next[i] = ''
      onChange(next.join(''))
      if (i > 0) refs[i - 1].current?.focus()
    } else if (/^\d$/.test(e.key)) {
      const next = digits.slice(); next[i] = e.key
      onChange(next.join(''))
      if (i < 5) refs[i + 1].current?.focus()
    } else if (e.key === 'ArrowLeft' && i > 0) {
      refs[i - 1].current?.focus()
    } else if (e.key === 'ArrowRight' && i < 5) {
      refs[i + 1].current?.focus()
    }
    e.preventDefault()
  }

  const handlePaste = (e) => {
    const text = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6)
    if (text) { onChange(text.padEnd(6, '').slice(0, 6)); refs[Math.min(text.length, 5)].current?.focus() }
    e.preventDefault()
  }

  return (
    <div style={{ display:'flex', gap:10, justifyContent:'center' }}>
      {digits.map((d, i) => (
        <input
          key={i} ref={refs[i]}
          type="text" inputMode="numeric" maxLength={1}
          value={d} readOnly
          onKeyDown={e => handleKey(i, e)}
          onPaste={handlePaste}
          style={{
            width:48, height:56, textAlign:'center', fontSize:24, fontWeight:800,
            fontFamily:'var(--serif)', color:'var(--ink)',
            border:`2px solid ${d ? 'var(--ink)' : 'var(--g200)'}`,
            borderRadius:10, outline:'none', background:'var(--white)', cursor:'text',
          }}
        />
      ))}
    </div>
  )
}

/* ── Step 2: Enter OTP + new password ────────────────────── */
function StepReset({ email, onSuccess, onResend }) {
  const [otp, setOtp]               = useState('')
  const [password, setPassword]     = useState('')
  const [confirm, setConfirm]       = useState('')
  const [showPw, setShowPw]         = useState(false)
  const [errors, setErrors]         = useState({})
  const [apiError, setApiError]     = useState('')
  const [loading, setLoading]       = useState(false)
  const [resending, setResending]   = useState(false)
  const [countdown, setCountdown]   = useState(60)

  useEffect(() => {
    if (countdown <= 0) return
    const t = setTimeout(() => setCountdown(c => c - 1), 1000)
    return () => clearTimeout(t)
  }, [countdown])

  const handleResend = async () => {
    setResending(true)
    try {
      await api.post('/auth/forgot-password', { email })
      setCountdown(60)
      setOtp('')
      setApiError('')
    } catch (err) {
      setApiError(err.response?.data?.error || 'Could not resend. Please try again.')
    } finally {
      setResending(false)
    }
  }

  const validate = () => {
    const e = {}
    if (otp.length < 6)          e.otp      = 'Enter the full 6-digit code.'
    if (!password)               e.password  = 'Required.'
    else if (password.length < 8) e.password = 'Must be at least 8 characters.'
    if (password !== confirm)    e.confirm   = 'Passwords do not match.'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setApiError('')
    if (!validate()) return
    setLoading(true)
    try {
      await api.post('/auth/reset-password', { email, otp, new_password: password })
      onSuccess()
    } catch (err) {
      setApiError(err.response?.data?.error || 'Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} noValidate>
      <h2 style={{ fontFamily:'var(--serif)', fontSize:22, fontWeight:700, color:'var(--ink)', margin:'0 0 6px' }}>
        Enter Reset Code
      </h2>
      <p style={{ fontSize:13.5, color:'var(--g500)', margin:'0 0 28px', lineHeight:1.6 }}>
        We sent a 6-digit code to <strong style={{ color:'var(--ink)' }}>{email}</strong>.
        It expires in 10 minutes.
      </p>

      {/* OTP */}
      <div style={{ marginBottom: errors.otp ? 8 : 24 }}>
        <label style={{ ...lbl, textAlign:'center', display:'block', marginBottom:14 }}>One-Time Code</label>
        <OtpInput value={otp} onChange={setOtp} />
        {errors.otp && <span style={{ ...errStyle, textAlign:'center', display:'block', marginTop:10 }}>{errors.otp}</span>}
      </div>

      {/* Resend */}
      <div style={{ textAlign:'center', marginBottom:24 }}>
        {countdown > 0 ? (
          <span style={{ fontSize:12.5, color:'var(--g400)' }}>Resend code in {countdown}s</span>
        ) : (
          <button type="button" onClick={handleResend} disabled={resending}
            style={{ background:'none', border:'none', cursor:'pointer', fontSize:12.5, fontWeight:700, color:'var(--ink)', textDecoration:'underline', opacity: resending ? .5 : 1 }}>
            {resending ? 'Sending…' : 'Resend code'}
          </button>
        )}
      </div>

      {/* New password */}
      <div style={{ marginBottom:16 }}>
        <label style={lbl}>New Password</label>
        <div style={{ position:'relative' }}>
          <input
            type={showPw ? 'text' : 'password'}
            value={password} onChange={e => setPassword(e.target.value)}
            placeholder="At least 8 characters"
            style={{ ...inp(!!errors.password), paddingRight:44 }}
          />
          <button type="button" onClick={() => setShowPw(v => !v)} tabIndex={-1}
            style={{ position:'absolute', right:12, top:'50%', transform:'translateY(-50%)', background:'none', border:'none', cursor:'pointer', padding:4, color:'var(--g400)', display:'flex', alignItems:'center' }}>
            {showPw ? (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/>
                <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/>
                <line x1="1" y1="1" x2="23" y2="23"/>
              </svg>
            ) : (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                <circle cx="12" cy="12" r="3"/>
              </svg>
            )}
          </button>
        </div>
        {errors.password && <span style={errStyle}>{errors.password}</span>}
      </div>

      <div style={{ marginBottom:20 }}>
        <label style={lbl}>Confirm Password</label>
        <input
          type={showPw ? 'text' : 'password'}
          value={confirm} onChange={e => setConfirm(e.target.value)}
          placeholder="Repeat new password"
          style={inp(!!errors.confirm)}
        />
        {errors.confirm && <span style={errStyle}>{errors.confirm}</span>}
      </div>

      {apiError && (
        <div style={{ background:'rgba(168,32,43,.08)', border:'1px solid rgba(168,32,43,.2)', borderRadius:8, padding:'10px 14px', fontSize:13, color:'var(--red)', marginBottom:16 }}>
          {apiError}
        </div>
      )}

      <button type="submit" disabled={loading}
        style={{ width:'100%', padding:'13px', background:'var(--ink)', color:'#fff', border:'none', borderRadius:8, fontWeight:700, fontSize:14.5, cursor: loading ? 'wait' : 'pointer', opacity: loading ? .7 : 1 }}>
        {loading ? 'Resetting…' : 'Reset Password'}
      </button>

      <p style={{ fontSize:13, color:'var(--g400)', textAlign:'center', marginTop:16 }}>
        Wrong email?{' '}
        <button type="button" onClick={onResend}
          style={{ background:'none', border:'none', cursor:'pointer', fontSize:13, fontWeight:700, color:'var(--ink)', textDecoration:'underline', padding:0 }}>
          Go back
        </button>
      </p>
    </form>
  )
}

/* ── Step 3: Success ─────────────────────────────────────── */
function StepSuccess() {
  return (
    <div style={{ textAlign:'center' }}>
      <div style={{ width:64, height:64, borderRadius:'50%', background:'rgba(5,150,105,.1)', display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 20px' }}>
        <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="#059669" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="20 6 9 17 4 12"/>
        </svg>
      </div>
      <h2 style={{ fontFamily:'var(--serif)', fontSize:22, fontWeight:700, color:'var(--ink)', margin:'0 0 10px' }}>
        Password Reset!
      </h2>
      <p style={{ fontSize:14, color:'var(--g500)', lineHeight:1.7, maxWidth:340, margin:'0 auto 28px' }}>
        Your password has been updated successfully. You can now sign in with your new password.
      </p>
      <Link to="/login"
        style={{ display:'inline-block', background:'var(--ink)', color:'#fff', textDecoration:'none', fontWeight:700, fontSize:14, padding:'12px 32px', borderRadius:8 }}>
        Sign In →
      </Link>
    </div>
  )
}

/* ── Page ────────────────────────────────────────────────── */
export default function ForgotPassword() {
  const [step, setStep]   = useState('email')   // 'email' | 'reset' | 'done'
  const [email, setEmail] = useState('')

  return (
    <div style={{ paddingTop:'var(--nav)', background:'var(--off)', display:'flex', alignItems:'center', justifyContent:'center', minHeight:'calc(100vh - var(--nav))', padding:'48px 24px' }}>
      <div style={{ background:'var(--white)', borderRadius:22, boxShadow:'var(--sh-lg)', border:'1px solid var(--g100)', width:'100%', maxWidth:440, padding:44 }}>

        <div style={{ display:'flex', alignItems:'center', gap:11, marginBottom:32 }}>
          <img src="/logo.png" alt="AUSI" style={{ width:42, height:42, borderRadius:'50%', objectFit:'cover', flexShrink:0 }} />
          <div>
            <strong style={{ fontFamily:'var(--serif)', fontSize:17 }}>AUSI</strong>
            <div style={{ fontSize:11, color:'var(--g400)', marginTop:1 }}>Member Portal</div>
          </div>
        </div>

        {/* Step indicator */}
        {step !== 'done' && (
          <div style={{ display:'flex', gap:6, marginBottom:28 }}>
            {['email', 'reset'].map((s, i) => (
              <div key={s} style={{ flex:1, height:3, borderRadius:2, background: step === s || (s === 'email' && step === 'reset') ? 'var(--ink)' : 'var(--g200)' }} />
            ))}
          </div>
        )}

        {step === 'email' && (
          <StepEmail onSent={(e) => { setEmail(e); setStep('reset') }} />
        )}
        {step === 'reset' && (
          <StepReset
            email={email}
            onSuccess={() => setStep('done')}
            onResend={() => setStep('email')}
          />
        )}
        {step === 'done' && <StepSuccess />}

      </div>
    </div>
  )
}
