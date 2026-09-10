import { useState, useEffect } from 'react'
import { lsGet, lsSet } from '../../lib/syncedStore'
import { Link } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'

const SEED = [
  { id:1, title:'National Education Policy 2024 – Foreign Students', category:'Education Policy', authority:'Ministry of Education', date:'2026-06-10', content:'The updated NEP framework now allows foreign students to apply directly to national universities without an entrance exam for select programs. Ugandan students should review the eligible courses list on the MoE website.' },
  { id:2, title:'Student Visa Processing Times Extended', category:'Visa Regulation', authority:'Ministry of External Affairs', date:'2026-05-22', content:'Processing times for student visas to India have been extended to 6–8 weeks. Students are advised to apply well in advance of their planned arrival date. This applies to new applications and renewals.' },
]

const CAT_COLORS = {
  'Education Policy': { bg:'rgba(37,99,235,.08)',   text:'#1d4ed8', border:'rgba(37,99,235,.2)' },
  'Visa Regulation':  { bg:'rgba(124,58,237,.08)',  text:'#5b21b6', border:'rgba(124,58,237,.2)' },
  'Travel Advisory':  { bg:'rgba(5,150,105,.08)',   text:'#047857', border:'rgba(5,150,105,.2)' },
  'Health & Safety':  { bg:'rgba(239,68,68,.08)',   text:'#dc2626', border:'rgba(239,68,68,.2)' },
  'Financial':        { bg:'rgba(201,146,10,.1)',   text:'#92400e', border:'rgba(201,146,10,.25)' },
  'Security':         { bg:'rgba(220,38,38,.08)',   text:'#b91c1c', border:'rgba(220,38,38,.2)' },
  'General':          { bg:'rgba(107,114,128,.08)', text:'#374151', border:'rgba(107,114,128,.2)' },
}

function Badge({ label, style: c }) {
  return (
    <span style={{ fontSize:11, fontWeight:700, letterSpacing:.5, textTransform:'uppercase', padding:'2px 9px', borderRadius:4, background:c.bg, color:c.text }}>
      {label}
    </span>
  )
}

export default function GovernmentNotices() {
  const { user } = useAuth()
  const [items, setItems] = useState([])
  const [catFilter, setCatFilter] = useState('all')
  const [expanded, setExpanded] = useState(null)

  useEffect(() => {
    try {
      const stored = JSON.parse(lsGet('ausi_government') || 'null')
      setItems(stored || SEED)
    } catch { setItems(SEED) }
  }, [])

  const isAdmin = ['exec', 'admin', 'chapter_president'].includes(user?.role)
  const cats = ['all', ...new Set(items.map(i => i.category))]
  const displayed = catFilter === 'all' ? items : items.filter(i => i.category === catFilter)

  return (
    <div style={{ background:'var(--off)', minHeight:'100vh' }}>

      <div style={{ background:'linear-gradient(160deg,#111118 0%,#0a001a 100%)', padding:'36px 0 32px', color:'#fff' }}>
        <div className="container">
          <img src="/logo.png" alt="AUSI" style={{ width:42, height:42, borderRadius:'50%', objectFit:'cover', display:'block', marginBottom:12 }} />
          <div style={{ fontSize:11, fontWeight:700, letterSpacing:2.2, textTransform:'uppercase', color:'rgba(255,255,255,.35)', marginBottom:8 }}>AUSI · 2026 / 27</div>
          <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', gap:16, flexWrap:'wrap' }}>
            <div>
              <h1 style={{ fontFamily:'var(--serif)', fontSize:'clamp(22px,3vw,30px)', fontWeight:700, color:'#fff', margin:'0 0 6px' }}>Government Notices</h1>
              <p style={{ fontSize:13.5, color:'rgba(255,255,255,.4)', margin:0 }}>Official policies, regulations, and advisories from Indian authorities</p>
            </div>
            {isAdmin && (
              <Link to="/dashboard/admin/government"
                style={{ padding:'8px 18px', background:'rgba(255,255,255,.1)', color:'rgba(255,255,255,.8)', border:'1px solid rgba(255,255,255,.15)', borderRadius:8, fontSize:12.5, fontWeight:700, textDecoration:'none', flexShrink:0 }}>
                Manage →
              </Link>
            )}
          </div>
        </div>
      </div>

      <div className="container" style={{ paddingTop:32, paddingBottom:64 }}>

        <div className="hscroll" style={{ display:'flex', gap:24, marginBottom:22, borderBottom:'1px solid var(--g100)', paddingBottom:14, overflowX:'auto', flexWrap:'nowrap' }}>
          {cats.map(c => {
            const active = catFilter === c
            return (
              <button key={c} onClick={() => setCatFilter(c)}
                style={{ background:'none', border:'none', borderBottom:`2px solid ${active ? 'var(--ink)' : 'transparent'}`, cursor:'pointer', padding:'0 0 4px', fontSize:14, fontWeight: active ? 800 : 500, color: active ? 'var(--ink)' : 'var(--g400)', transition:'color .15s, border-color .15s' }}>
                {c === 'all' ? `All (${items.length})` : c}
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
            const cc = CAT_COLORS[item.category] || CAT_COLORS.General
            const isOpen = expanded === item.id
            const preview = item.content?.slice(0, 220)
            const long = item.content?.length > 220
            return (
              <div key={item.id} style={{ background:'var(--white)', border:'1px solid var(--g100)', borderRadius:14, overflow:'hidden' }}>
                <div style={{ padding:'16px 22px' }}>
                  <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:8, flexWrap:'wrap' }}>
                    <Badge label={item.category} style={cc} />
                    <span style={{ fontSize:12.5, color:'var(--g500)', fontWeight:600 }}>{item.authority}</span>
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
