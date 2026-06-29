import React from 'react';
import { useLocation } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { Phone, Mail, MapPin } from 'lucide-react';

export default function ContentPage() {
  const location = useLocation();
  const { language } = useLanguage();
  const isContact = location.pathname.includes('contact');
  const title = isContact ? (language === 'ar' ? 'اتصل بنا' : 'Contact Us') : location.pathname.split('/').pop().replace(/-/g, ' ').toUpperCase();

  if (isContact) {
    return (
      <main className="container pt-4 pb-4" dir={language === 'ar' ? 'rtl' : 'ltr'}>
        <h1 className="headline-lg mb-4 text-center">{title}</h1>
        <p className="text-center text-on-surface-variant mb-4">
          {language === 'ar' ? 'يسعدنا تواصلك معنا. يمكنك الوصول إلينا عبر أي من القنوات التالية.' : "We'd love to hear from you. Reach out to us through any of the channels below."}
        </p>
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px', maxWidth: '900px', margin: '0 auto' }}>
          
          {/* Direct Contact */}
          <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '16px', backgroundColor: '#ffffff', border: '1px solid var(--outline-variant)' }}>
            <h3 style={{ fontSize: '18px', fontWeight: 600, borderBottom: '1px solid var(--outline-variant)', paddingBottom: '12px' }}>
              {language === 'ar' ? 'التواصل المباشر' : 'Direct Contact'}
            </h3>
            <a href="tel:+1234567890" style={{ display: 'flex', alignItems: 'center', gap: '12px', textDecoration: 'none', color: 'var(--on-surface)' }}>
              <div style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: '#e0e7ff', color: '#4f46e5', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Phone size={20} />
              </div>
              <span style={{ fontWeight: 500 }} dir="ltr">+123 456 7890</span>
            </a>
          </div>

          {/* Social Media */}
          <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '16px', backgroundColor: '#ffffff', border: '1px solid var(--outline-variant)' }}>
            <h3 style={{ fontSize: '18px', fontWeight: 600, borderBottom: '1px solid var(--outline-variant)', paddingBottom: '12px' }}>
              {language === 'ar' ? 'التواصل الاجتماعي والمراسلة' : 'Social & Messaging'}
            </h3>
            
            <a href="#" style={{ display: 'flex', alignItems: 'center', gap: '12px', textDecoration: 'none', color: 'var(--on-surface)' }}>
              <div style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: '#25D366', color: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path></svg>
              </div>
              <span style={{ fontWeight: 500 }}>WhatsApp</span>
            </a>
            
            <a href="#" style={{ display: 'flex', alignItems: 'center', gap: '12px', textDecoration: 'none', color: 'var(--on-surface)' }}>
              <div style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: '#0088cc', color: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21.2 4.4L18.8 20c-.2 1-.8 1.2-1.7.7l-4.7-3.5-2.3 2.2c-.2.2-.5.5-.9.5l.3-4.8 8.7-7.9c.4-.3-.1-.5-.6-.2l-10.8 6.8-4.6-1.5c-1-.3-1-.1.2-.6l18-7c.8-.3 1.5.2 1.3 1.2z"></path></svg>
              </div>
              <span style={{ fontWeight: 500 }}>Telegram</span>
            </a>

            <a href="#" style={{ display: 'flex', alignItems: 'center', gap: '12px', textDecoration: 'none', color: 'var(--on-surface)' }}>
              <div style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: '#1877F2', color: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path></svg>
              </div>
              <span style={{ fontWeight: 500 }}>Facebook</span>
            </a>
            
            <a href="#" style={{ display: 'flex', alignItems: 'center', gap: '12px', textDecoration: 'none', color: 'var(--on-surface)' }}>
              <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'linear-gradient(45deg, #f09433 0%, #e6683c 25%, #dc2743 50%, #cc2366 75%, #bc1888 100%)', color: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg>
              </div>
              <span style={{ fontWeight: 500 }}>Instagram</span>
            </a>

            <a href="#" style={{ display: 'flex', alignItems: 'center', gap: '12px', textDecoration: 'none', color: 'var(--on-surface)' }}>
              <div style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: '#000000', color: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 12a4 4 0 1 0 4 4V4a5 5 0 0 0 5 5"></path></svg>
              </div>
              <span style={{ fontWeight: 500 }}>TikTok</span>
            </a>
          </div>

        </div>
      </main>
    );
  }

  return (
    <main className="container pt-4 pb-4">
      <h1 className="headline-lg mb-4">{title}</h1>
      <div className="card text-on-surface-variant">
        <p className="mb-3">
          This is a placeholder content page for <strong>{title}</strong>. 
          In a production environment, this would contain the actual legal or informational text.
        </p>
        <p>
          {language === 'ar' ? 'ديار' : 'Diar'} is dedicated to providing the best products for your home and baby. 
          We value your privacy, safety, and satisfaction above all else.
        </p>
      </div>
    </main>
  );
}
