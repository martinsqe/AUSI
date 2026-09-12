import { useState } from 'react'
import { NavLink, Outlet, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { ROLE_LABELS, ROLE_COLORS, dashboardFor, canAccessAdmin } from '../lib/roles'

/* ── Shared nav item style ───────────────────────────────────── */
function navStyle(isActive) {
  return {
    display: 'flex', alignItems: 'center',
    padding: '9px 14px', borderRadius: 8, textDecoration: 'none',
    fontSize: 13.5, fontWeight: isActive ? 700 : 600, letterSpacing: 0.1,
    color: isActive ? 'rgba(201,146,10,.95)' : 'rgba(255,255,255,.48)',
    background: 'transparent',
    marginBottom: 2, transition: 'all .15s',
  }
}

/* ── Regular sidebar nav ─────────────────────────────────────── */
const MAIN_NAV = [
  { label: 'Announcements',        to: '/dashboard/announcements' },
  { label: 'Events',               to: '/dashboard/events' },
  { label: 'Resources',            to: '/dashboard/resources' },
  { label: 'Universities',         to: '/dashboard/universities' },
  { label: 'Embassy Notices',      to: '/dashboard/embassy' },
  { label: 'Immigration Updates',  to: '/dashboard/immigration' },
  { label: 'Government Notices',   to: '/dashboard/government' },
  { label: 'Emergency',            to: '/dashboard/emergency' },
  { label: 'Anonymous Report',     to: '/dashboard/report' },
  // Social / community — last
  { label: 'Cabinet',              to: '/dashboard/cabinet' },
  { label: 'Voting',               to: '/dashboard/voting' },
  { label: 'Marketplace',          to: '/dashboard/marketplace' },
]
const BOTTOM_NAV = [
  { label: 'Feedback', to: '/dashboard/feedback' },
  { label: 'Profile',  to: '/dashboard/profile' },
  { label: 'Settings', to: '/dashboard/settings' },
]

/* ── Admin sidebar nav ───────────────────────────────────────── */
const ADMIN_SECTIONS = [
  {
    section: null,
    items: [{ label: 'Home', to: '/dashboard/admin', end: true }],
  },
  {
    section: 'People',
    items: [
      { label: 'Students',   to: '/dashboard/admin/students',   roles: null },
      { label: 'Admissions', to: '/dashboard/admin/admissions', roles: ['admin','chapter_president'] },
      { label: 'Requests',   to: '/dashboard/admin/requests',   roles: null },
    ],
  },
  {
    section: 'Content',
    items: [
      { label: 'Cabinet',              to: '/dashboard/admin/cabinet' },
      { label: 'Events',               to: '/dashboard/admin/events' },
      { label: 'Voting / Elections',   to: '/dashboard/admin/voting' },
      { label: 'Announcements',        to: '/dashboard/admin/announcements' },
      { label: 'Resources',            to: '/dashboard/admin/resources' },
      { label: 'Embassy Notices',      to: '/dashboard/admin/embassy' },
      { label: 'Immigration Updates',  to: '/dashboard/admin/immigration' },
      { label: 'Government Notices',   to: '/dashboard/admin/government' },
      { label: 'Ideas & Innovations',  to: '/dashboard/admin/innovations' },
    ],
  },
  {
    section: 'Data',
    items: [
      { label: 'Universities',      to: '/dashboard/admin/universities', roles: ['admin'] },
      { label: 'Anonymous Reports', to: '/dashboard/admin/reports' },
      { label: 'Statistics',        to: '/dashboard/admin/statistics' },
      { label: 'Feedback Inbox',    to: '/dashboard/admin/feedback' },
    ],
  },
]

/* ── Admin Sidebar ───────────────────────────────────────────── */
function AdminSidebar({ onClose }) {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const close = () => onClose && onClose()

  const handleLogout = () => {
    logout()
    navigate('/login', { replace: true })
    close()
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0, overflow: 'hidden' }}>
      {/* Brand */}
      <div style={{ padding: '20px 16px 18px', borderBottom: '1px solid rgba(255,255,255,.07)', flexShrink: 0, display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
        <div>
          <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: 2.5, textTransform: 'uppercase', color: 'rgba(201,146,10,.55)', marginBottom: 5 }}>AUSI</div>
          <div style={{ fontFamily: 'var(--serif)', fontWeight: 800, fontSize: 16, color: 'rgba(255,255,255,.92)', letterSpacing: .2, lineHeight: 1.2 }}>Admin Portal</div>
        </div>
        {onClose && (
          <button onClick={close} aria-label="Close menu" style={{ background: 'rgba(255,255,255,.08)', border: 'none', color: 'rgba(255,255,255,.55)', borderRadius: 7, width: 30, height: 30, cursor: 'pointer', fontSize: 18, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 2 }}>×</button>
        )}
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, overflowY: 'auto', minHeight: 0, padding: '8px 10px 0' }}>
        {ADMIN_SECTIONS.map(({ section, items }) => {
          const visible = items.filter(item => !item.roles || item.roles.includes(user?.role))
          if (!visible.length) return null
          return (
            <div key={section || '__home'} style={{ marginBottom: 4 }}>
              {section && (
                <div style={{ fontSize: 9.5, fontWeight: 700, letterSpacing: 2.2, textTransform: 'uppercase', color: 'rgba(255,255,255,.2)', padding: '10px 14px 3px' }}>
                  {section}
                </div>
              )}
              {visible.map(item => (
                <NavLink key={item.to} to={item.to} end={item.end} onClick={close} style={({ isActive }) => navStyle(isActive)}>
                  {item.label}
                </NavLink>
              ))}
            </div>
          )
        })}

      </nav>

      {/* Bottom */}
      <div style={{ padding: '0 10px 12px', borderTop: '1px solid rgba(255,255,255,.07)', flexShrink: 0 }}>
        <div style={{ paddingTop: 10 }}>
          <NavLink to="/dashboard/profile" onClick={close} style={({ isActive }) => navStyle(isActive)}>Profile</NavLink>
          <NavLink to="/dashboard/settings" onClick={close} style={({ isActive }) => navStyle(isActive)}>Settings</NavLink>
        </div>
        <button onClick={handleLogout}
          style={{ width: '100%', padding: '9px 14px', marginTop: 4, borderRadius: 8, border: 'none', background: 'transparent', cursor: 'pointer', display: 'flex', alignItems: 'center', color: 'rgba(248,113,113,.75)', fontSize: 13.5, fontWeight: 600, borderLeft: '2px solid transparent', transition: 'all .15s', letterSpacing: 0.1 }}
          onMouseEnter={e => { e.currentTarget.style.background = 'rgba(239,68,68,.1)'; e.currentTarget.style.color = '#f87171' }}
          onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'rgba(248,113,113,.75)' }}>
          Log Out
        </button>
      </div>
    </div>
  )
}

