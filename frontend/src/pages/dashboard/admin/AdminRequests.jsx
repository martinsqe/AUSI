import { useEffect, useState } from 'react'
import api from '../../../lib/api'

const DOC_LABELS = {
  passport_photo:   'Passport Photo',
  admission_letter: 'Admission Letter',
  passport:         'Passport',
  visa:             'Visa',
}

// Extra registration-form fields, shown in the expandable detail panel
const DETAIL_FIELDS = [
  ['sex', 'Sex'],
  ['date_of_birth', 'Date of Birth', true],
  ['place_of_birth', 'Place of Birth'],
  ['marital_status', 'Marital Status'],
  ['passport_number', 'Passport No.'],
  ['passport_issue_date', 'Passport Issued', true],
  ['passport_issue_place', 'Passport Issue Place'],
  ['passport_expiry_date', 'Passport Expiry', true],
  ['residential_permit_no', 'Residential Permit No.'],
  ['residential_permit_issue_date', 'Permit Issued', true],
  ['residential_permit_expiry_date', 'Permit Expiry', true],
  ['permanent_address_uganda', 'Permanent Address (Uganda)'],
  ['present_address_india', 'Present Address (India)'],
  ['institution_address', 'Institution Address'],
  ['date_of_joining', 'Date of Joining', true],
  ['expected_completion_date', 'Expected Completion', true],
  ['prev_institution_1', 'Last Institution (Uganda)'],
  ['prev_institution_2', 'Previous Institution (Uganda)'],
  ['employment_record', 'Employment Record'],
  ['sponsorship_type', 'Sponsorship'],
  ['sponsor_name', 'Sponsor'],
  ['guardian_name', "Guardian's Name"],
  ['guardian_address', "Guardian's Address"],
  ['guardian_phone', "Guardian's Phone"],
  ['guardian_email', "Guardian's Email"],
  ['guardian_occupation', "Guardian's Occupation"],
]

const fmtDate = (v) => {
  if (!v) return null
  const d = new Date(v)
  return isNaN(d) ? v : d.toLocaleDateString('en-GB', { day:'numeric', month:'short', year:'numeric' })
}

const STATUS_COLORS = {
  pending:  { bg:'rgba(234,179,8,.1)',  text:'#92400e', border:'rgba(234,179,8,.3)' },
  accepted: { bg:'rgba(34,197,94,.1)',  text:'#15803d', border:'rgba(34,197,94,.3)' },
  declined: { bg:'rgba(239,68,68,.1)',  text:'#b91c1c', border:'rgba(239,68,68,.3)' },
}

function Badge({ label, style: c }) {
  return (
    <span style={{ fontSize:11, fontWeight:700, letterSpacing:.6, textTransform:'uppercase', padding:'2px 9px', borderRadius:4, background:c.bg, color:c.text }}>
      {label}
    </span>
  )
}

function Avatar({ name }) {
  const initials = name?.split(' ').map(w => w[0]).join('').slice(0,2).toUpperCase() || '?'
  return (
    <div style={{ width:40, height:40, borderRadius:'50%', background:'#111118', color:'#fff', display:'flex', alignItems:'center', justifyContent:'center', fontSize:14, fontWeight:800, fontFamily:'var(--serif)', flexShrink:0 }}>
      {initials}
    </div>
  )
}

