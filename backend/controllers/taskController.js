const Task = require('../models/Task');
const TaskCompletion = require('../models/TaskCompletion');
const User = require('../models/User');

// Get available tasks for user
exports.getAvailableTasks = async (req, res) => {
  try {
    const userId = req.user.id;
    const { type, difficulty, minCoins, maxCoins } = req.query;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // Build filter query
    let taskFilter = { status: 'Active' };
    if (type && type !== 'all') taskFilter.type = type;
    if (difficulty && difficulty !== 'all') taskFilter.difficulty = difficulty;
    if (minCoins) taskFilter.coins = { ...taskFilter.coins, $gte: parseInt(minCoins) };
    if (maxCoins) taskFilter.coins = { ...taskFilter.coins, $lte: parseInt(maxCoins) };

    // Get filtered tasks
    const tasks = await Task.find(taskFilter);

    // Get today's completions for this user
    const todayCompletions = await TaskCompletion.find({
      user: userId,
      completedAt: {
        $gte: today,
        $lt: tomorrow
      }
    });

    // Map tasks with completion status
    const tasksWithStatus = tasks.map(task => {
      const completions = todayCompletions.filter(
        comp => comp.task.toString() === task._id.toString()
      );
      
      return {
        _id: task._id,
        title: task.title,
        type: task.type,
        description: task.description,
        coins: task.coins,
        difficulty: task.difficulty || 'Easy',
        dailyLimit: task.dailyLimit,
        completed: completions.length,
        status: completions.length >= task.dailyLimit ? 'completed' : 'available',
        watchTime: task.watchTime,
        videoUrl: task.videoUrl,
        appLink: task.appLink,
        appName: task.appName,
        instructions: task.instructions,
        requiresScreenshot: task.requiresScreenshot
      };
    });

    res.status(200).json({
      success: true,
      tasks: tasksWithStatus,
      filters: {
        types: ['Watch Video', 'Install App', 'Survey', 'Quiz', 'Daily Spin', 'Referrals'],
        difficulties: ['Easy', 'Medium', 'Hard']
      }
    });

  } catch (error) {
    console.error('Get available tasks error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get available tasks'
    });
  }
};

// Start a task
exports.startTask = async (req, res) => {
  try {
    const { taskId } = req.params;
    const userId = req.user.id;

    // Check if task exists and is active
    const task = await Task.findOne({ _id: taskId, status: 'Active' });
    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found or inactive'
      });
    }

    // Check daily limit
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const todayCompletions = await TaskCompletion.countDocuments({
      user: userId,
      task: taskId,
      completedAt: {
        $gte: today,
        $lt: tomorrow
      }
    });

    if (todayCompletions >= task.dailyLimit) {
      return res.status(400).json({
        success: false,
        message: 'Daily limit reached for this task'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Task started successfully',
      task: {
        id: task._id,
        title: task.title,
        type: task.type,
        coins: task.coins,
        watchTime: task.watchTime,
        videoUrl: task.videoUrl,
        appLink: task.appLink,
        instructions: task.instructions
      }
    });

  } catch (error) {
    console.error('Start task error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to start task'
    });
  }
};

// Complete a task
exports.completeTask = async (req, res) => {
  try {
    const { taskId } = req.params;
    const userId = req.user.id;
    const { submissionData } = req.body;

    // Get user and task
    const [user, task] = await Promise.all([
      User.findById(userId).populate('plan'),
      Task.findOne({ _id: taskId, status: 'Active' })
    ]);

    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found or inactive'
      });
    }

    if (!user.plan) {
      // Use default multiplier if no plan
      const baseCoins = task.coins;
      const coinsEarned = baseCoins;
      
      // Create task completion
      const completion = new TaskCompletion({
        user: userId,
        task: taskId,
        coinsEarned,
        submissionData: submissionData || {},
        status: task.type === 'Manual Task' ? 'Pending' : 'Completed'
      });

      await completion.save();

      // If auto-approved task, add coins immediately
      if (task.type !== 'Manual Task') {
        user.wallet.coins += coinsEarned;
        user.wallet.totalEarned += coinsEarned;
        await user.save();

        // Update task completion count
        task.completions += 1;
        await task.save();
      }

      return res.status(200).json({
        success: true,
        message: task.type === 'Manual Task' 
          ? 'Task submitted for review' 
          : 'Task completed successfully',
        coinsEarned: task.type === 'Manual Task' ? 0 : coinsEarned,
        completion
      });
    }

    // Check daily limit
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const todayCompletions = await TaskCompletion.countDocuments({
      user: userId,
      task: taskId,
      completedAt: {
        $gte: today,
        $lt: tomorrow
      }
    });

    if (todayCompletions >= task.dailyLimit) {
      return res.status(400).json({
        success: false,
        message: 'Daily limit reached for this task'
      });
    }

    // Calculate coins based on plan multiplier
    const baseCoins = task.coins;
    const multiplier = parseFloat(user.plan.coinMultiplier.replace('x', ''));
    const coinsEarned = Math.floor(baseCoins * multiplier);

    // Create task completion
    const completion = new TaskCompletion({
      user: userId,
      task: taskId,
      coinsEarned,
      submissionData: submissionData || {},
      status: task.type === 'Manual Task' ? 'Pending' : 'Completed'
    });

    await completion.save();

    // If auto-approved task, add coins immediately
    if (task.type !== 'Manual Task') {
      user.wallet.coins += coinsEarned;
      user.wallet.totalEarned += coinsEarned;
      await user.save();

      // Update task completion count
      task.completions += 1;
      await task.save();
    }

    res.status(200).json({
      success: true,
      message: task.type === 'Manual Task' 
        ? 'Task submitted for review' 
        : 'Task completed successfully',
      coinsEarned: task.type === 'Manual Task' ? 0 : coinsEarned,
      completion
    });

  } catch (error) {
    console.error('Complete task error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to complete task'
    });
  }
};

// Get user's task history
exports.getTaskHistory = async (req, res) => {
  try {
    const userId = req.user.id;
    const { page = 1, limit = 20 } = req.query;

    const completions = await TaskCompletion.find({ user: userId })
      .populate('task', 'title type coins')
      .sort({ completedAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await TaskCompletion.countDocuments({ user: userId });

    res.status(200).json({
      success: true,
      completions,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });

  } catch (error) {
    console.error('Get task history error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get task history'
    });
  }
};