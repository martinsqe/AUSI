import { useState, useEffect } from 'react'

function EventCard({ ev }) {
  const d = ev.event_date ? new Date(ev.event_date + 'T00:00:00') : null
  const month = d ? d.toLocaleString('default', { month: 'short' }).toUpperCase() : ''
  const day   = d ? d.getDate() : ''
  const isAUSI = ev.scope === 'all'

  return (
    <div style={{ background: 'var(--white)', border: '1px solid var(--g100)', borderRadius: 16, overflow: 'hidden', display: 'flex', flexDirection: 'column', boxShadow: '0 2px 8px rgba(0,0,0,.04)' }}>
      {ev.banner ? (
        <img src={ev.banner} alt={ev.title} style={{ width: '100%', height: 200, objectFit: 'cover', display: 'block' }} />
      ) : (
        <div style={{ width: '100%', height: 200, display: 'flex', alignItems: 'center', justifyContent: 'center',
          background: isAUSI ? 'linear-gradient(135deg,#0891b2 0%,#0e7490 100%)' : 'linear-gradient(135deg,#7c3aed 0%,#6d28d9 100%)' }}>
          <svg width="52" height="52" fill="none" viewBox="0 0 24 24" stroke="rgba(255,255,255,.4)" strokeWidth="1.5">
            <rect x="3" y="4" width="18" height="18" rx="2"/>
            <path d="M16 2v4M8 2v4M3 10h18"/>
          </svg>
        </div>
      )}

      <div style={{ padding: '16px 18px 20px', flex: 1, display: 'flex', flexDirection: 'column', gap: 10 }}>
        {/* Top row: date + scope badge */}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 10 }}>
          {d ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>
              <div style={{ background: isAUSI ? '#0891b2' : '#7c3aed', color: '#fff', borderRadius: 8,
                padding: '4px 10px', textAlign: 'center', minWidth: 44 }}>
                <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: 1 }}>{month}</div>
                <div style={{ fontSize: 20, fontWeight: 800, lineHeight: 1.1 }}>{day}</div>
              </div>
              {ev.event_time && (
                <span style={{ fontSize: 12.5, color: 'var(--g500)', fontWeight: 600 }}>{ev.event_time}</span>
              )}
            </div>
          ) : <div />}
          <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: .8, textTransform: 'uppercase',
            padding: '3px 9px', borderRadius: 5, whiteSpace: 'nowrap', flexShrink: 0,
            background: isAUSI ? 'rgba(8,145,178,.1)' : 'rgba(124,58,237,.1)',
            color: isAUSI ? '#0e7490' : '#6d28d9' }}>
            {isAUSI ? 'AUSI-Wide' : ev.university}
          </span>
        </div>

        <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--ink)', lineHeight: 1.3 }}>{ev.title}</div>

        {ev.location && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 12.5, color: 'var(--g500)' }}>
            <svg width="13" height="13" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"/>
              <circle cx="12" cy="9" r="2.5"/>
            </svg>
            {ev.location}
          </div>
        )}

        {ev.description && (
          <p style={{ fontSize: 13, color: 'var(--g600)', lineHeight: 1.7, margin: 0 }}>
            {ev.description}
          </p>
        )}
      </div>
    </div>
  )
}

export default function DashboardEvents() {
  const [events, setEvents] = useState([])
  const [filter, setFilter] = useState('all')

  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem('ausi_events') || '[]')
    stored.sort((a, b) => new Date(a.event_date) - new Date(b.event_date))
    setEvents(stored)
  }, [])

  const now = new Date(); now.setHours(0,0,0,0)
  const upcoming = events.filter(e => !e.event_date || new Date(e.event_date + 'T00:00:00') >= now)
  const past     = events.filter(e => e.event_date && new Date(e.event_date + 'T00:00:00') < now)

  const applyFilter = (list) =>
    filter === 'ausi'       ? list.filter(e => e.scope === 'all')
    : filter === 'university' ? list.filter(e => e.scope !== 'all')
    : list

  const visibleUpcoming = applyFilter(upcoming)
  const visiblePast     = applyFilter(past)

  const FILTERS = [['all','All Events'],['ausi','AUSI-Wide'],['university','University']]

  return (
    <div style={{ background: 'var(--off)', minHeight: '100vh' }}>
      {/* Header */}
      <div style={{ background: 'linear-gradient(160deg,#111118 0%,#1a1200 100%)', padding: '36px 0 32px' }}>
        <div className="container">
          <img src="/logo.png" alt="AUSI" style={{ width: 42, height: 42, borderRadius: '50%', objectFit: 'cover', display: 'block', marginBottom: 12 }} />
          <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 2.2, textTransform: 'uppercase', color: 'rgba(255,255,255,.35)', marginBottom: 8 }}>AUSI · 2026 / 27</div>
          <h1 style={{ fontFamily: 'var(--serif)', fontSize: 'clamp(22px,3vw,30px)', fontWeight: 700, color: '#fff', margin: '0 0 6px' }}>Events</h1>
          <p style={{ fontSize: 13.5, color: 'rgba(255,255,255,.4)', margin: 0 }}>
            AUSI-wide events and events at your university
          </p>
        </div>
      </div>

      <div className="container" style={{ paddingTop: 28, paddingBottom: 64 }}>
        {/* Filter tabs */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 28 }} className="hscroll">
          {FILTERS.map(([val, label]) => (
            <button key={val} onClick={() => setFilter(val)}
              style={{ padding: '8px 18px', borderRadius: 8, border: '1.5px solid', cursor: 'pointer',
                fontSize: 13, fontWeight: 600, whiteSpace: 'nowrap',
                background: filter === val ? '#0891b2' : 'var(--white)',
                borderColor: filter === val ? '#0891b2' : 'var(--g200)',
                color: filter === val ? '#fff' : 'var(--g600)' }}>
              {label}
            </button>
          ))}
        </div>

        {/* Upcoming */}
        {visibleUpcoming.length > 0 && (
          <>
            <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 2, textTransform: 'uppercase', color: 'var(--g400)', marginBottom: 16 }}>Upcoming</div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(290px,1fr))', gap: 22, marginBottom: 40 }}>
              {visibleUpcoming.map(ev => <EventCard key={ev.id} ev={ev} />)}
            </div>
          </>
        )}

        {/* Past */}
        {visiblePast.length > 0 && (
          <>
            <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 2, textTransform: 'uppercase', color: 'var(--g400)', marginBottom: 16 }}>Past Events</div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(290px,1fr))', gap: 22, opacity: .7 }}>
              {visiblePast.map(ev => <EventCard key={ev.id} ev={ev} />)}
            </div>
          </>
        )}

        {visibleUpcoming.length === 0 && visiblePast.length === 0 && (
          <div style={{ textAlign: 'center', padding: '72px 0', color: 'var(--g400)', fontSize: 14 }}>
            No events yet. Check back soon.
          </div>
        )}
      </div>
    </div>
  )
}
