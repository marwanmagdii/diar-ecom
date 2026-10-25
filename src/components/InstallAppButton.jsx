import React, { useState, useEffect } from 'react';
import { Download, MonitorSmartphone } from 'lucide-react';
import { useStore } from '../store';

export default function InstallAppButton({ className = '', style = {} }) {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const { language } = useStore();

  useEffect(() => {
    const handler = (e) => {
      // Prevent the mini-infobar from appearing on mobile
      e.preventDefault();
      // Stash the event so it can be triggered later.
      setDeferredPrompt(e);
    };

    window.addEventListener('beforeinstallprompt', handler);

    return () => {
      window.removeEventListener('beforeinstallprompt', handler);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    
    // Show the install prompt
    deferredPrompt.prompt();
    
    // Wait for the user to respond to the prompt
    const { outcome } = await deferredPrompt.userChoice;
    
    if (outcome === 'accepted') {
      console.log('User accepted the install prompt');
    } else {
      console.log('User dismissed the install prompt');
    }
    
    // We've used the prompt, and can't use it again, throw it away
    setDeferredPrompt(null);
  };

  // If the prompt isn't available, don't show the button
  if (!deferredPrompt) return null;

  return (
    <button 
      onClick={handleInstallClick}
      className={`btn btn-secondary ${className}`}
      style={{ 
        display: 'flex', 
        alignItems: 'center', 
        gap: '8px', 
        padding: '8px 16px',
        borderRadius: '100px',
        ...style 
      }}
    >
      <MonitorSmartphone size={18} />
      {language === 'ar' ? 'تثبيت التطبيق' : 'Install App'}
    </button>
  );
}
