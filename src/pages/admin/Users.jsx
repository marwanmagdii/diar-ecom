import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronRight, Search, Download, Filter } from 'lucide-react';
import { exportToExcel } from '../../utils/excelExport';
import { useStore } from '../../store';

export default function Users() {
  const { users, ordersLoading: loading } = useStore();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [showColumnsMenu, setShowColumnsMenu] = useState(false);
  const [visibleColumns, setVisibleColumns] = useState({
    customer: true,
    phone: true,
    governorate: true,
    district: true,
    latestAddress: false,
    orders: true,
    totalSpent: true,
    actions: true
  });

  const filteredUsers = users.filter(user => 
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    user.phone.includes(searchTerm)
  );

  const handleExport = () => {
    const columns = [
      { header: 'Customer', key: 'name', width: 30 },
      { header: 'Phone', key: 'phone', width: 20 },
      { header: 'Latest Address', key: 'address', width: 40 },
      { header: 'Orders', key: 'orders', width: 15 },
      { header: 'Total Spent (EGP)', key: 'spent', width: 20 },
      { header: 'Is Partner', key: 'partner', width: 15 }
    ];

    const data = filteredUsers.map(u => ({
      name: u.name,
      phone: u.phone,
      address: u.latestAddress || '',
      orders: u.orderCount || 0,
      spent: u.totalSpent || 0,
      partner: u.isInfluencer ? 'Yes' : 'No'
    }));

    exportToExcel({ data, columns, filename: 'Customers' });
  };

  return (
    <div>
      <div className="admin-page-header">
        <div className="admin-page-header-left">
          <div style={{ position: 'relative' }}>
            <Search size={18} style={{ position: 'absolute', left: '12px', top: '10px', color: 'var(--on-surface-variant)' }} />
            <input 
              type="text" 
              className="input-field" 
              placeholder="Search customers..." 
              style={{ width: '250px', paddingLeft: '36px' }} 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
        <div className="admin-page-header-right">
          <button className="btn btn-secondary" onClick={handleExport} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Download size={18} />
            Export
          </button>
          <button className="btn btn-secondary" onClick={() => navigate('/diaradmin26/users/analysis')} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline></svg>
            Customer Analysis
          </button>
          
          <div style={{ position: 'relative' }}>
            <button 
              className="btn btn-secondary" 
              style={{ display: 'flex', alignItems: 'center', gap: '8px' }} 
              onClick={() => setShowColumnsMenu(!showColumnsMenu)}
            >
              <Filter size={18} /> Columns
            </button>
            {showColumnsMenu && (
              <div className="columns-dropdown">
                {Object.keys(visibleColumns).map(key => (
                  <label key={key} style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px', cursor: 'pointer', fontSize: '14px' }}>
                    <input 
                      type="checkbox" 
                      checked={visibleColumns[key]}
                      onChange={() => setVisibleColumns({...visibleColumns, [key]: !visibleColumns[key]})}
                    />
                    {key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, ' $1')}
                  </label>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="admin-table-container">
        <div className="table-responsive">
          <table className="admin-table">
            <thead>
              <tr>
                {visibleColumns.customer && <th>Customer</th>}
                {visibleColumns.phone && <th>Phone</th>}
                {visibleColumns.governorate && <th>Governorate</th>}
                {visibleColumns.district && <th>District</th>}
                {visibleColumns.latestAddress && <th>Latest Address</th>}
                {visibleColumns.orders && <th>Orders</th>}
                {visibleColumns.totalSpent && <th style={{ textAlign: 'right' }}>Total Spent</th>}
                {visibleColumns.actions && <th style={{ textAlign: 'right' }}>Actions</th>}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="6" style={{ textAlign: 'center', padding: '48px', color: '#64748b' }}>
                    <div style={{ margin: '0 auto 16px', border: '3px solid #f3f3f3', borderTop: '3px solid var(--primary)', borderRadius: '50%', width: '30px', height: '30px', animation: 'spin 1s linear infinite' }}></div>
                    <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
                    Loading customers...
                  </td>
                </tr>
              ) : filteredUsers.length === 0 ? (
                <tr><td colSpan="6" style={{ textAlign: 'center', padding: '32px' }}>No customers found.</td></tr>
              ) : (
                filteredUsers.map(user => (
                  <tr key={user.id} style={{ cursor: 'pointer' }} onClick={() => navigate(`/diaradmin26/users/${encodeURIComponent(user.id)}`)}>
                    {visibleColumns.customer && <td data-label="Customer" style={{ fontWeight: 600 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
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
                    </td>}
                    {visibleColumns.phone && <td data-label="Phone">{user.phone}</td>}
                    
                    {(() => {
                      const addressParts = (user.latestAddress || '').split(',').map(s => s.trim());
                      const gov = addressParts.length > 1 ? addressParts[addressParts.length - 1] : '-';
                      const dist = addressParts.length > 2 ? addressParts[addressParts.length - 2] : '-';
                      return (
                        <>
                          {visibleColumns.governorate && <td data-label="Governorate">{gov}</td>}
                          {visibleColumns.district && <td data-label="District">{dist}</td>}
                        </>
                      );
                    })()}

                    {visibleColumns.latestAddress && <td data-label="Latest Address" style={{ maxWidth: '200px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{user.latestAddress}</td>}
                    {visibleColumns.orders && <td data-label="Orders">{user.orderCount} order{user.orderCount !== 1 ? 's' : ''}</td>}
                    {visibleColumns.totalSpent && <td data-label="Total Spent" style={{ fontWeight: 600, color: user.isInfluencer ? '#b45309' : 'var(--primary)', textAlign: 'right' }}>
                      {user.totalSpent?.toFixed(2)} EGP
                    </td>}
                    {visibleColumns.actions && <td data-label="Actions" style={{ textAlign: 'right' }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', width: '100%' }}>
                        <ChevronRight size={18} style={{ color: 'var(--on-surface-variant)' }} />
                      </div>
                    </td>}
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
