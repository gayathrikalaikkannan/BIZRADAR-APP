import { useEffect, useState } from 'react'
import { T, fontMono } from '../lib/theme'

export function useCountUp(target, durationMs = 900, start = false) {
  const [value, setValue] = useState(0)
  useEffect(() => {
    if (!start) { setValue(0); return }
    let raf
    const t0 = performance.now()
    const tick = (now) => {
      const p = Math.min((now - t0) / durationMs, 1)
      const eased = 1 - Math.pow(1 - p, 3)
      setValue(Math.round(eased * target))
      if (p < 1) raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [target, start, durationMs])
  return value
}

export default function ScoreGauge({ score, revealed, color, animatedValue }) {
  const size = 132
  const stroke = 8
  const r = (size - stroke) / 2
  const c = 2 * Math.PI * r
  const pct = revealed ? score / 100 : 0
  const offset = c - pct * c

  return (
    <div style={{ position: 'relative', width: size, height: size, flexShrink: 0 }}>
      <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={T.border} strokeWidth={stroke} />
        <circle
          cx={size / 2} cy={size / 2} r={r} fill="none"
          stroke={color} strokeWidth={stroke} strokeLinecap="round"
          strokeDasharray={c} strokeDashoffset={offset}
          style={{ transition: 'stroke-dashoffset 1s cubic-bezier(0.34,1,0.64,1)' }}
        />
      </svg>
      {revealed && (
        <div style={{
          position: 'absolute', inset: 0, borderRadius: '50%',
          background: `conic-gradient(from 0deg, transparent 0deg, ${T.amberDim} 24deg, transparent 55deg)`,
          animation: 'sweepSpin 1s linear 1', pointerEvents: 'none'
        }} />
      )}
      <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
        <span style={{ fontFamily: fontMono, fontWeight: 700, fontSize: 30, color }}>{animatedValue}</span>
        <span style={{ fontFamily: fontMono, fontSize: 9, color: T.muted, letterSpacing: 1 }}>/ 100</span>
      </div>
    </div>
  )
}
