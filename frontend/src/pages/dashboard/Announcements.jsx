import { useState, useEffect } from 'react'
import { lsGet, lsSet } from '../../lib/syncedStore'

const TYPE_COLORS = {
  general:  { bg: 'rgba(37,99,235,.08)', text: '#1d4ed8', label: 'General' },
  event:    { bg: 'rgba(217,119,6,.08)', text: '#92400e', label: 'Event' },
  urgent:   { bg: 'rgba(220,38,38,.08)', text: '#b91c1c', label: 'Urgent' },
  academic: { bg: 'rgba(5,150,105,.08)', text: '#065f46', label: 'Academic' },
}

const SEED = [
  {
    id: 1,
    title: 'Welcome to the AUSI Member Portal',
    body: 'The AUSI digital platform is now live! You can access your dashboard, explore resources, connect with fellow Ugandan students, and stay updated on all AUSI activities. More features are being added regularly.',
    author: 'AUSI Secretariat',
    date: '2025-07-01',
    type: 'general',
    pinned: true,
  },
]

export default function Announcements() {
  const [items, setItems] = useState([])
  const [filter, setFilter] = useState('all')

  useEffect(() => {
    try {
      const stored = JSON.parse(lsGet('ausi_announcements') || 'null')
      setItems(stored || SEED)
    } catch { setItems(SEED) }
  }, [])

  const pinned    = items.filter(a => a.pinned)
  const unpinned  = items.filter(a => !a.pinned)
  const sorted    = [...pinned, ...unpinned]
  const displayed = filter === 'all' ? sorted : sorted.filter(a => a.type === filter)

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
            Announcements
          </h1>
          <p style={{ fontSize: 13.5, color: 'rgba(255,255,255,.4)', margin: 0 }}>
            Official updates and notices from AUSI leadership
          </p>
        </div>
      </div>

      <div className="container" style={{ paddingTop: 32, paddingBottom: 64 }}>

        {/* Filters */}
        <div className="hscroll" style={{ display:'flex', gap:24, marginBottom:28, borderBottom:'1px solid var(--g100)', paddingBottom:14, overflowX:'auto', flexWrap:'nowrap' }}>
          {['all', 'general', 'event', 'urgent', 'academic'].map(f => {
            const active = filter === f
            return (
              <button key={f} onClick={() => setFilter(f)}
                style={{ background:'none', border:'none', borderBottom:`2px solid ${active ? 'var(--ink)' : 'transparent'}`, cursor:'pointer', padding:'0 0 4px', fontSize:14, fontWeight: active ? 800 : 500, color: active ? 'var(--ink)' : 'var(--g400)', transition:'color .15s, border-color .15s', textTransform:'capitalize' }}>
                {f === 'all' ? 'All' : TYPE_COLORS[f]?.label || f}
              </button>
            )
          })}
        </div>

        {/* List */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {displayed.map(a => {
            const tc = TYPE_COLORS[a.type] || TYPE_COLORS.general
            return (
              <div key={a.id} style={{ background: 'var(--white)', border: '1px solid var(--g100)', borderRadius: 14, padding: '22px 26px', position: 'relative' }}>
                {a.pinned && (
                  <div style={{ position: 'absolute', top: 16, right: 16, fontSize: 10.5, fontWeight: 700, letterSpacing: 1, textTransform: 'uppercase', color: 'var(--g400)' }}>
                    Pinned
                  </div>
                )}
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
                  <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: .8, textTransform: 'uppercase', padding: '2px 9px', borderRadius: 4, background: tc.bg, color: tc.text }}>
                    {tc.label}
                  </span>
                  <span style={{ fontSize: 12, color: 'var(--g400)' }}>{new Date(a.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
                </div>
                <h3 style={{ fontFamily: 'var(--serif)', fontSize: 17, fontWeight: 700, color: 'var(--ink)', margin: '0 0 10px', paddingRight: 60 }}>{a.title}</h3>
                <p style={{ fontSize: 13.5, color: 'var(--g600)', lineHeight: 1.65, margin: '0 0 14px' }}>{a.body}</p>
                <div style={{ fontSize: 12, color: 'var(--g400)', fontWeight: 600 }}>— {a.author}</div>
              </div>
            )
          })}
        </div>

        {displayed.length === 0 && (
          <div style={{ textAlign: 'center', padding: '80px 0' }}>
            <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--ink)', marginBottom: 6 }}>No announcements yet</div>
            <div style={{ fontSize: 13, color: 'var(--g500)' }}>Check back soon for updates from the AUSI leadership.</div>
          </div>
        )}

        {/* Info note */}
        <div style={{ marginTop: 32, padding: '16px 20px', background: 'rgba(37,99,235,.05)', border: '1px solid rgba(37,99,235,.15)', borderRadius: 12 }}>
          <div style={{ fontSize: 12.5, color: '#1d4ed8', fontWeight: 600 }}>
            Announcements are posted by AUSI executives. Members receive important notices here first — check regularly to stay informed.
          </div>
        </div>
      </div>
    </div>
  )
}
