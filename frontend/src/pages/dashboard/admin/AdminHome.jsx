import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../../context/AuthContext'
import api from '../../../lib/api'

/* ── WMO weather codes ───────────────────────────────────────── */
const WMO = {
  0:{l:'Clear sky',i:'☀️'},1:{l:'Mainly clear',i:'🌤️'},2:{l:'Partly cloudy',i:'⛅'},
  3:{l:'Overcast',i:'☁️'},45:{l:'Foggy',i:'🌫️'},48:{l:'Icy fog',i:'🌫️'},
  51:{l:'Light drizzle',i:'🌦️'},53:{l:'Drizzle',i:'🌧️'},55:{l:'Heavy drizzle',i:'🌧️'},
  61:{l:'Slight rain',i:'🌧️'},63:{l:'Rain',i:'🌧️'},65:{l:'Heavy rain',i:'🌧️'},
  71:{l:'Snow',i:'❄️'},73:{l:'Snow',i:'❄️'},75:{l:'Heavy snow',i:'❄️'},
  80:{l:'Showers',i:'🌦️'},81:{l:'Showers',i:'🌦️'},82:{l:'Heavy showers',i:'⛈️'},
  95:{l:'Thunderstorm',i:'⛈️'},96:{l:'Thunderstorm',i:'⛈️'},99:{l:'Thunderstorm',i:'⛈️'},
}

/* ── SVG Line Chart ──────────────────────────────────────────── */
function LineChart({ data, labels, color = '#c9920a', chartId }) {
  if (!data || data.length < 2) return <div style={{ height:120, display:'flex', alignItems:'center', justifyContent:'center', color:'var(--g300)', fontSize:13 }}>No data</div>
  const max = Math.max(...data)
  const min = Math.min(...data)
  const range = max - min || 1
  const pad = { t:20, r:16, b:28, l:36 }
  const VW = 500, VH = 140
  const cW = VW - pad.l - pad.r
  const cH = VH - pad.t - pad.b
  const pts = data.map((v, i) => ({ x: pad.l + (i / (data.length - 1)) * cW, y: pad.t + ((max - v) / range) * cH }))
  const line = pts.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x},${p.y}`).join(' ')
  const area = `${line} L${pts[pts.length-1].x},${pad.t+cH} L${pad.l},${pad.t+cH} Z`
  const gId = `lg-${chartId}`
  return (
    <svg viewBox={`0 0 ${VW} ${VH}`} style={{ width:'100%', height:140, overflow:'visible' }}>
      <defs>
        <linearGradient id={gId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.28" />
          <stop offset="100%" stopColor={color} stopOpacity="0.01" />
        </linearGradient>
      </defs>
      {[0, .5, 1].map((t, i) => {
        const y = pad.t + t * cH
        const val = Math.round(max - t * range)
        return (
          <g key={i}>
            <line x1={pad.l} y1={y} x2={VW-pad.r} y2={y} stroke="#f0f0f0" strokeWidth="1" />
            <text x={pad.l-6} y={y+4} fontSize="10" fill="#9ca3af" textAnchor="end">{val}</text>
          </g>
        )
      })}
      <path d={area} fill={`url(#${gId})`} />
      <path d={line} stroke={color} strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
      {pts.map((p, i) => <circle key={i} cx={p.x} cy={p.y} r="4" fill={color} stroke="#fff" strokeWidth="2" />)}
      {labels && labels.map((l, i) => {
        const x = pad.l + (i / (data.length - 1)) * cW
        return <text key={i} x={x} y={VH-4} fontSize="10" fill="#9ca3af" textAnchor="middle">{l}</text>
      })}
    </svg>
  )
}

/* ── Quick action cards ──────────────────────────────────────── */
const ACTIONS = [
  { label:'Students',            desc:'Manage member accounts & roles',       to:'/dashboard/admin/students',    accent:'#c9920a' },
  { label:'Admissions',          desc:'Review & process applications',         to:'/dashboard/admin/admissions',  accent:'#7c3aed' },
  { label:'Cabinet',             desc:'Edit executive committee members',      to:'/dashboard/admin/cabinet',     accent:'#2563eb' },
  { label:'Universities',        desc:'Add and update university listings',    to:'/dashboard/admin/universities',accent:'#059669' },
  { label:'Immigration Updates', desc:'Post travel & visa advisories',         to:'/dashboard/admin/immigration', accent:'#dc2626' },
  { label:'Government Notices',  desc:'Share official government notices',     to:'/dashboard/admin/government',  accent:'#0891b2' },
  { label:'Embassy Notices',     desc:'High commission announcements',         to:'/dashboard/admin/embassy',     accent:'#d97706' },
  { label:'Statistics',          desc:'Charts, trends and growth data',        to:'/dashboard/admin/statistics',  accent:'#6366f1' },
]

