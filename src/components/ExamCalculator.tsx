import { useState } from 'react'
import { cn } from './ui'

type Op = '+' | '-' | '×' | '÷'

function apply(left: number, right: number, op: Op): number {
  if (op === '+') return left + right
  if (op === '-') return left - right
  if (op === '×') return left * right
  return right === 0 ? Number.NaN : left / right
}

function shown(value: number): string {
  if (!Number.isFinite(value)) return 'Error'
  const rounded = Math.round(value * 1e10) / 1e10
  return String(rounded)
}

export function ExamCalculator() {
  const [display, setDisplay] = useState('0')
  const [acc, setAcc] = useState<number | null>(null)
  const [op, setOp] = useState<Op | null>(null)
  const [fresh, setFresh] = useState(true)
  const [open, setOpen] = useState(true)

  const inputDigit = (digit: string) => {
    setDisplay((current) => {
      if (fresh || current === '0' || current === 'Error') return digit
      if (digit === '.' && current.includes('.')) return current
      return current + digit
    })
    setFresh(false)
  }

  const chooseOp = (next: Op) => {
    const value = Number(display)
    if (acc !== null && op && !fresh) {
      const result = apply(acc, value, op)
      setAcc(result)
      setDisplay(shown(result))
    } else {
      setAcc(Number.isFinite(value) ? value : 0)
    }
    setOp(next)
    setFresh(true)
  }

  const equals = () => {
    if (acc === null || !op) return
    const result = apply(acc, Number(display), op)
    setDisplay(shown(result))
    setAcc(null)
    setOp(null)
    setFresh(true)
  }

  const clear = () => {
    setDisplay('0')
    setAcc(null)
    setOp(null)
    setFresh(true)
  }

  const sqrt = () => {
    const value = Number(display)
    setDisplay(value < 0 ? 'Error' : shown(Math.sqrt(value)))
    setFresh(true)
  }

  const negate = () => {
    if (display === '0' || display === 'Error') return
    setDisplay(display.startsWith('-') ? display.slice(1) : `-${display}`)
  }

  const keys: Array<{ label: string; action: () => void; wide?: boolean; tone?: 'op' | 'eq' }> = [
    { label: 'C', action: clear, tone: 'op' },
    { label: '±', action: negate, tone: 'op' },
    { label: '√', action: sqrt, tone: 'op' },
    { label: '÷', action: () => chooseOp('÷'), tone: 'op' },
    { label: '7', action: () => inputDigit('7') },
    { label: '8', action: () => inputDigit('8') },
    { label: '9', action: () => inputDigit('9') },
    { label: '×', action: () => chooseOp('×'), tone: 'op' },
    { label: '4', action: () => inputDigit('4') },
    { label: '5', action: () => inputDigit('5') },
    { label: '6', action: () => inputDigit('6') },
    { label: '−', action: () => chooseOp('-'), tone: 'op' },
    { label: '1', action: () => inputDigit('1') },
    { label: '2', action: () => inputDigit('2') },
    { label: '3', action: () => inputDigit('3') },
    { label: '+', action: () => chooseOp('+'), tone: 'op' },
    { label: '0', action: () => inputDigit('0'), wide: true },
    { label: '.', action: () => inputDigit('.') },
    { label: '=', action: equals, tone: 'eq' },
  ]

  return (
    <aside className="rounded-2xl border border-stone-200 bg-white p-3 shadow-sm">
      <div className="mb-2 flex items-center justify-between gap-2">
        <p className="text-xs font-semibold uppercase tracking-wide text-teal-800">Calculator</p>
        <button
          type="button"
          className="text-xs font-semibold text-slate-600"
          onClick={() => setOpen((value) => !value)}
        >
          {open ? 'Hide' : 'Show'}
        </button>
      </div>
      {open ? (
        <>
          <p className="mb-2 rounded-lg bg-stone-50 px-3 py-2 text-right font-mono text-lg tabular-nums">
            {op && acc !== null ? <span className="mr-2 text-xs text-slate-500">{shown(acc)} {op}</span> : null}
            {display}
          </p>
          <div className="grid grid-cols-4 gap-1.5">
            {keys.map((key) => (
              <button
                key={key.label}
                type="button"
                onClick={key.action}
                className={cn(
                  'min-h-11 rounded-lg text-sm font-semibold',
                  key.wide && 'col-span-2',
                  key.tone === 'eq'
                    ? 'bg-teal-800 text-white'
                    : key.tone === 'op'
                      ? 'bg-stone-100 text-slate-800'
                      : 'bg-white text-slate-900 border border-stone-200',
                )}
              >
                {key.label}
              </button>
            ))}
          </div>
        </>
      ) : null}
    </aside>
  )
}
