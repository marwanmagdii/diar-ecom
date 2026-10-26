import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Trash2, Truck } from 'lucide-react';
import SearchableSelect from '../../components/SearchableSelect';
import { useStore } from '../../store';

export default function CreateOrder() {
  const { addOrder, products, config, language, t, addToast } = useStore();
  const navigate = useNavigate();

  const getProductTitle = (item) => {
    if (!item) return '';
    return (language === 'ar' && item.titleAr) ? item.titleAr : (item.title || '');
  };

  const [deliveryData, setDeliveryData] = useState({
    firstName: '',
    lastName: '',
    mobile: '',
    governorate: '',
    district: '',
    streetAddress: ''
  });

  const [orderItems, setOrderItems] = useState([]);
  const [selectedProductId, setSelectedProductId] = useState('');

  const activeGov = (config.locations || []).find(l => 
    l.nameEn === deliveryData.governorate || 
    l.nameAr === deliveryData.governorate || 
    l.id === deliveryData.governorate
  );
  const availableDistricts = activeGov ? (activeGov.districts || []) : [];

  const handleAddItem = () => {
    if (!selectedProductId) return;
    const product = products.find(p => p.id.toString() === selectedProductId.toString());
    if (!product) return;
    
    const isLegacy = !product.options || product.options.length === 0;
    const mainVariant = !isLegacy && product.variants?.length > 0 ? product.variants[0] : null;
    
    const newItem = {
      id: product.id,
      title: product.title,
      titleAr: product.titleAr,
      price: mainVariant ? Number(mainVariant.offerPrice || mainVariant.price) : Number(product.offerPrice || product.price),
      qty: 1,
      image: mainVariant?.image || product.image || (product.images?.[0]) || '',
      selectedOptions: mainVariant?.attributes || {},
      selectedColor: isLegacy ? (Array.isArray(product.color) ? product.color[0] : product.color) : null
    };

    setOrderItems(prev => [...prev, newItem]);
    setSelectedProductId('');
  };

  const updateItemQty = (index, qty) => {
    if (qty < 1) return;
    setOrderItems(prev => prev.map((item, i) => 
      i === index ? { ...item, qty } : item
    ));
  };

  const removeItem = (index) => {
    setOrderItems(prev => prev.filter((_, i) => i !== index));
  };

  const subtotal = orderItems.reduce((sum, item) => sum + (item.price * item.qty), 0);
  const shipping = config?.shippingActive ? (Number(config?.shippingCost) || 35) : 0;
  const total = subtotal > 0 ? subtotal + shipping : 0;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (orderItems.length === 0) {
      addToast(language === 'ar' ? 'يرجى إضافة منتج واحد على الأقل للطلب.' : 'Please add at least one item to the order.', 'error');
      return;
    }

    const newOrder = {
      id: '#ORD-' + Math.floor(Math.random() * 10000).toString().padStart(4, '0'),
      customer: `${deliveryData.firstName} ${deliveryData.lastName}`.trim(),
      phone: deliveryData.mobile,
      address: `${deliveryData.streetAddress}, ${deliveryData.district}, ${deliveryData.governorate}`,
      items: orderItems,
      subtotal,
      shipping,
      total,
      status: 'Pending',
      paymentMethod: 'Cash on Delivery',
      createdAt: new Date()
    };
    
    addOrder(newOrder);
    addToast(language === 'ar' ? 'تم إنشاء الطلب بنجاح!' : 'Order created successfully!', 'success');
    navigate('/diaradmin26/orders');
  };

  return (
    <div style={{ width: '100%', color: '#1e293b' }}>
      <form onSubmit={handleSubmit}>
        <div className="create-order-grid">
          
          {/* Left Column */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            
            {/* Delivery Details Form */}
            <div className="metric-card" style={{ padding: '32px', backgroundColor: '#ffffff', border: 'none', borderRadius: '12px' }}>
              <h3 style={{ fontSize: '20px', fontWeight: 700, margin: '0 0 24px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Truck size={24} color="var(--primary)" />
                {t('deliveryDetails') || (language === 'ar' ? 'تفاصيل التوصيل' : 'Delivery Details')}
              </h3>

              <div className="form-row">
                <div>
                  <label htmlFor="delivery_first_name" style={{ display: 'block', fontSize: '14px', fontWeight: 600, marginBottom: '8px' }}>
                    {t('firstName') || (language === 'ar' ? 'الاسم الأول' : 'First Name')}
                  </label>
                  <input 
                    type="text" 
                    id="delivery_first_name" 
                    name="firstName" 
                    className="input-field" 
                    required 
                    value={deliveryData.firstName} 
                    onChange={e => setDeliveryData({...deliveryData, firstName: e.target.value})} 
                    style={{ padding: '12px', borderRadius: '8px' }} 
                    placeholder={language === 'ar' ? 'محمد' : 'Jane'} 
                  />
                </div>
                <div>
                  <label htmlFor="delivery_last_name" style={{ display: 'block', fontSize: '14px', fontWeight: 600, marginBottom: '8px' }}>
                    {t('lastName') || (language === 'ar' ? 'الاسم الأخير' : 'Last Name')}
                  </label>
                  <input 
                    type="text" 
                    id="delivery_last_name" 
                    name="lastName" 
                    className="input-field" 
                    required 
                    value={deliveryData.lastName} 
                    onChange={e => setDeliveryData({...deliveryData, lastName: e.target.value})} 
                    style={{ padding: '12px', borderRadius: '8px' }} 
                    placeholder={language === 'ar' ? 'علي' : 'Doe'} 
                  />
                </div>
              </div>

              <div style={{ marginBottom: '24px' }}>
                <label htmlFor="delivery_mobile" style={{ display: 'block', fontSize: '14px', fontWeight: 600, marginBottom: '8px' }}>
                  {t('mobileNumber') || (language === 'ar' ? 'رقم الهاتف' : 'Mobile Number')}
                </label>
                <input 
                  type="text" 
                  id="delivery_mobile" 
                  name="mobile" 
                  className="input-field" 
                  required 
                  value={deliveryData.mobile} 
                  onChange={e => {
                    let sanitized = e.target.value.replace(/\D/g, '');
                    if (sanitized.startsWith('00201') && sanitized.length >= 13) {
                      sanitized = '0' + sanitized.slice(4);
                    } else if (sanitized.startsWith('201') && sanitized.length >= 12) {
                      sanitized = '0' + sanitized.slice(2);
                    }
                    sanitized = sanitized.slice(0, 11);
                    setDeliveryData({...deliveryData, mobile: sanitized});
                  }} 
                  style={{ padding: '12px', borderRadius: '8px' }} 
                  placeholder="01X XXXX XXXX" 
                />
              </div>

              <div className="form-row">
                <div>
                  <label htmlFor="delivery_governorate" style={{ display: 'block', fontSize: '14px', fontWeight: 600, marginBottom: '8px' }}>
                    {t('governorate') || (language === 'ar' ? 'المحافظة' : 'Governorate')}
                  </label>
                  <select 
                    id="delivery_governorate" 
                    name="governorate" 
                    className="input-field" 
                    required 
                    style={{ padding: '12px', borderRadius: '8px' }} 
                    value={deliveryData.governorate} 
                    onChange={e => setDeliveryData({...deliveryData, governorate: e.target.value, district: ''})}
                  >
                    <option value="">{language === 'ar' ? 'اختر المحافظة...' : 'Select Governorate...'}</option>
                    {(config.locations || []).filter(l => l.isActive !== false).map(gov => (
                      <option key={gov.id} value={gov.nameEn}>
                        {language === 'ar' && gov.nameAr ? gov.nameAr : gov.nameEn}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label htmlFor="delivery_district" style={{ display: 'block', fontSize: '14px', fontWeight: 600, marginBottom: '8px' }}>
                    {t('district') || (language === 'ar' ? 'المنطقة' : 'District')}
                  </label>
                  <select 
                    id="delivery_district" 
                    name="district" 
                    className="input-field" 
                    required 
                    style={{ padding: '12px', borderRadius: '8px' }} 
                    value={deliveryData.district} 
                    onChange={e => setDeliveryData({...deliveryData, district: e.target.value})}
                    disabled={!deliveryData.governorate}
                  >
                    <option value="">{language === 'ar' ? 'اختر المنطقة...' : 'Select District...'}</option>
                    {availableDistricts.filter(d => d.isActive !== false).map(d => (
                      <option key={d.id} value={d.nameEn}>
                        {language === 'ar' && d.nameAr ? d.nameAr : d.nameEn}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label htmlFor="delivery_street_address" style={{ display: 'block', fontSize: '14px', fontWeight: 600, marginBottom: '8px' }}>
                  {t('streetAddress') || (language === 'ar' ? 'عنوان الشارع' : 'Street Address')}
                </label>
                <input 
                  type="text" 
                  id="delivery_street_address" 
                  name="streetAddress" 
                  className="input-field" 
                  required 
                  value={deliveryData.streetAddress} 
                  onChange={e => setDeliveryData({...deliveryData, streetAddress: e.target.value})} 
                  style={{ padding: '12px', borderRadius: '8px' }} 
                  placeholder={language === 'ar' ? 'اسم الشارع، العمارة، الدور' : 'Street Name, Building, Floor'} 
                />
              </div>
            </div>

            {/* Order Items */}
            <div className="metric-card" style={{ padding: '24px', backgroundColor: '#ffffff', border: 'none', borderRadius: '12px' }}>
              <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', gap: '16px' }}>
                <h3 style={{ fontSize: '16px', fontWeight: 600, margin: 0 }}>
                  {t('addProducts') || (language === 'ar' ? 'إضافة منتجات' : 'Add Products')}
                </h3>
                <div style={{ display: 'flex', flex: '1 1 auto', gap: '8px', justifyContent: 'flex-end' }}>
                  <div style={{ flex: 1, minWidth: '150px', maxWidth: '300px' }}>
                    <SearchableSelect 
                      options={products.map(p => ({ label: `${getProductTitle(p)} - ${p.price} ${language === 'ar' ? 'ج.م' : 'EGP'}`, value: p.id.toString() }))}
                      value={selectedProductId?.toString() || ''}
                      onChange={(val) => setSelectedProductId(val)}
                      placeholder={language === 'ar' ? "ابحث عن منتج..." : "Search a product..."}
                    />
                  </div>
                  <button type="button" className="btn btn-primary" onClick={handleAddItem} style={{ padding: '8px 12px' }} aria-label="Add Selected Product">
                    <Plus size={20} />
                  </button>
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {orderItems.length === 0 ? (
                  <p style={{ textAlign: 'center', color: '#64748b', padding: '24px 0' }}>
                    {language === 'ar' ? "لم تتم إضافة أي منتجات لهذا الطلب بعد." : "No products added to this order yet."}
                  </p>
                ) : (
                  orderItems.map((item, index) => (
                    <div key={`${item.id}-${index}`} style={{ display: 'flex', alignItems: 'center', backgroundColor: '#f8fafc', padding: '16px', borderRadius: '8px' }}>
                      <div style={{ width: '48px', height: '64px', backgroundColor: '#e2e8f0', borderRadius: '4px', marginInlineEnd: '16px', overflow: 'hidden', flexShrink: 0 }}>
                        <img src={item.image || 'https://placehold.co/48x64'} alt={getProductTitle(item)} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      </div>
                      
                      <div style={{ flex: 2 }}>
                        <p style={{ fontSize: '15px', fontWeight: 600, margin: 0 }}>{getProductTitle(item)}</p>
                        <p style={{ fontSize: '13px', color: '#64748b', margin: '4px 0 0 0' }}>{item.price?.toFixed(2)} {language === 'ar' ? 'ج.م' : 'EGP'}</p>
                      </div>
                      
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <input 
                          type="number" 
                          id={`order_item_qty_${item.id}_${index}`}
                          name={`orderItemQty_${item.id}_${index}`}
                          aria-label={`Quantity for ${getProductTitle(item)}`}
                          min="1" 
                          value={item.qty} 
                          onChange={(e) => updateItemQty(index, parseInt(e.target.value) || 1)}
                          className="input-field"
                          style={{ width: '60px', padding: '6px', textAlign: 'center' }} 
                        />
                        <button type="button" className="icon-btn" style={{ color: 'var(--error)' }} onClick={() => removeItem(index)} aria-label={`Remove ${getProductTitle(item)}`}>
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

          </div>

          {/* Right Column */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            
            {/* Summary Card */}
            <div className="metric-card" style={{ padding: '24px', backgroundColor: '#ffffff', border: 'none', borderRadius: '12px' }}>
              <h3 style={{ fontSize: '16px', fontWeight: 700, margin: '0 0 24px 0' }}>
                {t('cartTotals') || (language === 'ar' ? 'إجمالي السلة' : 'Cart Totals')}
              </h3>
              <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '16px', borderBottom: '1px solid #f1f5f9' }}>
                <span style={{ color: '#64748b', fontSize: '14px' }}>{t('subtotal') || (language === 'ar' ? 'المجموع الفرعي' : 'Subtotal')}</span>
                <span style={{ fontWeight: 600, fontSize: '14px' }}>{subtotal.toFixed(2)} {language === 'ar' ? 'ج.م' : 'EGP'}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: '16px', paddingBottom: '16px', borderBottom: '1px solid #f1f5f9' }}>
                <span style={{ color: '#64748b', fontSize: '14px' }}>{t('shipping') || (language === 'ar' ? 'الشحن' : 'Shipping')}</span>
                <span style={{ fontWeight: 600, fontSize: '14px' }}>{shipping.toFixed(2)} {language === 'ar' ? 'ج.م' : 'EGP'}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: '16px', marginBottom: '24px' }}>
                <span style={{ fontWeight: 700, fontSize: '16px' }}>{t('totalAmount') || (language === 'ar' ? 'الإجمالي النهائي' : 'Total Amount')}</span>
                <span style={{ fontWeight: 700, fontSize: '18px', color: '#ea580c' }}>{total.toFixed(2)} {language === 'ar' ? 'ج.م' : 'EGP'}</span>
              </div>

              <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '12px', fontSize: '16px' }}>
                {t('createOrder') || (language === 'ar' ? 'إنشاء الطلب' : 'Submit Order')}
              </button>
            </div>

          </div>
        </div>
      </form>
    </div>
  );
}
