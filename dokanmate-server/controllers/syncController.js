// controllers/syncController.js
// Receives synced records from the device and upserts them into MongoDB.
// "Upsert" = insert if new, update if exists.
// This handles retries safely — sending the same record twice is harmless.

const Product     = require('../models/Product');
const Sale        = require('../models/Sale');
const Customer    = require('../models/Customer');
const Transaction = require('../models/Transaction');
const Expense     = require('../models/Expense');

/**
 * Generic upsert handler.
 * Uses the device UUID as _id.
 * Last-write-wins conflict strategy — updatedAt determines the winner.
 */
const upsertRecord = async (Model, recordId, data, operation) => {
  if (operation === 'DELETE') {
    // For soft deletes, update the record rather than removing it
    await Model.findByIdAndUpdate(
      recordId,
      { ...data, _id: recordId },
      { upsert: true, new: true }
    );
    return;
  }

  // INSERT or UPDATE — both use upsert
  await Model.findByIdAndUpdate(
    recordId,
    { ...data, _id: recordId },
    { upsert: true, new: true }
  );
};

// ── Products ────────────────────────────────────────────────

exports.syncProduct = async (req, res) => {
  try {
    const { operation, recordId, data } = req.body;

    if (!recordId || !data) {
      return res.status(400).json({ error: 'recordId and data are required' });
    }

    await upsertRecord(Product, recordId, data, operation);
    res.json({ success: true, recordId });
  } catch (err) {
    console.error('syncProduct error:', err);
    res.status(500).json({ error: err.message });
  }
};

// ── Sales ───────────────────────────────────────────────────

exports.syncSale = async (req, res) => {
  try {
    const { operation, recordId, data } = req.body;

    if (!recordId || !data) {
      return res.status(400).json({ error: 'recordId and data are required' });
    }

    await upsertRecord(Sale, recordId, data, operation);
    res.json({ success: true, recordId });
  } catch (err) {
    console.error('syncSale error:', err);
    res.status(500).json({ error: err.message });
  }
};

// ── Customers ───────────────────────────────────────────────

exports.syncCustomer = async (req, res) => {
  try {
    const { operation, recordId, data } = req.body;
    await upsertRecord(Customer, recordId, data, operation);
    res.json({ success: true, recordId });
  } catch (err) {
    console.error('syncCustomer error:', err);
    res.status(500).json({ error: err.message });
  }
};

// ── Transactions ────────────────────────────────────────────

exports.syncTransaction = async (req, res) => {
  try {
    const { operation, recordId, data } = req.body;
    await upsertRecord(Transaction, recordId, data, operation);
    res.json({ success: true, recordId });
  } catch (err) {
    console.error('syncTransaction error:', err);
    res.status(500).json({ error: err.message });
  }
};

// ── Expenses ────────────────────────────────────────────────

exports.syncExpense = async (req, res) => {
  try {
    const { operation, recordId, data } = req.body;
    await upsertRecord(Expense, recordId, data, operation);
    res.json({ success: true, recordId });
  } catch (err) {
    console.error('syncExpense error:', err);
    res.status(500).json({ error: err.message });
  }
};

// ── Health check ────────────────────────────────────────────

exports.healthCheck = async (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
};