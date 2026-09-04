import { useEffect, useState } from 'react'
import api from '../../../lib/api'

/* ── Colours ─────────────────────────────────────────────────── */
const CAT_COLORS = {
  harassment:     { bg:'rgba(220,38,38,.08)',  text:'#b91c1c' },
  discrimination: { bg:'rgba(234,179,8,.1)',   text:'#92400e' },
  financial:      { bg:'rgba(124,58,237,.08)', text:'#5b21b6' },
  safety:         { bg:'rgba(249,115,22,.1)',  text:'#c2410c' },
  misconduct:     { bg:'rgba(239,68,68,.08)',  text:'#dc2626' },
  other:          { bg:'rgba(107,114,128,.08)',text:'#4b5563' },
}

const ANON_STATUS = {
  open:      { bg:'rgba(234,179,8,.1)',   text:'#92400e' },
  reviewing: { bg:'rgba(59,130,246,.1)',  text:'#1d4ed8' },
  resolved:  { bg:'rgba(34,197,94,.1)',   text:'#15803d' },
  dismissed: { bg:'rgba(107,114,128,.1)', text:'#374151' },
}

const PROBLEM_TYPES = {
  school_fees:    { label:'School Fees',    bg:'rgba(217,119,6,.08)',   text:'#92400e' },
  hospitalisation:{ label:'Hospitalisation',bg:'rgba(220,38,38,.08)',   text:'#b91c1c' },
  visa:           { label:'Visa Issue',     bg:'rgba(124,58,237,.08)',  text:'#5b21b6' },
  legal:          { label:'Legal Case',     bg:'rgba(37,99,235,.08)',   text:'#1d4ed8' },
  lost_passport:  { label:'Lost Passport',  bg:'rgba(249,115,22,.1)',   text:'#c2410c' },
  death:          { label:'Death',          bg:'rgba(107,114,128,.1)',  text:'#374151' },
  other:          { label:'Other',          bg:'rgba(107,114,128,.08)', text:'#4b5563' },
}

const CRISIS_STATUS = {
  open:        { label:'Open',        bg:'rgba(234,179,8,.1)',  text:'#92400e' },
  in_progress: { label:'In Progress', bg:'rgba(37,99,235,.08)', text:'#1d4ed8' },
  resolved:    { label:'Resolved',    bg:'rgba(34,197,94,.1)',  text:'#15803d' },
}

/* ── Shared badge ────────────────────────────────────────────── */
function Badge({ label, bg, text }) {
  return (
    <span style={{ fontSize:11, fontWeight:700, letterSpacing:.6, textTransform:'uppercase', padding:'2px 9px', borderRadius:4, background:bg, color:text }}>
      {label}
    </span>
  )
}

/* ── Modal shell ─────────────────────────────────────────────── */
function Modal({ title, onClose, wide, children }) {
  return (
    <>
      <div onClick={onClose} style={{ position:'fixed', inset:0, background:'rgba(0,0,0,.5)', zIndex:1000 }} />
      <div data-lenis-prevent style={{ position:'fixed', top:'50%', left:'50%', transform:'translate(-50%,-50%)', zIndex:1001, background:'var(--white)', borderRadius:18, width: wide ? 'min(96vw,720px)' : 'min(94vw,580px)', maxHeight:'92vh', overflow:'auto', overscrollBehavior:'contain', boxShadow:'0 32px 100px rgba(0,0,0,.25)' }}>
        <div style={{ padding:'20px 24px', borderBottom:'1px solid var(--g100)', display:'flex', alignItems:'center', justifyContent:'space-between', position:'sticky', top:0, background:'var(--white)', zIndex:1 }}>
          <h3 style={{ fontFamily:'var(--serif)', fontSize:18, fontWeight:700, color:'var(--ink)', margin:0 }}>{title}</h3>
          <button onClick={onClose} style={{ background:'none', border:'none', cursor:'pointer', fontSize:22, color:'var(--g400)', padding:'0 4px' }}>×</button>
        </div>
        <div style={{ padding:'24px' }}>{children}</div>
      </div>
    </>
  )
}

const inp = { width:'100%', padding:'10px 14px', border:'1.5px solid var(--g200)', borderRadius:8, fontSize:14, outline:'none', boxSizing:'border-box' }
const lbl = { display:'block', fontSize:11.5, fontWeight:700, color:'var(--g500)', marginBottom:6, letterSpacing:.5, textTransform:'uppercase' }

