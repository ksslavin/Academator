import type { CalculatorMode, ItemTier, Question, QuestionPart } from '../lib/types'

type Base = {
  id: string
  prompt: string
  skill: string
  tier?: ItemTier
  hints?: string[]
  calculator?: CalculatorMode
}

export function numeric(
  options: Base & {
    marks: number
    answer: string
    accepted?: string[]
    tolerance?: number
    exact?: boolean
    placeholder?: string
    solution: string[]
  },
): Question {
  return {
    id: options.id,
    prompt: options.prompt,
    skill: options.skill,
    tier: options.tier ?? 'both',
    marks: options.marks,
    spec: {
      kind: 'numeric',
      answer: options.answer,
      accepted: options.accepted,
      tolerance: options.tolerance,
      exact: options.exact,
      placeholder: options.placeholder,
    },
    solution: options.solution,
    hints: options.hints,
    calculator: options.calculator,
  }
}

export function mc(
  options: Base & {
    marks: number
    choices: string[]
    correctIndex: number
    solution: string[]
  },
): Question {
  return {
    id: options.id,
    prompt: options.prompt,
    skill: options.skill,
    tier: options.tier ?? 'both',
    marks: options.marks,
    spec: {
      kind: 'mc',
      choices: options.choices,
      correctIndex: options.correctIndex,
    },
    solution: options.solution,
    hints: options.hints,
    calculator: options.calculator,
  }
}

export function multi(
  options: Base & {
    parts: Array<
      Omit<QuestionPart, 'spec'> & {
        answer?: string
        accepted?: string[]
        tolerance?: number
        exact?: boolean
        placeholder?: string
        choices?: string[]
        correctIndex?: number
      }
    >
  },
): Question {
  const parts: QuestionPart[] = options.parts.map((part) => {
    if (part.choices) {
      return {
        id: part.id,
        label: part.label,
        prompt: part.prompt,
        marks: part.marks,
        spec: {
          kind: 'mc',
          choices: part.choices,
          correctIndex: part.correctIndex ?? 0,
        },
        solution: part.solution,
      }
    }
    return {
      id: part.id,
      label: part.label,
      prompt: part.prompt,
      marks: part.marks,
      spec: {
        kind: 'numeric',
        answer: part.answer ?? '',
        accepted: part.accepted,
        tolerance: part.tolerance,
        exact: part.exact,
        placeholder: part.placeholder,
      },
      solution: part.solution,
    }
  })
  return {
    id: options.id,
    prompt: options.prompt,
    skill: options.skill,
    tier: options.tier ?? 'both',
    marks: parts.reduce((sum, part) => sum + part.marks, 0),
    parts,
    hints: options.hints,
    calculator: options.calculator,
  }
}
