import { CHAPTERS } from '../content/catalog'
import { visibleForTier } from './marking'
import type {
  AttemptResult,
  ChapterProgress,
  MockHistoryItem,
  PracticeRecord,
  ProgressState,
  Tier,
  WeakQueueItem,
} from './types'
import type { Question } from './types'
import { chapterIdForQuestionId, queueKey } from './study'

export const STORAGE_KEY = 'practice-book-gcse-maths-v1'

export const emptyProgress = (): ProgressState => ({
  version: 1,
  tier: 'F',
  lastChapterId: null,
  lastPath: null,
  chapters: {},
  mocks: [],
  weakQueue: [],
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
      weakQueue: parsed.weakQueue ?? [],
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

function enqueueWeak(state: ProgressState, item: Omit<WeakQueueItem, 'key' | 'at'>): ProgressState {
  const key = queueKey(item.source, item.questionId)
  const nextItem: WeakQueueItem = { ...item, key, at: new Date().toISOString() }
  return {
    ...state,
    weakQueue: [nextItem, ...state.weakQueue.filter((entry) => entry.key !== key)].slice(0, 16),
  }
}

export function dequeueWeak(state: ProgressState, questionId: string): ProgressState {
  return {
    ...state,
    weakQueue: state.weakQueue.filter((entry) => entry.questionId !== questionId),
  }
}

export function applyAttemptToQueue(
  state: ProgressState,
  questions: Question[],
  result: AttemptResult,
  source: 'test' | 'mock',
  chapterId: number | null,
  mockId?: string,
): ProgressState {
  let next = state
  for (const question of questions) {
    const marked = result.questionResults.find((item) => item.questionId === question.id)
    if (!marked) continue
    if (marked.correct) {
      next = dequeueWeak(next, question.id)
    } else {
      next = enqueueWeak(next, {
        chapterId: chapterId ?? chapterIdForQuestionId(question.id),
        questionId: question.id,
        skill: question.skill,
        source,
        mockId,
      })
    }
  }
  return next
}

export function recordPractice(
  state: ProgressState,
  chapterId: number,
  question: Question,
  correct: boolean,
  lastAnswer: string,
): ProgressState {
  const current = chapterProgress(state, chapterId)
  const existing = current.practice[question.id]
  let next = upsertChapter(state, chapterId, {
    practice: {
      ...current.practice,
      [question.id]: {
        attempts: (existing?.attempts ?? 0) + 1,
        correct: existing?.correct || correct,
        lastAnswer,
      },
    },
  })
  if (correct) {
    next = dequeueWeak(next, question.id)
  } else {
    next = enqueueWeak(next, {
      chapterId,
      questionId: question.id,
      skill: question.skill,
      source: 'practice',
    })
  }
  return next
}

export function recordTest(
  state: ProgressState,
  chapterId: number,
  result: AttemptResult,
  questions: Question[],
): ProgressState {
  const current = chapterProgress(state, chapterId)
  const stored = upsertChapter(state, chapterId, {
    tests: [result, ...current.tests].slice(0, 8),
    testDraft: undefined,
  })
  return applyAttemptToQueue(stored, questions, result, 'test', chapterId)
}

export function recordMock(
  state: ProgressState,
  result: MockHistoryItem,
  questions: Question[],
): ProgressState {
  const stored = {
    ...state,
    mocks: [result, ...state.mocks].slice(0, 12),
    mockDraft: undefined,
  }
  return applyAttemptToQueue(stored, questions, result, 'mock', null, result.mockId)
}

export function missedPractice(state: ProgressState, chapterId: number, questions: Question[]): Question[] {
  const records = chapterProgress(state, chapterId).practice
  return questions.filter((question) => records[question.id] && !records[question.id]?.correct)
}
