import { Link, createFileRoute, useNavigate } from '@tanstack/react-router'
import { useCallback, useEffect } from 'react'
import { getChapter } from '../content/catalog'
import { getLiveChapter } from '../content'
import { PaperQuestion } from '../components/QuestionForm'
import { Timer } from '../components/Timer'
import { useProgress } from '../components/ProgressProvider'
import { Card, PrimaryButton, SecondaryButton } from '../components/ui'
import { buildAttempt, paperTotal } from '../lib/grades'
import { visibleForTier } from '../lib/marking'
import { chapterProgress, recordTest, upsertChapter } from '../lib/progress'

export const Route = createFileRoute('/chapters/$slug/test')({
  component: TestPage,
})

function TestPage() {
  const { slug } = Route.useParams()
  const chapter = getChapter(slug)
  const live = chapter ? getLiveChapter(chapter.id) : undefined
  const { state, update } = useProgress()
  const navigate = useNavigate()
  const questions = live ? visibleForTier(live.test.questions, state.tier) : []
  const progress = chapter ? chapterProgress(state, chapter.id) : undefined
  const draft = progress?.testDraft

  useEffect(() => {
    if (!chapter) return
    const lastPath = `/chapters/${chapter.slug}/test`
    update((current) => {
      if (current.lastChapterId === chapter.id && current.lastPath === lastPath) return current
      return { ...upsertChapter(current, chapter.id, {}), lastPath }
    })
  }, [chapter, update])

  const submit = useCallback(() => {
    if (!chapter || !live || !draft) return
    const result = buildAttempt({
      questions,
      answers: draft.answers,
      startedAt: draft.startedAt,
    })
    update((current) => recordTest(current, chapter.id, result, questions))
    void navigate({ to: '/chapters/$slug/results', params: { slug: chapter.slug } })
  }, [chapter, draft, live, navigate, questions, update])

  if (!chapter || !live) return null

  const total = paperTotal(live.test.questions, state.tier)

  if (!draft) {
    const last = progress?.tests[0]
    return (
      <Card className="space-y-4">
        <h2 className="font-serif text-2xl">Chapter test</h2>
        <p className="text-slate-700">
          Timed {live.test.durationMinutes} minutes · {total} marks on{' '}
          {state.tier === 'H' ? 'Higher' : 'Foundation'}. Hints and step-by-step solutions stay hidden
          until you submit.
        </p>
        {last ? (
          <p className="text-sm text-slate-600">
            Last result {last.marks}/{last.total} ({last.percent}%, band {last.band}).
          </p>
        ) : null}
        <div className="flex flex-wrap gap-2">
          <PrimaryButton
            onClick={() => {
              const startedAt = Date.now()
              update((current) =>
                upsertChapter(current, chapter.id, {
                  testDraft: {
                    startedAt,
                    endsAt: startedAt + live.test.durationMinutes * 60 * 1000,
                    answers: {},
                  },
                }),
              )
            }}
          >
            Start timed test
          </PrimaryButton>
          {last ? (
            <Link to="/chapters/$slug/results" params={{ slug: chapter.slug }}>
              <SecondaryButton>View last results</SecondaryButton>
            </Link>
          ) : null}
        </div>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      <div className="sticky top-[4.25rem] z-20 flex items-center justify-between gap-3 rounded-2xl border border-stone-200 bg-[rgba(246,241,232,0.95)] px-4 py-3">
        <div>
          <p className="text-sm font-semibold">Chapter test</p>
          <p className="text-xs text-slate-600">{total} marks · mark on submit</p>
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
              const existing = chapterProgress(current, chapter.id).testDraft
              if (!existing) return current
              return upsertChapter(current, chapter.id, {
                testDraft: {
                  ...existing,
                  answers: { ...existing.answers, [partId]: value },
                },
              })
            })
          }
        />
      ))}
      <PrimaryButton className="w-full" onClick={submit}>
        Submit test
      </PrimaryButton>
    </div>
  )
}
