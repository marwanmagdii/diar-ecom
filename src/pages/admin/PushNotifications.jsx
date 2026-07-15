import React, { useState, useEffect } from 'react';
import { useStore } from '../../store';
import { Send, BellRing, Smartphone, Filter, Image as ImageIcon, Package, History, ChevronDown, ChevronUp, MousePointerClick, User } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function PushNotifications() {
  const { users, products, config, addToast, t, language, fetchConfig } = useStore();
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [targetType, setTargetType] = useState('all'); // all, category, city, specific
  const [targetCategory, setTargetCategory] = useState('');
  const [targetCity, setTargetCity] = useState('');
  const [selectedUserIds, setSelectedUserIds] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState('');
  const [productSearch, setProductSearch] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [activeTab, setActiveTab] = useState('compose'); // 'compose' or 'history'
  const [history, setHistory] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [expandedRow, setExpandedRow] = useState(null);

  const fetchHistory = async () => {
    try {
      setHistoryLoading(true);
      const res = await fetch('/api/notifications/history');
      const data = await res.json();
      if (res.ok) setHistory(data);
    } catch (e) {
      console.error("Failed to fetch history", e);
    } finally {
      setHistoryLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'history') {
      fetchHistory();
    }
  }, [activeTab]);

  const anonymousTokens = config?.anonymousTokens || [];

  // Extract all unique categories and cities from users
  const availableCategories = Array.from(new Set(users.flatMap(u => Object.keys(u.purchasedCategories || {})))).sort();
  const availableCities = Array.from(new Set(users.map(u => u.latestAddress?.split(',').pop()?.trim()).filter(Boolean))).sort();

  // Handle Product Promotion
  const handleProductSelect = (productId) => {
    setSelectedProduct(productId);
    if (!productId) return;
    
    const prod = products.find(p => p.id === productId);
    if (prod) {
      setTitle(`Flash Sale: ${prod.titleAr || prod.title}!`);
      setBody(`Get the new ${prod.titleAr || prod.title} today for only ${prod.offerPrice || prod.price} EGP! Click here to shop now.`);
      if (prod.images && prod.images.length > 0) {
        // Ensure absolute URL for push notifications
        const imgUrl = prod.images[0].startsWith('http') ? prod.images[0] : `${window.location.origin}${prod.images[0]}`;
        setImageUrl(imgUrl);
      }
    }
  };

  // Calculate target audience
  const getTargetUsers = () => {
    return users.filter(user => {
      if (!user.fcmTokens || user.fcmTokens.size === 0) return false;
      
      if (targetType === 'category' && targetCategory) {
        return user.purchasedCategories && user.purchasedCategories[targetCategory] > 0;
      }
      if (targetType === 'city' && targetCity) {
        return user.latestAddress && user.latestAddress.includes(targetCity);
      }
      if (targetType === 'specific') {
        return selectedUserIds.includes(user.id);
      }
      return true; // targetType === 'all'
    });
  };

  const targetUsers = getTargetUsers();
  // Include anonymous tokens only if we are targeting 'all'
  const activeAnonymousTokens = targetType === 'all' ? anonymousTokens : [];
  const totalTokens = targetUsers.reduce((sum, user) => sum + user.fcmTokens.size, 0) + activeAnonymousTokens.length;

  const handleSend = async (e) => {
    e.preventDefault();
    if (!title || !body) {
      addToast('Please enter a title and body.', 'error');
      return;
    }
    if (totalTokens === 0) {
      addToast('No users found with the selected filters.', 'error');
      return;
    }

    setIsSending(true);

    const tokens = [...activeAnonymousTokens];
    targetUsers.forEach(user => {
      user.fcmTokens.forEach(token => tokens.push(token));
    });

    try {
      const response = await fetch('/api/notifications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          body,
          imageUrl,
          tokens,
          productId: selectedProduct
        })
      });

      const result = await response.json();
      
      if (response.ok) {
        addToast(`Successfully sent ${result.successCount} notifications!`, 'success');
        if (result.failureCount > 0) {
          const errorMessages = result.responses
            .filter(r => !r.success)
            .map(r => r.error?.message || r.error?.code || 'Unknown error');
          const uniqueErrors = Array.from(new Set(errorMessages));
          addToast(`${result.failureCount} failed: ${uniqueErrors.join(' | ')}`, 'error');
        }
        setTitle('');
        setBody('');
        setImageUrl('');
        setSelectedProduct('');
        
        // Refresh the global config silently so the "Failed" tokens disappear instantly from the UI
        fetchConfig();
      } else {
        throw new Error(result.error || 'Failed to send notifications');
      }
    } catch (error) {
      console.error(error);
      addToast(error.message, 'error');
      if (error.message.includes('Service Account')) {
        addToast('Please provide your Firebase Service Account JSON to the developer.', 'error');
      }
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="admin-page animate-fade-in" style={{ padding: '24px' }}>
      <div className="admin-header" style={{ marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <BellRing size={32} color="var(--primary)" />
          <div>
            <h1 className="headline-lg">Push Notifications</h1>
            <p style={{ color: 'var(--on-surface-variant)' }}>Send direct messages to your customers' devices.</p>
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '16px', marginBottom: '24px', borderBottom: '1px solid #e2e8f0', paddingBottom: '12px' }}>
        <button 
          onClick={() => setActiveTab('compose')}
          style={{ 
            background: 'none', border: 'none', padding: '8px 16px', fontSize: '16px', fontWeight: 600, cursor: 'pointer',
            color: activeTab === 'compose' ? 'var(--primary)' : '#64748b',
            borderBottom: activeTab === 'compose' ? '3px solid var(--primary)' : '3px solid transparent',
            marginBottom: '-13px'
          }}
        >
          Compose Message
        </button>
        <button 
          onClick={() => setActiveTab('history')}
          style={{ 
            background: 'none', border: 'none', padding: '8px 16px', fontSize: '16px', fontWeight: 600, cursor: 'pointer',
            color: activeTab === 'history' ? 'var(--primary)' : '#64748b',
            borderBottom: activeTab === 'history' ? '3px solid var(--primary)' : '3px solid transparent',
            marginBottom: '-13px',
            display: 'flex', alignItems: 'center', gap: '8px'
          }}
        >
          <History size={18} /> History & Analytics
        </button>
      </div>

      {activeTab === 'compose' ? (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 350px', gap: '24px' }}>
        
        {/* Composer Form */}
        <div className="card" style={{ padding: '24px' }}>
          <form onSubmit={handleSend} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            
            <section>
              <h3 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Package size={18} /> Promote a Product (Optional)
              </h3>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <input 
                  type="text" 
                  className="input-field" 
                  placeholder="Search products by name to promote..." 
                  value={productSearch}
                  onChange={(e) => setProductSearch(e.target.value)}
                  style={{ marginBottom: '4px' }}
                />
                
                <div style={{ 
                  maxHeight: '220px', 
                  overflowY: 'auto', 
                  border: '1px solid #e2e8f0', 
                  borderRadius: '12px', 
                  backgroundColor: '#f8fafc',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '4px',
                  padding: '8px'
                }}>
                  {selectedProduct && (
                    <div 
                      style={{ padding: '8px', marginBottom: '8px', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: 'var(--primary)', fontWeight: 600 }}
                      className="animate-slide-up"
                    >
                      <span>Selected Product:</span>
                      <button type="button" onClick={() => handleProductSelect('')} style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', fontSize: '13px' }}>Clear Selection</button>
                    </div>
                  )}

                  {products
                    .filter(p => p.isActive !== false)
                    .filter(p => !productSearch || (p.titleAr || p.title).toLowerCase().includes(productSearch.toLowerCase()))
                    .map(p => {
                      const isSelected = selectedProduct === p.id;
                      return (
                        <div 
                          key={p.id} 
                          onClick={() => handleProductSelect(isSelected ? '' : p.id)}
                          style={{ 
                            display: 'flex', 
                            alignItems: 'center', 
                            gap: '12px', 
                            padding: '8px 12px', 
                            borderRadius: '8px',
                            cursor: 'pointer',
                            backgroundColor: isSelected ? 'var(--primary-light)' : 'transparent',
                            border: isSelected ? '1px solid var(--primary)' : '1px solid transparent',
                            transition: 'all 0.2s ease',
                          }}
                          className={isSelected ? 'animate-bounce-subtle' : ''}
                        >
                          <div style={{ width: '40px', height: '40px', borderRadius: '6px', overflow: 'hidden', backgroundColor: '#e2e8f0', flexShrink: 0 }}>
                            {p.images && p.images[0] ? (
                              <img src={p.images[0].startsWith('http') ? p.images[0] : `${window.location.origin}${p.images[0]}`} alt="product" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            ) : (
                              <Package size={20} color="#94a3b8" style={{ margin: '10px' }} />
                            )}
                          </div>
                          <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                            <span style={{ fontSize: '14px', fontWeight: isSelected ? 700 : 500, color: isSelected ? 'var(--primary)' : 'inherit' }}>{p.titleAr || p.title}</span>
                            <span style={{ fontSize: '12px', color: '#64748b' }}>{p.offerPrice || p.price} EGP</span>
                          </div>
                          {isSelected && (
                            <div style={{ width: '20px', height: '20px', borderRadius: '50%', backgroundColor: 'var(--primary)', color: 'white', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                              ✓
                            </div>
                          )}
                        </div>
                      );
                  })}
                  {products.filter(p => !productSearch || (p.titleAr || p.title).toLowerCase().includes(productSearch.toLowerCase())).length === 0 && (
                    <div style={{ padding: '24px', textAlign: 'center', color: '#64748b', fontSize: '14px' }}>
                      No products found.
                    </div>
                  )}
                </div>
              </div>
            </section>

            <hr style={{ borderTop: '1px solid #e2e8f0' }} />

            <section>
              <h3 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <BellRing size={18} /> Message Content
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div>
                  <label className="input-label">Notification Title <span style={{ color: 'red' }}>*</span></label>
                  <input type="text" className="input-field" value={title} onChange={e => setTitle(e.target.value)} required placeholder="e.g. Huge Flash Sale!" />
                </div>
                <div>
                  <label className="input-label">Notification Body <span style={{ color: 'red' }}>*</span></label>
                  <textarea className="input-field" value={body} onChange={e => setBody(e.target.value)} required placeholder="e.g. Click here to get 50% off all smartwatches today only." rows={3} />
                </div>
                <div>
                  <label className="input-label">Image URL (Optional)</label>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <ImageIcon size={40} color="#cbd5e1" style={{ padding: '8px', border: '1px solid #e2e8f0', borderRadius: '8px' }} />
                    <input type="url" className="input-field" value={imageUrl} onChange={e => setImageUrl(e.target.value)} placeholder="https://example.com/image.jpg" />
                  </div>
                </div>
              </div>
            </section>

            <hr style={{ borderTop: '1px solid #e2e8f0' }} />

            <section>
              <h3 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Filter size={18} /> Targeting Options
              </h3>
              <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', marginBottom: '12px' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                  <input type="radio" checked={targetType === 'all'} onChange={() => setTargetType('all')} /> All Subscribers
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                  <input type="radio" checked={targetType === 'category'} onChange={() => setTargetType('category')} /> Bought Category
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                  <input type="radio" checked={targetType === 'city'} onChange={() => setTargetType('city')} /> Specific City
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                  <input type="radio" checked={targetType === 'specific'} onChange={() => setTargetType('specific')} /> Specific Customers
                </label>
              </div>

              {targetType === 'category' && (
                <select className="input-field" value={targetCategory} onChange={e => setTargetCategory(e.target.value)}>
                  <option value="">Select Category...</option>
                  {availableCategories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                </select>
              )}
              {targetType === 'city' && (
                <select className="input-field" value={targetCity} onChange={e => setTargetCity(e.target.value)}>
                  <option value="">Select City...</option>
                  {availableCities.map(city => <option key={city} value={city}>{city}</option>)}
                </select>
              )}
              {targetType === 'specific' && (
                <div style={{ maxHeight: '200px', overflowY: 'auto', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '12px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {users.filter(u => u.fcmTokens && u.fcmTokens.size > 0).length === 0 && (
                    <div style={{ color: '#64748b', fontSize: '13px', textAlign: 'center', padding: '12px' }}>No known customers with active devices found.</div>
                  )}
                  {users.filter(u => u.fcmTokens && u.fcmTokens.size > 0).map(user => (
                    <label key={user.id} style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer', padding: '8px', backgroundColor: '#f8fafc', borderRadius: '6px' }}>
                      <input 
                        type="checkbox" 
                        checked={selectedUserIds.includes(user.id)}
                        onChange={(e) => {
                          if (e.target.checked) setSelectedUserIds([...selectedUserIds, user.id]);
                          else setSelectedUserIds(selectedUserIds.filter(id => id !== user.id));
                        }}
                        style={{ width: '16px', height: '16px', accentColor: 'var(--primary)' }}
                      />
                      <div style={{ display: 'flex', flexDirection: 'column' }}>
                        <span style={{ fontSize: '14px', fontWeight: 600 }}>{user.name}</span>
                        <span style={{ fontSize: '12px', color: '#64748b' }}>{user.phone} • {user.fcmTokens.size} device(s)</span>
                      </div>
                    </label>
                  ))}
                </div>
              )}
              
              <div style={{ marginTop: '12px', padding: '12px', backgroundColor: '#f0f9ff', borderRadius: '8px', color: '#0369a1', fontSize: '14px', fontWeight: 500 }}>
                This message will be sent to <strong>{targetType === 'all' ? `All Subscribers (${targetUsers.length} Customers + ${activeAnonymousTokens.length} Anonymous)` : `${targetUsers.length} Customers`}</strong> ({totalTokens} devices).
              </div>
            </section>

            <button type="submit" className="btn btn-add-cart" disabled={isSending || totalTokens === 0} style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px', padding: '16px', fontSize: '16px' }}>
              {isSending ? 'Sending...' : <><Send size={20} /> Send Notification Now</>}
            </button>
          </form>
        </div>

        {/* Live Preview */}
        <div>
          <div style={{ position: 'sticky', top: '24px' }}>
            <h3 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '16px' }}>Live Preview</h3>
            
            <div style={{ 
              backgroundColor: '#ffffff', 
              borderRadius: '24px', 
              boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
              overflow: 'hidden',
              width: '100%',
              border: '4px solid #1e293b'
            }}>
              <div style={{ backgroundColor: '#1e293b', color: 'white', padding: '8px', textAlign: 'center', fontSize: '12px', fontWeight: 600 }}>
                Lock Screen
              </div>
              <div style={{ padding: '24px 16px', backgroundColor: '#f8fafc', minHeight: '300px' }}>
                
                {/* Fake Notification Bubble */}
                <div style={{ 
                  backgroundColor: 'white', 
                  borderRadius: '16px', 
                  padding: '12px',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '8px'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div style={{ width: '20px', height: '20px', backgroundColor: 'var(--primary)', borderRadius: '4px', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                      <Smartphone size={14} color="white" />
                    </div>
                    <span style={{ fontSize: '12px', fontWeight: 500, color: '#64748b' }}>Diar Store • now</span>
                  </div>
                  
                  <div style={{ display: 'flex', gap: '12px' }}>
                    <div style={{ flex: 1 }}>
                      <h4 style={{ margin: 0, fontSize: '14px', fontWeight: 600 }}>{title || 'Notification Title'}</h4>
                      <p style={{ margin: 0, fontSize: '13px', color: '#475569', marginTop: '2px', lineHeight: 1.4 }}>
                        {body || 'This is how your message will look on a customer\'s phone.'}
                      </p>
                    </div>
                    {imageUrl && (
                      <div style={{ width: '48px', height: '48px', flexShrink: 0, borderRadius: '8px', overflow: 'hidden' }}>
                        <img src={imageUrl} alt="preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      </div>
                    )}
                  </div>
                </div>

              </div>
            </div>

          </div>
        </div>
      ) : (
        <div className="card" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
            <h2 style={{ fontSize: '18px', fontWeight: 600 }}>Past Notifications</h2>
            <button onClick={fetchHistory} className="btn" style={{ padding: '8px 16px', backgroundColor: '#f1f5f9', color: '#0f172a' }}>
              Refresh Data
            </button>
          </div>

          {historyLoading ? (
            <div style={{ textAlign: 'center', padding: '40px', color: '#64748b' }}>Loading history...</div>
          ) : history.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px', color: '#64748b' }}>No notifications sent yet.</div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {history.map(item => {
                const totalSent = item.successCount + item.failureCount;
                const ctr = item.successCount > 0 ? ((item.clicks.length / item.successCount) * 100).toFixed(1) : 0;
                const isExpanded = expandedRow === item._id;

                return (
                  <div key={item._id} style={{ border: '1px solid #e2e8f0', borderRadius: '12px', overflow: 'hidden' }}>
                    <div 
                      onClick={() => setExpandedRow(isExpanded ? null : item._id)}
                      style={{ 
                        padding: '16px', 
                        backgroundColor: '#f8fafc', 
                        display: 'grid', 
                        gridTemplateColumns: '2fr 1fr 1fr 1fr auto', 
                        gap: '16px', 
                        alignItems: 'center',
                        cursor: 'pointer'
                      }}
                    >
                      <div>
                        <div style={{ fontWeight: 600, fontSize: '15px' }}>{item.title}</div>
                        <div style={{ fontSize: '12px', color: '#64748b', marginTop: '4px' }}>
                          {new Date(item.sentAt).toLocaleString()} • Target: {item.targetType}
                        </div>
                      </div>
                      <div style={{ textAlign: 'center' }}>
                        <div style={{ fontSize: '20px', fontWeight: 700, color: 'var(--success)' }}>{item.successCount}</div>
                        <div style={{ fontSize: '12px', color: '#64748b' }}>Delivered</div>
                      </div>
                      <div style={{ textAlign: 'center' }}>
                        <div style={{ fontSize: '20px', fontWeight: 700, color: 'var(--primary)' }}>{item.clicks.length}</div>
                        <div style={{ fontSize: '12px', color: '#64748b' }}>Clicks</div>
                      </div>
                      <div style={{ textAlign: 'center' }}>
                        <div style={{ fontSize: '20px', fontWeight: 700, color: '#f59e0b' }}>{ctr}%</div>
                        <div style={{ fontSize: '12px', color: '#64748b' }}>CTR</div>
                      </div>
                      <div>
                        {isExpanded ? <ChevronUp size={20} color="#64748b" /> : <ChevronDown size={20} color="#64748b" />}
                      </div>
                    </div>

                    {isExpanded && (
                      <div style={{ padding: '16px', borderTop: '1px solid #e2e8f0', backgroundColor: '#ffffff' }} className="animate-slide-up">
                        <h4 style={{ fontSize: '14px', fontWeight: 600, marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <MousePointerClick size={16} /> Click Tracking ({item.clicks.length})
                        </h4>
                        
                        {item.clicks.length === 0 ? (
                          <div style={{ color: '#64748b', fontSize: '13px', padding: '12px', backgroundColor: '#f1f5f9', borderRadius: '8px', textAlign: 'center' }}>
                            No clicks recorded for this notification yet.
                          </div>
                        ) : (
                          <div style={{ maxHeight: '300px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            {item.clicks.map((click, idx) => {
                              // If it's a known user, userId will be their phone number. Let's find them!
                              const customer = click.userId ? users.find(u => u.id === click.userId) : null;
                              
                              return (
                                <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px', border: '1px solid #e2e8f0', borderRadius: '8px' }}>
                                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                    <div style={{ width: '32px', height: '32px', borderRadius: '50%', backgroundColor: customer ? 'var(--primary-light)' : '#f1f5f9', display: 'flex', justifyContent: 'center', alignItems: 'center', color: customer ? 'var(--primary)' : '#94a3b8' }}>
                                      <User size={16} />
                                    </div>
                                    <div>
                                      {customer ? (
                                        <Link to={`/diaradmin26/users/${customer.id}`} style={{ fontWeight: 600, color: 'var(--primary)', textDecoration: 'none' }}>
                                          {customer.name} ({customer.phone})
                                        </Link>
                                      ) : (
                                        <div style={{ fontWeight: 600, color: '#475569' }}>Anonymous User</div>
                                      )}
                                      <div style={{ fontSize: '12px', color: '#64748b', marginTop: '2px' }}>
                                        Clicked at: {new Date(click.clickedAt).toLocaleString()}
                                      </div>
                                    </div>
                                  </div>
                                  <div style={{ fontSize: '11px', color: '#cbd5e1', fontFamily: 'monospace' }}>
                                    Token: ...{click.token.slice(-6)}
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
