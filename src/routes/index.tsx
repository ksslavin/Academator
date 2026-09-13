import { Link, createFileRoute, useRouter } from '@tanstack/react-router'
import { BOOKS, CHAPTERS, getChapter } from '../content/catalog'
import { getLiveChapter, livePracticeById } from '../content'
import { useProgress } from '../components/ProgressProvider'
import { Bar, Card, Pill, PrimaryButton } from '../components/ui'
import { chapterBars, nextRecommendedTest, weakChapters } from '../lib/progress'

export const Route = createFileRoute('/')({ component: Home })

function Home() {
  const { state } = useProgress()
  const router = useRouter()
  const practiceById = livePracticeById()
  const last = state.lastChapterId ? getChapter(state.lastChapterId) : undefined
  const lastLive = last?.live ? getLiveChapter(last.id) : undefined
  const lastBars = last && lastLive ? chapterBars(state, last.id, lastLive.practice) : null
  const weak = weakChapters(state, practiceById)
  const nextTest = nextRecommendedTest(state)
  const continueHref = last
    ? state.lastPath && state.lastPath.startsWith(`/chapters/${last.slug}`)
      ? state.lastPath
      : last.live
        ? `/chapters/${last.slug}/theory`
        : '/library'
    : '/library'

  return (
    <div className="space-y-6">
      <header className="space-y-2">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-teal-800">
          Practice Book
        </p>
        <h1 className="font-serif text-4xl leading-tight text-slate-900">GCSE Maths</h1>
        <p className="max-w-2xl text-slate-700">
          England GCSE Maths 9–1 shared content (AQA, Edexcel and OCR). Short chapter, then theory,
          worked examples, practice and a timed test. Progress stays on this device.
        </p>
        <div className="flex flex-wrap gap-2 pt-1">
          <Pill tone={state.tier === 'H' ? 'h' : 'f'}>
            {state.tier === 'H' ? 'Higher tier' : 'Foundation tier'}
          </Pill>
          <Pill>Wave 1 · 4 live chapters</Pill>
        </div>
      </header>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Continue</p>
          {last ? (
            <>
              <h2 className="mt-1 font-serif text-2xl">
                Chapter {last.id}: {last.title}
              </h2>
              <p className="mt-1 text-sm text-slate-600">{last.blurb}</p>
              {lastBars ? (
                <div className="mt-4 space-y-2">
                  <Bar label="Theory" value={lastBars.theory} />
                  <Bar label="Practice" value={lastBars.practice} />
                  <Bar label="Test" value={lastBars.test} />
                </div>
              ) : (
                <p className="mt-3 text-sm text-slate-600">This chapter is listed but not live yet.</p>
              )}
              <div className="mt-4">
                <PrimaryButton onClick={() => router.history.push(continueHref)}>
                  Continue last chapter
                </PrimaryButton>
              </div>
            </>
          ) : (
            <>
              <h2 className="mt-1 font-serif text-2xl">Start with Fractions</h2>
              <p className="mt-1 text-sm text-slate-600">
                Wave 1 opens with Chapter 4. Work theory, then practice, then the chapter test.
              </p>
              <Link to="/chapters/$slug/theory" params={{ slug: '04-fractions' }} className="mt-4 inline-flex">
                <PrimaryButton>Open Chapter 4</PrimaryButton>
              </Link>
            </>
          )}
        </Card>

        <Card>
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            Next recommended test
          </p>
          {nextTest && 'mock' in nextTest ? (
            <>
              <h2 className="mt-1 font-serif text-2xl">Group mock A</h2>
              <p className="mt-1 text-sm text-slate-600">{nextTest.reason}</p>
              <Link to="/mocks/group-a" className="mt-4 inline-flex">
                <PrimaryButton>Sit Group mock A</PrimaryButton>
              </Link>
            </>
          ) : nextTest ? (
            <>
              <h2 className="mt-1 font-serif text-2xl">{nextTest.title}</h2>
              <p className="mt-1 text-sm text-slate-600">{nextTest.reason}</p>
              <Link
                to="/chapters/$slug/test"
                params={{ slug: getChapter(nextTest.id)!.slug }}
                className="mt-4 inline-flex"
              >
                <PrimaryButton>Open chapter test</PrimaryButton>
              </Link>
            </>
          ) : (
            <p className="mt-2 text-sm text-slate-600">Open the library to begin a live chapter.</p>
          )}
        </Card>
      </div>

      <Card>
        <h2 className="font-serif text-2xl">Weak topics</h2>
        {weak.length === 0 ? (
          <p className="mt-2 text-sm text-slate-600">
            Complete some practice or a test and this list will show chapters scoring under 70%.
          </p>
        ) : (
          <ul className="mt-3 space-y-2">
            {weak.map((item) => {
              const chapter = getChapter(item.id)!
              return (
                <li key={item.id} className="flex items-center justify-between gap-3 rounded-xl bg-stone-50 px-3 py-3">
                  <div>
                    <p className="font-medium">
                      Ch {chapter.id} · {chapter.title}
                    </p>
                    <p className="text-sm text-slate-600">Combined score {item.score}%</p>
                  </div>
                  <Link
                    to="/chapters/$slug/theory"
                    params={{ slug: chapter.slug }}
                    className="min-h-11 text-sm font-semibold text-teal-800"
                  >
                    Review
                  </Link>
                </li>
              )
            })}
          </ul>
        )}
      </Card>

      <Card>
        <h2 className="font-serif text-2xl">Six books</h2>
        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          {BOOKS.map((book) => {
            const chapters = CHAPTERS.filter((chapter) => chapter.bookId === book.id)
            const live = chapters.filter((chapter) => chapter.live).length
            return (
              <Link
                key={book.id}
                to="/library"
                hash={`book-${book.id}`}
                className="rounded-xl border border-stone-200 px-4 py-3 hover:bg-stone-50"
              >
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  {book.strand}
                </p>
                <p className="font-serif text-xl">{book.title}</p>
                <p className="text-sm text-slate-600">
                  {book.chapterRange}
                  {live ? ` · ${live} live` : ' · coming later'}
                </p>
              </Link>
            )
          })}
        </div>
      </Card>
    </div>
  )
}
