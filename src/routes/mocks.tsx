import { Link, createFileRoute } from '@tanstack/react-router'
import { COMING_MOCKS, getMock } from '../content'
import { useProgress } from '../components/ProgressProvider'
import { Card, Pill, PrimaryButton } from '../components/ui'
import { paperTotal } from '../lib/grades'

export const Route = createFileRoute('/mocks')({ component: MocksPage })

function MocksPage() {
  const { state } = useProgress()
  const groupA = getMock('group-a')!
  const latest = state.mocks.find((item) => item.mockId === 'group-a')

  return (
    <div className="space-y-6">
      <header>
        <h1 className="font-serif text-4xl">Mocks</h1>
        <p className="mt-2 text-slate-700">
          Phase A includes Group mock A (Number, chapters 1–8). Year, November, March and full GCSE
          papers are stubs for later waves.
        </p>
      </header>

      <Card>
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <Pill tone="live">Live</Pill>
            <h2 className="mt-2 font-serif text-2xl">{groupA.title}</h2>
            <p className="text-sm text-slate-600">{groupA.subtitle}</p>
            <p className="mt-2 text-slate-700">{groupA.focus}</p>
            <p className="mt-2 text-sm text-slate-600">
              About {groupA.durationMinutes} minutes · {paperTotal(groupA.questions, state.tier)} marks
              on {state.tier === 'H' ? 'Higher' : 'Foundation'}
            </p>
            {latest ? (
              <p className="mt-2 text-sm">
                Last attempt {latest.percent}% · band {latest.band} ·{' '}
                <Link to="/mocks/group-a/review" className="font-semibold text-teal-800">
                  review wrong answers
                </Link>
              </p>
            ) : null}
          </div>
          <Link to="/mocks/group-a">
            <PrimaryButton>Sit Group mock A</PrimaryButton>
          </Link>
        </div>
      </Card>

      <div className="grid gap-3 md:grid-cols-2">
        {COMING_MOCKS.map((mock) => (
          <Card key={mock.id} className="border-dashed bg-stone-50">
            <Pill tone="lock">Coming later</Pill>
            <h2 className="mt-2 font-serif text-xl">{mock.title}</h2>
            <p className="text-sm text-slate-600">{mock.note}</p>
          </Card>
        ))}
      </div>
    </div>
  )
}
