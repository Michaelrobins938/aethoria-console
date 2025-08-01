import React, { useRef, useEffect, useState, useCallback } from 'react'

interface VirtualScrollProps {
  items: any[]
  itemHeight: number
  containerHeight: number
  renderItem: (item: any, index: number) => React.ReactNode
  overscan?: number
}

export function VirtualScroll({ 
  items, 
  itemHeight, 
  containerHeight, 
  renderItem, 
  overscan = 5 
}: VirtualScrollProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [scrollTop, setScrollTop] = useState(0)
  const [containerWidth, setContainerWidth] = useState(0)

  // Calculate visible range
  const startIndex = Math.max(0, Math.floor(scrollTop / itemHeight) - overscan)
  const endIndex = Math.min(
    items.length - 1,
    Math.floor((scrollTop + containerHeight) / itemHeight) + overscan
  )

  // Get visible items
  const visibleItems = items.slice(startIndex, endIndex + 1)

  // Calculate total height and offset
  const totalHeight = items.length * itemHeight
  const offsetY = startIndex * itemHeight

  const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    setScrollTop(e.currentTarget.scrollTop)
  }, [])

  // Update container width on resize
  useEffect(() => {
    const updateWidth = () => {
      if (containerRef.current) {
        setContainerWidth(containerRef.current.clientWidth)
      }
    }

    updateWidth()
    window.addEventListener('resize', updateWidth)
    return () => window.removeEventListener('resize', updateWidth)
  }, [])

  return (
    <div
      ref={containerRef}
      style={{ height: containerHeight, overflow: 'auto' }}
      onScroll={handleScroll}
      className="virtual-scroll-container"
    >
      <div style={{ height: totalHeight, position: 'relative' }}>
        <div
          style={{
            position: 'absolute',
            top: offsetY,
            left: 0,
            right: 0,
            width: containerWidth
          }}
        >
          {visibleItems.map((item, index) => (
            <div key={startIndex + index} style={{ height: itemHeight }}>
              {renderItem(item, startIndex + index)}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// Optimized message list component
interface MessageListProps {
  messages: any[]
  containerHeight: number
  renderMessage: (message: any, index: number) => React.ReactNode
}

export function MessageList({ messages, containerHeight, renderMessage }: MessageListProps) {
  const ITEM_HEIGHT = 80 // Estimated height per message

  return (
    <VirtualScroll
      items={messages}
      itemHeight={ITEM_HEIGHT}
      containerHeight={containerHeight}
      renderItem={renderMessage}
      overscan={3}
    />
  )
} 