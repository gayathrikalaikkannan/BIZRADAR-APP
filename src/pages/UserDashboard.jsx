import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabaseClient'
import { useAuth } from '../context/AuthContext'
import { T, fontDisplay, fontMono, fontBody, GlobalStyle, panelStyle, PanelLabel } from '../lib/theme'
import ScoreGauge, { useCountUp } from '../components/ScoreGauge'
import RadarChart from '../components/RadarChart'
import Navbar from '../components/Navbar'

// Replace with BizRadar's real WhatsApp Business number (country code, no + or spaces).
// Prefilled text only works with a phone-number link (wa.me/<number>), not a channel link.
const WHATSAPP_PHONE_NUMBER = '919790443626'

const tipMap = {
  Online: 'Improve your online presence — get listed on Google Maps and directories. Businesses with strong online listings score 23pts higher on average.',
  Social: 'Stay active on Instagram and Facebook — post weekly. Active social profiles bring 18pts higher engagement scores.',
  Website: 'Get a professional website — businesses with websites score 23pts higher on average and build more customer trust.',
  Brand: 'Strengthen your brand identity — consistent logo, signage and messaging boosts recognition and trust.',
  Reviews: 'Collect more Google reviews — ask happy customers to leave a review. 10+ reviews significantly boost local visibility.',
}

const selectStyle = {
  width: '100%', background: '#F1F4F9', border: `1.5px solid ${T.border}`, borderRadius: 8,
  padding: '11px 14px', color: T.ink, fontFamily: fontMono, fontSize: 13.5, outline: 'none'
}

const STEP_LABELS = ['SELECT', 'SCORE', 'COMPETITORS', 'RADAR', 'AUDIT']

function StepRail({ step, total = 5 }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5, marginBottom: 26, flexWrap: 'wrap' }}>
      {STEP_LABELS.map((label, i) => {
        const n = i + 1
        const state = n === step ? 'active' : n < step ? 'done' : 'upcoming'
        return (
          <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
            <div style={{
              display: 'flex', alignItems: 'center', gap: 5, padding: '4px 8px', borderRadius: 4,
              border: `1px solid ${state === 'active' ? T.amber : T.border}`,
              background: state === 'active' ? T.amberDim : 'transparent', transition: 'all 0.3s ease'
            }}>
              <span style={{ fontFamily: fontMono, fontSize: 9.5, fontWeight: 700, color: state === 'active' ? T.amber : state === 'done' ? T.green : T.mutedDim }}>0{n}</span>
              <span style={{ fontFamily: fontMono, fontSize: 9.5, letterSpacing: 0.5, color: state === 'active' ? T.ink : state === 'done' ? T.muted : T.mutedDim }}>{label}</span>
            </div>
            {n < total && <div style={{ width: 10, height: 1, background: n < step ? T.green : T.border }} />}
          </div>
        )
      })}
    </div>
  )
}

function NavButtons({ onBack, onNext, nextLabel = 'NEXT →', backLabel = '← BACK', nextDisabled = false }) {
  return (
    <div style={{ display: 'flex', gap: 10 }}>
      {onBack && (
        <button onClick={onBack} className="a4n-btn-ghost" style={{
          flex: 1, background: 'none', border: `1px solid ${T.border}`, borderRadius: 8,
          padding: 13, fontWeight: 600, fontSize: 12.5, cursor: 'pointer', color: T.muted, fontFamily: fontMono
        }}>
          {backLabel}
        </button>
      )}
      {onNext && (
        <button onClick={onNext} disabled={nextDisabled} className="a4n-btn-primary" style={{
          flex: 2, background: T.amber, color: '#FFFFFF', border: 'none', borderRadius: 8,
          padding: 13, fontWeight: 700, fontSize: 12.5, cursor: nextDisabled ? 'not-allowed' : 'pointer',
          fontFamily: fontMono, opacity: nextDisabled ? 0.5 : 1
        }}>
          {nextLabel}
        </button>
      )}
    </div>
  )
}

