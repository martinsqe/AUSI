import { useEffect, useState } from 'react'
import { useAuth } from '../../context/AuthContext'
import { ROLE_LABELS, ROLE_COLORS } from '../../lib/roles'
import api from '../../lib/api'

const STATUS_COLORS = {
  pending:  { bg:'rgba(234,179,8,.1)',  text:'#92400e', border:'rgba(234,179,8,.3)' },
  reviewed: { bg:'rgba(59,130,246,.1)', text:'#1d4ed8', border:'rgba(59,130,246,.3)' },
  accepted: { bg:'rgba(34,197,94,.1)',  text:'#15803d', border:'rgba(34,197,94,.3)' },
  rejected: { bg:'rgba(239,68,68,.1)',  text:'#b91c1c', border:'rgba(239,68,68,.3)' },
}

function Badge({ label, bg, text, border }) {
  return (
    <span style={{ fontSize:11, fontWeight:700, letterSpacing:.8, textTransform:'uppercase',
      padding:'2px 9px', borderRadius:4, background:bg, color:text }}>
      {label}
    </span>
  )
}

function StatCard({ label, value, accent }) {
  return (
    <div style={{ background:'var(--white)', border:'1px solid var(--g100)', borderRadius:14, padding:'20px 24px' }}>
      <div style={{ fontSize:11, fontWeight:700, letterSpacing:1.6, textTransform:'uppercase', color:'var(--g400)', marginBottom:8 }}>{label}</div>
      <div style={{ fontSize:30, fontWeight:800, color:'var(--ink)', fontFamily:'var(--serif)', lineHeight:1 }}>{value ?? '—'}</div>
    </div>
  )
}

const TABS = ['Members', 'Events']

