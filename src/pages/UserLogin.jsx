import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabaseClient'
import { useAuth } from '../context/AuthContext'
import { T, fontDisplay, fontMono, fontBody, GlobalStyle, panelStyle, PanelLabel } from '../lib/theme'
import Navbar from '../components/Navbar'

const inputStyle = {
  width: '100%', background: '#F1F4F9', border: `1.5px solid ${T.border}`, borderRadius: 8,
  padding: '11px 14px', color: T.ink, fontFamily: fontMono, fontSize: 13.5, outline: 'none', marginBottom: 14
}

export default function UserLogin() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { logEvent } = useAuth()
  const navigate = useNavigate()

  const handleLogin = async (e) => {
    e.preventDefault()
    setError(''); setLoading(true)
    const { error: err } = await supabase.auth.signInWithPassword({ email, password })
    setLoading(false)
    if (err) { setError(err.message); return }
    await logEvent('login', { email })
    navigate('/dashboard')
  }

  return (
    <div style={{ fontFamily: fontBody, background: T.bg, backgroundImage: T.bgGrad, minHeight: '100vh', color: T.ink }}>
      <GlobalStyle />
      <Navbar />
      <div style={{ maxWidth: 400, margin: '40px auto', padding: '0 16px' }}>
        <div style={panelStyle({ padding: '30px 26px' })}>
          <PanelLabel>Panel / User Login</PanelLabel>
          <h1 style={{ fontFamily: fontDisplay, fontSize: 22, fontWeight: 700, marginBottom: 20 }}>Sign in</h1>
          <form onSubmit={handleLogin}>
            <label style={{ fontFamily: fontMono, fontSize: 11, color: T.muted, display: 'block', marginBottom: 6 }}>EMAIL</label>
            <input type="email" required value={email} onChange={e => setEmail(e.target.value)} style={inputStyle} placeholder="you@business.com" />
            <label style={{ fontFamily: fontMono, fontSize: 11, color: T.muted, display: 'block', marginBottom: 6 }}>PASSWORD</label>
            <input type="password" required value={password} onChange={e => setPassword(e.target.value)} style={inputStyle} placeholder="••••••••" />

            {error && <p style={{ color: T.red, fontSize: 12.5, fontFamily: fontMono, marginBottom: 12 }}>{error}</p>}

            <button type="submit" disabled={loading} className="a4n-btn-primary" style={{
              width: '100%', background: T.amber, color: '#FFFFFF', border: 'none', borderRadius: 8,
              padding: 13, fontWeight: 700, fontSize: 13.5, cursor: 'pointer', fontFamily: fontMono, opacity: loading ? 0.6 : 1
            }}>
              {loading ? 'SIGNING IN…' : 'SIGN IN →'}
            </button>
          </form>
          <p style={{ fontSize: 12.5, color: T.muted, marginTop: 18, textAlign: 'center' }}>
            No account? <Link to="/signup" style={{ color: T.amber }}>Create one</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