export default function UserDashboard() {
  const { profile, logEvent } = useAuth()
  const navigate = useNavigate()
  const [all, setAll] = useState([])
  const [loading, setLoading] = useState(true)
  const [locationFilter, setLocationFilter] = useState('')
  const [businessId, setBusinessId] = useState('')
  const [step, setStep] = useState(1)
  const [revealed, setRevealed] = useState(false)

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      const { data, error } = await supabase.from('businesses').select('*').order('overall_score', { ascending: false })
      if (data) setAll(data)
      if (error) console.error(error)
      setLoading(false)
    }
    fetchData()
  }, [])

  const locations = useMemo(() => [...new Set(all.map(b => b.district).filter(Boolean))].sort(), [all])
  const businessOptions = useMemo(
    () => locationFilter ? all.filter(b => b.district === locationFilter) : all,
    [all, locationFilter]
  )
  const result = useMemo(() => all.find(b => String(b.id) === String(businessId)) || null, [all, businessId])

  useEffect(() => {
    if (step !== 2 || !result) { setRevealed(false); return }
    setRevealed(false)
    const t = setTimeout(() => setRevealed(true), 200)
    logEvent('dashboard_view', { business_name: result.business_name, location: result.district })
    return () => clearTimeout(t)
  }, [step, result?.id])

  const animatedScore = useCountUp(result ? result.overall_score : 0, 900, revealed)
  const competitors = result ? all.filter(b => b.id !== result.id).slice(0, 3) : []
  const rank = result ? all.findIndex(b => b.id === result.id) + 1 : null
  const scoreColor = result ? (result.overall_score >= 80 ? T.green : result.overall_score >= 60 ? T.orange : T.red) : T.amber

  const dims = result ? [
    { label: 'Online', val: result.online_score },
    { label: 'Social', val: result.social_score },
    { label: 'Website', val: result.website_score },
    { label: 'Brand', val: result.brand_score },
    { label: 'Reviews', val: result.review_score },
  ] : []
  const weakest = dims.length ? dims.reduce((min, d) => (d.val < min.val ? d : min), dims[0]) : null
  const tipText = weakest ? tipMap[weakest.label] : ''

  const waMessage = result
    ? encodeURIComponent(`Hi BizRadar, I'm ${result.business_name} (${result.district}). My scan score is ${result.overall_score}/100. I'd like a free audit.`)
    : ''

  const goStep = (n) => setStep(n)
  const restart = () => { setStep(1); setBusinessId(''); setLocationFilter('') }

  return (
    <div style={{ fontFamily: fontBody, background: T.bg, backgroundImage: T.bgGrad, minHeight: '100vh', color: T.ink }}>
      <GlobalStyle />
      <Navbar />

      <div style={{ maxWidth: 520, margin: '0 auto', padding: '10px 16px 60px' }}>
        <div style={{ textAlign: 'center', marginBottom: 20 }}>
          <p style={{ fontFamily: fontMono, fontSize: 10.5, color: T.amber, letterSpacing: 2 }}>USER DASHBOARD</p>
          <h1 style={{ fontFamily: fontDisplay, fontSize: 22, fontWeight: 700, marginTop: 6 }}>
            {profile?.email ? `Welcome, ${profile.email}` : 'Welcome'}
          </h1>
        </div>

        <StepRail step={step} />

        {/* PAGE 1: SELECT */}
        {step === 1 && (
          <div>
            <div style={panelStyle()}>
              <PanelLabel>Panel 01 / Select Business</PanelLabel>
              <label style={{ fontFamily: fontMono, fontSize: 11, color: T.muted, display: 'block', marginBottom: 6 }}>LOCATION</label>
              <select className="a4n-select" value={locationFilter}
                onChange={e => { setLocationFilter(e.target.value); setBusinessId('') }}
                style={{ ...selectStyle, marginBottom: 16 }}>
                <option value="">All locations</option>
                {locations.map(loc => <option key={loc} value={loc}>{loc}</option>)}
              </select>

              <label style={{ fontFamily: fontMono, fontSize: 11, color: T.muted, display: 'block', marginBottom: 6 }}>BUSINESS</label>
              <select className="a4n-select" value={businessId} onChange={e => setBusinessId(e.target.value)} style={selectStyle}>
                <option value="">{loading ? 'Loading…' : 'Select a business'}</option>
                {businessOptions.map(b => <option key={b.id} value={b.id}>{b.business_name}</option>)}
              </select>
            </div>
            <NavButtons nextDisabled={!result} onNext={() => goStep(2)} nextLabel="VIEW SCORE →" />
          </div>
        )}

        {/* PAGE 2: SCORE */}
        {step === 2 && result && (
          <div>
            <div style={{ ...panelStyle(), display: 'flex', gap: 20, alignItems: 'center', flexWrap: 'wrap', justifyContent: 'center', textAlign: 'center', padding: '32px 20px' }}>
              <ScoreGauge score={result.overall_score} revealed={revealed} color={scoreColor} animatedValue={animatedScore} />
              <div>
                <p style={{ fontFamily: fontMono, fontSize: 10.5, color: revealed ? scoreColor : T.mutedDim, letterSpacing: 1, marginBottom: 8 }}>
                  {revealed ? '● SCAN COMPLETE' : '○ SCANNING…'}
                </p>
                <h2 style={{ fontFamily: fontDisplay, fontSize: 20, fontWeight: 700 }}>{result.business_name}</h2>
                <p style={{ color: T.muted, fontSize: 12.5, margin: '4px 0 10px', fontFamily: fontMono }}>{result.category} · {result.district}</p>
                <span style={{ display: 'inline-block', background: T.amberDim, border: `1px solid ${T.amber}`, color: T.amber, borderRadius: 6, padding: '5px 12px', fontSize: 11.5, fontWeight: 600, fontFamily: fontMono }}>
                  {rank === 1 ? '★ ' : ''}RANK #{rank} / {all.length}
                </span>
              </div>
            </div>
            <NavButtons onBack={() => goStep(1)} onNext={() => goStep(3)} nextLabel="VIEW COMPETITORS →" />
          </div>
        )}

        {/* PAGE 3: COMPETITORS */}
        {step === 3 && result && (
          <div>
            <div style={panelStyle()}>
              <PanelLabel>Panel 03 / Top 3 Competitors</PanelLabel>
              {competitors.map((c, i) => (
                <div key={c.id} className="a4n-row" style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 8px', borderRadius: 6, borderBottom: i < competitors.length - 1 ? `1px solid ${T.border}` : 'none' }}>
                  <span style={{ fontFamily: fontMono, fontSize: 12, fontWeight: 700, color: T.muted, border: `1px solid ${T.border}`, borderRadius: 5, width: 28, height: 28, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>#{i + 1}</span>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontFamily: fontDisplay, fontSize: 14.5, fontWeight: 600 }}>{c.business_name}</div>
                    <div style={{ fontSize: 11.5, color: T.mutedDim, fontFamily: fontMono }}>{c.category}</div>
                  </div>
                  <span style={{ fontSize: 16, fontWeight: 700, color: T.amber, fontFamily: fontMono }}>{c.overall_score}</span>
                </div>
              ))}
            </div>

            <div style={{ ...panelStyle(), borderLeft: `3px solid ${T.amber}`, background: 'linear-gradient(135deg, #EFF4FB, #E6F5F3)' }}>
              <p style={{ fontFamily: fontMono, fontSize: 10.5, fontWeight: 700, color: T.amber, textTransform: 'uppercase', letterSpacing: 1.5, marginBottom: 10 }}>[ Improvement Tip]</p>
              <p style={{ fontSize: 14.5, lineHeight: 1.7, color: T.ink }}>{tipText}</p>
            </div>

            <NavButtons onBack={() => goStep(2)} onNext={() => goStep(4)} nextLabel="VIEW RADAR CHART →" />
          </div>
        )}

        {/* PAGE 4: RADAR */}
        {step === 4 && result && (
          <div>
            <div style={{ ...panelStyle(), textAlign: 'center' }}>
              <PanelLabel>Panel 04 / Score Dimensions</PanelLabel>
              <RadarChart dims={dims} animate={step === 4} />
            </div>
            <NavButtons onBack={() => goStep(3)} onNext={() => goStep(5)} nextLabel="GET FREE AUDIT →" />
          </div>
        )}

        {/* PAGE 5: WHATSAPP AUDIT */}
        {step === 5 && result && (
          <div>
            <div style={{ ...panelStyle(), textAlign: 'center', padding: '30px 22px' }}>
              <PanelLabel>Panel 05 / Free Audit</PanelLabel>
              <p style={{ fontSize: 14.5, lineHeight: 1.7, color: T.ink, marginBottom: 20 }}>
                Send your score straight to BizRadar on WhatsApp — message comes prefilled with
                your business name and score.
              </p>
              <a
                href={`https://wa.me/${WHATSAPP_PHONE_NUMBER}?text=${waMessage}`}
                target="_blank"
                rel="noreferrer"
                className="a4n-whatsapp"
                style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, background: '#25D366', color: '#08240F', borderRadius: 8, padding: 15, fontWeight: 700, fontSize: 14.5, textDecoration: 'none' }}
              >
                📲 Get Free Audit — Message BizRadar
              </a>
            </div>
            <NavButtons onBack={() => goStep(4)} onNext={restart} nextLabel="🔍 CHECK ANOTHER BUSINESS" />
          </div>
        )}

        {!loading && !result && step === 1 && all.length === 0 && (
          <p style={{ textAlign: 'center', color: T.muted, fontSize: 13, marginTop: 20 }}>No businesses found in the database yet.</p>
        )}
      </div>
    </div>
  )
}

