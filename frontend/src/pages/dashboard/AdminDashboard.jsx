import { useEffect, useState } from 'react'
import { useAuth } from '../../context/AuthContext'
import { ROLE_LABELS, ROLE_COLORS } from '../../lib/roles'
import api from '../../lib/api'

const STATUS_COLORS = {
  pending:  { bg:'rgba(234,179,8,.1)',   text:'#92400e', border:'rgba(234,179,8,.3)' },
  reviewed: { bg:'rgba(59,130,246,.1)',  text:'#1d4ed8', border:'rgba(59,130,246,.3)' },
  accepted: { bg:'rgba(34,197,94,.1)',   text:'#15803d', border:'rgba(34,197,94,.3)' },
  rejected: { bg:'rgba(239,68,68,.1)',   text:'#b91c1c', border:'rgba(239,68,68,.3)' },
}

function Badge({ label, bg, text, border }) {
  return (
    <span style={{ fontSize:11, fontWeight:700, letterSpacing:.8, textTransform:'uppercase', padding:'2px 9px', borderRadius:4, background:bg, color:text }}>
      {label}
    </span>
  )
}

function StatCard({ label, value, accent }) {
  return (
    <div style={{ background:'var(--white)', border:'1px solid var(--g100)', borderRadius:14, padding:'20px 24px' }}>
      <div style={{ fontSize:11, fontWeight:700, letterSpacing:1.6, textTransform:'uppercase', color:'var(--g400)', marginBottom:8 }}>{label}</div>
      <div style={{ fontSize:32, fontWeight:800, color:'var(--ink)', fontFamily:'var(--serif)', lineHeight:1 }}>{value ?? '—'}</div>
    </div>
  )
}

