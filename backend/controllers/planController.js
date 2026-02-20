const Plan = require('../models/Plan');
const User = require('../models/User');
const Deposit = require('../models/Deposit');

// Get all plans
exports.getPlans = async (req, res) => {
  try {
    const plans = await Plan.find({ isActive: true }).sort({ depositAmount: 1 });
    
    res.status(200).json({
      success: true,
      plans
    });
  } catch (error) {
    console.error('Get plans error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get plans'
    });
  }
};

// Activate free plan
exports.activateFreePlan = async (req, res) => {
  try {
    const userId = req.user.id;
    
    // Find free plan
    const freePlan = await Plan.findOne({ name: 'Free' });
    if (!freePlan) {
      return res.status(404).json({
        success: false,
        message: 'Free plan not found'
      });
    }

    // Update user with free plan
    const user = await User.findByIdAndUpdate(
      userId,
      {
        plan: freePlan._id,
        planActivatedAt: new Date(),
        status: 'Active'
      },
      { new: true }
    ).populate('plan');

    res.status(200).json({
      success: true,
      message: 'Free plan activated successfully',
      user
    });

  } catch (error) {
    console.error('Activate free plan error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to activate free plan'
    });
  }
};

// Submit deposit proof for paid plan
exports.submitDeposit = async (req, res) => {
  try {
    const userId = req.user.id;
    console.log('Request body:', req.body);
    console.log('Request file:', req.file);
    
    const { planId, transactionId, depositorName, amount } = req.body;

    if (!planId || !transactionId || !depositorName) {
      return res.status(400).json({
        success: false,
        message: 'Plan ID, transaction ID, and depositor name are required'
      });
    }

    // Find the plan
    const plan = await Plan.findById(planId);
    if (!plan) {
      return res.status(404).json({
        success: false,
        message: 'Plan not found'
      });
    }

    // Check if user already has a pending deposit for this plan
    const existingDeposit = await Deposit.findOne({
      user: userId,
      plan: planId,
      status: 'Pending'
    });

    if (existingDeposit) {
      return res.status(400).json({
        success: false,
        message: 'You already have a pending deposit for this plan'
      });
    }

    // Create deposit record
    const deposit = new Deposit({
      user: userId,
      plan: planId,
      amount: amount || plan.depositAmount || plan.price,
      transactionId,
      depositorName,
      paymentMethod: 'JazzCash/EasyPaisa',
      screenshot: req.file ? req.file.path : null
    });

    await deposit.save();

    // Update user status to pending
    await User.findByIdAndUpdate(userId, {
      status: 'Pending'
    });

    res.status(201).json({
      success: true,
      message: 'Deposit submitted for approval',
      deposit
    });

  } catch (error) {
    console.error('Submit deposit error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to submit deposit'
    });
  }
};

// Get user's deposit status
exports.getDepositStatus = async (req, res) => {
  try {
    const userId = req.user.id;
    
    const deposits = await Deposit.find({ user: userId })
      .populate('plan')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      deposits
    });

  } catch (error) {
    console.error('Get deposit status error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get deposit status'
    });
  }
};