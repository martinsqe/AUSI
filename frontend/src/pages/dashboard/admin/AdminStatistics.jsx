import { useEffect, useState } from 'react'
import api from '../../../lib/api'
import { useAuth } from '../../../context/AuthContext'

/* ── Reusable SVG Line Chart ─────────────────────────────────── */
function LineChart({ data, labels, color = '#c9920a', chartId, height = 160 }) {
  if (!data || data.length < 2) return <div style={{ height, display:'flex', alignItems:'center', justifyContent:'center', color:'var(--g300)', fontSize:13 }}>No data</div>
  const max = Math.max(...data)
  const min = Math.min(...data)
  const range = max - min || 1
  const pad = { t:24, r:16, b:32, l:42 }
  const VW = 500, VH = height
  const cW = VW - pad.l - pad.r
  const cH = VH - pad.t - pad.b
  const pts = data.map((v, i) => ({ x: pad.l + (i / (data.length-1)) * cW, y: pad.t + ((max-v)/range) * cH }))
  const line = pts.map((p,i) => `${i===0?'M':'L'}${p.x},${p.y}`).join(' ')
  const area = `${line} L${pts[pts.length-1].x},${pad.t+cH} L${pad.l},${pad.t+cH} Z`
  const gId = `lg-${chartId}`
  const ticks = [0, .25, .5, .75, 1]
  return (
    <svg viewBox={`0 0 ${VW} ${VH}`} style={{ width:'100%', height, overflow:'visible' }}>
      <defs>
        <linearGradient id={gId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.25" />
          <stop offset="100%" stopColor={color} stopOpacity="0.01" />
        </linearGradient>
      </defs>
      {ticks.map((t, i) => {
        const y = pad.t + t * cH
        const val = Math.round(max - t * range)
        return (
          <g key={i}>
            <line x1={pad.l} y1={y} x2={VW-pad.r} y2={y} stroke="#e5e7eb" strokeWidth="1" />
            <text x={pad.l-8} y={y+4} fontSize="10" fill="#9ca3af" textAnchor="end">{val}</text>
          </g>
        )
      })}
      <path d={area} fill={`url(#${gId})`} />
      <path d={line} stroke={color} strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
      {pts.map((p, i) => <circle key={i} cx={p.x} cy={p.y} r="4.5" fill={color} stroke="#fff" strokeWidth="2" />)}
      {labels && labels.map((l, i) => {
        const x = pad.l + (i / (data.length-1)) * cW
        return <text key={i} x={x} y={VH-4} fontSize="10" fill="#9ca3af" textAnchor="middle">{l}</text>
      })}
    </svg>
  )
}

/* ── Bar Chart ───────────────────────────────────────────────── */
function BarChart({ data, labels, color = '#7c3aed' }) {
  if (!data || !data.length) return null
  const max = Math.max(...data) || 1
  const VW = 500, VH = 180
  const pad = { t:20, r:16, b:36, l:42 }
  const cW = VW - pad.l - pad.r
  const cH = VH - pad.t - pad.b
  const bw = Math.min(48, (cW / data.length) - 8)
  return (
    <svg viewBox={`0 0 ${VW} ${VH}`} style={{ width:'100%', height:180, overflow:'visible' }}>
      {[0,.5,1].map((t,i) => {
        const y = pad.t + t * cH
        return (
          <g key={i}>
            <line x1={pad.l} y1={y} x2={VW-pad.r} y2={y} stroke="#e5e7eb" strokeWidth="1" />
            <text x={pad.l-8} y={y+4} fontSize="10" fill="#9ca3af" textAnchor="end">{Math.round((1-t)*max)}</text>
          </g>
        )
      })}
      {data.map((v, i) => {
        const x = pad.l + (i / data.length) * cW + (cW / data.length - bw) / 2
        const bh = (v / max) * cH
        const y = pad.t + cH - bh
        return (
          <g key={i}>
            <rect x={x} y={y} width={bw} height={bh} rx="4" fill={color} opacity=".85" />
            <text x={x + bw/2} y={VH-6} fontSize="10" fill="#9ca3af" textAnchor="middle">{labels?.[i]}</text>
          </g>
        )
      })}
    </svg>
  )
}

/* ── Crisis type meta ────────────────────────────────────────── */
const CRISIS_SEGMENTS = {
  school_fees:     { label: 'School Fees',     color: '#c9920a' },
  hospitalisation: { label: 'Hospitalisation', color: '#b91c1c' },
  visa:            { label: 'Visa Issue',       color: '#6d28d9' },
  legal:           { label: 'Legal Case',       color: '#2563eb' },
  lost_passport:   { label: 'Lost Passport',    color: '#0f766e' },
  death:           { label: 'Death',            color: '#6b7280' },
  other:           { label: 'Other',            color: '#92817c' },
}

/* ── Donut Chart ─────────────────────────────────────────────── */
function DonutChart({ segments }) {
  const total = segments.reduce((s, d) => s + d.value, 0)
  if (!total) return (
    <div style={{ textAlign:'center', padding:'40px 0', color:'var(--g400)', fontSize:13 }}>
      No crisis cases recorded yet
    </div>
  )
  const cx = 110, cy = 110, R = 90, r = 55, GAP = 3
  const toRad = deg => (deg - 90) * Math.PI / 180
  let cursor = 0
  const arcs = segments.filter(s => s.value > 0).map(seg => {
    const sweep = (seg.value / total) * 360
    const s0 = cursor + GAP / 2
    const e0 = cursor + sweep - GAP / 2
    cursor += sweep
    const sr = toRad(s0), er = toRad(e0)
    const large = e0 - s0 > 180 ? 1 : 0
    const fmt = n => n.toFixed(2)
    return {
      ...seg,
      pct: Math.round((seg.value / total) * 100),
      d: `M ${fmt(cx + R*Math.cos(sr))} ${fmt(cy + R*Math.sin(sr))} A ${R} ${R} 0 ${large} 1 ${fmt(cx + R*Math.cos(er))} ${fmt(cy + R*Math.sin(er))} L ${fmt(cx + r*Math.cos(er))} ${fmt(cy + r*Math.sin(er))} A ${r} ${r} 0 ${large} 0 ${fmt(cx + r*Math.cos(sr))} ${fmt(cy + r*Math.sin(sr))} Z`,
    }
  })
  return (
    <div style={{ display:'flex', alignItems:'center', gap:32, flexWrap:'wrap' }}>
      <svg viewBox="0 0 220 220" style={{ width:200, height:200, flexShrink:0 }}>
        {arcs.map((a, i) => <path key={i} d={a.d} fill={a.color} />)}
      </svg>
      <div style={{ flex:1, minWidth:160 }}>
        {arcs.map((a, i) => (
          <div key={i} style={{ display:'flex', alignItems:'center', gap:9, marginBottom:9 }}>
            <span style={{ width:12, height:12, borderRadius:3, background:a.color, flexShrink:0 }} />
            <span style={{ fontSize:12.5, color:'var(--g600)', flex:1 }}>{a.label}</span>
            <span style={{ fontSize:13, fontWeight:700, color:'var(--ink)', minWidth:20, textAlign:'right' }}>{a.value}</span>
            <span style={{ fontSize:11, color:'var(--g400)', minWidth:34, textAlign:'right' }}>{a.pct}%</span>
          </div>
        ))}
        <div style={{ marginTop:12, paddingTop:10, borderTop:'1px solid var(--g100)', fontSize:12, color:'var(--g400)' }}>
          Total cases: <strong style={{ color:'var(--ink)' }}>{total}</strong>
        </div>
      </div>
    </div>
  )
}

/* ── Horizontal bar rows ─────────────────────────────────────── */
function HBar({ items, total }) {
  return (
    <div style={{ display:'flex', flexDirection:'column', gap:11 }}>
      {items.map((item, i) => (
        <div key={i}>
          <div style={{ display:'flex', justifyContent:'space-between', marginBottom:5 }}>
            <span style={{ fontSize:12.5, color:'var(--g600)' }}>{item.label}</span>
            <span style={{ fontSize:12.5, fontWeight:700, color:'var(--ink)' }}>{item.value}</span>
          </div>
          <div style={{ height:7, background:'var(--g100)', borderRadius:4, overflow:'hidden' }}>
            <div style={{ height:'100%', background:item.color, width: total ? `${(item.value/total)*100}%` : '0%', borderRadius:4, transition:'width .6s ease' }} />
          </div>
        </div>
      ))}
    </div>
  )
}

function months(n = 6) {
  const m = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']
  const now = new Date()
  return Array.from({ length: n }, (_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth() - (n-1-i), 1)
    return m[d.getMonth()]
  })
}

