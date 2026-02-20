const express = require('express');
const auth = require('../middleware/auth');
const admin = require('../middleware/admin');
const { getAllWithdrawals, updateWithdrawalStatus, approveWithdrawal, rejectWithdrawal } = require('../controllers/withdrawalController');

const router = express.Router();

// Get all withdrawals (admin only)
router.get('/', auth, admin, getAllWithdrawals);

// Update withdrawal status (admin only)
router.put('/:id/status', auth, admin, updateWithdrawalStatus);

// Approve withdrawal (admin only)
router.put('/:id/approve', auth, admin, approveWithdrawal);

// Reject withdrawal (admin only)
router.put('/:id/reject', auth, admin, rejectWithdrawal);

module.exports = router;