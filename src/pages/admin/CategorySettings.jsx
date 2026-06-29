import React, { useState, useEffect } from 'react';
import { useStoreConfig } from '../../context/StoreConfigContext';
import { useProducts } from '../../context/ProductContext';
import * as LucideIcons from 'lucide-react';
import { Settings, Search, Trash2 } from 'lucide-react';
import { useToast } from '../../context/ToastContext';
import { useLanguage } from '../../context/LanguageContext';

export default function CategorySettings() {
  const { config, updateCategories } = useStoreConfig();
  const { products } = useProducts();
  const { addToast } = useToast();
  const { t } = useLanguage();

  const normalizeCategories = (cats) => {
    return cats.map(c => typeof c === 'string' 
      ? { name: c, nameAr: '', subcategories: [], subcategoriesAr: [] } 
      : { ...c, subcategories: c.subcategories || [], subcategoriesAr: c.subcategoriesAr || [], nameAr: c.nameAr || '' }
    );
  };

  const [categoriesForm, setCategoriesForm] = useState(() => normalizeCategories(config.categories || []));
  const [newCategoryName, setNewCategoryName] = useState('');
  const [newCategoryNameAr, setNewCategoryNameAr] = useState('');
  const [newSubCategoryNames, setNewSubCategoryNames] = useState({});
  const [newSubCategoryNamesAr, setNewSubCategoryNamesAr] = useState({});
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deleteInput, setDeleteInput] = useState('');
  const [categoryToDelete, setCategoryToDelete] = useState(null);

  useEffect(() => {
    if (config?.categories?.length > 0 && categoriesForm.length === 0 || config?.categories?.some(c => c.nameAr)) {
      setCategoriesForm(normalizeCategories(config.categories));
    }
  }, [config.categories]);

  // Auto-sync feature removed to prevent unwanted subcategory promotion and rendering loops

  const handleSaveAll = () => {
    updateCategories(categoriesForm);
    addToast('Category settings updated successfully!');
  };

  const AVAILABLE_ICONS = [
    'Tag', 'Home', 'Baby', 'Monitor', 'Smartphone', 'Watch', 'Camera',
    'ShoppingBag', 'Gift', 'Heart', 'Star', 'Coffee', 'Music', 'Book', 'Briefcase', 'Shirt'
  ];

  const handleCategoryIconChange = (catName, iconName) => {
    setCategoriesForm(categoriesForm.map(c => 
      c.name === catName ? { ...c, icon: iconName } : c
    ));
  };

  const handleAddCategory = () => {
    if (!newCategoryName.trim()) return;
    if (categoriesForm.some(c => c.name === newCategoryName.trim())) {
      addToast('Category already exists.', 'error');
      return;
    }
    setCategoriesForm([...categoriesForm, { 
      name: newCategoryName.trim(), 
      nameAr: newCategoryNameAr.trim(),
      subcategories: [],
      subcategoriesAr: []
    }]);
    setNewCategoryName('');
    setNewCategoryNameAr('');
  };

  const handleDeleteCategory = (catName) => {
    setCategoryToDelete(catName);
    setDeleteInput('');
    setDeleteModalOpen(true);
  };

  const confirmDeleteCategory = () => {
    if (deleteInput.trim().toLowerCase() === 'delete') {
      setCategoriesForm(categoriesForm.filter(c => c.name !== categoryToDelete));
      addToast('Category deleted successfully', 'success');
      setDeleteModalOpen(false);
      setCategoryToDelete(null);
    }
  };

  const handleAddSubCategory = (catName) => {
    const subName = newSubCategoryNames[catName]?.trim();
    const subNameAr = newSubCategoryNamesAr[catName]?.trim() || '';
    if (!subName) return;
    
    setCategoriesForm(categoriesForm.map(c => {
      if (c.name === catName) {
        if (c.subcategories.includes(subName)) {
           addToast('Sub-category already exists.', 'error');
           return c;
        }
        return { 
          ...c, 
          subcategories: [...c.subcategories, subName],
          subcategoriesAr: [...(c.subcategoriesAr || []), subNameAr]
        };
      }
      return c;
    }));
    
    setNewSubCategoryNames(prev => ({ ...prev, [catName]: '' }));
    setNewSubCategoryNamesAr(prev => ({ ...prev, [catName]: '' }));
  };

  const handleDeleteSubCategory = (catName, subIndex) => {
    setCategoriesForm(categoriesForm.map(c => 
      c.name === catName ? { 
        ...c, 
        subcategories: c.subcategories.filter((_, i) => i !== subIndex),
        subcategoriesAr: (c.subcategoriesAr || []).filter((_, i) => i !== subIndex)
      } : c
    ));
  };

  return (
    <div style={{ width: '100%' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <h2 className="headline-lg m-0">{t('categoryManagement')}</h2>
        <button onClick={handleSaveAll} className="btn" style={{ padding: '12px 24px', borderRadius: '8px' }}>
          {t('saveChanges')}
        </button>
      </div>

      <div className="metric-card" style={{ padding: '32px', backgroundColor: '#ffffff', border: 'none', borderRadius: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '24px' }}>
          <div style={{ width: '48px', height: '48px', backgroundColor: '#e0e7ff', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#4f46e5' }}>
            <Settings size={24} />
          </div>
          <div>
            <h2 style={{ fontSize: '20px', fontWeight: 600, margin: '0 0 4px 0', color: '#0f172a' }}>{t('storeCategories')}</h2>
            <p style={{ margin: 0, color: '#64748b', fontSize: '14px' }}>{t('categoryManagementDesc')}</p>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '12px', marginBottom: '24px' }}>
          <input 
            type="text" 
            className="input-field" 
            placeholder="New Main Category Name (EN)..." 
            value={newCategoryName}
            onChange={(e) => setNewCategoryName(e.target.value)}
            style={{ padding: '12px', borderRadius: '8px', border: '1px solid #cbd5e1', flex: 1 }}
          />
          <input 
            type="text" 
            className="input-field" 
            placeholder="الاسم بالعربي..." 
            value={newCategoryNameAr}
            onChange={(e) => setNewCategoryNameAr(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') handleAddCategory(); }}
            dir="rtl"
            style={{ padding: '12px', borderRadius: '8px', border: '1px solid #cbd5e1', flex: 1 }}
          />
          <button onClick={handleAddCategory} className="btn" style={{ padding: '12px 24px', borderRadius: '8px' }}>
            {t('addCategory')}
          </button>
        </div>

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '24px' }}>
          {categoriesForm.map(cat => {
            const IconComp = LucideIcons[cat.icon || 'Tag'] || LucideIcons.Tag;
            return (
              <div key={cat.name} style={{ width: '100%', maxWidth: '350px', backgroundColor: '#f8fafc', padding: '20px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                
                {/* Category Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{ backgroundColor: '#e0e7ff', padding: '8px', borderRadius: '8px', color: '#4f46e5' }}>
                      <IconComp size={20} />
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                      <span style={{ fontSize: '18px', fontWeight: 600, color: '#0f172a' }}>{cat.name}</span>
                      <input 
                        type="text" 
                        value={cat.nameAr || ''} 
                        onChange={(e) => setCategoriesForm(categoriesForm.map(c => c.name === cat.name ? { ...c, nameAr: e.target.value } : c))}
                        placeholder="الاسم بالعربي"
                        dir="rtl"
                        style={{ border: 'none', borderBottom: '1px dashed #cbd5e1', backgroundColor: 'transparent', fontSize: '14px', outline: 'none', color: '#64748b' }}
                      />
                    </div>
                  </div>
                  <button 
                    onClick={() => handleDeleteCategory(cat.name)} 
                    className="icon-btn" 
                    style={{ backgroundColor: '#fee2e2', padding: '8px', borderRadius: '8px' }}
                    title="Delete Main Category"
                  >
                    <Trash2 size={16} color="#ef4444" />
                  </button>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
                  <span style={{ fontSize: '13px', fontWeight: 600, color: '#64748b', whiteSpace: 'nowrap' }}>{t('icon')}</span>
                  <div className="custom-scrollbar" style={{ display: 'flex', gap: '4px', overflowX: 'auto', padding: '4px', flex: 1, backgroundColor: '#ffffff', borderRadius: '8px', border: '1px solid #cbd5e1' }}>
                    {AVAILABLE_ICONS.map(i => {
                      const Ico = LucideIcons[i];
                      const isSelected = (cat.icon || 'Tag') === i;
                      return (
                        <div 
                          key={i} 
                          onClick={() => handleCategoryIconChange(cat.name, i)}
                          style={{ 
                            padding: '6px', 
                            cursor: 'pointer', 
                            borderRadius: '6px', 
                            backgroundColor: isSelected ? '#e0e7ff' : 'transparent', 
                            color: isSelected ? '#4f46e5' : '#94a3b8',
                            flexShrink: 0,
                            transition: 'all 0.2s'
                          }}
                          title={i}
                        >
                          {Ico && <Ico size={18} />}
                        </div>
                      );
                    })}
                  </div>
                </div>

                <hr style={{ border: 'none', borderTop: '1px solid #cbd5e1', marginBottom: '16px' }} />
                <div style={{ fontSize: '12px', fontWeight: 600, color: '#64748b', marginBottom: '8px' }}>{t('subCategories')}</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '16px' }}>
                {cat.subcategories.map((sub, idx) => (
                  <div key={sub} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#ffffff', padding: '8px 12px', borderRadius: '8px', border: '1px solid #cbd5e1' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
                      <span style={{ fontSize: '14px', color: '#475569' }}>{sub}</span>
                      <input 
                        type="text" 
                        value={cat.subcategoriesAr?.[idx] || ''} 
                        onChange={(e) => {
                          const newAr = [...(cat.subcategoriesAr || [])];
                          newAr[idx] = e.target.value;
                          setCategoriesForm(categoriesForm.map(c => c.name === cat.name ? { ...c, subcategoriesAr: newAr } : c));
                        }}
                        placeholder="بالعربي"
                        dir="rtl"
                        style={{ border: 'none', borderBottom: '1px dashed #cbd5e1', backgroundColor: 'transparent', fontSize: '12px', outline: 'none', color: '#94a3b8', width: '100%' }}
                      />
                    </div>
                    <button 
                      onClick={() => handleDeleteSubCategory(cat.name, idx)} 
                      className="icon-btn" 
                      style={{ padding: '4px', backgroundColor: '#f1f5f9', borderRadius: '4px', marginLeft: '8px' }}
                      title="Delete Sub-Category"
                    >
                      <Trash2 size={14} color="#94a3b8" />
                    </button>
                  </div>
                ))}
                {cat.subcategories.length === 0 && (
                  <p style={{ margin: 0, fontSize: '13px', color: '#94a3b8', fontStyle: 'italic' }}>No sub-categories</p>
                )}
              </div>

              <div style={{ display: 'flex', gap: '8px' }}>
                <input 
                  type="text" 
                  className="input-field" 
                  placeholder="Subcategory (EN)" 
                  value={newSubCategoryNames[cat.name] || ''}
                  onChange={(e) => setNewSubCategoryNames({...newSubCategoryNames, [cat.name]: e.target.value})}
                  style={{ padding: '8px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', flex: 1, fontSize: '13px' }}
                />
                <input 
                  type="text" 
                  className="input-field" 
                  placeholder="بالعربي" 
                  value={newSubCategoryNamesAr[cat.name] || ''}
                  onChange={(e) => setNewSubCategoryNamesAr({...newSubCategoryNamesAr, [cat.name]: e.target.value})}
                  onKeyDown={(e) => { if (e.key === 'Enter') handleAddSubCategory(cat.name); }}
                  dir="rtl"
                  style={{ padding: '8px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', flex: 1, fontSize: '13px' }}
                />
                <button onClick={() => handleAddSubCategory(cat.name)} className="btn btn-primary" style={{ padding: '8px 12px', borderRadius: '6px', fontSize: '13px' }}>
                  Add
                </button>
              </div>
            </div>
            );
          })}
        </div>
      </div>

      {deleteModalOpen && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999 }}>
          <div className="card" style={{ padding: '24px', maxWidth: '400px', width: '100%', backgroundColor: 'var(--surface)' }}>
            <h3 style={{ margin: '0 0 16px 0', color: 'var(--on-surface)' }}>{t('deleteCategory')}</h3>
            <p style={{ margin: '0 0 16px 0', color: 'var(--on-surface-variant)' }}>Are you sure you want to delete the category <strong>"{categoryToDelete}"</strong>? All subcategories will also be removed. Type <strong>delete</strong> to confirm:</p>
            <input 
              type="text" 
              className="input-field" 
              style={{ marginBottom: '24px', width: '100%' }}
              value={deleteInput}
              onChange={(e) => setDeleteInput(e.target.value)}
              placeholder="delete"
              autoFocus
            />
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
              <button className="btn btn-secondary" onClick={() => { setDeleteModalOpen(false); setCategoryToDelete(null); }}>Cancel</button>
              <button className="btn" style={{ backgroundColor: '#ef4444', color: 'white', border: 'none', opacity: deleteInput.trim().toLowerCase() !== 'delete' ? 0.5 : 1 }} disabled={deleteInput.trim().toLowerCase() !== 'delete'} onClick={confirmDeleteCategory}>Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
