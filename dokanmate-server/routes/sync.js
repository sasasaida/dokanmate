// routes/sync.js
const express    = require('express');
const router     = express.Router();
const controller = require('../controllers/syncController');

// Health check
router.get('/health', controller.healthCheck);

// Sync endpoints — one per data type
// All accept POST with { operation, recordId, data }
router.post('/products',     controller.syncProduct);
router.post('/sales',        controller.syncSale);
router.post('/customers',    controller.syncCustomer);
router.post('/transactions', controller.syncTransaction);
router.post('/expenses',     controller.syncExpense);

module.exports = router;