import type { BookId, BookMeta, ChapterMeta } from '../lib/types'

export const BOOKS: BookMeta[] = [
  {
    id: 1,
    title: 'Number',
    strand: 'Book 1',
    chapterRange: 'Chapters 1–8',
    colour: 'indigo',
  },
  {
    id: 2,
    title: 'Algebra',
    strand: 'Book 2',
    chapterRange: 'Chapters 9–16',
    colour: 'teal',
  },
  {
    id: 3,
    title: 'Ratio and proportion',
    strand: 'Book 3',
    chapterRange: 'Chapters 17–20',
    colour: 'amber',
  },
  {
    id: 4,
    title: 'Geometry',
    strand: 'Book 4',
    chapterRange: 'Chapters 21–27',
    colour: 'rose',
  },
  {
    id: 5,
    title: 'Probability',
    strand: 'Book 5',
    chapterRange: 'Chapters 28–29',
    colour: 'violet',
  },
  {
    id: 6,
    title: 'Statistics',
    strand: 'Book 6',
    chapterRange: 'Chapter 30',
    colour: 'slate',
  },
]

const LIVE = new Set([4, 5, 11, 17])

type Draft = {
  id: number
  title: string
  bookId: BookId
  blurb: string
  skills: string[]
}

const DRAFTS: Draft[] = [
  {
    id: 1,
    title: 'Place value and rounding',
    bookId: 1,
    blurb: 'Read, write and round integers and decimals.',
    skills: ['Place value', 'Rounding'],
  },
  {
    id: 2,
    title: 'Directed numbers',
    bookId: 1,
    blurb: 'Add, subtract, multiply and divide with negatives.',
    skills: ['Negatives'],
  },
  {
    id: 3,
    title: 'Factors, multiples and primes',
    bookId: 1,
    blurb: 'HCF, LCM, prime factorisation and number facts.',
    skills: ['HCF and LCM', 'Primes'],
  },
  {
    id: 4,
    title: 'Fractions',
    bookId: 1,
    blurb: 'Simplify, convert, calculate and find fractions of amounts.',
    skills: [
      'Equivalent fractions',
      'Four operations',
      'Fractions of amounts',
      'Mixed numbers',
    ],
  },
  {
    id: 5,
    title: 'Percentages',
    bookId: 1,
    blurb: 'Find a percentage, increase, decrease and reverse percentages.',
    skills: [
      'Percentage of an amount',
      'Increase and decrease',
      'Reverse percentages',
      'Multipliers',
    ],
  },
  {
    id: 6,
    title: 'Decimals and FDP',
    bookId: 1,
    blurb: 'Calculate with decimals and convert between FDP.',
    skills: ['Decimals', 'FDP conversion'],
  },
  {
    id: 7,
    title: 'Indices and roots',
    bookId: 1,
    blurb: 'Index laws, squares, cubes and roots.',
    skills: ['Index laws', 'Roots'],
  },
  {
    id: 8,
    title: 'Standard form',
    bookId: 1,
    blurb: 'Write and calculate with numbers in standard form.',
    skills: ['Standard form'],
  },
  {
    id: 9,
    title: 'Notation and collecting terms',
    bookId: 2,
    blurb: 'Write expressions and simplify like terms.',
    skills: ['Expressions'],
  },
  {
    id: 10,
    title: 'Expanding and factorising',
    bookId: 2,
    blurb: 'Expand single and double brackets; factorise.',
    skills: ['Expand', 'Factorise'],
  },
  {
    id: 11,
    title: 'Linear equations',
    bookId: 2,
    blurb: 'Solve linear equations, including brackets and both sides.',
    skills: [
      'One- and two-step',
      'Brackets',
      'Unknowns on both sides',
      'Fractional equations',
    ],
  },
  {
    id: 12,
    title: 'Formulae',
    bookId: 2,
    blurb: 'Substitute into formulae and rearrange.',
    skills: ['Substitution', 'Rearranging'],
  },
  {
    id: 13,
    title: 'Inequalities',
    bookId: 2,
    blurb: 'Solve linear inequalities and show them on a number line.',
    skills: ['Inequalities'],
  },
  {
    id: 14,
    title: 'Sequences',
    bookId: 2,
    blurb: 'Term-to-term and nth-term rules for linear sequences.',
    skills: ['Sequences'],
  },
  {
    id: 15,
    title: 'Straight-line graphs',
    bookId: 2,
    blurb: 'Plot lines and use $y = mx + c$.',
    skills: ['Graphs'],
  },
  {
    id: 16,
    title: 'Simultaneous equations',
    bookId: 2,
    blurb: 'Solve two linear equations together.',
    skills: ['Simultaneous'],
  },
  {
    id: 17,
    title: 'Ratio and sharing',
    bookId: 3,
    blurb: 'Simplify ratios, share an amount and find a missing part.',
    skills: [
      'Simplifying ratios',
      'Sharing in a ratio',
      'Finding a part',
      'Combining ratios',
    ],
  },
  {
    id: 18,
    title: 'Direct and inverse proportion',
    bookId: 3,
    blurb: 'Recipes, unitary method and inverse problems.',
    skills: ['Proportion'],
  },
  {
    id: 19,
    title: 'Compound measures',
    bookId: 3,
    blurb: 'Speed, density, pressure and units.',
    skills: ['Compound measures'],
  },
  {
    id: 20,
    title: 'Scale and maps',
    bookId: 3,
    blurb: 'Scale drawings, map ratios and similar lengths.',
    skills: ['Scale'],
  },
  {
    id: 21,
    title: 'Angle facts',
    bookId: 4,
    blurb: 'Straight lines, triangles, parallel lines and polygons.',
    skills: ['Angles'],
  },
  {
    id: 22,
    title: 'Properties of shapes',
    bookId: 4,
    blurb: 'Quadrilaterals, triangles and symmetry.',
    skills: ['Shape properties'],
  },
  {
    id: 23,
    title: 'Perimeter, area and volume',
    bookId: 4,
    blurb: '2D area and 3D volume, including prisms.',
    skills: ['Area', 'Volume'],
  },
  {
    id: 24,
    title: 'Pythagoras',
    bookId: 4,
    blurb: 'Find a missing side in a right-angled triangle.',
    skills: ['Pythagoras'],
  },
  {
    id: 25,
    title: 'Trigonometry',
    bookId: 4,
    blurb: 'SOHCAHTOA for sides and angles.',
    skills: ['Trigonometry'],
  },
  {
    id: 26,
    title: 'Transformations',
    bookId: 4,
    blurb: 'Translation, reflection, rotation and enlargement.',
    skills: ['Transformations'],
  },
  {
    id: 27,
    title: 'Circles and constructions',
    bookId: 4,
    blurb: 'Circle measures and standard constructions.',
    skills: ['Circles'],
  },
  {
    id: 28,
    title: 'Single-event probability',
    bookId: 5,
    blurb: 'Theoretical probability and sample space.',
    skills: ['Probability'],
  },
  {
    id: 29,
    title: 'Combined events',
    bookId: 5,
    blurb: 'Tree diagrams, independent and mutually exclusive events.',
    skills: ['Tree diagrams'],
  },
  {
    id: 30,
    title: 'Averages, charts and data',
    bookId: 6,
    blurb: 'Mean, median, mode, range and reading charts.',
    skills: ['Averages', 'Charts'],
  },
]

function slugify(title: string, id: number): string {
  const slug = title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
  return `${String(id).padStart(2, '0')}-${slug}`
}

export const CHAPTERS: ChapterMeta[] = DRAFTS.map((draft) => ({
  ...draft,
  slug: slugify(draft.title, draft.id),
  live: LIVE.has(draft.id),
}))

export const LIVE_CHAPTER_IDS = [...LIVE].sort((a, b) => a - b)

export function getChapter(idOrSlug: number | string): ChapterMeta | undefined {
  if (typeof idOrSlug === 'number') {
    return CHAPTERS.find((chapter) => chapter.id === idOrSlug)
  }
  return CHAPTERS.find((chapter) => chapter.slug === idOrSlug)
}

export function chaptersForBook(bookId: BookId): ChapterMeta[] {
  return CHAPTERS.filter((chapter) => chapter.bookId === bookId)
}

export function getBook(bookId: BookId): BookMeta {
  const book = BOOKS.find((item) => item.id === bookId)
  if (!book) {
    throw new Error(`Unknown book ${bookId}`)
  }
  return book
}
