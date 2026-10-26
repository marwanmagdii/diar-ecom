import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useStore } from '../store';
import { getColorHex } from '../utils/colors';
import { localize, isColorOption, getAttr } from '../utils/i18n';

export default function ProductCard({ product }) {
  const { cart, addToCart, updateQuantity, removeFromCart } = useStore();
  const { addToast } = useStore();
  const { language, t } = useStore();
  
  // Find color options
  const colorOption = product.options?.find(opt => isColorOption(opt.name));
  
  // Extract colors: prefer options array, then fallback to product.color (handling both string and array)
  let availableColors = colorOption ? colorOption.values : null;
  if (!availableColors && product.color) {
    availableColors = Array.isArray(product.color) ? product.color : [product.color];
  }
  
  const [selectedColor, setSelectedColor] = useState(availableColors && availableColors.length > 0 ? availableColors[0] : null);

  const cartItem = cart.find(item => item.id === product.id && !item.selectedOptions && (item.selectedColor ?? item.color ?? null) === selectedColor);
  const cartQty = cartItem ? cartItem.qty : 0;

  // Determine displayed image and price based on selectedColor
  let displayImage = product.image;
  if (selectedColor && product.colorImages && product.colorImages[selectedColor]) {
    displayImage = product.colorImages[selectedColor];
  } else if (selectedColor && product.variants) {
    const variant = product.variants.find(v => getAttr(v.attributes, 'color')?.split(',').map(s => s.trim()).includes(selectedColor));
    if (variant && variant.image) displayImage = variant.image;
    else if (variant && variant.images && variant.images.length > 0) displayImage = variant.images[0];
  }

  let basePrice = Number(product.price) || 0;
  let variantPrice = basePrice;

  if (selectedColor && product.colorPrices && product.colorPrices[selectedColor]) {
    variantPrice = Number(product.colorPrices[selectedColor]);
  } else if (selectedColor && product.variants) {
    const variant = product.variants.find(v => getAttr(v.attributes, 'color')?.split(',').map(s => s.trim()).includes(selectedColor));
    if (variant && variant.price) variantPrice = Number(variant.price);
  }

  let originalPrice = variantPrice;
  let displayPrice = variantPrice;

  if (product.offerPrice && basePrice > 0) {
    const ratio = Number(product.offerPrice) / basePrice;
    displayPrice = variantPrice * ratio;
  } else if (product.oldPrice && Number(product.oldPrice) > basePrice) {
    const ratio = basePrice / Number(product.oldPrice);
    originalPrice = variantPrice / ratio;
  }

  const isDiscounted = originalPrice > displayPrice && originalPrice > 0;
  const discountPercent = isDiscounted ? ((originalPrice - displayPrice) / originalPrice * 100).toFixed(1) : 0;

  const handleAdd = (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    const cartItemData = {
      id: product.id,
      title: product.title,
      titleAr: product.titleAr,
      category: product.category,
      price: displayPrice,
      image: displayImage,
      color: selectedColor,
      selectedColor
    };

    addToCart(cartItemData, 1);
    addToast(`${t('addedToCart')}: ${language === 'ar' && product.titleAr ? product.titleAr : product.title}`);
  };

  const handleIncrease = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (cartItem) {
      const newQty = Math.min(Number(product.stock) || 99, cartQty + 1);
      updateQuantity(cartItem.cartItemId, newQty);
      addToast(`${language === 'ar' ? 'تم تحديث الكمية:' : 'Updated quantity:'} ${newQty}`);
    }
  };

  const handleDecrease = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (cartItem) {
      if (cartQty === 1) {
        removeFromCart(cartItem.cartItemId);
        addToast(language === 'ar' ? 'تم الحذف من السلة' : 'Removed from cart');
      } else {
        const newQty = cartQty - 1;
        updateQuantity(cartItem.cartItemId, newQty);
        addToast(`${language === 'ar' ? 'تم تحديث الكمية:' : 'Updated quantity:'} ${newQty}`);
      }
    }
  };

  const renderColorSwatches = () => {
    if (!availableColors || !Array.isArray(availableColors) || availableColors.length === 0) return null;
    

    return (
      <div style={{ marginTop: '8px' }}>

        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          {availableColors.slice(0, 4).map((c, idx) => {
            const isSelected = selectedColor === c;
            return (
              <button
                type="button"
                key={idx}
                title={localize(c, language)}
                aria-label={localize(c, language)}
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setSelectedColor(c);
                }}
                style={{ 
                  width: '24px', height: '24px', borderRadius: '50%', padding: 0,
                  backgroundColor: getColorHex(c),
                  border: getColorHex(c).toUpperCase() === '#FFFFFF' ? '1px solid #cbd5e1' : '1px solid rgba(0,0,0,0.1)',
                  boxShadow: isSelected ? '0 0 0 2px #ffffff, 0 0 0 4px var(--primary)' : 'inset 0 1px 2px rgba(0,0,0,0.1)',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  transform: isSelected ? 'scale(1.1)' : 'scale(1)'
                }}
              />
            )
          })}
          {availableColors.length > 4 && (
            <span style={{ fontSize: '11px', color: '#64748b', display: 'flex', alignItems: 'center', marginInlineStart: '4px' }}>
              +{availableColors.length - 4}
            </span>
          )}
        </div>
      </div>
    );
  };

  const getTranslatedBadge = (badgeText) => {
    if (!badgeText || String(badgeText) === 'NaN') return null;
    const text = String(badgeText).replace(/\bOFF\b/i, t('off'));
    if (text.includes('/')) return localize(text, language);
    if (language !== 'ar') {
      const back = { 'الأكثر مبيعاً': 'Best Seller', 'رائج': 'Trending', 'وصل حديثاً': 'New Arrival', 'كمية محدودة': 'Limited Stock', 'الأعلى تقييماً': 'Top Rated', 'اختيار الخبراء': 'Staff Pick' };
      return back[text] || text;
    }

    const translations = {
      'Best Seller': 'الأكثر مبيعاً',
      'Trending': 'رائج',
      'New Arrival': 'وصل حديثاً',
      'Limited Stock': 'كمية محدودة',
      'Top Rated': 'الأعلى تقييماً',
      'Staff Pick': 'اختيار الخبراء'
    };
    return translations[text] || text;
  };

  const badgeDisplay = getTranslatedBadge(product.badge);

  return (
    <article className="card product-card" style={{ position: 'relative', display: 'flex', flexDirection: 'column', height: '100%', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03)', borderRadius: '16px', overflow: 'hidden', padding: '0' }}>
      {badgeDisplay ? <span className="badge" dir={language === 'ar' ? 'rtl' : 'ltr'} style={{ position: 'absolute', zIndex: 2, top: '12px', insetInlineStart: '12px', insetInlineEnd: 'auto', maxWidth: '60%' }}>{badgeDisplay}</span> : null}
      
      {Boolean(isDiscounted && discountPercent > 0) && (
        <span style={{ position: 'absolute', zIndex: 2, top: '12px', insetInlineEnd: '12px', backgroundColor: '#cc0c39', color: 'white', padding: '4px 8px', borderRadius: '4px', fontSize: '12px', fontWeight: 700 }}>
          {Math.round(discountPercent)}% {t('off')}
        </span>
      )}

      <Link to={`/product/${product.id}?color=${encodeURIComponent(selectedColor || '')}`} style={{ textDecoration: 'none', color: 'inherit', display: 'flex', flexDirection: 'column', flex: 1 }}>
        <div className="product-image-container" style={{ backgroundColor: product.bgColor || '#f8fafc', borderRadius: '0', margin: '0', aspectRatio: '1/1' }}>
          <img
            src={displayImage}
            alt={language === 'ar' && product.titleAr ? product.titleAr : product.title}
            loading="lazy"
            decoding="async"
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
        </div>
        <div className="product-info-container" style={{ padding: '16px', display: 'flex', flexDirection: 'column', flex: 1 }}>
          <div className="product-category" style={{ fontSize: '11px', color: '#64748b', marginBottom: '8px' }}>{t(product.category) !== product.category ? t(product.category) : localize(product.category, language)}</div>

          <div style={{ display: 'flex', alignItems: 'baseline', flexWrap: 'wrap', gap: '6px', marginBottom: '8px' }}>
            <span className="product-price" style={{ fontSize: '18px', color: '#0f172a', fontWeight: 700, lineHeight: 1 }}>
              {t('currency')} <span style={{ fontSize: '24px' }}>{Math.floor(displayPrice)}</span><span style={{ fontSize: '13px', position: 'relative', top: '-6px' }}>{(displayPrice % 1).toFixed(2).substring(1)}</span>
            </span>
            {Boolean(isDiscounted && discountPercent > 0) && (
              <span className="product-price-old" style={{ fontSize: '12px', color: '#565959', textDecoration: 'none' }}>
                {language === 'ar' ? 'السعر الأصلي:' : 'List Price:'} <span style={{ textDecoration: 'line-through' }}>{t('currency')} {originalPrice.toFixed(2)}</span>
              </span>
            )}
          </div>

          <h3 className="product-title" style={{ fontSize: '15px', fontWeight: 400, lineHeight: 1.4, margin: '0 0 8px 0', color: '#0f172a', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }} dir={language === 'ar' ? 'rtl' : 'ltr'}>{language === 'ar' && product.titleAr ? product.titleAr : product.title}</h3>
          
          <div style={{ marginTop: 'auto' }}>
            {renderColorSwatches()}
          </div>
        </div>
      </Link>
      <div className="product-actions-container" style={{ padding: '0 16px 16px 16px', marginTop: '0' }}>
        {cartQty > 0 ? (
          <div style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: '40px', padding: '0 12px' }}>
            <button type="button" onClick={handleDecrease} aria-label={language === 'ar' ? 'تقليل الكمية' : 'Decrease quantity'} style={{ width: '32px', height: '32px', fontSize: '20px', padding: 0, borderRadius: '50%', backgroundColor: 'var(--primary)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', border: 'none', cursor: 'pointer', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>-</button>
            <span style={{ margin: 0, fontWeight: 700, fontSize: '18px', color: 'var(--on-surface)' }}>{cartQty}</span>
            <button type="button" onClick={handleIncrease} aria-label={language === 'ar' ? 'زيادة الكمية' : 'Increase quantity'} disabled={product.stock === cartQty} style={{ width: '32px', height: '32px', fontSize: '20px', padding: 0, borderRadius: '50%', backgroundColor: 'var(--primary)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', border: 'none', cursor: product.stock === cartQty ? 'not-allowed' : 'pointer', opacity: product.stock === cartQty ? 0.5 : 1, boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>+</button>
          </div>
        ) : (
          <button 
            className="btn btn-add-cart" 
            onClick={handleAdd}
            disabled={product.stock === 0}
            style={{ width: '100%', height: '40px', borderRadius: '12px', fontSize: '14px', fontWeight: 600, backgroundColor: product.stock === 0 ? '#e2e8f0' : 'var(--primary)', color: product.stock === 0 ? '#94a3b8' : '#ffffff', border: 'none', cursor: product.stock === 0 ? 'not-allowed' : 'pointer' }}
          >
            {product.stock === 0 ? t('outOfStock') : t('addToCart')}
          </button>
        )}
      </div>
    </article>
  );
}

