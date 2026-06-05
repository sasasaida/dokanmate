// models/Transaction.js
const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
  _id:          { type: String, required: true },
  shopId:       { type: String, required: true, index: true },
  customerId:   { type: String, required: true },
  saleId:       { type: String, default: null },
  type:         { type: String, enum: ['due', 'payment'], required: true },
  amount:       { type: Number, required: true },
  note:         { type: String, default: null },
  isReversed:   { type: Boolean, default: false },
  reversedById: { type: String, default: null },
  createdAt:    { type: String, required: true },
}, { _id: false });

// Compound index — fast queries per shop
transactionSchema.index({ shopId: 1, isDeleted: 1 });

module.exports = mongoose.model('Transaction', transactionSchema);