import React, { useEffect, useState } from 'react';
import { X } from 'lucide-react';
import './bottom-sheet.css';

export default function BottomSheet({ isOpen, onClose, title, children }) {
  const [isRendered, setIsRendered] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setIsRendered(true);
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
      const timer = setTimeout(() => setIsRendered(false), 300); // match transition duration
      return () => clearTimeout(timer);
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  if (!isRendered) return null;

  return (
    <div className={`bottom-sheet-overlay ${isOpen ? 'open' : ''}`} onClick={onClose}>
      <div 
        className={`bottom-sheet-content ${isOpen ? 'open' : ''}`} 
        onClick={(e) => e.stopPropagation()}
      >
        <div className="bottom-sheet-header">
          <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 600 }}>{title}</h3>
          <button className="icon-btn" onClick={onClose} style={{ border: 'none', background: 'none', cursor: 'pointer', padding: '4px' }}>
            <X size={24} color="#64748b" />
          </button>
        </div>
        <div className="bottom-sheet-body">
          {children}
        </div>
      </div>
    </div>
  );
}
