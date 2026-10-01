import { useEffect, useState } from 'react'

/**
 * Validates/repairs a stored value. Return `undefined` to discard it.
 * By default the stored value must have the same basic shape as the fallback
 * (array ↔ array, object ↔ object), so data saved by an older version of the
 * site can never crash a page.
 */
export type Sanitize<T> = (raw: unknown) => T | undefined

function sameShape<T>(fallback: T): Sanitize<T> {
  return (raw) => {
    if (Array.isArray(fallback)) return Array.isArray(raw) ? (raw.filter((x) => x !== null && x !== undefined) as T) : undefined
    if (fallback === null) return raw === null || (typeof raw === 'object' && !Array.isArray(raw)) ? (raw as T) : undefined
    if (typeof fallback === 'object') return raw && typeof raw === 'object' && !Array.isArray(raw) ? (raw as T) : undefined
    return typeof raw === typeof fallback ? (raw as T) : undefined
  }
}

export function readStorage<T>(key: string, fallback: T, sanitize: Sanitize<T> = sameShape(fallback)): T {
  try {
    const raw = localStorage.getItem(key)
    if (!raw) return fallback
    return sanitize(JSON.parse(raw)) ?? fallback
  } catch {
    return fallback
  }
}

export function writeStorage<T>(key: string, value: T) {
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch {
    /* storage unavailable (private mode / quota) — keep in-memory state */
  }
}

/** Removes everything this site has saved in the browser. */
export function clearSiteStorage() {
  try {
    Object.keys(localStorage)
      .filter((k) => k.startsWith('rfaheya.'))
      .forEach((k) => localStorage.removeItem(k))
  } catch {
    /* ignore */
  }
}

/** useState that persists to localStorage. */
export function usePersistentState<T>(key: string, fallback: T, sanitize?: Sanitize<T>) {
  const [value, setValue] = useState<T>(() => readStorage(key, fallback, sanitize))
  useEffect(() => {
    writeStorage(key, value)
  }, [key, value])
  return [value, setValue] as const
}
