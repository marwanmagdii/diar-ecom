import React, { createContext, useContext, useState, useEffect } from 'react';

const StoreConfigContext = createContext();

export const useStoreConfig = () => useContext(StoreConfigContext);

const defaultSettings = {
  storeInfo: {
    email: 'contact@diar.com',
    phone: '+20 123 456 7890',
    address: 'Cairo, Egypt',
    facebook: 'https://facebook.com/diar',
    instagram: 'https://instagram.com/diar',
    twitter: '',
    tiktok: ''
  },
  loggingSettings: {
    Marwan: true,
    Roaya: true,
    Customers: true
  },
  clarityProjectId: '',
  collections: [
    { id: 'c1', name: 'Flash Sale', type: 'auto', category: 'All', productIds: [], hidden: false, count: 3 },
    { id: 'c2', name: 'Curated Picks', type: 'manual', category: 'All', productIds: ['p1', 'p2'], hidden: false, count: 6 }
  ],
  categories: [
    { name: 'Electronics', subcategories: ['Smartphones', 'Laptops', 'Accessories'] },
    { name: 'Clothing', subcategories: ['Men', 'Women', 'Kids'] },
    { name: 'Home & Kitchen', subcategories: ['Furniture', 'Decor', 'Appliances'] },
    { name: 'Beauty & Health', subcategories: ['Skincare', 'Makeup', 'Wellness'] },
    { name: 'Baby Essentials', subcategories: ['Baby Care', 'Bath & Skin', 'Diapers'] }
  ],
  promoCodes: [
    {
      id: 'promo1',
      code: 'WELCOME10',
      discountType: 'percentage',
      discountValue: 10,
      commissionType: 'percentage',
      commissionValue: 5,
      isActive: true,
      usageCount: 0,
      totalRevenue: 0
    }
  ],
  locations: [
    { id: 'cairo', nameEn: 'Cairo', nameAr: 'القاهرة', isActive: true, districts: [
      { id: 'al_ameria', nameEn: 'Al-Ameria', nameAr: 'الأميرية', isActive: true },
      { id: 'el_sahel', nameEn: 'El-Sahel', nameAr: 'الساحل', isActive: true },
      { id: 'el_sharabia', nameEn: 'El-Sharabia', nameAr: 'الشرابية', isActive: true },
      { id: 'el_zawia_el_hamra', nameEn: 'El-Zawia El-Hamra', nameAr: 'الزاوية الحمراء', isActive: true },
      { id: 'el_zaiton', nameEn: 'El-Zaiton', nameAr: 'الزيتون', isActive: true },
      { id: 'hadayek_el_kobba', nameEn: 'Hadayek El-Kobba', nameAr: 'حدائق القبة', isActive: true },
      { id: 'rod_el_farg', nameEn: 'Rod El-Farg', nameAr: 'روض الفرج', isActive: true },
      { id: 'shubra', nameEn: 'Shubra', nameAr: 'شبرا', isActive: true },
      { id: 'dar_el_salam', nameEn: 'Dar El-Salam', nameAr: 'دار السلام', isActive: true },
      { id: 'el_basatin', nameEn: 'El-Basatin', nameAr: 'البساتين', isActive: true },
      { id: 'el_khalifa', nameEn: 'El-Khalifa', nameAr: 'الخليفة', isActive: true },
      { id: 'maadi', nameEn: 'Maadi', nameAr: 'المعادي', isActive: true },
      { id: 'el_maasara', nameEn: 'El-Maasara', nameAr: 'المعصرة', isActive: true },
      { id: 'mokattam', nameEn: 'Mokattam', nameAr: 'المقطم', isActive: true },
      { id: 'el_sayeda_zeinab', nameEn: 'El-Sayeda Zeinab', nameAr: 'السيدة زينب', isActive: true },
      { id: 'el_tebin', nameEn: 'El-Tebin', nameAr: 'التبين', isActive: true },
      { id: 'helwan', nameEn: 'Helwan', nameAr: 'حلوان', isActive: true },
      { id: 'old_cairo', nameEn: 'Old Cairo', nameAr: 'مصر القديمة', isActive: true },
      { id: '15th_of_may', nameEn: '15th of May', nameAr: '15 مايو', isActive: true },
      { id: 'tora', nameEn: 'Tora', nameAr: 'طرة', isActive: true },
      { id: 'abdeen', nameEn: 'Abdeen', nameAr: 'عابدين', isActive: true },
      { id: 'azbakia', nameEn: 'Azbakia', nameAr: 'الأزبكية', isActive: true },
      { id: 'bab_el_shaaria', nameEn: 'Bab El-Shaaria', nameAr: 'باب الشعرية', isActive: true },
      { id: 'boulaq', nameEn: 'Boulaq', nameAr: 'بولاق', isActive: true },
      { id: 'downtown', nameEn: 'Downtown', nameAr: 'وسط البلد', isActive: true },
      { id: 'el_waily', nameEn: 'El-Waily', nameAr: 'الوايلي', isActive: true },
      { id: 'manshaet_naser', nameEn: 'Manshaet Naser', nameAr: 'منشأة ناصر', isActive: true },
      { id: 'moski', nameEn: 'Moski', nameAr: 'الموسكي', isActive: true },
      { id: 'ain_shams', nameEn: 'Ain Shams', nameAr: 'عين شمس', isActive: true },
      { id: 'el_marg', nameEn: 'El-Marg', nameAr: 'المرج', isActive: true },
      { id: 'el_mataria', nameEn: 'El-Mataria', nameAr: 'المطرية', isActive: true },
      { id: 'el_nozha', nameEn: 'El-Nozha', nameAr: 'النزهة', isActive: true },
      { id: 'el_salam', nameEn: 'El-Salam', nameAr: 'السلام', isActive: true },
      { id: 'nasr_city', nameEn: 'Nasr City', nameAr: 'مدينة نصر', isActive: true },
      { id: 'heliopolis', nameEn: 'Heliopolis', nameAr: 'مصر الجديدة', isActive: true },
      { id: 'new_cairo', nameEn: 'New Cairo', nameAr: 'القاهرة الجديدة', isActive: true },
      { id: 'zamalek', nameEn: 'Zamalek', nameAr: 'الزمالك', isActive: true },
      { id: 'rehab_city', nameEn: 'Rehab City', nameAr: 'مدينة الرحاب', isActive: true },
      { id: 'madinaty', nameEn: 'Madinaty', nameAr: 'مدينتي', isActive: true },
      { id: 'shorouk_city', nameEn: 'Shorouk City', nameAr: 'مدينة الشروق', isActive: true },
      { id: 'obour_city', nameEn: 'Obour City', nameAr: 'مدينة العبور', isActive: true },
      { id: 'badr_city', nameEn: 'Badr City', nameAr: 'مدينة بدر', isActive: true },
      { id: 'new_admin_capital', nameEn: 'New Administrative Capital', nameAr: 'العاصمة الإدارية الجديدة', isActive: true },
    ]},
    { id: 'giza', nameEn: 'Giza', nameAr: 'الجيزة', isActive: true, districts: [
      { id: 'agouza', nameEn: 'Agouza', nameAr: 'العجوزة', isActive: true },
      { id: 'omrania', nameEn: 'Omrania', nameAr: 'العمرانية', isActive: true },
      { id: 'haram', nameEn: 'Haram', nameAr: 'الهرم', isActive: true },
      { id: 'bulaq_dakrour', nameEn: 'Bulaq El-Dakrour', nameAr: 'بولاق الدكرور', isActive: true },
      { id: 'mohandeseen', nameEn: 'Mohandeseen', nameAr: 'المهندسين', isActive: true },
      { id: 'dokki', nameEn: 'Dokki', nameAr: 'الدقي', isActive: true },
      { id: 'faisal', nameEn: 'Faisal', nameAr: 'فيصل', isActive: true },
      { id: 'imbaba', nameEn: 'Imbaba', nameAr: 'إمبابة', isActive: true },
      { id: 'hadayek_ahram', nameEn: 'Hadayek El Ahram', nameAr: 'حدائق الأهرام', isActive: true },
      { id: '6th_october', nameEn: '6th of October', nameAr: 'السادس من أكتوبر', isActive: true },
      { id: 'sheikh_zayed', nameEn: 'Sheikh Zayed', nameAr: 'الشيخ زايد', isActive: true },
      { id: 'al_badrashin', nameEn: 'Al-Badrashin', nameAr: 'البدرشين', isActive: true },
      { id: 'abou_al_nomros', nameEn: 'Abou Al-Nomros', nameAr: 'أبو النمرس', isActive: true },
      { id: 'awsim', nameEn: 'Awsim', nameAr: 'أوسيم', isActive: true },
      { id: 'el_warraq', nameEn: 'El Warraq', nameAr: 'الوراق', isActive: true },
      { id: 'el_hawamdeya', nameEn: 'El Hawamdeya', nameAr: 'الحوامدية', isActive: true },
      { id: 'el_ayyat', nameEn: 'El Ayyat', nameAr: 'العياط', isActive: true },
      { id: 'el_saff', nameEn: 'El Saff', nameAr: 'الصف', isActive: true },
      { id: 'bahariya_oasis', nameEn: 'Bahariya Oasis', nameAr: 'الواحات البحرية', isActive: true },
      { id: 'giza_square', nameEn: 'Giza Square', nameAr: 'ميدان الجيزة', isActive: true },
    ]},
    { id: 'alexandria', nameEn: 'Alexandria', nameAr: 'الإسكندرية', isActive: true, districts: [] },
    { id: 'dakahlia', nameEn: 'Dakahlia', nameAr: 'الدقهلية', isActive: true, districts: [] },
    { id: 'red_sea', nameEn: 'Red Sea', nameAr: 'البحر الأحمر', isActive: true, districts: [] },
    { id: 'beheira', nameEn: 'Beheira', nameAr: 'البحيرة', isActive: true, districts: [] },
    { id: 'fayoum', nameEn: 'Fayoum', nameAr: 'الفيوم', isActive: true, districts: [] },
    { id: 'gharbia', nameEn: 'Gharbia', nameAr: 'الغربية', isActive: true, districts: [] },
    { id: 'ismailia', nameEn: 'Ismailia', nameAr: 'الإسماعيلية', isActive: true, districts: [] },
    { id: 'menofia', nameEn: 'Menofia', nameAr: 'المنوفية', isActive: true, districts: [] },
    { id: 'minya', nameEn: 'Minya', nameAr: 'المنيا', isActive: true, districts: [] },
    { id: 'qaliubiya', nameEn: 'Qaliubiya', nameAr: 'القليوبية', isActive: true, districts: [] },
    { id: 'new_valley', nameEn: 'New Valley', nameAr: 'الوادي الجديد', isActive: true, districts: [] },
    { id: 'suez', nameEn: 'Suez', nameAr: 'السويس', isActive: true, districts: [] },
    { id: 'aswan', nameEn: 'Aswan', nameAr: 'أسوان', isActive: true, districts: [] },
    { id: 'assiut', nameEn: 'Assiut', nameAr: 'أسيوط', isActive: true, districts: [] },
    { id: 'beni_suef', nameEn: 'Beni Suef', nameAr: 'بني سويف', isActive: true, districts: [] },
    { id: 'port_said', nameEn: 'Port Said', nameAr: 'بورسعيد', isActive: true, districts: [] },
    { id: 'damietta', nameEn: 'Damietta', nameAr: 'دمياط', isActive: true, districts: [] },
    { id: 'sharkia', nameEn: 'Sharkia', nameAr: 'الشرقية', isActive: true, districts: [] },
    { id: 'south_sinai', nameEn: 'South Sinai', nameAr: 'جنوب سيناء', isActive: true, districts: [] },
    { id: 'kafr_el_sheikh', nameEn: 'Kafr El Sheikh', nameAr: 'كفر الشيخ', isActive: true, districts: [] },
    { id: 'matrouh', nameEn: 'Matrouh', nameAr: 'مطروح', isActive: true, districts: [] },
    { id: 'luxor', nameEn: 'Luxor', nameAr: 'الأقصر', isActive: true, districts: [] },
    { id: 'qena', nameEn: 'Qena', nameAr: 'قنا', isActive: true, districts: [] },
    { id: 'north_sinai', nameEn: 'North Sinai', nameAr: 'شمال سيناء', isActive: true, districts: [] },
    { id: 'sohag', nameEn: 'Sohag', nameAr: 'سوهاج', isActive: true, districts: [] },
  ],
  shippingCost: 35,
  shippingActive: true
};

