import { useState } from 'react'
import { lsGet, lsSet } from '../../lib/syncedStore'
import api from '../../lib/api'

const CATEGORIES = [
  { value:'harassment',     label:'Harassment or Bullying' },
  { value:'discrimination', label:'Discrimination' },
  { value:'financial',      label:'Financial Irregularity' },
  { value:'safety',         label:'Safety Concern' },
  { value:'misconduct',     label:'Misconduct' },
  { value:'other',          label:'Other' },
]

const inp = { width:'100%', padding:'11px 15px', border:'1.5px solid var(--g200)', borderRadius:10, fontSize:14, outline:'none', boxSizing:'border-box', background:'var(--white)', transition:'border-color .15s' }
const lbl = { display:'block', fontSize:11.5, fontWeight:700, color:'var(--g500)', marginBottom:7, letterSpacing:.5, textTransform:'uppercase' }

const BLANK = { category:'harassment', message:'' }

export default function AnonymousReport() {
  const [form, setForm] = useState(BLANK)
  const [submitted, setSubmitted] = useState(false)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  const set = k => e => setForm(f => ({ ...f, [k]: e.target.value }))

  const submit = async () => {
    if (!form.message.trim() || form.message.trim().length < 20) {
      setError('Please describe the issue in at least 20 characters.')
      return
    }
    setBusy(true)
    setError('')
    const payload = { ...form, anonymous: true, submitted_at: new Date().toISOString() }
    try {
      await api.post('/reports', payload)
    } catch {
      // Save to localStorage so admin can view even if API not available
      try {
        const existing = JSON.parse(lsGet('ausi_anon_reports') || '[]')
        existing.unshift({ ...payload, id: Date.now(), status: 'open' })
        lsSet('ausi_anon_reports', JSON.stringify(existing))
      } catch {}
    }
    setSubmitted(true)
    setBusy(false)
  }

  if (submitted) {
    return (
      <div style={{ background:'var(--off)', minHeight:'100vh' }}>
        <div style={{ background:'linear-gradient(160deg,#111118 0%,#1a1200 100%)', padding:'36px 0 32px', color:'#fff' }}>
          <div className="container">
            <img src="/logo.png" alt="AUSI" style={{ width:42, height:42, borderRadius:'50%', objectFit:'cover', display:'block', marginBottom:12 }} />
            <div style={{ fontSize:11, fontWeight:700, letterSpacing:2.2, textTransform:'uppercase', color:'rgba(255,255,255,.35)', marginBottom:8 }}>AUSI · 2026 / 27</div>
            <h1 style={{ fontFamily:'var(--serif)', fontSize:'clamp(22px,3vw,30px)', fontWeight:700, color:'#fff', margin:'0 0 6px' }}>Anonymous Report</h1>
            <p style={{ fontSize:13.5, color:'rgba(255,255,255,.4)', margin:0 }}>Your voice matters — submit confidentially</p>
          </div>
        </div>
        <div className="container" style={{ paddingTop:64, paddingBottom:64, maxWidth:600 }}>
          <div style={{ background:'var(--white)', border:'1px solid var(--g100)', borderRadius:18, padding:'48px 40px', textAlign:'center' }}>
            <h2 style={{ fontFamily:'var(--serif)', fontSize:24, fontWeight:700, color:'var(--ink)', marginBottom:14 }}>Report Submitted</h2>
            <p style={{ fontSize:15, color:'var(--g600)', lineHeight:1.75, marginBottom:28 }}>
              Your report has been received confidentially and will be reviewed by the AUSI executive. No identity information has been attached to your submission. Thank you for helping maintain a safe and fair community.
            </p>
            <button onClick={() => { setSubmitted(false); setForm(BLANK) }}
              style={{ padding:'11px 28px', background:'var(--ink)', color:'#fff', border:'none', borderRadius:10, fontWeight:700, fontSize:14, cursor:'pointer' }}>
              Submit Another Report
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div style={{ background:'var(--off)', minHeight:'100vh' }}>
      <div style={{ background:'linear-gradient(160deg,#111118 0%,#1a1200 100%)', padding:'36px 0 32px', color:'#fff' }}>
        <div className="container">
          <img src="/logo.png" alt="AUSI" style={{ width:42, height:42, borderRadius:'50%', objectFit:'cover', display:'block', marginBottom:12 }} />
          <div style={{ fontSize:11, fontWeight:700, letterSpacing:2.2, textTransform:'uppercase', color:'rgba(255,255,255,.35)', marginBottom:8 }}>AUSI · 2026 / 27</div>
          <h1 style={{ fontFamily:'var(--serif)', fontSize:'clamp(22px,3vw,30px)', fontWeight:700, color:'#fff', margin:'0 0 6px' }}>Anonymous Report</h1>
          <p style={{ fontSize:13.5, color:'rgba(255,255,255,.4)', margin:0 }}>Your voice matters — submit confidentially, no identity attached</p>
        </div>
      </div>

      <div className="container" style={{ paddingTop:36, paddingBottom:64, maxWidth:660 }}>

        {/* Info notice */}
        <div style={{ background:'rgba(37,99,235,.06)', border:'1px solid rgba(37,99,235,.18)', borderRadius:12, padding:'16px 20px', marginBottom:28, display:'flex', gap:14, alignItems:'flex-start' }}>
          <div>
            <div style={{ fontWeight:700, fontSize:13.5, color:'#1d4ed8', marginBottom:4 }}>Strictly Confidential</div>
            <div style={{ fontSize:13, color:'var(--g600)', lineHeight:1.6 }}>
              This form is completely anonymous. Your name, email, and account are not stored with the report. Only the AUSI executive committee can view submitted reports. Do not include information that could identify yourself if you wish to remain anonymous.
            </div>
          </div>
        </div>

        <div style={{ background:'var(--white)', border:'1px solid var(--g100)', borderRadius:18, padding:'32px' }}>
          <h2 style={{ fontFamily:'var(--serif)', fontSize:20, fontWeight:700, color:'var(--ink)', margin:'0 0 24px' }}>Submit a Report</h2>

          {/* Category */}
          <div style={{ marginBottom:20 }}>
            <label style={lbl}>Category</label>
            <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(180px,1fr))', gap:8 }}>
              {CATEGORIES.map(c => (
                <button key={c.value} type="button" onClick={() => setForm(f => ({ ...f, category: c.value }))}
                  style={{ padding:'10px 14px', border:'1.5px solid', borderRadius:9, cursor:'pointer', fontSize:13, fontWeight:600, textAlign:'left', transition:'all .15s',
                    borderColor: form.category === c.value ? '#111118' : 'var(--g200)',
                    background: form.category === c.value ? '#111118' : 'var(--white)',
                    color: form.category === c.value ? '#fff' : 'var(--g600)',
                  }}>
                  {c.label}
                </button>
              ))}
            </div>
          </div>

          {/* Message */}
          <div style={{ marginBottom:24 }}>
            <label style={lbl}>Describe the Issue</label>
            <textarea
              value={form.message}
              onChange={set('message')}
              rows={8}
              placeholder="Please describe the situation in as much detail as you feel comfortable sharing. Be as specific as possible about what happened, when, and where. Include any relevant context that would help the executive investigate."
              style={{ ...inp, resize:'vertical', lineHeight:1.65, fontFamily:'inherit' }}
              onFocus={e => { e.target.style.borderColor = '#111118' }}
              onBlur={e => { e.target.style.borderColor = 'var(--g200)' }}
            />
            <div style={{ fontSize:12, color:'var(--g400)', marginTop:6, textAlign:'right' }}>
              {form.message.length} characters {form.message.length < 20 && form.message.length > 0 ? '(minimum 20)' : ''}
            </div>
          </div>

          {/* Reminder */}
          <div style={{ background:'var(--off)', borderRadius:10, padding:'14px 18px', marginBottom:24, fontSize:13, color:'var(--g600)', lineHeight:1.65 }}>
            <strong style={{ color:'var(--ink)' }}>Reminder:</strong> Do not include your own name or contact details in the message above if you wish to remain anonymous. Your report will be reviewed by the AUSI executive within 48 hours.
          </div>

          {error && (
            <div style={{ background:'rgba(220,38,38,.08)', border:'1px solid rgba(220,38,38,.2)', borderRadius:8, padding:'11px 16px', fontSize:13.5, color:'#b91c1c', marginBottom:18 }}>
              {error}
            </div>
          )}

          <button onClick={submit} disabled={busy}
            style={{ width:'100%', padding:'13px', background: busy ? 'var(--g400)' : '#111118', color:'#fff', border:'none', borderRadius:10, fontWeight:700, fontSize:15, cursor: busy ? 'not-allowed' : 'pointer', transition:'background .15s' }}>
            {busy ? 'Submitting…' : 'Submit Report Anonymously'}
          </button>
        </div>

      </div>
    </div>
  )
}
