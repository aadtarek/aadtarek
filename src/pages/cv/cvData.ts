export interface CvEntry {
  id: string
  title: string
  subtitle: string
  start: string
  end: string
  desc: string
}

export interface CvLang {
  id: string
  name: string
  level: string
}

export interface CvData {
  name: string
  title: string
  email: string
  phone: string
  location: string
  website: string
  photo: string
  summary: string
  experience: CvEntry[]
  education: CvEntry[]
  skills: string
  languages: CvLang[]
  projects: CvEntry[]
  certificates: CvEntry[]
}

export interface CvSettings {
  template: 'modern' | 'classic' | 'minimal' | 'bold'
  accent: string
  dir: 'rtl' | 'ltr'
  font: string
}

const id = () => Math.random().toString(36).slice(2, 9)
export const newEntry = (): CvEntry => ({ id: id(), title: '', subtitle: '', start: '', end: '', desc: '' })
export const newLang = (): CvLang => ({ id: id(), name: '', level: '' })

export const emptyCv = (): CvData => ({
  name: '',
  title: '',
  email: '',
  phone: '',
  location: '',
  website: '',
  photo: '',
  summary: '',
  experience: [],
  education: [],
  skills: '',
  languages: [],
  projects: [],
  certificates: [],
})

export const exampleCv = (lang: 'ar' | 'en'): CvData =>
  lang === 'ar'
    ? {
        name: 'سارة أحمد',
        title: 'مصممة واجهات وتجربة مستخدم',
        email: 'sara@email.com',
        phone: '+20 100 000 0000',
        location: 'القاهرة، مصر',
        website: 'linkedin.com/in/sara',
        photo: '',
        summary: 'مصممة UI/UX بخبرة 5 سنين في تصميم تطبيقات الموبايل والويب. شغوفة بتبسيط التجارب المعقدة وبناء أنظمة تصميم قابلة للتوسع.',
        experience: [
          { id: id(), title: 'مصممة UI/UX أولى', subtitle: 'شركة تك ستارت', start: '2022', end: '', desc: '• قيادة تصميم تطبيق دفع إلكتروني لأكثر من مليون مستخدم\n• بناء نظام تصميم موحّد قلّل وقت التطوير 30%' },
          { id: id(), title: 'مصممة واجهات', subtitle: 'وكالة إبداع', start: '2019', end: '2022', desc: '• تصميم أكثر من 20 موقع وتطبيق لعملاء في مصر والخليج' },
        ],
        education: [{ id: id(), title: 'بكالوريوس فنون تطبيقية', subtitle: 'جامعة حلوان', start: '2015', end: '2019', desc: '' }],
        skills: 'Figma, Adobe XD, بحث المستخدمين, النماذج الأولية, أنظمة التصميم, HTML/CSS',
        languages: [
          { id: id(), name: 'العربية', level: 'اللغة الأم' },
          { id: id(), name: 'الإنجليزية', level: 'ممتاز' },
        ],
        projects: [{ id: id(), title: 'تطبيق حجز عيادات', subtitle: 'behance.net/sara', start: '', end: '', desc: 'تصميم كامل لتطبيق حجز مواعيد طبية من البحث للنموذج النهائي.' }],
        certificates: [{ id: id(), title: 'Google UX Design Certificate', subtitle: 'Coursera', start: '2021', end: '', desc: '' }],
      }
    : {
        name: 'Sara Ahmed',
        title: 'UI/UX Designer',
        email: 'sara@email.com',
        phone: '+20 100 000 0000',
        location: 'Cairo, Egypt',
        website: 'linkedin.com/in/sara',
        photo: '',
        summary: 'UI/UX designer with 5 years of experience designing mobile and web products. Passionate about simplifying complex flows and building scalable design systems.',
        experience: [
          { id: id(), title: 'Senior UI/UX Designer', subtitle: 'TechStart', start: '2022', end: '', desc: '• Led design of a payments app used by 1M+ people\n• Built a design system that cut development time by 30%' },
          { id: id(), title: 'UI Designer', subtitle: 'Ebdaa Agency', start: '2019', end: '2022', desc: '• Designed 20+ websites and apps for clients in Egypt and the Gulf' },
        ],
        education: [{ id: id(), title: 'B.A. Applied Arts', subtitle: 'Helwan University', start: '2015', end: '2019', desc: '' }],
        skills: 'Figma, Adobe XD, User research, Prototyping, Design systems, HTML/CSS',
        languages: [
          { id: id(), name: 'Arabic', level: 'Native' },
          { id: id(), name: 'English', level: 'Fluent' },
        ],
        projects: [{ id: id(), title: 'Clinic booking app', subtitle: 'behance.net/sara', start: '', end: '', desc: 'End-to-end design of a medical appointment booking app.' }],
        certificates: [{ id: id(), title: 'Google UX Design Certificate', subtitle: 'Coursera', start: '2021', end: '', desc: '' }],
      }

/** Section headings in the CV's own language (independent of the UI language). */
export const CV_LABELS = {
  ar: { summary: 'نبذة', experience: 'الخبرات', education: 'التعليم', skills: 'المهارات', languages: 'اللغات', projects: 'المشاريع', certificates: 'الشهادات', contact: 'التواصل', present: 'حتى الآن' },
  en: { summary: 'Profile', experience: 'Experience', education: 'Education', skills: 'Skills', languages: 'Languages', projects: 'Projects', certificates: 'Certificates', contact: 'Contact', present: 'Present' },
}
