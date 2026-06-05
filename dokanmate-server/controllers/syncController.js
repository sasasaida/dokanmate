// controllers/syncController.js
// Secure upsert controller — shopId comes from JWT auth middleware, not request body

const Product     = require('../models/Product');
const Sale        = require('../models/Sale');
const Customer    = require('../models/Customer');
const Transaction = require('../models/Transaction');
const Expense     = require('../models/Expense');

// Generic upsert — insert if new, update if exists
// shopId is always stored with the record for data isolation
const upsertRecord = async (Model, recordId, shopId, data) => {
  await Model.findByIdAndUpdate(
    recordId,
    { ...data, _id: recordId, shopId },
    { upsert: true, returnDocument: 'after' }
  );
};

const recalculateCustomerDue = async (shopId, customerId) => {
  const transactions = await Transaction.find({
    shopId,
    customerId,
    isReversed: false,
  }).lean();

  const balance = transactions.reduce((sum, transaction) => {
    if (transaction.type === 'due') {
      return sum + transaction.amount;
    }
    if (transaction.type === 'payment') {
      return sum - transaction.amount;
    }
    return sum;
  }, 0);

  await Customer.findOneAndUpdate(
    { _id: customerId, shopId },
    {
      totalDue: Math.max(0, balance),
      updatedAt: new Date().toISOString(),
    },
    { returnDocument: 'after' }
  );

  return Math.max(0, balance);
};

exports.syncProduct = async (req, res) => {
  try {
    const { operation, recordId, data } = req.body;
    const { shopId } = req.shop; // ← from JWT, not body

    if (!recordId || !data) {
      return res.status(400).json({
        success: false,
        error: 'recordId and data are required',
      });
    }

    if (typeof data.stockDeduction === 'number') {
      const updatedProduct = await Product.findOneAndUpdate(
        { _id: recordId, shopId },
        {
          $inc: { stock: -data.stockDeduction },
          $set: { updatedAt: data.updatedAt ?? new Date().toISOString() },
        },
        { returnDocument: 'after' }
      );

      if (!updatedProduct) {
        return res.status(404).json({
          success: false,
          error: 'Product not found',
        });
      }

      return res.json({ success: true, recordId });
    }

    await upsertRecord(Product, recordId, shopId, data);
    res.json({ success: true, recordId });
  } catch (err) {
    console.error('syncProduct error:', err);
    res.status(500).json({ success: false, error: err.message });
  }
};

exports.syncSale = async (req, res) => {
  try {
    const { operation, recordId, data } = req.body;
    const { shopId } = req.shop; // ← from JWT, not body

    if (!recordId || !data) {
      return res.status(400).json({
        success: false,
        error: 'recordId and data are required',
      });
    }

    const saleData = {
      ...data,
      _id: recordId,
      shopId,
      items: Array.isArray(data.items) ? data.items : [],
    };

    await Sale.findByIdAndUpdate(
      recordId,
      saleData,
      { upsert: true, returnDocument: 'after' }
    );
    res.json({ success: true, recordId });
  } catch (err) {
    console.error('syncSale error:', err);
    res.status(500).json({ success: false, error: err.message });
  }
};

exports.syncSaleItem = async (req, res) => {
  try {
    const { operation, recordId, data } = req.body;
    const { shopId } = req.shop; // ← from JWT, not body

    if (!recordId) {
      return res.status(400).json({
        success: false,
        error: 'recordId is required',
      });
    }

    // Sale items are stored inside the Sale document
    // Just acknowledge receipt
    res.json({ success: true, recordId });
  } catch (err) {
    console.error('syncSaleItem error:', err);
    res.status(500).json({ success: false, error: err.message });
  }
};

exports.syncCustomer = async (req, res) => {
  try {
    const { operation, recordId, data } = req.body;
    const { shopId } = req.shop; // ← from JWT, not body

    if (!recordId || !data) {
      return res.status(400).json({
        success: false,
        error: 'recordId and data are required',
      });
    }

    await upsertRecord(Customer, recordId, shopId, data);
    res.json({ success: true, recordId });
  } catch (err) {
    console.error('syncCustomer error:', err);
    res.status(500).json({ success: false, error: err.message });
  }
};

exports.syncTransaction = async (req, res) => {
  try {
    const { operation, recordId, data } = req.body;
    const { shopId } = req.shop; // ← from JWT, not body

    if (!recordId || !data) {
      return res.status(400).json({
        success: false,
        error: 'recordId and data are required',
      });
    }

    await upsertRecord(Transaction, recordId, shopId, data);

    if (data.customerId) {
      await recalculateCustomerDue(shopId, data.customerId);
    }

    res.json({ success: true, recordId });
  } catch (err) {
    console.error('syncTransaction error:', err);
    res.status(500).json({ success: false, error: err.message });
  }
};

exports.syncExpense = async (req, res) => {
  try {
    const { operation, recordId, data } = req.body;
    const { shopId } = req.shop; // ← from JWT, not body

    if (!recordId || !data) {
      return res.status(400).json({
        success: false,
        error: 'recordId and data are required',
      });
    }

    await upsertRecord(Expense, recordId, shopId, data);
    res.json({ success: true, recordId });
  } catch (err) {
    console.error('syncExpense error:', err);
    res.status(500).json({ success: false, error: err.message });
  }
};

exports.healthCheck = (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
};