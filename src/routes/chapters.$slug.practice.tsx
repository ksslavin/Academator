import { Link, createFileRoute } from '@tanstack/react-router'
import { useEffect, useState } from 'react'
import { getChapter } from '../content/catalog'
import { getLiveChapter } from '../content'
import { PracticeQuestion } from '../components/QuestionForm'
import { useProgress } from '../components/ProgressProvider'
import { Card, Pill } from '../components/ui'
import { visibleForTier } from '../lib/marking'
import { chapterProgress, missedPractice, recordPractice, upsertChapter } from '../lib/progress'

export const Route = createFileRoute('/chapters/$slug/practice')({
  validateSearch: (search: Record<string, unknown>): { q?: string } => ({
    q: typeof search.q === 'string' ? search.q : undefined,
  }),
  component: PracticePage,
})

function parseStoredAnswers(raw: string | undefined, fallbackId: string): Record<string, string> {
  if (!raw) return {}
  try {
    const parsed = JSON.parse(raw) as unknown
    if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
      return parsed as Record<string, string>
    }
  } catch {
    return { [fallbackId]: raw }
  }
  return { [fallbackId]: raw }
}

function PracticePage() {
  const { slug } = Route.useParams()
  const { q } = Route.useSearch()
  const chapter = getChapter(slug)
  const live = chapter ? getLiveChapter(chapter.id) : undefined
  const { state, update } = useProgress()
  const questions = live ? visibleForTier(live.practice, state.tier) : []
  const initialIndex = q ? Math.max(0, questions.findIndex((item) => item.id === q)) : 0
  const [index, setIndex] = useState(initialIndex < 0 ? 0 : initialIndex)

  useEffect(() => {
    if (!q) return
    const next = questions.findIndex((item) => item.id === q)
    if (next >= 0) setIndex(next)
    // Only jump when the deep-link id changes, not when the questions array identity changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q])

  useEffect(() => {
    if (!chapter) return
    const lastPath = `/chapters/${chapter.slug}/practice`
    update((current) => {
      if (current.lastChapterId === chapter.id && current.lastPath === lastPath) return current
      return { ...upsertChapter(current, chapter.id, {}), lastPath }
    })
  }, [chapter, update])

  if (!chapter || !live) return null

  const progress = chapterProgress(state, chapter.id)
  const question = questions[index]
  const done = questions.filter((item) => progress.practice[item.id]).length
  const missed = missedPractice(state, chapter.id, questions)

  if (!question) {
    return <Card>No practice questions for this tier.</Card>
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-sm text-slate-600">
          One question at a time. Use hints or show the next step, then mark. Try again if you need another go.
        </p>
        <div className="flex flex-wrap items-center gap-2">
          <Pill>
            {done}/{questions.length} attempted
          </Pill>
          {missed.length > 0 ? (
            <Link
              to="/chapters/$slug/review"
              params={{ slug: chapter.slug }}
              search={{ from: 'practice' }}
              className="text-sm font-semibold text-teal-800"
            >
              Review missed ({missed.length})
            </Link>
          ) : null}
        </div>
      </div>
      <div className="flex flex-wrap gap-1">
        {questions.map((item, itemIndex) => {
          const record = progress.practice[item.id]
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => setIndex(itemIndex)}
              className={`min-h-10 min-w-10 rounded-lg text-xs font-semibold ${
                itemIndex === index
                  ? 'bg-slate-900 text-white'
                  : record?.correct
                    ? 'bg-teal-100 text-teal-900'
                    : record
                      ? 'bg-amber-100 text-amber-900'
                      : 'bg-white text-slate-600'
              }`}
            >
              {itemIndex + 1}
            </button>
          )
        })}
      </div>
      <Card>
        <PracticeQuestion
          key={question.id}
          question={question}
          index={index}
          total={questions.length}
          initial={
            progress.practice[question.id]
              ? {
                  answers: parseStoredAnswers(progress.practice[question.id]?.lastAnswer, question.id),
                  marked: true,
                }
              : undefined
          }
          onMarked={(answers, correct) => {
            update((current) =>
              recordPractice(current, chapter.id, question, correct, JSON.stringify(answers)),
            )
          }}
          onNext={() => setIndex((current) => Math.min(questions.length - 1, current + 1))}
          onPrev={() => setIndex((current) => Math.max(0, current - 1))}
        />
      </Card>
    </div>
  )
}
