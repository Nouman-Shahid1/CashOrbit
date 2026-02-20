const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const planController = require('../controllers/planController');
const auth = require('../middleware/auth');

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/deposits/')
  },
  filename: function (req, file, cb) {
    cb(null, 'deposit_' + Date.now() + path.extname(file.originalname))
  }
});

const upload = multer({ storage: storage });

// Plan routes
router.get('/', planController.getPlans);
router.post('/activate-free', auth, planController.activateFreePlan);
router.post('/submit-deposit', auth, upload.single('screenshot'), planController.submitDeposit);
router.get('/deposit-status', auth, planController.getDepositStatus);

module.exports = router;