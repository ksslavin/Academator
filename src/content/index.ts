import { CHAPTERS } from './catalog'
import { chapter04 } from './chapters/ch04-fractions'
import { chapter05 } from './chapters/ch05-percentages'
import { chapter11 } from './chapters/ch11-linear-equations'
import { chapter17 } from './chapters/ch17-ratio'
import { groupMockA } from './mocks/group-a'
import type { ChapterContent, MockPaper } from '../lib/types'

const LIVE: Record<number, ChapterContent> = {
  4: chapter04,
  5: chapter05,
  11: chapter11,
  17: chapter17,
}

export function getLiveChapter(id: number): ChapterContent | undefined {
  return LIVE[id]
}

export function livePracticeById(): Record<number, import('../lib/types').Question[]> {
  return Object.fromEntries(
    Object.entries(LIVE).map(([id, chapter]) => [Number(id), chapter.practice]),
  )
}

export const MOCKS: MockPaper[] = [groupMockA]

export function getMock(id: string): MockPaper | undefined {
  return MOCKS.find((mock) => mock.id === id)
}

export const COMING_MOCKS = [
  { id: 'year-11', title: 'Year 11 mock', note: 'Full mixed paper — later wave' },
  { id: 'november', title: 'November mock', note: 'Resit-style paper — later wave' },
  { id: 'march', title: 'March mock', note: 'Pre-summer paper — later wave' },
  { id: 'full-gcse', title: 'Full GCSE mock', note: 'Three-paper set — later wave' },
] as const

export { CHAPTERS }
