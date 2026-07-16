import React, { useState, useEffect } from 'react';
import { BarChart2, DollarSign, Plus, Trash2 } from 'lucide-react';
import { useStore } from '../../store';

export default function ProfitCalculator() {
  const { lang } = useStore();
  const isAr = lang === 'ar';
  const [costPrice, setCostPrice] = useState('');
  const [regularPrice, setRegularPrice] = useState('');
  
  const [customProfiles, setCustomProfiles] = useState([]);
  const [profileName, setProfileName] = useState('');
  const [customValue, setCustomValue] = useState('');
  const [customType, setCustomType] = useState('percentage');

  // Recalculate regularPrice whenever costPrice or customProfiles change
  useEffect(() => {
    if (customProfiles.length > 0 && costPrice) {
      const cost = parseFloat(costPrice) || 0;
      let addedAmount = 0;
      customProfiles.forEach(p => {
        if (p.type === 'fixed') {
          addedAmount += p.value;
        } else if (p.type === 'percentage') {
          addedAmount += (cost * (p.value / 100));
        }
      });
      setRegularPrice((cost + addedAmount).toFixed(2));
    }
  }, [costPrice, customProfiles]);

  const calculateMargin = () => {
    if (!costPrice || !regularPrice) return null;
    const cost = parseFloat(costPrice);
    const price = parseFloat(regularPrice);
    if (cost === 0) return 100;
    return ((price - cost) / cost * 100).toFixed(1);
  };

  const calculateNetProfit = () => {
    if (!costPrice || !regularPrice) return null;
    return (parseFloat(regularPrice) - parseFloat(costPrice)).toFixed(2);
  };

  const margin = calculateMargin();
  const netProfit = calculateNetProfit();

  const handleAddProfile = () => {
    if (!profileName || !customValue) return;
    const newProfile = {
      id: Date.now(),
      name: profileName,
      type: customType,
      value: parseFloat(customValue)
    };
    setCustomProfiles([...customProfiles, newProfile]);
    setProfileName('');
    setCustomValue('');
  };

  const removeProfile = (id) => {
    const updatedProfiles = customProfiles.filter(p => p.id !== id);
    setCustomProfiles(updatedProfiles);
    if (updatedProfiles.length === 0) {
      setRegularPrice('');
    }
  };

  return (
    <div style={{ width: '100%', paddingBottom: '40px', direction: isAr ? 'rtl' : 'ltr' }}>
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ fontSize: '28px', fontWeight: 800, margin: '0 0 8px 0', color: '#0f172a', display: 'flex', alignItems: 'center', gap: '12px' }}>
          <BarChart2 size={32} color="var(--primary)" /> {isAr ? 'حاسبة الأرباح والتكاليف' : 'Profit & Cost Calculator'}
        </h1>
        <p style={{ margin: 0, color: '#64748b', fontSize: '15px' }}>
          {isAr ? 'قم ببناء السعر النهائي عن طريق إضافة تكاليف وهوامش ربح متعددة.' : 'Build your final price by adding multiple costs and profit margins.'}
        </p>
      </div>

      <div className="premium-card" style={{ marginBottom: '24px' }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '24px', alignItems: 'flex-start', marginBottom: '32px' }}>
          <div style={{ flex: '1 1 300px' }}>
            <label className="premium-label">{isAr ? 'سعر التكلفة الأساسي (ج.م)' : 'Base Cost Price (EGP)'}</label>
            <div style={{ position: 'relative' }}>
              <span style={{ position: 'absolute', left: isAr ? 'auto' : '16px', right: isAr ? '16px' : 'auto', top: '50%', transform: 'translateY(-50%)', color: '#64748b' }}>
                <DollarSign size={18} />
              </span>
              <input 
                type="number" 
                step="0.01" 
                className="premium-input" 
                style={{ paddingLeft: isAr ? '16px' : '44px', paddingRight: isAr ? '44px' : '16px', fontSize: '18px', fontWeight: 600 }}
                value={costPrice} 
                onChange={e => setCostPrice(e.target.value)} 
                placeholder="0.00" 
              />
            </div>
            <p style={{ margin: '8px 0 0', fontSize: '13px', color: '#64748b' }}>
              {isAr ? 'التكلفة الأصلية للمنتج قبل أي إضافات' : 'Original base cost before additions'}
            </p>
          </div>
          <div style={{ flex: '1 1 300px' }}>
            <label className="premium-label">{isAr ? 'سعر البيع النهائي (ج.م)' : 'Final Selling Price (EGP)'}</label>
            <div style={{ position: 'relative' }}>
              <span style={{ position: 'absolute', left: isAr ? 'auto' : '16px', right: isAr ? '16px' : 'auto', top: '50%', transform: 'translateY(-50%)', color: '#64748b' }}>
                <DollarSign size={18} />
              </span>
              <input 
                type="number" 
                step="0.01" 
                className="premium-input" 
                style={{ paddingLeft: isAr ? '16px' : '44px', paddingRight: isAr ? '44px' : '16px', fontSize: '18px', fontWeight: 600, backgroundColor: customProfiles.length > 0 ? '#f8fafc' : '#ffffff' }}
                value={regularPrice} 
                onChange={e => {
                  setRegularPrice(e.target.value);
                  if (customProfiles.length > 0) setCustomProfiles([]); // clear profiles if they manually override
                }} 
                placeholder="0.00" 
              />
            </div>
            {customProfiles.length > 0 && (
              <p style={{ margin: '8px 0 0', fontSize: '13px', color: 'var(--primary)', fontWeight: 500 }}>
                {isAr ? 'تم حسابه تلقائياً بناءً على الإضافات.' : 'Calculated automatically from your additions.'}
              </p>
            )}
          </div>
        </div>

        {/* Profile Builder */}
        <div style={{ marginBottom: '32px' }}>
          <h4 style={{ fontSize: '16px', fontWeight: 600, margin: '0 0 16px 0', color: '#0f172a' }}>{isAr ? 'إضافة تكاليف وهوامش' : 'Add Costs & Margins'}</h4>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', alignItems: 'center' }}>
            <input 
              type="text" 
              className="premium-input" 
              placeholder={isAr ? 'اسم الإضافة (مثال: شحن, إعلانات)...' : 'Name (e.g., Shipping, Ads)...'}
              value={profileName}
              onChange={(e) => setProfileName(e.target.value)}
              disabled={!costPrice}
              style={{ flex: '2 1 200px' }}
            />
            
            <select 
              className="premium-input" 
              style={{ flex: '1 1 120px', cursor: costPrice ? 'pointer' : 'not-allowed' }}
              value={customType}
              onChange={(e) => setCustomType(e.target.value)}
              disabled={!costPrice}
            >
              <option value="percentage">{isAr ? '% (نسبة من التكلفة)' : '% (Percentage of Cost)'}</option>
              <option value="fixed">{isAr ? 'ج.م (مبلغ ثابت)' : 'EGP (Fixed Amount)'}</option>
            </select>
            
            <input 
              type="number" 
              className="premium-input" 
              placeholder={isAr ? 'القيمة...' : 'Value...'}
              value={customValue}
              onChange={(e) => setCustomValue(e.target.value)}
              disabled={!costPrice}
              style={{ flex: '1 1 100px' }}
            />
            
            <button 
              type="button" 
              className="btn" 
              disabled={!costPrice || !profileName || !customValue}
              onClick={handleAddProfile}
              style={{ padding: '0 24px', borderRadius: '8px', opacity: (!costPrice || !profileName || !customValue) ? 0.5 : 1, display: 'flex', alignItems: 'center', gap: '6px', height: '44px', cursor: (!costPrice || !profileName || !customValue) ? 'not-allowed' : 'pointer' }}
            >
              <Plus size={18} /> {isAr ? 'إضافة' : 'Add'}
            </button>
          </div>

          {customProfiles.length > 0 && (
            <div style={{ marginTop: '24px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {customProfiles.map(profile => (
                <div key={profile.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 16px', backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <span style={{ fontWeight: 600, color: '#334155' }}>{profile.name}</span>
                    <span style={{ backgroundColor: '#e2e8f0', color: '#475569', padding: '2px 8px', borderRadius: '16px', fontSize: '12px', fontWeight: 500 }}>
                      {profile.type === 'percentage' ? `${profile.value}%` : `${profile.value} EGP`}
                    </span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <span style={{ fontWeight: 700, color: '#0f172a' }}>
                      +{profile.type === 'percentage' ? ((parseFloat(costPrice) * profile.value) / 100).toFixed(2) : parseFloat(profile.value).toFixed(2)} EGP
                    </span>
                    <button 
                      onClick={() => removeProfile(profile.id)}
                      style={{ background: 'transparent', border: 'none', color: '#ef4444', cursor: 'pointer', display: 'flex', alignItems: 'center', padding: '4px' }}
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {costPrice && regularPrice && (
          <div style={{ backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '24px', textAlign: 'center' }}>
            <h3 style={{ margin: '0 0 16px 0', fontSize: '16px', color: '#475569', fontWeight: 600 }}>{isAr ? 'الملخص النهائي' : 'Final Summary'}</h3>
            
            <div style={{ display: 'flex', justifyContent: 'center', gap: '32px', flexWrap: 'wrap' }}>
              <div>
                <p style={{ margin: '0 0 8px 0', fontSize: '14px', color: '#64748b' }}>{isAr ? 'هامش الربح الإجمالي' : 'Total Profit Margin'}</p>
                <div style={{ fontSize: '32px', fontWeight: 800, color: margin > 0 ? '#16a34a' : '#ef4444' }}>
                  {margin > 0 ? '+' : ''}{margin}%
                </div>
              </div>
              
              <div style={{ width: '1px', backgroundColor: '#e2e8f0' }}></div>
              
              <div>
                <p style={{ margin: '0 0 8px 0', fontSize: '14px', color: '#64748b' }}>{isAr ? 'إجمالي الإضافات/الربح' : 'Total Additions/Profit'}</p>
                <div style={{ fontSize: '32px', fontWeight: 800, color: '#0f172a' }}>
                  {netProfit} EGP
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
