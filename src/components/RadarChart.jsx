import { useEffect, useState } from 'react'
import { T, fontMono } from '../lib/theme'

export default function RadarChart({ dims, animate }) {
  const size = 260
  const center = size / 2
  const radius = 90
  const angleStep = (Math.PI * 2) / dims.length
  const [grow, setGrow] = useState(false)

  useEffect(() => {
    setGrow(false)
    const t = setTimeout(() => setGrow(true), 250)
    return () => clearTimeout(t)
  }, [animate, dims.map(d => d.val).join(',')])

  const pointFor = (value, i) => {
    const angle = angleStep * i - Math.PI / 2
    const r = (value / 100) * radius
    return [center + r * Math.cos(angle), center + r * Math.sin(angle)]
  }
  const outerPointFor = (i) => {
    const angle = angleStep * i - Math.PI / 2
    return [center + radius * Math.cos(angle), center + radius * Math.sin(angle)]
  }
  const labelPointFor = (i) => {
    const angle = angleStep * i - Math.PI / 2
    const r = radius + 28
    return [center + r * Math.cos(angle), center + r * Math.sin(angle)]
  }

  const dataPoints = dims.map((d, i) => pointFor(d.val, i))
  const dataPath = dataPoints.map(p => p.join(',')).join(' ')
  const rings = [0.33, 0.66, 1]

  return (
    <div style={{ position: 'relative', width: '100%', maxWidth: 280, margin: '0 auto' }}>
      <svg viewBox="0 0 260 260" style={{ width: '100%', display: 'block' }}>
        {rings.map((r, idx) => {
          const pts = dims.map((_, i) => {
            const angle = angleStep * i - Math.PI / 2
            return [center + radius * r * Math.cos(angle), center + radius * r * Math.sin(angle)].join(',')
          }).join(' ')
          return <polygon key={idx} points={pts} fill="none" stroke={T.border} strokeWidth="1" />
        })}
        {dims.map((_, i) => {
          const [x, y] = outerPointFor(i)
          return <line key={i} x1={center} y1={center} x2={x} y2={y} stroke={T.border} strokeWidth="1" />
        })}
        <polygon
          points={dataPath}
          fill="rgba(29,78,216,0.14)"
          stroke={T.amber}
          strokeWidth="2"
          style={{
            transformOrigin: `${center}px ${center}px`,
            transform: grow ? 'scale(1)' : 'scale(0)',
            transition: 'transform 0.7s cubic-bezier(0.34,1.56,0.64,1)'
          }}
        />
        {dataPoints.map(([x, y], i) => (
          <circle key={i} cx={x} cy={y} r="3.5" fill={T.amber}
            style={{ opacity: grow ? 1 : 0, transition: `opacity 0.4s ease ${0.5 + i * 0.06}s` }} />
        ))}
        {dims.map((d, i) => {
          const [x, y] = labelPointFor(i)
          return (
            <text key={i} x={x} y={y} fontSize="10.5" fontFamily={fontMono}
              fill={T.muted} textAnchor="middle" dominantBaseline="middle" letterSpacing="0.5">
              {d.label.toUpperCase()}
            </text>
          )
        })}
      </svg>
      {grow && (
        <div style={{
          position: 'absolute', top: '50%', left: '50%', width: 180, height: 180,
          marginTop: -90, marginLeft: -90, borderRadius: '50%',
          background: `conic-gradient(from 0deg, transparent 0deg, ${T.amberDim} 30deg, transparent 70deg)`,
          animation: 'sweepSpin 1.1s linear 1', pointerEvents: 'none'
        }} />
      )}
    </div>
  )
}
