import React, { useState, useEffect } from 'react';
import { Save, Phone, Mail, MapPin, Link as LinkIcon, MessageCircle, Globe } from 'lucide-react';
import { useStore } from '../../store';

export default function GeneralSettings() {
  const { config, updateStoreInfo, updateConfig } = useStore();
  const { language, setLanguage, t } = useStore();
  const { addToast } = useStore();

  const [storeInfo, setStoreInfo] = useState({
    email: '',
    phone: '',
    address: '',
    facebook: '',
    facebookActive: true,
    instagram: '',
    instagramActive: true,
    twitter: '',
    twitterActive: true,
    tiktok: '',
    tiktokActive: true
  });

  const [clarityProjectId, setClarityProjectId] = useState('');

  useEffect(() => {
    if (config?.storeInfo) {
      setStoreInfo({
        ...config.storeInfo,
        facebookActive: config.storeInfo.facebookActive !== false,
        instagramActive: config.storeInfo.instagramActive !== false,
        twitterActive: config.storeInfo.twitterActive !== false,
        tiktokActive: config.storeInfo.tiktokActive !== false,
      });
    }
    if (config?.clarityProjectId !== undefined) {
      setClarityProjectId(config.clarityProjectId);
    }
  }, [config]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setStoreInfo(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = () => {
    updateStoreInfo(storeInfo);
    if (updateConfig) {
      updateConfig({ clarityProjectId });
    }
    addToast(language === 'ar' ? 'تم حفظ الإعدادات بنجاح' : 'Settings saved successfully', 'success');
  };

  return (
    <div style={{ padding: '24px', maxWidth: '800px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <h1 className="headline-sm">{language === 'ar' ? 'الإعدادات العامة' : 'General Settings'}</h1>
        <button 
          onClick={handleSave}
          className="btn btn-primary"
          style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
        >
          <Save size={18} />
          {language === 'ar' ? 'حفظ التغييرات' : 'Save Changes'}
        </button>
      </div>

      <div style={{ display: 'grid', gap: '24px' }}>
        {/* System Preferences */}
        <div style={{ backgroundColor: 'var(--surface-container-lowest)', padding: '24px', borderRadius: '16px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
          <h2 className="title-md mb-4" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            {language === 'ar' ? 'تفضيلات النظام' : 'System Preferences'}
          </h2>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '16px' }}>
            <div className="form-group">
              <label style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px', fontWeight: 500 }}>
                <Globe size={16} /> {language === 'ar' ? 'لغة لوحة التحكم' : 'Dashboard Language'}
              </label>
              <button 
                className="btn" 
                onClick={() => setLanguage(language === 'en' ? 'ar' : 'en')} 
                style={{ 
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', 
                  padding: '12px', width: '100%', 
                  backgroundColor: '#f1f5f9', color: '#0f172a', border: '1px solid #e2e8f0', borderRadius: '8px', fontWeight: 600
                }}
              >
                <Globe size={18} />
                {language === 'en' ? 'Switch to Arabic (عربي)' : 'التبديل إلى الإنجليزية (English)'}
              </button>
            </div>
          </div>
        </div>

        {/* Contact Information */}
        <div style={{ backgroundColor: 'var(--surface-container-lowest)', padding: '24px', borderRadius: '16px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
          <h2 className="title-md mb-4" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            {language === 'ar' ? 'معلومات الاتصال' : 'Contact Information'}
          </h2>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '16px' }}>
            <div className="form-group">
              <label style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px', fontWeight: 500 }}>
                <Mail size={16} /> {language === 'ar' ? 'البريد الإلكتروني' : 'Email Address'}
              </label>
              <input 
                type="email" 
                name="email"
                value={storeInfo.email}
                onChange={handleChange}
                className="premium-input"
                placeholder="contact@example.com"
              />
            </div>
            <div className="form-group">
              <label style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px', fontWeight: 500 }}>
                <Phone size={16} /> {language === 'ar' ? 'رقم الهاتف' : 'Phone Number'}
              </label>
              <input 
                type="text" 
                name="phone"
                value={storeInfo.phone}
                onChange={handleChange}
                className="premium-input"
                placeholder="+20 123 456 7890"
              />
            </div>
            <div className="form-group" style={{ gridColumn: '1 / -1' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px', fontWeight: 500 }}>
                <MapPin size={16} /> {language === 'ar' ? 'العنوان' : 'Address'}
              </label>
              <textarea 
                name="address"
                value={storeInfo.address}
                onChange={handleChange}
                className="premium-input"
                placeholder={language === 'ar' ? 'عنوان المتجر...' : 'Store Address...'}
                rows={3}
              />
            </div>
          </div>
        </div>

        {/* Social Media Links */}
        <div style={{ backgroundColor: 'var(--surface-container-lowest)', padding: '24px', borderRadius: '16px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
          <h2 className="title-md mb-4" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            {language === 'ar' ? 'روابط التواصل الاجتماعي' : 'Social Media Links'}
          </h2>
          
          <div style={{ display: 'grid', gap: '16px' }}>
            {/* Facebook */}
            <div className="form-group" style={{ gridColumn: '1 / -1' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 500, margin: 0 }}>
                  <LinkIcon size={16} /> Facebook URL
                </label>
                <label className="toggle-switch">
                  <input 
                    type="checkbox" 
                    checked={storeInfo.facebookActive}
                    onChange={(e) => setStoreInfo(prev => ({ ...prev, facebookActive: e.target.checked }))}
                  />
                  <span className="toggle-slider"></span>
                </label>
              </div>
              <input 
                type="url" 
                name="facebook"
                value={storeInfo.facebook}
                onChange={handleChange}
                className="premium-input"
                placeholder="https://facebook.com/..."
                style={{ width: '100%', opacity: storeInfo.facebookActive ? 1 : 0.5 }}
                disabled={!storeInfo.facebookActive}
              />
            </div>

            {/* Instagram */}
            <div className="form-group" style={{ gridColumn: '1 / -1' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 500, margin: 0 }}>
                  <LinkIcon size={16} /> Instagram URL
                </label>
                <label className="toggle-switch">
                  <input 
                    type="checkbox" 
                    checked={storeInfo.instagramActive}
                    onChange={(e) => setStoreInfo(prev => ({ ...prev, instagramActive: e.target.checked }))}
                  />
                  <span className="toggle-slider"></span>
                </label>
              </div>
              <input 
                type="url" 
                name="instagram"
                value={storeInfo.instagram}
                onChange={handleChange}
                className="premium-input"
                placeholder="https://instagram.com/..."
                style={{ width: '100%', opacity: storeInfo.instagramActive ? 1 : 0.5 }}
                disabled={!storeInfo.instagramActive}
              />
            </div>

            {/* Twitter */}
            <div className="form-group" style={{ gridColumn: '1 / -1' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 500, margin: 0 }}>
                  <LinkIcon size={16} /> Twitter / X URL
                </label>
                <label className="toggle-switch">
                  <input 
                    type="checkbox" 
                    checked={storeInfo.twitterActive}
                    onChange={(e) => setStoreInfo(prev => ({ ...prev, twitterActive: e.target.checked }))}
                  />
                  <span className="toggle-slider"></span>
                </label>
              </div>
              <input 
                type="url" 
                name="twitter"
                value={storeInfo.twitter}
                onChange={handleChange}
                className="premium-input"
                placeholder="https://twitter.com/..."
                style={{ width: '100%', opacity: storeInfo.twitterActive ? 1 : 0.5 }}
                disabled={!storeInfo.twitterActive}
              />
            </div>

            {/* TikTok */}
            <div className="form-group" style={{ gridColumn: '1 / -1' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 500, margin: 0 }}>
                  <MessageCircle size={16} /> TikTok URL
                </label>
                <label className="toggle-switch">
                  <input 
                    type="checkbox" 
                    checked={storeInfo.tiktokActive}
                    onChange={(e) => setStoreInfo(prev => ({ ...prev, tiktokActive: e.target.checked }))}
                  />
                  <span className="toggle-slider"></span>
                </label>
              </div>
              <input 
                type="url" 
                name="tiktok"
                value={storeInfo.tiktok}
                onChange={handleChange}
                className="premium-input"
                placeholder="https://tiktok.com/@..."
                style={{ width: '100%', opacity: storeInfo.tiktokActive ? 1 : 0.5 }}
                disabled={!storeInfo.tiktokActive}
              />
            </div>
          </div>
        </div>

        {/* Analytics & Tracking */}
        <div style={{ backgroundColor: 'var(--surface-container-lowest)', padding: '24px', borderRadius: '16px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
          <h2 className="title-md mb-4" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            {language === 'ar' ? 'التحليلات والتتبع' : 'Analytics & Tracking'}
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '16px' }}>
            <div className="form-group" style={{ gridColumn: '1 / -1' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px', fontWeight: 500 }}>
                Microsoft Clarity Project ID
              </label>
              <input 
                type="text" 
                value={clarityProjectId}
                onChange={(e) => setClarityProjectId(e.target.value)}
                className="premium-input"
                placeholder="e.g. 5x8a2b9..."
              />
              <p style={{ fontSize: '12px', color: '#64748b', marginTop: '8px' }}>
                {language === 'ar' ? 'ضع معرف المشروع لتفعيل الخريطة الحرارية وتسجيلات الجلسات' : 'Enter your project ID to enable heatmaps and session recordings'}
              </p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
