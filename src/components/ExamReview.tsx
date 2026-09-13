import { Link } from '@tanstack/react-router'
import { questionAnswerLines } from '../lib/answers'
import { aoBreakdown } from '../lib/exam'
import { visibleForTier } from '../lib/marking'
import type { ExamMock, ExamSit, Tier } from '../lib/types'
import { MathText } from './MathText'
import { SolutionBlock } from './QuestionForm'
import { Bar, Card, Pill } from './ui'

export function ExamReview({
  exam,
  sit,
  tier,
}: {
  exam: ExamMock
  sit: ExamSit
  tier: Tier
}) {
  const allQuestions = sit.papers.flatMap((paperSit) => {
    const paper = exam.papers.find((item) => item.id === paperSit.paperId)
    return paper ? visibleForTier(paper.questions, tier) : []
  })
  const combinedResult = {
    ...sit.papers[0]!.result,
    marks: sit.marks,
    total: sit.total,
    percent: sit.percent,
    band: sit.band,
    durationSeconds: sit.durationSeconds,
    questionResults: sit.papers.flatMap((paper) => paper.result.questionResults),
  }
  const aos = aoBreakdown(allQuestions, combinedResult)

  return (
    <div className="space-y-5">
      <Card>
        <p className="text-xs font-semibold uppercase tracking-wide text-teal-800">Mock review</p>
        <h1 className="font-serif text-3xl text-slate-900">{sit.title}</h1>
        <div className="mt-4 grid gap-3 sm:grid-cols-4">
          <Stat label="Marks" value={`${sit.marks} / ${sit.total}`} />
          <Stat label="Percent" value={`${sit.percent}%`} />
          <Stat label="Grade band" value={sit.band} />
          <Stat
            label="Time"
            value={`${Math.floor(sit.durationSeconds / 60)}m ${sit.durationSeconds % 60}s`}
          />
        </div>
        <p className="mt-3 text-sm text-slate-600">
          Grade bands are study estimates only (1–3 / 4–5 / 6–7 / 8–9), not official year or board
          boundaries.
        </p>
      </Card>

      <div className="grid gap-3 md:grid-cols-3">
        {sit.papers.map((paper) => (
          <Card key={paper.paperId}>
            <Pill tone={paper.calculator === 'non-calc' ? 'lock' : 'live'}>
              {paper.calculator === 'non-calc' ? 'Non-calculator' : 'Calculator'}
            </Pill>
            <h2 className="mt-2 font-serif text-xl">{paper.title}</h2>
            <p className="mt-1 text-sm text-slate-600">
              {paper.result.marks}/{paper.result.total} · {paper.result.percent}% · band{' '}
              {paper.result.band}
            </p>
          </Card>
        ))}
      </div>

      {aos.length > 0 ? (
        <Card>
          <h2 className="font-serif text-xl">Assessment objective mix</h2>
          <div className="mt-3 space-y-3">
            {aos.map((item) => (
              <Bar
                key={item.ao}
                label={`AO${item.ao} · ${item.marks}/${item.total}`}
                value={item.percent}
              />
            ))}
          </div>
        </Card>
      ) : null}

      {sit.papers.map((paperSit) => {
        const paper = exam.papers.find((item) => item.id === paperSit.paperId)
        if (!paper) return null
        const questions = visibleForTier(paper.questions, tier)
        return (
          <section key={paperSit.paperId} className="space-y-3">
            <h2 className="font-serif text-2xl">{paper.title}</h2>
            {questions.map((question, index) => {
              const marked = paperSit.result.questionResults.find(
                (item) => item.questionId === question.id,
              )
              const lines = questionAnswerLines(question, paperSit.answers)
              return (
                <Card key={question.id}>
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="text-sm font-semibold">Q{index + 1}</p>
                    <Pill tone={marked?.correct ? 'live' : 'lock'}>
                      {marked?.marksAwarded ?? 0}/{marked?.marksAvailable ?? question.marks}
                    </Pill>
                    <Pill>{question.skill}</Pill>
                    {question.ao ? <Pill tone="muted">AO{question.ao}</Pill> : null}
                  </div>
                  <div className="mt-2 text-slate-900">
                    <MathText text={question.prompt} />
                  </div>
                  <div className="mt-3 space-y-2 rounded-xl bg-stone-50 px-3 py-3 text-sm">
                    {lines.map((line) => (
                      <div key={line.label}>
                        <p className="font-medium text-slate-700">{line.label}</p>
                        <p>
                          Yours: <MathText text={line.yours} />
                        </p>
                        <p>
                          Correct: <MathText text={line.correct} />
                        </p>
                      </div>
                    ))}
                  </div>
                  <div className="mt-3">
                    <p className="mb-1 text-sm font-medium">Solution</p>
                    <SolutionBlock question={question} />
                  </div>
                </Card>
              )
            })}
          </section>
        )
      })}

      <Link to="/mocks" className="inline-flex min-h-11 text-sm font-semibold text-teal-800">
        Back to mocks
      </Link>
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
