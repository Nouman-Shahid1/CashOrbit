const express = require('express');
const router = express.Router();

// Test Stripe configuration
router.get('/test-stripe', async (req, res) => {
  try {
    console.log('Testing Stripe configuration...');
    console.log('STRIPE_SECRET_KEY exists:', !!process.env.STRIPE_SECRET_KEY);
    console.log('Key starts with:', process.env.STRIPE_SECRET_KEY?.substring(0, 10));
    
    const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
    
    // Test API call
    const balance = await stripe.balance.retrieve();
    
    res.json({
      message: 'Stripe working correctly!',
      balance: balance.available,
      keyPrefix: process.env.STRIPE_SECRET_KEY?.substring(0, 10)
    });
    
  } catch (error) {
    res.status(500).json({
      message: 'Stripe test failed',
      error: error.message,
      keyExists: !!process.env.STRIPE_SECRET_KEY,
      keyPrefix: process.env.STRIPE_SECRET_KEY?.substring(0, 10)
    });
  }
});

module.exports = router;