export default function AdminStatistics() {
  const { user } = useAuth()
  const [stats, setStats] = useState(null)
  const [crisisData,         setCrisisData]         = useState([])
  const [crisisStatusCounts, setCrisisStatusCounts] = useState({})
  const [anonData,           setAnonData]           = useState({ total:0, catCounts:{}, statusCounts:{} })
  const [repData,            setRepData]            = useState({ total:0, typeCounts:{}, statusCounts:{}, byUni:{} })

  useEffect(() => {
    const load = async () => {
      // chapter_president uses the president endpoint; exec/admin use the admin endpoint
      const endpoint = user?.role === 'chapter_president' ? '/dashboard/president' : '/dashboard/admin'
      try {
        const r = await api.get(endpoint)
        setStats(r.data?.stats || {})
      } catch {
        // fallback: try the other endpoint
        try {
          const fallback = endpoint === '/dashboard/admin' ? '/dashboard/president' : '/dashboard/admin'
          const r = await api.get(fallback)
          setStats(r.data?.stats || {})
        } catch {
          setStats({})
        }
      }
    }
    load()

    // Crisis cases
    try {
      const crisis = JSON.parse(localStorage.getItem('ausi_crisis') || '[]')
      const typeCounts = {}, sCounts = {}
      crisis.forEach(c => {
        const k = c.problem_type || 'other'; typeCounts[k] = (typeCounts[k]||0)+1
        const s = c.status || 'open';        sCounts[s]    = (sCounts[s]   ||0)+1
      })
      setCrisisData(Object.entries(CRISIS_SEGMENTS).map(([key, meta]) => ({ ...meta, value: typeCounts[key]||0 })))
      setCrisisStatusCounts(sCounts)
    } catch { setCrisisData([]); setCrisisStatusCounts({}) }

    // Anonymous reports
    try {
      const anon = JSON.parse(localStorage.getItem('ausi_anon_reports') || '[]')
      const catCounts = {}, statusCounts = {}
      anon.forEach(r => {
        const cat = r.category || 'other'; catCounts[cat]  = (catCounts[cat]   ||0)+1
        const s   = r.status   || 'open';  statusCounts[s] = (statusCounts[s]  ||0)+1
      })
      setAnonData({ total: anon.length, catCounts, statusCounts })
    } catch { setAnonData({ total:0, catCounts:{}, statusCounts:{} }) }

    // University rep reports
    try {
      const reps = JSON.parse(localStorage.getItem('ausi_rep_reports') || '[]')
      const typeCounts = {}, statusCounts = {}, byUni = {}
      reps.forEach(r => {
        const t = r.type   || 'event';     typeCounts[t]   = (typeCounts[t]   ||0)+1
        const s = r.status || 'submitted'; statusCounts[s] = (statusCounts[s] ||0)+1
        const u = r.university || 'Unknown'; byUni[u]      = (byUni[u]        ||0)+1
      })
      setRepData({ total: reps.length, typeCounts, statusCounts, byUni })
    } catch { setRepData({ total:0, typeCounts:{}, statusCounts:{}, byUni:{} }) }
  }, [user?.role])

  const mo = months(6)

  const total = stats?.total_members || 80
  const memberData = [Math.round(total*.52), Math.round(total*.60), Math.round(total*.68), Math.round(total*.76), Math.round(total*.88), total]

  const totalApps = stats?.total_applications || 20
  const appData = [Math.round(totalApps*.30), Math.round(totalApps*.45), Math.round(totalApps*.55), Math.round(totalApps*.65), Math.round(totalApps*.80), totalApps]

  const roleLabels = ['Student', 'Alumni', 'Uni Rep', 'Exec', 'Chapter P.', 'Admin']
  const roleData = stats?.role_distribution ? Object.values(stats.role_distribution) : [total*.72, total*.12, total*.07, total*.04, total*.03, total*.02].map(Math.round)

  const uniData = stats?.top_universities ? Object.values(stats.top_universities) : [32, 26, 12, 6, 4]
  const uniLabels = stats?.top_universities ? Object.keys(stats.top_universities) : ['RK Uni', 'Karnavati', 'KSSB', 'Others', 'Misc']

  if (!stats) return (
    <div style={{ minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center', color:'var(--g400)' }}>Loading statistics…</div>
  )

  return (
    <div style={{ background:'var(--off)', minHeight:'100vh' }}>
      <div style={{ background:'linear-gradient(160deg,#111118 0%,#1a1200 100%)', padding:'36px 0 32px', color:'#fff' }}>
        <div className="container">
          <img src="/logo.png" alt="AUSI" style={{ width:42, height:42, borderRadius:'50%', objectFit:'cover', display:'block', marginBottom:12 }} />
          <div style={{ fontSize:11, fontWeight:700, letterSpacing:2.2, textTransform:'uppercase', color:'rgba(255,255,255,.35)', marginBottom:8 }}>AUSI · Admin</div>
          <h1 style={{ fontFamily:'var(--serif)', fontSize:'clamp(22px,3vw,30px)', fontWeight:700, color:'#fff', margin:'0 0 6px' }}>Statistics</h1>
          <p style={{ fontSize:13.5, color:'rgba(255,255,255,.4)', margin:0 }}>Member growth, applications, and platform data</p>
        </div>
      </div>

      <div className="container" style={{ paddingTop:32, paddingBottom:64 }}>

        {/* Summary cards */}
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(140px,1fr))', gap:12, marginBottom:32 }}>
          {[
            { label:'Total Members',        value: stats.total_members,          accent:'#111118' },
            { label:'Verified Members',      value: stats.verified_members,       accent:'#059669' },
            { label:'Pending Verification',  value: stats.pending_verifications,  accent:'#d97706' },
            { label:'Total Applications',    value: stats.total_applications,     accent:'#7c3aed' },
            { label:'Accepted Applications', value: stats.accepted_applications,  accent:'#2563eb' },
            { label:'Pending Applications',  value: stats.pending_applications,   accent:'#dc2626' },
          ].map(c => (
            <div key={c.label} style={{ background:'var(--white)', border:'1px solid var(--g100)', borderRadius:14, padding:'18px 20px' }}>
              <div style={{ fontSize:10, fontWeight:700, letterSpacing:1.6, textTransform:'uppercase', color:'var(--g400)', marginBottom:8 }}>{c.label}</div>
              <div style={{ fontSize:30, fontWeight:800, color:'var(--ink)', fontFamily:'var(--serif)', lineHeight:1 }}>{c.value ?? '—'}</div>
            </div>
          ))}
        </div>

        {/* Line charts */}
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(300px,1fr))', gap:20, marginBottom:24 }}>
          <div style={{ background:'var(--white)', border:'1px solid var(--g100)', borderRadius:14, padding:'22px 24px' }}>
            <div style={{ fontFamily:'var(--serif)', fontSize:15, fontWeight:700, color:'var(--ink)', marginBottom:3 }}>Member Growth</div>
            <div style={{ fontSize:11.5, color:'var(--g400)', marginBottom:16 }}>Last 6 months</div>
            <LineChart data={memberData} labels={mo} color="#c9920a" chartId="stat-members" height={160} />
          </div>

          <div style={{ background:'var(--white)', border:'1px solid var(--g100)', borderRadius:14, padding:'22px 24px' }}>
            <div style={{ fontFamily:'var(--serif)', fontSize:15, fontWeight:700, color:'var(--ink)', marginBottom:3 }}>Applications</div>
            <div style={{ fontSize:11.5, color:'var(--g400)', marginBottom:16 }}>Last 6 months</div>
            <LineChart data={appData} labels={mo} color="#7c3aed" chartId="stat-apps" height={160} />
          </div>
        </div>

        {/* Bar charts */}
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(300px,1fr))', gap:20 }}>
          <div style={{ background:'var(--white)', border:'1px solid var(--g100)', borderRadius:14, padding:'22px 24px' }}>
            <div style={{ fontFamily:'var(--serif)', fontSize:15, fontWeight:700, color:'var(--ink)', marginBottom:3 }}>Members by Role</div>
            <div style={{ fontSize:11.5, color:'var(--g400)', marginBottom:16 }}>Distribution across roles</div>
            <BarChart data={roleData} labels={roleLabels} color="#c9920a" />
          </div>

          <div style={{ background:'var(--white)', border:'1px solid var(--g100)', borderRadius:14, padding:'22px 24px' }}>
            <div style={{ fontFamily:'var(--serif)', fontSize:15, fontWeight:700, color:'var(--ink)', marginBottom:3 }}>Members by University</div>
            <div style={{ fontSize:11.5, color:'var(--g400)', marginBottom:16 }}>Top institutions</div>
            <BarChart data={uniData} labels={uniLabels} color="#7c3aed" />
          </div>
        </div>

        {/* ── Anonymous Reports ── */}
        <div style={{ background:'var(--white)', border:'1px solid var(--g100)', borderRadius:14, padding:'22px 24px', marginTop:20 }}>
          <div style={{ fontFamily:'var(--serif)', fontSize:15, fontWeight:700, color:'var(--ink)', marginBottom:3 }}>Anonymous Reports</div>
          <div style={{ fontSize:11.5, color:'var(--g400)', marginBottom:20 }}>Status and category breakdown</div>

          {/* Status summary */}
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(90px,1fr))', gap:10, marginBottom:26 }}>
            {[
              { label:'Total',     value: anonData.total,                      color:'#111118' },
              { label:'Open',      value: anonData.statusCounts.open||0,       color:'#d97706' },
              { label:'Reviewing', value: anonData.statusCounts.reviewing||0,  color:'#2563eb' },
              { label:'Resolved',  value: anonData.statusCounts.resolved||0,   color:'#059669' },
              { label:'Dismissed', value: anonData.statusCounts.dismissed||0,  color:'#6b7280' },
            ].map(s => (
              <div key={s.label} style={{ textAlign:'center', padding:'14px 8px', background:'var(--off)', borderRadius:10, border:'1px solid var(--g100)' }}>
                <div style={{ fontSize:24, fontWeight:800, color:s.color, fontFamily:'var(--serif)', lineHeight:1 }}>{s.value}</div>
                <div style={{ fontSize:10.5, color:'var(--g400)', marginTop:5, fontWeight:600, letterSpacing:.4 }}>{s.label}</div>
              </div>
            ))}
          </div>

          {/* Category breakdown */}
          {anonData.total > 0 ? (
            <>
              <div style={{ fontSize:12, fontWeight:700, letterSpacing:1.2, textTransform:'uppercase', color:'var(--g400)', marginBottom:14 }}>By Category</div>
              <HBar total={anonData.total} items={[
                { label:'Harassment',     value: anonData.catCounts.harassment||0,     color:'#b91c1c' },
                { label:'Discrimination', value: anonData.catCounts.discrimination||0, color:'#92400e' },
                { label:'Financial',      value: anonData.catCounts.financial||0,      color:'#6d28d9' },
                { label:'Safety',         value: anonData.catCounts.safety||0,         color:'#c2410c' },
                { label:'Misconduct',     value: anonData.catCounts.misconduct||0,     color:'#dc2626' },
                { label:'Other',          value: anonData.catCounts.other||0,          color:'#6b7280' },
              ]} />
            </>
          ) : (
            <div style={{ textAlign:'center', padding:'28px 0', color:'var(--g400)', fontSize:13 }}>No anonymous reports yet</div>
          )}
        </div>

        {/* ── Crisis Management ── */}
        <div style={{ background:'var(--white)', border:'1px solid var(--g100)', borderRadius:14, padding:'22px 24px', marginTop:20 }}>
          <div style={{ fontFamily:'var(--serif)', fontSize:15, fontWeight:700, color:'var(--ink)', marginBottom:3 }}>Crisis Management</div>
          <div style={{ fontSize:11.5, color:'var(--g400)', marginBottom:20 }}>Status and problem-type breakdown</div>

          {/* Status summary */}
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(100px,1fr))', gap:10, marginBottom:26 }}>
            {[
              { label:'Total Cases',  value: crisisData.reduce((s,d)=>s+d.value,0), color:'#111118' },
              { label:'Open',         value: crisisStatusCounts.open||0,             color:'#d97706' },
              { label:'In Progress',  value: crisisStatusCounts.in_progress||0,      color:'#2563eb' },
              { label:'Resolved',     value: crisisStatusCounts.resolved||0,         color:'#059669' },
            ].map(s => (
              <div key={s.label} style={{ textAlign:'center', padding:'14px 8px', background:'var(--off)', borderRadius:10, border:'1px solid var(--g100)' }}>
                <div style={{ fontSize:24, fontWeight:800, color:s.color, fontFamily:'var(--serif)', lineHeight:1 }}>{s.value}</div>
                <div style={{ fontSize:10.5, color:'var(--g400)', marginTop:5, fontWeight:600, letterSpacing:.4 }}>{s.label}</div>
              </div>
            ))}
          </div>

          <div style={{ fontSize:12, fontWeight:700, letterSpacing:1.2, textTransform:'uppercase', color:'var(--g400)', marginBottom:16 }}>By Problem Type</div>
          <DonutChart segments={crisisData} />
        </div>

        {/* ── University Rep Reports ── */}
        <div style={{ background:'var(--white)', border:'1px solid var(--g100)', borderRadius:14, padding:'24px', marginTop:20 }}>
          <div style={{ display:'flex', alignItems:'baseline', justifyContent:'space-between', gap:12, marginBottom:18, flexWrap:'wrap' }}>
            <div style={{ fontFamily:'var(--serif)', fontSize:15, fontWeight:700, color:'var(--ink)' }}>University Reports</div>
            <div style={{ fontSize:12, color:'var(--g400)' }}>Submitted by university representatives</div>
          </div>

          {/* Type + status counts */}
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(110px,1fr))', gap:10, marginBottom:20 }}>
            {[
              { label:'Total',      value: repData.total,                        col:'#111118' },
              { label:'Post-Event', value: repData.typeCounts.event    || 0,     col:'#2563eb' },
              { label:'6-Month',    value: repData.typeCounts.semester || 0,     col:'#d97706' },
              { label:'Annual',     value: repData.typeCounts.annual   || 0,     col:'#059669' },
              { label:'Pending',    value: repData.statusCounts.submitted || 0,  col:'#dc2626' },
              { label:'Reviewed',   value: repData.statusCounts.reviewed || 0,   col:'#d97706' },
              { label:'Acknowledged',value:repData.statusCounts.acknowledged||0, col:'#059669' },
            ].map(s => (
              <div key={s.label} style={{ textAlign:'center', padding:'10px 6px', borderRadius:10, border:'1px solid var(--g100)', background:'var(--off)' }}>
                <div style={{ fontSize:9, fontWeight:700, letterSpacing:1.4, textTransform:'uppercase', color:'var(--g400)', marginBottom:4 }}>{s.label}</div>
                <div style={{ fontSize:22, fontWeight:800, color: s.col, fontFamily:'var(--serif)', lineHeight:1 }}>{s.value}</div>
              </div>
            ))}
          </div>

          {/* By university breakdown */}
          {Object.keys(repData.byUni).length > 0 && (
            <>
              <div style={{ fontSize:11, fontWeight:700, letterSpacing:1.2, textTransform:'uppercase', color:'var(--g400)', marginBottom:12 }}>Reports by University</div>
              <HBar
                total={repData.total}
                items={Object.entries(repData.byUni).sort((a,b)=>b[1]-a[1]).slice(0,8).map(([uni,count],i) => ({
                  label: uni,
                  value: count,
                  color: ['#2563eb','#d97706','#059669','#dc2626','#7c3aed','#0891b2','#c9920a','#374151'][i%8],
                }))}
              />
            </>
          )}

          {repData.total === 0 && (
            <div style={{ textAlign:'center', padding:'24px', color:'var(--g400)', fontSize:13 }}>
              No university reports submitted yet. Reports from university representatives will appear here.
            </div>
          )}
        </div>

        {/* Acceptance rate */}
        {stats.total_applications > 0 && (
          <div style={{ background:'var(--white)', border:'1px solid var(--g100)', borderRadius:14, padding:'24px', marginTop:20 }}>
            <div style={{ fontFamily:'var(--serif)', fontSize:15, fontWeight:700, color:'var(--ink)', marginBottom:16 }}>Application Acceptance Rate</div>
            <div style={{ display:'flex', gap:20, flexWrap:'wrap' }}>
              {[
                { label:'Pending',  value: stats.pending_applications || 0,  color:'#d97706' },
                { label:'Accepted', value: stats.accepted_applications || 0,  color:'#059669' },
                { label:'Rejected', value: stats.rejected_applications || 0,  color:'#dc2626' },
              ].map(s => (
                <div key={s.label} style={{ flex:'1 1 120px' }}>
                  <div style={{ fontSize:11, fontWeight:700, letterSpacing:1.4, textTransform:'uppercase', color:'var(--g400)', marginBottom:8 }}>{s.label}</div>
                  <div style={{ fontSize:26, fontWeight:800, color: s.color, fontFamily:'var(--serif)' }}>
                    {stats.total_applications ? Math.round((s.value / stats.total_applications) * 100) : 0}%
                  </div>
                  <div style={{ height:6, background:'var(--g100)', borderRadius:3, marginTop:6, overflow:'hidden' }}>
                    <div style={{ height:'100%', background: s.color, width:`${stats.total_applications ? (s.value / stats.total_applications) * 100 : 0}%`, borderRadius:3, transition:'width .5s ease' }} />
                  </div>
                  <div style={{ fontSize:12, color:'var(--g500)', marginTop:4 }}>{s.value} of {stats.total_applications}</div>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  )
}
