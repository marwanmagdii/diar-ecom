import React, { useEffect } from 'react';
import { Link, useLocation, Navigate, useNavigate } from 'react-router-dom';
import { CheckCircle } from 'lucide-react';
import { useStore } from '../store';

export default function Success() {
  const { t } = useStore();
  const location = useLocation();
  const navigate = useNavigate();
  const orderNumber = location.state?.orderId;

  useEffect(() => {
    if (orderNumber) {
      const timer = setTimeout(() => {
        navigate('/offers');
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [orderNumber, navigate]);

  // If no orderId in state, it means they navigated here directly, redirect to shop
  if (!orderNumber) {
    return <Navigate to="/shop" replace />;
  }

  return (
    <main className="container" style={{ textAlign: 'center', padding: '80px 16px' }}>
      <div style={{ display: 'inline-flex', justifyContent: 'center', alignItems: 'center', width: '80px', height: '80px', backgroundColor: 'var(--secondary-container)', color: 'var(--secondary)', borderRadius: '50%', marginBottom: '24px' }}>
        <CheckCircle size={40} />
      </div>
      <h1 className="headline-lg mb-2">{t('orderConfirmed')}</h1>
      <p className="body-lg text-on-surface-variant mb-4">
        {t('thankYouPurchase').split('#{orderId}')[0]}<strong>#{orderNumber}</strong>{t('thankYouPurchase').split('#{orderId}')[1]}
      </p>
      <div className="card" style={{ maxWidth: '400px', margin: '0 auto 32px auto', padding: '24px', backgroundColor: 'var(--surface-container-low)' }}>
        <p className="body-md mb-2">{t('emailConfirmationShort')}</p>
      </div>
      <Link to="/shop" className="btn btn-primary" style={{ padding: '12px 32px' }}>
        {t('continueShopping')}
      </Link>
    </main>
  );
}
