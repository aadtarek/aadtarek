// An endless ribbon of text gliding across the screen.
export default function Marquee({ items, reverse = false }) {
  const row = [...items, ...items, ...items, ...items]
  return (
    <div className={`marquee ${reverse ? 'rev' : ''}`} aria-hidden="true">
      <div className="marquee-track">
        {[0, 1].map((k) => (
          <div key={k} className="marquee-group">
            {row.map((t, i) => (
              <span key={i}>{t}<i>✦</i></span>
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}
