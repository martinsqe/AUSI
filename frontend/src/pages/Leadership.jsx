import { useState } from 'react'
import { getCabinet } from '../lib/cabinetStore'
import './Leadership.css'

const BRANCHES = [
  { initials:'LA', color:'rgba(201,146,10,.16)', border:'rgba(201,146,10,.28)', badge:'Bengaluru · Karnataka',    name:'Lydia Akello',    pos:'Bengaluru Branch Coordinator',     uni:'REVA University, Bengaluru',   email:'bengaluru@ausi.org', resp:'Coordinates 5 universities — Manipal, REVA, Christ, Bangalore Medical College, and PES.' },
  { initials:'AK', color:'rgba(13,122,74,.14)',  border:'rgba(13,122,74,.28)',  badge:'Pune · Maharashtra',        name:'Amara Kiiza',     pos:'Pune Branch Coordinator',          uni:'Symbiosis Intl Univ, Pune',    email:'pune@ausi.org',      resp:'Coordinates 4 universities — Symbiosis, DY Patil, Bharati Vidyapeeth, Saveetha.' },
  { initials:'MO', color:'rgba(168,32,43,.14)',  border:'rgba(168,32,43,.28)',  badge:'Hyderabad · Telangana',     name:'Moses Omondi',    pos:'Hyderabad Branch Coordinator',     uni:'University of Hyderabad',      email:'hyderabad@ausi.org', resp:"Coordinates 4 universities — Osmania, UoH, BITS Hyderabad, Nizam's Institute." },
  { initials:'CN', color:'rgba(124,58,237,.14)', border:'rgba(124,58,237,.28)', badge:'Visakhapatnam · A.P.',      name:'Christine Nalwoga',pos:'Visakhapatnam Branch Coordinator', uni:'GITAM University, Vizag',      email:'vizag@ausi.org',     resp:"Coordinates Andhra University, GITAM, and Vignan's Foundation." },
  { initials:'RO', color:'rgba(29,93,200,.14)',  border:'rgba(29,93,200,.28)',  badge:'Delhi / NCR',               name:'Ronald Opolot',   pos:'Delhi Branch Coordinator',         uni:'AIIMS New Delhi',              email:'delhi@ausi.org',     resp:'Coordinates AIIMS, Jamia Millia Islamia, and Amity University Noida.' },
]

const PAST_PRESIDENTS = [
  { initials:'AM', photo:'/moses.png',  color:'rgba(201,146,10,.2)', border:'rgba(201,146,10,.45)', text:'#C9920A', name:'Assimwe Moses',       term:'2023 / 24', desc:'Co-founded AUSI after the Uganda Roadshow in Ahmedabad. Led the interim executive committee, presided over the official launch on Google Meet with 150+ students, and oversaw drafting of the AUSI Charter and Constitution.' },
  { initials:'SD', photo:'/derrick.png',color:'rgba(168,32,43,.2)',  border:'rgba(168,32,43,.45)',  text:'#A8202B', name:'Ssebadduka Derrick',  term:'2024 / 25', desc:"Established the official AUSI logo, launched the T-shirt fundraising campaign, organised the first Uganda Independence Day celebrations (broadcast on UBC and Daily Monitor), and convened the landmark AUSI Convention at GITAM University, Visakhapatnam." },
  { initials:'TR', photo:'/reagan.png', color:'rgba(29,93,200,.2)',  border:'rgba(29,93,200,.45)',  text:'#1d5dc8', name:'Tweheyo Kakuru Reagan',term:'2025 / 26', desc:"Expanded AUSI's national reach, built partnerships with Ugandan student organisations in Canada, Algeria, and China, introduced AUSI to the Uganda Global Forum (30+ countries), and founded the India–Uganda Alumni Association." },
]

function toRows(members) {
  const rows = []
  for (let i = 0; i < members.length; i += 3) rows.push(members.slice(i, i + 3))
  return rows
}

