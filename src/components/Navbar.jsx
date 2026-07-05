import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { T, fontMono, fontDisplay } from '../lib/theme'

export default function Navbar() {
  const { session, role, signOut } = useAuth()
  const navigate = useNavigate()

  const linkStyle = {
    fontFamily: fontMono, fontSize: 12, letterSpacing: 0.5,
    color: T.muted, textDecoration: 'none'
  }

  const handleLogout = async () => {
    await signOut()
    navigate('/logged-out')
  }

  return (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      maxWidth: 900, margin: '0 auto', padding: '18px 16px'
    }}>
      <Link to="/" style={{ ...linkStyle, display: 'flex', alignItems: 'center', gap: 8, color: T.ink, fontWeight: 700, fontFamily: fontDisplay, fontSize: 15 }}>
        <span style={{
          width: 26, height: 26, borderRadius: 8, background: T.gradient,
          display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13
        }}>📊</span>
        BizRadar
      </Link>
      <div style={{ display: 'flex', gap: 18, alignItems: 'center' }}>
        {!session && <Link to="/login" className="a4n-navlink" style={linkStyle}>LOGIN</Link>}
        {!session && <Link to="/admin/login" className="a4n-navlink" style={linkStyle}>ADMIN LOGIN</Link>}
        {session && role && (
          <span style={{
            fontFamily: fontMono, fontSize: 10.5, fontWeight: 700, letterSpacing: 0.5,
            color: role === 'admin' ? T.pink : T.amber,
            background: role === 'admin' ? 'rgba(13,148,136,0.10)' : T.amberDim,
            padding: '4px 10px', borderRadius: 20
          }}>
            {role === 'admin' ? '🛡 ADMIN' : '👤 USER'}
          </span>
        )}
        {session && role === 'user' && <Link to="/dashboard" className="a4n-navlink" style={linkStyle}>DASHBOARD</Link>}
        {session && role === 'admin' && <Link to="/admin/dashboard" className="a4n-navlink" style={linkStyle}>ADMIN PANEL</Link>}
        {session && (
          <button
            onClick={handleLogout}
            className="a4n-navlink"
            style={{ ...linkStyle, background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
          >
            LOGOUT
          </button>
        )}
      </div>
    </div>
  )
}
