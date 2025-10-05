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
