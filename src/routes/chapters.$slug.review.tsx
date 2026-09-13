import { createFileRoute } from '@tanstack/react-router'
import { getChapter } from '../content/catalog'
import { getLiveChapter } from '../content'
import { ReviewView } from '../components/ReviewView'
import { useProgress } from '../components/ProgressProvider'
import { Card } from '../components/ui'
import { visibleForTier } from '../lib/marking'
import { chapterProgress, missedPractice } from '../lib/progress'
import { formatUserAnswer } from '../lib/study'

export const Route = createFileRoute('/chapters/$slug/review')({
  validateSearch: (search: Record<string, unknown>): { from?: 'practice' | 'test' | 'all' } => ({
    from:
      search.from === 'practice' || search.from === 'test' || search.from === 'all'
        ? search.from
        : 'all',
  }),
  component: ChapterReview,
})

function ChapterReview() {
  const { slug } = Route.useParams()
  const { from } = Route.useSearch()
  const chapter = getChapter(slug)
  const live = chapter ? getLiveChapter(chapter.id) : undefined
  const { state } = useProgress()

  if (!chapter || !live) {
    return <Card>Chapter not found.</Card>
  }

  const practiceQuestions = visibleForTier(live.practice, state.tier)
  const testQuestions = visibleForTier(live.test.questions, state.tier)
  const lastTest = chapterProgress(state, chapter.id).tests[0]
  const practiceMissed = missedPractice(state, chapter.id, practiceQuestions)
  const testMissed =
    lastTest?.questionResults
      .filter((item) => !item.correct)
      .map((item) => testQuestions.find((question) => question.id === item.questionId))
      .filter((question): question is NonNullable<typeof question> => Boolean(question)) ?? []

  const items = [
    ...(from !== 'test'
      ? practiceMissed.map((question) => {
          const record = chapterProgress(state, chapter.id).practice[question.id]
          let answers: Record<string, string> = {}
          try {
            answers = record?.lastAnswer ? (JSON.parse(record.lastAnswer) as Record<string, string>) : {}
          } catch {
            answers = {}
          }
          return {
            question,
            index: practiceQuestions.findIndex((item) => item.id === question.id),
            userAnswer: formatUserAnswer(question, answers),
          }
        })
      : []),
    ...(from !== 'practice'
      ? testMissed.map((question) => ({
          question,
          index: testQuestions.findIndex((item) => item.id === question.id),
          answers: lastTest?.answers ?? {},
        }))
      : []),
  ]

  const label =
    from === 'practice' ? 'practice' : from === 'test' ? 'last chapter test' : 'practice and last test'

  return (
    <ReviewView
      title={`${chapter.title} · wrong answers`}
      subtitle={`Missed items from ${label}. Print this page for a paper copy.`}
      items={items}
      theorySlug={chapter.slug}
      practiceSlug={chapter.slug}
    />
  )
}
