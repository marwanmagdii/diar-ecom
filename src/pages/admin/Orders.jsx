import React, { useState } from 'react';
import { Eye, Plus, Search, Filter, Download } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { exportToExcel } from '../../utils/excelExport';
import { useStore } from '../../store';

export default function Orders() {
  const { orders, t, lang, ordersLoading: loading } = useStore();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [showColumnsMenu, setShowColumnsMenu] = useState(false);
  const [visibleColumns, setVisibleColumns] = useState({
    id: true,
    date: true,
    time: true,
    customer: true,
    status: true,
    promoCode: true,
    influencer: true,
    total: true,
    actions: true
  });

  
  const openWhatsapp = (order) => {
    const targetPhone = '+201019600026';
    
    // Parse address parts for better formatting
    const addressParts = order.address?.split(',').map(s => s.trim()) || [];
    const street = addressParts[0] || '';
    const district = addressParts[1] || '';
    const gov = addressParts[2] || '';

    let message = '';
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

    const itemsListAr = (order.items || []).map(item => `- ${item.qty}x ${item.titleAr || item.title} (${item.price?.toFixed(2) || '0.00'} ج.م)${buildItemOptionsText(item, true)}`).join('\n');
    const itemsListEn = (order.items || []).map(item => `- ${item.qty}x ${item.title} (${item.price?.toFixed(2) || '0.00'} EGP)${buildItemOptionsText(item, false)}`).join('\n');

    if (lang === 'ar') {
      const shippingText = order.shipping && order.shipping > 0 ? `\nالشحن: ${order.shipping.toFixed(2)} ج.م` : '';
      message = `مرحباً ${order.customer}،\nلقد استلمنا طلبك رقم ${order.id.slice(0, 8).toUpperCase()}.\n\n*المنتجات:*\n${itemsListAr}\n\n*الإيصال:*\nالمجموع الفرعي: ${order.subtotal?.toFixed(2) || '0.00'} ج.م${shippingText}\nالإجمالي: ${order.total?.toFixed(2)} ج.م\n\n*تفاصيل التوصيل:*\nالمحافظة: ${gov}\nالمنطقة: ${district}\nالشارع: ${street}\nرقم الهاتف: ${order.phone} (للتواصل مع المندوب)\n\nشكراً لتسوقك معنا!`;
    } else {
      const shippingText = order.shipping && order.shipping > 0 ? `\nShipping: ${order.shipping.toFixed(2)} EGP` : '';
      message = `Hello ${order.customer},\nWe have received your order #${order.id.slice(0, 8).toUpperCase()}.\n\n*Products:*\n${itemsListEn}\n\n*Receipt:*\nSubtotal: ${order.subtotal?.toFixed(2) || '0.00'} EGP${shippingText}\nTotal: ${order.total?.toFixed(2)} EGP\n\n*Delivery Details:*\nGovernorate: ${gov}\nDistrict: ${district}\nStreet: ${street}\nPhone: ${order.phone} (Phone for delivery to contact you)\n\nThank you for shopping with us!`;
    }

    const url = `https://wa.me/${targetPhone}?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank');
  };

  const filteredOrders = React.useMemo(() => {
    return orders.filter(order => {
      const matchesSearch = 
        (order.id && order.id.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (order.customer && order.customer.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (order.phone && order.phone.includes(searchTerm)) ||
        (order.promoCode && order.promoCode.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (order.influencerName && order.influencerName.toLowerCase().includes(searchTerm.toLowerCase()));
      
      const matchesStatus = statusFilter === 'All' || order.status === statusFilter;
      
      return matchesSearch && matchesStatus;
    });
  }, [orders, searchTerm, statusFilter]);

  const handleExport = () => {
    const columns = [
      { header: 'Order ID', key: 'id', width: 25 },
      { header: 'Date', key: 'date', width: 20 },
      { header: 'Customer', key: 'customer', width: 25 },
      { header: 'Phone', key: 'phone', width: 15 },
      { header: 'Status', key: 'status', width: 15 },
      { header: 'Total (EGP)', key: 'total', width: 15 },
      { header: 'Address', key: 'address', width: 40 }
    ];

    const data = filteredOrders.map(o => ({
      id: o.id,
      date: o.createdAt instanceof Date ? o.createdAt.toLocaleDateString() : 'Unknown',
      customer: o.customer,
      phone: o.phone || '',
      status: o.status || '',
      total: o.total || 0,
      address: o.address || ''
    }));

    exportToExcel({ data, columns, filename: 'Orders' });
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
        <h2 className="headline-md m-0">{t('orders')}</h2>
        
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          <div style={{ position: 'relative' }}>
            <Search size={18} style={{ position: 'absolute', left: '12px', top: '10px', color: 'var(--on-surface-variant)' }} />
            <input 
              type="text" 
              className="input-field" 
              placeholder={lang === 'ar' ? "بحث برقم الطلب، العميل أو رقم الهاتف" : "Search by ID, Customer or Phone..."} 
              style={{ width: '280px', paddingLeft: '36px' }} 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div style={{ position: 'relative' }}>
            <select 
              className="input-field" 
              style={{ paddingLeft: '36px', appearance: 'none', width: '160px' }}
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="All">{lang === 'ar' ? 'جميع الحالات' : 'All Statuses'}</option>
              <option value="Pending">{lang === 'ar' ? 'قيد الانتظار' : 'Pending'}</option>
              <option value="Shipped">{lang === 'ar' ? 'تم الشحن' : 'Shipped'}</option>
              <option value="Delivered">{lang === 'ar' ? 'تم التوصيل' : 'Delivered'}</option>
              <option value="Cancelled">{lang === 'ar' ? 'ملغي' : 'Cancelled'}</option>
            </select>
            <Filter size={18} style={{ position: 'absolute', left: '12px', top: '10px', color: 'var(--on-surface-variant)', pointerEvents: 'none' }} />
          </div>

                    <div style={{ position: 'relative' }}>
            <button 
              className="btn btn-secondary" 
              style={{ display: 'flex', alignItems: 'center', gap: '8px' }} 
              onClick={() => setShowColumnsMenu(!showColumnsMenu)}
            >
              <Filter size={18} /> {lang === 'ar' ? 'الأعمدة' : 'Columns'}
            </button>
            {showColumnsMenu && (
              <div style={{ position: 'absolute', top: '100%', right: 0, marginTop: '8px', background: 'var(--surface)', border: '1px solid var(--outline)', borderRadius: '8px', padding: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', zIndex: 10, width: '200px' }}>
                {Object.keys(visibleColumns).map(key => (
                  <label key={key} style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px', cursor: 'pointer', fontSize: '14px' }}>
                    <input 
                      type="checkbox" 
                      checked={visibleColumns[key]} 
                      onChange={(e) => setVisibleColumns({...visibleColumns, [key]: e.target.checked})}
                    />
                    {key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, ' $1')}
                  </label>
                ))}
              </div>
            )}
          </div>
          
          <button 
            className="btn btn-secondary" 
            style={{ display: 'flex', alignItems: 'center', gap: '8px' }} 
            onClick={handleExport}
          >
            <Download size={20} /> {lang === 'ar' ? "تصدير" : "Export"}
          </button>
          
          <button 
            className="btn" 
            style={{ display: 'flex', alignItems: 'center', gap: '8px' }} 
            onClick={() => navigate('/diaradmin26/orders/new')}
          >
            <Plus size={20} /> {lang === 'ar' ? "إنشاء طلب" : "Create Order"}
          </button>
        </div>
      </div>

      <div className="admin-table-container">
        <div className="table-responsive">
          <table className="admin-table">
            <thead>
              <tr>
                {visibleColumns.id && <th>{t('orderId')}</th>}
                {visibleColumns.date && <th>{t('date')}</th>}
                {visibleColumns.time && <th>{lang === 'ar' ? 'الوقت' : 'Time'}</th>}
                {visibleColumns.customer && <th>{t('customer')}</th>}
                {visibleColumns.status && <th>{t('status')}</th>}
                {visibleColumns.promoCode && <th>{lang === 'ar' ? 'كود الخصم' : 'Promo Code'}</th>}
                {visibleColumns.influencer && <th>{lang === 'ar' ? 'المؤثر' : 'Influencer'}</th>}
                {visibleColumns.total && <th style={{ textAlign: 'right' }}>{t('total')}</th>}
                {visibleColumns.actions && <th style={{ textAlign: 'right' }}>{lang === 'ar' ? 'الإجراءات' : 'Actions'}</th>}
              </tr>
            </thead>
            <tbody>
              {(() => {
                if (loading) {
                  return (
                    <tr>
                      <td colSpan="6" style={{ textAlign: 'center', padding: '48px', color: '#64748b' }}>
                        <div style={{ margin: '0 auto 16px', border: '3px solid #f3f3f3', borderTop: '3px solid var(--primary)', borderRadius: '50%', width: '30px', height: '30px', animation: 'spin 1s linear infinite' }}></div>
                        <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
                        Loading orders...
                      </td>
                    </tr>
                  );
                }

                if (filteredOrders.length === 0) {
                  return (
                    <tr>
                      <td colSpan="6" style={{ textAlign: 'center', padding: '32px' }}>
                        No orders found matching your criteria.
                      </td>
                    </tr>
                  );
                }

                return filteredOrders.map(order => (
                  <tr 
                    key={order.id}
                    onClick={() => navigate(`/diaradmin26/orders/${encodeURIComponent(order.id)}`)}
                    style={{ cursor: 'pointer' }}
                    className="hover-row"
                  >
                    {visibleColumns.id && <td style={{ fontWeight: 600 }}>{order.id.slice(0, 8).toUpperCase()}</td>}
                    {visibleColumns.date && <td>{order.createdAt instanceof Date ? order.createdAt.toLocaleDateString(lang === 'ar' ? 'ar-EG' : 'en-US') : new Date(order.createdAt).toLocaleDateString(lang === 'ar' ? 'ar-EG' : 'en-US')}</td>}
                    {visibleColumns.time && <td>{order.createdAt instanceof Date ? order.createdAt.toLocaleTimeString(lang === 'ar' ? 'ar-EG' : 'en-US', { hour: '2-digit', minute: '2-digit' }) : new Date(order.createdAt).toLocaleTimeString(lang === 'ar' ? 'ar-EG' : 'en-US', { hour: '2-digit', minute: '2-digit' })}</td>}
                    {visibleColumns.customer && <td>
                      <div>{order.customer}</div>
                      <div style={{ fontSize: '12px', color: 'var(--on-surface-variant)' }}>{order.phone}</div>
                    </td>}
                    {visibleColumns.status && <td>
                      <span className={`status-pill status-${order.status?.toLowerCase()}`}>
                        {t(order.status?.toLowerCase()) || order.status}
                      </span>
                    </td>}
                    {visibleColumns.promoCode && <td>
                      {order.promoCode ? <span style={{ backgroundColor: '#0f172a', color: '#fff', padding: '4px 8px', borderRadius: '4px', fontSize: '12px', fontWeight: 600 }}>{order.promoCode}</span> : '-'}
                    </td>}
                    {visibleColumns.influencer && <td>{order.influencerName || '-'}</td>}
                    {visibleColumns.total && <td style={{ textAlign: 'right' }}>{order.total?.toFixed(2)} EGP</td>}
                    {visibleColumns.actions && <td>
                      <div style={{ display: 'flex', gap: '8px', alignItems: 'center', justifyContent: 'flex-end', width: '100%' }}>
                        <button 
                          className="btn btn-secondary"
                          style={{ padding: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                          title="View Details" 
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/diaradmin26/orders/${encodeURIComponent(order.id)}`);
                          }}
                        >
                          <Eye size={18} />
                        </button>
                      </div>
                    </td>}
                  </tr>
                ));
              })()}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
