import { Link, createFileRoute, useNavigate } from '@tanstack/react-router'
import { useCallback, useState } from 'react'
import { getMock } from '../content'
import { PaperQuestion } from '../components/QuestionForm'
import { ResultsView } from '../components/ResultsView'
import { Timer } from '../components/Timer'
import { useProgress } from '../components/ProgressProvider'
import { Card, PrimaryButton, SecondaryButton } from '../components/ui'
import { buildAttempt, paperTotal } from '../lib/grades'
import { visibleForTier } from '../lib/marking'
import { recordMock } from '../lib/progress'

export const Route = createFileRoute('/mocks_/group-a')({ component: GroupMockA })

function GroupMockA() {
  const mock = getMock('group-a')!
  const { state, update } = useProgress()
  const navigate = useNavigate()
  const questions = visibleForTier(mock.questions, state.tier)
  const total = paperTotal(mock.questions, state.tier)
  const draft = state.mockDraft?.mockId === 'group-a' ? state.mockDraft : undefined
  const [phase, setPhase] = useState<'intro' | 'live' | 'done'>(draft ? 'live' : 'intro')
  const last = state.mocks.find((item) => item.mockId === 'group-a')

  const start = () => {
    const startedAt = Date.now()
    const endsAt = startedAt + mock.durationMinutes * 60 * 1000
    update((current) => ({
      ...current,
      lastPath: '/mocks/group-a',
      mockDraft: { mockId: 'group-a', startedAt, endsAt, answers: {} },
    }))
    setPhase('live')
  }

  const submit = useCallback(() => {
    let submitted = false
    update((current) => {
      const currentDraft = current.mockDraft?.mockId === 'group-a' ? current.mockDraft : undefined
      if (!currentDraft) return current
      submitted = true
      return recordMock(current, {
        ...buildAttempt({
          questions,
          answers: currentDraft.answers,
          startedAt: currentDraft.startedAt,
        }),
        mockId: 'group-a',
      })
    })
    if (submitted) setPhase('done')
  }, [questions, update])

  if (phase === 'done' && last) {
    return (
      <div className="space-y-4">
        <ResultsView title="Group mock A" result={last} questions={questions} />
        <Link to="/mocks" className="inline-flex min-h-11 text-sm font-semibold text-teal-800">
          Back to mocks
        </Link>
      </div>
    )
  }

  if (phase === 'live' && draft) {
    return (
      <div className="space-y-4">
        <div className="sticky top-[4.25rem] z-20 flex items-center justify-between gap-3 rounded-2xl border border-stone-200 bg-[rgba(246,241,232,0.95)] px-4 py-3">
          <div>
            <p className="text-sm font-semibold">Group mock A</p>
            <p className="text-xs text-slate-600">{total} marks · no solutions until you submit</p>
          </div>
          <div className="flex items-center gap-2">
            <Timer endsAt={draft.endsAt} onExpire={submit} />
            <PrimaryButton onClick={submit}>Submit</PrimaryButton>
          </div>
        </div>
        {questions.map((question, index) => (
          <PaperQuestion
            key={question.id}
            question={question}
            index={index}
            total={questions.length}
            answers={draft.answers}
            onChange={(partId, value) =>
              update((current) => {
                if (!current.mockDraft || current.mockDraft.mockId !== 'group-a') return current
                return {
                  ...current,
                  mockDraft: {
                    ...current.mockDraft,
                    answers: { ...current.mockDraft.answers, [partId]: value },
                  },
                }
              })
            }
          />
        ))}
        <PrimaryButton className="w-full" onClick={submit}>
          Submit paper
        </PrimaryButton>
      </div>
    )
  }

  return (
    <Card className="space-y-4">
      <h1 className="font-serif text-3xl">{mock.title}</h1>
      <p className="text-slate-700">{mock.focus}</p>
      <ul className="list-disc space-y-1 pl-5 text-sm text-slate-700">
        <li>About {mock.durationMinutes} minutes</li>
        <li>{total} marks on your current tier</li>
        <li>Marked on submit — solutions appear at the end</li>
        <li>Higher-only items are hidden on Foundation</li>
      </ul>
      <div className="flex flex-wrap gap-2">
        <PrimaryButton onClick={start}>Start timed mock</PrimaryButton>
        <SecondaryButton onClick={() => navigate({ to: '/mocks' })}>Back</SecondaryButton>
      </div>
    </Card>
  )
}
