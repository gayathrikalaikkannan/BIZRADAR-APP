import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabaseClient'
import { T, fontDisplay, fontMono, fontBody, GlobalStyle, panelStyle, PanelLabel } from '../lib/theme'
import Navbar from '../components/Navbar'

const inputStyle = {
  width: '100%', background: '#F1F4F9', border: `1.5px solid ${T.border}`, borderRadius: 8,
  padding: '11px 14px', color: T.ink, fontFamily: fontMono, fontSize: 13.5, outline: 'none', marginBottom: 14
}

export default function AdminSignup() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [code, setCode] = useState('')
  const [error, setError] = useState('')
  const [done, setDone] = useState(false)
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const handleSignup = async (e) => {
    e.preventDefault()
    setError(''); setLoading(true)

    const { data, error: signErr } = await supabase.auth.signUp({ email, password })
    if (signErr) { setLoading(false); setError(signErr.message); return }

    // grant_admin_role() relies on auth.uid() server-side, which only works if
    // this request carries an authenticated session. signUp() only returns a
    // session immediately when email confirmation is OFF for this project.
    // If it isn't, sign in explicitly first so the RPC call is authenticated.
    if (!data.session) {
      const { error: signInErr } = await supabase.auth.signInWithPassword({ email, password })
      if (signInErr) {
        setLoading(false)
        setError('Account created, but email confirmation is required before you can register as admin. Please confirm your email, then sign in and try registering again.')
        return
      }
    }

    // The secret code is verified INSIDE this Postgres function (security definer),
    // never compared on the client — see supabase_schema.sql for grant_admin_role().
    const { error: rpcErr } = await supabase.rpc('grant_admin_role', { secret_code: code })

    setLoading(false)
    if (rpcErr) {
      setError('Invalid admin code. Your account was created as a regular user.')
      return
    }
    setDone(true)
  }

  if (done) {
    return (
      <div style={{ fontFamily: fontBody, background: T.bg, backgroundImage: T.bgGrad, minHeight: '100vh', color: T.ink }}>
        <GlobalStyle />
        <Navbar />
        <div style={{ maxWidth: 400, margin: '60px auto', padding: '0 16px', textAlign: 'center' }}>
          <div style={panelStyle({ padding: '30px 26px' })}>
            <p style={{ fontFamily: fontMono, color: T.green, fontSize: 13, marginBottom: 10 }}>✓ ADMIN ACCOUNT CREATED</p>
            <p style={{ color: T.muted, fontSize: 13.5, marginBottom: 20 }}>
              Your admin account is ready. Sign in from the admin login page.
            </p>
            <Link to="/admin/login" className="a4n-btn-primary" style={{
              display: 'inline-block', background: T.amber, color: '#FFFFFF', borderRadius: 8,
              padding: '12px 24px', fontWeight: 700, fontFamily: fontMono, fontSize: 13, textDecoration: 'none'
            }}>
              GO TO ADMIN LOGIN →
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div style={{ fontFamily: fontBody, background: T.bg, backgroundImage: T.bgGrad, minHeight: '100vh', color: T.ink }}>
      <GlobalStyle />
      <Navbar />
      <div style={{ maxWidth: 400, margin: '40px auto', padding: '0 16px' }}>
        <div style={panelStyle({ padding: '30px 26px', borderColor: T.borderBright })}>
          <PanelLabel>Panel / Admin Registration</PanelLabel>
          <h1 style={{ fontFamily: fontDisplay, fontSize: 22, fontWeight: 700, marginBottom: 20 }}>Register as admin</h1>
          <form onSubmit={handleSignup}>
            <label style={{ fontFamily: fontMono, fontSize: 11, color: T.muted, display: 'block', marginBottom: 6 }}>EMAIL</label>
            <input type="email" required value={email} onChange={e => setEmail(e.target.value)} style={inputStyle} placeholder="admin@bizradar.com" />
            <label style={{ fontFamily: fontMono, fontSize: 11, color: T.muted, display: 'block', marginBottom: 6 }}>PASSWORD</label>
            <input type="password" required minLength={6} value={password} onChange={e => setPassword(e.target.value)} style={inputStyle} placeholder="At least 6 characters" />
            <label style={{ fontFamily: fontMono, fontSize: 11, color: T.muted, display: 'block', marginBottom: 6 }}>ADMIN SECRET CODE</label>
            <input required value={code} onChange={e => setCode(e.target.value)} style={inputStyle} placeholder="Enter the admin invite code" />

            {error && <p style={{ color: T.red, fontSize: 12.5, fontFamily: fontMono, marginBottom: 12 }}>{error}</p>}

            <button type="submit" disabled={loading} className="a4n-btn-primary" style={{
              width: '100%', background: T.amber, color: '#FFFFFF', border: 'none', borderRadius: 8,
              padding: 13, fontWeight: 700, fontSize: 13.5, cursor: 'pointer', fontFamily: fontMono, opacity: loading ? 0.6 : 1
            }}>
              {loading ? 'CREATING…' : 'REGISTER →'}
            </button>
          </form>
          <p style={{ fontSize: 12.5, color: T.muted, marginTop: 18, textAlign: 'center' }}>
            <Link to="/admin/login" style={{ color: T.amber }}>Already an admin? Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
