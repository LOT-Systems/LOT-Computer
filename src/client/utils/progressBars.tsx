import * as React from 'react'

/**
 * Progress Bar System - Consistent opacity-based progression indicators
 *
 * Uses bars (|) with varying opacity to show progression:
 * - Fully rendered: opacity 1.0 (complete)
 * - Still emerging: opacity 0.15 (incomplete)
 *
 * This creates a tactile, ASCII-art aesthetic for showing progress
 */

export interface ProgressBarsProps {
  /** Progress percentage from 0-100 */
  percentage: number
  /** Number of bars to display (default: 10) */
  barCount?: number
  /** Character to use for bars (default: '|') */
  barChar?: string
  /** Opacity for filled bars (default: 1.0) */
  filledOpacity?: number
  /** Opacity for emerging bars (default: 0.15) */
  emergingOpacity?: number
  /** Additional CSS classes */
  className?: string
}

export const ProgressBars: React.FC<ProgressBarsProps> = ({
  percentage,
  barCount = 10,
  barChar = '|',
  filledOpacity = 1.0,
  emergingOpacity = 0.15,
  className = ''
}) => {
  // Calculate how many bars should be filled
  const filledCount = Math.round((percentage / 100) * barCount)

  return (
    <div className={`inline-flex gap-1 font-mono ${className}`}>
      {Array.from({ length: barCount }).map((_, i) => {
        const isFilled = i < filledCount
        const opacity = isFilled ? filledOpacity : emergingOpacity

        return (
          <span
            key={i}
            style={{ opacity }}
            className="transition-opacity duration-300"
          >
            {barChar}
          </span>
        )
      })}
    </div>
  )
}

/**
 * Helper function to get bars as a string with opacity styling
 * Useful for inline display or when you need just the string representation
 */
export function getProgressBarsString(
  percentage: number,
  barCount: number = 10,
  barChar: string = '|'
): { filled: number; total: number; display: string } {
  const filledCount = Math.round((percentage / 100) * barCount)
  const display = barChar.repeat(barCount)

  return {
    filled: filledCount,
    total: barCount,
    display
  }
}

/**
 * Stoic-inspired progress labels
 * Provides meaningful narrative context for different progress levels
 */
export function getStoicProgressLabel(percentage: number): string {
  if (percentage === 0) return 'Beginning the path'
  if (percentage < 10) return 'First steps taken'
  if (percentage < 25) return 'Building momentum'
  if (percentage < 40) return 'Steadily advancing'
  if (percentage < 60) return 'Halfway through'
  if (percentage < 75) return 'Approaching mastery'
  if (percentage < 90) return 'Nearly complete'
  if (percentage < 100) return 'Final refinements'
  return 'Journey complete'
}

/**
 * Alternative: Bars with gradient effect
 * Shows a smooth transition from filled to emerging
 */
export const GradientProgressBars: React.FC<ProgressBarsProps> = ({
  percentage,
  barCount = 10,
  barChar = '|',
  filledOpacity = 1.0,
  emergingOpacity = 0.15,
  className = ''
}) => {
  const filledCount = Math.round((percentage / 100) * barCount)

  return (
    <div className={`inline-flex gap-1 font-mono ${className}`}>
      {Array.from({ length: barCount }).map((_, i) => {
        let opacity: number

        if (i < filledCount - 1) {
          // Fully filled
          opacity = filledOpacity
        } else if (i === filledCount - 1) {
          // Transition bar - partial fill based on exact percentage
          const exactFilled = (percentage / 100) * barCount
          const partialAmount = exactFilled - Math.floor(exactFilled)
          opacity = emergingOpacity + (filledOpacity - emergingOpacity) * partialAmount
        } else {
          // Emerging
          opacity = emergingOpacity
        }

        return (
          <span
            key={i}
            style={{ opacity }}
            className="transition-opacity duration-300"
          >
            {barChar}
          </span>
        )
      })}
    </div>
  )
}
