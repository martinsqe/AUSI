import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { getUniversities, REGIONS } from '../../lib/universitiesStore'
import { ROLE_LABELS, ROLE_COLORS, canAccessAdmin } from '../../lib/roles'
import api from '../../lib/api'

/* ── All documented AUSI universities ────────────────────────── */
const KNOWN = [
  // West India
  { id:'rku',     name:'RK University',                      city:'Rajkot',             state:'Gujarat',         region:'West India'  },
  { id:'gu',      name:'Gujarat University',                 city:'Ahmedabad',          state:'Gujarat',         region:'West India'  },
  { id:'marwadi', name:'Marwadi University',                 city:'Rajkot',             state:'Gujarat',         region:'West India'  },
  { id:'parul',   name:'Parul University',                   city:'Vadodara',           state:'Gujarat',         region:'West India'  },
  { id:'sym',     name:'Symbiosis International University', city:'Pune',               state:'Maharashtra',     region:'West India'  },
  { id:'dyp',     name:'D.Y. Patil University',              city:'Pune',               state:'Maharashtra',     region:'West India'  },
  { id:'sppu',    name:'Savitribai Phule Pune University',   city:'Pune',               state:'Maharashtra',     region:'West India'  },
  { id:'mu',      name:'University of Mumbai',               city:'Mumbai',             state:'Maharashtra',     region:'West India'  },
  { id:'bv',      name:'Bharati Vidyapeeth University',      city:'Pune',               state:'Maharashtra',     region:'West India'  },
  { id:'mats',    name:'MATS University',                    city:'Raipur',             state:'Chhattisgarh',    region:'West India'  },
  // South India
  { id:'gitam',   name:'GITAM University',                   city:'Visakhapatnam',      state:'Andhra Pradesh',  region:'South India' },
  { id:'andhra',  name:'Andhra University',                  city:'Visakhapatnam',      state:'Andhra Pradesh',  region:'South India' },
  { id:'kl',      name:'KL University',                      city:'Vijayawada',         state:'Andhra Pradesh',  region:'South India' },
  { id:'vignan',  name:"Vignan's Foundation University",     city:'Guntur',             state:'Andhra Pradesh',  region:'South India' },
  { id:'uoh',     name:'University of Hyderabad',            city:'Hyderabad',          state:'Telangana',       region:'South India' },
  { id:'osmania', name:'Osmania University',                 city:'Hyderabad',          state:'Telangana',       region:'South India' },
  { id:'bits-h',  name:'BITS Pilani Hyderabad',              city:'Hyderabad',          state:'Telangana',       region:'South India' },
  { id:'kerala',  name:'Kerala University',                  city:'Thiruvananthapuram', state:'Kerala',          region:'South India' },
  { id:'srm',     name:'SRM University',                     city:'Chennai',            state:'Tamil Nadu',      region:'South India' },
  { id:'savet',   name:'Saveetha University',                city:'Chennai',            state:'Tamil Nadu',      region:'South India' },
  { id:'reva',    name:'REVA University',                    city:'Bengaluru',          state:'Karnataka',       region:'South India' },
  { id:'christ',  name:'Christ University',                  city:'Bengaluru',          state:'Karnataka',       region:'South India' },
  { id:'manipal', name:'Manipal Academy of Higher Education',city:'Manipal',            state:'Karnataka',       region:'South India' },
  { id:'pes',     name:'PES University',                     city:'Bengaluru',          state:'Karnataka',       region:'South India' },
  // East India
  { id:'royal',   name:'Royal Global University',            city:'Guwahati',           state:'Assam',           region:'East India'  },
  { id:'kiit',    name:'KIIT University',                    city:'Bhubaneswar',        state:'Odisha',          region:'East India'  },
  // North India
  { id:'du',      name:'Delhi University',                   city:'New Delhi',          state:'Delhi',           region:'North India' },
  { id:'aiims',   name:'AIIMS New Delhi',                    city:'New Delhi',          state:'Delhi',           region:'North India' },
  { id:'jamia',   name:'Jamia Millia Islamia',               city:'New Delhi',          state:'Delhi',           region:'North India' },
  { id:'amity',   name:'Amity University',                   city:'Noida',              state:'Uttar Pradesh',   region:'North India' },
  { id:'lpu',     name:'Lovely Professional University',     city:'Phagwara',           state:'Punjab',          region:'North India' },
  { id:'graphic', name:'Graphic Era University',             city:'Dehradun',           state:'Uttarakhand',     region:'North India' },
  { id:'lnct',    name:'LNCT University',                    city:'Bhopal',             state:'Madhya Pradesh',  region:'North India' },
]

