import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { ShoppingBag, ArrowLeft, Menu, X, Globe, Search } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useLanguage } from '../context/LanguageContext';

export default function Header() {
  const { cartCount } = useCart();
  const { language, toggleLanguage, t } = useLanguage();
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <div className="header-wrapper">
      <header className="header container">
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          {/* Back button removed per request */}

          <Link to="/" className="logo logo-dark" style={{ color: 'var(--on-surface)' }}>
            {language === 'ar' ? 'ديار' : 'Diar'}
          </Link>
        </div>
        
        <nav className="nav-links">
          <Link to="/" className={`nav-link ${location.pathname === '/' ? 'active' : ''}`}>{t('home')}</Link>
          <Link to="/shop" className={`nav-link ${location.pathname === '/shop' ? 'active' : ''}`}>{t('shop')}</Link>
          <Link to="/page/contact" className={`nav-link ${location.pathname === '/page/contact' ? 'active' : ''}`}>{t('contactUs')}</Link>
        </nav>


        
        <div className="header-actions">
          <Link to="/shop" className="btn btn-primary shop-header-btn" style={{ padding: '6px 16px', fontSize: '14px', height: '36px', borderRadius: '100px', textDecoration: 'none' }}>
            {t('shop')}
          </Link>
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
