import { createFileRoute } from '@tanstack/react-router'
import { useEffect, useState } from 'react'
import { getChapter } from '../content/catalog'
import { getLiveChapter } from '../content'
import { PracticeQuestion } from '../components/QuestionForm'
import { useProgress } from '../components/ProgressProvider'
import { Card, Pill } from '../components/ui'
import { visibleForTier } from '../lib/marking'
import { chapterProgress, recordPractice, upsertChapter } from '../lib/progress'

export const Route = createFileRoute('/chapters/$slug/practice')({
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
  const chapter = getChapter(slug)
  const live = chapter ? getLiveChapter(chapter.id) : undefined
  const { state, update } = useProgress()
  const questions = live ? visibleForTier(live.practice, state.tier) : []
  const [index, setIndex] = useState(0)

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

  if (!question) {
    return <Card>No practice questions for this tier.</Card>
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-sm text-slate-600">
          One question at a time. Mark instantly, then read the full solution.
        </p>
        <Pill>
          {done}/{questions.length} attempted
        </Pill>
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
              recordPractice(current, chapter.id, question.id, correct, JSON.stringify(answers)),
            )
          }}
          onNext={() => setIndex((current) => Math.min(questions.length - 1, current + 1))}
          onPrev={() => setIndex((current) => Math.max(0, current - 1))}
        />
      </Card>
    </div>
  )
}
