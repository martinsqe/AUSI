import { useState, useEffect } from 'react'
import { useAuth } from '../../context/AuthContext'
import { ROLE_LABELS, ROLE_COLORS } from '../../lib/roles'
import api from '../../lib/api'

function Field({ label, value, edit, onChange, type = 'text', readOnly }) {
  return (
    <div style={{ marginBottom: 20 }}>
      <label style={{ display: 'block', fontSize: 11.5, fontWeight: 700, color: 'var(--g500)', marginBottom: 6, letterSpacing: .7, textTransform: 'uppercase' }}>
        {label}
      </label>
      {readOnly || !edit ? (
        <div style={{ padding: '10px 14px', background: readOnly ? 'var(--off)' : 'var(--white)', border: '1px solid var(--g100)', borderRadius: 8, fontSize: 14, color: value ? 'var(--ink)' : 'var(--g400)', fontWeight: value ? 500 : 400 }}>
          {value || '—'}
        </div>
      ) : (
        <input
          type={type} value={value || ''} onChange={e => onChange(e.target.value)}
          style={{ width: '100%', padding: '10px 14px', border: '1.5px solid var(--g200)', borderRadius: 8, fontSize: 14, outline: 'none', boxSizing: 'border-box' }}
        />
      )}
    </div>
  )
}

export default function Profile() {
  const { user, login } = useAuth()
  const [edit, setEdit] = useState(false)
  const [form, setForm] = useState({})
  const [busy, setBusy] = useState(false)
  const [success, setSuccess] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    if (user) {
      setForm({
        full_name:     user.full_name || '',
        phone:         user.phone || '',
        field_of_study: user.field_of_study || '',
        arrival_date:  user.arrival_date ? user.arrival_date.split('T')[0] : '',
      })
    }
  }, [user])

  const set = k => v => setForm(f => ({ ...f, [k]: v }))

  const handleSave = async () => {
    setBusy(true)
    setError('')
    setSuccess('')
    try {
      const { data } = await api.patch('/auth/profile', form)
      const token = localStorage.getItem('ausi_token')
      login(token, data.user)
      setSuccess('Profile updated successfully.')
      setEdit(false)
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to update profile.')
    } finally {
      setBusy(false)
    }
  }

  const initials = (user?.full_name || 'U').split(' ').map(p => p[0]).slice(0, 2).join('').toUpperCase()

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
            My Profile
          </h1>
          <p style={{ fontSize: 13.5, color: 'rgba(255,255,255,.4)', margin: 0 }}>
            View and update your personal information
          </p>
        </div>
      </div>

      <div className="container" style={{ paddingTop: 36, paddingBottom: 64 }}>
        <div style={{ display: 'grid', gridTemplateColumns: '280px 1fr', gap: 24, alignItems: 'start' }}>

          {/* Avatar card */}
          <div style={{ background: 'var(--white)', border: '1px solid var(--g100)', borderRadius: 16, padding: '28px 24px', textAlign: 'center' }}>
            <div style={{
              width: 80, height: 80, borderRadius: '50%', margin: '0 auto 14px',
              background: ROLE_COLORS[user?.role] || '#333',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontWeight: 800, fontSize: 26, color: '#fff',
            }}>
              {initials}
            </div>
            <div style={{ fontFamily: 'var(--serif)', fontSize: 18, fontWeight: 700, color: 'var(--ink)', marginBottom: 5 }}>{user?.full_name}</div>
            <span style={{ fontSize: 11.5, fontWeight: 700, letterSpacing: .8, textTransform: 'uppercase', padding: '3px 12px', borderRadius: 4, background: `${ROLE_COLORS[user?.role]}18`, color: ROLE_COLORS[user?.role] || 'var(--ink)' }}>
              {ROLE_LABELS[user?.role] || 'Member'}
            </span>
            <div style={{ marginTop: 20, fontSize: 12, color: 'var(--g400)', lineHeight: 1.6 }}>
              {user?.is_verified ? (
                <span style={{ color: '#059669', fontWeight: 700 }}>Verified Member</span>
              ) : (
                <span style={{ color: '#d97706', fontWeight: 700 }}>Pending Verification</span>
              )}
            </div>
            {user?.university_name && (
              <div style={{ marginTop: 14, fontSize: 13, color: 'var(--g600)', lineHeight: 1.5 }}>
                {user.university_name}
              </div>
            )}
            <div style={{ marginTop: 16, fontSize: 11.5, color: 'var(--g400)' }}>
              Member since {user?.created_at ? new Date(user.created_at).toLocaleDateString('en-GB', { month: 'long', year: 'numeric' }) : '—'}
            </div>
          </div>

          {/* Edit form */}
          <div style={{ background: 'var(--white)', border: '1px solid var(--g100)', borderRadius: 16, padding: '28px 32px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
              <h2 style={{ fontFamily: 'var(--serif)', fontSize: 18, fontWeight: 700, color: 'var(--ink)', margin: 0 }}>Personal Information</h2>
              {!edit ? (
                <button onClick={() => setEdit(true)}
                  style={{ padding: '8px 20px', background: 'var(--ink)', color: '#fff', border: 'none', borderRadius: 8, fontWeight: 700, fontSize: 13, cursor: 'pointer' }}>
                  Edit
                </button>
              ) : (
                <div style={{ display: 'flex', gap: 8 }}>
                  <button onClick={() => { setEdit(false); setError(''); setSuccess('') }}
                    style={{ padding: '8px 18px', background: 'transparent', color: 'var(--g500)', border: '1px solid var(--g200)', borderRadius: 8, fontWeight: 700, fontSize: 13, cursor: 'pointer' }}>
                    Cancel
                  </button>
                  <button onClick={handleSave} disabled={busy}
                    style={{ padding: '8px 20px', background: 'var(--ink)', color: '#fff', border: 'none', borderRadius: 8, fontWeight: 700, fontSize: 13, cursor: busy ? 'wait' : 'pointer', opacity: busy ? .65 : 1 }}>
                    {busy ? 'Saving…' : 'Save Changes'}
                  </button>
                </div>
              )}
            </div>

            {success && (
              <div style={{ background: 'rgba(5,150,105,.08)', border: '1px solid rgba(5,150,105,.2)', borderRadius: 8, padding: '10px 14px', fontSize: 13, color: '#065f46', marginBottom: 20 }}>
                {success}
              </div>
            )}
            {error && (
              <div style={{ background: 'rgba(220,38,38,.08)', border: '1px solid rgba(220,38,38,.2)', borderRadius: 8, padding: '10px 14px', fontSize: 13, color: 'var(--red)', marginBottom: 20 }}>
                {error}
              </div>
            )}

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 24px' }}>
              <Field label="Full Name"        value={form.full_name}      edit={edit} onChange={set('full_name')} />
              <Field label="Email Address"    value={user?.email}         readOnly />
              <Field label="Phone Number"     value={form.phone}          edit={edit} onChange={set('phone')} type="tel" />
              <Field label="Date of Arrival"  value={form.arrival_date}   edit={edit} onChange={set('arrival_date')} type="date" />
              <Field label="Course / Field"   value={form.field_of_study} edit={edit} onChange={set('field_of_study')} />
              <Field label="University"       value={user?.university_name} readOnly />
              <Field label="Member Role"      value={ROLE_LABELS[user?.role]} readOnly />
              <Field label="Account Status"   value={user?.is_verified ? 'Verified' : 'Pending verification'} readOnly />
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @media (max-width: 700px) {
          .profile-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  )
}
