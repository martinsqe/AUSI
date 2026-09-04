import { useState } from 'react'
import '../Leadership.css'
import { getCabinet } from '../../lib/cabinetStore'

function LeadCard({ person: p }) {
  return (
    <div className="lead-card-wrap">
      <div style={{ width:'5cm', height:'5cm', borderRadius:'50%', background:p.color, overflow:'hidden', position:'absolute', top:0, left:'50%', transform:'translateX(-50%)', boxShadow:'0 8px 28px rgba(0,0,0,.10)', zIndex:1, display:'flex', alignItems:'center', justifyContent:'center' }}>
        {p.photo
          ? <img src={p.photo} alt={p.name} style={{ width:'100%', height:'100%', objectFit:'cover', objectPosition:'center top', display:'block' }} />
          : <span style={{ fontSize:32, fontWeight:800, color:p.text, fontFamily:'var(--serif)' }}>{p.initials}</span>
        }
      </div>
      <div className="lead-card-body"
        onMouseEnter={e => { e.currentTarget.style.boxShadow = 'var(--sh-lg)'; e.currentTarget.style.transform = 'translateY(-3px)' }}
        onMouseLeave={e => { e.currentTarget.style.boxShadow = ''; e.currentTarget.style.transform = '' }}>
        <div style={{ textAlign:'center', marginBottom:10 }}>
          <div style={{ fontWeight:700, fontSize:15, color:'var(--ink)' }}>{p.name}</div>
          <div style={{ fontSize:11.5, color:'var(--g600)', fontWeight:600, marginTop:2 }}>{p.pos}</div>
          <div style={{ fontSize:11, color:'var(--g400)', marginTop:2 }}>{p.uni}</div>
        </div>
        <p style={{ fontSize:12.5, color:'var(--g600)', lineHeight:1.65, marginBottom:12, textAlign:'center' }}>{p.resp}</p>
        <div style={{ paddingTop:12, borderTop:'1px solid var(--g100)', textAlign:'center', display:'flex', flexDirection:'column', gap:4 }}>
          <span style={{ fontSize:12, color:'var(--g600)' }}>{p.email}</span>
          {p.phone && <span style={{ fontSize:12, color:'var(--g600)' }}>{p.phone}</span>}
        </div>
      </div>
    </div>
  )
}

function toRows(members) {
  const rows = []
  for (let i = 0; i < members.length; i += 3) rows.push(members.slice(i, i + 3))
  return rows
}

export default function Cabinet() {
  const [members] = useState(getCabinet)

  return (
    <div style={{ background: 'var(--off)', minHeight: '100vh' }}>

      {/* Header */}
      <div style={{ background: 'linear-gradient(160deg,#111118 0%,#1a1200 100%)', padding: '36px 0 32px', color: '#fff' }}>
        <div className="container">
          <img src="/logo.png" alt="AUSI" style={{ width:42, height:42, borderRadius:'50%', objectFit:'cover', display:'block', marginBottom:12 }} />
          <div style={{ fontSize:11, fontWeight:700, letterSpacing:2.2, textTransform:'uppercase', color:'rgba(255,255,255,.35)', marginBottom:8 }}>
            AUSI · 2026 / 27
          </div>
          <h1 style={{ fontFamily:'var(--serif)', fontSize:'clamp(22px,3vw,30px)', fontWeight:700, color:'#fff', margin:'0 0 6px' }}>
            The Cabinet
          </h1>
          <p style={{ fontSize:13.5, color:'rgba(255,255,255,.4)', margin:0 }}>
            Executive committee elected by AUSI members — serving all Ugandan students across India
          </p>
        </div>
      </div>

      {/* Cabinet grid */}
      <section className="section">
        <div className="container">
          {toRows(members).map((row, ri) => (
            <div key={ri} className={`cabinet-row${row.length <= 2 ? ' cabinet-row--center' : ''}`}>
              {row.map(p => <LeadCard key={p.id || p.name} person={p} />)}
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}
