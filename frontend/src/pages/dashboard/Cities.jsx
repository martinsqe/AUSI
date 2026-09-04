const CITIES = [
  {
    city: 'Rajkot',
    state: 'Gujarat',
    region: 'West India',
    flag: '🏛️',
    climate: 'Hot semi-arid. Summers 40°C+, mild winters (15–25°C). Monsoon Jun–Sep.',
    food: 'Vegetarian-heavy Gujarati cuisine. Thali (₹80–150), farsan snacks, dhokla, dabeli. Halal options and African food available near student hubs.',
    transport: 'Auto-rickshaws (negotiate or use meter). Ola/Uber active. City buses cheap at ₹10–15. University buses within RKU/Marwadi campuses.',
    universities: ['RK University', 'Marwadi University', 'Saurashtra University'],
    costOfLiving: '₹8,000–12,000/month',
    ugandanStudents: 'Large community (300+)',
    tips: 'Join the AUSI Rajkot WhatsApp group immediately. The AUSI Rep at RKU is your first contact.',
  },
  {
    city: 'Visakhapatnam',
    state: 'Andhra Pradesh',
    region: 'South India',
    flag: '🌊',
    climate: 'Tropical. Hot summers (35–42°C), monsoon Jun–Oct, mild winters. Coastal humidity year-round.',
    food: 'Rice-based Andhra cuisine — spicy curries, pesarattu, pulihora. Dosas and idlis widely available. Seafood is fresh and inexpensive near the coast.',
    transport: 'Auto-rickshaws (minimum ₹30 + meter). APSRTC city buses. Ola/Uber available in most areas. GITAM campus has internal shuttle buses.',
    universities: ['GITAM University', 'Andhra University', 'MVGR College'],
    costOfLiving: '₹9,000–14,000/month',
    ugandanStudents: 'Medium community (100+)',
    tips: 'Vizag is a coastal city — beach living is a bonus! The GITAM International Office is very supportive.',
  },
  {
    city: 'Bhubaneswar',
    state: 'Odisha',
    region: 'East India',
    flag: '🏯',
    climate: 'Tropical wet. Summers 35–42°C, heavy monsoon Jun–Sep, mild winters. Very humid.',
    food: 'Rice and fish curry staples. Dalma (lentils), pakhala (water rice), and chhena sweets. Momos from street stalls are must-try. Affordable eating out at ₹60–120 per meal.',
    transport: 'Auto-rickshaws and e-rickshaws throughout the city. KIIT campus has shuttle buses between campuses. Ola/Uber active. KIIT Metro area well-connected.',
    universities: ['KIIT University', 'ITER', 'Xavier University'],
    costOfLiving: '₹8,000–13,000/month',
    ugandanStudents: 'Medium community (80+)',
    tips: 'KIIT has a dedicated International Student Office. The Ugandan student community is active here.',
  },
  {
    city: 'New Delhi / NCR',
    state: 'Delhi',
    region: 'North India',
    flag: '🏙️',
    climate: 'Semi-arid. Extreme summers (45°C), cold winters (3–15°C), short monsoon. Fog in Dec–Jan.',
    food: 'Wheat-based North Indian food — rotis, parathas, chole bhature, biryani. Very diverse food scene with African restaurants. Street food abundant at ₹40–100.',
    transport: 'Delhi Metro is extensive (₹10–60 per ride). DTC buses city-wide. Ola/Uber/rapido widely available. Avoid autos at night in unfamiliar areas.',
    universities: ['AIIMS New Delhi', 'University of Delhi', 'Jamia Millia Islamia', 'IP University'],
    costOfLiving: '₹12,000–20,000/month',
    ugandanStudents: 'Large community (200+)',
    tips: 'Download the Delhi Metro app. Register at the Uganda High Commission in Vasant Vihar as soon as you arrive.',
  },
  {
    city: 'Phagwara / Jalandhar',
    state: 'Punjab',
    region: 'North India',
    flag: '🌾',
    climate: 'Semi-arid continental. Hot summers (40°C+), cold winters (3–10°C), short monsoon.',
    food: 'Punjabi cuisine — parathas with makhan, sarson da saag, lassi, tandoori everything. Very filling and affordable. Dhabas (roadside restaurants) are best value.',
    transport: 'LPU campus is self-contained with internal buses. City buses and autos to Phagwara/Jalandhar town. Chandigarh (1.5hr) accessible by bus.',
    universities: ['Lovely Professional University (LPU)', 'DAV University'],
    costOfLiving: '₹9,000–13,000/month',
    ugandanStudents: 'Very large community (400+)',
    tips: 'LPU has one of the largest African student populations in India. AUSI has a strong presence here.',
  },
  {
    city: 'Pune',
    state: 'Maharashtra',
    region: 'West India',
    flag: '🎓',
    climate: 'Tropical monsoon. Pleasant year-round (20–32°C). Monsoon Jun–Sep. Generally comfortable.',
    food: 'Maharashtrian food — vada pav, misal pav, poha. Also very cosmopolitan with all cuisines available. Good options near Viman Nagar, Koregaon Park.',
    transport: 'PMPML city buses (₹10–30). Ola/Uber very active. Metro expanding. Autos are metered (minimum ₹20). Cycling lanes near campuses.',
    universities: ['Symbiosis International', 'MIT College', 'COEP', 'Savitribai Phule Pune University'],
    costOfLiving: '₹12,000–18,000/month',
    ugandanStudents: 'Small–Medium community',
    tips: 'Pune is India\'s education city. Very international and student-friendly environment.',
  },
  {
    city: 'Chennai',
    state: 'Tamil Nadu',
    region: 'South India',
    flag: '🌴',
    climate: 'Tropical wet and dry. Hot and humid year-round (25–40°C). Heavy monsoon Oct–Dec (Northeast monsoon).',
    food: 'South Indian staples — rice, sambar, rasam, curd rice, filter coffee. Coconut in most dishes. Dosas and idlis are daily staples. Halal food available.',
    transport: 'Chennai Metro (₹15–60). MTC buses city-wide (₹5–25). Auto-rickshaws widely available (negotiate or use app). Suburban trains useful for certain routes.',
    universities: ['SRM Institute', 'VIT Chennai', 'Anna University', 'Madras Medical College'],
    costOfLiving: '₹10,000–16,000/month',
    ugandanStudents: 'Small–Medium community',
    tips: 'The summer heat (March–June) is intense — buy a good fan or AC room. Tamil is the primary local language.',
  },
  {
    city: 'Guwahati',
    state: 'Assam',
    region: 'East India',
    flag: '🏔️',
    climate: 'Subtropical. Warm summers (28–35°C), mild winters (10–18°C), heavy monsoon May–Sep.',
    food: 'Rice and fish-based Assamese cuisine — masor tenga (sour fish curry), duck meat dishes, bamboo shoot preparations. Tea from Assam is world-famous.',
    transport: 'City buses and autos available. Royal Global University area has limited public transport — taxis recommended. Guwahati is the gateway to Northeast India.',
    universities: ['Royal Global University', 'Gauhati University', 'Assam Down Town University'],
    costOfLiving: '₹7,000–11,000/month',
    ugandanStudents: 'Small community',
    tips: 'Northeast India is scenic and peaceful. Good for students who prefer a quieter, lower cost city.',
  },
]

