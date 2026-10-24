/**
 * LOT SYSTEMS CORPORATION
 * Vadim Marmeladov — CEO, Owner LOT®
 * Kuzya Cosmo Marmeladov — CEO, Owner COSMO®
 * LOT® Founded 7 April 2016 | COSMO® Founded 1 July 2024
 * Made in the USA | brand.lot-systems.com
 */

import React from 'react'
import { Block, Button } from '#client/components/ui'
import { cn } from '#client/utils'
import { recordSignal } from '#client/stores/intentionEngine'
import { shouldShowRewardWidget } from '#client/stores/rewardWidgets'
import { useActiveViewport } from '#client/hooks/useInViewport'
import {
  playMoveSound, playRotateSound, playScoreSound, playDropSound,
  playShootSound, playEnemyHitSound, playGameOverSound, playSwitchSound,
  playLineClearSound,
} from '#client/utils/sovietGameSounds'

/**
 * MicroGameWidget — A 2×2 cm high-density monochromatic micro-screen
 * running one of 3 context-based pixel games.
 *
 * Games rotate based on time of day:
 *   Morning  (06–12) → Micro Tetris   (structure, building)
 *   Afternoon(12–18) → Pixel Invaders (focus, action)
 *   Evening  (18–06) → Dot Snake      (flow, calm)
 *
 * 64×64 pixel grid with nature background patterns.
 * All graphics are monochromatic (foreground vs background).
 */

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

/** Logical pixel grid: 64×64 cells rendered into ~76×76 CSS pixels (≈2cm @96dpi) */
const GRID = 64
const CELL = 1 // each logical cell = 1×1 canvas pixel (high density)
const SIZE = GRID * CELL // 64 canvas pixels
const CSS_SIZE = 76 // ≈ 2cm at 96 dpi
const TICK_MS = 150 // game tick speed

// ---------------------------------------------------------------------------
// Shared helpers
// ---------------------------------------------------------------------------

type Color = { fg: string; bg: string }

function getMonoColors(canvas: HTMLCanvasElement): Color {
  const style = getComputedStyle(canvas)
  const fg = style.getPropertyValue('color') || '#000'
  const bg = 'transparent'
  return { fg, bg }
}

function clearGrid(ctx: CanvasRenderingContext2D, _bg: string, w: number, h: number) {
  ctx.clearRect(0, 0, w, h)
}

function drawCell(ctx: CanvasRenderingContext2D, x: number, y: number, fg: string) {
  ctx.fillStyle = fg
  ctx.fillRect(x * CELL, y * CELL, CELL, CELL)
}

// ---------------------------------------------------------------------------
// Random themed backgrounds — complex floral & ornamental patterns
// ---------------------------------------------------------------------------
//
// Each theme is a generator that returns a list of pixel cells. Generation is
// done once per game switch (seeded) and cached, so the pattern is stable
// across ticks but different every time the game restarts.

type Cell = [number, number]

type BgTheme =
  | 'floral-garden'
  | 'cherry-blossom'
  | 'rose-mandala'
  | 'vine-lattice'
  | 'daisy-field'
  | 'lotus-pond'
  | 'art-nouveau'
  | 'starry-floral'
  | 'tulip-rows'
  | 'baroque-swirls'

const ALL_THEMES: BgTheme[] = [
  'floral-garden',
  'cherry-blossom',
  'rose-mandala',
  'vine-lattice',
  'daisy-field',
  'lotus-pond',
  'art-nouveau',
  'starry-floral',
  'tulip-rows',
  'baroque-swirls',
]

function makeRng(seed: number): () => number {
  let s = seed || 1
  return () => {
    s = (s * 9301 + 49297) % 233280
    return s / 233280
  }
}

function push(cells: Cell[], x: number, y: number) {
  if (x >= 0 && x < GRID && y >= 0 && y < GRID) cells.push([Math.round(x), Math.round(y)])
}

// --- Primitive motifs -------------------------------------------------------

function stampFlower(cells: Cell[], cx: number, cy: number, size: number) {
  // Center
  push(cells, cx, cy)
  // 4 cardinal petals
  push(cells, cx - 1, cy); push(cells, cx + 1, cy)
  push(cells, cx, cy - 1); push(cells, cx, cy + 1)
  if (size >= 2) {
    push(cells, cx - 2, cy); push(cells, cx + 2, cy)
    push(cells, cx, cy - 2); push(cells, cx, cy + 2)
    push(cells, cx - 1, cy - 1); push(cells, cx + 1, cy - 1)
    push(cells, cx - 1, cy + 1); push(cells, cx + 1, cy + 1)
  }
  if (size >= 3) {
    push(cells, cx - 3, cy); push(cells, cx + 3, cy)
    push(cells, cx, cy - 3); push(cells, cx, cy + 3)
    push(cells, cx - 2, cy - 1); push(cells, cx + 2, cy - 1)
    push(cells, cx - 2, cy + 1); push(cells, cx + 2, cy + 1)
    push(cells, cx - 1, cy - 2); push(cells, cx + 1, cy - 2)
    push(cells, cx - 1, cy + 2); push(cells, cx + 1, cy + 2)
  }
}

