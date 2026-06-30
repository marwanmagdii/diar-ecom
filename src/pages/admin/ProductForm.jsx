import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Save, UploadCloud, X, Tag, Plus, BarChart2, Trash2, Crop } from 'lucide-react';

import ProductOptionsBuilder, { VariantOptionSelector } from './ProductOptionsBuilder';
import ImageLightbox from '../../components/ImageLightbox';
import ImageCropperModal from '../../components/ImageCropperModal';
import { compressImage } from '../../utils/imageCompression';
import { defaultOptions } from '../../utils/constants';
import { useStore } from '../../store';

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
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '32px' }}>
        <button className="icon-btn" onClick={() => navigate('/diaradmin26/products')} style={{ backgroundColor: '#ffffff', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}><ArrowLeft size={20} /></button>
        <div style={{ flex: 1 }}>
          <h2 className="headline-md m-0">{isEditing ? 'Edit Product' : 'Add New Product'}</h2>
          <p style={{ margin: '4px 0 0 0', color: '#64748b', fontSize: '14px' }}>Fill in the details below to {isEditing ? 'update' : 'create'} a product.</p>
        </div>
        {isEditing && (
          <button 
            type="button"
            className="btn" 
            style={{ display: 'flex', alignItems: 'center', gap: '8px', backgroundColor: '#e0e7ff', color: '#4f46e5', border: 'none' }}
            onClick={() => navigate(`/diaradmin26/products/${id}/analysis`)}
          >
            <BarChart2 size={20} /> View Analysis
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
        <div className="product-form-grid" style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '24px' }}>
          
          {/* Left Col: Details */}
          <div className="premium-card">
            <h3 style={{ fontSize: '18px', fontWeight: 600, margin: '0 0 24px 0', color: '#0f172a' }}>Basic Information</h3>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '24px' }}>
              <div>
                <label className="premium-label">Product Name (English)</label>
                <input type="text" className="premium-input" required value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} placeholder="E.g. Premium Cotton T-Shirt" />
              </div>
              <div>
                <label className="premium-label">Product Name (Arabic)</label>
                <input type="text" className="premium-input" value={formData.titleAr} onChange={e => setFormData({...formData, titleAr: e.target.value})} placeholder="قميص قطن فاخر" dir="rtl" />
              </div>
            </div>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '24px' }}>
              <div style={{ marginBottom: '24px', gridColumn: '1 / -1' }}>
                <label className="premium-label">{language === 'ar' ? 'الفئة' : 'Category'}</label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '12px', padding: '16px', border: '1px solid var(--outline-variant)', borderRadius: '12px', backgroundColor: '#f8fafc', maxHeight: '300px', overflowY: 'auto' }}>
                  {config.categories?.map(cat => {
                    const catName = typeof cat === 'string' ? cat : cat.name;
                    return (
                      <div key={catName} style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontWeight: 'bold' }}>
                          <input 
                            type="checkbox" 
                            name="category"
                            checked={formData.category === catName}
                            onChange={() => setFormData({...formData, category: catName})}
                            style={{ width: '16px', height: '16px', accentColor: 'var(--primary)' }}
                          />
                          <span style={{ fontSize: '14px', color: 'var(--on-surface)' }}>{language === 'ar' && cat.nameAr ? cat.nameAr : catName}</span>
                        </label>
                        {typeof cat === 'object' && cat.subcategories?.map((sub, idx) => (
                          <label key={`${catName}-${sub}`} style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', marginLeft: '24px' }}>
                            <input 
                              type="checkbox" 
                              name="category"
                              checked={formData.category === sub}
                              onChange={() => setFormData({...formData, category: sub})}
                              style={{ width: '16px', height: '16px', accentColor: 'var(--primary)' }}
                            />
                            <span style={{ fontSize: '14px', color: 'var(--on-surface-variant)' }}>{language === 'ar' && cat.subcategoriesAr?.[idx] ? cat.subcategoriesAr[idx] : sub}</span>
                          </label>
                        ))}
                      </div>
                    );
                  })}
                </div>
              </div>
              <div>
                <label className="premium-label">Product Background Color (Optional)</label>
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
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '24px' }}>
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
                  const optData = optionsList.find(o => o.name.toLowerCase() === attrName.toLowerCase());
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

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '24px' }}>
              <div>
                <label className="premium-label">Description (English)</label>
                <textarea 
                  className="premium-input" 
                  value={formData.description} 
                  onChange={e => setFormData({...formData, description: e.target.value})} 
                  style={{ minHeight: '120px', resize: 'vertical' }} 
                  placeholder="Product description in English..."
                />
              </div>
              <div>
                <label className="premium-label">Description (Arabic)</label>
                <textarea 
                  className="premium-input" 
                  value={formData.descriptionAr} 
                  onChange={e => setFormData({...formData, descriptionAr: e.target.value})} 
                  style={{ minHeight: '120px', resize: 'vertical' }} 
                  placeholder="وصف المنتج بالعربية..."
                  dir="rtl"
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div>
                <label className="premium-label">Key Benefits (English, one per line)</label>
                <textarea 
                  className="premium-input" 
                  value={formData.keyBenefits} 
                  onChange={e => setFormData({...formData, keyBenefits: e.target.value})} 
                  style={{ minHeight: '100px', resize: 'vertical' }} 
                  placeholder="Premium quality&#10;Authentic product&#10;Satisfaction guaranteed"
                />
              </div>
              <div>
                <label className="premium-label">Key Benefits (Arabic, one per line)</label>
                <textarea 
                  className="premium-input" 
                  value={formData.keyBenefitsAr} 
                  onChange={e => setFormData({...formData, keyBenefitsAr: e.target.value})} 
                  style={{ minHeight: '100px', resize: 'vertical' }} 
                  placeholder="جودة عالية&#10;منتج أصلي&#10;مضمون"
                  dir="rtl"
                />
              </div>
            </div>
          </div>

          {/* Right Col: Image Upload */}
          <div className="premium-card">
            <h3 style={{ fontSize: '18px', fontWeight: 600, margin: '0 0 24px 0', color: '#0f172a' }}>Product Media</h3>
            
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
                <p style={{ margin: 0, fontSize: '13px', fontWeight: 600, color: isDragging ? 'var(--primary)' : '#475569' }}>{isDragging ? 'Drop Image Here' : 'Add Image'}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Pricing & Offers */}
        <div className="premium-card">
          <h3 style={{ fontSize: '18px', fontWeight: 600, margin: '0 0 24px 0', color: '#0f172a' }}>Pricing & Offers</h3>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', alignItems: 'flex-start', marginBottom: '24px' }}>
            <div>
              <label className="premium-label">Regular Price (EGP)</label>
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
                    <Tag size={16} color="var(--primary)" /> Product is on sale
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
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', alignItems: 'flex-start' }}>
                <div>
                  <label className="premium-label">Sale Start Date/Time (Optional)</label>
                  <input 
                    type="datetime-local" 
                    className="premium-input" 
                    value={formData.offerStartDate} 
                    onChange={e => setFormData({...formData, offerStartDate: e.target.value})} 
                  />
                </div>
                <div>
                  <label className="premium-label">Sale End Date/Time (Optional)</label>
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

        {/* Inventory & Visibility */}
        <div className="premium-card" style={{ gap: '24px' }}>
          <h3 style={{ fontSize: '18px', fontWeight: 600, margin: '0 0 8px 0', color: '#0f172a' }}>{t('inventoryVisibility')}</h3>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', alignItems: 'center' }}>
            <div>
              <label className="premium-label">Base Stock Quantity</label>
              <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                <input type="number" className="premium-input" value={formData.stock} onChange={e => setFormData({...formData, stock: e.target.value === '' ? '' : Number(e.target.value)})} style={{ width: '120px' }} min="0" placeholder="Unlimited" />
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <label className="toggle-switch">
                    <input type="checkbox" checked={formData.showStock} onChange={e => setFormData({...formData, showStock: e.target.checked})} />
                    <span className="toggle-slider"></span>
                  </label>
                  <span style={{ fontSize: '14px', color: '#475569', cursor: 'pointer', fontWeight: 500 }} onClick={() => setFormData({...formData, showStock: !formData.showStock})}>Show stock quantity</span>
                </div>
              </div>
              <p style={{ margin: '8px 0 0 0', fontSize: '12px', color: '#64748b' }}>If you add variants below, the variant stock will take precedence.</p>
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', marginTop: '24px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <label className="toggle-switch">
                  <input type="checkbox" checked={formData.featured} onChange={e => setFormData({...formData, featured: e.target.checked})} />
                  <span className="toggle-slider"></span>
                </label>
                <span style={{ fontSize: '15px', fontWeight: 600, color: '#334155', cursor: 'pointer' }} onClick={() => setFormData({...formData, featured: !formData.featured})}>Featured Product</span>
              </div>
              <p style={{ margin: '0 0 0 48px', fontSize: '13px', color: '#64748b' }}>Show in featured sections</p>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '16px' }}>
                <label className="toggle-switch">
                  <input type="checkbox" checked={formData.isActive} onChange={e => setFormData({...formData, isActive: e.target.checked})} />
                  <span className="toggle-slider"></span>
                </label>
                <span style={{ fontSize: '15px', fontWeight: 600, color: formData.isActive ? '#22c55e' : '#64748b', cursor: 'pointer' }} onClick={() => setFormData({...formData, isActive: !formData.isActive})}>{formData.isActive ? 'Active (Visible)' : 'Inactive (Hidden)'}</span>
              </div>
              <p style={{ margin: '0 0 0 48px', fontSize: '13px', color: '#64748b' }}>If inactive, product will be completely hidden from store</p>
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
        <div className="premium-card">
          <h3 style={{ fontSize: '18px', fontWeight: 600, margin: '0 0 8px 0', color: '#0f172a' }}>Customer Reviews (Screenshots)</h3>
          <p style={{ fontSize: '13px', color: '#64748b', marginBottom: '24px' }}>
            Upload screenshots of customer reviews (WhatsApp, Messenger, etc.) to show on this product's page.
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
              <div style={{ fontSize: '13px', fontWeight: 500, color: '#334155' }}>Upload Screenshot</div>
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '16px', marginTop: '16px' }}>
          <button type="button" className="btn btn-secondary" onClick={() => navigate('/diaradmin26/products')} style={{ padding: '12px 32px', backgroundColor: '#ffffff', color: '#475569', border: '1px solid #cbd5e1', borderRadius: '8px' }}>
            Cancel
          </button>
          <button type="submit" className="btn btn-primary" disabled={isSubmitting || formData.images.length === 0} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 40px', borderRadius: '8px', fontSize: '15px' }}>
            {isSubmitting ? (
              <div className="spinner" style={{ width: '18px', height: '18px', border: '2px solid rgba(255,255,255,0.3)', borderTopColor: 'white', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
            ) : <Save size={18} />}
            {isSubmitting ? 'Saving...' : (isEditing ? 'Update Product' : 'Save Product')}
          </button>
        </div>
      </form>
    </div>
  );
}
