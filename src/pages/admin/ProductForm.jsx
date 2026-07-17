import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Save, UploadCloud, X, Tag, Plus, BarChart2, Trash2, Crop, ChevronDown, ChevronUp, Check, GripVertical, Globe } from 'lucide-react';

import ProductOptionsBuilder, { VariantOptionSelector } from './ProductOptionsBuilder';
import ImageLightbox from '../../components/ImageLightbox';
import ImageCropperModal from '../../components/ImageCropperModal';
import { compressImage } from '../../utils/imageCompression';
import { defaultOptions } from '../../utils/constants';
import { useStore } from '../../store';

const SwipeToDeleteInput = ({ value, onChange, onDelete, placeholder, language, dir }) => {
  const [swipeOffset, setSwipeOffset] = useState(0);
  const [isSwiping, setIsSwiping] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  
  const startX = useRef(0);
  const currentX = useRef(0);

  const handlePointerDown = (e) => {
    if (e.pointerType === 'mouse' && e.button !== 0) return;
    startX.current = e.clientX;
    currentX.current = swipeOffset;
    setIsSwiping(true);
    e.currentTarget.setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e) => {
    if (!isSwiping) return;
    const diff = e.clientX - startX.current;
    
    const isRtl = dir === 'rtl';
    let newOffset = currentX.current + diff;
    
    if (isRtl) {
      if (newOffset < 0) newOffset = 0;
      if (newOffset > 100) newOffset = 100;
    } else {
      if (newOffset > 0) newOffset = 0;
      if (newOffset < -100) newOffset = -100;
    }
    
    if (Math.abs(diff) > 5) {
      setSwipeOffset(newOffset);
    }
  };

  const handlePointerUp = (e) => {
    if (!isSwiping) return;
    setIsSwiping(false);
    e.currentTarget.releasePointerCapture(e.pointerId);
    
    const isRtl = dir === 'rtl';
    const threshold = isRtl ? 30 : -30;
    const snappedOffset = isRtl ? 80 : -80;
    
    if (isRtl ? swipeOffset > threshold : swipeOffset < threshold) {
      setSwipeOffset(snappedOffset);
      setShowConfirm(true);
    } else {
      setSwipeOffset(0);
      setShowConfirm(false);
    }
  };

  const handleDeleteTap = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (showConfirm) {
       onDelete();
    } else {
       setShowConfirm(true);
       const isRtl = dir === 'rtl';
       setSwipeOffset(isRtl ? 80 : -80);
    }
  };

  const isRtl = dir === 'rtl';
  const displayOffset = swipeOffset;

  return (
    <div style={{ position: 'relative', overflow: 'hidden', borderRadius: '8px', display: 'flex', alignItems: 'center' }}>
      <div 
        style={{
          position: 'absolute',
          top: 0,
          bottom: 0,
          right: isRtl ? 'auto' : 0,
          left: isRtl ? 0 : 'auto',
          width: '80px',
          backgroundColor: '#ef4444',
          color: '#ffffff',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          zIndex: 1,
          transition: 'opacity 0.2s ease',
        }}
        onPointerDown={(e) => e.stopPropagation()}
        onClick={handleDeleteTap}
      >
        {showConfirm ? <Check size={20} /> : <Trash2 size={16} />}
      </div>

      <div
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        style={{
          width: '100%',
          transform: `translateX(${displayOffset}px)`,
          transition: isSwiping ? 'none' : 'transform 0.2s ease',
          zIndex: 2,
          backgroundColor: '#ffffff',
          position: 'relative',
          display: 'flex'
        }}
      >
        <textarea 
          className="premium-input" 
          value={value} 
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          dir={dir}
          style={{ 
            width: '100%', 
            paddingLeft: isRtl ? '12px' : '36px', 
            paddingRight: isRtl ? '36px' : '12px',
            minHeight: '60px',
            resize: 'vertical'
          }}
          onPointerDown={(e) => {
            if (e.pointerType === 'mouse') e.stopPropagation();
          }}
        />
        <div style={{
           position: 'absolute',
           left: isRtl ? 'auto' : '8px',
           right: isRtl ? '8px' : 'auto',
           top: '50%',
           transform: 'translateY(-50%)',
           cursor: 'grab',
           color: '#cbd5e1',
           display: 'flex',
           alignItems: 'center'
        }}>
           <GripVertical size={16} />
        </div>
      </div>
    </div>
  );
};

