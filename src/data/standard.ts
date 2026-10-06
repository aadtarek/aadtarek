import character from '../assets/standard-page/character.webp'
import comfort from '../assets/standard-page/comfort.webp'
import density from '../assets/standard-page/density.webp'
import projection from '../assets/standard-page/projection.webp'
import longevity from '../assets/standard-page/longevity.webp'
import evolution from '../assets/standard-page/evolution.webp'
import mCharacter from '../assets/standard-page/m-character.webp'
import mComfort from '../assets/standard-page/m-comfort.webp'
import mDensity from '../assets/standard-page/m-density.webp'
import mProjection from '../assets/standard-page/m-projection.webp'
import mLongevity from '../assets/standard-page/m-longevity.webp'
import mEvolution from '../assets/standard-page/m-evolution.webp'

/**
 * The Rfaheya Standard™: six dimensions every fragrance is evaluated on.
 *
 * Copy is written per line as it appears in the design comps; `desk` and
 * `mob` hold the comp coordinates (design pixels) of each block for the
 * desktop (1536 px wide) and phone (759 px wide) art panels.
 */

export interface Level {
  name: string
  /** Serif lead lines (desktop / phone) */
  lead: string[]
  mLead?: string[]
  /** Sans description lines (desktop / phone) */
  text: string[]
  mText?: string[]
}

/** Vertical positions of one level column: lead and text line tops. */
interface LevelRows {
  lead: number[]
  text: number[]
}

interface Scale {
  labelY: number
  lineY: number
  dots: [number, number, number]
  /** Label anchors: x and alignment */
  labels: { x: number; align: 'left' | 'center' | 'right' }[]
}

export interface PanelLayout {
  image: string
  w: number
  h: number
  /** Base for container units (comp width) */
  eyebrowY: number
  numX: number
  numY: number
  numSize: number
  divX: number
  titleX: number
  titleY: number
  titleSize: number
  subY: number
  subSize: number
  qY: number[]
  qSize: number
  descY: number[]
  descSize: number
  noteY: number[]
  noteSize: number
  scale?: Scale
  centers: number[]
  nameY: number
  ruleY: number
  rows: LevelRows[]
  leadSize: number
  textSize: number
  nameSize: number
  dividers: { xs: number[]; y0: number; y1: number }
  /** Tabs, pager */
  tabs: { eyebrowY: number; numY: number; labelY: number; centers: number[]; dividers: number[]; divY: [number, number]; underlineY: number; underlineW: number; numSize: number; labelSize: number; eyebrowSize: number }
  pager: { ruleY: number; numX: number; numY: number; numSize: number; prev: [number, number]; next: [number, number]; r: number }
}

export interface Dimension {
  slug: string
  num: string
  title: string
  subtitle: string
  /** One-line summary for the overview row */
  summary: [string, string]
  question: string[]
  mQuestion: string[]
  desc: string[]
  mDesc: string[]
  note: string[]
  mNote: string[]
  scale?: [string, string, string]
  levels: Level[]
  desk: PanelLayout
  mob: PanelLayout
}

// ---------------------------------------------------------------- shared comp geometry

const deskTabs: PanelLayout['tabs'] = {
  eyebrowY: 34.5,
  numY: 76,
  labelY: 123,
  centers: [178, 414, 639, 869, 1113, 1356],
  dividers: [301, 529, 754, 995, 1240],
  divY: [73, 150],
  underlineY: 157,
  underlineW: 145,
  numSize: 44,
  labelSize: 19.2,
  eyebrowSize: 14,
}
const deskPager: PanelLayout['pager'] = { ruleY: 933, numX: 93, numY: 958, numSize: 41, prev: [1349, 975], next: [1420, 975], r: 27 }

