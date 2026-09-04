import { Link } from 'react-router-dom'
import './Home.css'

const MESSAGES = [
  {
    label: 'The Ambassador',
    photo: '/ambassador.png',
    name: 'H.E. Prof. Joyce Kikafunda',
    title: 'Ambassador of Uganda to India',
    message: 'To every Ugandan student studying in India — you carry with you the hopes and aspirations of our nation. India offers world-class education, and through AUSI, you have a community that stands behind you every step of the way. Embrace every opportunity, uphold your values, and remember that your success here is a contribution to Uganda\'s future. I am proud of the remarkable young people you are becoming, and I urge you to support one another, engage with AUSI fully, and make the most of this incredible chapter of your lives.',
  },
  {
    label: 'AUSI President',
    photo: '/president.png',
    name: 'Abaho Colleb',
    title: ' President, AUSI',
    message: 'A warm welcome to all our new members joining the Association of Ugandan Students in India (AUSI). We are delighted to have you as part of our family. May your time in India be filled with growth, success, and meaningful connections. To our continuing students, let us continue to uphold unity, respect, cooperation, and mutual support. Together, we are stronger, and through unity we can build an AUSI that represents and benefits every Ugandan student. United in purpose. Stronger together. 🇺🇬',
  },
]

const TESTIMONIALS = [
  { initials: 'PK', color: '#C9920A', quote: 'I was the only Ugandan in my year at DY Patil. AUSI meant I could find others at Symbiosis and Bharati Vidyapeeth just a few kilometres away. We meet monthly now.', name: 'Peter Kamya', role: 'DY Patil University, Pune · 2nd Year' },
  { initials: 'GA', color: '#A8202B', quote: 'As alumni in Nairobi, I filter mentees by the Karnataka universities I know — REVA, Manipal, Christ. It makes the guidance specific and genuinely useful.', name: 'Grace Atim', role: 'Alumni · Nairobi — formerly REVA University' },
  { initials: 'RO', color: '#1d5dc8', quote: 'Running the Delhi branch means coordinating across AIIMS, Jamia, and Amity. AUSI gives us one place to announce events and see who registered from each campus.', name: 'Ronald Opolot', role: 'Delhi Branch Coordinator · AIIMS' },
]

const PARTNERS = [
  { name: 'Uganda High Commission, New Delhi', logo: '/EMBASSYLOGO.png',     url: 'https://newdelhi.mofa.go.ug' },
  { name: 'Symbiosis International University',logo: '/SII.png',             url: 'https://www.siu.edu.in' },
  { name: 'ICCR India',                        logo: '/ICCR.png',            url: 'https://iccr.gov.in' },
  { name: 'RK University',                     logo: '/rklogo.png',          url: 'https://rku.ac.in' },
  { name: 'GITAM University',                  logo: '/GITAMLOGO.png',       url: 'https://www.gitam.edu' },
  { name: 'Marwadi University',                logo: '/marwadilogo.png',     url: 'https://www.marwadiuniversity.ac.in' },
  { name: 'Ministry of External Affairs India',logo: '/externalaffairs.png', url: 'https://www.mea.gov.in' },
  { name: 'India High Commission, Kampala',    logo: '/kampala.png',         url: 'https://hcikampala.gov.in/pages/MTQ3' },
  { name: 'Republic of Uganda',                logo: '/ug.png',              url: 'https://statehouse.go.ug' },
]

const UNIS = [
  'GITAM University','Andhra University','KL University','Marwadi University','RK University',
  'Parul University','Gujarat University','LPU','Graphic Era University','MATS University',
  'Kerala University','KIIT University','LNCT University','Pune University','Chandigarh University',
  'Mumbai University','Royal Global University','Delhi University','SRM University',
]

