import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronRight, Search, Download } from 'lucide-react';
import { exportToExcel } from '../../utils/excelExport';
import { useStore } from '../../store';

export default function Users() {
  const { users, ordersLoading: loading } = useStore();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');

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
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <h2 className="headline-md m-0">Customers</h2>
        <div style={{ display: 'flex', gap: '12px' }}>
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
          <button className="btn btn-secondary" onClick={handleExport} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Download size={18} />
            Export
          </button>
          <button className="btn btn-secondary" onClick={() => navigate('/diaradmin26/users/analysis')} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline></svg>
            Customer Analysis
          </button>
        </div>
      </div>

      <div className="admin-table-container">
        <div className="table-responsive">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Customer</th>
                <th>Phone</th>
                <th>Latest Address</th>
                <th>Orders</th>
                <th>Total Spent</th>
                <th>Actions</th>
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
                    <td style={{ fontWeight: 600 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        {user.name}
                        {user.isInfluencer && (
                          <span style={{ fontSize: '12px', padding: '2px 8px', backgroundColor: '#fef3c7', color: '#b45309', borderRadius: '100px', fontWeight: 700 }}>
                            Partner
                          </span>
                        )}
                        {user.linkedAccounts && user.linkedAccounts.length > 0 && (
                          <span title={`Also ordered from this device: ${user.linkedAccounts.map(u => u.phone).join(', ')}`} style={{ fontSize: '12px', padding: '2px 8px', backgroundColor: '#e0e7ff', color: '#4338ca', borderRadius: '100px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path></svg>
                            Linked
                          </span>
                        )}
                      </div>
                    </td>
                    <td>{user.phone}</td>
                    <td style={{ maxWidth: '200px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{user.latestAddress}</td>
                    <td>{user.orderCount} order{user.orderCount !== 1 ? 's' : ''}</td>
                    <td style={{ fontWeight: 600, color: user.isInfluencer ? '#b45309' : 'var(--primary)' }}>{user.totalSpent?.toFixed(2)} EGP</td>
                    <td>
                      <button className="icon-btn" style={{ width: '32px', height: '32px' }}><ChevronRight size={16} /></button>
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
