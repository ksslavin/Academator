import { Link, createFileRoute } from '@tanstack/react-router'
import { listExams } from '../content'
import { useProgress } from '../components/ProgressProvider'
import { Card, Pill, PrimaryButton } from '../components/ui'
import { examDurationMinutes, examMockTotal } from '../lib/exam'
import { latestExamSit } from '../lib/progress'

export const Route = createFileRoute('/mocks')({ component: MocksPage })

function MocksPage() {
  const { state } = useProgress()
  const exams = listExams()
  const inProgress = state.examInProgress

  return (
    <div className="space-y-6">
      <header>
        <h1 className="font-serif text-4xl">Mocks</h1>
        <p className="mt-2 text-slate-700">
          Sit timed papers in sequence. Paper 1 is always non-calculator (formula sheet only). Papers
          2 and 3 allow the in-app calculator. Grade bands after a mock are study estimates, not
          official boundaries.
        </p>
      </header>

      {inProgress ? (
        <Card className="border-teal-200 bg-teal-50/60">
          <p className="text-xs font-semibold uppercase tracking-wide text-teal-800">In progress</p>
          <p className="mt-1 font-medium">
            You have a sit underway. Continue from the mock hub card below.
          </p>
        </Card>
      ) : null}

      <div className="grid gap-3">
        {exams.map((exam) => {
          const last = latestExamSit(state, exam.id) ?? state.mocks.find((item) => item.mockId === exam.id)
          const active = inProgress?.mockId === exam.id
          const marks = examMockTotal(exam, state.tier)
          const minutes = examDurationMinutes(exam)
          return (
            <Card key={exam.id}>
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <Pill tone="live">Live</Pill>
                    {active ? <Pill>In progress</Pill> : null}
                    <Pill tone="muted">
                      {exam.papers.length} paper{exam.papers.length === 1 ? '' : 's'}
                    </Pill>
                  </div>
                  <h2 className="mt-2 font-serif text-2xl">{exam.title}</h2>
                  <p className="text-sm text-slate-600">{exam.subtitle}</p>
                  <p className="mt-2 text-slate-700">{exam.focus}</p>
                  <p className="mt-2 text-sm text-slate-600">
                    {minutes} minutes · {marks} marks on {state.tier === 'H' ? 'Higher' : 'Foundation'}
                  </p>
                  {last && 'percent' in last ? (
                    <p className="mt-2 text-sm">
                      Last sit {last.percent}% · band {last.band}
                    </p>
                  ) : null}
                </div>
                <Link to="/mocks/$mockId" params={{ mockId: exam.id }}>
                  <PrimaryButton>{active ? 'Continue' : 'Open mock'}</PrimaryButton>
                </Link>
              </div>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