function AdvisorCard({ person: p }) {
  return (
    <div className="advisor-card">
      <div style={{ padding:'28px 24px 20px', display:'flex', flexDirection:'column', alignItems:'center', textAlign:'center' }}>
        <div style={{ width:'5cm', height:'5cm', borderRadius:'50%', background:p.color, overflow:'hidden', display:'flex', alignItems:'center', justifyContent:'center', fontSize:38, fontWeight:800, color:p.text, fontFamily:'var(--serif)', marginBottom:16 }}>
          {p.photo ? <img src={p.photo} alt={p.name} style={{ width:'100%', height:'100%', objectFit:'cover', objectPosition:'center top', display:'block' }} /> : p.initials}
        </div>
        <div style={{ fontWeight:700, fontSize:15, color:'var(--ink)', lineHeight:1.2 }}>{p.name}</div>
        <div style={{ fontSize:11.5, color:'var(--g400)', marginTop:4, marginBottom:14 }}>President · {p.term}</div>
        <p style={{ fontSize:12.5, color:'var(--g600)', lineHeight:1.68, textAlign:'center' }}>{p.desc}</p>
      </div>
    </div>
  )
}

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
        onMouseEnter={e=>{e.currentTarget.style.boxShadow='var(--sh-lg)';e.currentTarget.style.transform='translateY(-3px)'}}
        onMouseLeave={e=>{e.currentTarget.style.boxShadow='';e.currentTarget.style.transform=''}}>
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

