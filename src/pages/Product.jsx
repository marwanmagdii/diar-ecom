import React, { useState, useEffect, useMemo } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, ArrowRight, ShoppingBag } from 'lucide-react';
import { useProducts } from '../context/ProductContext';
import { useCart } from '../context/CartContext';
import { useToast } from '../context/ToastContext';
import { useLanguage } from '../context/LanguageContext';
import { useCustomerTracking } from '../context/CustomerTrackingContext';
import { Check, Sparkles } from 'lucide-react';
import { getColorHex } from '../utils/colors';
import ProductCard from '../components/ProductCard';



export default function Product() {
  const { id } = useParams();
  const { products, loading, error } = useProducts();
  const productData = products.find(p => p.id === id) || products[0]; // fallback
  const { cart, addToCart, updateQuantity } = useCart();
  const { trackEvent } = useCustomerTracking();
  const { addToast } = useToast();
  const { language, t } = useLanguage();
  const navigate = useNavigate();
  
  // Synthesize a virtual variant for the main product (Basic Information) so it acts like a variant
  const product = React.useMemo(() => {
    if (!productData) return null;
    const p = { ...productData };
    
    const mainAttributes = {};
    const basicNames = { color: 'Color', size: 'Size', material: 'Material', weight: 'Weight', style: 'Style' };
    Object.keys(basicNames).forEach(attr => {
      if (p[attr]) {
         const val = Array.isArray(p[attr]) ? p[attr][0] : p[attr].split(',')[0];
         mainAttributes[basicNames[attr]] = val.trim();
      }
    });

    if (Object.keys(mainAttributes).length > 0 && p.options?.length > 0) {
       p.variants = [...(p.variants || [])];
       const exists = p.variants.some(v => v.attributes && JSON.stringify(v.attributes) === JSON.stringify(mainAttributes));
       if (!exists) {
         p.variants.unshift({
           id: 'main-virtual-variant',
           attributes: mainAttributes,
           price: p.price,
           offerPrice: p.offerPrice,
           stock: p.stock,
           image: p.image,
           images: p.images
         });
       }
    }
    return p;
  }, [productData]);

  // Backwards compatibility for legacy products vs new variant products
  const hasVariants = product?.options?.length > 0 && product?.variants?.length > 0;
  
  // State for selected options
  const [selectedOptions, setSelectedOptions] = useState({});
  const [selectedColor, setSelectedColor] = useState(null); // legacy
  const [initializedId, setInitializedId] = useState(null);
  const [lightboxImage, setLightboxImage] = useState(null);

  const relatedProducts = useMemo(() => {
    if (!products || !product) return [];
    return products
      .filter(p => p.category === product.category && p.id !== product.id)
      .sort((a, b) => (b.hasOffer ? 1 : 0) - (a.hasOffer ? 1 : 0))
      .slice(0, 4);
  }, [products, product]);

  useEffect(() => {
    window.scrollTo(0, 0);
    if (product) {
      trackEvent('view_product', { 
        productId: product.id, 
        productName: product.title || product.id,
        category: product.category,
        price: product.price
      });
    }
  }, [id, product?.id]);

  // Initialize defaults
  useEffect(() => {
    if (!product || initializedId === product.id) return;
    if (hasVariants) {
      const initial = {};
      if (product.variants && product.variants.length > 0) {
        const v = product.variants[0];
        product.options.forEach(opt => {
          if (v.attributes && v.attributes[opt.name]) {
            initial[opt.name] = v.attributes[opt.name].split(',')[0].trim();
          } else if (opt.values && opt.values.length > 0) {
            initial[opt.name] = opt.values[0];
          }
        });
      } else {
        product.options.forEach(opt => {
          if (opt.values && opt.values.length > 0) {
            initial[opt.name] = opt.values[0];
          }
        });
      }
      setSelectedOptions(initial);
      setInitializedId(product.id);
    } else {
      const colors = Array.isArray(product.color) ? product.color : (product.color ? [product.color] : []);
      if (colors.length > 0) {
        setSelectedColor(colors[0]);
      }
      setInitializedId(product.id);
    }
  }, [product, hasVariants, initializedId]);

  // Find active variant
  const activeVariant = useMemo(() => {
    if (!hasVariants || !product?.variants) return null;
    return product.variants.find(v => {
      if (!v.attributes) return false;
      return Object.entries(selectedOptions).every(([k, val]) => !v.attributes[k] || v.attributes[k].split(',').map(s=>s.trim()).includes(val));
    });
  }, [selectedOptions, hasVariants, product]);

  // Determine current image
  const allImages = useMemo(() => {
    if (!product) return [];
    
    // Variant image takes precedence
    if (activeVariant?.images && activeVariant.images.length > 0) {
      return [...activeVariant.images];
    } else if (activeVariant?.image) {
       return [activeVariant.image];
    }
    
    // Legacy color images
    if (selectedColor && product.colorImages && product.colorImages[selectedColor]) {
      const cImg = product.colorImages[selectedColor];
      return Array.isArray(cImg) ? cImg : [cImg];
    }
    
    return product.images?.length > 0 ? product.images : (product.image ? [product.image] : []);
  }, [product, activeVariant, selectedColor]);
  
  const defaultImage = allImages[0] || '';
  const [mainImage, setMainImage] = useState(defaultImage);

  useEffect(() => {
    setMainImage(allImages[0] || '');
  }, [allImages, selectedOptions, selectedColor]);

  if (loading) return (
    <div className="container" style={{ padding: '48px 0', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '50vh', color: '#64748b' }}>
      <div className="spinner" style={{ margin: '0 auto 16px', border: '3px solid #f3f3f3', borderTop: '3px solid var(--primary)', borderRadius: '50%', width: '40px', height: '40px', animation: 'spin 1s linear infinite' }}></div>
      <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
      <p style={{ fontWeight: 500 }}>{t('loading')}</p>
    </div>
  );

  if (error) return (
    <div className="container" style={{ padding: '48px 0', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '50vh', textAlign: 'center' }}>
      <h2 style={{ color: '#dc2626', marginBottom: '16px' }}>{t('errorLoadingProduct')}</h2>
      <p style={{ color: '#475569', marginBottom: '24px' }}>{error}</p>
      <button className="btn btn-primary" onClick={() => window.location.reload()}>{t('tryAgain')}</button>
    </div>
  );

  if (!product) return (
    <div className="container" style={{ padding: '48px 0', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '50vh', textAlign: 'center' }}>
      <h2 style={{ color: '#0f172a', marginBottom: '16px' }}>{t('productNotFound')}</h2>
      <p style={{ color: '#475569', marginBottom: '24px' }}>{language === 'ar' ? 'المنتج الذي تبحث عنه غير موجود.' : 'The product you are looking for does not exist.'}</p>
      <Link to="/shop" className="btn btn-primary">{t('backToShop')}</Link>
    </div>
  );

  // Determine price and stock
  let currentPrice = Boolean(product.offerPrice) ? Number(product.offerPrice) : Number(product.price);
  let currentStock = (product.stock === null || product.stock === undefined || product.stock === '') ? Infinity : Number(product.stock);
  
  if (hasVariants && activeVariant) {
    if (activeVariant.offerPrice) {
      currentPrice = Number(activeVariant.offerPrice);
    } else if (activeVariant.price) {
      currentPrice = Number(activeVariant.price);
    }
    
    if (activeVariant.stock !== '' && activeVariant.stock !== null && activeVariant.stock !== undefined) {
      currentStock = Number(activeVariant.stock);
    }
  } else if (!hasVariants && selectedColor && product.colorPrices && product.colorPrices[selectedColor]) {
    currentPrice = Number(product.colorPrices[selectedColor]);
  }

  const handleOptionSelect = (optionName, value) => {
    setSelectedOptions(prev => {
      const next = { ...prev, [optionName]: value };
      
      // Is there a variant that matches 'next' exactly?
      const exactMatch = product.variants.find(v => {
        if (!v.attributes) return false;
        return Object.entries(next).every(([k, vAttr]) => {
           return !v.attributes[k] || v.attributes[k].split(',').map(s=>s.trim()).includes(vAttr);
        });
      });
      
      if (exactMatch) return next;
      
      // If not, find the FIRST variant that has this new option value
      const fallbackVariant = product.variants.find(v => {
        if (!v.attributes) return false;
        return !v.attributes[optionName] || v.attributes[optionName].split(',').map(s=>s.trim()).includes(value);
      });
      
      if (fallbackVariant) {
         // Auto-correct all other options to match this fallback variant
         const corrected = { ...next };
         product.options.forEach(opt => {
           if (opt.name !== optionName) {
             if (fallbackVariant.attributes && fallbackVariant.attributes[opt.name]) {
               const validVals = fallbackVariant.attributes[opt.name].split(',').map(s=>s.trim());
               if (!validVals.includes(corrected[opt.name])) {
                 corrected[opt.name] = validVals[0]; // Auto-select the first valid value
               }
             }
           }
         });
         return corrected;
      }
      
      return next;
    });
  };

  const handleAdd = () => {
    let cartItemData = { 
      id: product.id,
      title: product.title,
      titleAr: product.titleAr,
      category: product.category,
      price: currentPrice, 
      image: mainImage 
    };
    
    if (hasVariants) {
      cartItemData.selectedOptions = selectedOptions;
      cartItemData.activeVariantId = activeVariant?.id;
    } else {
      cartItemData.selectedColor = selectedColor;
    }
    
    addToCart(cartItemData, 1);
    addToast(`${t('addedToCart')}: ${language === 'ar' && product.titleAr ? product.titleAr : product.title}`);
  };

  // Determine Cart Item ID for Quantity Control
  let cartItemId = `${product.id}-no-color-no-size`;
  if (hasVariants) {
    const optionsHash = btoa(encodeURIComponent(JSON.stringify(selectedOptions)));
    cartItemId = `${product.id}-${optionsHash}`;
  } else if (selectedColor) {
    cartItemId = `${product.id}-${selectedColor}-no-size`;
  }
  
  const cartItem = cart.find(item => {
     if (hasVariants) {
       if (item.id !== product.id) return false;
       return JSON.stringify(item.selectedOptions) === JSON.stringify(selectedOptions);
     }
     if (selectedColor) return item.id === product.id && item.selectedColor === selectedColor;
     return item.id === product.id;
  });
  const cartQty = cartItem ? cartItem.qty : 0;

  return (
    <>
      <div className="container" style={{ paddingTop: '16px', paddingBottom: '8px' }}>
        <button 
          onClick={() => navigate(-1)} 
          className="glass-back-btn"
          style={{ 
            display: 'inline-flex', 
            alignItems: 'center', 
            gap: '8px', 
            background: 'rgba(255, 255, 255, 0.7)', 
            backdropFilter: 'blur(16px)',
            WebkitBackdropFilter: 'blur(16px)',
            border: '1px solid rgba(0, 0, 0, 0.04)', 
            borderRadius: '100px', 
            cursor: 'pointer', 
            padding: '8px 20px 8px 16px', 
            color: 'var(--on-surface)', 
            fontWeight: 600,
            boxShadow: '0 4px 16px rgba(0,0,0,0.06), 0 1px 4px rgba(0,0,0,0.02)',
            transition: 'all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1)'
          }}
          aria-label="Go Back"
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-2px) scale(1.02)';
            e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.08), 0 4px 8px rgba(0,0,0,0.04)';
            e.currentTarget.style.background = 'rgba(255, 255, 255, 0.9)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0) scale(1)';
            e.currentTarget.style.boxShadow = '0 4px 16px rgba(0,0,0,0.06), 0 1px 4px rgba(0,0,0,0.02)';
            e.currentTarget.style.background = 'rgba(255, 255, 255, 0.7)';
          }}
          onMouseDown={(e) => {
            e.currentTarget.style.transform = 'scale(0.98)';
          }}
          onMouseUp={(e) => {
            e.currentTarget.style.transform = 'translateY(-2px) scale(1.02)';
          }}
        >
          {language === 'ar' ? <ArrowRight size={18} /> : <ArrowLeft size={18} />}
          <span style={{ fontSize: '14px', letterSpacing: '0.2px' }}>{language === 'ar' ? 'رجوع' : 'Back'}</span>
        </button>
      </div>


      <main className="container mb-4">
        <div className="product-view-layout">
          <div className="left-column" style={{ display: 'flex', flexDirection: 'column' }}>
            <div className="vertical-gallery-container">
              {allImages.length > 1 && (
                <div className="gallery-thumbnails">
                  {allImages.map((img, idx) => (
                    <div 
                      key={idx} 
                      className={`gallery-thumbnail ${mainImage === img ? 'active' : ''}`}
                      onClick={() => setMainImage(img)}
                    >
                      <img src={img} alt={`${product.title} view ${idx + 1}`} />
                    </div>
                  ))}
                </div>
              )}
              <div className="gallery-main-image" style={{ backgroundColor: product.bgColor }}>
                <img src={mainImage} alt={product.title} />
              </div>
            </div>

          </div>

          <div className="product-view-info">
            {(() => {
              const getLocalizedText = (text) => {
                if (!text) return text;
                if (String(text).includes(' / ')) {
                  const parts = String(text).split(' / ');
                  return language === 'ar' ? (parts[1]?.trim() || parts[0].trim()) : parts[0].trim();
                }
                if (language === 'ar') {
                  const dict = {
                    'color': 'اللون', 'size': 'المقاس', 'material': 'الخامة', 'weight': 'الوزن', 'style': 'الستايل',
                    'white': 'أبيض', 'black': 'أسود', 'red': 'أحمر', 'blue': 'أزرق', 'green': 'أخضر', 'yellow': 'أصفر',
                    'gray': 'رمادي', 'silver': 'فضي', 'gold': 'ذهبي', 'pink': 'وردي', 'purple': 'بنفسجي', 'brown': 'بني',
                    'navy': 'كحلي', 'beige': 'بيج', 'orange': 'برتقالي', 'maroon': 'عنابي', 'teal': 'تركواز',
                    'metal': 'معدن', 'plastic': 'بلاستيك', 'wood': 'خشب', 'glass': 'زجاج', 'leather': 'جلد', 'cotton': 'قطن',
                    'modern': 'حديث', 'classic': 'كلاسيكي', 'casual': 'كاجوال', 'formal': 'رسمي', 'sport': 'رياضي'
                  };
                  const lower = String(text).toLowerCase().trim();
                  if (dict[lower]) return dict[lower];
                }
                return text;
              };
              
              return (
                <>
                  <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--primary)', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                    {t(product.category) !== product.category ? t(product.category) : getLocalizedText(product.category)}
                  </div>
                  {product.badge && <span className="chip mb-2" style={{ backgroundColor: 'var(--primary-container)', color: 'var(--on-primary-container)' }}>{t(product.badge) !== product.badge ? t(product.badge) : getLocalizedText(product.badge)}</span>}
            <h1 className="headline-lg mb-2" dir={language === 'ar' ? 'rtl' : 'ltr'}>{language === 'ar' && product.titleAr ? product.titleAr : product.title}</h1>
            
            <div className="mb-3" style={{ display: 'flex', alignItems: 'baseline' }}>
              <span className="headline-md" style={{ color: 'var(--primary)' }}>
                {currentPrice.toFixed(2)} {t('currency')}
              </span>
              {(selectedColor && product.colorPrices && product.colorPrices[selectedColor]) ? (
                 <span className="product-price-old" style={{ fontSize: '16px', marginLeft: '12px', textDecoration: 'line-through', opacity: 0.6 }}>
                   {Number(product.price).toFixed(2)} {t('currency')}
                 </span>
              ) : (
                // Show old price if variant has its own offer, OR if there's a global offer and variant didn't override price
                (hasVariants && activeVariant && activeVariant.offerPrice) ? (
                   <span className="product-price-old" style={{ fontSize: '16px', marginLeft: '12px', textDecoration: 'line-through', opacity: 0.6 }}>{Number(activeVariant.price || product.price).toFixed(2)} {t('currency')}</span>
                ) : (
                   Boolean(product.offerPrice) && (!hasVariants || !activeVariant || !activeVariant.price) && (
                     <span className="product-price-old" style={{ fontSize: '16px', marginLeft: '12px', textDecoration: 'line-through', opacity: 0.6 }}>{Number(product.price).toFixed(2)} {t('currency')}</span>
                   )
                )
              )}
              {(!Boolean(product.offerPrice) && product.oldPrice && !(selectedColor && product.colorPrices && product.colorPrices[selectedColor]) && (!hasVariants || !activeVariant || !activeVariant.offerPrice && !activeVariant.price)) && (
                <span className="product-price-old" style={{ fontSize: '16px', marginLeft: '12px', textDecoration: 'line-through', opacity: 0.6 }}>{Number(product.oldPrice).toFixed(2)} {t('currency')}</span>
              )}
              {(() => {
                let oldP = null;
                if (selectedColor && product.colorPrices && product.colorPrices[selectedColor]) {
                   oldP = Number(product.price);
                } else if (hasVariants && activeVariant && activeVariant.offerPrice) {
                   oldP = Number(activeVariant.price || product.price);
                } else if (Boolean(product.offerPrice) && (!hasVariants || !activeVariant || !activeVariant.price)) {
                   oldP = Number(product.price);
                } else if (!Boolean(product.offerPrice) && product.oldPrice && !(selectedColor && product.colorPrices && product.colorPrices[selectedColor]) && (!hasVariants || !activeVariant || !activeVariant.offerPrice && !activeVariant.price)) {
                   oldP = Number(product.oldPrice);
                }
                
                if (oldP && currentPrice < oldP) {
                   const discount = ((oldP - currentPrice) / oldP * 100).toFixed(1);
                   return (
                     <span style={{ marginLeft: '16px', backgroundColor: '#cc0c39', color: 'white', padding: '4px 10px', borderRadius: '4px', fontSize: '14px', fontWeight: 'bold', letterSpacing: '0.5px' }}>
                       -{discount}%
                     </span>
                   );
                }
                return null;
              })()}
            </div>

            <p className="body-lg text-on-surface-variant mb-4" dir={language === 'ar' ? 'rtl' : 'ltr'}>{language === 'ar' && product.descriptionAr ? product.descriptionAr : (product.description || product.desc)}</p>

            <div className="variants-wrapper" style={{ marginTop: '24px' }}>
              {hasVariants ? (
                <div className="variants-wrapper mb-4">
                  {product.options.map((option, optIndex) => {
                    const isColor = option.name.toLowerCase() === 'color' || option.name.toLowerCase() === 'لون';
                    
                    let visibleValues = option.values;
                    if (optIndex > 0) {
                      const primaryOptionName = product.options[0].name;
                      const selectedPrimaryValue = selectedOptions[primaryOptionName];
                      
                      if (selectedPrimaryValue && product.variants && product.variants.length > 0) {
                        const matchingVariants = product.variants.filter(v => {
                           if (!v.attributes || !v.attributes[primaryOptionName]) return false;
                           return v.attributes[primaryOptionName].split(',').map(s=>s.trim().toLowerCase()).includes(selectedPrimaryValue.toLowerCase());
                        });
                        
                        const validValues = new Set();
                        matchingVariants.forEach(v => {
                           if (v.attributes && v.attributes[option.name]) {
                               v.attributes[option.name].split(',').forEach(s => validValues.add(s.trim()));
                           }
                        });
                        
                        if (validValues.size > 0) {
                          visibleValues = option.values.filter(val => {
                             return Array.from(validValues).some(v => v.toLowerCase() === val.toLowerCase());
                          });
                        } else {
                          visibleValues = [];
                        }
                      }
                    }
                    
                    if (visibleValues.length === 0) return null;
                    
                    const getLocalizedTextForVariant = (text) => {
                      if (!text) return text;
                      if (String(text).includes(' / ')) {
                        const parts = String(text).split(' / ');
                        return language === 'ar' ? (parts[1]?.trim() || parts[0].trim()) : parts[0].trim();
                      }
                      if (language === 'ar') {
                        const dict = {
                          'color': 'اللون', 'size': 'المقاس', 'material': 'الخامة', 'weight': 'الوزن', 'style': 'الستايل',
                          'white': 'أبيض', 'black': 'أسود', 'red': 'أحمر', 'blue': 'أزرق', 'green': 'أخضر', 'yellow': 'أصفر',
                          'gray': 'رمادي', 'silver': 'فضي', 'gold': 'ذهبي', 'pink': 'وردي', 'purple': 'بنفسجي', 'brown': 'بني',
                          'navy': 'كحلي', 'beige': 'بيج', 'orange': 'برتقالي', 'maroon': 'عنابي', 'teal': 'تركواز',
                          'metal': 'معدن', 'plastic': 'بلاستيك', 'wood': 'خشب', 'glass': 'زجاج', 'leather': 'جلد', 'cotton': 'قطن',
                          'modern': 'حديث', 'classic': 'كلاسيكي', 'casual': 'كاجوال', 'formal': 'رسمي', 'sport': 'رياضي'
                        };
                        const lower = String(text).toLowerCase().trim();
                        if (dict[lower]) return dict[lower];
                      }
                      return text;
                    };

                    return (
                      <div key={option.name} className={`variant-item ${isColor ? 'mobile-order-first' : ''}`} style={{ marginBottom: '16px' }}>
                        <h3 className="label-md mb-2">
                          {getLocalizedTextForVariant(option.name)}{isColor && selectedOptions[option.name] ? `: ` : ''}
                          {isColor && <span style={{ fontWeight: '600', color: 'var(--on-surface)' }}>{getLocalizedTextForVariant(selectedOptions[option.name])}</span>}
                        </h3>
                        
                        {isColor ? (
                          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                            {visibleValues.map(val => {
                              const isSelected = selectedOptions[option.name] === val;
                              return (
                                <div
                                  key={val}
                                  title={getLocalizedTextForVariant(val)}
                                  onClick={() => handleOptionSelect(option.name, val)}
                                  style={{
                                    width: '40px',
                                    height: '40px',
                                    borderRadius: '50%',
                                    backgroundColor: getColorHex(val),
                                    cursor: 'pointer',
                                    border: isSelected ? '2px solid var(--primary)' : '2px solid var(--outline-variant)',
                                    boxShadow: isSelected ? '0 0 0 2px var(--surface-container-lowest)' : 'none',
                                    transition: 'all 0.2s ease',
                                    transform: isSelected ? 'scale(1.1)' : 'scale(1)',
                                    position: 'relative'
                                  }}
                                >
                                  {isSelected && (
                                    <div style={{ position: 'absolute', top: '-4px', right: '-4px', backgroundColor: 'var(--primary)', color: 'white', borderRadius: '50%', padding: '2px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                      <Check size={12} strokeWidth={4} />
                                    </div>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        ) : (
                          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                            {visibleValues.map(val => {
                               const isSelected = selectedOptions[option.name] === val;
                               return (
                                 <button
                                   key={val}
                                   onClick={() => handleOptionSelect(option.name, val)}
                                   style={{
                                     padding: '10px 18px',
                                     borderRadius: '10px',
                                     border: isSelected ? '3px solid #3b82f6' : '1px solid #9ca3af',
                                     backgroundColor: isSelected ? '#eff6ff' : '#ffffff',
                                     color: '#1f2937',
                                     cursor: 'pointer',
                                     fontWeight: isSelected ? 600 : 400,
                                     fontSize: '15px',
                                     transition: 'all 0.15s ease',
                                     minWidth: '54px',
                                     display: 'flex',
                                     justifyContent: 'center',
                                     alignItems: 'center'
                                   }}
                                 >
                                   {getLocalizedTextForVariant(val)}
                                 </button>
                               );
                            })}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              ) : (
                product.color && (Array.isArray(product.color) ? product.color : [product.color]).length > 0 && (
                  <div className="variant-item mobile-order-first mb-4">
                    <h3 className="label-md mb-2">{t('color')}: <span style={{ fontWeight: '600', color: 'var(--on-surface)' }}>{getLocalizedText(selectedColor)}</span></h3>
                    <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                      {(Array.isArray(product.color) ? product.color : [product.color]).map(c => {
                        return (
                          <div
                            key={c}
                            title={c}
                            onClick={() => setSelectedColor(c)}
                            style={{
                              width: '40px',
                              height: '40px',
                              borderRadius: '50%',
                              backgroundColor: getColorHex(c),
                              cursor: 'pointer',
                              border: selectedColor === c ? '2px solid var(--primary)' : '2px solid var(--outline-variant)',
                              boxShadow: selectedColor === c ? '0 0 0 2px var(--surface-container-lowest)' : 'none',
                              transition: 'all 0.2s ease',
                              transform: selectedColor === c ? 'scale(1.1)' : 'scale(1)',
                              position: 'relative'
                            }}
                          >
                            {selectedColor === c && (
                              <div style={{ position: 'absolute', top: '-4px', right: '-4px', backgroundColor: 'var(--primary)', color: 'white', borderRadius: '50%', padding: '2px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <Check size={12} strokeWidth={4} />
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )
              )}
            </div>
            {/* Specifications ... same as before */}

            <div className="product-view-actions" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {cartQty > 0 ? (
                <>
                  <div className="qty-control" style={{ opacity: currentStock === 0 ? 0.5 : 1, pointerEvents: currentStock === 0 ? 'none' : 'auto', width: '100%', height: '56px', padding: '0 8px', backgroundColor: 'var(--surface-container-low)' }}>
                    <button className="qty-btn" type="button" style={{ width: '48px', height: '48px', fontSize: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center' }} onClick={(e) => { e.preventDefault(); e.stopPropagation(); updateQuantity(cartItem.cartItemId || cartItemId, cartQty - 1); }} aria-label="Decrease quantity" disabled={currentStock === 0}>-</button>
                    <span className="qty-value" style={{ fontSize: '18px', fontWeight: 'bold' }}>{cartQty}</span>
                    <button className="qty-btn" type="button" style={{ width: '48px', height: '48px', fontSize: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center' }} onClick={(e) => { e.preventDefault(); e.stopPropagation(); updateQuantity(cartItem.cartItemId || cartItemId, Math.min(Number(currentStock) || 99, cartQty + 1)); }} aria-label="Increase quantity" disabled={currentStock === 0 || (currentStock > 0 && cartQty >= currentStock)}>+</button>
                  </div>
                  <Link 
                    to="/cart"
                    className="btn-add-cart" 
                    style={{ backgroundColor: 'var(--primary)', color: 'white', padding: '16px 24px', fontSize: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%', textDecoration: 'none' }}
                  >
                    <ShoppingBag size={20} style={{ marginRight: language === 'ar' ? '0' : '8px', marginLeft: language === 'ar' ? '8px' : '0' }} />
                    {language === 'ar' ? 'إتمام الطلب' : 'Proceed to Checkout'}
                  </Link>
                </>
              ) : (
                <>
                  <button 
                    className="btn-add-cart" 
                    onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleAdd(); }} 
                    style={{ padding: '16px 24px', fontSize: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%', cursor: currentStock === 0 ? 'not-allowed' : 'pointer' }}
                    disabled={currentStock === 0}
                  >
                    {currentStock === 0 ? t('outOfStock') : t('addToCart')}
                  </button>
                  <Link 
                    to="/cart"
                    style={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'center', 
                      width: '100%', 
                      padding: '16px 24px', 
                      fontSize: '16px', 
                      fontWeight: '600', 
                      color: 'var(--on-surface)', 
                      backgroundColor: 'transparent',
                      border: '2px solid var(--outline-variant)',
                      borderRadius: '100px',
                      textDecoration: 'none',
                      transition: 'all 0.2s'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = 'var(--surface-container-lowest)';
                      e.currentTarget.style.borderColor = 'var(--on-surface)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = 'transparent';
                      e.currentTarget.style.borderColor = 'var(--outline-variant)';
                    }}
                  >
                    <ShoppingBag size={20} style={{ marginRight: language === 'ar' ? '0' : '8px', marginLeft: language === 'ar' ? '8px' : '0' }} />
                    {language === 'ar' ? 'إتمام الطلب' : 'Proceed to Checkout'}
                  </Link>
                </>
              )}
            </div>
                </>
              );
            })()}
          </div>
        </div>

        {/* Customer Gallery */}
        {product.reviewImages && product.reviewImages.length > 0 && (
          <section style={{ maxWidth: '1200px', margin: '64px auto 0', padding: '0 16px', animation: 'pageSlideUpIn 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards' }}>
            <div style={{ textAlign: 'center', marginBottom: '40px' }}>
              <h2 style={{ fontSize: '28px', fontWeight: 800, color: 'var(--on-surface)', marginBottom: '8px' }}>
                ⭐ {t('customerReviews')}
              </h2>
            </div>
            
            <div style={{ overflow: 'hidden', width: '100%', padding: '16px 0' }}>
              <div className="marquee-track">
                {[...product.reviewImages, ...product.reviewImages].map((img, idx) => (
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
                    onClick={() => setLightboxImage(img)}
                  >
                    <img src={img} alt={`Customer review ${idx + 1}`} style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.5s ease' }} onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.05)'} onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'} />
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Lightbox */}
        {lightboxImage && (
          <div 
            style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.9)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px', cursor: 'zoom-out', animation: 'fadeIn 0.2s ease-out forwards' }}
            onClick={() => setLightboxImage(null)}
          >
            <style>{`@keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } } @keyframes zoomIn { from { transform: scale(0.95); opacity: 0; } to { transform: scale(1); opacity: 1; } }`}</style>
            <img src={lightboxImage} alt="Expanded view" style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain', borderRadius: '8px', animation: 'zoomIn 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards', boxShadow: '0 24px 48px rgba(0,0,0,0.5)' }} />
          </div>
        )}

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <section style={{ maxWidth: '1200px', margin: '40px auto 40px', padding: '0 16px', borderTop: '1px solid var(--outline-variant)', paddingTop: '32px' }}>
            <h2 style={{ fontSize: '24px', fontWeight: 800, marginBottom: '32px', color: 'var(--on-surface)', display: 'flex', alignItems: 'center', gap: '12px' }}>
              <Sparkles className="text-primary" size={28} />
              {language === 'ar' ? 'قد يعجبك أيضاً' : 'You May Also Like'}
            </h2>
            <div className="product-grid" style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
              gap: '24px'
            }}>
              {relatedProducts.map(p => (
                <div key={p.id} style={{ animation: 'pageSlideUpIn 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards' }}>
                  <ProductCard product={p} />
                </div>
              ))}
            </div>
          </section>
        )}
      </main>
    </>
  );
}
