import { Link } from '@tanstack/react-router'
import type { AttemptResult, Question } from '../lib/types'
import { calculatorMode, formatUserAnswer } from '../lib/study'
import { MathText } from './MathText'
import { SolutionBlock } from './QuestionForm'
import { Bar, Card, Pill, SecondaryButton } from './ui'

export function ResultsView({
  title,
  result,
  questions,
  theorySlug,
  reviewTo,
  reviewParams,
}: {
  title: string
  result: AttemptResult
  questions: Question[]
  theorySlug?: string
  reviewTo?: '/chapters/$slug/review' | '/mocks/group-a/review'
  reviewParams?: { slug: string }
}) {
  const missed = result.questionResults.filter((item) => !item.correct).length
  return (
    <div className="space-y-5">
      <Card>
        <p className="text-xs font-semibold uppercase tracking-wide text-teal-800">Results</p>
        <h1 className="font-serif text-3xl text-slate-900">{title}</h1>
        <div className="mt-4 grid gap-3 sm:grid-cols-4">
          <Stat label="Marks" value={`${result.marks} / ${result.total}`} />
          <Stat label="Percent" value={`${result.percent}%`} />
          <Stat label="Grade band" value={result.band} />
          <Stat
            label="Time"
            value={`${Math.floor(result.durationSeconds / 60)}m ${result.durationSeconds % 60}s`}
          />
        </div>
        <p className="mt-3 text-sm text-slate-600">
          Grade bands here are study guides only (1–3 / 4–5 / 6–7 / 8–9), not official exam-board boundaries.
        </p>
        <div className="mt-4 flex flex-wrap gap-2 print:hidden">
          {reviewTo === '/chapters/$slug/review' && reviewParams ? (
            <Link to="/chapters/$slug/review" params={reviewParams} search={{ from: 'test' }}>
              <SecondaryButton>
                Review wrong answers{missed ? ` (${missed})` : ''}
              </SecondaryButton>
            </Link>
          ) : null}
          {reviewTo === '/mocks/group-a/review' ? (
            <Link to="/mocks/group-a/review">
              <SecondaryButton>
                Review wrong answers{missed ? ` (${missed})` : ''}
              </SecondaryButton>
            </Link>
          ) : null}
        </div>
      </Card>

      <Card>
        <h2 className="font-serif text-xl">Skill breakdown</h2>
        <div className="mt-3 space-y-3">
          {Object.entries(result.skills).map(([skill, score]) => (
            <Bar
              key={skill}
              label={`${skill} · ${score.marks}/${score.total}`}
              value={score.total ? Math.round((score.marks / score.total) * 100) : 0}
            />
          ))}
        </div>
        {theorySlug ? (
          <Link
            to="/chapters/$slug/theory"
            params={{ slug: theorySlug }}
            className="mt-4 inline-flex min-h-11 items-center text-sm font-semibold text-teal-800"
          >
            Review the theory for these skills
          </Link>
        ) : null}
      </Card>

      <div className="space-y-3">
        {questions.map((question, index) => {
          const marked = result.questionResults.find((item) => item.questionId === question.id)
          return (
            <Card key={question.id}>
              <div className="flex flex-wrap items-center gap-2">
                <p className="text-sm font-semibold">Q{index + 1}</p>
                <Pill tone={marked?.correct ? 'live' : 'lock'}>
                  {marked?.marksAwarded ?? 0}/{marked?.marksAvailable ?? question.marks}
                </Pill>
                <Pill tone={calculatorMode(question) === 'calc' ? 'calc' : 'noncalc'}>
                  {calculatorMode(question) === 'calc' ? 'Calculator' : 'Non-calculator'}
                </Pill>
                <Pill>{question.skill}</Pill>
              </div>
              <div className="mt-2 text-slate-900">
                <MathText text={question.prompt} />
              </div>
              {result.answers ? (
                <p className="mt-2 text-sm text-slate-600">
                  Your answer: <MathText text={formatUserAnswer(question, result.answers)} />
                </p>
              ) : null}
              <div className="mt-3">
                <p className="mb-1 text-sm font-medium">Solution</p>
                <SolutionBlock question={question} />
              </div>
            </Card>
          )
        })}
      </div>
    </div>
  )
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl bg-stone-50 px-3 py-3">
      <p className="text-xs uppercase tracking-wide text-slate-500">{label}</p>
      <p className="font-serif text-2xl text-slate-900">{value}</p>
    </div>
  )
}
