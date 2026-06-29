import React, { useState, useEffect } from 'react';
import { useStoreConfig } from '../../context/StoreConfigContext';
import { useLanguage } from '../../context/LanguageContext';
import { Save, Phone, Mail, MapPin, Link as LinkIcon, MessageCircle } from 'lucide-react';
import { useToast } from '../../context/ToastContext';

export default function GeneralSettings() {
  const { config, updateStoreInfo, updateConfig } = useStoreConfig();
  const { language, t } = useLanguage();
  const { addToast } = useToast();

  const [storeInfo, setStoreInfo] = useState({
    email: '',
    phone: '',
    address: '',
    facebook: '',
    instagram: '',
    twitter: '',
    tiktok: ''
  });

  const [clarityProjectId, setClarityProjectId] = useState('');

  useEffect(() => {
    if (config?.storeInfo) {
      setStoreInfo(config.storeInfo);
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
            <div className="form-group">
              <label style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px', fontWeight: 500 }}>
                <LinkIcon size={16} /> Facebook URL
              </label>
              <input 
                type="url" 
                name="facebook"
                value={storeInfo.facebook}
                onChange={handleChange}
                className="premium-input"
                placeholder="https://facebook.com/..."
              />
            </div>
            <div className="form-group">
              <label style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px', fontWeight: 500 }}>
                <LinkIcon size={16} /> Instagram URL
              </label>
              <input 
                type="url" 
                name="instagram"
                value={storeInfo.instagram}
                onChange={handleChange}
                className="premium-input"
                placeholder="https://instagram.com/..."
              />
            </div>
            <div className="form-group">
              <label style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px', fontWeight: 500 }}>
                <LinkIcon size={16} /> Twitter / X URL
              </label>
              <input 
                type="url" 
                name="twitter"
                value={storeInfo.twitter}
                onChange={handleChange}
                className="premium-input"
                placeholder="https://twitter.com/..."
              />
            </div>
            <div className="form-group">
              <label style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px', fontWeight: 500 }}>
                <MessageCircle size={16} /> TikTok URL
              </label>
              <input 
                type="url" 
                name="tiktok"
                value={storeInfo.tiktok}
                onChange={handleChange}
                className="premium-input"
                placeholder="https://tiktok.com/@..."
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
