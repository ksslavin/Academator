import { CHAPTERS } from '../content/catalog'
import { visibleForTier } from './marking'
import type {
  AttemptResult,
  ChapterProgress,
  ExamSit,
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
  examSits: [],
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
      examSits: parsed.examSits ?? [],
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
):
  | { id: number; title: string; reason: string }
  | { mock: string; title: string; reason: string }
  | null {
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
  const hasMock = (id: string) =>
    state.examSits.some((sit) => sit.mockId === id) || state.mocks.some((item) => item.mockId === id)
  if (!hasMock('group-a')) {
    return { mock: 'group-a', title: 'Group mock A', reason: 'Sit Group mock A to check Number under timed conditions' }
  }
  if (!hasMock('year-10')) {
    return { mock: 'year-10', title: 'Year 10 mock', reason: 'Sit the Year 10 two-paper mock next' }
  }
  if (!hasMock('november')) {
    return { mock: 'november', title: 'November mock', reason: 'Sit the Y11 autumn three-paper mock' }
  }
  if (!hasMock('march')) {
    return { mock: 'march', title: 'March mock', reason: 'Sit the Y11 spring full-spec mock' }
  }
  if (!hasMock('full-gcse')) {
    return { mock: 'full-gcse', title: 'Full GCSE mock', reason: 'Sit the three-paper Full GCSE mock' }
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

export function recordExamSit(state: ProgressState, sit: ExamSit): ProgressState {
  const skills: AttemptResult['skills'] = {}
  const questionResults: AttemptResult['questionResults'] = []
  for (const paper of sit.papers) {
    for (const [skill, score] of Object.entries(paper.result.skills)) {
      const bucket = skills[skill] ?? { marks: 0, total: 0 }
      bucket.marks += score.marks
      bucket.total += score.total
      skills[skill] = bucket
    }
    questionResults.push(...paper.result.questionResults)
  }
  const summary: MockHistoryItem = {
    mockId: sit.mockId,
    at: sit.at,
    marks: sit.marks,
    total: sit.total,
    percent: sit.percent,
    band: sit.band,
    durationSeconds: sit.durationSeconds,
    skills,
    questionResults,
  }
  return {
    ...state,
    mocks: [summary, ...state.mocks].slice(0, 12),
    examSits: [sit, ...state.examSits].slice(0, 12),
    examDraft: undefined,
    examInProgress: undefined,
    mockDraft: undefined,
  }
}

export function latestExamSit(state: ProgressState, mockId: string): ExamSit | undefined {
  return state.examSits.find((sit) => sit.mockId === mockId)
}
