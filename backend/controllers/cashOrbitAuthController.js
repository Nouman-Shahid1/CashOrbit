const User = require('../models/User');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { sendEmail } = require('../utils/emailService');

// Generate JWT token
const generateToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d'
  });
};

// Generate OTP
const generateOTP = () => {
  return Math.floor(1000 + Math.random() * 9000).toString();
};

// Send OTP to email
exports.sendOTP = async (req, res) => {
  try {
    const { email, deviceId, type = 'login' } = req.body;

    if (!email || !deviceId) {
      return res.status(400).json({
        success: false,
        message: 'Email and device ID are required'
      });
    }

    // For login, check if user exists
    if (type === 'login') {
      const existingUser = await User.findOne({ email });
      if (!existingUser) {
        return res.status(404).json({
          success: false,
          message: 'No account found with this email. Please sign up first.'
        });
      }
    }

    // Check if this is admin email
    const isAdmin = email === process.env.ADMIN_EMAIL;
    let otpCode;
    
    if (isAdmin) {
      // Use dedicated admin OTP
      otpCode = process.env.ADMIN_OTP || '1234';
    } else {
      // Generate random OTP for regular users
      otpCode = generateOTP();
    }
    
    const otpExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Find user for login
    let user = await User.findOne({ email });
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found. Please sign up first.'
      });
    }

    // Check if user is blocked
    if (user.status === 'Blocked') {
      return res.status(403).json({
        success: false,
        message: 'Your account has been blocked. Please contact support.'
      });
    }

    // Update existing user
    user.deviceId = deviceId;
    user.otp = {
      code: otpCode,
      expiresAt: otpExpires,
      verified: false
    };

    await user.save();

    if (isAdmin) {
      // For admin, return success without sending email
      res.status(200).json({
        success: true,
        message: 'Admin OTP ready',
        isAdmin: true
      });
    } else {
      // Send OTP email for regular users
      try {
        await sendEmail({
          email: email,
          subject: 'CashOrbit - Login OTP',
          code: otpCode
        });

        res.status(200).json({
          success: true,
          message: 'OTP sent to your email'
        });
      } catch (emailError) {
        // For development, return OTP in response if email fails
        console.log('📧 EMAIL FALLBACK - OTP Code:', otpCode);
        res.status(200).json({
          success: true,
          message: 'OTP generated successfully',
          otp: otpCode // For testing - remove in production
        });
      }
    }

  } catch (error) {
    console.error('Send OTP error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to send OTP'
    });
  }
};

// Send signup OTP
exports.sendSignupOTP = async (req, res) => {
  try {
    const { email, name, deviceId } = req.body;

    if (!email || !name || !deviceId) {
      return res.status(400).json({
        success: false,
        message: 'Email, name, and device ID are required'
      });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      // If user exists but is pending (incomplete signup), delete and recreate
      if (existingUser.status === 'Pending' && !existingUser.otp?.verified) {
        await User.deleteOne({ email });
      } else {
        return res.status(400).json({
          success: false,
          message: 'Account already exists with this email. Please login instead.'
        });
      }
    }

    const otpCode = generateOTP();
    const otpExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Create new user with OTP
    const user = new User({
      email,
      phone: email, // Use email as phone for now
      deviceId,
      name,
      role: 'user',
      otp: {
        code: otpCode,
        expiresAt: otpExpires,
        verified: false
      },
      status: 'Pending' // Will be activated after OTP verification
    });

    await user.save();

    // Send OTP email
    try {
      await sendEmail({
        email: email,
        subject: 'CashOrbit - Signup Verification',
        code: otpCode
      });

      res.status(200).json({
        success: true,
        message: 'Verification OTP sent to your email'
      });
    } catch (emailError) {
      // For development, return OTP in response if email fails
      console.log('📧 EMAIL FALLBACK - Signup OTP Code:', otpCode);
      res.status(200).json({
        success: true,
        message: 'OTP generated successfully',
        otp: otpCode // For testing - remove in production
      });
    }

  } catch (error) {
    console.error('Send signup OTP error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to send signup OTP'
    });
  }
};

