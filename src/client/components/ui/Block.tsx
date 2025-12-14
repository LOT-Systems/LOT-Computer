import React from 'react'
import { useStore } from '@nanostores/react'
import * as stores from '#client/stores'
import { cn } from '#client/utils'

type Props = {
  blockView?: boolean
  label: string
  onLabelClick?: () => void
  children: React.ReactNode
  onChildrenClick?: () => void
  className?: string
  labelClassName?: string
  contentClassName?: string
  containsButton?: boolean
  containsSmallButton?: boolean
  onClick?: () => void
}

export const Block: React.FC<Props> = ({ blockView = false, ...props }) => {
  const theme = useStore(stores.theme)
  const isMirrorOn = useStore(stores.isMirrorOn)

  const hoverClassName = isMirrorOn
    ? 'hover:bg-white/10 group-hover:bg-white/10'
    : 'hover:bg-acc/10 group-hover:bg-acc/10'

  return (
    <div className={props.className}>
      <div className="flex">
        <div
          className={cn(
            'flex items-start w-full',
            !!props.onClick && 'group cursor-pointer'
          )}
          onClick={props.onClick}
        >
          <div
            className={cn(
              'w-[170px] sm:w-[150px] mr-24 sm:mr-12 -ml-4',
              props.containsButton && 'translate-y-8',
              props.containsSmallButton && 'translate-y-4'
            )}
          >
            <span
              className={cn(
                'px-4 rounded',
                (!!props.onClick || !!props.onLabelClick) &&
                  cn(
                    'cursor-pointer transition-[background-color]',
                    hoverClassName
                  ),
                props.labelClassName
              )}
              onClick={props.onLabelClick}
            >
              {props.label}
            </span>
          </div>
          <div
            className={cn(
              'flex-1',
              props.contentClassName
            )}
          >
            {blockView ? (
              props.children
            ) : (
              <span
                className={cn(
                  'rounded',
                  (!!props.onClick || !!props.onChildrenClick)
                    ? '-ml-4 pl-4 pr-4 py-4 cursor-pointer transition-[background-color] ' + hoverClassName
                    : '',
                  props.labelClassName
                )}
                onClick={props.onChildrenClick}
              >
                {props.children}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
