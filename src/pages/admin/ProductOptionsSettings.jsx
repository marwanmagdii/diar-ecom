import React, { useState } from 'react';
import { Save, Plus, Trash2, Tag, X, ChevronDown, ChevronUp } from 'lucide-react';
import { getColorHex } from '../../utils/colors';
import { defaultOptions } from '../../utils/constants';
import { useStore } from '../../store';

export default function ProductOptionsSettings() {
  const { config, updateConfig, configLoading } = useStore();
  const { addToast } = useStore();
  const { language } = useStore();

  let initialOptions = defaultOptions;
  if (config && config.productOptions && config.productOptions.length > 0) {
    if (typeof config.productOptions[0] === 'string') {
      initialOptions = config.productOptions.map(opt => {
        const defaultMatch = defaultOptions.find(d => d.name.toLowerCase() === opt.toLowerCase());
        return { name: opt, values: defaultMatch ? defaultMatch.values : [] };
      });
    } else {
      initialOptions = config.productOptions;
    }
  }
  
  const [options, setOptions] = useState(initialOptions);
  const [newOptionNameEn, setNewOptionNameEn] = useState('');
  const [newOptionNameAr, setNewOptionNameAr] = useState('');
  const [newValueInputsEn, setNewValueInputsEn] = useState({});
  const [newValueInputsAr, setNewValueInputsAr] = useState({});
  const [expandedGroups, setExpandedGroups] = useState({});
  const [isSaving, setIsSaving] = useState(false);

  const toggleGroup = (index) => {
    setExpandedGroups(prev => ({ ...prev, [index]: !prev[index] }));
  };

  const handleAddOption = async (e) => {
    e.preventDefault();
    const en = newOptionNameEn.trim();
    const ar = newOptionNameAr.trim();
    if (!en && !ar) return;
    
    const combinedName = [en, ar].filter(Boolean).join(' / ');
    
    if (options.some(opt => opt.name.toLowerCase() === combinedName.toLowerCase())) {
      addToast(language === 'ar' ? 'هذا الخيار موجود بالفعل.' : 'This option name already exists.', 'error');
      return;
    }
    
    const newOpts = [...options, { name: combinedName, values: [] }];
    setOptions(newOpts);
    setNewOptionNameEn('');
    setNewOptionNameAr('');
    setExpandedGroups(prev => ({ ...prev, [newOpts.length - 1]: true }));
    await updateConfig({ productOptions: newOpts });
  };

  const handleRemoveOption = async (indexToRemove) => {
    if (!window.confirm(language === 'ar' ? 'هل أنت متأكد من حذف مجموعة الخيارات هذه وكل قيمها؟' : 'Are you sure you want to delete this option group and all its values?')) return;
    const newOpts = options.filter((_, idx) => idx !== indexToRemove);
    setOptions(newOpts);
    await updateConfig({ productOptions: newOpts });
  };

  const handleAddValue = async (optionIndex, e) => {
    e.preventDefault();
    const en = newValueInputsEn[optionIndex]?.trim() || '';
    const ar = newValueInputsAr[optionIndex]?.trim() || '';
    if (!en && !ar) return;
    
    let val = [en, ar].filter(Boolean).join(' / ');
    
    const optName = options[optionIndex].name;
    if (optName.toLowerCase().includes('color') || optName.toLowerCase().includes('لون')) {
      if (en) {
        val = en.charAt(0).toUpperCase() + en.slice(1).toLowerCase() + (ar ? ` / ${ar}` : '');
      }
      const hex = getColorHex(val);
      if (hex === '#e2e8f0' && val.toLowerCase() !== 'gray' && val !== 'رمادي' && !val.toLowerCase().includes('gray')) {
        addToast(language === 'ar' ? `"${val}" ليس لوناً معروفاً. يرجى إدخال لون صحيح.` : `"${val}" is not a recognized color. Please enter a valid CSS color.`, 'error');
        return;
      }
    }

    const newOpts = options.map((opt, idx) => {
      if (idx === optionIndex) {
        if (!opt.values.some(v => v.toLowerCase() === val.toLowerCase())) {
          return { ...opt, values: [...opt.values, val] };
        }
      }
      return opt;
    });

    setOptions(newOpts);
    setNewValueInputsEn(prev => ({ ...prev, [optionIndex]: '' }));
    setNewValueInputsAr(prev => ({ ...prev, [optionIndex]: '' }));
    await updateConfig({ productOptions: newOpts });
  };

  const handleRemoveValue = async (optionIndex, valueToRemove) => {
    if (!window.confirm(language === 'ar' ? 'هل أنت متأكد من حذف هذه القيمة؟' : 'Are you sure you want to delete this value?')) return;
    const newOpts = options.map((opt, idx) => {
      if (idx === optionIndex) {
        return { ...opt, values: opt.values.filter(v => v !== valueToRemove) };
      }
      return opt;
    });
    setOptions(newOpts);
    await updateConfig({ productOptions: newOpts });
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await updateConfig({ productOptions: options });
      addToast(language === 'ar' ? 'تم حفظ خيارات المنتجات بنجاح!' : 'Product options saved successfully!', 'success');
    } catch (err) {
      addToast(language === 'ar' ? 'فشل في حفظ الخيارات.' : 'Failed to save product options.', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  if (configLoading) return <div style={{ padding: '48px', textAlign: 'center' }}>{language === 'ar' ? 'جاري تحميل الإعدادات...' : 'Loading settings...'}</div>;

  return (
    <div className="admin-page" dir={language === 'ar' ? 'rtl' : 'ltr'}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <h1 className="headline-md" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Tag size={24} color="var(--primary)" /> {language === 'ar' ? 'إدارة خيارات المنتجات' : 'Product Options Management'}
        </h1>
        <button className="btn btn-primary" onClick={handleSave} disabled={isSaving} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {isSaving ? <div className="spinner" style={{ width: '16px', height: '16px', border: '2px solid rgba(255,255,255,0.3)', borderTopColor: 'white', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div> : <Save size={18} />}
          {isSaving ? (language === 'ar' ? 'جاري الحفظ...' : 'Saving...') : (language === 'ar' ? 'حفظ الإعدادات' : 'Save Settings')}
        </button>
      </div>
      
      <div className="card" style={{ maxWidth: '800px' }}>
        <h2 className="headline-sm mb-2">{language === 'ar' ? 'إعدادات الخيارات العامة' : 'Global Option Configurations'}</h2>
        <p className="body-md text-on-surface-variant mb-4">
          {language === 'ar' ? 'حدد الخصائص (مثل اللون، المقاس) والقيم المسموح بها. عند إضافة منتج، يمكنك تحديد هذه الخيارات لبناء المتغيرات بسرعة!' : 'Define the properties (like Color, Size) and their allowed predefined values. When adding a product, you can select from these checkboxes to quickly build variants!'}
        </p>

        <form onSubmit={handleAddOption} style={{ display: 'flex', gap: '8px', marginBottom: '32px', borderBottom: '1px solid var(--outline-variant)', paddingBottom: '24px', flexWrap: 'wrap' }}>
          <input
            type="text"
            className="input-field"
            style={{ flex: 1, minWidth: '200px' }}
            placeholder={language === 'ar' ? 'اسم الخيار بالإنجليزية (e.g. Storage)' : 'Option Name (English)'}
            value={newOptionNameEn}
            onChange={(e) => setNewOptionNameEn(e.target.value)}
          />
          <input
            type="text"
            className="input-field"
            style={{ flex: 1, minWidth: '200px' }}
            placeholder={language === 'ar' ? 'اسم الخيار بالعربية (مثل السعة)' : 'Option Name (Arabic)'}
            value={newOptionNameAr}
            onChange={(e) => setNewOptionNameAr(e.target.value)}
            dir="rtl"
          />
          <button type="submit" className="btn btn-primary" style={{ padding: '0 16px', display: 'flex', alignItems: 'center', gap: '4px', whiteSpace: 'nowrap' }}>
            <Plus size={18} /> {language === 'ar' ? 'إضافة مجموعة' : 'Add Group'}
          </button>
        </form>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {options.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '24px', color: 'var(--on-surface-variant)', backgroundColor: 'var(--surface-container)', borderRadius: '8px' }}>
              {language === 'ar' ? 'لا توجد خيارات محددة بعد. أضف واحداً أعلاه.' : 'No options defined yet. Add one above.'}
            </div>
          ) : (
            options.map((opt, index) => (
              <div key={index} style={{ border: '1px solid var(--outline-variant)', borderRadius: '12px', overflow: 'hidden' }}>
                <div 
                  style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 16px', backgroundColor: 'var(--surface-container-low)', borderBottom: expandedGroups[index] ? '1px solid var(--outline-variant)' : 'none', cursor: 'pointer' }}
                  onClick={() => toggleGroup(index)}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    {expandedGroups[index] ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                    <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 600 }}>{opt?.name || (language === 'ar' ? 'خيار غير مسمى' : 'Unnamed Option')}</h3>
                  </div>
                  <button
                    type="button"
                    className="icon-btn"
                    onClick={(e) => { e.stopPropagation(); handleRemoveOption(index); }}
                    style={{ color: 'var(--error)' }}
                    title={language === 'ar' ? 'حذف مجموعة الخيارات' : 'Delete Option Group'}
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
                
                {expandedGroups[index] && (
                <div style={{ padding: '16px' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '24px' }}>
                    {!opt?.values || opt.values.length === 0 ? (
                      <span style={{ fontSize: '14px', color: 'var(--on-surface-variant)' }}>{language === 'ar' ? 'لا توجد قيم محددة مسبقاً. أضف بعضها أدناه!' : 'No predefined values. Add some below!'}</span>
                    ) : (
                      opt.values.map(val => {
                        const isColor = opt?.name?.toLowerCase().includes('color') || opt?.name?.toLowerCase().includes('لون');
                        const parts = val.split(' / ').map(p => p.trim());
                        
                        return (
                        <div key={val} style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '10px 16px', backgroundColor: 'var(--surface-container-highest)', borderRadius: '8px', fontSize: '14px', fontWeight: 500, width: '100%' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '24px', flex: 1, flexWrap: 'wrap' }}>
                            {parts.map((part, pIdx) => (
                              <div key={pIdx} style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: '120px' }} dir={part.match(/[\u0600-\u06FF]/) ? 'rtl' : 'ltr'}>
                                {isColor && (
                                  <span style={{ display: 'inline-block', width: '14px', height: '14px', borderRadius: '50%', backgroundColor: getColorHex(val), border: '1px solid rgba(0,0,0,0.2)' }}></span>
                                )}
                                {part}
                              </div>
                            ))}
                          </div>
                          <button type="button" onClick={() => handleRemoveValue(index, val)} style={{ background: 'none', border: 'none', color: 'var(--on-surface-variant)', cursor: 'pointer', padding: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '50%' }} className="hover-bg"><Trash2 size={16} color="var(--error)" /></button>
                        </div>
                      )})
                    )}
                  </div>
                  
                  <form onSubmit={(e) => handleAddValue(index, e)} style={{ display: 'flex', flexDirection: 'column', gap: '12px', backgroundColor: 'var(--surface-container-low)', padding: '16px', borderRadius: '8px' }}>
                    <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--on-surface-variant)', marginBottom: '-4px' }}>
                      {language === 'ar' ? 'إضافة قيمة جديدة:' : 'Add New Value:'}
                    </div>
                    <input 
                      type="text" 
                      className="input-field" 
                      placeholder={language === 'ar' ? `القيمة بالإنجليزية (e.g. Red)` : `Value (English)`}
                      value={newValueInputsEn[index] || ''}
                      onChange={e => setNewValueInputsEn(prev => ({ ...prev, [index]: e.target.value }))}
                      style={{ padding: '10px 12px', fontSize: '14px' }}
                      dir="ltr"
                    />
                    <input 
                      type="text" 
                      className="input-field" 
                      placeholder={language === 'ar' ? `القيمة بالعربية (مثل أحمر)` : `Value (Arabic)`}
                      value={newValueInputsAr[index] || ''}
                      onChange={e => setNewValueInputsAr(prev => ({ ...prev, [index]: e.target.value }))}
                      style={{ padding: '10px 12px', fontSize: '14px' }}
                      dir="rtl"
                    />
                    <button type="submit" className="btn btn-secondary" style={{ padding: '10px 16px', fontSize: '14px', alignSelf: 'flex-start', marginTop: '4px' }}>
                      {language === 'ar' ? 'إضافة قيمة' : 'Add Value'}
                    </button>
                  </form>
                </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
