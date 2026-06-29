import React, { useState } from 'react';
import { useAdmin } from '../../context/AdminContext';
import { useProducts } from '../../context/ProductContext';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, User, Phone, MapPin, ShoppingBag, Target, Merge, Sparkles, ChevronDown, ChevronUp, Search, X, Package, Trash2, Download } from 'lucide-react';
import { exportToExcel } from '../../utils/excelExport';
import { useToast } from '../../context/ToastContext';

export default function UserDetails() {
  const { id } = useParams();
  const { users, mergeUsers, lang, deleteOrder } = useAdmin();
  const { products } = useProducts();
  const { addToast } = useToast();
  const navigate = useNavigate();
  
  // Merge Modal State
  const [isMergeModalOpen, setIsMergeModalOpen] = useState(false);
  const [mergeSearchTerm, setMergeSearchTerm] = useState('');
  
  // Expanded Orders State
  const [expandedOrders, setExpandedOrders] = useState({});
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deleteInput, setDeleteInput] = useState('');

  const user = users.find(u => u.id === id);

  if (!user) {
    return (
      <div style={{ padding: '32px', textAlign: 'center' }}>
        <p>User not found.</p>
        <button className="btn" onClick={() => navigate('/admin/users')}>Back to Users</button>
      </div>
    );
  }

  const handleMerge = (sourceUser) => {
    if (window.confirm(`Are you sure you want to merge all orders from ${sourceUser.name} (${sourceUser.phone}) into this profile?`)) {
      mergeUsers(user.phone, sourceUser.phone);
      setIsMergeModalOpen(false);
      alert('Profiles merged successfully!');
    }
  };

  const toggleOrderExpand = (orderId, e) => {
    e.stopPropagation();
    setExpandedOrders(prev => ({ ...prev, [orderId]: !prev[orderId] }));
  };

  const confirmDelete = () => {
    if (deleteInput.trim().toLowerCase() === 'delete') {
      try {
        user.orders.forEach(order => deleteOrder(order.id));
        addToast('Customer and orders deleted successfully', 'success');
        navigate('/admin/users');
      } catch (e) {
        addToast('Failed to delete customer', 'error');
      }
    }
  };

  const recommendations = products.filter(product => product.category === user.primaryInterest).slice(0, 3);
  const filteredMergeUsers = users.filter(u => u.id !== user.id && (u.name.toLowerCase().includes(mergeSearchTerm.toLowerCase()) || u.phone.includes(mergeSearchTerm)));

  const handleExport = () => {
    const columns = [
      { header: 'Order ID', key: 'id', width: 20 },
      { header: 'Date', key: 'date', width: 20 },
      { header: 'Status', key: 'status', width: 15 },
      { header: 'Total (EGP)', key: 'total', width: 20 },
      { header: 'Items Purchased', key: 'items', width: 50 }
    ];

    const data = user.orders.map(order => ({
      id: order.id,
      date: order.createdAt instanceof Date ? order.createdAt.toLocaleDateString() : 'Unknown Date',
      status: order.status || '',
      total: order.total || 0,
      items: (order.items || []).map(item => `${item.qty}x ${item.title}`).join(', ')
    }));

    exportToExcel({ data, columns, filename: `User_${user.name.replace(/\s+/g, '_')}_Orders` });
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <button className="icon-btn" onClick={() => navigate('/admin/users')}><ArrowLeft size={20} /></button>
          <h2 className="headline-md m-0">{user.isInfluencer ? 'Influencer Profile' : 'Customer Profile'}</h2>
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          {!user.isInfluencer && (
            <button className="btn btn-secondary" style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 16px', color: '#86198f', borderColor: '#fbcfe8', backgroundColor: '#fdf4ff' }} onClick={() => setIsMergeModalOpen(true)}>
              <Merge size={18} /> Merge Profiles
            </button>
          )}
          <button 
            className="btn btn-secondary" 
            style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 16px', color: '#dc2626', borderColor: '#fecaca', backgroundColor: '#fef2f2' }} 
            onClick={() => {
              setDeleteInput('');
              setDeleteModalOpen(true);
            }}
          >
            <Trash2 size={18} /> Delete Customer
          </button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '24px', marginBottom: '32px' }}>
        
        {/* Left Column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          {/* Profile Card */}
          <div className="metric-card" style={{ padding: '24px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '24px' }}>
              <div style={{ width: '80px', height: '80px', borderRadius: '50%', backgroundColor: user.isInfluencer ? '#fef3c7' : 'var(--primary-container)', color: user.isInfluencer ? '#b45309' : 'var(--on-primary-container)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '32px', fontWeight: 'bold', marginBottom: '16px' }}>
                {user.name.charAt(0).toUpperCase()}
              </div>
              <h3 className="title-lg m-0">{user.name}</h3>
              <p style={{ color: 'var(--on-surface-variant)', margin: '4px 0 0 0' }}>{user.isInfluencer ? 'Influencer Partner' : 'Customer'}</p>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', width: '100%' }}>
              <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                <Phone size={18} color="var(--primary)" />
                <span style={{ fontSize: '15px', color: '#0f172a' }}>{user.phone}</span>
              </div>
              <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                <MapPin size={18} color="var(--primary)" style={{ flexShrink: 0, marginTop: '2px' }} />
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', width: '100%' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #f1f5f9', paddingBottom: '8px' }}>
                    <span style={{ color: '#64748b', fontSize: '13px' }}>Governorate</span>
                    <span style={{ fontWeight: 600, color: '#0f172a', fontSize: '14px' }}>{user.latestAddress?.split(',')[2]?.trim() || 'N/A'}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #f1f5f9', paddingBottom: '8px' }}>
                    <span style={{ color: '#64748b', fontSize: '13px' }}>District</span>
                    <span style={{ fontWeight: 600, color: '#0f172a', fontSize: '14px' }}>{user.latestAddress?.split(',')[1]?.trim() || 'N/A'}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <span style={{ color: '#64748b', fontSize: '13px' }}>Street</span>
                    <span style={{ fontWeight: 600, color: '#0f172a', fontSize: '14px', textAlign: 'right', maxWidth: '180px' }}>{user.latestAddress?.split(',')[0]?.trim() || 'N/A'}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Linked Accounts Card */}
          {user.linkedAccounts && user.linkedAccounts.length > 0 && (
            <div className="metric-card" style={{ padding: '24px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
                <div style={{ padding: '6px', backgroundColor: '#e0e7ff', color: '#4338ca', borderRadius: '6px' }}>
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path></svg>
                </div>
                <h3 className="title-md m-0">Linked Accounts</h3>
              </div>
              <p style={{ fontSize: '13px', color: '#64748b', marginBottom: '16px', lineHeight: '1.4' }}>
                These accounts have placed orders using the exact same device or browser as {user.name}.
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {user.linkedAccounts.map(linkedUser => (
                  <div 
                    key={linkedUser.id} 
                    style={{ padding: '12px', border: '1px solid #e2e8f0', borderRadius: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer' }}
                    onClick={() => navigate(`/admin/users/${encodeURIComponent(linkedUser.id)}`)}
                    className="hover-row"
                  >
                    <div>
                      <div style={{ fontWeight: 600, color: '#0f172a', fontSize: '14px' }}>{linkedUser.name}</div>
                      <div style={{ color: '#64748b', fontSize: '13px' }}>{linkedUser.phone}</div>
                    </div>
                    <ArrowLeft size={16} color="#94a3b8" style={{ transform: 'rotate(180deg)' }} />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right Column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          {/* Stats Card */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', alignContent: 'start' }}>
            <div className="metric-card" style={{ padding: '24px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                <div style={{ padding: '8px', borderRadius: '8px', backgroundColor: 'var(--primary-container)', color: 'var(--on-primary-container)' }}>
                  <ShoppingBag size={24} />
                </div>
                <h3 className="title-md m-0">{user.isInfluencer ? 'Orders Generated' : 'Total Orders'}</h3>
              </div>
              <p className="headline-lg m-0" style={{ fontWeight: 'bold' }}>{user.orderCount}</p>
            </div>
            <div className="metric-card" style={{ padding: '24px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                <div style={{ padding: '8px', borderRadius: '8px', backgroundColor: '#dcfce7', color: '#166534' }}>
                  <Target size={24} />
                </div>
                <h3 className="title-md m-0">{user.isInfluencer ? 'Sales Generated' : 'Total Spent'}</h3>
              </div>
              <p className="headline-lg m-0" style={{ fontWeight: 'bold' }}>{user.totalSpent.toFixed(2)} EGP</p>
            </div>
            
            {user.isInfluencer && (
              <div className="metric-card" style={{ padding: '24px', gridColumn: '1 / -1' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                  <div style={{ padding: '8px', borderRadius: '8px', backgroundColor: '#fef3c7', color: '#b45309' }}>
                    <Sparkles size={24} />
                  </div>
                  <h3 className="title-md m-0">Commission Owed</h3>
                </div>
                <p className="headline-lg m-0" style={{ fontWeight: 'bold', color: '#b45309' }}>
                  {(() => {
                    if (user.influencerData.commissionType === 'percentage') {
                      return (user.totalSpent * (user.influencerData.commissionValue / 100)).toFixed(2);
                    }
                    return (user.orderCount * user.influencerData.commissionValue).toFixed(2);
                  })()} EGP
                </p>
                <p style={{ color: '#64748b', margin: '4px 0 0 0', fontSize: '13px' }}>
                  Rate: {user.influencerData.commissionValue}{user.influencerData.commissionType === 'percentage' ? '%' : ' EGP / Order'}
                </p>
              </div>
            )}
          </div>

          {!user.isInfluencer && (
            <div className="metric-card" style={{ padding: '24px', backgroundColor: '#fffbeb', border: '1px solid #fde68a' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                <div>
                  <h3 className="title-lg m-0" style={{ color: '#92400e' }}>Customer Intelligence</h3>
                  <p style={{ color: '#b45309', margin: '4px 0 0 0', fontSize: '14px' }}>Based on purchase history, this user often buys <strong>{user.primaryInterest}</strong>.</p>
                </div>
                <div style={{ padding: '8px', backgroundColor: '#fef3c7', borderRadius: '8px' }}>
                  <Sparkles size={24} color="#f59e0b" />
                </div>
              </div>

              <h4 className="title-md mb-3" style={{ fontSize: '15px', color: '#3730a3' }}>Recommended Products to Market</h4>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
                {recommendations.length > 0 ? recommendations.map(rec => (
                  <div key={rec.id} style={{ backgroundColor: '#ffffff', padding: '16px', borderRadius: '8px', boxShadow: '0 1px 2px 0 rgba(0,0,0,0.05)' }}>
                    <p style={{ fontWeight: 600, fontSize: '14px', margin: '0 0 4px 0', color: '#1e293b' }}>{rec.title}</p>
                    <p style={{ color: '#64748b', margin: 0, fontSize: '13px' }}>{rec.price} EGP</p>
                  </div>
                )) : (
                  <p style={{ color: '#64748b', fontSize: '14px' }}>Not enough data to generate recommendations.</p>
                )}
              </div>
            </div>
          )}

        </div>
      </div>

      {/* Order History */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
        <h3 className="title-lg m-0">{user.isInfluencer ? 'Generated Orders History' : 'Order History'}</h3>
        <button className="btn btn-secondary" onClick={handleExport} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '6px 12px', fontSize: '14px' }}>
          <Download size={16} /> Export
        </button>
      </div>
      <div className="admin-table-container">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Order ID</th>
              <th>Date</th>
              <th>Status</th>
              <th>Total</th>
              <th style={{ width: '40px' }}></th>
            </tr>
          </thead>
          <tbody>
            {user.orders.map(order => (
              <React.Fragment key={order.id}>
                <tr style={{ cursor: 'pointer', borderBottom: expandedOrders[order.id] ? 'none' : '1px solid #f1f5f9' }} onClick={() => navigate(`/admin/orders/${encodeURIComponent(order.id)}`)}>
                  <td style={{ fontWeight: 600, color: '#2563eb', textDecoration: 'underline' }}>{order.id}</td>
                  <td>{order.createdAt instanceof Date ? order.createdAt.toLocaleDateString() : 'Unknown Date'}</td>
                  <td>
                    <span className={`status-pill status-${order.status?.toLowerCase()}`}>
                      {order.status}
                    </span>
                  </td>
                  <td style={{ fontWeight: 600 }}>{order.total?.toFixed(2)} EGP</td>
                  <td onClick={(e) => toggleOrderExpand(order.id, e)} style={{ width: '40px', padding: '16px 8px', textAlign: 'right' }}>
                    <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', color: '#64748b' }}>
                      {expandedOrders[order.id] ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                    </div>
                  </td>
                </tr>
                {expandedOrders[order.id] && (
                  <tr>
                    <td colSpan="5" style={{ padding: 0, borderBottom: '1px solid #f1f5f9' }}>
                      <div style={{ padding: '24px', backgroundColor: '#ffffff' }}>
                        <h4 style={{ fontSize: '13px', color: '#64748b', margin: '0 0 16px 0', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600 }}>Items Purchased</h4>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '16px' }}>
                          {order.items?.map((item, idx) => (
                            <div key={idx} style={{ display: 'flex', gap: '16px', alignItems: 'center', padding: '16px', backgroundColor: '#f8fafc', borderRadius: '8px', border: '1px solid #f1f5f9' }}>
                              <div style={{ width: '40px', height: '40px', backgroundColor: '#e2e8f0', borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <Package size={20} color="#64748b" />
                              </div>
                              <div style={{ flex: 1 }}>
                                <p style={{ margin: '0 0 4px 0', fontWeight: 600, fontSize: '14px', color: '#0f172a' }}>{item.title}</p>
                                <p style={{ margin: 0, fontSize: '13px', color: '#64748b' }}>Qty: {item.qty} &times; {item.price} EGP</p>
                              </div>
                              <div style={{ fontWeight: 700, fontSize: '14px', color: '#0f172a' }}>
                                {(item.qty * item.price).toFixed(2)} EGP
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </td>
                  </tr>
                )}
              </React.Fragment>
            ))}
          </tbody>
        </table>
      </div>

      {/* Merge Modal */}
      {isMergeModalOpen && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div className="metric-card" style={{ padding: '32px', width: '100%', maxWidth: '600px', backgroundColor: '#ffffff', position: 'relative', maxHeight: '80vh', display: 'flex', flexDirection: 'column' }}>
            <button className="icon-btn" style={{ position: 'absolute', top: '16px', right: '16px' }} onClick={() => setIsMergeModalOpen(false)}>
              <X size={24} />
            </button>
            <h3 className="title-lg mb-4">Select User to Merge</h3>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 16px', backgroundColor: '#f1f5f9', borderRadius: '8px', marginBottom: '16px' }}>
              <Search size={18} color="#64748b" />
              <input 
                type="text" 
                placeholder="Search by name or phone..." 
                value={mergeSearchTerm}
                onChange={e => setMergeSearchTerm(e.target.value)}
                style={{ border: 'none', background: 'transparent', outline: 'none', width: '100%', padding: '4px 0' }}
              />
            </div>

            <div style={{ overflowY: 'auto', flex: 1, border: '1px solid #e2e8f0', borderRadius: '8px' }}>
              <table className="admin-table" style={{ margin: 0 }}>
                <thead style={{ position: 'sticky', top: 0, zIndex: 1 }}>
                  <tr>
                    <th>Name</th>
                    <th>Phone</th>
                    <th style={{ textAlign: 'right' }}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredMergeUsers.map(u => (
                    <tr key={u.id}>
                      <td style={{ fontWeight: 500 }}>{u.name}</td>
                      <td>{u.phone}</td>
                      <td style={{ textAlign: 'right' }}>
                        <button className="btn" style={{ padding: '6px 12px', fontSize: '13px', backgroundColor: '#86198f' }} onClick={() => handleMerge(u)}>
                          Merge
                        </button>
                      </td>
                    </tr>
                  ))}
                  {filteredMergeUsers.length === 0 && (
                    <tr>
                      <td colSpan="3" style={{ textAlign: 'center', padding: '24px', color: '#64748b' }}>No other users found.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {deleteModalOpen && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999 }}>
          <div className="card" style={{ padding: '24px', maxWidth: '400px', width: '100%', backgroundColor: 'var(--surface)' }}>
            <h3 style={{ margin: '0 0 16px 0', color: 'var(--on-surface)' }}>Delete Customer</h3>
            <p style={{ margin: '0 0 16px 0', color: 'var(--on-surface-variant)' }}>Are you sure you want to delete this user <strong>AND ALL of their orders</strong>? Type <strong>delete</strong> to confirm:</p>
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
