import type { AnswerSpec, MarkedPart, Question } from './types'
import { flattenParts } from './types'

function gcd(a: number, b: number): number {
  let x = Math.abs(a)
  let y = Math.abs(b)
  while (y) {
    const t = y
    y = x % y
    x = t
  }
  return x || 1
}

function parseMixedFraction(raw: string): { num: number; den: number } | null {
  const text = raw.trim().replace(/,/g, '')
  const mixed = text.match(/^(-?\d+)\s+(\d+)\s*\/\s*(\d+)$/)
  if (mixed) {
    const whole = Number(mixed[1])
    const num = Number(mixed[2])
    const den = Number(mixed[3])
    if (!den) return null
    const sign = whole < 0 ? -1 : 1
    return { num: sign * (Math.abs(whole) * den + num), den }
  }
  const frac = text.match(/^(-?\d+)\s*\/\s*(-?\d+)$/)
  if (frac) {
    const num = Number(frac[1])
    const den = Number(frac[2])
    if (!den) return null
    return { num, den }
  }
  return null
}

function stripDecor(value: string): string {
  return value
    .trim()
    .replace(/£/g, '')
    .replace(/%/g, '')
    .replace(/,/g, '')
    .replace(/×/g, 'x')
    .replace(/\s+/g, ' ')
}

function parseScientific(value: string): number | null {
  const compact = value.replace(/\s/g, '').replace('×', 'x').replace('*', 'x')
  const pow = compact.match(/^(-?\d*\.?\d+)x10\^(-?\d+)$/i)
  if (pow) return Number(pow[1]) * 10 ** Number(pow[2])
  const exp = compact.match(/^(-?\d*\.?\d+)e(-?\d+)$/i)
  if (exp) return Number(exp[1]) * 10 ** Number(exp[2])
  return null
}

export function normaliseNumeric(value: string): string {
  return stripDecor(value).toLowerCase()
}

function numericEqual(
  user: string,
  expected: string,
  tolerance = 0,
  exact = false,
): boolean {
  const a = normaliseNumeric(user)
  const b = normaliseNumeric(expected)
  if (!a) return false
  if (a === b) return true

  const ratioA = a.split(':').map((part) => part.trim())
  const ratioB = b.split(':').map((part) => part.trim())
  if (ratioA.length > 1 && ratioA.length === ratioB.length) {
    return ratioA.every((part, i) => numericEqual(part, ratioB[i] ?? '', 0, true))
  }

  const fracA = parseMixedFraction(a)
  const fracB = parseMixedFraction(b)
  if (fracA && fracB) {
    if (exact) {
      const gA = gcd(fracA.num, fracA.den)
      const gB = gcd(fracB.num, fracB.den)
      return fracA.num / gA === fracB.num / gB && fracA.den / gA === fracB.den / gB
    }
    return fracA.num * fracB.den === fracB.num * fracA.den
  }

  const asNumber = (input: string, fraction: { num: number; den: number } | null) => {
    if (fraction) return fraction.num / fraction.den
    const sci = parseScientific(input)
    if (sci !== null && Number.isFinite(sci)) return sci
    const n = Number(input)
    return Number.isFinite(n) ? n : null
  }

  const nA = asNumber(a, fracA)
  const nB = asNumber(b, fracB)
  if (nA === null || nB === null) {
    return a.replace(/\s/g, '') === b.replace(/\s/g, '')
  }
  if (exact && (fracA || fracB) && !(fracA && fracB)) {
    // Allow 3/2 vs 1.5 only when not exact.
    return false
  }
  return Math.abs(nA - nB) <= tolerance + 1e-9
}

export function markSpec(user: string, spec: AnswerSpec): boolean {
  if (spec.kind === 'mc') {
    const index = Number(user)
    return index === spec.correctIndex
  }
  if (numericEqual(user, spec.answer, spec.tolerance ?? 0, spec.exact ?? false)) {
    return true
  }
  return (spec.accepted ?? []).some((alt) =>
    numericEqual(user, alt, spec.tolerance ?? 0, spec.exact ?? false),
  )
}

export function markQuestion(
  question: Question,
  answers: Record<string, string>,
): { marksAwarded: number; marksAvailable: number; correct: boolean; parts: MarkedPart[] } {
  const parts = flattenParts(question).map((part) => {
    const ok = markSpec(answers[part.id] ?? '', part.spec)
    return {
      partId: part.id,
      marksAwarded: ok ? part.marks : 0,
      marksAvailable: part.marks,
      correct: ok,
    }
  })
  const marksAwarded = parts.reduce((sum, part) => sum + part.marksAwarded, 0)
  const marksAvailable = parts.reduce((sum, part) => sum + part.marksAvailable, 0)
  return {
    marksAwarded,
    marksAvailable,
    correct: marksAwarded === marksAvailable && marksAvailable > 0,
    parts,
  }
}

export function visibleForTier<T extends { tier: 'F' | 'H' | 'both' }>(
  items: T[],
  tier: 'F' | 'H',
): T[] {
  return items.filter((item) => item.tier === 'both' || item.tier === tier)
}
