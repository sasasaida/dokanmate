// models/Expense.js
const mongoose = require('mongoose');

const expenseSchema = new mongoose.Schema({
  _id:      { type: String, required: true },
  shopId:   { type: String, required: true, index: true },
  category: { type: String, required: true },
  amount:   { type: Number, required: true },
  note:     { type: String, default: null },
  date:     { type: String, required: true },
  createdAt: { type: String, required: true },
  updatedAt: { type: String, required: true },
}, { _id: false });


// Compound index — fast queries per shop
expenseSchema.index({ shopId: 1, isDeleted: 1 });
module.exports = mongoose.model('Expense', expenseSchema);