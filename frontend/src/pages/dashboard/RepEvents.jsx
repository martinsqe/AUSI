import { useState, useEffect } from 'react'
import { lsGet, lsSet } from '../../lib/syncedStore'
import { useAuth } from '../../context/AuthContext'
import api from '../../lib/api'

const EMPTY = { title: '', description: '', event_date: '', event_time: '', location: '', banner: '' }

const inp = {
  width: '100%', padding: '9px 12px', border: '1.5px solid var(--g200)',
  borderRadius: 8, fontSize: 13.5, outline: 'none',
  boxSizing: 'border-box', background: 'var(--white)', color: 'var(--ink)',
}

function Field({ label, children }) {
  return (
    <div>
      <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: 'var(--g500)', letterSpacing: 1, textTransform: 'uppercase', marginBottom: 6 }}>
        {label}
      </label>
      {children}
    </div>
  )
}

function EventCard({ ev, onDelete }) {
  const d = ev.event_date ? new Date(ev.event_date + 'T00:00:00') : null
  return (
    <div style={{ background: 'var(--white)', border: '1px solid var(--g100)', borderRadius: 14, overflow: 'hidden' }}>
      {ev.banner ? (
        <img src={ev.banner} alt="" style={{ width: '100%', height: 160, objectFit: 'cover', display: 'block' }} />
      ) : (
        <div style={{ width: '100%', height: 160, background: 'linear-gradient(135deg,#7c3aed,#6d28d9)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <svg width="44" height="44" fill="none" viewBox="0 0 24 24" stroke="rgba(255,255,255,.5)" strokeWidth="1.5">
            <rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/>
          </svg>
        </div>
      )}
      <div style={{ padding: '14px 16px' }}>
        <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--ink)', marginBottom: 5 }}>{ev.title}</div>
        {d && (
          <div style={{ fontSize: 12.5, color: 'var(--g500)', marginBottom: 3 }}>
            {d.toLocaleDateString('default', { weekday: 'short', year: 'numeric', month: 'long', day: 'numeric' })}
            {ev.event_time ? ` · ${ev.event_time}` : ''}
          </div>
        )}
        {ev.location && (
          <div style={{ fontSize: 12.5, color: 'var(--g500)', marginBottom: 8 }}>📍 {ev.location}</div>
        )}
        {ev.description && (
          <p style={{ fontSize: 13, color: 'var(--g600)', lineHeight: 1.6, margin: '0 0 12px',
            display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
            {ev.description}
          </p>
        )}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: 11, color: 'var(--g400)' }}>Created by {ev.created_by}</span>
          <button onClick={() => onDelete(ev.id)}
            style={{ fontSize: 12, color: '#dc2626', background: 'rgba(220,38,38,.07)', border: 'none',
              borderRadius: 6, padding: '5px 12px', cursor: 'pointer', fontWeight: 700 }}>
            Delete
          </button>
        </div>
      </div>
    </div>
  )
}

export default function RepEvents() {
  const { user } = useAuth()
  const [uniName, setUniName] = useState('')
  const [events, setEvents]   = useState([])
  const [form, setForm]       = useState(EMPTY)
  const [creating, setCreating] = useState(false)
  const [saving, setSaving]   = useState(false)
  const [err, setErr]         = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/dashboard/rep')
      .then(r => {
        const name = r.data?.university?.name || user?.university || 'My University'
        setUniName(name)
        const stored = JSON.parse(lsGet('ausi_events') || '[]')
        setEvents(
          stored
            .filter(e => e.scope === 'university' && e.university === name)
            .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
        )
      })
      .catch(() => {
        const fallback = user?.university || 'My University'
        setUniName(fallback)
        const stored = JSON.parse(lsGet('ausi_events') || '[]')
        setEvents(stored.filter(e => e.scope === 'university' && e.university === fallback))
      })
      .finally(() => setLoading(false))
  }, [user])

  const handleBanner = (e) => {
    const file = e.target.files[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = ev => setForm(f => ({ ...f, banner: ev.target.result }))
    reader.readAsDataURL(file)
  }

  const handleSave = () => {
    if (!form.title.trim()) { setErr('Event title is required.'); return }
    if (!form.event_date)   { setErr('Event date is required.'); return }
    setErr('')
    setSaving(true)
    try {
      const all   = JSON.parse(lsGet('ausi_events') || '[]')
      const newEv = { ...form, id: Date.now(), scope: 'university', university: uniName, created_by: user?.full_name, created_by_role: user?.role, created_at: new Date().toISOString() }
      lsSet('ausi_events', JSON.stringify([newEv, ...all]))
      setEvents(prev => [newEv, ...prev])
      setForm(EMPTY)
      setCreating(false)
    } catch {
      setErr('Could not save — storage may be full. Try a smaller image.')
    }
    setSaving(false)
  }

  const handleDelete = (id) => {
    const all = JSON.parse(lsGet('ausi_events') || '[]')
    lsSet('ausi_events', JSON.stringify(all.filter(e => e.id !== id)))
    setEvents(prev => prev.filter(e => e.id !== id))
  }

  return (
    <div style={{ background: 'var(--off)', minHeight: '100vh' }}>
      {/* Header */}
      <div style={{ background: 'linear-gradient(160deg,#111118 0%,#1a1200 100%)', padding: '36px 0 32px' }}>
        <div className="container">
          <img src="/logo.png" alt="AUSI" style={{ width: 42, height: 42, borderRadius: '50%', objectFit: 'cover', display: 'block', marginBottom: 12 }} />
          <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 2.2, textTransform: 'uppercase', color: 'rgba(255,255,255,.35)', marginBottom: 8 }}>AUSI · 2026 / 27</div>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap' }}>
            <div>
              <h1 style={{ fontFamily: 'var(--serif)', fontSize: 'clamp(22px,3vw,30px)', fontWeight: 700, color: '#fff', margin: '0 0 6px' }}>
                {loading ? 'Loading…' : uniName + ' Events'}
              </h1>
              <p style={{ fontSize: 13.5, color: 'rgba(255,255,255,.4)', margin: 0 }}>
                Events you create here are visible to students at {uniName}.
              </p>
            </div>
            {!loading && (
              <button onClick={() => { setCreating(v => !v); setErr('') }}
                style={{ padding: '10px 20px', background: creating ? 'rgba(255,255,255,.12)' : '#0891b2',
                  color: '#fff', border: 'none', borderRadius: 8, fontSize: 13.5, fontWeight: 700, cursor: 'pointer', flexShrink: 0 }}>
                {creating ? 'Cancel' : '+ New Event'}
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="container" style={{ paddingTop: 28, paddingBottom: 64 }}>
        {/* Create form */}
        {creating && (
          <div style={{ background: 'var(--white)', border: '1px solid var(--g100)', borderRadius: 14, padding: '24px', marginBottom: 28 }}>
            <h2 style={{ margin: '0 0 4px', fontSize: 16, fontWeight: 700, color: 'var(--ink)' }}>New Event at {uniName}</h2>
            <p style={{ fontSize: 13, color: 'var(--g500)', margin: '0 0 20px' }}>This event will be visible to all students at {uniName}.</p>
            {err && <div style={{ color: '#dc2626', fontSize: 13, marginBottom: 12, padding: '8px 12px', background: 'rgba(220,38,38,.07)', borderRadius: 6 }}>{err}</div>}

            <div style={{ display: 'grid', gap: 16 }}>
              <Field label="Event Title *">
                <input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                  placeholder="e.g. Cultural Night 2026" style={inp} />
              </Field>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(180px,1fr))', gap: 14 }}>
                <Field label="Date *">
                  <input type="date" value={form.event_date} onChange={e => setForm(f => ({ ...f, event_date: e.target.value }))} style={inp} />
                </Field>
                <Field label="Time">
                  <input type="time" value={form.event_time} onChange={e => setForm(f => ({ ...f, event_time: e.target.value }))} style={inp} />
                </Field>
              </div>

              <Field label="Location">
                <input value={form.location} onChange={e => setForm(f => ({ ...f, location: e.target.value }))}
                  placeholder="e.g. Main Auditorium, Block B" style={inp} />
              </Field>

              <Field label="Description">
                <textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                  rows={4} placeholder="Event details, agenda, what to expect…"
                  style={{ ...inp, resize: 'vertical' }} />
              </Field>

              <Field label="Event Banner / Image">
                <input type="file" accept="image/*" onChange={handleBanner} style={{ fontSize: 13 }} />
                {form.banner && (
                  <div style={{ position: 'relative', marginTop: 10, display: 'inline-block' }}>
                    <img src={form.banner} alt="" style={{ height: 130, objectFit: 'cover', borderRadius: 8, display: 'block' }} />
                    <button onClick={() => setForm(f => ({ ...f, banner: '' }))}
                      style={{ position: 'absolute', top: 6, right: 6, background: 'rgba(0,0,0,.6)', color: '#fff',
                        border: 'none', borderRadius: '50%', width: 22, height: 22, cursor: 'pointer', fontSize: 12, fontWeight: 700 }}>
                      ×
                    </button>
                  </div>
                )}
              </Field>

              <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                <button onClick={handleSave} disabled={saving}
                  style={{ padding: '10px 24px', background: '#7c3aed', color: '#fff', border: 'none',
                    borderRadius: 8, fontSize: 13.5, fontWeight: 700, cursor: 'pointer', opacity: saving ? .7 : 1 }}>
                  {saving ? 'Publishing…' : 'Publish Event'}
                </button>
                <button onClick={() => { setCreating(false); setForm(EMPTY); setErr('') }}
                  style={{ padding: '10px 20px', background: 'transparent', color: 'var(--g500)',
                    border: '1.5px solid var(--g200)', borderRadius: 8, fontSize: 13.5, fontWeight: 600, cursor: 'pointer' }}>
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Events grid */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: '48px 0', color: 'var(--g400)', fontSize: 13 }}>Loading…</div>
        ) : events.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '72px 0', color: 'var(--g400)', fontSize: 14 }}>
            No events for {uniName} yet. Click "+ New Event" to create one.
          </div>
        ) : (
          <>
            <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 2, textTransform: 'uppercase', color: 'var(--g400)', marginBottom: 16 }}>
              {events.length} Event{events.length !== 1 ? 's' : ''}
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(290px,1fr))', gap: 20 }}>
              {events.map(ev => <EventCard key={ev.id} ev={ev} onDelete={handleDelete} />)}
            </div>
          </>
        )}
      </div>
    </div>
  )
}
