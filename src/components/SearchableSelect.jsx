import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Search } from 'lucide-react';

export default function SearchableSelect({ options, placeholder, value, onChange, disabled }) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const wrapperRef = useRef(null);

  const filteredOptions = options.filter(option => 
    option.label.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const selectedOption = options.find(opt => opt.value === value);

  useEffect(() => {
    function handleClickOutside(event) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="searchable-select-container" ref={wrapperRef} style={{ opacity: disabled ? 0.5 : 1, pointerEvents: disabled ? 'none' : 'auto' }}>
      <div 
        className="searchable-select-input"
        onClick={() => { if (!disabled) setIsOpen(!isOpen); }}
        style={{ cursor: disabled ? 'not-allowed' : 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
      >
        <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', paddingRight: '8px' }}>{selectedOption ? selectedOption.label : placeholder}</span>
        <ChevronDown size={18} color="var(--on-surface-variant)" />
      </div>

      {isOpen && (
        <div className="searchable-select-dropdown">
          <div style={{ padding: '8px', borderBottom: '1px solid var(--outline-variant)', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Search size={16} color="var(--on-surface-variant)" />
            <input 
              type="text" 
              placeholder="Search..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ border: 'none', outline: 'none', width: '100%', fontFamily: 'inherit', fontSize: '14px' }}
              autoFocus
            />
          </div>
          <div style={{ maxHeight: '160px', overflowY: 'auto' }}>
            {filteredOptions.length > 0 ? (
              filteredOptions.map(option => (
                <div 
                  key={option.value}
                  className={`searchable-select-option ${value === option.value ? 'selected' : ''}`}
                  onClick={() => {
                    onChange(option.value);
                    setIsOpen(false);
                    setSearchTerm('');
                  }}
                >
                  {option.label}
                </div>
              ))
            ) : (
              <div style={{ padding: '10px 16px', color: 'var(--on-surface-variant)', fontSize: '14px' }}>
                No results found
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
