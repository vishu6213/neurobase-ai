'use client'

import { Suspense, lazy, useEffect, useRef } from 'react'
const Spline = lazy(() => import('@splinetool/react-spline'))

interface SplineSceneProps {
  scene: string
  className?: string
}

export function SplineScene({ scene, className }: SplineSceneProps) {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    let frameId: number | null = null
    let lastEvent: MouseEvent | null = null

    const dispatchCustomEvents = () => {
      if (!lastEvent || !container) return
      
      const canvas = container.querySelector('canvas')
      if (canvas) {
        // Dispatch mousemove
        const mouseEvent = new MouseEvent('mousemove', {
          bubbles: true,
          cancelable: true,
          clientX: lastEvent.clientX,
          clientY: lastEvent.clientY,
          screenX: lastEvent.screenX,
          screenY: lastEvent.screenY,
        })
        canvas.dispatchEvent(mouseEvent)

        // Dispatch pointermove
        const pointerEvent = new PointerEvent('pointermove', {
          bubbles: true,
          cancelable: true,
          clientX: lastEvent.clientX,
          clientY: lastEvent.clientY,
          screenX: lastEvent.screenX,
          screenY: lastEvent.screenY,
          pointerId: 1,
          isPrimary: true,
        })
        canvas.dispatchEvent(pointerEvent)
      }
      frameId = null
    }

    const handleWindowMouseMove = (e: MouseEvent) => {
      lastEvent = e
      if (frameId === null) {
        frameId = requestAnimationFrame(dispatchCustomEvents)
      }
    }

    window.addEventListener('mousemove', handleWindowMouseMove, { passive: true })
    
    return () => {
      window.removeEventListener('mousemove', handleWindowMouseMove)
      if (frameId !== null) {
        cancelAnimationFrame(frameId)
      }
    }
  }, [])

  return (
    <div ref={containerRef} className={className} style={{ width: '100%', height: '100%' }}>
      <Suspense
        fallback={
          <div className="w-full h-full flex items-center justify-center">
            <span className="loader"></span>
          </div>
        }
      >
        <Spline
          scene={scene}
          className="w-full h-full"
        />
      </Suspense>
    </div>
  )
}