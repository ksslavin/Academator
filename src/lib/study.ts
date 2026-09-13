import { getChapter } from '../content/catalog'
import { getLiveChapter, getMock } from '../content'
import type { CalculatorMode, Question, WeakQueueItem } from './types'
import { flattenParts } from './types'

const SKILL_HINTS: Record<string, string[]> = {
  'Equivalent fractions': [
    'Whatever you do to the numerator, do the same to the denominator.',
    'To simplify, divide both parts by the highest common factor.',
  ],
  'Mixed numbers': [
    'Improper: multiply the whole number by the denominator, then add the numerator.',
    'Mixed: divide the numerator by the denominator to get a whole number and a remainder.',
  ],
  'Four operations': [
    'Add or subtract only after you have a common denominator. Multiply straight across. Divide by multiplying by the reciprocal.',
    'Convert mixed numbers before you multiply or divide, then simplify.',
  ],
  'Fractions of amounts': [
    'Divide by the denominator, then multiply by the numerator (either order).',
    'If the question asks what is left, subtract the part you used from the original amount.',
  ],
  'Percentage of an amount': [
    '10% is divide by 10. Build other percentages from that, or use $\\dfrac{p}{100}\\times$ the amount.',
    '"Of" means multiply. Check the units in the question.',
  ],
  'Increase and decrease': [
    'Decide up or down first, then choose the multiplier $1+\\frac{p}{100}$ or $1-\\frac{p}{100}$.',
    'A percentage change compares the difference with the **original** amount.',
  ],
  'Reverse percentages': [
    'The number you are given is after the change. Divide by the multiplier — do not take $p\\%$ of the new amount.',
    'A $20\\%$ decrease means the new value is $80\\%$ of the original ($\\times 0.8$).',
  ],
  Multipliers: [
    'Increase $p\\%$ uses $\\times(1+\\frac{p}{100})$. Decrease uses $\\times(1-\\frac{p}{100})$.',
    'Compound change: apply the multiplier once per period, not $n\\times p\\%$.',
  ],
  'One- and two-step': [
    'Undo the operation furthest from $x$ first, and do the same to both sides.',
    'Check by substituting your answer back into the original equation.',
  ],
  Brackets: [
    'Expand first: the number outside multiplies every term inside the bracket.',
    'Then collect like terms and solve as a two-step equation.',
  ],
  'Unknowns on both sides': [
    'Collect the $x$ terms on one side and the numbers on the other.',
    'Keep the equation balanced — whatever you do to one side, do to the other.',
  ],
  'Fractional equations': [
    'Multiply through by the denominator to clear the fraction.',
    'Then solve the resulting linear equation as usual.',
  ],
  'Simplifying ratios': [
    'Convert to the same units first, then divide every part by the HCF.',
    'The order of the ratio must stay the same.',
  ],
  'Sharing in a ratio': [
    'Add the parts, divide the total by that sum to find one part, then multiply.',
    'Check that the shares add back to the original amount.',
  ],
  'Finding a part': [
    'Decide whether the given number is one part, the total, or the difference between parts.',
    'Find the value of one part, then scale to the missing quantity.',
  ],
  'Combining ratios': [
    'Make the linking quantity equal using the LCM, then write the combined ratio.',
    'Only the shared letter has to match before you read off the other two.',
  ],
  'Place value': [
    'Multiplying or dividing by 10, 100 or 1000 moves the digits; the decimal point stays and the digits slide.',
    'Count the zeros to see how many places to move.',
  ],
  Rounding: [
    'Look at the digit immediately after the place you are rounding to.',
    '5 or more rounds up; 4 or less stays the same.',
  ],
  'Directed numbers': [
    'Two minuses next to each other make a plus. A negative times a negative is positive.',
    'Use a number line for add and subtract if the signs are mixing you up.',
  ],
  Factors: [
    'HCF is the largest number that divides both. LCM is the smallest number that both divide into.',
    'Prime factor trees make both the HCF and the LCM quicker.',
  ],
  Fractions: [
    'Name the operation first: common denominator, multiply, or multiply by the reciprocal.',
    'Simplify your answer at the end.',
  ],
  Percentages: [
    'Write a multiplier or build from 10% and 1%.',
    'If the amount is after a change, you are reversing — divide by the multiplier.',
  ],
  Decimals: [
    'Ignore the decimal points to multiply, then put back as many decimal places as you started with.',
    'For rounding, look one digit further than the place named.',
  ],
  Indices: [
    'Multiplying the same base: add the indices. Dividing: subtract them.',
    '$a^n$ means $a$ multiplied by itself $n$ times.',
  ],
  'Standard form': [
    'Write $a\\times 10^n$ with $1\\le a<10$.',
    'Multiply the $a$ parts and add the powers of 10, then tidy into standard form.',
  ],
}

