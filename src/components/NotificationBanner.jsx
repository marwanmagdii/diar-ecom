import React, { useState, useEffect } from 'react';
import { useStore } from '../store';
import { Bell, X } from 'lucide-react';
import { requestNotificationPermission } from '../firebase';

const NotificationBanner = () => {
  const language = useStore(state => state.language);
  const [showBanner, setShowBanner] = useState(false);

  useEffect(() => {
    // Only show if we haven't asked before and permissions aren't already granted/denied
    const askedBefore = localStorage.getItem('diar_notification_asked');
    if (!askedBefore && 'Notification' in window && Notification.permission === 'default') {
      // Delay showing the banner so it's not overwhelming on first load
      const timer = setTimeout(() => {
        setShowBanner(true);
      }, 5000);
      return () => clearTimeout(timer);
    } else if (Notification.permission === 'granted') {
      // Background silent request to ensure token is active
      requestNotificationPermission().then(token => {
        if (token) {
          localStorage.setItem('fcm_token', token);
        }
      });
    }
  }, []);

  const handleAllow = async () => {
    setShowBanner(false);
    localStorage.setItem('diar_notification_asked', 'true');
    const token = await requestNotificationPermission();
    if (token) {
      localStorage.setItem('fcm_token', token);
      // Optional: you could sync this token to your user tracking data here
    }
  };

  const handleDismiss = () => {
    setShowBanner(false);
    localStorage.setItem('diar_notification_asked', 'true');
  };

  if (!showBanner) return null;

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 9999,
      padding: '24px'
    }}>
      <div style={{
        width: '100%',
        maxWidth: '400px',
        backgroundColor: '#ffffff',
        borderRadius: '16px',
        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
        padding: '24px',
        display: 'flex',
        flexDirection: 'column',
        gap: '16px',
        direction: language === 'ar' ? 'rtl' : 'ltr'
      }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{ backgroundColor: 'rgba(235, 93, 80, 0.1)', padding: '12px', borderRadius: '50%', color: 'var(--primary)' }}>
              <Bell size={24} />
            </div>
            <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 700, color: 'var(--on-surface)' }}>
              {language === 'ar' ? 'تفعيل الإشعارات' : 'Enable Notifications'}
            </h3>
          </div>
        </div>
      
      <p style={{ margin: 0, fontSize: '14px', color: 'var(--on-surface-variant)', lineHeight: 1.5 }}>
        {language === 'ar' 
          ? 'احصل على إشعارات بالعروض الحصرية والتخفيضات الفورية مباشرة على جهازك!' 
          : 'Get notified about exclusive flash sales and instant discounts right on your device!'}
      </p>
      
        <div style={{ display: 'flex', gap: '12px', marginTop: '8px' }}>
          <button 
            onClick={handleAllow}
            style={{ flex: 1, backgroundColor: 'var(--primary)', color: 'white', border: 'none', borderRadius: '8px', padding: '12px', fontSize: '14px', fontWeight: 600, cursor: 'pointer', transition: 'background-color 0.2s' }}
          >
            {language === 'ar' ? 'تفعيل الآن' : 'Allow Now'}
          </button>
          <button 
            onClick={handleDismiss}
            style={{ flex: 1, backgroundColor: '#f1f5f9', color: '#475569', border: 'none', borderRadius: '8px', padding: '12px', fontSize: '14px', fontWeight: 600, cursor: 'pointer', transition: 'background-color 0.2s' }}
          >
            {language === 'ar' ? 'ليس الآن' : 'Not Now'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default NotificationBanner;