export default function Cities() {
  return (
    <div style={{ background: 'var(--off)', minHeight: '100vh' }}>

      {/* Header */}
      <div style={{ background: 'linear-gradient(160deg,#111118 0%,#1a1200 100%)', padding: '36px 0 32px', color: '#fff' }}>
        <div className="container">
          <img src="/logo.png" alt="AUSI" style={{ width:42, height:42, borderRadius:'50%', objectFit:'cover', display:'block', marginBottom:12 }} />
          <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 2.2, textTransform: 'uppercase', color: 'rgba(255,255,255,.35)', marginBottom: 8 }}>
            AUSI · 2026 / 27
          </div>
          <h1 style={{ fontFamily: 'var(--serif)', fontSize: 'clamp(22px,3vw,30px)', fontWeight: 700, color: '#fff', margin: '0 0 6px' }}>
            Cities &amp; States
          </h1>
          <p style={{ fontSize: 13.5, color: 'rgba(255,255,255,.4)', margin: 0 }}>
            City guides for Ugandan students — food, transport, cost of living, and local tips
          </p>
        </div>
      </div>

      <div className="container" style={{ paddingTop: 36, paddingBottom: 64 }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          {CITIES.map(c => (
            <div key={c.city} style={{ background: 'var(--white)', border: '1px solid var(--g100)', borderRadius: 16, overflow: 'hidden' }}>
              {/* City header */}
              <div style={{ padding: '22px 28px', borderBottom: '1px solid var(--g100)', background: 'var(--off)', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                  <div>
                    <h2 style={{ fontFamily: 'var(--serif)', fontSize: 20, fontWeight: 800, color: 'var(--ink)', margin: '0 0 3px' }}>{c.city}</h2>
                    <div style={{ fontSize: 13, color: 'var(--g500)' }}>{c.state} · {c.region}</div>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  <span style={{ fontSize: 11.5, fontWeight: 700, padding: '4px 12px', background: 'rgba(201,146,10,.08)', color: '#92400e', borderRadius: 4 }}>
                    {c.costOfLiving}/mo
                  </span>
                  <span style={{ fontSize: 11.5, fontWeight: 700, padding: '4px 12px', background: 'rgba(37,99,235,.08)', color: '#1d4ed8', borderRadius: 4 }}>
                    {c.ugandanStudents}
                  </span>
                </div>
              </div>

              {/* Details */}
              <div style={{ padding: '22px 28px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(280px,1fr))', gap: 20, marginBottom: 20 }}>
                  {[
                    { label: 'Climate', text: c.climate },
                    { label: 'Food', text: c.food },
                    { label: 'Transport', text: c.transport },
                  ].map(item => (
                    <div key={item.label}>
                      <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--g500)', marginBottom: 6, letterSpacing: .5 }}>{item.label}</div>
                      <div style={{ fontSize: 13, color: 'var(--g700)', lineHeight: 1.65 }}>{item.text}</div>
                    </div>
                  ))}
                </div>

                {/* Universities */}
                <div style={{ marginBottom: 16 }}>
                  <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--g500)', marginBottom: 8, letterSpacing: .5 }}>Universities</div>
                  <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                    {c.universities.map(u => (
                      <span key={u} style={{ fontSize: 12.5, padding: '3px 11px', background: 'var(--off)', borderRadius: 4, color: 'var(--g700)', fontWeight: 600 }}>{u}</span>
                    ))}
                  </div>
                </div>

                {/* Tip */}
                <div style={{ padding: '12px 16px', background: 'rgba(201,146,10,.06)', border: '1px solid rgba(201,146,10,.18)', borderRadius: 10 }}>
                  <div style={{ fontSize: 12.5, color: '#92400e', lineHeight: 1.6 }}>
                    <strong>Tip:</strong> {c.tips}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
