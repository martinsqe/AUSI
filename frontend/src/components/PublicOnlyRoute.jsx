import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { dashboardFor } from '../lib/roles'

export default function PublicOnlyRoute({ children }) {
  const { user, loading } = useAuth()

  if (loading) return null

  if (user) {
    return <Navigate to={dashboardFor(user.role)} replace />
  }

  return children
}
