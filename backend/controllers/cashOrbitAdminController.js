const User = require('../models/User');
const Withdrawal = require('../models/Withdrawal');
const Task = require('../models/Task');
const TaskCompletion = require('../models/TaskCompletion');
const Deposit = require('../models/Deposit');
const Plan = require('../models/Plan');

// Get dashboard statistics
exports.getDashboardStats = async (req, res) => {
  try {
    const [
      totalUsers,
      activeUsers,
      pendingWithdraws,
      pendingDeposits,
      totalRevenue
    ] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ status: 'Active' }),
      Withdrawal.countDocuments({ status: 'Pending' }),
      Deposit.countDocuments({ status: 'Pending' }),
      Deposit.aggregate([
        { $match: { status: 'Approved' } },
        { $group: { _id: null, total: { $sum: '$amount' } } }
      ])
    ]);

    res.status(200).json({
      success: true,
      stats: {
        totalUsers,
        activeUsers,
        pendingWithdraws,
        pendingDeposits,
        totalRevenue: totalRevenue[0]?.total || 0
      }
    });

  } catch (error) {
    console.error('Get dashboard stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get dashboard stats'
    });
  }
};

// Get recent activity
exports.getRecentActivity = async (req, res) => {
  try {
    const activities = [];

    // Get recent user registrations
    const recentUsers = await User.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .select('name createdAt');

    recentUsers.forEach(user => {
      activities.push({
        text: `New user registered: ${user.name}`,
        time: getTimeAgo(user.createdAt)
      });
    });

    // Get recent withdrawals
    const recentWithdrawals = await Withdrawal.find()
      .populate('user', 'name')
      .sort({ createdAt: -1 })
      .limit(5);

    recentWithdrawals.forEach(withdrawal => {
      activities.push({
        text: `Withdraw request: PKR ${withdrawal.amount} by ${withdrawal.user.name}`,
        time: getTimeAgo(withdrawal.createdAt)
      });
    });

    // Sort by time and limit
    activities.sort((a, b) => new Date(b.time) - new Date(a.time));

    res.status(200).json({
      success: true,
      activities: activities.slice(0, 10)
    });

  } catch (error) {
    console.error('Get recent activity error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get recent activity'
    });
  }
};

// Get all users with filters
exports.getUsers = async (req, res) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    
    let filter = {};
    if (status && status !== 'all') {
      filter.status = status.charAt(0).toUpperCase() + status.slice(1);
    }

    const users = await User.find(filter)
      .populate('plan', 'name')
      .select('-password -otp')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await User.countDocuments(filter);

    const formattedUsers = users.map(user => ({
      id: user._id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      plan: user.plan?.name || 'No Plan',
      coins: user.wallet.coins,
      status: user.status,
      joinDate: user.createdAt.toISOString().split('T')[0]
    }));

    res.status(200).json({
      success: true,
      users: formattedUsers,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });

  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get users'
    });
  }
};

// Get user details by ID
exports.getUserDetails = async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await User.findById(userId)
      .populate('plan', 'name price')
      .populate('referredBy', 'name')
      .select('-password -otp');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.status(200).json({
      success: true,
      user
    });

  } catch (error) {
    console.error('Get user details error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get user details'
    });
  }
};

// Update user status
exports.updateUserStatus = async (req, res) => {
  try {
    const { userId } = req.params;
    const { status } = req.body;

    if (!['Active', 'Blocked'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status'
      });
    }

    const user = await User.findByIdAndUpdate(
      userId,
      { status },
      { new: true }
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.status(200).json({
      success: true,
      message: `User ${status.toLowerCase()} successfully`,
      user: {
        id: user._id,
        name: user.name,
        status: user.status
      }
    });

  } catch (error) {
    console.error('Update user status error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update user status'
    });
  }
};

