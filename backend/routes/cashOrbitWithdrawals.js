const express = require('express');
const router = express.Router();
const withdrawalController = require('../controllers/cashOrbitWithdrawalController');
const auth = require('../middleware/auth');

// Withdrawal routes
router.get('/stats', auth, withdrawalController.getUserStats);
router.get('/history', auth, withdrawalController.getWithdrawHistory);
router.get('/check-weekly', auth, withdrawalController.checkWeeklyWithdraw);
router.post('/request', auth, withdrawalController.requestWithdraw);

module.exports = router;