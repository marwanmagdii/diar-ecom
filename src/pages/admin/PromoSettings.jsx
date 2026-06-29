import React, { useState } from 'react';
import { Plus, Trash2, Edit2, Check, X, Tag, Download } from 'lucide-react';
import { exportToExcel } from '../../utils/excelExport';
import { useStore } from '../../store';

export default function PromoSettings() {
  const { config, updatePromoCodes } = useStore();
  const { addToast } = useStore();
  const [promoCodes, setPromoCodes] = useState(config.promoCodes || []);
  
  React.useEffect(() => {
    if (config && config.promoCodes) {
      setPromoCodes(config.promoCodes);
    }
  }, [config]);

  const [isEditing, setIsEditing] = useState(false);
  const [currentPromo, setCurrentPromo] = useState(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [promoToDelete, setPromoToDelete] = useState(null);

  const [formData, setFormData] = useState({
    id: '',
    code: '',
    discountType: 'percentage',
    discountValue: '',
    commissionType: 'percentage',
    commissionValue: '',
    influencerName: '',
    minOrderValue: '',
    isActive: true,
    usageCount: 0,
    totalRevenue: 0
  });

  const handleAddNew = () => {
    setFormData({
      id: Date.now().toString(),
      code: '',
      discountType: 'percentage',
      discountValue: '',
      commissionType: 'percentage',
      commissionValue: '',
      influencerName: '',
      minOrderValue: '',
      isActive: true,
      usageCount: 0,
      totalRevenue: 0
    });
    setIsEditing(true);
    setCurrentPromo(null);
  };

  const handleEdit = (promo) => {
    setFormData(promo);
    setIsEditing(true);
    setCurrentPromo(promo.id);
  };

  const handleDelete = (id) => {
    setPromoToDelete(id);
    setDeleteModalOpen(true);
  };

  const confirmDelete = () => {
    if (promoToDelete) {
      try {
        const promoObj = promoCodes.find(p => p.id === promoToDelete);
        const updated = promoCodes.filter(p => p.id !== promoToDelete);
        setPromoCodes(updated);
        updatePromoCodes(updated, `Deleted promo code ${promoObj ? promoObj.code : promoToDelete}`);
        addToast('Promo code deleted successfully', 'success');
      } catch (e) {
        addToast('Failed to delete promo code', 'error');
      }
      setDeleteModalOpen(false);
      setPromoToDelete(null);
    }
  };

  const toggleActive = (id) => {
    const promoObj = promoCodes.find(p => p.id === id);
    const newStatus = !promoObj.isActive;
    const updated = promoCodes.map(p => p.id === id ? { ...p, isActive: newStatus } : p);
    setPromoCodes(updated);
    updatePromoCodes(updated, `Changed promo code ${promoObj ? promoObj.code : id} from ${!newStatus ? 'active' : 'inactive'} to ${newStatus ? 'active' : 'inactive'}`);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const uppercaseCode = formData.code.toUpperCase().trim();
    
    // Check for duplicates
    const isDuplicate = promoCodes.some(p => p.code === uppercaseCode && p.id !== currentPromo);
    if (isDuplicate) {
      alert('This promo code already exists. Please use a different code or edit the existing one.');
      return;
    }

    const newPromo = {
      ...formData,
      code: uppercaseCode,
      discountValue: Number(formData.discountValue),
      commissionValue: Number(formData.commissionValue) || 0,
      minOrderValue: Number(formData.minOrderValue) || 0
    };

    let updated;
    let logDesc = '';
    if (currentPromo) {
      updated = promoCodes.map(p => p.id === currentPromo ? newPromo : p);
      logDesc = `Updated promo code ${uppercaseCode}`;
    } else {
      updated = [...promoCodes, newPromo];
      logDesc = `Added promo code ${uppercaseCode}`;
    }

    setPromoCodes(updated);
    updatePromoCodes(updated, logDesc);
    setIsEditing(false);
  };

  const handleExport = () => {
    const columns = [
      { header: 'Promo Code', key: 'code', width: 20 },
      { header: 'Discount', key: 'discount', width: 20 },
      { header: 'Commission', key: 'commission', width: 20 },
      { header: 'Usage Count', key: 'uses', width: 15 },
      { header: 'Revenue Generated (EGP)', key: 'revenue', width: 25 },
      { header: 'Total Owed (EGP)', key: 'owed', width: 20 },
      { header: 'Status', key: 'status', width: 15 }
    ];

    const data = promoCodes.map(promo => ({
      code: promo.code,
      discount: `${promo.discountValue}${promo.discountType === 'percentage' ? '%' : ' EGP'}`,
      commission: promo.commissionValue ? `${promo.commissionValue}${promo.commissionType === 'percentage' ? '%' : ' EGP'}` : '-',
      uses: promo.usageCount || 0,
      revenue: promo.totalRevenue || 0,
      owed: calculateCommission(promo),
      status: promo.isActive ? 'Active' : 'Inactive'
    }));

    exportToExcel({ data, columns, filename: 'Promo_Codes' });
  };

  const calculateCommission = (promo) => {
    if (!promo.commissionValue) return "0.00";
    if (promo.commissionType === 'percentage') {
      return (promo.totalRevenue * (promo.commissionValue / 100)).toFixed(2);
    } else {
      return (promo.usageCount * promo.commissionValue).toFixed(2);
    }
  };

  return (
    <div className="admin-page">
      <div className="admin-header">
        <div>
          <h1 className="admin-title">Promo Codes & Influencers</h1>
          <p className="admin-subtitle">Manage discount codes and calculate influencer commissions.</p>
        </div>
        {!isEditing && (
          <div style={{ display: 'flex', gap: '12px' }}>
            <button className="btn btn-secondary" onClick={handleExport} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Download size={18} /> Export
            </button>
            <button className="btn" onClick={handleAddNew} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Plus size={18} /> Add New Promo Code
            </button>
          </div>
        )}
      </div>

      {isEditing ? (
        <div className="card">
          <h2 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '24px' }}>
            {currentPromo ? 'Edit Promo Code' : 'Create New Promo Code'}
          </h2>
          <form onSubmit={handleSubmit}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginBottom: '24px' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: 500 }}>Code (e.g. SUMMER20)</label>
                <input 
                  type="text" 
                  className="input-field" 
                  value={formData.code} 
                  onChange={e => setFormData({...formData, code: e.target.value.toUpperCase()})} 
                  required 
                />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: 500 }}>Active Status</label>
                <label className="toggle-switch">
                  <input 
                    type="checkbox" 
                    checked={formData.isActive}
                    onChange={e => setFormData({...formData, isActive: e.target.checked})}
                  />
                  <span className="toggle-slider"></span>
                </label>
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: 500 }}>Customer Discount Type</label>
                <select className="input-field" value={formData.discountType} onChange={e => setFormData({...formData, discountType: e.target.value})}>
                  <option value="percentage">Percentage (%)</option>
                  <option value="fixed">Fixed Amount (EGP)</option>
                </select>
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: 500 }}>Customer Discount Value</label>
                <input 
                  type="number" 
                  step="0.01"
                  className="input-field" 
                  value={formData.discountValue} 
                  onChange={e => setFormData({...formData, discountValue: e.target.value})} 
                  required 
                />
              </div>
              <div style={{ gridColumn: '1 / -1' }}>
                <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: 500 }}>Minimum Order Value (Optional, EGP)</label>
                <input 
                  type="number" 
                  step="0.01"
                  className="input-field" 
                  placeholder="e.g. 500"
                  value={formData.minOrderValue} 
                  onChange={e => setFormData({...formData, minOrderValue: e.target.value})} 
                />
              </div>

              <div style={{ gridColumn: '1 / -1', padding: '16px', backgroundColor: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                <h3 style={{ fontSize: '14px', fontWeight: 600, marginBottom: '16px', color: '#0f172a' }}>Influencer Commission Tracking (Optional)</h3>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
                  <div style={{ gridColumn: '1 / -1' }}>
                    <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: 500 }}>Influencer Name</label>
                    <input 
                      type="text" 
                      className="input-field" 
                      placeholder="e.g. Ahmed Ali"
                      value={formData.influencerName} 
                      onChange={e => setFormData({...formData, influencerName: e.target.value})} 
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: 500 }}>Commission Type</label>
                    <select className="input-field" value={formData.commissionType} onChange={e => setFormData({...formData, commissionType: e.target.value})}>
                      <option value="percentage">Percentage of Sales (%)</option>
                      <option value="fixed">Fixed Amount per Use (EGP)</option>
                    </select>
                  </div>
                  <div>
                    <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: 500 }}>Commission Value</label>
                    <input 
                      type="number" 
                      step="0.01"
                      className="input-field" 
                      value={formData.commissionValue} 
                      onChange={e => setFormData({...formData, commissionValue: e.target.value})} 
                    />
                  </div>
                </div>
              </div>
            </div>
            
            <div style={{ display: 'flex', gap: '16px', justifyContent: 'flex-end' }}>
              <button type="button" className="btn btn-secondary" onClick={() => setIsEditing(false)}>Cancel</button>
              <button type="submit" className="btn">Save Promo Code</button>
            </div>
          </form>
        </div>
      ) : (
        <div className="table-container card">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Code</th>
                <th>Discount</th>
                <th>Commission</th>
                <th>Usage Count</th>
                <th>Revenue Generated</th>
                <th>Total Owed</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {promoCodes.length === 0 ? (
                <tr>
                  <td colSpan="8" style={{ textAlign: 'center', padding: '48px 0', color: '#64748b' }}>
                    <Tag size={48} style={{ opacity: 0.2, margin: '0 auto 16px auto', display: 'block' }} />
                    <p>No promo codes found.</p>
                  </td>
                </tr>
              ) : (
                promoCodes.map((promo) => (
                  <tr key={promo.id}>
                    <td>
                      <div 
                        style={{ 
                          display: 'inline-flex', 
                          alignItems: 'center', 
                          gap: '6px', 
                          cursor: 'pointer', 
                          backgroundColor: '#0f172a', 
                          color: '#ffffff', 
                          padding: '6px 10px', 
                          borderRadius: '6px', 
                          fontSize: '13px', 
                          fontWeight: 600,
                          transition: 'background-color 0.2s'
                        }}
                        onClick={() => {
                          navigator.clipboard.writeText(promo.code);
                          addToast(`Copied ${promo.code} to clipboard!`, 'success');
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#1e293b'}
                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#0f172a'}
                        title="Click to copy promo code"
                      >
                        {promo.code}
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ opacity: 0.7 }}>
                          <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                          <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                        </svg>
                      </div>
                    </td>
                    <td>
                      {promo.discountValue}{promo.discountType === 'percentage' ? '%' : ' EGP'}
                    </td>
                    <td>
                      {promo.commissionValue ? `${promo.commissionValue}${promo.commissionType === 'percentage' ? '%' : ' EGP'}` : '-'}
                    </td>
                    <td style={{ fontWeight: 600 }}>{promo.usageCount || 0}</td>
                    <td style={{ fontWeight: 600 }}>{(promo.totalRevenue || 0).toFixed(2)} EGP</td>
                    <td>
                      <span style={{ fontWeight: 700, color: '#10b981' }}>
                        {calculateCommission(promo)} EGP
                      </span>
                    </td>
                    <td>
                      <label className="toggle-switch">
                        <input 
                          type="checkbox" 
                          checked={promo.isActive !== false} 
                          onChange={() => toggleActive(promo.id)} 
                        />
                        <span className="toggle-slider"></span>
                      </label>
                    </td>
                    <td>
                      <div className="action-buttons">
                        <button className="icon-btn" onClick={() => handleEdit(promo)} aria-label="Edit">
                          <Edit2 size={16} />
                        </button>
                        <button className="icon-btn" onClick={() => handleDelete(promo.id)} aria-label="Delete" style={{ color: 'var(--error)' }}>
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {deleteModalOpen && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999 }}>
          <div className="card" style={{ padding: '24px', maxWidth: '400px', width: '100%', backgroundColor: 'var(--surface)' }}>
            <h3 style={{ margin: '0 0 16px 0', color: 'var(--on-surface)' }}>Delete Promo Code</h3>
            <p style={{ margin: '0 0 24px 0', color: 'var(--on-surface-variant)' }}>Are you sure you want to delete this promo code? This action cannot be undone.</p>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
              <button className="btn btn-secondary" onClick={() => { setDeleteModalOpen(false); setPromoToDelete(null); }}>Cancel</button>
              <button className="btn" style={{ backgroundColor: '#ef4444', color: 'white', border: 'none' }} onClick={confirmDelete}>Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
