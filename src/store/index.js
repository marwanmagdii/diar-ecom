import { create } from 'zustand';
import { translations } from '../utils/translations';

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
  promoCodes: [],
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

export const useStore = create((set, get) => ({
  // ================= TOAST SLICE =================
  toasts: [],
  addToast: (message, type = 'success') => {
    const id = Date.now();
    set((state) => ({ toasts: [...state.toasts, { id, message, type }] }));
    setTimeout(() => {
      set((state) => ({ toasts: state.toasts.filter(t => t.id !== id) }));
    }, 3000);
  },
  removeToast: (id) => {
    set((state) => ({ toasts: state.toasts.filter(t => t.id !== id) }));
  },

  // ================= LANGUAGE SLICE =================
  language: typeof window !== 'undefined' ? (localStorage.getItem('storeLanguage') || 'ar') : 'ar',
  setLanguage: (lang) => {
    if (typeof document !== 'undefined') {
      document.documentElement.lang = lang;
      document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
    }
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem('storeLanguage', lang);
    }
    set({ language: lang });
  },
  toggleLanguage: () => {
    const newLang = get().language === 'en' ? 'ar' : 'en';
    get().setLanguage(newLang);
  },
  t: (key) => {
    const lang = get().language;
    return translations[lang][key] || key;
  },

  // ================= STORE CONFIG SLICE =================
  config: defaultSettings,
  configLoading: true,
  configError: null,
  
  fetchConfig: async () => {
    try {
      set({ configLoading: true, configError: null });
      const response = await fetch('/api/config');
      if (response.ok) {
        const parsed = await response.json();
        let needsSync = false;

        if (parsed.collections) {
          parsed.collections = parsed.collections.map(c => ({
            ...c, type: c.type || 'auto', productIds: c.productIds || []
          }));
        }
        if (parsed.heroBanner) delete parsed.heroBanner;
        if (parsed.categories && parsed.categories.length > 0 && typeof parsed.categories[0] === 'string') {
          parsed.categories = parsed.categories.map(catName => ({ name: catName, subcategories: [] }));
        } else if (!parsed.categories || parsed.categories.length === 0) {
          parsed.categories = defaultSettings.categories;
          needsSync = true;
        }

        if (!parsed.promoCodes) {
          parsed.promoCodes = [];
        } else {

          const uniquePromos = new Map();
          parsed.promoCodes.forEach(p => {
            if (p.code) uniquePromos.set(p.code.toUpperCase(), p);
          });
          parsed.promoCodes = Array.from(uniquePromos.values());
        }

        if (parsed.locations && parsed.locations.length > 0) {
          const dbLocMap = new Map(parsed.locations.map(l => [l.id, l]));
          const mergedLocations = defaultSettings.locations.map(defLoc => {
            const dbLoc = dbLocMap.get(defLoc.id);
            if (dbLoc) return dbLoc;
            return defLoc;
          });
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
        set({ config: finalConfig });
        
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
        set({ configError: `Failed to fetch config: ${response.statusText}` });
      }
    } catch (error) {
      console.error("Error fetching config:", error);
      set({ configError: error.message });
    } finally {
      set({ configLoading: false });
    }
  },

  logActivity: (description) => {
    const adminName = typeof localStorage !== 'undefined' ? (localStorage.getItem('currentAdmin') || 'Unknown Admin') : 'Unknown Admin';
    const config = get().config;
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
  },

  saveConfig: async (newConfig) => {
    try {
      await fetch('/api/config', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newConfig)
      });
    } catch (error) {
      console.error("Error saving config:", error);
    }
  },

  updateConfig: (updates, description = 'Updated store settings') => {
    set((state) => {
      const updated = { ...state.config, ...updates };
      setTimeout(() => {
        get().saveConfig(updated);
        get().logActivity(description);
      }, 0);
      return { config: updated };
    });
  },

  updateCollections: (collections) => get().updateConfig({ collections }, 'Updated collections configuration'),
  updateCategories: (categories) => get().updateConfig({ categories }, 'Updated categories configuration'),
  updatePromoCodes: (promoCodes, desc) => get().updateConfig({ promoCodes }, desc || 'Updated promo codes'),
  updateLocations: (locations) => get().updateConfig({ locations }, 'Updated delivery locations'),
  updateShippingCost: (shippingCost) => get().updateConfig({ shippingCost }, 'Updated default shipping cost'),
  updateShippingActive: (shippingActive) => get().updateConfig({ shippingActive }, 'Toggled shipping calculation'),
  updateStoreInfo: (storeInfo) => get().updateConfig({ storeInfo }, 'Updated store contact info'),
  updateLoggingSettings: (loggingSettings) => get().updateConfig({ loggingSettings }, 'Updated system logging preferences'),

  // ================= CART SLICE =================
  cart: (() => {
    if (typeof window === 'undefined') return [];
    try {
      const saved = localStorage.getItem('cart');
      if (!saved) return [];
      const parsed = JSON.parse(saved);
      return Array.isArray(parsed) ? parsed : [];
    } catch (e) {
      return [];
    }
  })(),
  
  cartTotal: (() => {
    if (typeof window === 'undefined') return 0;
    try {
      const saved = localStorage.getItem('cart');
      if (!saved) return 0;
      const parsed = JSON.parse(saved);
      const arr = Array.isArray(parsed) ? parsed : [];
      return arr.reduce((total, item) => total + ((item.offerPrice || item.price) * item.qty), 0);
    } catch (e) {
      return 0;
    }
  })(),
  
  cartCount: (() => {
    if (typeof window === 'undefined') return 0;
    try {
      const saved = localStorage.getItem('cart');
      if (!saved) return 0;
      const parsed = JSON.parse(saved);
      const arr = Array.isArray(parsed) ? parsed : [];
      return arr.reduce((count, item) => count + item.qty, 0);
    } catch (e) {
      return 0;
    }
  })(),

  _saveCart: (newCart) => {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem('cart', JSON.stringify(newCart));
    }
  },

  _updateCartState: (newCart) => {
    get()._saveCart(newCart);
    const cartTotal = newCart.reduce((t, item) => t + ((item.offerPrice || item.price) * item.qty), 0);
    const cartCount = newCart.reduce((c, item) => c + item.qty, 0);
    set({ cart: newCart, cartTotal, cartCount });
  },

  // ================= TRACKING SLICE =================
  initTracking: () => {
    if (typeof localStorage === 'undefined') return;
    if (!localStorage.getItem('diar_session_id')) {
      localStorage.setItem('diar_session_id', 'sess_' + Math.random().toString(36).substr(2, 9) + Date.now().toString(36));
    }
    if (!localStorage.getItem('diar_device_id')) {
      localStorage.setItem('diar_device_id', 'dev_' + Math.random().toString(36).substr(2, 9) + Date.now().toString(36));
    }
  },

  trackEvent: (eventType, details = {}) => {
    const state = get();
    if (state.config?.loggingSettings && state.config.loggingSettings.Customers === false) return;
    if (typeof localStorage === 'undefined') return;
    get().initTracking();
    const sessionId = localStorage.getItem('diar_session_id');
    if (!sessionId) return;
    const newEvent = {
      id: 'evt_' + Math.random().toString(36).substr(2, 9),
      type: eventType,
      timestamp: new Date().toISOString(),
      details
    };
    const savedEvents = localStorage.getItem(`diar_events_${sessionId}`);
    const events = savedEvents ? JSON.parse(savedEvents) : [];
    events.push(newEvent);
    localStorage.setItem(`diar_events_${sessionId}`, JSON.stringify(events));
  },

  getTrackingData: () => {
    if (typeof localStorage === 'undefined') return { deviceId: null, sessionId: null, fcmToken: null, events: [] };
    get().initTracking();
    const sessionId = localStorage.getItem('diar_session_id');
    const deviceId = localStorage.getItem('diar_device_id');
    const fcmToken = localStorage.getItem('fcm_token');
    const savedEvents = localStorage.getItem(`diar_events_${sessionId}`);
    const events = savedEvents ? JSON.parse(savedEvents) : [];
    return { deviceId, sessionId, fcmToken, events };
  },

  clearTrackingData: () => {
    if (typeof localStorage === 'undefined') return;
    const sessionId = localStorage.getItem('diar_session_id');
    if (sessionId) {
      localStorage.removeItem(`diar_events_${sessionId}`);
    }
    localStorage.setItem('diar_session_id', 'sess_' + Math.random().toString(36).substr(2, 9) + Date.now().toString(36));
  },


  addToCart: (product, quantity = 1) => {
    get().trackEvent('add_to_cart', {
      productId: product.id,
      productName: product.title || product.id,
      price: product.offerPrice || product.price,
      quantity
    });
    
    const state = get();
    let cartItemId = `${product.id}-no-color-no-size`;
    if (product.activeVariantId) {
      cartItemId = `${product.id}-${product.activeVariantId}`;
    } else if (product.selectedColor || product.color) {
      const c = product.selectedColor || product.color;
      const s = product.selectedSize || product.size || 'no-size';
      cartItemId = `${product.id}-${c}-${s}`;
    }
    const existing = state.cart.find(item => item.cartItemId === cartItemId);
    let newCart;
    if (existing) {
      newCart = state.cart.map(item => 
        item.cartItemId === cartItemId ? { ...item, qty: item.qty + quantity } : item
      );
    } else {
      newCart = [...state.cart, { ...product, cartItemId, qty: quantity }];
    }
    get()._updateCartState(newCart);
  },

  removeFromCart: (cartItemId) => {
    const state = get();
    const itemToRemove = state.cart.find(item => item.cartItemId === cartItemId);
    if (itemToRemove) {
      get().trackEvent('remove_from_cart', { 
        productId: itemToRemove.id,
        productName: itemToRemove.title || itemToRemove.titleAr || itemToRemove.name,
        price: itemToRemove.offerPrice || itemToRemove.price,
        cartItemId 
      });
    }
    const newCart = state.cart.filter(item => item.cartItemId !== cartItemId);
    get()._updateCartState(newCart);
  },

  updateQuantity: (cartItemId, qty) => {
    if (qty < 1) {
      get().removeFromCart(cartItemId);
      return;
    }
    const newCart = get().cart.map(item => 
      item.cartItemId === cartItemId ? { ...item, qty } : item
    );
    get()._updateCartState(newCart);
  },

  clearCart: () => {
    get()._updateCartState([]);
  },

  // ================= PRODUCTS SLICE =================
  products: [],
  productsLoading: true,
  productsError: null,

  logAdminActionFull: async (actionType, description, details = {}) => {
    try {
      const currentAdmin = typeof localStorage !== 'undefined' ? (localStorage.getItem('currentAdmin') || 'Marwan') : 'Marwan';
      await fetch('/api/logs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ adminName: currentAdmin, actionType, description, details })
      });
    } catch (e) {
      console.error('Failed to log admin action', e);
    }
  },

  fetchProducts: async () => {
    try {
      set({ productsLoading: true, productsError: null });
      const res = await fetch('/api/products');
      if (!res.ok) {
        await res.text().catch(() => {});
        throw new Error('Failed to fetch products');
      }
      const data = await res.json();
      set({ products: data, productsLoading: false });
    } catch (error) {
      console.error('Error fetching products:', error);
      set({ productsError: error.message, productsLoading: false });
    }
  },

  addProduct: async (product) => {
    try {
      const res = await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(product)
      });
      if (!res.ok) {
        await res.text().catch(() => {});
        throw new Error('Failed to add product');
      }
      const { data } = await res.json();
      set((state) => ({ products: [data, ...state.products] }));
      get().logAdminActionFull('add_product', `Added product: ${product.title || product.id}`, data);
    } catch (error) {
      console.error('Error adding product:', error);
      throw error;
    }
  },

  updateProduct: async (id, updatedFields) => {
    try {
      const res = await fetch(`/api/products/${encodeURIComponent(id)}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedFields)
      });
      if (!res.ok) {
        await res.text().catch(() => {});
        throw new Error('Failed to update product');
      }
      const { data } = await res.json();
      set((state) => ({
        products: state.products.map(p => p.id === id ? data : p)
      }));
      get().logAdminActionFull('update_product', `Updated product: ${id}`, updatedFields);
    } catch (error) {
      console.error('Error updating product:', error);
      throw error;
    }
  },

  deleteProduct: async (id) => {
    try {
      const res = await fetch(`/api/products/${encodeURIComponent(id)}`, {
        method: 'DELETE'
      });
      if (!res.ok) {
        await res.text().catch(() => {});
        throw new Error('Failed to delete product');
      }
      set((state) => ({
        products: state.products.filter(p => p.id !== id)
      }));
      get().logAdminActionFull('delete_product', `Deleted product: ${id}`);
    } catch (error) {
      console.error('Error deleting product:', error);
      throw error;
    }
  },

  // ================= AUTH SLICE =================
  isAuthenticated: typeof window !== 'undefined' ? localStorage.getItem('isAdminAuthenticated') === 'true' : false,
  authLoading: false,

  logLogin: (adminName) => {
    fetch('/api/logs', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ adminName, actionType: 'login', description: `Admin ${adminName} logged in`, details: {} })
    }).catch(e => console.error(e));
  },

  login: (username, password) => {
    const user = username.toLowerCase().trim();
    if (user === 'marwan' && password === 'Marwan@Diar2026!') {
      set({ isAuthenticated: true, currentAdmin: 'Marwan' });
      localStorage.setItem('isAdminAuthenticated', 'true');
      localStorage.setItem('currentAdmin', 'Marwan');
      get().logLogin('Marwan');
      return true;
    }
    if (user === 'roaya' && password === 'Roaya#Admin2026!') {
      set({ isAuthenticated: true, currentAdmin: 'Roaya' });
      localStorage.setItem('isAdminAuthenticated', 'true');
      localStorage.setItem('currentAdmin', 'Roaya');
      get().logLogin('Roaya');
      return true;
    }
    return false;
  },

  logout: () => {
    set({ isAuthenticated: false });
    localStorage.removeItem('isAdminAuthenticated');
  },

  // ================= ADMIN SLICE =================
  orders: [],
  ordersLoading: true,
  ordersError: null,
  currentAdmin: typeof window !== 'undefined' ? (localStorage.getItem('currentAdmin') || 'Marwan') : 'Marwan',
  users: [],

  setAdmin: (name) => {
    set({ currentAdmin: name });
    localStorage.setItem('currentAdmin', name);
  },

  logAdminAction: (...args) => get().logAdminActionFull(...args),

  fetchOrders: async () => {
    try {
      set({ ordersLoading: true, ordersError: null });
      const res = await fetch('/api/orders');
      if (!res.ok) {
        await res.text().catch(() => {});
        throw new Error('Failed to fetch orders');
      }
      const data = await res.json();
      set({ 
        orders: data.map(o => ({ ...o, createdAt: new Date(o.createdAt) })),
        ordersLoading: false 
      });
    } catch (error) {
      console.error('Error fetching orders:', error);
      set({ ordersError: error.message, ordersLoading: false });
    }
  },

  addOrder: async (newOrder) => {
    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newOrder)
      });
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || 'Failed to create order');
      }
      const { data } = await res.json();
      set((state) => ({ orders: [{...data, createdAt: new Date(data.createdAt)}, ...state.orders] }));
      return { success: true, data };
    } catch (error) {
      console.error('Error adding order:', error);
      return { success: false, error: error.message };
    }
  },

  updateOrder: async (orderId, updatedFields) => {
    try {
      const safeId = String(orderId).replace('#', '');
      const res = await fetch(`/api/orders/${encodeURIComponent(safeId)}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedFields)
      });
      if (!res.ok) {
        await res.text().catch(() => {});
        throw new Error('Failed to update order');
      }
      const { data } = await res.json();
      set((state) => ({
        orders: state.orders.map(o => o.id === orderId ? { ...data, createdAt: new Date(data.createdAt) } : o)
      }));
      let logDesc = `Updated order #${orderId}`;
      if (updatedFields.status) logDesc = `Changed order #${orderId} status to ${updatedFields.status}`;
      else if (updatedFields.items) logDesc = `Modified items for order #${orderId}`;
      get().logAdminActionFull('update_order', logDesc, updatedFields);
    } catch (error) {
      console.error('Error updating order:', error);
    }
  },

  deleteOrder: async (orderId) => {
    try {
      const safeId = String(orderId).replace('#', '');
      const res = await fetch(`/api/orders/${encodeURIComponent(safeId)}`, {
        method: 'DELETE'
      });
      if (!res.ok) {
        await res.text().catch(() => {});
        throw new Error('Failed to delete order');
      }
      set((state) => ({ orders: state.orders.filter(o => o.id !== orderId) }));
      get().logAdminActionFull('delete_order', `Deleted order #${orderId}`);
    } catch (error) {
      console.error('Error deleting order:', error);
      throw error;
    }
  },

  mergeUsers: async (targetPhone, sourcePhone) => {
    const { config, updateConfig } = get();
    const currentMerges = config?.userMerges || {};
    const newMerges = { ...currentMerges };
    
    const targetNorm = targetPhone.replace(/[^0-9+]/g, '');
    const sourceNorm = sourcePhone.replace(/[^0-9+]/g, '');
    
    if (targetNorm === sourceNorm) return;
    
    newMerges[sourceNorm] = targetNorm;
    
    // Transitive merges
    Object.keys(newMerges).forEach(key => {
      if (newMerges[key] === sourceNorm) {
        newMerges[key] = targetNorm;
      }
    });

    // Update config, this will trigger the subscribe callback automatically
    if (updateConfig) {
      await updateConfig({ userMerges: newMerges }, `Merged profile ${sourceNorm} into ${targetNorm}`);
    } else {
      set({ config: { ...config, userMerges: newMerges }});
    }
  }
}));

