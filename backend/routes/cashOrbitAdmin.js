const express = require('express');
const router = express.Router();
const adminController = require('../controllers/cashOrbitAdminController');
const auth = require('../middleware/auth');
const admin = require('../middleware/admin');

// Admin dashboard routes
router.get('/dashboard/stats', auth, admin, adminController.getDashboardStats);
router.get('/dashboard/activity', auth, admin, adminController.getRecentActivity);

// User management routes
router.get('/users', auth, admin, adminController.getUsers);
router.get('/users/:userId', auth, admin, adminController.getUserDetails);
router.put('/users/:userId/status', auth, admin, adminController.updateUserStatus);

// Withdrawal management routes
router.get('/withdrawals', auth, admin, adminController.getWithdrawals);
router.put('/withdrawals/:withdrawId', auth, admin, adminController.updateWithdrawStatus);

// Task management routes
router.get('/tasks', auth, admin, adminController.getTasks);
router.post('/tasks', auth, admin, adminController.createTask);
router.put('/tasks/:taskId', auth, admin, adminController.updateTask);
router.delete('/tasks/:taskId', auth, admin, adminController.deleteTask);

// Plan deposit management routes
router.get('/deposits/pending', auth, admin, adminController.getPendingDeposits);
router.put('/deposits/:depositId/approve', auth, admin, adminController.approveDeposit);
router.put('/deposits/:depositId/reject', auth, admin, adminController.rejectDeposit);

module.exports = router;