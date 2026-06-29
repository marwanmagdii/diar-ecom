import React, { useState, useEffect, useMemo } from 'react';
import { useProducts } from '../context/ProductContext';
import { useStoreConfig } from '../context/StoreConfigContext';
import ProductCard from '../components/ProductCard';
import { Search, Filter, X, LayoutGrid, Smartphone, Shirt, Home as HomeIcon, Sparkles, Watch, Droplet, Tag } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { useSearchParams, Link, useNavigate, useLocation } from 'react-router-dom';

export default function Shop() {
  const { products, loading, error } = useProducts();
  const { config } = useStoreConfig();
  const { t, language } = useLanguage();
  const [searchParams] = useSearchParams();
  const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || '');
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    let touchStartY = 0;

    const handleTouchStart = (e) => {
      touchStartY = e.touches[0].clientY;
    };

    const handleTouchMove = (e) => {
      if (window.scrollY <= 0) {
        const touchY = e.touches[0].clientY;
        if (touchY > touchStartY + 100) { // Swiped down
          navigate('/', { state: { direction: 'down' } });
        }
      }
    };

    const handleWheel = (e) => {
      if (window.scrollY <= 0 && e.deltaY < -50) { // Scrolled up
        navigate('/', { state: { direction: 'down' } });
      }
    };

    window.addEventListener('touchstart', handleTouchStart);
    window.addEventListener('touchmove', handleTouchMove);
    window.addEventListener('wheel', handleWheel);

    return () => {
      window.removeEventListener('touchstart', handleTouchStart);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('wheel', handleWheel);
    };
  }, [navigate]);
  
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [selectedColors, setSelectedColors] = useState([]);
  
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState(false);

  useEffect(() => {
    if (searchParams.get('q') !== null) {
      setSearchQuery(searchParams.get('q'));
    }
    if (searchParams.get('category')) {
      setSelectedCategories([searchParams.get('category')]);
    }
  }, [searchParams]);

  // Only show active products in the shop
  const activeProducts = useMemo(() => products.filter(p => p.isActive !== false), [products]);

  // Extract valid categories and colors, and min/max prices
  const validCategories = new Set();
  const validColors = new Set();
  let absoluteMinPrice = 0;
  let absoluteMaxPrice = 1000;

  activeProducts.forEach(p => {
    validCategories.add(p.category);
    
    // Extract colors
    let colors = [];
    const colorOpt = p.options?.find(o => o.name.toLowerCase() === 'color' || o.name.toLowerCase() === 'لون');
    if (colorOpt) colors = colorOpt.values;
    else if (p.color) colors = Array.isArray(p.color) ? p.color : [p.color];
    colors.forEach(c => validColors.add(c));
    
    // Extract prices
    const price = p.hasOffer && p.offerPrice ? Number(p.offerPrice) : Number(p.price);
    if (price < absoluteMinPrice || absoluteMinPrice === 0) absoluteMinPrice = price;
    if (price > absoluteMaxPrice || absoluteMaxPrice === 1000) absoluteMaxPrice = price;
  });

  // Clean and deduplicate main categories based on active products
  const mainCategories = [];
  const seenCats = new Set();
  (config.categories || []).forEach(cat => {
    const name = typeof cat === 'string' ? cat : cat.name;
    if (name && !seenCats.has(name)) {
      // Check if this category or its subcategories have products
      const hasProducts = validCategories.has(name) || (typeof cat === 'object' && cat.subcategories && cat.subcategories.some(sub => validCategories.has(sub)));
      if (hasProducts) {
        seenCats.add(name);
        // Only keep subcategories that have products
        const filteredCat = typeof cat === 'object' ? {
          ...cat,
          subcategories: (cat.subcategories || []).filter(sub => validCategories.has(sub))
        } : cat;
        mainCategories.push(filteredCat);
      }
    }
  });

  const handleCategoryToggle = (catName) => {
    setSelectedCategories(prev => 
      prev.includes(catName) ? prev.filter(c => c !== catName) : [...prev, catName]
    );
  };

  const handleColorToggle = (color) => {
    setSelectedColors(prev => 
      prev.includes(color) ? prev.filter(c => c !== color) : [...prev, color]
    );
  };

  const resetFilters = () => {
    setSelectedCategories([]);
    setSelectedColors([]);
    setMinPrice('');
    setMaxPrice('');
    setSearchQuery('');
  };

  const getCatName = (catName, isSub = false) => {
    if (language !== 'ar') return catName;
    for (const c of config.categories || []) {
      if (typeof c === 'object') {
        if (!isSub && c.name === catName && c.nameAr) return c.nameAr;
        if (isSub && c.subcategories) {
          const idx = c.subcategories.indexOf(catName);
          if (idx !== -1 && c.subcategoriesAr && c.subcategoriesAr[idx]) {
            return c.subcategoriesAr[idx];
          }
        }
      }
    }
    return t(catName) || catName;
  };

  const getCategoryIcon = (catName) => {
    const lower = catName.toLowerCase();
    if (lower.includes('electronic') || lower.includes('tech') || lower.includes('mobile')) return <Smartphone size={16} strokeWidth={2.5} style={{ opacity: 0.7 }} />;
    if (lower.includes('cloth') || lower.includes('fashion') || lower.includes('apparel') || lower.includes('wear')) return <Shirt size={16} strokeWidth={2.5} style={{ opacity: 0.7 }} />;
    if (lower.includes('home') || lower.includes('kitchen') || lower.includes('decor')) return <HomeIcon size={16} strokeWidth={2.5} style={{ opacity: 0.7 }} />;
    if (lower.includes('beauty') || lower.includes('makeup')) return <Sparkles size={16} strokeWidth={2.5} style={{ opacity: 0.7 }} />;
    if (lower.includes('accessor')) return <Watch size={16} strokeWidth={2.5} style={{ opacity: 0.7 }} />;
    if (lower.includes('skin') || lower.includes('care')) return <Droplet size={16} strokeWidth={2.5} style={{ opacity: 0.7 }} />;
    return <Tag size={16} strokeWidth={2.5} style={{ opacity: 0.7 }} />;
  };

  const filteredProducts = activeProducts.filter(p => {
    // Category match
    let matchesCategory = selectedCategories.length === 0 || selectedCategories.includes(p.category);
    
    // Check if product's category is a subcategory of a selected main category
    if (!matchesCategory && selectedCategories.length > 0) {
      for (const selCat of selectedCategories) {
        const catObj = mainCategories.find(c => (c.name || c) === selCat);
        if (catObj && catObj.subcategories && catObj.subcategories.includes(p.category)) {
          matchesCategory = true;
          break;
        }
      }
    }

    const matchesSearch = p.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          (p.titleAr && p.titleAr.toLowerCase().includes(searchQuery.toLowerCase())) ||
                          (p.description && p.description.toLowerCase().includes(searchQuery.toLowerCase())) ||
                          (p.descriptionAr && p.descriptionAr.toLowerCase().includes(searchQuery.toLowerCase()));
    
    // Color match
    let matchesColor = true;
    if (selectedColors.length > 0) {
      let pColors = [];
      const colorOpt = p.options?.find(o => o.name.toLowerCase() === 'color' || o.name.toLowerCase() === 'لون');
      if (colorOpt) pColors = colorOpt.values;
      else if (p.color) pColors = Array.isArray(p.color) ? p.color : [p.color];
      
      matchesColor = selectedColors.some(c => pColors.includes(c));
    }

    // Price filtering
    const price = p.hasOffer && p.offerPrice ? Number(p.offerPrice) : Number(p.price);
    const matchesMinPrice = minPrice === '' || price >= Number(minPrice);
    const matchesMaxPrice = maxPrice === '' || price <= Number(maxPrice);

    return matchesCategory && matchesSearch && matchesColor && matchesMinPrice && matchesMaxPrice;
  });

  return (
    <main className={`container pt-4 pb-4 ${location.state?.direction === 'up' ? 'page-slide-up' : ''}`}>

      <div className="shop-layout" dir={language === 'ar' ? 'rtl' : 'ltr'}>
        {/* Sidebar Filters */}
        <aside className={`shop-sidebar ${isMobileFiltersOpen ? 'open' : ''}`}>
          {isMobileFiltersOpen && (
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <h2 className="shop-sidebar-title" style={{ margin: 0 }}>{language === 'ar' ? 'تصفية المنتجات' : 'Filters'}</h2>
              <button className="icon-btn" onClick={() => setIsMobileFiltersOpen(false)}>
                <X size={24} />
              </button>
            </div>
          )}

          {/* Categories */}
          <div className="shop-sidebar-section">
            <h3 className="shop-sidebar-title">{language === 'ar' ? 'الأقسام' : 'Categories'}</h3>
            <div className="shop-sidebar-list">
              {mainCategories.map((cat, i) => {
                const catName = typeof cat === 'string' ? cat : cat.name;
                const isChecked = selectedCategories.includes(catName);
                return (
                  <div key={i} style={{ display: 'flex', flexDirection: 'column' }}>
                    <label className={`cat-checkbox-wrapper ${isChecked ? 'active' : ''}`}>
                      <input 
                        type="checkbox" 
                        className="sr-only"
                        checked={isChecked} 
                        onChange={() => handleCategoryToggle(catName)} 
                      />
                      <div className="cat-custom-checkbox">
                        {isChecked && <svg width="10" height="8" viewBox="0 0 10 8" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M1 4L3.5 6.5L9 1" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>}
                      </div>
                      <span style={{ fontSize: '15px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        {getCategoryIcon(catName)}
                        {getCatName(catName)}
                      </span>
                    </label>

                    {/* Subcategories */}
                    {cat.subcategories && cat.subcategories.length > 0 && (
                      <div className="subcat-wrapper">
                        {cat.subcategories.map((sub, j) => {
                          const isSubChecked = selectedCategories.includes(sub);
                          return (
                            <label key={j} className={`cat-checkbox-wrapper ${isSubChecked ? 'active' : ''}`} style={{ padding: '6px 10px' }}>
                              <input 
                                type="checkbox" 
                                className="sr-only"
                                checked={isSubChecked} 
                                onChange={() => handleCategoryToggle(sub)} 
                              />
                              <div className="cat-custom-checkbox" style={{ width: '16px', height: '16px' }}>
                                {isSubChecked && <svg width="8" height="6" viewBox="0 0 10 8" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M1 4L3.5 6.5L9 1" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>}
                              </div>
                              <span style={{ fontSize: '14px' }}>{getCatName(sub, true)}</span>
                            </label>
                          )
                        })}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </div>

          {/* Color Filter */}
          {validColors.size > 0 && (
            <div className="shop-sidebar-section">
              <h3 className="shop-sidebar-title">{language === 'ar' ? 'اللون' : 'Color'}</h3>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                {Array.from(validColors).map((color, i) => {
                  const isChecked = selectedColors.includes(color);
                  const colorMap = {
                    'black': '#000000', 'white': '#ffffff', 'red': '#ef4444', 
                    'blue': '#3b82f6', 'green': '#10b981', 'yellow': '#eab308',
                    'gray': '#6b7280', 'silver': '#e5e7eb', 'gold': '#fbbf24',
                    'pink': '#ec4899', 'purple': '#a855f7', 'brown': '#92400e',
                    'أسود': '#000000', 'أبيض': '#ffffff', 'أحمر': '#ef4444',
                    'أزرق': '#3b82f6', 'أخضر': '#10b981', 'أصفر': '#eab308',
                    'رمادي': '#6b7280', 'فضي': '#e5e7eb', 'ذهبي': '#fbbf24'
                  };
                  const hex = colorMap[color.toLowerCase()] || color;
                  return (
                    <label key={i} title={color} style={{ 
                      width: '28px', height: '28px', borderRadius: '50%', 
                      backgroundColor: hex,
                      border: hex === '#ffffff' || color.toLowerCase() === 'white' || color === 'أبيض' ? '1px solid #cbd5e1' : '1px solid rgba(0,0,0,0.1)',
                      boxShadow: isChecked ? '0 0 0 2px #ffffff, 0 0 0 4px var(--primary)' : 'none',
                      cursor: 'pointer',
                      display: 'block'
                    }}>
                      <input 
                        type="checkbox" 
                        checked={isChecked} 
                        onChange={() => handleColorToggle(color)} 
                        style={{ display: 'none' }}
                      />
                    </label>
                  );
                })}
              </div>
            </div>
          )}

          {/* Price Range */}
          <div className="shop-sidebar-section">
            <h3 className="shop-sidebar-title">{language === 'ar' ? 'السعر' : 'Price Range'}</h3>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
              <input 
                type="number" 
                placeholder={language === 'ar' ? 'من' : 'Min'} 
                value={minPrice}
                onChange={(e) => setMinPrice(e.target.value)}
                style={{ width: '100%', padding: '8px 12px', border: '1px solid #cbd5e1', borderRadius: '8px', outline: 'none' }}
              />
              <span style={{ color: '#94a3b8' }}>-</span>
              <input 
                type="number" 
                placeholder={language === 'ar' ? 'إلى' : 'Max'} 
                value={maxPrice}
                onChange={(e) => setMaxPrice(e.target.value)}
                style={{ width: '100%', padding: '8px 12px', border: '1px solid #cbd5e1', borderRadius: '8px', outline: 'none' }}
              />
            </div>
            {absoluteMaxPrice > absoluteMinPrice && (
              <div style={{ marginBottom: '12px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: '#64748b', marginBottom: '8px' }}>
                  <span>{absoluteMinPrice} {t('currency')}</span>
                  <span>{absoluteMaxPrice} {t('currency')}</span>
                </div>
                <input 
                  type="range" 
                  min={absoluteMinPrice} 
                  max={absoluteMaxPrice} 
                  value={maxPrice || absoluteMaxPrice} 
                  onChange={(e) => {
                    setMaxPrice(e.target.value);
                    if (minPrice === '') setMinPrice(absoluteMinPrice);
                  }}
                  style={{ width: '100%', accentColor: 'var(--primary)', cursor: 'pointer' }}
                />
              </div>
            )}
            
            <button 
              onClick={resetFilters}
              style={{ width: '100%', padding: '8px', backgroundColor: '#f1f5f9', color: '#475569', border: '1px solid #cbd5e1', borderRadius: '8px', cursor: 'pointer', fontWeight: 600, marginTop: '8px', transition: 'background 0.2s ease' }}
              onMouseEnter={e => e.currentTarget.style.backgroundColor = '#e2e8f0'}
              onMouseLeave={e => e.currentTarget.style.backgroundColor = '#f1f5f9'}
            >
              {language === 'ar' ? 'إعادة ضبط' : 'Reset Filters'}
            </button>
          </div>

          {isMobileFiltersOpen && (
            <button 
              className="btn btn-primary" 
              style={{ width: '100%', marginTop: '24px' }}
              onClick={() => setIsMobileFiltersOpen(false)}
            >
              {language === 'ar' ? 'عرض النتائج' : 'Show Results'} ({filteredProducts.length})
            </button>
          )}
        </aside>

        {/* Product Grid */}
        <section className="shop-main">

          {/* Search Bar aligned with products */}
          <div style={{ marginBottom: '24px', display: 'flex', alignItems: 'center', backgroundColor: '#ffffff', border: '1px solid #cbd5e1', borderRadius: '12px', padding: '12px 16px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
            <Search size={20} color="#64748b" style={{ marginRight: '12px', marginLeft: language === 'ar' ? '12px' : '0' }} />
            <input 
              type="text" 
              placeholder={t('searchPlaceholder')} 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{ border: 'none', outline: 'none', width: '100%', fontSize: '16px' }}
              dir={language === 'ar' ? 'rtl' : 'ltr'}
            />
          </div>

          <button className="shop-mobile-filter-btn" onClick={() => setIsMobileFiltersOpen(true)}>
            <Filter size={20} /> {language === 'ar' ? 'تصفية المنتجات' : 'Filter Products'}
          </button>

          <div className="product-grid">
            {loading ? (
              <div style={{ textAlign: 'center', gridColumn: '1 / -1', padding: '40px', color: '#64748b' }}>
                <div className="spinner" style={{ margin: '0 auto 16px', border: '3px solid #f3f3f3', borderTop: '3px solid var(--primary)', borderRadius: '50%', width: '30px', height: '30px', animation: 'spin 1s linear infinite' }}></div>
                <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
                Loading products...
              </div>
            ) : error ? (
              <div style={{ textAlign: 'center', gridColumn: '1 / -1', padding: '40px', backgroundColor: '#fef2f2', borderRadius: '12px', border: '1px solid #fecaca', color: '#ef4444' }}>
                <p style={{ fontWeight: '500', marginBottom: '8px' }}>Oops! Could not load products.</p>
                <p style={{ fontSize: '14px', color: '#b91c1c' }}>Please check your internet connection or try again later.</p>
              </div>
            ) : filteredProducts.length > 0 ? (
              filteredProducts.map(p => <ProductCard key={p.id} product={p} />)
            ) : (
              <div style={{ textAlign: 'center', gridColumn: '1 / -1', padding: '60px 20px', backgroundColor: '#f8fafc', borderRadius: '16px' }}>
                <Search size={48} color="#cbd5e1" style={{ margin: '0 auto 16px' }} />
                <p style={{ fontSize: '18px', fontWeight: 600, color: '#0f172a', margin: '0 0 8px 0' }}>{t('noProducts')}</p>
                <p style={{ color: '#64748b', margin: 0 }}>
                  {language === 'ar' ? 'جرب تغيير فلاتر البحث للعثور على ما تبحث عنه.' : 'Try adjusting your filters to find what you are looking for.'}
                </p>
                <button 
                  className="btn btn-outline" 
                  style={{ marginTop: '24px' }}
                  onClick={resetFilters}
                >
                  {language === 'ar' ? 'مسح الفلاتر' : 'Clear Filters'}
                </button>
              </div>
            )}
          </div>
        </section>
      </div>
    </main>
  );
}
