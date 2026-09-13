import { createFileRoute } from '@tanstack/react-router'
import { getMock } from '../content'
import { ReviewView } from '../components/ReviewView'
import { useProgress } from '../components/ProgressProvider'
import { Card } from '../components/ui'
import { visibleForTier } from '../lib/marking'

export const Route = createFileRoute('/mocks_/group-a_/review')({
  component: MockReview,
})

function MockReview() {
  const mock = getMock('group-a')
  const { state } = useProgress()
  const last = state.mocks.find((item) => item.mockId === 'group-a')
  if (!mock) return <Card>Mock not found.</Card>
  const questions = visibleForTier(mock.questions, state.tier)
  if (!last) {
    return (
      <Card>
        <h1 className="font-serif text-2xl">No Group mock A result yet</h1>
        <p className="mt-2 text-slate-700">Sit the mock first, then this page lists only the questions you missed.</p>
      </Card>
    )
  }

  const items = last.questionResults
    .filter((item) => !item.correct)
    .map((item) => {
      const question = questions.find((entry) => entry.id === item.questionId)
      if (!question) return null
      return {
        question,
        index: questions.findIndex((entry) => entry.id === question.id),
        answers: last.answers ?? {},
      }
    })
    .filter((item): item is NonNullable<typeof item> => Boolean(item))

  return (
    <ReviewView
      title="Group mock A · wrong answers"
      subtitle="Printable review of missed Number questions. Hints stay hidden during the timed paper and appear here afterwards."
      items={items}
    />
  )
}
