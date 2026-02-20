const Withdrawal = require('../models/Withdrawal');
const User = require('../models/User');
const { coinsToPKR, pkrToCoins, hasEnoughCoins } = require('../utils/coinConverter');

// Check if today is withdrawal day (Friday or Sunday)
const isWithdrawDay = () => {
  const today = new Date();
  const dayOfWeek = today.getDay(); // 0 = Sunday, 5 = Friday
  return dayOfWeek === 0 || dayOfWeek === 5;
};

// Check if user has withdrawn this week
const hasWithdrawnThisWeek = async (userId) => {
  const today = new Date();
  const startOfWeek = new Date(today);
  startOfWeek.setDate(today.getDate() - today.getDay()); // Start of current week (Sunday)
  startOfWeek.setHours(0, 0, 0, 0);

  const withdrawal = await Withdrawal.findOne({
    user: userId,
    createdAt: { $gte: startOfWeek },
    status: { $in: ['Pending', 'Approved', 'Paid'] }
  });

  return !!withdrawal;
};

// Get user withdrawal stats
exports.getUserStats = async (req, res) => {
  try {
    const userId = req.user.id;
    
    const user = await User.findById(userId).populate('plan');
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    if (!user.plan) {
      return res.status(400).json({
        success: false,
        message: 'No active plan found'
      });
    }

    // Calculate PKR value using standard rate (100 coins = 1 PKR)
    const availablePKR = coinsToPKR(user.wallet.coins);

    res.status(200).json({
      success: true,
      stats: {
        totalCoins: user.wallet.coins,
        availablePKR,
        minWithdraw: 100, // Minimum withdrawal amount
        maxWithdraw: user.plan.withdrawLimit,
        plan: user.plan.name,
        coinRate: 0.01 // 1 coin = 0.01 PKR (100 coins = 1 PKR)
      }
    });

  } catch (error) {
    console.error('Get user stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get user stats'
    });
  }
};

// Get withdrawal history
exports.getWithdrawHistory = async (req, res) => {
  try {
    const userId = req.user.id;
    const { page = 1, limit = 20 } = req.query;

    const withdrawals = await Withdrawal.find({ user: userId })
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Withdrawal.countDocuments({ user: userId });

    const formattedWithdrawals = withdrawals.map(w => ({
      id: w._id,
      amount: w.amount,
      coinsDeducted: w.coinsDeducted,
      status: w.status,
      date: w.createdAt.toISOString().split('T')[0],
      paymentMethod: w.paymentMethod
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
    console.error('Get withdraw history error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get withdrawal history'
    });
  }
};

// Check weekly withdrawal status
exports.checkWeeklyWithdraw = async (req, res) => {
  try {
    const userId = req.user.id;
    const hasWithdrawn = await hasWithdrawnThisWeek(userId);

    res.status(200).json({
      success: true,
      hasWithdrawn,
      isWithdrawDay: isWithdrawDay()
    });

  } catch (error) {
    console.error('Check weekly withdraw error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to check withdrawal status'
    });
  }
};

// Request withdrawal
exports.requestWithdraw = async (req, res) => {
  try {
    const userId = req.user.id;
    const { amount, paymentMethod } = req.body;

    if (!amount || !paymentMethod) {
      return res.status(400).json({
        success: false,
        message: 'Amount and payment method are required'
      });
    }

    // Check if today is withdrawal day
    if (!isWithdrawDay()) {
      return res.status(400).json({
        success: false,
        message: 'Withdrawals are only allowed on Friday and Sunday'
      });
    }

    // Check if user has already withdrawn this week
    if (await hasWithdrawnThisWeek(userId)) {
      return res.status(400).json({
        success: false,
        message: 'You can only withdraw once per week'
      });
    }

    // Get user with plan
    const user = await User.findById(userId).populate('plan');
    if (!user || !user.plan) {
      return res.status(400).json({
        success: false,
        message: 'User or plan not found'
      });
    }

    // Validate amount using standard rate (100 coins = 1 PKR)
    const availablePKR = coinsToPKR(user.wallet.coins);
    const minWithdraw = 100;
    const maxWithdraw = user.plan.withdrawLimit;

    if (amount < minWithdraw || amount > maxWithdraw) {
      return res.status(400).json({
        success: false,
        message: `Amount must be between PKR ${minWithdraw} and PKR ${maxWithdraw}`
      });
    }

    if (!hasEnoughCoins(user.wallet.coins, amount)) {
      return res.status(400).json({
        success: false,
        message: 'Insufficient balance'
      });
    }

    // Calculate coins to deduct using standard rate
    const coinsToDeduct = pkrToCoins(amount);

    // Create withdrawal request
    const withdrawal = new Withdrawal({
      user: userId,
      amount,
      coinsDeducted: coinsToDeduct,
      paymentMethod,
      status: 'Pending'
    });

    await withdrawal.save();

    // Deduct coins from user wallet
    user.wallet.coins -= coinsToDeduct;
    user.wallet.totalWithdrawn += amount;
    await user.save();

    res.status(201).json({
      success: true,
      message: 'Withdrawal request submitted for admin approval',
      withdrawal: {
        id: withdrawal._id,
        amount: withdrawal.amount,
        coinsDeducted: withdrawal.coinsDeducted,
        status: withdrawal.status,
        date: withdrawal.createdAt
      }
    });

  } catch (error) {
    console.error('Request withdraw error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to request withdrawal'
    });
  }
};