// Get withdrawals with filters
exports.getWithdrawals = async (req, res) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    
    let filter = {};
    if (status && status !== 'all') {
      filter.status = status.charAt(0).toUpperCase() + status.slice(1);
    }

    const withdrawals = await Withdrawal.find(filter)
      .populate('user', 'name email')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Withdrawal.countDocuments(filter);

    const formattedWithdrawals = withdrawals.map(w => ({
      id: w._id,
      userName: w.user.name,
      userEmail: w.user.email,
      amount: w.amount,
      coinsDeducted: w.coinsDeducted,
      paymentMethod: w.paymentMethod,
      status: w.status,
      requestDate: w.createdAt.toISOString().split('T')[0]
    }));

    res.status(200).json({
      success: true,
      withdrawals: formattedWithdrawals,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });

  } catch (error) {
    console.error('Get withdrawals error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get withdrawals'
    });
  }
};

// Update withdrawal status
exports.updateWithdrawStatus = async (req, res) => {
  try {
    const { withdrawId } = req.params;
    const { action } = req.body; // 'approve' or 'reject'

    if (!['approve', 'reject'].includes(action)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid action'
      });
    }

    const withdrawal = await Withdrawal.findById(withdrawId).populate('user');
    if (!withdrawal) {
      return res.status(404).json({
        success: false,
        message: 'Withdrawal not found'
      });
    }

    if (withdrawal.status !== 'Pending') {
      return res.status(400).json({
        success: false,
        message: 'Withdrawal already processed'
      });
    }

    if (action === 'approve') {
      withdrawal.status = 'Approved';
      withdrawal.approvedAt = new Date();
      withdrawal.approvedBy = req.user._id;
    } else {
      withdrawal.status = 'Rejected';
      withdrawal.rejectedAt = new Date();
      withdrawal.rejectedBy = req.user._id;
      
      // Return coins to user if rejected
      const user = withdrawal.user;
      user.wallet.coins += withdrawal.coinsDeducted;
      user.wallet.totalWithdrawn -= withdrawal.amount;
      await user.save();
    }

    await withdrawal.save();

    res.status(200).json({
      success: true,
      message: `Withdrawal ${action}d successfully`,
      withdrawal
    });

  } catch (error) {
    console.error('Update withdraw status error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update withdrawal status'
    });
  }
};

// Get all tasks
exports.getTasks = async (req, res) => {
  try {
    const tasks = await Task.find({ status: { $ne: 'Deleted' } })
      .sort({ createdAt: -1 });

    const formattedTasks = tasks.map(task => ({
      id: task._id,
      title: task.title,
      type: task.type,
      coins: task.coins,
      status: task.status,
      completions: task.completions,
      dailyLimit: task.dailyLimit
    }));

    res.status(200).json({
      success: true,
      tasks: formattedTasks
    });

  } catch (error) {
    console.error('Get tasks error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get tasks'
    });
  }
};

// Create new task
exports.createTask = async (req, res) => {
  try {
    const taskData = req.body;
    
    const task = new Task(taskData);
    await task.save();

    res.status(201).json({
      success: true,
      message: 'Task created successfully',
      task
    });

  } catch (error) {
    console.error('Create task error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create task'
    });
  }
};

// Update task
exports.updateTask = async (req, res) => {
  try {
    const { taskId } = req.params;
    const updateData = req.body;

    // Clean up undefined fields for non-video tasks
    if (updateData.type !== 'Watch Video') {
      delete updateData.videoUrl;
      delete updateData.watchTime;
    }

    const task = await Task.findByIdAndUpdate(
      taskId,
      updateData,
      { new: true, runValidators: true }
    );

    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Task updated successfully',
      task
    });

  } catch (error) {
    console.error('Update task error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update task',
      error: error.message
    });
  }
};

// Delete task
exports.deleteTask = async (req, res) => {
  try {
    const { taskId } = req.params;

    const task = await Task.findByIdAndUpdate(
      taskId,
      { status: 'Deleted' },
      { new: true }
    );

    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Task deleted successfully'
    });

  } catch (error) {
    console.error('Delete task error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete task'
    });
  }
};

