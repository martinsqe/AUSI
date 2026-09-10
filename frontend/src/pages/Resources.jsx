import { useState, useEffect } from 'react'
import { lsGet, lsSet } from '../lib/syncedStore'

/* ── FAQ accordion item ── */
function FAQ({ q, a, open, onToggle }) {
  return (
    <div style={{ borderBottom:'1px solid var(--g100)' }}>
      <button
        onClick={onToggle}
        aria-expanded={open}
        style={{ width:'100%', display:'flex', justifyContent:'space-between', alignItems:'center', padding:'18px 0', background:'none', border:'none', cursor:'pointer', textAlign:'left', gap:16 }}
      >
        <span style={{ fontWeight:600, fontSize:14.5, color:'var(--ink)', lineHeight:1.45 }}>{q}</span>
        <span style={{
          fontSize:22, color:'var(--gold)', fontWeight:300, flexShrink:0, lineHeight:1,
          display:'inline-block', transition:'transform .25s ease',
          transform: open ? 'rotate(45deg)' : 'rotate(0deg)',
        }}>+</span>
      </button>
      <div style={{
        overflow:'hidden',
        maxHeight: open ? 600 : 0,
        transition:'max-height .32s ease',
      }}>
        <div style={{ paddingBottom:20, fontSize:14, color:'var(--g600)', lineHeight:1.78 }}>{a}</div>
      </div>
    </div>
  )
}

/* ── Step card for guide sections ── */
function StepCard({ num, title, body }) {
  return (
    <div style={{ display:'flex', gap:18, padding:'22px 24px', border:'1px solid var(--g100)', borderRadius:14, background:'var(--white)', alignItems:'start' }}>
      <div style={{ fontWeight:800, fontSize:18, color:'var(--ink)', flexShrink:0, fontFamily:'var(--serif)', minWidth:24, lineHeight:1.1, paddingTop:2 }}>{num}</div>
      <div>
        <div style={{ fontWeight:700, fontSize:14.5, color:'var(--ink)', marginBottom:5 }}>{title}</div>
        <div style={{ fontSize:13, color:'var(--g600)', lineHeight:1.7 }}>{body}</div>
      </div>
    </div>
  )
}

/* ── Guide category block ── */
function GuideBlock({ eyebrow, title, desc, accent, steps }) {
  return (
    <div style={{ marginBottom:56 }}>
      <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:6 }}>
        <div style={{ width:3, height:22, borderRadius:99, background:accent }} />
        <span style={{ fontSize:10.5, fontWeight:700, letterSpacing:2, textTransform:'uppercase', color:'var(--g400)' }}>{eyebrow}</span>
      </div>
      <h3 style={{ fontFamily:'var(--serif)', fontSize:22, fontWeight:700, color:'var(--ink)', marginBottom:8 }}>{title}</h3>
      <p style={{ fontSize:14, color:'var(--g500)', lineHeight:1.75, marginBottom:22, maxWidth:620 }}>{desc}</p>
      <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
        {steps.map((s, i) => <StepCard key={i} num={i+1} {...s} />)}
      </div>
    </div>
  )
}

