import { WEDDING } from '../config'

// Gold laurel-wreath monogram that draws itself in
const arc = (a0, a1, r = 43) => {
  const p = (a) => [60 + r * Math.cos((a * Math.PI) / 180), 60 + r * Math.sin((a * Math.PI) / 180)]
  const [x0, y0] = p(a0)
  const [x1, y1] = p(a1)
  return `M${x0} ${y0} A ${r} ${r} 0 0 1 ${x1} ${y1}`
}

export default function Monogram({ size = 120, className = '' }) {
  const leaves = Array.from({ length: 9 })
  return (
    <svg className={`monogram ${className}`} width={size} height={size} viewBox="0 0 120 120" aria-hidden="true">
      <defs>
        <linearGradient id="mgGold" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#a87d27" />
          <stop offset=".35" stopColor="#f6dc95" />
          <stop offset=".6" stopColor="#c99a3b" />
          <stop offset="1" stopColor="#8a6420" />
        </linearGradient>
      </defs>
      <circle cx="60" cy="60" r="56" className="mg-line" pathLength="1" />
      <circle cx="60" cy="60" r="51" className="mg-line thin" pathLength="1" />
      {[-1, 1].map((side) => (
        <g key={side} transform={side === 1 ? 'translate(120 0) scale(-1 1)' : undefined}>
          <path className="mg-line" pathLength="1" d={arc(100, 222)} />
          {leaves.map((_, i) => {
            const th = 104 + i * 13
            const out = i % 2 ? 3.2 : -3.2
            const r = 43 + out
            const rad = (th * Math.PI) / 180
            const x = 60 + r * Math.cos(rad)
            const y = 60 + r * Math.sin(rad)
            return (
              <ellipse key={i} className="mg-leaf" style={{ '--d': `${0.6 + i * 0.08}s` }}
                cx={x} cy={y} rx="5" ry="2" transform={`rotate(${th + 90 + (out > 0 ? -25 : 25)} ${x} ${y})`} />
            )
          })}
        </g>
      ))}
      <text x="60" y="70" textAnchor="middle" className="mg-text">{WEDDING.groom[0]}<tspan className="mg-amp" dx="2">&amp;</tspan><tspan dx="2">{WEDDING.bride[0]}</tspan></text>
    </svg>
  )
}
