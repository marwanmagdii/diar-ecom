import React from 'react';
import { Outlet, Link } from 'react-router-dom';
import Header from '../components/Header';
import { Send } from 'lucide-react';
import BottomNav from '../components/BottomNav';
import { useStore } from '../store';
import { requestNotificationPermission } from '../firebase';
import { useEffect } from 'react';

function Footer() {
  const { t, language } = useStore();
  
  return (
    <footer className="footer-premium" style={{ padding: '32px 0 24px 0', borderTop: '1px solid var(--outline-variant)' }}>
      <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
          <Link to="/" className="logo" style={{ fontSize: '20px', display: 'flex', alignItems: 'center', gap: '8px', textDecoration: 'none', color: 'var(--on-surface)' }}>
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor" style={{ color: 'var(--primary)' }}>
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
            </svg>
            {language === 'ar' ? 'ديار' : 'Diar'}
          </Link>
          <span style={{ color: 'var(--on-surface-variant)', fontSize: '14px' }}>&copy; {new Date().getFullYear()}</span>
        </div>
        
        <div style={{ display: 'flex', gap: '24px', alignItems: 'center' }}>
          <div style={{ display: 'flex', gap: '16px' }}>
            <Link to="/page/contact" style={{ color: 'var(--on-surface-variant)', textDecoration: 'none', fontSize: '14px' }}>{t('contactUs')}</Link>
            <Link to="/help" style={{ color: 'var(--on-surface-variant)', textDecoration: 'none', fontSize: '14px' }}>{t('help')}</Link>
            <Link to="/page/returns" style={{ color: 'var(--on-surface-variant)', textDecoration: 'none', fontSize: '14px' }}>Returns</Link>
          </div>
          <div className="social-links" style={{ display: 'flex', gap: '12px' }}>
            <a href="#" aria-label="Facebook" style={{ color: 'var(--on-surface-variant)' }}>
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path></svg>
            </a>
            <a href="#" aria-label="Twitter" style={{ color: 'var(--on-surface-variant)' }}>
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"></path></svg>
            </a>
            <a href="#" aria-label="Instagram" style={{ color: 'var(--on-surface-variant)' }}>
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg>
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default function StoreLayout() {
  return (
    <>
      <Header />
      <div className="store-content" style={{ paddingBottom: '70px' }}>
        <Outlet />
      </div>
      <Footer />
      <BottomNav />
    </>
  );
}