function matchUni(uniName, studentUniName) {
  if (!studentUniName || !uniName) return false
  const u = uniName.toLowerCase().trim()
  // strip city suffix from student's stored name (e.g. "RK University, Rajkot" → "rk university")
  const s = studentUniName.toLowerCase().split(',')[0].trim()
  if (s === u) return true
  if (s.includes(u)) return true
  if (u.includes(s) && s.length >= 5) return true
  return false
}

function toArray(data) {
  if (Array.isArray(data)) return data
  if (data && Array.isArray(data.members)) return data.members
  if (data && Array.isArray(data.users))   return data.users
  if (data && Array.isArray(data.data))    return data.data
  return []
}

/* Fixed px widths → the grid overflows → overflowX:auto wrapper scrolls.
   Phone is staff-only, so the grid drops a column entirely for regular members
   instead of showing a redacted/blank cell. */
const COL_STAFF   = '180px 200px 130px 180px 110px 90px 80px'
const COL_MEMBER  = '180px 200px 180px 110px 90px 80px'
const MIN_W_STAFF  = 970
const MIN_W_MEMBER = 840

/* ── Column header row ───────────────────────────────────────── */
function StudentHeader({ isAdmin }) {
  const cols = isAdmin
    ? ['Full Name', 'Email', 'Phone', 'Course / Programme', 'Role', 'Joined', 'Status']
    : ['Full Name', 'Email', 'Course / Programme', 'Role', 'Joined', 'Status']
  return (
    <div style={{ display:'grid', gridTemplateColumns: isAdmin ? COL_STAFF : COL_MEMBER, gap:10, padding:'7px 16px 7px 24px', background:'rgba(0,0,0,.025)', borderTop:'1px solid var(--g100)', minWidth: isAdmin ? MIN_W_STAFF : MIN_W_MEMBER }}>
      {cols.map(col => (
        <span key={col} style={{ fontSize:10, fontWeight:700, letterSpacing:1.3, textTransform:'uppercase', color:'var(--g400)' }}>{col}</span>
      ))}
    </div>
  )
}