function stampLeaf(cells: Cell[], cx: number, cy: number, dir: 1 | -1) {
  push(cells, cx, cy)
  push(cells, cx + dir, cy)
  push(cells, cx + dir, cy - 1)
  push(cells, cx + dir * 2, cy)
  push(cells, cx + dir * 2, cy + 1)
  push(cells, cx + dir * 3, cy)
}

function stampTulip(cells: Cell[], cx: number, cy: number) {
  push(cells, cx - 1, cy); push(cells, cx, cy); push(cells, cx + 1, cy)
  push(cells, cx - 1, cy + 1); push(cells, cx + 1, cy + 1)
  push(cells, cx, cy - 1)
  push(cells, cx - 2, cy); push(cells, cx + 2, cy)
}

function stampLine(cells: Cell[], x1: number, y1: number, x2: number, y2: number) {
  const dx = Math.abs(x2 - x1), dy = Math.abs(y2 - y1)
  const sx = x1 < x2 ? 1 : -1, sy = y1 < y2 ? 1 : -1
  let err = dx - dy, x = x1, y = y1
  for (let i = 0; i < 200; i++) {
    push(cells, x, y)
    if (x === x2 && y === y2) break
    const e2 = 2 * err
    if (e2 > -dy) { err -= dy; x += sx }
    if (e2 < dx) { err += dx; y += sy }
  }
}

// --- Theme generators -------------------------------------------------------

function genFloralGarden(rng: () => number): Cell[] {
  const cells: Cell[] = []
  // Rolling soil line
  for (let x = 0; x < GRID; x++) {
    const h = 2 + Math.floor(2 * Math.sin(x * 0.2) + Math.sin(x * 0.5 + rng()))
    for (let y = GRID - h; y < GRID; y++) push(cells, x, y)
  }
  const n = 5 + Math.floor(rng() * 4)
  for (let i = 0; i < n; i++) {
    const x = 4 + Math.floor(rng() * 56)
    const stemH = 10 + Math.floor(rng() * 18)
    for (let h = 0; h < stemH; h++) push(cells, x, GRID - 3 - h)
    const fy = GRID - 3 - stemH
    stampFlower(cells, x, fy, 1 + Math.floor(rng() * 3))
    if (rng() > 0.3) stampLeaf(cells, x, GRID - 3 - Math.floor(stemH * 0.5), rng() > 0.5 ? 1 : -1)
    if (rng() > 0.6) stampLeaf(cells, x, GRID - 3 - Math.floor(stemH * 0.7), rng() > 0.5 ? 1 : -1)
  }
  return cells
}

function genCherryBlossom(rng: () => number): Cell[] {
  const cells: Cell[] = []
  const branches = 2 + Math.floor(rng() * 2)
  for (let b = 0; b < branches; b++) {
    const x0 = Math.floor(rng() * GRID)
    const y0 = Math.floor(rng() * 20)
    const len = 30 + Math.floor(rng() * 25)
    const dx = (rng() - 0.3) * 1.2
    const dy = 0.4 + rng() * 0.5
    for (let t = 0; t < len; t++) {
      const x = x0 + t * dx
      const y = y0 + t * dy + Math.sin(t * 0.3) * 1.5
      push(cells, x, y)
      if (t % 7 === 3) {
        const bx = x + (rng() > 0.5 ? 3 : -3)
        const by = y + 2
        stampLine(cells, Math.round(x), Math.round(y), Math.round(bx), Math.round(by))
      }
    }
    const step = 4 + Math.floor(rng() * 3)
    for (let t = step; t < len; t += step) {
      const x = x0 + t * dx
      const y = y0 + t * dy + Math.sin(t * 0.3) * 1.5
      stampFlower(cells, Math.round(x), Math.round(y), 1 + Math.floor(rng() * 2))
    }
  }
  return cells
}

function genRoseMandala(rng: () => number): Cell[] {
  const cells: Cell[] = []
  const cx = 32, cy = 32
  const rings = [
    { r: 5, count: 6 },
    { r: 11, count: 8 },
    { r: 18, count: 12 },
    { r: 25, count: 14 },
  ]
  for (const ring of rings) {
    const phase = rng() * Math.PI * 2
    for (let i = 0; i < ring.count; i++) {
      const a = (i / ring.count) * Math.PI * 2 + phase
      const x = cx + Math.cos(a) * ring.r
      const y = cy + Math.sin(a) * ring.r
      stampFlower(cells, Math.round(x), Math.round(y), ring.r < 12 ? 2 : 1)
    }
  }
  // Connect rings with faint lines
  for (let i = 0; i < 8; i++) {
    const a = (i / 8) * Math.PI * 2
    stampLine(cells, cx, cy, Math.round(cx + Math.cos(a) * 28), Math.round(cy + Math.sin(a) * 28))
  }
  stampFlower(cells, cx, cy, 3)
  return cells
}

