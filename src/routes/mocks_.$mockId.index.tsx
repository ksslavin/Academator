import { Link, createFileRoute, useNavigate } from '@tanstack/react-router'
import { getExam } from '../content'
import { useProgress } from '../components/ProgressProvider'
import { Card, Pill, PrimaryButton, SecondaryButton } from '../components/ui'
import { examPaperTotal, nextIncompletePaper } from '../lib/exam'
import { latestExamSit } from '../lib/progress'

export const Route = createFileRoute('/mocks_/$mockId/')({ component: ExamIntroPage })

function ExamIntroPage() {
  const { mockId } = Route.useParams()
  const exam = getExam(mockId)
  const { state, update } = useProgress()
  const navigate = useNavigate()

  if (!exam) {
    return (
      <Card>
        <h1 className="font-serif text-3xl">Mock not found</h1>
        <Link to="/mocks" className="mt-3 inline-flex min-h-11 text-sm font-semibold text-teal-800">
          Back to mocks
        </Link>
      </Card>
    )
  }

  const progress = state.examInProgress?.mockId === exam.id ? state.examInProgress : undefined
  const draft = state.examDraft?.mockId === exam.id ? state.examDraft : undefined
  const last = latestExamSit(state, exam.id)
  const next = nextIncompletePaper(exam, progress?.papers ?? [])

  const abandon = () => {
    if (!window.confirm('Abandon this sit and return to a clean start? Completed papers in this sit will be lost.')) {
      return
    }
    update((current) => ({
      ...current,
      examDraft: current.examDraft?.mockId === exam.id ? undefined : current.examDraft,
      examInProgress: current.examInProgress?.mockId === exam.id ? undefined : current.examInProgress,
    }))
  }

  return (
    <div className="space-y-5">
      <Card className="space-y-3">
        <Pill tone="live">Phase C exam</Pill>
        <h1 className="font-serif text-3xl">{exam.title}</h1>
        <p className="text-slate-700">{exam.focus}</p>
        <ul className="list-disc space-y-1 pl-5 text-sm text-slate-700">
          <li>Sit papers in order. Later papers unlock after you submit the one before.</li>
          <li>Paper 1 is non-calculator — formula sheet only, no calculator pad.</li>
          {exam.papers.length > 1 ? (
            <li>Later papers allow the in-app calculator.</li>
          ) : null}
          <li>You can pause a paper or submit early. The countdown is real time.</li>
          <li>Higher-only items are hidden on Foundation.</li>
          <li>After the last paper you get a grade-band estimate and a per-question review.</li>
        </ul>
        <div className="flex flex-wrap gap-2">
          {next ? (
            <Link
              to="/mocks/$mockId/sit/$paperId"
              params={{ mockId: exam.id, paperId: draft?.paperId ?? next.id }}
            >
              <PrimaryButton>{progress || draft ? 'Continue sit' : 'Start paper 1'}</PrimaryButton>
            </Link>
          ) : last ? (
            <Link to="/mocks/$mockId/review" params={{ mockId: exam.id }}>
              <PrimaryButton>Review last sit</PrimaryButton>
            </Link>
          ) : null}
          {progress || draft ? (
            <SecondaryButton onClick={abandon}>Abandon sit</SecondaryButton>
          ) : null}
          <SecondaryButton onClick={() => navigate({ to: '/mocks' })}>Back</SecondaryButton>
        </div>
      </Card>

      <div className="grid gap-3">
        {exam.papers.map((paper, index) => {
          const done = progress?.papers.find((item) => item.paperId === paper.id)
          const isDraft = draft?.paperId === paper.id
          const previousDone =
            index === 0 || exam.papers.slice(0, index).every((item) => progress?.papers.some((sit) => sit.paperId === item.id))
          const locked = !previousDone
          return (
            <Card key={paper.id}>
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <Pill tone={paper.calculator === 'non-calc' ? 'lock' : 'live'}>
                      {paper.calculator === 'non-calc' ? 'Non-calculator' : 'Calculator'}
                    </Pill>
                    {done ? <Pill tone="live">Submitted</Pill> : null}
                    {isDraft ? <Pill>In progress</Pill> : null}
                    {locked ? <Pill tone="lock">Locked</Pill> : null}
                  </div>
                  <h2 className="mt-2 font-serif text-xl">
                    {paper.title}
                    <span className="ml-2 text-base font-normal text-slate-500">
                      {paper.durationMinutes} min · {examPaperTotal(paper, state.tier)} marks
                    </span>
                  </h2>
                  {done ? (
                    <p className="mt-1 text-sm text-slate-600">
                      {done.result.marks}/{done.result.total} · {done.result.percent}% · band {done.result.band}
                    </p>
                  ) : (
                    <p className="mt-1 text-sm text-slate-600">
                      {paper.calculator === 'non-calc'
                        ? 'Formula sheet available. No calculator affordances.'
                        : 'In-app calculator available during this paper.'}
                    </p>
                  )}
                </div>
                {!locked && !done ? (
                  <Link to="/mocks/$mockId/sit/$paperId" params={{ mockId: exam.id, paperId: paper.id }}>
                    <PrimaryButton>{isDraft ? 'Resume' : 'Sit paper'}</PrimaryButton>
                  </Link>
                ) : null}
              </div>
            </Card>
          )
        })}
      </div>

      {last ? (
        <Card>
          <h2 className="font-serif text-xl">Last completed sit</h2>
          <p className="mt-1 text-sm text-slate-600">
            {new Date(last.at).toLocaleString('en-GB')} · {last.marks}/{last.total} · {last.percent}% ·
            band {last.band}
          </p>
          <Link
            to="/mocks/$mockId/review"
            params={{ mockId: exam.id }}
            className="mt-3 inline-flex min-h-11 text-sm font-semibold text-teal-800"
          >
            Open question-by-question review
          </Link>
        </Card>
      ) : null}
    </div>
  )
}
