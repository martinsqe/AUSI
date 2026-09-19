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
const sel = (hasErr) => ({ ...inp(hasErr), cursor:'pointer', appearance:'auto' })
const errStyle = { fontSize:12, color:'var(--red)', marginTop:4, display:'block' }
const legendStyle = { fontSize:10.5, fontWeight:700, letterSpacing:2, textTransform:'uppercase', color:'var(--g400)', marginBottom:18, display:'block' }
const fieldsetStyle = { border:'none', padding:0, margin:'0 0 28px' }
const req = <span style={{ color:'var(--red)' }}>*</span>

// The join form only collects these basic fields for now — names, gender,
// phone, email, university and course.
const REQUIRED = ['surname', 'last_name', 'sex', 'phone', 'email', 'university_name', 'field_of_study']

// Module-scope so they aren't remounted on every keystroke (which drops focus)
function Text({ form, errors, set, name, label, placeholder, type = 'text', optional }) {
  return (
    <div data-field={name}>
      <label style={lbl}>{label} {!optional && req}</label>
      <input type={type} style={inp(errors[name])} placeholder={placeholder}
             value={form[name]} onChange={set(name)} />
      {errors[name] && <span style={errStyle}>{errors[name]}</span>}
    </div>
  )
}
function Select({ form, errors, set, name, label, options, optional }) {
  return (
    <div data-field={name}>
      <label style={lbl}>{label} {!optional && req}</label>
      <select style={sel(errors[name])} value={form[name]} onChange={set(name)}>
        <option value="">Select…</option>
        {options.map(o => <option key={o} value={o}>{o}</option>)}
      </select>
      {errors[name] && <span style={errStyle}>{errors[name]}</span>}
    </div>
  )
}

const EMPTY = {
  surname:'', middle_name:'', last_name:'', sex:'', phone:'', email:'',
  university_id:'', university_name:'', field_of_study:'',
}

