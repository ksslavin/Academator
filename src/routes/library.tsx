import { Link, createFileRoute } from '@tanstack/react-router'
import { BOOKS, CHAPTERS } from '../content/catalog'
import { getLiveChapter } from '../content'
import { useProgress } from '../components/ProgressProvider'
import { Bar, Card, Pill } from '../components/ui'
import { chapterBars } from '../lib/progress'

export const Route = createFileRoute('/library')({ component: Library })

function Library() {
  const { state } = useProgress()

  return (
    <div className="space-y-6">
      <header>
        <h1 className="font-serif text-4xl">Library</h1>
        <p className="mt-2 max-w-2xl text-slate-700">
          Thirty chapters across six books. Wave 1 is fully playable: Fractions, Percentages, Linear
          equations, and Ratio and sharing. Other titles are listed so you can see the map.
        </p>
      </header>

      {BOOKS.map((book) => {
        const chapters = CHAPTERS.filter((chapter) => chapter.bookId === book.id)
        return (
          <Card key={book.id} className="scroll-mt-24" >
            <div id={`book-${book.id}`} className="scroll-mt-24">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                {book.strand} · {book.chapterRange}
              </p>
              <h2 className="font-serif text-2xl">{book.title}</h2>
            </div>
            <ul className="mt-4 space-y-3">
              {chapters.map((chapter) => {
                const live = getLiveChapter(chapter.id)
                const bars = live ? chapterBars(state, chapter.id, live.practice) : null
                return (
                  <li key={chapter.id}>
                    {chapter.live ? (
                      <Link
                        to="/chapters/$slug/theory"
                        params={{ slug: chapter.slug }}
                        className="block rounded-xl border border-stone-200 px-4 py-4 hover:bg-stone-50"
                      >
                        <ChapterRow chapter={chapter} bars={bars} />
                      </Link>
                    ) : (
                      <div className="rounded-xl border border-dashed border-stone-300 bg-stone-50 px-4 py-4">
                        <ChapterRow chapter={chapter} bars={null} />
                      </div>
                    )}
                  </li>
                )
              })}
            </ul>
          </Card>
        )
      })}
    </div>
  )
}

function ChapterRow({
  chapter,
  bars,
}: {
  chapter: (typeof CHAPTERS)[number]
  bars: { theory: number; practice: number; test: number } | null
}) {
  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <p className="font-semibold text-slate-900">
            {chapter.id}. {chapter.title}
          </p>
          <p className="text-sm text-slate-600">{chapter.blurb}</p>
        </div>
        {chapter.live ? <Pill tone="live">Live</Pill> : <Pill tone="lock">Coming soon</Pill>}
      </div>
      {bars ? (
        <div className="grid gap-2 sm:grid-cols-3">
          <Bar label="Theory" value={bars.theory} />
          <Bar label="Practice" value={bars.practice} />
          <Bar label="Test" value={bars.test} />
        </div>
      ) : (
        <p className="text-sm text-stone-500">Locked for later waves — title shown for the full map.</p>
      )}
    </div>
  )
}