const mobTabs: PanelLayout['tabs'] = {
  eyebrowY: 29,
  numY: 71,
  labelY: 111,
  centers: [84, 205, 322, 441, 561, 683],
  dividers: [145, 263, 381, 501, 622],
  divY: [68, 128],
  underlineY: 140,
  underlineW: 90,
  numSize: 29,
  labelSize: 12.6,
  eyebrowSize: 13,
}
const mobPager: PanelLayout['pager'] = { ruleY: 1380, numX: 48, numY: 1418, numSize: 44, prev: [592, 1446], next: [682, 1446], r: 31 }

const desk = (p: Omit<PanelLayout, 'w' | 'h' | 'tabs' | 'pager' | 'numX' | 'numSize' | 'titleSize' | 'subSize' | 'qSize' | 'descSize' | 'noteSize' | 'leadSize' | 'textSize' | 'nameSize'>): PanelLayout => ({
  w: 1536,
  h: 1024,
  tabs: deskTabs,
  pager: deskPager,
  numX: 94,
  numSize: 157,
  titleSize: 81,
  subSize: 37,
  qSize: 43,
  descSize: 24.3,
  noteSize: 17.6,
  leadSize: 19.4,
  textSize: 16.2,
  nameSize: 17,
  ...p,
})

const mob = (p: Omit<PanelLayout, 'w' | 'h' | 'tabs' | 'pager' | 'numX' | 'numSize' | 'titleSize' | 'subSize' | 'qSize' | 'descSize' | 'noteSize' | 'leadSize' | 'textSize' | 'nameSize' | 'centers' | 'nameY' | 'ruleY'> & Partial<Pick<PanelLayout, 'centers' | 'nameY' | 'ruleY' | 'descSize' | 'titleSize'>>): PanelLayout => ({
  w: 759,
  h: 1510,
  tabs: mobTabs,
  pager: mobPager,
  numX: 51,
  numSize: 134,
  titleSize: 68,
  subSize: 33,
  qSize: 39,
  descSize: 26,
  noteSize: 22.6,
  leadSize: 18.6,
  textSize: 15.8,
  nameSize: 16,
  centers: [136, 384, 632],
  nameY: 862,
  ruleY: 891,
  ...p,
})

// ---------------------------------------------------------------- the six dimensions

