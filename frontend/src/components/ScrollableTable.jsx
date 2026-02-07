import { useRef, useState, useEffect } from 'react'

export default function ScrollableTable({ children, className = '' }) {
  const containerRef = useRef(null)
  const [showRightShadow, setShowRightShadow] = useState(false)
  const [showLeftShadow, setShowLeftShadow] = useState(false)

  const checkScroll = () => {
    const el = containerRef.current
    if (!el) return

    const hasHorizontalScroll = el.scrollWidth > el.clientWidth
    const scrolledFromLeft = el.scrollLeft > 0
    const scrolledToEnd = el.scrollLeft + el.clientWidth >= el.scrollWidth - 1

    setShowLeftShadow(scrolledFromLeft)
    setShowRightShadow(hasHorizontalScroll && !scrolledToEnd)
  }

  useEffect(() => {
    checkScroll()
    window.addEventListener('resize', checkScroll)
    return () => window.removeEventListener('resize', checkScroll)
  }, [])

  return (
    <div className={`relative ${className}`}>
      {showLeftShadow && (
        <div className="absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-white to-transparent pointer-events-none z-10" />
      )}
      {showRightShadow && (
        <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-white to-transparent pointer-events-none z-10" />
      )}
      <div
        ref={containerRef}
        onScroll={checkScroll}
        className="overflow-x-auto"
      >
        {children}
      </div>
    </div>
  )
}
