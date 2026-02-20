const User = require('../models/User');
const QuizAttempt = require('../models/QuizAttempt');
const Withdrawal = require('../models/Withdrawal');

exports.getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
      .select('-password -passwordResetToken -passwordResetExpires')
      .populate('achievements')
      .populate('quizHistory.quizId', 'title subject gradeLevel')
      .populate('quizHistory.attemptId', 'score percentage completedAt');
    
    // Ensure profile object always exists with all fields
    const userResponse = {
      ...user.toObject(),
      profile: {
        firstName: user.profile?.firstName || null,
        lastName: user.profile?.lastName || null,
        bio: user.profile?.bio || null,
        gender: user.profile?.gender || null,
        phoneNumber: user.profile?.phoneNumber || null,
        dateOfBirth: user.profile?.dateOfBirth || null,
        school: user.profile?.school || null,
        college: user.profile?.college || null,
        city: user.profile?.city || null,
        country: user.profile?.country || null,
        avatar: user.profile?.avatar || null
      }
    };
    
    res.json({ user: userResponse });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.updateProfile = async (req, res) => {
  try {
    const { 
      firstName, lastName, bio, gender, email, phoneNumber, 
      dateOfBirth, school, college, city, country, avatar, 
      gradeLevel, subjectPreferences 
    } = req.body;

    const user = await User.findById(req.user._id);
    
    // Initialize profile if it doesn't exist
    if (!user.profile) {
      user.profile = {};
    }
    
    // Update profile fields
    if (firstName !== undefined) user.profile.firstName = firstName;
    if (lastName !== undefined) user.profile.lastName = lastName;
    if (bio !== undefined) user.profile.bio = bio;
    if (gender !== undefined) user.profile.gender = gender;
    if (phoneNumber !== undefined) user.profile.phoneNumber = phoneNumber;
    if (dateOfBirth !== undefined) user.profile.dateOfBirth = dateOfBirth;
    if (school !== undefined) user.profile.school = school;
    if (college !== undefined) user.profile.college = college;
    if (city !== undefined) user.profile.city = city;
    if (country !== undefined) user.profile.country = country;
    if (avatar !== undefined) user.profile.avatar = avatar;
    
    // Update main user fields
    if (email !== undefined) user.email = email;
    if (gradeLevel !== undefined) user.gradeLevel = gradeLevel;
    if (subjectPreferences !== undefined) user.subjectPreferences = subjectPreferences;

    await user.save();

    res.json({
      message: 'Profile updated successfully',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        gradeLevel: user.gradeLevel,
        subjectPreferences: user.subjectPreferences,
        profile: user.profile,
        wallet: user.wallet,
        level: user.level,
        experience: user.experience
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.getLeaderboard = async (req, res) => {
  try {
    const users = await User.find()
      .select('name profile level experience wallet.coins')
      .sort({ 'wallet.coins': -1 })
      .limit(10);

    res.json({ leaderboard: users });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.getDashboard = async (req, res) => {
  try {
    const userId = req.user._id;
    
    // Get user with populated data
    const user = await User.findById(userId)
      .select('-password -passwordResetToken -passwordResetExpires')
      .populate('quizHistory.quizId', 'title subject gradeLevel');

    // Get recent quiz attempts
    const recentAttempts = await QuizAttempt.find({ userId })
      .populate('quizId', 'title subject gradeLevel')
      .sort({ completedAt: -1 })
      .limit(5);

    // Calculate subject performance
    const subjectPerformance = {};
    user.quizHistory.forEach(history => {
      const subject = history.quizId?.subject;
      if (subject) {
        if (!subjectPerformance[subject]) {
          subjectPerformance[subject] = { total: 0, scores: [] };
        }
        subjectPerformance[subject].total++;
        subjectPerformance[subject].scores.push(history.score);
      }
    });

    // Calculate averages
    Object.keys(subjectPerformance).forEach(subject => {
      const scores = subjectPerformance[subject].scores;
      subjectPerformance[subject].average = scores.reduce((a, b) => a + b, 0) / scores.length;
    });

    res.json({
      user: {
        name: user.name,
        gradeLevel: user.gradeLevel,
        wallet: user.wallet,
        level: user.level,
        experience: user.experience
      },
      recentAttempts,
      subjectPerformance,
      totalQuizzes: user.quizHistory.length,
      coinHistory: user.quizHistory.slice(-10).map(h => ({
        date: h.completedAt,
        coins: h.coinsEarned,
        quiz: h.quizId?.title
      }))
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.requestWithdrawal = async (req, res) => {
  try {
    const { amount, currency, method, accountDetails } = req.body;
    const userId = req.user._id;

    const user = await User.findById(userId);
    
    if (user.wallet.coins < amount) {
      return res.status(400).json({ message: 'Insufficient coins' });
    }

    if (amount < 5000) {
      return res.status(400).json({ message: 'Minimum withdrawal amount is 5000 coins' });
    }

    const withdrawal = new Withdrawal({
      userId,
      amount,
      currency,
      method,
      accountDetails
    });

    await withdrawal.save();

    res.status(201).json({
      message: 'Withdrawal request submitted successfully',
      withdrawal
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.getReferralStats = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    
    res.json({
      success: true,
      totalReferrals: user.totalReferrals || 0,
      referralCoins: user.wallet.referralCoins || 0,
      referralCode: user.referralCode
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.getReferralHistory = async (req, res) => {
  try {
    const referrals = await User.find({ referredBy: req.user._id })
      .select('name email createdAt')
      .sort({ createdAt: -1 });
    
    const referralHistory = referrals.map(referral => ({
      id: referral._id,
      name: referral.name,
      email: referral.email,
      joinedAt: referral.createdAt,
      bonusEarned: 25 // Base bonus, could be dynamic based on level
    }));
    
    res.json({
      success: true,
      referrals: referralHistory
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.getWithdrawals = async (req, res) => {
  try {
    const withdrawals = await Withdrawal.find({ userId: req.user._id })
      .sort({ createdAt: -1 });
    
    res.json({ withdrawals });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};