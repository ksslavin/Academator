import { CHAPTERS } from '../content/catalog'
import { visibleForTier } from './marking'
import type {
  AttemptResult,
  ChapterProgress,
  MockHistoryItem,
  PracticeRecord,
  ProgressState,
  Tier,
} from './types'
import type { Question } from './types'

export const STORAGE_KEY = 'practice-book-gcse-maths-v1'

export const emptyProgress = (): ProgressState => ({
  version: 1,
  tier: 'F',
  lastChapterId: null,
  lastPath: null,
  chapters: {},
  mocks: [],
})

function emptyChapter(): ChapterProgress {
  return { theoryComplete: false, practice: {}, tests: [] }
}

export function readProgress(): ProgressState {
  if (typeof localStorage === 'undefined') return emptyProgress()
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return emptyProgress()
    const parsed = JSON.parse(raw) as ProgressState
    if (parsed.version !== 1) return emptyProgress()
    return {
      ...emptyProgress(),
      ...parsed,
      chapters: parsed.chapters ?? {},
      mocks: parsed.mocks ?? [],
    }
  } catch {
    return emptyProgress()
  }
}

export function writeProgress(state: ProgressState): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
}

export function chapterProgress(
  state: ProgressState,
  chapterId: number,
): ChapterProgress {
  return state.chapters[String(chapterId)] ?? emptyChapter()
}

export function upsertChapter(
  state: ProgressState,
  chapterId: number,
  patch: Partial<ChapterProgress>,
): ProgressState {
  const current = chapterProgress(state, chapterId)
  return {
    ...state,
    lastChapterId: chapterId,
    chapters: {
      ...state.chapters,
      [String(chapterId)]: { ...current, ...patch },
    },
  }
}

export function practiceCompletion(
  records: Record<string, PracticeRecord>,
  questions: Question[],
  tier: Tier,
): { done: number; total: number; correct: number } {
  const visible = visibleForTier(questions, tier)
  const done = visible.filter((question) => records[question.id]).length
  const correct = visible.filter((question) => records[question.id]?.correct).length
  return { done, total: visible.length, correct }
}

export function chapterBars(
  state: ProgressState,
  chapterId: number,
  practice: Question[],
): { theory: number; practice: number; test: number } {
  const chapter = CHAPTERS.find((item) => item.id === chapterId)
  if (!chapter?.live) {
    return { theory: 0, practice: 0, test: 0 }
  }
  const progress = chapterProgress(state, chapterId)
  const practiceStats = practiceCompletion(progress.practice, practice, state.tier)
  const best = progress.tests.reduce((max, attempt) => Math.max(max, attempt.percent), 0)
  return {
    theory: progress.theoryComplete ? 100 : 0,
    practice:
      practiceStats.total === 0
        ? 0
        : Math.round((practiceStats.done / practiceStats.total) * 100),
    test: best,
  }
}

export function overallChapterScore(bars: {
  theory: number
  practice: number
  test: number
}): number {
  return Math.round(bars.theory * 0.2 + bars.practice * 0.4 + bars.test * 0.4)
}

export function weakChapters(
  state: ProgressState,
  practiceById: Record<number, Question[]>,
): Array<{ id: number; title: string; score: number }> {
  return CHAPTERS.filter((chapter) => chapter.live)
    .map((chapter) => {
      const bars = chapterBars(state, chapter.id, practiceById[chapter.id] ?? [])
      const started = bars.theory > 0 || bars.practice > 0 || bars.test > 0
      return {
        id: chapter.id,
        title: chapter.title,
        score: started ? overallChapterScore(bars) : -1,
      }
    })
    .filter((item) => item.score >= 0 && item.score < 70)
    .sort((a, b) => a.score - b.score)
}

export function nextRecommendedTest(
  state: ProgressState,
): { id: number; title: string; reason: string } | { mock: true; reason: string } | null {
  const live = CHAPTERS.filter((chapter) => chapter.live)
  const untested = live.find((chapter) => chapterProgress(state, chapter.id).tests.length === 0)
  if (untested) {
    return {
      id: untested.id,
      title: untested.title,
      reason: 'No chapter test attempted yet',
    }
  }
  const weakest = live
    .map((chapter) => {
      const bestPercent = chapterProgress(state, chapter.id).tests.reduce(
        (max, attempt) => Math.max(max, attempt.percent),
        0,
      )
      return { chapter, bestPercent }
    })
    .sort((a, b) => a.bestPercent - b.bestPercent)[0]
  if (weakest && weakest.bestPercent < 70) {
    return {
      id: weakest.chapter.id,
      title: weakest.chapter.title,
      reason: `Best test so far ${weakest.bestPercent}%`,
    }
  }
  const hasMockA = state.mocks.some((item) => item.mockId === 'group-a')
  if (!hasMockA) {
    return { mock: true, reason: 'Sit Group mock A to check Number under timed conditions' }
  }
  return weakest
    ? {
        id: weakest.chapter.id,
        title: weakest.chapter.title,
        reason: 'Retake your lowest chapter test',
      }
    : null
}

export function latestMock(state: ProgressState): MockHistoryItem | undefined {
  return state.mocks[0]
}

export function recordPractice(
  state: ProgressState,
  chapterId: number,
  questionId: string,
  correct: boolean,
  lastAnswer: string,
): ProgressState {
  const current = chapterProgress(state, chapterId)
  const existing = current.practice[questionId]
  return upsertChapter(state, chapterId, {
    practice: {
      ...current.practice,
      [questionId]: {
        attempts: (existing?.attempts ?? 0) + 1,
        correct: existing?.correct || correct,
        lastAnswer,
      },
    },
  })
}

export function recordTest(
  state: ProgressState,
  chapterId: number,
  result: AttemptResult,
): ProgressState {
  const current = chapterProgress(state, chapterId)
  return upsertChapter(state, chapterId, {
    tests: [result, ...current.tests].slice(0, 8),
    testDraft: undefined,
  })
}

export function recordMock(state: ProgressState, result: MockHistoryItem): ProgressState {
  return {
    ...state,
    mocks: [result, ...state.mocks].slice(0, 12),
    mockDraft: undefined,
  }
}
