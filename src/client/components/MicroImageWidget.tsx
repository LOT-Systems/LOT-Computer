/**
 * LOT SYSTEMS CORPORATION
 * Vadim Marmeladov — CEO, Owner LOT®
 * Kuzya Cosmo Marmeladov — CEO, Owner COSMO®
 * LOT® Founded 7 April 2016 | COSMO® Founded 1 July 2024
 * Made in the USA | brand.lot-systems.com
 */

import * as React from 'react'
import { Block, Button } from '#client/components/ui'
import { cn } from '#client/utils'
import { recordSignal } from '#client/stores/intentionEngine'
import { shouldShowRewardWidget } from '#client/stores/rewardWidgets'
import { usePunctuationContext } from '#client/hooks/usePunctuationContext'

/**
 * MicroImageWidget — a 2×2 cm procedurally-generated pixel image.
 *
 * In progress. Designed to live alongside MicroGameWidget and
 * MicroCalculatorWidget in the Planning stack as a third monochrome
 * micro screen. The image is a small abstract composition generated
 * from a seed — but the seed and composition parameters are modulated
 * by the user's punctuation context so that the image subtly echoes the
 * user's intonation.
 *
 *   tone: urgent      → sharp radial bursts
 *   tone: questioning → spiral
 *   tone: reflective  → soft flow field
 *   tone: excited     → scattered sparks
 *   tone: calm / flat → still grid
 *
 * Intensity from punctuation increases the density of marks, and the
 * `callForHelp` flag replaces the composition with a steady heartbeat
 * line — a visual signal that someone is listening.
 */

const GRID = 64
const CELL = 1
const CSS_SIZE = 76 // ≈ 2cm @96dpi

type Cell = [number, number]

function makeRng(seed: number): () => number {
  let s = seed || 1
  return () => {
    s = (s * 9301 + 49297) % 233280
    return s / 233280
  }
}

function push(cells: Cell[], x: number, y: number) {
  if (x >= 0 && x < GRID && y >= 0 && y < GRID) {
    cells.push([Math.round(x), Math.round(y)])
  }
}

// --- Compositions -----------------------------------------------------------

function genStillGrid(rng: () => number, density: number): Cell[] {
  const cells: Cell[] = []
  const step = Math.max(4, Math.round(10 - density * 6))
  for (let y = step; y < GRID - step; y += step) {
    for (let x = step; x < GRID - step; x += step) {
      if (rng() > 0.15) push(cells, x, y)
    }
  }
  return cells
}

function genRadialBurst(rng: () => number, density: number): Cell[] {
  const cells: Cell[] = []
  const cx = GRID / 2, cy = GRID / 2
  const rays = 6 + Math.floor(density * 12)
  for (let r = 0; r < rays; r++) {
    const angle = (r / rays) * Math.PI * 2 + rng() * 0.1
    const length = 10 + rng() * 18
    for (let t = 2; t < length; t++) {
      push(cells, cx + Math.cos(angle) * t, cy + Math.sin(angle) * t)
    }
  }
  // Center dot
  for (let dy = -1; dy <= 1; dy++) {
    for (let dx = -1; dx <= 1; dx++) push(cells, cx + dx, cy + dy)
  }
  return cells
}

function genSpiral(rng: () => number, density: number): Cell[] {
  const cells: Cell[] = []
  const cx = GRID / 2, cy = GRID / 2
  const turns = 2 + density * 3
  const maxT = turns * Math.PI * 2
  const step = Math.max(0.03, 0.08 - density * 0.04)
  for (let t = 0; t < maxT; t += step) {
    const r = (t / maxT) * (GRID * 0.42)
    push(cells, cx + Math.cos(t) * r, cy + Math.sin(t) * r)
  }
  // Scatter some stray marks proportional to density
  const strays = Math.floor(density * 20)
  for (let i = 0; i < strays; i++) {
    push(cells, Math.floor(rng() * GRID), Math.floor(rng() * GRID))
  }
  return cells
}

function genFlowField(rng: () => number, density: number): Cell[] {
  const cells: Cell[] = []
  const lines = 4 + Math.floor(density * 10)
  for (let i = 0; i < lines; i++) {
    let x = rng() * GRID
    let y = 6 + rng() * (GRID - 12)
    const amp = 4 + rng() * 6
    const freq = 0.08 + rng() * 0.06
    const startX = x
    for (let dx = 0; dx < GRID; dx += 1) {
      const yy = y + Math.sin((startX + dx) * freq) * amp
      push(cells, dx, yy)
    }
  }
  return cells
}

function genSparks(rng: () => number, density: number): Cell[] {
  const cells: Cell[] = []
  const count = 30 + Math.floor(density * 80)
  for (let i = 0; i < count; i++) {
    const x = Math.floor(rng() * GRID)
    const y = Math.floor(rng() * GRID)
    push(cells, x, y)
    if (rng() > 0.55) {
      push(cells, x + 1, y)
      push(cells, x, y + 1)
    }
  }
  return cells
}

