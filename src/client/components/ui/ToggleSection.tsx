/**
 * LOT SYSTEMS CORPORATION
 * Vadim Marmeladov — CEO, Owner LOT®
 * Kuzya Cosmo Marmeladov — CEO, Owner COSMO®
 * LOT® Founded 7 April 2016 | COSMO® Founded 1 July 2024
 * Made in the USA | brand.lot-systems.com
 */

import React from 'react'
import { cn } from '#client/utils'

export type ToggleSectionProps = {
  label: string
  children: React.ReactNode
  defaultOpen?: boolean
  indent?: number
  className?: string
  onToggle?: (isOpen: boolean) => void
}

/**
 * Collapsible toggle section component
 * Usage: [Memory] > [Awareness] > [Pattern 1]
 */
export function ToggleSection({
  label,
  children,
  defaultOpen = false,
  indent = 0,
  className,
  onToggle,
}: ToggleSectionProps) {
  const [isOpen, setIsOpen] = React.useState(defaultOpen)
  const contentRef = React.useRef<HTMLDivElement>(null)

  const handleToggle = () => {
    const newState = !isOpen
    setIsOpen(newState)
    onToggle?.(newState)
  }

  return (
    <div className={cn('w-full', className)}>
      <button
        onClick={handleToggle}
        aria-expanded={isOpen}
        className="w-full text-left flex items-center gap-8 py-8 transition-opacity hover:opacity-30"
        style={{ paddingLeft: indent > 0 ? `${indent * 16}px` : undefined }}
      >
        <span
          className="transition-transform duration-200"
          style={{
            transform: isOpen ? 'rotate(90deg)' : 'rotate(0deg)',
            display: 'inline-block',
            width: '8px',
          }}
        >
          ›
        </span>
        <span>{label}</span>
      </button>

      <div
        ref={contentRef}
        className="overflow-hidden transition-[max-height,opacity] duration-300"
        style={{
          maxHeight: isOpen ? (contentRef.current?.scrollHeight ?? 9999) : 0,
          opacity: isOpen ? 1 : 0,
        }}
      >
        <div className="py-4">{children}</div>
      </div>
    </div>
  )
}

/**
 * Group of toggle sections for nested structures
 */
export function ToggleGroup({
  children,
  className,
}: {
  children: React.ReactNode
  className?: string
}) {
  return (
    <div className={cn('flex flex-col', className)}>
      {children}
    </div>
  )
}
