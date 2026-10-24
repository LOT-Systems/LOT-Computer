/**
 * LOT SYSTEMS CORPORATION
 * Vadim Marmeladov — CEO, Owner LOT®
 * Kuzya Cosmo Marmeladov — CEO, Owner COSMO®
 * LOT® Founded 7 April 2016 | COSMO® Founded 1 July 2024
 * Made in the USA | brand.lot-systems.com
 */

import React from 'react'
import { Block } from '#client/components/ui'
import { useStore } from '@nanostores/react'
import * as stores from '#client/stores'
import { useCosmicUpdate } from '#client/queries'
import { shouldShowRewardWidget } from '#client/stores/rewardWidgets'

/**
 * Cosmic Update Widget — Together AI image generation token
 * Generates a monochrome pixel art reflection of the user on a tiny 64×64 screen.
 * Style alternates between Japanese woodblock and ancient car audio aesthetics.
 * Available to subscribed users (Usership / RnD / Legacy).
 */

const GRID = 64
const CELL = 1
const SIZE = GRID * CELL
const CSS_SIZE = 76

type MonoColor = { fg: string; bg: string }

function getMonoColors(canvas: HTMLCanvasElement): MonoColor {
  const style = getComputedStyle(canvas)
  const fg = style.getPropertyValue('color') || '#000'
  const bg = 'transparent'
  return { fg, bg }
}

/** Pick a poetic pixel art prompt — Japanese or ancient car audio style */
function getPixelPrompt(): string {
  const japanese = [
    '1-bit pixel art portrait, ukiyo-e woodblock style, serene face with closed eyes, flowing hair lines, minimal, 64x64, monochrome, black and white only, no gradients',
    '1-bit pixel art, Japanese ink wash portrait, contemplative figure silhouette, bamboo and moon, zen minimal, 64x64, monochrome, black and white only, no gradients',
    '1-bit pixel art portrait, kabuki mask style face, bold geometric lines, traditional Japanese pattern border, 64x64, monochrome, black and white only, no gradients',
    '1-bit pixel art, sumi-e style portrait, single figure meditating under cherry blossom branch, 64x64, monochrome, black and white only, no gradients',
  ]
  const carAudio = [
    '1-bit pixel art portrait, retro car stereo LCD display aesthetic, geometric face made of equalizer bars, VU meter eyes, 64x64, monochrome, black and white only, no gradients',
    '1-bit pixel art, vintage car dashboard radio display, human silhouette formed from frequency waves and knob dials, 64x64, monochrome, black and white only, no gradients',
    '1-bit pixel art portrait, 1980s boombox LCD screen style, pixelated face with cassette tape hair, antenna crown, 64x64, monochrome, black and white only, no gradients',
    '1-bit pixel art, old car audio system display, figure composed of speaker cones and waveform lines, 64x64, monochrome, black and white only, no gradients',
  ]
  const all = [...japanese, ...carAudio]
  return all[Math.floor(Math.random() * all.length)]
}

/** Convert an image to monochrome on a 64×64 canvas */
function renderMonochrome(
  ctx: CanvasRenderingContext2D,
  img: HTMLImageElement,
  fg: string,
  threshold = 128
) {
  // Draw image scaled to 64×64
  ctx.clearRect(0, 0, SIZE, SIZE)
  ctx.drawImage(img, 0, 0, SIZE, SIZE)

  // Read pixels and threshold to mono
  const imageData = ctx.getImageData(0, 0, SIZE, SIZE)
  const data = imageData.data

  // Determine luminance per pixel
  const mono: boolean[][] = Array.from({ length: GRID }, () => Array(GRID).fill(false))
  for (let y = 0; y < GRID; y++) {
    for (let x = 0; x < GRID; x++) {
      const i = (y * SIZE + x) * 4
      const lum = data[i] * 0.299 + data[i + 1] * 0.587 + data[i + 2] * 0.114
      mono[y][x] = lum < threshold
    }
  }

  // Clear and redraw using theme foreground color
  ctx.clearRect(0, 0, SIZE, SIZE)
  ctx.fillStyle = fg
  for (let y = 0; y < GRID; y++) {
    for (let x = 0; x < GRID; x++) {
      if (mono[y][x]) {
        ctx.fillRect(x * CELL, y * CELL, CELL, CELL)
      }
    }
  }
}

