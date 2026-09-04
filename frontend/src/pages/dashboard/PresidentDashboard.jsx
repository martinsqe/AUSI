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

function StatCard({ label, value, accent, sub }) {
  return (
    <div style={{ background:'var(--white)', border:'1px solid var(--g100)', borderRadius:14, padding:'20px 24px' }}>
      <div style={{ fontSize:11, fontWeight:700, letterSpacing:1.6, textTransform:'uppercase', color:'var(--g400)', marginBottom:8 }}>{label}</div>
      <div style={{ fontSize:30, fontWeight:800, color:'var(--ink)', fontFamily:'var(--serif)', lineHeight:1 }}>{value ?? '—'}</div>
      {sub && <div style={{ fontSize:12, color:'var(--g500)', marginTop:5 }}>{sub}</div>}
    </div>
  )
}

const TABS = ['Overview', 'Members', 'Leadership', 'Applications']

export default function PresidentDashboard() {
  const { user } = useAuth()
  const [data, setData]     = useState(null)
  const [tab, setTab]       = useState('Overview')
  const [error, setError]   = useState('')
  const [search, setSearch] = useState('')
  const [busy, setBusy]     = useState({})
  const [notes, setNotes]   = useState({})

  useEffect(() => {
    api.get('/dashboard/president')
      .then(r => setData(r.data))
      .catch(() => setError('Could not load dashboard data.'))
  }, [])

  const reload = () => {
    api.get('/dashboard/president').then(r => setData(r.data)).catch(() => {})
  }

  const setRole = async (id, role) => {
    setBusy(b => ({ ...b, [id]: true }))
    try { await api.patch(`/members/${id}/role`, { role }); reload() }
    catch { alert('Failed to update role') }
    setBusy(b => ({ ...b, [id]: false }))
  }

  const toggleVerify = async (id) => {
    setBusy(b => ({ ...b, [id]: true }))
    try { await api.patch(`/members/${id}/verify`); reload() }
    catch { alert('Failed to update member') }
    setBusy(b => ({ ...b, [id]: false }))
  }

  const setAppStatus = async (id, status) => {
    setBusy(b => ({ ...b, [id]: true }))
    try { await api.patch(`/applications/${id}/status`, { status, notes: notes[id] || undefined }); reload() }
    catch { alert('Failed to update application') }
    setBusy(b => ({ ...b, [id]: false }))
  }

  const stats    = data?.stats || {}
  const members  = (data?.members || []).filter(m =>
    !search || m.full_name?.toLowerCase().includes(search.toLowerCase()) ||
    m.email?.toLowerCase().includes(search.toLowerCase())
  )
  const leadership = data?.leadership || []
  const apps       = data?.applications || []
  const byRole     = data?.membersByRole || []

  const tab_style = (t) => ({
    padding:'9px 18px', fontSize:13.5, fontWeight:700, cursor:'pointer', border:'none',
    background: tab === t ? 'var(--ink)' : 'transparent',
    color:      tab === t ? 'var(--white)' : 'var(--g500)',
    borderRadius:8, transition:'all .15s', whiteSpace:'nowrap',
  })

  const TH = ({ children }) => (
    <th style={{ textAlign:'left', padding:'10px 12px', fontSize:11, fontWeight:700, letterSpacing:1, textTransform:'uppercase', color:'var(--g400)', whiteSpace:'nowrap' }}>{children}</th>
  )
  const TD = ({ children, style }) => (
    <td style={{ padding:'12px 12px', ...style }}>{children}</td>
  )

  return (
    <div style={{ background:'var(--off)', minHeight:'100vh' }}>

      {/* Header */}
      <div style={{ background:'linear-gradient(160deg,#111118 0%,#1a1200 100%)', padding:'36px 0 32px', color:'#fff' }}>
        <div className="container">
          <img src="/logo.png" alt="AUSI" style={{ width:42, height:42, borderRadius:'50%', objectFit:'cover', display:'block', marginBottom:12 }} />
          <div style={{ fontSize:11, fontWeight:700, letterSpacing:2.2, textTransform:'uppercase', color:'rgba(255,255,255,.35)', marginBottom:8 }}>AUSI · 2026 / 27</div>
          <h1 style={{ fontFamily:'var(--serif)', fontSize:'clamp(22px,3vw,30px)', fontWeight:700, color:'#fff', margin:'0 0 6px' }}>
            President's Office
          </h1>
          <p style={{ fontSize:13.5, color:'rgba(255,255,255,.4)', margin:0 }}>
            Chapter President · Full platform access
          </p>
        </div>
      </div>

      <div className="container" style={{ paddingTop:32, paddingBottom:64 }}>

        {error && <div style={{ background:'rgba(220,38,38,.08)', border:'1px solid rgba(220,38,38,.2)', borderRadius:10, padding:'12px 16px', fontSize:13, color:'var(--red)', marginBottom:24 }}>{error}</div>}

        {/* Stats */}
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(140px,1fr))', gap:12, marginBottom:32 }}>
          <StatCard label="Total Members"        value={stats.total_members}          accent="var(--ink)" />
          <StatCard label="Pending Verifications" value={stats.pending_verifications}  accent="#d97706" />
          <StatCard label="Universities"          value={stats.total_universities}     accent="#2563eb" />
          <StatCard label="Active Events"         value={stats.total_events}           accent="#7c3aed" />
          <StatCard label="Applications"          value={stats.total_applications}     accent="#059669" />
          <StatCard label="Pending Applications"  value={stats.pending_applications}   accent="#dc2626" />
        </div>

        {/* Tabs */}
        <div style={{ background:'var(--white)', border:'1px solid var(--g100)', borderRadius:14, overflow:'hidden' }}>
          <div style={{ display:'flex', gap:6, padding:'12px 16px', borderBottom:'1px solid var(--g100)', background:'var(--off)', overflowX:'auto', WebkitOverflowScrolling:'touch' }}>
            {TABS.map(t => <button key={t} style={tab_style(t)} onClick={() => setTab(t)}>{t}</button>)}
          </div>

          <div style={{ padding:'24px' }}>

            {/* ── OVERVIEW TAB ── */}
            {tab === 'Overview' && (
              <div>
                <h3 style={{ fontFamily:'var(--serif)', fontSize:18, fontWeight:700, color:'var(--ink)', marginBottom:20, marginTop:0 }}>Members by Role</h3>
                <div style={{ display:'flex', flexDirection:'column', gap:10, maxWidth:500 }}>
                  {byRole.map(row => {
                    const pct = stats.total_members ? Math.round((row.count / stats.total_members) * 100) : 0
                    return (
                      <div key={row.role}>
                        <div style={{ display:'flex', justifyContent:'space-between', marginBottom:5 }}>
                          <span style={{ fontSize:13, fontWeight:700, color:'var(--ink)' }}>{ROLE_LABELS[row.role] || row.role}</span>
                          <span style={{ fontSize:13, color:'var(--g500)' }}>{row.count} ({pct}%)</span>
                        </div>
                        <div style={{ height:8, background:'var(--g100)', borderRadius:4, overflow:'hidden' }}>
                          <div style={{ height:'100%', width:`${pct}%`, background: ROLE_COLORS[row.role] || 'var(--ink)', borderRadius:4, transition:'width .4s' }} />
                        </div>
                      </div>
                    )
                  })}
                </div>
                <div style={{ marginTop:32 }}>
                  <h3 style={{ fontFamily:'var(--serif)', fontSize:18, fontWeight:700, color:'var(--ink)', marginBottom:16, marginTop:0 }}>Recent Applications</h3>
                  {apps.slice(0,5).map(a => {
                    const sc = STATUS_COLORS[a.status] || STATUS_COLORS.pending
                    return (
                      <div key={a.id} style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'12px 0', borderBottom:'1px solid var(--g100)', gap:16, flexWrap:'wrap' }}>
                        <div>
                          <div style={{ fontWeight:700, color:'var(--ink)', fontSize:14 }}>{a.full_name}</div>
                          <div style={{ fontSize:12, color:'var(--g500)', marginTop:2 }}>{a.course} · {a.level}</div>
                        </div>
                        <Badge label={a.status} bg={sc.bg} text={sc.text} border={sc.border} />
                      </div>
                    )
                  })}
                  {!apps.length && <div style={{ fontSize:13, color:'var(--g400)' }}>No applications yet.</div>}
                </div>
              </div>
            )}

            {/* ── MEMBERS TAB ── */}
            {tab === 'Members' && (
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
                        <TH>Name</TH><TH>Email</TH><TH>University</TH><TH>Role</TH><TH>Verified</TH><TH>Joined</TH><TH>Actions</TH>
                      </tr>
                    </thead>
                    <tbody>
                      {members.map(m => (
                        <tr key={m.id} style={{ borderBottom:'1px solid var(--g100)' }}>
                          <TD style={{ fontWeight:600, color:'var(--ink)', whiteSpace:'nowrap' }}>{m.full_name}</TD>
                          <TD style={{ color:'var(--g600)' }}>{m.email}</TD>
                          <TD style={{ color:'var(--g600)', whiteSpace:'nowrap' }}>{m.university_name || '—'}</TD>
                          <TD>
                            <select
                              value={m.role} disabled={busy[m.id]}
                              onChange={e => setRole(m.id, e.target.value)}
                              style={{ fontSize:12, padding:'4px 8px', border:'1px solid var(--g200)', borderRadius:6, background:'var(--white)', cursor:'pointer', color: ROLE_COLORS[m.role] || 'var(--ink)', fontWeight:700 }}>
                              {['student','alumni','university_rep','exec','chapter_president','patron','admin'].map(r => (
                                <option key={r} value={r}>{ROLE_LABELS[r]}</option>
                              ))}
                            </select>
                          </TD>
                          <TD>
                            <Badge
                              label={m.is_verified ? 'Verified' : 'Pending'}
                              bg={m.is_verified ? 'rgba(34,197,94,.1)' : 'rgba(234,179,8,.1)'}
                              text={m.is_verified ? '#15803d' : '#92400e'}
                              border={m.is_verified ? 'rgba(34,197,94,.3)' : 'rgba(234,179,8,.3)'}
                            />
                          </TD>
                          <TD style={{ color:'var(--g500)', whiteSpace:'nowrap' }}>
                            {new Date(m.joined_at).toLocaleDateString()}
                          </TD>
                          <TD>
                            <button
                              onClick={() => toggleVerify(m.id)} disabled={busy[m.id]}
                              style={{ fontSize:11.5, fontWeight:700, padding:'5px 12px', border:'1px solid var(--g200)', borderRadius:7, cursor:'pointer', background:'var(--off)', color:'var(--ink)', whiteSpace:'nowrap' }}>
                              {m.is_verified ? 'Unverify' : 'Verify'}
                            </button>
                          </TD>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {!members.length && <div style={{ padding:'32px 0', textAlign:'center', fontSize:13, color:'var(--g400)' }}>No members found.</div>}
                </div>
              </>
            )}

            {/* ── LEADERSHIP TAB ── */}
            {tab === 'Leadership' && (
              <div>
                {leadership.length ? (
                  <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(260px,1fr))', gap:16 }}>
                    {leadership.map(l => (
                      <div key={l.id} style={{ background:'var(--off)', border:'1px solid var(--g100)', borderRadius:12, padding:'18px 20px' }}>
                        <div style={{ display:'flex', gap:12, alignItems:'center', marginBottom:12 }}>
                          <div style={{ width:40, height:40, borderRadius:'50%', background:'var(--ink)', display:'flex', alignItems:'center', justifyContent:'center', fontFamily:'var(--serif)', fontWeight:800, fontSize:16, color:'var(--white)', flexShrink:0, overflow:'hidden' }}>
                            {l.avatar_url
                              ? <img src={l.avatar_url} alt="" style={{ width:'100%', height:'100%', objectFit:'cover' }} />
                              : l.full_name?.charAt(0)}
                          </div>
                          <div>
                            <div style={{ fontWeight:700, fontSize:14, color:'var(--ink)' }}>{l.full_name}</div>
                            <div style={{ fontSize:12, color:'var(--g500)', marginTop:2 }}>{l.university_name || 'AUSI'}</div>
                          </div>
                        </div>
                        <div style={{ fontSize:13, fontWeight:700, color:'var(--ink)', marginBottom:4 }}>{l.position}</div>
                        <div style={{ fontSize:11.5, color:'var(--g400)', marginBottom:8, textTransform:'capitalize' }}>
                          Scope: {l.scope.replace('chapter:', '')}
                        </div>
                        {(l.email || l.phone) && (
                          <div style={{ fontSize:12, color:'var(--g600)', borderTop:'1px solid var(--g100)', paddingTop:10, marginTop:4 }}>
                            {l.email && <div>{l.email}</div>}
                            {l.phone && <div>{l.phone}</div>}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div style={{ padding:'32px 0', textAlign:'center', fontSize:13, color:'var(--g400)' }}>No leadership data in database yet.</div>
                )}
              </div>
            )}

            {/* ── APPLICATIONS TAB ── */}
            {tab === 'Applications' && (
              <div className="tscroll" style={{ overflowX:'auto' }}>
                <table style={{ width:'100%', borderCollapse:'collapse', fontSize:13 }}>
                  <thead>
                    <tr style={{ borderBottom:'2px solid var(--g100)' }}>
                      <TH>Applicant</TH><TH>Email</TH><TH>Course</TH><TH>Level</TH><TH>Universities</TH><TH>Date</TH><TH>Status</TH><TH>Update</TH><TH>Notes</TH>
                    </tr>
                  </thead>
                  <tbody>
                    {apps.map(a => {
                      const sc = STATUS_COLORS[a.status] || STATUS_COLORS.pending
                      return (
                        <tr key={a.id} style={{ borderBottom:'1px solid var(--g100)' }}>
                          <TD style={{ fontWeight:600, color:'var(--ink)', whiteSpace:'nowrap' }}>{a.full_name}</TD>
                          <TD style={{ color:'var(--g600)' }}>{a.email}</TD>
                          <TD style={{ color:'var(--g600)' }}>{a.course}</TD>
                          <TD style={{ color:'var(--g600)', whiteSpace:'nowrap' }}>{a.level}</TD>
                          <TD style={{ color:'var(--g600)', maxWidth:140, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
                            {a.universities?.join(', ') || '—'}
                          </TD>
                          <TD style={{ color:'var(--g500)', whiteSpace:'nowrap' }}>
                            {new Date(a.created_at).toLocaleDateString()}
                          </TD>
                          <TD>
                            <Badge label={a.status} bg={sc.bg} text={sc.text} border={sc.border} />
                          </TD>
                          <TD>
                            <select
                              value={a.status} disabled={busy[a.id]}
                              onChange={e => setAppStatus(a.id, e.target.value)}
                              style={{ fontSize:12, padding:'4px 8px', border:'1px solid var(--g200)', borderRadius:6, background:'var(--white)', cursor:'pointer' }}>
                              {['pending','reviewed','accepted','rejected'].map(s => (
                                <option key={s} value={s}>{s.charAt(0).toUpperCase()+s.slice(1)}</option>
                              ))}
                            </select>
                          </TD>
                          <TD>
                            <input
                              placeholder="Add note…"
                              value={notes[a.id] || a.notes || ''}
                              onChange={e => setNotes(n => ({ ...n, [a.id]: e.target.value }))}
                              style={{ fontSize:12, padding:'4px 8px', border:'1px solid var(--g200)', borderRadius:6, width:120 }}
                            />
                          </TD>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
                {!apps.length && <div style={{ padding:'32px 0', textAlign:'center', fontSize:13, color:'var(--g400)' }}>No applications yet.</div>}
              </div>
            )}

          </div>
        </div>
      </div>
    </div>
  )
}
