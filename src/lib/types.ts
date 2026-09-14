export type Tier = 'F' | 'H'
export type ItemTier = 'F' | 'H' | 'both'

export type BookId = 1 | 2 | 3 | 4 | 5 | 6

export type ChapterMeta = {
  id: number
  slug: string
  title: string
  bookId: BookId
  live: boolean
  blurb: string
  skills: string[]
}

export type BookMeta = {
  id: BookId
  title: string
  strand: string
  chapterRange: string
  colour: string
}

export type WorkedExample = {
  title: string
  problem: string
  steps: string[]
  commonMistake: string
}

export type Theory = {
  goal: string
  youNeedFirst: string[]
  keyFacts: Array<{ title: string; body: string }>
  examples: WorkedExample[]
  watchOuts: string[]
}

export type NumericSpec = {
  kind: 'numeric'
  answer: string
  accepted?: string[]
  tolerance?: number
  exact?: boolean
  placeholder?: string
}

export type McSpec = {
  kind: 'mc'
  choices: string[]
  correctIndex: number
}

export type AnswerSpec = NumericSpec | McSpec

export type QuestionPart = {
  id: string
  label: string
  prompt: string
  marks: number
  spec: AnswerSpec
  solution: string[]
}

export type AssessmentObjective = 1 | 2 | 3
export type CalculatorMode = 'calc' | 'non-calc'
export type ExamStage = 'group' | 'year10' | 'november' | 'march' | 'full'

export type Question = {
  id: string
  prompt: string
  tier: ItemTier
  skill: string
  marks: number
  spec?: AnswerSpec
  parts?: QuestionPart[]
  solution?: string[]
  ao?: AssessmentObjective
  chapter?: number
}

export type ChapterContent = {
  meta: ChapterMeta
  theory: Theory
  practice: Question[]
  test: {
    durationMinutes: number
    questions: Question[]
  }
}

export type MockPaper = {
  id: string
  title: string
  subtitle: string
  focus: string
  durationMinutes: number
  questions: Question[]
}

export type ExamPaper = {
  id: string
  title: string
  calculator: CalculatorMode
  durationMinutes: number
  questions: Question[]
}

export type ExamMock = {
  id: string
  title: string
  subtitle: string
  focus: string
  stage: ExamStage
  papers: ExamPaper[]
}

export type PracticeRecord = {
  attempts: number
  correct: boolean
  lastAnswer?: string
}

export type MarkedPart = {
  partId: string
  marksAwarded: number
  marksAvailable: number
  correct: boolean
}

export type AttemptResult = {
  at: string
  marks: number
  total: number
  percent: number
  band: GradeBand
  durationSeconds: number
  skills: Record<string, { marks: number; total: number }>
  questionResults: Array<{
    questionId: string
    marksAwarded: number
    marksAvailable: number
    correct: boolean
    parts?: MarkedPart[]
  }>
}

export type GradeBand = '1–3' | '4–5' | '6–7' | '8–9'

export type ChapterProgress = {
  theoryComplete: boolean
  practice: Record<string, PracticeRecord>
  tests: AttemptResult[]
  testDraft?: {
    startedAt: number
    endsAt: number
    answers: Record<string, string>
  }
}

export type MockHistoryItem = AttemptResult & { mockId: string }

export type ExamPaperSit = {
  paperId: string
  title: string
  calculator: CalculatorMode
  result: AttemptResult
  answers: Record<string, string>
}

export type ExamSit = {
  mockId: string
  title: string
  at: string
  marks: number
  total: number
  percent: number
  band: GradeBand
  durationSeconds: number
  papers: ExamPaperSit[]
}

export type ExamDraft = {
  mockId: string
  paperId: string
  startedAt: number
  endsAt: number
  pausedRemainingMs?: number
  answers: Record<string, string>
}

export type ExamInProgress = {
  mockId: string
  papers: ExamPaperSit[]
}

export type ProgressState = {
  version: 1
  tier: Tier
  lastChapterId: number | null
  lastPath: string | null
  chapters: Record<string, ChapterProgress>
  mocks: MockHistoryItem[]
  mockDraft?: {
    mockId: string
    startedAt: number
    endsAt: number
    answers: Record<string, string>
  }
  examDraft?: ExamDraft
  examInProgress?: ExamInProgress
  examSits: ExamSit[]
}

export function questionMarks(question: Question): number {
  if (question.parts?.length) {
    return question.parts.reduce((sum, part) => sum + part.marks, 0)
  }
  return question.marks
}

export function flattenParts(question: Question): QuestionPart[] {
  if (question.parts?.length) {
    return question.parts
  }
  if (!question.spec) {
    throw new Error(`Question ${question.id} is missing an answer spec`)
  }
  return [
    {
      id: question.id,
      label: '',
      prompt: '',
      marks: question.marks,
      spec: question.spec,
      solution: question.solution ?? [],
    },
  ]
}
