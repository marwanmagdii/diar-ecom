import mongoose from 'mongoose';

const OrderItemSchema = new mongoose.Schema({
  id: { type: String, required: true },
  title: { type: String, required: true },
  titleAr: { type: String },
  price: { type: Number, required: true },
  qty: { type: Number, required: true },
  image: { type: String },
  color: { type: mongoose.Schema.Types.Mixed },
  size: { type: String },
  material: { type: String },
  weight: { type: String },
  style: { type: String }
}, { strict: false });

const OrderSchema = new mongoose.Schema({
  id: { type: String },
  customer: { type: String },
  phone: { type: String },
  address: { type: String },
  building: { type: String },
  apartment: { type: String },
  total: { type: Number },
  subtotal: { type: Number },
  shipping: { type: Number },
  discount: { type: Number },
  promoCode: { type: String },
  status: { type: String, default: 'Pending' },
  paymentMethod: { type: String },
  items: [OrderItemSchema],
  trackingData: { type: mongoose.Schema.Types.Mixed }
}, { timestamps: true, strict: false, id: false });

export default mongoose.models.Order || mongoose.model('Order', OrderSchema);
