// ✏️ Edit everything about the invitation from here.
export const WEDDING = {
  groom: 'Ahmed',
  bride: 'Mariam',
  groomAr: 'أحمد',
  brideAr: 'مريم',
  initials: 'A & M',
  // Cairo time (+02:00). Change the hour if the party starts at a different time.
  date: '2026-12-26T19:00:00+02:00',
  dayName: 'Saturday',
  dayNameAr: 'السبت',
  venue: 'Villa Sultana Orabi',
  venueAr: 'فيلا سلطانة عرابي',
  area: 'El Obour · العبور',
  dressCode: 'Any Colours',
  dressCodeAr: 'أي ألوان',
  // Direct Google Maps link (pinned to the exact place) — opens the Maps app on phones
  mapsUrl: 'https://maps.google.com/?q=6G88%2B5QW%20%D9%81%D9%8A%D9%84%D8%A7%20%D8%B3%D9%84%D8%B7%D8%A7%D9%86%D8%A9%20%D8%B9%D8%B1%D8%A7%D8%A8%D9%89%2C%20Obour&ftid=0x145805006ad08b15:0xd84f2e7f5f955fde',
  mapsShortUrl: 'https://maps.app.goo.gl/45Ni4W9HhbMmatvD8',
  mapsEmbed: 'https://maps.google.com/maps?q=6G88%2B5QW%20%D9%81%D9%8A%D9%84%D8%A7%20%D8%B3%D9%84%D8%B7%D8%A7%D9%86%D8%A9%20%D8%B9%D8%B1%D8%A7%D8%A8%D9%89%2C%20Obour%2C%20Cairo%20Governorate&z=14&output=embed',

  // Families (optional — leave empty '' to hide the section)
  groomParents: '',   // e.g. 'Mr. & Mrs. ...'
  brideParents: '',   // e.g. 'Mr. & Mrs. ...'

  // Start & end of the night (shown on the program card)
  startTime: '7:00 PM',
  endTime: '1:00 AM',

  // ✏️ The program of the night — edit times/titles freely, add or remove lines.
  // icon: arrival | rings | entrance | cake | dinner | dance | farewell
  schedule: [
    { time: '7:00 PM', en: 'Guests Arrival', ar: 'استقبال المعازيم', icon: 'arrival' },
    { time: '8:00 PM', en: 'The Zaffa & Grand Entrance', ar: 'الزفة ودخول العروسين', icon: 'entrance' },
    { time: '8:30 PM', en: 'First Dance', ar: 'أول رقصة', icon: 'rings' },
    { time: '9:30 PM', en: 'Cake Cutting', ar: 'تقطيع التورتة', icon: 'cake' },
    { time: '10:30 PM', en: 'Dinner', ar: 'العشاء', icon: 'dinner' },
    { time: '11:30 PM', en: 'Party Time', ar: 'وقت الرقص والبهجة', icon: 'dance' },
    { time: '1:00 AM', en: 'Farewell', ar: 'ختام الليلة', icon: 'farewell' },
  ],

  // RSVP: WhatsApp number with country code, e.g. '201001234567'.
  // Leave empty and WhatsApp will ask the guest which chat to send it to.
  rsvpWhatsapp: '',
  rsvpBy: '15 December 2026',

  photo: '/couple.jpg',
}
