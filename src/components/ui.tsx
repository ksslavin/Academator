import type { ReactNode } from 'react'

export function cn(...parts: Array<string | false | null | undefined>): string {
  return parts.filter(Boolean).join(' ')
}

export function Bar({
  value,
  label,
  tone = 'accent',
}: {
  value: number
  label?: string
  tone?: 'accent' | 'ink' | 'amber'
}) {
  const width = Math.max(0, Math.min(100, value))
  const fill =
    tone === 'amber' ? 'bg-amber-600' : tone === 'ink' ? 'bg-slate-700' : 'bg-teal-700'
  return (
    <div className="space-y-1">
      {label ? (
        <div className="flex justify-between gap-3 text-xs text-slate-600">
          <span>{label}</span>
          <span>{width}%</span>
        </div>
      ) : null}
      <div className="h-2.5 overflow-hidden rounded-full bg-stone-200">
        <div className={cn('h-full rounded-full transition-all', fill)} style={{ width: `${width}%` }} />
      </div>
    </div>
  )
}

export function Card({
  children,
  className,
}: {
  children: ReactNode
  className?: string
}) {
  return (
    <section className={cn('rounded-2xl border border-stone-200 bg-white p-5 shadow-sm', className)}>
      {children}
    </section>
  )
}

export function Pill({
  children,
  tone = 'muted',
}: {
  children: ReactNode
  tone?: 'muted' | 'live' | 'lock' | 'f' | 'h' | 'calc' | 'noncalc'
}) {
  const styles = {
    muted: 'bg-stone-100 text-slate-600',
    live: 'bg-teal-50 text-teal-800',
    lock: 'bg-stone-100 text-stone-500',
    f: 'bg-sky-50 text-sky-800',
    h: 'bg-violet-50 text-violet-800',
    calc: 'bg-indigo-50 text-indigo-800',
    noncalc: 'bg-amber-50 text-amber-900',
  }[tone]
  return (
    <span className={cn('inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold', styles)}>
      {children}
    </span>
  )
}

export function PrimaryButton({
  children,
  className,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      type="button"
      className={cn(
        'inline-flex min-h-12 items-center justify-center rounded-xl bg-teal-800 px-5 text-base font-semibold text-white',
        'hover:bg-teal-700 disabled:cursor-not-allowed disabled:bg-stone-300',
        className,
      )}
      {...props}
    >
      {children}
    </button>
  )
}

export function SecondaryButton({
  children,
  className,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      type="button"
      className={cn(
        'inline-flex min-h-12 items-center justify-center rounded-xl border border-stone-300 bg-white px-5 text-base font-semibold text-slate-800',
        'hover:bg-stone-50 disabled:cursor-not-allowed disabled:text-stone-400',
        className,
      )}
      {...props}
    >
      {children}
    </button>
  )
}
