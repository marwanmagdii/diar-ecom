import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Trash2 } from 'lucide-react';
import { useStore } from '../store';

export default function Cart() {
  const { cart, removeFromCart, updateQuantity, cartTotal } = useStore();
  const { t, language } = useStore();
  const navigate = useNavigate();

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
    <main className="container pt-4 pb-4">
      <h1 className="headline-lg mb-4 text-center">{t('cart')}</h1>
      
      <div className={cart.length === 0 ? "" : "cart-layout"}>
        {cart.length === 0 ? (
          <div className="empty-cart-state" style={{ textAlign: 'center', padding: '64px 16px', maxWidth: '400px', margin: '0 auto', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <div style={{ width: '80px', height: '80px', borderRadius: '50%', backgroundColor: 'var(--surface-container)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '24px' }}>
              <Trash2 size={32} color="var(--outline)" />
            </div>
            <h2 className="headline-md mb-2">{t('emptyCart')}</h2>
            <p className="body-lg text-on-surface-variant mb-4">{language === 'ar' ? 'يبدو أنك لم تضف أي شيء إلى سلة التسوق الخاصة بك بعد.' : "Looks like you haven't added anything to your cart yet."}</p>
            <Link to="/" className="btn btn-primary" style={{ padding: '12px 32px' }}>{t('continueShopping')}</Link>
          </div>
        ) : (
          <>
            <div className="cart-items">
              {cart.map(item => (
                <div key={item.cartItemId} className="cart-item">
                  <Link to={`/product/${item.id}`} style={{ display: 'block' }}>
                    <img src={item.image} alt={language === 'ar' && item.titleAr ? item.titleAr : item.title} className="cart-item-image" style={{ backgroundColor: item.bgColor }} />
                  </Link>
                  <div className="cart-item-details">
                    <Link to={`/product/${item.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                      <h3 className="cart-item-title" dir={language === 'ar' ? 'rtl' : 'ltr'}>{language === 'ar' && item.titleAr ? item.titleAr : item.title}</h3>
                    </Link>
                      <div style={{ fontSize: '12px', color: 'var(--on-surface-variant)', marginBottom: '4px' }}>
                        {item.selectedOptions ? (
                          Object.entries(item.selectedOptions).map(([key, val]) => (
                            <span key={key} style={{ marginRight: '8px' }}>{getLocalizedText(key)}: {getLocalizedText(val)}</span>
                          ))
                        ) : (
                          <>
                            {(item.selectedColor || item.color) && <span style={{ marginRight: '8px' }}>{t('color')}: {item.selectedColor || item.color}</span>}
                            {(item.selectedSize || item.size) && <span>{t('size')}: {item.selectedSize || item.size}</span>}
                          </>
                        )}
                      </div>
                    <div className="cart-item-price">{item.price.toFixed(2)} {t('currency')}</div>
                    <div className="cart-item-actions">
                      <div className="qty-control">
                        <button className="qty-btn" onClick={() => updateQuantity(item.cartItemId, item.qty - 1)}>-</button>
                        <span className="qty-value">{item.qty}</span>
                        <button className="qty-btn" onClick={() => updateQuantity(item.cartItemId, item.qty + 1)}>+</button>
                      </div>
                      <button className="btn-remove" onClick={() => removeFromCart(item.cartItemId)}>
                        <Trash2 size={16} /> {t('remove')}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div>
              <div className="order-summary card">
                <h2 className="headline-md mb-3">{t('subtotal')}</h2>
                <div className="summary-row">
                  <span>{t('subtotal')}</span>
                  <span>{cartTotal.toFixed(2)} {t('currency')}</span>
                </div>
                <div className="summary-row total">
                  <span>{t('total')}</span>
                  <span>{cartTotal.toFixed(2)} {t('currency')}</span>
                </div>
                
                <button 
                  className="btn btn-primary w-100 mt-4" 
                  style={{ width: '100%', padding: '16px', fontSize: '16px', borderRadius: '12px' }}
                  onClick={() => navigate('/checkout')}
                  disabled={cart.length === 0}
                >
                  {t('checkout')}
                </button>
                <div style={{ textAlign: 'center', marginTop: '16px' }}>
                  <Link to="/" style={{ color: 'var(--on-surface-variant)', fontSize: '14px', textDecoration: 'underline' }}>
                    {t('continueShopping')}
                  </Link>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </main>
  );
}
