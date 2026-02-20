const express = require('express');
const auth = require('../middleware/auth');
const admin = require('../middleware/admin');
const { 
  addStripeCard, 
  getStripeStatus, 
  requestStripeWithdrawal,
  processStripeWithdrawal 
} = require('../controllers/stripeController');

const router = express.Router();

// User routes
router.post('/add-card', auth, addStripeCard);
router.get('/status', auth, getStripeStatus);
router.post('/withdraw', auth, requestStripeWithdrawal);

// Admin routes
router.post('/process/:withdrawalId', auth, admin, processStripeWithdrawal);

module.exports = router;