/**
 * LOT SYSTEMS CORPORATION
 * Vadim Marmeladov — CEO, Owner LOT®
 * Kuzya Cosmo Marmeladov — CEO, Owner COSMO®
 * LOT® Founded 7 April 2016 | COSMO® Founded 1 July 2024
 * Made in the USA | brand.lot-systems.com
 */

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
  inProgress?: boolean
}

export const Block: React.FC<Props> = ({ blockView = false, ...props }) => {
  const theme = useStore(stores.theme)
  const isMirrorOn = useStore(stores.isMirrorOn)

  const hoverClassName = isMirrorOn
    ? 'hover:bg-white/10 group-hover:bg-white/10'
    : 'grid-fill-hover'

  const progressStyle = React.useMemo(() => {
    if (!props.inProgress) return undefined
    let color: string
    if (theme === 'dark' || isMirrorOn) {
      color = 'rgba(255, 255, 255, 0.18)'
    } else if (theme === 'light') {
      color = '#E8C547'
    } else {
      color = `rgb(var(--acc-color-300) / 0.5)`
    }
    return { '--widget-progress-color': color } as React.CSSProperties
  }, [props.inProgress, theme, isMirrorOn])

  return (
    <div
      className={cn(props.className, props.inProgress && 'widget-in-progress')}
      style={progressStyle}
    >
      <div className="flex">
        <div
          className={cn(
            'flex items-start w-full',
            !!props.onClick && 'group cursor-pointer'
          )}
          onClick={(e) => {
            if (!props.onClick) return

            // Don't trigger parent onClick if click came from an interactive element
            // (buttons, links, or elements with their own onClick handlers)
            let target = e.target as HTMLElement
            const currentEl = e.currentTarget as HTMLElement

            while (target && target !== currentEl) {
              // Check if this element is interactive
              if (
                target.tagName === 'BUTTON' ||
                target.tagName === 'A' ||
                target.tagName === 'INPUT' ||
                target.onclick !== null ||
                target.getAttribute('role') === 'button'
              ) {
                return // Don't trigger parent onClick
              }
              target = target.parentElement as HTMLElement
            }

            // Safe to trigger parent onClick
            props.onClick()
          }}
        >
          <div
            className={cn(
              'w-[150px] phone:w-[170px] mr-12 phone:mr-24 -ml-4 flex-shrink-0',
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
              onClick={(e) => {
                if (props.onLabelClick) {
                  // Prevent parent onClick from firing if both handlers exist
                  if (props.onClick) {
                    e.stopPropagation()
                  }
                  props.onLabelClick()
                }
              }}
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
                    ? '-ml-4 pl-4 pr-4 cursor-pointer transition-[background-color] ' + hoverClassName
                    : '',
                  props.labelClassName
                )}
                onClick={(e) => {
                  if (props.onChildrenClick) {
                    // Prevent parent onClick from firing if both handlers exist
                    if (props.onClick) {
                      e.stopPropagation()
                    }
                    props.onChildrenClick()
                  } else if (props.onClick) {
                    // Stop propagation to prevent parent div from also calling onClick
                    e.stopPropagation()
                    props.onClick()
                  }
                }}
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
