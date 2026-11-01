// Preset sizes and built-in templates (original content, free to use).

export interface SizePreset {
  id: string
  ar: string
  en: string
  width: number
  height: number
}

export const SIZES: SizePreset[] = [
  { id: 'ig-post', ar: 'بوست إنستجرام', en: 'Instagram post', width: 1080, height: 1080 },
  { id: 'ig-portrait', ar: 'بوست طولي', en: 'Portrait post', width: 1080, height: 1350 },
  { id: 'story', ar: 'ستوري / ريلز', en: 'Story / Reel', width: 1080, height: 1920 },
  { id: 'fb-post', ar: 'بوست فيسبوك', en: 'Facebook post', width: 1200, height: 630 },
  { id: 'fb-cover', ar: 'غلاف فيسبوك', en: 'Facebook cover', width: 1640, height: 624 },
  { id: 'yt-thumb', ar: 'صورة يوتيوب', en: 'YouTube thumbnail', width: 1280, height: 720 },
  { id: 'presentation', ar: 'عرض تقديمي', en: 'Presentation 16:9', width: 1920, height: 1080 },
  { id: 'a4', ar: 'ورقة A4', en: 'A4 document', width: 1240, height: 1754 },
  { id: 'flyer', ar: 'فلاير A5', en: 'Flyer A5', width: 874, height: 1240 },
  { id: 'poster', ar: 'بوستر', en: 'Poster', width: 1800, height: 2400 },
  { id: 'card', ar: 'كارت شخصي', en: 'Business card', width: 1050, height: 600 },
  { id: 'invite', ar: 'دعوة', en: 'Invitation', width: 1500, height: 2100 },
  { id: 'logo', ar: 'لوجو', en: 'Logo', width: 1000, height: 1000 },
  { id: 'menu', ar: 'منيو', en: 'Menu', width: 1240, height: 1754 },
]

type J = Record<string, unknown>
const text = (text: string, o: J): J => ({
  type: 'Textbox',
  text,
  fontFamily: 'Cairo',
  fontWeight: 'bold',
  fill: '#111827',
  textAlign: 'center',
  lineHeight: 1.2,
  direction: /[؀-ۿ]/.test(text) ? 'rtl' : 'ltr',
  ...o,
})
const rect = (o: J): J => ({ type: 'Rect', fill: '#7c3aed', ...o })
const circle = (o: J): J => ({ type: 'Circle', fill: '#7c3aed', ...o })
const tri = (o: J): J => ({ type: 'Triangle', fill: '#7c3aed', ...o })
const linear = (w: number, h: number, a: string, b: string): J => ({
  type: 'linear',
  gradientUnits: 'pixels',
  coords: { x1: 0, y1: 0, x2: w, y2: h },
  colorStops: [
    { offset: 0, color: a },
    { offset: 1, color: b },
  ],
})

export interface Template {
  id: string
  ar: string
  en: string
  width: number
  height: number
  build: () => J
}

