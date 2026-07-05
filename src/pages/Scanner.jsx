import { useEffect, useMemo, useState } from 'react'
import { supabase } from '../lib/supabaseClient'
import { useAuth } from '../context/AuthContext'
import { T, fontDisplay, fontMono, fontBody, GlobalStyle, panelStyle, PanelLabel } from '../lib/theme'
import ScoreGauge, { useCountUp } from '../components/ScoreGauge'
import RadarChart from '../components/RadarChart'
import Navbar from '../components/Navbar'

const WHATSAPP_CHANNEL_URL = ''

const tipMap = {
  Online: 'Improve your online presence — get listed on Google Maps and directories. Businesses with strong online listings score 23pts higher on average.',
  Social: 'Stay active on Instagram and Facebook — post weekly. Active social profiles bring 18pts higher engagement scores.',
  Website: 'Get a professional website — businesses with websites score 23pts higher on average and build more customer trust.',
  Brand: 'Strengthen your brand identity — consistent logo, signage and messaging boosts recognition and trust.',
  Reviews: 'Collect more Google reviews — ask happy customers to leave a review. 10+ reviews significantly boost local visibility.',
}

function StepRail({ step }) {
  const steps = ['SEARCH', 'SCORE', 'INSIGHTS']
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, marginBottom: 30 }}>
      {steps.map((label, i) => {
        const n = i + 1
        const state = n === step ? 'active' : n < step ? 'done' : 'upcoming'
        return (
          <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <div style={{
              display: 'flex', alignItems: 'center', gap: 6, padding: '5px 10px', borderRadius: 4,
              border: `1px solid ${state === 'active' ? T.amber : T.border}`,
              background: state === 'active' ? T.amberDim : 'transparent', transition: 'all 0.3s ease'
            }}>
              <span style={{ fontFamily: fontMono, fontSize: 10, fontWeight: 700, color: state === 'active' ? T.amber : state === 'done' ? T.green : T.mutedDim }}>0{n}</span>
              <span style={{ fontFamily: fontMono, fontSize: 10, letterSpacing: 1, color: state === 'active' ? T.ink : state === 'done' ? T.muted : T.mutedDim }}>{label}</span>
            </div>
            {n < 3 && <div style={{ width: 16, height: 1, background: n < step ? T.green : T.border }} />}
          </div>
        )
      })}
    </div>
  )
}

const selectStyle = {
  width: '100%', background: '#F1F4F9', border: `1.5px solid ${T.border}`, borderRadius: 8,
  padding: '11px 14px', color: T.ink, fontFamily: fontMono, fontSize: 13.5, outline: 'none'
}

