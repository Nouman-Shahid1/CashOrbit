const Transaction = require('../models/Transaction');
const User = require('../models/User');

exports.createTransaction = async (req, res) => {
  try {
    const { type, category, amount, description, paymentMethod } = req.body;

    const transaction = new Transaction({
      user: req.user._id,
      type,
      category,
      amount,
      description,
      paymentMethod
    });

    await transaction.save();

    // Update user wallet balance
    const user = await User.findById(req.user._id);
    if (type === 'income') {
      user.wallet.balance += amount;
    } else {
      user.wallet.balance -= amount;
    }
    await user.save();

    res.status(201).json({
      message: 'Transaction created successfully',
      transaction
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.getTransactions = async (req, res) => {
  try {
    const { page = 1, limit = 10, type, category } = req.query;
    
    const filter = { user: req.user._id };
    if (type) filter.type = type;
    if (category) filter.category = category;

    const transactions = await Transaction.find(filter)
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Transaction.countDocuments(filter);

    res.json({
      transactions,
      totalPages: Math.ceil(total / limit),
      currentPage: page
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.deleteTransaction = async (req, res) => {
  try {
    const transaction = await Transaction.findOne({
      _id: req.params.id,
      user: req.user._id
    });

    if (!transaction) {
      return res.status(404).json({ message: 'Transaction not found' });
    }

    // Reverse wallet balance change
    const user = await User.findById(req.user._id);
    if (transaction.type === 'income') {
      user.wallet.balance -= transaction.amount;
    } else {
      user.wallet.balance += transaction.amount;
    }
    await user.save();

    await Transaction.findByIdAndDelete(req.params.id);

    res.json({ message: 'Transaction deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};