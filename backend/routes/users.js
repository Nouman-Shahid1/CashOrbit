const express = require('express');
const auth = require('../middleware/auth');
const { getProfile, updateProfile, getLeaderboard, getDashboard, requestWithdrawal, getWithdrawals, getReferralStats, getReferralHistory } = require('../controllers/userController');

const router = express.Router();

// Get user profile
router.get('/profile', auth, getProfile);

// Update user profile
router.put('/profile', auth, updateProfile);

// Get leaderboard
router.get('/leaderboard', auth, getLeaderboard);

// Get dashboard data
router.get('/dashboard', auth, getDashboard);

// Request withdrawal
router.post('/withdraw', auth, requestWithdrawal);

// Get user withdrawals
router.get('/withdrawals', auth, getWithdrawals);

// Get referral stats
router.get('/referral-stats', auth, getReferralStats);

// Get referral history
router.get('/referral-history', auth, getReferralHistory);

module.exports = router;