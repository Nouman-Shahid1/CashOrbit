const express = require('express');
const router = express.Router();
const authController = require('../controllers/cashOrbitAuthController');
const auth = require('../middleware/auth');

// Authentication routes
router.post('/send-otp', authController.sendOTP);
router.post('/send-signup-otp', authController.sendSignupOTP);
router.post('/verify-otp', authController.verifyOTP);
router.post('/verify-signup-otp', authController.verifySignupOTP);
router.get('/me', auth, authController.getCurrentUser);
router.post('/logout', auth, authController.logout);

// Streak routes
router.get('/streak', auth, authController.getStreak);
router.post('/checkin', auth, authController.checkIn);
router.post('/streak-bonus', auth, authController.claimStreakBonus);

module.exports = router;