export default function Join() {
  const [form, setForm] = useState(EMPTY)
  const [errors, setErrors]   = useState({})
  const [loading, setLoading] = useState(false)
  const [apiError, setApiError] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [universities, setUniversities] = useState([])
  const [uniSelect, setUniSelect]       = useState('')
  const [uniOther, setUniOther]         = useState('')

  useEffect(() => {
    const list = getUniversities()
    setUniversities([...list].sort((a, b) => a.name.localeCompare(b.name)))
  }, [])

  const set = (k) => (e) => {
    const val = e.target.value
    setForm(f => ({ ...f, [k]: val }))
    if (errors[k]) setErrors(er => ({ ...er, [k]: undefined }))
  }

  const handleUniChange = (e) => {
    const val = e.target.value
    setUniSelect(val)
    if (errors.university_name) setErrors(er => ({ ...er, university_name: undefined }))
    if (val === 'other') {
      setForm(f => ({ ...f, university_id:'', university_name: uniOther }))
    } else if (val) {
      const uni = universities.find(u => String(u.id) === val)
      const label = uni ? (uni.city ? `${uni.name}, ${uni.city}` : uni.name) : val
      setForm(f => ({ ...f, university_id:'', university_name: label }))
    } else {
      setForm(f => ({ ...f, university_id:'', university_name:'' }))
    }
  }
  const handleUniOther = (e) => {
    setUniOther(e.target.value)
    setForm(f => ({ ...f, university_id:'', university_name: e.target.value }))
  }

  const validate = () => {
    const e = {}
    for (const k of REQUIRED) if (!String(form[k] || '').trim()) e[k] = 'Required'
    if (form.email && !/\S+@\S+\.\S+/.test(form.email)) e.email = 'Enter a valid email'
    setErrors(e)
    if (Object.keys(e).length) {
      const first = document.querySelector(`[data-field="${Object.keys(e)[0]}"]`)
      first?.scrollIntoView({ behavior:'smooth', block:'center' })
    }
    return Object.keys(e).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setApiError('')
    if (!validate()) return
    setLoading(true)
    try {
      const fd = new FormData()
      Object.entries(form).forEach(([k, v]) => fd.append(k, v ?? ''))
      // Lets the backend know this university was hand-typed, not picked from
      // the list, so it can be added to the directory automatically.
      fd.append('is_new_university', uniSelect === 'other' ? 'true' : 'false')
      await api.post('/join-requests', fd)
      setSubmitted(true)
    } catch (err) {
      setApiError(err.response?.data?.error || 'Something went wrong. Please try again.')
      window.scrollTo({ top: 0, behavior: 'smooth' })
    } finally {
      setLoading(false)
    }
  }

  const row = { display:'grid', gridTemplateColumns:'1fr 1fr', gap:16, marginBottom:16 }
  const F = { form, errors, set }   // shared props for Text / Select

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
        <div className="container" style={{ maxWidth:640 }}>

          {submitted ? (
            <div style={{ background:'var(--white)', borderRadius:20, boxShadow:'var(--sh-lg)', border:'1px solid var(--g100)', padding:'48px 44px', textAlign:'center' }}>
              <h2 style={{ fontFamily:'var(--serif)', fontSize:22, fontWeight:700, color:'var(--ink)', marginBottom:10, marginTop:0 }}>
                Request Submitted!
              </h2>
              <p style={{ fontSize:14, color:'var(--g500)', lineHeight:1.7, maxWidth:420, margin:'0 auto 24px' }}>
                Your request to join AUSI has been received. Once a High Commission executive reviews and approves it,
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
                Fill in your details. The High Commision executive will review your request and email your login
                credentials upon approval. Already a member? <Link to="/login" style={{ color:'var(--ink)', fontWeight:700 }}>Sign in →</Link>
              </p>

              {apiError && (
                <div style={{ background:'rgba(168,32,43,.08)', border:'1px solid rgba(168,32,43,.2)', borderRadius:9, padding:'10px 14px', fontSize:13, color:'var(--red)', marginBottom:24 }}>
                  {apiError}
                </div>
              )}

              <form onSubmit={handleSubmit} noValidate>

                {/* Personal Information */}
                <fieldset style={fieldsetStyle}>
                  <legend style={legendStyle}>Personal Information</legend>
                  <div style={row} className="join-grid">
                    <Text {...F} name="surname"     label="Surname" placeholder="As on your passport" />
                    <Text {...F} name="middle_name" label="Middle Name" placeholder="Optional" optional />
                  </div>
                  <div style={row} className="join-grid">
                    <Text {...F} name="last_name" label="Last Name" placeholder="As on your passport" />
                    <Select {...F} name="sex" label="Gender" options={['Male', 'Female']} />
                  </div>
                  <div style={row} className="join-grid">
                    <Text {...F} name="phone" label="Mobile Number" type="tel" placeholder="+91 XXXXX XXXXX" />
                    <Text {...F} name="email" label="Email Address" type="email" placeholder="you@gmail.com" />
                  </div>
                </fieldset>

                {/* Academic Information */}
                <fieldset style={fieldsetStyle}>
                  <legend style={legendStyle}>Academic Information</legend>

                  <div style={{ marginBottom:16 }} data-field="university_name">
                    <label style={lbl}>University {req}</label>
                    <select style={sel(errors.university_name)} value={uniSelect} onChange={handleUniChange}>
                      <option value="">Select your university…</option>
                      {universities.map(u => (
                        <option key={u.id} value={u.id}>{u.city ? `${u.name}, ${u.city}` : u.name}</option>
                      ))}
                      <option value="other">Other (specify below)</option>
                    </select>
                    {uniSelect === 'other' && (
                      <input style={{ ...inp(errors.university_name), marginTop:8 }} placeholder="Type your university name"
                             value={uniOther} onChange={handleUniOther} />
                    )}
                    {errors.university_name && <span style={errStyle}>{errors.university_name}</span>}
                  </div>

                  <Text {...F} name="field_of_study" label="Course" placeholder="e.g. B.Tech Electronics & Communication" />
                </fieldset>

                <button
                  type="submit" disabled={loading}
                  style={{ width:'100%', padding:'14px 0', background:'var(--ink)', color:'var(--white)', fontSize:14.5, fontWeight:700, border:'none', borderRadius:10, cursor: loading ? 'wait' : 'pointer', letterSpacing:.3, opacity: loading ? .7 : 1 }}>
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
