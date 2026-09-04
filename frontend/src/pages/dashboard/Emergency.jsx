const CONTACTS = [
  {
    group: 'National Emergency Numbers (India)',
    accent: '#dc2626',
    items: [
      { label: 'Police', number: '100', note: 'All-India emergency police line' },
      { label: 'Ambulance', number: '108', note: 'Free emergency ambulance service' },
      { label: 'Fire Brigade', number: '101', note: 'All-India fire emergency' },
      { label: 'Women Helpline', number: '1091', note: 'National women safety helpline' },
      { label: 'National Emergency', number: '112', note: 'Single unified emergency number (all services)' },
    ],
  },
  {
    group: 'Uganda High Commission, New Delhi',
    accent: '#000',
    items: [
      { label: 'Main Office', number: '+91-11-2688-5411', note: 'Embassy of Uganda, New Delhi' },
      { label: 'Consular Helpline', number: '+91-11-2688-5412', note: 'Passport, visa and citizen services' },
      { label: 'Emergency (24hr)', number: '+256-414-345-661', note: 'Ugandan MFA Operations Centre (Kampala)' },
      { label: 'Address', number: 'E-24, Vasant Vihar, New Delhi – 110 057', note: '' },
    ],
  },
  {
    group: 'AUSI Emergency Contacts',
    accent: '#d97706',
    items: [
      { label: 'Chapter President', number: 'president@ausi.org', note: 'First point of contact for serious matters' },
      { label: 'AUSI Secretariat', number: 'ausioffice@gmail.com', note: 'General and administrative emergencies' },
      { label: 'WhatsApp Group', number: 'Available via your uni rep', note: 'Fastest way to reach fellow students' },
    ],
  },
  {
    group: 'Mental Health & Wellbeing',
    accent: '#7c3aed',
    items: [
      { label: 'iCall (India)', number: '9152987821', note: 'Free psychological counselling, Mon–Sat 8 am–10 pm' },
      { label: 'Vandrevala Foundation', number: '1860-2662-345', note: '24/7 mental health helpline' },
      { label: 'NIMHANS Helpline', number: '080-46110007', note: 'National mental health institute helpline' },
    ],
  },
]

function CopyButton({ text }) {
  const handleCopy = () => {
    navigator.clipboard.writeText(text).catch(() => {})
  }
  return (
    <button
      onClick={handleCopy}
      title="Copy"
      style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '2px 6px', borderRadius: 4, color: 'var(--g400)', fontSize: 12, transition: 'color .15s' }}
      onMouseEnter={e => e.currentTarget.style.color = 'var(--ink)'}
      onMouseLeave={e => e.currentTarget.style.color = 'var(--g400)'}>
      Copy
    </button>
  )
}

export default function Emergency() {
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
            Emergency Contacts
          </h1>
          <p style={{ fontSize: 13.5, color: 'rgba(255,255,255,.4)', margin: 0 }}>
            Save these numbers — know who to call before you need to
          </p>
        </div>
      </div>

      <div className="container" style={{ paddingTop: 36, paddingBottom: 64 }}>

        {/* Urgent banner */}
        <div style={{ background: 'rgba(220,38,38,.08)', border: '1.5px solid rgba(220,38,38,.25)', borderRadius: 12, padding: '14px 20px', marginBottom: 32, display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ fontSize: 13, color: '#991b1b', lineHeight: 1.55 }}>
            <strong>In an immediate emergency in India:</strong> Call <strong>112</strong> (police/ambulance/fire) or <strong>108</strong> for ambulance. Save these numbers to your phone now.
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          {CONTACTS.map(group => (
            <div key={group.group} style={{ background: 'var(--white)', border: '1px solid var(--g100)', borderRadius: 14, overflow: 'hidden' }}>
              <div style={{ padding: '16px 24px', borderBottom: '1px solid var(--g100)', background: 'var(--off)', display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ width: 3, height: 18, borderRadius: 2, background: group.accent, flexShrink: 0 }} />
                <h3 style={{ margin: 0, fontFamily: 'var(--serif)', fontSize: 15, fontWeight: 700, color: 'var(--ink)' }}>{group.group}</h3>
              </div>
              <div style={{ padding: '8px 0' }}>
                {group.items.map((item, i) => (
                  <div key={i} style={{ padding: '14px 24px', borderBottom: i < group.items.length - 1 ? '1px solid var(--g100)' : 'none', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap' }}>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: 14, color: 'var(--ink)', marginBottom: 2 }}>{item.label}</div>
                      {item.note && <div style={{ fontSize: 12.5, color: 'var(--g500)' }}>{item.note}</div>}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 4, flexShrink: 0 }}>
                      <span style={{ fontFamily: 'var(--mono,monospace)', fontSize: 15, fontWeight: 700, color: group.accent === '#000' ? 'var(--ink)' : group.accent }}>
                        {item.number}
                      </span>
                      {item.number && !item.number.includes(' ') && <CopyButton text={item.number} />}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div style={{ marginTop: 32, padding: '16px 20px', background: 'rgba(201,146,10,.06)', border: '1px solid rgba(201,146,10,.2)', borderRadius: 12 }}>
          <div style={{ fontSize: 13, color: '#92400e', lineHeight: 1.6 }}>
            <strong>Pro tip:</strong> Screenshot this page and save it offline. Save at least <strong>112</strong>, <strong>108</strong>, and the AUSI President's contact in your phone contacts. Tell a trusted friend where you live.
          </div>
        </div>
      </div>
    </div>
  )
}
