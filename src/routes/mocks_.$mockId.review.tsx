import { Link, createFileRoute } from '@tanstack/react-router'
import { getExam } from '../content'
import { ExamReview } from '../components/ExamReview'
import { useProgress } from '../components/ProgressProvider'
import { Card, PrimaryButton } from '../components/ui'
import { latestExamSit } from '../lib/progress'

export const Route = createFileRoute('/mocks_/$mockId/review')({
  component: ExamReviewPage,
})

function ExamReviewPage() {
  const { mockId } = Route.useParams()
  const exam = getExam(mockId)
  const { state } = useProgress()
  const sit = exam ? latestExamSit(state, exam.id) : undefined

  if (!exam) {
    return (
      <Card>
        <p>Mock not found.</p>
        <Link to="/mocks" className="mt-3 inline-flex text-sm font-semibold text-teal-800">
          Back to mocks
        </Link>
      </Card>
    )
  }

  if (!sit) {
    return (
      <Card className="space-y-3">
        <h1 className="font-serif text-2xl">No completed sit yet</h1>
        <p className="text-slate-700">Finish every paper in this mock to open the review.</p>
        <Link to="/mocks/$mockId" params={{ mockId: exam.id }}>
          <PrimaryButton>Back to {exam.title}</PrimaryButton>
        </Link>
      </Card>
    )
  }

  return <ExamReview exam={exam} sit={sit} tier={state.tier} />
}
