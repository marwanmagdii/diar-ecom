import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { useParams, useNavigate } from 'react-router-dom';
import { ChevronRight, ChevronDown, Trash2, Edit, Check, X, Plus, Copy, Search } from 'lucide-react';
import { PremiumInput } from '../../components/AdminUI';
import SearchableSelect from '../../components/SearchableSelect';
import { useStore } from '../../store';

export default function OrderDetails() {
  const { id } = useParams();
  const { orders, updateOrder, deleteOrder, t, lang, ordersLoading: loading } = useStore();
  const { products, users } = useStore();
  const navigate = useNavigate();
  const { addToast } = useStore();

  const order = orders.find(o => o.id === id);

  const handleCustomerClick = () => {
    if (!order?.phone) return;
    const user = users.find(u => u.phone === order.phone || u.phone === `+2${order.phone}` || `+2${u.phone}` === order.phone);
    if (user) {
      navigate(`/diaradmin26/users/${user.id}`);
    } else {
      addToast(lang === 'ar' ? 'المستخدم غير مسجل' : 'User not registered', 'error');
    }
  };
  const { config } = useStore();

  const getArabicGov = (govId) => {
    const gov = config.locations?.find(l => l.id === govId || l.nameEn === govId);
    return gov ? gov.nameAr : govId;
  };
  
  const getArabicDist = (distId) => {
    for (const gov of (config.locations || [])) {
      const dist = gov.districts?.find(d => d.id === distId || d.nameEn === distId);
      if (dist) return dist.nameAr;
    }
    return distId;
  };

  const buildConfirmationText = (useLang) => {
    const gov = displayAddress.governorate || '';
    const district = displayAddress.district || '';
    const street = displayAddress.street || '';
    const building = displayAddress.building || '';
    const apt = displayAddress.apartment || '';

    const translateVal = (v) => {
      const lowerV = String(v).toLowerCase().trim();
      const valMap = {
        'black': 'أسود', 'white': 'أبيض', 'red': 'أحمر', 'blue': 'أزرق',
        'green': 'أخضر', 'yellow': 'أصفر', 'gray': 'رمادي', 'silver': 'فضي',
        'gold': 'ذهبي', 'pink': 'وردي', 'purple': 'بنفسجي', 'brown': 'بني',
        'navy': 'كحلي', 'beige': 'بيج', 'orange': 'برتقالي', 'maroon': 'عنابي',
        'teal': 'تركواز', 'metal': 'معدن', 'plastic': 'بلاستيك', 'wood': 'خشب',
        'glass': 'زجاج', 'leather': 'جلد', 'cotton': 'قطن', 'modern': 'حديث',
        'classic': 'كلاسيكي', 'casual': 'كاجوال', 'formal': 'رسمي', 'sport': 'رياضي'
      };
      if (valMap[lowerV]) return valMap[lowerV];
      if (String(v).includes(' / ')) return String(v).split(' / ')[1].trim() || v;
      return v;
    };

    const translateKey = (k) => {
      const lowerK = String(k).toLowerCase().trim();
      const keyMap = {
        'color': 'اللون', 'size': 'المقاس', 'material': 'الخامة',
        'weight': 'الوزن', 'style': 'الستايل'
      };
      if (keyMap[lowerK]) return keyMap[lowerK];
      if (lowerK.includes(' / ')) return k.split(' / ')[1].trim() || k;
      return k;
    };

    const buildItemOptionsText = (item, isAr) => {
      const opts = [];
      const prefix = isAr ? '\n\u200F  ▪️ \u200E' : '\n  - ';
      if (item.selectedOptions) {
        Object.entries(item.selectedOptions).forEach(([key, val]) => {
          opts.push(`${prefix}${isAr ? translateKey(key) : key}: ${isAr ? translateVal(val) : val.split(' / ')[0]}`);
        });
      } else {
        if (item.color) opts.push(`${prefix}${isAr ? 'اللون' : 'Color'}: ${isAr ? translateVal(item.color) : item.color}`);
        if (item.size) opts.push(`${prefix}${isAr ? 'المقاس' : 'Size'}: ${isAr ? translateVal(item.size) : item.size}`);
        if (item.material) opts.push(`${prefix}${isAr ? 'المادة' : 'Material'}: ${isAr ? translateVal(item.material) : item.material}`);
        if (item.weight) opts.push(`${prefix}${isAr ? 'الوزن' : 'Weight'}: ${isAr ? translateVal(item.weight) : item.weight}`);
      }
      return opts.length > 0 ? opts.join('') : '';
    };

    const itemsListAr = (order.items || []).map(item => `- (${item.qty}) ${item.titleAr || item.title} - ${item.price?.toFixed(2) || '0.00'} ج.م${buildItemOptionsText(item, true)}`).join('\n');
    const itemsListEn = (order.items || []).map(item => `- (${item.qty}) ${item.title} - ${item.price?.toFixed(2) || '0.00'} EGP${buildItemOptionsText(item, false)}`).join('\n');

    if (useLang === 'ar') {
      const arGov = getArabicGov(gov);
      const arDist = getArabicDist(district);
      const discountText = order.discount && order.discount > 0 ? `\nالخصم: ${order.discount.toFixed(2)} ج.م` : '';
      const shippingText = order.shipping && order.shipping > 0 ? `\nالشحن: ${order.shipping.toFixed(2)} ج.م` : '';
      const linkTextAr = `\n\n🔗 رابط الطلب: فتح في لوحة التحكم\n${window.location.origin}/admin/orders/${order.id}`;
      return `مرحباً ${order.customer}،\nلقد استلمنا طلبك رقم ${order.id}.\n\n*المنتجات:*\n${itemsListAr}\n\n*الإيصال:*\nالمجموع الفرعي: ${order.subtotal?.toFixed(2) || '0.00'} ج.م${shippingText}${discountText}\nالإجمالي: ${order.total?.toFixed(2) || '0.00'} ج.م\n\n*تفاصيل التوصيل:*\nالمحافظة: ${arGov}\nالمنطقة: ${arDist}\nالشارع: ${street}\nالمبنى: ${building || 'لا يوجد'}\nالشقة: ${apt || 'لا يوجد'}\nرقم الهاتف: ${order.phone}\n\nشكراً لتسوقك معنا!${linkTextAr}`;
    } else {
      const discountText = order.discount && order.discount > 0 ? `\nDiscount: ${order.discount.toFixed(2)} EGP` : '';
      const shippingText = order.shipping && order.shipping > 0 ? `\nShipping: ${order.shipping.toFixed(2)} EGP` : '';
      const linkTextEn = `\n\n🔗 Order Link: Open in Dashboard\n${window.location.origin}/admin/orders/${order.id}`;
      return `Hello ${order.customer},\nWe have received your order ${order.id}.\n\n*Products:*\n${itemsListEn}\n\n*Receipt:*\nSubtotal: ${order.subtotal?.toFixed(2) || '0.00'} EGP${shippingText}${discountText}\nTotal: ${order.total?.toFixed(2) || '0.00'} EGP\n\n*Delivery Details:*\nGovernorate: ${gov}\nDistrict: ${district}\nStreet: ${street}\nBuilding: ${building || 'N/A'}\nApartment: ${apt || 'N/A'}\nPhone: ${order.phone}\n\nThank you for shopping with us!${linkTextEn}`;
    }
  };

  const handleCopyForDriver = (overrideLang) => {
    const text = buildConfirmationText(overrideLang || lang);
    navigator.clipboard.writeText(text);
    addToast('Order confirmation copied to clipboard!', 'success');
  };

  const openWhatsapp = (overrideLang) => {
    let targetPhone = order.phone ? order.phone.replace(/\D/g, '') : '';
    if (targetPhone.startsWith('01')) {
      targetPhone = '2' + targetPhone;
    }
    const message = buildConfirmationText(overrideLang || lang);
    const url = `https://wa.me/${targetPhone}?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank');
  };

  const [isEditingDelivery, setIsEditingDelivery] = useState(false);
  const [deliveryData, setDeliveryData] = useState({
    firstName: '',
    lastName: '',
    mobile: '',
    governorate: '',
    district: '',
    streetAddress: '',
    building: '',
    apartment: ''
  });

  const [isEditingItems, setIsEditingItems] = useState(false);
  const [editedItems, setEditedItems] = useState([]);
  const [newItemId, setNewItemId] = useState('');

  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deleteInput, setDeleteInput] = useState('');

  // ... (inserting isDropdownOpen state above the return statement)
  useEffect(() => {
    if (order) {
      // Try to parse structured address if it was saved that way, otherwise fallback to flat
      const addrParts = order.address?.split(', ') || [];
      const isStructured = addrParts.length >= 3;
      
      setDeliveryData({
        firstName: order.customer?.split(' ')[0] || '',
        lastName: order.customer?.split(' ').slice(1).join(' ') || '',
        mobile: order.phone || '',
        governorate: isStructured ? addrParts[addrParts.length - 1] : '',
        district: isStructured ? addrParts[addrParts.length - 2] : '',
        streetAddress: isStructured ? addrParts.slice(0, addrParts.length - 2).join(', ') : order.address || '',
        building: order.building || '',
        apartment: order.apartment || ''
      });

      setEditedItems([...(order.items || [])]);
    }
  }, [order]);

  if (loading && !order) {
    return (
      <div style={{ padding: '48px', display: 'flex', justifyContent: 'center' }}>
        <div className="spinner" style={{ width: '40px', height: '40px', border: '3px solid var(--surface-container-highest)', borderTopColor: 'var(--primary)', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
      </div>
    );
  }

  if (!order) {
    return (
      <div style={{ padding: '32px', textAlign: 'center' }}>
        <p>Order not found.</p>
        <button className="btn" onClick={() => navigate('/diaradmin26/orders')}>Back to Orders</button>
      </div>
    );
  }

  const handleStatusChange = (newStatus) => {
    updateOrder(id, { status: newStatus });
  };

  const handleDelete = () => {
    setDeleteModalOpen(true);
    setDeleteInput('');
  };

  const confirmDelete = async () => {
    if (deleteInput.trim().toLowerCase() === 'delete') {
      try {
        await deleteOrder(id);
        addToast('Order deleted successfully', 'success');
        navigate('/diaradmin26/orders');
      } catch (e) {
        addToast('Failed to delete order', 'error');
      }
    }
  };

  const handleSaveDelivery = () => {
    updateOrder(id, {
      customer: `${deliveryData.firstName} ${deliveryData.lastName}`.trim(),
      phone: deliveryData.mobile,
      address: `${deliveryData.streetAddress}, ${deliveryData.district}, ${deliveryData.governorate}`,
      building: deliveryData.building,
      apartment: deliveryData.apartment
    });
    setIsEditingDelivery(false);
  };

  // Items Editing Logic
  const handleAddItem = () => {
    if (!newItemId) return;
    const product = products.find(p => p.id === newItemId);
    if (!product) return;

    const existingItem = editedItems.find(item => item.id === product.id);
    if (existingItem) {
      setEditedItems(editedItems.map(item => 
        item.id === product.id ? { ...item, qty: item.qty + 1 } : item
      ));
    } else {
      setEditedItems([...editedItems, { 
        id: product.id, 
        title: product.title, 
        qty: 1, 
        price: product.price,
        category: product.category,
        color: product.color,
        size: product.size,
        material: product.material,
        weight: product.weight
      }]);
    }
    setNewItemId('');
  };

  const handleRemoveItem = (itemId) => {
    setEditedItems(editedItems.filter(item => item.id !== itemId));
  };

  const handleQtyChange = (itemId, newQty) => {
    if (newQty < 1) return;
    setEditedItems(editedItems.map(item => 
      item.id === itemId ? { ...item, qty: newQty } : item
    ));
  };

  const handleAttributeChange = (itemId, attribute, value) => {
    setEditedItems(editedItems.map(item => 
      item.id === itemId ? { ...item, [attribute]: value } : item
    ));
  };

  const handleSaveItems = () => {
    const subtotal = editedItems.reduce((sum, item) => sum + (item.price * item.qty), 0);
    const shipping = order.shipping || 35;
    const total = subtotal > 0 ? subtotal + shipping : 0;
    
    updateOrder(id, { items: editedItems, subtotal, total });
    setIsEditingItems(false);
  };

  const cancelEditItems = () => {
    setEditedItems([...(order.items || [])]);
    setIsEditingItems(false);
  };

  // Structured Display Address
  const displayAddress = {
    governorate: deliveryData.governorate || '',
    district: deliveryData.district || '',
    street: deliveryData.streetAddress || order.address || '',
    building: deliveryData.building || order.building || '',
    apartment: deliveryData.apartment || order.apartment || ''
  };

  const itemsToDisplay = isEditingItems ? editedItems : order.items;

  const mobileGridStyles = `
    @media (max-width: 768px) {
      .admin-item-card {
        display: grid !important;
        grid-template-columns: 64px 1fr auto !important;
        gap: 12px 16px !important;
        align-items: start !important;
        padding: 16px !important;
        flex-wrap: nowrap !important;
      }
      .admin-item-card > div:first-child {
        grid-column: 1 !important;
        grid-row: 1 / 3 !important;
        margin: 0 !important;
        width: 64px !important;
      }
      .admin-item-card > div:nth-child(2) {
        grid-column: 2 / 4 !important;
        grid-row: 1 !important;
        flex: none !important;
      }
      .admin-item-card > div:nth-child(3) {
        grid-column: 2 !important;
        grid-row: 2 !important;
        margin: 0 !important;
        border: none !important;
        padding: 0 !important;
        flex: none !important;
      }
      .admin-item-card > div:nth-child(4) {
        grid-column: 3 !important;
        grid-row: 2 !important;
        margin: 0 !important;
        border: none !important;
        padding: 0 !important;
        text-align: right !important;
        display: flex !important;
        flex-direction: column !important;
        justify-content: flex-end !important;
        flex: none !important;
      }
      .admin-item-card > div:nth-child(4) p:first-child {
        display: none !important;
      }
      .admin-item-card > div:nth-child(4) p:last-child {
        font-size: 15px !important;
        font-weight: 700 !important;
      }
    }
  `;

  return (
    <div style={{ width: '100%' }}>
      <style>{mobileGridStyles}</style>
      
      {/* Mobile Back Button */}
      <button 
        onClick={() => navigate('/diaradmin26/orders')}
        style={{ background: 'none', border: 'none', padding: '0 0 16px 0', fontSize: '14px', color: '#64748b', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
      >
        <ChevronRight size={16} style={{ transform: lang === 'ar' ? 'rotate(0deg)' : 'rotate(180deg)' }} />
        {t('orders')}
      </button>

      {/* Header Actions moved to Portal */}
      {document.getElementById('admin-header-actions') && createPortal(
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <button 
            className="icon-btn" 
            onClick={() => handleCopyForDriver('ar')} 
            title={lang === 'ar' ? 'نسخ التفاصيل' : 'Copy Details'}
            style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', padding: '6px 12px', border: '1px solid var(--outline-variant)', borderRadius: '8px' }}
          >
            <Copy size={16} /> <span className="mobile-hidden">{lang === 'ar' ? 'نسخ' : 'Copy'}</span>
          </button>
          
          {order.telegramMessageUrl && (
            <a 
              href={order.telegramMessageUrl} 
              target="_blank" 
              rel="noopener noreferrer"
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#e0f2fe', color: '#0284c7', padding: '8px', borderRadius: '8px', textDecoration: 'none' }}
              title="Open in Telegram"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M22 2L11 13"></path><path d="M22 2l-7 20-4-9-9-4 20-7z"></path></svg>
            </a>
          )}
          
          <select 
            className="input-field" 
            style={{ width: 'auto', padding: '4px 12px', fontSize: '13px', height: '36px', minWidth: '100px' }}
            value={order.status}
            onChange={(e) => handleStatusChange(e.target.value)}
          >
            <option value="Pending">{t('pending') || 'Pending'}</option>
            <option value="Shipped">{t('shipped') || 'Shipped'}</option>
            <option value="Delivered">{t('delivered') || 'Delivered'}</option>
            <option value="Cancelled">{t('cancelled') || 'Cancelled'}</option>
          </select>
          
          <button className="icon-btn" style={{ color: 'var(--error)' }} onClick={handleDelete} title="Delete Order">
            <Trash2 size={18} />
          </button>
        </div>,
        document.getElementById('admin-header-actions')
      )}

      <div className="admin-order-layout">
        
        {/* Left Column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          {/* All Items Card */}
          <div className="metric-card" style={{ padding: '32px', backgroundColor: '#ffffff', border: 'none', borderRadius: '12px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
              <h3 style={{ fontSize: '20px', fontWeight: 700, margin: 0, color: '#0f172a' }}>{t('allItem')}</h3>
              
              {!isEditingItems ? (
                <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                  <button className="icon-btn" onClick={() => setIsEditingItems(true)} title="Edit Items"><Edit size={16} /></button>
                  <div style={{ fontSize: '14px', color: '#475569', display: 'flex', alignItems: 'center', gap: '4px', cursor: 'pointer' }}>
                    Sort <ChevronRight size={14} style={{ transform: 'rotate(90deg)' }} />
                  </div>
                </div>
              ) : (
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button className="icon-btn" style={{ color: 'var(--primary)' }} onClick={handleSaveItems}><Check size={20} /></button>
                  <button className="icon-btn" onClick={cancelEditItems}><X size={20} /></button>
                </div>
              )}
            </div>

            {isEditingItems && (
              <div style={{ display: 'flex', gap: '16px', marginBottom: '24px', paddingBottom: '24px', borderBottom: '1px solid #f1f5f9', alignItems: 'center' }}>
                <div style={{ flex: 1, minWidth: '150px', maxWidth: '300px' }}>
                  <SearchableSelect 
                    options={products.map(p => ({ label: `${p.title} - ${p.price} EGP`, value: p.id.toString() }))}
                    value={newItemId?.toString() || ''}
                    onChange={(val) => setNewItemId(val)}
                    placeholder={lang === 'ar' ? 'ابحث عن منتج...' : 'Search a product...'}
                  />
                </div>
                <button type="button" className="btn" onClick={handleAddItem} style={{ padding: '8px 12px', display: 'flex', alignItems: 'center', gap: '6px', borderRadius: '8px' }}>
                  <Plus size={18} />
                </button>
              </div>
            )}

            <div style={{ overflow: 'hidden', overflowX: 'auto', maxWidth: '100%', margin: '0 -16px', padding: '0 16px' }}>
              <div className="admin-table-container">
                <table className="admin-table">
                <thead>
                  <tr>
                    <th>{lang === 'ar' ? 'المنتج' : 'Product'}</th>
                    <th>{lang === 'ar' ? 'التفاصيل' : 'Details'}</th>
                    <th>{t('quantity')}</th>
                    <th>{t('price')}</th>
                    {isEditingItems && <th>{lang === 'ar' ? 'إجراءات' : 'Actions'}</th>}
                  </tr>
                </thead>
                <tbody>
                  {itemsToDisplay?.map((item, idx) => {
                    const product = products.find(p => p.id === item.id) || {};
                    let imageUrl = item.image || product.image || 'https://via.placeholder.com/48';
                    if (item.variantId && product.variants) {
                      const variant = product.variants.find(v => v.id === item.variantId);
                      if (variant && variant.image) imageUrl = variant.image;
                    }

                    return (
                      <tr key={idx}>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <div 
                              onClick={() => navigate(`/diaradmin26/products/${item.id}`)}
                              style={{ width: '48px', height: '48px', backgroundColor: '#e2e8f0', borderRadius: '6px', overflow: 'hidden', flexShrink: 0, cursor: 'pointer' }}
                            >
                              <img src={imageUrl} alt={item.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            </div>
                            <p 
                              onClick={() => navigate(`/diaradmin26/products/${item.id}`)}
                              style={{ fontSize: '14px', fontWeight: 600, margin: 0, color: '#0f172a', cursor: 'pointer' }}
                              className="hover-underline"
                            >
                              {item.title}
                            </p>
                          </div>
                        </td>
                        <td>
                          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                            {isEditingItems ? (
                              <>
                                {item.color !== undefined && <input type="text" value={item.color} onChange={(e) => handleAttributeChange(item.id, 'color', e.target.value)} style={{ fontSize: '12px', padding: '4px 8px', borderRadius: '6px', border: '1px solid #cbd5e1', width: '60px' }} placeholder="Color" />}
                                {item.size !== undefined && <input type="text" value={item.size} onChange={(e) => handleAttributeChange(item.id, 'size', e.target.value)} style={{ fontSize: '12px', padding: '4px 8px', borderRadius: '6px', border: '1px solid #cbd5e1', width: '50px' }} placeholder="Size" />}
                                {item.material !== undefined && <input type="text" value={item.material} onChange={(e) => handleAttributeChange(item.id, 'material', e.target.value)} style={{ fontSize: '12px', padding: '4px 8px', borderRadius: '6px', border: '1px solid #cbd5e1', width: '80px' }} placeholder="Material" />}
                                {item.weight !== undefined && <input type="text" value={item.weight} onChange={(e) => handleAttributeChange(item.id, 'weight', e.target.value)} style={{ fontSize: '12px', padding: '4px 8px', borderRadius: '6px', border: '1px solid #cbd5e1', width: '60px' }} placeholder="Weight" />}
                              </>
                            ) : (
                              <>
                                {item.selectedOptions ? (
                                  Object.entries(item.selectedOptions).map(([k, v]) => (
                                    <span key={k} style={{ fontSize: '12px', backgroundColor: '#e2e8f0', padding: '2px 6px', borderRadius: '4px' }}>
                                      {lang === 'ar' ? translateKey(k) : k}: {lang === 'ar' ? translateVal(v) : v.split(' / ')[0]}
                                    </span>
                                  ))
                                ) : (
                                  <>
                                    {item.color && <span style={{ fontSize: '12px', backgroundColor: '#e2e8f0', padding: '2px 6px', borderRadius: '4px' }}>{item.color}</span>}
                                    {item.size && <span style={{ fontSize: '12px', backgroundColor: '#e2e8f0', padding: '2px 6px', borderRadius: '4px' }}>{item.size}</span>}
                                    {item.material && <span style={{ fontSize: '12px', backgroundColor: '#e2e8f0', padding: '2px 6px', borderRadius: '4px' }}>{item.material}</span>}
                                    {item.weight && <span style={{ fontSize: '12px', backgroundColor: '#e2e8f0', padding: '2px 6px', borderRadius: '4px' }}>{item.weight}</span>}
                                  </>
                                )}
                              </>
                            )}
                          </div>
                        </td>
                        <td>
                          {isEditingItems ? (
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', border: '1px solid #e2e8f0', borderRadius: '6px', padding: '2px', width: 'fit-content' }}>
                              <button type="button" onClick={() => handleQtyChange(item.id, item.qty - 1)} style={{ width: '24px', height: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center', border: 'none', background: '#f1f5f9', cursor: 'pointer' }}>-</button>
                              <span style={{ fontSize: '14px', fontWeight: 600, minWidth: '20px', textAlign: 'center' }}>{item.qty}</span>
                              <button type="button" onClick={() => handleQtyChange(item.id, item.qty + 1)} style={{ width: '24px', height: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center', border: 'none', background: '#f1f5f9', cursor: 'pointer' }}>+</button>
                            </div>
                          ) : (
                            <span style={{ fontSize: '14px', fontWeight: 600 }}>{item.qty}</span>
                          )}
                        </td>
                        <td>
                          <span style={{ fontSize: '14px', fontWeight: 600 }}>{item.price?.toFixed(2)} EGP</span>
                        </td>
                        {isEditingItems && (
                          <td>
                            <button 
                              type="button" 
                              onClick={() => handleRemoveItem(item.id)}
                              className="icon-btn"
                              style={{ color: 'var(--error)' }}
                            >
                              <Trash2 size={16} />
                            </button>
                          </td>
                        )}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
              </div>
            </div>
            {itemsToDisplay?.length === 0 && (
              <p style={{ textAlign: 'center', color: '#64748b', padding: '24px 0' }}>No products in this order.</p>
            )}
          </div>

          {/* Delivery Details Edit Form (Only shows when editing) */}
          {isEditingDelivery && (
            <div className="metric-card" style={{ padding: '32px', backgroundColor: '#ffffff', border: 'none', borderRadius: '12px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                <h3 style={{ fontSize: '20px', fontWeight: 700, margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: '#8c3a3a' }}><rect x="1" y="3" width="15" height="13"></rect><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"></polygon><circle cx="5.5" cy="18.5" r="2.5"></circle><circle cx="18.5" cy="18.5" r="2.5"></circle></svg>
                  {t('deliveryDetails')}
                </h3>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button className="icon-btn" style={{ color: 'var(--primary)' }} onClick={handleSaveDelivery}><Check size={20} /></button>
                  <button className="icon-btn" onClick={() => setIsEditingDelivery(false)}><X size={20} /></button>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginBottom: '24px' }}>
                <PremiumInput label={t('firstName')} value={deliveryData.firstName} onChange={e => setDeliveryData({...deliveryData, firstName: e.target.value})} />
                <PremiumInput label={t('lastName')} value={deliveryData.lastName} onChange={e => setDeliveryData({...deliveryData, lastName: e.target.value})} />
              </div>

              <div style={{ marginBottom: '24px' }}>
                <PremiumInput label={t('mobileNumber')} value={deliveryData.mobile} onChange={e => {
                  let sanitized = e.target.value.replace(/\D/g, '');
                  if (sanitized.startsWith('00201') && sanitized.length >= 13) {
                    sanitized = '0' + sanitized.slice(4);
                  } else if (sanitized.startsWith('201') && sanitized.length >= 12) {
                    sanitized = '0' + sanitized.slice(2);
                  }
                  sanitized = sanitized.slice(0, 11);
                  setDeliveryData({...deliveryData, mobile: sanitized});
                }} placeholder="01X XXXX XXXX" />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginBottom: '24px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: 600, marginBottom: '8px' }}>{t('governorate')}</label>
                  <select className="input-field" style={{ padding: '12px', borderRadius: '8px' }} value={deliveryData.governorate} onChange={e => setDeliveryData({...deliveryData, governorate: e.target.value})}>
                    <option value="">{t('searchGovernorate')}</option>
                    <option value="Cairo">Cairo</option>
                    <option value="Giza">Giza</option>
                    <option value="Alexandria">Alexandria</option>
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: 600, marginBottom: '8px' }}>{t('district')}</label>
                  <select className="input-field" style={{ padding: '12px', borderRadius: '8px' }} value={deliveryData.district} onChange={e => setDeliveryData({...deliveryData, district: e.target.value})}>
                    <option value="">{t('searchDistrict')}</option>
                    <option value="Maadi">Maadi</option>
                    <option value="Nasr City">Nasr City</option>
                    <option value="Zamalek">Zamalek</option>
                  </select>
                </div>
              </div>

              <div style={{ marginBottom: '24px' }}>
                <PremiumInput label={t('streetAddress')} value={deliveryData.streetAddress} onChange={e => setDeliveryData({...deliveryData, streetAddress: e.target.value})} placeholder="Street Name" />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
                <PremiumInput label={t('building')} value={deliveryData.building} onChange={e => setDeliveryData({...deliveryData, building: e.target.value})} placeholder="Building Number" />
                <PremiumInput label={t('apartment')} value={deliveryData.apartment} onChange={e => setDeliveryData({...deliveryData, apartment: e.target.value})} placeholder="Apartment Number" />
              </div>
            </div>
          )}

          {/* Cart Totals Card */}
          <div className="metric-card" style={{ padding: '32px', backgroundColor: '#ffffff', border: 'none', borderRadius: '12px' }}>
            <h3 style={{ fontSize: '20px', fontWeight: 700, margin: '0 0 32px 0', color: '#0f172a' }}>{t('cartTotals')}</h3>
            <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '20px', borderBottom: '1px solid #f1f5f9' }}>
              <span style={{ color: '#0f172a', fontSize: '16px', fontWeight: 600 }}>{t('subtotal')}</span>
              <span style={{ fontWeight: 600, fontSize: '16px', color: '#0f172a' }}>{order.subtotal?.toFixed(2)} EGP</span>
            </div>
            {order.discount > 0 && (
              <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: '20px', paddingBottom: '20px', borderBottom: '1px solid #f1f5f9' }}>
                <span style={{ color: '#0f172a', fontSize: '16px', fontWeight: 600 }}>{t('discount')}</span>
                <span style={{ fontWeight: 600, fontSize: '16px', color: '#10b981' }}>-{order.discount?.toFixed(2)} EGP</span>
              </div>
            )}
            <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: '20px', paddingBottom: '20px', borderBottom: '1px solid #f1f5f9' }}>
              <span style={{ color: '#0f172a', fontSize: '16px', fontWeight: 600 }}>{t('shipping')}</span>
              <span style={{ fontWeight: 600, fontSize: '16px', color: '#0f172a' }}>{order.shipping?.toFixed(2)} EGP</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: '20px' }}>
              <span style={{ fontWeight: 700, fontSize: '20px', color: '#0f172a' }}>{t('totalAmount')}</span>
              <span style={{ fontWeight: 700, fontSize: '24px', color: '#ea580c' }}>{order.total?.toFixed(2)} EGP</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: '20px', marginTop: '20px', borderTop: '2px dashed #e2e8f0' }}>
              <span style={{ fontWeight: 700, fontSize: '18px', color: '#0f172a' }}>{lang === 'ar' ? 'صافي الربح للمنتجات' : 'Products Net Profit'}</span>
              <span style={{ fontWeight: 700, fontSize: '20px', color: '#10b981' }}>
                {((order.subtotal || 0) - (order.discount || 0) - (order.items || []).reduce((sum, item) => {
                  const p = products.find(prod => prod.id === item.id);
                  const cost = p && p.costPrice ? parseFloat(p.costPrice) : 0;
                  return sum + (cost * item.qty);
                }, 0)).toFixed(2)} EGP
              </span>
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          {/* Summary Card */}
          <div className="metric-card" style={{ padding: '24px', backgroundColor: '#ffffff', border: 'none', borderRadius: '12px' }}>
            <h3 style={{ fontSize: '16px', fontWeight: 700, margin: '0 0 20px 0' }}>{t('summary')}</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '100px 1fr' }}>
                <span style={{ color: '#64748b', fontSize: '14px' }}>{t('orderId')}</span>
                <span style={{ fontWeight: 500, fontSize: '15px', wordBreak: 'break-all' }}>{order.id}</span>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '100px 1fr' }}>
                <span style={{ color: '#64748b', fontSize: '14px' }}>{t('date')}</span>
                <span style={{ fontWeight: 500, fontSize: '15px' }}>
                  {order.createdAt instanceof Date ? order.createdAt.toLocaleDateString(lang === 'ar' ? 'ar-EG' : 'en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : 'Unknown'}
                </span>
              </div>
              {order.promoCode && (
                <div style={{ display: 'grid', gridTemplateColumns: '100px 1fr' }}>
                  <span style={{ color: '#64748b', fontSize: '14px' }}>Promo Code</span>
                  <span style={{ fontWeight: 600, fontSize: '14px', color: '#8b5cf6', wordBreak: 'break-all' }}>{order.promoCode}</span>
                </div>
              )}
              {order.affiliateCode && order.affiliateCode !== order.promoCode && (
                <div style={{ display: 'grid', gridTemplateColumns: '100px 1fr' }}>
                  <span style={{ color: '#64748b', fontSize: '14px' }}>Referral Link</span>
                  <span style={{ fontWeight: 600, fontSize: '14px', color: '#f59e0b', wordBreak: 'break-all' }}>{order.affiliateCode}</span>
                </div>
              )}
              <div style={{ display: 'grid', gridTemplateColumns: '100px 1fr' }}>
                <span style={{ color: '#64748b', fontSize: '14px' }}>{t('total')}</span>
                <span style={{ fontWeight: 700, fontSize: '16px', color: '#ea580c' }}>{order.total?.toFixed(2)} EGP</span>
              </div>
            </div>
          </div>

          {/* Shipping Address Card */}
          <div className="metric-card" style={{ padding: '24px', backgroundColor: '#ffffff', border: 'none', borderRadius: '12px', position: 'relative' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ fontSize: '18px', fontWeight: 700, margin: 0, color: '#0f172a' }}>{t('shippingAddress')}</h3>
              {!isEditingDelivery && (
                <button 
                  type="button" 
                  onClick={() => setIsEditingDelivery(true)} 
                  title="Edit Delivery Details"
                  style={{ 
                    width: '40px', height: '40px', 
                    borderRadius: '50%', border: '1.5px solid #0f172a', 
                    backgroundColor: '#f1f5f9', color: '#64748b', 
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    cursor: 'pointer'
                  }}
                >
                  <Edit size={18} />
                </button>
              )}
            </div>
            
            <p 
              onClick={handleCustomerClick}
              style={{ fontWeight: 700, margin: '0 0 4px 0', fontSize: '16px', color: 'var(--primary)', cursor: 'pointer', textDecoration: 'underline', textUnderlineOffset: '4px', direction: lang === 'ar' ? 'rtl' : 'ltr' }}
            >
              {order.customer}
            </p>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
              <p style={{ color: '#64748b', margin: 0, fontSize: '15px', direction: 'ltr', textAlign: lang === 'ar' ? 'right' : 'left' }}>{order.phone}</p>
              <button 
                type="button"
                onClick={() => openWhatsapp('en')}
                title="Chat on WhatsApp"
                style={{ 
                  padding: '6px 12px',
                  borderRadius: '16px', border: 'none',
                  backgroundColor: '#dcfce7', color: '#166534',
                  fontSize: '12px', fontWeight: 600,
                  display: 'flex', alignItems: 'center', gap: '6px',
                  cursor: 'pointer', transition: 'all 0.2s'
                }}
                onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#bbf7d0'; }}
                onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = '#dcfce7'; }}
              >
                <svg viewBox="0 0 24 24" width="14" height="14" stroke="currentColor" strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path></svg>
                WhatsApp
              </button>
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', borderTop: '1px solid #f1f5f9', paddingTop: '24px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '90px 1fr', gap: '8px', alignItems: 'center' }}>
                <span style={{ color: '#64748b', fontSize: '14px' }}>{t('governorate')}</span>
                <span style={{ color: '#0f172a', fontSize: '15px', fontWeight: 600 }}>{displayAddress.governorate || '-'}</span>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '90px 1fr', gap: '8px', alignItems: 'center' }}>
                <span style={{ color: '#64748b', fontSize: '14px' }}>{t('district')}</span>
                <span style={{ color: '#0f172a', fontSize: '15px', fontWeight: 600 }}>{displayAddress.district || '-'}</span>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '90px 1fr', gap: '8px', alignItems: 'flex-start' }}>
                <span style={{ color: '#64748b', fontSize: '14px' }}>{t('streetAddress')}</span>
                <span style={{ color: '#0f172a', fontSize: '15px', fontWeight: 600, lineHeight: 1.4 }}>{displayAddress.street || '-'}</span>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '90px 1fr', gap: '8px', alignItems: 'flex-start' }}>
                <span style={{ color: '#64748b', fontSize: '14px' }}>{t('building')}</span>
                <span style={{ color: '#0f172a', fontSize: '15px', fontWeight: 600, lineHeight: 1.4 }}>{displayAddress.building || '-'}</span>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '90px 1fr', gap: '8px', alignItems: 'flex-start' }}>
                <span style={{ color: '#64748b', fontSize: '14px' }}>{t('apartment')}</span>
                <span style={{ color: '#0f172a', fontSize: '15px', fontWeight: 600, lineHeight: 1.4 }}>{displayAddress.apartment || '-'}</span>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '24px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                <button 
                  type="button" 
                  className="btn btn-secondary" 
                  onClick={() => handleCopyForDriver('en')} 
                  style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', padding: '10px', fontSize: '13px' }}
                >
                  <Copy size={16} /> Copy EN
                </button>
                <button 
                  type="button" 
                  className="btn btn-secondary" 
                  onClick={() => handleCopyForDriver('ar')} 
                  style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', padding: '10px', fontSize: '13px' }}
                >
                  <Copy size={16} /> نسخ عربي
                </button>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                <button 
                  type="button"
                  onClick={() => openWhatsapp('en')}
                  style={{ 
                    width: '100%', padding: '10px',
                    borderRadius: '8px', border: 'none',
                    backgroundColor: '#dcfce7', color: '#166534',
                    fontSize: '13px', fontWeight: 600,
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
                    cursor: 'pointer', transition: 'all 0.2s'
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#bbf7d0'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = '#dcfce7'; }}
                >
                  <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path></svg>
                  English
                </button>
                <button 
                  type="button"
                  onClick={() => openWhatsapp('ar')}
                  style={{ 
                    width: '100%', padding: '10px',
                    borderRadius: '8px', border: 'none',
                    backgroundColor: '#dcfce7', color: '#166534',
                    fontSize: '13px', fontWeight: 600,
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
                    cursor: 'pointer', transition: 'all 0.2s'
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#bbf7d0'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = '#dcfce7'; }}
                >
                  <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path></svg>
                  عربي
                </button>
              </div>
            </div>
            
            <details style={{ marginTop: '32px', borderTop: '1px solid #e2e8f0', paddingTop: '24px' }}>
              <summary style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px', cursor: 'pointer', outline: 'none' }}>
                <p style={{ fontWeight: 600, fontSize: '15px', color: '#0f172a', margin: 0, display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
                  <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>
                  {lang === 'ar' ? 'معاينة رسالة التأكيد' : 'Confirmation Message Preview'}
                </p>
              </summary>
              <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '12px' }}>
                <button 
                  type="button"
                  onClick={() => openWhatsapp(lang)}
                  style={{ 
                    padding: '6px 12px',
                    borderRadius: '8px', border: 'none',
                    backgroundColor: '#dcfce7', color: '#166534',
                    fontSize: '12px', fontWeight: 600,
                    display: 'flex', alignItems: 'center', gap: '6px',
                    cursor: 'pointer', transition: 'all 0.2s'
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#bbf7d0'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = '#dcfce7'; }}
                >
                  <svg viewBox="0 0 24 24" width="14" height="14" stroke="currentColor" strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path></svg>
                  {lang === 'ar' ? 'إرسال عبر واتساب' : 'Send via WhatsApp'}
                </button>
              </div>
              <div style={{ 
                backgroundColor: '#f8fafc', 
                border: '1px solid #e2e8f0', 
                borderRadius: '8px', 
                padding: '16px', 
                fontSize: '13px', 
                color: '#334155', 
                whiteSpace: 'pre-wrap', 
                fontFamily: 'monospace',
                direction: lang === 'ar' ? 'rtl' : 'ltr',
                lineHeight: 1.6
              }}>
                {buildConfirmationText(lang)}
              </div>
            </details>

          </div>

        </div>
      </div>

      {deleteModalOpen && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999 }}>
          <div className="card" style={{ padding: '24px', maxWidth: '400px', width: '100%', backgroundColor: 'var(--surface)' }}>
            <h3 style={{ margin: '0 0 16px 0', color: 'var(--on-surface)' }}>Delete Order</h3>
            <p style={{ margin: '0 0 16px 0', color: 'var(--on-surface-variant)' }}>Are you sure you want to delete this order? Type <strong>delete</strong> to confirm:</p>
            <input 
              type="text" 
              className="input-field" 
              style={{ marginBottom: '24px', width: '100%' }}
              value={deleteInput}
              onChange={(e) => setDeleteInput(e.target.value)}
              placeholder="delete"
              autoFocus
            />
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
              <button className="btn btn-secondary" onClick={() => setDeleteModalOpen(false)}>Cancel</button>
              <button className="btn" style={{ backgroundColor: '#ef4444', color: 'white', border: 'none', opacity: deleteInput.trim().toLowerCase() !== 'delete' ? 0.5 : 1 }} disabled={deleteInput.trim().toLowerCase() !== 'delete'} onClick={confirmDelete}>Delete</button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
