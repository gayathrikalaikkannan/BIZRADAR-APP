import { Link } from 'react-router-dom'
import { T, fontDisplay, fontMono, fontBody, GlobalStyle } from '../lib/theme'
import Navbar from '../components/Navbar'
import { useReveal } from '../hooks/useReveal'

function Reveal({ children, delay = 0 }) {
  const [ref, visible] = useReveal()
  return (
    <div ref={ref} className={`a4n-reveal ${visible ? 'is-visible' : ''}`} style={{ transitionDelay: `${delay}ms` }}>
      {children}
    </div>
  )
}

// What the app actually does, in plain terms -- no vague benefit language.
const features = [
  { icon: '🔍', text: 'Search any business by name, category, or location' },
  { icon: '📊', text: 'Get an overall score out of 100' },
  { icon: '📈', text: 'See a 5-signal breakdown: Online, Social, Website, Brand, Reviews' },
  { icon: '🏆', text: 'Compare your score against your top 3 nearby competitors' },
  { icon: '🎯', text: 'Log in to see your #1 recommended fix' },
  { icon: '📲', text: 'Request a free audit from our team over WhatsApp' },
]

export default function Home() {
  return (
    <div style={{ fontFamily: fontBody, background: T.bg, backgroundImage: T.bgGrad, minHeight: '100vh', color: T.ink }}>
      <GlobalStyle />
      <Navbar />

      {/* Hero */}
      <div style={{ maxWidth: 680, margin: '0 auto', textAlign: 'center', padding: '48px 20px 40px' }}>
        <div style={{
          display: 'inline-block', background: T.amberDim, color: T.amber, borderRadius: 20,
          padding: '6px 16px', fontSize: 12.5, fontWeight: 700, marginBottom: 20
        }}>
          Business Health &amp; Competitor Intelligence
        </div>
        <h1 style={{
          fontFamily: fontDisplay, fontSize: 'clamp(28px, 5.5vw, 40px)', fontWeight: 800,
          letterSpacing: -0.5, lineHeight: 1.18, marginBottom: 16
        }}>
          Know exactly where your<br />business stands
        </h1>
        <p style={{ color: T.muted, fontSize: 15.5, lineHeight: 1.7, maxWidth: 480, margin: '0 auto' }}>
          BizRadar is a free tool that scores any business, compares it to nearby
          competitors, and tells you exactly what to fix next.
        </p>
      </div>

      {/* What the app does -- plain feature list */}
      <div style={{ maxWidth: 640, margin: '0 auto', padding: '0 20px 56px' }}>
        <Reveal>
          <div style={{
            background: T.panel, border: `1px solid ${T.border}`, borderRadius: 16, padding: '30px 26px',
            boxShadow: '0 4px 16px rgba(15,44,76,0.05)'
          }}>
            <h2 style={{ fontFamily: fontDisplay, fontSize: 17, fontWeight: 700, marginBottom: 20 }}>
              What BizRadar does
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {features.map((f, i) => (
                <div key={f.text} style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                  <span style={{
                    width: 30, height: 30, borderRadius: 8, background: T.amberDim, flexShrink: 0,
                    display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14
                  }}>{f.icon}</span>
                  <span style={{ color: T.ink, fontSize: 13.5, lineHeight: 1.6, paddingTop: 4 }}>{f.text}</span>
                </div>
              ))}
            </div>
          </div>
        </Reveal>
      </div>

      {/* Access: User + Admin */}
      <div style={{ maxWidth: 760, margin: '0 auto', padding: '0 20px 80px' }}>
        <Reveal>
          <p style={{ fontFamily: fontMono, fontSize: 11.5, color: T.pink, letterSpacing: 1.5, textAlign: 'center', marginBottom: 8, fontWeight: 700 }}>
            GET STARTED
          </p>
          <h2 style={{ fontFamily: fontDisplay, fontSize: 22, fontWeight: 800, textAlign: 'center', marginBottom: 28 }}>
            Choose how you want to access BizRadar
          </h2>
        </Reveal>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 18 }}>

          {/* User card */}
          <Reveal>
            <div style={{
              background: T.panel, border: `1.5px solid ${T.border}`, borderRadius: 18, padding: '30px 26px',
              display: 'flex', flexDirection: 'column', height: '100%', boxShadow: '0 4px 20px rgba(15,44,76,0.06)'
            }}>
              <div style={{
                width: 48, height: 48, borderRadius: 12, background: T.amberDim,
                display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, marginBottom: 16
              }}>
                👤
              </div>
              <h3 style={{ fontFamily: fontDisplay, fontSize: 18, fontWeight: 700, marginBottom: 8 }}>Business Owner</h3>
              <p style={{ color: T.muted, fontSize: 13, lineHeight: 1.6, marginBottom: 22, flex: 1 }}>
                Run scans, see your score, compare with nearby competitors, get your
                top fix, and request a free audit.
              </p>
              <Link
                to="/login"
                className="a4n-btn-primary"
                style={{
                  background: T.gradient, color: '#FFFFFF', borderRadius: 10, padding: '13px 20px',
                  fontWeight: 700, fontSize: 14, fontFamily: fontDisplay, textDecoration: 'none',
                  textAlign: 'center', marginBottom: 12
                }}
              >
                User Login
              </Link>
              <p style={{ textAlign: 'center', fontSize: 12.5, color: T.muted, margin: 0 }}>
                New here? <Link to="/signup" style={{ color: T.amber, fontWeight: 600, textDecoration: 'underline' }}>Create an account</Link>
              </p>
            </div>
          </Reveal>

          {/* Admin card */}
          <Reveal delay={90}>
            <div style={{
              background: T.panel, border: `1.5px solid ${T.border}`, borderRadius: 18, padding: '30px 26px',
              display: 'flex', flexDirection: 'column', height: '100%', boxShadow: '0 4px 20px rgba(15,44,76,0.06)'
            }}>
              <div style={{
                width: 48, height: 48, borderRadius: 12, background: 'rgba(13,148,136,0.10)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, marginBottom: 16
              }}>
                🛡️
              </div>
              <h3 style={{ fontFamily: fontDisplay, fontSize: 18, fontWeight: 700, marginBottom: 8 }}>Admin</h3>
              <p style={{ color: T.muted, fontSize: 13, lineHeight: 1.6, marginBottom: 22, flex: 1 }}>
                Monitor platform activity, see who's signed up, and track every scan
                run across the system.
              </p>
              <Link
                to="/admin/login"
                className="a4n-btn-ghost"
                style={{
                  border: `1.5px solid ${T.pink}`, color: T.pink, background: 'rgba(13,148,136,0.06)',
                  borderRadius: 10, padding: '13px 20px', fontWeight: 700, fontSize: 14,
                  fontFamily: fontDisplay, textDecoration: 'none', textAlign: 'center', marginBottom: 12
                }}
              >
                Admin Login
              </Link>
              <p style={{ textAlign: 'center', fontSize: 12.5, color: T.muted, margin: 0 }}>
                Need admin access? <Link to="/admin/signup" style={{ color: T.pink, fontWeight: 600, textDecoration: 'underline' }}>Register with code</Link>
              </p>
            </div>
          </Reveal>
        </div>
      </div>

      <div style={{ textAlign: 'center', padding: '10px 20px 30px', color: T.mutedDim, fontSize: 12 }}>
        Powered by BizRadar
      </div>
    </div>
  )
}