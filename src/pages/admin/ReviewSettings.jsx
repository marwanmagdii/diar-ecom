import React, { useState, useRef } from 'react';
import { UploadCloud, X, Save, Crop, Trash2 } from 'lucide-react';
import { useStore } from '../../store';
import ImageLightbox from '../../components/ImageLightbox';
import ImageCropperModal from '../../components/ImageCropperModal';
import { compressImage } from '../../utils/imageCompression';

export default function ReviewSettings() {
  const { config, updateConfig } = useStore();
  const { addToast } = useStore();
  const fileInputRef = useRef(null);

  const [reviewImages, setReviewImages] = useState(config.globalReviewImages || []);
  const [isDragging, setIsDragging] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  
  const [draggedImageIndex, setDraggedImageIndex] = useState(null);
  const [lightboxData, setLightboxData] = useState({ isOpen: false, images: [], currentIndex: 0 });
  const [cropperData, setCropperData] = useState({ isOpen: false, index: null, imageSrc: null });

  const handleDrop = async (e) => {
    e.preventDefault();
    setIsDragging(false);
    const files = Array.from(e.dataTransfer.files || []);
    const imageFiles = files.filter(f => f.type.startsWith('image/'));
    for (const file of imageFiles) {
      try {
        const compressedBase64 = await compressImage(file);
        setReviewImages(prev => [...prev, compressedBase64]);
      } catch (err) {
        console.error('Error compressing image:', err);
      }
    }
  };

  const handleFileInput = async (e) => {
    const files = Array.from(e.target.files || []);
    for (const file of files) {
      try {
        const compressedBase64 = await compressImage(file);
        setReviewImages(prev => [...prev, compressedBase64]);
      } catch (err) {
        console.error('Error compressing image:', err);
      }
    }
  };

  const removeImage = (index) => {
    setReviewImages(prev => prev.filter((_, i) => i !== index));
  };

  const handleSave = () => {
    setIsSaving(true);
    updateConfig({ globalReviewImages: reviewImages });
    addToast('Global reviews saved successfully!', 'success');
    setIsSaving(false);
  };

  // Reordering Logic
  const handleImageDragStart = (e, index) => {
    setDraggedImageIndex(index);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleImageDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleImageDropReorder = (e, dropIndex) => {
    e.preventDefault();
    if (draggedImageIndex === null || draggedImageIndex === dropIndex) return;
    
    const newImages = [...reviewImages];
    const draggedImg = newImages[draggedImageIndex];
    newImages.splice(draggedImageIndex, 1);
    newImages.splice(dropIndex, 0, draggedImg);
    
    setReviewImages(newImages);
    setDraggedImageIndex(null);
  };

  const openLightbox = (index) => {
    setLightboxData({ isOpen: true, images: reviewImages, currentIndex: index });
  };

  const handleLightboxNavigate = (newIndex) => {
    setLightboxData(prev => ({ ...prev, currentIndex: newIndex }));
  };

  const handleCropComplete = (croppedBase64) => {
    if (cropperData.index !== null) {
      const newImages = [...reviewImages];
      newImages[cropperData.index] = croppedBase64;
      setReviewImages(newImages);
    }
  };

  return (
    <div style={{ width: '100%', paddingBottom: '40px' }}>
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

      {lightboxData.isOpen && (
        <ImageLightbox 
          images={lightboxData.images}
          currentIndex={lightboxData.currentIndex}
          onClose={() => setLightboxData({ ...lightboxData, isOpen: false })}
          onNavigate={handleLightboxNavigate}
        />
      )}

      <ImageCropperModal
        isOpen={cropperData.isOpen}
        imageSrc={cropperData.imageSrc}
        onClose={() => setCropperData({ isOpen: false, index: null, imageSrc: null })}
        onCropComplete={handleCropComplete}
      />

      <div className="card" style={{ padding: '32px' }}>
        <h3 style={{ fontSize: '18px', fontWeight: 600, margin: '0 0 24px 0', color: '#0f172a' }}>Customer Feedback Screenshots</h3>
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: '16px' }}>
          {reviewImages.map((img, index) => (
            <div 
              key={index} 
              draggable
              onDragStart={(e) => handleImageDragStart(e, index)}
              onDragOver={handleImageDragOver}
              onDrop={(e) => handleImageDropReorder(e, index)}
              style={{ position: 'relative', width: '100%', aspectRatio: '1', borderRadius: '12px', overflow: 'hidden', border: '1px solid #e2e8f0', cursor: 'grab', opacity: draggedImageIndex === index ? 0.5 : 1, backgroundColor: '#f8fafc', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}
              onClick={() => openLightbox(index)}
            >
              <img src={img} alt={`Review ${index}`} style={{ width: '100%', height: '100%', objectFit: 'cover', cursor: 'pointer' }} />
              
              <div style={{ position: 'absolute', top: '8px', right: '8px', display: 'flex', gap: '4px', zIndex: 2 }}>
                <button 
                  type="button" 
                  onClick={(e) => { e.stopPropagation(); setCropperData({ isOpen: true, index, imageSrc: img }); }} 
                  style={{ backgroundColor: '#ffffff', boxShadow: '0 2px 4px rgba(0,0,0,0.1)', width: '28px', height: '28px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', border: 'none', cursor: 'pointer' }}
                  title="Crop Image"
                >
                  <Crop size={14} color="#0f172a" />
                </button>
                <button 
                  type="button" 
                  onClick={(e) => { e.stopPropagation(); removeImage(index); }} 
                  style={{ backgroundColor: '#ffffff', boxShadow: '0 2px 4px rgba(0,0,0,0.1)', width: '28px', height: '28px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', border: 'none', cursor: 'pointer' }}
                  title="Delete Image"
                >
                  <Trash2 size={14} color="#dc2626" />
                </button>
              </div>
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
