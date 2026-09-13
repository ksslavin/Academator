import { Link } from '@tanstack/react-router'
import { getChapter } from '../content/catalog'
import { practiceHref } from '../lib/study'
import type { WeakQueueItem } from '../lib/types'
import { Card } from './ui'

export function WeakQueueCard({ items }: { items: WeakQueueItem[] }) {
  return (
    <Card>
      <h2 className="font-serif text-2xl">Revise these next</h2>
      <p className="mt-1 text-sm text-slate-600">
        Built from wrong practice, test and mock answers. Items drop off when you get them right.
      </p>
      {items.length === 0 ? (
        <p className="mt-3 text-sm text-slate-600">
          No weak-topic queue yet. Missed questions will collect here.
        </p>
      ) : (
        <ul className="mt-3 space-y-2">
          {items.map((item) => {
            const chapter = item.chapterId ? getChapter(item.chapterId) : undefined
            const href = practiceHref(item)
            const sourceLabel =
              item.source === 'practice' ? 'Practice' : item.source === 'test' ? 'Chapter test' : 'Group mock A'
            return (
              <li
                key={item.key}
                className="flex flex-wrap items-center justify-between gap-3 rounded-xl bg-stone-50 px-3 py-3"
              >
                <div>
                  <p className="font-medium">
                    {chapter ? `Ch ${chapter.id} · ${chapter.title}` : 'Group mock A'}
                  </p>
                  <p className="text-sm text-slate-600">
                    {item.skill} · {sourceLabel}
                  </p>
                </div>
                {href && 'mockReview' in href ? (
                  <Link
                    to="/mocks/group-a/review"
                    className="min-h-11 text-sm font-semibold text-teal-800"
                  >
                    Review
                  </Link>
                ) : href && href.slug ? (
                  <Link
                    to="/chapters/$slug/practice"
                    params={{ slug: href.slug }}
                    search={href.q ? { q: href.q } : undefined}
                    className="min-h-11 text-sm font-semibold text-teal-800"
                  >
                    Practise
                  </Link>
                ) : null}
              </li>
            )
          })}
        </ul>
      )}
    </Card>
  )
}
