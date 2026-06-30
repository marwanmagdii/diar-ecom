import mongoose from 'mongoose';

const ProductSchema = new mongoose.Schema({
  title: { type: String, required: true },
  titleAr: { type: String },
  desc: { type: String },
  description: { type: String },
  descriptionAr: { type: String },
  price: { type: Number, required: true },
  offerPrice: { type: Number },
  offerStartDate: { type: Date },
  offerEndDate: { type: Date },
  oldPrice: { type: Number },
  image: { type: String, required: true },
  images: [{ type: String }],
  category: { type: String, required: true },
  badge: { type: String },
  bgColor: { type: String },
  // Legacy attributes
  color: { type: mongoose.Schema.Types.Mixed }, // String or Array of Strings
  size: { type: String },
  material: { type: String },
  weight: { type: String },
  style: { type: String },
  reviewImages: [{ type: String }],
  colorImages: { type: Map, of: String },
  colorGallery: { type: Map, of: [String] },
  colorPrices: { type: Map, of: Number },

  // Shared attributes
  stock: { type: Number, default: 0 },
  showStock: { type: Boolean, default: false },
  keyBenefits: [{ type: String }],
  keyBenefitsAr: [{ type: String }],
  isActive: { type: Boolean, default: true },

  // New modern variants architecture
  options: [{
    name: { type: String, required: true },
    values: [{ type: String, required: true }]
  }],
  variants: [{
    id: { type: String, required: true },
    attributes: { type: Map, of: String }, // e.g. { "Color": "Red", "Size": "M" }
    price: { type: Number }, // Optional, falls back to product price if not set
    stock: { type: Number },
    image: { type: String }, // Legacy single image
    images: [{ type: String }], // Multiple images per variant
    sku: { type: String }
  }]
}, { timestamps: true });

// Avoid compiling model twice during dev
export default mongoose.models.Product || mongoose.model('Product', ProductSchema);
