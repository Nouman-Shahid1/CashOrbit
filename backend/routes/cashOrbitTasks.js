const express = require('express');
const router = express.Router();
const Task = require('../models/Task');
const TaskCompletion = require('../models/TaskCompletion');
const User = require('../models/User');
const auth = require('../middleware/auth');

// Get available tasks for user
router.get('/available', auth, async (req, res) => {
  try {
    const tasks = await Task.find({ status: 'Active' });
    
    const formattedTasks = tasks.map(task => ({
      _id: task._id,
      title: task.title,
      type: task.type,
      description: task.description,
      coins: task.coins,
      dailyLimit: task.dailyLimit,
      difficulty: task.difficulty,
      watchTime: task.watchTime,
      videoUrl: task.videoUrl,
      status: task.status,
      completed: 0 // TODO: Get user's completion count for today
    }));

    res.json({
      success: true,
      tasks: formattedTasks
    });
  } catch (error) {
    console.error('Get available tasks error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get available tasks'
    });
  }
});

// Start a task
router.post('/:taskId/start', auth, async (req, res) => {
  try {
    const { taskId } = req.params;
    const userId = req.user._id;

    const task = await Task.findById(taskId);
    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found'
      });
    }

    if (task.status !== 'Active') {
      return res.status(400).json({
        success: false,
        message: 'Task is not active'
      });
    }

    res.json({
      success: true,
      message: 'Task started successfully',
      task: {
        _id: task._id,
        title: task.title,
        type: task.type,
        coins: task.coins,
        watchTime: task.watchTime,
        videoUrl: task.videoUrl
      }
    });
  } catch (error) {
    console.error('Start task error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to start task'
    });
  }
});

// Complete a task
router.post('/:taskId/complete', auth, async (req, res) => {
  try {
    const { taskId } = req.params;
    const userId = req.user._id;
    const { submissionData } = req.body;

    const [task, user] = await Promise.all([
      Task.findById(taskId),
      User.findById(userId)
    ]);

    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found'
      });
    }

    if (task.status !== 'Active') {
      return res.status(400).json({
        success: false,
        message: 'Task is not active'
      });
    }

    // Check daily limit
    const today = new Date().toISOString().split('T')[0];
    const todayCompletions = await TaskCompletion.countDocuments({
      user: userId,
      task: taskId,
      completedAt: {
        $gte: new Date(today),
        $lt: new Date(new Date(today).getTime() + 24 * 60 * 60 * 1000)
      }
    });

    if (todayCompletions >= task.dailyLimit) {
      return res.status(400).json({
        success: false,
        message: 'Daily limit reached for this task'
      });
    }

    // Validate watch time for video tasks
    if (task.type === 'Watch Video' && submissionData?.watchTime < task.watchTime) {
      return res.status(400).json({
        success: false,
        message: `Please watch the video for at least ${task.watchTime} seconds`
      });
    }

    // Create task completion record
    const completion = new TaskCompletion({
      user: userId,
      task: taskId,
      coinsEarned: task.coins,
      submissionData,
      completedAt: new Date()
    });

    await completion.save();

    // Award coins to user
    user.wallet.coins += task.coins;
    user.wallet.totalEarned += task.coins;
    await user.save();

    // Update task completion count
    task.completions += 1;
    await task.save();

    res.json({
      success: true,
      message: 'Task completed successfully',
      coinsEarned: task.coins,
      newBalance: user.wallet.coins
    });

  } catch (error) {
    console.error('Complete task error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to complete task'
    });
  }
});

// Get user's task completion history
router.get('/history', auth, async (req, res) => {
  try {
    const userId = req.user._id;
    
    const completions = await TaskCompletion.find({ user: userId })
      .populate('task', 'title type coins')
      .sort({ completedAt: -1 })
      .limit(50);

    res.json({
      success: true,
      completions
    });
  } catch (error) {
    console.error('Get task history error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get task history'
    });
  }
});

module.exports = router;