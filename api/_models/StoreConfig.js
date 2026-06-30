import mongoose from 'mongoose';

const StoreConfigSchema = new mongoose.Schema({
  id: { type: String, default: 'global' },
  categories: { type: Array, default: [] },
  promoCodes: { type: Array, default: [] },
  collections: { type: Array, default: [] },
  locations: { type: Array, default: [] },
  headerBanner: { type: Object, default: { active: false, text: '', textAr: '', bgColor: '#0f172a', textColor: '#ffffff' } },
  storeDetails: { type: Object, default: {} },
  policies: { type: Object, default: {} },
  productOptions: { type: Array, default: ['Color', 'Size', 'Material', 'Weight', 'Style'] }
}, { timestamps: true, strict: false });

export default mongoose.models.StoreConfig || mongoose.model('StoreConfig', StoreConfigSchema);
