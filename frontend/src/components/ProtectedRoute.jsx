import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { dashboardFor } from '../lib/roles'

export default function ProtectedRoute({ children, roles }) {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div style={{ minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center' }}>
        <div style={{ fontSize:14, color:'var(--g400)' }}>Loading…</div>
      </div>
    )
  }

  if (!user) return <Navigate to="/login" replace />

  if (roles && !roles.includes(user.role)) {
    return <Navigate to={dashboardFor(user.role)} replace />
  }

  return children
}
