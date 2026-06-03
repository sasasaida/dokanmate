// models/Transaction.js
const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
  _id:          { type: String, required: true },
  customerId:   { type: String, required: true },
  type:         { type: String, enum: ['due', 'payment'], required: true },
  amount:       { type: Number, required: true },
  note:         { type: String, default: null },
  isReversed:   { type: Boolean, default: false },
  reversedById: { type: String, default: null },
  createdAt:    { type: String, required: true },
}, { _id: false });

module.exports = mongoose.model('Transaction', transactionSchema);