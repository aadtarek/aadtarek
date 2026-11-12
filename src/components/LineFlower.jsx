// Gold line-art rose on a stem: it draws itself, then its white petals fill in.
export default function LineFlower({ className = '', size = 120, flip = false }) {
  const lines = [
    'M60 196 C 57 160, 66 122, 60 82',
    'M60 150 C 40 142, 29 126, 26 108 C 44 112, 56 126, 60 150 Z',
    'M61 124 C 80 118, 93 103, 96 86 C 78 90, 66 104, 61 124 Z',
    'M58 168 C 44 166, 36 158, 33 148 C 46 148, 54 156, 58 168 Z',
    'M36 62 C 34 82, 86 82, 84 62',
    'M36 62 C 32 44, 50 34, 60 44',
    'M84 62 C 88 44, 70 34, 60 44',
    'M60 54 C 53 54, 52 45, 60 43 C 68 42, 71 51, 64 55 C 57 59, 48 52, 51 45',
    'M42 70 C 35 60, 38 50, 45 47',
    'M78 70 C 85 60, 82 50, 75 47',
  ]
  return (
    <svg className={`lineflower ${className}`} width={size} height={size * 1.67} viewBox="0 0 120 200"
      style={flip ? { transform: 'scaleX(-1)' } : undefined} aria-hidden="true">
      <path className="lf-fill" d="M36 62 C 32 44, 50 34, 60 44 C 70 34, 88 44, 84 62 C 86 82, 34 82, 36 62Z" />
      {lines.map((d, i) => (
        <path key={i} d={d} className="lf-line" pathLength="1" style={{ '--d': `${i * 0.12}s` }} />
      ))}
      <circle cx="60" cy="40" r="2" className="lf-dot" />
      <circle cx="98" cy="80" r="1.6" className="lf-dot" />
      <circle cx="24" cy="104" r="1.6" className="lf-dot" />
    </svg>
  )
}
