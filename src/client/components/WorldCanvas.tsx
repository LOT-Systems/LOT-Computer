import * as React from 'react'
import { WorldElement } from '#shared/types'

interface WorldCanvasProps {
  elements: WorldElement[]
  canGenerateToday: boolean
  generationMessage?: string
}

export const WorldCanvas: React.FC<WorldCanvasProps> = ({
  elements,
  canGenerateToday,
  generationMessage
}) => {
  const [rotation, setRotation] = React.useState(0)
  const [isRotating, setIsRotating] = React.useState(true)

  // Auto-rotate the world
  React.useEffect(() => {
    if (!isRotating) return

    const interval = setInterval(() => {
      setRotation(prev => (prev + 0.5) % 360)
    }, 50) // 50ms = smooth rotation

    return () => clearInterval(interval)
  }, [isRotating])

  return (
    <div className="relative w-full h-96 bg-gradient-to-b from-sky-100 to-green-50 dark:from-gray-800 dark:to-gray-900 rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700">
      {/* World Title */}
      <div className="absolute top-4 left-4 z-10">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">
          Your Personal World
        </h3>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          {elements.length} element{elements.length !== 1 ? 's' : ''} generated
        </p>
      </div>

      {/* Controls */}
      <div className="absolute top-4 right-4 z-10">
        <button
          onClick={() => setIsRotating(!isRotating)}
          className="px-3 py-1 text-sm bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
        >
          {isRotating ? '⏸ Pause' : '▶ Rotate'}
        </button>
      </div>

      {/* Generation Message */}
      {generationMessage && (
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 z-10 bg-white dark:bg-gray-800 px-4 py-2 rounded-full border border-gray-300 dark:border-gray-600 shadow-lg">
          <p className="text-sm text-gray-700 dark:text-gray-300">{generationMessage}</p>
        </div>
      )}

      {/* 3D World Scene */}
      <div
        className="absolute inset-0 flex items-center justify-center"
        style={{ perspective: '1000px' }}
      >
        <div
          className="relative"
          style={{
            transformStyle: 'preserve-3d',
            transform: `rotateY(${rotation}deg)`,
            width: '400px',
            height: '400px',
          }}
        >
          {/* Ground plane */}
          <div
            className="absolute"
            style={{
              width: '400px',
              height: '400px',
              left: '0',
              top: '200px',
              transform: 'rotateX(90deg)',
              background: 'radial-gradient(circle, rgba(34,197,94,0.2) 0%, rgba(34,197,94,0.05) 100%)',
              borderRadius: '50%',
            }}
          />

          {/* World Elements */}
          {elements.length === 0 ? (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center text-gray-500 dark:text-gray-400 px-4">
                <p className="text-lg mb-2">🌱 Your world is waiting</p>
                <p className="text-sm">Answer your Memory prompts below</p>
                <p className="text-sm">to grow your world each day</p>
              </div>
            </div>
          ) : (
            elements.map((element, index) => (
              <div
                key={element.id}
                className="absolute transition-transform hover:scale-110 cursor-pointer group"
                style={{
                  transform: `
                    translate3d(
                      ${element.position.x * 30}px,
                      ${-element.position.y * 30}px,
                      ${element.position.z * 30}px
                    )
                    rotateY(${element.rotation}deg)
                    scale(${element.scale})
                  `,
                  transformStyle: 'preserve-3d',
                  left: '50%',
                  top: '50%',
                  marginLeft: '-48px',
                  marginTop: '-48px',
                }}
                title={element.context}
              >
                <img
                  src={element.imageUrl}
                  alt={element.type}
                  className="w-24 h-24 object-contain drop-shadow-lg"
                  style={{
                    imageRendering: 'pixelated',
                  }}
                />

                {/* Tooltip on hover */}
                <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap">
                  <div className="bg-black text-white text-xs py-1 px-2 rounded">
                    {element.type}
                  </div>
                </div>

                {/* Shadow */}
                <div
                  className="absolute"
                  style={{
                    width: '40px',
                    height: '20px',
                    left: '50%',
                    top: '100%',
                    transform: 'translateX(-50%) rotateX(90deg) translateZ(-10px)',
                    background: 'radial-gradient(ellipse, rgba(0,0,0,0.3) 0%, rgba(0,0,0,0) 70%)',
                    borderRadius: '50%',
                  }}
                />
              </div>
            ))
          )}
        </div>
      </div>

      {/* Element Info */}
      <div className="absolute bottom-4 left-4 text-xs text-gray-500 dark:text-gray-400">
        {canGenerateToday ? (
          <p>💫 Answer a prompt to grow your world today</p>
        ) : elements.length > 0 ? (
          <p>Next element: {['object', 'creature', 'plant', 'structure', 'weather-effect'][elements.length % 5]} (tomorrow)</p>
        ) : null}
      </div>
    </div>
  )
}
