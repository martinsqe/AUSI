import { createContext, useContext, useState, useEffect } from 'react'
import api from '../lib/api'
import { pushLocalContent, refreshSyncedContent } from '../lib/syncedStore'

// Staff roles that may have made admin edits on this device before content sync existed
const STAFF_ROLES = ['exec', 'admin', 'chapter_president']

// Once per browser: upload any pre-existing local admin edits to the server
function migrateLocalContentOnce(role) {
  if (!STAFF_ROLES.includes(role)) return
  try {
    if (localStorage.getItem('ausi_content_migrated') === '1') return
  } catch { /* ignore */ }
  pushLocalContent()
    .then(() => refreshSyncedContent())
    .then(() => { try { localStorage.setItem('ausi_content_migrated', '1') } catch { /* ignore */ } })
}

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try { return JSON.parse(localStorage.getItem('ausi_user') || 'null') } catch { return null }
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem('ausi_token')
    const cachedUser = localStorage.getItem('ausi_user')

    if (!token) { setLoading(false); return }

    // If we already have a cached user, unblock rendering immediately
    // and let the API call refresh the data in the background
    if (cachedUser) setLoading(false)

    api.get('/auth/me')
      .then(({ data }) => {
        setUser(data.user)
        localStorage.setItem('ausi_user', JSON.stringify(data.user))
        migrateLocalContentOnce(data.user?.role)
      })
      .catch((err) => {
        if (err.response?.status === 401) {
          // Token is expired/invalid — always clear session fully
          localStorage.removeItem('ausi_token')
          localStorage.removeItem('ausi_user')
          setUser(null)
        }
        // Network error: server unreachable — keep cached session so the
        // user isn't logged out just because the server is temporarily down
      })
      .finally(() => setLoading(false))
  }, [])

  const login = (token, userData) => {
    localStorage.setItem('ausi_token', token)
    localStorage.setItem('ausi_user', JSON.stringify(userData))
    setUser(userData)
    migrateLocalContentOnce(userData?.role)
  }

  const logout = () => {
    localStorage.removeItem('ausi_token')
    localStorage.removeItem('ausi_user')
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