export const TEMPLATES: Template[] = [
  {
    id: 'ramadan',
    ar: 'تهنئة رمضان',
    en: 'Ramadan greeting',
    width: 1080,
    height: 1080,
    build: () => ({
      background: linear(1080, 1080, '#0f172a', '#312e81'),
      objects: [
        circle({ left: 640, top: 110, radius: 150, fill: '#facc15', name: 'Moon' }),
        circle({ left: 700, top: 80, radius: 150, fill: '#1e1b4b', name: 'Moon cut' }),
        ...[120, 260, 900, 980, 180].map((x, i) => circle({ left: x, top: 80 + i * 70, radius: 6, fill: '#fde68a', name: 'Star' })),
        text('رمضان كريم', { left: 90, top: 470, width: 900, fontSize: 150, fill: '#fde68a', fontFamily: 'Aref Ruqaa', name: 'Title' }),
        text('كل عام وأنتم بخير', { left: 90, top: 700, width: 900, fontSize: 60, fill: '#e0e7ff', fontFamily: 'Tajawal', fontWeight: 'normal', name: 'Subtitle' }),
        rect({ left: 390, top: 850, width: 300, height: 6, fill: '#facc15', rx: 3, ry: 3, name: 'Line' }),
        text('اسم البراند', { left: 290, top: 900, width: 500, fontSize: 40, fill: '#c7d2fe', fontWeight: 'normal', name: 'Brand' }),
      ],
    }),
  },
  {
    id: 'sale',
    ar: 'عرض وتخفيضات',
    en: 'Sale announcement',
    width: 1080,
    height: 1080,
    build: () => ({
      background: '#fef3c7',
      objects: [
        circle({ left: -200, top: -200, radius: 420, fill: '#f97316', name: 'Blob' }),
        circle({ left: 700, top: 760, radius: 300, fill: '#fb923c', name: 'Blob 2' }),
        text('خصم', { left: 60, top: 120, width: 520, fontSize: 130, fill: '#ffffff', fontFamily: 'Lalezar', fontWeight: 'normal', name: 'Label' }),
        text('50%', { left: 140, top: 380, width: 800, fontSize: 300, fill: '#7c2d12', fontFamily: 'Changa', fontWeight: '800', name: 'Discount' }),
        text('على كل المنتجات لفترة محدودة', { left: 140, top: 720, width: 800, fontSize: 52, fill: '#7c2d12', name: 'Details' }),
        rect({ left: 340, top: 850, width: 400, height: 100, rx: 50, ry: 50, fill: '#7c2d12', name: 'Button' }),
        text('اطلب دلوقتي', { left: 340, top: 868, width: 400, fontSize: 44, fill: '#ffffff', name: 'Button text' }),
      ],
    }),
  },
  {
    id: 'quote',
    ar: 'اقتباس',
    en: 'Quote post',
    width: 1080,
    height: 1350,
    build: () => ({
      background: '#ecfeff',
      objects: [
        rect({ left: 80, top: 80, width: 920, height: 1190, fill: '#ffffff', rx: 40, ry: 40, stroke: '#06b6d4', strokeWidth: 6, name: 'Card' }),
        text('“', { left: 140, top: 120, width: 200, fontSize: 300, fill: '#06b6d4', fontFamily: 'Playfair Display', textAlign: 'left', direction: 'ltr', name: 'Quote mark' }),
        text('The best way to predict the future is to create it.', { left: 160, top: 480, width: 760, fontSize: 78, fontFamily: 'Playfair Display', fill: '#0f172a', name: 'Quote' }),
        text('— Peter Drucker', { left: 160, top: 1050, width: 760, fontSize: 44, fontFamily: 'Inter', fontWeight: 'normal', fill: '#0e7490', name: 'Author' }),
      ],
    }),
  },
  {
    id: 'event',
    ar: 'إعلان فعالية',
    en: 'Event story',
    width: 1080,
    height: 1920,
    build: () => ({
      background: linear(1080, 1920, '#7c3aed', '#db2777'),
      objects: [
        circle({ left: 600, top: -150, radius: 400, fill: 'rgba(255,255,255,0.12)', name: 'Circle' }),
        circle({ left: -250, top: 1300, radius: 450, fill: 'rgba(255,255,255,0.1)', name: 'Circle 2' }),
        text('ورشة عمل', { left: 90, top: 380, width: 900, fontSize: 90, fill: '#fbcfe8', fontWeight: 'normal', name: 'Kicker' }),
        text('أساسيات التصميم الجرافيكي', { left: 90, top: 520, width: 900, fontSize: 140, fill: '#ffffff', fontWeight: '900', name: 'Title' }),
        rect({ left: 90, top: 1050, width: 900, height: 300, rx: 30, ry: 30, fill: 'rgba(255,255,255,0.15)', name: 'Info box' }),
        text('الجمعة ١٥ نوفمبر\nالساعة ٧ مساءً — أونلاين', { left: 130, top: 1095, width: 820, fontSize: 64, fill: '#ffffff', fontWeight: 'normal', lineHeight: 1.5, name: 'Info' }),
        rect({ left: 290, top: 1560, width: 500, height: 130, rx: 65, ry: 65, fill: '#ffffff', name: 'Button' }),
        text('سجّل الآن', { left: 290, top: 1585, width: 500, fontSize: 60, fill: '#7c3aed', name: 'Button text' }),
      ],
    }),
  },
  {
    id: 'yt',
    ar: 'صورة يوتيوب',
    en: 'YouTube thumbnail',
    width: 1280,
    height: 720,
    build: () => ({
      background: '#111827',
      objects: [
        tri({ left: 700, top: -100, width: 900, height: 920, fill: '#ef4444', angle: 0, name: 'Accent' }),
        text('10 TIPS', { left: 60, top: 120, width: 700, fontSize: 180, fontFamily: 'Bebas Neue', fontWeight: 'normal', fill: '#facc15', textAlign: 'left', name: 'Title' }),
        text('to design like a pro', { left: 60, top: 330, width: 700, fontSize: 80, fontFamily: 'Poppins', fill: '#ffffff', textAlign: 'left', name: 'Subtitle' }),
        rect({ left: 60, top: 520, width: 260, height: 70, rx: 12, ry: 12, fill: '#ef4444', name: 'Badge' }),
        text('NEW', { left: 60, top: 527, width: 260, fontSize: 48, fontFamily: 'Poppins', fill: '#ffffff', name: 'Badge text' }),
      ],
    }),
  },
  {
    id: 'card',
    ar: 'كارت شخصي',
    en: 'Business card',
    width: 1050,
    height: 600,
    build: () => ({
      background: '#ffffff',
      objects: [
        rect({ left: 0, top: 0, width: 380, height: 600, fill: '#0f766e', name: 'Side' }),
        circle({ left: 110, top: 200, radius: 80, fill: '#5eead4', name: 'Logo' }),
        text('أحمد محمود', { left: 430, top: 120, width: 560, fontSize: 64, fill: '#0f172a', textAlign: 'right', name: 'Name' }),
        text('مصمم جرافيك', { left: 430, top: 210, width: 560, fontSize: 36, fill: '#0f766e', fontWeight: 'normal', textAlign: 'right', name: 'Role' }),
        rect({ left: 830, top: 280, width: 160, height: 5, fill: '#0f766e', name: 'Line' }),
        text('📞 0100 000 0000\n✉️ name@email.com\n📍 القاهرة، مصر', { left: 430, top: 320, width: 560, fontSize: 30, fill: '#334155', fontWeight: 'normal', textAlign: 'right', lineHeight: 1.6, name: 'Contact' }),
      ],
    }),
  },
  {
    id: 'menu',
    ar: 'منيو مطعم',
    en: 'Restaurant menu',
    width: 1240,
    height: 1754,
    build: () => {
      const items = [
        ['شاورما فراخ', '85'],
        ['كفتة مشوية', '120'],
        ['فتة شاورما', '110'],
        ['طبق مشكل', '180'],
        ['بطاطس', '35'],
        ['عصير مانجو', '40'],
      ]
      return {
        background: '#1c1917',
        objects: [
          text('المنيو', { left: 120, top: 120, width: 1000, fontSize: 160, fill: '#fbbf24', fontFamily: 'Lalezar', fontWeight: 'normal', name: 'Title' }),
          text('أطيب الأكلات الشرقية', { left: 120, top: 330, width: 1000, fontSize: 52, fill: '#d6d3d1', fontWeight: 'normal', name: 'Subtitle' }),
          rect({ left: 470, top: 440, width: 300, height: 6, fill: '#fbbf24', name: 'Line' }),
          ...items.flatMap(([n, p], i) => [
            text(n, { left: 520, top: 560 + i * 170, width: 600, fontSize: 64, fill: '#ffffff', textAlign: 'right', name: 'Item ' + (i + 1) }),
            text(p + ' ج.م', { left: 120, top: 560 + i * 170, width: 300, fontSize: 64, fill: '#fbbf24', textAlign: 'left', direction: 'rtl', name: 'Price ' + (i + 1) }),
            rect({ left: 120, top: 670 + i * 170, width: 1000, height: 2, fill: '#44403c', name: 'Divider ' + (i + 1) }),
          ]),
        ],
      }
    },
  },
  {
    id: 'slide',
    ar: 'شريحة عرض',
    en: 'Presentation slide',
    width: 1920,
    height: 1080,
    build: () => ({
      background: '#f8fafc',
      objects: [
        rect({ left: 0, top: 0, width: 24, height: 1080, fill: '#2563eb', name: 'Bar' }),
        circle({ left: 1350, top: 300, radius: 260, fill: '#dbeafe', name: 'Circle' }),
        circle({ left: 1500, top: 520, radius: 160, fill: '#93c5fd', name: 'Circle 2' }),
        text('Project Overview', { left: 140, top: 300, width: 1200, fontSize: 110, fontFamily: 'Montserrat', fontWeight: '900', fill: '#0f172a', textAlign: 'left', name: 'Title' }),
        text('Goals, timeline and next steps for Q1', { left: 140, top: 500, width: 1100, fontSize: 56, fontFamily: 'Inter', fontWeight: 'normal', fill: '#475569', textAlign: 'left', name: 'Subtitle' }),
        text('Your Name · 2026', { left: 140, top: 880, width: 800, fontSize: 40, fontFamily: 'Inter', fontWeight: '600', fill: '#2563eb', textAlign: 'left', name: 'Footer' }),
      ],
    }),
  },
]

/** Shape a template into a Fabric canvas JSON. */
export function templateToJson(t: Template): Record<string, unknown> {
  const { background, objects } = t.build() as { background: unknown; objects: J[] }
  return { version: '7', objects, background }
}
