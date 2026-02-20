const User = require('../models/User');
const Withdrawal = require('../models/Withdrawal');
const QuizAttempt = require('../models/QuizAttempt');
const Quiz = require('../models/Quiz');

// Get all users
exports.getAllUsers = async (req, res) => {
  try {
    const { page = 1, limit = 10, search } = req.query;
    const query = search ? { 
      $or: [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ]
    } : {};

    const users = await User.find(query)
      .select('-password -passwordResetToken -passwordResetExpires')
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ createdAt: -1 });

    const total = await User.countDocuments(query);

    res.json({
      users,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get user details
exports.getUserDetails = async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
      .select('-password -passwordResetToken -passwordResetExpires')
      .populate('quizHistory.quizId', 'title subject gradeLevel')
      .populate('quizHistory.attemptId', 'score percentage completedAt');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const withdrawals = await Withdrawal.find({ userId: user._id });
    const attempts = await QuizAttempt.find({ userId: user._id })
      .populate('quizId', 'title subject gradeLevel')
      .sort({ createdAt: -1 })
      .limit(10);

    res.json({
      user,
      withdrawals,
      recentAttempts: attempts
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Export users data
exports.exportUsers = async (req, res) => {
  try {
    const users = await User.find()
      .select('name email gradeLevel subjectPreferences wallet.coins wallet.totalEarned wallet.totalWithdrawn createdAt')
      .lean();

    const csvData = users.map(user => ({
      Name: user.name,
      Email: user.email,
      Grade: user.gradeLevel,
      Subjects: user.subjectPreferences?.join(', ') || '',
      CurrentCoins: user.wallet?.coins || 0,
      TotalEarned: user.wallet?.totalEarned || 0,
      TotalWithdrawn: user.wallet?.totalWithdrawn || 0,
      JoinedDate: user.createdAt
    }));

    res.json({
      data: csvData,
      filename: `users_export_${new Date().toISOString().split('T')[0]}.csv`
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Export withdrawals data
exports.exportWithdrawals = async (req, res) => {
  try {
    const withdrawals = await Withdrawal.find()
      .populate('userId', 'name email')
      .populate('processedBy', 'name')
      .lean();

    const csvData = withdrawals.map(w => ({
      UserName: w.userId?.name || 'Unknown',
      UserEmail: w.userId?.email || 'Unknown',
      Amount: w.amount,
      Currency: w.currency,
      Method: w.method,
      Status: w.status,
      RequestDate: w.createdAt,
      ProcessedBy: w.processedBy?.name || '',
      ProcessedDate: w.processedAt || '',
      AdminNotes: w.adminNotes || ''
    }));

    res.json({
      data: csvData,
      filename: `withdrawals_export_${new Date().toISOString().split('T')[0]}.csv`
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Export quiz data
exports.exportQuizData = async (req, res) => {
  try {
    const attempts = await QuizAttempt.find({ status: 'completed' })
      .populate('userId', 'name email gradeLevel')
      .populate('quizId', 'title subject gradeLevel')
      .lean();

    const csvData = attempts.map(a => ({
      UserName: a.userId?.name || 'Unknown',
      UserEmail: a.userId?.email || 'Unknown',
      UserGrade: a.userId?.gradeLevel || '',
      QuizTitle: a.quizId?.title || 'Unknown',
      QuizSubject: a.quizId?.subject || '',
      QuizGrade: a.quizId?.gradeLevel || '',
      Score: a.score,
      Percentage: a.percentage,
      CoinsEarned: a.totalCoinsEarned || 0,
      TimeSpent: a.timeSpent,
      CompletedDate: a.completedAt
    }));

    res.json({
      data: csvData,
      filename: `quiz_data_export_${new Date().toISOString().split('T')[0]}.csv`
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Dashboard stats
exports.getDashboardStats = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalQuizzes = await Quiz.countDocuments();
    const totalAttempts = await QuizAttempt.countDocuments({ status: 'completed' });
    const pendingWithdrawals = await Withdrawal.countDocuments({ status: 'pending' });
    
    const totalCoinsEarned = await User.aggregate([
      { $group: { _id: null, total: { $sum: '$wallet.totalEarned' } } }
    ]);
    
    const totalCoinsWithdrawn = await User.aggregate([
      { $group: { _id: null, total: { $sum: '$wallet.totalWithdrawn' } } }
    ]);

    res.json({
      totalUsers,
      totalQuizzes,
      totalAttempts,
      pendingWithdrawals,
      totalCoinsEarned: totalCoinsEarned[0]?.total || 0,
      totalCoinsWithdrawn: totalCoinsWithdrawn[0]?.total || 0
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};