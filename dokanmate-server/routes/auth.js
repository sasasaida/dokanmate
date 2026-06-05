// routes/auth.js
const express    = require('express');
const router     = express.Router();
const controller = require('../controllers/authController');
const auth       = require('../middleware/auth');

// Public routes — no token needed
router.post('/register', controller.register);
router.post('/recover',  controller.recover);

// Protected route — requires valid token
router.post('/update-shop', auth, controller.updateShop);
router.post('/change-pin', auth, controller.changePin);

module.exports = router;