function genVineLattice(rng: () => number): Cell[] {
  const cells: Cell[] = []
  const spacing = 10 + Math.floor(rng() * 4)
  const wobble = rng() * 0.4 + 0.2
  for (let k = -GRID; k < GRID * 2; k += spacing) {
    for (let t = 0; t < GRID * 2; t++) {
      const w = Math.sin(t * wobble) * 2
      push(cells, t, k + t + w)
      push(cells, t, k - t + w)
    }
  }
  const flowerCount = 10 + Math.floor(rng() * 8)
  for (let i = 0; i < flowerCount; i++) {
    const x = Math.floor(rng() * GRID)
    const y = Math.floor(rng() * GRID)
    stampFlower(cells, x, y, 1 + Math.floor(rng() * 2))
  }
  return cells
}

function genDaisyField(rng: () => number): Cell[] {
  const cells: Cell[] = []
  // Grass hints
  for (let x = 0; x < GRID; x += 2) {
    push(cells, x, GRID - 1)
    if (rng() > 0.5) push(cells, x, GRID - 2)
  }
  const rows = 3 + Math.floor(rng() * 2)
  for (let r = 0; r < rows; r++) {
    const y = 14 + r * 13 + Math.floor(rng() * 3)
    const count = 3 + Math.floor(rng() * 3)
    for (let i = 0; i < count; i++) {
      const x = 6 + Math.floor((i + rng() * 0.5) * (52 / count))
      stampFlower(cells, x, y, 2)
      if (rng() > 0.5) stampLeaf(cells, x, y + 2, rng() > 0.5 ? 1 : -1)
    }
  }
  return cells
}

function genLotusPond(rng: () => number): Cell[] {
  const cells: Cell[] = []
  // Elliptical ripples
  const ripples = 3 + Math.floor(rng() * 2)
  for (let i = 0; i < ripples; i++) {
    const cx = Math.floor(rng() * GRID)
    const cy = 30 + Math.floor(rng() * 30)
    for (let r = 4; r <= 14; r += 3) {
      for (let a = 0; a < Math.PI * 2; a += 0.25) {
        push(cells, cx + Math.cos(a) * r, cy + Math.sin(a) * r * 0.4)
      }
    }
  }
  // Lotus flowers
  for (let i = 0; i < 5; i++) {
    const x = 6 + Math.floor(rng() * 52)
    const y = 14 + Math.floor(rng() * 40)
    stampFlower(cells, x, y, 2 + Math.floor(rng() * 2))
    // Lotus pads
    if (rng() > 0.4) {
      for (let a = 0; a < Math.PI * 2; a += 0.3) {
        push(cells, x + Math.cos(a) * 5, y + Math.sin(a) * 2)
      }
    }
  }
  return cells
}

function genArtNouveau(rng: () => number): Cell[] {
  const cells: Cell[] = []
  const curves = 2 + Math.floor(rng() * 2)
  for (let c = 0; c < curves; c++) {
    const base = 12 + c * 18 + Math.floor(rng() * 6)
    const amp = 6 + rng() * 8
    const freq = 0.08 + rng() * 0.1
    const phase = rng() * Math.PI * 2
    for (let x = 0; x < GRID; x++) {
      const y = base + Math.sin(x * freq + phase) * amp
      push(cells, x, y)
      push(cells, x, y + 1)
    }
    // Flowers at apex points
    for (let x = 4; x < GRID; x += 10) {
      const y = base + Math.sin(x * freq + phase) * amp
      if (rng() > 0.4) stampFlower(cells, x, Math.round(y), 2)
    }
  }
  // Flourish spirals in corners
  const corners: Array<[number, number]> = [[8, 8], [56, 8], [8, 56], [56, 56]]
  for (const [cx, cy] of corners) {
    if (rng() > 0.5) continue
    for (let t = 0; t < 6; t += 0.2) {
      const r = t * 0.8
      push(cells, cx + Math.cos(t) * r, cy + Math.sin(t) * r)
    }
  }
  return cells
}

function genStarryFloral(rng: () => number): Cell[] {
  const cells: Cell[] = []
  // Stars
  const stars = 25 + Math.floor(rng() * 15)
  for (let i = 0; i < stars; i++) {
    const x = Math.floor(rng() * GRID)
    const y = Math.floor(rng() * 35)
    push(cells, x, y)
    if (rng() > 0.7) {
      push(cells, x - 1, y); push(cells, x + 1, y)
      push(cells, x, y - 1); push(cells, x, y + 1)
    }
  }
  // Crescent moon
  const mx = 48 + Math.floor(rng() * 8), my = 6 + Math.floor(rng() * 6)
  for (let a = -1; a <= 1; a += 0.3) {
    push(cells, mx + Math.cos(a) * 3, my + Math.sin(a) * 3)
    push(cells, mx + Math.cos(a) * 4, my + Math.sin(a) * 4)
  }
  // Night-blooming flowers at bottom
  for (let i = 0; i < 4; i++) {
    const x = 6 + Math.floor(rng() * 52)
    const y = 42 + Math.floor(rng() * 18)
    stampFlower(cells, x, y, 2 + Math.floor(rng() * 2))
  }
  return cells
}

