const express = require('express');
const auth = require('../middleware/auth');
const admin = require('../middleware/admin');
const { 
  getAllUsers, 
  getUserDetails, 
  exportUsers, 
  exportWithdrawals, 
  exportQuizData,
  getDashboardStats 
} = require('../controllers/adminController');

const router = express.Router();

// Dashboard stats
router.get('/stats', auth, admin, getDashboardStats);

// User management
router.get('/users', auth, admin, getAllUsers);
router.get('/users/:id', auth, admin, getUserDetails);

// Data export
router.get('/export/users', auth, admin, exportUsers);
router.get('/export/withdrawals', auth, admin, exportWithdrawals);
router.get('/export/quiz-data', auth, admin, exportQuizData);

module.exports = router;