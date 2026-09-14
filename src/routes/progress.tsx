import { Link, createFileRoute } from '@tanstack/react-router'
import { CHAPTERS } from '../content/catalog'
import { getLiveChapter } from '../content'
import { useProgress } from '../components/ProgressProvider'
import { Bar, Card, Pill, SecondaryButton } from '../components/ui'
import { STORAGE_KEY, chapterBars, emptyProgress, overallChapterScore } from '../lib/progress'

export const Route = createFileRoute('/progress')({ component: ProgressPage })

function ProgressPage() {
  const { state, update } = useProgress()

  return (
    <div className="space-y-6">
      <header>
        <h1 className="font-serif text-4xl">Progress</h1>
        <p className="mt-2 text-slate-700">
          Stored in this browser only ({STORAGE_KEY}). No account is required.
        </p>
      </header>

      <Card>
        <h2 className="font-serif text-2xl">Chapter heatmap</h2>
        <div className="mt-4 grid grid-cols-5 gap-2 sm:grid-cols-10">
          {CHAPTERS.map((chapter) => {
            const live = getLiveChapter(chapter.id)
            const bars = live ? chapterBars(state, chapter.id, live.practice) : null
            const score = bars ? overallChapterScore(bars) : 0
            const tone = !chapter.live
              ? 'bg-stone-200 text-stone-500'
              : score >= 80
                ? 'bg-teal-700 text-white'
                : score >= 50
                  ? 'bg-teal-300 text-teal-950'
                  : score > 0
                    ? 'bg-amber-200 text-amber-950'
                    : 'bg-white text-slate-700'
            const inner = (
              <div className={`flex min-h-14 flex-col items-center justify-center rounded-xl border border-stone-200 ${tone}`}>
                <span className="text-sm font-semibold">{chapter.id}</span>
                <span className="text-[10px]">{chapter.live ? `${score}%` : '—'}</span>
              </div>
            )
            return chapter.live ? (
              <Link key={chapter.id} to="/chapters/$slug/theory" params={{ slug: chapter.slug }} title={chapter.title}>
                {inner}
              </Link>
            ) : (
              <div key={chapter.id} title={`${chapter.title} (coming soon)`}>
                {inner}
              </div>
            )
          })}
        </div>
        <p className="mt-3 text-xs text-slate-500">
          Live chapters show a blended score from theory, practice and best test. Locked chapters stay grey.
        </p>
      </Card>

      <Card>
        <h2 className="font-serif text-2xl">Live chapter bars</h2>
        <div className="mt-3 space-y-4">
          {CHAPTERS.filter((chapter) => chapter.live).map((chapter) => {
            const live = getLiveChapter(chapter.id)!
            const bars = chapterBars(state, chapter.id, live.practice)
            return (
              <div key={chapter.id}>
                <div className="mb-1 flex justify-between gap-2">
                  <p className="font-medium">
                    Ch {chapter.id} · {chapter.title}
                  </p>
                  <Link
                    to="/chapters/$slug/theory"
                    params={{ slug: chapter.slug }}
                    className="text-sm font-semibold text-teal-800"
                  >
                    Open
                  </Link>
                </div>
                <div className="grid gap-2 sm:grid-cols-3">
                  <Bar label="Theory" value={bars.theory} />
                  <Bar label="Practice" value={bars.practice} />
                  <Bar label="Test" value={bars.test} />
                </div>
              </div>
            )
          })}
        </div>
      </Card>

      <Card>
        <h2 className="font-serif text-2xl">Mock history</h2>
        {state.examSits.length === 0 && state.mocks.length === 0 ? (
          <p className="mt-2 text-sm text-slate-600">
            No mocks yet. Open the mocks hub to sit Year 10, November, March, Full GCSE or Group mock A.
          </p>
        ) : (
          <ul className="mt-3 space-y-2">
            {(state.examSits.length > 0 ? state.examSits : state.mocks).map((item, index) => {
              const sit = 'papers' in item ? item : null
              const title = sit?.title ?? (item.mockId === 'group-a' ? 'Group mock A' : item.mockId)
              return (
                <li key={`${item.at}-${index}`} className="rounded-xl bg-stone-50 px-3 py-3">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div>
                      <p className="font-medium">{title}</p>
                      <p className="text-sm text-slate-600">
                        {new Date(item.at).toLocaleString('en-GB')} · {item.marks}/{item.total} · {item.percent}%
                      </p>
                      {sit ? (
                        <p className="mt-1 text-xs text-slate-500">
                          {sit.papers
                            .map((paper) => `${paper.title} ${paper.result.percent}%`)
                            .join(' · ')}
                        </p>
                      ) : null}
                    </div>
                    <div className="flex items-center gap-2">
                      <Pill>{item.band}</Pill>
                      {sit ? (
                        <Link
                          to="/mocks/$mockId/review"
                          params={{ mockId: item.mockId }}
                          className="text-sm font-semibold text-teal-800"
                        >
                          Review
                        </Link>
                      ) : null}
                    </div>
                  </div>
                </li>
              )
            })}
          </ul>
        )}
        <Link to="/mocks" className="mt-3 inline-flex min-h-11 text-sm font-semibold text-teal-800">
          Go to mocks
        </Link>
      </Card>

      <SecondaryButton
        onClick={() => {
          if (window.confirm('Clear all local progress on this device?')) {
            update(() => emptyProgress())
          }
        }}
      >
        Reset local progress
      </SecondaryButton>
    </div>
  )
}
