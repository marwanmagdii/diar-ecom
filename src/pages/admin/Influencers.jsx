import React, { useState } from 'react';
import { Plus, Edit, Trash2, Star, Download } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { exportToExcel } from '../../utils/excelExport';
import { useStore } from '../../store';

export default function Influencers() {
  const { config, updatePromoCodes, configLoading: loading } = useStore();
  const { addToast } = useStore();
  const navigate = useNavigate();
  const promos = config.promoCodes || [];
  
  const influencers = promos.filter(p => p.influencerName || p.commissionValue > 0);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [influencerToDelete, setInfluencerToDelete] = useState(null);

  const handleDelete = (id) => {
    setInfluencerToDelete(id);
    setDeleteModalOpen(true);
  };

  const confirmDelete = () => {
    if (influencerToDelete) {
      try {
        const updatedPromos = promos.filter(p => p.id !== influencerToDelete);
        updatePromoCodes(updatedPromos);
        addToast('Influencer deleted successfully', 'success');
      } catch (e) {
        addToast('Failed to delete influencer', 'error');
      }
      setDeleteModalOpen(false);
      setInfluencerToDelete(null);
    }
  };

  const handleToggleActive = (id, currentStatus) => {
    const updatedPromos = promos.map(p => {
      if (p.id === id) {
        return { ...p, isActive: !currentStatus };
      }
      return p;
    });
    updatePromoCodes(updatedPromos);
    addToast(`Influencer marked as ${!currentStatus ? 'Active' : 'Inactive'}.`);
  };



  const calculateCommission = (promo) => {
    if (!promo.commissionValue) return "0.00";
    if (promo.commissionType === 'percentage') {
      return (promo.totalRevenue * (promo.commissionValue / 100)).toFixed(2);
    } else {
      return (promo.usageCount * promo.commissionValue).toFixed(2);
    }
  };

  const handleExport = () => {
    const columns = [
      { header: 'Influencer Name', key: 'name', width: 30 },
      { header: 'Promo Code', key: 'code', width: 20 },
      { header: 'Commission Rate', key: 'rate', width: 20 },
      { header: 'Uses', key: 'uses', width: 10 },
      { header: 'Max Uses', key: 'maxUses', width: 15 },
      { header: 'Sales Generated (EGP)', key: 'sales', width: 20 },
      { header: 'Commission Owed (EGP)', key: 'commission', width: 20 },
      { header: 'Status', key: 'status', width: 15 }
    ];

    const data = influencers.map(inf => ({
      name: inf.influencerName || 'Unnamed',
      code: inf.code,
      rate: `${inf.commissionValue}${inf.commissionType === 'percentage' ? '%' : ' EGP'}`,
      uses: inf.usageCount || 0,
      maxUses: inf.maxUses || 'Unlimited',
      sales: inf.totalRevenue?.toFixed(2) || '0.00',
      commission: calculateCommission(inf),
      status: inf.isActive ? 'Active' : 'Inactive'
    }));

    exportToExcel({ data, columns, filename: 'Influencers' });
  };

  return (
    <div>
      <div className="admin-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', padding: 0, border: 'none', background: 'none' }}>
        <div>
          <h1 className="admin-title" style={{ fontSize: '24px', margin: '0 0 4px 0' }}>Influencers & Partners</h1>
          <p className="admin-subtitle" style={{ margin: 0 }}>
            Manage your partners, assign promo codes, and track commissions.
          </p>
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          <button className="btn btn-secondary" onClick={handleExport} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Download size={18} /> Export
          </button>
          <button className="btn btn-secondary" onClick={() => navigate('/diaradmin26/influencers/analysis')} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline></svg>
            Influencer Analysis
          </button>
          <button className="btn btn-primary" onClick={() => navigate('/diaradmin26/influencers/new')} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Plus size={18} /> Add Influencer
          </button>
        </div>
      </div>

      <div className="admin-table-container card">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Influencer Name</th>
              <th>Promo Code</th>
              <th>Commission Rate</th>
              <th>Uses</th>
              <th>Max Uses</th>
              <th>Sales Generated</th>
              <th>Commission Owed</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="9" style={{ textAlign: 'center', padding: '48px', color: '#64748b' }}>
                  <div style={{ margin: '0 auto 16px', border: '3px solid #f3f3f3', borderTop: '3px solid var(--primary)', borderRadius: '50%', width: '30px', height: '30px', animation: 'spin 1s linear infinite' }}></div>
                  <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
                  Loading influencers...
                </td>
              </tr>
            ) : influencers.length === 0 ? (
              <tr>
                <td colSpan="9" style={{ textAlign: 'center', padding: '32px', color: 'var(--on-surface-variant)' }}>
                  No influencers found. Click "Add Influencer" to get started.
                </td>
              </tr>
            ) : (
              influencers.map(inf => (
                <tr key={inf.id}>
                  <td style={{ fontWeight: 600 }}>{inf.influencerName || 'Unnamed'}</td>
                  <td>
                    <span style={{ padding: '4px 8px', backgroundColor: 'var(--surface-container-highest)', borderRadius: '4px', fontFamily: 'monospace', fontWeight: 'bold', letterSpacing: '1px' }}>
                      {inf.code}
                    </span>
                  </td>
                  <td>
                    {inf.commissionValue}{inf.commissionType === 'percentage' ? '%' : ' EGP'}
                  </td>
                  <td>{inf.usageCount || 0}</td>
                  <td>{inf.maxUses > 0 ? inf.maxUses : 'Unlimited'}</td>
                  <td>{(inf.totalRevenue || 0).toFixed(2)} EGP</td>
                  <td style={{ fontWeight: 'bold', color: 'var(--primary)' }}>
                    {calculateCommission(inf)} EGP
                  </td>
                  <td>
                    <label className="toggle-switch">
                      <input 
                        type="checkbox" 
                        checked={inf.isActive !== false} 
                        onChange={() => handleToggleActive(inf.id, inf.isActive !== false)} 
                      />
                      <span className="toggle-slider"></span>
                    </label>
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button className="icon-btn" onClick={() => navigate(`/diaradmin26/influencers/edit/${inf.id}`)} title="Edit">
                        <Edit size={16} />
                      </button>
                      <button className="icon-btn" style={{ color: 'var(--error)' }} onClick={() => handleDelete(inf.id)} title="Delete">
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

      {deleteModalOpen && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999 }}>
          <div className="card" style={{ padding: '24px', maxWidth: '400px', width: '100%', backgroundColor: 'var(--surface)' }}>
            <h3 style={{ margin: '0 0 16px 0', color: 'var(--on-surface)' }}>Delete Influencer</h3>
            <p style={{ margin: '0 0 24px 0', color: 'var(--on-surface-variant)' }}>Are you sure you want to delete this influencer? This will also delete their promo code. This action cannot be undone.</p>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
              <button className="btn btn-secondary" onClick={() => { setDeleteModalOpen(false); setInfluencerToDelete(null); }}>Cancel</button>
              <button className="btn" style={{ backgroundColor: '#ef4444', color: 'white', border: 'none' }} onClick={confirmDelete}>Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