function genTulipRows(rng: () => number): Cell[] {
  const cells: Cell[] = []
  const rows = 2 + Math.floor(rng() * 2)
  for (let r = 0; r < rows; r++) {
    const y = 20 + r * 18 + Math.floor(rng() * 4)
    const n = 5 + Math.floor(rng() * 3)
    for (let i = 0; i < n; i++) {
      const x = 6 + Math.floor(i * (52 / n)) + Math.floor(rng() * 3)
      // Stem
      for (let h = 0; h < 6; h++) push(cells, x, y + h)
      stampTulip(cells, x, y - 1)
      if (rng() > 0.5) stampLeaf(cells, x, y + 3, rng() > 0.5 ? 1 : -1)
    }
  }
  return cells
}

function genBaroqueSwirls(rng: () => number): Cell[] {
  const cells: Cell[] = []
  const swirlCount = 3 + Math.floor(rng() * 3)
  for (let i = 0; i < swirlCount; i++) {
    const cx = 8 + Math.floor(rng() * 48)
    const cy = 8 + Math.floor(rng() * 48)
    const dir = rng() > 0.5 ? 1 : -1
    const phase = rng() * Math.PI * 2
    for (let t = 0; t < 8; t += 0.15) {
      const r = t * 1.1
      const a = t * dir + phase
      push(cells, cx + Math.cos(a) * r, cy + Math.sin(a) * r)
    }
    // Flower at center
    stampFlower(cells, cx, cy, 1)
  }
  // Ornamental border dots
  for (let x = 0; x < GRID; x += 4) {
    push(cells, x, 0); push(cells, x, GRID - 1)
  }
  for (let y = 0; y < GRID; y += 4) {
    push(cells, 0, y); push(cells, GRID - 1, y)
  }
  return cells
}

const THEME_GEN: Record<BgTheme, (rng: () => number) => Cell[]> = {
  'floral-garden': genFloralGarden,
  'cherry-blossom': genCherryBlossom,
  'rose-mandala': genRoseMandala,
  'vine-lattice': genVineLattice,
  'daisy-field': genDaisyField,
  'lotus-pond': genLotusPond,
  'art-nouveau': genArtNouveau,
  'starry-floral': genStarryFloral,
  'tulip-rows': genTulipRows,
  'baroque-swirls': genBaroqueSwirls,
}

function generateRandomBg(): { theme: BgTheme; cells: Cell[] } {
  const theme = ALL_THEMES[Math.floor(Math.random() * ALL_THEMES.length)]
  const seed = Math.floor(Math.random() * 1_000_000) + 1
  const cells = THEME_GEN[theme](makeRng(seed))
  return { theme, cells }
}

function drawBgCells(ctx: CanvasRenderingContext2D, cells: Cell[], fg: string) {
  ctx.globalAlpha = 0.15
  for (const [x, y] of cells) drawCell(ctx, x, y, fg)
  ctx.globalAlpha = 1.0
}

// ---------------------------------------------------------------------------
// Game 1 — Micro Tetris
// ---------------------------------------------------------------------------

const TETRO_SHAPES = [
  [[1, 1, 1, 1]],                        // I
  [[1, 1], [1, 1]],                       // O
  [[0, 1, 0], [1, 1, 1]],                // T
  [[1, 0], [1, 0], [1, 1]],              // L
  [[0, 1], [0, 1], [1, 1]],              // J
  [[0, 1, 1], [1, 1, 0]],                // S
  [[1, 1, 0], [0, 1, 1]],                // Z
]

type TetrisState = {
  board: number[][]
  piece: number[][]
  px: number
  py: number
  score: number
  over: boolean
}

function initTetris(): TetrisState {
  const board = Array.from({ length: GRID }, () => Array(GRID).fill(0))
  const piece = TETRO_SHAPES[Math.floor(Math.random() * TETRO_SHAPES.length)]
  return { board, piece, px: Math.floor((GRID - piece[0].length) / 2), py: 0, score: 0, over: false }
}

function rotatePiece(p: number[][]): number[][] {
  const rows = p.length, cols = p[0].length
  const r: number[][] = Array.from({ length: cols }, () => Array(rows).fill(0))
  for (let y = 0; y < rows; y++)
    for (let x = 0; x < cols; x++)
      r[x][rows - 1 - y] = p[y][x]
  return r
}

function collides(board: number[][], piece: number[][], px: number, py: number): boolean {
  for (let y = 0; y < piece.length; y++)
    for (let x = 0; x < piece[y].length; x++)
      if (piece[y][x]) {
        const bx = px + x, by = py + y
        if (bx < 0 || bx >= GRID || by >= GRID) return true
        if (by >= 0 && board[by][bx]) return true
      }
  return false
}

function lockPiece(s: TetrisState): TetrisState {
  const board = s.board.map(r => [...r])
  for (let y = 0; y < s.piece.length; y++)
    for (let x = 0; x < s.piece[y].length; x++)
      if (s.piece[y][x]) {
        const by = s.py + y
        if (by >= 0) board[by][s.px + x] = 1
      }
  // Clear full rows
  let cleared = 0
  for (let y = GRID - 1; y >= 0; y--) {
    if (board[y].every(c => c)) {
      board.splice(y, 1)
      board.unshift(Array(GRID).fill(0))
      cleared++
      y++ // recheck row
    }
  }
  const newPiece = TETRO_SHAPES[Math.floor(Math.random() * TETRO_SHAPES.length)]
  const px = Math.floor((GRID - newPiece[0].length) / 2)
  const over = collides(board, newPiece, px, 0)
  return { board, piece: newPiece, px, py: 0, score: s.score + cleared, over }
}

