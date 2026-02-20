const jwt = require('jsonwebtoken');
const { validationResult } = require('express-validator');
const passport = require('passport');
const crypto = require('crypto');
const axios = require('axios');
const User = require('../models/User');
const { sendEmail } = require('../utils/emailService');

const generateToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: '7d' });
};

exports.register = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, email, password, referralCode } = req.body;

    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res.status(400).json({ 
        message: 'User already exists with this email' 
      });
    }

    // Handle referral if provided
    let referredBy = null;
    if (referralCode) {
      const referrer = await User.findOne({ referralCode });
      if (referrer) {
        referredBy = referrer._id;
      }
    }

    // Generate device ID for new user
    const deviceId = Math.random().toString(36).substring(2, 15);

    const user = new User({ 
      name, 
      email,
      phone: email, // Use email as phone for CashOrbit
      password,
      deviceId,
      role: 'user',
      authProvider: 'local',
      status: 'Active',
      gradeLevel: 'Grade 1-5',
      subjectPreferences: ['Math', 'Science', 'English'],
      referredBy
    });
    
    // Give welcome bonus
    user.wallet.coins = 50;
    user.wallet.totalEarned = 50;
    
    await user.save();

    // Handle referral bonus
    if (referredBy) {
      const referrer = await User.findById(referredBy);
      if (referrer) {
        // Calculate referral bonus based on referrer's total referrals
        const referralCount = referrer.totalReferrals + 1;
        let bonusCoins = 25; // Base bonus
        
        if (referralCount >= 50) bonusCoins = 500;
        else if (referralCount >= 25) bonusCoins = 250;
        else if (referralCount >= 10) bonusCoins = 100;
        else if (referralCount >= 5) bonusCoins = 50;
        
        // Award bonus to referrer
        referrer.wallet.coins += bonusCoins;
        referrer.wallet.totalEarned += bonusCoins;
        referrer.wallet.referralCoins += bonusCoins;
        referrer.totalReferrals += 1;
        
        await referrer.save();
        
        // Give bonus to new user too
        user.wallet.coins += 25;
        user.wallet.totalEarned += 25;
        await user.save();
      }
    }

    const token = generateToken(user._id);

    res.status(201).json({
      message: 'User registered successfully',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        plan: user.plan,
        status: user.status,
        referralCode: user.referralCode,
        wallet: user.wallet
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.login = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password } = req.body;

    const user = await User.findOne({ email }).populate('plan');
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Check if user is blocked
    if (user.status === 'Blocked') {
      return res.status(403).json({
        message: 'Your account has been blocked. Please contact support.'
      });
    }

    // Check if user has a password (for email/password login)
    if (!user.password) {
      return res.status(400).json({ 
        message: 'This account was created with OTP. Please use OTP login instead.' 
      });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

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

    const token = generateToken(user._id);

    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        plan: user.plan,
        status: user.status,
        referralCode: user.referralCode,
        wallet: user.wallet
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.socialAuthSuccess = async (req, res) => {
  try {
    const token = generateToken(req.user._id);
    
    res.json({
      message: 'Social login successful',
      token,
      user: {
        id: req.user._id,
        name: req.user.name,
        email: req.user.email,
        role: req.user.role,
        authProvider: req.user.authProvider
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.socialAuthFailure = (req, res) => {
  res.status(401).json({ message: 'Social authentication failed' });
};



exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const resetToken = user.createPasswordResetToken();
    await user.save({ validateBeforeSave: false });

    const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
    
    // Store verification code temporarily
    user.passwordResetToken = crypto.createHash('sha256').update(verificationCode).digest('hex');
    await user.save({ validateBeforeSave: false });

    try {
      await sendEmail({
        email: user.email,
        subject: 'MoneyMinds - Password Reset Code',
        code: verificationCode
      });

      res.status(200).json({
        message: `Verification code generated for ${user.email}`,
        code: verificationCode,
        note: 'Use this code to reset your password (valid for 10 minutes)'
      });
    } catch (error) {
      console.log('❌ Email Error Details:');
      console.log('Error:', error.message);
      console.log('Email User:', process.env.EMAIL_USER);
      console.log('Email Pass Length:', process.env.EMAIL_PASS ? process.env.EMAIL_PASS.length : 'Not set');
      
      // Always save the token for verification
      user.passwordResetToken = crypto.createHash('sha256').update(verificationCode).digest('hex');
      user.passwordResetExpires = Date.now() + 10 * 60 * 1000;
      await user.save({ validateBeforeSave: false });
      
      return res.status(200).json({ 
        message: 'Email failed but code generated for testing',
        code: verificationCode,
        error: error.message,
        email: user.email,
        note: 'Use this code to continue testing'
      });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.verifyResetCode = async (req, res) => {
  try {
    const { email, code } = req.body;
    
    const hashedCode = crypto.createHash('sha256').update(code).digest('hex');
    const user = await User.findOne({
      email,
      passwordResetToken: hashedCode,
      passwordResetExpires: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({ message: 'Invalid or expired verification code' });
    }

    res.status(200).json({
      message: 'Verification code is valid',
      resetToken: code
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.resetPassword = async (req, res) => {
  try {
    const { email, code, newPassword, confirmPassword } = req.body;

    if (newPassword !== confirmPassword) {
      return res.status(400).json({ message: 'Passwords do not match' });
    }

    const hashedCode = crypto.createHash('sha256').update(code).digest('hex');
    const user = await User.findOne({
      email,
      passwordResetToken: hashedCode,
      passwordResetExpires: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({ message: 'Invalid or expired verification code' });
    }

    user.password = newPassword;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save();

    res.status(200).json({
      message: 'Password reset successful'
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};