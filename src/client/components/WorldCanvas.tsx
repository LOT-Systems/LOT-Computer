import * as React from 'react'
import { WorldElement } from '#shared/types'

interface WorldCanvasProps {
  elements: WorldElement[]
}

export const WorldCanvas: React.FC<WorldCanvasProps> = ({ elements }) => {
  // Rotation disabled to reduce CPU usage
  const rotation = 0

  // Auto-rotate the world slowly - DISABLED to save costs
  // React.useEffect(() => {
  //   const interval = setInterval(() => {
  //     setRotation(prev => (prev + 0.3) % 360)
  //   }, 50)
  //   return () => clearInterval(interval)
  // }, [])

  if (elements.length === 0) {
    return null
  }

  return (
    <div
      className="fixed inset-0 pointer-events-none"
      style={{ perspective: '1200px', zIndex: -1 }}
    >
      <div
        className="absolute inset-0 flex items-center justify-center"
        style={{
          transformStyle: 'preserve-3d',
          transform: `rotateY(${rotation}deg)`,
        }}
      >
        {elements.map((element) => (
          <div
            key={element.id}
            className="absolute"
            style={{
              transform: `
                translate3d(
                  ${element.position.x * 40}px,
                  ${-element.position.y * 40}px,
                  ${element.position.z * 40}px
                )
                rotateY(${element.rotation}deg)
                scale(${element.scale})
              `,
              transformStyle: 'preserve-3d',
            }}
          >
            <img
              src={element.imageUrl}
              alt={element.type}
              className="w-32 h-32 object-contain"
              style={{ imageRendering: 'auto' }}
            />
          </div>
        ))}
      </div>
    </div>
  )
}
