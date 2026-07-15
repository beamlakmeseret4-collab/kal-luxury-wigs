const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema(
  {
    product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
    name: { type: String, required: true },
    image: { type: String },
    price: { type: Number, required: true },
    qty: { type: Number, required: true, min: 1 },
    size: String,
    color: String,
  },
  { _id: false }
);

const timelineEntrySchema = new mongoose.Schema(
  {
    status: { type: String, required: true },
    note: String,
    timestamp: { type: Date, default: Date.now },
  },
  { _id: false }
);

const orderSchema = new mongoose.Schema(
  {
    orderNumber: { type: String, unique: true, index: true },

    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // null for guest checkout
    customer: {
      name: { type: String, required: true },
      phone: { type: String, required: true },
      email: { type: String },
    },

    items: { type: [orderItemSchema], required: true, validate: (v) => v.length > 0 },

    subtotal: { type: Number, required: true },
    deliveryFee: { type: Number, default: 0 },
    total: { type: Number, required: true },

    deliveryMethod: { type: String, enum: ['delivery', 'pickup'], required: true },
    deliveryAddress: {
      fullAddress: String,
      coordinates: { lat: Number, lng: Number },
      notes: String,
    },

    paymentMethod: { type: String, enum: ['telebirr', 'cbe', 'cash'], required: true },
    paymentProof: {
      imageUrl: String,
      payerName: String,
      payerPhone: String,
    },
    paymentStatus: {
      type: String,
      enum: ['pending', 'pending_verification', 'paid', 'failed', 'refunded'],
      default: 'pending',
    },

    orderStatus: {
      type: String,
      enum: ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'],
      default: 'pending',
    },
    cancelReason: String,

    assignedDriver: {
      name: String,
      phone: String,
    },

    timeline: { type: [timelineEntrySchema], default: [] },
  },
  { timestamps: true }
);

orderSchema.index({ createdAt: -1 });
orderSchema.index({ 'customer.phone': 1 });

module.exports = mongoose.model('Order', orderSchema);
