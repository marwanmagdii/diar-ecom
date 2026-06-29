import React, { useState } from 'react';
import { useStoreConfig } from '../context/StoreConfigContext';
import { useLanguage } from '../context/LanguageContext';
import { Search, TrendingUp, DollarSign, Users, Award } from 'lucide-react';

export default function InfluencerTracker() {
  const { config } = useStoreConfig();
  const { t } = useLanguage();
  const [promoInput, setPromoInput] = useState('');
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  const handleSearch = (e) => {
    e.preventDefault();
    setError('');
    setResult(null);

    const code = promoInput.toUpperCase().trim();
    if (!code) return;

    const promos = config.promoCodes || [];
    const found = promos.find(p => p.code === code);

    if (found && found.commissionValue) {
      setResult(found);
    } else if (found && !found.commissionValue) {
      setError('This code does not have commission tracking enabled.');
    } else {
      setError('Invalid promo code. Please check and try again.');
    }
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
    <main className="container pt-4 pb-4">
      <div style={{ maxWidth: '600px', margin: '40px auto 80px', textAlign: 'center' }}>
        <Award size={48} color="var(--primary)" style={{ marginBottom: '16px' }} />
        <h1 className="headline-lg mb-2">{t('partnerPortal')}</h1>
        <p className="text-on-surface-variant mb-4">
          Enter your unique promo code to track your sales and commission in real-time.
        </p>

        <form onSubmit={handleSearch} style={{ display: 'flex', gap: '8px', marginBottom: '32px' }}>
          <input 
            type="text" 
            className="input-field" 
            placeholder="Enter your promo code..." 
            value={promoInput}
            onChange={(e) => setPromoInput(e.target.value)}
            style={{ padding: '16px', fontSize: '18px', textAlign: 'center', letterSpacing: '2px', fontWeight: 'bold' }}
          />
          <button type="submit" className="btn btn-primary" style={{ padding: '0 24px' }}>
            <Search size={24} />
          </button>
        </form>

        {error && (
          <div style={{ padding: '16px', backgroundColor: '#fee2e2', color: '#dc2626', borderRadius: '8px', fontWeight: 500 }}>
            {error}
          </div>
        )}

        {result && (
          <div className="card" style={{ textAlign: 'left', animation: 'fadeIn 0.3s ease' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', paddingBottom: '16px', borderBottom: '1px solid var(--outline-variant)' }}>
              <div>
                <h2 className="headline-md m-0" style={{ color: 'var(--primary)' }}>{result.code}</h2>
                <span style={{ fontSize: '14px', color: 'var(--on-surface-variant)' }}>
                  {result.influencerName ? `Partner: ${result.influencerName}` : 'Influencer Account'}
                </span>
              </div>
              <div style={{ padding: '6px 12px', backgroundColor: result.isActive ? '#dcfce7' : '#f1f5f9', color: result.isActive ? '#166534' : '#475569', borderRadius: '20px', fontSize: '13px', fontWeight: 'bold' }}>
                {result.isActive ? 'Active' : 'Inactive'}
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '24px' }}>
              <div style={{ backgroundColor: '#f8fafc', padding: '20px', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '16px' }}>
                <div style={{ backgroundColor: '#e2e8f0', padding: '12px', borderRadius: '50%' }}>
                  <Users size={24} color="#475569" />
                </div>
                <div>
                  <p style={{ margin: 0, fontSize: '13px', color: '#64748b', fontWeight: 600 }}>{t('totalUses')}</p>
                  <p style={{ margin: 0, fontSize: '24px', fontWeight: 'bold', color: '#0f172a' }}>{result.usageCount}</p>
                </div>
              </div>

              <div style={{ backgroundColor: '#f8fafc', padding: '20px', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '16px' }}>
                <div style={{ backgroundColor: '#e0e7ff', padding: '12px', borderRadius: '50%' }}>
                  <TrendingUp size={24} color="#4f46e5" />
                </div>
                <div>
                  <p style={{ margin: 0, fontSize: '13px', color: '#64748b', fontWeight: 600 }}>{t('salesGenerated')}</p>
                  <p style={{ margin: 0, fontSize: '24px', fontWeight: 'bold', color: '#0f172a' }}>{result.totalRevenue.toFixed(2)}</p>
                </div>
              </div>
            </div>

            <div style={{ backgroundColor: 'var(--primary-container)', padding: '24px', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '24px' }}>
              <div style={{ backgroundColor: 'white', padding: '16px', borderRadius: '50%' }}>
                <DollarSign size={32} color="var(--primary)" />
              </div>
              <div>
                <p style={{ margin: 0, fontSize: '14px', color: 'var(--on-primary-container)', fontWeight: 600 }}>{t('totalCommissionEarned')}</p>
                <p style={{ margin: 0, fontSize: '36px', fontWeight: 'bold', color: 'var(--on-primary-container)' }}>
                  {calculateCommission(result)} <span style={{ fontSize: '18px' }}>EGP</span>
                </p>
                <p style={{ margin: '4px 0 0 0', fontSize: '13px', color: 'var(--on-primary-container)', opacity: 0.8 }}>
                  Based on a {result.commissionValue}{result.commissionType === 'percentage' ? '%' : ' EGP'} commission rate.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