const FAQS = [
  {
    q: 'How do I register with FRRO after arriving in India?',
    a: 'You must register at your nearest FRRO office (or online at indianfrro.gov.in) within 14 days of arrival. Bring your passport, visa, university admission letter, hostel/accommodation letter, and two passport photos. Your university\'s international student office can guide you through the process — reach out to any AUSI cabinet member if you need help.',
  },
  {
    q: 'What documents do I need to open a bank account in India?',
    a: 'Most Indian banks (SBI, HDFC, Canara) require: a valid passport with Indian visa, your university Student ID, an official admission/enrollment letter from your university, and a proof of address (hostel allotment letter or a letter from the international student office). Many universities have an SBI or Canara Bank branch on campus — visit them in your first week.',
  },
  {
    q: 'Can I extend my ICCR scholarship if my course takes longer than expected?',
    a: 'No. ICCR scholarships are fixed to the declared duration of your course. When the scholarship period ends, it is not automatically extended. Track your programme timeline carefully, and if you are repeating a year or extending your course, notify your university\'s international student office and the ICCR office immediately. AUSI can help you understand your options.',
  },
  {
    q: 'Can I work part-time on a student visa in India?',
    a: 'Generally no — Indian student visas (S-visa) do not permit employment. However, internships arranged as part of your academic programme (credited internships) may be possible. AUSI has been in discussion with companies and the Uganda High Commission about converting student visa provisions to allow internship participation. Reach out to any AUSI cabinet member for the latest update.',
  },
  {
    q: 'How do I find accommodation near my university?',
    a: 'Start by applying for on-campus hostel accommodation through your university\'s international student office — most universities reserve rooms for international students. If hostel space is unavailable, any AUSI cabinet member can connect you with senior Ugandan students near your campus who can guide you to nearby PG (paying guest) accommodation. Reach out to any cabinet member as soon as you receive your admission letter.',
  },
  {
    q: 'How do I renew my Indian student visa?',
    a: 'Student visa renewal is done through the FRRO. You will need your current passport, existing visa, enrollment/bonafide letter from your university, and proof of accommodation. Begin the process at least 60 days before your visa expires. AUSI recommends keeping a scanned copy of all your documents in a secure cloud folder. Any AUSI cabinet member can connect you with seniors who have gone through the process.',
  },
  {
    q: 'What should I do if I need to transfer to a different university in India?',
    a: 'A university transfer requires coordinating with your current and new universities, the FRRO (to update your registration), and — if you are on an ICCR scholarship — the ICCR office and the Uganda High Commission. AUSI can help you navigate these steps and connect you with the Education Attaché at the Uganda High Commission in New Delhi if needed.',
  },
  {
    q: 'How do I send money back to Uganda from India?',
    a: 'Once you have an Indian bank account, international wire transfers can be made to Ugandan bank accounts. You will need the recipient\'s bank name, account number, and SWIFT code. SBI and HDFC both support international transfers. Note that transfers above a certain threshold may require additional documentation. Some students also use services like Western Union or Wise (TransferWise) for smaller amounts.',
  },
  {
    q: 'How do I contact AUSI or report a problem at my university?',
    a: 'Reach out to any AUSI cabinet member — they are your first point of contact for any university-level issue. For serious concerns involving university administration, visa authorities, or welfare matters, AUSI can escalate to the Education Attaché at the Uganda High Commission. For urgent matters, the Uganda High Commission emergency line is also available.',
  },
  {
    q: 'What is the 75% attendance rule and why does it matter?',
    a: 'Indian universities generally require a minimum of 75% class attendance for students to sit exams and remain eligible for scholarships. Falling below this threshold can put your ICCR scholarship and enrollment status at risk. AUSI strongly advises all members to track their attendance every semester and raise concerns with their university early if attendance is at risk.',
  },
]

/* ── Resource item card (for admin-posted items) ── */
function ResourceCard({ item }) {
  return (
    <div style={{ marginTop:12, padding:'18px 20px', borderRadius:12, background:'var(--white)', border:'1px solid var(--g100)' }}>
      <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:8, flexWrap:'wrap' }}>
        {item.deadline && (
          <span style={{ fontSize:11.5, color:'var(--g500)' }}>
            Deadline: <strong>{new Date(item.deadline).toLocaleDateString('en-GB', { day:'numeric', month:'long', year:'numeric' })}</strong>
          </span>
        )}
        <span style={{ fontSize:11, color:'var(--g400)', marginLeft:'auto' }}>
          Posted {new Date(item.date).toLocaleDateString('en-GB', { day:'numeric', month:'short', year:'numeric' })}
        </span>
      </div>
      <div style={{ fontWeight:700, fontSize:14.5, color:'var(--ink)', marginBottom:6 }}>{item.title}</div>
      <div style={{ fontSize:13.5, color:'var(--g600)', lineHeight:1.7, marginBottom: item.link ? 12 : 0 }}>{item.description}</div>
      {item.link && (
        <a href={item.link} target="_blank" rel="noreferrer"
          style={{ display:'inline-block', fontSize:13, fontWeight:700, color:'#2563eb', textDecoration:'none', padding:'6px 14px', background:'rgba(37,99,235,.07)', borderRadius:7 }}>
          Apply / Learn more →
        </a>
      )}
    </div>
  )
}