export const StoreConfigProvider = ({ children }) => {
  const [config, setConfig] = useState(defaultSettings);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch config from backend
  useEffect(() => {
    const fetchConfig = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await fetch('/api/config');
        if (response.ok) {
          const parsed = await response.json();
          let needsSync = false;
          
          // Ensure existing collections have type and productIds
          if (parsed.collections) {
            parsed.collections = parsed.collections.map(c => ({
              ...c,
              type: c.type || 'auto',
              productIds: c.productIds || []
            }));
          }
          // Remove legacy heroBanner if exists
          if (parsed.heroBanner) {
            delete parsed.heroBanner;
          }
          // Migrate legacy string categories to objects
          if (parsed.categories && parsed.categories.length > 0 && typeof parsed.categories[0] === 'string') {
            parsed.categories = parsed.categories.map(catName => ({
              name: catName,
              subcategories: []
            }));
          } else if (!parsed.categories || parsed.categories.length === 0) {
            parsed.categories = defaultSettings.categories;
            needsSync = true;
          }
          
          // Ensure promoCodes exists and deduplicate by code
          if (!parsed.promoCodes || parsed.promoCodes.length === 0) {
            parsed.promoCodes = defaultSettings.promoCodes;
            needsSync = true;
          } else {
            // Keep the LATEST promo code for any duplicate codes
            const uniquePromos = new Map();
            parsed.promoCodes.forEach(p => {
              if (p.code) {
                uniquePromos.set(p.code.toUpperCase(), p);
              }
            });
            parsed.promoCodes = Array.from(uniquePromos.values());
          }
          
          // Merge locations: DB overrides defaults (preserves admin isActive changes)
          // but defaults fill in any missing governorates
          if (parsed.locations && parsed.locations.length > 0) {
            const dbLocMap = new Map(parsed.locations.map(l => [l.id, l]));
            const mergedLocations = defaultSettings.locations.map(defLoc => {
              const dbLoc = dbLocMap.get(defLoc.id);
              if (dbLoc) return dbLoc; // DB version wins (has admin changes)
              return defLoc; // New default not yet in DB
            });
            // Also add any custom governorates from DB not in defaults
            parsed.locations.forEach(dbLoc => {
              if (!mergedLocations.find(l => l.id === dbLoc.id)) {
                mergedLocations.push(dbLoc);
              }
            });
            parsed.locations = mergedLocations;
          } else {
            parsed.locations = defaultSettings.locations;
            needsSync = true;
          }

          const finalConfig = { ...defaultSettings, ...parsed };
          setConfig(finalConfig);
          
          if (needsSync) {
            try {
              await fetch('/api/config', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(finalConfig)
              });
            } catch(e) {
              console.error("Failed to sync default config", e);
            }
          }
        } else {
          await response.text().catch(() => {});
          setError(`Failed to fetch config: ${response.statusText}`);
        }
      } catch (error) {
        console.error("Error fetching config:", error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchConfig();
  }, []);

  // Dynamically inject Microsoft Clarity
  useEffect(() => {
    const projectId = config.clarityProjectId;
    if (projectId && !window.clarity) {
      (function(c,l,a,r,i,t,y){
          c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
          t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
          y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
      })(window, document, "clarity", "script", projectId);
    }
  }, [config.clarityProjectId]);

  const saveConfig = async (newConfig) => {
    try {
      await fetch('/api/config', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newConfig)
      });
    } catch (error) {
      console.error("Error saving config:", error);
    }
  };

  const logActivity = (description) => {
    const adminName = localStorage.getItem('currentAdmin') || 'Unknown Admin';
    if (config?.loggingSettings && config.loggingSettings[adminName] === false) return;
    
    fetch('/api/logs', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        adminName,
        actionType: 'update_settings',
        description,
        details: {}
      })
    }).catch(e => console.error(e));
  };

  const updateConfig = (updates, description = 'Updated store settings') => {
    setConfig(prev => {
      const updated = { ...prev, ...updates };
      setTimeout(() => {
        saveConfig(updated);
        logActivity(description);
      }, 0);
      return updated;
    });
  };

  const updateCollections = (collections) => updateConfig({ collections }, 'Updated collections configuration');
  const updateCategories = (categories) => updateConfig({ categories }, 'Updated categories configuration');
  const updatePromoCodes = (promoCodes, desc) => updateConfig({ promoCodes }, desc || 'Updated promo codes');
  const updateLocations = (locations) => updateConfig({ locations }, 'Updated delivery locations');
  const updateShippingCost = (shippingCost) => updateConfig({ shippingCost }, 'Updated default shipping cost');
  const updateShippingActive = (shippingActive) => updateConfig({ shippingActive }, 'Toggled shipping calculation');
  const updateStoreInfo = (storeInfo) => updateConfig({ storeInfo }, 'Updated store contact info');
  const updateLoggingSettings = (loggingSettings) => updateConfig({ loggingSettings }, 'Updated system logging preferences');

  return (
    <StoreConfigContext.Provider value={{
      config,
      loading,
      error,
      updateCollections,
      updateCategories,
      updatePromoCodes,
      updateLocations,
      updateShippingCost,
      updateShippingActive,
      updateStoreInfo,
      updateLoggingSettings,
      logActivity,
      configLoading: loading
    }}>
      {children}
    </StoreConfigContext.Provider>
  );
};
