import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { ROLE_LABELS, ROLE_COLORS } from '../../lib/roles'
import api from '../../lib/api'

function greeting(name) {
  const h = new Date().getHours()
  const salute = h < 12 ? 'Good morning' : h < 17 ? 'Good afternoon' : 'Good evening'
  return `${salute}, ${name}`
}

function StatCard({ label, value }) {
  return (
    <div style={{ background:'var(--white)', border:'1px solid var(--g100)', borderRadius:14, padding:'18px 20px' }}>
      <div style={{ fontSize:10.5, fontWeight:700, letterSpacing:1.6, textTransform:'uppercase', color:'var(--g400)', marginBottom:8 }}>{label}</div>
      <div style={{ fontSize:22, fontWeight:800, color:'var(--ink)', fontFamily:'var(--serif)', lineHeight:1 }}>{value ?? '—'}</div>
    </div>
  )
}

function EventCard({ event }) {
  const d = new Date(event.event_date)
  const month = d.toLocaleString('default', { month:'short' }).toUpperCase()
  const day   = d.getDate()
  return (
    <div style={{ background:'var(--white)', border:'1px solid var(--g100)', borderRadius:14, overflow:'hidden', display:'flex', flexDirection:'column' }}>
      {event.image_url && (
        <img src={event.image_url} alt="" style={{ width:'100%', height:110, objectFit:'cover', display:'block' }} />
      )}
      <div style={{ padding:'14px 16px', display:'flex', gap:12, alignItems:'flex-start' }}>
        <div style={{ textAlign:'center', background:'var(--ink)', color:'var(--white)', borderRadius:8, padding:'6px 10px', flexShrink:0, minWidth:42 }}>
          <div style={{ fontSize:10, fontWeight:700, letterSpacing:1 }}>{month}</div>
          <div style={{ fontSize:20, fontWeight:800, lineHeight:1.1 }}>{day}</div>
        </div>
        <div>
          <div style={{ fontSize:14, fontWeight:700, color:'var(--ink)', lineHeight:1.3 }}>{event.title}</div>
          {event.location_city && <div style={{ fontSize:12, color:'var(--g500)', marginTop:3 }}>{event.location_city}</div>}
          <div style={{ fontSize:11, marginTop:5, display:'inline-block', padding:'2px 8px', background:'var(--off)', borderRadius:4, color:'var(--g600)', fontWeight:600 }}>
            {event.cost_inr === 0 ? 'Free' : `₹${event.cost_inr}`}
          </div>
        </div>
      </div>
    </div>
  )
}

const QUICK_ACTIONS = [
  { label: 'Cabinet',         desc: 'Meet your elected AUSI executive committee',   to: '/dashboard/cabinet',       accent: '#c9920a' },
  { label: 'Announcements',   desc: 'Latest news and updates from AUSI leadership', to: '/dashboard/announcements', accent: '#2563eb' },
  { label: 'Resources',       desc: 'Guides, documents and support for students',   to: '/dashboard/resources',     accent: '#059669' },
  { label: 'Marketplace',     desc: 'Buy, sell and exchange within the community',  to: '/dashboard/marketplace',   accent: '#7c3aed' },
  { label: 'Emergency',       desc: 'Important contacts for urgent situations',     to: '/dashboard/emergency',     accent: '#dc2626' },
]