function tickTetris(s: TetrisState): TetrisState {
  if (s.over) return initTetris()
  if (!collides(s.board, s.piece, s.px, s.py + 1)) {
    return { ...s, py: s.py + 1 }
  }
  return lockPiece(s)
}

function moveTetris(s: TetrisState, dir: 'left' | 'right' | 'rotate' | 'drop'): TetrisState {
  if (s.over) return s
  if (dir === 'left' && !collides(s.board, s.piece, s.px - 1, s.py))
    return { ...s, px: s.px - 1 }
  if (dir === 'right' && !collides(s.board, s.piece, s.px + 1, s.py))
    return { ...s, px: s.px + 1 }
  if (dir === 'rotate') {
    const r = rotatePiece(s.piece)
    if (!collides(s.board, r, s.px, s.py)) return { ...s, piece: r }
  }
  if (dir === 'drop') {
    let ny = s.py
    while (!collides(s.board, s.piece, s.px, ny + 1)) ny++
    return lockPiece({ ...s, py: ny })
  }
  return s
}

function drawTetris(ctx: CanvasRenderingContext2D, s: TetrisState, fg: string) {
  // Board
  for (let y = 0; y < GRID; y++)
    for (let x = 0; x < GRID; x++)
      if (s.board[y][x]) drawCell(ctx, x, y, fg)
  // Active piece
  for (let y = 0; y < s.piece.length; y++)
    for (let x = 0; x < s.piece[y].length; x++)
      if (s.piece[y][x] && s.py + y >= 0)
        drawCell(ctx, s.px + x, s.py + y, fg)
}

// ---------------------------------------------------------------------------
// Game 2 — Pixel Invaders
// ---------------------------------------------------------------------------

type Invader = { x: number; y: number; alive: boolean }
type Bullet = { x: number; y: number }

type InvadersState = {
  player: number
  invaders: Invader[]
  bullets: Bullet[]
  enemyBullets: Bullet[]
  dir: number
  score: number
  over: boolean
  tick: number
}

function initInvaders(): InvadersState {
  const invaders: Invader[] = []
  for (let row = 0; row < 4; row++)
    for (let col = 0; col < 8; col++)
      invaders.push({ x: 6 + col * 7, y: 4 + row * 6, alive: true })
  return { player: Math.floor(GRID / 2), invaders, bullets: [], enemyBullets: [], dir: 1, score: 0, over: false, tick: 0 }
}

function tickInvaders(s: InvadersState): InvadersState {
  if (s.over) return initInvaders()
  let { invaders, bullets, enemyBullets, dir, player, score, tick } = s
  invaders = invaders.map(i => ({ ...i }))
  tick++

  // Move bullets
  bullets = bullets.map(b => ({ ...b, y: b.y - 1 })).filter(b => b.y >= 0)
  enemyBullets = enemyBullets.map(b => ({ ...b, y: b.y + 1 })).filter(b => b.y < GRID)

  // Bullet-invader collision
  bullets = bullets.filter(b => {
    const hit = invaders.find(i => i.alive && Math.abs(i.x - b.x) < 3 && Math.abs(i.y - b.y) < 3)
    if (hit) { hit.alive = false; score++; return false }
    return true
  })

  // Enemy bullet-player collision
  const playerHit = enemyBullets.some(b => Math.abs(b.x - player) < 3 && b.y >= GRID - 3)
  if (playerHit) return { ...s, over: true }

  // Move invaders every 3 ticks
  if (tick % 3 === 0) {
    let shift = false
    for (const i of invaders) {
      if (i.alive && ((i.x + dir > GRID - 2) || (i.x + dir < 1))) { shift = true; break }
    }
    if (shift) {
      dir = -dir
      for (const i of invaders) if (i.alive) i.y += 1
    } else {
      for (const i of invaders) if (i.alive) i.x += dir
    }
  }

  // Enemy shoots randomly
  const alive = invaders.filter(i => i.alive)
  if (alive.length > 0 && tick % 5 === 0) {
    const shooter = alive[Math.floor(Math.random() * alive.length)]
    enemyBullets.push({ x: shooter.x, y: shooter.y + 1 })
  }

  // Invaders reached bottom?
  if (alive.some(i => i.y >= GRID - 5)) return { ...s, over: true }

  // All dead → reset with score kept
  if (alive.length === 0) {
    const fresh = initInvaders()
    return { ...fresh, score }
  }

  return { invaders, bullets, enemyBullets, dir, player, score, over: false, tick }
}

