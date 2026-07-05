import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabaseClient'
import { useAuth } from '../context/AuthContext'
import { T, fontDisplay, fontMono, fontBody, GlobalStyle, panelStyle, PanelLabel } from '../lib/theme'
import Navbar from '../components/Navbar'

const inputStyle = {
  width: '100%',
  background: '#F1F4F9',
  border: `1.5px solid ${T.border}`,
  borderRadius: 8,
  padding: '11px 14px',
  color: T.ink,
  fontFamily: fontMono,
  fontSize: 13.5,
  outline: 'none',
  marginBottom: 14
}

export default function AdminLogin() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const { logEvent } = useAuth()
  const navigate = useNavigate()

  const handleLogin = async (e) => {
    e.preventDefault()

    setError('')
    setLoading(true)

    const { data, error: loginError } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (loginError) {
      setLoading(false)
      setError(loginError.message)
      return
    }

    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', data.user.id)
      .single()

    console.log('User ID:', data.user.id)
    console.log('Profile:', profile)
    console.log('Profile Error:', profileError)
    console.log('Role:', profile?.role)

    if (profileError) {
      setLoading(false)
      setError(profileError.message)
      await supabase.auth.signOut()
      return
    }

    if (!profile || profile.role !== 'admin') {
      setLoading(false)
      setError('This account does not have admin access.')
      await supabase.auth.signOut()
      return
    }

    await logEvent('admin_login', { email })

    setLoading(false)
    navigate('/admin/dashboard')
  }

  return (
    <div
      style={{
        fontFamily: fontBody,
        background: T.bg,
        backgroundImage: T.bgGrad,
        minHeight: '100vh',
        color: T.ink
      }}
    >
      <GlobalStyle />
      <Navbar />

      <div style={{ maxWidth: 400, margin: '40px auto', padding: '0 16px' }}>
        <div
          style={panelStyle({
            padding: '30px 26px',
            borderColor: T.borderBright
          })}
        >
          <PanelLabel>Panel / Admin Access</PanelLabel>

          <h1
            style={{
              fontFamily: fontDisplay,
              fontSize: 22,
              fontWeight: 700,
              marginBottom: 20
            }}
          >
            Admin Sign In
          </h1>

          <form onSubmit={handleLogin}>
            <label
              style={{
                fontFamily: fontMono,
                fontSize: 11,
                color: T.muted,
                display: 'block',
                marginBottom: 6
              }}
            >
              EMAIL
            </label>

            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={inputStyle}
              placeholder="admin@example.com"
            />

            <label
              style={{
                fontFamily: fontMono,
                fontSize: 11,
                color: T.muted,
                display: 'block',
                marginBottom: 6
              }}
            >
              PASSWORD
            </label>

            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={inputStyle}
              placeholder="••••••••"
            />

            {error && (
              <p
                style={{
                  color: T.red,
                  fontSize: 12,
                  marginBottom: 12,
                  fontFamily: fontMono
                }}
              >
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              style={{
                width: '100%',
                background: T.amber,
                color: '#fff',
                border: 'none',
                borderRadius: 8,
                padding: 13,
                cursor: 'pointer',
                fontWeight: 700,
                fontFamily: fontMono
              }}
            >
              {loading ? 'VERIFYING...' : 'SIGN IN →'}
            </button>
          </form>

          <p
            style={{
              textAlign: 'center',
              marginTop: 18,
              color: T.muted,
              fontSize: 12
            }}
          >
            New admin?{' '}
            <Link to="/admin/signup" style={{ color: T.amber }}>
              Register with code
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}