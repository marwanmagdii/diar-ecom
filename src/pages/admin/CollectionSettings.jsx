import React, { useState } from 'react';
import { Save, Eye, EyeOff, GripVertical, Trash2, Plus, X, Search, ChevronDown, ChevronUp } from 'lucide-react';
import { PremiumInput } from '../../components/AdminUI';
import { useStore } from '../../store';

export default function CollectionSettings() {
  const { config, updateCollections } = useStore();
  const { products } = useStore();
  const { addToast } = useStore();
  const { t } = useStore();

  const [collectionsForm, setCollectionsForm] = useState(config.collections || []);

  const [draggedItemIndex, setDraggedItemIndex] = useState(null);
  const [draggedCollectionId, setDraggedCollectionId] = useState(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [activeCollectionForModal, setActiveCollectionForModal] = useState(null);
  const [modalSearchQuery, setModalSearchQuery] = useState('');
  const [modalSelectedCategory, setModalSelectedCategory] = useState('');
  const [modalSelectedProductIds, setModalSelectedProductIds] = useState([]);
  const [openCollectionId, setOpenCollectionId] = useState(config.collections?.[0]?.id || null);

  const addNewCollection = () => {
    const newId = `col_${Date.now()}`;
    const newCol = {
      id: newId,
      name: 'New Collection',
      count: 10,
      layout: 'grid',
      discountType: 'percentage',
      hidden: false,
      productIds: []
    };
    setCollectionsForm([...collectionsForm, newCol]);
    setOpenCollectionId(newId);
  };

  const toggleCollectionAccordion = (id) => {
    setOpenCollectionId(prev => prev === id ? null : id);
  };

  const toggleCollectionVisibility = (id) => {
    const updated = collectionsForm.map(c => 
      c.id === id ? { ...c, hidden: !c.hidden } : c
    );
    setCollectionsForm(updated);
    updateCollections(updated);
  };

  const handleCollectionChange = (id, field, value) => {
    const updated = collectionsForm.map(c => 
      c.id === id ? { ...c, [field]: value } : c
    );
    setCollectionsForm(updated);
  };

  const addProductToCollection = (collectionId, productId) => {
    if (!productId) return;
    
    let error = false;
    const updated = collectionsForm.map(c => {
      if (c.id === collectionId) {
        const currentIds = c.productIds || [];
        if (currentIds.includes(productId)) {
          addToast('Product is already in this collection.', 'error');
          return c;
        }
        if (currentIds.length >= (c.count || 10)) {
          error = true;
          return c;
        }
        return { ...c, productIds: [...currentIds, productId] };
      }
      return c;
    });

    if (error) {
      addToast('Maximum displayed items reached. Increase the limit first.', 'error');
    } else {
      setCollectionsForm(updated);
    }
  };

  const removeProductFromCollection = (collectionId, productId) => {
    setCollectionsForm(collectionsForm.map(c => {
      if (c.id === collectionId) {
        const newIds = (c.productIds || []).filter(id => id !== productId);
        return { ...c, productIds: newIds };
      }
      return c;
    }));
  };

  const handleDragStart = (e, collectionId, index) => {
    setDraggedItemIndex(index);
    setDraggedCollectionId(collectionId);
    e.dataTransfer.effectAllowed = 'move';
    setTimeout(() => {
      if (e.target) e.target.style.opacity = '0.5';
    }, 0);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDragEnd = (e) => {
    if (e.target) e.target.style.opacity = '1';
    setDraggedItemIndex(null);
    setDraggedCollectionId(null);
  };

  const handleDrop = (e, targetCollectionId, targetIndex) => {
    e.preventDefault();
    if (draggedItemIndex === null || draggedCollectionId !== targetCollectionId) return;
    
    setCollectionsForm(collectionsForm.map(c => {
      if (c.id === targetCollectionId) {
        const newIds = [...(c.productIds || [])];
        const draggedId = newIds[draggedItemIndex];
        newIds.splice(draggedItemIndex, 1);
        newIds.splice(targetIndex, 0, draggedId);
        return { ...c, productIds: newIds };
      }
      return c;
    }));
    setDraggedItemIndex(null);
    setDraggedCollectionId(null);
  };

  const handleProductPriceOverride = (collectionId, productId, price) => {
    setCollectionsForm(collectionsForm.map(c => {
      if (c.id === collectionId) {
        const overrides = { ...(c.prices || {}) };
        if (price === '') {
          delete overrides[productId];
        } else {
          overrides[productId] = Number(price);
        }
        return { ...c, prices: overrides };
      }
      return c;
    }));
  };

  const handleSaveAll = () => {
    updateCollections(collectionsForm);
    addToast('Collection settings updated successfully!');
  };

  const openAddModal = (collectionId) => {
    setActiveCollectionForModal(collectionId);
    setModalSearchQuery('');
    setModalSelectedCategory('');
    setModalSelectedProductIds([]);
    setIsAddModalOpen(true);
  };

  const closeAddModal = () => {
    setIsAddModalOpen(false);
    setActiveCollectionForModal(null);
    setModalSelectedProductIds([]);
  };

  const handleAddSelected = () => {
    if (modalSelectedProductIds.length === 0) {
      closeAddModal();
      return;
    }
    
    let exceeded = false;
    setCollectionsForm(collectionsForm.map(c => {
      if (c.id === activeCollectionForModal) {
        const currentIds = c.productIds || [];
        // Filter out those already in collection
        const idsToAdd = modalSelectedProductIds.filter(id => !currentIds.includes(id));
        const maxAllowed = c.count || 10;
        
        if (currentIds.length + idsToAdd.length > maxAllowed) {
          exceeded = true;
          const allowedToAdd = maxAllowed - currentIds.length;
          return { ...c, productIds: [...currentIds, ...idsToAdd.slice(0, allowedToAdd)] };
        }
        return { ...c, productIds: [...currentIds, ...idsToAdd] };
      }
      return c;
    }));
    
    if (exceeded) {
      addToast('Maximum displayed items reached. Some products were not added.', 'warning');
    } else {
      addToast(`Added ${modalSelectedProductIds.length} products successfully!`, 'success');
    }
    closeAddModal();
  };

  const toggleModalProductSelection = (productId) => {
    if (modalSelectedProductIds.includes(productId)) {
      setModalSelectedProductIds(modalSelectedProductIds.filter(id => id !== productId));
    } else {
      setModalSelectedProductIds([...modalSelectedProductIds, productId]);
    }
  };

  return (
    <div style={{ width: '100%' }}>
      <h2 className="headline-lg mb-4">{t('collectionsFlashSale')}</h2>

      <div className="card" style={{ padding: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <div>
            <h3 className="headline-md m-0">{t('collectionBuilder')}</h3>
            <p className="text-on-surface-variant m-0" style={{ fontSize: '14px', marginTop: '4px' }}>{t('collectionBuilderDesc')}</p>
          </div>
          <button onClick={handleSaveAll} className="btn btn-primary" style={{ padding: '12px 24px', display: 'flex', alignItems: 'center', gap: '8px', borderRadius: '8px' }}>
            <Save size={20} /> {t('saveAllChanges')}
          </button>
        </div>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {collectionsForm.map((col) => (
            <div key={col.id} style={{ display: 'flex', flexDirection: 'column', gap: '16px', padding: '24px', border: '1px solid #e2e8f0', borderRadius: '12px', backgroundColor: col.hidden ? '#f8fafc' : '#ffffff', color: '#0f172a' }}>
              
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '16px' }}>
                <GripVertical size={20} color="#64748b" style={{ cursor: 'grab', marginTop: '12px' }} />
                
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '24px' }}>
                  
                  {/* Header: Name and Visibility */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: openCollectionId === col.id ? '16px' : '0', borderBottom: openCollectionId === col.id ? '1px solid #e2e8f0' : 'none' }}>
                    <div style={{ display: 'flex', alignItems: 'center', flex: 1 }}>
                      <button 
                        type="button"
                        onClick={() => toggleCollectionAccordion(col.id)}
                        style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '8px', color: '#64748b', display: 'flex', alignItems: 'center', justifyContent: 'center', marginRight: '8px' }}
                      >
                        {openCollectionId === col.id ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                      </button>
                      <input 
                        type="text" 
                        className="input-field" 
                        value={col.name} 
                        onChange={e => handleCollectionChange(col.id, 'name', e.target.value)} 
                        placeholder={t('collectionNamePlaceholder')}
                        style={{ fontSize: '18px', fontWeight: 'bold', flex: 1, marginRight: '16px', maxWidth: '400px', border: 'none', backgroundColor: 'transparent', padding: '4px 8px' }}
                        onClick={(e) => {
                          if (openCollectionId !== col.id) toggleCollectionAccordion(col.id);
                        }}
                      />
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                      <button 
                        type="button" 
                        className="icon-btn" 
                        onClick={() => toggleCollectionVisibility(col.id)}
                        title={col.hidden ? 'Show Collection' : 'Hide Collection'}
                      >
                        {col.hidden ? <EyeOff size={24} color="var(--error)" /> : <Eye size={24} color="var(--primary)" />}
                      </button>
                      <button 
                        onClick={handleSaveAll} 
                        className="btn btn-primary" 
                        style={{ padding: '8px 16px', display: 'flex', alignItems: 'center', gap: '6px', borderRadius: '6px', fontSize: '14px' }}
                      >
                        <Save size={16} /> Save
                      </button>
                    </div>
                  </div>

                  {openCollectionId === col.id && (
                    <>
                      {/* Configuration Controls */}
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '32px', alignItems: 'center', padding: '16px', backgroundColor: '#f8fafc', borderRadius: '8px' }}>
                    <PremiumInput 
                      label="Max Displayed Items" 
                      type="number" 
                      value={col.count} 
                      onChange={e => handleCollectionChange(col.id, 'count', Number(e.target.value))} 
                      style={{ width: '120px' }}
                    />
                    <div style={{ display: 'flex', gap: '16px' }}>
                      <PremiumInput 
                        label="Sale Start Date" 
                        type="datetime-local" 
                        value={col.startDate || ''} 
                        onChange={e => handleCollectionChange(col.id, 'startDate', e.target.value)} 
                      />
                      <PremiumInput 
                        label="Sale End Date" 
                        type="datetime-local" 
                        value={col.endDate || ''} 
                        onChange={e => handleCollectionChange(col.id, 'endDate', e.target.value)} 
                      />
                    </div>
                  </div>

                  {/* Product Builder */}
                  <div style={{ border: '1px solid #e2e8f0', borderRadius: '8px', overflow: 'hidden' }}>
                    <div style={{ padding: '16px', backgroundColor: '#f1f5f9', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <label style={{ fontSize: '15px', fontWeight: 600, color: '#334155', margin: 0 }}>
                        Products in Collection ({col.productIds?.length || 0} / {col.count})
                      </label>
                      <div style={{ width: 'auto' }}>
                        <button 
                          onClick={() => openAddModal(col.id)} 
                          className="btn btn-outline"
                          style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 16px', borderRadius: '6px', backgroundColor: '#ffffff' }}
                        >
                          <Plus size={16} /> Add Product
                        </button>
                      </div>
                    </div>
                    
                    <div style={{ backgroundColor: '#ffffff' }}>
                      {col.productIds && col.productIds.length > 0 ? (
                        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                          <thead>
                            <tr style={{ borderBottom: '1px solid #e2e8f0', backgroundColor: '#f8fafc' }}>
                              <th style={{ padding: '12px 16px', fontSize: '13px', fontWeight: 600, color: '#64748b', width: '60px' }}>#</th>
                              <th style={{ padding: '12px 16px', fontSize: '13px', fontWeight: 600, color: '#64748b' }}>Product</th>
                              <th style={{ padding: '12px 16px', fontSize: '13px', fontWeight: 600, color: '#64748b', width: '120px' }}>Base Price</th>
                              <th style={{ padding: '12px 16px', fontSize: '13px', fontWeight: 600, color: '#64748b', width: '140px' }}>Discount (%)</th>
                              <th style={{ padding: '12px 16px', fontSize: '13px', fontWeight: 600, color: '#64748b', width: '140px' }}>Sale Price (EGP)</th>
                              <th style={{ padding: '12px 16px', fontSize: '13px', fontWeight: 600, color: '#64748b', width: '100px', textAlign: 'right' }}>Actions</th>
                            </tr>
                          </thead>
                          <tbody>
                            {col.productIds.map((id, index) => {
                              const p = products.find(prod => prod.id === id);
                              if (!p) return null;
                              
                              const overridePrice = col.prices && col.prices[id] !== undefined ? col.prices[id] : '';
                              const discountPercentage = overridePrice !== '' ? Math.round((1 - (Number(overridePrice) / Number(p.price))) * 100) : '';

                              const handleDiscountChange = (e) => {
                                let val = e.target.value;
                                if (val === '') {
                                  handleProductPriceOverride(col.id, p.id, '');
                                } else {
                                  let disc = Number(val);
                                  let newPrice = Number(p.price) * (1 - disc / 100);
                                  handleProductPriceOverride(col.id, p.id, newPrice.toFixed(2));
                                }
                              };

                              const handlePriceChange = (e) => {
                                let val = e.target.value;
                                if (val === '') {
                                  handleProductPriceOverride(col.id, p.id, '');
                                } else {
                                  handleProductPriceOverride(col.id, p.id, Number(val));
                                }
                              };

                              return (
                                <tr 
                                  key={id} 
                                  draggable
                                  onDragStart={(e) => handleDragStart(e, col.id, index)}
                                  onDragOver={handleDragOver}
                                  onDrop={(e) => handleDrop(e, col.id, index)}
                                  onDragEnd={handleDragEnd}
                                  style={{ borderBottom: '1px solid #f1f5f9', cursor: 'move', backgroundColor: draggedItemIndex === index && draggedCollectionId === col.id ? '#f8fafc' : 'transparent', transition: 'background-color 0.2s' }}
                                >
                                  <td style={{ padding: '12px 16px', color: '#94a3b8', fontSize: '14px', fontWeight: 500 }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                      <GripVertical size={16} />
                                      {index + 1}
                                    </div>
                                  </td>
                                  <td style={{ padding: '12px 16px' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                      <div style={{ width: '40px', height: '40px', borderRadius: '6px', overflow: 'hidden', backgroundColor: p.bgColor || '#f1f5f9' }}>
                                        <img src={p.image} alt={p.title} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                                      </div>
                                      <div>
                                        <div style={{ fontSize: '14px', fontWeight: 500, color: '#0f172a' }}>{p.title}</div>
                                        <div style={{ fontSize: '12px', color: '#64748b' }}>{p.category}</div>
                                      </div>
                                    </div>
                                  </td>
                                  <td style={{ padding: '12px 16px', fontSize: '14px', color: '#64748b' }}>
                                    <span style={{ textDecoration: overridePrice !== '' ? 'line-through' : 'none', opacity: overridePrice !== '' ? 0.5 : 1 }}>
                                      {Number(p.price).toFixed(2)}
                                    </span>
                                  </td>
                                  <td style={{ padding: '12px 16px' }}>
                                    <div style={{ position: 'relative', width: '100px' }}>
                                      <input 
                                        type="number" 
                                        className="input-field" 
                                        placeholder="0"
                                        value={discountPercentage}
                                        onChange={handleDiscountChange}
                                        style={{ width: '100%', padding: '6px 28px 6px 12px', fontSize: '14px' }}
                                      />
                                      <span style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', color: '#64748b', fontSize: '14px' }}>%</span>
                                    </div>
                                  </td>
                                  <td style={{ padding: '12px 16px' }}>
                                    <input 
                                      type="number" 
                                      className="input-field" 
                                      placeholder={t('noDiscount')}
                                      value={overridePrice}
                                      onChange={handlePriceChange}
                                      style={{ width: '120px', padding: '6px 12px', fontSize: '14px', fontWeight: overridePrice !== '' ? 600 : 400, color: overridePrice !== '' ? '#059669' : 'inherit' }}
                                    />
                                  </td>
                                  <td style={{ padding: '12px 16px', textAlign: 'right' }}>
                                    <div style={{ display: 'flex', gap: '4px', justifyContent: 'flex-end' }}>
                                      <button 
                                        onClick={() => removeProductFromCollection(col.id, p.id)}
                                        className="icon-btn" 
                                        style={{ padding: '6px', color: '#ef4444' }}
                                        title={t('removeFromCollection')}
                                      >
                                        <Trash2 size={16} />
                                      </button>
                                    </div>
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      ) : (
                        <div style={{ padding: '32px', textAlign: 'center', color: '#64748b' }}>
                          <p>{t('noProductsInCollection')}</p>
                          <button onClick={() => openAddModal(col.id)} className="btn btn-outline" style={{ marginTop: '8px' }}>{t('addProducts')}</button>
                        </div>
                      )}
                    </div>
                  </div>
                  </>
                )}
                </div>
              </div>
            </div>
          ))}
        </div>

        <button 
          onClick={addNewCollection} 
          className="btn btn-outline" 
          style={{ width: '100%', padding: '16px', borderStyle: 'dashed', borderWidth: '2px', borderRadius: '12px', fontSize: '14px', fontWeight: 600, color: '#475569', backgroundColor: 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
        >
          <Plus size={20} /> {t('addNewCollection')}
        </button>
      </div>

      {/* Add Product Modal */}
      {isAddModalOpen && activeCollectionForModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '24px' }}>
          <div style={{ backgroundColor: '#ffffff', borderRadius: '12px', width: '100%', maxWidth: '800px', maxHeight: '80vh', display: 'flex', flexDirection: 'column', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)' }}>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px 24px', borderBottom: '1px solid #e2e8f0' }}>
              <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 600 }}>{t('selectProductsToAdd')}</h3>
              <button onClick={closeAddModal} className="icon-btn" style={{ padding: '8px' }}>
                <X size={20} />
              </button>
            </div>

            <div style={{ padding: '16px 24px', borderBottom: '1px solid #e2e8f0', backgroundColor: '#f8fafc', display: 'flex', gap: '12px' }}>
              <div style={{ position: 'relative', flex: 1 }}>
                <Search size={18} color="#64748b" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
                <input 
                  type="text" 
                  className="input-field" 
                  placeholder="Search products by name..." 
                  value={modalSearchQuery}
                  onChange={e => setModalSearchQuery(e.target.value)}
                  style={{ width: '100%', paddingLeft: '40px' }}
                />
              </div>
              <select 
                className="input-field"
                value={modalSelectedCategory}
                onChange={e => setModalSelectedCategory(e.target.value)}
                style={{ width: '200px' }}
              >
                <option value="">All Categories</option>
                {[...new Set(products.map(p => p.category))].filter(Boolean).map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
            
            <div style={{ padding: '0', overflowY: 'auto', flex: 1, backgroundColor: '#ffffff', minHeight: 0 }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                <thead style={{ position: 'sticky', top: 0, backgroundColor: '#f1f5f9', zIndex: 1 }}>
                  <tr>
                    <th style={{ padding: '12px 24px', width: '40px' }}>
                      <input 
                        type="checkbox" 
                        onChange={(e) => {
                          const availableProducts = products
                            .filter(p => !collectionsForm.find(c => c.id === activeCollectionForModal)?.productIds?.includes(p.id))
                            .filter(p => p.title.toLowerCase().includes(modalSearchQuery.toLowerCase()) || p.category.toLowerCase().includes(modalSearchQuery.toLowerCase()))
                            .filter(p => modalSelectedCategory ? p.category === modalSelectedCategory : true);
                          if (e.target.checked) {
                            setModalSelectedProductIds(availableProducts.map(p => p.id));
                          } else {
                            setModalSelectedProductIds([]);
                          }
                        }}
                        checked={
                          modalSelectedProductIds.length > 0 && 
                          modalSelectedProductIds.length === products
                            .filter(p => !collectionsForm.find(c => c.id === activeCollectionForModal)?.productIds?.includes(p.id))
                            .filter(p => p.title.toLowerCase().includes(modalSearchQuery.toLowerCase()) || p.category.toLowerCase().includes(modalSearchQuery.toLowerCase()))
                            .filter(p => modalSelectedCategory ? p.category === modalSelectedCategory : true)
                            .length
                        }
                      />
                    </th>
                    <th style={{ padding: '12px 16px', fontSize: '13px', fontWeight: 600, color: '#64748b' }}>Product</th>
                    <th style={{ padding: '12px 16px', fontSize: '13px', fontWeight: 600, color: '#64748b' }}>Category</th>
                    <th style={{ padding: '12px 24px', fontSize: '13px', fontWeight: 600, color: '#64748b', textAlign: 'right' }}>Price (EGP)</th>
                  </tr>
                </thead>
                <tbody>
                  {products
                    .filter(p => !collectionsForm.find(c => c.id === activeCollectionForModal)?.productIds?.includes(p.id))
                    .filter(p => p.title.toLowerCase().includes(modalSearchQuery.toLowerCase()) || p.category.toLowerCase().includes(modalSearchQuery.toLowerCase()))
                    .filter(p => modalSelectedCategory ? p.category === modalSelectedCategory : true)
                    .map(p => (
                    <tr 
                      key={p.id} 
                      style={{ borderBottom: '1px solid #e2e8f0', cursor: 'pointer', backgroundColor: modalSelectedProductIds.includes(p.id) ? '#f0f9ff' : 'transparent' }}
                      onClick={() => toggleModalProductSelection(p.id)}
                    >
                      <td style={{ padding: '12px 24px' }}>
                        <input 
                          type="checkbox" 
                          checked={modalSelectedProductIds.includes(p.id)} 
                          onChange={() => {}} 
                        />
                      </td>
                      <td style={{ padding: '12px 16px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <div style={{ width: '40px', height: '40px', borderRadius: '6px', overflow: 'hidden', backgroundColor: p.bgColor || '#f1f5f9', flexShrink: 0 }}>
                            <img src={p.image} alt={p.title} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                          </div>
                          <div style={{ fontSize: '14px', fontWeight: 500, color: '#0f172a' }}>{p.title}</div>
                        </div>
                      </td>
                      <td style={{ padding: '12px 16px', fontSize: '13px', color: '#64748b' }}>
                        {p.category}
                      </td>
                      <td style={{ padding: '12px 24px', fontSize: '14px', fontWeight: 500, color: '#0f172a', textAlign: 'right' }}>
                        {Number(p.price).toFixed(2)}
                      </td>
                    </tr>
                  ))}
                  {products
                    .filter(p => !collectionsForm.find(c => c.id === activeCollectionForModal)?.productIds?.includes(p.id))
                    .filter(p => p.title.toLowerCase().includes(modalSearchQuery.toLowerCase()) || p.category.toLowerCase().includes(modalSearchQuery.toLowerCase()))
                    .filter(p => modalSelectedCategory ? p.category === modalSelectedCategory : true)
                    .length === 0 && (
                    <tr>
                      <td colSpan="4" style={{ textAlign: 'center', padding: '60px 20px', color: '#64748b' }}>
                        No products found matching your search.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            
            <div style={{ padding: '16px 24px', borderTop: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#ffffff', borderBottomLeftRadius: '12px', borderBottomRightRadius: '12px' }}>
              <div style={{ fontSize: '14px', color: '#64748b' }}>
                {modalSelectedProductIds.length > 0 ? `${modalSelectedProductIds.length} product(s) selected` : 'Select products to add'}
              </div>
              <div style={{ display: 'flex', gap: '12px' }}>
                <button onClick={closeAddModal} className="btn btn-outline" style={{ padding: '10px 24px' }}>Cancel</button>
                <button onClick={handleAddSelected} className="btn btn-primary" style={{ padding: '10px 32px' }} disabled={modalSelectedProductIds.length === 0}>
                  Add Selected
                </button>
              </div>
            </div>
            
          </div>
        </div>
      )}
    </div>
  );
}
