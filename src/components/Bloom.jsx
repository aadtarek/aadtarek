// An SVG flower that blooms open when its section scrolls into view.
export default function Bloom({ className = '', hue = 'pink', size = 120 }) {
  const petals = Array.from({ length: 8 })
  return (
    <svg className={`bloom bloom-${hue} ${className}`} width={size} height={size} viewBox="-60 -60 120 120" aria-hidden="true">
      <defs>
        <radialGradient id={`pg-${hue}`} cx="50%" cy="90%" r="90%">
          <stop offset="0%" className="b-stop-in" />
          <stop offset="100%" className="b-stop-out" />
        </radialGradient>
      </defs>
      <g className="b-outer">
        {petals.map((_, i) => (
          <path key={i} className="b-petal" style={{ '--r': `${i * 45}deg`, '--d': `${i * 60}ms` }}
            d="M0 0 C -18 -14, -16 -44, 0 -52 C 16 -44, 18 -14, 0 0Z" fill={`url(#pg-${hue})`} />
        ))}
      </g>
      <g className="b-inner">
        {petals.slice(0, 6).map((_, i) => (
          <path key={i} className="b-petal" style={{ '--r': `${i * 60 + 30}deg`, '--d': `${300 + i * 60}ms` }}
            d="M0 0 C -12 -10, -11 -30, 0 -34 C 11 -30, 12 -10, 0 0Z" fill={`url(#pg-${hue})`} />
        ))}
      </g>
      <circle r="7" className="b-core" />
    </svg>
  )
}
