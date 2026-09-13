import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import {
  emptyProgress,
  readProgress,
  writeProgress,
} from '../lib/progress'
import type { ProgressState, Tier } from '../lib/types'

type ProgressContextValue = {
  state: ProgressState
  ready: boolean
  setTier: (tier: Tier) => void
  update: (updater: (state: ProgressState) => ProgressState) => void
}

const ProgressContext = createContext<ProgressContextValue | null>(null)

export function ProgressProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<ProgressState>(emptyProgress)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    setState(readProgress())
    setReady(true)
  }, [])

  useEffect(() => {
    if (!ready) return
    writeProgress(state)
  }, [ready, state])

  const setTier = useCallback((tier: Tier) => {
    setState((current) => ({ ...current, tier }))
  }, [])

  const update = useCallback((updater: (current: ProgressState) => ProgressState) => {
    setState((current) => updater(current))
  }, [])

  const value = useMemo<ProgressContextValue>(
    () => ({
      state,
      ready,
      setTier,
      update,
    }),
    [ready, setTier, state, update],
  )

  return <ProgressContext.Provider value={value}>{children}</ProgressContext.Provider>
}

export function useProgress(): ProgressContextValue {
  const value = useContext(ProgressContext)
  if (!value) {
    throw new Error('useProgress must be used within ProgressProvider')
  }
  return value
}