export function CosmicUpdateWidget() {
  const me = useStore(stores.me)
  const canvasRef = React.useRef<HTMLCanvasElement>(null)
  const [loading, setLoading] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)
  const [generated, setGenerated] = React.useState(false)
  const [visible] = React.useState(() => shouldShowRewardWidget('cosmic_update'))

  const cosmicUpdate = useCosmicUpdate()

  const hasAccess = me?.tags?.some(tag => {
    const t = tag.toLowerCase()
    return t === 'usership' || t === 'rnd' || t === 'legacy'
  })

  if (!hasAccess || !visible) return null

  const drawImageToCanvas = (imageUrl: string) => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const { fg } = getMonoColors(canvas)

    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.onload = () => {
      renderMonochrome(ctx, img, fg)
      setGenerated(true)
      setLoading(false)
    }
    img.onerror = () => {
      setError('Transmission interrupted. Try again.')
      setLoading(false)
    }
    img.src = imageUrl
  }

  const handleGenerate = async () => {
    setLoading(true)
    setError(null)
    setGenerated(false)

    // Show a loading pattern on canvas
    const canvas = canvasRef.current
    if (canvas) {
      const ctx = canvas.getContext('2d')
      if (ctx) {
        const { fg } = getMonoColors(canvas)
        ctx.clearRect(0, 0, SIZE, SIZE)
        ctx.fillStyle = fg
        // Scanning line animation hint
        for (let y = 0; y < GRID; y += 4) {
          for (let x = 0; x < GRID; x += 4) {
            if ((x + y) % 8 === 0) {
              ctx.fillRect(x, y, CELL, CELL)
            }
          }
        }
      }
    }

    try {
      cosmicUpdate.mutate(
        { prompt: getPixelPrompt() },
        {
          onSuccess: (data: any) => {
            drawImageToCanvas(data.imageUrl)
          },
          onError: () => {
            setError('Transmission interrupted. Try again.')
            setLoading(false)
          },
        }
      )
    } catch {
      setError('Transmission interrupted. Try again.')
      setLoading(false)
    }
  }

  return (
    <Block label="Cosmic Update:" blockView>
      <div>
        {/* Tiny monochrome screen — same as micro game */}
        <div
          className="mb-8"
          style={{
            width: CSS_SIZE,
            height: CSS_SIZE,
            position: 'relative',
            overflow: 'hidden',
            borderRadius: 2,
          }}
        >
          <canvas
            ref={canvasRef}
            width={SIZE}
            height={SIZE}
            className="text-acc"
            style={{
              width: CSS_SIZE,
              height: CSS_SIZE,
              imageRendering: 'pixelated',
              display: 'block',
            }}
          />
        </div>

        {!generated && !loading && !error && (
          <div>
            <div className="mb-8 opacity-30">
              Pixel reflection — a monochrome transmission.
            </div>
            <div
              className="cursor-pointer opacity-60 hover:opacity-100 transition-opacity"
              onClick={handleGenerate}
            >
              Receive Transmission
            </div>
          </div>
        )}

        {loading && (
          <div className="opacity-30">
            Receiving pixel transmission...
          </div>
        )}

        {error && (
          <div>
            <div className="mb-8 opacity-30">{error}</div>
            <div
              className="cursor-pointer opacity-60 hover:opacity-100 transition-opacity"
              onClick={handleGenerate}
            >
              Retry
            </div>
          </div>
        )}

        {generated && !loading && (
          <div>
            <div className="opacity-30">
              Reflection received.
            </div>
            <div
              className="mt-8 cursor-pointer opacity-60 hover:opacity-100 transition-opacity"
              onClick={handleGenerate}
            >
              New Reflection
            </div>
          </div>
        )}
      </div>
    </Block>
  )
}
