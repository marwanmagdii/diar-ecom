import React, { useState } from 'react';
import { Eye, Plus, Download } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { exportToExcel } from '../../utils/excelExport';
import { useStore } from '../../store';
import DataTable from '../../components/admin/DataTable';

export default function Orders() {
  const { orders, t, lang, ordersLoading: loading } = useStore();
  const navigate = useNavigate();
  const location = useLocation();
  const [statusFilter, setStatusFilter] = useState('All');
  
  const initialSearch = location.state?.search || '';

  const handleExport = () => {
    const exportColumns = [
      { header: 'Order ID', key: 'id', width: 25 },
      { header: 'Date', key: 'date', width: 20 },
      { header: 'Customer', key: 'customer', width: 25 },
      { header: 'Phone', key: 'phone', width: 15 },
      { header: 'Status', key: 'status', width: 15 },
      { header: 'Total (EGP)', key: 'total', width: 15 },
      { header: 'Address', key: 'address', width: 40 }
    ];

    const data = orders.map(o => ({
      id: o.id,
      date: o.createdAt instanceof Date ? o.createdAt.toLocaleDateString() : 'Unknown',
      customer: o.customer,
      phone: o.phone || '',
      status: o.status || '',
      total: o.total || 0,
      address: o.address || ''
    }));

    exportToExcel({ data, columns: exportColumns, filename: 'Orders' });
  };

  const columns = [
    { id: 'id', label: t('orderId'), render: (order) => <span style={{ fontWeight: 600 }}>{order.id.slice(0, 8).toUpperCase()}</span> },
    { id: 'date', label: t('date'), render: (order) => order.createdAt instanceof Date ? order.createdAt.toLocaleDateString(lang === 'ar' ? 'ar-EG' : 'en-US') : new Date(order.createdAt).toLocaleDateString(lang === 'ar' ? 'ar-EG' : 'en-US') },
    { id: 'time', label: lang === 'ar' ? 'الوقت' : 'Time', render: (order) => <span style={{ whiteSpace: 'nowrap' }}>{order.createdAt instanceof Date ? order.createdAt.toLocaleTimeString(lang === 'ar' ? 'ar-EG' : 'en-US', {hour: '2-digit', minute:'2-digit'}) : new Date(order.createdAt).toLocaleTimeString(lang === 'ar' ? 'ar-EG' : 'en-US', {hour: '2-digit', minute:'2-digit'})}</span> },
    { id: 'customer', label: t('customer'), render: (order) => <span style={{ whiteSpace: 'nowrap', fontWeight: 500, color: 'var(--on-surface)' }}>{order.customer}</span> },
    { id: 'phone', label: lang === 'ar' ? 'رقم الهاتف' : 'Phone', render: (order) => <span style={{ whiteSpace: 'nowrap', color: 'var(--on-surface-variant)' }}>{order.phone}</span> },
    { id: 'status', label: t('status'), render: (order) => <span className={`status-pill status-${order.status?.toLowerCase()}`}>{t(order.status?.toLowerCase()) || order.status}</span> },
    { 
      id: 'promoCode', 
      label: lang === 'ar' ? 'الكود/الرابط' : 'Code/Link', 
      render: (order) => {
        const code = order.promoCode || order.affiliateCode;
        if (!code) return '-';
        const isLink = order.affiliateCode && !order.promoCode;
        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <span style={{ fontSize: '10px', color: isLink ? '#8b5cf6' : '#f59e0b', fontWeight: 600 }}>
              {isLink ? (lang === 'ar' ? 'رابط إحالة' : 'Referral Link') : (lang === 'ar' ? 'كود خصم' : 'Promo Code')}
            </span>
            <div>
              <span style={{ backgroundColor: '#0f172a', color: '#fff', padding: '4px 8px', borderRadius: '4px', fontSize: '12px', fontWeight: 600, whiteSpace: 'nowrap' }}>
                {code}
              </span>
            </div>
          </div>
        );
      } 
    },
    { id: 'influencer', label: lang === 'ar' ? 'المؤثر' : 'Influencer', render: (order) => order.influencerName || '-' },
    { id: 'total', label: t('total'), align: 'right', render: (order) => <span style={{ fontWeight: 'bold', color: 'var(--primary)', whiteSpace: 'nowrap' }}>{order.total?.toFixed(2)} EGP</span> },
    { id: 'actions', label: lang === 'ar' ? 'الإجراءات' : 'Actions', align: 'right', render: (order) => (
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
    )}
  ];

  const searchFunction = (order, term) => {
    const lower = term.toLowerCase();
    return (
      (order.id && order.id.toLowerCase().includes(lower)) ||
      (order.customer && order.customer.toLowerCase().includes(lower)) ||
      (order.phone && String(order.phone).includes(term)) ||
      (order.promoCode && order.promoCode.toLowerCase().includes(lower)) ||
      (order.influencerName && order.influencerName.toLowerCase().includes(lower))
    );
  };

  const filteredOrders = React.useMemo(() => {
    if (statusFilter === 'All') return orders;
    return orders.filter(order => order.status === statusFilter);
  }, [orders, statusFilter]);

  const actionsNode = (
    <React.Fragment>
      <button 
        className="btn btn-secondary" 
        style={{ display: 'flex', alignItems: 'center', gap: '8px', whiteSpace: 'nowrap' }} 
        onClick={handleExport}
      >
        <Download size={18} /> {lang === 'ar' ? "تصدير" : "Export"}
      </button>
      <button 
        className="btn btn-primary mobile-hidden" 
        style={{ display: 'flex', alignItems: 'center', gap: '8px', whiteSpace: 'nowrap' }} 
        onClick={() => navigate('/diaradmin26/orders/new')}
      >
        <Plus size={18} /> {lang === 'ar' ? "إنشاء طلب" : "Create Order"}
      </button>
    </React.Fragment>
  );

  const filtersNode = (
    <select 
      className="input-field" 
      style={{ width: '160px' }}
      value={statusFilter}
      onChange={(e) => setStatusFilter(e.target.value)}
    >
      <option value="All">{lang === 'ar' ? 'جميع الحالات' : 'All Statuses'}</option>
      <option value="Pending">{lang === 'ar' ? 'قيد الانتظار' : 'Pending'}</option>
      <option value="Shipped">{lang === 'ar' ? 'تم الشحن' : 'Shipped'}</option>
      <option value="Delivered">{lang === 'ar' ? 'تم التوصيل' : 'Delivered'}</option>
      <option value="Cancelled">{lang === 'ar' ? 'ملغي' : 'Cancelled'}</option>
    </select>
  );

  return (
    <DataTable
      tableId="orders"
      columns={columns}
      data={filteredOrders}
      emptyMessage={lang === 'ar' ? 'لا توجد طلبات.' : 'No orders found.'}
      searchPlaceholder={lang === 'ar' ? "بحث برقم الطلب، العميل أو رقم الهاتف..." : "Search by ID, Customer or Phone..."}
      onRowClick={(order) => navigate(`/diaradmin26/orders/${encodeURIComponent(order.id)}`)}
      actions={actionsNode}
      filters={filtersNode}
      loading={loading}
      searchFunction={searchFunction}
      initialSearch={initialSearch}
    />
  );
}