// Helper function to get time ago
function getTimeAgo(date) {
  const now = new Date();
  const diffInMs = now - date;
  const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
  
  if (diffInMinutes < 1) return 'Just now';
  if (diffInMinutes < 60) return `${diffInMinutes} minutes ago`;
  
  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) return `${diffInHours} hours ago`;
  
  const diffInDays = Math.floor(diffInHours / 24);
  return `${diffInDays} days ago`;
}

// Get pending deposits for plan approvals
exports.getPendingDeposits = async (req, res) => {
  try {
    console.log('Getting pending deposits...');
    const deposits = await Deposit.find({ status: 'Pending' })
      .populate('user', 'name email')
      .populate('plan', 'name price')
      .sort({ createdAt: -1 });

    console.log(`Found ${deposits.length} pending deposits`);
    
    const formattedDeposits = deposits.map(deposit => ({
      _id: deposit._id,
      userName: deposit.user.name,
      userEmail: deposit.user.email,
      planName: deposit.plan.name,
      amount: deposit.amount,
      transactionId: deposit.transactionId,
      depositorName: deposit.depositorName || 'N/A',
      createdAt: deposit.createdAt,
      status: deposit.status // Add status to help with debugging
    }));

    res.status(200).json({
      success: true,
      deposits: formattedDeposits
    });

  } catch (error) {
    console.error('Get pending deposits error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get pending deposits'
    });
  }
};

// Approve deposit and activate plan
exports.approveDeposit = async (req, res) => {
  try {
    console.log('Approve deposit request received');
    console.log('Request params:', req.params);
    console.log('Request body:', req.body);
    console.log('Request user:', req.user ? { id: req.user._id, role: req.user.role } : 'No user');
    
    const { depositId } = req.params;

    if (!depositId) {
      console.log('No depositId provided');
      return res.status(400).json({
        success: false,
        message: 'Deposit ID is required'
      });
    }

    console.log('Finding deposit with ID:', depositId);
    const deposit = await Deposit.findById(depositId)
      .populate('user')
      .populate('plan');

    if (!deposit) {
      console.log('Deposit not found');
      return res.status(404).json({
        success: false,
        message: 'Deposit not found'
      });
    }

    console.log('Deposit found:', { id: deposit._id, status: deposit.status });

    if (deposit.status !== 'Pending') {
      console.log('Deposit already processed, status:', deposit.status);
      return res.status(200).json({
        success: true,
        message: 'Deposit is already approved'
      });
    }

    console.log('Updating deposit status to Approved');
    // Update deposit status
    deposit.status = 'Approved';
    deposit.approvedAt = new Date();
    await deposit.save();
    console.log('Deposit updated successfully');

    console.log('Activating plan for user:', deposit.user._id);
    // Activate plan for user
    const user = deposit.user;
    user.plan = deposit.plan._id;
    user.planActivatedAt = new Date();
    
    // Set plan expiration (30 days)
    const expirationDate = new Date();
    expirationDate.setDate(expirationDate.getDate() + 30);
    user.planExpiresAt = expirationDate;
    
    user.status = 'Active';
    await user.save();
    console.log('User plan activated successfully');

    res.status(200).json({
      success: true,
      message: 'Deposit approved and plan activated successfully'
    });

  } catch (error) {
    console.error('Approve deposit error:', error);
    console.error('Error stack:', error.stack);
    res.status(500).json({
      success: false,
      message: 'Failed to approve deposit',
      error: error.message
    });
  }
};

// Reject deposit
exports.rejectDeposit = async (req, res) => {
  try {
    const { depositId } = req.params;

    const deposit = await Deposit.findById(depositId);
    if (!deposit) {
      return res.status(404).json({
        success: false,
        message: 'Deposit not found'
      });
    }

    if (deposit.status !== 'Pending') {
      return res.status(400).json({
        success: false,
        message: 'Deposit already processed'
      });
    }

    // Update deposit status
    deposit.status = 'Rejected';
    await deposit.save();

    res.status(200).json({
      success: true,
      message: 'Deposit rejected successfully'
    });

  } catch (error) {
    console.error('Reject deposit error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to reject deposit'
    });
  }
};