import { useState, useEffect } from 'react'
import { lsGet, lsSet } from '../lib/syncedStore'
import { Link } from 'react-router-dom'

/* ── Manual-scroll carousel ── */
function Carousel({ items }) {
  return (
    <div className="car-outer">
      <div className="car-track">
        {items.map(({ src, caption }, i) => (
          <div key={i} className="car-item">
            <img src={src} alt="" style={{ width:'100%', height:'100%', objectFit:'cover', objectPosition:'center', display:'block' }} />
            {caption && (
              <div className="car-caption">
                <p style={{ margin:0, fontSize:12.5, color:'rgba(255,255,255,.95)', lineHeight:1.6 }}>{caption}</p>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

/* ── Highlight block: image left, description right ── */
function SectionHighlight({ src, alt, children }) {
  return (
    <div className="container" style={{ marginBottom:48 }}>
      <div className="ev-highlight-grid">
        <img src={src} alt={alt} style={{ width:'100%', height:'100%', display:'block', objectFit:'cover', objectPosition:'center' }} />
        <div>{children}</div>
      </div>
    </div>
  )
}


/* ── Region section wrapper ── */
function RegionSection({ region, accent, children }) {
  return (
    <section style={{ paddingBottom:72, borderBottom:'1px solid var(--g100)' }}>
      <div className="container" style={{ marginBottom:36 }}>
        <h2 className="h2">{region}</h2>
      </div>
      {children}
    </section>
  )
}

/* ─────────────────────────────────────────
   CAROUSEL DATA
───────────────────────────────────────── */
const WEST_CAROUSEL = [
  { src:'/parul.png',   caption:'Parul University · Vadodara' },
  { src:'/pune.png',    caption:'Pune University · Pune, Maharashtra' },
  { src:'/mumbai.png',  caption:'Mumbai University · Mumbai' },
  { src:'/rk.png',      caption:'RK University · Rajkot, Gujarat' },
  { src:'/marwadi.png', caption:'Marwadi University · Rajkot, Gujarat' },
  { src:'/gujarat.png', caption:'Gujarat University · Ahmedabad' },
  { src:'/mats.png',    caption:'MATS University · Raipur, Chhattisgarh' },
]

const SOUTH_CAROUSEL = [
  { src:'/andhra.png', caption:'Andhra University · Visakhapatnam' },
  { src:'/KL.png',     caption:'KL University · Vijayawada, Andhra Pradesh' },
  { src:'/kerala.png', caption:'Kerala University · Thiruvananthapuram' },
  { src:'/srm.png',    caption:'SRM University · Chennai, Tamil Nadu' },
]

const EAST_CAROUSEL = [
  { src:'/KIIT.png',   caption:'KIIT University · Bhubaneswar, Odisha' },
  { src:'/royal2.png', caption:'Royal Global University · Guwahati, Assam' },
  { src:'/KIIT1.png',  caption:'KIIT University · Bhubaneswar, Odisha' },
]

const NORTH_CAROUSEL = [
  { src:'/LPU.png',     caption:'Lovely Professional University · Phagwara, Punjab' },
  { src:'/graphic.png', caption:'Graphic Era University · Dehradun, Uttarakhand' },
  { src:'/LNCT.png',    caption:'LNCT University · Bhopal, Madhya Pradesh' },
]

/* ─────────────────────────────────────────
   PAGE
───────────────────────────────────────── */
const REGIONS_ORDER = ['West India', 'South India', 'North India', 'East India']
const REGION_DOT = { 'West India':'#d97706', 'South India':'#059669', 'North India':'#7c3aed', 'East India':'#0891b2' }

export default function Universities() {
  const [adminUnis, setAdminUnis] = useState([])

  useEffect(() => {
    try {
      const stored = lsGet('ausi_universities')
      if (stored) setAdminUnis(JSON.parse(stored))
    } catch {}
  }, [])

  const byRegion = REGIONS_ORDER.reduce((acc, r) => {
    const items = adminUnis.filter(u => u.region === r)
    if (items.length > 0) acc[r] = items
    return acc
  }, {})

  return (
    <div style={{ paddingTop:'var(--nav)' }}>

      {/* Hero */}
      <div className="page-hero">
        <div className="container">
          <span className="eyebrow">Where We Study</span>
          <h1>Universities Across India</h1>
          <p className="sub">
            From Rajkot to Guwahati, Ugandan students are thriving at universities across India.
            AUSI members are active at institutions including <strong>RK University</strong>, <strong>GITAM</strong>, <strong>Marwadi</strong>,
            <strong> KL University</strong>, <strong>Delhi University</strong>, <strong>LPU</strong>, and many more —
            building careers, friendships, and a community that spans the entire subcontinent.
          </p>
          <div className="india-strip"><span/><span/><span/></div>
        </div>
      </div>

      {/* ── Persuasive section ── */}
      <section style={{ background:'var(--white)', padding:'64px 0 60px', borderBottom:'1px solid var(--g100)' }}>
        <div className="container" style={{ maxWidth:840 }}>
          <span className="eyebrow" style={{ display:'block', marginBottom:14 }}>Admissions</span>
          <h2 style={{ fontFamily:'var(--serif)', fontSize:'clamp(24px,3vw,40px)', fontWeight:700, color:'var(--ink)', lineHeight:1.22, marginBottom:22 }}>
            For a Ugandan student with interests of pursuing education in India.<br/>
          </h2>
          <p style={{ fontSize:15, color:'var(--g600)', lineHeight:1.88, marginBottom:16 }}>
            Take a close look at the universities below from all regions of India where Ugandan students are studying, make some personal research on each one of them and find the right fit for your course and ambitions.
          </p>
          <p style={{ fontSize:15, color:'var(--g600)', lineHeight:1.88, marginBottom:36 }}>
            AUSI is here to make it smooth for you from visa applications at the embassy back home to making your first step in India and reaching your final destination. Apply to get started with your journey to India and we will be happy to assist you in every step of the way.
          </p>
          <div style={{ display:'flex', alignItems:'center', gap:36, flexWrap:'wrap' }}>
            <Link to="/apply"
              style={{ display:'inline-flex', alignItems:'center', gap:10, background:'var(--ink)', color:'var(--white)', fontSize:14, fontWeight:700, padding:'14px 30px', borderRadius:10, textDecoration:'none' }}>
              Apply here →
            </Link>
            <div style={{ borderLeft:'2px solid var(--g100)', paddingLeft:24 }}>
              <div style={{ fontSize:10.5, fontWeight:700, letterSpacing:1.6, textTransform:'uppercase', color:'var(--g400)', marginBottom:5 }}>For Consultations</div>
              <div style={{ fontSize:14, fontWeight:700, color:'var(--ink)', marginBottom:2 }}>AUSI Admissions Team</div>
              <div style={{ fontSize:13, color:'var(--g600)' }}>ausioffice@gmail.com</div>
            </div>
          </div>
        </div>
      </section>

      <div style={{ paddingTop:64 }}>

        {/* ══════════════THE WEST  ══════════════ */}
        <RegionSection region="West India" accent="rgba(201,146,10,.8)">
          <SectionHighlight src="/RK1.png" alt="RK University, Rajkot">
            <h3 style={{ fontFamily:'var(--serif)', fontSize:24, fontWeight:700, color:'var(--ink)', marginBottom:12, lineHeight:1.25 }}>RK University, Rajkot</h3>
            <p style={{ fontSize:14, color:'var(--g600)', lineHeight:1.8 }}>
              RK University in Rajkot, Gujarat is home to the largest concentration of over 90+ Ugandan students with  and serves as AUSI's primary hub for the western region. The university offers programmes across engineering, pharmacy, management, and the sciences, and has built a welcoming environment for international students from across Africa. Across West India, <strong style={{ color:'var(--ink)', fontWeight:600 }}>summers (March – June) are very hot inland</strong>, with temperatures reaching <strong style={{ color:'var(--ink)', fontWeight:600 }}>30–44°C in Gujarat, 22–38°C in Pune, and up to 44°C in Raipur</strong> — pack light cotton clothing. <strong style={{ color:'var(--ink)', fontWeight:600 }}>Monsoon season (July – September)</strong> brings moderate rain to Gujarat and extremely heavy rainfall in Mumbai, with temperatures settling around <strong style={{ color:'var(--ink)', fontWeight:600 }}>24–33°C</strong> across the region. <strong style={{ color:'var(--ink)', fontWeight:600 }}>Winters (November – February) are pleasant and mild</strong> — Gujarat ranges <strong style={{ color:'var(--ink)', fontWeight:600 }}>12–30°C</strong>, Mumbai <strong style={{ color:'var(--ink)', fontWeight:600 }}>18–32°C</strong>, and Pune <strong style={{ color:'var(--ink)', fontWeight:600 }}>10–28°C</strong>; a light jacket is all you need.
              In Gujarat, theres <strong style={{ color:'var(--ink)', fontWeight:600 }}>strict limitations on alcohol consumption</strong> but allowed to a certain extent for international students. In Mumbai, alcohol is widely available and legal for those above 25 years of age. In Pune, alcohol is legal for those above 21 years of age.
              <strong style={{ color:'var(--ink)', fontWeight:600 }}>Non vegetarian food is widely available in all regions of West India</strong>, with a variety of cuisines including Indian, Chinese, and continental. <strong style={{ color:'var(--ink)', fontWeight:600 }}>Vegetarian options are also plentiful</strong>, especially in Gujarat where vegetarianism is more common.
              <strong style={{ color:'var(--ink)', fontWeight:600 }}>Airports in West India include Sardar Vallabhbhai Patel International Airport (Ahmedabad), Rajkot International Airport (Rajkot), and Chhatrapati Shivaji Maharaj International Airport (Mumbai), and Pune Airport (Pune). These airports offer domestic and international flights, making travel to and from different parts of India convenient.</strong>
            </p>
          </SectionHighlight>
          <div className="container" style={{ marginBottom:12 }}>
            <p style={{ fontSize:12.5, fontWeight:600, color:'var(--g400)', letterSpacing:.5, textTransform:'uppercase', marginBottom:0 }}>Other Universities in West India</p>
          </div>
          <Carousel items={WEST_CAROUSEL} />
        </RegionSection>

        {/* ══════════════ SOUTH INDIA ══════════════ */}
        <RegionSection region="South India" accent="rgba(13,122,74,.7)">
          <SectionHighlight src="/gitam.png" alt="GITAM University, Visakhapatnam">
            <h3 style={{ fontFamily:'var(--serif)', fontSize:24, fontWeight:700, color:'var(--ink)', marginBottom:12, lineHeight:1.25 }}>GITAM University, Visakhapatnam</h3>
            <p style={{ fontSize:14, color:'var(--g600)', lineHeight:1.8 }}>
              GITAM University in Visakhapatnam (Andhra Pradesh) has the strongest Ugandan student presence in South India. Situated on the scenic Bay of Bengal coastline, GITAM offers world-class facilities in engineering, medicine, management, and the sciences — one of AUSI's founding university communities. Across the region, <strong style={{ color:'var(--ink)', fontWeight:600 }}>summers (March – June) are hot with coastal breezes easing temperatures of 30–40°C</strong>, while <strong style={{ color:'var(--ink)', fontWeight:600 }}>monsoon (July – September) brings heavy rainfall and high humidity</strong>; <strong style={{ color:'var(--ink)', fontWeight:600 }}>winters (November – February) are very mild at 18–30°C</strong> — a light layer is all you need. <strong style={{ color:'var(--ink)', fontWeight:600 }}>Food across South India is predominantly rice-based</strong> — daily meals of dosas, idlis, sambar, and coconut curries are served cheaply at campus canteens; expect bold spices. For getting around, <strong style={{ color:'var(--ink)', fontWeight:600 }}>auto-rickshaws are the go-to for short distances</strong> — always agree on a fare before boarding; <strong style={{ color:'var(--ink)', fontWeight:600 }}>Ola and Uber operate reliably</strong> across Visakhapatnam, Chennai, and Hyderabad.
            </p>
          </SectionHighlight>
          <div className="container" style={{ marginBottom:12 }}>
            <p style={{ fontSize:12.5, fontWeight:600, color:'var(--g400)', letterSpacing:.5, textTransform:'uppercase', marginBottom:0 }}>Other Universities in South India</p>
          </div>
          <Carousel items={SOUTH_CAROUSEL} />
        </RegionSection>

        {/* ══════════════ EAST INDIA ══════════════ */}
        <RegionSection region="East India" accent="rgba(29,93,200,.7)">
          <SectionHighlight src="/royal.png" alt="Royal Global University, Guwahati">
            <h3 style={{ fontFamily:'var(--serif)', fontSize:24, fontWeight:700, color:'var(--ink)', marginBottom:12, lineHeight:1.25 }}>Royal Global University, Guwahati</h3>
            <p style={{ fontSize:14, color:'var(--g600)', lineHeight:1.8 }}>
              Royal Global University in Guwahati, Assam is the primary AUSI hub for East India. Nestled in the lush landscapes of the Northeast, the university offers programmes across medicine, engineering, management, and the arts — with East India's biodiversity, culture, and lower cost of living making it a popular destination for Ugandan students. <strong style={{ color:'var(--ink)', fontWeight:600 }}>Summers (March – June) are hot and humid at 28–38°C</strong> — light clothing is essential; <strong style={{ color:'var(--ink)', fontWeight:600 }}>monsoon (July – September) is one of India's most intense</strong>, with heavy flooding in Assam and temperatures of <strong style={{ color:'var(--ink)', fontWeight:600 }}>24–32°C</strong> — a rain jacket is a must; <strong style={{ color:'var(--ink)', fontWeight:600 }}>winters (November – February) are pleasant at 10–25°C</strong>. <strong style={{ color:'var(--ink)', fontWeight:600 }}>Food in the Northeast is distinct</strong> — rice and fish curries are daily staples, and <strong style={{ color:'var(--ink)', fontWeight:600 }}>momos (dumplings) are a must-try</strong> at any local stall. For transport, <strong style={{ color:'var(--ink)', fontWeight:600 }}>auto-rickshaws and city buses are the norm</strong>; KIIT University in Bhubaneswar additionally runs <strong style={{ color:'var(--ink)', fontWeight:600 }}>dedicated campus shuttle services</strong> for students.
            </p>
          </SectionHighlight>
          <div className="container" style={{ marginBottom:12 }}>
            <p style={{ fontSize:12.5, fontWeight:600, color:'var(--g400)', letterSpacing:.5, textTransform:'uppercase', marginBottom:0 }}>Other Universities in East India</p>
          </div>
          <Carousel items={EAST_CAROUSEL} />
        </RegionSection>

        {/* ══════════════ NORTH INDIA ══════════════ */}
        <RegionSection region="North India" accent="rgba(168,32,43,.7)">
          <SectionHighlight src="/delhi.png" alt="Delhi University, New Delhi">
            <h3 style={{ fontFamily:'var(--serif)', fontSize:24, fontWeight:700, color:'var(--ink)', marginBottom:12, lineHeight:1.25 }}>Delhi University, New Delhi</h3>
            <p style={{ fontSize:14, color:'var(--g600)', lineHeight:1.8 }}>
              Delhi University is the anchor institution for AUSI's northern region and home to the Uganda High Commission — the most strategically important hub for Ugandan students in North India, with Embassy proximity making official documentation straightforward. Across North India, <strong style={{ color:'var(--ink)', fontWeight:600 }}>summers (March – June) are extremely hot</strong> with dry Loo winds; temperatures reach <strong style={{ color:'var(--ink)', fontWeight:600 }}>30–45°C in Delhi, 28–43°C in Punjab, and 28–42°C in Bhopal</strong> — stay hydrated. <strong style={{ color:'var(--ink)', fontWeight:600 }}>Monsoon (July – September)</strong> brings relief with moderate rain and <strong style={{ color:'var(--ink)', fontWeight:600 }}>24–35°C</strong>; <strong style={{ color:'var(--ink)', fontWeight:600 }}>winters (November – February) are cold with dense fog</strong>, dropping to <strong style={{ color:'var(--ink)', fontWeight:600 }}>5–22°C in Delhi and 4–20°C in Punjab</strong> — pack warm layers. <strong style={{ color:'var(--ink)', fontWeight:600 }}>Food is wheat-based</strong> — rotis, parathas, dal, and rich curries dominate; Delhi's street food scene (chole bhature, butter naan) is world-class and very affordable. For transport, <strong style={{ color:'var(--ink)', fontWeight:600 }}>Delhi Metro is the most convenient option</strong> connecting all major campuses; <strong style={{ color:'var(--ink)', fontWeight:600 }}>Ola and Uber run reliably</strong> in Delhi, Punjab, and Bhopal, and <strong style={{ color:'var(--ink)', fontWeight:600 }}>LPU operates its own campus bus network</strong>.
            </p>
          </SectionHighlight>
          <div className="container" style={{ marginBottom:12 }}>
            <p style={{ fontSize:12.5, fontWeight:600, color:'var(--g400)', letterSpacing:.5, textTransform:'uppercase', marginBottom:0 }}>Other Universities in North India</p>
          </div>
          <Carousel items={NORTH_CAROUSEL} />
        </RegionSection>

        {adminUnis.length > 0 && (
          <div>
            <div className="container" style={{ paddingTop:72, paddingBottom:28 }}>
              <div style={{ display:'flex', alignItems:'center', gap:12, marginBottom:8 }}>
                <div style={{ width:3, height:28, background:'var(--gold)', borderRadius:99 }} />
                <h2 className="h2" style={{ margin:0 }}>University Directory</h2>
              </div>
              <p style={{ fontSize:14.5, color:'var(--g600)', lineHeight:1.75, marginLeft:15, marginTop:6 }}>
                Additional universities added to the AUSI directory.
              </p>
            </div>
            {REGIONS_ORDER.filter(r => byRegion[r]).map(r => {
              const rc = REGION_DOT[r]
              const items = byRegion[r]
              return (
                <section key={r} style={{ paddingBottom:56, borderBottom:'1px solid var(--g100)' }}>
                  <div className="container">
                    <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:24 }}>
                      <div style={{ width:4, height:22, borderRadius:2, background:rc }} />
                      <h3 style={{ fontFamily:'var(--serif)', fontSize:22, fontWeight:700, color:'var(--ink)', margin:0 }}>{r}</h3>
                      <span style={{ fontSize:12.5, color:'var(--g400)', fontWeight:600 }}>{items.length} {items.length === 1 ? 'university' : 'universities'}</span>
                    </div>
                    {items[0] && (
                      <div style={{ background:`${rc}09`, border:`1px solid ${rc}22`, borderRadius:14, marginBottom:18, overflow:'hidden' }}>
                        <div style={{ display:'grid', gridTemplateColumns: items[0].imageUrl ? '1fr 1.2fr' : '1fr' }}>
                          {items[0].imageUrl && (
                            <div style={{ overflow:'hidden', maxHeight:280 }}>
                              <img src={items[0].imageUrl} alt={items[0].name} style={{ width:'100%', height:'100%', objectFit:'cover', display:'block' }} />
                            </div>
                          )}
                          <div style={{ padding:'28px 32px' }}>
                            <span style={{ fontSize:10.5, fontWeight:700, letterSpacing:1.8, textTransform:'uppercase', color:rc, display:'block', marginBottom:10 }}>Featured</span>
                            <h4 style={{ fontFamily:'var(--serif)', fontSize:22, fontWeight:700, color:'var(--ink)', margin:'0 0 6px', lineHeight:1.2 }}>{items[0].name}</h4>
                            <div style={{ fontSize:13, color:'var(--g500)', marginBottom:12 }}>{items[0].city}, {items[0].state}</div>
                            {items[0].description && (
                              <p style={{ fontSize:14, color:'var(--g600)', lineHeight:1.75, margin:'0 0 14px' }}>{items[0].description}</p>
                            )}
                            {items[0].fields?.length > 0 && (
                              <div style={{ display:'flex', gap:6, flexWrap:'wrap', marginBottom:14 }}>
                                {items[0].fields.map(f => (
                                  <span key={f} style={{ fontSize:11.5, padding:'3px 10px', background:'var(--white)', border:'1px solid var(--g100)', borderRadius:20, color:'var(--g600)' }}>{f}</span>
                                ))}
                              </div>
                            )}
                            {items[0].website && (
                              <a href={items[0].website} target="_blank" rel="noopener noreferrer"
                                style={{ fontSize:13, fontWeight:700, padding:'8px 18px', background:'var(--ink)', color:'#fff', textDecoration:'none', borderRadius:8, display:'inline-block' }}>
                                Visit Website →
                              </a>
                            )}
                          </div>
                        </div>
                      </div>
                    )}
                    {items.slice(1).length > 0 && (
                      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(260px,1fr))', gap:14 }}>
                        {items.slice(1).map(u => (
                          <div key={u.id} style={{ background:'var(--white)', border:'1px solid var(--g100)', borderRadius:14, overflow:'hidden' }}>
                            {u.imageUrl && (
                              <div style={{ height:140, overflow:'hidden', background:'#111' }}>
                                <img src={u.imageUrl} alt={u.name} style={{ width:'100%', height:'100%', objectFit:'cover', display:'block' }} />
                              </div>
                            )}
                            <div style={{ padding:'14px 18px' }}>
                              <h4 style={{ fontFamily:'var(--serif)', fontSize:15, fontWeight:700, color:'var(--ink)', margin:'0 0 4px', lineHeight:1.3 }}>{u.name}</h4>
                              <div style={{ fontSize:12.5, color:'var(--g500)', marginBottom: u.description ? 8 : 0 }}>{u.city}, {u.state}</div>
                              {u.description && (
                                <p style={{ fontSize:13, color:'var(--g600)', lineHeight:1.65, margin:0 }}>{u.description}</p>
                              )}
                            </div>
                            {u.website && (
                              <div style={{ padding:'0 18px 14px' }}>
                                <a href={u.website} target="_blank" rel="noopener noreferrer"
                                  style={{ fontSize:12.5, fontWeight:700, color:'var(--g500)', textDecoration:'none' }}>
                                  Visit →
                                </a>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </section>
              )
            })}
          </div>
        )}

      </div>

      <style>{`
        .car-outer { width:100%; background:#111; }
        .car-track { display:flex; overflow-x:auto; -webkit-overflow-scrolling:touch; scrollbar-width:none; -ms-overflow-style:none; height:10cm; cursor:grab; }
        .car-track::-webkit-scrollbar { display:none; }
        .car-track:active { cursor:grabbing; }
        .car-item { flex:0 0 100%; height:100%; position:relative; overflow:hidden; flex-shrink:0; }
        @media (min-width:600px)  { .car-item { flex:0 0 50%; } }
        @media (min-width:900px)  { .car-item { flex:0 0 33.333%; } }
        .car-caption { position:absolute; bottom:0; left:0; right:0; background:linear-gradient(to top,rgba(0,0,0,.88) 0%,rgba(0,0,0,.4) 60%,transparent 100%); padding:36px 16px 14px; opacity:0; transition:opacity .28s ease; white-space:pre-line; }
        .car-item:hover .car-caption { opacity:1; }
        .ev-highlight-grid { display:grid; grid-template-columns:1fr 1fr; gap:52px; align-items:start; }
        @media (max-width:860px)  { .ev-highlight-grid { grid-template-columns:1fr; gap:28px; } }
      `}</style>

    </div>
  )
}
