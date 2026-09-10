import { useState } from 'react'
import { lsGet, lsSet } from '../../lib/syncedStore'
import { useAuth } from '../../context/AuthContext'

const TYPES = {
  event:    { label: 'Post-Event Report',  color: '#2563eb', bg: 'rgba(37,99,235,.08)',   desc: 'Submit after every AUSI event you organise or attend at your university.' },
  semester: { label: '6-Month Report',     color: '#d97706', bg: 'rgba(217,119,6,.08)',   desc: 'Bi-annual welfare and activity summary — due every June and December.' },
  annual:   { label: 'Annual Report',      color: '#059669', bg: 'rgba(5,150,105,.08)',   desc: 'Comprehensive yearly overview of your university chapter — due every December.' },
}

const STATUS = {
  submitted:    { label: 'Submitted',    bg: 'rgba(37,99,235,.1)',  text: '#1d4ed8' },
  reviewed:     { label: 'Reviewed',     bg: 'rgba(217,119,6,.1)',  text: '#92400e' },
  acknowledged: { label: 'Acknowledged', bg: 'rgba(5,150,105,.1)',  text: '#065f46' },
}

const BLANK = {
  type: 'event', title: '', event_name: '', event_date: '',
  period: '', attendance_count: '',
  summary: '', challenges: '', achievements: '', recommendations: '',
}

const inp = { width:'100%', padding:'10px 14px', border:'1.5px solid var(--g200)', borderRadius:8, fontSize:14, outline:'none', boxSizing:'border-box', fontFamily:'inherit' }
const lbl = { display:'block', fontSize:11.5, fontWeight:700, color:'var(--g500)', marginBottom:6, letterSpacing:.5, textTransform:'uppercase' }
const fg  = { marginBottom:16 }

const load = () => { try { return JSON.parse(lsGet('ausi_rep_reports') || '[]') } catch { return [] } }
const persist = list => lsSet('ausi_rep_reports', JSON.stringify(list))

