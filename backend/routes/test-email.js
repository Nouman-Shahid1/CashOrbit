const express = require('express');
const { sendEmail } = require('../utils/emailService');
const router = express.Router();

// Test email endpoint
router.post('/test-email', async (req, res) => {
  try {
    const { email } = req.body;
    
    if (!email) {
      return res.status(400).json({ message: 'Email is required' });
    }

    const result = await sendEmail({
      email,
      subject: 'MoneyMinds - Test Email',
      code: '123456'
    });

    res.json({
      message: 'Test email sent',
      result,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({ 
      message: 'Email test failed', 
      error: error.message 
    });
  }
});

module.exports = router;