import { BrowserRouter, Routes, Route, Navigate, Outlet, useLocation } from 'react-router-dom'
import { useEffect } from 'react'
import Lenis from 'lenis'
import { AuthProvider, useAuth } from './context/AuthContext'
import ProtectedRoute from './components/ProtectedRoute'
import PublicOnlyRoute from './components/PublicOnlyRoute'
import DashboardLayout from './components/DashboardLayout'
import Navbar from './components/layout/Navbar'
import Footer from './components/layout/Footer'
import { dashboardFor } from './lib/roles'

/* ── Public pages ─────────────────────────────────────────── */
import Home          from './pages/Home'
import About         from './pages/About'
import Events        from './pages/Events'
import Resources     from './pages/Resources'
import Leadership    from './pages/Leadership'
import Universities  from './pages/Universities'
import Apply         from './pages/Apply'
import Login          from './pages/Login'
import Join           from './pages/Join'
import ForgotPassword from './pages/ForgotPassword'
import Innovations    from './pages/Innovations'

/* ── Dashboard pages ──────────────────────────────────────── */
import MemberDashboard    from './pages/dashboard/MemberDashboard'
import PresidentDashboard from './pages/dashboard/PresidentDashboard'
import RepDashboard       from './pages/dashboard/RepDashboard'
import RepReports         from './pages/dashboard/RepReports'
import RepEvents          from './pages/dashboard/RepEvents'
import DashboardEvents    from './pages/dashboard/DashboardEvents'
import Cabinet            from './pages/dashboard/Cabinet'
import Announcements      from './pages/dashboard/Announcements'
import Marketplace        from './pages/dashboard/Marketplace'
import Voting             from './pages/dashboard/Voting'
import DashboardResources from './pages/dashboard/DashboardResources'
import Emergency          from './pages/dashboard/Emergency'
import Cities             from './pages/dashboard/Cities'
import Feedback           from './pages/dashboard/Feedback'
import Profile            from './pages/dashboard/Profile'
import DashboardSettings     from './pages/dashboard/DashboardSettings'
import DashboardUniversities from './pages/dashboard/DashboardUniversities'
import AnonymousReport       from './pages/dashboard/AnonymousReport'
import ImmigrationUpdates    from './pages/dashboard/ImmigrationUpdates'
import GovernmentNotices     from './pages/dashboard/GovernmentNotices'
import EmbassyNotices        from './pages/dashboard/EmbassyNotices'

/* ── Admin pages ──────────────────────────────────────────── */
import AdminHome           from './pages/dashboard/admin/AdminHome'
import AdminStudents       from './pages/dashboard/admin/AdminStudents'
import AdminAdmissions     from './pages/dashboard/admin/AdminAdmissions'
import AdminRequests       from './pages/dashboard/admin/AdminRequests'
import AdminCabinet        from './pages/dashboard/admin/AdminCabinet'
import AdminEmbassyNotices from './pages/dashboard/admin/AdminEmbassyNotices'
import AdminImmigration    from './pages/dashboard/admin/AdminImmigration'
import AdminGovernment     from './pages/dashboard/admin/AdminGovernment'
import AdminUniversities   from './pages/dashboard/admin/AdminUniversities'
import AdminReports        from './pages/dashboard/admin/AdminReports'
import AdminEvents         from './pages/dashboard/admin/AdminEvents'
import AdminVoting         from './pages/dashboard/admin/AdminVoting'
import AdminStatistics     from './pages/dashboard/admin/AdminStatistics'
import AdminResources      from './pages/dashboard/admin/AdminResources'
import AdminAnnouncements  from './pages/dashboard/admin/AdminAnnouncements'
import AdminFeedback       from './pages/dashboard/admin/AdminFeedback'
import AdminInnovations   from './pages/dashboard/admin/AdminInnovations'

/* ── Utilities ────────────────────────────────────────────── */
function SmoothScroll() {
  useEffect(() => {
    const lenis = new Lenis({ duration: 1.15, easing: t => Math.min(1, 1.001 - Math.pow(2, -10 * t)), smoothWheel: true, prevent: node => node.closest('aside') !== null })
    let rafId
    const raf = time => { lenis.raf(time); rafId = requestAnimationFrame(raf) }
    rafId = requestAnimationFrame(raf)
    return () => { cancelAnimationFrame(rafId); lenis.destroy() }
  }, [])
  return null
}

function ScrollToTop() {
  const { pathname } = useLocation()
  useEffect(() => { window.scrollTo(0, 0) }, [pathname])
  return null
}

function PublicShell() {
  return (<><Navbar /><main><Outlet /></main><Footer /></>)
}

function RoleRoute({ roles, children }) {
  const { user } = useAuth()
  if (!roles.includes(user?.role)) return <Navigate to={dashboardFor(user?.role)} replace />
  return children
}

function RoleHome() {
  const { user } = useAuth()
  return <Navigate to={dashboardFor(user?.role)} replace />
}

