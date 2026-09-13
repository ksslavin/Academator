import { Navigate, createFileRoute } from '@tanstack/react-router'
import { getChapter } from '../content/catalog'

export const Route = createFileRoute('/chapters/$slug/')({
  component: ChapterIndex,
})

function ChapterIndex() {
  const { slug } = Route.useParams()
  const chapter = getChapter(slug)
  if (!chapter) {
    return <Navigate to="/library" />
  }
  return <Navigate to="/chapters/$slug/theory" params={{ slug: chapter.slug }} />
}
