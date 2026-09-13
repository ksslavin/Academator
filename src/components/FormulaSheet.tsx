import { FORMULA_GROUPS } from '../content/formulas'
import { MathText } from './MathText'
import { Pill } from './ui'
import { useProgress } from './ProgressProvider'

export function FormulaSheet({ onClose }: { onClose?: () => void }) {
  const { state } = useProgress()
  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-teal-800">Always available</p>
          <h2 className="font-serif text-2xl text-slate-900">Formula sheet</h2>
          <p className="mt-1 text-sm text-slate-600">
            Phase A sheet for England GCSE Maths 9–1 shared content. Higher-only items are marked.
          </p>
        </div>
        {onClose ? (
          <button
            type="button"
            onClick={onClose}
            className="min-h-11 rounded-xl px-3 text-sm font-semibold text-slate-600 hover:bg-stone-100"
          >
            Close
          </button>
        ) : null}
      </div>
      <div className="space-y-5">
        {FORMULA_GROUPS.map((group) => (
          <section key={group.title}>
            <h3 className="mb-2 text-sm font-semibold uppercase tracking-wide text-slate-500">
              {group.title}
            </h3>
            <ul className="divide-y divide-stone-100 overflow-hidden rounded-xl border border-stone-200 bg-white">
              {group.items
                .filter((item) => state.tier === 'H' || !item.higher)
                .map((item) => (
                  <li key={item.name} className="flex flex-col gap-1 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-slate-800">{item.name}</span>
                      {item.higher ? <Pill tone="h">H</Pill> : null}
                    </div>
                    <MathText className="text-sm text-slate-700" text={item.body} />
                  </li>
                ))}
            </ul>
          </section>
        ))}
      </div>
    </div>
  )
}
