import React, { useState } from 'react';
import { Search, Download, User, Calendar, MapPin, Eye, Phone, ExternalLink } from 'lucide-react';
import { exportToExcel } from '../../utils/excelExport';
import CustomerJourneyDetail from './CustomerJourneyDetail';
import { useStore } from '../../store';

export default function CustomerAnalytics({ isEmbedded = false }) {
  const { orders, ordersLoading: loading } = useStore();
  const { language } = useStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [viewingJourneyFor, setViewingJourneyFor] = useState(null);

  // Extract customers who have tracking data attached to their orders
  const trackedCustomers = orders.filter(o => o.trackingData && o.trackingData.events && o.trackingData.events.length > 0);

  const filteredCustomers = trackedCustomers.filter(o => 
    (o.customer || '').toLowerCase().includes(searchTerm.toLowerCase()) || 
    (o.phone || '').includes(searchTerm) ||
    (o.id || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleExport = () => {
    // Generate a flat export format optimized for AI consumption
    const exportData = [];
    
    filteredCustomers.forEach(customer => {
      customer.trackingData.events.forEach(event => {
        exportData.push({
          "Customer Name": customer.customer,
          "Phone": customer.phone,
          "Order ID": customer.id,
          "Order Date": new Date(customer.createdAt).toLocaleDateString(),
          "Order Total (EGP)": customer.total,
          "Action Type": event.type,
          "Action Timestamp": new Date(event.timestamp).toLocaleString(),
          "Product Looked At": event.details?.productName || "-",
          "Price Looked At": event.details?.price || "-",
          "Cart Item Removed": event.details?.cartItemId || "-"
        });
      });
    });

    const columns = [
      { header: 'Customer Name', key: 'Customer Name', width: 20 },
      { header: 'Phone', key: 'Phone', width: 15 },
      { header: 'Order ID', key: 'Order ID', width: 15 },
      { header: 'Order Date', key: 'Order Date', width: 15 },
      { header: 'Order Total (EGP)', key: 'Order Total (EGP)', width: 15 },
      { header: 'Action Type', key: 'Action Type', width: 20 },
      { header: 'Action Timestamp', key: 'Action Timestamp', width: 20 },
      { header: 'Product Looked At', key: 'Product Looked At', width: 30 },
      { header: 'Price Looked At', key: 'Price Looked At', width: 15 },
      { header: 'Cart Item Removed', key: 'Cart Item Removed', width: 25 }
    ];

    exportToExcel({ data: exportData, columns, filename: 'AI_Customer_Journey_Data' });
  };

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

  const clearAllTracking = async () => {
    const confirmation = prompt(language === 'ar' ? 'اكتب كلمة "delete" لتأكيد مسح كافة السجلات:' : 'Type "delete" to confirm clearing ALL logs:');
    if (confirmation !== 'delete') {
      alert(language === 'ar' ? 'لم يتم مسح السجلات.' : 'Deletion cancelled.');
      return;
    }
    
    // Create an array of update promises for all tracked customers
    const promises = trackedCustomers.map(async customer => {
      const res = await fetch(`/api/orders/${encodeURIComponent(customer.id)}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ clearTracking: true })
      });
      if (!res.ok) throw new Error('Failed to update order ' + customer.id);
      return res;
    });
    
    try {
      await Promise.all(promises);
      
      // Clear local storage tracking events to prevent them from re-uploading
      // since the admin and store are on the same domain for local testing.
      localStorage.removeItem('diar_tracking_events');
      
      alert(language === 'ar' ? 'تم مسح جميع سجلات العملاء بنجاح. يرجى تحديث الصفحة.' : 'All customer journey logs have been cleared successfully. Please refresh the page.');
    } catch (e) {
      console.error(e);
      alert(language === 'ar' ? 'حدث خطأ.' : 'An error occurred.');
    }
  };

  if (viewingJourneyFor) {
    return (
      <CustomerJourneyDetail 
        orderId={viewingJourneyFor} 
        onBack={() => setViewingJourneyFor(null)} 
      />
    );
  }

  return (
    <div style={isEmbedded ? {} : { padding: '24px', width: '100%', margin: '0 auto' }}>
      {!isEmbedded && (
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <h1 className="headline-sm">{language === 'ar' ? 'تحليلات العملاء الذكية' : 'Smart Customer Analytics'}</h1>
          <button onClick={handleExport} className="btn" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Download size={18} />
            {language === 'ar' ? 'تصدير للذكاء الاصطناعي' : 'Export for AI Analysis'}
          </button>
        </div>
      )}

      <div style={{ backgroundColor: 'var(--surface-container-lowest)', padding: '24px', borderRadius: '16px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', marginBottom: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <h2 className="title-md" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <User size={20} />
            {language === 'ar' ? 'سجل رحلات العملاء (تتبع)' : 'Customer Journey Logs'}
          </h2>
          {isEmbedded && (
            <div style={{ display: 'flex', gap: '12px' }}>
              <button onClick={clearAllTracking} className="btn" style={{ display: 'flex', alignItems: 'center', gap: '8px', backgroundColor: '#ef4444', color: 'white', border: 'none' }}>
                {language === 'ar' ? 'مسح كل السجلات' : 'Clear All Logs'}
              </button>
              <button onClick={handleExport} className="btn btn-secondary" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Download size={18} />
                {language === 'ar' ? 'تصدير المسارات' : 'Export Journeys'}
              </button>
            </div>
          )}
        </div>
        <p style={{ color: '#64748b', fontSize: '14px', marginBottom: '16px' }}>
          {language === 'ar' 
            ? 'تُظهر هذه الصفحة رحلة الشراء الكاملة للعملاء الذين أكملوا طلباتهم، مما يتيح لك تصدير البيانات لتحليلها باستخدام الذكاء الاصطناعي.' 
            : 'This page shows the complete purchasing journey of customers who placed orders, allowing you to export data for AI analysis.'}
        </p>
        
        <div style={{ position: 'relative', maxWidth: '400px' }}>
          <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#64748b' }} />
          <input 
            type="text" 
            placeholder={language === 'ar' ? 'البحث بالاسم أو الهاتف...' : 'Search by name or phone...'}
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            style={{ width: '100%', padding: '10px 10px 10px 36px', borderRadius: '8px', border: '1px solid #e2e8f0', outline: 'none' }}
          />
        </div>
      </div>

      <div style={{ display: 'flex', gap: '24px' }}>
        {/* Customer List */}
        <div style={{ flex: '1', backgroundColor: 'var(--surface-container-lowest)', borderRadius: '16px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: language === 'ar' ? 'right' : 'left' }}>
            <thead>
              <tr style={{ backgroundColor: '#f8fafc', borderBottom: '2px solid #e2e8f0' }}>
                <th style={{ padding: '16px', fontWeight: 600, color: '#475569' }}>Customer</th>
                <th style={{ padding: '16px', fontWeight: 600, color: '#475569' }}>Order Total</th>
                <th style={{ padding: '16px', fontWeight: 600, color: '#475569' }}>Tracked Events</th>
                <th style={{ padding: '16px', fontWeight: 600, color: '#475569' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="4" style={{ padding: '48px', textAlign: 'center', color: '#64748b' }}>
                    <div style={{ margin: '0 auto 16px', border: '3px solid #f3f3f3', borderTop: '3px solid var(--primary)', borderRadius: '50%', width: '30px', height: '30px', animation: 'spin 1s linear infinite' }}></div>
                    <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
                    Loading analytics...
                  </td>
                </tr>
              ) : filteredCustomers.length === 0 ? (
                <tr>
                  <td colSpan="4" style={{ padding: '24px', textAlign: 'center', color: '#64748b' }}>No tracked customers found.</td>
                </tr>
              ) : (
                filteredCustomers.map(customer => (
                  <tr key={customer.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '16px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: '#e0e7ff', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#4f46e5', fontWeight: 'bold' }}>
                          {customer.customer.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div style={{ fontWeight: 600, color: '#0f172a' }}>{customer.customer}</div>
                          <div style={{ fontSize: '13px', color: '#64748b', display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <Phone size={12} /> {customer.phone}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: '16px', fontWeight: 600, color: '#10b981' }}>{Math.round(customer.total)} EGP</td>
                    <td style={{ padding: '16px' }}>
                      <span style={{ backgroundColor: '#f1f5f9', padding: '4px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: 600, color: '#475569' }}>
                        {customer.trackingData.events.length} events
                      </span>
                    </td>
                    <td style={{ padding: '16px' }}>
                      <button 
                        onClick={() => setViewingJourneyFor(customer.id)}
                        className="btn btn-secondary"
                        style={{ padding: '6px 12px', fontSize: '13px', display: 'inline-block' }}
                      >
                        View Journey
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