/* ── Regular Sidebar ─────────────────────────────────────────── */
function RegularSidebar({ onClose }) {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const homeLink = user ? dashboardFor(user.role) : '/dashboard'
  const close = () => onClose && onClose()

  const handleLogout = () => {
    logout()
    navigate('/login', { replace: true })
    close()
  }

  const navItems = canAccessAdmin(user?.role)
    ? MAIN_NAV.filter(item => !['Cabinet','Announcements','Resources','Embassy Notices','Immigration Updates','Government Notices','Marketplace','Emergency','Voting','Anonymous Report'].includes(item.label))
    : MAIN_NAV
  const evIdx     = navItems.findIndex(i => i.label === 'Events')
  const navBefore = evIdx >= 0 ? navItems.slice(0, evIdx + 1) : navItems
  const navAfter  = evIdx >= 0 ? navItems.slice(evIdx + 1)   : []

  return (
    <div style={{ display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0, overflow: 'hidden' }}>
      {/* Brand */}
      <div style={{ padding: '20px 16px 18px', borderBottom: '1px solid rgba(255,255,255,.07)', flexShrink: 0, display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
        <div>
          <div style={{ fontFamily: 'var(--serif)', fontWeight: 800, fontSize: 18, color: 'var(--gold-lt)', letterSpacing: .5, lineHeight: 1.1, marginBottom: 4 }}>AUSI</div>
          <div style={{ fontSize: 9.5, color: 'rgba(255,255,255,.3)', letterSpacing: .4 }}>Member Portal</div>
        </div>
        {onClose && (
          <button onClick={close} aria-label="Close menu" style={{ background: 'rgba(255,255,255,.08)', border: 'none', color: 'rgba(255,255,255,.55)', borderRadius: 7, width: 30, height: 30, cursor: 'pointer', fontSize: 18, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 2 }}>×</button>
        )}
      </div>

      {/* Main nav */}
      <nav style={{ flex: 1, overflowY: 'auto', minHeight: 0, padding: '10px 10px 0' }}>
        <NavLink to={homeLink} end onClick={close} style={({ isActive }) => navStyle(isActive)}>
          Home
        </NavLink>
        {navBefore.map(item => (
          <NavLink key={item.to} to={item.to} onClick={close} style={({ isActive }) => navStyle(isActive)}>
            {item.label}
          </NavLink>
        ))}
        {user?.role === 'university_rep' && (
          <>
            <div style={{ fontSize: 9.5, fontWeight: 700, letterSpacing: 2.2, textTransform: 'uppercase', color: 'rgba(255,255,255,.2)', padding: '12px 14px 3px' }}>
              My University
            </div>
            <NavLink to="/dashboard/rep-events"  onClick={close} style={({ isActive }) => navStyle(isActive)}>My Events</NavLink>
            <NavLink to="/dashboard/rep-reports" onClick={close} style={({ isActive }) => navStyle(isActive)}>My Reports</NavLink>
          </>
        )}
        {navAfter.map(item => (
          <NavLink key={item.to} to={item.to} onClick={close} style={({ isActive }) => navStyle(isActive)}>
            {item.label}
          </NavLink>
        ))}
        {canAccessAdmin(user?.role) && (
          <>
            <div style={{ fontSize: 9.5, fontWeight: 700, letterSpacing: 2.2, textTransform: 'uppercase', color: 'rgba(255,255,255,.2)', padding: '14px 14px 3px' }}>
              Management
            </div>
            <NavLink to="/dashboard/requests"                onClick={close} style={({ isActive }) => navStyle(isActive)}>Join Requests</NavLink>
            <NavLink to="/dashboard/manage/announcements"    onClick={close} style={({ isActive }) => navStyle(isActive)}>Announcements</NavLink>
            <NavLink to="/dashboard/manage/events"           onClick={close} style={({ isActive }) => navStyle(isActive)}>Events</NavLink>
            <NavLink to="/dashboard/manage/resources"        onClick={close} style={({ isActive }) => navStyle(isActive)}>Resources</NavLink>
            {user?.role === 'admin' && (
              <NavLink to="/dashboard/manage/universities"   onClick={close} style={({ isActive }) => navStyle(isActive)}>Universities</NavLink>
            )}
            <NavLink to="/dashboard/manage/embassy"          onClick={close} style={({ isActive }) => navStyle(isActive)}>Embassy Notices</NavLink>
            <NavLink to="/dashboard/manage/immigration"      onClick={close} style={({ isActive }) => navStyle(isActive)}>Immigration Updates</NavLink>
            <NavLink to="/dashboard/manage/government"       onClick={close} style={({ isActive }) => navStyle(isActive)}>Government Notices</NavLink>
            <NavLink to="/dashboard/statistics"              onClick={close} style={({ isActive }) => navStyle(isActive)}>Statistics</NavLink>
            <NavLink to="/dashboard/reports"                 onClick={close} style={({ isActive }) => navStyle(isActive)}>Reports</NavLink>
            <NavLink to="/dashboard/report"                  onClick={close} style={({ isActive }) => navStyle(isActive)}>Anonymous Report</NavLink>
            <NavLink to="/dashboard/manage/feedback"         onClick={close} style={({ isActive }) => navStyle(isActive)}>Feedback Inbox</NavLink>
            <NavLink to="/dashboard/emergency"               onClick={close} style={({ isActive }) => navStyle(isActive)}>Emergency</NavLink>
            <NavLink to="/dashboard/manage/cabinet"          onClick={close} style={({ isActive }) => navStyle(isActive)}>Cabinet</NavLink>
            <NavLink to="/dashboard/voting"                  onClick={close} style={({ isActive }) => navStyle(isActive)}>Voting</NavLink>
            <NavLink to="/dashboard/marketplace"             onClick={close} style={({ isActive }) => navStyle(isActive)}>Marketplace</NavLink>
          </>
        )}
      </nav>

      {/* Bottom section */}
      <div style={{ padding: '0 10px 12px', borderTop: '1px solid rgba(255,255,255,.07)', flexShrink: 0 }}>
        <div style={{ paddingTop: 10 }}>
          {BOTTOM_NAV.map(item => (
            <NavLink key={item.to} to={item.to} onClick={close} style={({ isActive }) => navStyle(isActive)}>
              {item.label}
            </NavLink>
          ))}
        </div>
        <button onClick={handleLogout}
          style={{ width: '100%', padding: '9px 14px', marginTop: 4, borderRadius: 8, border: 'none', background: 'transparent', cursor: 'pointer', display: 'flex', alignItems: 'center', color: 'rgba(248,113,113,.75)', fontSize: 13.5, fontWeight: 600, borderLeft: '2px solid transparent', transition: 'all .15s', letterSpacing: 0.1 }}
          onMouseEnter={e => { e.currentTarget.style.background = 'rgba(239,68,68,.1)'; e.currentTarget.style.color = '#f87171' }}
          onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'rgba(248,113,113,.75)' }}>
          Log Out
        </button>
      </div>
    </div>
  )
}

