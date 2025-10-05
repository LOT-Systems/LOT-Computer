import * as React from 'react'

export function useMirror(
  mirrorRef: React.RefObject<HTMLVideoElement>,
  enabled: boolean
) {
  React.useEffect(() => {
    let stream: MediaStream | null = null

    const enableCamera = async () => {
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'user' },
        })
        if (mirrorRef.current) {
          mirrorRef.current.srcObject = stream
          await mirrorRef.current.play()
        }
      } catch (err) {
        console.error('Error accessing the camera:', err)
      }
    }

    const disableCamera = () => {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop())
        if (mirrorRef.current) {
          mirrorRef.current.srcObject = null
        }
      }
    }

    if (enabled) {
      enableCamera()
    } else {
      disableCamera()
    }

    // Cleanup function
    return () => {
      disableCamera()
    }
  }, [enabled, mirrorRef])
}
