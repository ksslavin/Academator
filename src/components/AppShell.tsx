import { Link, useRouterState } from '@tanstack/react-router'
import { useState } from 'react'
import { FormulaSheet } from './FormulaSheet'
import { useProgress } from './ProgressProvider'
import { cn } from './ui'

const NAV = [
  { to: '/', label: 'Home' },
  { to: '/library', label: 'Library' },
  { to: '/mocks', label: 'Mocks' },
  { to: '/progress', label: 'Progress' },
  { to: '/formulas', label: 'Formulas' },
] as const

export function AppShell({ children }: { children: React.ReactNode }) {
  const { state, setTier, ready } = useProgress()
  const pathname = useRouterState({ select: (s) => s.location.pathname })
  const [sheetOpen, setSheetOpen] = useState(false)

  return (
    <div className="min-h-dvh bg-[var(--paper)] text-slate-900">
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:left-3 focus:top-3 focus:z-50 focus:rounded-lg focus:bg-white focus:px-3 focus:py-2"
      >
        Skip to content
      </a>
      <header className="sticky top-0 z-30 border-b border-stone-200/80 bg-[rgba(246,241,232,0.92)] backdrop-blur">
        <div className="mx-auto flex max-w-5xl items-center gap-3 px-4 py-3">
          <Link to="/" className="min-w-0 flex-1">
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-teal-800">
              Practice Book
            </p>
            <p className="truncate font-serif text-lg leading-tight text-slate-900">GCSE Maths</p>
          </Link>
          <nav className="hidden items-center gap-1 md:flex" aria-label="Primary">
            {NAV.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                className={cn(
                  'min-h-11 rounded-xl px-3 text-sm font-semibold',
                  pathname === item.to ? 'bg-teal-800 text-white' : 'text-slate-700 hover:bg-white',
                )}
              >
                {item.label}
              </Link>
            ))}
          </nav>
          <div className="flex items-center gap-2">
            <div className="flex rounded-xl border border-stone-300 bg-white p-1" role="group" aria-label="Tier">
              {(['F', 'H'] as const).map((tier) => (
                <button
                  key={tier}
                  type="button"
                  onClick={() => setTier(tier)}
                  className={cn(
                    'min-h-10 min-w-12 rounded-lg px-3 text-sm font-semibold',
                    state.tier === tier ? 'bg-slate-900 text-white' : 'text-slate-600',
                  )}
                >
                  <span className="sm:hidden">{tier}</span>
                  <span className="hidden sm:inline">{tier === 'F' ? 'Foundation' : 'Higher'}</span>
                </button>
              ))}
            </div>
            <button
              type="button"
              onClick={() => setSheetOpen(true)}
              className="hidden min-h-11 rounded-xl border border-stone-300 bg-white px-3 text-sm font-semibold text-slate-700 sm:inline-flex"
            >
              Sheet
            </button>
          </div>
        </div>
      </header>

      <main id="main" className="mx-auto max-w-5xl px-4 pb-28 pt-6 md:pb-12">
        {ready ? children : <p className="text-slate-600">Loading your local progress…</p>}
      </main>

      <nav
        className="fixed inset-x-0 bottom-0 z-30 border-t border-stone-200 bg-[rgba(246,241,232,0.96)] px-2 py-2 md:hidden"
        aria-label="Mobile"
      >
        <div className="mx-auto grid max-w-lg grid-cols-5 gap-1">
          {NAV.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              className={cn(
                'flex min-h-12 items-center justify-center rounded-xl text-xs font-semibold',
                pathname === item.to ? 'bg-teal-800 text-white' : 'text-slate-700',
              )}
            >
              {item.label}
            </Link>
          ))}
        </div>
      </nav>

      {sheetOpen ? (
        <div className="fixed inset-0 z-40 flex items-end justify-center bg-slate-900/40 p-3 sm:items-center">
          <div className="max-h-[90dvh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-[var(--paper)] p-5 shadow-xl">
            <FormulaSheet onClose={() => setSheetOpen(false)} />
          </div>
        </div>
      ) : null}
    </div>
  )
}
