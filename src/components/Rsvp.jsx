import { useState } from 'react'
import { WEDDING as W } from '../config'

// RSVP that sends a ready-made WhatsApp message (no server needed).
export default function Rsvp() {
  const [name, setName] = useState('')
  const [going, setGoing] = useState('yes')
  const [guests, setGuests] = useState(1)
  const send = (e) => {
    e.preventDefault()
    const msg =
      going === 'yes'
        ? `Hi ${W.groom} & ${W.bride} 🤍\nThis is ${name || '...'} — I'll be there! 🎉\nGuests: ${guests}\n\nأكيد جايين إن شاء الله 💍`
        : `Hi ${W.groom} & ${W.bride} 🤍\nThis is ${name || '...'} — sadly I can't make it, wishing you all the happiness! 💐`
    const num = (W.rsvpWhatsapp || '').replace(/\D/g, '')
    window.open(`https://wa.me/${num}?text=${encodeURIComponent(msg)}`, '_blank', 'noopener')
    window.dispatchEvent(new Event('petal-burst'))
  }
  return (
    <form className="rsvp" onSubmit={send}>
      <input className="field" placeholder="Your name · اسمك" value={name} onChange={(e) => setName(e.target.value)} required />
      <div className="seg">
        <button type="button" className={going === 'yes' ? 'on' : ''} onClick={() => setGoing('yes')}>Joyfully accept · جاي 🥳</button>
        <button type="button" className={going === 'no' ? 'on' : ''} onClick={() => setGoing('no')}>Regretfully decline · مش هقدر</button>
      </div>
      {going === 'yes' && (
        <div className="stepper">
          <span>Guests · عدد الأفراد</span>
          <div>
            <button type="button" onClick={() => setGuests((g) => Math.max(1, g - 1))}>−</button>
            <b>{guests}</b>
            <button type="button" onClick={() => setGuests((g) => Math.min(10, g + 1))}>+</button>
          </div>
        </div>
      )}
      <button className="btn" type="submit"><span>Send RSVP · أكّد حضورك</span></button>
      {W.rsvpBy && <p className="rsvp-by">Kindly reply by {W.rsvpBy}</p>}
    </form>
  )
}