/* ── Student Picker ──────────────────────────────────────────── */
function StudentPicker({ members, selected, onSelect }) {
  const [q, setQ] = useState('')

  const results = q.trim()
    ? members.filter(m =>
        m.full_name?.toLowerCase().includes(q.toLowerCase()) ||
        m.email?.toLowerCase().includes(q.toLowerCase()) ||
        m.university_name?.toLowerCase().includes(q.toLowerCase())
      ).slice(0, 8)
    : []

  if (selected) {
    return (
      <div style={{ border:'1.5px solid rgba(201,146,10,.4)', borderRadius:10, padding:'14px 16px', background:'rgba(201,146,10,.04)' }}>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', gap:12 }}>
          <div style={{ flex:1 }}>
            <div style={{ fontFamily:'var(--serif)', fontSize:16, fontWeight:700, color:'var(--ink)', marginBottom:6 }}>{selected.full_name}</div>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'4px 16px', fontSize:13, color:'var(--g600)' }}>
              {selected.course       && <div><strong>Course:</strong> {selected.course}</div>}
              {selected.university_name && <div><strong>University:</strong> {selected.university_name}</div>}
              {selected.email        && <div><strong>Email:</strong> {selected.email}</div>}
              {selected.phone        && <div><strong>Phone:</strong> {selected.phone}</div>}
              {selected.role         && <div><strong>Role:</strong> {selected.role.replace('_',' ')}</div>}
              {selected.joined_at    && <div><strong>Joined:</strong> {new Date(selected.joined_at).toLocaleDateString('en-GB', { day:'numeric', month:'short', year:'numeric' })}</div>}
            </div>
          </div>
          <button onClick={() => { onSelect(null); setQ('') }}
            style={{ fontSize:12, fontWeight:700, padding:'5px 12px', border:'1px solid var(--g200)', borderRadius:7, cursor:'pointer', background:'var(--off)', color:'var(--g600)', flexShrink:0 }}>
            Change
          </button>
        </div>
      </div>
    )
  }

  return (
    <div>
      <input
        value={q}
        onChange={e => setQ(e.target.value)}
        style={inp}
        placeholder="Type name, email or university to search members…"
        autoComplete="off"
      />
      {results.length > 0 && (
        <div style={{ marginTop:6, border:'1.5px solid var(--g200)', borderRadius:10, overflow:'hidden', background:'var(--white)' }}>
          {results.map((m, i) => (
            <button
              key={m.id}
              onClick={() => { onSelect(m); setQ('') }}
              style={{ width:'100%', display:'block', textAlign:'left', padding:'12px 16px', background:'none', border:'none', cursor:'pointer', borderTop: i > 0 ? '1px solid var(--g100)' : 'none', transition:'background .1s' }}
              onMouseEnter={e => e.currentTarget.style.background = 'var(--off)'}
              onMouseLeave={e => e.currentTarget.style.background = 'none'}
            >
              <div style={{ fontWeight:700, fontSize:14, color:'var(--ink)' }}>{m.full_name}</div>
              <div style={{ fontSize:12, color:'var(--g500)', marginTop:2 }}>
                {[m.university_name, m.course, m.email].filter(Boolean).join(' · ')}
              </div>
            </button>
          ))}
        </div>
      )}
      {q.trim() && results.length === 0 && (
        <div style={{ marginTop:6, padding:'12px 16px', background:'var(--off)', borderRadius:8, fontSize:13, color:'var(--g400)' }}>
          No members found matching "{q}"
        </div>
      )}
      {!q.trim() && members.length === 0 && (
        <div style={{ marginTop:6, padding:'12px 16px', background:'var(--off)', borderRadius:8, fontSize:13, color:'var(--g400)' }}>
          Could not load member list — enter student details manually below.
        </div>
      )}
    </div>
  )
}

