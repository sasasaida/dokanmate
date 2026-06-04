// models/Product.js
const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  // Use the device-generated UUID as _id
  // This prevents duplicate inserts on retry
  _id:        { type: String, required: true },
  shopId:     { type: String, required: true, index: true },
  name:       { type: String, required: true, trim: true },
  price:      { type: Number, required: true, min: 0 },
  stock:      { type: Number, default: 0, min: 0 },
  category:   { type: String, default: null },
  expiryDate: { type: String, default: null },
  isDeleted:  { type: Boolean, default: false },
  createdAt:  { type: String, required: true },
  updatedAt:  { type: String, required: true },
}, {
  // Disable auto _id — we're providing our own UUID
  _id: false,
});

// Compound index — fast queries per shop
productSchema.index({ shopId: 1, isDeleted: 1 });

module.exports = mongoose.model('Product', productSchema);