export const dimensions: Dimension[] = [
  {
    slug: 'character',
    num: '01',
    title: 'Character',
    subtitle: 'Olfactive Identity',
    summary: ['Its olfactive', 'identity'],
    question: ['Who is this fragrance for?'],
    mQuestion: ['Who is this fragrance for?'],
    desc: ['Character describes the unique olfactory personality of the', 'fragrance — and how widely it appeals to different tastes.'],
    mDesc: ['Character describes the unique olfactory personality', 'of the fragrance — and how widely it appeals', 'to different tastes.'],
    note: ['It’s about the fragrance’s identity, not its performance.'],
    mNote: ['It’s about the fragrance’s identity, not its performance.'],
    scale: ['Universal', 'Selective', 'Enthusiast'],
    levels: [
      { name: 'Universal', lead: ['Wide Appeal.'], text: ['Loved by many,', 'across different tastes.'] },
      { name: 'Selective', lead: ['More Distinctive.'], text: ['Appeals to a specific', 'group of fragrance lovers.'] },
      { name: 'Enthusiast', lead: ['Bold & Unique.'], text: ['A distinctive identity', 'for true fragrance enthusiasts.'], mText: ['A distinctive identity', 'for true fragrance', 'enthusiasts.'] },
    ],
    desk: desk({
      image: character,
      eyebrowY: 210.5,
      numY: 253,
      divX: 276,
      titleX: 313,
      titleY: 255,
      subY: 336,
      qY: [409],
      descY: [466, 493],
      noteY: [533],
      centers: [206, 513, 802],
      nameY: 761,
      ruleY: 793,
      rows: [
        { lead: [817], text: [848, 871] },
        { lead: [817], text: [848, 871] },
        { lead: [817], text: [848, 871] },
      ],
      dividers: { xs: [368, 657], y0: 610, y1: 900 },
    }),
    mob: mob({
      image: mCharacter,
      eyebrowY: 203,
      numY: 249,
      divX: 207,
      titleX: 239,
      titleY: 249,
      subY: 315,
      qY: [385],
      descY: [444, 474, 505],
      noteY: [553],
      scale: { labelY: 604, lineY: 641, dots: [104, 382, 660], labels: [{ x: 54, align: 'left' }, { x: 384, align: 'center' }, { x: 712, align: 'right' }] },
      rows: [
        { lead: [909], text: [937, 959] },
        { lead: [909], text: [937, 959] },
        { lead: [909], text: [937, 959, 981] },
      ],
      dividers: { xs: [276, 523], y0: 680, y1: 1010 },
    }),
  },
  {
    slug: 'comfort',
    num: '02',
    title: 'Comfort',
    subtitle: 'Wearing Experience',
    summary: ['The wearing', 'experience'],
    question: ['How does the fragrance feel to wear?'],
    mQuestion: ['How does the fragrance', 'feel to wear?'],
    desc: ['Comfort describes how pleasant and effortless a fragrance', 'feels on skin and throughout wear.'],
    mDesc: ['Comfort describes how pleasant and effortless', 'a fragrance feels on skin and throughout wear.'],
    note: ['It’s about the wearing experience — not how soft or light', 'the fragrance smells.'],
    mNote: ['It’s about the wearing experience — not how soft', 'or light the fragrance smells.'],
    scale: ['Relaxed', 'Balanced', 'Intense'],
    levels: [
      { name: 'Relaxed', lead: ['Smooth & easy to wear.'], text: ['Feels natural and', 'unobtrusive.'] },
      { name: 'Balanced', lead: ['Present without', 'becoming overwhelming.'], text: ['Comfortable across', 'different settings.'] },
      {
        name: 'Intense',
        lead: ['More stimulating and', 'attention-grabbing.'],
        text: ['For those who enjoy a stronger', 'wearing experience.'],
        mText: ['For those who enjoy a', 'stronger wearing', 'experience.'],
      },
    ],
    desk: desk({
      image: comfort,
      eyebrowY: 221.5,
      numY: 260,
      divX: 283,
      titleX: 326,
      titleY: 264,
      subY: 343,
      qY: [409],
      descY: [465, 494],
      noteY: [529, 555],
      scale: { labelY: 598, lineY: 636, dots: [159, 487, 818], labels: [{ x: 98, align: 'left' }, { x: 487, align: 'center' }, { x: 866, align: 'right' }] },
      centers: [200, 502, 808],
      nameY: 780,
      ruleY: 808,
      rows: [
        { lead: [826], text: [849, 872] },
        { lead: [826, 849], text: [872, 895] },
        { lead: [826, 849], text: [872, 895] },
      ],
      dividers: { xs: [351, 656], y0: 678, y1: 912 },
    }),
    mob: mob({
      image: mComfort,
      titleSize: 72,
      eyebrowY: 201,
      numY: 248,
      divX: 210,
      titleX: 243,
      titleY: 250,
      subY: 320,
      qY: [390, 437],
      descY: [496, 527],
      noteY: [569, 597],
      scale: { labelY: 660, lineY: 705, dots: [104, 382, 660], labels: [{ x: 51, align: 'left' }, { x: 384, align: 'center' }, { x: 707, align: 'right' }] },
      nameY: 866,
      ruleY: 895,
      rows: [
        { lead: [914], text: [942, 964] },
        { lead: [914, 937], text: [963, 985] },
        { lead: [907, 929], text: [956, 979, 1004] },
      ],
      dividers: { xs: [257, 507], y0: 750, y1: 1020 },
    }),
  },
  {
    slug: 'density',
    num: '03',
    title: 'Density',
    subtitle: 'Fragrance Weight',
    summary: ['How full', 'it feels'],
    question: ['How full does the fragrance feel?'],
    mQuestion: ['How full does the fragrance', 'feel?'],
    desc: ['Density describes how full, rich, or airy a fragrance feels —', 'the sense of substance it creates when you experience it.'],
    mDesc: ['Density describes how full, rich, or airy a fragrance feels —', 'the sense of substance it creates when you experience it.'],
    note: ['It’s about the weight of the fragrance, not how far it projects', 'or how long it lasts.'],
    mNote: ['It’s about the weight of the fragrance, not how far it', 'projects or how long it lasts.'],
    scale: ['Airy', 'Balanced', 'Dense'],
    levels: [
      { name: 'Airy', lead: ['Light & effortless.'], text: ['Feels open and', 'transparent.'] },
      { name: 'Balanced', lead: ['Present without', 'feeling heavy.'], text: ['Rich enough to feel', 'complete.'] },
      { name: 'Dense', lead: ['Full & enveloping.'], text: ['Creates a deeper, more', 'substantial experience.'] },
    ],
    desk: desk({
      image: density,
      eyebrowY: 211.5,
      numY: 255,
      divX: 286,
      titleX: 329,
      titleY: 258,
      subY: 340,
      qY: [405],
      descY: [463, 491],
      noteY: [533, 558],
      scale: { labelY: 597, lineY: 634, dots: [136, 478, 827], labels: [{ x: 104, align: 'left' }, { x: 476, align: 'center' }, { x: 862, align: 'right' }] },
      centers: [191, 482, 768],
      nameY: 787,
      ruleY: 815,
      rows: [
        { lead: [833], text: [858, 880] },
        { lead: [833, 855], text: [880, 902] },
        { lead: [833], text: [858, 880] },
      ],
      dividers: { xs: [340, 629], y0: 676, y1: 912 },
    }),
    mob: mob({
      image: mDensity,
      eyebrowY: 201,
      numY: 247,
      divX: 215,
      titleX: 248,
      titleY: 248,
      subY: 318,
      qY: [387, 433],
      descY: [488, 516],
      descSize: 21.4,
      noteY: [558, 591],
      scale: { labelY: 647, lineY: 692, dots: [104, 382, 660], labels: [{ x: 58, align: 'left' }, { x: 384, align: 'center' }, { x: 698, align: 'right' }] },
      nameY: 858,
      ruleY: 889,
      rows: [
        { lead: [909], text: [939, 963] },
        { lead: [909, 932], text: [961, 983] },
        { lead: [909], text: [939, 961] },
      ],
      dividers: { xs: [263, 500], y0: 740, y1: 1010 },
    }),
  },
  {
    slug: 'projection',
    num: '04',
    title: 'Projection',
    subtitle: 'Scent Presence',
    summary: ['Its presence', 'around you'],
    question: ['How far does the fragrance naturally project?'],
    mQuestion: ['How far does the fragrance', 'naturally project?'],
    desc: ['Projection describes how far a fragrance radiates around you —', 'the space it naturally occupies.'],
    mDesc: ['Projection describes how far a fragrance radiates', 'around you — the space it naturally occupies.'],
    note: ['It’s about presence around you, not how long the fragrance lasts.'],
    mNote: ['It’s about presence around you, not how long', 'the fragrance lasts.'],
    scale: ['Intimate', 'Balanced', 'Enormous'],
    levels: [
      { name: 'Intimate', lead: ['Stays close to the skin.'], text: ['Ideal for personal', 'space.'] },
      { name: 'Balanced', lead: ['Noticeable without', 'dominating the room.'], text: ['A natural, balanced', 'presence.'] },
      { name: 'Enormous', lead: ['Creates a powerful', 'surrounding presence.'], text: ['Leaves a noticeable trail.'], mText: ['Leaves a noticeable', 'trail.'] },
    ],
    desk: desk({
      image: projection,
      eyebrowY: 216.5,
      numY: 257,
      divX: 283,
      titleX: 328,
      titleY: 258,
      subY: 338,
      qY: [409],
      descY: [464, 492],
      noteY: [530],
      scale: { labelY: 590, lineY: 627, dots: [149, 465, 804], labels: [{ x: 98, align: 'left' }, { x: 466, align: 'center' }, { x: 863, align: 'right' }] },
      centers: [177, 456, 779],
      nameY: 766,
      ruleY: 796,
      rows: [
        { lead: [817], text: [843, 866] },
        { lead: [817, 839], text: [866, 888] },
        { lead: [817, 839], text: [866] },
      ],
      dividers: { xs: [311, 597], y0: 660, y1: 908 },
    }),
    mob: mob({
      image: mProjection,
      eyebrowY: 201,
      numY: 247,
      divX: 215,
      titleX: 248,
      titleY: 248,
      subY: 318,
      qY: [387, 433],
      descY: [488, 516],
      descSize: 22.6,
      noteY: [558, 586],
      scale: { labelY: 647, lineY: 692, dots: [104, 382, 660], labels: [{ x: 58, align: 'left' }, { x: 384, align: 'center' }, { x: 698, align: 'right' }] },
      nameY: 858,
      ruleY: 889,
      rows: [
        { lead: [909], text: [939, 961] },
        { lead: [909, 932], text: [961, 983] },
        { lead: [909, 932], text: [961, 983] },
      ],
      dividers: { xs: [263, 500], y0: 740, y1: 1010 },
    }),
  },
  {
    slug: 'longevity',
    num: '05',
    title: 'Longevity',
    subtitle: 'Staying Power',
    summary: ['How long', 'it lasts'],
    question: ['How long does it stay noticeable?'],
    mQuestion: ['How long does it stay', 'noticeable?'],
    desc: ['Longevity describes how long a fragrance remains', 'noticeable throughout wear.'],
    mDesc: ['Longevity describes how long a fragrance', 'remains noticeable throughout wear.'],
    note: ['It measures duration, not projection or intensity.'],
    mNote: ['It measures duration, not projection', 'or intensity.'],
    scale: ['Moderate', 'Extended', 'Long-lasting'],
    levels: [
      { name: 'Moderate', lead: [], text: ['Noticeable for a', 'satisfying duration.'] },
      { name: 'Extended', lead: [], text: ['Remains noticeable', 'for an extended period.'], mText: ['Remains noticeable', 'for an extended', 'period.'] },
      { name: 'Long-lasting', lead: [], text: ['Designed to stay', 'noticeable for longer wear.'], mText: ['Designed to stay', 'noticeable for', 'longer wear.'] },
    ],
    desk: desk({
      image: longevity,
      eyebrowY: 208.5,
      numY: 245,
      divX: 276,
      titleX: 310,
      titleY: 246,
      subY: 329,
      qY: [396],
      descY: [451, 478],
      noteY: [515],
      scale: { labelY: 550, lineY: 587, dots: [207, 523, 874], labels: [{ x: 212, align: 'center' }, { x: 527, align: 'center' }, { x: 871, align: 'center' }] },
      centers: [205, 529, 863],
      nameY: 803,
      ruleY: 832,
      rows: [
        { lead: [], text: [852, 875] },
        { lead: [], text: [852, 875] },
        { lead: [], text: [852, 875] },
      ],
      dividers: { xs: [369, 689], y0: 628, y1: 908 },
    }),
    mob: mob({
      image: mLongevity,
      eyebrowY: 198,
      numY: 237,
      divX: 194,
      titleX: 222,
      titleY: 237,
      subY: 303,
      qY: [375, 424],
      descY: [484, 513],
      noteY: [557, 585],
      scale: { labelY: 638, lineY: 676, dots: [104, 382, 660], labels: [{ x: 55, align: 'left' }, { x: 384, align: 'center' }, { x: 712, align: 'right' }] },
      nameY: 914,
      ruleY: 945,
      rows: [
        { lead: [], text: [966, 988] },
        { lead: [], text: [966, 988, 1010] },
        { lead: [], text: [966, 988, 1010] },
      ],
      dividers: { xs: [256, 501], y0: 722, y1: 1030 },
    }),
  },
  {
    slug: 'evolution',
    num: '06',
    title: 'Evolution',
    subtitle: 'Olfactive Development',
    summary: ['How it changes', 'over time'],
    question: ['How does the fragrance change?'],
    mQuestion: ['How does the fragrance', 'change?'],
    desc: ['Evolution describes how a fragrance develops', 'throughout wear — from the first spray to its dry down.'],
    mDesc: ['Evolution describes how a fragrance', 'develops throughout wear — from the', 'first spray to its dry down.'],
    note: ['It’s about how the character develops,', 'not how many notes the fragrance contains.'],
    mNote: ['It’s about how the character develops,', 'not how many notes the fragrance contains.'],
    levels: [
      { name: 'Linear', lead: [], text: ['Maintains a consistent', 'character throughout wear.'] },
      { name: 'Evolving', lead: [], text: ['Reveals new facets as', 'the fragrance develops.'] },
    ],
    // Evolution's comp is a different size (1146 × 942) with two options instead of a scale.
    desk: {
      image: evolution,
      w: 1146,
      h: 942,
      tabs: { eyebrowY: 26.5, numY: 68, labelY: 107, centers: [81, 221, 362, 506, 656, 813], dividers: [151, 291, 432, 579, 733], divY: [62, 125], underlineY: 138, underlineW: 125, numSize: 36, labelSize: 17.6, eyebrowSize: 13.6 },
      pager: { ruleY: 852, numX: 48, numY: 872, numSize: 40, prev: [1018, 888], next: [1081, 888], r: 25 },
      eyebrowY: 181.5,
      numX: 47,
      numY: 219,
      numSize: 139,
      divX: 212,
      titleX: 251,
      titleY: 219,
      titleSize: 70,
      subY: 287,
      subSize: 35,
      qY: [349],
      qSize: 41,
      descY: [401, 429],
      descSize: 22.4,
      noteY: [463, 489],
      noteSize: 22,
      centers: [324, 840],
      nameY: 552,
      ruleY: 582,
      rows: [
        { lead: [], text: [597, 619] },
        { lead: [], text: [595, 616] },
      ],
      leadSize: 19,
      textSize: 17.6,
      nameSize: 20.4,
      dividers: { xs: [581], y0: 545, y1: 750 },
    },
    mob: {
      image: mEvolution,
      w: 756,
      h: 1904,
      tabs: { eyebrowY: 40, numY: 100, labelY: 150, centers: [64, 188, 302, 414, 536, 666], dividers: [130, 248, 360, 474, 604], divY: [96, 166], underlineY: 186, underlineW: 120, numSize: 30, labelSize: 12, eyebrowSize: 12.6 },
      pager: { ruleY: 1756, numX: 54, numY: 1782, numSize: 54, prev: [552, 1820], next: [658, 1820], r: 40 },
      eyebrowY: 262,
      numX: 54,
      numY: 318,
      numSize: 156,
      divX: 252,
      titleX: 288,
      titleY: 318,
      titleSize: 80,
      subY: 394,
      subSize: 42,
      qY: [478, 538],
      qSize: 50,
      descY: [606, 648, 690],
      descSize: 33,
      noteY: [750, 788],
      noteSize: 27,
      centers: [372, 372],
      nameY: 932,
      ruleY: 982,
      rows: [
        { lead: [], text: [1014, 1052] },
        { lead: [], text: [1362, 1400] },
      ],
      leadSize: 30,
      textSize: 27,
      nameSize: 26,
      dividers: { xs: [], y0: 0, y1: 0 },
    },
  },
]

/** Phone layout of Evolution stacks its two options; the second sits lower. */
export const EVOLUTION_MOBILE_SECOND = { nameY: 1292, ruleY: 1340, lineY: 1236 }
