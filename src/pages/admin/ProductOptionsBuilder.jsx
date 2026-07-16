import React, { useState } from 'react';
import { Plus, Trash2, Image as ImageIcon, ChevronDown, ChevronUp, Search } from 'lucide-react';
import ImageLightbox from '../../components/ImageLightbox';
import { compressImage } from '../../utils/imageCompression';
import { getColorHex } from '../../utils/colors';

export const VariantOptionSelector = ({ variantId, opt, val, onChange }) => {
  const isColor = opt.name.toLowerCase().includes('color') || opt.name.toLowerCase().includes('لون');
  const isWeight = opt.name.toLowerCase().includes('weight') || opt.name.toLowerCase().includes('الوزن');
  const [isOpen, setIsOpen] = React.useState(false);
  const [search, setSearch] = React.useState('');
  
  const dropdownRef = React.useRef(null);
  React.useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (isColor) {
    const filteredValues = opt.values.filter(v => v.toLowerCase().includes(search.toLowerCase()));
    
    return (
      <div style={{ flex: '1 1 200px', position: 'relative' }} ref={dropdownRef}>
        <label className="premium-label">{opt.name}</label>
        <div 
          className="premium-input"
          style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'space-between', minHeight: '42px', backgroundColor: '#fff', border: isOpen ? '1px solid var(--primary)' : '1px solid #e2e8f0', boxShadow: isOpen ? '0 0 0 2px var(--primary-container)' : 'none' }}
          onClick={() => setIsOpen(!isOpen)}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            {val ? (
              <>
                <div style={{ width: '16px', height: '16px', borderRadius: '50%', backgroundColor: getColorHex(val), border: '1px solid #e2e8f0' }} />
                <span>{typeof val === 'string' ? val : (Array.isArray(val) ? val.join(', ') : String(val))}</span>
              </>
            ) : (
              <span style={{ color: '#94a3b8' }}>Select {opt.name}...</span>
            )}
          </div>
          <ChevronDown size={16} color="#64748b" style={{ transform: isOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />
        </div>
        
        {isOpen && (
          <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, zIndex: 50, marginTop: '4px', backgroundColor: '#fff', border: '1px solid #e2e8f0', borderRadius: '8px', boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)', overflow: 'hidden' }}>
            <div style={{ padding: '8px', borderBottom: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Search size={14} color="#94a3b8" />
              <input 
                type="text" 
                placeholder="Search colors..." 
                value={search}
                onChange={e => setSearch(e.target.value)}
                style={{ width: '100%', border: 'none', outline: 'none', fontSize: '13px' }}
                onClick={e => e.stopPropagation()}
              />
            </div>
            <div style={{ maxHeight: '200px', overflowY: 'auto' }}>
              <div 
                style={{ padding: '10px 12px', cursor: 'pointer', fontSize: '13px', color: '#64748b', fontStyle: 'italic' }}
                onClick={() => { onChange(''); setIsOpen(false); }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f8fafc'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
              >
                Clear Selection
              </div>
              {filteredValues.map(v => (
                <div 
                  key={v}
                  style={{ padding: '10px 12px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '10px', fontSize: '14px', backgroundColor: val === v ? '#eff6ff' : 'transparent', fontWeight: val === v ? 600 : 400, color: val === v ? 'var(--primary)' : '#334155' }}
                  onClick={() => { onChange(v); setIsOpen(false); }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = val === v ? '#eff6ff' : '#f8fafc'}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = val === v ? '#eff6ff' : 'transparent'}
                >
                  <div style={{ width: '18px', height: '18px', borderRadius: '50%', backgroundColor: getColorHex(v), border: '1px solid #cbd5e1', boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.05)' }} />
                  {v}
                </div>
              ))}
              {filteredValues.length === 0 && (
                <div style={{ padding: '16px', textAlign: 'center', color: '#94a3b8', fontSize: '13px' }}>
                  No colors found
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    );
  }

  // Weight option: custom text input
  if (isWeight) {
    return (
      <div style={{ flex: '1 1 200px' }}>
        <label className="premium-label">{opt.name}</label>
        <input 
          type="text"
          className="premium-input"
          placeholder="e.g. 100g, 1kg"
          value={val || ''}
          onChange={(e) => onChange(e.target.value)}
        />
      </div>
    );
  }

  // Non-color options: pill selector (Multi-select)
  const selectedValues = val ? val.split(',').map(s => s.trim()).filter(Boolean) : [];
  
  const handlePillClick = (v) => {
    if (selectedValues.includes(v)) {
      const newValues = selectedValues.filter(x => x !== v);
      onChange(newValues.join(', '));
    } else {
      const newValues = [...selectedValues, v];
      onChange(newValues.join(', '));
    }
  };

  return (
    <div style={{ flex: '1 1 200px' }}>
      <label className="premium-label">{opt.name}</label>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
        {opt.values.map(v => {
          const isSelected = selectedValues.includes(v);
          return (
            <div
              key={v}
              onClick={() => handlePillClick(v)}
              style={{
                padding: '6px 12px',
                borderRadius: '6px',
                border: isSelected ? '2px solid var(--primary)' : '1px solid #cbd5e1',
                backgroundColor: isSelected ? 'var(--primary-container)' : '#fff',
                color: isSelected ? 'var(--on-primary-container)' : '#475569',
                fontSize: '13px',
                fontWeight: isSelected ? 600 : 400,
                cursor: 'pointer',
                transition: 'all 0.15s ease',
                userSelect: 'none'
              }}
            >
              {v}
            </div>
          );
        })}
      </div>
    </div>
  );
};


export default function ProductOptionsBuilder({ formData, setFormData, globalOptions }) {
  const variants = formData.variants || [];
  const [draggingVariant, setDraggingVariant] = React.useState(null);
  
  // Drag and Drop Reordering for Variant Images
  const [draggedVariantImage, setDraggedVariantImage] = useState({ variantId: null, index: null });
  const [lightboxData, setLightboxData] = useState({ isOpen: false, images: [], currentIndex: 0 });
  const [isExpanded, setIsExpanded] = useState(false);

  const openLightbox = (images, index) => {
    setLightboxData({ isOpen: true, images, currentIndex: index });
  };

  const handleLightboxNavigate = (dir) => {
    setLightboxData(prev => {
      let newIndex = dir === 'next' ? prev.currentIndex + 1 : prev.currentIndex - 1;
      if (newIndex >= prev.images.length) newIndex = 0;
      if (newIndex < 0) newIndex = prev.images.length - 1;
      return { ...prev, currentIndex: newIndex };
    });
  };

  const handleVariantImageDragStart = (e, variantId, index) => {
    setDraggedVariantImage({ variantId, index });
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', `${variantId}-${index}`);
  };

  const handleVariantImageDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleVariantImageDropReorder = (e, targetVariantId, targetIndex) => {
    e.preventDefault();
    if (draggedVariantImage.variantId !== targetVariantId) return; // don't drag across variants
    if (draggedVariantImage.index === targetIndex) return;

    setFormData(prev => ({
      ...prev,
      variants: prev.variants.map(v => {
        if (v.id !== targetVariantId) return v;
        const newImages = [...(v.images || [])];
        const draggedItem = newImages[draggedVariantImage.index];
        newImages.splice(draggedVariantImage.index, 1);
        newImages.splice(targetIndex, 0, draggedItem);
        return { ...v, images: newImages, image: newImages[0] };
      })
    }));
    setDraggedVariantImage({ variantId: null, index: null });
  };

  const handleAddVariant = () => {
    const newVariant = {
      id: Date.now().toString(),
      attributes: {},
      price: '',
      stock: '',
      image: '',
      images: [],
      sku: ''
    };
    setFormData(prev => ({
      ...prev,
      variants: [...(prev.variants || []), newVariant]
    }));
  };

  const handleUpdateVariant = (variantId, field, value) => {
    setFormData(prev => ({
      ...prev,
      variants: prev.variants.map(v => v.id === variantId ? { ...v, [field]: value } : v)
    }));
  };

  const handleUpdateVariantAttribute = (variantId, attributeName, value) => {
    setFormData(prev => ({
      ...prev,
      variants: prev.variants.map(v => {
        if (v.id !== variantId) return v;
        const newAttributes = { ...(v.attributes || {}) };
        if (value === "") {
          delete newAttributes[attributeName];
        } else {
          newAttributes[attributeName] = value;
        }
        return { ...v, attributes: newAttributes };
      })
    }));
  };

  const handleRemoveVariant = (variantId) => {
    setFormData(prev => ({
      ...prev,
      variants: prev.variants.filter(v => v.id !== variantId)
    }));
  };

  const handleVariantImageUpload = async (variantId, e) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    for (const file of files) {
      try {
        const compressedBase64 = await compressImage(file);
        setFormData(prev => ({
          ...prev,
          variants: prev.variants.map(v => {
            if (v.id !== variantId) return v;
            const newImages = [...(v.images || []), compressedBase64];
            return { ...v, images: newImages, image: newImages[0] };
          })
        }));
      } catch (err) {
        console.error('Error compressing variant image:', err);
      }
    }
  };

  const handleVariantDrop = async (variantId, e) => {
    e.preventDefault();
    setDraggingVariant(null);
    const files = Array.from(e.dataTransfer.files || []);
    const imageFiles = files.filter(f => f.type.startsWith('image/'));
    
    for (const file of imageFiles) {
      try {
        const compressedBase64 = await compressImage(file);
        setFormData(prev => ({
          ...prev,
          variants: prev.variants.map(v => {
            if (v.id !== variantId) return v;
            const newImages = [...(v.images || []), compressedBase64];
            return { ...v, images: newImages, image: newImages[0] };
          })
        }));
      } catch (err) {
        console.error('Error compressing variant image:', err);
      }
    }
  };

  const handleRemoveVariantImage = (variantId, imageIndex) => {
    setFormData(prev => ({
      ...prev,
      variants: prev.variants.map(v => {
        if (v.id !== variantId) return v;
        const newImages = v.images.filter((_, idx) => idx !== imageIndex);
        return { ...v, images: newImages, image: newImages.length > 0 ? newImages[0] : '' };
      })
    }));
  };

  return (
    <div className="premium-card" style={{ padding: 0, overflow: 'hidden' }}>
      <div className="form-accordion-header" onClick={() => setIsExpanded(!isExpanded)}>
        <h3 style={{ fontSize: '18px', fontWeight: 600, margin: 0, color: '#0f172a' }}>Variants & Attributes</h3>
        {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
      </div>
      
      <div className={`form-accordion-content ${isExpanded ? '' : 'collapsed'}`}>
        {lightboxData.isOpen && (
          <ImageLightbox 
            images={lightboxData.images}
            currentIndex={lightboxData.currentIndex}
            onClose={() => setLightboxData({ ...lightboxData, isOpen: false })}
            onNavigate={handleLightboxNavigate}
          />
        )}
        
        <p style={{ fontSize: '13px', color: '#64748b', marginBottom: '24px' }}>
          Manually add child products if you want to sell the same product with a different image, color, size, or price.
        </p>

        {variants.length > 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '24px' }}>
            {variants.map((variant, index) => (
              <div key={variant.id} style={{ border: '1px solid #e2e8f0', borderRadius: '8px', padding: '16px', backgroundColor: '#f8fafc', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <h4 style={{ margin: 0, fontSize: '14px', fontWeight: 600 }}>Variant #{index + 1}</h4>
                  <button type="button" className="icon-btn" onClick={() => handleRemoveVariant(variant.id)} style={{ color: '#ef4444' }}>
                  <Trash2 size={16} />
                </button>
              </div>

              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px' }}>
                {globalOptions.map(opt => {
                  const val = variant.attributes?.[opt.name] || '';
                  return (
                    <VariantOptionSelector 
                      key={opt.name}
                      variantId={variant.id}
                      opt={opt}
                      val={val}
                      onChange={(newVal) => handleUpdateVariantAttribute(variant.id, opt.name, newVal)}
                    />
                  );
                })}
              </div>

              <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
                <div style={{ flex: 1 }}>
                  <label className="premium-label">Images</label>
                  <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                    {(variant.images || []).map((img, idx) => (
                      <div 
                        key={idx} 
                        draggable
                        onDragStart={(e) => handleVariantImageDragStart(e, variant.id, idx)}
                        onDragOver={handleVariantImageDragOver}
                        onDrop={(e) => handleVariantImageDropReorder(e, variant.id, idx)}
                        style={{ position: 'relative', width: '120px', height: '120px', borderRadius: '12px', overflow: 'hidden', border: '1px solid #e2e8f0', cursor: 'grab', opacity: draggedVariantImage.variantId === variant.id && draggedVariantImage.index === idx ? 0.5 : 1, backgroundColor: '#f8fafc' }}
                        onClick={() => openLightbox(variant.images, idx)}
                      >
                        <img src={img} alt="Variant" style={{ width: '100%', height: '100%', objectFit: 'cover', cursor: 'pointer' }} />
                        <button 
                          type="button" 
                          onClick={(e) => { e.stopPropagation(); handleRemoveVariantImage(variant.id, idx); }} 
                          style={{ position: 'absolute', top: '8px', right: '8px', backgroundColor: '#ffffff', boxShadow: '0 2px 4px rgba(0,0,0,0.1)', width: '28px', height: '28px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', border: 'none', cursor: 'pointer', zIndex: 2 }}
                        >
                          <Trash2 size={14} color="#dc2626" />
                        </button>
                      </div>
                    ))}
                    
                    <label 
                      style={{ 
                        display: 'flex', 
                        flexDirection: 'column',
                        alignItems: 'center', 
                        justifyContent: 'center',
                        width: '120px',
                        height: '120px', 
                        border: draggingVariant === variant.id ? '2px dashed var(--primary)' : '1px dashed #cbd5e1', 
                        borderRadius: '8px', 
                        cursor: 'pointer',
                        backgroundColor: draggingVariant === variant.id ? '#eff6ff' : '#fff',
                        transition: 'all 0.2s'
                      }}
                      onDragOver={(e) => { e.preventDefault(); setDraggingVariant(variant.id); }}
                      onDragLeave={() => setDraggingVariant(null)}
                      onDrop={(e) => handleVariantDrop(variant.id, e)}
                    >
                      <ImageIcon size={20} color={draggingVariant === variant.id ? 'var(--primary)' : '#94a3b8'} style={{ marginBottom: '4px' }} />
                      <span style={{ fontSize: '10px', color: draggingVariant === variant.id ? 'var(--primary)' : '#64748b' }}>
                        {draggingVariant === variant.id ? 'Drop!' : 'Add Image'}
                      </span>
                      <input type="file" hidden accept="image/*" multiple onChange={(e) => handleVariantImageUpload(variant.id, e)} />
                    </label>
                  </div>
                </div>

                <div style={{ flex: 1, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <div>
                    <label className="premium-label">Price (Optional)</label>
                    <input 
                      type="number" 
                      className="premium-input" 
                      placeholder="Overrides base price"
                      value={variant.price}
                      onChange={e => handleUpdateVariant(variant.id, 'price', e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="premium-label">Stock (Optional)</label>
                    <input 
                      type="number" 
                      className="premium-input" 
                      placeholder="Track stock"
                      value={variant.stock}
                      onChange={e => handleUpdateVariant(variant.id, 'stock', e.target.value)}
                    />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <button 
        type="button" 
        className="btn btn-secondary" 
        onClick={handleAddVariant}
        style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
      >
        <Plus size={18} /> Add Variant / Different Attribute
      </button>
      </div>
    </div>
  );
}
