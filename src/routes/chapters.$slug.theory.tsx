import { createFileRoute } from '@tanstack/react-router'
import { useEffect } from 'react'
import { getChapter } from '../content/catalog'
import { getLiveChapter } from '../content'
import { MathText } from '../components/MathText'
import { useProgress } from '../components/ProgressProvider'
import { Card, PrimaryButton } from '../components/ui'
import { upsertChapter } from '../lib/progress'

export const Route = createFileRoute('/chapters/$slug/theory')({
  component: TheoryPage,
})

function TheoryPage() {
  const { slug } = Route.useParams()
  const chapter = getChapter(slug)
  const live = chapter ? getLiveChapter(chapter.id) : undefined
  const { state, update } = useProgress()

  useEffect(() => {
    if (!chapter) return
    const lastPath = `/chapters/${chapter.slug}/theory`
    update((current) => {
      if (current.lastChapterId === chapter.id && current.lastPath === lastPath) return current
      return { ...upsertChapter(current, chapter.id, {}), lastPath }
    })
  }, [chapter, update])

  if (!chapter || !live) return null

  const done = state.chapters[String(chapter.id)]?.theoryComplete

  return (
    <div className="space-y-4">
      <Card>
        <h2 className="font-serif text-xl">Goal</h2>
        <p className="mt-2 leading-relaxed text-slate-800">
          <MathText text={live.theory.goal} />
        </p>
      </Card>

      <Card>
        <h2 className="font-serif text-xl">You need first</h2>
        <ul className="mt-2 list-disc space-y-1 pl-5 text-slate-800">
          {live.theory.youNeedFirst.map((item) => (
            <li key={item}>
              <MathText text={item} />
            </li>
          ))}
        </ul>
      </Card>

      <Card>
        <h2 className="font-serif text-xl">Key facts</h2>
        <ol className="mt-3 space-y-3">
          {live.theory.keyFacts.map((fact) => (
            <li key={fact.title} className="rounded-xl bg-stone-50 px-4 py-3">
              <p className="font-semibold">{fact.title}</p>
              <p className="mt-1 text-slate-800">
                <MathText text={fact.body} />
              </p>
            </li>
          ))}
        </ol>
      </Card>

      <div className="space-y-4">
        <h2 className="font-serif text-xl">Worked examples</h2>
        {live.theory.examples.map((example, index) => (
          <Card key={example.title}>
            <p className="text-xs font-semibold uppercase tracking-wide text-teal-800">
              Example {index + 1}
            </p>
            <h3 className="font-serif text-2xl">{example.title}</h3>
            <p className="mt-2 text-lg">
              <MathText text={example.problem} />
            </p>
            <ol className="mt-3 list-decimal space-y-1 pl-5 text-slate-800">
              {example.steps.map((step) => (
                <li key={step}>
                  <MathText text={step} />
                </li>
              ))}
            </ol>
            <div className="mt-3 rounded-xl bg-amber-50 px-4 py-3 text-sm text-amber-950">
              <p className="font-semibold">Common mistake</p>
              <MathText text={example.commonMistake} />
            </div>
          </Card>
        ))}
      </div>

      <Card>
        <h2 className="font-serif text-xl">Watch-outs</h2>
        <ul className="mt-2 list-disc space-y-1 pl-5 text-slate-800">
          {live.theory.watchOuts.map((item) => (
            <li key={item}>
              <MathText text={item} />
            </li>
          ))}
        </ul>
      </Card>

      <PrimaryButton
        className="w-full sm:w-auto"
        onClick={() =>
          update((current) =>
            upsertChapter(current, chapter.id, { theoryComplete: true }),
          )
        }
      >
        {done ? 'Theory marked complete' : 'Mark theory complete'}
      </PrimaryButton>
    </div>
  )
}
