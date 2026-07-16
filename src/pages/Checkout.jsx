import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ShieldCheck, Truck, CreditCard } from 'lucide-react';
import SearchableSelect from '../components/SearchableSelect';
import { useStore } from '../store';

export default function Checkout() {
  const { cart, cartTotal, clearCart, config, addToast, language: lang, t, getTrackingData, clearTrackingData, addOrder, orders, updatePromoCodes, trackEvent } = useStore();
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    address: '',
    building: '',
    apartment: '',
    gov: '',
    district: '',
    customDistrict: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [promoInput, setPromoInput] = useState('');
  const [appliedPromo, setAppliedPromo] = useState(null);
  const [isApplyingPromo, setIsApplyingPromo] = useState(false);
  
  const navigate = useNavigate();

  let discountAmount = 0;
  if (appliedPromo) {
    if (appliedPromo.discountType === 'percentage') {
      discountAmount = cartTotal * (appliedPromo.discountValue / 100);
    } else {
      discountAmount = Math.min(appliedPromo.discountValue, cartTotal); // Don't discount more than cart total
    }
  }
  const shippingCost = 0;
  const finalTotal = cartTotal - discountAmount + shippingCost;
  const govOptions = (config.locations || [])
    .filter(loc => loc.isActive !== false)
    .map(loc => ({
      value: loc.id,
      label: lang === 'ar' ? loc.nameAr : loc.nameEn
    }));

  const selectedGov = (config.locations || []).find(loc => loc.id === formData.gov);
  let districtOptions = selectedGov ? selectedGov.districts
    .filter(dist => dist.isActive !== false)
    .map(dist => ({
      value: dist.id,
      label: lang === 'ar' ? dist.nameAr : dist.nameEn
    })) : [];

  if (selectedGov) {
    districtOptions.push({
      value: 'other',
      label: lang === 'ar' ? 'أخرى' : 'Other'
    });
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    if (name === 'phone') {
      let sanitized = value.replace(/\D/g, '');
      if (sanitized.startsWith('00201') && sanitized.length >= 13) {
        sanitized = '0' + sanitized.slice(4);
      } else if (sanitized.startsWith('201') && sanitized.length >= 12) {
        sanitized = '0' + sanitized.slice(2);
      }
      sanitized = sanitized.slice(0, 11);
      setFormData(prev => ({ ...prev, [name]: sanitized }));
      return;
    }
    
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name, value) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleApplyPromo = async () => {
    if (!promoInput.trim()) return;
    
    setIsApplyingPromo(true);
    const code = promoInput.toUpperCase().trim();
    
    try {
      // Fetch latest config directly from backend to ensure promo code is not stale
      const res = await fetch('/api/config', { cache: 'no-store' });
      if (res.ok) {
        const liveConfig = await res.json();
        const activePromos = liveConfig.promoCodes || [];
        const found = activePromos.find(p => p.code === code && p.isActive !== false);
        
        if (found) {
          if (found.maxUses > 0 && (found.usageCount || 0) >= found.maxUses) {
            addToast('This promo code has reached its usage limit.', 'error');
            return;
          }
          if (found.minOrderValue && cartTotal < found.minOrderValue) {
            addToast(`This promo requires a minimum order of ${found.minOrderValue} EGP.`, 'error');
            return;
          }
          setAppliedPromo(found);
          addToast('Promo code applied successfully!', 'success');
          setPromoInput('');
        } else {
          addToast('Invalid or inactive promo code.', 'error');
        }
      } else {
        addToast('Failed to verify promo code.', 'error');
      }
    } catch (error) {
      console.error(error);
      addToast('Error verifying promo code.', 'error');
    } finally {
      setIsApplyingPromo(false);
    }
  };

  const handleRemovePromo = () => {
    setAppliedPromo(null);
    addToast('Promo code removed.', 'info');
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    const govLabel = govOptions.find(o => o.value === formData.gov)?.label || formData.gov;
    const distLabel = formData.district === 'other' ? formData.customDistrict : (districtOptions.find(o => o.value === formData.district)?.label || formData.district);
    const fullAddress = `${formData.address}, ${distLabel}, ${govLabel}`;

    let affiliateCode = appliedPromo ? appliedPromo.code : null;
    let isFromReferralLink = false;
    if (!affiliateCode) {
      try {
        const storedAff = localStorage.getItem('diar_affiliate_tracking');
        if (storedAff) {
          const affData = JSON.parse(storedAff);
          const hoursPassed = (Date.now() - affData.timestamp) / (1000 * 60 * 60);
          if (hoursPassed <= 24) { // 24-hour cookie window
            affiliateCode = affData.code;
            isFromReferralLink = true;
          } else {
            localStorage.removeItem('diar_affiliate_tracking');
          }
        }
      } catch (e) {}
    }

    const newOrder = {
      customer: `${formData.firstName} ${formData.lastName}`,
      phone: formData.phone,
      address: fullAddress,
      building: formData.building,
      apartment: formData.apartment,
      createdAt: new Date(),
      total: finalTotal,
      subtotal: cartTotal,
      shipping: shippingCost,
      discount: discountAmount,
      promoCode: appliedPromo ? appliedPromo.code : null,
      affiliateCode: affiliateCode,
      status: 'Pending',
      paymentMethod: 'Cash on Delivery',
      items: cart,
      trackingData: getTrackingData()
    };

    trackEvent('complete_checkout', { orderTotal: finalTotal, orderItems: cart.length });

    // Wait for the backend to save the order before navigating
    const submitOrder = async () => {
      const result = await addOrder(newOrder);
      
      if (!result || !result.success) {
        const errorMsg = result?.error || 'Error placing order, please try again.';
        addToast(errorMsg, 'error');
        setIsSubmitting(false);
        return;
      }
      
      const assignedOrderId = result.data.id;
      
      if (affiliateCode) {
        const updatedPromos = (config.promoCodes || []).map(p => {
          if (p.code === affiliateCode) {
            return {
              ...p,
              usageCount: (p.usageCount || 0) + (isFromReferralLink ? 0 : 1),
              totalRevenue: (p.totalRevenue || 0) + finalTotal
            };
          }
          return p;
        });
        updatePromoCodes(updatedPromos);
        if (isFromReferralLink) {
          localStorage.removeItem('diar_affiliate_tracking');
        }
      }
      
      // Send Telegram Notification
      try {
        const botToken = import.meta.env.VITE_TELEGRAM_BOT_TOKEN;
        const chatId = import.meta.env.VITE_TELEGRAM_CHAT_ID;
        if (botToken && chatId) {
          const loc = config?.locations?.find(l => l.id === formData.gov);
          const govAr = loc?.nameAr || loc?.nameEn || govLabel;
          const distObj = loc?.districts?.find(d => d.id === formData.district);
          const distAr = formData.district === 'other' ? formData.customDistrict : (distObj?.nameAr || distObj?.nameEn || distLabel);

          let waPhone = newOrder.phone.replace(/\D/g, '');
          if (waPhone.startsWith('01')) {
            waPhone = '2' + waPhone;
          }

          const buildItemOptionsText = (item, isTg = false) => {
            const opts = [];
            const prefix = isTg ? '\n\u200F  ▪️ \u200E' : '\n  - ';
            
            const translateKey = (k) => {
              const lowerK = k.toLowerCase().trim();
              const keyMap = {
                'color': 'اللون', 'size': 'المقاس', 'material': 'الخامة',
                'weight': 'الوزن', 'style': 'الستايل'
              };
              if (keyMap[lowerK]) return keyMap[lowerK];
              if (k.includes(' / ')) return k.split(' / ')[1].trim() || k;
              return k;
            };

            const translateVal = (v) => {
              const lowerV = String(v).toLowerCase().trim();
              const valMap = {
                'black': 'أسود', 'white': 'أبيض', 'red': 'أحمر', 'blue': 'أزرق',
                'green': 'أخضر', 'yellow': 'أصفر', 'gray': 'رمادي', 'silver': 'فضي',
                'gold': 'ذهبي', 'pink': 'وردي', 'purple': 'بنفسجي', 'brown': 'بني',
                'navy': 'كحلي', 'beige': 'بيج', 'orange': 'برتقالي', 'maroon': 'عنابي',
                'teal': 'تركواز', 'metal': 'معدن', 'plastic': 'بلاستيك', 'wood': 'خشب',
                'glass': 'زجاج', 'leather': 'جلد', 'cotton': 'قطن', 'modern': 'حديث',
                'classic': 'كلاسيكي', 'casual': 'كاجوال', 'formal': 'رسمي', 'sport': 'رياضي', 'sporty': 'رياضي', 'vintage': 'عتيق'
              };
              if (valMap[lowerV]) return valMap[lowerV];
              if (String(v).includes(' / ')) return String(v).split(' / ')[1].trim() || v;
              return v;
            };

            if (item.selectedOptions) {
              Object.entries(item.selectedOptions).forEach(([key, val]) => {
                opts.push(`${prefix}${translateKey(key)}: ${translateVal(val)}`);
              });
            } else {
              const colorVal = item.selectedColor || item.color;
              if (colorVal) {
                opts.push(`${prefix}اللون: ${translateVal(colorVal)}`);
              }
              const sizeVal = item.selectedSize || item.size;
              if (sizeVal) {
                opts.push(`${prefix}المقاس: ${translateVal(sizeVal)}`);
              }
            }
            return opts.length > 0 ? opts.join('') : '';
          };

          const waItemText = cart.map(item => `- (${item.qty}) ${item.titleAr || item.title}\n  - السعر: ${item.price.toFixed(2)} ج.م${buildItemOptionsText(item, false)}`).join('\n');
          const tgItemText = cart.map(item => `\u200F- (${item.qty}) <a href="${window.location.origin}/diaradmin26/products/${encodeURIComponent(item.id)}">${item.titleAr || item.title}</a>\n\u200F  ▪️ \u200Eالسعر: \u200E${item.price.toFixed(2)} ج.م${buildItemOptionsText(item, true)}`).join('\n');

          const waText = `مرحباً ${newOrder.customer}،
لقد استلمنا طلبك رقم ${assignedOrderId}.

*المنتجات:*
${waItemText}

*الإيصال:*
المجموع الفرعي: ${newOrder.subtotal.toFixed(2)} ج.م
${newOrder.shipping > 0 ? `الشحن: ${newOrder.shipping.toFixed(2)} ج.م\n` : ''}${newOrder.discount > 0 ? `الخصم: ${newOrder.discount.toFixed(2)} ج.م\n` : ''}الإجمالي: ${newOrder.total.toFixed(2)} ج.م

*تفاصيل التوصيل:*
المحافظة: ${govAr}
المنطقة: ${distAr}
الشارع: ${formData.address}
المبنى: ${newOrder.building || ''}
الشقة: ${newOrder.apartment || ''}

شكراً لتسوقك معنا!`;
          const waMessage = encodeURIComponent(waText);
          const waLink = `https://wa.me/${waPhone}?text=${waMessage}`;

          const orderLink = `${window.location.origin}/diaradmin26/orders/${encodeURIComponent(assignedOrderId)}`;
          const message = `🛒 <b>طلب جديد ${assignedOrderId}</b>
👤 <b>العميل:</b> ${newOrder.customer}
📞 <b>رقم الهاتف:</b> <a href="${waLink}">\u200E+${waPhone}</a>
\u200F📍 <b>المحافظة:</b> \u200E${govAr}
\u200F🏘️ <b>المنطقة:</b> \u200E${distAr}
\u200F🛣️ <b>الشارع:</b> \u200E${formData.address}
\u200F🏢 <b>المبنى:</b> \u200E${newOrder.building || 'لا يوجد'}
\u200F🚪 <b>الشقة:</b> \u200E${newOrder.apartment || 'لا يوجد'}

📦 <b>المنتجات:</b>
${tgItemText}

💰 <b>المجموع الفرعي:</b> \u200E${newOrder.subtotal.toFixed(2)} ج.م
${newOrder.shipping > 0 ? `🚚 <b>الشحن:</b> \u200E${newOrder.shipping.toFixed(2)} ج.م\n` : ''}${newOrder.discount > 0 ? `🏷️ <b>الخصم:</b> \u200E-${newOrder.discount.toFixed(2)} ج.م\n` : ''}💵 <b>الإجمالي:</b> \u200E${newOrder.total.toFixed(2)} ج.م

🔗 <b>رابط الطلب:</b>
${orderLink}`;

          const response = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              chat_id: chatId,
              text: message,
              parse_mode: 'HTML'
            })
          });
          const data = await response.json();
          if (data.ok && data.result?.message_id) {
            const messageId = data.result.message_id;
            let chatPath = String(chatId);
            if (chatPath.startsWith('-100')) chatPath = 'c/' + chatPath.substring(4);
            else if (chatPath.startsWith('-')) chatPath = 'c/' + chatPath.substring(1);
            const telegramMessageUrl = `https://t.me/${chatPath}/${messageId}`;
            
            // Save link to order
            if (updateOrder) {
              await updateOrder(assignedOrderId, { telegramMessageUrl });
            }
          }
        }
      } catch (err) {
        console.error('Telegram notification failed:', err);
      }

      clearCart();
      clearTrackingData();
      navigate('/success', { state: { orderId: assignedOrderId } });
    };

    submitOrder();
  };

  if (cart.length === 0) {
    return (
      <main className="container pt-4 pb-4" style={{ textAlign: 'center', marginTop: '64px' }}>
        <h1 className="headline-lg mb-3">{t('emptyCart')}</h1>
        <Link to="/shop" className="btn btn-add-cart" style={{ padding: '12px 24px', display: 'inline-block', width: 'auto' }}>{t('continueShopping')}</Link>
      </main>
    );
  }

  return (
    <main className="container pt-4 pb-4">
      <form className="checkout-layout" onSubmit={handleSubmit}>
        
        <div>
          <section className="checkout-section">
            <h2 className="checkout-section-title">
              <Truck size={24} color="var(--primary)" /> {t('deliveryDetails')}
            </h2>
            <div className="checkout-grid">
              <div className="input-group">
                <label className="input-label">{t('firstName')}</label>
                <input type="text" className="input-field" name="firstName" value={formData.firstName} onChange={handleInputChange} placeholder={lang === 'ar' ? 'أحمد' : 'Jane'} required />
              </div>
              <div className="input-group">
                <label className="input-label">{t('lastName')}</label>
                <input type="text" className="input-field" name="lastName" value={formData.lastName} onChange={handleInputChange} placeholder={lang === 'ar' ? 'محمد' : 'Doe'} required />
              </div>
              <div className="input-group col-span-2">
                <label className="input-label">{t('mobileNumber')}</label>
                <input type="tel" className="input-field" name="phone" value={formData.phone} onChange={handleInputChange} placeholder="01X XXXX XXXX" required />
              </div>
                <div className="input-group">
                  <label className="input-label">{t('governorate')}</label>
                  <SearchableSelect 
                    options={govOptions} 
                    placeholder={t('searchGovernorate')} 
                    value={formData.gov}
                    onChange={(val) => handleSelectChange('gov', val)}
                  />
                </div>
                <div className="input-group">
                  <label className="input-label">{t('district')}</label>
                  <SearchableSelect 
                    options={districtOptions} 
                    placeholder={t('searchDistrict')} 
                    value={formData.district}
                    onChange={(val) => handleSelectChange('district', val)}
                    disabled={!formData.gov}
                  />
                </div>
              {formData.district === 'other' && (
                <div className="input-group col-span-2">
                  <label className="input-label">{lang === 'ar' ? 'اسم المنطقة' : 'District Name'}</label>
                  <input type="text" className="input-field" name="customDistrict" value={formData.customDistrict} onChange={handleInputChange} placeholder={lang === 'ar' ? 'اكتب اسم منطقتك هنا' : 'Type your district name here'} required />
                </div>
              )}
              <div className="input-group col-span-2">
                <label className="input-label">{t('streetAddress')}</label>
                <input type="text" className="input-field" name="address" value={formData.address} onChange={handleInputChange} placeholder={lang === 'ar' ? 'اسم الشارع، المنطقة' : 'Street Name, Area'} required />
              </div>
              <div className="input-group">
                <label className="input-label">{t('buildingOptional')}</label>
                <input type="text" className="input-field" name="building" value={formData.building} onChange={handleInputChange} placeholder={lang === 'ar' ? 'مثال: 15 أو مبنى أ' : 'E.g. 15 or Building A'} required />
              </div>
              <div className="input-group">
                <label className="input-label">{t('apartmentOptional')}</label>
                <input type="text" className="input-field" name="apartment" value={formData.apartment} onChange={handleInputChange} placeholder={lang === 'ar' ? 'مثال: شقة 3، الدور 2' : 'E.g. Apt 3, Floor 2'} />
              </div>
            </div>
          </section>

          <section className="checkout-section">
            <h2 className="checkout-section-title">
              <CreditCard size={24} color="var(--primary)" /> {t('paymentMethod')}
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '16px', border: '2px solid var(--primary)', borderRadius: '8px', cursor: 'pointer', backgroundColor: 'var(--surface-container-low)' }}>
                <input type="radio" name="payment" defaultChecked style={{ width: '20px', height: '20px', accentColor: 'var(--primary)' }} />
                <span style={{ fontWeight: 600 }}>{t('cashOnDelivery')}</span>
              </label>
            </div>
          </section>
        </div>

        <div>
          <div className="order-summary card" style={{ position: 'sticky', top: '24px' }}>
            <h2 className="headline-md mb-4" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <ShieldCheck size={24} color="var(--primary)" /> {t('secureCheckout')}
            </h2>
            
            <div style={{ marginBottom: '24px' }}>
              {cart.map(item => (
                <div key={item.cartItemId} style={{ marginBottom: '12px', fontSize: '14px', borderBottom: '1px solid #f1f5f9', paddingBottom: '8px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--on-surface-variant)' }} dir={lang === 'ar' ? 'rtl' : 'ltr'}>{item.qty}x {lang === 'ar' && item.titleAr ? item.titleAr : item.title}</span>
                    <span style={{ fontWeight: 600 }}>{(item.price * item.qty).toFixed(2)} {t('currency')}</span>
                  </div>
                  <div style={{ fontSize: '12px', color: '#64748b', marginTop: '4px' }}>
                    {item.selectedOptions ? (
                      Object.entries(item.selectedOptions).map(([key, val]) => (
                        <span key={key} style={{ marginRight: '8px' }}>{key}: {val}</span>
                      ))
                    ) : (
                      <>
                        {item.selectedColor && <span style={{ marginRight: '8px' }}>{t('color')}: {item.selectedColor}</span>}
                        {item.selectedSize && <span>{t('size')}: {item.selectedSize}</span>}
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <div className="summary-row">
              <span>{t('subtotal')}</span>
              <span>{cartTotal.toFixed(2)} {t('currency')}</span>
            </div>
            
            {/* Promo Code UI */}
            <div style={{ marginBottom: '16px', padding: '16px', backgroundColor: '#f8fafc', borderRadius: '8px' }}>
              {appliedPromo ? (
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <span style={{ fontSize: '13px', color: '#64748b', display: 'block' }}>{lang === 'ar' ? 'كود الخصم المطبق' : 'Applied Promo Code'}</span>
                    <span style={{ fontWeight: 600, color: 'var(--primary)' }}>{appliedPromo.code}</span>
                  </div>
                  <button type="button" onClick={handleRemovePromo} style={{ border: 'none', background: 'none', color: 'var(--error)', cursor: 'pointer', fontSize: '13px', fontWeight: 500 }}>
                    {t('remove')}
                  </button>
                </div>
              ) : (
                <div style={{ display: 'flex', gap: '8px' }}>
                  <input 
                    type="text" 
                    placeholder={t('havePromoCode')} 
                    value={promoInput}
                    onChange={e => setPromoInput(e.target.value)}
                    style={{ flex: 1, padding: '8px 12px', borderRadius: '6px', border: '1px solid #e2e8f0', fontSize: '14px' }}
                    disabled={isApplyingPromo}
                  />
                  <button type="button" onClick={handleApplyPromo} className="btn btn-outline" style={{ padding: '8px 16px', minWidth: '80px', display: 'flex', justifyContent: 'center', alignItems: 'center' }} disabled={isApplyingPromo}>
                    {isApplyingPromo ? (
                      <div className="spinner" style={{ width: '20px', height: '20px', border: '3px solid #f3f3f3', borderTopColor: 'currentColor', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
                    ) : t('apply')}
                  </button>
                </div>
              )}
            </div>

            {appliedPromo && (
              <div className="summary-row" style={{ color: '#10b981' }}>
                <span>Discount {appliedPromo.discountType === 'percentage' ? `(${appliedPromo.discountValue}%)` : ''}</span>
                <span>-{discountAmount.toFixed(2)} {t('currency')}</span>
              </div>
            )}

            <div className="summary-row total">
              <span>{t('total')}</span>
              <span>{finalTotal.toFixed(2)} {t('currency')}</span>
            </div>
            
            <div className="desktop-checkout-action">
              <button type="submit" className="btn btn-add-cart w-100 mt-4" style={{ width: '100%', padding: '16px', fontSize: '16px', display: 'flex', justifyContent: 'center', alignItems: 'center' }} disabled={isSubmitting || cart.length === 0}>
                {isSubmitting ? (
                  <div className="spinner" style={{ width: '24px', height: '24px', border: '3px solid rgba(0,0,0,0.1)', borderTopColor: 'currentColor', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
                ) : t('completeOrder')}
              </button>
            </div>
            
            <div style={{ textAlign: 'center', marginTop: '16px' }}>
              <span style={{ fontSize: '12px', color: 'var(--on-surface-variant)' }}>
                {t('termsAgreement')}
              </span>
            </div>
          </div>
        </div>

        {/* Mobile Fixed Bottom Action Bar */}
        <div className="mobile-checkout-action">
           <div style={{ display: 'flex', flexDirection: 'column' }}>
              <span style={{ fontSize: '12px', color: 'var(--on-surface-variant)' }}>{t('total')}</span>
              <span style={{ fontWeight: 800, fontSize: '18px', color: 'var(--on-surface)' }}>{finalTotal.toFixed(2)} {t('currency')}</span>
           </div>
           <button type="submit" className="btn btn-add-cart" style={{ flex: 1, padding: '14px', fontSize: '16px', display: 'flex', justifyContent: 'center', alignItems: 'center', borderRadius: '100px' }} disabled={isSubmitting || cart.length === 0}>
              {isSubmitting ? (
                <div className="spinner" style={{ width: '20px', height: '20px', border: '3px solid rgba(0,0,0,0.1)', borderTopColor: 'currentColor', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
              ) : t('completeOrder')}
           </button>
        </div>

      </form>
    </main>
  );
}
