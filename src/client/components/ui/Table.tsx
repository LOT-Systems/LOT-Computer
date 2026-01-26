import * as React from 'react'
import { cn } from '#client/utils'

type ReactEl = string | React.ReactNode | null
type ReactElFn<X> = (x: X) => ReactEl

interface Props<Datum> {
  data: Datum[]
  columns: Array<{
    id: string
    header: ReactEl
    accessor: ReactElFn<Datum>
  }>
  className?: string
  paddingClassName?: string
  hideHeader?: boolean
  highlightFirstRow?: boolean
  selectedRowIndex?: number
  onRowClick?: (index: number) => void
}

export const Table = <D,>(props: Props<D>) => {
  return (
    <div className={cn('_table relative', props.className)}>
      <div className={cn('_table-wrapper overflow-x-auto', props.paddingClassName)}>
        <table className="w-full overflow-hidden border border-acc-400/30 rounded-lg">
          {!props.hideHeader && (
            <thead>
              <tr>
                {props.columns.map((c) => (
                  <Th key={c.id}>{c.header}</Th>
                ))}
              </tr>
            </thead>
          )}
          <tbody>
            {props.data.map((d: D, i) => {
              const isSelected = props.selectedRowIndex !== undefined
                ? i === props.selectedRowIndex
                : props.highlightFirstRow && i === 0
              const isClickable = props.onRowClick !== undefined

              return (
                <tr
                  key={i}
                  className={cn(
                    isSelected && 'bg-acc-400/10',
                    isClickable && 'cursor-pointer'
                  )}
                  onClick={() => props.onRowClick?.(i)}
                >
                  {props.columns.map((c) => (
                    <Td key={c.id} isSelected={isSelected}>{c.accessor(d)}</Td>
                  ))}
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export const Th: React.FC<{ children: ReactEl; className?: string }> = (
  props
) => {
  return (
    <th className={cn('border-b border-r border-acc-400/30 p-8', props.className)}>
      {props.children}
    </th>
  )
}

export const Td: React.FC<{ children: ReactEl; className?: string; isSelected?: boolean }> = (
  props
) => {
  return (
    <td className={cn(
      'border-b border-r hover:bg-acc-400/10 transition-colors p-8',
      props.isSelected ? 'border-acc-400' : 'border-acc-400/30',
      props.className
    )}>
      {props.children}
    </td>
  )
}
