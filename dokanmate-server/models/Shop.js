// models/Shop.js
// Stores shop identity and hashed PIN.
// Phone is the unique identifier — never changes.

const mongoose = require('mongoose');

const shopSchema = new mongoose.Schema({
  // Device-generated UUID — primary key
  _id: { type: String, required: true },

  // Unique identifier for recovery
  phone: {
    type:     String,
    required: true,
    unique:   true,
    trim:     true,
    index:    true,
  },

  name:    { type: String, required: true, trim: true },
  address: { type: String, default: null },

  // PIN stored as bcrypt hash — never plain text
  pinHash: { type: String, required: true },

  isActive: { type: Boolean, default: true },

  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
}, { _id: false });

shopSchema.pre('save', function (next) {
  this.updatedAt = new Date();
  next();
});

module.exports = mongoose.model('Shop', shopSchema);