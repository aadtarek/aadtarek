const ICONS = {
  arrival: <path d="M4 21V5a2 2 0 0 1 2-2h8l6 6v12M14 3v6h6M9 13h6M9 17h6" />,
  rings: <g><circle cx="9" cy="14" r="5" /><circle cx="15" cy="14" r="5" /><path d="M10 6l2-3 2 3" /></g>,
  entrance: <path d="M12 21s-7-4.5-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 11c0 5.5-7 10-7 10z" />,
  cake: <g><path d="M4 21h16M5 21v-7h14v7M7 14v-3h10v3M12 11V8" /><path d="M12 8c-1 0-1.5-1-1-2l1-2 1 2c.5 1 0 2-1 2z" /></g>,
  dinner: <path d="M7 3v8a2 2 0 0 0 2 2v8M5 3v5M9 3v5M17 3c-2 2-2 6 0 8v10" />,
  dance: <g><path d="M9 18V6l10-2v12" /><circle cx="6.5" cy="18" r="2.5" /><circle cx="16.5" cy="16" r="2.5" /></g>,
  farewell: <path d="M20 14.5A8.5 8.5 0 0 1 9.5 4a8.5 8.5 0 1 0 10.5 10.5z" />,
}

export default function Timeline({ items }) {
  return (
    <div className="timeline">
      <span className="tl-line" />
      {items.map((it, i) => (
        <div key={i} className={`tl-item ${i % 2 ? 'right' : 'left'}`} style={{ '--i': i }}>
          <div className="tl-dot">
            <svg viewBox="0 0 24 24">{ICONS[it.icon] || ICONS.entrance}</svg>
          </div>
          <div className="tl-card">
            <b className="tl-time">{it.time}</b>
            <span className="tl-en">{it.en}</span>
            <span className="tl-ar">{it.ar}</span>
          </div>
        </div>
      ))}
    </div>
  )
}
