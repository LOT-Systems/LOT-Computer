import Values from 'values.js'

const color = new Values()

export const generatePalette = (hex: string) => {
  try {
    return color
      .setColor(hex)
      .all(20)
      .filter(({ weight }) => weight !== 100)
      .map((x, i) => ({
        index: (i + 1) * 100,
        colorHex: x.hexString(),
        colorRgb: x.rgb,
      }))
  } catch (err) {
    localStorage.removeItem('base_color')
    localStorage.removeItem('accent_color')
    window.location.reload()
    return []
  }
}

export function hexToRgb(hex: string): [number, number, number] | null {
  hex = hex.replace(/^#/, '')
  if (hex.length === 3) {
    hex = hex
      .split('')
      .map((char) => char + char)
      .join('')
  }
  if (hex.length !== 6) {
    console.error('Invalid hex color:', hex)
    return null
  }
  const r = parseInt(hex.slice(0, 2), 16)
  const g = parseInt(hex.slice(2, 4), 16)
  const b = parseInt(hex.slice(4, 6), 16)
  return [r, g, b]
}
