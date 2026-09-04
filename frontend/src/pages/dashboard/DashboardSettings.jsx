import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import api from '../../lib/api'

export default function DashboardSettings() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const [pwForm, setPwForm] = useState({ current: '', next: '', confirm: '' })
  const [pwBusy, setPwBusy] = useState(false)
  const [pwError, setPwError] = useState('')
  const [pwSuccess, setPwSuccess] = useState('')

  const setPw = k => e => setPwForm(f => ({ ...f, [k]: e.target.value }))

  const handleChangePw = async e => {
    e.preventDefault()
    setPwError('')
    setPwSuccess('')
    if (pwForm.next !== pwForm.confirm) {
      setPwError('New passwords do not match.')
      return
    }
    if (pwForm.next.length < 8) {
      setPwError('New password must be at least 8 characters.')
      return
    }
    setPwBusy(true)
    try {
      await api.post('/auth/change-password', { currentPassword: pwForm.current, newPassword: pwForm.next })
      setPwSuccess('Password updated successfully.')
      setPwForm({ current: '', next: '', confirm: '' })
    } catch (err) {
      setPwError(err.response?.data?.error || 'Failed to update password.')
    } finally {
      setPwBusy(false)
    }
  }

  const inputStyle = {
    width: '100%', padding: '10px 14px', border: '1.5px solid var(--g200)',
    borderRadius: 8, fontSize: 14, outline: 'none', boxSizing: 'border-box',
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
            Settings
          </h1>
          <p style={{ fontSize: 13.5, color: 'rgba(255,255,255,.4)', margin: 0 }}>
            Manage your account security and preferences
          </p>
        </div>
      </div>

      <div className="container" style={{ paddingTop: 36, paddingBottom: 64, maxWidth: 640, margin: '0 auto' }}>

        {/* Account info */}
        <div style={{ background: 'var(--white)', border: '1px solid var(--g100)', borderRadius: 16, padding: '24px 28px', marginBottom: 24 }}>
          <h2 style={{ fontFamily: 'var(--serif)', fontSize: 16, fontWeight: 700, color: 'var(--ink)', margin: '0 0 16px' }}>Account</h2>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <div style={{ width: 44, height: 44, borderRadius: '50%', background: 'var(--ink)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: 15, color: '#fff', flexShrink: 0 }}>
              {(user?.full_name || 'U').charAt(0)}
            </div>
            <div>
              <div style={{ fontWeight: 700, color: 'var(--ink)', marginBottom: 2 }}>{user?.full_name}</div>
              <div style={{ fontSize: 13, color: 'var(--g500)' }}>{user?.email}</div>
            </div>
          </div>
        </div>

        {/* Change password */}
        <div style={{ background: 'var(--white)', border: '1px solid var(--g100)', borderRadius: 16, padding: '24px 28px', marginBottom: 24 }}>
          <h2 style={{ fontFamily: 'var(--serif)', fontSize: 16, fontWeight: 700, color: 'var(--ink)', margin: '0 0 4px' }}>Change Password</h2>
          <p style={{ fontSize: 13, color: 'var(--g500)', margin: '0 0 20px' }}>Use a strong password with letters, numbers, and symbols.</p>

          <form onSubmit={handleChangePw}>
            <div style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: 'var(--g500)', marginBottom: 6, textTransform: 'uppercase', letterSpacing: .5 }}>Current Password</label>
              <input type="password" value={pwForm.current} onChange={setPw('current')} required style={inputStyle} placeholder="Enter current password" />
            </div>
            <div style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: 'var(--g500)', marginBottom: 6, textTransform: 'uppercase', letterSpacing: .5 }}>New Password</label>
              <input type="password" value={pwForm.next} onChange={setPw('next')} required style={inputStyle} placeholder="Min. 8 characters" />
            </div>
            <div style={{ marginBottom: 20 }}>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: 'var(--g500)', marginBottom: 6, textTransform: 'uppercase', letterSpacing: .5 }}>Confirm New Password</label>
              <input type="password" value={pwForm.confirm} onChange={setPw('confirm')} required style={inputStyle} placeholder="Repeat new password" />
            </div>

            {pwError && (
              <div style={{ background: 'rgba(220,38,38,.08)', border: '1px solid rgba(220,38,38,.2)', borderRadius: 8, padding: '10px 14px', fontSize: 13, color: 'var(--red)', marginBottom: 16 }}>
                {pwError}
              </div>
            )}
            {pwSuccess && (
              <div style={{ background: 'rgba(5,150,105,.08)', border: '1px solid rgba(5,150,105,.2)', borderRadius: 8, padding: '10px 14px', fontSize: 13, color: '#065f46', marginBottom: 16 }}>
                {pwSuccess}
              </div>
            )}

            <button type="submit" disabled={pwBusy}
              style={{ padding: '10px 24px', background: 'var(--ink)', color: '#fff', border: 'none', borderRadius: 8, fontWeight: 700, fontSize: 13.5, cursor: pwBusy ? 'wait' : 'pointer', opacity: pwBusy ? .65 : 1 }}>
              {pwBusy ? 'Updating…' : 'Update Password'}
            </button>
          </form>
        </div>

        {/* Notifications placeholder */}
        <div style={{ background: 'var(--white)', border: '1px solid var(--g100)', borderRadius: 16, padding: '24px 28px', marginBottom: 24, opacity: .65 }}>
          <h2 style={{ fontFamily: 'var(--serif)', fontSize: 16, fontWeight: 700, color: 'var(--ink)', margin: '0 0 4px' }}>Notifications</h2>
          <p style={{ fontSize: 13, color: 'var(--g500)', margin: '0 0 16px' }}>Email and push notification preferences — coming soon.</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {['Announcements', 'Event reminders', 'Application status updates', 'Weekly digest'].map(label => (
              <label key={label} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'not-allowed' }}>
                <span style={{ fontSize: 14, color: 'var(--g600)' }}>{label}</span>
                <div style={{ width: 40, height: 22, background: 'var(--g100)', borderRadius: 11, position: 'relative' }}>
                  <div style={{ width: 16, height: 16, background: 'var(--g300)', borderRadius: '50%', position: 'absolute', top: 3, left: 3, transition: 'left .2s' }} />
                </div>
              </label>
            ))}
          </div>
        </div>

        {/* Danger zone */}
        <div style={{ background: 'rgba(220,38,38,.04)', border: '1px solid rgba(220,38,38,.15)', borderRadius: 16, padding: '24px 28px' }}>
          <h2 style={{ fontFamily: 'var(--serif)', fontSize: 16, fontWeight: 700, color: '#b91c1c', margin: '0 0 8px' }}>Sign Out</h2>
          <p style={{ fontSize: 13, color: 'var(--g600)', margin: '0 0 16px' }}>You will be returned to the public home page.</p>
          <button onClick={() => { logout(); navigate('/', { replace: true }) }}
            style={{ padding: '9px 22px', background: 'transparent', color: '#b91c1c', border: '1.5px solid rgba(220,38,38,.35)', borderRadius: 8, fontWeight: 700, fontSize: 13.5, cursor: 'pointer', transition: 'all .15s' }}
            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(220,38,38,.08)' }}
            onMouseLeave={e => { e.currentTarget.style.background = 'transparent' }}>
            Log Out
          </button>
        </div>

      </div>
    </div>
  )
}