/* ── Coming soon notice (fallback when nothing posted) ── */
function ComingSoon() {
  return (
    <div style={{ marginTop:12, padding:'20px 24px', borderRadius:12, background:'rgba(201,146,10,.07)', border:'1px dashed rgba(201,146,10,.45)' }}>
      <div style={{ fontWeight:700, fontSize:13.5, color:'var(--ink)', marginBottom:5 }}>Registration links coming soon</div>
      <div style={{ fontSize:13, color:'var(--g600)', lineHeight:1.68 }}>AUSI admins will post registration links here as opportunities become available. All members of the association will be notified and can register directly through this page.</div>
    </div>
  )
}

export default function Resources() {
  const [resources, setResources] = useState([])
  const [openFaq, setOpenFaq]     = useState(null)

  useEffect(() => {
    try {
      const stored = JSON.parse(lsGet('ausi_resources') || 'null')
      setResources(stored || [])
    } catch { setResources([]) }
  }, [])

  const scholarships  = resources.filter(r => r.type === 'Scholarship')
  const internships   = resources.filter(r => r.type === 'Internship')
  const opportunities = resources.filter(r => r.type === 'Opportunity')

  return (
    <div style={{ paddingTop:'var(--nav)' }}>

      <div className="page-hero">
        <div className="container">
          <span className="eyebrow">Student Support</span>
          <h1>Resources &amp; Opportunities</h1>
          <p className="sub">Everything you need — from settling in on day one to finding scholarships and internships as your studies progress.</p>
          <div className="india-strip"><span/><span/><span/></div>
        </div>
      </div>

      {/* Who this page is for */}
      <section style={{ background:'var(--off)', padding:'52px 0' }}>
        <div className="container">
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:28, maxWidth:900 }} className="res-intro-grid">
            <div style={{ background:'var(--white)', borderRadius:16, padding:'28px 30px', border:'1px solid var(--g100)' }}>
              <div style={{ fontSize:10.5, fontWeight:700, letterSpacing:2, textTransform:'uppercase', color:'var(--g400)', marginBottom:10 }}>Newly Admitted</div>
              <h3 style={{ fontFamily:'var(--serif)', fontSize:20, fontWeight:700, color:'var(--ink)', marginBottom:10, lineHeight:1.3 }}>Just arrived or starting soon?</h3>
              <p style={{ fontSize:13.5, color:'var(--g600)', lineHeight:1.75 }}>This page walks you through FRRO registration, opening a bank account, and finding accommodation near your campus — the three most critical steps when you first arrive in India.</p>
            </div>
            <div style={{ background:'var(--ink)', borderRadius:16, padding:'28px 30px', border:'1px solid var(--g100)' }}>
              <div style={{ fontSize:10.5, fontWeight:700, letterSpacing:2, textTransform:'uppercase', color:'rgba(255,255,255,.35)', marginBottom:10 }}>Senior Students</div>
              <h3 style={{ fontFamily:'var(--serif)', fontSize:20, fontWeight:700, color:'var(--gold-lt)', marginBottom:10, lineHeight:1.3 }}>Ready to grow further?</h3>
              <p style={{ fontSize:13.5, color:'rgba(255,255,255,.6)', lineHeight:1.75 }}>Explore ICCR scholarship renewal, the Aga Khan Foundation, and how AUSI facilitates internship placements — including visa provisions that make internships possible for foreign students.</p>
            </div>
          </div>
        </div>
      </section>

      {/* ── NEWLY ADMITTED STUDENTS ── */}
      <section className="section" style={{ borderTop:'1px solid var(--g100)' }}>
        <div className="container">
          <span className="eyebrow" style={{ marginBottom:8, display:'block' }}>Newly Admitted Students</span>
          <h2 className="h2" style={{ marginBottom:48 }}>Your First Steps in India</h2>

          <GuideBlock
            eyebrow="FRRO & Visa"
            accent="rgba(168,32,43,.6)"
            title="FRRO Registration & Visa Renewal"
            desc="Every international student in India must register with the Foreigners Regional Registration Office (FRRO) within 14 days of arrival. This is a legal requirement and must be renewed annually."
            steps={[
              { title:'Register within 14 days of arrival', body:'Visit indianfrro.gov.in or your nearest FRRO office. Ugandan students typically register in the city where their university is located — Pune, Bengaluru, Hyderabad, Visakhapatnam, or Delhi.' },
              { title:'Prepare your documents', body:'Bring your passport (original + copy), Indian student visa, university admission letter, hostel/accommodation proof, two passport-size photos, and a completed C-form from your accommodation provider.' },
              { title:'Update FRRO every year', body:'Your FRRO registration must be renewed annually. If you are on an ICCR scholarship, you must also notify the ICCR office of your renewal. Set a reminder at least 30 days before expiry.' },
              { title:'Renew your visa before it expires', body:'Student visa renewals are handled through the FRRO. Begin at least 60 days before expiry. You will need a bonafide/enrollment letter from your university and proof of continued accommodation.' },
            ]}
          />

          <GuideBlock
            eyebrow="Housing & Accommodation"
            accent="rgba(124,58,237,.6)"
            title="Finding Accommodation Near Your Campus"
            desc="Most universities reserve on-campus hostel space for international students. If you cannot secure hostel accommodation, any AUSI cabinet member can connect you with senior students who know the local area."
            steps={[
              { title:'Apply for on-campus hostel accommodation', body:'Contact your university\'s International Student Office as soon as you receive your admission letter. Most universities — including GITAM, KL University, Marwadi, RK and many others — offer dedicated international student hostels.' },
              { title:'Reach out to any AUSI cabinet member', body:'Any cabinet member can connect you with senior Ugandan students in your city who can guide you to nearby accommodation and help you avoid common pitfalls when renting off-campus.' },
              { title:'Know your rights as a tenant', body:'If you rent privately, always sign a formal rental agreement. Ensure it states the monthly rent, deposit amount, notice period, and maintenance terms. AUSI can share a rental checklist for international students in India.' },
              { title:'Plan before you arrive', body:'Many students arrange temporary accommodation (student guesthouses or short-term PG) for the first two weeks while looking for permanent housing. Any AUSI cabinet member can advise on safe, affordable options near your campus.' },
            ]}
          />

          <GuideBlock
            eyebrow="Finance & Banking"
            accent="rgba(13,122,74,.6)"
            title="Opening a Bank Account in India"
            desc="You will need an Indian bank account to receive your ICCR stipend, pay university fees, and manage day-to-day expenses. Open one in your first week — most universities have a bank branch on campus."
            steps={[
              { title:'Choose your bank', body:'IOB (India Overseas Bank), HDFC and Canara Bank all offer student accounts with no minimum balance requirement for international students. SBI and Canara Bank are recommended as they are widely available on or near most campuses.' },
              { title:'Gather your documents', body:'You will need: passport (original + copy), Indian student visa, university student ID, official admission/enrollment letter, and proof of address (your hostel allotment letter or a letter from the international student office).' },
              { title:'Visit the branch on or near campus', body:'Go to the bank branch within the first 5 days of arrival. Bring all original documents and photocopies. The process typically takes one visit and your account and ATM card will be ready within 3–5 working days.' },
              { title:'Link your account for ICCR stipend', body:'If you are on an ICCR scholarship, notify your university\'s scholarship coordinator of your account details so your monthly stipend is deposited correctly from the start.' },
            ]}
          />
        </div>
      </section>

      {/* ── SCHOLARSHIPS & INTERNSHIPS ── */}
      <section className="section" style={{ background:'var(--off)', borderTop:'1px solid var(--g100)' }}>
        <div className="container">
          <span className="eyebrow" style={{ marginBottom:8, display:'block' }}>For Senior Students</span>
          <h2 className="h2" style={{ marginBottom:14 }}>Scholarships &amp; Internships</h2>
          <p style={{ fontSize:15, color:'var(--g600)', lineHeight:1.8, maxWidth:660, marginBottom:48 }}>
            As you progress through your studies, AUSI can help you track scholarship, navigate internship placements, and connect with opportunities that build your career in both India and Uganda.
          </p>

          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:40, alignItems:'start' }} className="res-opp-grid">

            {/* Scholarships */}
            <div>
              <div style={{ fontWeight:700, fontSize:17, color:'var(--ink)', marginBottom:6, display:'flex', alignItems:'center', gap:8 }}>
                <span style={{ width:3, height:20, background:'rgba(201,146,10,.8)', borderRadius:99, display:'inline-block' }} />
                Scholarships
              </div>
              <p style={{ fontSize:13.5, color:'var(--g500)', lineHeight:1.7, marginBottom:4 }}>
                Baker Balunywa, Education Attaché at the Uganda High Commission, advises: <em>"Scholarships have their limits depending on the course you are studying. When it ends it will not be extended. Track the course you have studied."</em>
              </p>
              {scholarships.length > 0
                ? scholarships.map(item => <ResourceCard key={item.id} item={item} />)
                : <ComingSoon />}
            </div>

            {/* Internships */}
            <div>
              <div style={{ fontWeight:700, fontSize:17, color:'var(--ink)', marginBottom:6, display:'flex', alignItems:'center', gap:8 }}>
                <span style={{ width:3, height:20, background:'rgba(29,93,200,.7)', borderRadius:99, display:'inline-block' }} />
                Internships
              </div>
              <p style={{ fontSize:13.5, color:'var(--g500)', lineHeight:1.7, marginBottom:4 }}>
                One of AUSI's founding mandates is to ease internship placements. Baker Balunywa noted at the 2023 launch: <em>"We discussed with companies on the issue of internship, and they told us the student visa can be changed to another provision that can allow students to go for internship."</em>
              </p>
              {internships.length > 0
                ? internships.map(item => <ResourceCard key={item.id} item={item} />)
                : <ComingSoon />}
            </div>

          </div>

          {/* Other Opportunities (full-width, only shown when items exist) */}
          {opportunities.length > 0 && (
            <div style={{ marginTop:40 }}>
              <div style={{ fontWeight:700, fontSize:17, color:'var(--ink)', marginBottom:6, display:'flex', alignItems:'center', gap:8 }}>
                <span style={{ width:3, height:20, background:'rgba(5,150,105,.7)', borderRadius:99, display:'inline-block' }} />
                Other Opportunities
              </div>
              <p style={{ fontSize:13.5, color:'var(--g500)', lineHeight:1.7, marginBottom:4 }}>
                Additional opportunities — competitions, grants, programmes and more — posted by AUSI leadership.
              </p>
              <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(280px,1fr))', gap:14, marginTop:4 }}>
                {opportunities.map(item => <ResourceCard key={item.id} item={item} />)}
              </div>
            </div>
          )}
        </div>
      </section>

      {/* ── FAQs ── */}
      <section className="section" style={{ borderTop:'1px solid var(--g100)' }}>
        <div className="container" style={{ maxWidth:760 }}>
          <span className="eyebrow" style={{ marginBottom:8, display:'block' }}> FAQs</span>
          <h2 className="h2" style={{ marginBottom:10 }}>Frequently Asked Questions</h2>
          <div>
            {FAQS.map((f, i) => (
              <FAQ
                key={i}
                q={f.q}
                a={f.a}
                open={openFaq === i}
                onToggle={() => setOpenFaq(openFaq === i ? null : i)}
              />
            ))}
          </div>
          <div style={{ marginTop:40, padding:'24px 28px', background:'var(--off)', borderRadius:14, border:'1px solid var(--g100)' }}>
            <div style={{ fontWeight:700, fontSize:14, color:'var(--ink)', marginBottom:6 }}>Didn't find your answer?</div>
            <div style={{ fontSize:13.5, color:'var(--g600)', lineHeight:1.7 }}>Reach out to any AUSI cabinet member — they are Ugandan students who have been through the same process and can give you specific, practical guidance.</div>
          </div>
        </div>
      </section>

      <style>{`
        @media (max-width: 700px) {
          .res-intro-grid { grid-template-columns: 1fr !important; }
          .res-opp-grid   { grid-template-columns: 1fr !important; }
        }
      `}</style>

    </div>
  )
}
