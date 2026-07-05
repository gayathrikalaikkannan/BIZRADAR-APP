import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { T, fontDisplay, fontMono, fontBody, GlobalStyle, panelStyle } from '../lib/theme'
import Navbar from '../components/Navbar'

export default function LoggedOut() {
  useEffect(() => {
    // Scroll to top so the confirmation is always visible immediately.
    window.scrollTo(0, 0)
  }, [])

  return (
    <div style={{ fontFamily: fontBody, background: T.bg, backgroundImage: T.bgGrad, minHeight: '100vh', color: T.ink }}>
      <GlobalStyle />
      <Navbar />
      <div style={{ maxWidth: 400, margin: '60px auto', padding: '0 16px', textAlign: 'center' }}>
        <div style={panelStyle({ padding: '34px 26px' })}>
          <p style={{ fontFamily: fontMono, color: T.green, fontSize: 13, marginBottom: 10 }}>✓ SIGNED OUT</p>
          <h1 style={{ fontFamily: fontDisplay, fontSize: 20, fontWeight: 700, marginBottom: 10 }}>You've been logged out</h1>
          <p style={{ color: T.muted, fontSize: 13.5, marginBottom: 24 }}>
            Your session has ended. Come back anytime.
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <Link to="/login" className="a4n-btn-primary" style={{
              display: 'block', background: T.amber, color: '#FFFFFF', borderRadius: 8,
              padding: '12px 24px', fontWeight: 700, fontFamily: fontMono, fontSize: 13, textDecoration: 'none'
            }}>
              USER LOGIN →
            </Link>
            <Link to="/admin/login" className="a4n-btn-ghost" style={{
              display: 'block', border: `1px solid ${T.border}`, color: T.muted, borderRadius: 8,
              padding: '12px 24px', fontFamily: fontMono, fontSize: 12.5, textDecoration: 'none'
            }}>
              ADMIN LOGIN →
            </Link>
            <Link to="/" style={{ fontFamily: fontMono, fontSize: 12, color: T.mutedDim, marginTop: 6, textDecoration: 'none' }}>
              ← Back to home
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
