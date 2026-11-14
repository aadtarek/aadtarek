import { useState } from 'react'

const SWATCHES = [
  { id: 'mix', label: 'Mix', ar: 'مكس', bg: 'conic-gradient(#5c0a1c 0 33%, #f3e8d6 0 66%, #e9a7b0 0)' },
  { id: 'burgundy', label: 'Burgundy', ar: 'بيرجندي', bg: '#5c0a1c' },
  { id: 'red', label: 'Red', ar: 'أحمر', bg: '#a5122b' },
  { id: 'blush', label: 'Blush', ar: 'بينك', bg: '#e9a7b0' },
  { id: 'ivory', label: 'Ivory', ar: 'أبيض', bg: '#f3e8d6' },
]

// Floating "Flower Studio": lets guests restyle the 3D roses behind the page.
export default function Studio({ settings, setSettings, onRain, show }) {
  const [open, setOpen] = useState(false)
  const set = (k, v) => setSettings((s) => ({ ...s, [k]: v }))
  return (
    <div className={`studio ${show ? 'show' : ''} ${open ? 'open' : ''}`}>
      <button className="studio-fab" onClick={() => setOpen((o) => !o)} aria-label="Flower studio">
        <svg viewBox="0 0 24 24"><path d="M12 21v-7" /><path d="M12 14c-3 0-5-2-5-5 0-2 1.5-4 2.5-5 .5 1 1.5 1.5 2.5 1.5S14 5 14.5 4C15.5 5 17 7 17 9c0 3-2 5-5 5z" /><path d="M12 18c-2-2-4-2-6-1 1 2 3 3 6 1zM12 17c2-2 4-2 6-1-1 2-3 3-6 1z" /></svg>
        {!open && <span className="studio-tip">تحكم في الورد</span>}
      </button>
      <div className="studio-panel" role="dialog" aria-label="Flower studio">
        <div className="studio-head">
          <b>Flower Studio</b>
          <span>تحكم في الورد 🌹</span>
        </div>
        <p className="studio-label">Rose colour · لون الورد</p>
        <div className="studio-swatches">
          {SWATCHES.map((s) => (
            <button key={s.id} className={settings.palette === s.id ? 'on' : ''} onClick={() => set('palette', s.id)}>
              <i style={{ background: s.bg }} />
              <small>{s.ar}</small>
            </button>
          ))}
        </div>
        <label className="studio-range">
          <span>Petals · كمية الورق</span>
          <input type="range" min="0" max="1" step="0.05" value={settings.petals} onChange={(e) => set('petals', +e.target.value)} />
        </label>
        <label className="studio-range">
          <span>Wind · سرعة الهوا</span>
          <input type="range" min="0.3" max="3" step="0.1" value={settings.wind} onChange={(e) => set('wind', +e.target.value)} />
        </label>
        <label className="studio-range">
          <span>Rose size · حجم الورد</span>
          <input type="range" min="0.6" max="1.4" step="0.05" value={settings.size} onChange={(e) => set('size', +e.target.value)} />
        </label>
        <div className="studio-toggles">
          <button className={settings.butterflies ? 'on' : ''} onClick={() => set('butterflies', !settings.butterflies)}>🦋 فراشات</button>
          <button className={settings.gold ? 'on' : ''} onClick={() => set('gold', !settings.gold)}>✨ دهب</button>
        </div>
        <button className="btn studio-rain" onClick={onRain}><span>🌹 Rain petals · مطّرها ورد</span></button>
        <p className="studio-hint">اضغط على أي وردة ورا الصفحة… هتلف وتطيّر ورد</p>
      </div>
    </div>
  )
}
