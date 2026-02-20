const express = require('express');
const router = express.Router();

// Test endpoint
router.get('/test', (req, res) => {
  res.json({
    success: true,
    message: 'CashOrbit API is working!',
    timestamp: new Date().toISOString()
  });
});

module.exports = router;