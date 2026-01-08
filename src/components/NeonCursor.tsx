import { useEffect, useMemo, useRef, useState } from 'react'

function isLikelyTouchDevice() {
  if (typeof window === 'undefined') return true
  // Coarse pointer / no hover usually means touch.
  return (
    window.matchMedia?.('(pointer: coarse)')?.matches ||
    window.matchMedia?.('(hover: none)')?.matches
  )
}

function isInteractiveTarget(target: EventTarget | null): boolean {
  const el = target as HTMLElement | null
  if (!el) return false
  return Boolean(
    el.closest(
      'a,button,[role="button"],input,select,textarea,label,summary,[data-cursor="pointer"]',
    ),
  )
}

export function NeonCursor() {
  const enabled = useMemo(() => !isLikelyTouchDevice(), [])
  const rafRef = useRef<number | null>(null)
  const posRef = useRef({ x: 0, y: 0 })
  const lastRef = useRef({ x: 0, y: 0 })
  const dotRef = useRef<HTMLDivElement>(null)
  const ringRef = useRef<HTMLDivElement>(null)

  const [isDown, setIsDown] = useState(false)
  const [isPointer, setIsPointer] = useState(false)
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    if (!enabled) return

    document.documentElement.classList.add('neon-cursor-on')

    const tick = () => {
      // Smooth the ring; dot sticks closer.
      const dx = posRef.current.x - lastRef.current.x
      const dy = posRef.current.y - lastRef.current.y
      lastRef.current.x += dx * 0.18
      lastRef.current.y += dy * 0.18

      const dot = dotRef.current
      const ring = ringRef.current
      if (dot) {
        dot.style.transform = `translate3d(${posRef.current.x}px, ${posRef.current.y}px, 0)`
      }
      if (ring) {
        ring.style.transform = `translate3d(${lastRef.current.x}px, ${lastRef.current.y}px, 0)`
      }
      rafRef.current = window.requestAnimationFrame(tick)
    }

    const onMove = (e: MouseEvent) => {
      posRef.current.x = e.clientX
      posRef.current.y = e.clientY
      if (!isVisible) setIsVisible(true)
      if (!isPointer) setIsPointer(isInteractiveTarget(e.target))
    }

    const onOver = (e: MouseEvent) => {
      setIsPointer(isInteractiveTarget(e.target))
    }

    const onDown = () => setIsDown(true)
    const onUp = () => setIsDown(false)
    const onLeave = () => setIsVisible(false)

    window.addEventListener('mousemove', onMove, { passive: true })
    window.addEventListener('mouseover', onOver, { passive: true })
    window.addEventListener('mousedown', onDown)
    window.addEventListener('mouseup', onUp)
    window.addEventListener('mouseleave', onLeave)

    rafRef.current = window.requestAnimationFrame(tick)

    return () => {
      document.documentElement.classList.remove('neon-cursor-on')
      window.removeEventListener('mousemove', onMove)
      window.removeEventListener('mouseover', onOver)
      window.removeEventListener('mousedown', onDown)
      window.removeEventListener('mouseup', onUp)
      window.removeEventListener('mouseleave', onLeave)
      if (rafRef.current) window.cancelAnimationFrame(rafRef.current)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabled, isPointer, isVisible])

  if (!enabled) return null

  return (
    <>
      <div
        ref={ringRef}
        className={[
          'neon-cursor-ring',
          isVisible ? 'is-visible' : '',
          isPointer ? 'is-pointer' : '',
          isDown ? 'is-down' : '',
        ].join(' ')}
        aria-hidden="true"
      />
      <div
        ref={dotRef}
        className={[
          'neon-cursor-dot',
          isVisible ? 'is-visible' : '',
          isPointer ? 'is-pointer' : '',
          isDown ? 'is-down' : '',
        ].join(' ')}
        aria-hidden="true"
      />
    </>
  )
}

