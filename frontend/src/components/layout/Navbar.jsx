import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { dashboardFor, ROLE_LABELS } from '../../lib/roles'
import './Navbar.css'

const NAV_LINKS = [
  { label: 'Home',           to: '/' },
  { label: 'About',          to: '/about' },
  { label: 'Events',         to: '/events' },
  { label: 'Resources',      to: '/resources' },
  { label: 'Leadership',     to: '/leadership' },
  { label: 'Universities',   to: '/universities' },
  { label: 'Ideas & Innovations', to: '/innovations' },
]

export default function Navbar() {
  const [mobOpen, setMobOpen] = useState(false)
  const location  = useLocation()
  const navigate  = useNavigate()
  const { user, logout } = useAuth()

  const isActive = (to) =>
    to === '/' ? location.pathname === '/' : location.pathname.startsWith(to)

  const closeMob = () => setMobOpen(false)

  const handleLogout = () => {
    logout()
    closeMob()
    navigate('/')
  }

  const dashboardPath = user ? dashboardFor(user.role) : '/dashboard'

  return (
    <>
      <nav className="navbar">
        <div className="navbar__inner container">
          <Link to="/" className="navbar__brand" onClick={closeMob}>
            <img src="/logo.png" alt="AUSI Logo" className="navbar__logo-img" />
            <div className="navbar__brand-text">
              <strong>AUSI</strong>
              <small>Association of Ugandan Students in India</small>
            </div>
          </Link>

          <div className="navbar__links">
            {NAV_LINKS.map((l) => (
              <Link
                key={l.to}
                to={l.to}
                className={`navbar__link${isActive(l.to) ? ' active' : ''}`}
              >
                {l.label}
              </Link>
            ))}
          </div>

          <div className="navbar__cta">
            {user ? (
              <>
                <Link to={dashboardPath} className={`navbar__link${location.pathname.startsWith('/dashboard') ? ' active' : ''}`}>
                  Dashboard
                </Link>
                <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                  <div style={{ textAlign:'right', display:'none' }} className="navbar__user-info">
                    <div style={{ fontSize:12, fontWeight:700, color:'var(--ink)', lineHeight:1.2 }}>
                      {user.full_name?.split(' ')[0]}
                    </div>
                    <div style={{ fontSize:10.5, color:'var(--g400)' }}>{ROLE_LABELS[user.role]}</div>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="btn btn-outline btn-sm"
                    style={{ cursor:'pointer' }}>
                    Log Out
                  </button>
                </div>
              </>
            ) : (
              <>
                <Link to="/login" className="btn btn-outline btn-sm">Log In</Link>
                <Link to="/join" className="btn btn-gold btn-sm">Join AUSI</Link>
              </>
            )}
            <button
              className={`navbar__hamburger${mobOpen ? ' is-open' : ''}`}
              onClick={() => setMobOpen((v) => !v)}
              aria-label="Toggle menu"
            >
              <span /><span /><span />
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Drawer */}
      {mobOpen && (
        <div className="mob-drawer" data-lenis-prevent>
          {NAV_LINKS.map((l) => (
            <Link
              key={l.to}
              to={l.to}
              className={`mob-drawer__link${isActive(l.to) ? ' active' : ''}`}
              onClick={closeMob}
            >
              <span className="mob-link-label">{l.label}</span>
              <span>›</span>
            </Link>
          ))}
          {user ? (
            <>
              <Link to={dashboardPath} className="mob-drawer__link" onClick={closeMob}>
                Dashboard <span>›</span>
              </Link>
              <div className="mob-drawer__btns">
                <div style={{ flex:1, fontSize:13, color:'var(--g500)', paddingLeft:4 }}>
                  Signed in as <strong>{user.full_name?.split(' ')[0]}</strong>
                  <div style={{ fontSize:11.5, color:'var(--g400)', marginTop:1 }}>{ROLE_LABELS[user.role]}</div>
                </div>
                <button className="btn btn-outline" onClick={handleLogout} style={{ cursor:'pointer' }}>Log Out</button>
              </div>
            </>
          ) : (
            <div className="mob-drawer__btns">
              <Link to="/login" className="btn btn-outline" style={{ flex:1, justifyContent:'center' }} onClick={closeMob}>Log In</Link>
              <Link to="/join"  className="btn btn-gold"    style={{ flex:1, justifyContent:'center' }} onClick={closeMob}>Join AUSI</Link>
            </div>
          )}
        </div>
      )}
    </>
  )
}
