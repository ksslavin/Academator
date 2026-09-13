import type { AttemptResult, GradeBand, Question } from './types'
import { markQuestion, visibleForTier } from './marking'

export function gradeBand(percent: number): GradeBand {
  if (percent >= 80) return '8–9'
  if (percent >= 60) return '6–7'
  if (percent >= 40) return '4–5'
  return '1–3'
}

export function buildAttempt(options: {
  questions: Question[]
  answers: Record<string, string>
  startedAt: number
  endedAt?: number
}): AttemptResult {
  const endedAt = options.endedAt ?? Date.now()
  const questionResults = options.questions.map((question) => {
    const marked = markQuestion(question, options.answers)
    return {
      questionId: question.id,
      marksAwarded: marked.marksAwarded,
      marksAvailable: marked.marksAvailable,
      correct: marked.correct,
      parts: marked.parts,
    }
  })
  const marks = questionResults.reduce((sum, item) => sum + item.marksAwarded, 0)
  const total = questionResults.reduce((sum, item) => sum + item.marksAvailable, 0)
  const percent = total === 0 ? 0 : Math.round((marks / total) * 100)
  const skills: AttemptResult['skills'] = {}
  for (const question of options.questions) {
    const result = questionResults.find((item) => item.questionId === question.id)
    if (!result) continue
    const bucket = skills[question.skill] ?? { marks: 0, total: 0 }
    bucket.marks += result.marksAwarded
    bucket.total += result.marksAvailable
    skills[question.skill] = bucket
  }
  return {
    at: new Date(endedAt).toISOString(),
    marks,
    total,
    percent,
    band: gradeBand(percent),
    durationSeconds: Math.max(0, Math.round((endedAt - options.startedAt) / 1000)),
    skills,
    answers: options.answers,
    questionResults,
  }
}

export function paperTotal(questions: Question[], tier: 'F' | 'H'): number {
  return visibleForTier(questions, tier).reduce((sum, question) => {
    if (question.parts?.length) {
      return sum + question.parts.reduce((partSum, part) => partSum + part.marks, 0)
    }
    return sum + question.marks
  }, 0)
}