export default function AdminRequests() {
  const [reqs, setReqs]       = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter]   = useState('pending')
  const [busy, setBusy]       = useState({})
  const [toast, setToast]     = useState(null)
  const [expanded, setExpanded] = useState({})
  const [docBusy, setDocBusy]   = useState({})

  const load = () => {
    api.get('/join-requests')
      .then(r => { setReqs(r.data?.data || []); setLoading(false) })
      .catch(() => { setReqs([]); setLoading(false) })
  }
  useEffect(load, [])

  const showToast = (msg, ok = true) => {
    setToast({ msg, ok })
    setTimeout(() => setToast(null), 3500)
  }

  const act = async (id, action) => {
    setBusy(b => ({ ...b, [id]: true }))
    try {
      await api.patch(`/join-requests/${id}/${action}`)
      setReqs(r => r.map(x => x.id === id ? { ...x, status: action === 'accept' ? 'accepted' : 'declined' } : x))

      if (action === 'accept') {
        // The backend already creates the member with is_verified = true
        // (see accept() in joinRequests.js) — nothing more to do here.
        // NOTE: previously this called PATCH /members/:id/verify, but that
        // endpoint *toggles* is_verified, which flipped freshly-verified
        // members straight back to unverified (hiding them from the member
        // directory and silently blocking their "forgot password" flow).
        showToast('Request accepted — member is now verified.')
      } else {
        showToast('Request declined.')
      }
    } catch (err) {
      showToast(err.response?.data?.error || 'Action failed. Please try again.', false)
    }
    setBusy(b => ({ ...b, [id]: false }))
  }

  const viewDoc = async (id, type) => {
    const key = `${id}-${type}`
    setDocBusy(b => ({ ...b, [key]: true }))
    try {
      const res = await api.get(`/join-requests/${id}/documents/${type}`, { responseType: 'blob' })
      const url = URL.createObjectURL(res.data)
      window.open(url, '_blank', 'noopener')
      setTimeout(() => URL.revokeObjectURL(url), 60000)
    } catch {
      showToast('Could not open document.', false)
    }
    setDocBusy(b => ({ ...b, [key]: false }))
  }

  const filtered = filter === 'all' ? reqs : reqs.filter(r => r.status === filter)
  const counts = reqs.reduce((acc, r) => { acc[r.status] = (acc[r.status] || 0) + 1; return acc }, {})

  return (
    <div style={{ background:'var(--off)', minHeight:'100vh' }}>

      {/* Toast */}
      {toast && (
        <div style={{ position:'fixed', bottom:24, right:24, zIndex:999, background: toast.ok ? '#15803d' : '#b91c1c', color:'#fff', padding:'12px 20px', borderRadius:10, fontSize:13.5, fontWeight:600, boxShadow:'0 4px 20px rgba(0,0,0,.18)', maxWidth:340 }}>
          {toast.msg}
        </div>
      )}

      {/* Header */}
      <div style={{ background:'linear-gradient(160deg,#111118 0%,#1a1200 100%)', padding:'36px 0 32px', color:'#fff' }}>
        <div className="container">
          <img src="/logo.png" alt="AUSI" style={{ width:42, height:42, borderRadius:'50%', objectFit:'cover', display:'block', marginBottom:12 }} />
          <div style={{ fontSize:11, fontWeight:700, letterSpacing:2.2, textTransform:'uppercase', color:'rgba(255,255,255,.35)', marginBottom:8 }}>AUSI · Admin</div>
          <h1 style={{ fontFamily:'var(--serif)', fontSize:'clamp(22px,3vw,30px)', fontWeight:700, color:'#fff', margin:'0 0 6px' }}>Join Requests</h1>
          <p style={{ fontSize:13.5, color:'rgba(255,255,255,.4)', margin:0 }}>Review and approve membership requests from prospective students</p>
        </div>
      </div>

      <div className="container" style={{ paddingTop:32, paddingBottom:64 }}>

        {/* Filters */}
        <div className="hscroll" style={{ display:'flex', gap:24, marginBottom:20, borderBottom:'1px solid var(--g100)', paddingBottom:14, overflowX:'auto', flexWrap:'nowrap' }}>
          {[
            ['all',      `All (${reqs.length})`],
            ['pending',  `Pending (${counts.pending  || 0})`],
            ['accepted', `Accepted (${counts.accepted || 0})`],
            ['declined', `Declined (${counts.declined || 0})`],
          ].map(([val, label]) => {
            const active = filter === val
            return (
              <button key={val} onClick={() => setFilter(val)}
                style={{ background:'none', border:'none', borderBottom:`2px solid ${active ? 'var(--ink)' : 'transparent'}`, cursor:'pointer', padding:'0 0 4px', fontSize:14, fontWeight: active ? 800 : 500, color: active ? 'var(--ink)' : 'var(--g400)', transition:'color .15s, border-color .15s', whiteSpace:'nowrap' }}>
                {label}
              </button>
            )
          })}
        </div>

        {/* Request cards */}
        <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
          {loading ? (
            <div style={{ background:'var(--white)', border:'1px solid var(--g100)', borderRadius:14, padding:'48px', textAlign:'center', color:'var(--g400)', fontSize:14 }}>
              Loading requests…
            </div>
          ) : filtered.length === 0 ? (
            <div style={{ background:'var(--white)', border:'1px solid var(--g100)', borderRadius:14, padding:'48px', textAlign:'center', color:'var(--g400)', fontSize:14 }}>
              {reqs.length === 0 ? 'No join requests yet.' : 'No requests match this filter.'}
            </div>
          ) : filtered.map(req => {
            const sc = STATUS_COLORS[req.status] || STATUS_COLORS.pending
            return (
              <div key={req.id} style={{ background:'var(--white)', border:'1px solid var(--g100)', borderRadius:14, overflow:'hidden' }}>
                <div style={{ padding:'18px 22px', display:'flex', gap:14, alignItems:'flex-start', flexWrap:'wrap' }}>

                  <Avatar name={req.full_name} />

                  <div style={{ flex:1, minWidth:0 }}>
                    <div style={{ display:'flex', gap:8, flexWrap:'wrap', alignItems:'center', marginBottom:6 }}>
                      <span style={{ fontWeight:700, fontSize:15, color:'var(--ink)' }}>{req.full_name}</span>
                      <Badge label={req.status} style={sc} />
                    </div>

                    <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(180px,1fr))', gap:'4px 20px', marginBottom: req.message ? 10 : 0 }}>
                      <div style={{ fontSize:13, color:'var(--g600)' }}>
                        <span style={{ color:'var(--g400)', fontSize:11, fontWeight:700, letterSpacing:.5, textTransform:'uppercase' }}>Email </span>
                        {req.email}
                      </div>
                      {req.phone && (
                        <div style={{ fontSize:13, color:'var(--g600)' }}>
                          <span style={{ color:'var(--g400)', fontSize:11, fontWeight:700, letterSpacing:.5, textTransform:'uppercase' }}>Phone </span>
                          {req.phone}
                        </div>
                      )}
                      {req.university_name && (
                        <div style={{ fontSize:13, color:'var(--g600)' }}>
                          <span style={{ color:'var(--g400)', fontSize:11, fontWeight:700, letterSpacing:.5, textTransform:'uppercase' }}>University </span>
                          {req.university_name}
                        </div>
                      )}
                      {req.field_of_study && (
                        <div style={{ fontSize:13, color:'var(--g600)' }}>
                          <span style={{ color:'var(--g400)', fontSize:11, fontWeight:700, letterSpacing:.5, textTransform:'uppercase' }}>Course </span>
                          {req.field_of_study}
                        </div>
                      )}
                      <div style={{ fontSize:12, color:'var(--g400)' }}>
                        <span style={{ fontWeight:700, letterSpacing:.5, textTransform:'uppercase', fontSize:11 }}>Received </span>
                        {new Date(req.created_at).toLocaleDateString('en-GB', { day:'numeric', month:'short', year:'numeric' })}
                      </div>
                    </div>

                    {req.message && (
                      <div style={{ fontSize:13, color:'var(--g600)', background:'var(--off)', borderRadius:8, padding:'10px 14px', marginTop:8, lineHeight:1.55, borderLeft:'3px solid var(--g200)' }}>
                        {req.message}
                      </div>
                    )}

                    {/* Documents */}
                    {Array.isArray(req.documents) && req.documents.length > 0 && (
                      <div style={{ display:'flex', gap:8, flexWrap:'wrap', marginTop:12 }}>
                        {req.documents.map(type => {
                          const k = `${req.id}-${type}`
                          return (
                            <button key={type} onClick={() => viewDoc(req.id, type)} disabled={docBusy[k]}
                              style={{ fontSize:12, fontWeight:700, padding:'6px 12px', border:'1px solid var(--g200)', borderRadius:7, cursor:'pointer', background:'var(--white)', color:'var(--ink)', opacity: docBusy[k] ? .5 : 1, display:'inline-flex', alignItems:'center', gap:6 }}>
                              <span style={{ fontSize:13 }}>📄</span> {DOC_LABELS[type] || type}
                            </button>
                          )
                        })}
                      </div>
                    )}

                    <button
                      onClick={() => setExpanded(x => ({ ...x, [req.id]: !x[req.id] }))}
                      style={{ marginTop:12, background:'none', border:'none', padding:0, cursor:'pointer', fontSize:12.5, fontWeight:700, color:'var(--g500)', letterSpacing:.3 }}>
                      {expanded[req.id] ? 'Hide full details ▴' : 'Show full details ▾'}
                    </button>

                    {expanded[req.id] && (
                      <div style={{ marginTop:12, borderTop:'1px solid var(--g100)', paddingTop:14, display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(220px,1fr))', gap:'10px 20px' }}>
                        {DETAIL_FIELDS.map(([key, label, isDate]) => {
                          const raw = req[key]
                          const val = isDate ? fmtDate(raw) : raw
                          if (!val) return null
                          return (
                            <div key={key} style={{ fontSize:13, color:'var(--g700)' }}>
                              <span style={{ display:'block', color:'var(--g400)', fontSize:10.5, fontWeight:700, letterSpacing:.5, textTransform:'uppercase', marginBottom:2 }}>{label}</span>
                              {val}
                            </div>
                          )
                        })}
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div style={{ display:'flex', gap:8, flexShrink:0, alignItems:'flex-start' }}>
                    {req.status === 'pending' && (
                      <>
                        <button
                          onClick={() => act(req.id, 'accept')} disabled={busy[req.id]}
                          style={{ fontSize:13, fontWeight:700, padding:'8px 16px', border:'1px solid rgba(34,197,94,.4)', borderRadius:8, cursor:'pointer', background:'rgba(34,197,94,.08)', color:'#15803d', opacity: busy[req.id] ? .5 : 1, whiteSpace:'nowrap' }}>
                          {busy[req.id] ? '…' : 'Accept'}
                        </button>
                        <button
                          onClick={() => act(req.id, 'decline')} disabled={busy[req.id]}
                          style={{ fontSize:13, fontWeight:700, padding:'8px 16px', border:'1px solid rgba(220,38,38,.3)', borderRadius:8, cursor:'pointer', background:'rgba(220,38,38,.06)', color:'#dc2626', opacity: busy[req.id] ? .5 : 1, whiteSpace:'nowrap' }}>
                          Decline
                        </button>
                      </>
                    )}
                    {req.status === 'accepted' && (
                      <span style={{ fontSize:12, color:'#15803d', fontWeight:700, padding:'8px 0' }}>
                        Approved
                      </span>
                    )}
                    {req.status === 'declined' && (
                      <button
                        onClick={() => act(req.id, 'accept')} disabled={busy[req.id]}
                        style={{ fontSize:12, fontWeight:700, padding:'8px 14px', border:'1px solid rgba(34,197,94,.4)', borderRadius:8, cursor:'pointer', background:'rgba(34,197,94,.06)', color:'#15803d', opacity: busy[req.id] ? .5 : 1, whiteSpace:'nowrap' }}>
                        Accept anyway
                      </button>
                    )}
                  </div>

                </div>
              </div>
            )
          })}
        </div>

      </div>
    </div>
  )
}
