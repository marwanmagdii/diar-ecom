import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { ShoppingBag, ArrowLeft, Menu, X, Globe, Search } from 'lucide-react';
import { useStore } from '../store';

export default function Header() {
  const { cartCount, products } = useStore();
  const { language, toggleLanguage, t } = useStore();
  const location = useLocation();
  const navigate = useNavigate();

  const hasOffers = products?.some(p => p.isActive !== false && (p.hasOffer || p.offerPrice > 0 || p.oldPrice > 0));

  return (
    <div className="header-wrapper">
      <header className="header container">
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          {/* Back button removed per request */}

          <Link to="/" className="logo" style={{ display: 'flex', alignItems: 'center' }}>
            <img src="/logo.png" alt="Diar" style={{ height: '40px', width: 'auto' }} />
          </Link>
        </div>
        
        <nav className="nav-links">
          {hasOffers && <Link to="/" className={`nav-link ${location.pathname === '/' ? 'active' : ''}`}>{t('home')}</Link>}
          <Link to="/shop" className={`nav-link ${location.pathname === '/shop' ? 'active' : ''}`}>{t('shop')}</Link>
          <Link to="/page/contact" className={`nav-link ${location.pathname === '/page/contact' ? 'active' : ''}`}>{t('contactUs')}</Link>
        </nav>


        
        <div className="header-actions">

          <button onClick={toggleLanguage} className="icon-btn lang-btn" aria-label="Toggle Language" style={{ display: 'flex', alignItems: 'center', gap: '4px', width: 'auto', padding: '0 12px', fontSize: '14px', fontWeight: 600, color: 'var(--on-surface)' }}>
            <Globe size={20} />
            <span className="lang-text">{language === 'en' ? 'عربي' : 'EN'}</span>
          </button>
          <Link to="/cart" className="icon-btn" aria-label={t('cart')} style={{ position: 'relative', color: 'var(--on-surface)' }} onClick={() => window.scrollTo(0, 0)}>
            <ShoppingBag size={24} color="currentColor" />
            {cartCount > 0 && (
              <span style={{
                position: 'absolute',
                top: 2,
                right: 2,
                backgroundColor: 'var(--error)',
                color: 'white',
                fontSize: '10px',
                fontWeight: 'bold',
                width: '16px',
                height: '16px',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                {cartCount}
              </span>
            )}
          </Link>
        </div>
      </header>
    </div>
  );
}
