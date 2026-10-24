/**
 * LOT SYSTEMS CORPORATION
 * Vadim Marmeladov — CEO, Owner LOT®
 * Kuzya Cosmo Marmeladov — CEO, Owner COSMO®
 * LOT® Founded 7 April 2016 | COSMO® Founded 1 July 2024
 * Made in the USA | brand.lot-systems.com
 */

import React from 'react'
import dayjs from '#client/utils/dayjs'

type Props = {
  format: string
  interval?: number
}

export const Clock: React.FC<Props> = ({ format, interval }) => {
  const [state, setState] = React.useState(dayjs().format(format))
  const loop = React.useRef<number>()
  React.useEffect(() => {
    if (loop.current) {
      clearInterval(loop.current)
    }
    if (interval) {
      // @ts-ignore
      loop.current = setInterval(
        () => setState(dayjs().format(format)),
        interval
      )
    }
    return () => {
      if (loop.current) {
        clearInterval(loop.current)
      }
    }
  }, [format, interval])
  return <>{state}</>
}
