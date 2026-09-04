
import { useEffect, useRef } from 'react'

/* ── Carousel — continuous RAF scroll, pauses on hover/touch, manual drag ── */
function Carousel({ items }) {
  const trackRef = useRef(null)
  const rafRef   = useRef(null)
  const paused   = useRef(false)
  const doubled  = [...items, ...items]

  useEffect(() => {
    const el = trackRef.current
    if (!el) return
    const tick = () => {
      if (!paused.current) {
        const half = el.scrollWidth / 2
        if (el.scrollLeft >= half) el.scrollLeft -= half
        el.scrollLeft += 0.7
      }
      rafRef.current = requestAnimationFrame(tick)
    }
    rafRef.current = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(rafRef.current)
  }, [])

  return (
    <div className="car-outer">
      <div
        ref={trackRef}
        className="car-track"
        onMouseEnter={() => { paused.current = true }}
        onMouseLeave={() => { paused.current = false }}
        onTouchStart={() => { paused.current = true }}
        onTouchEnd={()   => { paused.current = false }}
      >
        {doubled.map(({ src, caption }, i) => (
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

/* ── Shared highlight image + description ── */
function SectionHighlight({ src, alt, children }) {
  return (
    <div className="container" style={{ marginBottom:48 }}>
      <div className="ev-highlight-grid">
        <img src={src} alt={alt} style={{ width:'100%', display:'block', objectFit:'cover', objectPosition:'center' }} />
        <div>{children}</div>
      </div>
    </div>
  )
}

const INDEPENDENCE_CAROUSEL = [
  { src: '/i15.jpg', caption: 'Students Honouring the National Anthem' },
  { src: '/i16.jpg', caption: 'H.E. Prof. Joyce Kikafunda, Uganda\'s Ambassador to India, salute while raising the Uganda National Flag on Independence day of at Marwardi University 2024.' },
  { src: '/m4.png', caption: 'First Independence day organised by Ugandan Students at Marwardi University 2023.' },
  { src: '/63.png', caption: 'Uganda @ 63. RK university 2025. ' },
  { src: '/i2.png', caption: 'Our Patron Rajesh Chaplot addresses the audience at the Independence Day. Gitam University' },
  { src: '/i17.jpg',  caption: 'Singing of the Anthem.' },
  { src: '/m3.png', caption: 'Independence Cake cutting at Marwardi University' },
  { src: '/i11.png', caption: 'Pic of AUSI members with the ambassador' },
  { src: '/i14.jpg', caption: 'Marching to the ceremonial grounds with H.E. Prof. Joyce Kikafunda' },
  { src: '/i9.png',  caption: '' },
  { src: '/a2.png',  caption: 'The Ambassador gifts Asiimwe Moses one of her own books. at the Independence Day.' },
  { src: '/i5.png',  caption: 'Educational Attachee addresses the audience at the Independence Day.' },
  { src: '/a5.png',  caption: 'Pic after dinner with the ambassador.' },
  { src: '/i3.png',  caption: 'Tweheyo Reagan Former AUSI president recieves award.' },
]

const CULTURAL_CAROUSEL = [
  { src: '/i7.png', caption: 'Kadodi dance at Gitam University.' },
  { src: '/m1.png', caption: 'Showcase of Kiganda dance at Marwardi University.' },
  { src: '/m5.png', caption: 'Showcase of Kadodi dance at Marwardi University.' },
  { src: '/i6.png', caption: '' },

  { src: '/i8.png', caption: 'Cultural showcases ofUgandan music, dance, and tradition at Gitam university.' },
  { src: '/c1.png', caption: 'Cultural performance on Independence day at Gitam University.' },
]

const DELEGATES_CAROUSEL = [
  { src: '/d1.jpg', caption: 'Giving out of medals and certificates of patriotism to students by the prince.' },
  { src: '/d2.jpg', caption: 'Cake cutting with the prince at Out of the Box Rajkot.' },
  { src: '/d3.jpg', caption: 'Dinner with the prince.' },
  { src: '/d4.jpg', caption: 'Memory capture of AUSI members with the prince.' },
  { src: '/d5.jpg', caption: '' },
]

const NATIONAL_CAROUSEL = [
  { src: '/c8.jpg', caption: '' },
  { src: '/c2.jpg', caption: '' },
  { src: '/c6.jpg', caption: '' },
  { src: '/c4.jpg', caption: '' },
  { src: '/c9.jpg', caption: '' },
  { src: '/ac6.png', caption: '' },
  { src: '/ac2.png', caption: '' },
  { src: '/ac1.png', caption: '' },
  { src: '/c5.jpg', caption: '' },
]

const COMMUNITY_SERVICE_CAROUSEL = [
  { src: '/cs1.png', caption: '' },
  { src: '/cs2.png', caption: '' },
  { src: '/cs3.png', caption: '' },
  { src: '/cs4.png', caption: '' },
  { src: '/cs5.png', caption: '' },
  { src: '/c7.png',  caption: '' },
  { src: '/c8.png',  caption: '' },
  { src: '/c9.png',  caption: '' },
  { src: '/c10.png', caption: '' },
  { src: '/cs6.png', caption: '' },
]

const SPORTS_CAROUSEL = [
  { src: '/f4.jpg', caption: 'Team photo of excitment after emerging Runner-up in football competition at Marwadi University.' },
  { src: '/godfrey2.png', caption: 'Kyeyune Godfrey, emerged 3rd overall in a half Marathon organised at Racecource Rajkot 2024.' },
  { src: '/o3.png', caption: 'Okwapurt Victor repesenting Uganda at an international Chess competition.' },
  { src: '/k3.png', caption: 'Team photo at 2024 half marathon when kyeyune godfrey won 3rd position.' },
  { src: '/o1.png', caption: 'Victor getting his prize at the chess competition.' },
  { src: '/k5.png', caption: 'Godfrey receiving his award at the half marathon.' },
  { src: '/f9.jpg', caption: 'Football game at KL University' },
  { src: '/f5.jpg', caption: 'Team photo of excitment after emerging Runner-up in football competition at Marwadi University.' },
]

export default function Events() {
  return (
    <div style={{ paddingTop:'var(--nav)' }}>

      <div className="page-hero">
        <div className="container">
          <span className="eyebrow">Memorable Moments</span>
          <h1>Events &amp; Conventions</h1>
          <p className="sub">Celebrating Ugandan identity, academic excellence, and community spirit — everywhere in India.</p>
          <div className="india-strip"><span/><span/><span/></div>
        </div>
      </div>

      {/* Summary */}
      <section style={{ background:'var(--off)', padding:'52px 0' }}>
        <div className="container" style={{ maxWidth:800 }}>
          <h2 className="h2" style={{ marginBottom:16 }}>The Gatherings that bring AUSI together.</h2>
          <p style={{ fontSize:15, color:'var(--g600)', lineHeight:1.85 }}>
            Since its founding in November 2023, AUSI has brought Ugandan students across India together through national conventions, annual Independence Day galas, inter-university sports tournaments, high-level delegate visits, and rich cultural performances. Every event is a reminder that no matter which university you attend — across India — you are part of one community.
          </p>
        </div>
      </section>

      {/* ── INDEPENDENCE DAY ── */}
      <section className="section" style={{ borderTop:'1px solid var(--g100)' }}>
        <div className="container" style={{ marginBottom:36 }}>
          <span className="eyebrow" style={{ marginBottom:8, display:'block' }}>Independence Day Celebrations</span>
          <h2 className="h2" style={{ marginBottom:10 }}>9th October.</h2>
          <p style={{ fontSize:14, color:'var(--g500)', lineHeight:1.7, maxWidth:640 }}>
            On this day, AUSI unites Ugandan students across India for the national Independence Day gala — an event honoured by the Uganda Ambassador, broadcast on UBC Television, and attended by students from cities across India.
          </p>
        </div>
        <SectionHighlight src="/i10.png" alt="Uganda Independence Day — AUSI Community">
          <p style={{ fontSize:15, color:'var(--g700)', lineHeight:1.9, marginBottom:16 }}>
           AUSI brings together thousands of people, Ugandans and other nationalities from across India for the most anticipated event on the association's calendar. The annual celebrations are graced by <strong>H.E. Prof. Joyce Kikafunda</strong>, Uganda's Ambassador to India — a mark of the high standing AUSI holds within the Ugandan diplomatic community.
          </p>
          <p style={{ fontSize:15, color:'var(--g700)', lineHeight:1.9, marginBottom:16 }}>
            The evening brings together students from cities spanning the country — Bengaluru, Rajkot, Pune, Hyderabad, Visakhapatnam, and Delhi — dressed in traditional Ugandan attire, sharing food, music, and cultural performances that keep the spirit of home alive thousands of kilometres away.
          </p>
          <p style={{ fontSize:15, color:'var(--g700)', lineHeight:1.9 }}>
            The celebrations have been broadcast on <strong>UBC Television</strong> and covered by the <strong>Daily Monitor</strong> — placing AUSI's community on the national stage back home in Uganda. More than any other event, the Independence Day gala captures what AUSI stands for: unity, pride, and the enduring ties between Uganda and India.
          </p>
        </SectionHighlight>
        <Carousel items={INDEPENDENCE_CAROUSEL} />
      </section>

      {/* ── CULTURAL EVENTS ── */}
      <section className="section" style={{ borderTop:'1px solid var(--g100)' }}>
        <div className="container" style={{ marginBottom:36 }}>
          <span className="eyebrow" style={{ marginBottom:8, display:'block' }}>Cultural Events</span>
          <h2 className="h2" style={{ marginBottom:10 }}>Keeping Ugandan Identity Alive Across India</h2>
          <p style={{ fontSize:14, color:'var(--g500)', lineHeight:1.7, maxWidth:640 }}>
            From the Uganda Roadshow performances in Ahmedabad to cultural nights at member universities — AUSI keeps Ugandan heritage visible and celebrated on campuses across India.
          </p>
        </div>
        <SectionHighlight src="/a4.png" alt="Ahmedabad Cultural Presentation">
          <p style={{ fontSize:15, color:'var(--g700)', lineHeight:1.9, marginBottom:16 }}>
            The story of AUSI begins on a stage in <strong>Ahmedabad</strong>. In September 2023, eleven Ugandan students from <strong>Marwadi University</strong> were invited to perform at the Uganda Roadshow — a cultural showcase that brought Ugandan music, dance, and tradition before an audience of Indian dignitaries, business leaders, and academics.
          </p>
          <p style={{ fontSize:15, color:'var(--g700)', lineHeight:1.9, marginBottom:16 }}>
            It was after this performance that student leaders <strong>Moses Asiimwe, Nankya Racheal, and Okwaput Victor Israel</strong> met Patron <strong>Mr. Rajesh Chaplot</strong> and proposed founding a national student association. He offered his support on the spot — and AUSI was born from that cultural moment.
          </p>
          <p style={{ fontSize:15, color:'var(--g700)', lineHeight:1.9 }}>
            Since then, AUSI has continued to host cultural nights and performances at member universities across India — events that celebrate Ugandan identity, build community, and demonstrate to the wider Indian academic world the richness of the culture its students carry with them.
          </p>
        </SectionHighlight>
        <Carousel items={CULTURAL_CAROUSEL} />
      </section>

      {/* ── HOSTING OF DELEGATES ── */}
      <section className="section" style={{ borderTop:'1px solid var(--g100)' }}>
        <div className="container" style={{ marginBottom:36 }}>
          <span className="eyebrow" style={{ marginBottom:8, display:'block' }}>Hosting of Delegates</span>
          <h2 className="h2" style={{ marginBottom:10 }}>The Visit of Prince Henry Kayondo.</h2>
          <p style={{ fontSize:14, color:'var(--g500)', lineHeight:1.7, maxWidth:640 }}>Held at Out Of The Box · Rajkot, Gujarat.</p>
        </div>
        <SectionHighlight src="/d6.jpg" alt="Prince Henry Kayondo — Chief Guest, AUSI Rajkot">
          <p style={{ fontSize:15, color:'var(--g700)', lineHeight:1.9, marginBottom:16 }}>
            AUSI extends its deepest appreciation and formal recognition to our Chief Guest, <strong>Prince Henry Kayondo</strong>, and to <strong>Hon. Hajji Bisaso Abdul</strong> for honouring our invitation and engaging with Ugandan students at <strong>Out Of The Box, Rajkot, Gujarat</strong>.
          </p>
          <p style={{ fontSize:15, color:'var(--g700)', lineHeight:1.9, marginBottom:16 }}>
            It was a great privilege to host <strong>Prince Henry Kayondo</strong> as our Chief Guest. His presence, dignity, and words of wisdom greatly inspired our student community. His message on <em>unity, discipline, cultural identity, and purposeful growth</em> deeply resonated with students navigating life and studies abroad.
          </p>
          <p style={{ fontSize:15, color:'var(--g700)', lineHeight:1.9, marginBottom:16 }}>
            We are equally grateful to <strong>Hon. Hajji Bisaso Abdul</strong> for his encouragement and continued commitment to supporting young Ugandans beyond our borders. His engagement reaffirmed the importance of leadership, resilience, and staying connected to our nation's development journey.
          </p>
          <p style={{ fontSize:15, color:'var(--g700)', lineHeight:1.9 }}>
            As AUSI, we value such meaningful interactions that strengthen the bridge between students abroad and leaders at home. These engagements reinforce our commitment to <em>excellence, service, and responsible representation of Uganda</em> wherever we are.
          </p>
        </SectionHighlight>
        <Carousel items={DELEGATES_CAROUSEL} />
      </section>

      {/* ── SPORTS & RECREATION ── */}
      <section className="section" style={{ borderTop:'1px solid var(--g100)' }}>
        <div className="container" style={{ marginBottom:36 }}>
          <span className="eyebrow" style={{ marginBottom:8, display:'block' }}>Sports &amp; Recreation</span>
          <h2 className="h2" style={{ marginBottom:10 }}>Competing, Moving, and Standing Out</h2>
          <p style={{ fontSize:14, color:'var(--g500)', lineHeight:1.7, maxWidth:640 }}>
            Ugandan students in India don't just excel in the classroom — they stand out on the field, the court, and the stage. AUSI's sports and co-curricular programme reflects the full depth of talent within the community.
          </p>
        </div>
        <SectionHighlight src="/f1.jpg" alt="AUSI Sports — Ugandan Students in Action">
          <p style={{ fontSize:15, color:'var(--g700)', lineHeight:1.9, marginBottom:16 }}>
            Across Indian universities, Ugandan students have distinguished themselves not only academically but in <strong>sports, fitness, and co-curricular competitions</strong>. From football pitches in Hyderabad to basketball courts in Bengaluru, from chess tables in Pune to marathon tracks in Visakhapatnam — AUSI members compete with energy, discipline, and a drive to represent Uganda with honour.
          </p>
          <p style={{ fontSize:15, color:'var(--g700)', lineHeight:1.9, marginBottom:16 }}>
            AUSI members have participated in <strong>football tournaments, basketball competitions, chess competitions,</strong> and a <strong>community marathon</strong> — events that bring students from different universities together in a spirit of friendly rivalry and shared identity. These competitions build fitness, leadership, and friendships that outlast any single game.
          </p>
          <p style={{ fontSize:15, color:'var(--g700)', lineHeight:1.9 }}>
            Beyond organised AUSI events, individual members continue to stand out in their respective university sports programmes — winning trophies, earning recognition, and flying the Ugandan flag in every arena they enter. Sport, for AUSI, is not a pastime — it is an expression of the same excellence we bring to everything we do.
          </p>
        </SectionHighlight>
        <Carousel items={SPORTS_CAROUSEL} />
      </section>

      {/* ── NATIONAL CONVENTIONS ── */}
      <section className="section" style={{ borderTop:'1px solid var(--g100)' }}>
        <div className="container" style={{ marginBottom:36 }}>
          <h2 className="h2" style={{ marginBottom:10 }}>The AUSI Convetion.</h2>
          <p style={{ fontSize:14, color:'var(--g500)', lineHeight:1.7, maxWidth:640 }}>
            Annual national conventions, cabinet sessions, and the founding launch — the moments that set direction, inaugurate leadership, and celebrate how far AUSI has come.
          </p>
        </div>
        <SectionHighlight src="/ac4.png" alt="AUSI National Convention 2025">
          <p style={{ fontSize:15, color:'var(--g700)', lineHeight:1.9, marginBottom:16 }}>
            The <strong>2025 National Convention at GITAM University, Visakhapatnam</strong> marked a new high point — the first in-person national convention, bringing together Ugandan students from Bengaluru, Pune, Hyderabad, Visakhapatnam, and Delhi for three days of workshops, elections, and community building. Chief Guest <strong>Maj. Gen. Apollo Kasiita</strong> attended in an official capacity.
          </p>
          <p style={{ fontSize:15, color:'var(--g700)', lineHeight:1.9 }}>
            Conventions are where AUSI sets its direction — where leadership is inaugurated, where branches align on objectives, and where the full breadth of the Ugandan student community in India gathers under one roof. They are the clearest expression of what AUSI has built.
          </p>
        </SectionHighlight>
        <Carousel items={NATIONAL_CAROUSEL} />
      </section>

      {/* ── COMMUNITY SERVICE ── */}
      <section className="section" style={{ borderTop:'1px solid var(--g100)' }}>
        <div className="container" style={{ marginBottom:36 }}>
          <span className="eyebrow" style={{ marginBottom:8, display:'block' }}>Community Service</span>
          <h2 className="h2" style={{ marginBottom:10 }}>Serving the Communities that Host Us.</h2>
          <p style={{ fontSize:14, color:'var(--g500)', lineHeight:1.7, maxWidth:640 }}>
            AUSI students believe that being a guest in another country comes with a responsibility to give back. Through community service, we build bridges with the Indian communities that have opened their doors to us.
          </p>
        </div>
        <SectionHighlight src="/cs6.png" alt="AUSI Community Service — Riverside Cleanup Drive">
          <p style={{ fontSize:15, color:'var(--g700)', lineHeight:1.9, marginBottom:16 }}>
            Gratitude is not only expressed in words — it is demonstrated through action. AUSI students took to the outdoors for a <strong>riverside environmental cleanup drive</strong>, working alongside Indian students and local volunteers to clear plastic waste and litter from a natural waterway. Armed with gloves, masks, and collection bags, the team spread out along the riverbank — removing debris that had accumulated in the grass, water's edge, and surrounding green spaces.
          </p>
          <p style={{ fontSize:15, color:'var(--g700)', lineHeight:1.9, marginBottom:16 }}>
            The initiative brought together Ugandan and Indian students in a spirit of <strong>shared environmental responsibility</strong> — a reminder that the values of stewardship and respect for nature transcend borders. Students who compete on the sports field and collaborate in the classroom extended that same partnership to the environment around them.
          </p>
          <p style={{ fontSize:15, color:'var(--g700)', lineHeight:1.9 }}>
            For AUSI, community service is not a one-off gesture — it is part of who we are. We are guests in India, and we take that role seriously. By caring for the spaces around us, we demonstrate that Ugandan students are not only here to learn, but to <strong>contribute meaningfully</strong> to the communities that welcome them. This is what responsible representation looks like.
          </p>
        </SectionHighlight>
        <Carousel items={COMMUNITY_SERVICE_CAROUSEL} />
      </section>

      <style>{`
        /* ── Carousel ── */
        .car-outer { width: 100%; background: #111; }
        .car-track {
          display: flex;
          overflow-x: auto;
          -webkit-overflow-scrolling: touch;
          scrollbar-width: none;
          -ms-overflow-style: none;
          height: 10cm;
          cursor: grab;
        }
        .car-track::-webkit-scrollbar { display: none; }
        .car-track:active { cursor: grabbing; }

        .car-item {
          flex: 0 0 100%;
          height: 100%;
          position: relative;
          overflow: hidden;
          flex-shrink: 0;
        }
        @media (min-width: 600px) {
          .car-item { flex: 0 0 50%; }
        }
        @media (min-width: 900px) {
          .car-item { flex: 0 0 33.333%; }
        }

        .car-caption {
          position: absolute;
          bottom: 0; left: 0; right: 0;
          background: linear-gradient(to top, rgba(0,0,0,.88) 0%, rgba(0,0,0,.4) 60%, transparent 100%);
          padding: 36px 16px 14px;
          opacity: 0;
          transition: opacity 0.28s ease;
        }
        .car-item:hover .car-caption { opacity: 1; }

        /* ── Highlight grid ── */
        .ev-highlight-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 52px;
          align-items: center;
        }
        @media (max-width: 860px) {
          .ev-highlight-grid { grid-template-columns: 1fr; gap: 28px; }
        }
      `}</style>

    </div>
  )
}