function moveInvaders(s: InvadersState, dir: 'left' | 'right' | 'shoot'): InvadersState {
  if (s.over) return s
  if (dir === 'left') return { ...s, player: Math.max(2, s.player - 3) }
  if (dir === 'right') return { ...s, player: Math.min(GRID - 3, s.player + 3) }
  if (dir === 'shoot') return { ...s, bullets: [...s.bullets, { x: s.player, y: GRID - 5 }] }
  return s
}

function drawInvaders(ctx: CanvasRenderingContext2D, s: InvadersState, fg: string) {
  // Player — wider ship
  for (let dx = -2; dx <= 2; dx++) drawCell(ctx, s.player + dx, GRID - 2, fg)
  drawCell(ctx, s.player, GRID - 3, fg)
  drawCell(ctx, s.player - 1, GRID - 3, fg)
  drawCell(ctx, s.player + 1, GRID - 3, fg)
  drawCell(ctx, s.player, GRID - 4, fg)
  // Invaders — 3×2 sprites
  for (const i of s.invaders)
    if (i.alive) {
      drawCell(ctx, i.x - 1, i.y, fg)
      drawCell(ctx, i.x, i.y, fg)
      drawCell(ctx, i.x + 1, i.y, fg)
      drawCell(ctx, i.x - 1, i.y + 1, fg)
      drawCell(ctx, i.x + 1, i.y + 1, fg)
    }
  // Bullets
  for (const b of s.bullets) {
    drawCell(ctx, b.x, b.y, fg)
    drawCell(ctx, b.x, b.y + 1, fg)
  }
  // Enemy bullets
  for (const b of s.enemyBullets) {
    drawCell(ctx, b.x, b.y, fg)
    drawCell(ctx, b.x, b.y - 1, fg)
  }
}

// ---------------------------------------------------------------------------
// Game 3 — Dot Snake
// ---------------------------------------------------------------------------

type Pos = { x: number; y: number }
type SnakeState = {
  body: Pos[]
  dir: Pos
  food: Pos
  score: number
  over: boolean
}

function randomPos(exclude: Pos[]): Pos {
  let p: Pos
  do {
    p = { x: Math.floor(Math.random() * GRID), y: Math.floor(Math.random() * GRID) }
  } while (exclude.some(e => e.x === p.x && e.y === p.y))
  return p
}

function initSnake(): SnakeState {
  const mid = Math.floor(GRID / 2)
  const body: Pos[] = [{ x: mid, y: mid }, { x: mid - 1, y: mid }, { x: mid - 2, y: mid }]
  return { body, dir: { x: 1, y: 0 }, food: randomPos(body), score: 0, over: false }
}

function tickSnake(s: SnakeState): SnakeState {
  if (s.over) return initSnake()
  const head = { x: (s.body[0].x + s.dir.x + GRID) % GRID, y: (s.body[0].y + s.dir.y + GRID) % GRID }
  // Self collision
  if (s.body.some(p => p.x === head.x && p.y === head.y))
    return { ...s, over: true }
  const ate = head.x === s.food.x && head.y === s.food.y
  const body = [head, ...s.body]
  if (!ate) body.pop()
  const food = ate ? randomPos(body) : s.food
  return { body, dir: s.dir, food, score: s.score + (ate ? 1 : 0), over: false }
}

function moveSnake(s: SnakeState, dir: 'left' | 'right' | 'up' | 'down'): SnakeState {
  if (s.over) return s
  const map: Record<string, Pos> = { left: { x: -1, y: 0 }, right: { x: 1, y: 0 }, up: { x: 0, y: -1 }, down: { x: 0, y: 1 } }
  const d = map[dir]
  // Prevent 180° turns
  if (d.x === -s.dir.x && d.y === -s.dir.y) return s
  return { ...s, dir: d }
}

function drawSnake(ctx: CanvasRenderingContext2D, s: SnakeState, fg: string) {
  for (const p of s.body) drawCell(ctx, p.x, p.y, fg)
  // Food blinks
  if (Date.now() % 600 < 400) drawCell(ctx, s.food.x, s.food.y, fg)
}

// ---------------------------------------------------------------------------
// Game selector (context-based)
// ---------------------------------------------------------------------------

type GameId = 'tetris' | 'invaders' | 'snake'

function pickGame(): GameId {
  const h = new Date().getHours()
  if (h >= 6 && h < 12) return 'tetris'
  if (h >= 12 && h < 18) return 'invaders'
  return 'snake'
}

const GAME_LABELS: Record<GameId, string> = {
  tetris: 'Tetris',
  invaders: 'Invaders',
  snake: 'Snake',
}

// ---------------------------------------------------------------------------
// Widget
// ---------------------------------------------------------------------------