/* ── App ──────────────────────────────────────────────────── */
export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <SmoothScroll />
        <ScrollToTop />
        <Routes>

          {/* Public routes */}
          <Route element={<PublicShell />}>
            <Route path="/"              element={<PublicOnlyRoute><Home /></PublicOnlyRoute>} />
            <Route path="/about"         element={<PublicOnlyRoute><About /></PublicOnlyRoute>} />
            <Route path="/events"        element={<PublicOnlyRoute><Events /></PublicOnlyRoute>} />
            <Route path="/resources"     element={<PublicOnlyRoute><Resources /></PublicOnlyRoute>} />
            <Route path="/leadership"    element={<PublicOnlyRoute><Leadership /></PublicOnlyRoute>} />
            <Route path="/universities"  element={<PublicOnlyRoute><Universities /></PublicOnlyRoute>} />
            <Route path="/apply"         element={<PublicOnlyRoute><Apply /></PublicOnlyRoute>} />
            <Route path="/login"            element={<PublicOnlyRoute><Login /></PublicOnlyRoute>} />
            <Route path="/join"            element={<PublicOnlyRoute><Join /></PublicOnlyRoute>} />
            <Route path="/forgot-password"  element={<PublicOnlyRoute><ForgotPassword /></PublicOnlyRoute>} />
            <Route path="/innovations"      element={<PublicOnlyRoute><Innovations /></PublicOnlyRoute>} />
            <Route path="/opportunities" element={<Navigate to="/resources" replace />} />
          </Route>

          {/* Dashboard routes */}
          <Route path="/dashboard" element={<ProtectedRoute><DashboardLayout /></ProtectedRoute>}>

            <Route index element={<RoleHome />} />
            <Route path="home"      element={<MemberDashboard />} />
            <Route path="president" element={<RoleRoute roles={['chapter_president','admin']}><PresidentDashboard /></RoleRoute>} />
            <Route path="rep"       element={<RoleRoute roles={['university_rep','chapter_president','admin']}><RepDashboard /></RoleRoute>} />

            {/* ── Admin section (nested) ── */}
            <Route path="admin" element={<RoleRoute roles={['exec','admin','chapter_president']}><Outlet /></RoleRoute>}>
              <Route index            element={<AdminHome />} />
              <Route path="students"  element={<AdminStudents />} />
              <Route path="admissions"element={<RoleRoute roles={['admin','chapter_president']}><AdminAdmissions /></RoleRoute>} />
              <Route path="requests"  element={<AdminRequests />} />
              <Route path="events"    element={<AdminEvents />} />
              <Route path="voting"    element={<AdminVoting />} />
              <Route path="cabinet"   element={<AdminCabinet />} />
              <Route path="embassy"   element={<AdminEmbassyNotices />} />
              <Route path="immigration" element={<AdminImmigration />} />
              <Route path="government"  element={<AdminGovernment />} />
              <Route path="universities" element={<RoleRoute roles={['admin']}><AdminUniversities /></RoleRoute>} />
              <Route path="reports"   element={<AdminReports />} />
              <Route path="statistics" element={<AdminStatistics />} />
              <Route path="resources"      element={<AdminResources />} />
              <Route path="announcements" element={<AdminAnnouncements />} />
              <Route path="feedback"      element={<AdminFeedback />} />
              <Route path="innovations"   element={<AdminInnovations />} />
            </Route>

            {/* Shared sidebar pages */}
            <Route path="events"        element={<DashboardEvents />} />
            <Route path="cabinet"       element={<Cabinet />} />
            <Route path="announcements" element={<Announcements />} />
            <Route path="marketplace"   element={<Marketplace />} />
            <Route path="voting"        element={<Voting />} />
            <Route path="resources"     element={<DashboardResources />} />
            <Route path="emergency"     element={<Emergency />} />
            <Route path="cities"        element={<Cities />} />
            <Route path="universities"  element={<DashboardUniversities />} />
            <Route path="report"        element={<AnonymousReport />} />
            <Route path="requests"      element={<RoleRoute roles={['exec','admin','chapter_president']}><AdminRequests /></RoleRoute>} />
            <Route path="embassy"       element={<EmbassyNotices />} />
            <Route path="immigration"   element={<ImmigrationUpdates />} />
            <Route path="government"    element={<GovernmentNotices />} />
            <Route path="statistics"    element={<RoleRoute roles={['exec','admin','chapter_president']}><AdminStatistics /></RoleRoute>} />
            <Route path="reports"       element={<RoleRoute roles={['exec','admin','chapter_president']}><AdminReports /></RoleRoute>} />

            {/* ── Manage section — president/exec/admin without sidebar switch ── */}
            <Route path="manage" element={<RoleRoute roles={['exec','admin','chapter_president']}><Outlet /></RoleRoute>}>
              <Route path="announcements" element={<AdminAnnouncements />} />
              <Route path="events"        element={<AdminEvents />} />
              <Route path="resources"     element={<AdminResources />} />
              <Route path="embassy"       element={<AdminEmbassyNotices />} />
              <Route path="immigration"   element={<AdminImmigration />} />
              <Route path="government"    element={<AdminGovernment />} />
              <Route path="cabinet"       element={<AdminCabinet />} />
              <Route path="universities"  element={<RoleRoute roles={['admin']}><AdminUniversities /></RoleRoute>} />
              <Route path="feedback"      element={<AdminFeedback />} />
            </Route>

            <Route path="rep-reports"   element={<RoleRoute roles={['university_rep']}><RepReports /></RoleRoute>} />
            <Route path="rep-events"    element={<RoleRoute roles={['university_rep']}><RepEvents /></RoleRoute>} />
            <Route path="feedback"      element={<Feedback />} />
            <Route path="profile"       element={<Profile />} />
            <Route path="settings"      element={<DashboardSettings />} />
          </Route>

        </Routes>
      </AuthProvider>
    </BrowserRouter>
  )
}
