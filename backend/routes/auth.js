const express = require('express');
const { body } = require('express-validator');
const passport = require('passport');
const { register, login, socialAuthSuccess, socialAuthFailure, forgotPassword, verifyResetCode, resetPassword } = require('../controllers/authController');

const router = express.Router();

// Register
router.post('/register', [
  body('name').trim().isLength({ min: 2 }).withMessage('Name must be at least 2 characters'),
  body('email').isEmail().withMessage('Please provide a valid email'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('role').optional().isIn(['user', 'admin']).withMessage('Role must be user or admin')
], register);

// Login
router.post('/login', [
  body('email').isEmail().withMessage('Please provide a valid email'),
  body('password').exists().withMessage('Password is required')
], login);

// Google Auth
router.get('/google', (req, res, next) => {
  if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) {
    return res.status(400).json({ message: 'Google OAuth not configured' });
  }
  passport.authenticate('google', { scope: ['profile', 'email'] })(req, res, next);
});
router.get('/google/callback', 
  passport.authenticate('google', { failureRedirect: '/api/auth/failure' }),
  socialAuthSuccess
);

// Facebook Auth
router.get('/facebook', (req, res, next) => {
  if (!process.env.FACEBOOK_APP_ID) {
    return res.status(400).json({ message: 'Facebook OAuth not configured' });
  }
  passport.authenticate('facebook', { scope: ['email'] })(req, res, next);
});
router.get('/facebook/callback',
  passport.authenticate('facebook', { failureRedirect: '/api/auth/failure' }),
  socialAuthSuccess
);

// Apple Auth
router.get('/apple', (req, res, next) => {
  if (!process.env.APPLE_CLIENT_ID) {
    return res.status(400).json({ message: 'Apple OAuth not configured' });
  }
  passport.authenticate('apple')(req, res, next);
});
router.get('/apple/callback',
  passport.authenticate('apple', { failureRedirect: '/api/auth/failure' }),
  socialAuthSuccess
);

// Auth failure
router.get('/failure', socialAuthFailure);

// Forgot Password
router.post('/forgot-password', [
  body('email').isEmail().withMessage('Please provide a valid email')
], forgotPassword);

// Verify Reset Code
router.post('/verify-reset-code', [
  body('email').isEmail().withMessage('Please provide a valid email'),
  body('code').isLength({ min: 6, max: 6 }).withMessage('Code must be 6 digits')
], verifyResetCode);

// Reset Password
router.post('/reset-password', [
  body('email').isEmail().withMessage('Please provide a valid email'),
  body('code').isLength({ min: 6, max: 6 }).withMessage('Code must be 6 digits'),
  body('newPassword').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('confirmPassword').isLength({ min: 6 }).withMessage('Confirm password must be at least 6 characters')
], resetPassword);

module.exports = router;