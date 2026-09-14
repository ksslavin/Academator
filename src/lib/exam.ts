import { gradeBand, paperTotal } from './grades'
import { visibleForTier } from './marking'
import type {
  AssessmentObjective,
  AttemptResult,
  ExamMock,
  ExamPaper,
  ExamPaperSit,
  ExamSit,
  Question,
  Tier,
} from './types'

export function examQuestions(paper: ExamPaper, tier: Tier): Question[] {
  return visibleForTier(paper.questions, tier)
}

export function examPaperTotal(paper: ExamPaper, tier: Tier): number {
  return paperTotal(paper.questions, tier)
}

export function examMockTotal(exam: ExamMock, tier: Tier): number {
  return exam.papers.reduce((sum, paper) => sum + examPaperTotal(paper, tier), 0)
}

export function examDurationMinutes(exam: ExamMock): number {
  return exam.papers.reduce((sum, paper) => sum + paper.durationMinutes, 0)
}

export function paperIndex(exam: ExamMock, paperId: string): number {
  return exam.papers.findIndex((paper) => paper.id === paperId)
}

export function previousPapersComplete(
  exam: ExamMock,
  paperId: string,
  completed: ExamPaperSit[],
): boolean {
  const index = paperIndex(exam, paperId)
  if (index <= 0) return true
  return exam.papers.slice(0, index).every((paper) => completed.some((sit) => sit.paperId === paper.id))
}

export function nextIncompletePaper(
  exam: ExamMock,
  completed: ExamPaperSit[],
): ExamPaper | undefined {
  return exam.papers.find((paper) => !completed.some((sit) => sit.paperId === paper.id))
}

export function combineExamSit(options: {
  exam: ExamMock
  papers: ExamPaperSit[]
}): ExamSit {
  const marks = options.papers.reduce((sum, paper) => sum + paper.result.marks, 0)
  const total = options.papers.reduce((sum, paper) => sum + paper.result.total, 0)
  const percent = total === 0 ? 0 : Math.round((marks / total) * 100)
  const durationSeconds = options.papers.reduce((sum, paper) => sum + paper.result.durationSeconds, 0)
  const endedAt = options.papers.at(-1)?.result.at ?? new Date().toISOString()
  return {
    mockId: options.exam.id,
    title: options.exam.title,
    at: endedAt,
    marks,
    total,
    percent,
    band: gradeBand(percent),
    durationSeconds,
    papers: options.papers,
  }
}

export function aoBreakdown(
  questions: Question[],
  result: AttemptResult,
): Array<{ ao: AssessmentObjective; marks: number; total: number; percent: number }> {
  const buckets: Record<AssessmentObjective, { marks: number; total: number }> = {
    1: { marks: 0, total: 0 },
    2: { marks: 0, total: 0 },
    3: { marks: 0, total: 0 },
  }
  for (const question of questions) {
    const ao = question.ao
    if (!ao) continue
    const marked = result.questionResults.find((item) => item.questionId === question.id)
    if (!marked) continue
    buckets[ao].marks += marked.marksAwarded
    buckets[ao].total += marked.marksAvailable
  }
  return ([1, 2, 3] as const)
    .map((ao) => ({
      ao,
      marks: buckets[ao].marks,
      total: buckets[ao].total,
      percent: buckets[ao].total === 0 ? 0 : Math.round((buckets[ao].marks / buckets[ao].total) * 100),
    }))
    .filter((item) => item.total > 0)
}

