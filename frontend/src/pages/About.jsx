import { useState, useEffect, useRef } from 'react'

const ROADSHOW_IMAGES = ['/a1.png','/a3.png','/a4.png','/a6.png']

function Carousel({ images }) {
  const [idx, setIdx] = useState(0)
  const [perView, setPerView] = useState(1)
  const containerRef = useRef(null)
  const N = images.length
  const maxIdx = N - perView   // last valid start position

  /* watch container width to decide how many images show at once */
  useEffect(() => {
    const el = containerRef.current
    if (!el) return
    const ro = new ResizeObserver(([e]) => {
      setPerView(e.contentRect.width >= 700 ? 3 : 1)
    })
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  /* reset to 0 whenever perView changes to avoid out-of-range index */
  useEffect(() => { setIdx(0) }, [perView])

  /* auto-advance every 3 s, respecting maxIdx */
  useEffect(() => {
    const t = setInterval(() => setIdx(i => (i >= maxIdx ? 0 : i + 1)), 3000)
    return () => clearInterval(t)
  }, [maxIdx])

  /* ── layout math ──
     Track is (N/perView × 100)% wide so each item fills exactly 1/perView of container.
     translateX is expressed as % of the track itself:
       1 item shift = containerWidth/perView  = trackWidth/N
       So shift for idx = idx/N × 100% of track                          */
  const trackW  = `${(N / perView) * 100}%`
  const itemW   = `${100 / N}%`            /* % of track = 1 item */
  const shiftPct = idx * (100 / N)          /* % of track to shift */

  const positions = maxIdx + 1  /* number of dot indicators */

  return (
    <div ref={containerRef} style={{ width:'100%', height:'10cm', overflow:'hidden', position:'relative', background:'#111' }}>
      <div style={{
        display: 'flex', height: '100%',
        width: trackW,
        transform: `translateX(-${shiftPct}%)`,
        transition: 'transform 0.55s ease',
      }}>
        {images.map(src => (
          <div key={src} style={{ flex: `0 0 ${itemW}`, height: '100%' }}>
            <img src={src} alt="Uganda Roadshow Ahmedabad"
              style={{ width:'100%', height:'100%', objectFit:'cover', objectPosition:'center', display:'block' }} />
          </div>
        ))}
      </div>

      {/* dot / position indicators */}
      <div style={{ position:'absolute', bottom:14, left:'50%', transform:'translateX(-50%)', display:'flex', gap:6, zIndex:2 }}>
        {Array.from({ length: positions }, (_, i) => (
          <button key={i} onClick={() => setIdx(i)}
            style={{ width: i===idx ? 22 : 8, height:8, borderRadius:4,
              background: i===idx ? '#fff' : 'rgba(255,255,255,.45)',
              border:'none', cursor:'pointer', padding:0, transition:'all .3s', flexShrink:0 }} />
        ))}
      </div>
    </div>
  )
}

const TIMELINE = [
  {
    year: '2023', dot: '23',
    milestones: [
      { title: 'The Ahmedabad Spark',      desc: 'Eleven Ugandan students from Marwadi University performed at the Uganda Roadshow in Ahmedabad. Leaders Moses Asiimwe, Nankya Racheal, and Okwaput Victor Israel met Mr. Rajesh Chaplot and proposed founding a national student association — he offered his full support on the spot.' },
      { title: "Ambassador's Endorsement", desc: "The founding team met H.E. Prof. Joyce Kikafunda, Uganda's Ambassador to India. After discussing the challenges facing Ugandan students, the Ambassador embraced the initiative and pledged her full institutional backing." },
      { title: 'AUSI Officially Launched', desc: 'On 2nd November 2023, AUSI launched on Google Meet with over 150 Ugandan students in attendance, alongside representatives from the Kenyan and Nigerian Student Associations. Guest of Honour: Mr. Baker Balunywa (Education Attaché); Guest Speaker: Mr. Rajesh Chaplot (Patron).' },
    ],
  },
  {
    year: '2024', dot: '24',
    milestones: [
      { title: 'Logo, T-shirts & Independence Day', desc: 'Under President Ssebadduka Derrick, AUSI received its official logo, launched a T-shirt campaign, and organised the first Uganda Independence Day celebrations — honoured by H.E. Prof. Joyce Kikafunda and broadcast on UBC and the Daily Monitor.' },
    ],
  },
  {
    year: '2025', dot: '25',
    milestones: [
      { title: 'National Convention — GITAM University', desc: 'The landmark AUSI Convention at GITAM University, Visakhapatnam united Ugandan students from across India. Chief Guest was Maj. Gen. Apollo Kasiita, Director for Citizenship & Emigration Control, Ministry of Internal Affairs.' },
      { title: 'Uganda Global Forum & Alumni Network',   desc: 'Under President Reagan, AUSI joined the Uganda Global Forum — a network of Ugandan diaspora organisations in 30+ countries — and the India–Uganda Alumni Association was founded to support graduates after completing studies in India.' },
    ],
  },
  {
    year: '2026', dot: '26',
    milestones: [
      { title: 'Digital Platform ', desc: "The AUSI platform/website launches and the 2026/27 cabinet is inaugurated, marking a new milestone in the association's growth and digital reach." },
    ],
  },
]

const MESSAGES = [
  {
    label: 'Education Attaché',
    photo: '/attachee.png',
    name: 'Mr. Baker Balunywa',
    title: 'Education Attaché, Uganda High Commission',
    message: 'Education is the most powerful investment a nation can make, and every Ugandan student in India is proof of that commitment. I have watched AUSI grow from a small gathering into a structured, purposeful association that truly serves its members. My message to you is to take your studies seriously, build meaningful relationships, and remain connected to AUSI. The High Commission is here to support you, and AUSI is the bridge that makes that support reach every campus across India. You are not alone — lean on this community.',
  },
  {
    label: 'The Patron',
    photo: '/patron.png',
    name: 'Mr. Rajesh Chaplot',
    title: 'Patron, AUSI',
    message: 'All Ugandan students who are studying in India , you are an Ambassador of Uganda in India.  See that while you have fun , tourism and study in India , you also market uganda and Africa in India . Remove the wrong conception about Africa in this part of the world. To all  Ugandan Students planning to study in India , Please  take help of the AUSI and thier team to guide you as which Indian University to choose , does and dont’s in India . Do not get trapped with wrong agents who may misguide you . To all Ugandan students who have studied in India , you all are Ambassadors of India . Guide the new comers as Alumini of AUSI . Leverage your knowledge and network in India in your business and profession. Long live AUSI.',
  },
  ]

const PIONEERS = [
  { photo: '/moses.png',   name: 'Asiimwe Moses',          role: 'President',          uni: 'Marwadi University' },
  { photo: '/lucky.png',   name: 'Lucky Nicholus',         role: 'Vice President',     uni: 'KL University' },
  { photo: '/victor1.png', name: 'Okwaput Israel Victor',  role: 'Speaker',            uni: 'Marwadi University' },
  { photo: '/susan.png',   name: 'Nakate Susan',                  role: 'Secretary',          uni: 'Sharda University' },
  { photo: '/derrick.png', name: 'Ssebadduka Derrick',     role: 'Treasurer',          uni: 'KL University' },
  { photo: '/david.png',   name: 'Masette David',          role: 'Coordinator',        uni: 'RK University' },
  { photo: '/racheal.png', name: 'Nankya Racheal Edith',  role: 'Coordinator',        uni: 'Marwadi University' },
  { photo: '/abdul.png',   name: 'Kibirige Abdulrahman',         role: 'Coordinator',        uni: 'MMDU' },
  { photo: '/samuel.png',  name: 'Samuel Ocen',                 role: 'Coordinator',        uni: 'Lovely Professional University' },
]

export default function About() {
  return (
    <div style={{ paddingTop: 'var(--nav)' }}>
      <div className="page-hero">
        <div className="container">
          <span className="eyebrow">Who We Are</span>
          <h1>About AUSI</h1>
          <p className="sub">The Association of Ugandan Students in India — uniting, connecting and ensuring the well being of all students willing to study or already studying in India.</p>
          <div className="india-strip"><span/><span/><span/></div>
        </div>
      </div>

      {/* Story + Timeline */}
      <section className="section">
        <div className="container">
          <div className="about-story-grid">
            <div>
              <span className="eyebrow">Our Story</span>
              <h2 className="h2" style={{ marginBottom: 18 }}>Built from the Ground Up — For Every Ugandan in India</h2>
              <p className="sub-sm" style={{ marginBottom: 14 }}>AUSI was born at a Uganda Roadshow in Ahmedabad, where eleven Ugandan students from Marwadi University were invited to perform. After the event, student leaders <strong>Moses Asiimwe, Nankya Racheal, and Okwaput Victor Israel</strong> met <strong>Mr. Rajesh Chaplot</strong> who propsed the formation of the association for all Ugandan students in India. He offered his full support immediately.</p>
              <p className="sub-sm" style={{ marginBottom: 14 }}>The founding team then met <strong>H.E. Prof. Joyce Kikafunda</strong>, Uganda's Ambassador to India, who embraced the idea and pledged her backing. They mobilised student leaders from universities across the country, formed an interim executive committee, and launched AUSI on <strong>2nd November 2023</strong> via Google Meet — attended by over 150 students alongside representatives from the Kenyan and Nigerian Student Associations.</p>
              <p className="sub-sm">Today AUSI is present at 25+ universities across five cities — uniting Ugandan students from Bengaluru to Delhi, creating pathways for academic excellence, professional development, and cultural exchange that cement the enduring bonds between Uganda and India.</p>
              <img src="/ac6.png" alt="AUSI Convention" style={{ width:'100%', display:'block', marginTop:28, objectFit:'cover' }} />
              <p style={{ fontSize:11.5, color:'var(--g400)', marginTop:8, lineHeight:1.5 }}>AUSI National Convention · GITAM University, Visakhapatnam 2025 — Ugandan students from across India gathered for the landmark event, hosted in the presence of Maj. Gen. Apollo Kasiita.</p>
            </div>

            <div>
              <span className="eyebrow" style={{ marginBottom: 20, display: 'block' }}>Milestones</span>
              {TIMELINE.map(({ year, dot, milestones }, yi) => (
                <div key={year} style={{ display: 'flex', gap: 18, paddingBottom: yi < TIMELINE.length - 1 ? 32 : 0, position: 'relative' }}>
                  {yi < TIMELINE.length - 1 && (
                    <div style={{ position: 'absolute', left: 15, top: 34, bottom: 0, width: 1, background: 'var(--g200)' }} />
                  )}
                  <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'var(--ink)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, color: 'var(--gold-lt)', fontWeight: 700, fontFamily: 'var(--serif)', flexShrink: 0, zIndex: 1 }}>{dot}</div>
                  <div style={{ flex: 1, paddingTop: 4 }}>
                    <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--gold)', letterSpacing: 1, textTransform: 'uppercase', marginBottom: 10 }}>{year}</div>
                    {milestones.map((item, ii) => (
                      <div key={item.title} style={{ marginBottom: ii < milestones.length - 1 ? 18 : 0 }}>
                        <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 3 }}>{item.title}</div>
                        <div style={{ fontSize: 13, color: 'var(--g600)', lineHeight: 1.62 }}>{item.desc}</div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Key Moments Gallery */}
      <section style={{ background: 'var(--off)', paddingTop: 64, paddingBottom: 64 }}>
        <div className="container" style={{ marginBottom: 24 }}>
          <span className="eyebrow" style={{ marginBottom: 8, display: 'block' }}>In Pictures</span>
          <h2 className="h2" style={{ marginBottom: 6 }}>Key Moments</h2>
          <div style={{ fontSize: 10.5, fontWeight: 700, letterSpacing: 2, textTransform: 'uppercase', color: 'var(--g400)', marginTop: 16 }}>Uganda Roadshow · Ahmedabad 2023</div>
        </div>
        <Carousel images={ROADSHOW_IMAGES} />
      </section>

      {/* A message from */}
      <section style={{ background: 'var(--white)', padding: '64px 6vw' }}>
        <div style={{ textAlign: 'center', marginBottom: 8 }}>
          <h2 className="h2" style={{ marginTop: 6 }}>A Message From,</h2>
        </div>
        <div className="msg-row">
          {MESSAGES.map(({ photo, name, title, message }) => (
            <div key={name}>
              <div className="msg-photo"><img src={photo} alt={name} /></div>
              <div className="msg-body__name">{name}</div>
              <div className="msg-body__title">{title}</div>
              <p className="msg-body__text">"{message}"</p>
              <div className="msg-clear" />
            </div>
          ))}
        </div>
      </section>

      {/* Pioneers */}
      <section className="section" style={{ overflow: 'hidden' }}>
        <div className="container" style={{ marginBottom: 40 }}>
          <h2 className="h2">The Pioneers of AUSI</h2>
        </div>
        <div style={{ display: 'flex', overflowX: 'auto', gap: 0, scrollSnapType: 'x mandatory', WebkitOverflowScrolling: 'touch', scrollbarWidth: 'none', paddingBottom: 8 }}>
          {PIONEERS.map(p => (
            <div key={p.name} style={{ flexShrink: 0, width: 200, scrollSnapAlign: 'start', display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '0 20px 24px', textAlign: 'center' }}>
              {p.photo
                ? <img src={p.photo} alt={p.name} style={{ width: 120, height: 120, borderRadius: '50%', objectFit: 'cover', objectPosition: 'center top', display: 'block', marginBottom: 16, border: '1px solid var(--g100)' }} />
                : <div style={{ width: 120, height: 120, borderRadius: '50%', background: p.color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 34, fontWeight: 800, color: p.textColor, fontFamily: 'var(--serif)', marginBottom: 16, border: '1px solid var(--g100)', flexShrink: 0 }}>{p.initials}</div>
              }
              <div style={{ fontWeight: 700, fontSize: 14, color: 'var(--ink)', lineHeight: 1.25, marginBottom: 3 }}>{p.name}</div>
              <div style={{ fontSize: 12, color: 'var(--ink)', fontWeight: 600, lineHeight: 1.4, marginBottom: 2 }}>{p.role}</div>
              <div style={{ fontSize: 11, color: 'var(--ink)', lineHeight: 1.4 }}>{p.uni}</div>
            </div>
          ))}
        </div>
      </section>

      <style>{`
        .about-story-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 64px;
          align-items: start;
        }
        @media (max-width: 700px) {
          .about-story-grid {
            grid-template-columns: 1fr;
            gap: 40px;
          }
        }
      `}</style>
    </div>
  )
}
