import React, { useState, useRef } from 'react';
import { useStoreConfig } from '../../context/StoreConfigContext';
import { useToast } from '../../context/ToastContext';
import { UploadCloud, X, Save } from 'lucide-react';

export default function ReviewSettings() {
  const { config, updateConfig } = useStoreConfig();
  const { addToast } = useToast();
  const fileInputRef = useRef(null);

  const [reviewImages, setReviewImages] = useState(config.globalReviewImages || []);
  const [isDragging, setIsDragging] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const files = Array.from(e.dataTransfer.files || []);
    const imageFiles = files.filter(f => f.type.startsWith('image/'));
    imageFiles.forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setReviewImages(prev => [...prev, reader.result]);
      };
      reader.readAsDataURL(file);
    });
  };

  const handleFileInput = (e) => {
    const files = Array.from(e.target.files || []);
    files.forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setReviewImages(prev => [...prev, reader.result]);
      };
      reader.readAsDataURL(file);
    });
  };

  const removeImage = (index) => {
    setReviewImages(prev => prev.filter((_, i) => i !== index));
  };

  const handleSave = async () => {
    setIsSaving(true);
    const success = await updateConfig({ globalReviewImages: reviewImages });
    if (success) {
      addToast('Global reviews saved successfully!', 'success');
    } else {
      addToast('Failed to save reviews', 'error');
    }
    setIsSaving(false);
  };

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h2 className="headline-md m-0">Global Store Reviews</h2>
          <p style={{ color: '#64748b', fontSize: '14px', margin: '4px 0 0 0' }}>Upload screenshots of happy customer reviews to display on your homepage.</p>
        </div>
        <button 
          className="btn" 
          onClick={handleSave} 
          disabled={isSaving}
          style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
        >
          <Save size={18} /> {isSaving ? 'Saving...' : 'Save Reviews'}
        </button>
      </div>

      <div className="card" style={{ padding: '32px' }}>
        <h3 style={{ fontSize: '18px', fontWeight: 600, margin: '0 0 24px 0', color: '#0f172a' }}>Customer Feedback Screenshots</h3>
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: '16px' }}>
          {reviewImages.map((img, index) => (
            <div key={index} style={{ position: 'relative', aspectRatio: '1', borderRadius: '12px', overflow: 'hidden', border: '1px solid #e2e8f0', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
              <img src={img} alt={`Review ${index}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              <button type="button" className="icon-btn" onClick={(e) => { e.stopPropagation(); removeImage(index); }} style={{ position: 'absolute', top: '8px', right: '8px', backgroundColor: '#ffffff', boxShadow: '0 2px 4px rgba(0,0,0,0.1)', padding: '4px', minWidth: 'auto', minHeight: 'auto' }}>
                <X size={14} color="#dc2626" />
              </button>
            </div>
          ))}
          
          <div 
            className={`premium-dropzone ${isDragging ? 'dragging' : ''}`}
            style={{ aspectRatio: '1' }}
            onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
          >
            <input 
              type="file" 
              accept="image/*" 
              multiple 
              hidden 
              ref={fileInputRef}
              onChange={handleFileInput} 
            />
            <UploadCloud size={24} color={isDragging ? 'var(--primary)' : '#94a3b8'} style={{ marginBottom: '8px' }} />
            <div style={{ fontSize: '13px', fontWeight: 500, color: '#334155' }}>Upload Screenshot</div>
          </div>
        </div>
      </div>
    </div>
  );
}