export default function Home() {
  return (
    <div className="home" style={{ paddingTop: 'var(--nav)' }}>

      {/* ── HERO ── */}
      <div className="page-hero">
        <div className="container">
          <h1>Connecting Ugandan Students Across Every Corner of India to the world.</h1>
          <p className="sub">Across India — AUSI is the official community, voice, and support network for every Ugandan student studying in India.</p>
          <div style={{ display:'flex', gap:12, flexWrap:'wrap', marginTop:22 }}>
            <Link to="/join" className="btn btn-gold">Join the Community</Link>
          </div>
          <div className="india-strip" style={{ marginTop:22 }}><span/><span/><span/></div>
        </div>
      </div>

      {/* ── ABOUT STRIP ── */}
      <section className="section">
        <div className="container">
          <div className="about-grid">
            <div>
              <h2 className="h2" style={{ marginBottom: 16 }}>
                The Voice of Ugandan Students — at Every University in India
              </h2>
              <p className="sub" style={{ marginBottom: 18 }}>
                The Association of Ugandan Students in India is the official representative body for Ugandans
                studying at institutions including <strong>GITAM University</strong>, <strong>KL University</strong>, <strong>Marwadi University</strong>, <strong>Andhra University</strong>, <strong>LPU</strong>, <strong>KIIT University</strong>, <strong>Chandigarh University</strong>, <strong>SRM University</strong>, and many other member universities spread across India.
              </p>
              <p className="sub" style={{ marginBottom: 32 }}>
                From <strong>Parul University</strong> and <strong>RK University</strong> to <strong>Delhi University</strong> and <strong>Royal Global University</strong> — no matter which campus you are on, AUSI is your community, bridging students across institutions and linking everyone to alumni, leadership, and the Uganda High Commission.
              </p>
              <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                <Link to="/about"      className="btn btn-primary">Read Our Story</Link>
                <Link to="/leadership" className="btn btn-outline">Meet Leadership</Link>
              </div>
            </div>
            <div>
              <div className="dark-card">
                <span className="eyebrow" style={{ color: 'rgba(255,255,255,.32)' }}>Vision &amp; Mission</span>
                <h3 style={{ fontFamily: 'var(--serif)', fontSize: 22, color: 'var(--gold-lt)', marginBottom: 14 }}>
                  Connect. Collaborate. Grow.
                </h3>
                <p style={{ fontSize: 13, color: 'rgba(255,255,255,.56)', lineHeight: 1.78, marginBottom: 12 }}>
                  <span style={{ color: 'rgba(255,255,255,.82)', fontWeight: 700 }}>Vision — </span>
                  To foster strong academic and cultural bonds between Uganda and India, galvanising social cohesion across borders.
                </p>
                <p style={{ fontSize: 13, color: 'rgba(255,255,255,.56)', lineHeight: 1.78 }}>
                  <span style={{ color: 'rgba(255,255,255,.82)', fontWeight: 700 }}>Mission — </span>
                  To provide a platform for Ugandan students in India to connect, collaborate, and grow academically, professionally, and culturally.
                </p>
              </div>
              {[
                ['Knowledge & Technology Transfer', 'Quality exchange programs sharing expertise across Uganda and India'],
                ['Uganda–India Partnership',        'Cementing the bond of brotherhood through collaboration in academics, business, sport, and culture'],
                ['Future Leaders',                  'Grooming tomorrow\'s professionals through internships, networking, and mentorship with UGBA and partner organisations'],
              ].map(([title, sub]) => (
                <div key={title} className="vpill">
                  <div><strong>{title}</strong><span>{sub}</span></div>
                </div>
              ))}
            </div>
          </div>

          {/* University ticker */}
          <div style={{ margin:'48px 0', padding:'20px 0', borderTop:'1px solid var(--g100)', borderBottom:'1px solid var(--g100)' }}>
            <div style={{ fontSize:10.5, fontWeight:700, letterSpacing:2, textTransform:'uppercase', color:'var(--g400)', marginBottom:14 }}>Some of Our Member Universities</div>
            <div className="uni-ticker">
              <div className="uni-ticker__track">
                {[...UNIS, ...UNIS].map((u, i) => (
                  <span key={i} className="uni-ticker__item">{u}</span>
                ))}
              </div>
            </div>
          </div>

          {/* Photos */}
          <div className="home-images-grid">
            {[
              { src:'/rk2.png', title:'Patron visit at RK University.', desc:'Students shared their experience and insights about their academic journey and well being at the Campus.' },
              { src:'/m4.png',  title:'Uganda Independence Day · 2023', desc:'Annual celebration, every 9th October — honoured by H.E. Prof. Joyce Kikafunda, Uganda\'s Ambassador to India, and broadcast on UBC and the Daily Monitor.' },
              { src:'/m1.png',  title:'Community & Cultural Pride',    desc:'Students showcase Ugandan cultural identity — events that preserve cultural heritage and strengthen the bonds that carry every student through their time in India.' },
            ].map(({ src, title, desc }) => (
              <div key={src}>
                <img src={src} alt={title} style={{ width:'100%', display:'block' }} />
                <div style={{ paddingTop:13 }}>
                  <div style={{ fontWeight:700, fontSize:13.5, marginBottom:5, color:'var(--ink)' }}>{title}</div>
                  <div style={{ fontSize:12.5, color:'var(--g600)', lineHeight:1.7 }}>{desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── A MESSAGE FROM ── */}
      <section style={{ background: 'var(--white)', padding: '64px 6vw' }}>
        <h2 className="h2" style={{ marginTop: 6, textAlign: 'center' }}>A Message From,</h2>
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


      {/* ── PARTNERS ── */}
      <section className="section-sm">
        <div className="container tc">
          <h2 className="h2" style={{ marginBottom: 8 }}>Useful Links</h2>
          <div className="p-grid">
            {PARTNERS.map(({ name, logo, url }) => (
              <a key={logo} href={url} target="_blank" rel="noopener noreferrer" title={name} style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', opacity: 0.85, transition: 'opacity .2s' }}
                onMouseEnter={e => e.currentTarget.style.opacity = 1}
                onMouseLeave={e => e.currentTarget.style.opacity = 0.85}>
                <img src={logo} alt={name} className="p-logo" />
              </a>
            ))}
          </div>
        </div>
      </section>

    </div>
  )
}
