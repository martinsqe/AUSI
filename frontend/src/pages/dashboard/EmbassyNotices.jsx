import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'

const SEED = [
  { id:1, title:'Uganda High Commission – Office Hours 2026', type:'Announcement', date:'2026-07-01', content:'The Uganda High Commission in New Delhi will observe standard office hours: Monday to Friday, 9:00 AM – 4:00 PM IST. Consular services are available by appointment. Contact: +91-11-2688-5411.' },
  { id:2, title:'National Day Reception – October 9th', type:'Event', date:'2026-08-15', content:'The High Commission of Uganda cordially invites all Ugandan nationals in India to the Independence Day reception on October 9th, 2026. Venue and RSVP details will be shared closer to the date via the AUSI WhatsApp group.' },
]

const TYPE_COLORS = {
  'Announcement':    { bg:'rgba(37,99,235,.08)',  text:'#1d4ed8', border:'rgba(37,99,235,.2)' },
  'Warning':         { bg:'rgba(220,38,38,.08)',  text:'#b91c1c', border:'rgba(220,38,38,.2)' },
  'Event':           { bg:'rgba(201,146,10,.08)', text:'#92400e', border:'rgba(201,146,10,.2)' },
  'Service Update':  { bg:'rgba(5,150,105,.08)',  text:'#065f46', border:'rgba(5,150,105,.2)' },
  'Holiday Closure': { bg:'rgba(124,58,237,.08)', text:'#5b21b6', border:'rgba(124,58,237,.2)' },
}

function Badge({ label, style: c }) {
  return (
    <span style={{ fontSize:11, fontWeight:700, letterSpacing:.5, textTransform:'uppercase', padding:'2px 9px', borderRadius:4, background:c.bg, color:c.text }}>
      {label}
    </span>
  )
}

export default function EmbassyNotices() {
  const { user } = useAuth()
  const [items, setItems] = useState([])
  const [typeFilter, setTypeFilter] = useState('all')
  const [expanded, setExpanded] = useState(null)

  useEffect(() => {
    try {
      const stored = JSON.parse(localStorage.getItem('ausi_embassy') || 'null')
      setItems(stored || SEED)
    } catch { setItems(SEED) }
  }, [])

  const isAdmin = ['exec', 'admin', 'chapter_president'].includes(user?.role)
  const types = ['all', ...new Set(items.map(i => i.type))]
  const displayed = typeFilter === 'all' ? items : items.filter(i => i.type === typeFilter)

  return (
    <div style={{ background:'var(--off)', minHeight:'100vh' }}>

      <div style={{ background:'linear-gradient(160deg,#111118 0%,#1a0000 100%)', padding:'36px 0 32px', color:'#fff' }}>
        <div className="container">
          <img src="/logo.png" alt="AUSI" style={{ width:42, height:42, borderRadius:'50%', objectFit:'cover', display:'block', marginBottom:12 }} />
          <div style={{ fontSize:11, fontWeight:700, letterSpacing:2.2, textTransform:'uppercase', color:'rgba(255,255,255,.35)', marginBottom:8 }}>AUSI · 2026 / 27</div>
          <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', gap:16, flexWrap:'wrap' }}>
            <div>
              <h1 style={{ fontFamily:'var(--serif)', fontSize:'clamp(22px,3vw,30px)', fontWeight:700, color:'#fff', margin:'0 0 6px' }}>Embassy Notices</h1>
              <p style={{ fontSize:13.5, color:'rgba(255,255,255,.4)', margin:0 }}>Uganda High Commission · New Delhi — announcements & updates</p>
            </div>
            {isAdmin && (
              <Link to="/dashboard/admin/embassy"
                style={{ padding:'8px 18px', background:'rgba(255,255,255,.1)', color:'rgba(255,255,255,.8)', border:'1px solid rgba(255,255,255,.15)', borderRadius:8, fontSize:12.5, fontWeight:700, textDecoration:'none', flexShrink:0 }}>
                Manage →
              </Link>
            )}
          </div>
        </div>
      </div>

      <div className="container" style={{ paddingTop:32, paddingBottom:64 }}>

        <div style={{ background:'rgba(201,146,10,.06)', border:'1px solid rgba(201,146,10,.2)', borderRadius:10, padding:'12px 18px', marginBottom:24, fontSize:13, color:'#92400e', display:'flex', gap:10, alignItems:'flex-start' }}>
          <span>Official notices from the <strong>Uganda High Commission, New Delhi</strong>. For consular appointments and emergencies, call <strong>+91-11-2688-5411</strong>.</span>
        </div>

        <div className="hscroll" style={{ display:'flex', gap:24, marginBottom:22, borderBottom:'1px solid var(--g100)', paddingBottom:14, overflowX:'auto', flexWrap:'nowrap' }}>
          {types.map(t => {
            const active = typeFilter === t
            return (
              <button key={t} onClick={() => setTypeFilter(t)}
                style={{ background:'none', border:'none', borderBottom:`2px solid ${active ? 'var(--ink)' : 'transparent'}`, cursor:'pointer', padding:'0 0 4px', fontSize:14, fontWeight: active ? 800 : 500, color: active ? 'var(--ink)' : 'var(--g400)', transition:'color .15s, border-color .15s' }}>
                {t === 'all' ? `All (${items.length})` : t}
              </button>
            )
          })}
        </div>

        <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
          {displayed.length === 0 ? (
            <div style={{ background:'var(--white)', border:'1px solid var(--g100)', borderRadius:14, padding:'48px', textAlign:'center', color:'var(--g400)', fontSize:14 }}>
              No notices in this category.
            </div>
          ) : displayed.map(item => {
            const tc = TYPE_COLORS[item.type] || TYPE_COLORS.Announcement
            const isOpen = expanded === item.id
            const preview = item.content?.slice(0, 220)
            const long = item.content?.length > 220
            return (
              <div key={item.id} style={{ background:'var(--white)', border:'1px solid var(--g100)', borderRadius:14, overflow:'hidden' }}>
                <div style={{ padding:'16px 22px' }}>
                  <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:8, flexWrap:'wrap' }}>
                    <Badge label={item.type} style={tc} />
                    <span style={{ fontSize:12.5, color:'var(--g500)', fontWeight:600 }}>Uganda High Commission, New Delhi</span>
                    <span style={{ fontSize:12, color:'var(--g400)', marginLeft:'auto' }}>
                      {new Date(item.date).toLocaleDateString('en-GB', { day:'numeric', month:'long', year:'numeric' })}
                    </span>
                  </div>
                  <h3 style={{ fontFamily:'var(--serif)', fontSize:16, fontWeight:700, color:'var(--ink)', margin:'0 0 10px', lineHeight:1.3 }}>{item.title}</h3>
                  <p style={{ fontSize:13.5, color:'var(--g600)', lineHeight:1.68, margin:0 }}>
                    {isOpen ? item.content : (preview + (long ? '…' : ''))}
                  </p>
                  {long && (
                    <button onClick={() => setExpanded(isOpen ? null : item.id)}
                      style={{ background:'none', border:'none', cursor:'pointer', fontSize:12.5, color:'var(--g500)', padding:'6px 0 0', textDecoration:'underline' }}>
                      {isOpen ? 'Show less' : 'Read more'}
                    </button>
                  )}
                </div>
              </div>
            )
          })}
        </div>

      </div>
    </div>
  )
}
