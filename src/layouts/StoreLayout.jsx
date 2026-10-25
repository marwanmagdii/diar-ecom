import React, { useState, useEffect } from 'react';
import { Outlet, Link } from 'react-router-dom';
import Header from '../components/Header';
import { Send, X, Download } from 'lucide-react';
import BottomNav from '../components/BottomNav';
import { useStore } from '../store';
import { requestNotificationPermission } from '../firebase';
import InstallAppButton from '../components/InstallAppButton';

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
          <InstallAppButton />

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
  const { language } = useStore();
  const [showPwaBanner, setShowPwaBanner] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState(null);

  useEffect(() => {
    const handler = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };
    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  useEffect(() => {
    // Affiliate Tracking: Capture ?ref= or ?aff= from URL
    const searchParams = new URLSearchParams(window.location.search);
    const refCode = searchParams.get('ref') || searchParams.get('aff');
    if (refCode) {
      const trackingData = {
        code: refCode.toUpperCase().trim(),
        timestamp: Date.now()
      };
      localStorage.setItem('diar_affiliate_tracking', JSON.stringify(trackingData));
    }

    const triggerPwaPrompt = () => {
      // Don't show if they've dismissed it before in this session, or delay it
      setTimeout(() => setShowPwaBanner(true), 1500);
    };

    // Automatically trigger or refresh the native browser notification prompt
    if ('Notification' in window && (Notification.permission === 'default' || Notification.permission === 'granted')) {
      requestNotificationPermission().then(token => {
        if (token) {
          localStorage.setItem('fcm_token', token);
          // Send to backend immediately for anonymous visitors
          fetch('/api/subscribe', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ token })
          }).catch(console.error);
        }
      }).finally(() => {
        triggerPwaPrompt();
      });
    } else {
      triggerPwaPrompt();
    }
  }, []);

  const handleInstallPwa = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      console.log('User accepted the install prompt');
    }
    setDeferredPrompt(null);
    setShowPwaBanner(false);
  };

  return (
    <>
      <Header />
      {/* paddingBottom controlled exclusively by CSS (.mobile-bottom-nav media query) — not inline */}
      <div className="store-content">
        <Outlet />
      </div>
      <Footer />
      <BottomNav />

      {/* Global PWA Install Banner */}
      {showPwaBanner && deferredPrompt && (
        <div style={{
          position: 'fixed',
          bottom: '80px', /* Above bottom nav */
          left: '16px',
          right: '16px',
          background: 'var(--surface-container-high)',
          border: '1px solid var(--outline-variant)',
          borderRadius: '16px',
          padding: '16px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '16px',
          boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
          zIndex: 999,
          animation: 'slideUpBottomSheet 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1 }}>
            <div style={{ background: 'var(--primary-container)', color: 'var(--on-primary-container)', padding: '10px', borderRadius: '12px' }}>
              <Download size={24} />
            </div>
            <div>
              <h4 style={{ margin: '0 0 4px 0', fontSize: '15px' }}>
                {language === 'ar' ? 'تثبيت تطبيق ديار' : 'Install Diar App'}
              </h4>
              <p style={{ margin: 0, fontSize: '13px', color: 'var(--on-surface-variant)' }}>
                {language === 'ar' ? 'أضف المتجر لشاشتك الرئيسية لتجربة أسرع' : 'Add to home screen for a faster experience'}
              </p>
            </div>
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button 
              onClick={() => setShowPwaBanner(false)}
              className="icon-btn"
              style={{ background: 'none', border: 'none', padding: '8px', color: 'var(--on-surface-variant)' }}
            >
              <X size={20} />
            </button>
            <button 
              onClick={handleInstallPwa}
              className="btn btn-primary"
              style={{ padding: '8px 16px', fontSize: '14px', borderRadius: '8px' }}
            >
              {language === 'ar' ? 'تثبيت' : 'Install'}
            </button>
          </div>
        </div>
      )}
    </>
  );
}
