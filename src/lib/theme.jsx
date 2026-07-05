export const T = {
  bg: '#F5F8FC',
  bgGrad: 'radial-gradient(circle at 12% 0%, rgba(37,99,235,0.12) 0%, transparent 45%), radial-gradient(circle at 88% 12%, rgba(20,184,166,0.11) 0%, transparent 45%), radial-gradient(circle at 50% 100%, rgba(37,99,235,0.06) 0%, transparent 50%)',
  panel: '#FFFFFF',
  border: '#DDE6F0',
  borderBright: '#A9C1DE',
  amber: '#2563EB',
  amberDim: 'rgba(37,99,235,0.10)',
  gradient: 'linear-gradient(135deg, #2563EB 0%, #14B8A6 100%)',
  pink: '#0F9E92',
  green: '#16A34A',
  orange: '#D97706',
  red: '#DC2626',
  ink: '#0F2C4C',
  muted: '#5B6B7A',
  mutedDim: '#93A1AC',
  inputBg: '#F1F5FA',
}

export const fontDisplay = "'Poppins', sans-serif"
export const fontMono = "'JetBrains Mono', monospace"
export const fontBody = "'Inter', sans-serif"

export function panelStyle(extra = {}) {
  return {
    background: T.panel,
    border: `1px solid ${T.border}`,
    borderRadius: 16,
    padding: 22,
    marginBottom: 14,
    boxShadow: '0 4px 20px rgba(37,99,235,0.06)',
    ...extra
  }
}

export function PanelLabel({ children }) {
  return (
    <p style={{
      fontFamily: fontBody, fontSize: 11.5, fontWeight: 700,
      color: T.amber, textTransform: 'uppercase', letterSpacing: 1.2, marginBottom: 16
    }}>
      {children}
    </p>
  )
}

export function GlobalStyle() {
  return (
    <style>{`
      @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@500;600;700;800&family=JetBrains+Mono:wght@500;600;700&family=Inter:wght@400;500;600;700&display=swap');
      * { box-sizing: border-box; }
      body { margin: 0; background: ${T.bg}; }

      @keyframes fadeSlideIn { from { opacity: 0; transform: translateY(14px); } to { opacity: 1; transform: translateY(0); } }
      @keyframes fadeSlideOut { from { opacity: 1; transform: translateY(0); } to { opacity: 0; transform: translateY(-14px); } }
      @keyframes blink { 0%, 45% { opacity: 1; } 50%, 100% { opacity: 0; } }
      @keyframes dotPulse { 0% { box-shadow: 0 0 0 0 rgba(22,163,74,0.5); } 70% { box-shadow: 0 0 0 6px rgba(22,163,74,0); } 100% { box-shadow: 0 0 0 0 rgba(22,163,74,0); } }
      @keyframes sweepSpin { from { transform: rotate(0deg); opacity: 0.9; } to { transform: rotate(360deg); opacity: 0; } }
      @keyframes pop { 0% { transform: scale(0.7); opacity: 0; } 60% { transform: scale(1.05); } 100% { transform: scale(1); opacity: 1; } }
      @keyframes shimmer { 0% { background-position: -400px 0; } 100% { background-position: 400px 0; } }
      @keyframes chipIn { from { opacity: 0; transform: translateY(4px); } to { opacity: 1; transform: translateY(0); } }
      @keyframes floatY { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-10px); } }
      @keyframes blobDrift { 0%, 100% { transform: translate(0,0) scale(1); } 50% { transform: translate(20px,-14px) scale(1.06); } }
      @keyframes glowPulse { 0%, 100% { box-shadow: 0 0 0 0 rgba(37,99,235,0.25); } 50% { box-shadow: 0 0 0 8px rgba(37,99,235,0); } }

      .a4n-row:hover { background: #F0F6FC; }
      .a4n-row { transition: background 0.15s ease; }
      .a4n-chip { transition: border-color 0.15s ease, color 0.15s ease, background 0.15s ease, transform 0.15s ease, box-shadow 0.15s ease; }
      .a4n-chip:hover { border-color: ${T.amber} !important; color: ${T.amber} !important; background: #EAF1FE !important; transform: translateY(-3px); box-shadow: 0 6px 16px rgba(37,99,235,0.18); }
      .a4n-btn-primary { transition: transform 0.18s cubic-bezier(0.34,1.56,0.64,1), box-shadow 0.25s ease, filter 0.2s ease; }
      .a4n-btn-primary:hover { transform: translateY(-3px) scale(1.015); box-shadow: 0 12px 30px rgba(37,99,235,0.38); filter: brightness(1.06); animation: glowPulse 1.6s ease-out infinite; }
      .a4n-btn-primary:active { transform: translateY(-1px) scale(0.98); }
      .a4n-btn-ghost { transition: border-color 0.2s ease, color 0.2s ease, background 0.2s ease, transform 0.18s ease; }
      .a4n-btn-ghost:hover { border-color: ${T.amber}; color: ${T.amber}; background: #EEF4FE; transform: translateY(-2px); }
      .a4n-whatsapp { transition: transform 0.18s cubic-bezier(0.34,1.56,0.64,1), box-shadow 0.25s ease; }
      .a4n-whatsapp:hover { transform: translateY(-3px) scale(1.015); box-shadow: 0 14px 32px rgba(37,211,102,0.4); }
      .a4n-suggestion:hover { background: #EEF4FE; border-left-color: ${T.amber} !important; }
      .a4n-suggestion { transition: background 0.12s ease, border-color 0.12s ease; }
      .a4n-input-shell { transition: border-color 0.2s ease, box-shadow 0.2s ease; }
      .a4n-input-shell:focus-within { border-color: ${T.amber} !important; box-shadow: 0 0 0 5px ${T.amberDim}; }
      .a4n-select { transition: border-color 0.2s ease, box-shadow 0.2s ease; }
      .a4n-select:focus { border-color: ${T.amber} !important; outline: none; box-shadow: 0 0 0 4px ${T.amberDim}; }
      .a4n-reveal { opacity: 0; transform: translateY(28px); transition: opacity 0.7s ease, transform 0.7s cubic-bezier(0.16,1,0.3,1); }
      .a4n-reveal.is-visible { opacity: 1; transform: translateY(0); }
      .a4n-navlink { transition: color 0.15s ease; position: relative; }
      .a4n-navlink:hover { color: ${T.amber} !important; }
      .a4n-navlink::after { content: ''; position: absolute; left: 0; bottom: -3px; width: 0; height: 2px; background: ${T.gradient}; transition: width 0.25s ease; }
      .a4n-navlink:hover::after { width: 100%; }
      .a4n-card-interactive { transition: transform 0.25s cubic-bezier(0.34,1.2,0.64,1), box-shadow 0.25s ease, border-color 0.25s ease; }
      .a4n-card-interactive:hover { transform: translateY(-6px); box-shadow: 0 16px 36px rgba(37,99,235,0.14); border-color: ${T.borderBright} !important; }

      .a4n-hero-grid { display: grid; grid-template-columns: minmax(0,1.1fr) minmax(260px,0.9fr); gap: 40px; align-items: center; }
      .a4n-stats-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; }
      @media (max-width: 720px) {
        .a4n-hero-grid { grid-template-columns: 1fr; }
        .a4n-stats-grid { grid-template-columns: repeat(2, 1fr); gap: 16px; }
      }

      @media (prefers-reduced-motion: reduce) {
        * { animation-duration: 0.001ms !important; animation-iteration-count: 1 !important; transition-duration: 0.001ms !important; }
      }
    `}</style>
  )
}