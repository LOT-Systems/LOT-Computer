import React from 'react'
import { Block } from '#client/components/ui'
import { cn } from '#client/utils'
import { recordSignal } from '#client/stores/intentionEngine'

/**
 * MicroCalculatorWidget - ASCII calculator that surfaces at magical number times.
 * Palindromes, sequences, and repeating digit timestamps trigger appearance.
 * Fades in for the duration of the magical minute, then dissolves.
 */

const MAGIC_TIMES: Set<string> = new Set([
  '00:00', '01:01', '01:23', '02:02', '03:03', '04:04', '05:05',
  '10:01', '10:10', '11:11', '12:12', '12:21', '12:34',
  '13:13', '13:31', '14:14', '14:41', '15:15', '15:51',
  '16:16', '17:17', '18:18', '19:19',
  '20:02', '20:20', '21:12', '21:21',
  '22:22', '23:23', '23:32', '23:45',
])

function detectMagicTime(): string | null {
  const now = new Date()
  const h = now.getHours().toString().padStart(2, '0')
  const m = now.getMinutes().toString().padStart(2, '0')
  const key = `${h}:${m}`
  return MAGIC_TIMES.has(key) ? key : null
}

export function MicroCalculatorWidget() {
  const [display, setDisplay] = React.useState('0')
  const [buffer, setBuffer] = React.useState<number | null>(null)
  const [op, setOp] = React.useState<string | null>(null)
  const [fresh, setFresh] = React.useState(true)
  const [magicTime, setMagicTime] = React.useState<string | null>(null)
  const [fading, setFading] = React.useState(false)
  const signaledRef = React.useRef(false)

  // Poll for magic time every 10 seconds
  React.useEffect(() => {
    const check = () => {
      const mt = detectMagicTime()
      if (mt && !magicTime) {
        setMagicTime(mt)
        setFading(false)
        if (!signaledRef.current) {
          recordSignal('calculator', 'magic_time', { time: mt })
          signaledRef.current = true
        }
      } else if (!mt && magicTime && !fading) {
        setFading(true)
        setTimeout(() => {
          setMagicTime(null)
          setFading(false)
          signaledRef.current = false
          setDisplay('0')
          setBuffer(null)
          setOp(null)
          setFresh(true)
        }, 1400)
      }
    }
    check()
    const iv = setInterval(check, 10000)
    return () => clearInterval(iv)
  }, [magicTime, fading])

  if (!magicTime) return null

  const calc = (a: number, b: number, o: string): number => {
    switch (o) {
      case '+': return a + b
      case '-': return a - b
      case '*': return a * b
      case '/': return b !== 0 ? a / b : 0
      default: return b
    }
  }

  const fmt = (n: number): string => {
    if (!isFinite(n)) return '0'
    if (Number.isInteger(n)) return String(n)
    return parseFloat(n.toFixed(8)).toString()
  }

  const digit = (d: string) => {
    if (fresh) {
      setDisplay(d)
      setFresh(false)
    } else {
      if (display.length >= 12) return
      setDisplay(prev => prev === '0' ? d : prev + d)
    }
  }

  const decimal = () => {
    if (fresh) {
      setDisplay('0.')
      setFresh(false)
    } else if (!display.includes('.')) {
      setDisplay(prev => prev + '.')
    }
  }

  const operate = (nextOp: string) => {
    const val = parseFloat(display)
    if (buffer !== null && op && !fresh) {
      const result = calc(buffer, val, op)
      setDisplay(fmt(result))
      setBuffer(result)
    } else {
      setBuffer(val)
    }
    setOp(nextOp)
    setFresh(true)
  }

  const equals = () => {
    if (buffer === null || !op) return
    const val = parseFloat(display)
    const result = calc(buffer, val, op)
    setDisplay(fmt(result))
    setBuffer(null)
    setOp(null)
    setFresh(true)
    recordSignal('calculator', 'compute', { result: fmt(result) })
  }

  const clear = () => {
    setDisplay('0')
    setBuffer(null)
    setOp(null)
    setFresh(true)
  }

  const Key = ({ label, onClick, wide, active }: {
    label: string
    onClick: () => void
    wide?: boolean
    active?: boolean
  }) => (
    <button
      onClick={onClick}
      className={cn(
        'py-4 rounded border cursor-pointer select-none',
        active
          ? 'border-acc text-acc'
          : 'border-acc/30 grid-fill-hover',
        wide && 'col-span-2'
      )}
    >
      {label}
    </button>
  )

  return (
    <div className={cn(
      'transition-opacity duration-[1400ms]',
      fading ? 'opacity-0' : 'opacity-100'
    )}>
      <Block label={`${magicTime} Calculator:`} blockView>
        <div className="max-w-[200px]">
          {/* Display */}
          <div className="mb-8 pb-4 border-b border-acc/30">
            {buffer !== null && (
              <div className="opacity-30 tabular-nums text-right">
                {fmt(buffer)} {op === '*' ? '×' : op === '/' ? '÷' : op}
              </div>
            )}
            <div className="tabular-nums text-right">{display}</div>
          </div>

          {/* Keypad */}
          <div className="grid grid-cols-4 gap-4">
            <Key label="C" onClick={clear} />
            <Key label="÷" onClick={() => operate('/')} active={op === '/'} />
            <Key label="×" onClick={() => operate('*')} active={op === '*'} />
            <Key label="-" onClick={() => operate('-')} active={op === '-'} />

            <Key label="7" onClick={() => digit('7')} />
            <Key label="8" onClick={() => digit('8')} />
            <Key label="9" onClick={() => digit('9')} />
            <Key label="+" onClick={() => operate('+')} active={op === '+'} />

            <Key label="4" onClick={() => digit('4')} />
            <Key label="5" onClick={() => digit('5')} />
            <Key label="6" onClick={() => digit('6')} />
            <Key label="=" onClick={equals} />

            <Key label="1" onClick={() => digit('1')} />
            <Key label="2" onClick={() => digit('2')} />
            <Key label="3" onClick={() => digit('3')} />
            <Key label="." onClick={decimal} />

            <Key label="0" onClick={() => digit('0')} wide />
          </div>
        </div>
      </Block>
    </div>
  )
}