export default function MemberDashboard() {
  const { user } = useAuth()
  const [data, setData]   = useState(null)
  const [error, setError] = useState('')

  useEffect(() => {
    api.get('/dashboard/member')
      .then(r => setData(r.data))
      .catch(() => setError('Could not load dashboard data.'))
  }, [])

  const profile    = data?.profile || user
  const firstName  = (profile?.full_name || 'there').split(' ')[0]

  return (
    <div style={{ background:'var(--off)', minHeight:'100vh' }}>

      {/* ── Hero header ────────────────────────────────────────────── */}
      <div style={{ background:'linear-gradient(160deg,#111118 0%,#1a1200 100%)', padding:'36px 0 32px', color:'#fff' }}>
        <div className="container">
          <img src="/logo.png" alt="AUSI" style={{ width:42, height:42, borderRadius:'50%', objectFit:'cover', display:'block', marginBottom:12 }} />
          <div style={{ fontSize:11, fontWeight:700, letterSpacing:2.2, textTransform:'uppercase', color:'rgba(255,255,255,.35)', marginBottom:8 }}>AUSI · 2026 / 27</div>
          <h1 style={{ fontFamily:'var(--serif)', fontSize:'clamp(22px,3vw,30px)', fontWeight:700, color:'#fff', margin:'0 0 6px' }}>
            {greeting(firstName)}
          </h1>
          <p style={{ fontSize:13.5, color:'rgba(255,255,255,.4)', margin:0 }}>
            {ROLE_LABELS[profile?.role] || 'Member'}
            {profile?.university_name && <span> · {profile.university_name}</span>}
            {profile?.is_verified === false && <span style={{ color:'#fca5a5' }}> · Pending Verification</span>}
          </p>
        </div>
      </div>

      <div className="container" style={{ paddingTop:32, paddingBottom:64 }}>

        {error && (
          <div style={{ background:'rgba(220,38,38,.08)', border:'1px solid rgba(220,38,38,.2)', borderRadius:10, padding:'12px 16px', fontSize:13, color:'var(--red)', marginBottom:24 }}>
            {error}
          </div>
        )}

        {/* ── Stats ──────────────────────────────────────────────────── */}
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(140px,1fr))', gap:12, marginBottom:36 }}>
          <StatCard label="University"    value={profile?.university_name || 'Not set'} />
          <StatCard label="Course"        value={profile?.field_of_study  || 'Not set'} />
          <StatCard label="Events"        value={data?.eventRegistrations ?? '—'} />
          <StatCard label="Member Since"  value={profile?.created_at ? new Date(profile.created_at).getFullYear() : (profile?.joined_at ? new Date(profile.joined_at).getFullYear() : '—')} />
        </div>

        {/* ── Quick Actions ──────────────────────────────────────────── */}
        <h2 style={{ fontFamily:'var(--serif)', fontSize:20, fontWeight:700, color:'var(--ink)', margin:'0 0 16px' }}>
          Quick Actions
        </h2>
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(240px,1fr))', gap:14, marginBottom:44 }}>
          {QUICK_ACTIONS.map(a => (
            <Link key={a.to} to={a.to} style={{ textDecoration:'none' }}>
              <div
                style={{ background:'var(--white)', border:'1px solid var(--g100)', borderRadius:14, padding:'20px 22px', cursor:'pointer', transition:'box-shadow .15s, transform .15s', height:'100%', boxSizing:'border-box' }}
                onMouseEnter={e => { e.currentTarget.style.boxShadow='0 6px 22px rgba(0,0,0,.10)'; e.currentTarget.style.transform='translateY(-2px)' }}
                onMouseLeave={e => { e.currentTarget.style.boxShadow=''; e.currentTarget.style.transform='' }}>
                <div style={{ width:10, height:10, borderRadius:'50%', background:a.accent, marginBottom:14 }} />
                <div style={{ fontWeight:700, fontSize:15, color:'var(--ink)', marginBottom:5 }}>{a.label}</div>
                <div style={{ fontSize:12.5, color:'var(--g500)', lineHeight:1.55 }}>{a.desc}</div>
                <div style={{ marginTop:14, fontSize:12, fontWeight:700, color:a.accent }}>Open →</div>
              </div>
            </Link>
          ))}
        </div>

        {/* ── Upcoming Events ───────────────────────────────────────── */}
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:16 }}>
          <h2 style={{ fontFamily:'var(--serif)', fontSize:20, fontWeight:700, color:'var(--ink)', margin:0 }}>Upcoming Events</h2>
        </div>

        {data?.upcomingEvents?.length ? (
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(240px,1fr))', gap:16 }}>
            {data.upcomingEvents.map(e => <EventCard key={e.id} event={e} />)}
          </div>
        ) : (
          <div style={{ background:'var(--white)', border:'1px solid var(--g100)', borderRadius:14, padding:'32px 24px', textAlign:'center', color:'var(--g400)', fontSize:14 }}>
            No upcoming events right now. Check back soon.
          </div>
        )}

      </div>
    </div>
  )
}
