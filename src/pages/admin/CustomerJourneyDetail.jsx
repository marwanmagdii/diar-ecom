import React, { useEffect, useState } from 'react';
import { useAdmin } from '../../context/AdminContext';
import { useLanguage } from '../../context/LanguageContext';
import { ArrowLeft, ExternalLink, Eye } from 'lucide-react';

export default function CustomerJourneyDetail({ orderId, onBack }) {
  const { orders } = useAdmin();
  const { language } = useLanguage();
  const [selectedCustomer, setSelectedCustomer] = useState(null);

  const clearCustomerTracking = async () => {
    if (!selectedCustomer || selectedCustomer === 'not_found') return;
    
    const confirmation = prompt(language === 'ar' ? 'اكتب كلمة "delete" لتأكيد مسح السجلات:' : 'Type "delete" to confirm clearing logs:');
    if (confirmation !== 'delete') {
      alert(language === 'ar' ? 'لم يتم مسح السجلات.' : 'Deletion cancelled.');
      return;
    }
    
    try {
      const res = await fetch(`/api/orders/${encodeURIComponent(orderId)}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ clearTracking: true })
      });
      if (res.ok) {
        localStorage.removeItem('diar_tracking_events');
        alert(language === 'ar' ? 'تم مسح السجلات بنجاح.' : 'Logs cleared successfully.');
        if (onBack) onBack(); // Go back to logs
      } else {
        throw new Error('Failed to update');
      }
    } catch (e) {
      console.error(e);
      alert(language === 'ar' ? 'حدث خطأ.' : 'An error occurred.');
    }
  };

  useEffect(() => {
    if (orders.length > 0) {
      const order = orders.find(o => o.id === orderId || o.id === Number(orderId));
      if (order && order.trackingData && order.trackingData.events) {
        setSelectedCustomer(order);
      } else {
        // Handle invalid order or no tracking data
        setSelectedCustomer('not_found');
      }
    }
  }, [orders, orderId]);

  const getEventIcon = (type) => {
    switch(type) {
      case 'view_page': return <Eye size={16} color="#64748b" />;
      case 'view_product': return <Eye size={16} color="#3b82f6" />;
      case 'add_to_cart': return <span style={{ color: '#10b981', fontWeight: 'bold' }}>+</span>;
      case 'remove_from_cart': return <span style={{ color: '#ef4444', fontWeight: 'bold' }}>-</span>;
      case 'complete_checkout': return <span style={{ color: '#8b5cf6', fontWeight: 'bold' }}>✓</span>;
      default: return null;
    }
  };

  const formatEventName = (type) => {
    switch(type) {
      case 'view_page': return 'Visited Page';
      case 'view_product': return 'Viewed Product';
      case 'add_to_cart': return 'Added to Cart';
      case 'remove_from_cart': return 'Removed from Cart';
      case 'complete_checkout': return 'Placed Order';
      default: return type;
    }
  };

  if (!selectedCustomer) {
    return <div style={{ padding: '40px', textAlign: 'center' }}>Loading...</div>;
  }

  if (selectedCustomer === 'not_found') {
    return (
      <div style={{ padding: '40px', textAlign: 'center' }}>
        <h2>{language === 'ar' ? 'لم يتم العثور على رحلة لهذا الطلب' : 'No journey found for this order.'}</h2>
        <button onClick={onBack} className="btn mt-4">
          {language === 'ar' ? 'العودة' : 'Go Back'}
        </button>
      </div>
    );
  }

  return (
    <div style={{ padding: '24px', width: '100%', margin: '0 auto' }}>
      <button 
        onClick={onBack} 
        style={{ background: 'none', border: 'none', display: 'flex', alignItems: 'center', gap: '8px', color: '#64748b', cursor: 'pointer', marginBottom: '24px', fontWeight: 500 }}
      >
        <ArrowLeft size={18} />
        {language === 'ar' ? 'العودة لسجل النشاطات' : 'Back to Activity Logs'}
      </button>

      <div style={{ backgroundColor: 'var(--surface-container-lowest)', borderRadius: '16px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', overflow: 'hidden' }}>
        <div style={{ padding: '24px', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#f8fafc' }}>
          <div>
            <h1 style={{ fontWeight: 700, color: '#0f172a', margin: '0 0 8px 0', fontSize: '24px' }}>
              {language === 'ar' ? 'رحلة العميل' : 'Customer Journey'}
            </h1>
            <div style={{ color: '#64748b', fontSize: '15px', display: 'flex', gap: '16px' }}>
              <span><strong>{language === 'ar' ? 'الطلب' : 'Order'}:</strong> #{selectedCustomer.id}</span>
              <span><strong>{language === 'ar' ? 'العميل' : 'Customer'}:</strong> {selectedCustomer.customer}</span>
            </div>
          </div>
          <button 
            onClick={clearCustomerTracking}
            style={{ 
              backgroundColor: '#ef4444', color: 'white', border: 'none', padding: '10px 20px', 
              borderRadius: '8px', cursor: 'pointer', fontWeight: 600, fontSize: '14px' 
            }}
          >
            {language === 'ar' ? 'مسح سجلات هذا العميل' : 'Clear Logs for this Customer'}
          </button>
        </div>
        
        <div style={{ padding: '0', overflowY: 'auto', maxHeight: '600px' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px', textAlign: language === 'ar' ? 'right' : 'left' }}>
            <thead>
              <tr style={{ backgroundColor: '#f1f5f9', borderBottom: '1px solid #e2e8f0', color: '#475569' }}>
                <th style={{ padding: '16px 24px', fontWeight: 600 }}>{language === 'ar' ? 'الوقت' : 'Time'}</th>
                <th style={{ padding: '16px 24px', fontWeight: 600 }}>{language === 'ar' ? 'الحدث' : 'Action'}</th>
                <th style={{ padding: '16px 24px', fontWeight: 600 }}>{language === 'ar' ? 'التفاصيل' : 'Details'}</th>
                <th style={{ padding: '16px 24px', fontWeight: 600 }}>{language === 'ar' ? 'السعر' : 'Price'}</th>
              </tr>
            </thead>
            <tbody>
              {selectedCustomer.trackingData.events.map((event, idx) => (
                <tr key={idx} style={{ borderBottom: '1px solid #f1f5f9', transition: 'background-color 0.2s' }} onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f8fafc'} onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}>
                  <td style={{ padding: '16px 24px', color: '#64748b', whiteSpace: 'nowrap' }}>
                    {new Date(event.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                  </td>
                  <td style={{ padding: '16px 24px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 500, color: '#334155' }}>
                      {getEventIcon(event.type)}
                      {formatEventName(event.type)}
                    </div>
                  </td>
                  <td style={{ padding: '16px 24px', color: '#475569' }}>
                    {event.type === 'view_page' ? (
                      <span style={{ fontFamily: 'monospace', fontSize: '13px', backgroundColor: '#f1f5f9', padding: '2px 6px', borderRadius: '4px' }}>
                        {event.details?.pagePath}{event.details?.pageSearch}
                      </span>
                    ) : event.details?.productId ? (
                      <a href={`/product/${event.details.productId}`} target="_blank" rel="noreferrer" style={{ color: '#2563eb', textDecoration: 'none', fontWeight: 500, display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                        {event.details.productName}
                        <ExternalLink size={14} />
                      </a>
                    ) : (
                      event.details?.productName || '-'
                    )}
                  </td>
                  <td style={{ padding: '16px 24px', color: '#10b981', fontWeight: 600 }}>
                    {event.details?.price ? `${Math.round(event.details.price)} EGP` : '-'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