/* ── Student row inside university block ─────────────────────── */
function StudentRow({ m, highlight, isAdmin }) {
  const color = ROLE_COLORS[m.role] || '#64748b'
  const initials = (m.full_name || '?').split(' ').map(w => w[0]).filter(Boolean).slice(0, 2).join('').toUpperCase() || '?'
  const joined = m.joined_at || m.created_at
  return (
    <div style={{ display:'grid', gridTemplateColumns: isAdmin ? COL_STAFF : COL_MEMBER, gap:10, padding:'11px 16px 11px 24px', borderTop:'1px solid var(--g50)', background: highlight ? `${color}07` : 'transparent', alignItems:'center', minWidth: isAdmin ? MIN_W_STAFF : MIN_W_MEMBER }}>
      {/* Full Name */}
      <div style={{ display:'flex', alignItems:'center', gap:9 }}>
        <div style={{ width:28, height:28, borderRadius:'50%', background:color, flexShrink:0, display:'flex', alignItems:'center', justifyContent:'center', fontSize:10.5, fontWeight:800, color:'#fff' }}>
          {initials}
        </div>
        <div style={{ fontSize:13, fontWeight:700, color:'var(--ink)', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{m.full_name || '—'}</div>
      </div>
      {/* Email */}
      <div style={{ fontSize:12, color:'var(--g500)', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{m.email || '—'}</div>
      {/* Phone — staff only; other students must not see each other's numbers */}
      {isAdmin && <div style={{ fontSize:12.5, color:'var(--g600)', whiteSpace:'nowrap' }}>{m.phone || '—'}</div>}
      {/* Course */}
      <div style={{ fontSize:12.5, color:'var(--g600)', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{m.course || m.field_of_study || m.programme || '—'}</div>
      {/* Role */}
      <span style={{ fontSize:11, fontWeight:700, padding:'2px 8px', borderRadius:4, background:`${color}14`, color, border:`1px solid ${color}28`, whiteSpace:'nowrap', justifySelf:'start' }}>
        {ROLE_LABELS[m.role] || m.role || '—'}
      </span>
      {/* Joined */}
      <div style={{ fontSize:11.5, color:'var(--g500)', whiteSpace:'nowrap' }}>
        {joined ? new Date(joined).toLocaleDateString('en-GB', { day:'numeric', month:'short', year:'2-digit' }) : '—'}
      </div>
      {/* Status */}
      {m.is_verified
        ? <span style={{ fontSize:11, fontWeight:700, color:'#059669' }}>✓ Verified</span>
        : <span style={{ fontSize:11, color:'var(--g400)' }}>Unverified</span>
      }
    </div>
  )
}

/* ── One university + its students ───────────────────────────── */
function UniBlock({ u, members, q, isAdmin }) {
  const students = members.filter(m => matchUni(u.name, m.university_name))
  return (
    <div style={{ borderTop:'1px solid var(--g100)' }}>
      {/* University header row */}
      <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', gap:12, padding:'14px 16px 14px 24px', minWidth: isAdmin ? MIN_W_STAFF : MIN_W_MEMBER }}>
        <div style={{ minWidth:0 }}>
          <div style={{ fontSize:15, fontWeight:700, color:'var(--ink)', lineHeight:1.2 }}>{u.name}</div>
          <div style={{ fontSize:12.5, color:'var(--g500)', marginTop:3 }}>
            {[u.city, u.state].filter(Boolean).join(' · ') || 'India'}
          </div>
        </div>
        <div style={{ fontSize:13, fontWeight:700, color: students.length > 0 ? 'var(--ink)' : 'var(--g300)', flexShrink:0, paddingTop:2, whiteSpace:'nowrap' }}>
          {students.length > 0 ? `${students.length} member${students.length !== 1 ? 's' : ''}` : '—'}
        </div>
      </div>

      {/* Column headers — always visible */}
      <StudentHeader isAdmin={isAdmin} />

      {/* Student rows */}
      {students.length === 0 ? (
        <div style={{ padding:'10px 16px 14px 24px', fontSize:12.5, color:'var(--g400)', fontStyle:'italic', minWidth: isAdmin ? MIN_W_STAFF : MIN_W_MEMBER }}>
          No registered AUSI members at this university
        </div>
      ) : (
        students.map(s => {
          const hl = q.length >= 2 && (
            s.full_name?.toLowerCase().includes(q) ||
            s.email?.toLowerCase().includes(q)
          )
          return <StudentRow key={s.id || s.email} m={s} highlight={hl} isAdmin={isAdmin} />
        })
      )}
    </div>
  )
}

/* ── Region section ──────────────────────────────────────────── */
function RegionSection({ region, unis, members, q, isAdmin }) {
  const stuCount = unis.reduce((n, u) => n + members.filter(m => matchUni(u.name, m.university_name)).length, 0)
  return (
    <section style={{ marginBottom:40 }}>
      {/* Region heading — plain, no decoration */}
      <div style={{ display:'flex', alignItems:'baseline', gap:12, marginBottom:12 }}>
        <h2 style={{ fontFamily:'var(--serif)', fontSize:17, fontWeight:700, color:'var(--ink)', margin:0 }}>{region}</h2>
        <span style={{ fontSize:12.5, color:'var(--g400)' }}>
          {unis.length} {unis.length === 1 ? 'university' : 'universities'}
          {stuCount > 0 && ` · ${stuCount} member${stuCount !== 1 ? 's' : ''}`}
        </span>
      </div>

      {/* Table card */}
      <div style={{ background:'var(--white)', border:'1px solid var(--g100)', borderRadius:12, overflow:'hidden' }}>
        <div style={{ overflowX:'auto', minWidth:0 }}>
          {unis.map(u => <UniBlock key={u.id} u={u} members={members} q={q} isAdmin={isAdmin} />)}
        </div>
      </div>
    </section>
  )
}

/* ── Page ────────────────────────────────────────────────────── */
export default function DashboardUniversities() {
  const { user } = useAuth()
  const [adminUnis, setAdminUnis] = useState([])
  const [members, setMembers]     = useState([])
  const [search, setSearch]       = useState('')
  const [region, setRegion]       = useState('all')

  useEffect(() => {
    setAdminUnis(getUniversities())
    const load = async () => {
      for (const ep of ['/dashboard/president', '/dashboard/admin', '/members']) {
        try {
          const r = await api.get(ep)
          const list = toArray(r.data?.members ?? r.data)
          if (list.length) { setMembers(list); return }
        } catch {}
      }
      setMembers([])
    }
    load()
  }, [])

  const isAdmin = canAccessAdmin(user?.role)
  const safeMembers = Array.isArray(members) ? members : []

  /* ── Build full university list ─────────────────────────────── */
  const knownNames = new Set(KNOWN.map(k => k.name.toLowerCase()))
  const adminExtras = adminUnis.filter(u => !knownNames.has(u.name.toLowerCase()))
  const baseList = [...KNOWN, ...adminExtras]

  // Auto-derive any university from member data not already in the list
  const derivedSet = new Set()
  const derivedUnis = []
  safeMembers.forEach(m => {
    if (!m.university_name) return
    const name = m.university_name.trim()
    const lower = name.toLowerCase()
    if (!baseList.some(u => matchUni(u.name, name)) && !derivedSet.has(lower)) {
      derivedSet.add(lower)
      derivedUnis.push({ id:`d-${lower.replace(/\s+/g, '-')}`, name, city:'', state:'', region:'Other' })
    }
  })

  const allUnis = [...baseList, ...derivedUnis]

  /* ── Search + filter ────────────────────────────────────────── */
  const q = search.toLowerCase().trim()

  const displayed = allUnis.filter(u => {
    const textMatch = !q ||
      u.name.toLowerCase().includes(q) ||
      u.city.toLowerCase().includes(q) ||
      u.state.toLowerCase().includes(q)
    const studentMatch = q.length >= 2 && safeMembers
      .filter(m => matchUni(u.name, m.university_name))
      .some(s => s.full_name?.toLowerCase().includes(q) || s.email?.toLowerCase().includes(q))
    const regionMatch = region === 'all' || u.region === region
    return (textMatch || studentMatch) && regionMatch
  })

  const allRegions = [...REGIONS, ...(derivedUnis.length > 0 ? ['Other'] : [])]
  const byRegion = allRegions.reduce((acc, r) => {
    const items = displayed.filter(u => u.region === r)
    if (items.length) acc[r] = items
    return acc
  }, {})

  const regionCount = r => allUnis.filter(u => u.region === r).length
  const totalStudents = safeMembers.length

  /* ── Filter label helper ─────────────────────────────────────── */
  const studentHit = q.length >= 2 && safeMembers.some(m => m.full_name?.toLowerCase().includes(q) || m.email?.toLowerCase().includes(q))

  return (
    <div style={{ background:'var(--off)', minHeight:'100vh' }}>

      {/* ── Header ─────────────────────────────────────────────── */}
      <div className="page-hero" style={{ background:'linear-gradient(160deg,#111118 0%,#1a1200 100%)', padding:'36px 0 32px' }}>
        <div className="container">
          <img src="/logo.png" alt="AUSI" style={{ width:42, height:42, borderRadius:'50%', objectFit:'cover', display:'block', marginBottom:12 }} />
          <div style={{ fontSize:11, fontWeight:700, letterSpacing:2.2, textTransform:'uppercase', color:'rgba(255,255,255,.35)', marginBottom:8 }}>AUSI · 2026 / 27</div>
          <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', gap:16, flexWrap:'wrap' }}>
            <div>
              <h1 style={{ fontFamily:'var(--serif)', fontSize:'clamp(22px,3vw,30px)', fontWeight:700, color:'#fff', margin:'0 0 6px' }}>Universities</h1>
              <p style={{ fontSize:13.5, color:'rgba(255,255,255,.4)', margin:0 }}>
                {allUnis.length} universities across India
                {totalStudents > 0 && ` · ${totalStudents} registered AUSI members`}
              </p>
            </div>
            {isAdmin && (
              <Link to="/dashboard/manage/universities"
                style={{ padding:'8px 18px', background:'rgba(255,255,255,.1)', color:'rgba(255,255,255,.8)', border:'1px solid rgba(255,255,255,.15)', borderRadius:8, fontSize:12.5, fontWeight:700, textDecoration:'none', flexShrink:0 }}>
                Manage →
              </Link>
            )}
          </div>
        </div>
      </div>

      <div className="container" style={{ paddingTop:28, paddingBottom:64 }}>

        {/* ── Search bar ─────────────────────────────────────────── */}
        <div style={{ position:'relative', marginBottom:20, maxWidth:560 }}>
          <input
            value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search university, state, city or student name…"
            style={{ width:'100%', padding:'11px 16px', border:'1.5px solid var(--g200)', borderRadius:10, fontSize:14, outline:'none', background:'var(--white)', boxSizing:'border-box' }}
          />
          {search && (
            <button onClick={() => setSearch('')}
              style={{ position:'absolute', right:12, top:'50%', transform:'translateY(-50%)', background:'none', border:'none', cursor:'pointer', fontSize:18, color:'var(--g400)', padding:0, lineHeight:1 }}>
              ×
            </button>
          )}
        </div>

        {/* ── Region filter — plain text, horizontal scroll ──────── */}
        <div className="hscroll" style={{ display:'flex', gap:24, marginBottom:28, borderBottom:'1px solid var(--g100)', paddingBottom:14, overflowX:'auto', flexWrap:'nowrap' }}>
          {[['all', `All (${allUnis.length})`], ...allRegions.map(r => [r, `${r.replace(' India', '')} (${regionCount(r)})`])].map(([val, label]) => {
            const active = region === val
            return (
              <button key={val} onClick={() => setRegion(val)}
                style={{ background:'none', border:'none', cursor:'pointer', padding:0, fontSize:14, fontWeight: active ? 800 : 500, color: active ? 'var(--ink)' : 'var(--g400)', borderBottom: active ? '2px solid var(--ink)' : '2px solid transparent', paddingBottom:4, transition:'color .15s, border-color .15s' }}>
                {label}
              </button>
            )
          })}
        </div>

        {/* Search result hint */}
        {q.length >= 2 && (
          <div style={{ fontSize:13, color:'var(--g500)', marginBottom:16 }}>
            {displayed.length === 0
              ? `No results for "${search}"`
              : `${displayed.length} universit${displayed.length === 1 ? 'y' : 'ies'} found`}
            {studentHit && <span style={{ marginLeft:6, color:'#7c3aed', fontWeight:700 }}> · matched student name</span>}
          </div>
        )}

        {/* ── No results ─────────────────────────────────────────── */}
        {displayed.length === 0 && (
          <div style={{ background:'var(--white)', border:'1px solid var(--g100)', borderRadius:12, padding:'48px', textAlign:'center', color:'var(--g400)', fontSize:14 }}>
            No universities match <strong>"{search}"</strong>. Try searching by state or a student's name.
          </div>
        )}

        {/* ── Table grouped by region ────────────────────────────── */}
        {region === 'all' ? (
          Object.entries(byRegion).map(([r, items]) => (
            <RegionSection key={r} region={r} unis={items} members={safeMembers} q={q} isAdmin={isAdmin} />
          ))
        ) : (
          displayed.length > 0 && (
            <RegionSection region={region} unis={displayed} members={safeMembers} q={q} isAdmin={isAdmin} />
          )
        )}

      </div>
    </div>
  )
}
