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

const REQUIRED = [
  'surname', 'last_name', 'email', 'phone', 'sex', 'date_of_birth', 'place_of_birth',
  'marital_status', 'passport_number', 'passport_issue_date', 'passport_issue_place',
  'passport_expiry_date', 'permanent_address_uganda', 'present_address_india',
  'university_name', 'field_of_study', 'institution_address', 'date_of_joining',
  'expected_completion_date', 'prev_institution_1', 'sponsorship_type', 'sponsor_name',
  'guardian_name', 'guardian_address', 'guardian_phone', 'guardian_occupation',
]
const DOCS = [
  ['passport_photo',   'Passport-size photograph (PDF)'],
  ['admission_letter', 'Admission letter (PDF)'],
  ['passport',         'Passport — bio-data & photo pages (PDF)'],
  ['visa',             'Visa (PDF)'],
]
const MAX_FILE = 8 * 1024 * 1024

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
  surname:'', middle_name:'', last_name:'', email:'', phone:'',
  sex:'', date_of_birth:'', place_of_birth:'', marital_status:'',
  passport_number:'', passport_issue_date:'', passport_issue_place:'', passport_expiry_date:'',
  residential_permit_no:'', residential_permit_issue_date:'', residential_permit_expiry_date:'',
  permanent_address_uganda:'', present_address_india:'',
  university_id:'', university_name:'',
  field_of_study:'', institution_address:'',
  date_of_joining:'', expected_completion_date:'',
  prev_institution_1:'', prev_institution_2:'', employment_record:'',
  sponsorship_type:'', sponsor_name:'',
  guardian_name:'', guardian_address:'', guardian_phone:'', guardian_email:'', guardian_occupation:'',
  message:'',
}

