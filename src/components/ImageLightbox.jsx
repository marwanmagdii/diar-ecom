import React, { useEffect } from 'react';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';

export default function ImageLightbox({ images, currentIndex, onClose, onNavigate }) {
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowLeft' && onNavigate) onNavigate('prev');
      if (e.key === 'ArrowRight' && onNavigate) onNavigate('next');
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose, onNavigate]);

  if (!images || images.length === 0 || currentIndex === null) return null;

  const currentImage = images[currentIndex];

  return (
    <div 
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.9)',
        zIndex: 99999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backdropFilter: 'blur(5px)'
      }}
      onClick={onClose}
    >
      <button 
        onClick={onClose}
        style={{
          position: 'absolute',
          top: '24px',
          right: '24px',
          background: 'rgba(255, 255, 255, 0.1)',
          border: 'none',
          color: 'white',
          padding: '12px',
          borderRadius: '50%',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transition: 'all 0.2s',
          zIndex: 2
        }}
        onMouseOver={e => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.2)'}
        onMouseOut={e => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)'}
      >
        <X size={24} />
      </button>

      {onNavigate && images.length > 1 && (
        <button 
          onClick={(e) => { e.stopPropagation(); onNavigate('prev'); }}
          style={{
            position: 'absolute',
            left: '24px',
            background: 'rgba(255, 255, 255, 0.1)',
            border: 'none',
            color: 'white',
            padding: '16px',
            borderRadius: '50%',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'all 0.2s',
            zIndex: 2
          }}
          onMouseOver={e => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.2)'}
          onMouseOut={e => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)'}
        >
          <ChevronLeft size={32} />
        </button>
      )}

      <img 
        src={currentImage} 
        alt="Preview" 
        style={{
          maxWidth: '90%',
          maxHeight: '90%',
          objectFit: 'contain',
          borderRadius: '8px',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)'
        }}
        onClick={(e) => e.stopPropagation()}
      />

      {onNavigate && images.length > 1 && (
        <button 
          onClick={(e) => { e.stopPropagation(); onNavigate('next'); }}
          style={{
            position: 'absolute',
            right: '24px',
            background: 'rgba(255, 255, 255, 0.1)',
            border: 'none',
            color: 'white',
            padding: '16px',
            borderRadius: '50%',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'all 0.2s',
            zIndex: 2
          }}
          onMouseOver={e => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.2)'}
          onMouseOut={e => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)'}
        >
          <ChevronRight size={32} />
        </button>
      )}
      
      {images.length > 1 && (
        <div style={{ position: 'absolute', bottom: '24px', color: 'white', fontSize: '16px', fontWeight: 500, background: 'rgba(0,0,0,0.5)', padding: '8px 16px', borderRadius: '24px' }}>
          {currentIndex + 1} / {images.length}
        </div>
      )}
    </div>
  );
}
