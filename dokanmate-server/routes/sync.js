// routes/sync.js
// All sync routes now require a valid JWT.
// shopId comes from the token — not the request body.
// This prevents one shop from writing to another shop's data.

const express    = require('express');
const router     = express.Router();
const controller = require('../controllers/syncController');
const auth       = require('../middleware/auth');

// Public health check
router.get('/health', controller.healthCheck);

// Protected sync routes
router.post('/products',     auth, controller.syncProduct);
router.post('/sales',        auth, controller.syncSale);
router.post('/sale-items',   auth, controller.syncSaleItem);
router.post('/customers',    auth, controller.syncCustomer);
router.post('/transactions', auth, controller.syncTransaction);
router.post('/expenses',     auth, controller.syncExpense);

module.exports = router;