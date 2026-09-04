import { useState, useEffect } from 'react'

const TYPE_STYLE = {
  Scholarship: { bg:'rgba(201,146,10,.08)', text:'#92400e' },
  Internship:  { bg:'rgba(37,99,235,.08)',  text:'#1d4ed8' },
  Opportunity: { bg:'rgba(5,150,105,.08)',  text:'#047857' },
}

const SECTIONS = [
  {
    type: 'Scholarship',
    title: 'Scholarships',
    desc: 'Funding opportunities and scholarship programmes available to AUSI members.',
  },
  {
    type: 'Internship',
    title: 'Internships',
    desc: 'Internship placements and work experience opportunities facilitated by AUSI.',
  },
  {
    type: 'Opportunity',
    title: 'Other Opportunities',
    desc: 'Additional opportunities — competitions, grants, programmes and more.',
  },
]

function ResourceCard({ item }) {
  const ts = TYPE_STYLE[item.type] || TYPE_STYLE.Opportunity
  return (
    <div style={{ background:'var(--white)', border:'1px solid var(--g100)', borderRadius:14, overflow:'hidden' }}>
      <div style={{ padding:'18px 22px 14px', borderBottom:'1px solid var(--g100)' }}>
        <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:8, flexWrap:'wrap' }}>
          <span style={{ fontSize:11, fontWeight:700, padding:'2px 9px', borderRadius:4, background:ts.bg, color:ts.text }}>{item.type}</span>
          {item.deadline && (
            <span style={{ fontSize:12, color:'var(--g400)' }}>
              Deadline: {new Date(item.deadline).toLocaleDateString('en-GB', { day:'numeric', month:'long', year:'numeric' })}
            </span>
          )}
          <span style={{ fontSize:12, color:'var(--g400)', marginLeft:'auto' }}>
            {new Date(item.date).toLocaleDateString('en-GB', { day:'numeric', month:'short', year:'numeric' })}
          </span>
        </div>
        <h3 style={{ fontFamily:'var(--serif)', fontSize:16, fontWeight:700, color:'var(--ink)', margin:0, lineHeight:1.3 }}>{item.title}</h3>
      </div>
      <div style={{ padding:'14px 22px', fontSize:13.5, color:'var(--g600)', lineHeight:1.68 }}>
        {item.description}
        {item.link && (
          <div style={{ marginTop:12 }}>
            <a href={item.link} target="_blank" rel="noreferrer"
              style={{ display:'inline-block', fontSize:13, fontWeight:700, color:'#2563eb', textDecoration:'none', padding:'6px 14px', background:'rgba(37,99,235,.07)', borderRadius:7 }}>
              Apply / Learn more →
            </a>
          </div>
        )}
      </div>
    </div>
  )
}

function EmptySection({ type }) {
  return (
    <div style={{ background:'var(--white)', border:'1px dashed var(--g200)', borderRadius:14, padding:'36px 24px', textAlign:'center', color:'var(--g400)', fontSize:13.5 }}>
      No {type.toLowerCase()}s posted yet — check back soon.
    </div>
  )
}

export default function DashboardResources() {
  const [items, setItems] = useState([])

  useEffect(() => {
    try {
      const stored = JSON.parse(localStorage.getItem('ausi_resources') || 'null')
      setItems(stored || [])
    } catch { setItems([]) }
  }, [])

  return (
    <div style={{ background:'var(--off)', minHeight:'100vh' }}>

      <div style={{ background:'linear-gradient(160deg,#111118 0%,#1a1200 100%)', padding:'36px 0 32px', color:'#fff' }}>
        <div className="container">
          <img src="/logo.png" alt="AUSI" style={{ width:42, height:42, borderRadius:'50%', objectFit:'cover', display:'block', marginBottom:12 }} />
          <div style={{ fontSize:11, fontWeight:700, letterSpacing:2.2, textTransform:'uppercase', color:'rgba(255,255,255,.35)', marginBottom:8 }}>AUSI · 2026 / 27</div>
          <h1 style={{ fontFamily:'var(--serif)', fontSize:'clamp(22px,3vw,30px)', fontWeight:700, color:'#fff', margin:'0 0 6px' }}>
            Resources &amp; Opportunities
          </h1>
          <p style={{ fontSize:13.5, color:'rgba(255,255,255,.4)', margin:0 }}>
            Scholarships, internships and opportunities posted by AUSI leadership
          </p>
        </div>
      </div>

      <div className="container" style={{ paddingTop:40, paddingBottom:64 }}>
        {SECTIONS.map(({ type, title, desc }) => {
          const sectionItems = items.filter(i => i.type === type)
          return (
            <div key={type} style={{ marginBottom:48 }}>
              <div style={{ marginBottom:20 }}>
                <h2 style={{ fontFamily:'var(--serif)', fontSize:22, fontWeight:700, color:'var(--ink)', margin:'0 0 6px' }}>{title}</h2>
                <p style={{ fontSize:13.5, color:'var(--g500)', margin:0, lineHeight:1.6 }}>{desc}</p>
              </div>
              {sectionItems.length === 0 ? (
                <EmptySection type={type} />
              ) : (
                <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
                  {sectionItems.map(item => <ResourceCard key={item.id} item={item} />)}
                </div>
              )}
            </div>
          )
        })}
      </div>

    </div>
  )
}