/* ── Smart Sidebar (switches based on route) ─────────────────── */
function Sidebar({ onClose }) {
  const { user } = useAuth()
  const location = useLocation()
  // chapter_president always stays in RegularSidebar; only exec/admin enter AdminSidebar
  const isExecAdmin = ['exec', 'admin'].includes(user?.role)
  const inAdminSection = location.pathname.startsWith('/dashboard/admin')

  if (isExecAdmin && inAdminSection) {
    return <AdminSidebar onClose={onClose} />
  }
  return <RegularSidebar onClose={onClose} />
}

/* ── Layout shell ────────────────────────────────────────────── */
export default function DashboardLayout() {
  const [mobOpen, setMobOpen] = useState(false)

  return (
    <>
      {/* Desktop sidebar */}
      <aside data-lenis-prevent style={{ width: 250, background: '#0f0f16', position: 'fixed', left: 0, top: 0, height: '100vh', zIndex: 100, display: 'flex', flexDirection: 'column' }}>
        <Sidebar />
      </aside>

      {/* Mobile backdrop */}
      {mobOpen && (
        <div onClick={() => setMobOpen(false)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.55)', zIndex: 198 }} />
      )}

      {/* Mobile sidebar */}
      <aside data-lenis-prevent style={{ width: 250, background: '#0f0f16', position: 'fixed', left: mobOpen ? 0 : -260, top: 0, height: '100vh', zIndex: 199, display: 'flex', flexDirection: 'column', transition: 'left .25s cubic-bezier(.4,0,.2,1)' }} className="db-mob-sidebar">
        <Sidebar onClose={() => setMobOpen(false)} />
      </aside>

      {/* Content */}
      <div style={{ marginLeft: 250, minHeight: '100vh', '--nav': '0px', position: 'relative' }} className="db-content">
        {/* Mobile top bar */}
        <div className="db-topbar">
          <button onClick={() => setMobOpen(v => !v)} className={`db-hamburger${mobOpen ? ' is-open' : ''}`}>
            <span /><span /><span />
          </button>
          <span style={{ fontFamily: 'var(--serif)', fontWeight: 700, fontSize: 15, color: '#111118' }}>AUSI</span>
        </div>
        <Outlet />
      </div>

      <style>{`
        /* ── Sidebar nav hover (skip active/gold links) ───────── */
        aside nav a:not([aria-current="page"]):hover {
          color: rgba(255,255,255,.85) !important;
          background: rgba(255,255,255,.09) !important;
          border-radius: 8px;
        }

        /* ── Sidebar nav scrollbar ────────────────────────────── */
        nav::-webkit-scrollbar { width: 3px; }
        nav::-webkit-scrollbar-track { background: transparent; }
        nav::-webkit-scrollbar-thumb { background: rgba(255,255,255,.18); border-radius: 99px; }
        nav { scrollbar-width: thin; scrollbar-color: rgba(255,255,255,.18) transparent;
              overscroll-behavior: contain; -webkit-overflow-scrolling: touch; touch-action: pan-y; }

        /* ── Topbar (hidden on desktop, shown on mobile) ──────── */
        .db-topbar {
          display: none; align-items: center; gap: 12px;
          padding: 0 16px; height: 52px;
          border-bottom: 1px solid #e9eaec;
          box-shadow: 0 2px 8px rgba(0,0,0,.06);
          background: #fff; position: sticky; top: 0; z-index: 50;
        }
        .db-hamburger {
          width: 38px; height: 38px;
          display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 5px;
          background: #f3f4f6; border: 1.5px solid #e5e7eb; border-radius: 8px;
          cursor: pointer; padding: 0; flex-shrink: 0;
          transition: background .15s;
        }
        .db-hamburger:hover { background: #e9eaec; }
        .db-hamburger span {
          display: block; width: 18px; height: 2px;
          background: #111118; border-radius: 2px;
          transition: transform .22s ease, opacity .22s ease;
          transform-origin: center;
        }
        .db-hamburger.is-open span:nth-child(1) { transform: translateY(7px) rotate(45deg); }
        .db-hamburger.is-open span:nth-child(2) { opacity: 0; transform: scaleX(0); }
        .db-hamburger.is-open span:nth-child(3) { transform: translateY(-7px) rotate(-45deg); }

        /* ── Responsive page-inner wrapper ───────────────────── */
        /* Used by pages that don't use the .container class */
        .db-page-inner {
          padding: 32px 28px;
          max-width: 900px;
        }

        /* ── Responsive 2-col form grid ───────────────────────── */
        .db-form-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 18px;
        }

        /* ── Horizontal-scroll filter bars ───────────────────── */
        .hscroll { -webkit-overflow-scrolling: touch; scrollbar-width: none; }
        .hscroll::-webkit-scrollbar { display: none; }
        .hscroll > * { flex-shrink: 0; }

        /* ── Horizontal-scroll data tables ───────────────────── */
        .tscroll { overflow-x: auto; -webkit-overflow-scrolling: touch; }
        .tscroll::-webkit-scrollbar { height: 3px; }
        .tscroll::-webkit-scrollbar-track { background: transparent; }
        .tscroll::-webkit-scrollbar-thumb { background: rgba(0,0,0,.12); border-radius: 99px; }

        /* ── Sidebar / topbar breakpoint ─────────────────────── */
        @media (max-width: 768px) {
          .db-content  { margin-left: 0 !important; }
          .db-topbar   { display: flex !important; }
          aside:not(.db-mob-sidebar) { display: none !important; }

          /* Page inner: reduce horizontal padding on tablet/large phone */
          .db-page-inner { padding: 24px 20px; }
        }

        /* ── Mobile phone tweaks ──────────────────────────────── */
        @media (max-width: 540px) {
          /* Page inner: tight padding on narrow phones */
          .db-page-inner { padding: 20px 14px; }

          /* Form grids collapse to single column */
          .db-form-grid { grid-template-columns: 1fr !important; }

          /* Full-width items stay full-width even in single-col grid */
          .db-form-grid > [style*="grid-column"] { grid-column: 1 / -1 !important; }

          /* Dashboard hero section: tighter vertical padding */
          .db-hero { padding-top: 20px !important; padding-bottom: 16px !important; }

          /* Stat card grids: 2-column even on narrow phones */
          .stat-grid { grid-template-columns: repeat(2,1fr) !important; gap: 10px !important; }

          /* Reduce university student-row left indent */
          .stu-row { padding-left: 12px !important; }

          /* Filter rows: let them wrap to avoid overflow */
          .db-filter-row { flex-wrap: wrap !important; gap: 8px !important; }
          .db-filter-row input,
          .db-filter-row select { max-width: 100% !important; flex: 1 1 100% !important; min-width: 0 !important; }
        }
      `}</style>
    </>
  )
}
