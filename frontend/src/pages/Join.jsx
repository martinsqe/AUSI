import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import api from '../lib/api'
import { getUniversities } from '../lib/universitiesStore'

const lbl = { display:'block', fontSize:12, fontWeight:700, color:'var(--g600)', marginBottom:6, letterSpacing:.3 }
const inp = (hasErr) => ({
  width:'100%', boxSizing:'border-box', padding:'10px 13px', fontSize:13.5,
  color:'var(--ink)', border:`1.5px solid ${hasErr ? 'var(--red)' : 'var(--g200)'}`,
  borderRadius:8, outline:'none', background:'var(--white)', transition:'border-color .15s',
})
const errStyle = { fontSize:12, color:'var(--red)', marginTop:4, display:'block' }

export default function Join() {
  const [form, setForm] = useState({
    full_name:'', email:'', phone:'',
    university_id: '', university_name: '',
    field_of_study:'', message:'',
  })
  const [errors, setErrors]   = useState({})
  const [loading, setLoading] = useState(false)
  const [apiError, setApiError] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [universities, setUniversities] = useState([])   // [{id, name, city}]
  const [uniSelect, setUniSelect]       = useState('')
  const [uniOther, setUniOther]         = useState('')

  // Load admin-managed AUSI chapter universities from the store
  useEffect(() => {
    const list = getUniversities()
    const sorted = [...list].sort((a, b) => a.name.localeCompare(b.name))
    setUniversities(sorted)
  }, [])

  const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }))

  const handleUniChange = (e) => {
    const val = e.target.value
    setUniSelect(val)
    if (val === 'other') {
      setForm(f => ({ ...f, university_id: '', university_name: uniOther }))
    } else if (val) {
      const uni = universities.find(u => String(u.id) === val)
      const label = uni ? (uni.city ? `${uni.name}, ${uni.city}` : uni.name) : val
      setForm(f => ({ ...f, university_id: '', university_name: label }))
    } else {
      setForm(f => ({ ...f, university_id: '', university_name: '' }))
    }
  }

  const handleUniOther = (e) => {
    setUniOther(e.target.value)
    setForm(f => ({ ...f, university_id: '', university_name: e.target.value }))
  }

  const validate = () => {
    const e = {}
    if (!form.full_name.trim())      e.full_name      = 'Required'
    if (!form.email.trim())          e.email          = 'Required'
    else if (!/\S+@\S+\.\S+/.test(form.email)) e.email = 'Enter a valid email'
    if (!form.phone.trim())          e.phone          = 'Required'
    if (!form.university_name.trim()) e.university_name = 'Required'
    if (!form.field_of_study.trim()) e.field_of_study = 'Required'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setApiError('')
    if (!validate()) return
    setLoading(true)
    try {
      await api.post('/join-requests', form)
      setSubmitted(true)
    } catch (err) {
      setApiError(err.response?.data?.error || 'Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ paddingTop:'var(--nav)' }}>

      <div className="page-hero">
        <div className="container">
          <span className="eyebrow">Membership</span>
          <h1>Join AUSI</h1>
          <p className="sub">Become part of the official community of Ugandan students across India.</p>
          <div className="india-strip"><span/><span/><span/></div>
        </div>
      </div>

      <section className="section" style={{ background:'var(--off)' }}>
        <div className="container" style={{ maxWidth:620 }}>

          {submitted ? (
            <div style={{ background:'var(--white)', borderRadius:20, boxShadow:'var(--sh-lg)', border:'1px solid var(--g100)', padding:'48px 44px', textAlign:'center' }}>
              <h2 style={{ fontFamily:'var(--serif)', fontSize:22, fontWeight:700, color:'var(--ink)', marginBottom:10, marginTop:0 }}>
                Request Submitted!
              </h2>
              <p style={{ fontSize:14, color:'var(--g500)', lineHeight:1.7, maxWidth:400, margin:'0 auto 24px' }}>
                Your request to join AUSI has been received. Once an administrator reviews and approves it,
                you will receive an email at <strong style={{ color:'var(--ink)' }}>{form.email}</strong> with your login credentials.
              </p>
              <Link to="/" style={{ display:'inline-block', background:'var(--ink)', color:'var(--white)', textDecoration:'none', fontWeight:700, fontSize:14, padding:'12px 28px', borderRadius:10 }}>
                Back to Home
              </Link>
            </div>
          ) : (
            <div style={{ background:'var(--white)', borderRadius:20, boxShadow:'var(--sh-lg)', border:'1px solid var(--g100)', padding:'40px 44px' }}>

              <h2 style={{ fontFamily:'var(--serif)', fontSize:22, fontWeight:700, color:'var(--ink)', marginBottom:6, marginTop:0 }}>Request to Join</h2>
              <p style={{ fontSize:13.5, color:'var(--g500)', marginBottom:32, lineHeight:1.6 }}>
                Fill in your details. An admin will review your request and email your login credentials upon approval.
                Already a member? <Link to="/login" style={{ color:'var(--ink)', fontWeight:700 }}>Sign in →</Link>
              </p>

              <form onSubmit={handleSubmit} noValidate>

                {/* Personal Info */}
                <fieldset style={{ border:'none', padding:0, margin:'0 0 28px' }}>
                  <legend style={{ fontSize:10.5, fontWeight:700, letterSpacing:2, textTransform:'uppercase', color:'var(--g400)', marginBottom:18, display:'block' }}>Personal Information</legend>

                  <div style={{ marginBottom:16 }}>
                    <label style={lbl}>Full Name <span style={{ color:'var(--red)' }}>*</span></label>
                    <input style={inp(errors.full_name)} placeholder="As on your passport" value={form.full_name} onChange={set('full_name')} />
                    {errors.full_name && <span style={errStyle}>{errors.full_name}</span>}
                  </div>

                  <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:16 }} className="join-grid">
                    <div>
                      <label style={lbl}>Email Address <span style={{ color:'var(--red)' }}>*</span></label>
                      <input type="email" style={inp(errors.email)} placeholder="you@gmail.com" value={form.email} onChange={set('email')} />
                      {errors.email && <span style={errStyle}>{errors.email}</span>}
                    </div>
                    <div>
                      <label style={lbl}>Phone Number <span style={{ color:'var(--red)' }}>*</span></label>
                      <input type="tel" style={inp(errors.phone)} placeholder="+91 XXXX XXX XXX" value={form.phone} onChange={set('phone')} />
                      {errors.phone && <span style={errStyle}>{errors.phone}</span>}
                    </div>
                  </div>
                </fieldset>

                {/* Academic Info */}
                <fieldset style={{ border:'none', padding:0, margin:'0 0 28px' }}>
                  <legend style={{ fontSize:10.5, fontWeight:700, letterSpacing:2, textTransform:'uppercase', color:'var(--g400)', marginBottom:18, display:'block' }}>Academic Information</legend>

                  <div style={{ marginBottom:16 }}>
                    <label style={lbl}>University <span style={{ color:'var(--red)' }}>*</span></label>
                    <select
                      style={{ ...inp(errors.university_name), cursor:'pointer', appearance:'auto' }}
                      value={uniSelect}
                      onChange={handleUniChange}
                    >
                      <option value="">Select your university…</option>
                      {universities.map(u => (
                        <option key={u.id} value={u.id}>
                          {u.city ? `${u.name}, ${u.city}` : u.name}
                        </option>
                      ))}
                      <option value="other">Other (specify below)</option>
                    </select>
                    {uniSelect === 'other' && (
                      <input
                        style={{ ...inp(errors.university_name), marginTop:8 }}
                        placeholder="Type your university name"
                        value={uniOther}
                        onChange={handleUniOther}
                      />
                    )}
                    {errors.university_name && <span style={errStyle}>{errors.university_name}</span>}
                  </div>

                  <div>
                    <label style={lbl}>Course / Programme <span style={{ color:'var(--red)' }}>*</span></label>
                    <input style={inp(errors.field_of_study)} placeholder="e.g. Bachelor of Medicine and Surgery " value={form.field_of_study} onChange={set('field_of_study')} />
                    {errors.field_of_study && <span style={errStyle}>{errors.field_of_study}</span>}
                  </div>
                </fieldset>

                {/* Optional Message */}

                {apiError && (
                  <div style={{ background:'rgba(168,32,43,.08)', border:'1px solid rgba(168,32,43,.2)', borderRadius:9, padding:'10px 14px', fontSize:13, color:'var(--red)', marginBottom:20 }}>
                    {apiError}
                  </div>
                )}

                <button
                  type="submit" disabled={loading}
                  style={{ width:'100%', padding:'14px 0', background:'var(--ink)', color:'var(--white)', fontSize:14.5, fontWeight:700, border:'none', borderRadius:10, cursor:'pointer', letterSpacing:.3 }}>
                  {loading ? 'Submitting…' : 'Submit Request'}
                </button>

                <p style={{ fontSize:12, color:'var(--g400)', textAlign:'center', marginTop:16, lineHeight:1.6 }}>
                  By submitting you agree to AUSI's community guidelines and terms of use.
                </p>
              </form>
            </div>
          )}

        </div>
      </section>

      <style>{`
        @media (max-width: 560px) {
          .join-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  )
}
