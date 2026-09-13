import { Link } from '@tanstack/react-router'
import type { Question } from '../lib/types'
import { calculatorMode, correctAnswerLines, formatUserAnswer, hintsFor } from '../lib/study'
import { MathText } from './MathText'
import { SolutionBlock } from './QuestionForm'
import { Card, Pill, SecondaryButton } from './ui'

export type ReviewItem = {
  question: Question
  index: number
  userAnswer?: string
  answers?: Record<string, string>
}

export function ReviewView({
  title,
  subtitle,
  items,
  theorySlug,
  practiceSlug,
}: {
  title: string
  subtitle?: string
  items: ReviewItem[]
  theorySlug?: string
  practiceSlug?: string
}) {
  return (
    <div className="review-print space-y-5">
      <Card className="print:border-0 print:shadow-none">
        <p className="text-xs font-semibold uppercase tracking-wide text-teal-800">Review</p>
        <h1 className="font-serif text-3xl text-slate-900">{title}</h1>
        <p className="mt-2 text-slate-700">
          {subtitle ??
            (items.length === 0
              ? 'Nothing to revise here — no missed questions in this set.'
              : `${items.length} missed question${items.length === 1 ? '' : 's'} with the correct answer and full solution.`)}
        </p>
        <div className="mt-4 flex flex-wrap gap-2 print:hidden">
          <SecondaryButton onClick={() => window.print()}>Print review</SecondaryButton>
          {theorySlug ? (
            <Link
              to="/chapters/$slug/theory"
              params={{ slug: theorySlug }}
              className="inline-flex min-h-12 items-center text-sm font-semibold text-teal-800"
            >
              Back to theory
            </Link>
          ) : null}
          {practiceSlug ? (
            <Link
              to="/chapters/$slug/practice"
              params={{ slug: practiceSlug }}
              className="inline-flex min-h-12 items-center text-sm font-semibold text-teal-800"
            >
              Practise again
            </Link>
          ) : null}
        </div>
      </Card>

      {items.map((item) => {
        const user =
          item.userAnswer ??
          (item.answers ? formatUserAnswer(item.question, item.answers) : '—')
        return (
          <article
            key={item.question.id}
            className="break-inside-avoid rounded-2xl border border-stone-200 bg-white p-5 print:break-inside-avoid print:border-stone-400"
          >
            <div className="flex flex-wrap items-center gap-2">
              <p className="text-sm font-semibold">Q{item.index + 1}</p>
              <Pill tone={calculatorMode(item.question) === 'calc' ? 'calc' : 'noncalc'}>
                {calculatorMode(item.question) === 'calc' ? 'Calculator' : 'Non-calculator'}
              </Pill>
              <Pill>{item.question.skill}</Pill>
              <Pill>
                {item.question.marks} mark{item.question.marks === 1 ? '' : 's'}
              </Pill>
            </div>
            <div className="mt-3 text-lg text-slate-900">
              <MathText text={item.question.prompt} />
            </div>
            <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-2">
              <div className="rounded-xl bg-amber-50 px-3 py-3">
                <dt className="text-xs font-semibold uppercase tracking-wide text-amber-900">Your answer</dt>
                <dd className="mt-1 text-slate-800">
                  <MathText text={user} />
                </dd>
              </div>
              <div className="rounded-xl bg-teal-50 px-3 py-3">
                <dt className="text-xs font-semibold uppercase tracking-wide text-teal-900">Correct answer</dt>
                <dd className="mt-1 text-slate-800">
                  {correctAnswerLines(item.question).map((line) => (
                    <div key={line}>
                      <MathText text={line} />
                    </div>
                  ))}
                </dd>
              </div>
            </dl>
            <div className="mt-4">
              <p className="mb-1 text-sm font-medium">Full solution</p>
              <SolutionBlock question={item.question} />
            </div>
            <div className="mt-3 text-sm text-slate-600 print:hidden">
              <p className="font-medium text-slate-800">Hints you can reuse</p>
              <ol className="mt-1 list-decimal pl-5">
                {hintsFor(item.question).map((hint) => (
                  <li key={hint}>
                    <MathText text={hint} />
                  </li>
                ))}
              </ol>
            </div>
          </article>
        )
      })}
    </div>
  )
}
