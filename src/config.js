// ✏️ Edit everything about the invitation from here.
export const WEDDING = {
  groom: 'Ahmed',
  bride: 'Mariam',
  initials: 'A & M',
  // Cairo time (+02:00). Change the hour if the party starts at a different time.
  date: '2026-12-26T19:00:00+02:00',
  dayName: 'Saturday',
  venue: 'Villa Sultana Orabi',
  area: 'El Obour, Cairo',
  dressCode: 'Any Colours',
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
    { time: '7:00 PM', en: 'Guests Arrival', icon: 'arrival' },
    { time: '8:00 PM', en: 'The Zaffa & Grand Entrance', icon: 'entrance' },
    { time: '8:30 PM', en: 'First Dance', icon: 'rings' },
    { time: '9:30 PM', en: 'Cake Cutting', icon: 'cake' },
    { time: '10:30 PM', en: 'Dinner', icon: 'dinner' },
    { time: '11:30 PM', en: 'Party Time', icon: 'dance' },
    { time: '1:00 AM', en: 'Farewell', icon: 'farewell' },
  ],

  photo: '/couple.jpg',
}
