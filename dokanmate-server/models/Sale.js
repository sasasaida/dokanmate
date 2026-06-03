// models/Sale.js
const mongoose = require('mongoose');

const saleItemSchema = new mongoose.Schema({
  _id:         { type: String, required: true },
  productId:   { type: String, required: true },
  productName: { type: String, required: true },
  quantity:    { type: Number, required: true, min: 1 },
  unitPrice:   { type: Number, required: true },
  totalPrice:  { type: Number, required: true },
  createdAt:   { type: String, required: true },
}, { _id: false });

const saleSchema = new mongoose.Schema({
  _id:           { type: String, required: true },
  customerId:    { type: String, default: null },
  totalAmount:   { type: Number, required: true },
  paymentMethod: { type: String, enum: ['cash', 'bkash', 'nagad'], default: 'cash' },
  items:         [saleItemSchema],
  note:          { type: String, default: null },
  createdAt:     { type: String, required: true },
  updatedAt:     { type: String, required: true },
}, { _id: false });

module.exports = mongoose.model('Sale', saleSchema);