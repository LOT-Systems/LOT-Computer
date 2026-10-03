import * as React from 'react'
import type { BasicRecord } from '#shared/basics/engine'

type Result = { ok: boolean; error?: string; errors?: string[]; basic?: BasicRecord }

const call = async (path: string, body?: unknown): Promise<Result> => {
  try {
    const res = await fetch(`/api/basics${path}`, {
      method: body === undefined && path === '' ? 'GET' : 'POST',
      credentials: 'same-origin',
      headers: { 'Content-Type': 'application/json' },
      body: body === undefined ? undefined : JSON.stringify(body),
    })
    const data = await res.json().catch(() => ({}))
    if (path === '' && res.ok) return { ok: true, basic: data.basic }
    return { ...data, ok: res.ok && data.ok !== false }
  } catch {
    return { ok: false, error: 'LINK DOWN' }
  }
}

export const useBasic = (enabled: boolean) => {
  const [basic, setBasic] = React.useState<BasicRecord | null>(null)
  const [busy, setBusy] = React.useState(false)
  const [errors, setErrors] = React.useState<string[]>([])

  React.useEffect(() => {
    if (!enabled) return
    call('').then((r) => r.basic && setBasic(r.basic))
  }, [enabled])

  const act = React.useCallback(async (path: string, body?: unknown) => {
    setBusy(true)
    setErrors([])
    const r = await call(path, body ?? {})
    if (r.basic) setBasic(r.basic)
    if (!r.ok) setErrors(r.errors ?? [r.error ?? 'REJECTED'])
    setBusy(false)
    return r.ok
  }, [])

  return { basic, busy, errors, act }
}
