import { useEffect, useRef, useState } from 'react'

function format(seconds: number): string {
  const safe = Math.max(0, seconds)
  const m = Math.floor(safe / 60)
  const s = safe % 60
  return `${m}:${String(s).padStart(2, '0')}`
}

export function Timer({
  endsAt,
  paused = false,
  remainingMs,
  onExpire,
}: {
  endsAt: number
  paused?: boolean
  remainingMs?: number
  onExpire: () => void
}) {
  const initial = paused && remainingMs !== undefined
    ? Math.ceil(remainingMs / 1000)
    : Math.ceil((endsAt - Date.now()) / 1000)
  const [left, setLeft] = useState(initial)
  const expired = useRef(false)

  useEffect(() => {
    expired.current = false
    if (paused) {
      const frozen =
        remainingMs !== undefined ? Math.ceil(remainingMs / 1000) : Math.ceil((endsAt - Date.now()) / 1000)
      setLeft(frozen)
      return
    }
    const tick = () => {
      const next = Math.ceil((endsAt - Date.now()) / 1000)
      setLeft(next)
      if (next <= 0 && !expired.current) {
        expired.current = true
        onExpire()
      }
    }
    tick()
    const id = window.setInterval(tick, 250)
    return () => window.clearInterval(id)
  }, [endsAt, onExpire, paused, remainingMs])

  const urgent = left <= 60
  return (
    <p
      className={`min-w-[4.5rem] rounded-xl px-3 py-2 text-center text-sm font-semibold tabular-nums ${
        urgent ? 'bg-rose-100 text-rose-800' : 'bg-white text-slate-800'
      }`}
      aria-live="polite"
    >
      {paused ? `Paused ${format(left)}` : format(left)}
    </p>
  )
}
