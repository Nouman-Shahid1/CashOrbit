require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const session = require('express-session');
const passport = require('./config/passport');

// Original routes
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const transactionRoutes = require('./routes/transactions');
const achievementRoutes = require('./routes/achievements');
const quizRoutes = require('./routes/quizzes');
const questionRoutes = require('./routes/questions');
const attemptRoutes = require('./routes/attempts');
const categoryRoutes = require('./routes/categories');
const aiRoutes = require('./routes/ai');
const withdrawalRoutes = require('./routes/withdrawals');
const adminRoutes = require('./routes/admin');
const stripeRoutes = require('./routes/stripe');
const testStripeRoutes = require('./routes/test-stripe');
const testEmailRoutes = require('./routes/test-email');

// CashOrbit routes
const cashOrbitAuthRoutes = require('./routes/cashOrbitAuth');
const planRoutes = require('./routes/plans');
const taskRoutes = require('./routes/tasks');
const cashOrbitWithdrawalRoutes = require('./routes/cashOrbitWithdrawals');
const cashOrbitAdminRoutes = require('./routes/cashOrbitAdmin');
const testRoutes = require('./routes/test');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());

// Database connection
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error('MongoDB connection error:', err));

// Original routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/transactions', transactionRoutes);
app.use('/api/achievements', achievementRoutes);
app.use('/api/quizzes', quizRoutes);
app.use('/api/questions', questionRoutes);
app.use('/api/attempts', attemptRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/admin/withdrawals', withdrawalRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/stripe', stripeRoutes);
app.use('/api', testStripeRoutes);
app.use('/api', testEmailRoutes);

// CashOrbit routes
app.use('/api/cashorbit-auth', cashOrbitAuthRoutes);
app.use('/api/cashorbit/plans', planRoutes);
app.use('/api/cashorbit/tasks', taskRoutes);
app.use('/api/cashorbit/withdrawals', cashOrbitWithdrawalRoutes);
app.use('/api/cashorbit-admin', cashOrbitAdminRoutes);
app.use('/api/test', testRoutes);



app.get('/', (req, res) => {
  res.json({ 
    message: 'CashOrbit API is running!',
    endpoints: {
      cashorbit: {
        auth: '/api/cashorbit/auth',
        plans: '/api/cashorbit/plans',
        tasks: '/api/cashorbit/tasks',
        withdrawals: '/api/cashorbit/withdrawals',
        admin: '/api/cashorbit/admin'
      },
      original: {
        quizzes: '/api/quizzes',
        auth: '/api/auth'
      }
    }
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});