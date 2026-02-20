const Withdrawal = require('../models/Withdrawal');
const User = require('../models/User');

exports.getAllWithdrawals = async (req, res) => {
  try {
    const { status, page = 1, limit = 10 } = req.query;
    const query = status ? { status } : {};
    
    const withdrawals = await Withdrawal.find(query)
      .populate('userId', 'name email')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Withdrawal.countDocuments(query);

    res.json({
      withdrawals,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.updateWithdrawalStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, adminNotes } = req.body;

    const withdrawal = await Withdrawal.findById(id);
    if (!withdrawal) {
      return res.status(404).json({ message: 'Withdrawal not found' });
    }

    // If approving, deduct coins from user
    if (status === 'approved' && withdrawal.status === 'pending') {
      const user = await User.findById(withdrawal.userId);
      if (user.wallet.coins < withdrawal.amount) {
        return res.status(400).json({ message: 'User has insufficient coins' });
      }
      
      user.wallet.coins -= withdrawal.amount;
      user.wallet.totalWithdrawn += withdrawal.amount;
      await user.save();
    }

    // If rejecting after approval, return coins
    if (status === 'rejected' && withdrawal.status === 'approved') {
      const user = await User.findById(withdrawal.userId);
      user.wallet.coins += withdrawal.amount;
      user.wallet.totalWithdrawn -= withdrawal.amount;
      await user.save();
    }

    withdrawal.status = status;
    withdrawal.adminNotes = adminNotes;
    withdrawal.processedBy = req.user._id;
    withdrawal.processedAt = new Date();

    await withdrawal.save();

    res.json({
      message: 'Withdrawal status updated successfully',
      withdrawal
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Approve withdrawal
exports.approveWithdrawal = async (req, res) => {
  try {
    const { id } = req.params;
    const { adminNotes } = req.body;

    const withdrawal = await Withdrawal.findById(id);
    if (!withdrawal) {
      return res.status(404).json({ message: 'Withdrawal not found' });
    }

    if (withdrawal.status !== 'pending') {
      return res.status(400).json({ message: 'Withdrawal is not pending' });
    }

    const user = await User.findById(withdrawal.userId);
    if (user.wallet.coins < withdrawal.amount) {
      return res.status(400).json({ message: 'User has insufficient coins' });
    }
    
    user.wallet.coins -= withdrawal.amount;
    user.wallet.totalWithdrawn += withdrawal.amount;
    await user.save();

    withdrawal.status = 'approved';
    withdrawal.adminNotes = adminNotes || 'Approved by admin';
    withdrawal.processedBy = req.user._id;
    withdrawal.processedAt = new Date();
    await withdrawal.save();

    res.json({
      message: 'Withdrawal approved successfully',
      withdrawal
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Reject withdrawal
exports.rejectWithdrawal = async (req, res) => {
  try {
    const { id } = req.params;
    const { adminNotes } = req.body;

    const withdrawal = await Withdrawal.findById(id);
    if (!withdrawal) {
      return res.status(404).json({ message: 'Withdrawal not found' });
    }

    if (withdrawal.status !== 'pending') {
      return res.status(400).json({ message: 'Withdrawal is not pending' });
    }

    withdrawal.status = 'rejected';
    withdrawal.adminNotes = adminNotes || 'Rejected by admin';
    withdrawal.processedBy = req.user._id;
    withdrawal.processedAt = new Date();
    await withdrawal.save();

    res.json({
      message: 'Withdrawal rejected successfully',
      withdrawal
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};