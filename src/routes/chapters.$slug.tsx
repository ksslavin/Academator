import { Link, Outlet, createFileRoute, useRouterState } from '@tanstack/react-router'
import { getChapter } from '../content/catalog'
import { getLiveChapter } from '../content'
import { useProgress } from '../components/ProgressProvider'
import { Card, Pill, cn } from '../components/ui'
import { chapterBars } from '../lib/progress'

export const Route = createFileRoute('/chapters/$slug')({
  component: ChapterLayout,
})

function ChapterLayout() {
  const { slug } = Route.useParams()
  const chapter = getChapter(slug)
  const live = chapter ? getLiveChapter(chapter.id) : undefined
  const pathname = useRouterState({ select: (s) => s.location.pathname })
  const { state } = useProgress()

  if (!chapter) {
    return (
      <Card>
        <h1 className="font-serif text-2xl">Chapter not found</h1>
        <Link to="/library" className="mt-3 inline-flex min-h-11 text-sm font-semibold text-teal-800">
          Back to library
        </Link>
      </Card>
    )
  }

  const bars = live ? chapterBars(state, chapter.id, live.practice) : null
  const tabs = [
    { to: '/chapters/$slug/theory' as const, label: 'Theory', path: `/chapters/${chapter.slug}/theory` },
    { to: '/chapters/$slug/practice' as const, label: 'Practice', path: `/chapters/${chapter.slug}/practice` },
    { to: '/chapters/$slug/test' as const, label: 'Test', path: `/chapters/${chapter.slug}/test` },
    { to: '/chapters/$slug/review' as const, label: 'Review', path: `/chapters/${chapter.slug}/review` },
  ]

  return (
    <div className="space-y-5">
      <header className="space-y-2">
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
          Book {chapter.bookId} · Chapter {chapter.id}
        </p>
        <h1 className="font-serif text-3xl text-slate-900">{chapter.title}</h1>
        <p className="text-slate-700">{chapter.blurb}</p>
        <div className="flex flex-wrap gap-2">
          {chapter.live ? <Pill tone="live">Live</Pill> : <Pill tone="lock">Coming soon</Pill>}
          {chapter.skills.slice(0, 3).map((skill) => (
            <Pill key={skill}>{skill}</Pill>
          ))}
        </div>
      </header>

      {chapter.live ? (
        <>
          <div className="flex gap-2 overflow-x-auto">
            {tabs.map((tab) => (
              <Link
                key={tab.path}
                to={tab.to}
                params={{ slug: chapter.slug }}
                className={cn(
                  'min-h-12 shrink-0 rounded-xl px-4 text-sm font-semibold',
                  pathname === tab.path ||
                    (tab.label === 'Test' && pathname.endsWith('/results')) ||
                    (tab.label === 'Review' && pathname.endsWith('/review'))
                    ? 'bg-teal-800 text-white'
                    : 'bg-white text-slate-700',
                )}
              >
                {tab.label}
                {bars && tab.label === 'Theory' && bars.theory ? ' · done' : ''}
              </Link>
            ))}
          </div>
          <Outlet />
        </>
      ) : (
        <Card className="border-dashed">
          <h2 className="font-serif text-xl">Coming in a later wave</h2>
          <p className="mt-2 text-slate-700">
            The title is here so the 30-chapter map is complete. Theory, practice and the chapter test
            will be added without changing the surrounding app.
          </p>
          <Link to="/library" className="mt-4 inline-flex min-h-11 text-sm font-semibold text-teal-800">
            Return to library
          </Link>
        </Card>
      )}
    </div>
  )
}
