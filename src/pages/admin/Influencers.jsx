import React, { useState } from 'react';
import { Plus, Edit, Trash2, Download, Copy } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { exportToExcel } from '../../utils/excelExport';
import { useStore } from '../../store';
import DataTable from '../../components/admin/DataTable';

export default function Influencers() {
  const { config, updatePromoCodes, configLoading: loading, language } = useStore();
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
    const exportColumns = [
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

    exportToExcel({ data, columns: exportColumns, filename: 'Influencers' });
  };

  const columns = [
    { 
      id: 'name', 
      label: language === 'ar' ? 'اسم المؤثر' : 'Influencer Name', 
      render: (inf) => <span style={{ fontWeight: 600 }}>{inf.influencerName || 'Unnamed'}</span> 
    },
    { 
      id: 'code', 
      label: language === 'ar' ? 'النوع والكود' : 'Type & Code', 
      render: (inf) => {
        const isLink = inf.affiliateType === 'link';
        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <span style={{ fontSize: '11px', color: isLink ? '#8b5cf6' : '#f59e0b', fontWeight: 600 }}>
              {isLink ? (language === 'ar' ? 'رابط إحالة' : 'Referral Link') : (language === 'ar' ? 'كود خصم' : 'Promo Code')}
            </span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              {isLink ? (
                <a href={`/?ref=${inf.code}`} target="_blank" rel="noreferrer" style={{ backgroundColor: '#0f172a', color: '#fff', padding: '4px 8px', borderRadius: '4px', fontSize: '12px', fontWeight: 600, whiteSpace: 'nowrap', textDecoration: 'none' }}>
                  {inf.code}
                </a>
              ) : (
                <span style={{ backgroundColor: '#0f172a', color: '#fff', padding: '4px 8px', borderRadius: '4px', fontSize: '12px', fontWeight: 600, whiteSpace: 'nowrap' }}>
                  {inf.code}
                </span>
              )}
              {isLink && (
                <button 
                  className="icon-btn" 
                  title="Copy Link"
                  onClick={() => {
                    const link = `${window.location.origin}/?ref=${inf.code}`;
                    navigator.clipboard.writeText(link);
                    addToast('Link copied!', 'success');
                  }}
                  style={{ padding: '4px', backgroundColor: '#f1f5f9' }}
                >
                  <Copy size={14} style={{ color: '#64748b' }} />
                </button>
              )}
            </div>
          </div>
        );
      }
    },
    { 
      id: 'rate', 
      label: language === 'ar' ? 'نسبة العمولة' : 'Commission Rate', 
      render: (inf) => `${inf.commissionValue}${inf.commissionType === 'percentage' ? '%' : ' EGP'}` 
    },
    { id: 'uses', label: language === 'ar' ? 'الاستخدامات' : 'Uses', render: (inf) => inf.usageCount || 0 },
    { id: 'maxUses', label: language === 'ar' ? 'أقصى استخدام' : 'Max Uses', render: (inf) => inf.maxUses > 0 ? inf.maxUses : 'Unlimited' },
    { id: 'sales', label: language === 'ar' ? 'المبيعات المحققة' : 'Sales Generated', align: 'right', render: (inf) => `${(inf.totalRevenue || 0).toFixed(2)} EGP` },
    { 
      id: 'commission', 
      label: language === 'ar' ? 'العمولة المستحقة' : 'Commission Owed', 
      align: 'right', 
      render: (inf) => (
        <span style={{ fontWeight: 600, color: '#10b981' }}>{calculateCommission(inf)} EGP</span>
      )
    },
    { 
      id: 'status', 
      label: language === 'ar' ? 'الحالة' : 'Status', 
      render: (inf) => (
        <label className="toggle-switch">
          <input 
            type="checkbox" 
            checked={inf.isActive !== false} 
            onChange={() => handleToggleActive(inf.id, inf.isActive !== false)} 
          />
          <span className="toggle-slider"></span>
        </label>
      )
    },
    { 
      id: 'actions', 
      label: language === 'ar' ? 'الإجراءات' : 'Actions', 
      align: 'right',
      render: (inf) => (
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center', justifyContent: 'flex-end', width: '100%' }}>
          <button className="icon-btn" onClick={() => navigate(`/diaradmin26/influencers/edit/${inf.id}`)} title="Edit">
            <Edit size={16} />
          </button>
          <button className="icon-btn" style={{ color: 'var(--error)' }} onClick={() => handleDelete(inf.id)} title="Delete">
            <Trash2 size={16} />
          </button>
        </div>
      )
    }
  ];

  const searchFunction = (inf, term) => {
    const lower = term.toLowerCase();
    return (
      (inf.influencerName && inf.influencerName.toLowerCase().includes(lower)) ||
      (inf.code && inf.code.toLowerCase().includes(lower))
    );
  };

  const actionsNode = (
    <React.Fragment>
      <button className="btn btn-secondary" onClick={handleExport} style={{ display: 'flex', alignItems: 'center', gap: '8px', whiteSpace: 'nowrap' }}>
        <Download size={18} /> {language === 'ar' ? 'تصدير' : 'Export'}
      </button>
      <button className="btn btn-secondary" onClick={() => navigate('/diaradmin26/influencers/analysis')} style={{ display: 'flex', alignItems: 'center', gap: '8px', whiteSpace: 'nowrap' }}>
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline></svg>
        {language === 'ar' ? 'تحليل المؤثرين' : 'Influencer Analysis'}
      </button>
      <button className="btn btn-primary mobile-hidden" onClick={() => navigate('/diaradmin26/influencers/new')} style={{ display: 'flex', alignItems: 'center', gap: '8px', whiteSpace: 'nowrap' }}>
        <Plus size={18} /> {language === 'ar' ? 'إضافة مؤثر' : 'Add Influencer'}
      </button>
    </React.Fragment>
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <DataTable
        tableId="influencers"
        columns={columns}
        data={influencers}
        searchPlaceholder={language === 'ar' ? 'البحث عن المؤثرين...' : 'Search influencers...'}
        actions={actionsNode}
        loading={loading}
        searchFunction={searchFunction}
        emptyMessage={language === 'ar' ? 'لا يوجد مؤثرين. انقر على "إضافة مؤثر" للبدء.' : 'No influencers found. Click "Add Influencer" to get started.'}
      />

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
