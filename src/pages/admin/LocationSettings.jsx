import React, { useState, useEffect } from 'react';
import { useStoreConfig } from '../../context/StoreConfigContext';
import { useToast } from '../../context/ToastContext';
import { useLanguage } from '../../context/LanguageContext';
import { Plus, Trash2, Save, MapPin, ChevronDown, ChevronUp } from 'lucide-react';

export default function LocationSettings() {
  const { config, updateConfig, configLoading } = useStoreConfig();
  const { addToast } = useToast();
  const { t, language } = useLanguage();
  const [locations, setLocations] = useState(config.locations || []);
  const [shippingCost, setShippingCost] = useState(config.shippingCost ?? 35);
  const [shippingActive, setShippingActive] = useState(config.shippingActive ?? true);
  const [expandedGovs, setExpandedGovs] = useState({});

  // Sync local state when config loads from API
  useEffect(() => {
    if (!configLoading) {
      setLocations(config.locations || []);
      setShippingCost(config.shippingCost ?? 35);
      setShippingActive(config.shippingActive ?? true);
    }
  }, [configLoading]);

  const handleSave = () => {
    updateConfig({
      locations,
      shippingCost: Number(shippingCost),
      shippingActive
    });
    addToast('Settings updated successfully', 'success');
  };

  const addGovernorate = () => {
    const newGov = {
      id: `gov_${Date.now()}`,
      nameEn: 'New Governorate',
      nameAr: 'محافظة جديدة',
      isActive: true,
      districts: []
    };
    setLocations([...locations, newGov]);
  };

  const removeGovernorate = (govId) => {
    setLocations(locations.filter(g => g.id !== govId));
  };

  const updateGovField = (govId, field, value) => {
    setLocations(locations.map(g => g.id === govId ? { ...g, [field]: value } : g));
  };

  const addDistrict = (govId) => {
    setLocations(locations.map(g => {
      if (g.id === govId) {
        return {
          ...g,
          districts: [...(g.districts || []), { id: `dist_${Date.now()}`, nameEn: 'New District', nameAr: 'منطقة جديدة', isActive: true }]
        };
      }
      return g;
    }));
  };

  const removeDistrict = (govId, distId) => {
    setLocations(locations.map(g => {
      if (g.id === govId) {
        return {
          ...g,
          districts: g.districts.filter(d => d.id !== distId)
        };
      }
      return g;
    }));
  };

  const updateDistrictField = (govId, distId, field, value) => {
    setLocations(locations.map(g => {
      if (g.id === govId) {
        return {
          ...g,
          districts: g.districts.map(d => d.id === distId ? { ...d, [field]: value } : d)
        };
      }
      return g;
    }));
  };

  return (
    <div className="admin-page">
      {/* Header */}
      <div className="loc-header">
        <h1 className="headline-md" style={{ display: 'flex', alignItems: 'center', gap: '8px', margin: 0 }}>
          <MapPin size={24} color="var(--primary)" /> {t('locationsShipping')}
        </h1>
        <button className="btn btn-primary" onClick={handleSave} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Save size={20} /> {t('saveChanges')}
        </button>
      </div>

      {/* Shipping Config */}
      <div className="card loc-shipping-card">
        <div className="loc-shipping-header">
          <h2 className="headline-sm" style={{ margin: 0 }}>{t('shippingConfig')}</h2>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span className="loc-toggle-label" style={{ color: shippingActive ? 'var(--primary)' : 'var(--on-surface-variant)' }}>
              {shippingActive ? t('active') : t('inactive')}
            </span>
            <button 
              onClick={() => setShippingActive(!shippingActive)}
              className="loc-toggle"
              style={{ backgroundColor: shippingActive ? 'var(--primary)' : 'var(--outline)' }}
            >
              <div className="loc-toggle-knob" style={{ left: shippingActive ? '22px' : '2px' }} />
            </button>
          </div>
        </div>
        <div className="loc-cost-row" style={{ opacity: shippingActive ? 1 : 0.5, pointerEvents: shippingActive ? 'auto' : 'none' }}>
          <label style={{ fontWeight: '500', fontSize: '14px' }}>{t('flatRateShippingCost')}</label>
          <input 
            type="number" 
            className="input-field" 
            value={shippingCost} 
            onChange={e => setShippingCost(e.target.value)} 
            style={{ width: '100px' }}
          />
        </div>
      </div>

      {/* Governorates List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {locations.map((gov) => (
          <div key={gov.id} className="card loc-gov-card">
            {/* Gov Header: toggle + delete */}
            <div 
              className="loc-gov-header" 
              style={{ cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
              onClick={() => setExpandedGovs(prev => ({ ...prev, [gov.id]: !prev[gov.id] }))}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                {expandedGovs[gov.id] ? <ChevronUp size={20} color="var(--on-surface-variant)" /> : <ChevronDown size={20} color="var(--on-surface-variant)" />}
                <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '600' }}>
                  {gov.nameEn} / {gov.nameAr}
                </h3>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }} onClick={e => e.stopPropagation()}>
                <span className="loc-toggle-label" style={{ color: gov.isActive !== false ? 'var(--primary)' : 'var(--on-surface-variant)' }}>
                  {gov.isActive !== false ? t('active') : t('inactive')}
                </span>
                <button 
                  onClick={() => updateGovField(gov.id, 'isActive', gov.isActive === false ? true : false)}
                  className="loc-toggle"
                  style={{ backgroundColor: gov.isActive !== false ? 'var(--primary)' : 'var(--outline)' }}
                >
                  <div className="loc-toggle-knob" style={{ left: gov.isActive !== false ? '22px' : '2px' }} />
                </button>
                <button className="icon-btn" onClick={() => removeGovernorate(gov.id)} style={{ color: 'var(--error)', padding: '6px', marginLeft: '8px' }}>
                  <Trash2 size={18} />
                </button>
              </div>
            </div>

            {/* Collapsible Content */}
            {expandedGovs[gov.id] && (
              <>
                {/* Gov Name Inputs */}
                <div className="loc-gov-inputs">
                  <div className="loc-input-group">
                    <label className="input-label">{t('governorateEn')}</label>
                    <input 
                      type="text" 
                      className="input-field" 
                      value={gov.nameEn} 
                      onChange={e => updateGovField(gov.id, 'nameEn', e.target.value)} 
                      dir="ltr"
                    />
                  </div>
                  <div className="loc-input-group" dir="rtl">
                    <label className="input-label" style={{ textAlign: 'right' }}>{t('governorateAr')}</label>
                    <input 
                      type="text" 
                      className="input-field" 
                      value={gov.nameAr} 
                      onChange={e => updateGovField(gov.id, 'nameAr', e.target.value)} 
                      dir="rtl"
                    />
                  </div>
                </div>

                {/* Districts */}
                <div className="loc-districts-section">
                  <h3 className="loc-districts-title" style={{ textAlign: language === 'ar' ? 'right' : 'left' }}>{t('districts')}</h3>
                  <div className="loc-districts-list">
                    {(gov.districts || []).map(dist => (
                      <div key={dist.id} className="loc-district-row">
                        <div className="loc-district-inputs">
                          <input 
                            type="text" 
                            className="input-field" 
                            value={dist.nameEn} 
                            onChange={e => updateDistrictField(gov.id, dist.id, 'nameEn', e.target.value)} 
                            placeholder={t('districtEn')}
                            dir="ltr"
                          />
                          <input 
                            type="text" 
                            className="input-field" 
                            value={dist.nameAr} 
                            onChange={e => updateDistrictField(gov.id, dist.id, 'nameAr', e.target.value)} 
                            placeholder={t('districtAr')}
                            dir="rtl"
                          />
                        </div>
                        <div className="loc-district-actions">
                          <button 
                            onClick={() => updateDistrictField(gov.id, dist.id, 'isActive', dist.isActive === false ? true : false)}
                            className="loc-toggle-sm"
                            style={{ backgroundColor: dist.isActive !== false ? 'var(--primary)' : 'var(--outline)' }}
                            title={dist.isActive !== false ? t('active') : t('inactive')}
                          >
                            <div className="loc-toggle-knob-sm" style={{ left: dist.isActive !== false ? '16px' : '2px' }} />
                          </button>
                          <button className="icon-btn" onClick={() => removeDistrict(gov.id, dist.id)} style={{ padding: '4px', color: 'var(--error)' }}>
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                  <button 
                    className="btn btn-secondary loc-add-district-btn" 
                    onClick={() => addDistrict(gov.id)} 
                  >
                    <Plus size={16} /> {t('addDistrict')}
                  </button>
                </div>
              </>
            )}
          </div>
        ))}

        <button 
          className="btn btn-secondary" 
          onClick={addGovernorate} 
          style={{ display: 'flex', alignItems: 'center', gap: '8px', alignSelf: language === 'ar' ? 'flex-end' : 'flex-start', padding: '12px 24px' }}
        >
          <Plus size={20} /> {t('addGovernorate')}
        </button>
      </div>
    </div>
  );
}

