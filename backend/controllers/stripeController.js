// Initialize Stripe with error handling
let stripe;
try {
  if (!process.env.STRIPE_SECRET_KEY) {
    throw new Error('STRIPE_SECRET_KEY not found in environment variables');
  }
  stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
  console.log('✅ Stripe initialized successfully');
} catch (error) {
  console.log('❌ Stripe initialization failed:', error.message);
}
const User = require('../models/User');
const Withdrawal = require('../models/Withdrawal');

// Process Stripe withdrawal (create refund)
exports.processStripeWithdrawal = async (req, res) => {
  try {
    const { withdrawalId } = req.params;
    
    const withdrawal = await Withdrawal.findById(withdrawalId)
      .populate('userId', 'name email');
    
    if (!withdrawal) {
      return res.status(404).json({ message: 'Withdrawal not found' });
    }

    // Convert coins to USD (100 coins = $1)
    const amountInCents = Math.floor((withdrawal.amount / 100) * 100);

    // Create a charge first (simulate payment), then refund it
    const charge = await stripe.charges.create({
      amount: amountInCents,
      currency: 'usd',
      customer: withdrawal.accountDetails.stripeCustomerId,
      description: `MoneyMinds withdrawal for ${withdrawal.userId.name}`,
      metadata: {
        withdrawalId: withdrawal._id.toString(),
        type: 'withdrawal_processing'
      }
    });

    // Immediately refund the charge (this sends money to user's card)
    const refund = await stripe.refunds.create({
      charge: charge.id,
      reason: 'requested_by_customer'
    });

    // Update withdrawal status
    withdrawal.status = 'completed';
    withdrawal.processedBy = req.user._id;
    withdrawal.processedAt = new Date();
    withdrawal.adminNotes = `Stripe refund completed: ${refund.id}`;
    await withdrawal.save();

    res.json({
      message: 'Stripe withdrawal processed successfully',
      refund: {
        id: refund.id,
        amount: refund.amount,
        status: refund.status
      }
    });

  } catch (error) {
    res.status(500).json({ 
      message: 'Stripe withdrawal failed', 
      error: error.message 
    });
  }
};

// Add Stripe card for withdrawals (simple method)
exports.addStripeCard = async (req, res) => {
  try {
    if (!stripe) {
      return res.status(500).json({ 
        message: 'Stripe not configured properly'
      });
    }

    const { cardToken, email } = req.body;
    const userId = req.user._id;

    // Create customer
    const customer = await stripe.customers.create({
      email: email,
      source: cardToken,
      description: `MoneyMinds user ${userId}`
    });

    // Save customer ID to user
    await User.findByIdAndUpdate(userId, {
      'stripeAccount.customerId': customer.id,
      'stripeAccount.onboardingComplete': true
    });

    res.json({
      message: 'Stripe card added successfully',
      customerId: customer.id
    });

  } catch (error) {
    res.status(500).json({ 
      message: 'Failed to add Stripe card', 
      error: error.message 
    });
  }
};

// Check Stripe card status
exports.getStripeStatus = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    
    if (!user.stripeAccount?.customerId) {
      return res.json({ 
        connected: false, 
        message: 'No Stripe card added' 
      });
    }

    const customer = await stripe.customers.retrieve(user.stripeAccount.customerId);
    
    res.json({
      connected: true,
      customerId: customer.id,
      email: customer.email,
      hasCard: customer.sources?.data?.length > 0
    });

  } catch (error) {
    res.status(500).json({ 
      message: 'Failed to get Stripe status', 
      error: error.message 
    });
  }
};

// Request Stripe withdrawal (simple refund method)
exports.requestStripeWithdrawal = async (req, res) => {
  try {
    const { amount } = req.body;
    const userId = req.user._id;

    const user = await User.findById(userId);
    
    if (!user.stripeAccount?.customerId) {
      return res.status(400).json({ 
        message: 'Please add your Stripe card first' 
      });
    }

    if (user.wallet.coins < amount) {
      return res.status(400).json({ message: 'Insufficient coins' });
    }

    if (amount < 5000) {
      return res.status(400).json({ 
        message: 'Minimum withdrawal amount is 5000 coins' 
      });
    }

    const withdrawal = new Withdrawal({
      userId,
      amount,
      currency: 'USD',
      method: 'Stripe',
      accountDetails: {
        stripeCustomerId: user.stripeAccount.customerId,
        email: user.email
      }
    });

    await withdrawal.save();

    res.status(201).json({
      message: 'Stripe withdrawal request submitted successfully',
      withdrawal,
      estimatedAmount: `$${(amount / 100).toFixed(2)}`,
      note: 'Admin will process refund to your card'
    });

  } catch (error) {
    res.status(500).json({ 
      message: 'Server error', 
      error: error.message 
    });
  }
};