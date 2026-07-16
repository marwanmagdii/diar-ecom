import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ChevronRight, Save, X, Search, Trash2 } from 'lucide-react';
import { useStore } from '../../store';

export default function CreateInfluencer() {
  const { config, updatePromoCodes } = useStore();
  const { users } = useStore();
  const { addToast } = useStore();
  const navigate = useNavigate();
  const { id } = useParams(); // If editing

  const promos = config?.promoCodes || [];
  const existingInf = id ? promos.find(p => p.id === id) : null;

  const [formData, setFormData] = useState({
    userId: '',
    influencerName: '',
    code: '',
    affiliateType: 'promo',
    discountType: 'percentage',
    discountValue: 10,
    commissionType: 'percentage',
    commissionValue: 5,
    maxUses: 0,
    isActive: true,
    socialAccounts: [{ platform: 'instagram', handle: '' }]
  });

  const [userSearch, setUserSearch] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);

  useEffect(() => {
    if (existingInf) {
      setFormData({
        userId: existingInf.userId || '',
        influencerName: existingInf.influencerName || '',
        code: existingInf.code || '',
        affiliateType: existingInf.affiliateType || 'promo',
        discountType: existingInf.discountType || 'percentage',
        discountValue: existingInf.discountValue || 10,
        commissionType: existingInf.commissionType || 'percentage',
        commissionValue: existingInf.commissionValue || 5,
        maxUses: existingInf.maxUses || 0,
        isActive: existingInf.isActive !== false,
        socialAccounts: existingInf.socialAccounts || (existingInf.socialPlatform ? [{ platform: existingInf.socialPlatform, handle: existingInf.socialHandle }] : [{ platform: 'instagram', handle: '' }])
      });
      setUserSearch(existingInf.influencerName || '');
    }
  }, [existingInf]);

  const filteredUsers = users.filter(u => !u.isInfluencer && (u.name.toLowerCase().includes(userSearch.toLowerCase()) || u.phone.includes(userSearch))).slice(0, 5);

  const handleSelectUser = (u) => {
    setFormData({ ...formData, userId: u.id, influencerName: u.name });
    setUserSearch(u.name);
    setShowDropdown(false);
  };

  const handleSave = (e) => {
    e.preventDefault();
    if (!formData.influencerName || !formData.code) {
      addToast('Name and Promo Code are required.', 'error');
      return;
    }

    const uppercaseCode = formData.code.toUpperCase().trim();
    const isDuplicate = promos.some(p => p.code === uppercaseCode && p.id !== id);
    if (isDuplicate) {
      addToast('This promo code is already in use.', 'error');
      return;
    }

    let updatedPromos;
    if (id) {
      updatedPromos = promos.map(p => {
        if (p.id === id) {
          return {
            ...p,
            ...formData,
            code: uppercaseCode,
            discountValue: formData.affiliateType === 'link' ? 0 : Number(formData.discountValue),
            commissionValue: Number(formData.commissionValue),
            maxUses: Number(formData.maxUses)
          };
        }
        return p;
      });
      addToast('Influencer updated successfully!');
    } else {
      const newInfluencer = {
        id: Date.now().toString(),
        ...formData,
        code: uppercaseCode,
        discountValue: formData.affiliateType === 'link' ? 0 : Number(formData.discountValue),
        commissionValue: Number(formData.commissionValue),
        maxUses: Number(formData.maxUses),
        usageCount: 0,
        totalRevenue: 0
      };
      updatedPromos = [...promos, newInfluencer];
      addToast('Influencer created successfully!');
    }

    updatePromoCodes(updatedPromos);
    navigate('/diaradmin26/influencers');
  };

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
      {/* Header and Breadcrumbs removed as they are now in the top navbar */}

      <div className="metric-card" style={{ padding: '32px', backgroundColor: '#ffffff', borderRadius: '12px' }}>
        <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          <h3 style={{ fontSize: '18px', fontWeight: 600, borderBottom: '1px solid #e2e8f0', paddingBottom: '12px', margin: 0 }}>Basic Profile</h3>
          
          <div style={{ position: 'relative' }}>
            <label className="label-md" style={{ display: 'block', marginBottom: '8px' }}>Influencer Name / Map to Customer</label>
            <div style={{ position: 'relative' }}>
              <Search size={16} style={{ position: 'absolute', left: '12px', top: '12px', color: '#94a3b8' }} />
              <input 
                type="text" 
                className="input-field"
                placeholder="Search customers or type a name..."
                value={userSearch}
                onChange={(e) => {
                  setUserSearch(e.target.value);
                  setFormData({...formData, influencerName: e.target.value, userId: ''});
                  setShowDropdown(true);
                }}
                onFocus={() => setShowDropdown(true)}
                style={{ paddingLeft: '36px' }}
                required
              />
            </div>
            {showDropdown && userSearch && (
              <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, backgroundColor: 'white', border: '1px solid #e2e8f0', borderRadius: '8px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)', zIndex: 10, maxHeight: '200px', overflowY: 'auto', marginTop: '4px' }}>
                {filteredUsers.length > 0 ? filteredUsers.map(u => (
                  <div key={u.id} style={{ padding: '12px 16px', cursor: 'pointer', borderBottom: '1px solid #f1f5f9' }} onClick={() => handleSelectUser(u)}>
                    <div style={{ fontWeight: 600 }}>{u.name}</div>
                    <div style={{ fontSize: '12px', color: '#64748b' }}>{u.phone}</div>
                  </div>
                )) : (
                  <div style={{ padding: '12px 16px', color: '#64748b' }}>Use "{userSearch}" as a new name</div>
                )}
              </div>
            )}
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '16px' }}>
            <h3 style={{ fontSize: '18px', fontWeight: 600, margin: 0 }}>Social Media Accounts</h3>
            <button type="button" className="btn btn-outline" onClick={() => setFormData({...formData, socialAccounts: [...formData.socialAccounts, { platform: 'instagram', handle: '' }]})}>
              + Add Account
            </button>
          </div>
          <div style={{ borderBottom: '1px solid #e2e8f0', paddingBottom: '12px', marginBottom: '8px' }}></div>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {formData.socialAccounts.map((account, index) => (
              <div key={index} style={{ display: 'flex', gap: '16px', alignItems: 'flex-end', backgroundColor: '#f8fafc', padding: '16px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                <div style={{ flex: 1 }}>
                  <label className="label-md" style={{ display: 'block', marginBottom: '8px' }}>Platform</label>
                  <select 
                    className="input-field"
                    value={account.platform}
                    onChange={(e) => {
                      const newAccounts = [...formData.socialAccounts];
                      newAccounts[index].platform = e.target.value;
                      setFormData({...formData, socialAccounts: newAccounts});
                    }}
                  >
                    <option value="instagram">Instagram</option>
                    <option value="tiktok">TikTok</option>
                    <option value="youtube">YouTube</option>
                    <option value="snapchat">Snapchat</option>
                    <option value="facebook">Facebook</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div style={{ flex: 2 }}>
                  <label className="label-md" style={{ display: 'block', marginBottom: '8px' }}>Handle / URL</label>
                  <input 
                    type="text" 
                    className="input-field"
                    placeholder="e.g. @sarah_creates"
                    value={account.handle}
                    onChange={(e) => {
                      const newAccounts = [...formData.socialAccounts];
                      newAccounts[index].handle = e.target.value;
                      setFormData({...formData, socialAccounts: newAccounts});
                    }}
                  />
                </div>
                {formData.socialAccounts.length > 1 && (
                  <button type="button" className="icon-btn" style={{ padding: '12px', color: '#ef4444', backgroundColor: '#fee2e2', borderRadius: '8px' }} onClick={() => {
                    const newAccounts = formData.socialAccounts.filter((_, i) => i !== index);
                    setFormData({...formData, socialAccounts: newAccounts});
                  }}>
                    <Trash2 size={18} />
                  </button>
                )}
              </div>
            ))}
          </div>

          <h3 style={{ fontSize: '18px', fontWeight: 600, borderBottom: '1px solid #e2e8f0', paddingBottom: '12px', margin: '16px 0 0 0' }}>Affiliate Configuration</h3>
          
          <div style={{ display: 'flex', gap: '24px', backgroundColor: '#f8fafc', padding: '16px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
              <input type="radio" name="affiliateType" value="promo" checked={formData.affiliateType === 'promo'} onChange={() => setFormData({...formData, affiliateType: 'promo'})} style={{ width: '18px', height: '18px', accentColor: 'var(--primary)' }} />
              <span style={{ fontWeight: 500, color: '#334155' }}>Promo Code (Discount)</span>
            </label>
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
              <input type="radio" name="affiliateType" value="link" checked={formData.affiliateType === 'link'} onChange={() => setFormData({...formData, affiliateType: 'link'})} style={{ width: '18px', height: '18px', accentColor: 'var(--primary)' }} />
              <span style={{ fontWeight: 500, color: '#334155' }}>Referral Link (No Discount)</span>
            </label>
          </div>
          
          <div>
            <label className="label-md" style={{ display: 'block', marginBottom: '8px' }}>Assigned Promo Code</label>
            <input 
              type="text" 
              className="input-field"
              placeholder="e.g. SARAH20"
              value={formData.code}
              onChange={(e) => setFormData({...formData, code: e.target.value})}
              style={{ textTransform: 'uppercase', fontSize: '18px', fontWeight: 'bold', letterSpacing: '1px' }}
              required
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
            <div>
              <label className="label-md" style={{ display: 'block', marginBottom: '8px' }}>Commission Type</label>
              <select className="input-field" value={formData.commissionType} onChange={(e) => setFormData({...formData, commissionType: e.target.value})}>
                <option value="percentage">Percentage (%)</option>
                <option value="fixed">Fixed Amount (EGP)</option>
              </select>
            </div>
            <div>
              <label className="label-md" style={{ display: 'block', marginBottom: '8px' }}>Commission Value</label>
              <input type="number" className="input-field" min="0" step="0.01" value={formData.commissionValue} onChange={(e) => setFormData({...formData, commissionValue: e.target.value})} required />
            </div>
            {formData.affiliateType === 'promo' && (
              <>
                <div>
                  <label className="label-md" style={{ display: 'block', marginBottom: '8px' }}>Discount Given to Customer</label>
                  <select className="input-field" value={formData.discountType} onChange={(e) => setFormData({...formData, discountType: e.target.value})}>
                    <option value="percentage">Percentage (%)</option>
                    <option value="fixed">Fixed Amount (EGP)</option>
                  </select>
                </div>
                <div>
                  <label className="label-md" style={{ display: 'block', marginBottom: '8px' }}>Discount Value</label>
                  <input type="number" className="input-field" min="0" step="0.01" value={formData.discountValue} onChange={(e) => setFormData({...formData, discountValue: e.target.value})} required />
                </div>
              </>
            )}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px', backgroundColor: '#f8fafc', borderRadius: '8px', marginTop: '8px' }}>
            <div>
              <h4 style={{ margin: '0 0 4px 0', fontSize: '14px', fontWeight: 600 }}>Active Status</h4>
              <p style={{ margin: 0, fontSize: '12px', color: '#64748b' }}>If inactive, the promo code cannot be used at checkout.</p>
            </div>
            <label className="toggle-switch">
              <input type="checkbox" checked={formData.isActive} onChange={(e) => setFormData({...formData, isActive: e.target.checked})} />
              <span className="toggle-slider"></span>
            </label>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '16px', marginTop: '16px' }}>
            <button type="button" className="btn btn-secondary" onClick={() => navigate('/diaradmin26/influencers')}>
              <X size={18} style={{ marginRight: '8px' }} /> Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              <Save size={18} style={{ marginRight: '8px' }} /> {id ? 'Save Changes' : 'Create Influencer'}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}
