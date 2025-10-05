import { twMerge } from 'tailwind-merge'

export const cn = (
  ...chunks: Array<string | boolean | null | undefined>
): string => {
  return twMerge(...chunks.map((x) => (typeof x === 'string' ? x : '')))
}

export const generateId = (length: number = 16, prefix?: string): string => {
  const arr = new Uint8Array(length / 2)
  window.crypto.getRandomValues(arr)
  return (
    (prefix || '') +
    Array.from(arr, (x) => x.toString(16).padStart(2, '0')).join('')
  )
}

export function formatNumberWithCommas(x: number | string) {
  return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',')
}