export default function Join() {
  const [form, setForm] = useState(EMPTY)
  const [files, setFiles] = useState({ passport_photo:null, admission_letter:null, passport:null, visa:null })
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

  const setFile = (k) => (e) => {
    const f = e.target.files?.[0] || null
    setErrors(er => ({ ...er, [k]: undefined }))
    if (f && f.type !== 'application/pdf') {
      setErrors(er => ({ ...er, [k]: 'Must be a PDF file' }))
      setFiles(s => ({ ...s, [k]: null }))
      e.target.value = ''
      return
    }
    if (f && f.size > MAX_FILE) {
      setErrors(er => ({ ...er, [k]: 'File must be under 8 MB' }))
      setFiles(s => ({ ...s, [k]: null }))
      e.target.value = ''
      return
    }
    setFiles(s => ({ ...s, [k]: f }))
  }

  const validate = () => {
    const e = {}
    for (const k of REQUIRED) if (!String(form[k] || '').trim()) e[k] = 'Required'
    if (form.email && !/\S+@\S+\.\S+/.test(form.email)) e.email = 'Enter a valid email'
    if (form.guardian_email && !/\S+@\S+\.\S+/.test(form.guardian_email)) e.guardian_email = 'Enter a valid email'
    for (const [k] of DOCS) if (!files[k]) e[k] = 'Required'
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
      Object.entries(files).forEach(([k, f]) => { if (f) fd.append(k, f) })
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
                    <Select {...F} name="sex" label="Sex" options={['Male', 'Female']} />
                  </div>
                  <div style={row} className="join-grid">
                    <Text {...F} name="date_of_birth" label="Date of Birth" type="date" />
                    <Text {...F} name="place_of_birth" label="Place of Birth" placeholder="e.g. Masaka" />
                  </div>
                  <div style={row} className="join-grid">
                    <Select {...F} name="marital_status" label="Marital Status" options={['Single', 'Married', 'Divorced']} />
                    <Text {...F} name="phone" label="Telephone Number" type="tel" placeholder="+91 XXXXX XXXXX" />
                  </div>
                  <Text {...F} name="email" label="Email Address" type="email" placeholder="you@gmail.com" />
                </fieldset>

                {/* Passport & Residential Permit */}
                <fieldset style={fieldsetStyle}>
                  <legend style={legendStyle}>Passport &amp; Residential Permit</legend>
                  <div style={row} className="join-grid">
                    <Text {...F} name="passport_number" label="Passport Number" placeholder="A00000000" />
                    <Text {...F} name="passport_issue_place" label="Place of Issue" placeholder="e.g. Kampala" />
                  </div>
                  <div style={row} className="join-grid">
                    <Text {...F} name="passport_issue_date" label="Date of Issue" type="date" />
                    <Text {...F} name="passport_expiry_date" label="Expiry Date" type="date" />
                  </div>
                  <Text {...F} name="residential_permit_no" label="Residential Permit No." placeholder="Optional" optional />
                  <div style={{ ...row, marginTop:16 }} className="join-grid">
                    <Text {...F} name="residential_permit_issue_date" label="Permit — Date of Issue" type="date" optional />
                    <Text {...F} name="residential_permit_expiry_date" label="Permit — Date of Expiry" type="date" optional />
                  </div>
                </fieldset>

                {/* Addresses */}
                <fieldset style={fieldsetStyle}>
                  <legend style={legendStyle}>Addresses</legend>
                  <div style={{ marginBottom:16 }} data-field="permanent_address_uganda">
                    <label style={lbl}>Permanent Address in Uganda {req}</label>
                    <textarea rows={2} style={inp(errors.permanent_address_uganda)} placeholder="Village / town, municipality, district"
                              value={form.permanent_address_uganda} onChange={set('permanent_address_uganda')} />
                    {errors.permanent_address_uganda && <span style={errStyle}>{errors.permanent_address_uganda}</span>}
                  </div>
                  <div data-field="present_address_india">
                    <label style={lbl}>Present Address in India {req}</label>
                    <textarea rows={2} style={inp(errors.present_address_india)} placeholder="Area, city, state"
                              value={form.present_address_india} onChange={set('present_address_india')} />
                    {errors.present_address_india && <span style={errStyle}>{errors.present_address_india}</span>}
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

                  <div style={{ marginBottom:16 }}>
                    <Text {...F} name="field_of_study" label="Present Course of Study" placeholder="e.g. B.Tech Electronics & Communication" />
                  </div>
                  <div style={{ marginBottom:16 }} data-field="institution_address">
                    <label style={lbl}>Address of the Institution / College {req}</label>
                    <textarea rows={2} style={inp(errors.institution_address)} placeholder="Full address of your institution"
                              value={form.institution_address} onChange={set('institution_address')} />
                    {errors.institution_address && <span style={errStyle}>{errors.institution_address}</span>}
                  </div>
                  <div style={row} className="join-grid">
                    <Text {...F} name="date_of_joining" label="Date of Joining" type="date" />
                    <Text {...F} name="expected_completion_date" label="Expected Date of Completion" type="date" />
                  </div>
                  <div style={{ marginBottom:16 }}>
                    <Text {...F} name="prev_institution_1" label="Last Institution attended in Uganda" placeholder="Most recent school / college" />
                  </div>
                  <div style={{ marginBottom:16 }}>
                    <Text {...F} name="prev_institution_2" label="Previous Institution attended in Uganda" placeholder="Optional" optional />
                  </div>
                  <div data-field="employment_record">
                    <label style={lbl}>Employment Record in Uganda / Abroad</label>
                    <textarea rows={2} style={inp(errors.employment_record)} placeholder="If any — otherwise leave blank"
                              value={form.employment_record} onChange={set('employment_record')} />
                  </div>
                </fieldset>

                {/* Sponsorship */}
                <fieldset style={fieldsetStyle}>
                  <legend style={legendStyle}>Sponsorship</legend>
                  <div style={row} className="join-grid">
                    <Select {...F} name="sponsorship_type" label="Sponsorship" options={['Private', 'Government']} />
                    <Text {...F} name="sponsor_name" label="Name of Sponsor" placeholder="e.g. ICCR / Self / Parent" />
                  </div>
                </fieldset>

                {/* Parent / Guardian */}
                <fieldset style={fieldsetStyle}>
                  <legend style={legendStyle}>Parent / Guardian</legend>
                  <div style={{ marginBottom:16 }}>
                    <Text {...F} name="guardian_name" label="Parent / Guardian's Name" placeholder="Full name" />
                  </div>
                  <div style={{ marginBottom:16 }} data-field="guardian_address">
                    <label style={lbl}>Parent / Guardian's Address {req}</label>
                    <textarea rows={2} style={inp(errors.guardian_address)} placeholder="Address in Uganda"
                              value={form.guardian_address} onChange={set('guardian_address')} />
                    {errors.guardian_address && <span style={errStyle}>{errors.guardian_address}</span>}
                  </div>
                  <div style={row} className="join-grid">
                    <Text {...F} name="guardian_phone" label="Parent / Guardian's Telephone" type="tel" placeholder="+256 ..." />
                    <Text {...F} name="guardian_email" label="Parent / Guardian's Email" type="email" placeholder="Optional" optional />
                  </div>
                  <Text {...F} name="guardian_occupation" label="Parent / Guardian's Occupation" placeholder="e.g. Teacher" />
                </fieldset>

                {/* Additional info */}
                <fieldset style={fieldsetStyle}>
                  <legend style={legendStyle}>Additional Information</legend>
                  <div data-field="message">
                    <label style={lbl}>Any other information (non-confidential)</label>
                    <textarea rows={3} style={inp(errors.message)} placeholder="Optional"
                              value={form.message} onChange={set('message')} />
                  </div>
                </fieldset>

                {/* Documents */}
                <fieldset style={fieldsetStyle}>
                  <legend style={legendStyle}>Documents — PDF only</legend>
                  <p style={{ fontSize:12.5, color:'var(--g500)', margin:'0 0 16px', lineHeight:1.6 }}>
                    Upload each document as a separate PDF file (max 8&nbsp;MB each).
                  </p>
                  {DOCS.map(([name, label]) => (
                    <div key={name} data-field={name} style={{ marginBottom:16 }}>
                      <label style={lbl}>{label} {req}</label>
                      <input type="file" accept="application/pdf,.pdf" onChange={setFile(name)}
                             style={{ ...inp(errors[name]), padding:'8px 10px', fontSize:12.5, cursor:'pointer' }} />
                      {files[name] && !errors[name] && (
                        <span style={{ fontSize:12, color:'var(--g500)', marginTop:4, display:'block' }}>
                          ✓ {files[name].name} ({(files[name].size / 1024 / 1024).toFixed(1)} MB)
                        </span>
                      )}
                      {errors[name] && <span style={errStyle}>{errors[name]}</span>}
                    </div>
                  ))}
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
