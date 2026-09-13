import { Link, createFileRoute } from '@tanstack/react-router'
import { getChapter } from '../content/catalog'
import { getLiveChapter } from '../content'
import { ResultsView } from '../components/ResultsView'
import { useProgress } from '../components/ProgressProvider'
import { Card } from '../components/ui'
import { visibleForTier } from '../lib/marking'
import { chapterProgress } from '../lib/progress'

export const Route = createFileRoute('/chapters/$slug/results')({
  component: ResultsPage,
})

function ResultsPage() {
  const { slug } = Route.useParams()
  const chapter = getChapter(slug)
  const live = chapter ? getLiveChapter(chapter.id) : undefined
  const { state } = useProgress()
  const last = chapter ? chapterProgress(state, chapter.id).tests[0] : undefined
  const questions = live ? visibleForTier(live.test.questions, state.tier) : []

  if (!chapter || !live) return null
  if (!last) {
    return (
      <Card>
        <p>No test submitted yet.</p>
        <Link
          to="/chapters/$slug/test"
          params={{ slug: chapter.slug }}
          className="mt-3 inline-flex min-h-11 text-sm font-semibold text-teal-800"
        >
          Go to the chapter test
        </Link>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      <ResultsView
        title={`${chapter.title} test`}
        result={last}
        questions={questions}
        theorySlug={chapter.slug}
      />
      <Link
        to="/chapters/$slug/test"
        params={{ slug: chapter.slug }}
        className="inline-flex min-h-11 text-sm font-semibold text-teal-800"
      >
        Retake chapter test
      </Link>
    </div>
  )
}