export default function RepReports() {
  const { user } = useAuth()
  const [reports, setReports] = useState(load)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm]         = useState(BLANK)
  const [errors, setErrors]     = useState({})
  const [expanded, setExpanded] = useState(null)

  const set = k => e => setForm(f => ({ ...f, [k]: e.target.value }))

  const validate = () => {
    const e = {}
    if (!form.title.trim())   e.title   = 'Required'
    if (!form.summary.trim()) e.summary = 'Required'
    if (form.type === 'event' && !form.event_name.trim()) e.event_name = 'Required'
    setErrors(e)
    return !Object.keys(e).length
  }

  const submit = () => {
    if (!validate()) return
    const entry = {
      ...form,
      id:           Date.now(),
      rep_id:       user?.id,
      rep_name:     user?.full_name || 'Rep',
      rep_email:    user?.email,
      university:   user?.university_name || 'Unknown University',
      submitted_at: new Date().toISOString(),
      status:       'submitted',
    }
    const updated = [entry, ...reports]
    setReports(updated)
    persist(updated)
    setForm(BLANK)
    setErrors({})
    setShowForm(false)
  }

  const myReports = reports.filter(r => r.rep_id === user?.id || r.rep_email === user?.email)

  const typeCount = t => myReports.filter(r => r.type === t).length

  return (
    <div style={{ background:'var(--off)', minHeight:'100vh' }}>

      {/* Header */}
      <div style={{ background:'linear-gradient(160deg,#111118 0%,#0a1a2e 100%)', padding:'36px 0 32px' }}>
        <div className="container">
          <img src="/logo.png" alt="AUSI" style={{ width:40, height:40, borderRadius:'50%', objectFit:'cover', display:'block', marginBottom:12 }} />
          <div style={{ fontSize:11, fontWeight:700, letterSpacing:2.2, textTransform:'uppercase', color:'rgba(255,255,255,.35)', marginBottom:8 }}>
            {user?.university_name || 'University Representative'}
          </div>
          <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', gap:16, flexWrap:'wrap' }}>
            <div>
              <h1 style={{ fontFamily:'var(--serif)', fontSize:'clamp(20px,3vw,28px)', fontWeight:700, color:'#fff', margin:'0 0 6px' }}>My Reports</h1>
              <p style={{ fontSize:13.5, color:'rgba(255,255,255,.4)', margin:0 }}>Submit post-event, 6-month, and annual reports to AUSI leadership</p>
            </div>
            <button
              onClick={() => { setShowForm(true); setForm(BLANK); setErrors({}) }}
              style={{ padding:'10px 22px', background:'var(--gold)', color:'var(--ink)', border:'none', borderRadius:10, fontWeight:800, fontSize:13.5, cursor:'pointer', flexShrink:0 }}>
              + Submit Report
            </button>
          </div>
        </div>
      </div>

      <div className="container" style={{ paddingTop:28, paddingBottom:64 }}>

        {/* Summary cards */}
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(140px,1fr))', gap:12, marginBottom:28 }}>
          {[
            { label:'Total Submitted', value: myReports.length,          col:'#111118' },
            { label:'Post-Event',      value: typeCount('event'),         col:'#2563eb' },
            { label:'6-Month',         value: typeCount('semester'),      col:'#d97706' },
            { label:'Annual',          value: typeCount('annual'),        col:'#059669' },
          ].map(s => (
            <div key={s.label} style={{ background:'var(--white)', border:'1px solid var(--g100)', borderRadius:12, padding:'16px 18px' }}>
              <div style={{ fontSize:10, fontWeight:700, letterSpacing:1.6, textTransform:'uppercase', color:'var(--g400)', marginBottom:6 }}>{s.label}</div>
              <div style={{ fontSize:28, fontWeight:800, color: s.col, fontFamily:'var(--serif)', lineHeight:1 }}>{s.value}</div>
            </div>
          ))}
        </div>

        {/* Report type guide */}
        {myReports.length === 0 && !showForm && (
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(220px,1fr))', gap:14, marginBottom:32 }}>
            {Object.entries(TYPES).map(([k, t]) => (
              <div key={k} style={{ background:'var(--white)', border:'1px solid var(--g100)', borderRadius:14, padding:'20px 22px' }}>
                <div style={{ fontSize:11, fontWeight:700, letterSpacing:1.5, textTransform:'uppercase', color: t.color, marginBottom:8 }}>{t.label}</div>
                <p style={{ fontSize:13, color:'var(--g600)', lineHeight:1.65, margin:0 }}>{t.desc}</p>
              </div>
            ))}
          </div>
        )}

        {/* FORM */}
        {showForm && (
          <div style={{ background:'var(--white)', border:'1px solid var(--g100)', borderRadius:16, padding:'28px 28px 32px', marginBottom:28, boxShadow:'0 4px 24px rgba(0,0,0,.06)' }}>
            <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:24 }}>
              <h2 style={{ fontFamily:'var(--serif)', fontSize:19, fontWeight:700, color:'var(--ink)', margin:0 }}>New Report</h2>
              <button onClick={() => setShowForm(false)} style={{ background:'none', border:'none', cursor:'pointer', fontSize:22, color:'var(--g400)' }}>×</button>
            </div>

            {/* Report type selector */}
            <div style={fg}>
              <label style={lbl}>Report Type</label>
              <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:10 }}>
                {Object.entries(TYPES).map(([k, t]) => (
                  <button key={k} type="button" onClick={() => setForm(f => ({ ...f, type: k }))}
                    style={{ padding:'12px 10px', border:`2px solid ${form.type===k ? t.color : 'var(--g200)'}`, borderRadius:10, cursor:'pointer', background: form.type===k ? t.bg : 'transparent', textAlign:'center', transition:'all .15s' }}>
                    <div style={{ fontSize:12.5, fontWeight:700, color: form.type===k ? t.color : 'var(--ink)', marginBottom:3 }}>{t.label}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Title */}
            <div style={fg}>
              <label style={lbl}>Report Title <span style={{ color:'var(--red)' }}>*</span></label>
              <input value={form.title} onChange={set('title')} style={{ ...inp, borderColor: errors.title ? 'var(--red)' : 'var(--g200)' }} placeholder="e.g. Cultural Night 2026 — Post-Event Report" />
              {errors.title && <span style={{ fontSize:12, color:'var(--red)', marginTop:4, display:'block' }}>{errors.title}</span>}
            </div>

            {/* Event-specific fields */}
            {form.type === 'event' && (
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:16, ...fg }}>
                <div>
                  <label style={lbl}>Event Name <span style={{ color:'var(--red)' }}>*</span></label>
                  <input value={form.event_name} onChange={set('event_name')} style={{ ...inp, borderColor: errors.event_name ? 'var(--red)' : 'var(--g200)' }} placeholder="e.g. Cultural Night 2026" />
                  {errors.event_name && <span style={{ fontSize:12, color:'var(--red)', marginTop:4, display:'block' }}>{errors.event_name}</span>}
                </div>
                <div>
                  <label style={lbl}>Event Date</label>
                  <input type="date" value={form.event_date} onChange={set('event_date')} style={inp} />
                </div>
              </div>
            )}

            {/* Period for semester/annual */}
            {(form.type === 'semester' || form.type === 'annual') && (
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:16, ...fg }}>
                <div>
                  <label style={lbl}>Period Covered</label>
                  <input value={form.period} onChange={set('period')} style={inp} placeholder={form.type === 'semester' ? 'e.g. Jan 2026 – Jun 2026' : 'e.g. 2025 – 2026'} />
                </div>
                <div>
                  <label style={lbl}>No. of AUSI Members</label>
                  <input type="number" value={form.attendance_count} onChange={set('attendance_count')} style={inp} placeholder="e.g. 24" min="0" />
                </div>
              </div>
            )}

            {form.type === 'event' && (
              <div style={fg}>
                <label style={lbl}>Attendance / Participants</label>
                <input type="number" value={form.attendance_count} onChange={set('attendance_count')} style={inp} placeholder="Number of attendees" min="0" />
              </div>
            )}

            {/* Summary */}
            <div style={fg}>
              <label style={lbl}>Summary <span style={{ color:'var(--red)' }}>*</span></label>
              <textarea value={form.summary} onChange={set('summary')} rows={5} style={{ ...inp, resize:'vertical', lineHeight:1.7, borderColor: errors.summary ? 'var(--red)' : 'var(--g200)' }}
                placeholder={form.type === 'event'
                  ? 'Describe the event — what happened, how it went, who attended…'
                  : 'Summarise the overall state of AUSI members at your university for this period…'}
              />
              {errors.summary && <span style={{ fontSize:12, color:'var(--red)', marginTop:4, display:'block' }}>{errors.summary}</span>}
            </div>

            {/* Achievements */}
            <div style={fg}>
              <label style={lbl}>Achievements &amp; Highlights</label>
              <textarea value={form.achievements} onChange={set('achievements')} rows={3} style={{ ...inp, resize:'vertical', lineHeight:1.7 }} placeholder="What went well? Any notable outcomes or successes?" />
            </div>

            {/* Challenges */}
            <div style={fg}>
              <label style={lbl}>Challenges &amp; Issues</label>
              <textarea value={form.challenges} onChange={set('challenges')} rows={3} style={{ ...inp, resize:'vertical', lineHeight:1.7 }} placeholder="Any problems encountered — student welfare issues, logistical difficulties, disputes…" />
            </div>

            {/* Recommendations */}
            <div style={{ marginBottom:24 }}>
              <label style={lbl}>Recommendations to AUSI Leadership</label>
              <textarea value={form.recommendations} onChange={set('recommendations')} rows={3} style={{ ...inp, resize:'vertical', lineHeight:1.7 }} placeholder="Suggestions for AUSI cabinet, president, or exec to act on…" />
            </div>

            <div style={{ display:'flex', gap:10 }}>
              <button onClick={() => setShowForm(false)} style={{ flex:1, padding:'11px', border:'1px solid var(--g200)', borderRadius:8, background:'transparent', cursor:'pointer', fontWeight:700, fontSize:14, color:'var(--g600)' }}>Cancel</button>
              <button onClick={submit} style={{ flex:2, padding:'11px', background:'var(--ink)', color:'#fff', border:'none', borderRadius:8, fontWeight:700, fontSize:14, cursor:'pointer' }}>Submit Report</button>
            </div>
          </div>
        )}

        {/* Report list */}
        {myReports.length === 0 && !showForm ? (
          <div style={{ background:'var(--white)', border:'1px solid var(--g100)', borderRadius:14, padding:'48px', textAlign:'center' }}>
            <div style={{ fontSize:14, color:'var(--g400)', marginBottom:12 }}>No reports submitted yet.</div>
            <button onClick={() => setShowForm(true)} style={{ padding:'10px 24px', background:'var(--ink)', color:'#fff', border:'none', borderRadius:10, fontWeight:700, fontSize:14, cursor:'pointer' }}>Submit Your First Report</button>
          </div>
        ) : (
          <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
            {myReports.map(r => {
              const t  = TYPES[r.type]  || TYPES.event
              const st = STATUS[r.status] || STATUS.submitted
              const isExp = expanded === r.id
              return (
                <div key={r.id} style={{ background:'var(--white)', border:'1px solid var(--g100)', borderRadius:14, overflow:'hidden' }}>
                  <div style={{ padding:'18px 22px', display:'flex', justifyContent:'space-between', alignItems:'flex-start', gap:16, flexWrap:'wrap' }}>
                    <div style={{ flex:1, minWidth:0 }}>
                      <div style={{ display:'flex', gap:8, flexWrap:'wrap', alignItems:'center', marginBottom:8 }}>
                        <span style={{ fontSize:11, fontWeight:700, padding:'2px 8px', borderRadius:4, background: t.bg, color: t.color }}>{t.label}</span>
                        <span style={{ fontSize:11, fontWeight:700, padding:'2px 8px', borderRadius:4, background: st.bg, color: st.text }}>{st.label}</span>
                        <span style={{ fontSize:12, color:'var(--g400)' }}>
                          {new Date(r.submitted_at).toLocaleDateString('en-GB',{day:'numeric',month:'short',year:'numeric'})}
                        </span>
                      </div>
                      <div style={{ fontFamily:'var(--serif)', fontSize:16, fontWeight:700, color:'var(--ink)', marginBottom:4 }}>{r.title}</div>
                      {r.event_name && <div style={{ fontSize:12.5, color:'var(--g500)', marginBottom:2 }}>Event: {r.event_name}{r.event_date ? ` · ${new Date(r.event_date).toLocaleDateString('en-GB',{day:'numeric',month:'short',year:'numeric'})}` : ''}</div>}
                      {r.period && <div style={{ fontSize:12.5, color:'var(--g500)', marginBottom:2 }}>Period: {r.period}</div>}
                      {r.attendance_count && <div style={{ fontSize:12.5, color:'var(--g500)' }}>Participants / Members: {r.attendance_count}</div>}
                    </div>
                    <button onClick={() => setExpanded(isExp ? null : r.id)}
                      style={{ fontSize:12, fontWeight:700, padding:'6px 14px', border:'1px solid var(--g200)', borderRadius:7, cursor:'pointer', background:'var(--off)', color:'var(--g600)', flexShrink:0 }}>
                      {isExp ? 'Collapse' : 'View'}
                    </button>
                  </div>

                  {isExp && (
                    <div style={{ borderTop:'1px solid var(--g100)' }}>
                      {[
                        { label: 'Summary',                  body: r.summary         },
                        { label: 'Achievements & Highlights', body: r.achievements    },
                        { label: 'Challenges & Issues',       body: r.challenges      },
                        { label: 'Recommendations',           body: r.recommendations },
                      ].filter(s => s.body?.trim()).map(s => (
                        <div key={s.label} style={{ padding:'14px 22px', borderBottom:'1px solid var(--g50)' }}>
                          <div style={{ fontSize:11, fontWeight:700, letterSpacing:1.2, textTransform:'uppercase', color:'var(--g400)', marginBottom:6 }}>{s.label}</div>
                          <div style={{ fontSize:13.5, color:'var(--g700)', lineHeight:1.72, whiteSpace:'pre-wrap' }}>{s.body}</div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