const CALC_IDS = new Set(['p-p13', 'p-t9', 'ga-20'])

export function calculatorMode(question: Question): CalculatorMode {
  if (question.calculator) return question.calculator
  return CALC_IDS.has(question.id) ? 'calc' : 'non-calc'
}

export function hintsFor(question: Question): string[] {
  if (question.hints?.length) return question.hints
  return SKILL_HINTS[question.skill] ?? [
    'Write down what you know and what you need to find.',
    'Use a method from the chapter theory, then check the size of your answer.',
  ]
}

export function solutionSteps(question: Question): Array<{ key: string; label: string; text: string }> {
  return flattenParts(question).flatMap((part) =>
    part.solution.map((text, index) => ({
      key: `${part.id}-${index}`,
      label: part.label ? `Part ${part.label}, step ${index + 1}` : `Step ${index + 1}`,
      text,
    })),
  )
}

export function correctAnswerLines(question: Question): string[] {
  return flattenParts(question).map((part) => {
    const prefix = part.label ? `(${part.label}) ` : ''
    if (part.spec.kind === 'mc') {
      return `${prefix}${part.spec.choices[part.spec.correctIndex]}`
    }
    return `${prefix}${part.spec.answer}`
  })
}

export function formatUserAnswer(question: Question, answers: Record<string, string>): string {
  const parts = flattenParts(question)
  const bits = parts.map((part) => {
    const raw = answers[part.id]
    if (raw === undefined || raw === '') return part.label ? `(${part.label}) —` : '—'
    if (part.spec.kind === 'mc') {
      const choice = part.spec.choices[Number(raw)]
      return part.label ? `(${part.label}) ${choice ?? raw}` : (choice ?? raw)
    }
    return part.label ? `(${part.label}) ${raw}` : raw
  })
  return bits.join(' · ')
}

export function chapterIdForQuestionId(questionId: string): number | null {
  if (questionId.startsWith('f-')) return 4
  if (questionId.startsWith('p-')) return 5
  if (questionId.startsWith('e-')) return 11
  if (questionId.startsWith('r-')) return 17
  return null
}

export function findQuestion(questionId: string): Question | undefined {
  const chapterId = chapterIdForQuestionId(questionId)
  if (chapterId) {
    const live = getLiveChapter(chapterId)
    return (
      live?.practice.find((item) => item.id === questionId) ??
      live?.test.questions.find((item) => item.id === questionId)
    )
  }
  return getMock('group-a')?.questions.find((item) => item.id === questionId)
}

export function practiceHref(item: WeakQueueItem): { slug: string; q: string } | { mockReview: true } | null {
  if (item.chapterId) {
    const chapter = getChapter(item.chapterId)
    if (!chapter?.live) return item.mockId ? { mockReview: true } : null
    const live = getLiveChapter(item.chapterId)
    const inPractice = live?.practice.some((question) => question.id === item.questionId)
    if (inPractice) return { slug: chapter.slug, q: item.questionId }
    return { slug: chapter.slug, q: live?.practice.find((question) => question.skill === item.skill)?.id ?? '' }
  }
  if (item.mockId) return { mockReview: true }
  return null
}

export function queueKey(source: WeakQueueItem['source'], questionId: string): string {
  return `${source}:${questionId}`
}