export default function RepDashboard() {
  const { user } = useAuth()
  const [data, setData]     = useState(null)
  const [tab, setTab]       = useState('Members')
  const [error, setError]   = useState('')
  const [search, setSearch] = useState('')

  useEffect(() => {
    api.get('/dashboard/rep')
      .then(r => setData(r.data))
      .catch(err => setError(err.response?.data?.error || 'Could not load dashboard data.'))
  }, [])

  const uni     = data?.university || {}
  const members = (data?.members || []).filter(m =>
    !search ||
    m.full_name?.toLowerCase().includes(search.toLowerCase()) ||
    m.email?.toLowerCase().includes(search.toLowerCase()) ||
    m.field_of_study?.toLowerCase().includes(search.toLowerCase())
  )
  const apps   = data?.applications || []
  const events = data?.events || []

  const tab_style = (t) => ({
    padding:'9px 18px', fontSize:13.5, fontWeight:700, cursor:'pointer', border:'none',
    background: tab === t ? '#0891b2' : 'transparent',
    color:      tab === t ? '#fff' : 'var(--g500)',
    borderRadius:8, transition:'all .15s',
  })

  const TH = ({ children }) => (
    <th style={{ textAlign:'left', padding:'10px 12px', fontSize:11, fontWeight:700,
      letterSpacing:1, textTransform:'uppercase', color:'var(--g400)', whiteSpace:'nowrap' }}>
      {children}
    </th>
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
            University Representative
          </h1>
          <p style={{ fontSize:13.5, color:'rgba(255,255,255,.4)', margin:0 }}>
            {uni.name ? `${uni.name} · ${uni.city}, ${uni.state}` : 'Loading university…'}
          </p>
        </div>
      </div>

      <div className="container" style={{ paddingTop:32, paddingBottom:64 }}>

        {error && (
          <div style={{ background:'rgba(220,38,38,.08)', border:'1px solid rgba(220,38,38,.2)',
            borderRadius:10, padding:'12px 16px', fontSize:13, color:'var(--red)', marginBottom:24 }}>
            {error}
          </div>
        )}

        {/* Stats */}
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(140px,1fr))', gap:12, marginBottom:32 }}>
          <StatCard label="Students at University" value={data?.members?.length ?? '—'}      accent="#0891b2" />
          <StatCard label="Verified Members"        value={data?.members?.filter(m => m.is_verified).length ?? '—'} accent="#059669" />
          <StatCard label="Pending Verification"    value={data?.members?.filter(m => !m.is_verified).length ?? '—'} accent="#d97706" />
          <StatCard label="Interested Applicants"   value={apps.length}                       accent="#7c3aed" />
          <StatCard label="University Events"       value={events.length}                     accent="#dc2626" />
        </div>

        {/* Tabs */}
        <div style={{ background:'var(--white)', border:'1px solid var(--g100)', borderRadius:14, overflow:'hidden' }}>
          <div style={{ display:'flex', gap:6, padding:'12px 16px', borderBottom:'1px solid var(--g100)', background:'var(--off)', overflowX:'auto', WebkitOverflowScrolling:'touch' }}>
            {TABS.map(t => <button key={t} style={tab_style(t)} onClick={() => setTab(t)}>{t}</button>)}
          </div>

          <div style={{ padding:'24px' }}>

            {/* ── MEMBERS TAB ── */}
            {tab === 'Members' && (
              <>
                <div style={{ marginBottom:16 }}>
                  <input
                    placeholder="Search by name, email or course…"
                    value={search} onChange={e => setSearch(e.target.value)}
                    style={{ width:'100%', maxWidth:360, padding:'9px 13px', fontSize:13.5,
                      border:'1.5px solid var(--g200)', borderRadius:8, outline:'none', boxSizing:'border-box' }}
                  />
                </div>
                <div className="tscroll" style={{ overflowX:'auto' }}>
                  <table style={{ width:'100%', borderCollapse:'collapse', fontSize:13 }}>
                    <thead>
                      <tr style={{ borderBottom:'2px solid var(--g100)' }}>
                        <TH>Name</TH>
                        <TH>Email</TH>
                        <TH>Course</TH>
                        <TH>Arrived</TH>
                        <TH>Role</TH>
                        <TH>Status</TH>
                      </tr>
                    </thead>
                    <tbody>
                      {members.map(m => (
                        <tr key={m.id} style={{ borderBottom:'1px solid var(--g100)' }}>
                          <TD style={{ fontWeight:600, color:'var(--ink)', whiteSpace:'nowrap' }}>{m.full_name}</TD>
                          <TD style={{ color:'var(--g600)' }}>{m.email}</TD>
                          <TD style={{ color:'var(--g600)', maxWidth:180, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
                            {m.field_of_study || '—'}
                          </TD>
                          <TD style={{ color:'var(--g500)', whiteSpace:'nowrap' }}>
                            {m.arrival_date ? new Date(m.arrival_date).toLocaleDateString() : '—'}
                          </TD>
                          <TD>
                            <span style={{ fontSize:11, fontWeight:700, letterSpacing:.6, textTransform:'uppercase',
                              padding:'2px 8px', borderRadius:4, background:'rgba(8,145,178,.08)',
                              color: ROLE_COLORS[m.role] || 'var(--g600)' }}>
                              {ROLE_LABELS[m.role] || m.role}
                            </span>
                          </TD>
                          <TD>
                            <Badge
                              label={m.is_verified ? 'Verified' : 'Pending'}
                              bg={m.is_verified ? 'rgba(34,197,94,.1)' : 'rgba(234,179,8,.1)'}
                              text={m.is_verified ? '#15803d' : '#92400e'}
                              border={m.is_verified ? 'rgba(34,197,94,.3)' : 'rgba(234,179,8,.3)'}
                            />
                          </TD>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {!members.length && (
                    <div style={{ padding:'32px 0', textAlign:'center', fontSize:13, color:'var(--g400)' }}>
                      No members found at your university yet.
                    </div>
                  )}
                </div>
              </>
            )}

            {/* ── EVENTS TAB ── */}
            {tab === 'Events' && (
              <>
                {events.length ? (
                  <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(260px,1fr))', gap:16 }}>
                    {events.map(e => {
                      const d = new Date(e.event_date)
                      return (
                        <div key={e.id} style={{ background:'var(--off)', border:'1px solid var(--g100)', borderRadius:12, overflow:'hidden' }}>
                          {e.image_url && (
                            <img src={e.image_url} alt="" style={{ width:'100%', height:120, objectFit:'cover', display:'block' }} />
                          )}
                          <div style={{ padding:'14px 16px' }}>
                            <div style={{ display:'flex', gap:10, alignItems:'flex-start' }}>
                              <div style={{ textAlign:'center', background:'#0891b2', color:'#fff',
                                borderRadius:8, padding:'5px 9px', flexShrink:0, minWidth:38 }}>
                                <div style={{ fontSize:9.5, fontWeight:700, letterSpacing:1 }}>
                                  {d.toLocaleString('default',{month:'short'}).toUpperCase()}
                                </div>
                                <div style={{ fontSize:18, fontWeight:800, lineHeight:1.1 }}>{d.getDate()}</div>
                              </div>
                              <div>
                                <div style={{ fontSize:14, fontWeight:700, color:'var(--ink)', lineHeight:1.3 }}>{e.title}</div>
                                {e.location_city && (
                                  <div style={{ fontSize:12, color:'var(--g500)', marginTop:2 }}>{e.location_city}</div>
                                )}
                                <div style={{ display:'flex', gap:6, marginTop:6, flexWrap:'wrap' }}>
                                  <span style={{ fontSize:11, padding:'2px 8px', background:'var(--white)',
                                    borderRadius:4, color:'var(--g600)', fontWeight:600, textTransform:'capitalize' }}>
                                    {e.type}
                                  </span>
                                  <span style={{ fontSize:11, padding:'2px 8px', background:'var(--white)',
                                    borderRadius:4, color:'var(--g600)', fontWeight:600 }}>
                                    {e.cost_inr === 0 ? 'Free' : `₹${e.cost_inr}`}
                                  </span>
                                  {!e.is_published && (
                                    <span style={{ fontSize:11, padding:'2px 8px', borderRadius:4,
                                      background:'rgba(220,38,38,.08)', color:'var(--red)', fontWeight:700 }}>
                                      Draft
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                ) : (
                  <div style={{ padding:'32px 0', textAlign:'center', fontSize:13, color:'var(--g400)' }}>
                    No events recorded for {uni.name || 'your university'} yet.
                  </div>
                )}
              </>
            )}

          </div>
        </div>
      </div>
    </div>
  )
}
