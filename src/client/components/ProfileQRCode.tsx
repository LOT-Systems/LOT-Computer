/**
 * LOT SYSTEMS CORPORATION
 * Vadim Marmeladov — CEO, Owner LOT®
 * Kuzya Cosmo Marmeladov — CEO, Owner COSMO®
 * LOT® Founded 7 April 2016 | COSMO® Founded 1 July 2024
 * Made in the USA | brand.lot-systems.com
 */

import * as React from 'react'
import QRCode from 'qrcode'

type ProfileQRCodeProps = {
  url: string
  fgColor: string
  bgColor: string
  size?: number
}

export const ProfileQRCode: React.FC<ProfileQRCodeProps> = ({
  url,
  fgColor,
  bgColor,
  size = 80,
}) => {
  const canvasRef = React.useRef<HTMLCanvasElement>(null)

  React.useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const dpr = window.devicePixelRatio || 1
    const renderSize = Math.round(size * dpr)

    QRCode.toCanvas(canvas, url, {
      width: renderSize,
      margin: 1,
      color: {
        dark: fgColor,
        light: bgColor,
      },
      errorCorrectionLevel: 'M',
    }).then(() => {
      canvas.style.width = `${size}px`
      canvas.style.height = `${size}px`
    }).catch((err: Error) => {
      console.warn('[ProfileQRCode] Generation failed:', err)
    })
  }, [url, fgColor, bgColor, size])

  return (
    <canvas
      ref={canvasRef}
      style={{
        width: size,
        height: size,
        imageRendering: 'pixelated',
      }}
    />
  )
}
