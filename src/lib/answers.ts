import type { AnswerSpec, Question } from './types'
import { flattenParts } from './types'

export function formatCorrect(spec: AnswerSpec): string {
  if (spec.kind === 'mc') {
    return spec.choices[spec.correctIndex] ?? ''
  }
  return spec.answer
}

export function formatUserAnswer(spec: AnswerSpec, raw: string | undefined): string {
  if (!raw) return 'No answer'
  if (spec.kind === 'mc') {
    const index = Number(raw)
    return spec.choices[index] ?? raw
  }
  return raw
}

export function questionAnswerLines(
  question: Question,
  answers: Record<string, string>,
): Array<{ label: string; yours: string; correct: string }> {
  return flattenParts(question).map((part) => ({
    label: part.label ? `Part ${part.label}` : 'Answer',
    yours: formatUserAnswer(part.spec, answers[part.id]),
    correct: formatCorrect(part.spec),
  }))
}
