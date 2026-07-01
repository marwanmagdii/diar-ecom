import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronRight, Download } from 'lucide-react';
import { exportToExcel } from '../../utils/excelExport';
import { useStore } from '../../store';
import DataTable from '../../components/admin/DataTable';

export default function Users() {
  const { users, ordersLoading: loading, lang } = useStore();
  const navigate = useNavigate();

  const handleExport = () => {
    const exportColumns = [
      { header: 'Customer', key: 'name', width: 30 },
      { header: 'Phone', key: 'phone', width: 20 },
      { header: 'Latest Address', key: 'address', width: 40 },
      { header: 'Orders', key: 'orders', width: 15 },
      { header: 'Total Spent (EGP)', key: 'spent', width: 20 },
      { header: 'Is Partner', key: 'partner', width: 15 }
    ];

    const data = users.map(u => ({
      name: u.name,
      phone: u.phone,
      address: u.latestAddress || '',
      orders: u.orderCount || 0,
      spent: u.totalSpent || 0,
      partner: u.isInfluencer ? 'Yes' : 'No'
    }));

    exportToExcel({ data, columns: exportColumns, filename: 'Customers' });
  };

  const columns = [
    { 
      id: 'customer', 
      label: lang === 'ar' ? 'العميل' : 'Customer', 
      render: (user) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 600 }}>
          {user.name}
          {user.isInfluencer && (
            <span style={{ fontSize: '12px', padding: '2px 8px', backgroundColor: '#fef3c7', color: '#b45309', borderRadius: '100px', fontWeight: 700 }}>
              Partner
            </span>
          )}
          {user.linkedAccounts && user.linkedAccounts.length > 0 && (
            <span title={`Also ordered from this device: ${user.linkedAccounts.map(u => u.phone).join(', ')}`} style={{ fontSize: '12px', padding: '4px', backgroundColor: '#e0e7ff', color: '#4338ca', borderRadius: '100px', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path></svg>
            </span>
          )}
        </div>
      ) 
    },
    { id: 'phone', label: lang === 'ar' ? 'رقم الهاتف' : 'Phone', render: (user) => user.phone },
    { 
      id: 'governorate', 
      label: lang === 'ar' ? 'المحافظة' : 'Governorate', 
      render: (user) => {
        const addressParts = (user.latestAddress || '').split(',').map(s => s.trim());
        return addressParts.length > 1 ? addressParts[addressParts.length - 1] : '-';
      }
    },
    { 
      id: 'district', 
      label: lang === 'ar' ? 'المنطقة' : 'District', 
      render: (user) => {
        const addressParts = (user.latestAddress || '').split(',').map(s => s.trim());
        return addressParts.length > 2 ? addressParts[addressParts.length - 2] : '-';
      }
    },
    { 
      id: 'latestAddress', 
      label: lang === 'ar' ? 'آخر عنوان' : 'Latest Address', 
      render: (user) => (
        <div style={{ maxWidth: '200px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
          {user.latestAddress}
        </div>
      )
    },
    { id: 'orders', label: lang === 'ar' ? 'الطلبات' : 'Orders', render: (user) => `${user.orderCount} order${user.orderCount !== 1 ? 's' : ''}` },
    { 
      id: 'totalSpent', 
      label: lang === 'ar' ? 'إجمالي المدفوعات' : 'Total Spent', 
      align: 'right',
      render: (user) => (
        <span style={{ fontWeight: 600, color: user.isInfluencer ? '#b45309' : 'var(--primary)', whiteSpace: 'nowrap' }}>
          {user.totalSpent?.toFixed(2)} EGP
        </span>
      )
    },
    { 
      id: 'actions', 
      label: lang === 'ar' ? 'الإجراءات' : 'Actions', 
      align: 'right',
      render: () => (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', width: '100%' }}>
          <ChevronRight size={18} style={{ color: 'var(--on-surface-variant)' }} />
        </div>
      )
    }
  ];

  const searchFunction = (user, term) => {
    const lower = term.toLowerCase();
    return (
      (user.name && user.name.toLowerCase().includes(lower)) || 
      (user.phone && user.phone.includes(term))
    );
  };

  const actionsNode = (
    <React.Fragment>
      <button className="btn btn-secondary" onClick={handleExport} style={{ display: 'flex', alignItems: 'center', gap: '8px', whiteSpace: 'nowrap' }}>
        <Download size={18} /> {lang === 'ar' ? 'تصدير' : 'Export'}
      </button>
      <button className="btn btn-secondary" onClick={() => navigate('/diaradmin26/users/analysis')} style={{ display: 'flex', alignItems: 'center', gap: '8px', whiteSpace: 'nowrap' }}>
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline></svg>
        {lang === 'ar' ? 'تحليل العملاء' : 'Customer Analysis'}
      </button>
    </React.Fragment>
  );

  return (
    <DataTable
      tableId="users"
      columns={columns}
      data={users}
      searchPlaceholder={lang === 'ar' ? 'بحث بالاسم، رقم الهاتف، أو المحافظة...' : "Search by name, phone or governorate..."}
      onRowClick={(user) => navigate(`/diaradmin26/users/${encodeURIComponent(user.id)}`)}
      actions={actionsNode}
      loading={loading}
      searchFunction={searchFunction}
    />
  );
}
