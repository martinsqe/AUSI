import { useState } from 'react'
import { useAuth } from '../../context/AuthContext'

const SUBJECTS = [
  'General Feedback',
  'Event Suggestion',
  'Website / Platform Issue',
  'Academic Support Request',
  'Housing / FRRO Help',
  'Financial Hardship',
  'Community Issue',
  'Compliment / Appreciation',
  'Other',
]

export default function Feedback() {
  const { user } = useAuth()
  const [form, setForm] = useState({ subject: '', message: '', anonymous: false })
  const [sent, setSent] = useState(false)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  const update = k => e => setForm(f => ({ ...f, [k]: e.target.type === 'checkbox' ? e.target.checked : e.target.value }))

  const handleSubmit = async e => {
    e.preventDefault()
    if (!form.subject || !form.message.trim()) {
      setError('Please select a subject and write a message.')
      return
    }
    setError('')
    setBusy(true)
    try {
      const existing = JSON.parse(localStorage.getItem('ausi_feedback') || '[]')
      const entry = {
        id: Date.now(),
        subject:      form.subject,
        message:      form.message.trim(),
        anonymous:    form.anonymous,
        sender_name:  form.anonymous ? null : (user?.full_name || null),
        sender_email: form.anonymous ? null : (user?.email    || null),
        sender_role:  form.anonymous ? null : (user?.role     || null),
        submitted_at: new Date().toISOString(),
        status: 'new',
      }
      localStorage.setItem('ausi_feedback', JSON.stringify([entry, ...existing]))
    } catch {}
    setBusy(false)
    setSent(true)
  }

  if (sent) {
    return (
      <div style={{ background: 'var(--off)', minHeight: '100vh' }}>
        <div style={{ background: 'linear-gradient(160deg,#111118 0%,#1a1200 100%)', padding: '36px 0 32px', color: '#fff' }}>
          <div className="container">
            <h1 style={{ fontFamily: 'var(--serif)', fontSize: 28, fontWeight: 700, color: '#fff', margin: 0 }}>Feedback</h1>
          </div>
        </div>
        <div className="container" style={{ paddingTop: 80, paddingBottom: 80, textAlign: 'center', maxWidth: 480, margin: '0 auto' }}>
          <h2 style={{ fontFamily: 'var(--serif)', fontSize: 22, fontWeight: 700, color: 'var(--ink)', marginBottom: 10 }}>Thank you!</h2>
          <p style={{ fontSize: 14, color: 'var(--g600)', lineHeight: 1.65, marginBottom: 28 }}>
            Your feedback has been received by the AUSI secretariat. We read every submission and will follow up if a response is needed.
          </p>
          <button onClick={() => { setSent(false); setForm({ subject: '', message: '', anonymous: false }) }}
            style={{ padding: '11px 28px', background: 'var(--ink)', color: '#fff', border: 'none', borderRadius: 8, fontWeight: 700, fontSize: 14, cursor: 'pointer' }}>
            Send another message
          </button>
        </div>
      </div>
    )
  }

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
            Feedback
          </h1>
          <p style={{ fontSize: 13.5, color: 'rgba(255,255,255,.4)', margin: 0 }}>
            Share your thoughts, suggestions, or concerns with the AUSI leadership
          </p>
        </div>
      </div>

      <div className="container" style={{ paddingTop: 40, paddingBottom: 64, maxWidth: 640, margin: '0 auto' }}>

        <form onSubmit={handleSubmit} style={{ background: 'var(--white)', border: '1px solid var(--g100)', borderRadius: 16, padding: '32px' }}>

          {/* From (auto-filled) */}
          <div style={{ marginBottom: 22 }}>
            <label style={{ display: 'block', fontSize: 12.5, fontWeight: 700, color: 'var(--g600)', marginBottom: 7, letterSpacing: .5 }}>
              FROM
            </label>
            <div style={{ padding: '10px 14px', background: 'var(--off)', border: '1px solid var(--g100)', borderRadius: 8, fontSize: 14, color: 'var(--g600)' }}>
              {form.anonymous ? 'Anonymous member' : (user?.full_name || 'You')} · {user?.email}
            </div>
          </div>

          {/* Subject */}
          <div style={{ marginBottom: 22 }}>
            <label style={{ display: 'block', fontSize: 12.5, fontWeight: 700, color: 'var(--g600)', marginBottom: 7, letterSpacing: .5 }}>
              SUBJECT
            </label>
            <select
              value={form.subject} onChange={update('subject')} required
              style={{ width: '100%', padding: '11px 14px', border: '1.5px solid var(--g200)', borderRadius: 8, fontSize: 14, outline: 'none', background: 'var(--white)', color: form.subject ? 'var(--ink)' : 'var(--g400)', boxSizing: 'border-box' }}>
              <option value="">Select a subject…</option>
              {SUBJECTS.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>

          {/* Message */}
          <div style={{ marginBottom: 22 }}>
            <label style={{ display: 'block', fontSize: 12.5, fontWeight: 700, color: 'var(--g600)', marginBottom: 7, letterSpacing: .5 }}>
              MESSAGE
            </label>
            <textarea
              value={form.message} onChange={update('message')} required
              rows={7}
              placeholder="Write your feedback here. Be as specific as possible so we can address it effectively…"
              style={{ width: '100%', padding: '11px 14px', border: '1.5px solid var(--g200)', borderRadius: 8, fontSize: 13.5, outline: 'none', resize: 'vertical', boxSizing: 'border-box', lineHeight: 1.6, fontFamily: 'inherit' }}
            />
            <div style={{ fontSize: 11.5, color: 'var(--g400)', marginTop: 4 }}>{form.message.length} characters</div>
          </div>

          {/* Anonymous toggle */}
          <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', marginBottom: 24 }}>
            <input type="checkbox" checked={form.anonymous} onChange={update('anonymous')}
              style={{ width: 16, height: 16, cursor: 'pointer' }} />
            <span style={{ fontSize: 13.5, color: 'var(--g600)' }}>Submit anonymously (your name will not be shared with leadership)</span>
          </label>

          {error && (
            <div style={{ background: 'rgba(220,38,38,.08)', border: '1px solid rgba(220,38,38,.2)', borderRadius: 8, padding: '10px 14px', fontSize: 13, color: 'var(--red)', marginBottom: 20 }}>
              {error}
            </div>
          )}

          <button type="submit" disabled={busy}
            style={{ width: '100%', padding: '13px', background: 'var(--ink)', color: '#fff', border: 'none', borderRadius: 10, fontWeight: 700, fontSize: 14.5, cursor: busy ? 'wait' : 'pointer', transition: 'opacity .15s', opacity: busy ? .65 : 1 }}>
            {busy ? 'Sending…' : 'Send Feedback'}
          </button>
        </form>

        <div style={{ marginTop: 20, padding: '14px 18px', background: 'rgba(37,99,235,.05)', border: '1px solid rgba(37,99,235,.15)', borderRadius: 10 }}>
          <div style={{ fontSize: 12.5, color: '#1d4ed8', lineHeight: 1.6 }}>
            All feedback goes directly to the AUSI secretariat. For urgent matters, please use the Emergency Contacts page.
          </div>
        </div>
      </div>
    </div>
  )
}