export default function Scanner() {
  const { logEvent } = useAuth()
  const [all, setAll] = useState([])
  const [loading, setLoading] = useState(true)
  const [locationFilter, setLocationFilter] = useState('')
  const [businessId, setBusinessId] = useState('')
  const [search, setSearch] = useState('')
  const [result, setResult] = useState(null)
  const [notFound, setNotFound] = useState(false)
  const [step, setStep] = useState(1)
  const [scoreRevealed, setScoreRevealed] = useState(false)

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

  const filteredByLocation = useMemo(
    () => locationFilter ? all.filter(b => b.district === locationFilter) : all,
    [all, locationFilter]
  )

  const suggestions = search.trim()
    ? filteredByLocation.filter(b => b.business_name.toLowerCase().includes(search.toLowerCase())).slice(0, 6)
    : []

  useEffect(() => {
    if (step === 2 && result) {
      setScoreRevealed(false)
      const t = setTimeout(() => setScoreRevealed(true), 200)
      return () => clearTimeout(t)
    }
  }, [step, result])

  const animatedScore = useCountUp(result ? result.overall_score : 0, 900, scoreRevealed)

  const selectBusiness = (b) => {
    setResult(b); setNotFound(false); setBusinessId(b.id); setSearch(b.business_name); setStep(2)
    logEvent('public_scan', { business_name: b.business_name, location: b.district })
  }

  const handleSearch = () => {
    const found = filteredByLocation.find(b => b.business_name.toLowerCase().includes(search.toLowerCase()))
    if (found) selectBusiness(found)
    else { setResult(null); setNotFound(true) }
  }

  const handleReset = () => {
    setStep(1); setResult(null); setSearch(''); setNotFound(false); setBusinessId(''); setLocationFilter('')
  }

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

  return (
    <div style={{ fontFamily: fontBody, background: T.bg, backgroundImage: T.bgGrad, minHeight: '100vh', color: T.ink }}>
      <GlobalStyle />
      <Navbar />

      <div style={{ textAlign: 'center', marginBottom: 26, padding: '10px 16px 0' }}>
        <h1 style={{ fontFamily: fontDisplay, fontSize: 26, fontWeight: 700 }}>Run a Scan</h1>
        <p style={{ color: T.muted, fontSize: 13.5, marginTop: 6 }}>Pick a location, find your business, see the score.</p>
      </div>

      <StepRail step={step} />

      <div style={{ maxWidth: 560, margin: '0 auto', padding: '0 16px 60px' }}>

        {step === 1 && (
          <div>
            <div style={panelStyle({ padding: '26px 22px' })}>
              <PanelLabel>Panel 01 / Lookup</PanelLabel>

              <label style={{ fontFamily: fontMono, fontSize: 11, color: T.muted, display: 'block', marginBottom: 6 }}>LOCATION</label>
              <select
                className="a4n-select"
                value={locationFilter}
                onChange={e => { setLocationFilter(e.target.value); setBusinessId(''); setSearch('') }}
                style={{ ...selectStyle, marginBottom: 16 }}
              >
                <option value="">All locations</option>
                {locations.map(loc => <option key={loc} value={loc}>{loc}</option>)}
              </select>

              <label style={{ fontFamily: fontMono, fontSize: 11, color: T.muted, display: 'block', marginBottom: 6 }}>BUSINESS NAME</label>
              <div style={{ position: 'relative' }}>
                <div className="a4n-input-shell" style={{
                  display: 'flex', alignItems: 'center', gap: 10, background: '#F1F4F9',
                  border: `1.5px solid ${T.border}`, borderRadius: 8, padding: '4px 6px 4px 16px'
                }}>
                  <span style={{ fontFamily: fontMono, color: T.amber, fontSize: 14 }}>&gt;</span>
                  <input
                    value={search}
                    onChange={e => { setSearch(e.target.value); setNotFound(false) }}
                    onKeyDown={e => e.key === 'Enter' && handleSearch()}
                    placeholder="type business name..."
                    style={{ flex: 1, background: 'none', border: 'none', outline: 'none', color: T.ink, fontSize: 14.5, fontFamily: fontMono, padding: '10px 0' }}
                  />
                  <button
                    className="a4n-btn-primary"
                    onClick={handleSearch}
                    style={{ background: T.amber, color: '#FFFFFF', border: 'none', borderRadius: 6, padding: '10px 18px', fontWeight: 700, cursor: 'pointer', fontSize: 12.5, fontFamily: fontMono }}
                  >
                    RUN SCAN
                  </button>
                </div>
                {search && suggestions.length > 0 && (
                  <div style={{
                    position: 'absolute', top: 'calc(100% + 8px)', left: 0, right: 0, background: '#F1F4F9',
                    border: `1px solid ${T.border}`, borderRadius: 8, boxShadow: '0 12px 28px rgba(0,0,0,0.4)',
                    overflow: 'hidden', zIndex: 10
                  }}>
                    {suggestions.map(b => (
                      <div key={b.id} className="a4n-suggestion" onMouseDown={() => selectBusiness(b)}
                        style={{ padding: '11px 16px', cursor: 'pointer', fontSize: 13.5, fontFamily: fontMono, display: 'flex', justifyContent: 'space-between', borderLeft: '2px solid transparent', borderBottom: `1px solid ${T.border}` }}>
                        <span>{b.business_name}</span>
                        <span style={{ fontSize: 11, color: T.mutedDim }}>{b.district}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {notFound && (
                <p style={{ color: T.red, marginTop: 14, fontSize: 12.5, fontFamily: fontMono }}>
                  [NO MATCH] Try one of the businesses listed below ↓
                </p>
              )}
            </div>

            {!loading && filteredByLocation.length > 0 && (
              <div style={panelStyle()}>
                <PanelLabel>Directory{locationFilter ? ` — ${locationFilter}` : ''}</PanelLabel>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                  {filteredByLocation.map(b => (
                    <span key={b.id} className="a4n-chip" onClick={() => selectBusiness(b)}
                      style={{ background: '#F1F4F9', border: `1px solid ${T.border}`, borderRadius: 6, padding: '7px 13px', fontSize: 12.5, cursor: 'pointer', color: T.muted, fontFamily: fontMono }}>
                      {b.business_name}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {step === 2 && result && (
          <div>
            <div style={panelStyle({ display: 'flex', gap: 20, alignItems: 'center', flexWrap: 'wrap' })}>
              <ScoreGauge score={result.overall_score} revealed={scoreRevealed} color={scoreColor} animatedValue={animatedScore} />
              <div style={{ flex: 1, minWidth: 180 }}>
                <p style={{ fontFamily: fontMono, fontSize: 10.5, color: scoreRevealed ? scoreColor : T.mutedDim, letterSpacing: 1, marginBottom: 8 }}>
                  {scoreRevealed ? '● SCAN COMPLETE' : '○ SCANNING…'}
                </p>
                <h2 style={{ fontFamily: fontDisplay, fontSize: 21, fontWeight: 700 }}>{result.business_name}</h2>
                <p style={{ color: T.muted, fontSize: 12.5, margin: '4px 0 12px', fontFamily: fontMono }}>{result.category} · {result.district}</p>
                <span style={{ display: 'inline-block', background: T.amberDim, border: `1px solid ${T.amber}`, color: T.amber, borderRadius: 6, padding: '5px 12px', fontSize: 11.5, fontWeight: 600, fontFamily: fontMono }}>
                  {rank === 1 ? '★ ' : ''}RANK #{rank} / {all.length}
                </span>
              </div>
            </div>

            <div style={{ ...panelStyle(), textAlign: 'center' }}>
              <PanelLabel>Panel 02 / Score Dimensions</PanelLabel>
              <RadarChart dims={dims} animate={scoreRevealed} />
            </div>

            <div style={panelStyle()}>
              <PanelLabel>Signal Breakdown</PanelLabel>
              {dims.map((d, i) => (
                <div key={d.label} style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
                  <span style={{ fontSize: 11.5, color: T.muted, width: 66, fontFamily: fontMono }}>{d.label.toUpperCase()}</span>
                  <div style={{ flex: 1, height: 5, background: T.border, borderRadius: 3, overflow: 'hidden' }}>
                    <div style={{ width: scoreRevealed ? `${d.val}%` : '0%', height: '100%', background: T.amber, borderRadius: 3, transition: `width 0.8s ease ${0.15 + i * 0.08}s` }} />
                  </div>
                  <span style={{ fontSize: 12, fontWeight: 700, width: 26, textAlign: 'right', fontFamily: fontMono }}>{d.val}</span>
                </div>
              ))}
            </div>

            <button className="a4n-btn-primary" onClick={() => setStep(3)}
              style={{ width: '100%', background: T.amber, color: '#FFFFFF', border: 'none', borderRadius: 8, padding: 15, fontWeight: 700, fontSize: 13.5, cursor: 'pointer', marginBottom: 10, fontFamily: fontMono }}>
              VIEW COMPETITORS &amp; TIPS →
            </button>
            <button className="a4n-btn-ghost" onClick={handleReset}
              style={{ width: '100%', background: 'none', border: `1px solid ${T.border}`, borderRadius: 8, padding: 11, fontWeight: 600, fontSize: 12.5, cursor: 'pointer', color: T.muted, fontFamily: fontMono }}>
              ← NEW SEARCH
            </button>
          </div>
        )}

        {step === 3 && result && (
          <div>
            <div style={panelStyle()}>
              <PanelLabel>Panel 03 / Leaderboard</PanelLabel>
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
              <p style={{ fontFamily: fontMono, fontSize: 10.5, fontWeight: 700, color: T.amber, textTransform: 'uppercase', letterSpacing: 1.5, marginBottom: 10 }}>[ Recommended Fix ]</p>
              <p style={{ fontSize: 14.5, lineHeight: 1.7, color: T.ink }}>{tipText}</p>
            </div>

            <a href={`${WHATSAPP_CHANNEL_URL}`} target="_blank" rel="noreferrer" className="a4n-whatsapp"
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, background: '#25D366', color: '#08240F', borderRadius: 8, padding: 15, fontWeight: 700, fontSize: 14.5, textDecoration: 'none', marginBottom: 10 }}>
              📲 Get Free Audit — Follow BizRadar on WhatsApp
            </a>

            <button className="a4n-btn-ghost" onClick={() => setStep(2)}
              style={{ width: '100%', background: 'none', border: `1px solid ${T.border}`, borderRadius: 8, padding: 11, fontWeight: 600, fontSize: 12.5, cursor: 'pointer', color: T.muted, fontFamily: fontMono, marginBottom: 8 }}>
              ← BACK TO SCORE
            </button>
            <button className="a4n-btn-ghost" onClick={handleReset}
              style={{ width: '100%', background: 'none', border: `1px solid ${T.border}`, borderRadius: 8, padding: 11, fontWeight: 600, fontSize: 12.5, cursor: 'pointer', color: T.muted, fontFamily: fontMono }}>
              🔍 NEW SEARCH
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