export default function AdminDashboard() {
  const { user } = useAuth()
  const [data, setData]     = useState(null)
  const [tab, setTab]       = useState('members')
  const [error, setError]   = useState('')
  const [search, setSearch] = useState('')
  const [busy, setBusy]     = useState({})

  useEffect(() => {
    api.get('/dashboard/admin')
      .then(r => setData(r.data))
      .catch(() => setError('Could not load dashboard data.'))
  }, [])

  const reload = () => {
    api.get('/dashboard/admin')
      .then(r => setData(r.data))
      .catch(() => {})
  }

  const setRole = async (id, role) => {
    setBusy(b => ({ ...b, [id]: true }))
    try {
      await api.patch(`/members/${id}/role`, { role })
      reload()
    } catch { alert('Failed to update role') }
    setBusy(b => ({ ...b, [id]: false }))
  }

  const toggleVerify = async (id) => {
    setBusy(b => ({ ...b, [id]: true }))
    try {
      await api.patch(`/members/${id}/verify`)
      reload()
    } catch { alert('Failed to update member') }
    setBusy(b => ({ ...b, [id]: false }))
  }

  const setAppStatus = async (id, status) => {
    setBusy(b => ({ ...b, [id]: true }))
    try {
      await api.patch(`/applications/${id}/status`, { status })
      reload()
    } catch { alert('Failed to update application') }
    setBusy(b => ({ ...b, [id]: false }))
  }

  const stats = data?.stats || {}
  const members = (data?.members || []).filter(m =>
    !search || m.full_name?.toLowerCase().includes(search.toLowerCase()) ||
    m.email?.toLowerCase().includes(search.toLowerCase())
  )
  const apps = data?.applications || []

  const tab_style = (t) => ({
    padding:'10px 20px', fontSize:13.5, fontWeight:700, cursor:'pointer', border:'none',
    background: tab === t ? 'var(--ink)' : 'transparent',
    color:      tab === t ? 'var(--white)' : 'var(--g500)',
    borderRadius:8, transition:'all .15s',
  })

  return (
    <div style={{ background:'var(--off)', minHeight:'100vh' }}>

      {/* Header */}
      <div style={{ background:'linear-gradient(160deg,#111118 0%,#1a1200 100%)', padding:'36px 0 32px', color:'#fff' }}>
        <div className="container">
          <img src="/logo.png" alt="AUSI" style={{ width:42, height:42, borderRadius:'50%', objectFit:'cover', display:'block', marginBottom:12 }} />
          <div style={{ fontSize:11, fontWeight:700, letterSpacing:2.2, textTransform:'uppercase', color:'rgba(255,255,255,.35)', marginBottom:8 }}>AUSI · 2026 / 27</div>
          <h1 style={{ fontFamily:'var(--serif)', fontSize:'clamp(22px,3vw,30px)', fontWeight:700, color:'#fff', margin:'0 0 6px' }}>
            Administration
          </h1>
          <p style={{ fontSize:13.5, color:'rgba(255,255,255,.4)', margin:0 }}>
            AUSI platform administration · {ROLE_LABELS[user?.role]}
          </p>
        </div>
      </div>

      <div className="container" style={{ paddingTop:32, paddingBottom:64 }}>

        {error && <div style={{ background:'rgba(220,38,38,.08)', border:'1px solid rgba(220,38,38,.2)', borderRadius:10, padding:'12px 16px', fontSize:13, color:'var(--red)', marginBottom:24 }}>{error}</div>}

        {/* Stats */}
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(140px,1fr))', gap:14, marginBottom:32 }}>
          <StatCard label="Total Members"        value={stats.total_members}          accent="var(--ink)" />
          <StatCard label="Pending Verifications" value={stats.pending_verifications}  accent="#d97706" />
          <StatCard label="Active Events"         value={stats.total_events}           accent="#2563eb" />
          <StatCard label="Applications"          value={stats.total_applications}     accent="#7c3aed" />
          <StatCard label="Pending Applications"  value={stats.pending_applications}   accent="#dc2626" />
        </div>

        {/* Tabs */}
        <div style={{ background:'var(--white)', border:'1px solid var(--g100)', borderRadius:14, overflow:'hidden' }}>
          <div style={{ display:'flex', gap:6, padding:'12px 16px', borderBottom:'1px solid var(--g100)', background:'var(--off)', overflowX:'auto', WebkitOverflowScrolling:'touch' }}>
            <button style={tab_style('members')} onClick={() => setTab('members')}>
              Members ({data?.members?.length ?? 0})
            </button>
            <button style={tab_style('applications')} onClick={() => setTab('applications')}>
              Applications ({apps.length})
            </button>
          </div>

          <div style={{ padding:'20px 24px' }}>

            {/* ── MEMBERS TAB ── */}
            {tab === 'members' && (
              <>
                <div style={{ marginBottom:16 }}>
                  <input
                    placeholder="Search by name or email…"
                    value={search} onChange={e => setSearch(e.target.value)}
                    style={{ width:'100%', maxWidth:340, padding:'9px 13px', fontSize:13.5, border:'1.5px solid var(--g200)', borderRadius:8, outline:'none', boxSizing:'border-box' }}
                  />
                </div>
                <div className="tscroll" style={{ overflowX:'auto' }}>
                  <table style={{ width:'100%', borderCollapse:'collapse', fontSize:13 }}>
                    <thead>
                      <tr style={{ borderBottom:'2px solid var(--g100)' }}>
                        {['Name','Email','University','Role','Verified','Actions'].map(h => (
                          <th key={h} style={{ textAlign:'left', padding:'10px 12px', fontSize:11, fontWeight:700, letterSpacing:1, textTransform:'uppercase', color:'var(--g400)', whiteSpace:'nowrap' }}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {members.map(m => (
                        <tr key={m.id} style={{ borderBottom:'1px solid var(--g100)' }}>
                          <td style={{ padding:'12px 12px', fontWeight:600, color:'var(--ink)', whiteSpace:'nowrap' }}>{m.full_name}</td>
                          <td style={{ padding:'12px 12px', color:'var(--g600)' }}>{m.email}</td>
                          <td style={{ padding:'12px 12px', color:'var(--g600)', whiteSpace:'nowrap' }}>{m.university_name || '—'}</td>
                          <td style={{ padding:'12px 12px' }}>
                            <select
                              value={m.role} disabled={busy[m.id]}
                              onChange={e => setRole(m.id, e.target.value)}
                              style={{ fontSize:12, padding:'4px 8px', border:'1px solid var(--g200)', borderRadius:6, background:'var(--white)', cursor:'pointer', color: ROLE_COLORS[m.role] || 'var(--ink)', fontWeight:700 }}>
                              {['student','alumni','university_rep','exec','chapter_president','patron','admin'].map(r => (
                                <option key={r} value={r}>{ROLE_LABELS[r]}</option>
                              ))}
                            </select>
                          </td>
                          <td style={{ padding:'12px 12px' }}>
                            <Badge
                              label={m.is_verified ? 'Verified' : 'Pending'}
                              bg={m.is_verified ? 'rgba(34,197,94,.1)' : 'rgba(234,179,8,.1)'}
                              text={m.is_verified ? '#15803d' : '#92400e'}
                              border={m.is_verified ? 'rgba(34,197,94,.3)' : 'rgba(234,179,8,.3)'}
                            />
                          </td>
                          <td style={{ padding:'12px 12px' }}>
                            <button
                              onClick={() => toggleVerify(m.id)} disabled={busy[m.id]}
                              style={{ fontSize:11.5, fontWeight:700, padding:'5px 12px', border:'1px solid var(--g200)', borderRadius:7, cursor:'pointer', background:'var(--off)', color:'var(--ink)', whiteSpace:'nowrap' }}>
                              {m.is_verified ? 'Unverify' : 'Verify'}
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {!members.length && (
                    <div style={{ padding:'32px 0', textAlign:'center', fontSize:13, color:'var(--g400)' }}>No members found.</div>
                  )}
                </div>
              </>
            )}

            {/* ── APPLICATIONS TAB ── */}
            {tab === 'applications' && (
              <div className="tscroll" style={{ overflowX:'auto' }}>
                <table style={{ width:'100%', borderCollapse:'collapse', fontSize:13 }}>
                  <thead>
                    <tr style={{ borderBottom:'2px solid var(--g100)' }}>
                      {['Applicant','Email','Course','Level','Universities','Date','Status','Action'].map(h => (
                        <th key={h} style={{ textAlign:'left', padding:'10px 12px', fontSize:11, fontWeight:700, letterSpacing:1, textTransform:'uppercase', color:'var(--g400)', whiteSpace:'nowrap' }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {apps.map(a => {
                      const sc = STATUS_COLORS[a.status] || STATUS_COLORS.pending
                      return (
                        <tr key={a.id} style={{ borderBottom:'1px solid var(--g100)' }}>
                          <td style={{ padding:'12px 12px', fontWeight:600, color:'var(--ink)', whiteSpace:'nowrap' }}>{a.full_name}</td>
                          <td style={{ padding:'12px 12px', color:'var(--g600)' }}>{a.email}</td>
                          <td style={{ padding:'12px 12px', color:'var(--g600)' }}>{a.course}</td>
                          <td style={{ padding:'12px 12px', color:'var(--g600)', whiteSpace:'nowrap' }}>{a.level}</td>
                          <td style={{ padding:'12px 12px', color:'var(--g600)', maxWidth:160, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
                            {a.universities?.join(', ') || '—'}
                          </td>
                          <td style={{ padding:'12px 12px', color:'var(--g500)', whiteSpace:'nowrap' }}>
                            {new Date(a.created_at).toLocaleDateString()}
                          </td>
                          <td style={{ padding:'12px 12px' }}>
                            <Badge label={a.status} bg={sc.bg} text={sc.text} border={sc.border} />
                          </td>
                          <td style={{ padding:'12px 12px' }}>
                            <select
                              value={a.status} disabled={busy[a.id]}
                              onChange={e => setAppStatus(a.id, e.target.value)}
                              style={{ fontSize:12, padding:'4px 8px', border:'1px solid var(--g200)', borderRadius:6, background:'var(--white)', cursor:'pointer' }}>
                              {['pending','reviewed','accepted','rejected'].map(s => (
                                <option key={s} value={s}>{s.charAt(0).toUpperCase()+s.slice(1)}</option>
                              ))}
                            </select>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
                {!apps.length && (
                  <div style={{ padding:'32px 0', textAlign:'center', fontSize:13, color:'var(--g400)' }}>No applications yet.</div>
                )}
              </div>
            )}

          </div>
        </div>
      </div>
    </div>
  )
}