export function MicroGameWidget() {
  const [visible] = React.useState(() => shouldShowRewardWidget('micro_game'))
  const containerRef = React.useRef<HTMLDivElement>(null)
  const canvasRef = React.useRef<HTMLCanvasElement>(null)
  const [gameId, setGameId] = React.useState<GameId>(pickGame)
  const [score, setScore] = React.useState(0)
  const [paused, setPaused] = React.useState(false)

  // Pause game loop when widget is scrolled off-screen — eliminates idle 150ms ticks
  const inViewport = useActiveViewport(containerRef)

  // Game state refs (avoid re-render per tick)
  const tetrisRef = React.useRef<TetrisState>(initTetris())
  const invadersRef = React.useRef<InvadersState>(initInvaders())
  const snakeRef = React.useRef<SnakeState>(initSnake())
  const pausedRef = React.useRef(false)
  pausedRef.current = paused

  // Random themed floral background — regenerated on each game switch
  const bgRef = React.useRef<{ theme: BgTheme; cells: Cell[] }>(generateRandomBg())

  // Reset on game switch
  const switchGame = React.useCallback(() => {
    const games: GameId[] = ['tetris', 'invaders', 'snake']
    const idx = (games.indexOf(gameId) + 1) % games.length
    const next = games[idx]
    tetrisRef.current = initTetris()
    invadersRef.current = initInvaders()
    snakeRef.current = initSnake()
    bgRef.current = generateRandomBg()
    setGameId(next)
    setScore(0)
    playSwitchSound()
    recordSignal('micro_game', 'switch', { game: next, bgTheme: bgRef.current.theme })
  }, [gameId])

  // Main game loop — only runs while widget is in viewport
  React.useEffect(() => {
    if (!inViewport) return
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const iv = setInterval(() => {
      if (pausedRef.current) return
      const { fg, bg } = getMonoColors(canvas)
      clearGrid(ctx, bg, SIZE, SIZE)

      // Random themed floral background layer
      drawBgCells(ctx, bgRef.current.cells, fg)

      if (gameId === 'tetris') {
        const prev = tetrisRef.current
        tetrisRef.current = tickTetris(prev)
        drawTetris(ctx, tetrisRef.current, fg)
        setScore(tetrisRef.current.score)
        if (tetrisRef.current.score > prev.score) playLineClearSound()
        if (tetrisRef.current.over && !prev.over) playGameOverSound()
      } else if (gameId === 'invaders') {
        const prev = invadersRef.current
        invadersRef.current = tickInvaders(prev)
        drawInvaders(ctx, invadersRef.current, fg)
        setScore(invadersRef.current.score)
        if (invadersRef.current.score > prev.score) playEnemyHitSound()
        if (invadersRef.current.over && !prev.over) playGameOverSound()
      } else {
        const prev = snakeRef.current
        snakeRef.current = tickSnake(prev)
        drawSnake(ctx, snakeRef.current, fg)
        setScore(snakeRef.current.score)
        if (snakeRef.current.score > prev.score) playScoreSound()
        if (snakeRef.current.over && !prev.over) playGameOverSound()
      }
    }, TICK_MS)

    return () => clearInterval(iv)
  }, [gameId, inViewport])

  // Keyboard controls
  React.useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      // Only handle when widget area is likely in view
      if (e.metaKey || e.ctrlKey || e.altKey) return

      if (gameId === 'tetris') {
        if (e.key === 'ArrowLeft') { tetrisRef.current = moveTetris(tetrisRef.current, 'left'); playMoveSound() }
        else if (e.key === 'ArrowRight') { tetrisRef.current = moveTetris(tetrisRef.current, 'right'); playMoveSound() }
        else if (e.key === 'ArrowUp') { tetrisRef.current = moveTetris(tetrisRef.current, 'rotate'); playRotateSound() }
        else if (e.key === 'ArrowDown') { tetrisRef.current = moveTetris(tetrisRef.current, 'drop'); playDropSound() }
      } else if (gameId === 'invaders') {
        if (e.key === 'ArrowLeft') { invadersRef.current = moveInvaders(invadersRef.current, 'left'); playMoveSound() }
        else if (e.key === 'ArrowRight') { invadersRef.current = moveInvaders(invadersRef.current, 'right'); playMoveSound() }
        else if (e.key === ' ' || e.key === 'ArrowUp') { invadersRef.current = moveInvaders(invadersRef.current, 'shoot'); playShootSound() }
      } else {
        if (e.key === 'ArrowLeft') { snakeRef.current = moveSnake(snakeRef.current, 'left'); playMoveSound() }
        else if (e.key === 'ArrowRight') { snakeRef.current = moveSnake(snakeRef.current, 'right'); playMoveSound() }
        else if (e.key === 'ArrowUp') { snakeRef.current = moveSnake(snakeRef.current, 'up'); playMoveSound() }
        else if (e.key === 'ArrowDown') { snakeRef.current = moveSnake(snakeRef.current, 'down'); playMoveSound() }
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [gameId])

  // Touch controls for mobile
  const touchRef = React.useRef<{ x: number; y: number } | null>(null)

  const onTouchStart = (e: React.TouchEvent) => {
    const t = e.touches[0]
    touchRef.current = { x: t.clientX, y: t.clientY }
  }

  const onTouchEnd = (e: React.TouchEvent) => {
    if (!touchRef.current) return
    const t = e.changedTouches[0]
    const dx = t.clientX - touchRef.current.x
    const dy = t.clientY - touchRef.current.y
    touchRef.current = null

    const absDx = Math.abs(dx)
    const absDy = Math.abs(dy)
    if (absDx < 8 && absDy < 8) {
      // Tap → action (rotate / shoot)
      if (gameId === 'tetris') { tetrisRef.current = moveTetris(tetrisRef.current, 'rotate'); playRotateSound() }
      else if (gameId === 'invaders') { invadersRef.current = moveInvaders(invadersRef.current, 'shoot'); playShootSound() }
      return
    }

    if (absDx > absDy) {
      const dir = dx > 0 ? 'right' : 'left'
      if (gameId === 'tetris') tetrisRef.current = moveTetris(tetrisRef.current, dir)
      else if (gameId === 'invaders') invadersRef.current = moveInvaders(invadersRef.current, dir)
      else snakeRef.current = moveSnake(snakeRef.current, dir)
      playMoveSound()
    } else {
      const dir = dy > 0 ? 'down' : 'up'
      if (gameId === 'tetris') { tetrisRef.current = moveTetris(tetrisRef.current, dir === 'down' ? 'drop' : 'rotate'); dir === 'down' ? playDropSound() : playRotateSound() }
      else if (gameId === 'invaders') { invadersRef.current = moveInvaders(invadersRef.current, 'shoot'); playShootSound() }
      else { snakeRef.current = moveSnake(snakeRef.current, dir); playMoveSound() }
    }
  }

  // Controller action handlers
  const handleLeft = () => {
    if (gameId === 'tetris') tetrisRef.current = moveTetris(tetrisRef.current, 'left')
    else if (gameId === 'invaders') invadersRef.current = moveInvaders(invadersRef.current, 'left')
    else snakeRef.current = moveSnake(snakeRef.current, 'left')
    playMoveSound()
  }
  const handleRight = () => {
    if (gameId === 'tetris') tetrisRef.current = moveTetris(tetrisRef.current, 'right')
    else if (gameId === 'invaders') invadersRef.current = moveInvaders(invadersRef.current, 'right')
    else snakeRef.current = moveSnake(snakeRef.current, 'right')
    playMoveSound()
  }
  const handleUp = () => {
    if (gameId === 'tetris') { tetrisRef.current = moveTetris(tetrisRef.current, 'rotate'); playRotateSound() }
    else if (gameId === 'invaders') { invadersRef.current = moveInvaders(invadersRef.current, 'shoot'); playShootSound() }
    else { snakeRef.current = moveSnake(snakeRef.current, 'up'); playMoveSound() }
  }
  const handleDown = () => {
    if (gameId === 'tetris') { tetrisRef.current = moveTetris(tetrisRef.current, 'drop'); playDropSound() }
    else if (gameId === 'invaders') { invadersRef.current = moveInvaders(invadersRef.current, 'shoot'); playShootSound() }
    else { snakeRef.current = moveSnake(snakeRef.current, 'down'); playMoveSound() }
  }

  if (!visible) return null

  return (
    <Block label="Micro Game:" blockView onLabelClick={switchGame}>
      <div ref={containerRef} className="max-w-[200px]">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <button
            className="cursor-pointer select-none opacity-50 hover:opacity-100 transition-opacity"
            onClick={switchGame}
          >
            {GAME_LABELS[gameId]}
          </button>
          <span className="tabular-nums opacity-40">{score}</span>
        </div>

        {/* Micro-screen */}
        <div
          className={cn(
            'border border-acc inline-flex items-center justify-center',
            'rounded bg-transparent'
          )}
          style={{ width: CSS_SIZE, height: CSS_SIZE, imageRendering: 'pixelated' }}
          onTouchStart={onTouchStart}
          onTouchEnd={onTouchEnd}
        >
          <canvas
            ref={canvasRef}
            width={SIZE}
            height={SIZE}
            className="text-acc"
            style={{
              width: CSS_SIZE - 2,
              height: CSS_SIZE - 2,
              imageRendering: 'pixelated',
            }}
          />
        </div>

        {/* Controller buttons */}
        <div className="mt-8 flex flex-col gap-6">
          {/* D-pad + Action */}
          <div className="flex items-center justify-between">
            {/* D-pad cross */}
            <div className="grid grid-cols-3 gap-1" style={{ width: 'fit-content' }}>
              <div />
              <Button onClick={handleUp}>{'\u2191'}</Button>
              <div />
              <Button onClick={handleLeft}>{'\u2190'}</Button>
              <div />
              <Button onClick={handleRight}>{'\u2192'}</Button>
              <div />
              <Button onClick={handleDown}>{'\u2193'}</Button>
              <div />
            </div>

            {/* Action button */}
            <Button onClick={gameId === 'tetris' ? handleUp : gameId === 'invaders' ? handleDown : handleUp}>
              {gameId === 'tetris' ? '(*)' : gameId === 'invaders' ? '(o)' : '(*)'}
            </Button>
          </div>

          {/* Utility buttons */}
          <div className="flex items-center justify-end gap-2">
            <Button size="small" onClick={switchGame}>
              {'<->'}
            </Button>
            <Button size="small" onClick={() => setPaused(p => !p)}>
              {paused ? '|>' : '||'}
            </Button>
          </div>
        </div>
      </div>
    </Block>
  )
}