export default function ProductForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { products, productsLoading: loading, addProduct, updateProduct } = useStore();
  const { config } = useStore();
  const { addToast } = useStore();
  const { t, language } = useStore();
  const fileInputRef = useRef(null);
  
  const isEditing = Boolean(id);
  
  const [formData, setFormData] = useState({
    title: '',
    titleAr: '',
    category: '',
    price: '',
    costPrice: '',
    hasOffer: false,
    offerPrice: '',
    offerEndDate: '',
    stock: '',
    showStock: true,
    isActive: true,
    featured: false,
    image: '',
    images: [],
    description: '',
    descriptionAr: '',
    keyBenefits: '',
    keyBenefitsAr: '',
    options: [],
    variants: [],
    colorGallery: {},
    reviewImages: [],
    color: '',
    size: '',
    material: '',
    weight: '',
    style: '',
    badge: ''
  });

  const [isDragging, setIsDragging] = useState(false);
  const [showAnalysis, setShowAnalysis] = useState(false);
  const [lightboxData, setLightboxData] = useState({ isOpen: false, images: [], currentIndex: 0 });
  const [cropperData, setCropperData] = useState({ isOpen: false, index: null, imageSrc: null });
  
  const [expandedSections, setExpandedSections] = useState({
    basic: true,
    pricing: true,
    inventory: true,
    display: true,
    arabic: true,
    images: true,
    options: true
  });

  const handleAutoTranslate = async () => {
    try {
      const translateText = async (text) => {
        if (!text) return '';
        const res = await fetch(`https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=ar&dt=t&q=${encodeURIComponent(text)}`);
        const data = await res.json();
        return data[0].map(x => x[0]).join('');
      };

      addToast(language === 'ar' ? 'جاري الترجمة...' : 'Translating...', 'info');
      
      const titleAr = formData.title ? await translateText(formData.title) : formData.titleAr;
      const descriptionAr = formData.description ? await translateText(formData.description) : formData.descriptionAr;
      const keyBenefitsAr = formData.keyBenefits ? await translateText(formData.keyBenefits) : formData.keyBenefitsAr;
      
      setFormData(prev => ({
        ...prev,
        titleAr,
        descriptionAr,
        keyBenefitsAr
      }));
      
      addToast(language === 'ar' ? 'تمت الترجمة بنجاح' : 'Translation complete', 'success');
    } catch (err) {
      console.error(err);
      addToast(language === 'ar' ? 'فشلت الترجمة' : 'Translation failed', 'error');
    }
  };

  const toggleSection = (section) => {
    setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

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

  const handleCropComplete = (croppedBase64) => {
    if (cropperData.index !== null) {
      const newImages = [...formData.images];
      newImages[cropperData.index] = croppedBase64;
      setFormData(prev => {
        const nextState = { ...prev, images: newImages };
        if (cropperData.index === 0) {
          nextState.image = croppedBase64;
        }
        return nextState;
      });
    }
    setCropperData({ isOpen: false, index: null, imageSrc: null });
  };

  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [newOptionValue, setNewOptionValue] = useState({});

  useEffect(() => {
    if (isEditing) {
      const product = products.find(p => p.id === id);
      if (product) {
        setFormData({
          title: product.title || '',
          titleAr: product.titleAr || '',
          category: product.category || '',
          price: product.price || '',
          costPrice: product.costPrice || '',
          hasOffer: Boolean(product.offerPrice),
          offerPrice: product.offerPrice || '',
          offerType: 'fixed',
          offerPercentage: (product.price && product.offerPrice) ? ((product.price - product.offerPrice) / product.price * 100).toFixed(1) : '',
          offerStartDate: product.offerStartDate ? new Date(product.offerStartDate).toISOString().slice(0, 16) : '',
          offerEndDate: product.offerEndDate ? new Date(product.offerEndDate).toISOString().slice(0, 16) : '',
          stock: product.stock !== undefined ? product.stock : '',
          showStock: product.showStock !== undefined ? product.showStock : true,
          isActive: product.isActive !== undefined ? product.isActive : true,
          featured: Boolean(product.featured),
          image: product.image || '',
          description: product.description || '',
          descriptionAr: product.descriptionAr || '',
          keyBenefits: product.keyBenefits ? product.keyBenefits.join('\n') : '',
          keyBenefitsAr: product.keyBenefitsAr ? product.keyBenefitsAr.join('\n') : '',
          images: product.images || (product.image ? [product.image] : []),
          options: product.options || [],
          variants: product.variants || [],
          colorGallery: product.colorGallery || {},
          reviewImages: product.reviewImages || [],
          color: product.color || '',
          size: product.size || '',
          material: product.material || '',
          weight: product.weight || '',
          style: product.style || '',
          badge: product.badge || ''
        });
      }
    }
  }, [id, isEditing, products]);

  // Variants are now handled by ColorVariantBuilder

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isSubmitting) return;
    
    if (formData.hasOffer && !formData.offerPrice) {
      addToast('Please provide an offer price.', 'error');
      return;
    }
    
    if (!formData.image && formData.images.length === 0) {
      addToast('A main product image is required.', 'error');
      return;
    }
    
    if (formData.hasOffer && formData.offerPrice && parseFloat(formData.offerPrice) >= parseFloat(formData.price)) {
      addToast('Offer price must be less than the regular price.', 'error');
      return;
    }

    // Validate Options
    if (formData.options && formData.options.length > 0) {
      if (formData.options.some(opt => !opt.name || !opt.name.trim())) {
        addToast('All options must have a name (e.g., Color, Size).', 'error');
        return;
      }
      if (formData.options.some(opt => !opt.values || opt.values.length === 0)) {
        addToast('All options must have at least one value.', 'error');
        return;
      }
    }

    // Synthesize options for storefront
    const generatedOptions = [];
    const basicAttributes = ['Color', 'Size', 'Material', 'Weight', 'Style'];
    
    basicAttributes.forEach(attrName => {
      const val = formData[attrName.toLowerCase()];
      if (val) {
        const vals = val.split(',').map(s => s.trim()).filter(Boolean);
        generatedOptions.push({ name: attrName, values: vals });
      }
    });

    if (formData.variants && formData.variants.length > 0) {
      formData.variants.forEach(v => {
        if (v.attributes) {
          Object.entries(v.attributes).forEach(([name, val]) => {
            if (!val) return;
            const vals = val.split(',').map(s => s.trim()).filter(Boolean);
            let opt = generatedOptions.find(o => o.name === name);
            if (!opt) {
              generatedOptions.push({ name, values: vals });
            } else {
              vals.forEach(vItem => {
                if (!opt.values.includes(vItem)) {
                  opt.values.push(vItem);
                }
              });
            }
          });
        }
      });
    }

    const payload = {
      ...formData,
      price: parseFloat(formData.price),
      costPrice: formData.costPrice ? parseFloat(formData.costPrice) : null,
      offerPrice: formData.hasOffer && formData.offerPrice ? parseFloat(formData.offerPrice) : null,
      offerStartDate: formData.hasOffer && formData.offerStartDate ? new Date(formData.offerStartDate).toISOString() : null,
      offerEndDate: formData.hasOffer && formData.offerEndDate ? new Date(formData.offerEndDate).toISOString() : null,
      stock: formData.stock === '' ? null : formData.stock,
      showStock: formData.showStock,
      isActive: formData.isActive,
      keyBenefits: formData.keyBenefits ? formData.keyBenefits.split('\n').filter(b => b.trim() !== '') : [],
      keyBenefitsAr: formData.keyBenefitsAr ? formData.keyBenefitsAr.split('\n').filter(b => b.trim() !== '') : [],
      images: formData.images.length > 0 ? formData.images : undefined,
      image: formData.images.length > 0 ? formData.images[0] : (formData.image || undefined),
      options: generatedOptions,
    };
    
    delete payload.hasOffer;
    delete payload.offerType;
    delete payload.offerPercentage;
    
    try {
      setIsSubmitting(true);
      if (isEditing) {
        await updateProduct(id, payload);
        addToast('Product updated successfully!', 'success');
      } else {
        await addProduct(payload);
        addToast('Product added successfully!', 'success');
      }
      navigate('/diaradmin26/products');
    } catch (error) {
      console.error('Error saving product:', error);
      addToast(error.message || 'Failed to save product. Please try again.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleImageChange = async (e) => {
    const files = Array.from(e.target.files || []);
    for (const file of files) {
      try {
        const compressedBase64 = await compressImage(file);
        setFormData(prev => ({ 
          ...prev, 
          images: [...prev.images, compressedBase64],
          image: prev.images.length === 0 ? compressedBase64 : prev.image 
        }));
      } catch (err) {
        console.error('Error compressing image:', err);
      }
    }
  };

  const handleDrop = async (e) => {
    e.preventDefault();
    setIsDragging(false);
    const files = Array.from(e.dataTransfer.files || []);
    const imageFiles = files.filter(f => f.type.startsWith('image/'));
    for (const file of imageFiles) {
      try {
        const compressedBase64 = await compressImage(file);
        setFormData(prev => ({
          ...prev,
          images: [...prev.images, compressedBase64],
          image: prev.images.length === 0 ? compressedBase64 : prev.image
        }));
      } catch (err) {
        console.error('Error compressing image:', err);
      }
    }
  };

  // --- Drag and Drop Reordering for Base Images ---
  const [draggedImageIndex, setDraggedImageIndex] = useState(null);
  
  const handleImageDragStart = (e, index) => {
    setDraggedImageIndex(index);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', index); // Required for Firefox
  };

  const handleImageDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleImageDropReorder = (e, targetIndex) => {
    e.preventDefault();
    if (draggedImageIndex === null || draggedImageIndex === targetIndex) return;

    const newImages = [...formData.images];
    const draggedItem = newImages[draggedImageIndex];
    newImages.splice(draggedImageIndex, 1);
    newImages.splice(targetIndex, 0, draggedItem);
    
    setFormData({ ...formData, images: newImages });
    setDraggedImageIndex(null);
  };

  const [isReviewDragging, setIsReviewDragging] = useState(false);
  const reviewInputRef = useRef(null);

  const handleReviewDrop = async (e) => {
    e.preventDefault();
    setIsReviewDragging(false);
    const files = Array.from(e.dataTransfer.files || []);
    const imageFiles = files.filter(f => f.type.startsWith('image/'));
    for (const file of imageFiles) {
      try {
        const compressedBase64 = await compressImage(file);
        setFormData(prev => ({
          ...prev,
          reviewImages: [...(prev.reviewImages || []), compressedBase64]
        }));
      } catch (err) {
        console.error('Error compressing review image:', err);
      }
    }
  };

  const handleReviewFileInput = async (e) => {
    const files = Array.from(e.target.files || []);
    for (const file of files) {
      try {
        const compressedBase64 = await compressImage(file);
        setFormData(prev => ({
          ...prev,
          reviewImages: [...(prev.reviewImages || []), compressedBase64]
        }));
      } catch (err) {
        console.error('Error compressing review image:', err);
      }
    }
  };

  // --- Drag and Drop Reordering for Review Images ---
  const [draggedReviewIndex, setDraggedReviewIndex] = useState(null);
  
  const handleReviewDragStart = (e, index) => {
    setDraggedReviewIndex(index);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', index);
  };

  const handleReviewDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleReviewDropReorder = (e, targetIndex) => {
    e.preventDefault();
    if (draggedReviewIndex === null || draggedReviewIndex === targetIndex) return;

    const newImages = [...(formData.reviewImages || [])];
    const draggedItem = newImages[draggedReviewIndex];
    newImages.splice(draggedReviewIndex, 1);
    newImages.splice(targetIndex, 0, draggedItem);
    
    setFormData({ ...formData, reviewImages: newImages });
    setDraggedReviewIndex(null);
  };

  const removeReviewImage = (index) => {
    setFormData(prev => ({
      ...prev,
      reviewImages: prev.reviewImages.filter((_, i) => i !== index)
    }));
  };

  const removeImage = (index) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
  };

  if (isEditing && loading) {
    return (
      <div style={{ padding: '40px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
        <div style={{ width: '48px', height: '48px', border: '4px solid #e2e8f0', borderTopColor: 'var(--primary)', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
        <h3 style={{ marginTop: '24px', color: 'var(--on-surface)' }}>{language === 'ar' ? 'جاري تحميل تفاصيل المنتج...' : 'Loading product details...'}</h3>
      </div>
    );
  }

  return (
    <div style={{ width: '100%', margin: '0 auto', paddingBottom: '40px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
        <button 
          type="button"
          onClick={() => navigate('/diaradmin26/products')} 
          style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'none', border: 'none', color: '#64748b', cursor: 'pointer', padding: 0, fontWeight: 500, fontSize: '14px' }}
        >
          <ArrowLeft size={18} /> {language === 'ar' ? 'عودة' : 'Back'}
        </button>
        {isEditing && (
          <button 
            type="button"
            className="btn" 
            style={{ display: 'flex', alignItems: 'center', gap: '8px', backgroundColor: '#e0e7ff', color: '#4f46e5', border: 'none', padding: '6px 12px', fontSize: '13px' }}
            onClick={() => navigate(`/diaradmin26/products/${id}/analysis`)}
          >
            <BarChart2 size={16} /> {language === 'ar' ? 'عرض التحليلات' : 'View Analysis'}
          </button>
        )}
      </div>

      {lightboxData.isOpen && (
        <ImageLightbox 
          images={lightboxData.images}
          currentIndex={lightboxData.currentIndex}
          onClose={() => setLightboxData({ ...lightboxData, isOpen: false })}
          onNavigate={handleLightboxNavigate}
        />
      )}

      <ImageCropperModal
        isOpen={cropperData.isOpen}
        imageSrc={cropperData.imageSrc}
        onClose={() => setCropperData({ isOpen: false, index: null, imageSrc: null })}
        onCropComplete={handleCropComplete}
      />

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        
        {/* Main Details & Image Row */}
        <div className="responsive-form-grid">
          
          {/* Left Col: Details */}
          <div className="premium-card" style={{ padding: 0, overflow: 'hidden' }}>
            <div className="form-accordion-header" onClick={() => toggleSection('basic')}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <h3 style={{ fontSize: '18px', fontWeight: 600, margin: 0, color: '#0f172a' }}>{language === 'ar' ? 'المعلومات الأساسية' : 'Basic Information'}</h3>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleAutoTranslate();
                  }}
                  className="btn btn-secondary"
                  style={{ padding: '4px 8px', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '4px', backgroundColor: '#f0fdf4', color: '#16a34a', border: '1px solid #bbf7d0' }}
                  title={language === 'ar' ? 'ترجمة الإنجليزية إلى العربية تلقائياً' : 'Auto-translate English to Arabic'}
                >
                  <Globe size={14} /> {language === 'ar' ? 'ترجمة تلقائية' : 'Auto Translate'}
                </button>
              </div>
              {expandedSections.basic ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
            </div>
            
            <div className={`form-accordion-content ${expandedSections.basic ? '' : 'collapsed'}`}>
              <div className="responsive-grid-2">
                <div>
                  <label className="premium-label">{language === 'ar' ? 'اسم المنتج (إنجليزي)' : 'Product Name (English)'}</label>
                  <textarea className="premium-input" required value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} placeholder={language === 'ar' ? 'مثال: تيشرت قطن فاخر' : 'E.g. Premium Cotton T-Shirt'} style={{ resize: 'vertical', minHeight: '60px' }} rows={2} />
                </div>
                <div>
                  <label className="premium-label">{language === 'ar' ? 'اسم المنتج (عربي)' : 'Product Name (Arabic)'}</label>
                  <textarea className="premium-input" value={formData.titleAr} onChange={e => setFormData({...formData, titleAr: e.target.value})} placeholder="قميص قطن فاخر" dir="rtl" style={{ resize: 'vertical', minHeight: '60px' }} rows={2} />
                </div>
              </div>
            
            <div className="responsive-grid-2">
              <div style={{ gridColumn: '1 / -1' }}>
                <label className="premium-label">{language === 'ar' ? 'الفئة' : 'Category'}</label>
                <select 
                  className="premium-input" 
                  value={formData.category} 
                  onChange={e => setFormData({...formData, category: e.target.value})}
                  style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid var(--outline-variant)', backgroundColor: '#f8fafc' }}
                >
                  <option value="">{language === 'ar' ? 'اختر الفئة' : 'Select Category'}</option>
                  {config.categories?.map(cat => {
                    const catName = typeof cat === 'string' ? cat : cat.name;
                    if (typeof cat === 'object' && cat.subcategories?.length > 0) {
                      return (
                        <optgroup key={catName} label={language === 'ar' && cat.nameAr ? cat.nameAr : catName}>
                          <option value={catName}>{language === 'ar' && cat.nameAr ? cat.nameAr : catName}</option>
                          {cat.subcategories.map((sub, idx) => (
                            <option key={`${catName}-${sub}`} value={sub}>
                              {language === 'ar' && cat.subcategoriesAr?.[idx] ? `- ${cat.subcategoriesAr[idx]}` : `- ${sub}`}
                            </option>
                          ))}
                        </optgroup>
                      );
                    }
                    return <option key={catName} value={catName}>{language === 'ar' && cat.nameAr ? cat.nameAr : catName}</option>;
                  })}
                </select>
              </div>
              <div>
                <label className="premium-label">{language === 'ar' ? 'لون خلفية المنتج (اختياري)' : 'Product Background Color (Optional)'}</label>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <input 
                    type="color" 
                    value={formData.bgColor || '#f8fafc'} 
                    onChange={e => setFormData({...formData, bgColor: e.target.value})}
                    style={{ width: '40px', height: '40px', padding: '0', border: 'none', borderRadius: '8px', cursor: 'pointer' }}
                  />
                  <input 
                    type="text" 
                    className="premium-input" 
                    value={formData.bgColor || ''} 
                    onChange={e => setFormData({...formData, bgColor: e.target.value})}
                    placeholder="#f8fafc"
                    style={{ flex: 1 }}
                  />
                </div>
              </div>

              <div>
                <label className="premium-label">{language === 'ar' ? 'نص الشارة (اختياري)' : 'Badge Text (Optional)'}</label>
                <select 
                  className="premium-input" 
                  value={formData.badge} 
                  onChange={e => setFormData({...formData, badge: e.target.value})}
                  style={{ cursor: 'pointer' }}
                >
                  <option value="">{language === 'ar' ? 'بدون شارة' : 'None (No Badge)'}</option>
                  <option value="Best Seller">{language === 'ar' ? 'الأكثر مبيعاً' : 'Best Seller'}</option>
                  <option value="Trending">{language === 'ar' ? 'رائج' : 'Trending'}</option>
                  <option value="New Arrival">{language === 'ar' ? 'وصل حديثاً' : 'New Arrival'}</option>
                  <option value="Limited Stock">{language === 'ar' ? 'كمية محدودة' : 'Limited Stock'}</option>
                  <option value="Top Rated">{language === 'ar' ? 'الأعلى تقييماً' : 'Top Rated'}</option>
                  <option value="Staff Pick">{language === 'ar' ? 'اختيار الخبراء' : 'Staff Pick'}</option>
                </select>
              </div>
            </div>
            
            {/* Basic Options */}
            <div className="responsive-grid-2">
              {(() => {
                const optionsList = config?.productOptions && config.productOptions.length > 0 
                  ? (typeof config.productOptions[0] === 'string' 
                      ? config.productOptions.map(opt => ({ 
                          name: opt, 
                          values: defaultOptions.find(d => d.name.toLowerCase() === opt.toLowerCase())?.values || [] 
                        })) 
                      : config.productOptions)
                  : defaultOptions;

                const basicAttributes = ['Color', 'Size', 'Material', 'Weight', 'Style'];
                
                return basicAttributes.map(attrName => {
                  const optData = optionsList.find(o => o.name.toLowerCase().includes(attrName.toLowerCase()));
                  if (!optData) return null;
                  
                  return (
                    <VariantOptionSelector 
                      key={attrName}
                      variantId="basic"
                      opt={optData}
                      val={formData[attrName.toLowerCase()] || ''}
                      onChange={(newVal) => setFormData({...formData, [attrName.toLowerCase()]: newVal})}
                    />
                  );
                });
              })()}
            </div>

            <div className="responsive-grid-2">
              <div>
                <label className="premium-label">{language === 'ar' ? 'الوصف (إنجليزي)' : 'Description (English)'}</label>
                <textarea 
                  className="premium-input" 
                  value={formData.description} 
                  onChange={e => setFormData({...formData, description: e.target.value})} 
                  style={{ minHeight: '120px', resize: 'vertical' }} 
                  placeholder={language === 'ar' ? 'وصف تفصيلي للمنتج...' : 'Detailed product description...'}
                />
              </div>
              <div>
                <label className="premium-label">{language === 'ar' ? 'الوصف (عربي)' : 'Description (Arabic)'}</label>
                <textarea 
                  className="premium-input" 
                  value={formData.descriptionAr} 
                  onChange={e => setFormData({...formData, descriptionAr: e.target.value})} 
                  style={{ minHeight: '120px', resize: 'vertical' }} 
                  placeholder={language === 'ar' ? 'وصف تفصيلي للمنتج باللغة العربية...' : 'Detailed product description in Arabic...'}
                  dir="rtl"
                />
              </div>
            </div>

            <div className="responsive-grid-2">
              <div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <label className="premium-label" style={{ margin: 0 }}>{language === 'ar' ? 'الفوائد الرئيسية (إنجليزي)' : 'Key Benefits (English)'}</label>
                  <button 
                    type="button" 
                    onClick={() => setFormData({...formData, keyBenefits: formData.keyBenefits ? formData.keyBenefits + '\n' : ' '})} 
                    style={{ padding: '4px', color: 'var(--primary)', background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                  >
                    <Plus size={20} />
                  </button>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {(formData.keyBenefits ? formData.keyBenefits.split('\n') : []).map((benefit, idx, arr) => (
                    <SwipeToDeleteInput
                      key={idx}
                      value={benefit.trim() === '' && benefit !== ' ' ? '' : benefit}
                      onChange={(val) => {
                        const newArr = [...arr];
                        newArr[idx] = val;
                        setFormData({...formData, keyBenefits: newArr.join('\n')});
                      }}
                      onDelete={() => {
                        const newArr = arr.filter((_, i) => i !== idx);
                        setFormData({...formData, keyBenefits: newArr.length > 0 ? newArr.join('\n') : ''});
                      }}
                      placeholder={language === 'ar' ? 'مثال: جودة عالية' : 'e.g. Premium quality'}
                      language={language}
                      dir="ltr"
                    />
                  ))}
                  {(!formData.keyBenefits) && (
                    <div style={{ color: '#94a3b8', fontSize: '13px', fontStyle: 'italic', padding: '8px 0', textAlign: 'center', border: '1px dashed #cbd5e1', borderRadius: '8px' }}>
                      {language === 'ar' ? 'لم تتم إضافة فوائد. انقر على إضافة للبدء.' : 'No benefits added. Click Add to start.'}
                    </div>
                  )}
                </div>
              </div>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <label className="premium-label" style={{ margin: 0 }}>{language === 'ar' ? 'الفوائد الرئيسية (عربي)' : 'Key Benefits (Arabic)'}</label>
                  <button 
                    type="button" 
                    onClick={() => setFormData({...formData, keyBenefitsAr: formData.keyBenefitsAr ? formData.keyBenefitsAr + '\n' : ' '})} 
                    style={{ padding: '4px', color: 'var(--primary)', background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                  >
                    <Plus size={20} />
                  </button>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {(formData.keyBenefitsAr ? formData.keyBenefitsAr.split('\n') : []).map((benefit, idx, arr) => (
                    <SwipeToDeleteInput
                      key={idx}
                      value={benefit.trim() === '' && benefit !== ' ' ? '' : benefit}
                      onChange={(val) => {
                        const newArr = [...arr];
                        newArr[idx] = val;
                        setFormData({...formData, keyBenefitsAr: newArr.join('\n')});
                      }}
                      onDelete={() => {
                        const newArr = arr.filter((_, i) => i !== idx);
                        setFormData({...formData, keyBenefitsAr: newArr.length > 0 ? newArr.join('\n') : ''});
                      }}
                      placeholder="جودة عالية"
                      language={language}
                      dir="rtl"
                    />
                  ))}
                  {(!formData.keyBenefitsAr) && (
                    <div style={{ color: '#94a3b8', fontSize: '13px', fontStyle: 'italic', padding: '8px 0', textAlign: 'center', border: '1px dashed #cbd5e1', borderRadius: '8px' }}>
                      {language === 'ar' ? 'لم تتم إضافة فوائد. انقر على إضافة للبدء.' : 'No benefits added. Click Add to start.'}
                    </div>
                  )}
                </div>
              </div>
            </div>
            </div>
          </div>

          {/* Right Col: Image Upload */}
          <div className="premium-card" style={{ padding: 0, overflow: 'hidden' }}>
            <div className="form-accordion-header" onClick={() => toggleSection('media')}>
              <h3 style={{ fontSize: '18px', fontWeight: 600, margin: 0, color: '#0f172a' }}>{language === 'ar' ? 'صور المنتج' : 'Product Media'}</h3>
              {expandedSections.media ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
            </div>
            
            <div className={`form-accordion-content ${expandedSections.media ? '' : 'collapsed'}`}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: '16px' }}>
              {formData.images && formData.images.map((img, index) => (
                <div 
                  key={index} 
                  draggable
                  onDragStart={(e) => handleImageDragStart(e, index)}
                  onDragOver={handleImageDragOver}
                  onDrop={(e) => handleImageDropReorder(e, index)}
                  style={{ position: 'relative', width: '160px', height: '160px', borderRadius: '12px', overflow: 'hidden', border: index === 0 ? '2px solid var(--primary)' : '1px solid #e2e8f0', cursor: 'grab', opacity: draggedImageIndex === index ? 0.5 : 1, backgroundColor: '#f8fafc' }}
                  onClick={() => openLightbox(formData.images, index)}
                >
                  <img src={img} alt={`Preview ${index}`} style={{ width: '100%', height: '100%', objectFit: 'cover', cursor: 'pointer' }} />
                  
                  <div style={{ position: 'absolute', top: '8px', right: '8px', display: 'flex', gap: '4px', zIndex: 2 }}>
                    <button 
                      type="button" 
                      onClick={(e) => { e.stopPropagation(); setCropperData({ isOpen: true, index, imageSrc: img }); }} 
                      style={{ backgroundColor: '#ffffff', boxShadow: '0 2px 4px rgba(0,0,0,0.1)', width: '28px', height: '28px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', border: 'none', cursor: 'pointer' }}
                      title="Crop Image"
                    >
                      <Crop size={14} color="#0f172a" />
                    </button>
                    <button 
                      type="button" 
                      onClick={(e) => { e.stopPropagation(); removeImage(index); }} 
                      style={{ backgroundColor: '#ffffff', boxShadow: '0 2px 4px rgba(0,0,0,0.1)', width: '28px', height: '28px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', border: 'none', cursor: 'pointer' }}
                      title="Delete Image"
                    >
                      <Trash2 size={14} color="#dc2626" />
                    </button>
                  </div>

                  {index === 0 && (
                    <span style={{ position: 'absolute', bottom: '8px', left: '8px', backgroundColor: 'rgba(0,0,0,0.7)', color: 'white', fontSize: '10px', padding: '4px 8px', borderRadius: '4px', fontWeight: 'bold' }}>MAIN</span>
                  )}
                </div>
              ))}
              
              <div 
                className={`premium-dropzone ${isDragging ? 'dragging' : ''}`}
                style={{ aspectRatio: '1' }}
                onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
              >
                <input 
                  type="file" 
                  accept="image/*" 
                  multiple
                  ref={fileInputRef} 
                  style={{ display: 'none' }} 
                  onChange={handleImageChange}
                />
                <div style={{ width: '40px', height: '40px', backgroundColor: isDragging ? '#dbeafe' : '#e2e8f0', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '12px', color: isDragging ? 'var(--primary)' : '#64748b', transition: 'all 0.2s' }}>
                  <UploadCloud size={20} />
                </div>
                <p style={{ margin: 0, fontSize: '13px', fontWeight: 600, color: isDragging ? 'var(--primary)' : '#475569' }}>{isDragging ? (language === 'ar' ? 'افلت الصورة هنا' : 'Drop Image Here') : (language === 'ar' ? 'إضافة صورة' : 'Add Image')}</p>
              </div>
            </div>
            </div>
          </div>
        </div>

        {/* Pricing & Offers */}
        <div className="premium-card" style={{ padding: 0, overflow: 'hidden' }}>
          <div className="form-accordion-header" onClick={() => toggleSection('pricing')}>
            <h3 style={{ fontSize: '18px', fontWeight: 600, margin: 0, color: '#0f172a' }}>{language === 'ar' ? 'التسعير والعروض' : 'Pricing & Offers'}</h3>
            {expandedSections.pricing ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
          </div>
          
          <div className={`form-accordion-content ${expandedSections.pricing ? '' : 'collapsed'}`}>
          <div className="responsive-grid-2">
            <div>
              <label className="premium-label">{language === 'ar' ? 'السعر الأساسي (جنيه)' : 'Regular Price (EGP)'}</label>
              <input type="number" step="0.01" className="premium-input" required value={formData.price} onChange={e => setFormData({...formData, price: e.target.value})} placeholder="0.00" />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '24px', alignItems: 'flex-end' }}>
            
            <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', height: '100%' }}>
              <div 
                style={{ backgroundColor: '#f8fafc', padding: '0 16px', borderRadius: '10px', border: '1px solid #e2e8f0', height: '51px', display: 'flex', alignItems: 'center', boxSizing: 'border-box', cursor: 'pointer', transition: 'all 0.2s' }}
                onClick={() => setFormData({...formData, hasOffer: !formData.hasOffer})}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
                  <span style={{ fontSize: '14px', fontWeight: 600, color: '#334155', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Tag size={16} color="var(--primary)" /> {language === 'ar' ? 'المنتج في تخفيض' : 'Product is on sale'}
                  </span>
                  
                  <div style={{ position: 'relative', display: 'inline-block', width: '44px', height: '24px' }}>
                    <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: formData.hasOffer ? 'var(--primary)' : '#cbd5e1', borderRadius: '24px', transition: '0.3s' }}></div>
                    <div style={{ position: 'absolute', left: formData.hasOffer ? '22px' : '2px', top: '2px', backgroundColor: '#fff', width: '20px', height: '20px', borderRadius: '50%', transition: '0.3s', boxShadow: '0 2px 4px rgba(0,0,0,0.2)' }}></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {formData.hasOffer && (
            <div style={{ marginTop: '24px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
              
              {/* Discount Type Toggle */}
              <div style={{ display: 'flex', gap: '8px', padding: '4px', backgroundColor: '#f1f5f9', borderRadius: '10px', width: 'fit-content' }}>
                <div 
                  onClick={() => setFormData({...formData, offerType: 'percentage'})}
                  style={{ padding: '8px 24px', borderRadius: '6px', cursor: 'pointer', backgroundColor: formData.offerType === 'percentage' ? '#ffffff' : 'transparent', color: formData.offerType === 'percentage' ? 'var(--primary)' : '#64748b', fontWeight: 600, fontSize: '14px', boxShadow: formData.offerType === 'percentage' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none', transition: 'all 0.2s' }}
                >
                  Percentage (%)
                </div>
                <div 
                  onClick={() => setFormData({...formData, offerType: 'fixed'})}
                  style={{ padding: '8px 24px', borderRadius: '6px', cursor: 'pointer', backgroundColor: formData.offerType === 'fixed' ? '#ffffff' : 'transparent', color: formData.offerType === 'fixed' ? 'var(--primary)' : '#64748b', fontWeight: 600, fontSize: '14px', boxShadow: formData.offerType === 'fixed' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none', transition: 'all 0.2s' }}
                >
                  Fixed Sale Price (EGP)
                </div>
              </div>

              {/* Offer Value Input */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', alignItems: 'flex-start' }}>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                    <label className="premium-label" style={{ margin: 0 }}>
                      {formData.offerType === 'percentage' ? 'Discount Percentage (%)' : 'Final Sale Price (EGP)'}
                    </label>
                    {formData.price && formData.offerPrice && parseFloat(formData.offerPrice) < parseFloat(formData.price) && (
                      <span style={{ backgroundColor: '#fee2e2', color: '#ef4444', padding: '4px 10px', borderRadius: '6px', fontSize: '12px', fontWeight: 600 }}>
                        -{((parseFloat(formData.price) - parseFloat(formData.offerPrice)) / parseFloat(formData.price) * 100).toFixed(1)}% OFF
                      </span>
                    )}
                  </div>
                  
                  {formData.offerType === 'percentage' ? (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <input 
                        type="number" 
                        min="1"
                        max="99"
                        className="premium-input" 
                        required={formData.hasOffer} 
                        value={formData.offerPercentage} 
                        onChange={(e) => {
                          const pct = e.target.value;
                          const newOfferPrice = (formData.price && pct) ? (parseFloat(formData.price) * (1 - (parseFloat(pct) / 100))).toFixed(2) : '';
                          setFormData({...formData, offerPercentage: pct, offerPrice: newOfferPrice});
                        }} 
                        style={{ border: '1px solid var(--primary)', backgroundColor: '#fff5f5' }} 
                        placeholder="e.g. 20" 
                      />
                      {formData.offerPrice && (
                        <span style={{ fontSize: '14px', color: '#64748b', fontWeight: 500, whiteSpace: 'nowrap' }}>
                          Final: <strong style={{ color: '#0f172a' }}>{formData.offerPrice} EGP</strong>
                        </span>
                      )}
                    </div>
                  ) : (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <input 
                        type="number" 
                        step="0.01" 
                        className="premium-input" 
                        required={formData.hasOffer} 
                        max={formData.price ? parseFloat(formData.price) - 0.01 : undefined}
                        value={formData.offerPrice} 
                        onChange={(e) => {
                          const val = e.target.value;
                          const pct = (formData.price && val) ? ((parseFloat(formData.price) - parseFloat(val)) / parseFloat(formData.price) * 100).toFixed(1) : '';
                          setFormData({...formData, offerPrice: val, offerPercentage: pct});
                        }} 
                        style={{ border: '1px solid var(--primary)', backgroundColor: '#fff5f5' }} 
                        placeholder="e.g. 160" 
                      />
                    </div>
                  )}
                </div>
              </div>

              {/* Offer Dates */}
              <div className="responsive-grid-2">
                <div>
                  <label className="premium-label">{language === 'ar' ? 'تاريخ بداية العرض (اختياري)' : 'Sale Start Date/Time (Optional)'}</label>
                  <input 
                    type="datetime-local" 
                    className="premium-input" 
                    value={formData.offerStartDate} 
                    onChange={e => setFormData({...formData, offerStartDate: e.target.value})} 
                  />
                </div>
                <div>
                  <label className="premium-label">{language === 'ar' ? 'تاريخ نهاية العرض (اختياري)' : 'Sale End Date/Time (Optional)'}</label>
                  <input 
                    type="datetime-local" 
                    className="premium-input" 
                    value={formData.offerEndDate} 
                    onChange={e => setFormData({...formData, offerEndDate: e.target.value})} 
                  />
                </div>
              </div>

            </div>
          )}
          </div>
        </div>

        {/* Inventory & Visibility */}
        <div className="premium-card" style={{ padding: 0, overflow: 'hidden' }}>
          <div className="form-accordion-header" onClick={() => toggleSection('inventory')}>
            <h3 style={{ fontSize: '18px', fontWeight: 600, margin: 0, color: '#0f172a' }}>{t('inventoryVisibility')}</h3>
            {expandedSections.inventory ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
          </div>
          
          <div className={`form-accordion-content ${expandedSections.inventory ? '' : 'collapsed'}`}>
          <div className="responsive-grid-2">
            <div>
              <label className="premium-label">{language === 'ar' ? 'كمية المخزون الأساسية' : 'Base Stock Quantity'}</label>
              <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                <input type="number" className="premium-input" value={formData.stock} onChange={e => setFormData({...formData, stock: e.target.value === '' ? '' : Number(e.target.value)})} style={{ width: '120px' }} min="0" placeholder={language === 'ar' ? 'غير محدود' : 'Unlimited'} />
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <label className="toggle-switch">
                    <input type="checkbox" checked={formData.showStock} onChange={e => setFormData({...formData, showStock: e.target.checked})} />
                    <span className="toggle-slider"></span>
                  </label>
                  <span style={{ fontSize: '14px', color: '#475569', cursor: 'pointer', fontWeight: 500 }} onClick={() => setFormData({...formData, showStock: !formData.showStock})}>{language === 'ar' ? 'إظهار كمية المخزون' : 'Show stock quantity'}</span>
                </div>
              </div>
              <p style={{ margin: '8px 0 0 0', fontSize: '12px', color: '#64748b' }}>{language === 'ar' ? 'إذا قمت بإضافة أنواع وخصائص بالأسفل، سيتم الاعتماد على مخزون الخصائص.' : 'If you add variants below, the variant stock will take precedence.'}</p>
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', marginTop: '24px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <label className="toggle-switch">
                  <input type="checkbox" checked={formData.featured} onChange={e => setFormData({...formData, featured: e.target.checked})} />
                  <span className="toggle-slider"></span>
                </label>
                <span style={{ fontSize: '15px', fontWeight: 600, color: '#334155', cursor: 'pointer' }} onClick={() => setFormData({...formData, featured: !formData.featured})}>{language === 'ar' ? 'منتج مميز' : 'Featured Product'}</span>
              </div>
              <p style={{ margin: '0 0 0 48px', fontSize: '13px', color: '#64748b' }}>{language === 'ar' ? 'عرض في الأقسام المميزة' : 'Show in featured sections'}</p>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '16px' }}>
                <label className="toggle-switch">
                  <input type="checkbox" checked={formData.isActive} onChange={e => setFormData({...formData, isActive: e.target.checked})} />
                  <span className="toggle-slider"></span>
                </label>
                <span style={{ fontSize: '15px', fontWeight: 600, color: formData.isActive ? '#22c55e' : '#64748b', cursor: 'pointer' }} onClick={() => setFormData({...formData, isActive: !formData.isActive})}>{formData.isActive ? (language === 'ar' ? 'نشط (مرئي)' : 'Active (Visible)') : (language === 'ar' ? 'غير نشط (مخفي)' : 'Inactive (Hidden)')}</span>
              </div>
              <p style={{ margin: '0 0 0 48px', fontSize: '13px', color: '#64748b' }}>{language === 'ar' ? 'إذا كان غير نشط، سيتم إخفاء المنتج تماماً من المتجر' : 'If inactive, product will be completely hidden from store'}</p>
          </div>
          </div>
          </div>
        </div>

        <ProductOptionsBuilder 
          formData={formData} 
          setFormData={setFormData} 
          globalOptions={
            (() => {
              if (!config || !config.productOptions || config.productOptions.length === 0) return defaultOptions;
              const opts = config.productOptions.map(opt => {
                if (typeof opt === 'string') {
                  const defaultMatch = defaultOptions.find(d => d.name.toLowerCase() === opt.toLowerCase());
                  return { name: opt, values: defaultMatch ? defaultMatch.values : [] };
                }
                return opt;
              });
              return opts;
            })()
          } 
        />

        {/* Customer Reviews Section */}
        <div className="premium-card" style={{ padding: 0, overflow: 'hidden' }}>
          <div className="form-accordion-header" onClick={() => toggleSection('reviews')}>
            <h3 style={{ fontSize: '18px', fontWeight: 600, margin: 0, color: '#0f172a' }}>{language === 'ar' ? 'تقييمات العملاء' : 'Customer Reviews'}</h3>
            {expandedSections.reviews ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
          </div>
          
          <div className={`form-accordion-content ${expandedSections.reviews ? '' : 'collapsed'}`}>
          <p style={{ fontSize: '13px', color: '#64748b', marginBottom: '24px' }}>
            {language === 'ar' ? 'قم برفع صور لتقييمات العملاء (واتساب، ماسنجر، إلخ) لعرضها في صفحة المنتج.' : 'Upload screenshots of customer reviews (WhatsApp, Messenger, etc.) to show on this product\'s page.'}
          </p>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: '16px' }}>
            {formData.reviewImages && formData.reviewImages.map((img, index) => (
              <div 
                key={index} 
                draggable
                onDragStart={(e) => handleReviewDragStart(e, index)}
                onDragOver={handleReviewDragOver}
                onDrop={(e) => handleReviewDropReorder(e, index)}
                style={{ position: 'relative', width: '160px', height: '160px', borderRadius: '12px', overflow: 'hidden', border: '1px solid #e2e8f0', cursor: 'grab', opacity: draggedReviewIndex === index ? 0.5 : 1, backgroundColor: '#f8fafc' }}
                onClick={() => openLightbox(formData.reviewImages, index)}
              >
                <img src={img} alt={`Review ${index}`} style={{ width: '100%', height: '100%', objectFit: 'cover', cursor: 'pointer' }} />
                <button 
                  type="button" 
                  onClick={(e) => { e.stopPropagation(); removeReviewImage(index); }} 
                  style={{ position: 'absolute', top: '8px', right: '8px', backgroundColor: '#ffffff', boxShadow: '0 2px 4px rgba(0,0,0,0.1)', width: '28px', height: '28px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', border: 'none', cursor: 'pointer', zIndex: 2 }}
                >
                  <Trash2 size={14} color="#dc2626" />
                </button>
              </div>
            ))}
            
            <div 
              className={`premium-dropzone ${isReviewDragging ? 'dragging' : ''}`}
              style={{ aspectRatio: '1' }}
              onDragOver={(e) => { e.preventDefault(); setIsReviewDragging(true); }}
              onDragLeave={() => setIsReviewDragging(false)}
              onDrop={handleReviewDrop}
              onClick={() => reviewInputRef.current?.click()}
            >
              <input 
                type="file" 
                accept="image/*" 
                multiple 
                hidden 
                ref={reviewInputRef}
                onChange={handleReviewFileInput} 
              />
              <UploadCloud size={24} color={isReviewDragging ? 'var(--primary)' : '#94a3b8'} style={{ marginBottom: '8px' }} />
              <div style={{ fontSize: '13px', fontWeight: 500, color: '#334155' }}>{language === 'ar' ? 'رفع صورة' : 'Upload Screenshot'}</div>
            </div>
          </div>
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '16px', marginTop: '16px' }}>
          <button type="button" className="btn btn-secondary" onClick={() => navigate('/diaradmin26/products')} style={{ padding: '12px 32px', backgroundColor: '#ffffff', color: '#475569', border: '1px solid #cbd5e1', borderRadius: '8px' }}>
            {language === 'ar' ? 'إلغاء' : 'Cancel'}
          </button>
          <button type="submit" className="btn btn-primary" disabled={isSubmitting || formData.images.length === 0} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 40px', borderRadius: '8px', fontSize: '15px' }}>
            {isSubmitting ? (
              <div className="spinner" style={{ width: '18px', height: '18px', border: '2px solid rgba(255,255,255,0.3)', borderTopColor: 'white', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
            ) : <Save size={18} />}
            {isSubmitting ? (language === 'ar' ? 'جاري الحفظ...' : 'Saving...') : (isEditing ? (language === 'ar' ? 'تحديث المنتج' : 'Update Product') : (language === 'ar' ? 'حفظ المنتج' : 'Save Product'))}
          </button>
        </div>
      </form>
    </div>
  );
}
