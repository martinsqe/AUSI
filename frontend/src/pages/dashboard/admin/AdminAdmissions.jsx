import { useEffect, useState } from 'react'
import api from '../../../lib/api'

const STATUS_COLORS = {
  pending:  { bg:'rgba(234,179,8,.1)',  text:'#92400e', border:'rgba(234,179,8,.3)' },
  reviewed: { bg:'rgba(59,130,246,.1)', text:'#1d4ed8', border:'rgba(59,130,246,.3)' },
  accepted: { bg:'rgba(34,197,94,.1)',  text:'#15803d', border:'rgba(34,197,94,.3)' },
  rejected: { bg:'rgba(239,68,68,.1)',  text:'#b91c1c', border:'rgba(239,68,68,.3)' },
}

function Badge({ s }) {
  const c = STATUS_COLORS[s] || STATUS_COLORS.pending
  return <span style={{ fontSize:11, fontWeight:700, letterSpacing:.8, textTransform:'uppercase', padding:'2px 9px', borderRadius:4, background:c.bg, color:c.text }}>{s}</span>
}

export default function AdminAdmissions() {
  const [apps, setApps] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')
  const [search, setSearch] = useState('')
  const [busy, setBusy] = useState({})
  const [notes, setNotes] = useState({})

  const load = () => {
    api.get('/dashboard/admin').then(r => { setApps(r.data?.applications || []); setLoading(false) }).catch(() => setLoading(false))
  }
  useEffect(load, [])

  const setStatus = async (id, status) => {
    setBusy(b => ({ ...b, [id]: true }))
    try { await api.patch(`/applications/${id}/status`, { status, notes: notes[id] || undefined }); load() }
    catch {}
    setBusy(b => ({ ...b, [id]: false }))
  }

  const filtered = apps.filter(a => {
    const matchF = filter === 'all' || a.status === filter
    const q = search.toLowerCase()
    const matchQ = !q || a.full_name?.toLowerCase().includes(q) || a.email?.toLowerCase().includes(q) || a.course?.toLowerCase().includes(q)
    return matchF && matchQ
  })

  const counts = apps.reduce((acc, a) => { acc[a.status] = (acc[a.status] || 0) + 1; return acc }, {})
  const inp = { padding:'9px 13px', border:'1.5px solid var(--g200)', borderRadius:8, fontSize:13.5, outline:'none', background:'var(--white)' }

  return (
    <div style={{ background:'var(--off)', minHeight:'100vh' }}>
      <div style={{ background:'linear-gradient(160deg,#111118 0%,#1a1200 100%)', padding:'36px 0 32px', color:'#fff' }}>
        <div className="container">
          <img src="/logo.png" alt="AUSI" style={{ width:42, height:42, borderRadius:'50%', objectFit:'cover', display:'block', marginBottom:12 }} />
          <div style={{ fontSize:11, fontWeight:700, letterSpacing:2.2, textTransform:'uppercase', color:'rgba(255,255,255,.35)', marginBottom:8 }}>AUSI · Admin</div>
          <h1 style={{ fontFamily:'var(--serif)', fontSize:'clamp(22px,3vw,30px)', fontWeight:700, color:'#fff', margin:'0 0 6px' }}>Admissions</h1>
          <p style={{ fontSize:13.5, color:'rgba(255,255,255,.4)', margin:0 }}>Review, approve, and manage student applications</p>
        </div>
      </div>

      <div className="container" style={{ paddingTop:32, paddingBottom:64 }}>

        {/* Stats row */}
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(140px,1fr))', gap:12, marginBottom:24 }}>
          {[
            { label:'Total', value: apps.length, color:'#111118' },
            { label:'Pending', value: counts.pending || 0, color:'#d97706' },
            { label:'Reviewed', value: counts.reviewed || 0, color:'#2563eb' },
            { label:'Accepted', value: counts.accepted || 0, color:'#059669' },
            { label:'Rejected', value: counts.rejected || 0, color:'#dc2626' },
          ].map(s => (
            <div key={s.label} style={{ background:'var(--white)', border:'1px solid var(--g100)', borderRadius:12, padding:'16px 18px' }}>
              <div style={{ fontSize:10, fontWeight:700, letterSpacing:1.6, textTransform:'uppercase', color:'var(--g400)', marginBottom:6 }}>{s.label}</div>
              <div style={{ fontSize:26, fontWeight:800, color:'var(--ink)', fontFamily:'var(--serif)', lineHeight:1 }}>{s.value}</div>
            </div>
          ))}
        </div>

        {/* Search */}
        <div style={{ marginBottom:12 }}>
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search applicant, course…" style={{ ...inp, width:'100%', maxWidth:420, boxSizing:'border-box' }} />
        </div>
        {/* Filters */}
        <div className="hscroll" style={{ display:'flex', gap:24, marginBottom:16, borderBottom:'1px solid var(--g100)', paddingBottom:14, overflowX:'auto', flexWrap:'nowrap' }}>
          {['all','pending','reviewed','accepted','rejected'].map(s => {
            const active = filter === s
            return (
              <button key={s} onClick={() => setFilter(s)}
                style={{ background:'none', border:'none', borderBottom:`2px solid ${active ? 'var(--ink)' : 'transparent'}`, cursor:'pointer', padding:'0 0 4px', fontSize:14, fontWeight: active ? 800 : 500, color: active ? 'var(--ink)' : 'var(--g400)', transition:'color .15s, border-color .15s', textTransform:'capitalize' }}>
                {s === 'all' ? 'All' : s}
              </button>
            )
          })}
        </div>

        {/* Table */}
        <div style={{ background:'var(--white)', border:'1px solid var(--g100)', borderRadius:14, overflow:'hidden' }}>
          <div className="tscroll" style={{ overflowX:'auto' }}>
            <table style={{ width:'100%', borderCollapse:'collapse', fontSize:13 }}>
              <thead>
                <tr style={{ borderBottom:'2px solid var(--g100)', background:'var(--off)' }}>
                  {['Applicant','Email','Course','Level','Universities','Date','Status','Update','Notes'].map(h => (
                    <th key={h} style={{ textAlign:'left', padding:'11px 14px', fontSize:10.5, fontWeight:700, letterSpacing:1, textTransform:'uppercase', color:'var(--g400)', whiteSpace:'nowrap' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={9} style={{ padding:'40px', textAlign:'center', color:'var(--g400)' }}>Loading…</td></tr>
                ) : filtered.length === 0 ? (
                  <tr><td colSpan={9} style={{ padding:'40px', textAlign:'center', color:'var(--g400)' }}>No applications found.</td></tr>
                ) : filtered.map(a => (
                  <tr key={a.id} style={{ borderBottom:'1px solid var(--g100)' }}>
                    <td style={{ padding:'12px 14px', fontWeight:700, color:'var(--ink)', whiteSpace:'nowrap' }}>{a.full_name}</td>
                    <td style={{ padding:'12px 14px', color:'var(--g600)', fontSize:12 }}>{a.email}</td>
                    <td style={{ padding:'12px 14px', color:'var(--g600)', maxWidth:140, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{a.course}</td>
                    <td style={{ padding:'12px 14px', color:'var(--g600)', whiteSpace:'nowrap' }}>{a.level}</td>
                    <td style={{ padding:'12px 14px', color:'var(--g600)', maxWidth:160, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
                      {a.universities?.join(', ') || '—'}
                    </td>
                    <td style={{ padding:'12px 14px', color:'var(--g500)', whiteSpace:'nowrap', fontSize:12 }}>
                      {new Date(a.created_at).toLocaleDateString('en-GB')}
                    </td>
                    <td style={{ padding:'12px 14px' }}><Badge s={a.status} /></td>
                    <td style={{ padding:'12px 14px' }}>
                      <select value={a.status} disabled={busy[a.id]} onChange={e => setStatus(a.id, e.target.value)}
                        style={{ fontSize:12, padding:'5px 8px', border:'1px solid var(--g200)', borderRadius:6, background:'var(--white)', cursor:'pointer' }}>
                        {['pending','reviewed','accepted','rejected'].map(s => (
                          <option key={s} value={s}>{s.charAt(0).toUpperCase()+s.slice(1)}</option>
                        ))}
                      </select>
                    </td>
                    <td style={{ padding:'12px 14px' }}>
                      <input placeholder="Add note…" value={notes[a.id] || a.notes || ''}
                        onChange={e => setNotes(n => ({ ...n, [a.id]: e.target.value }))}
                        onBlur={() => { if (notes[a.id] !== undefined) setStatus(a.id, a.status) }}
                        style={{ fontSize:12, padding:'5px 9px', border:'1px solid var(--g200)', borderRadius:6, width:130 }} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}
