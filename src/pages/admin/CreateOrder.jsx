import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShoppingBag, Search, Filter, RefreshCw, X, Menu, Bell, Search as SearchIcon, ArrowLeft, ArrowUp, ArrowDown, ChevronRight, Plus, Download, Upload, Eye, Image as ImageIcon, CreditCard, Clock, MapPin, Truck, Settings as SettingsIcon, Package, User, Hash, Edit3, Trash2 } from 'lucide-react';
import SearchableSelect from '../../components/SearchableSelect';
import { useStore } from '../../store';

export default function CreateOrder() {
  const { addOrder } = useStore();
  const { products } = useStore();
  const { config } = useStore();
  const navigate = useNavigate();

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

  const handleAddItem = () => {
    if (!selectedProductId) return;
    const product = products.find(p => p.id.toString() === selectedProductId.toString());
    if (!product) return;
    
    // Default to main variant or simple product
    const isLegacy = !product.options || product.options.length === 0;
    const mainVariant = !isLegacy && product.variants?.length > 0 ? product.variants[0] : null;
    
    const newItem = {
      id: product.id,
      title: product.title,
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
  const shipping = Number(config?.shippingCost) || 35;
  const total = subtotal > 0 ? subtotal + shipping : 0;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (orderItems.length === 0) {
      alert("Please add at least one item to the order.");
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
    navigate('/diaradmin26/orders');
  };

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', color: '#1e293b' }}>
      {/* Header and Breadcrumbs removed as they are now in the top navbar */}

      <form onSubmit={handleSubmit}>
        <div className="create-order-grid">
          
          {/* Left Column */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            
            {/* Delivery Details Form */}
            <div className="metric-card" style={{ padding: '32px', backgroundColor: '#ffffff', border: 'none', borderRadius: '12px' }}>
              <h3 style={{ fontSize: '20px', fontWeight: 700, margin: '0 0 24px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: '#8c3a3a' }}><rect x="1" y="3" width="15" height="13"></rect><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"></polygon><circle cx="5.5" cy="18.5" r="2.5"></circle><circle cx="18.5" cy="18.5" r="2.5"></circle></svg>
                Delivery Details
              </h3>

              <div className="form-row">
                <div>
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: 600, marginBottom: '8px' }}>First Name</label>
                  <input type="text" className="input-field" required value={deliveryData.firstName} onChange={e => setDeliveryData({...deliveryData, firstName: e.target.value})} style={{ padding: '12px', borderRadius: '8px' }} placeholder="Jane" />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: 600, marginBottom: '8px' }}>Last Name</label>
                  <input type="text" className="input-field" required value={deliveryData.lastName} onChange={e => setDeliveryData({...deliveryData, lastName: e.target.value})} style={{ padding: '12px', borderRadius: '8px' }} placeholder="Doe" />
                </div>
              </div>

              <div style={{ marginBottom: '24px' }}>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: 600, marginBottom: '8px' }}>Mobile Number</label>
                <input type="text" className="input-field" required value={deliveryData.mobile} onChange={e => {
                  let sanitized = e.target.value.replace(/\D/g, '');
                  if (sanitized.startsWith('00201') && sanitized.length >= 13) {
                    sanitized = '0' + sanitized.slice(4);
                  } else if (sanitized.startsWith('201') && sanitized.length >= 12) {
                    sanitized = '0' + sanitized.slice(2);
                  }
                  sanitized = sanitized.slice(0, 11);
                  setDeliveryData({...deliveryData, mobile: sanitized});
                }} style={{ padding: '12px', borderRadius: '8px' }} placeholder="01X XXXX XXXX" />
              </div>

              <div className="form-row">
                <div>
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: 600, marginBottom: '8px' }}>Governorate</label>
                  <select className="input-field" required style={{ padding: '12px', borderRadius: '8px' }} value={deliveryData.governorate} onChange={e => setDeliveryData({...deliveryData, governorate: e.target.value})}>
                    <option value="">Search Governorate...</option>
                    <option value="Cairo">Cairo</option>
                    <option value="Giza">Giza</option>
                    <option value="Alexandria">Alexandria</option>
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: 600, marginBottom: '8px' }}>District</label>
                  <select className="input-field" required style={{ padding: '12px', borderRadius: '8px' }} value={deliveryData.district} onChange={e => setDeliveryData({...deliveryData, district: e.target.value})}>
                    <option value="">Search District...</option>
                    <option value="Maadi">Maadi</option>
                    <option value="Nasr City">Nasr City</option>
                    <option value="Zamalek">Zamalek</option>
                  </select>
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: 600, marginBottom: '8px' }}>Street Address</label>
                <input type="text" className="input-field" required value={deliveryData.streetAddress} onChange={e => setDeliveryData({...deliveryData, streetAddress: e.target.value})} style={{ padding: '12px', borderRadius: '8px' }} placeholder="Street Name, Building, Floor" />
              </div>
            </div>

            {/* Order Items */}
            <div className="metric-card" style={{ padding: '24px', backgroundColor: '#ffffff', border: 'none', borderRadius: '12px' }}>
              <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', gap: '16px' }}>
                <h3 style={{ fontSize: '16px', fontWeight: 600, margin: 0 }}>Add Products</h3>
                <div style={{ display: 'flex', flex: '1 1 auto', gap: '8px', justifyContent: 'flex-end' }}>
                  <div style={{ flex: 1, minWidth: '150px', maxWidth: '300px' }}>
                    <SearchableSelect 
                      options={products.map(p => ({ label: `${p.title} - ${p.price} EGP`, value: p.id.toString() }))}
                      value={selectedProductId?.toString() || ''}
                      onChange={(val) => setSelectedProductId(val)}
                      placeholder="Search a product..."
                    />
                  </div>
                  <button type="button" className="btn" onClick={handleAddItem} style={{ padding: '8px 12px' }}>
                    <Plus size={20} />
                  </button>
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {orderItems.length === 0 ? (
                  <p style={{ textAlign: 'center', color: '#64748b', padding: '24px 0' }}>No products added to this order yet.</p>
                ) : (
                  orderItems.map((item, index) => (
                    <div key={item.id} style={{ display: 'flex', alignItems: 'center', backgroundColor: '#f8fafc', padding: '16px', borderRadius: '8px' }}>
                      <div style={{ width: '48px', height: '64px', backgroundColor: '#e2e8f0', borderRadius: '4px', marginRight: '16px', overflow: 'hidden' }}>
                        <img src={item.image || 'https://via.placeholder.com/48'} alt={item.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      </div>
                      
                      <div style={{ flex: 2 }}>
                        <p style={{ fontSize: '15px', fontWeight: 600, margin: 0 }}>{item.title}</p>
                        <p style={{ fontSize: '13px', color: '#64748b', margin: '4px 0 0 0' }}>{item.price?.toFixed(2)} EGP</p>
                      </div>
                      
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <input 
                          type="number" 
                          min="1" 
                          value={item.qty} 
                          onChange={(e) => updateItemQty(index, parseInt(e.target.value))}
                          className="input-field"
                          style={{ width: '60px', padding: '6px', textAlign: 'center' }} 
                        />
                        <button type="button" className="icon-btn" style={{ color: 'var(--error)' }} onClick={() => removeItem(index)}>
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
              <h3 style={{ fontSize: '16px', fontWeight: 700, margin: '0 0 24px 0' }}>Cart Totals</h3>
              <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '16px', borderBottom: '1px solid #f1f5f9' }}>
                <span style={{ color: '#64748b', fontSize: '14px' }}>Subtotal</span>
                <span style={{ fontWeight: 600, fontSize: '14px' }}>{subtotal.toFixed(2)} EGP</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: '16px', paddingBottom: '16px', borderBottom: '1px solid #f1f5f9' }}>
                <span style={{ color: '#64748b', fontSize: '14px' }}>Shipping</span>
                <span style={{ fontWeight: 600, fontSize: '14px' }}>{shipping.toFixed(2)} EGP</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: '16px', marginBottom: '24px' }}>
                <span style={{ fontWeight: 700, fontSize: '16px' }}>Total Amount</span>
                <span style={{ fontWeight: 700, fontSize: '18px', color: '#ea580c' }}>{total.toFixed(2)} EGP</span>
              </div>

              <button type="submit" className="btn" style={{ width: '100%', padding: '12px', fontSize: '16px' }}>
                Submit Order
              </button>
            </div>

          </div>
        </div>
      </form>
    </div>
  );
}
