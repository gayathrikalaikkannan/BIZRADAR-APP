import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { T, fontMono } from '../lib/theme'

export default function ProtectedRoute({ children, requireRole }) {
  const { session, role, loading, profileLoading } = useAuth()

  if (loading || (session && profileLoading)) {
    return (
      <div
        style={{
          minHeight: '100vh',
          background: T.bg,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <span
          style={{
            fontFamily: fontMono,
            color: T.muted,
            fontSize: 13,
            letterSpacing: 1,
          }}
        >
          CHECKING SESSION…
        </span>
      </div>
    )
  }

  if (!session) {
    return (
      <Navigate
        to={requireRole === 'admin' ? '/admin/login' : '/login'}
        replace
      />
    )
  }

  // Role loaded ஆன பிறகுதான் redirect செய்யும்
  if (requireRole && role && role !== requireRole) {
    return <Navigate to="/" replace />
  }

  return children
}