/* ══════════════════════════════════════════════════════════════ */
/*  Main component                                               */
/* ══════════════════════════════════════════════════════════════ */
export default function AdminReports() {

  /* ── Anonymous reports state ── */
  const [reports,  setReports]  = useState([])
  const [rLoading, setRLoading] = useState(true)
  const [rFilter,  setRFilter]  = useState('all')
  const [rBusy,    setRBusy]    = useState({})
  const [expanded, setExpanded] = useState(null)

  /* ── Crisis management state ── */
  const [cases,   setCases]   = useState(() => {
    try { return JSON.parse(localStorage.getItem('ausi_crisis') || '[]') }
    catch { return [] }
  })
  const [members, setMembers] = useState([])
  const [cFilter, setCFilter] = useState('all')
  const [cTypeF,  setCTypeF]  = useState('all')
  const [cModal,  setCModal]  = useState(null)   // null | 'add' | case-object
  const [cForm,   setCForm]   = useState(null)
  const [cDel,    setCDel]    = useState(null)
  const [selStudent, setSelStudent] = useState(null)

  /* ── Tab ── */
  const [tab, setTab] = useState('anonymous')

  /* ── University rep reports ── */
  const [repReports, setRepReports] = useState(() => {
    try { return JSON.parse(localStorage.getItem('ausi_rep_reports') || '[]') } catch { return [] }
  })
  const [repFilter, setRepFilter] = useState('all')
  const [repExpanded, setRepExpanded] = useState(null)

  const repAcknowledge = id => {
    const updated = repReports.map(r => r.id === id ? { ...r, status: 'acknowledged' } : r)
    setRepReports(updated)
    localStorage.setItem('ausi_rep_reports', JSON.stringify(updated))
  }
  const repMarkReviewed = id => {
    const updated = repReports.map(r => r.id === id ? { ...r, status: 'reviewed' } : r)
    setRepReports(updated)
    localStorage.setItem('ausi_rep_reports', JSON.stringify(updated))
  }

  const REP_TYPES = {
    event:    { label: 'Post-Event',  bg: 'rgba(37,99,235,.08)',  text: '#1d4ed8' },
    semester: { label: '6-Month',     bg: 'rgba(217,119,6,.08)',  text: '#92400e' },
    annual:   { label: 'Annual',      bg: 'rgba(5,150,105,.08)',  text: '#065f46' },
  }
  const REP_STATUS = {
    submitted:    { label: 'Submitted',    bg: 'rgba(37,99,235,.1)',  text: '#1d4ed8' },
    reviewed:     { label: 'Reviewed',     bg: 'rgba(217,119,6,.1)',  text: '#92400e' },
    acknowledged: { label: 'Acknowledged', bg: 'rgba(5,150,105,.1)',  text: '#065f46' },
  }
  const repFiltered = repFilter === 'all' ? repReports : repReports.filter(r => r.type === repFilter)

  /* ── Load anonymous reports (localStorage only — API endpoint not yet implemented) ── */
  useEffect(() => {
    try {
      const local = JSON.parse(localStorage.getItem('ausi_anon_reports') || '[]')
      local.sort((a,b) => new Date(b.submitted_at||b.created_at||0) - new Date(a.submitted_at||a.created_at||0))
      setReports(local)
    } catch {}
    setRLoading(false)
  }, [])

  /* ── Load members for student picker ── */
  useEffect(() => {
    const load = async () => {
      // Try president endpoint first (works for chapter_president), then admin endpoint
      for (const ep of ['/dashboard/president', '/dashboard/admin']) {
        try {
          const r = await api.get(ep)
          const list = r.data?.members || r.data?.data || []
          if (list.length) { setMembers(list); return }
        } catch {}
      }
    }
    load()
  }, [])

  /* ── Anonymous: change status ── */
  const setAnonStatus = (id, status) => {
    setRBusy(b => ({ ...b, [id]:true }))
    api.patch(`/reports/${id}`, { status }).catch(() => {})
    try {
      const local = JSON.parse(localStorage.getItem('ausi_anon_reports') || '[]')
      localStorage.setItem('ausi_anon_reports', JSON.stringify(local.map(r => r.id===id ? {...r,status} : r)))
    } catch {}
    setReports(r => r.map(x => x.id===id ? {...x,status} : x))
    setRBusy(b => ({ ...b, [id]:false }))
  }

  /* ── Crisis: save to localStorage ── */
  const saveCases = n => { setCases(n); localStorage.setItem('ausi_crisis', JSON.stringify(n)) }

  const BLANK_CASE = {
    problem_type:'school_fees', problem_other:'', story:'', resolution:'',
    status:'open', date_opened: new Date().toISOString().split('T')[0], date_resolved:'',
    student_id:'', student_name:'', student_course:'', student_university:'', student_contact:'', student_phone:'',
  }

  const openAddCase = () => { setCForm(BLANK_CASE); setSelStudent(null); setCModal('add') }
  const openEditCase = c => {
    setCForm({ ...c })
    setSelStudent(members.find(m => m.id === c.student_id) || {
      full_name: c.student_name, email: c.student_contact, university_name: c.student_university,
      course: c.student_course, phone: c.student_phone, id: c.student_id,
    })
    setCModal(c)
  }

  const setF = k => e => setCForm(f => ({ ...f, [k]: e.target.value }))

  const submitCase = () => {
    if (!cForm.story.trim()) return
    const payload = {
      ...cForm,
      student_id:         selStudent?.id            || cForm.student_id,
      student_name:       selStudent?.full_name     || cForm.student_name,
      student_course:     selStudent?.course        || cForm.student_course,
      student_university: selStudent?.university_name|| cForm.student_university,
      student_contact:    selStudent?.email         || cForm.student_contact,
      student_phone:      selStudent?.phone         || cForm.student_phone,
    }
    if (cModal === 'add') {
      saveCases([{ ...payload, id: Date.now() }, ...cases])
    } else {
      saveCases(cases.map(c => c.id === cModal.id ? { ...c, ...payload } : c))
    }
    setCModal(null)
  }

  const delCase = id => { saveCases(cases.filter(c => c.id !== id)); setCDel(null) }

  /* ── Derived ── */
  const anonFiltered = rFilter === 'all' ? reports : reports.filter(r => r.status === rFilter)
  const anonCounts   = reports.reduce((a,r) => { a[r.status]=(a[r.status]||0)+1; return a }, {})

  const crisisFiltered = cases.filter(c => {
    if (cFilter !== 'all' && c.status !== cFilter) return false
    if (cTypeF  !== 'all' && c.problem_type !== cTypeF) return false
    return true
  })
  const crisisCounts = cases.reduce((a,c) => { a[c.status]=(a[c.status]||0)+1; return a }, {})

  const tabBtn = active => ({
    padding:'9px 22px', fontSize:13.5, fontWeight:700, cursor:'pointer', border:'none', borderRadius:8,
    background: active ? 'var(--ink)' : 'transparent',
    color:      active ? 'var(--white)' : 'var(--g500)',
    transition:'all .15s', whiteSpace:'nowrap',
  })

  /* ════════════════════════════════════ RENDER ══════════════════ */
  return (
    <div style={{ background:'var(--off)', minHeight:'100vh' }}>

      {/* ── Header ── */}
      <div style={{ background:'linear-gradient(160deg,#111118 0%,#1a1200 100%)', padding:'36px 0 32px', color:'#fff' }}>
        <div className="container">
          <img src="/logo.png" alt="AUSI" style={{ width:42, height:42, borderRadius:'50%', objectFit:'cover', display:'block', marginBottom:12 }} />
          <div style={{ fontSize:11, fontWeight:700, letterSpacing:2.2, textTransform:'uppercase', color:'rgba(255,255,255,.35)', marginBottom:8 }}>AUSI · Admin</div>
          <h1 style={{ fontFamily:'var(--serif)', fontSize:'clamp(22px,3vw,30px)', fontWeight:700, color:'#fff', margin:'0 0 6px' }}>Reports</h1>
          <p style={{ fontSize:13.5, color:'rgba(255,255,255,.4)', margin:0 }}>Anonymous member reports and crisis case management</p>
        </div>
      </div>

      <div className="container" style={{ paddingTop:32, paddingBottom:64 }}>

        {/* ── Tab switcher ── */}
        <div style={{ display:'flex', gap:8, marginBottom:32, background:'var(--white)', border:'1px solid var(--g100)', borderRadius:12, padding:'6px', width:'fit-content', flexWrap:'wrap' }}>
          <button style={tabBtn(tab==='anonymous')}   onClick={() => setTab('anonymous')}>Anonymous Reports</button>
          <button style={tabBtn(tab==='crisis')}      onClick={() => setTab('crisis')}>Crisis Management</button>
          <button style={tabBtn(tab==='rep_reports')} onClick={() => setTab('rep_reports')}>
            University Reports {repReports.filter(r=>r.status==='submitted').length > 0 && (
              <span style={{ marginLeft:6, background:'#dc2626', color:'#fff', borderRadius:999, padding:'1px 7px', fontSize:11, fontWeight:800 }}>
                {repReports.filter(r=>r.status==='submitted').length}
              </span>
            )}
          </button>
        </div>

        {/* ════════════════ ANONYMOUS REPORTS TAB ════════════════ */}
        {tab === 'anonymous' && (
          <>
            <div style={{ background:'rgba(37,99,235,.06)', border:'1px solid rgba(37,99,235,.2)', borderRadius:10, padding:'12px 18px', fontSize:13, color:'#1d4ed8', marginBottom:24 }}>
              These reports were submitted anonymously. Handle with strict confidentiality. Do not disclose identities under any circumstances.
            </div>

            <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(140px,1fr))', gap:12, marginBottom:24 }}>
              {[
                { label:'Total',     value: reports.length,          col:'#111118' },
                { label:'Open',      value: anonCounts.open||0,      col:'#d97706' },
                { label:'Reviewing', value: anonCounts.reviewing||0, col:'#2563eb' },
                { label:'Resolved',  value: anonCounts.resolved||0,  col:'#059669' },
              ].map(s => (
                <div key={s.label} style={{ background:'var(--white)', border:'1px solid var(--g100)', borderRadius:12, padding:'16px 18px' }}>
                  <div style={{ fontSize:10, fontWeight:700, letterSpacing:1.6, textTransform:'uppercase', color:'var(--g400)', marginBottom:6 }}>{s.label}</div>
                  <div style={{ fontSize:26, fontWeight:800, color:'var(--ink)', fontFamily:'var(--serif)', lineHeight:1 }}>{s.value}</div>
                </div>
              ))}
            </div>

            <div className="hscroll" style={{ display:'flex', gap:24, marginBottom:20, borderBottom:'1px solid var(--g100)', paddingBottom:14, overflowX:'auto', flexWrap:'nowrap' }}>
              {['all','open','reviewing','resolved','dismissed'].map(f => {
                const active = rFilter === f
                return (
                  <button key={f} onClick={() => setRFilter(f)}
                    style={{ background:'none', border:'none', borderBottom:`2px solid ${active ? 'var(--ink)' : 'transparent'}`, cursor:'pointer', padding:'0 0 4px', fontSize:14, fontWeight: active ? 800 : 500, color: active ? 'var(--ink)' : 'var(--g400)', transition:'color .15s, border-color .15s', textTransform:'capitalize' }}>
                    {f === 'all' ? 'All' : f}
                  </button>
                )
              })}
            </div>

            <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
              {rLoading ? (
                <div style={{ background:'var(--white)', border:'1px solid var(--g100)', borderRadius:14, padding:'48px', textAlign:'center', color:'var(--g400)', fontSize:14 }}>Loading…</div>
              ) : anonFiltered.length === 0 ? (
                <div style={{ background:'var(--white)', border:'1px solid var(--g100)', borderRadius:14, padding:'48px', textAlign:'center', color:'var(--g400)', fontSize:14 }}>
                  {reports.length === 0 ? 'No anonymous reports yet.' : 'No reports match this filter.'}
                </div>
              ) : anonFiltered.map(rep => {
                const cc = CAT_COLORS[rep.category] || CAT_COLORS.other
                const sc = ANON_STATUS[rep.status]  || ANON_STATUS.open
                const isExp = expanded === rep.id
                const preview = rep.message?.slice(0,200)
                return (
                  <div key={rep.id} style={{ background:'var(--white)', border:'1px solid var(--g100)', borderRadius:14, overflow:'hidden' }}>
                    <div style={{ padding:'16px 20px', display:'flex', gap:16, alignItems:'flex-start', justifyContent:'space-between', flexWrap:'wrap' }}>
                      <div style={{ flex:1, minWidth:0 }}>
                        <div style={{ display:'flex', gap:8, flexWrap:'wrap', marginBottom:8, alignItems:'center' }}>
                          <Badge label={(rep.category||'other').replace('_',' ')} bg={cc.bg} text={cc.text} />
                          <Badge label={rep.status||'open'} bg={sc.bg} text={sc.text} />
                          <span style={{ fontSize:12, color:'var(--g400)' }}>
                            {new Date(rep.submitted_at||rep.created_at||Date.now()).toLocaleDateString('en-GB',{day:'numeric',month:'short',year:'numeric'})}
                          </span>
                          <span style={{ fontSize:11, color:'var(--g400)', fontWeight:700 }}>· Anonymous</span>
                        </div>
                        <div style={{ fontSize:13.5, color:'var(--g700)', lineHeight:1.65 }}>
                          {isExp ? rep.message : (preview+(rep.message?.length>200?'…':''))}
                        </div>
                        {rep.message?.length > 200 && (
                          <button onClick={() => setExpanded(isExp?null:rep.id)}
                            style={{ background:'none', border:'none', cursor:'pointer', fontSize:12, color:'var(--g500)', padding:'6px 0 0', textDecoration:'underline' }}>
                            {isExp ? 'Show less' : 'Read more'}
                          </button>
                        )}
                      </div>
                      <div style={{ display:'flex', gap:6, flexShrink:0, flexWrap:'wrap' }}>
                        {(rep.status==='open'||!rep.status) && (
                          <button onClick={() => setAnonStatus(rep.id,'reviewing')} disabled={rBusy[rep.id]}
                            style={{ fontSize:12, fontWeight:700, padding:'6px 12px', border:'1px solid rgba(37,99,235,.3)', borderRadius:7, cursor:'pointer', background:'rgba(37,99,235,.06)', color:'#1d4ed8' }}>
                            Start Review
                          </button>
                        )}
                        {['open','reviewing',undefined].includes(rep.status) && (
                          <>
                            <button onClick={() => setAnonStatus(rep.id,'resolved')} disabled={rBusy[rep.id]}
                              style={{ fontSize:12, fontWeight:700, padding:'6px 12px', border:'1px solid rgba(34,197,94,.4)', borderRadius:7, cursor:'pointer', background:'rgba(34,197,94,.06)', color:'#15803d' }}>
                              Resolve
                            </button>
                            <button onClick={() => setAnonStatus(rep.id,'dismissed')} disabled={rBusy[rep.id]}
                              style={{ fontSize:12, fontWeight:700, padding:'6px 12px', border:'1px solid var(--g200)', borderRadius:7, cursor:'pointer', background:'var(--off)', color:'var(--g600)' }}>
                              Dismiss
                            </button>
                          </>
                        )}
                        {['resolved','dismissed'].includes(rep.status) && (
                          <button onClick={() => setAnonStatus(rep.id,'open')}
                            style={{ fontSize:12, fontWeight:700, padding:'6px 12px', border:'1px solid var(--g200)', borderRadius:7, cursor:'pointer', background:'var(--off)', color:'var(--g600)' }}>
                            Re-open
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </>
        )}

        {/* ═══════════════ UNIVERSITY REP REPORTS TAB ════════════ */}
        {tab === 'rep_reports' && (
          <>
            <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(130px,1fr))', gap:12, marginBottom:24 }}>
              {[
                { label:'Total',      value: repReports.length,                               col:'#111118' },
                { label:'Post-Event', value: repReports.filter(r=>r.type==='event').length,    col:'#2563eb' },
                { label:'6-Month',    value: repReports.filter(r=>r.type==='semester').length,  col:'#d97706' },
                { label:'Annual',     value: repReports.filter(r=>r.type==='annual').length,    col:'#059669' },
                { label:'Pending',    value: repReports.filter(r=>r.status==='submitted').length,col:'#dc2626' },
              ].map(s => (
                <div key={s.label} style={{ background:'var(--white)', border:'1px solid var(--g100)', borderRadius:12, padding:'16px 18px' }}>
                  <div style={{ fontSize:10, fontWeight:700, letterSpacing:1.6, textTransform:'uppercase', color:'var(--g400)', marginBottom:6 }}>{s.label}</div>
                  <div style={{ fontSize:26, fontWeight:800, color: s.col, fontFamily:'var(--serif)', lineHeight:1 }}>{s.value}</div>
                </div>
              ))}
            </div>

            <div className="hscroll" style={{ display:'flex', gap:24, marginBottom:20, borderBottom:'1px solid var(--g100)', paddingBottom:14, overflowX:'auto', flexWrap:'nowrap' }}>
              {[['all','All'],['event','Post-Event'],['semester','6-Month'],['annual','Annual']].map(([val, label]) => (
                <button key={val} onClick={() => setRepFilter(val)}
                  style={{ background:'none', border:'none', borderBottom:`2px solid ${repFilter===val ? 'var(--ink)' : 'transparent'}`, cursor:'pointer', padding:'0 0 4px', fontSize:14, fontWeight: repFilter===val ? 800 : 500, color: repFilter===val ? 'var(--ink)' : 'var(--g400)', transition:'color .15s, border-color .15s', whiteSpace:'nowrap' }}>
                  {label}
                </button>
              ))}
            </div>

            {repFiltered.length === 0 ? (
              <div style={{ background:'var(--white)', border:'1px solid var(--g100)', borderRadius:14, padding:'48px', textAlign:'center', color:'var(--g400)', fontSize:14 }}>
                {repReports.length === 0 ? 'No university reports submitted yet.' : 'No reports match this filter.'}
              </div>
            ) : (
              <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
                {repFiltered.map(r => {
                  const t  = REP_TYPES[r.type]    || REP_TYPES.event
                  const st = REP_STATUS[r.status]  || REP_STATUS.submitted
                  const isExp = repExpanded === r.id
                  return (
                    <div key={r.id} style={{ background:'var(--white)', border:`1px solid ${r.status==='submitted' ? 'rgba(220,38,38,.25)' : 'var(--g100)'}`, borderRadius:14, overflow:'hidden' }}>
                      <div style={{ padding:'18px 22px', display:'flex', justifyContent:'space-between', alignItems:'flex-start', gap:16, flexWrap:'wrap' }}>
                        <div style={{ flex:1, minWidth:0 }}>
                          <div style={{ display:'flex', gap:8, flexWrap:'wrap', alignItems:'center', marginBottom:8 }}>
                            <span style={{ fontSize:11, fontWeight:700, padding:'2px 8px', borderRadius:4, background: t.bg, color: t.text }}>{t.label}</span>
                            <span style={{ fontSize:11, fontWeight:700, padding:'2px 8px', borderRadius:4, background: st.bg, color: st.text }}>{st.label}</span>
                            <span style={{ fontSize:12, color:'var(--g400)' }}>
                              {new Date(r.submitted_at).toLocaleDateString('en-GB',{day:'numeric',month:'short',year:'numeric'})}
                            </span>
                          </div>
                          <div style={{ fontFamily:'var(--serif)', fontSize:16, fontWeight:700, color:'var(--ink)', marginBottom:3 }}>{r.title}</div>
                          <div style={{ fontSize:12.5, color:'var(--g500)' }}>
                            {r.rep_name} · {r.university}
                            {r.event_name && ` · ${r.event_name}`}
                            {r.period && ` · ${r.period}`}
                            {r.attendance_count && ` · ${r.attendance_count} participants`}
                          </div>
                        </div>
                        <div style={{ display:'flex', gap:8, flexShrink:0, flexWrap:'wrap' }}>
                          {r.status === 'submitted' && (
                            <button onClick={() => repMarkReviewed(r.id)}
                              style={{ fontSize:12, fontWeight:700, padding:'6px 12px', border:'1px solid rgba(217,119,6,.4)', borderRadius:7, cursor:'pointer', background:'rgba(217,119,6,.06)', color:'#d97706' }}>
                              Mark Reviewed
                            </button>
                          )}
                          {(r.status === 'submitted' || r.status === 'reviewed') && (
                            <button onClick={() => repAcknowledge(r.id)}
                              style={{ fontSize:12, fontWeight:700, padding:'6px 12px', border:'1px solid rgba(5,150,105,.4)', borderRadius:7, cursor:'pointer', background:'rgba(5,150,105,.06)', color:'#059669' }}>
                              Acknowledge
                            </button>
                          )}
                          <button onClick={() => setRepExpanded(isExp ? null : r.id)}
                            style={{ fontSize:12, fontWeight:700, padding:'6px 14px', border:'1px solid var(--g200)', borderRadius:7, cursor:'pointer', background:'var(--off)', color:'var(--g600)' }}>
                            {isExp ? 'Collapse' : 'View'}
                          </button>
                        </div>
                      </div>

                      {isExp && (
                        <div style={{ borderTop:'1px solid var(--g100)' }}>
                          {[
                            { label: 'Summary',                   body: r.summary         },
                            { label: 'Achievements & Highlights',  body: r.achievements    },
                            { label: 'Challenges & Issues',        body: r.challenges      },
                            { label: 'Recommendations to AUSI',    body: r.recommendations },
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
          </>
        )}

        {/* ═════════════════ CRISIS MANAGEMENT TAB ═══════════════ */}
        {tab === 'crisis' && (
          <>
            {/* Stats */}
            <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(130px,1fr))', gap:12, marginBottom:24 }}>
              {[
                { label:'Total Cases',   value: cases.length,              col:'#111118' },
                { label:'Open',          value: crisisCounts.open||0,      col:'#d97706' },
                { label:'In Progress',   value: crisisCounts.in_progress||0,col:'#2563eb' },
                { label:'Resolved',      value: crisisCounts.resolved||0,  col:'#059669' },
              ].map(s => (
                <div key={s.label} style={{ background:'var(--white)', border:'1px solid var(--g100)', borderRadius:12, padding:'16px 18px' }}>
                  <div style={{ fontSize:10, fontWeight:700, letterSpacing:1.6, textTransform:'uppercase', color:'var(--g400)', marginBottom:6 }}>{s.label}</div>
                  <div style={{ fontSize:26, fontWeight:800, color:'var(--ink)', fontFamily:'var(--serif)', lineHeight:1 }}>{s.value}</div>
                </div>
              ))}
            </div>

            {/* Filters + Add button */}
            <div style={{ display:'flex', gap:10, marginBottom:20, flexWrap:'wrap', alignItems:'center' }}>
              <div className="hscroll" style={{ display:'flex', gap:20, borderBottom:'1px solid var(--g100)', paddingBottom:14, overflowX:'auto', flexWrap:'nowrap', flex:1 }}>
                {/* Status filter */}
                {['all','open','in_progress','resolved'].map(f => {
                  const active = cFilter === f
                  const label = f === 'all' ? 'All Statuses' : (CRISIS_STATUS[f]?.label || f)
                  return (
                    <button key={f} onClick={() => setCFilter(f)}
                      style={{ background:'none', border:'none', borderBottom:`2px solid ${active ? 'var(--ink)' : 'transparent'}`, cursor:'pointer', padding:'0 0 4px', fontSize:13.5, fontWeight: active ? 800 : 500, color: active ? 'var(--ink)' : 'var(--g400)', transition:'color .15s, border-color .15s', whiteSpace:'nowrap' }}>
                      {label}
                    </button>
                  )
                })}
                <div style={{ width:1, background:'var(--g200)', margin:'0 4px', alignSelf:'stretch', flexShrink:0 }} />
                {/* Type filter */}
                {['all', ...Object.keys(PROBLEM_TYPES)].map(t => {
                  const active = cTypeF === t
                  const label = t === 'all' ? 'All Types' : PROBLEM_TYPES[t].label
                  return (
                    <button key={t} onClick={() => setCTypeF(t)}
                      style={{ background:'none', border:'none', borderBottom:`2px solid ${active ? 'var(--ink)' : 'transparent'}`, cursor:'pointer', padding:'0 0 4px', fontSize:13.5, fontWeight: active ? 800 : 500, color: active ? 'var(--ink)' : 'var(--g400)', transition:'color .15s, border-color .15s', whiteSpace:'nowrap' }}>
                      {label}
                    </button>
                  )
                })}
              </div>
              <button onClick={openAddCase}
                style={{ padding:'10px 20px', background:'var(--ink)', color:'#fff', border:'none', borderRadius:10, fontWeight:700, fontSize:13.5, cursor:'pointer', flexShrink:0 }}>
                + Record Case
              </button>
            </div>

            {/* Case list */}
            <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
              {crisisFiltered.length === 0 ? (
                <div style={{ background:'var(--white)', border:'1px solid var(--g100)', borderRadius:14, padding:'48px', textAlign:'center', color:'var(--g400)', fontSize:14 }}>
                  {cases.length === 0
                    ? 'No crisis cases recorded yet. Click "Record Case" to add one.'
                    : 'No cases match the selected filters.'}
                </div>
              ) : crisisFiltered.map(c => {
                const pt  = PROBLEM_TYPES[c.problem_type] || PROBLEM_TYPES.school_fees
                const cs  = CRISIS_STATUS[c.status]       || CRISIS_STATUS.open
                const isExp = expanded === `c-${c.id}`
                return (
                  <div key={c.id} style={{ background:'var(--white)', border:'1px solid var(--g100)', borderRadius:14, overflow:'hidden' }}>
                    {/* Card header */}
                    <div style={{ padding:'18px 22px 14px', borderBottom:'1px solid var(--g100)', display:'flex', justifyContent:'space-between', alignItems:'flex-start', gap:16, flexWrap:'wrap' }}>
                      <div style={{ flex:1 }}>
                        <div style={{ display:'flex', gap:8, marginBottom:8, flexWrap:'wrap', alignItems:'center' }}>
                          <Badge label={pt.label}  bg={pt.bg}  text={pt.text} />
                          <Badge label={cs.label}  bg={cs.bg}  text={cs.text} />
                          <span style={{ fontSize:12, color:'var(--g400)' }}>
                            Opened {new Date(c.date_opened).toLocaleDateString('en-GB',{day:'numeric',month:'short',year:'numeric'})}
                          </span>
                          {c.date_resolved && c.status === 'resolved' && (
                            <span style={{ fontSize:12, color:'#059669' }}>
                              · Resolved {new Date(c.date_resolved).toLocaleDateString('en-GB',{day:'numeric',month:'short',year:'numeric'})}
                            </span>
                          )}
                        </div>
                        {/* Student info inline */}
                        <div style={{ fontFamily:'var(--serif)', fontSize:16, fontWeight:700, color:'var(--ink)', marginBottom:3 }}>
                          {c.student_name || 'Unknown Student'}
                        </div>
                        {c.problem_type === 'other' && c.problem_other && (
                          <div style={{ fontSize:12.5, color:'var(--g500)', fontStyle:'italic', marginBottom:2 }}>
                            Other: {c.problem_other}
                          </div>
                        )}
                        <div style={{ fontSize:12.5, color:'var(--g500)', display:'flex', gap:12, flexWrap:'wrap' }}>
                          {c.student_university && <span>{c.student_university}</span>}
                          {c.student_course     && <span>· {c.student_course}</span>}
                          {c.student_contact    && <span>· {c.student_contact}</span>}
                        </div>
                      </div>
                      <div style={{ display:'flex', gap:8, flexShrink:0 }}>
                        <button onClick={() => openEditCase(c)}
                          style={{ fontSize:12, fontWeight:700, padding:'6px 14px', border:'1px solid var(--g200)', borderRadius:8, cursor:'pointer', background:'var(--off)', color:'var(--ink)' }}>Edit</button>
                        <button onClick={() => setCDel(c)}
                          style={{ fontSize:12, fontWeight:700, padding:'6px 14px', border:'1px solid rgba(220,38,38,.3)', borderRadius:8, cursor:'pointer', background:'rgba(220,38,38,.06)', color:'#dc2626' }}>Delete</button>
                      </div>
                    </div>

                    {/* Story preview */}
                    <div style={{ padding:'14px 22px', borderBottom: c.resolution ? '1px solid var(--g100)' : 'none' }}>
                      <div style={{ fontSize:11.5, fontWeight:700, letterSpacing:1, textTransform:'uppercase', color:'var(--g400)', marginBottom:6 }}>Problem</div>
                      <div style={{ fontSize:13.5, color:'var(--g600)', lineHeight:1.65 }}>
                        {isExp ? c.story : (c.story?.slice(0,240)+(c.story?.length>240?'…':''))}
                      </div>
                      {c.story?.length > 240 && (
                        <button onClick={() => setExpanded(isExp ? null : `c-${c.id}`)}
                          style={{ background:'none', border:'none', cursor:'pointer', fontSize:12, color:'var(--g500)', padding:'6px 0 0', textDecoration:'underline' }}>
                          {isExp ? 'Show less' : 'Read more'}
                        </button>
                      )}
                    </div>

                    {/* Resolution (shown if present) */}
                    {c.resolution && isExp && (
                      <div style={{ padding:'14px 22px', background:'rgba(5,150,105,.03)', borderTop:'1px solid var(--g100)' }}>
                        <div style={{ fontSize:11.5, fontWeight:700, letterSpacing:1, textTransform:'uppercase', color:'#059669', marginBottom:6 }}>Resolution</div>
                        <div style={{ fontSize:13.5, color:'var(--g600)', lineHeight:1.65 }}>{c.resolution}</div>
                      </div>
                    )}
                    {c.resolution && !isExp && (
                      <div style={{ padding:'10px 22px 14px' }}>
                        <button onClick={() => setExpanded(`c-${c.id}`)}
                          style={{ background:'none', border:'none', cursor:'pointer', fontSize:12, color:'#059669', fontWeight:600, padding:0, textDecoration:'underline' }}>
                          View resolution
                        </button>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </>
        )}
      </div>

      {/* ══════════════ CRISIS ADD / EDIT MODAL ════════════════ */}
      {cModal && cForm && (
        <Modal title={cModal === 'add' ? 'Record Crisis Case' : 'Edit Crisis Case'} onClose={() => setCModal(null)} wide>
          {/* Student picker */}
          <div style={{ marginBottom:20 }}>
            <label style={lbl}>Student <span style={{ fontWeight:400, color:'var(--g400)', textTransform:'none', letterSpacing:0 }}>— click a name to load their details</span></label>
            <StudentPicker members={members} selected={selStudent} onSelect={setSelStudent} />
          </div>

          {/* Manual override fields (shown when no student selected from list) */}
          {!selStudent && (
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:16, marginBottom:16, padding:'14px 16px', background:'var(--off)', borderRadius:10, border:'1px solid var(--g100)' }}>
              <div>
                <label style={lbl}>Student Name</label>
                <input value={cForm.student_name} onChange={setF('student_name')} style={inp} placeholder="Full name" />
              </div>
              <div>
                <label style={lbl}>Course / Programme</label>
                <input value={cForm.student_course} onChange={setF('student_course')} style={inp} placeholder="e.g. MBBS" />
              </div>
              <div>
                <label style={lbl}>University</label>
                <input value={cForm.student_university} onChange={setF('student_university')} style={inp} placeholder="University name" />
              </div>
              <div>
                <label style={lbl}>Contact (Email)</label>
                <input value={cForm.student_contact} onChange={setF('student_contact')} style={inp} placeholder="email@example.com" />
              </div>
            </div>
          )}

          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:16, marginBottom: cForm.problem_type === 'other' ? 8 : 16 }}>
            <div>
              <label style={lbl}>Problem Type</label>
              <select value={cForm.problem_type} onChange={setF('problem_type')} style={{ ...inp, cursor:'pointer' }}>
                {Object.entries(PROBLEM_TYPES).map(([k,v]) => <option key={k} value={k}>{v.label}</option>)}
              </select>
            </div>
            <div>
              <label style={lbl}>Status</label>
              <select value={cForm.status} onChange={setF('status')} style={{ ...inp, cursor:'pointer' }}>
                {Object.entries(CRISIS_STATUS).map(([k,v]) => <option key={k} value={k}>{v.label}</option>)}
              </select>
            </div>
            <div>
              <label style={lbl}>Date Opened</label>
              <input type="date" value={cForm.date_opened} onChange={setF('date_opened')} style={inp} />
            </div>
          </div>

          {cForm.problem_type === 'other' && (
            <div style={{ marginBottom:16 }}>
              <label style={lbl}>Specify Problem <span style={{ fontWeight:400, color:'var(--g400)', textTransform:'none', letterSpacing:0 }}>— brief description of the issue</span></label>
              <input
                value={cForm.problem_other}
                onChange={setF('problem_other')}
                style={inp}
                placeholder="e.g. accommodation dispute, mental health crisis…"
                autoFocus
              />
            </div>
          )}

          {cForm.status === 'resolved' && (
            <div style={{ marginBottom:16 }}>
              <label style={lbl}>Date Resolved</label>
              <input type="date" value={cForm.date_resolved} onChange={setF('date_resolved')} style={{ ...inp, maxWidth:220 }} />
            </div>
          )}

          <div style={{ marginBottom:16 }}>
            <label style={lbl}>Problem Story <span style={{ fontWeight:400, color:'var(--g400)', textTransform:'none', letterSpacing:0 }}>— describe the situation in detail</span></label>
            <textarea value={cForm.story} onChange={setF('story')} rows={5} style={{ ...inp, resize:'vertical', lineHeight:1.65, fontFamily:'inherit' }} placeholder="What happened? Describe the crisis, when it started, and relevant background…" />
          </div>

          <div style={{ marginBottom:24 }}>
            <label style={lbl}>Resolution <span style={{ fontWeight:400, color:'var(--g400)', textTransform:'none', letterSpacing:0 }}>— how was / is this being addressed?</span></label>
            <textarea value={cForm.resolution} onChange={setF('resolution')} rows={4} style={{ ...inp, resize:'vertical', lineHeight:1.65, fontFamily:'inherit' }} placeholder="Steps taken, parties involved, outcome or ongoing actions…" />
          </div>

          <div style={{ display:'flex', gap:10 }}>
            <button onClick={() => setCModal(null)} style={{ flex:1, padding:'10px', border:'1px solid var(--g200)', borderRadius:8, background:'transparent', cursor:'pointer', fontWeight:700, fontSize:13.5, color:'var(--g600)' }}>Cancel</button>
            <button onClick={submitCase} style={{ flex:2, padding:'10px', background:'var(--ink)', color:'#fff', border:'none', borderRadius:8, fontWeight:700, fontSize:13.5, cursor:'pointer' }}>
              {cModal === 'add' ? 'Save Case' : 'Update Case'}
            </button>
          </div>
        </Modal>
      )}

      {/* ══════════════ DELETE CONFIRM ══════════════════════════ */}
      {cDel && (
        <Modal title="Delete Case" onClose={() => setCDel(null)}>
          <p style={{ fontSize:14, color:'var(--g600)', marginBottom:22 }}>
            Delete the crisis case for <strong>{cDel.student_name}</strong>? This cannot be undone.
          </p>
          <div style={{ display:'flex', gap:10 }}>
            <button onClick={() => setCDel(null)} style={{ flex:1, padding:'10px', border:'1px solid var(--g200)', borderRadius:8, background:'transparent', cursor:'pointer', fontWeight:700, fontSize:13.5, color:'var(--g600)' }}>Cancel</button>
            <button onClick={() => delCase(cDel.id)} style={{ flex:1, padding:'10px', border:'none', borderRadius:8, background:'#dc2626', cursor:'pointer', fontWeight:700, fontSize:13.5, color:'#fff' }}>Delete</button>
          </div>
        </Modal>
      )}
    </div>
  )
}
