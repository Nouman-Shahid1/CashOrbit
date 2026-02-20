const express = require('express');
const router = express.Router();
const taskController = require('../controllers/taskController');
const auth = require('../middleware/auth');

// Task routes
router.get('/available', auth, taskController.getAvailableTasks);
router.post('/:taskId/start', auth, taskController.startTask);
router.post('/:taskId/complete', auth, taskController.completeTask);
router.get('/history', auth, taskController.getTaskHistory);

module.exports = router;