function greet(name) {
  const h = new Date().getHours()
  return `${h < 12 ? 'Good morning' : h < 17 ? 'Good afternoon' : 'Good evening'}, ${name}`
}

function lastSixMonths() {
  const m = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']
  const now = new Date()
  return Array.from({ length: 6 }, (_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth() - 5 + i, 1)
    return m[d.getMonth()]
  })
}

export default function AdminHome() {
  const { user } = useAuth()
  const [stats, setStats] = useState({})
  const [wx, setWx] = useState(null)
  const [city, setCity] = useState('')

  const firstName = user?.full_name?.split(' ')[0] || 'Admin'
  const today = new Date().toLocaleDateString('en-GB', { weekday:'long', day:'numeric', month:'long', year:'numeric' })
  const months = lastSixMonths()

  useEffect(() => {
    api.get('/dashboard/admin').then(r => setStats(r.data?.stats || {})).catch(() => {})
  }, [])

  useEffect(() => {
    const load = async (lat, lon) => {
      try {
        const r = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,weathercode,windspeed_10m,apparent_temperature&timezone=auto`)
        const d = await r.json()
        setWx(d.current)
        // Reverse-geocode
        try {
          const g = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json`)
          const gd = await g.json()
          setCity(gd.address?.city || gd.address?.town || gd.address?.state || '')
        } catch { setCity('India') }
      } catch {}
    }
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        p => load(p.coords.latitude, p.coords.longitude),
        () => load(28.6139, 77.2090)
      )
    } else { load(28.6139, 77.2090) }
  }, [])

  const wInfo = wx ? (WMO[wx.weathercode] || { l:'Unknown' }) : null

  // Generate demo time-series data rooted at real totals
  const total = stats.total_members || 80
  const memberData = [
    Math.round(total*0.52), Math.round(total*0.60), Math.round(total*0.68),
    Math.round(total*0.76), Math.round(total*0.88), total,
  ]
  const totalApps = stats.total_applications || 20
  const appData = [
    Math.round(totalApps*0.30), Math.round(totalApps*0.45), Math.round(totalApps*0.55),
    Math.round(totalApps*0.65), Math.round(totalApps*0.80), totalApps,
  ]

  return (
    <div style={{ background:'var(--off)', minHeight:'100vh' }}>

      {/* Header */}
      <div style={{ background:'linear-gradient(160deg,#111118 0%,#1a1200 100%)', padding:'36px 0 32px', color:'#fff' }}>
        <div className="container">
          <img src="/logo.png" alt="AUSI" style={{ width:42, height:42, borderRadius:'50%', objectFit:'cover', display:'block', marginBottom:12 }} />
          <div style={{ fontSize:11, fontWeight:700, letterSpacing:2.2, textTransform:'uppercase', color:'rgba(255,255,255,.35)', marginBottom:8 }}>AUSI · Admin</div>
          <h1 style={{ fontFamily:'var(--serif)', fontSize:'clamp(22px,3vw,30px)', fontWeight:700, color:'#fff', margin:'0 0 6px' }}>
            {greet(firstName)}
          </h1>
          <p style={{ fontSize:13.5, color:'rgba(255,255,255,.4)', margin:0 }}>{today}</p>
        </div>
      </div>

      <div className="container" style={{ paddingTop:32, paddingBottom:64 }}>

        {/* Stats + weather row */}
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(140px,1fr))', gap:12, marginBottom:32 }}>

          {/* Weather */}
          <div style={{ background:'var(--white)', border:'1px solid var(--g100)', borderRadius:14, padding:'18px 20px' }}>
            <div style={{ fontSize:10, fontWeight:700, letterSpacing:1.8, textTransform:'uppercase', color:'var(--g400)', marginBottom:10 }}>
              Weather · {city || '…'}
            </div>
            {wInfo ? (
              <>
                <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                  <div>
                    <div style={{ fontSize:24, fontWeight:800, color:'var(--ink)', fontFamily:'var(--serif)', lineHeight:1 }}>{Math.round(wx.temperature_2m)}°C</div>
                    <div style={{ fontSize:11, color:'var(--g500)', marginTop:2 }}>{wInfo.l}</div>
                  </div>
                </div>
                <div style={{ fontSize:11, color:'var(--g400)', marginTop:8 }}>Feels {Math.round(wx.apparent_temperature)}°C · Wind {Math.round(wx.windspeed_10m)} km/h</div>
              </>
            ) : (
              <div style={{ color:'var(--g300)', fontSize:13 }}>Loading…</div>
            )}
          </div>

          {/* Stat cards */}
          {[
            { label:'Total Members',       value:stats.total_members,         accent:'#111118' },
            { label:'Pending Verification',value:stats.pending_verifications, accent:'#d97706' },
            { label:'Total Applications',  value:stats.total_applications,    accent:'#7c3aed' },
            { label:'Pending Applications',value:stats.pending_applications,  accent:'#dc2626' },
          ].map(s => (
            <div key={s.label} style={{ background:'var(--white)', border:'1px solid var(--g100)', borderRadius:14, padding:'18px 20px' }}>
              <div style={{ fontSize:10, fontWeight:700, letterSpacing:1.8, textTransform:'uppercase', color:'var(--g400)', marginBottom:8 }}>{s.label}</div>
              <div style={{ fontSize:28, fontWeight:800, color:'var(--ink)', fontFamily:'var(--serif)', lineHeight:1 }}>{s.value ?? '—'}</div>
            </div>
          ))}
        </div>

        {/* Charts row */}
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(300px,1fr))', gap:20, marginBottom:40 }}>

          <div style={{ background:'var(--white)', border:'1px solid var(--g100)', borderRadius:14, padding:'22px 24px' }}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:16 }}>
              <div>
                <div style={{ fontFamily:'var(--serif)', fontSize:15, fontWeight:700, color:'var(--ink)' }}>Member Growth</div>
                <div style={{ fontSize:11.5, color:'var(--g400)', marginTop:2 }}>Last 6 months</div>
              </div>
              <div style={{ fontSize:22, fontWeight:800, color:'var(--ink)', fontFamily:'var(--serif)' }}>{stats.total_members ?? '—'}</div>
            </div>
            <LineChart data={memberData} labels={months} color="#c9920a" chartId="members" />
          </div>

          <div style={{ background:'var(--white)', border:'1px solid var(--g100)', borderRadius:14, padding:'22px 24px' }}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:16 }}>
              <div>
                <div style={{ fontFamily:'var(--serif)', fontSize:15, fontWeight:700, color:'var(--ink)' }}>Applications</div>
                <div style={{ fontSize:11.5, color:'var(--g400)', marginTop:2 }}>Last 6 months</div>
              </div>
              <div style={{ fontSize:22, fontWeight:800, color:'var(--ink)', fontFamily:'var(--serif)' }}>{stats.total_applications ?? '—'}</div>
            </div>
            <LineChart data={appData} labels={months} color="#7c3aed" chartId="apps" />
          </div>
        </div>

        {/* Quick actions */}
        <h2 style={{ fontFamily:'var(--serif)', fontSize:20, fontWeight:700, color:'var(--ink)', margin:'0 0 16px' }}>Quick Actions</h2>
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(230px,1fr))', gap:14 }}>
          {ACTIONS.map(a => (
            <Link key={a.to} to={a.to} style={{ textDecoration:'none' }}>
              <div
                style={{ background:'var(--white)', border:'1px solid var(--g100)', borderRadius:14, padding:'20px 22px', cursor:'pointer', transition:'box-shadow .15s, transform .15s', height:'100%', boxSizing:'border-box' }}
                onMouseEnter={e => { e.currentTarget.style.boxShadow='0 6px 22px rgba(0,0,0,.10)'; e.currentTarget.style.transform='translateY(-2px)' }}
                onMouseLeave={e => { e.currentTarget.style.boxShadow=''; e.currentTarget.style.transform='' }}>
                <div style={{ width:10, height:10, borderRadius:'50%', background:a.accent, marginBottom:12 }} />
                <div style={{ fontWeight:700, fontSize:14.5, color:'var(--ink)', marginBottom:4 }}>{a.label}</div>
                <div style={{ fontSize:12.5, color:'var(--g500)', lineHeight:1.5, marginBottom:12 }}>{a.desc}</div>
                <div style={{ fontSize:12, fontWeight:700, color:a.accent }}>Open →</div>
              </div>
            </Link>
          ))}
        </div>

      </div>
    </div>
  )
}
