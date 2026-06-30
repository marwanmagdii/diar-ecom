import React, { useRef, useState, useEffect } from 'react';
import { useStore } from '../store';
import ImageLightbox from './ImageLightbox';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export default function CustomerReviewsMarquee({ reviews = [] }) {
  const { t, language } = useStore();
  const [lightboxData, setLightboxData] = useState({ isOpen: false, images: [], currentIndex: 0 });
  const scrollRef = useRef(null);
  const [isHovering, setIsHovering] = useState(false);
  const animationRef = useRef(null);

  // We duplicate the array to allow for smooth infinite-like scrolling
  // We'll use 4 sets to be absolutely safe on ultra-wide screens
  const displayImages = [...(reviews || []), ...(reviews || []), ...(reviews || []), ...(reviews || [])];
  const isRtl = document.dir === 'rtl' || language === 'ar';

  useEffect(() => {
    if (!reviews || reviews.length === 0) return;
    
    const el = scrollRef.current;
    if (!el) return;

    let speed = 1; // pixels per frame
    
    const scrollLoop = () => {
      if (!isHovering) {
        if (isRtl) {
          // In RTL, scrollLeft is typically 0 at the start (rightmost), and goes negative as you scroll left
          // Or in some browsers it goes from positive to 0. 
          // We will just try to scroll leftwards (which means decreasing scrollLeft visually)
          el.scrollBy({ left: -speed, behavior: 'auto' });
          // If we reached the end (leftmost side), jump back to the right
          if (Math.abs(el.scrollLeft) >= el.scrollWidth / 2) {
            el.scrollLeft = 0;
          }
        } else {
          el.scrollBy({ left: speed, behavior: 'auto' });
          if (el.scrollLeft >= el.scrollWidth / 2) {
            el.scrollLeft = 0;
          }
        }
      }
      animationRef.current = requestAnimationFrame(scrollLoop);
    };

    animationRef.current = requestAnimationFrame(scrollLoop);

    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, [isHovering, isRtl, displayImages.length]);

  const manualScroll = (direction) => {
    if (scrollRef.current) {
      const { clientWidth } = scrollRef.current;
      const scrollAmount = direction === 'left' ? -clientWidth / 2 : clientWidth / 2;
      const finalScrollAmount = isRtl ? -scrollAmount : scrollAmount;
      scrollRef.current.scrollBy({ left: finalScrollAmount, behavior: 'smooth' });
    }
  };

  if (!reviews || reviews.length === 0) return null;

  return (
    <>
      <section style={{ maxWidth: '1200px', margin: '48px auto', padding: '0 16px' }}>
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <h2 style={{ fontSize: '28px', fontWeight: 800, color: 'var(--on-surface)', display: 'inline-flex', alignItems: 'center', gap: '12px' }}>
            ⭐ {t('customerReviews')}
          </h2>
        </div>
        
        <div 
          style={{ position: 'relative', display: 'flex', alignItems: 'center' }}
          onMouseEnter={() => setIsHovering(true)}
          onMouseLeave={() => setIsHovering(false)}
          onTouchStart={() => setIsHovering(true)}
          onTouchEnd={() => setIsHovering(false)}
        >
          
          <button 
            onClick={() => manualScroll('left')}
            style={{
              position: 'absolute',
              left: '-16px',
              zIndex: 2,
              background: 'var(--surface)',
              border: '1px solid var(--outline)',
              borderRadius: '50%',
              width: '40px',
              height: '40px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
              opacity: isHovering ? 1 : 0,
              transition: 'opacity 0.3s ease'
            }}
          >
            <ChevronLeft size={24} />
          </button>

          <div 
            ref={scrollRef}
            style={{ 
              display: 'flex', 
              gap: '16px', 
              overflowX: 'auto', 
              padding: '16px 4px',
              scrollbarWidth: 'none', // Firefox
              msOverflowStyle: 'none'  // IE
            }}
            className="no-scrollbar"
          >
            <style>{`.no-scrollbar::-webkit-scrollbar { display: none; }`}</style>
            {displayImages.map((img, idx) => {
              const originalIndex = idx % reviews.length;
              return (
                <div 
                  key={idx} 
                  style={{ 
                    borderRadius: '16px', 
                    overflow: 'hidden', 
                    flexShrink: 0,
                    width: '280px',
                    height: '280px',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                    cursor: 'zoom-in',
                    transition: 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1), box-shadow 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                    position: 'relative'
                  }}
                  onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-8px)'; e.currentTarget.style.boxShadow = '0 12px 24px rgba(0,0,0,0.15)'; }}
                  onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.08)'; }}
                  onClick={() => setLightboxData({ isOpen: true, images: reviews, currentIndex: originalIndex })}
                >
                  <img src={img} alt={`Customer review ${idx + 1}`} style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.5s ease' }} onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.05)'} onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'} />
                </div>
              );
            })}
          </div>

          <button 
            onClick={() => manualScroll('right')}
            style={{
              position: 'absolute',
              right: '-16px',
              zIndex: 2,
              background: 'var(--surface)',
              border: '1px solid var(--outline)',
              borderRadius: '50%',
              width: '40px',
              height: '40px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
              opacity: isHovering ? 1 : 0,
              transition: 'opacity 0.3s ease'
            }}
          >
            <ChevronRight size={24} />
          </button>

        </div>
      </section>

      {lightboxData.isOpen && (
        <ImageLightbox 
          images={lightboxData.images}
          currentIndex={lightboxData.currentIndex}
          onClose={() => setLightboxData({ ...lightboxData, isOpen: false })}
          onNavigate={(newIndex) => setLightboxData(prev => ({ ...prev, currentIndex: newIndex }))}
        />
      )}
    </>
  );
}
