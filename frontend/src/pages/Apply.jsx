import { useState } from 'react'

const UNIVERSITIES = [
  'RK University, Rajkot',
  'Marwadi University, Rajkot',
  'Gujarat University, Ahmedabad',
  'Parul University, Vadodara',
  'Pune University, Pune',
  'Mumbai University, Mumbai',
  'MATS University, Raipur',
  'GITAM University, Visakhapatnam',
  'Andhra University, Visakhapatnam',
  'KL University, Vijayawada',
  'Kerala University, Thiruvananthapuram',
  'SRM University, Chennai',
  'Royal Global University, Guwahati',
  'KIIT University, Bhubaneswar',
  'Delhi University, New Delhi',
  'Lovely Professional University, Punjab',
  'Graphic Era University, Dehradun',
  'LNCT University, Bhopal',
  'Chandigarh University',
]

const LEVELS = [
  'Certificate / Diploma',
  'Undergraduate (Bachelor\'s Degree)',
  'Postgraduate (Master\'s Degree)',
  'Doctorate (PhD)',
]

const field = (label, required = true) => ({ label, required })

export default function Apply() {
  const [form, setForm] = useState({
    fullName: '', dob: '', nationality: 'Ugandan', phone: '', email: '',
    level: '', course: '', universities: [],
    oLevel: null, aLevel: null, otherDocs: null,
  })
  const [submitted, setSubmitted] = useState(false)
  const [errors, setErrors] = useState({})

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const toggleUni = (u) => set('universities',
    form.universities.includes(u)
      ? form.universities.filter(x => x !== u)
      : [...form.universities, u]
  )

  const validate = () => {
    const e = {}
    if (!form.fullName.trim()) e.fullName = 'Required'
    if (!form.dob) e.dob = 'Required'
    if (!form.phone.trim()) e.phone = 'Required'
    if (!form.email.trim()) e.email = 'Required'
    if (!form.level) e.level = 'Required'
    if (!form.course.trim()) e.course = 'Required'
    if (form.universities.length === 0) e.universities = 'Select at least one university'
    if (!form.oLevel) e.oLevel = 'Required'
    if (!form.aLevel) e.aLevel = 'Required'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (validate()) setSubmitted(true)
  }

  if (submitted) {
    return (
      <div style={{ paddingTop:'var(--nav)', minHeight:'70vh', display:'flex', alignItems:'center', justifyContent:'center' }}>
        <div style={{ textAlign:'center', maxWidth:520, padding:'0 24px' }}>
          <h2 style={{ fontFamily:'var(--serif)', fontSize:28, fontWeight:700, color:'var(--ink)', marginBottom:14 }}>Application Received</h2>
          <p style={{ fontSize:15, color:'var(--g600)', lineHeight:1.8, marginBottom:28 }}>
            Thank you, <strong>{form.fullName}</strong>. Your application has been submitted. The AUSI Admissions Team will review your details and reach out to you at <strong>{form.email}</strong> within 3–5 working days.
          </p>
          <a href="/" style={{ display:'inline-block', background:'var(--ink)', color:'var(--white)', padding:'12px 28px', borderRadius:10, textDecoration:'none', fontSize:14, fontWeight:700 }}>Back to Home</a>
        </div>
      </div>
    )
  }

  return (
    <div style={{ paddingTop:'var(--nav)' }}>

      <div className="page-hero">
        <div className="container">
          <span className="eyebrow">Admissions</span>
          <h1>Apply to Study in India</h1>
          <p className="sub">Fill in your details below. The AUSI Admissions Team will review your application and guide you through the next steps.</p>
          <div className="india-strip"><span/><span/><span/></div>
        </div>
      </div>

      <section className="section">
        <div className="container" style={{ maxWidth:740 }}>
          <form onSubmit={handleSubmit} noValidate>

            {/* ── Personal Information ── */}
            <fieldset style={{ border:'none', padding:0, marginBottom:40 }}>
              <legend style={{ fontSize:10.5, fontWeight:700, letterSpacing:2, textTransform:'uppercase', color:'var(--g400)', marginBottom:20, display:'block' }}>Personal Information</legend>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:18 }} className="apply-grid-2">

                <div>
                  <label style={lbl}>Full Name <span style={{ color:'var(--red)' }}>*</span></label>
                  <input style={inp(errors.fullName)} placeholder=" Enter name in Capital Letters"
                    value={form.fullName} onChange={e => set('fullName', e.target.value)} />
                  {errors.fullName && <span style={err}>{errors.fullName}</span>}
                </div>

                <div>
                  <label style={lbl}>Date of Birth <span style={{ color:'var(--red)' }}>*</span></label>
                  <input type="date" style={inp(errors.dob)}
                    value={form.dob} onChange={e => set('dob', e.target.value)} />
                  {errors.dob && <span style={err}>{errors.dob}</span>}
                </div>

                <div>
                  <label style={lbl}>Nationality</label>
                  <input style={inp()} value={form.nationality}
                    onChange={e => set('nationality', e.target.value)} />
                </div>

                <div>
                  <label style={lbl}>Phone Number <span style={{ color:'var(--red)' }}>*</span></label>
                  <input type="tel" style={inp(errors.phone)} placeholder="+256 7XX XXX XXX"
                    value={form.phone} onChange={e => set('phone', e.target.value)} />
                  {errors.phone && <span style={err}>{errors.phone}</span>}
                </div>

                <div style={{ gridColumn:'1 / -1' }}>
                  <label style={lbl}>Email Address <span style={{ color:'var(--red)' }}>*</span></label>
                  <input type="email" style={inp(errors.email)} placeholder="you@gmail.com"
                    value={form.email} onChange={e => set('email', e.target.value)} />
                  {errors.email && <span style={err}>{errors.email}</span>}
                </div>

              </div>
            </fieldset>

            {/* ── Academic Interest ── */}
            <fieldset style={{ border:'none', padding:0, marginBottom:40 }}>
              <legend style={{ fontSize:10.5, fontWeight:700, letterSpacing:2, textTransform:'uppercase', color:'var(--g400)', marginBottom:20, display:'block' }}>Academic Interest</legend>

              <div style={{ marginBottom:18 }}>
                <label style={lbl}>Level of Education to Pursue <span style={{ color:'var(--red)' }}>*</span></label>
                <select style={inp(errors.level)} value={form.level} onChange={e => set('level', e.target.value)}>
                  <option value="">Select level…</option>
                  {LEVELS.map(l => <option key={l} value={l}>{l}</option>)}
                </select>
                {errors.level && <span style={err}>{errors.level}</span>}
              </div>

              <div>
                <label style={lbl}>Course / Programme of Interest <span style={{ color:'var(--red)' }}>*</span></label>
                <input style={inp(errors.course)} placeholder="e.g. Bachelor of Medicine and Surgery (MBBS)"
                  value={form.course} onChange={e => set('course', e.target.value)} />
                {errors.course && <span style={err}>{errors.course}</span>}
              </div>
            </fieldset>

            {/* ── Universities of Interest ── */}
            <fieldset style={{ border:'none', padding:0, marginBottom:40 }}>
              <legend style={{ fontSize:10.5, fontWeight:700, letterSpacing:2, textTransform:'uppercase', color:'var(--g400)', marginBottom:6, display:'block' }}>Universities of Interest <span style={{ color:'var(--red)' }}>*</span></legend>
              <p style={{ fontSize:12.5, color:'var(--g500)', marginBottom:16 }}>Select all universities you would like to be considered for.</p>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'8px 20px' }} className="apply-grid-2">
                {UNIVERSITIES.map(u => (
                  <label key={u} style={{ display:'flex', alignItems:'center', gap:10, cursor:'pointer', padding:'8px 12px', borderRadius:8, border:`1px solid ${form.universities.includes(u) ? 'var(--ink)' : 'var(--g100)'}`, background: form.universities.includes(u) ? 'var(--off)' : 'var(--white)', transition:'all .15s' }}>
                    <input type="checkbox" checked={form.universities.includes(u)} onChange={() => toggleUni(u)}
                      style={{ width:14, height:14, accentColor:'var(--ink)', flexShrink:0 }} />
                    <span style={{ fontSize:13, color:'var(--ink)', lineHeight:1.35 }}>{u}</span>
                  </label>
                ))}
              </div>
              {errors.universities && <span style={{ ...err, display:'block', marginTop:8 }}>{errors.universities}</span>}
            </fieldset>

            {/* ── Academic Documents ── */}
            <fieldset style={{ border:'none', padding:0, marginBottom:48 }}>
              <legend style={{ fontSize:10.5, fontWeight:700, letterSpacing:2, textTransform:'uppercase', color:'var(--g400)', marginBottom:20, display:'block' }}>Academic Documents</legend>
              <p style={{ fontSize:12.5, color:'var(--g500)', marginBottom:20 }}>Upload certified PDF copies of your documents. Maximum file size: 5MB each.</p>

              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:18 }} className="apply-grid-3">

                <div>
                  <label style={lbl}>O-Level Results (UCE) <span style={{ color:'var(--red)' }}>*</span></label>
                  <label style={{ display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', gap:6, padding:'24px 16px', border:`2px dashed ${errors.oLevel ? 'var(--red)' : 'var(--g200)'}`, borderRadius:10, cursor:'pointer', background:'var(--off)', textAlign:'center' }}>
                    <span style={{ fontSize:13, color: form.oLevel ? 'var(--ink)' : 'var(--g500)', fontWeight: form.oLevel ? 600 : 400 }}>
                      {form.oLevel ? form.oLevel.name : 'Click to upload PDF'}
                    </span>
                    <span style={{ fontSize:11.5, color:'var(--g400)' }}>PDF only · Max 5MB</span>
                    <input type="file" accept=".pdf" style={{ display:'none' }}
                      onChange={e => { if (e.target.files[0]) set('oLevel', e.target.files[0]) }} />
                  </label>
                  {errors.oLevel && <span style={err}>{errors.oLevel}</span>}
                </div>

                <div>
                  <label style={lbl}>A-Level Results (UACE) <span style={{ color:'var(--red)' }}>*</span></label>
                  <label style={{ display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', gap:6, padding:'24px 16px', border:`2px dashed ${errors.aLevel ? 'var(--red)' : 'var(--g200)'}`, borderRadius:10, cursor:'pointer', background:'var(--off)', textAlign:'center' }}>
                    <span style={{ fontSize:13, color: form.aLevel ? 'var(--ink)' : 'var(--g500)', fontWeight: form.aLevel ? 600 : 400 }}>
                      {form.aLevel ? form.aLevel.name : 'Click to upload PDF'}
                    </span>
                    <span style={{ fontSize:11.5, color:'var(--g400)' }}>PDF only · Max 5MB</span>
                    <input type="file" accept=".pdf" style={{ display:'none' }}
                      onChange={e => { if (e.target.files[0]) set('aLevel', e.target.files[0]) }} />
                  </label>
                  {errors.aLevel && <span style={err}>{errors.aLevel}</span>}
                </div>

                <div>
                  <label style={lbl}>Other Documents <span style={{ fontSize:11, color:'var(--g400)', fontWeight:400 }}>(optional)</span></label>
                  <label style={{ display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', gap:6, padding:'24px 16px', border:'2px dashed var(--g200)', borderRadius:10, cursor:'pointer', background:'var(--off)', textAlign:'center' }}>
                    <span style={{ fontSize:13, color: form.otherDocs ? 'var(--ink)' : 'var(--g500)', fontWeight: form.otherDocs ? 600 : 400 }}>
                      {form.otherDocs ? form.otherDocs.name : 'Click to upload PDF'}
                    </span>
                    <span style={{ fontSize:11.5, color:'var(--g400)', lineHeight:1.5 }}>Degree certificates, transcripts, etc.</span>
                    <input type="file" accept=".pdf" style={{ display:'none' }}
                      onChange={e => { if (e.target.files[0]) set('otherDocs', e.target.files[0]) }} />
                  </label>
                </div>

              </div>
            </fieldset>

            <button type="submit"
              style={{ width:'100%', padding:'15px 0', background:'var(--ink)', color:'var(--white)', fontSize:15, fontWeight:700, border:'none', borderRadius:10, cursor:'pointer', letterSpacing:.3 }}>
              Submit Application
            </button>

          </form>
        </div>
      </section>

      <style>{`
        .apply-grid-2 { grid-template-columns: 1fr 1fr; }
        .apply-grid-3 { grid-template-columns: 1fr 1fr 1fr; }
        @media (max-width: 700px) {
          .apply-grid-2 { grid-template-columns: 1fr !important; }
          .apply-grid-3 { grid-template-columns: 1fr !important; }
        }
      `}</style>

    </div>
  )
}

/* ── Shared style helpers ── */
const lbl = { display:'block', fontSize:12, fontWeight:700, color:'var(--g600)', marginBottom:6, letterSpacing:.3 }
const err = { fontSize:12, color:'var(--red)', marginTop:4 }
const inp = (hasErr) => ({
  width:'100%', boxSizing:'border-box',
  padding:'10px 13px', fontSize:13.5, color:'var(--ink)',
  border:`1.5px solid ${hasErr ? 'var(--red)' : 'var(--g200)'}`,
  borderRadius:8, outline:'none', background:'var(--white)',
  transition:'border-color .15s',
  appearance:'none',
})
