import React, { useState } from 'react';
import { Plus, Trash2, Image as ImageIcon, ChevronDown, ChevronUp, Search, Check } from 'lucide-react';
import ImageLightbox from '../../components/ImageLightbox';
import { compressImage } from '../../utils/imageCompression';
import { getColorHex } from '../../utils/colors';
import { useStore } from '../../store';

export const VariantOptionSelector = ({ variantId, opt, val, onChange }) => {
  const { language } = useStore();
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
                id={`color_search_${opt.name}`}
                name={`colorSearch_${opt.name}`}
                aria-label={`Search ${opt.name}`}
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

  // Non-color options (Size, Material, Weight, Style, etc.): Combobox supporting direct writing AND preset dropdown selection
  const isSize = opt.name.toLowerCase().includes('size') || opt.name.toLowerCase().includes('مقاس');
  const isMaterial = opt.name.toLowerCase().includes('material') || opt.name.toLowerCase().includes('خامة') || opt.name.toLowerCase().includes('مادة');
  
  let placeholderText = language === 'ar' ? `اكتب ${opt.name} أو اختر...` : `Type ${opt.name} or select...`;
  if (isSize) {
    placeholderText = language === 'ar' ? 'اكتب المقاس أو اختر (مثال: M, 42)...' : 'Type size or select (e.g. M, 42)...';
  } else if (isMaterial) {
    placeholderText = language === 'ar' ? 'اكتب الخامة أو اختر (مثال: قطن، جلد)...' : 'Type material or select (e.g. Cotton, Leather)...';
  } else if (isWeight) {
    placeholderText = language === 'ar' ? 'اكتب الوزن أو اختر (مثال: 500g)...' : 'Type weight or select (e.g. 500g)...';
  }

  const values = opt.values || [];
  const filteredValues = values.filter(v => 
    !val || v.toLowerCase().includes(String(val).toLowerCase())
  );
  const inputId = `opt_input_${variantId || 'main'}_${opt.name.replace(/[^a-zA-Z0-9]/g, '_')}`;
  const isRtl = language === 'ar';

  return (
    <div style={{ flex: '1 1 200px', position: 'relative', zIndex: isOpen ? 50 : 1 }} ref={dropdownRef}>
      <label htmlFor={inputId} className="premium-label">{opt.name}</label>
      <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
        <input 
          type="text"
          id={inputId}
          name={inputId}
          className="premium-input"
          placeholder={placeholderText}
          value={val || ''}
          onChange={(e) => {
            onChange(e.target.value);
            if (!isOpen && values.length > 0) setIsOpen(true);
          }}
          onFocus={() => {
            if (values.length > 0) setIsOpen(true);
          }}
          style={{ 
            width: '100%', 
            paddingLeft: isRtl ? '36px' : '14px',
            paddingRight: isRtl ? '14px' : '36px',
            borderRadius: '10px',
            backgroundColor: '#ffffff',
            borderColor: isOpen ? 'var(--primary)' : '#cbd5e1'
          }}
        />
        {values.length > 0 && (
          <button
            type="button"
            tabIndex={-1}
            onClick={() => setIsOpen(!isOpen)}
            style={{
              position: 'absolute',
              right: isRtl ? 'auto' : '10px',
              left: isRtl ? '10px' : 'auto',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: '6px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#64748b'
            }}
            aria-label={`Toggle ${opt.name} options`}
          >
            <ChevronDown 
              size={18} 
              style={{ 
                transform: isOpen ? 'rotate(180deg)' : 'none', 
                transition: 'transform 0.2s' 
              }} 
            />
          </button>
        )}
      </div>

      {isOpen && values.length > 0 && (
        <div 
          onMouseDown={(e) => e.stopPropagation()}
          style={{
            position: 'absolute',
            top: '100%',
            left: 0,
            right: 0,
            zIndex: 100,
            marginTop: '4px',
            backgroundColor: '#ffffff',
            border: '1px solid #cbd5e1',
            borderRadius: '10px',
            boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
            maxHeight: '220px',
            overflowY: 'auto'
          }}
        >
          {val && (
            <div 
              style={{ padding: '8px 14px', cursor: 'pointer', fontSize: '13px', color: '#64748b', fontStyle: 'italic', borderBottom: '1px solid #f1f5f9' }}
              onClick={() => { onChange(''); setIsOpen(false); }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f8fafc'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
            >
              {language === 'ar' ? 'مسح القيمة' : 'Clear Value'}
            </div>
          )}
          {filteredValues.length > 0 ? (
            filteredValues.map((v) => (
              <div
                key={v}
                onClick={() => {
                  onChange(v);
                  setIsOpen(false);
                }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f1f5f9'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = v === val ? '#eff6ff' : 'transparent'}
                style={{
                  padding: '10px 14px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  color: v === val ? 'var(--primary)' : '#1e293b',
                  fontWeight: v === val ? 600 : 400,
                  backgroundColor: v === val ? '#eff6ff' : 'transparent',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}
              >
                <span>{v}</span>
                {v === val && <Check size={16} color="var(--primary)" />}
              </div>
            ))
          ) : (
            <div style={{ padding: '12px 14px', fontSize: '13px', color: '#64748b' }}>
              <span>{language === 'ar' ? `قيمة مخصصة: "${val}"` : `Custom value: "${val}"`}</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};


export default function ProductOptionsBuilder({ formData, setFormData, globalOptions }) {
  const { language } = useStore();
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
        <h3 style={{ fontSize: '18px', fontWeight: 600, margin: 0, color: '#0f172a' }}>{language === 'ar' ? 'الأنواع والخصائص' : 'Variants & Attributes'}</h3>
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
          {language === 'ar' ? 'قم بإضافة خيارات فرعية للمنتج يدوياً إذا كنت ترغب في بيع نفس المنتج بصورة، لون، مقاس، أو سعر مختلف.' : 'Manually add child products if you want to sell the same product with a different image, color, size, or price.'}
        </p>

        {variants.length > 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '24px' }}>
            {variants.map((variant, index) => (
              <div key={variant.id} style={{ border: '1px solid #e2e8f0', borderRadius: '8px', padding: '16px', backgroundColor: '#f8fafc', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <h4 style={{ margin: 0, fontSize: '14px', fontWeight: 600 }}>{language === 'ar' ? 'خيار' : 'Variant'} #{index + 1}</h4>
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

              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', alignItems: 'flex-start' }}>
                <div style={{ flex: '1 1 280px', minWidth: '240px' }}>
                  <label className="premium-label">{language === 'ar' ? 'الصور' : 'Images'}</label>
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
                          style={{ position: 'absolute', top: '8px', insetInlineEnd: '8px', backgroundColor: '#ffffff', boxShadow: '0 2px 4px rgba(0,0,0,0.1)', width: '28px', height: '28px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', border: 'none', cursor: 'pointer', zIndex: 2 }}
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
                        {draggingVariant === variant.id ? (language === 'ar' ? 'أفلت هنا!' : 'Drop!') : (language === 'ar' ? 'إضافة صورة' : 'Add Image')}
                      </span>
                      <input 
                        type="file" 
                        id={`variant_image_upload_${variant.id}`}
                        name={`variantImageUpload_${variant.id}`}
                        aria-label={`Upload image for variant ${variant.id}`}
                        hidden 
                        accept="image/*" 
                        multiple 
                        onChange={(e) => handleVariantImageUpload(variant.id, e)} 
                      />
                    </label>
                  </div>
                </div>

                <div style={{ flex: '1 1 240px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(110px, 1fr))', gap: '16px' }}>
                  <div>
                    <label htmlFor={`variant_price_${variant.id}`} className="premium-label">{language === 'ar' ? 'السعر (اختياري)' : 'Price (Optional)'}</label>
                    <input 
                      type="number" 
                      id={`variant_price_${variant.id}`}
                      name={`variant_price_${variant.id}`}
                      className="premium-input" 
                      placeholder={language === 'ar' ? 'يتخطى السعر الأساسي' : 'Overrides base price'}
                      value={variant.price}
                      onChange={e => handleUpdateVariant(variant.id, 'price', e.target.value)}
                    />
                  </div>
                  <div>
                    <label htmlFor={`variant_stock_${variant.id}`} className="premium-label">{language === 'ar' ? 'المخزون (اختياري)' : 'Stock (Optional)'}</label>
                    <input 
                      type="number" 
                      id={`variant_stock_${variant.id}`}
                      name={`variant_stock_${variant.id}`}
                      className="premium-input" 
                      placeholder={language === 'ar' ? 'تتبع المخزون' : 'Track stock'}
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
        <Plus size={18} /> {language === 'ar' ? 'إضافة خيار جديد' : 'Add Variant / Different Attribute'}
      </button>
      </div>
    </div>
  );
}
