const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true
  },
  phone: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    minlength: 6
  },
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user'
  },
  authProvider: {
    type: String,
    enum: ['local', 'google', 'facebook', 'apple', 'otp'],
    default: 'otp'
  },
  deviceId: {
    type: String,
    required: true
  },
  // CashOrbit specific fields
  plan: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Plan',
    default: null
  },
  planActivatedAt: Date,
  planExpiresAt: Date,
  status: {
    type: String,
    enum: ['Active', 'Blocked', 'Pending'],
    default: 'Active'
  },
  referralCode: {
    type: String,
    unique: true
  },
  referredBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  totalReferrals: {
    type: Number,
    default: 0
  },
  // Keep existing fields for backward compatibility
  socialId: {
    type: String
  },
  gradeLevel: {
    type: String,
    enum: ['Grade 1-5', 'Grade 6-8', 'Grade 9-10', 'Grade 11-12'],
    default: 'Grade 1-5'
  },
  subjectPreferences: [{
    type: String,
    enum: ['Math', 'Science', 'English', 'History', 'Geography', 'Literature', 'Technology', 'Sports', 'General Knowledge']
  }],
  profile: {
    firstName: String,
    lastName: String,
    bio: String,
    gender: {
      type: String,
      enum: ['male', 'female', 'other', 'prefer-not-to-say']
    },
    phoneNumber: String,
    dateOfBirth: Date,
    school: String,
    college: String,
    city: String,
    country: String,
    avatar: String
  },
  wallet: {
    coins: {
      type: Number,
      default: 0
    },
    totalEarned: {
      type: Number,
      default: 0
    },
    totalWithdrawn: {
      type: Number,
      default: 0
    },
    referralCoins: {
      type: Number,
      default: 0
    }
  },
  // OTP fields
  otp: {
    code: String,
    expiresAt: Date,
    verified: {
      type: Boolean,
      default: false
    }
  },
  // Withdrawal tracking
  lastWithdrawDate: Date,
  weeklyWithdrawCount: {
    type: Number,
    default: 0
  },
  weekStartDate: Date,
  // Streak tracking
  streak: {
    current: {
      type: Number,
      default: 0
    },
    longest: {
      type: Number,
      default: 0
    },
    lastCheckIn: Date,
    lastCheckInDate: String // YYYY-MM-DD format
  },
  quizHistory: [{
    quizId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Quiz'
    },
    attemptId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'QuizAttempt'
    },
    score: Number,
    coinsEarned: Number,
    completedAt: Date
  }],
  achievements: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Achievement'
  }],
  level: {
    type: Number,
    default: 1
  },
  experience: {
    type: Number,
    default: 0
  },
  passwordResetToken: String,
  passwordResetExpires: Date,
  stripeAccount: {
    customerId: String,
    onboardingComplete: {
      type: Boolean,
      default: false
    }
  }
}, {
  timestamps: true
});

// Generate referral code before saving
userSchema.pre('save', async function(next) {
  if (this.isNew && !this.referralCode) {
    this.referralCode = 'CASH' + Math.random().toString(36).substring(2, 8).toUpperCase();
  }
  if (!this.isModified('password') || !this.password) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

userSchema.methods.comparePassword = async function(password) {
  return bcrypt.compare(password, this.password);
};

userSchema.methods.createPasswordResetToken = function() {
  const resetToken = crypto.randomBytes(32).toString('hex');
  this.passwordResetToken = crypto.createHash('sha256').update(resetToken).digest('hex');
  this.passwordResetExpires = Date.now() + 10 * 60 * 1000; // 10 minutes
  return resetToken;
};

userSchema.methods.addCoins = function(amount, reason = 'Quiz completion') {
  this.wallet.coins += amount;
  this.wallet.totalEarned += amount;
  return this.save();
};

userSchema.methods.canWithdrawToStripe = function() {
  return this.stripeAccount?.customerId && this.stripeAccount?.onboardingComplete;
};

userSchema.methods.checkIn = function() {
  const today = new Date().toISOString().split('T')[0];
  const lastCheckIn = this.streak?.lastCheckInDate;
  
  if (lastCheckIn === today) {
    return { success: false, message: 'Already checked in today' };
  }
  
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = yesterday.toISOString().split('T')[0];
  
  if (!this.streak) {
    this.streak = { current: 0, longest: 0 };
  }
  
  if (lastCheckIn === yesterdayStr) {
    this.streak.current += 1;
  } else {
    this.streak.current = 1;
  }
  
  if (this.streak.current > this.streak.longest) {
    this.streak.longest = this.streak.current;
  }
  
  this.streak.lastCheckIn = new Date();
  this.streak.lastCheckInDate = today;
  
  return { success: true, streak: this.streak.current };
};

// Convert coins to PKR (100 coins = 1 PKR)
userSchema.methods.getCoinsPKRValue = function() {
  return Math.floor(this.wallet.coins / 100);
};

// Check if user has enough coins for PKR amount
userSchema.methods.hasEnoughCoinsForPKR = function(pkrAmount) {
  return this.wallet.coins >= (pkrAmount * 100);
};

module.exports = mongoose.model('User', userSchema);