// Derived state computation for Users
useStore.subscribe((state, prevState) => {
  if (state.orders !== prevState.orders || state.config !== prevState.config) {
    const orders = state.orders || [];
    const config = state.config || {};
    const userMap = {};
    const userMerges = config.userMerges || {};

    orders.forEach(order => {
      const originalPhone = order.phone?.replace(/[^0-9+]/g, '') || order.customer;
      const normalizedPhone = userMerges[originalPhone] || originalPhone;
      
      if (!userMap[normalizedPhone]) {
        userMap[normalizedPhone] = {
          id: normalizedPhone,
          name: order.customer,
          phone: order.phone,
          latestAddress: order.address,
          totalSpent: 0,
          orderCount: 0,
          orders: [],
          purchasedCategories: {},
          deviceIds: new Set(),
          fcmTokens: new Set(),
          linkedAccounts: []
        };
      }
      
      if (order.phone && order.phone !== userMap[normalizedPhone].phone && !userMap[normalizedPhone].linkedAccounts.includes(order.phone)) {
        userMap[normalizedPhone].linkedAccounts.push(order.phone);
      }
      
      userMap[normalizedPhone].totalSpent += order.total || 0;
      userMap[normalizedPhone].orderCount += 1;
      userMap[normalizedPhone].orders.push(order);

      if (order.trackingData && order.trackingData.deviceId) {
        userMap[normalizedPhone].deviceIds.add(order.trackingData.deviceId);
      }
      if (order.trackingData && order.trackingData.fcmToken) {
        userMap[normalizedPhone].fcmTokens.add(order.trackingData.fcmToken);
      }

      order.items?.forEach(item => {
        if (item.category) {
          userMap[normalizedPhone].purchasedCategories[item.category] = (userMap[normalizedPhone].purchasedCategories[item.category] || 0) + item.qty;
        }
      });
    });

    const influencers = (config?.promoCodes || []).filter(p => p.influencerName || p.commissionValue > 0);
    influencers.forEach(inf => {
      const influencerId = `inf_${inf.code}`;
      const generatedOrders = orders.filter(o => o.promoCode === inf.code);
      
      userMap[influencerId] = {
        id: influencerId,
        name: `${inf.influencerName} (Influencer)`,
        phone: `Code: ${inf.code}`,
        latestAddress: 'Partner Account',
        totalSpent: inf.totalRevenue || 0,
        orderCount: generatedOrders.length,
        orders: generatedOrders,
        purchasedCategories: {},
        isInfluencer: true,
        influencerData: inf
      };
    });

    const userArray = Object.values(userMap);
    userArray.forEach(user => {
      let topCategory = 'None';
      let maxQty = 0;
      for (const [cat, qty] of Object.entries(user.purchasedCategories || {})) {
        if (qty > maxQty) {
          maxQty = qty;
          topCategory = cat;
        }
      }
      user.primaryInterest = topCategory;

      if (user.deviceIds && user.deviceIds.size > 0) {
        userArray.forEach(otherUser => {
          if (otherUser.id !== user.id && otherUser.deviceIds && !otherUser.isInfluencer) {
            const sharedDevices = [...user.deviceIds].filter(id => otherUser.deviceIds.has(id));
            if (sharedDevices.length > 0) {
              if (!user.linkedAccounts.find(u => u.id === otherUser.id)) {
                user.linkedAccounts.push({ id: otherUser.id, name: otherUser.name, phone: otherUser.phone });
              }
            }
          }
        });
      }
    });

    useStore.setState({ users: userArray.sort((a, b) => b.totalSpent - a.totalSpent) });
  }
});
