// models/Customer.js
const mongoose = require('mongoose');

const customerSchema = new mongoose.Schema({
  _id:      { type: String, required: true },
  shopId:   { type: String, required: true, index: true },
  name:     { type: String, required: true, trim: true },
  phone:    { type: String, default: null },
  totalDue: { type: Number, default: 0 },
  note:     { type: String, default: null },
  createdAt: { type: String, required: true },
  updatedAt: { type: String, required: true },
}, { _id: false });

// Compound index — fast queries per shop
customerSchema.index({ shopId: 1, isDeleted: 1 });

module.exports = mongoose.model('Customer', customerSchema);