export const identity = <T>(x: T): T => x

export const prop =
  <O, F extends keyof O>(field: F) =>
  (obj: O): O[F] =>
    obj[field]

export const propEq =
  <O, F extends keyof O>(field: F, ref: O[F]) =>
  (obj: O): boolean =>
    obj[field] === ref

export const propNotEq =
  <O>(field: keyof O, ref: any) =>
  (obj: O): boolean =>
    obj[field] !== ref

export const propIn =
  <O>(field: keyof O, refArray: any[]) =>
  (obj: O): boolean =>
    refArray.includes(obj[field])

export const propNotIn =
  <O>(field: keyof O, refArray: any[]) =>
  (obj: O): boolean =>
    !refArray.includes(obj[field])

export const groupBy =
  <O, F extends keyof O>(field: F) =>
  (acc: Record<string, O[]>, item: O, _index: number, _array: O[]) => {
    const key = String(item[field])
    return {
      ...acc,
      [key]: acc[key] ? [...acc[key], item] : [item],
    }
  }

export const by =
  <O, F extends keyof O>(field: F) =>
  (acc: Record<string, O>, item: O, _index: number, _array: O[]) => {
    const key = String(item[field])
    return {
      ...acc,
      [key]: item,
    }
  }

export const uniq = <T>(acc: T[], item: T, _index: number, _array: T[]) =>
  acc.includes(item) ? acc : [...acc, item]

export const sortBy =
  <O, F extends keyof O>(field: F, dir: 'asc' | 'desc' = 'asc') =>
  (a: O, b: O): number => {
    const valueA = a[field]
    const valueB = b[field]
    const result = valueA > valueB ? 1 : -1
    return dir === 'asc' ? result : -1 * result
  }

export const sortWith =
  <O>(
    fn: (element: O) => string | number | Date,
    order: 'asc' | 'desc' = 'asc'
  ) =>
  (a: O, b: O): 1 | -1 | 0 => {
    const aValue = fn(a)
    const bValue = fn(b)
    const ascOp: 1 | -1 = order === 'asc' ? 1 : -1
    const descOp: 1 | -1 = order === 'asc' ? -1 : 1
    return aValue > bValue ? ascOp : aValue < bValue ? descOp : 0
  }

export const eq =
  (value: any) =>
  (refValue: any): boolean =>
    refValue === value

export const notEq =
  (value: any) =>
  (refValue: any): boolean =>
    refValue !== value

export const nonNullable = <T>(value: T): value is NonNullable<T> =>
  value !== null && value !== undefined

export const trim = (value: string) => (value?.trim ? value.trim() : value)

export function throttle(func: Function, delay: number = 300) {
  let isThrottled = false
  let savedArgs: any
  let savedThis: any
  function wrapper(this: any) {
    if (isThrottled) {
      savedArgs = arguments
      savedThis = this
      return
    }
    func.apply(this, arguments)
    isThrottled = true
    setTimeout(function () {
      isThrottled = false
      if (savedArgs) {
        wrapper.apply(savedThis, savedArgs)
        savedArgs = savedThis = null
      }
    }, delay)
  }
  return wrapper
}

export function debounce<F extends (...args: any[]) => any>(
  func: F,
  delay: number = 300
): (...args: Parameters<F>) => void {
  let timerId: number | null = null
  return (...args: Parameters<F>) => {
    if (timerId) {
      clearTimeout(timerId)
    }
    timerId = window.setTimeout(() => {
      func(...args)
      timerId = null
    }, delay)
  }
}

export const pick =
  <O extends Record<string, any>, F extends string>(
    fields: readonly F[] = []
  ) =>
  (obj: O): Pick<O, F> => {
    return fields.reduce((acc, field) => {
      return { ...acc, [field]: obj[field] }
    }, {} as Pick<O, F>)
  }

export const omit =
  <F extends string>(fields: readonly F[] = []) =>
  <O extends Record<string, any>>(obj: O): Omit<O, F> => {
    return Object.keys(obj).reduce((acc, x) => {
      // @ts-ignore FIXME:
      if (!fields.includes(x)) {
        return { ...acc, [x]: obj[x] }
      }
      return acc
    }, {} as Omit<O, F>)
  }

export const isObject = (obj: any): boolean =>
  Object.prototype.toString.call(obj) === '[object Object]'

export const toggleInArray = <T>(
  arr: T[],
  item: T,
  keepOne: boolean = false,
  maxNumber?: number
): T[] => {
  if (arr.indexOf(item) > -1) {
    if (keepOne && arr.length === 1) {
      return arr
    }
    return arr.filter((x) => x !== item)
  } else {
    if (maxNumber) {
      if (arr.length >= maxNumber) {
        return arr
      }
    }
    return arr.concat(item)
  }
}

export function compareArrays<T>(_a: T[], _b: T[]): boolean {
  const a = _a.slice().sort()
  const b = _b.slice().sort()
  return a.length === b.length && a.every((x, i) => x === b[i])
}

export function randomElement<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]
}
