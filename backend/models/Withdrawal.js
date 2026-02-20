const mongoose = require('mongoose');

const withdrawalSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  amount: {
    type: Number,
    required: true,
    min: 5000 // minimum withdrawal threshold
  },
  currency: {
    type: String,
    enum: ['PKR', 'USD'],
    required: true
  },
  method: {
    type: String,
    enum: ['JazzCash', 'Easypaisa', 'Bank', 'PayPal', 'Stripe'],
    required: true
  },
  accountDetails: {
    accountNumber: String,
    accountName: String,
    bankName: String,
    email: String, // for PayPal
    stripeAccountId: String, // for Stripe Connect
    cardLast4: String // for Stripe card payments
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected', 'completed'],
    default: 'pending'
  },
  adminNotes: String,
  processedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  processedAt: Date
}, {
  timestamps: true
});

module.exports = mongoose.model('Withdrawal', withdrawalSchema);