// Verify OTP and login
exports.verifyOTP = async (req, res) => {
  try {
    const { email, otp, deviceId } = req.body;

    if (!email || !otp || !deviceId) {
      return res.status(400).json({
        success: false,
        message: 'Email, OTP, and device ID are required'
      });
    }

    // Find user
    const user = await User.findOne({ email }).populate('plan');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Check if user is blocked
    if (user.status === 'Blocked') {
      return res.status(403).json({
        success: false,
        message: 'Your account has been blocked. Please contact support.'
      });
    }

    // Check OTP
    if (!user.otp || user.otp.code !== otp) {
      return res.status(400).json({
        success: false,
        message: 'Invalid OTP'
      });
    }

    // Check OTP expiry
    if (user.otp.expiresAt < new Date()) {
      return res.status(400).json({
        success: false,
        message: 'OTP has expired'
      });
    }

    // Verify device ID
    if (user.deviceId !== deviceId) {
      return res.status(400).json({
        success: false,
        message: 'Invalid device'
      });
    }

    // Mark OTP as verified and clear it
    user.otp.verified = true;
    user.otp.code = undefined;
    user.otp.expiresAt = undefined;
    
    // Auto check-in on login
    const today = new Date().toISOString().split('T')[0];
    if (!user.streak?.lastCheckInDate || user.streak.lastCheckInDate !== today) {
      const checkInResult = user.checkIn();
      if (checkInResult.success) {
        user.wallet.coins += 10;
        user.wallet.totalEarned += 10;
      }
    }
    
    await user.save();

    // Generate JWT token
    const token = generateToken(user._id);

    // Prepare user data for response
    const userData = {
      id: user._id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
      plan: user.plan,
      status: user.status,
      referralCode: user.referralCode,
      wallet: user.wallet
    };

    res.status(200).json({
      success: true,
      message: 'Login successful',
      token,
      user: userData
    });

  } catch (error) {
    console.error('Verify OTP error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to verify OTP'
    });
  }
};

// Verify signup OTP and create account
exports.verifySignupOTP = async (req, res) => {
  try {
    const { email, otp, name, deviceId } = req.body;

    if (!email || !otp || !name || !deviceId) {
      return res.status(400).json({
        success: false,
        message: 'Email, OTP, name, and device ID are required'
      });
    }

    // Find user
    const user = await User.findOne({ email }).populate('plan');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Check if user is blocked
    if (user.status === 'Blocked') {
      return res.status(403).json({
        success: false,
        message: 'Your account has been blocked. Please contact support.'
      });
    }

    // Check OTP
    if (!user.otp || user.otp.code !== otp) {
      return res.status(400).json({
        success: false,
        message: 'Invalid OTP'
      });
    }

    // Check OTP expiry
    if (user.otp.expiresAt < new Date()) {
      return res.status(400).json({
        success: false,
        message: 'OTP has expired'
      });
    }

    // Verify device ID
    if (user.deviceId !== deviceId) {
      return res.status(400).json({
        success: false,
        message: 'Invalid device'
      });
    }

    // Activate account and clear OTP
    user.status = 'Active';
    user.name = name;
    user.otp.verified = true;
    user.otp.code = undefined;
    user.otp.expiresAt = undefined;
    
    // Give welcome bonus
    user.wallet.coins += 50;
    user.wallet.totalEarned += 50;
    
    await user.save();

    // Generate JWT token
    const token = generateToken(user._id);

    // Prepare user data for response
    const userData = {
      id: user._id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
      plan: user.plan,
      status: user.status,
      referralCode: user.referralCode,
      wallet: user.wallet
    };

    res.status(200).json({
      success: true,
      message: 'Account created successfully! Welcome bonus of 50 coins added.',
      token,
      user: userData
    });

  } catch (error) {
    console.error('Verify signup OTP error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to verify OTP'
    });
  }
};

// Get current user
exports.getCurrentUser = async (req, res) => {
  try {
    const user = await User.findById(req.user.id)
      .populate('plan')
      .select('-password -otp');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.status(200).json({
      success: true,
      user: {
        ...user.toObject(),
        streak: user.streak || { current: 0, longest: 0, lastCheckIn: null }
      }
    });

  } catch (error) {
    console.error('Get current user error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get user data'
    });
  }
};

// Get streak data
exports.getStreak = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    
    const streak = user.streak || { current: 0, longest: 0, lastCheckIn: null };
    const today = new Date().toISOString().split('T')[0];
    const canCheckIn = streak.lastCheckInDate !== today;
    
    res.json({
      success: true,
      streak: {
        currentStreak: streak.current,
        longestStreak: streak.longest,
        lastCheckIn: streak.lastCheckIn,
        canCheckIn,
        nextMilestone: 30,
        progress: (streak.current / 30) * 100
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Check in
exports.checkIn = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    const result = user.checkIn();
    
    if (!result.success) {
      return res.status(400).json({ success: false, message: result.message });
    }
    
    const coinsAwarded = 10;
    user.wallet.coins += coinsAwarded;
    user.wallet.totalEarned += coinsAwarded;
    
    await user.save();
    
    res.json({
      success: true,
      message: 'Check-in successful!',
      streak: result.streak,
      coinsAwarded
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Claim streak bonus
exports.claimStreakBonus = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    const streak = user.streak?.current || 0;
    
    if (streak < 7) {
      return res.status(400).json({ success: false, message: 'Need at least 7 day streak to claim bonus' });
    }
    
    const bonusCoins = Math.floor(streak / 7) * 50;
    user.wallet.coins += bonusCoins;
    user.wallet.totalEarned += bonusCoins;
    
    await user.save();
    
    res.json({
      success: true,
      message: 'Streak bonus claimed!',
      bonusCoins
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Logout
exports.logout = async (req, res) => {
  try {
    res.status(200).json({
      success: true,
      message: 'Logged out successfully'
    });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to logout'
    });
  }
};