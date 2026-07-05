import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabaseClient'
import { T, fontDisplay, fontMono, fontBody, GlobalStyle, panelStyle, PanelLabel } from '../lib/theme'
import Navbar from '../components/Navbar'

const inputStyle = {
  width: '100%', background: '#F1F4F9', border: `1.5px solid ${T.border}`, borderRadius: 8,
  padding: '11px 14px', color: T.ink, fontFamily: fontMono, fontSize: 13.5, outline: 'none', marginBottom: 14
}

export default function UserSignup() {
  const [businessName, setBusinessName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [done, setDone] = useState(false)
  const [needsEmailConfirm, setNeedsEmailConfirm] = useState(false)
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const handleSignup = async (e) => {
    e.preventDefault()
    setError(''); setLoading(true)

    const { data, error: signErr } = await supabase.auth.signUp({ email, password })
    if (signErr) { setLoading(false); setError(signErr.message); return }

    if (data.user && businessName) {
      await supabase.from('profiles').update({ business_name: businessName }).eq('id', data.user.id)
    }

    setLoading(false)

    // If Supabase already returned a live session, email confirmation is OFF
    // in this project — the account is ready to use immediately.
    if (data.session) {
      navigate('/dashboard')
      return
    }

    // Otherwise (email confirmation is ON), they must confirm before logging in.
    setNeedsEmailConfirm(true)
    setDone(true)
  }

  if (done) {
    return (
      <div style={{ fontFamily: fontBody, background: T.bg, backgroundImage: T.bgGrad, minHeight: '100vh', color: T.ink }}>
        <GlobalStyle />
        <Navbar />
        <div style={{ maxWidth: 400, margin: '60px auto', padding: '0 16px', textAlign: 'center' }}>
          <div style={panelStyle({ padding: '30px 26px' })}>
            <p style={{ fontFamily: fontMono, color: T.green, fontSize: 13, marginBottom: 10 }}>✓ ACCOUNT CREATED</p>
            <p style={{ color: T.muted, fontSize: 13.5, marginBottom: 20 }}>
              {needsEmailConfirm
                ? 'Check your email to confirm your account, then sign in.'
                : 'Your account is ready. Sign in to continue.'}
            </p>
            <Link to="/login" className="a4n-btn-primary" style={{
              display: 'inline-block', background: T.amber, color: '#FFFFFF', borderRadius: 8,
              padding: '12px 24px', fontWeight: 700, fontFamily: fontMono, fontSize: 13, textDecoration: 'none'
            }}>
              GO TO LOGIN →
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
        <div style={panelStyle({ padding: '30px 26px' })}>
          <PanelLabel>Panel / User Signup</PanelLabel>
          <h1 style={{ fontFamily: fontDisplay, fontSize: 22, fontWeight: 700, marginBottom: 20 }}>Create account</h1>
          <form onSubmit={handleSignup}>
            <label style={{ fontFamily: fontMono, fontSize: 11, color: T.muted, display: 'block', marginBottom: 6 }}>BUSINESS NAME (OPTIONAL)</label>
            <input value={businessName} onChange={e => setBusinessName(e.target.value)} style={inputStyle} placeholder="Your business name" />
            <label style={{ fontFamily: fontMono, fontSize: 11, color: T.muted, display: 'block', marginBottom: 6 }}>EMAIL</label>
            <input type="email" required value={email} onChange={e => setEmail(e.target.value)} style={inputStyle} placeholder="you@business.com" />
            <label style={{ fontFamily: fontMono, fontSize: 11, color: T.muted, display: 'block', marginBottom: 6 }}>PASSWORD</label>
            <input type="password" required minLength={6} value={password} onChange={e => setPassword(e.target.value)} style={inputStyle} placeholder="At least 6 characters" />

            {error && <p style={{ color: T.red, fontSize: 12.5, fontFamily: fontMono, marginBottom: 12 }}>{error}</p>}

            <button type="submit" disabled={loading} className="a4n-btn-primary" style={{
              width: '100%', background: T.amber, color: '#FFFFFF', border: 'none', borderRadius: 8,
              padding: 13, fontWeight: 700, fontSize: 13.5, cursor: 'pointer', fontFamily: fontMono, opacity: loading ? 0.6 : 1
            }}>
              {loading ? 'CREATING…' : 'CREATE ACCOUNT →'}
            </button>
          </form>
          <p style={{ fontSize: 12.5, color: T.muted, marginTop: 18, textAlign: 'center' }}>
            Already have an account? <Link to="/login" style={{ color: T.amber }}>Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