export default function Leadership() {
  const [exec] = useState(getCabinet)

  return (
    <div style={{ paddingTop:'var(--nav)' }}>

      {/* Hero */}
      <div className="leadership-hero">
        <div className="container">
          <span className="eyebrow">Governance</span>
          <h1>AUSI Leadership</h1>
          <p className="sub">Our patron, national executive committee, and branch coordinators — elected annually by representatives from every branch.</p>
          <div className="india-strip"><span/><span/><span/></div>
        </div>
      </div>

      {/* ── Patron section ── */}
      <div className="patron-section">
        <div className="container">

          <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:28 }}>
            <div style={{ width:3, height:28, background:'var(--gold)', borderRadius:99 }} />
            <span style={{ fontSize:11, fontWeight:700, letterSpacing:2.4, textTransform:'uppercase', color:'var(--g400)' }}>Patron</span>
          </div>

          <div className="patron-card">
            <div className="patron-photo-float">
              <img src="/patron.png" alt="Mr. Rajesh Chaplot" />
            </div>

            <div style={{ display:'flex', alignItems:'center', gap:12, marginBottom:10, flexWrap:'wrap' }}>
              <img src="/logo2.png" alt="AUSI" style={{ height:32, width:32, objectFit:'cover', borderRadius:'50%', flexShrink:0 }} />
              <div style={{ fontFamily:'var(--serif)', fontSize:28, fontWeight:700, color:'var(--ink)', lineHeight:1.1 }}>
                Mr. Rajesh Chaplot
              </div>
            </div>

            <p style={{ fontSize:14, color:'var(--g800)', lineHeight:1.82, marginBottom:20 }}>
              With over 27 years of leadership in East Africa, Mr. Rajesh Chaplot is one of the most distinguished members of the Indian diaspora. A Chartered Accountant by profession, he has built and led businesses across Uganda, the Democratic Republic of Congo, and Tanzania, while serving in key advisory, corporate, and educational leadership roles. A recipient of the Pravasi Bharatiya Samman Award and Uganda's Golden Jubilee Medal, he brings to AUSI strategic insight, an extensive professional network, and a strong commitment to strengthening educational and economic ties between Uganda and India. Mr. Rajesh is currently engaged in writing <strong>Articles for various magazines and newspapers</strong>, and has authored several books including <strong>Wheel and Compass of Life, Namaste Africa, Time, and Nandu and Dadu (A Moral Science Book)</strong>.
            </p>

            <div style={{ fontSize:10, fontWeight:700, textTransform:'uppercase', letterSpacing:1.4, color:'var(--g400)', marginBottom:8 }}>Awards</div>
            <div style={{ display:'flex', flexWrap:'wrap', gap:'6px 20px', marginBottom:20 }}>
              {['Pravasi Bharatiya Samman Award · 2019', "Uganda's Golden Jubilee Award · 2020", 'ICAI International Leaders Award · 2018'].map(a => (
                <span key={a} style={{ fontSize:12.5, color:'var(--gold)', fontWeight:600 }}>{a}</span>
              ))}
            </div>

            <div className="patron-info-grid">
              {[
                ['Profession',        'Chartered Accountant · ICAI 1989 Batch'],
                ['Africa Experience', '1996 – 2023 · Business & Advisory roles'],
                ['AUSI Role',         'Strategic Advisor to Executive & Students'],
                ['Chairman (TWG) PIRT', 'Business Advisory Committee to H.E. the President of Uganda · 6 years'],
                ['Indian Association Uganda', 'Chairman · 2012 – 2014'],
                ['Indian Business Forum Uganda', 'Secretary General · 2014 – 2016'],
              ].map(([l,v]) => (
                <div key={l}>
                  <div style={{ fontSize:10, textTransform:'uppercase', letterSpacing:1.1, color:'var(--g400)', marginBottom:4 }}>{l}</div>
                  <div style={{ fontSize:13, color:'var(--ink)', fontWeight:600, lineHeight:1.5 }}>{v}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="patron-contacts-bar">
          <span className="patron-contacts-label">Contacts:</span>
          <div className="patron-contacts-items">
            {['chaplotrajeshug@gmail.com', 'rajeshchaplot.com'].map(val => (
              <span key={val}>{val}</span>
            ))}
          </div>
        </div>
      </div>

      {/* ── Board of Advisors ── */}
      <section className="section-sm advisors-section">
        <div className="container">
          <span className="eyebrow" style={{ marginBottom:6, display:'block' }}>Board of Advisors</span>
          <p style={{ fontSize:13.5, color:'var(--g600)', marginBottom:28, maxWidth:560 }}>
            Every outgoing president joins the Board of Advisors upon handover — providing continuity and institutional memory to the incoming executive.
          </p>
          <div className="advisors-track">
            {PAST_PRESIDENTS.map(p => <AdvisorCard key={p.name} person={p} />)}
          </div>
        </div>
      </section>

      {/* ── Electoral Process ── */}
      <section style={{ background:'var(--ink)', padding:'56px 0' }}>
        <div className="container" style={{ maxWidth:780, textAlign:'center' }}>
          <span className="eyebrow" style={{ color:'rgba(255,255,255,.4)', marginBottom:14, display:'block' }}>Democratic Governance</span>
          <h2 className="h2" style={{ color:'var(--gold-lt)', marginBottom:22, fontFamily:'var(--serif)' }}>Every Vote Counts. Every Year.</h2>
          <p style={{ fontSize:15.5, color:'rgba(255,255,255,.72)', lineHeight:1.9, marginBottom:18 }}>
            Every year, AUSI holds a fully democratic election open to all registered members of the association. Interested candidates are first screened by the <strong style={{ color:'var(--gold-lt)' }}>AUSI Electoral Commission</strong> — an independent body that ensures eligibility, integrity, and fair representation across all universities.
          </p>
          <p style={{ fontSize:15.5, color:'rgba(255,255,255,.72)', lineHeight:1.9, marginBottom:18 }}>
            Voting takes place on the <strong style={{ color:'var(--gold-lt)' }}>official AUSI website</strong>, where every registered student casts one vote — equal in weight regardless of university, city, or year of study. The results reflect the true democratic will of the Ugandan student community across India.
          </p>
          <p style={{ fontSize:15.5, color:'rgba(255,255,255,.72)', lineHeight:1.9 }}>
            Once elected, the incoming cabinet is sworn in <strong style={{ color:'var(--gold-lt)' }}>online</strong> in a formal ceremony attended by student representatives from different universities — marking the peaceful handover of leadership and the beginning of a new term of service.
          </p>
          <div style={{ display:'flex', justifyContent:'center', gap:48, marginTop:40, flexWrap:'wrap' }}>
            {[
              ['Electoral Commission', 'Independent screening of all candidates'],
              ['One Member, One Vote', 'Equal weight across all universities'],
              ['Online Swearing-In',   'Formal ceremony, open to all branches'],
            ].map(([title, desc]) => (
              <div key={title} style={{ textAlign:'center', maxWidth:180 }}>
                <div style={{ fontWeight:700, fontSize:13, color:'var(--white)', marginBottom:4 }}>{title}</div>
                <div style={{ fontSize:12, color:'rgba(255,255,255,.45)', lineHeight:1.55 }}>{desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Cabinet — dynamic from cabinetStore ── */}
      <section className="section">
        <div className="container">
          <span className="eyebrow" style={{ marginBottom:48, display:'block' }}>Our Dedicated Cabinet &nbsp;2026/27</span>
          {toRows(exec).map((row, ri) => (
            <div key={ri} className={`cabinet-row${row.length <= 2 ? ' cabinet-row--center' : ''}`}>
              {row.map(p => <LeadCard key={p.id || p.name} person={p} />)}
            </div>
          ))}
        </div>
      </section>

    </div>
  )
}
