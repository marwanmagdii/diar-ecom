import React, { useState, useEffect } from 'react';
import { useStore } from '../store';
import { X, Cookie } from 'lucide-react';

export default function CookieConsent() {
  const [show, setShow] = useState(false);
  const { language } = useStore();

  useEffect(() => {
    // Check if user has already made a choice
    const consent = localStorage.getItem('diar_cookie_consent');
    if (!consent) {
      // Small delay to not overwhelm the user immediately on page load
      const timer = setTimeout(() => setShow(true), 1500);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem('diar_cookie_consent', 'accepted');
    // Here you would normally initialize your Facebook Pixel, Google Analytics, etc.
    console.log('Third-Party Cookies Accepted: Creating comprehensive interest profile.');
    setShow(false);
  };

  const handleDecline = () => {
    localStorage.setItem('diar_cookie_consent', 'declined');
    // Here you would disable tracking scripts
    console.log('Third-Party Cookies Declined: Essential cookies only.');
    setShow(false);
  };

  if (!show) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 p-4 md:p-6 z-[9999] pointer-events-none flex justify-center md:justify-start">
      <div 
        className="bg-white rounded-2xl shadow-2xl border border-gray-100 p-6 md:p-8 max-w-lg w-full pointer-events-auto transform transition-all translate-y-0"
        dir={language === 'ar' ? 'rtl' : 'ltr'}
      >
        <div className="flex items-start justify-between gap-4 mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center shrink-0">
              <Cookie size={20} />
            </div>
            <h3 className="text-lg font-bold text-gray-900">
              {language === 'ar' ? 'إعدادات الخصوصية' : 'Privacy Settings'}
            </h3>
          </div>
          <button 
            onClick={handleDecline} 
            className="text-gray-400 hover:text-gray-600 transition-colors p-1"
            aria-label="Close"
          >
            <X size={20} />
          </button>
        </div>

        <p className="text-sm text-gray-600 leading-relaxed mb-6">
          {language === 'ar' ? (
            <>
              نحن نستخدم ملفات تعريف الارتباط الأساسية لضمان عمل الموقع. كما نطلب إذنك لاستخدام 
              <strong className="text-gray-900"> ملفات تعريف ارتباط الطرف الثالث (Third-Party Cookies) لتكوين ملف شامل عن اهتماماتك </strong> 
              وتقديم تجربة تسوق وعروض مخصصة لك.
            </>
          ) : (
            <>
              We use essential cookies to ensure our site works. We also ask your permission to use 
              <strong className="text-gray-900"> Third-Party Cookies to create a comprehensive profile of your interests </strong> 
              and provide personalized shopping experiences.
            </>
          )}
        </p>

        <div className="flex flex-col sm:flex-row gap-3">
          <button 
            onClick={handleAccept}
            className="flex-1 bg-gray-900 hover:bg-gray-800 text-white font-semibold py-3 px-4 rounded-xl transition-colors text-sm"
          >
            {language === 'ar' ? 'موافق على الكل' : 'Accept All'}
          </button>
          <button 
            onClick={handleDecline}
            className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold py-3 px-4 rounded-xl transition-colors text-sm"
          >
            {language === 'ar' ? 'الأساسية فقط' : 'Essential Only'}
          </button>
        </div>
      </div>
    </div>
  );
}