function genHeartbeat(_rng: () => number, _density: number): Cell[] {
  const cells: Cell[] = []
  const midY = GRID / 2
  // Flat baseline
  for (let x = 0; x < GRID; x++) push(cells, x, midY)
  // Two heartbeat spikes
  const spike = (cx: number) => {
    push(cells, cx, midY)
    push(cells, cx + 1, midY - 4)
    push(cells, cx + 2, midY - 8)
    push(cells, cx + 3, midY - 12)
    push(cells, cx + 4, midY - 6)
    push(cells, cx + 5, midY)
    push(cells, cx + 6, midY + 4)
    push(cells, cx + 7, midY)
  }
  spike(14)
  spike(42)
  return cells
}

type Composition =
  | 'still-grid'
  | 'radial-burst'
  | 'spiral'
  | 'flow-field'
  | 'sparks'
  | 'heartbeat'

const GENERATORS: Record<Composition, (rng: () => number, density: number) => Cell[]> = {
  'still-grid': genStillGrid,
  'radial-burst': genRadialBurst,
  spiral: genSpiral,
  'flow-field': genFlowField,
  sparks: genSparks,
  heartbeat: genHeartbeat,
}

const COMPOSITION_LABEL: Record<Composition, string> = {
  'still-grid': 'Still grid',
  'radial-burst': 'Radial burst',
  spiral: 'Spiral',
  'flow-field': 'Flow field',
  sparks: 'Sparks',
  heartbeat: 'Heartbeat',
}

// --- Component --------------------------------------------------------------

export const MicroImageWidget: React.FC = () => {
  const [visible] = React.useState(() => shouldShowRewardWidget('micro_image'))
  const canvasRef = React.useRef<HTMLCanvasElement>(null)
  const punctuation = usePunctuationContext()
  const [seed, setSeed] = React.useState(() => Math.floor(Math.random() * 1e6) + 1)
  const hasRecordedRef = React.useRef(false)

  // Pick composition from punctuation context
  const composition: Composition = React.useMemo(() => {
    if (punctuation.callForHelp) return 'heartbeat'
    const tone = punctuation.aggregate.tone
    switch (tone) {
      case 'urgent':
        return 'radial-burst'
      case 'questioning':
        return 'spiral'
      case 'reflective':
        return 'flow-field'
      case 'excited':
        return 'sparks'
      case 'mixed':
        return 'spiral'
      case 'calm':
      case 'flat':
      default:
        return 'still-grid'
    }
  }, [punctuation.aggregate.tone, punctuation.callForHelp])

  // Density from punctuation intensity, clamped for legibility
  const density = React.useMemo(() => {
    const base = 0.2
    const fromIntensity = punctuation.aggregate.intensity * 0.8
    return Math.max(0, Math.min(1, base + fromIntensity))
  }, [punctuation.aggregate.intensity])

  // Redraw when composition, density, or seed changes
  React.useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Ensure crisp pixels
    const style = getComputedStyle(canvas)
    const fg = style.getPropertyValue('color') || '#000'

    canvas.width = GRID * CELL
    canvas.height = GRID * CELL
    ctx.imageSmoothingEnabled = false
    ctx.clearRect(0, 0, canvas.width, canvas.height)

    const rng = makeRng(seed)
    const cells = GENERATORS[composition](rng, density)
    ctx.fillStyle = fg
    for (const [x, y] of cells) {
      ctx.fillRect(x * CELL, y * CELL, CELL, CELL)
    }
  }, [composition, density, seed])

  // Record a signal once when the widget mounts with meaningful context
  if (!hasRecordedRef.current && punctuation.sampleSize > 0) {
    recordSignal('intentions', 'microimage_rendered', {
      composition,
      tone: punctuation.aggregate.tone,
      intent: punctuation.aggregate.intent,
      intensity: punctuation.aggregate.intensity,
      callForHelp: punctuation.callForHelp,
      hour: new Date().getHours(),
    })
    hasRecordedRef.current = true
  }

  const handleRegenerate = () => {
    setSeed(Math.floor(Math.random() * 1e6) + 1)
    recordSignal('intentions', 'microimage_regenerated', {
      composition,
      tone: punctuation.aggregate.tone,
    })
  }

  if (!visible) return null

  const subtitle = punctuation.callForHelp
    ? 'Listening.'
    : punctuation.sampleSize === 0
      ? 'Type in the log to shape the image.'
      : `${COMPOSITION_LABEL[composition]} · ${punctuation.aggregate.label}`

  return (
    <Block label="Image:" blockView inProgress>
      <div className="flex flex-col gap-y-8">
        <div className="flex items-center justify-center">
          <div
            className={cn(
              'relative border border-acc/30 p-2',
              'bg-transparent'
            )}
            style={{ width: CSS_SIZE + 8, height: CSS_SIZE + 8 }}
          >
            <canvas
              ref={canvasRef}
              width={GRID * CELL}
              height={GRID * CELL}
              style={{
                width: CSS_SIZE,
                height: CSS_SIZE,
                imageRendering: 'pixelated',
                display: 'block',
              }}
            />
          </div>
        </div>

        <div className="opacity-30 text-center">{subtitle}</div>

        <div className="flex justify-center">
          <Button size="small" onClick={handleRegenerate}>
            regenerate
          </Button>
        </div>
      </div>
    </Block>
  )
}
