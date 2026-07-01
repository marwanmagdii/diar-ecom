import React, { useState, useEffect, useRef } from 'react';

export default function PullToRefresh({ onRefresh, children }) {
  const [startY, setStartY] = useState(0);
  const [currentY, setCurrentY] = useState(0);
  const [isPulling, setIsPulling] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const containerRef = useRef(null);

  const pullThreshold = 80;

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleTouchStart = (e) => {
      if (window.scrollY === 0) {
        setStartY(e.touches[0].clientY);
        setIsPulling(true);
      }
    };

    const handleTouchMove = (e) => {
      if (!isPulling) return;
      const y = e.touches[0].clientY;
      if (y > startY) {
        setCurrentY(y - startY);
        // Prevent default scrolling when pulling down at the top
        if (e.cancelable) e.preventDefault();
      }
    };

    const handleTouchEnd = async () => {
      if (!isPulling) return;
      setIsPulling(false);
      
      if (currentY > pullThreshold && !isRefreshing) {
        setIsRefreshing(true);
        if (onRefresh) {
          await onRefresh();
        }
        setIsRefreshing(false);
      }
      setCurrentY(0);
    };

    container.addEventListener('touchstart', handleTouchStart, { passive: false });
    container.addEventListener('touchmove', handleTouchMove, { passive: false });
    container.addEventListener('touchend', handleTouchEnd);

    return () => {
      container.removeEventListener('touchstart', handleTouchStart);
      container.removeEventListener('touchmove', handleTouchMove);
      container.removeEventListener('touchend', handleTouchEnd);
    };
  }, [startY, currentY, isPulling, isRefreshing, onRefresh]);

  // Calculate pull resistance for a smoother feel
  const pullDistance = Math.min(currentY * 0.4, pullThreshold + 20);
  const rotation = Math.min(pullDistance * 4, 360);

  return (
    <div ref={containerRef} style={{ position: 'relative', width: '100%', minHeight: '100%' }}>
      <div 
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '60px',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          transform: `translateY(${isRefreshing ? 20 : pullDistance - 60}px)`,
          transition: isPulling ? 'none' : 'transform 0.3s ease-out',
          zIndex: 10,
          opacity: (isPulling || isRefreshing) ? 1 : 0
        }}
      >
        <div 
          style={{ 
            width: '32px', 
            height: '32px', 
            backgroundColor: '#ffffff',
            borderRadius: '50%',
            boxShadow: '0 2px 5px rgba(0,0,0,0.2)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            transform: `rotate(${isRefreshing ? 0 : rotation}deg)`,
            animation: isRefreshing ? 'spin 1s linear infinite' : 'none'
          }}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.59-9.21l5.25 4.29"/>
          </svg>
        </div>
      </div>
      <div 
        style={{ 
          transform: `translateY(${isRefreshing ? 60 : pullDistance}px)`,
          transition: isPulling ? 'none' : 'transform 0.3s ease-out',
        }}
      >
        {children}
      </div>
    </div>
  );
}
