import express from 'express';
import { getSignup, postSignup, getLogin, postLogin, logout, getForgotPassword, postForgotPassword, getResetPassword, postResetPassword, verifyEmail, getVerifyOtpPage, postVerifyOtp, resendOtp, getResetWithOtp, postVerifyResetOtp } from '../controllers/authController.js';
// import { ensureGuest } from '../middleware/auth.js';

const router = express.Router();

// @desc    Show signup page
// @route   GET /signup
router.get('/signup', getSignup);

// @desc    Process signup form
// @route   POST /signup
router.post('/signup', postSignup);

// @desc    Show login page
// @route   GET /login
router.get('/login', getLogin);

// @desc    Process login form
// @route   POST /login
router.post('/login', postLogin);

import passport from 'passport';

// @desc    Logout user
// @route   GET /logout
router.get('/logout', logout);

// @desc    Auth with Google
// @route   GET /auth/google
router.get('/auth/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

// @desc    Google auth callback
// @route   GET /auth/google/callback
router.get(
  '/auth/google/callback',
  passport.authenticate('google', { failureRedirect: '/login' }),
  (req, res) => {
    // Successful authentication, now redirect
    if (req.user.role === 'admin') {
      return res.redirect('/admin/dashboard');
    }
    // If user signed up with Google and has no display name, ask for one
    if (!req.user.displayName) {
      return res.redirect('/onboarding/display-name');
    }
    if (!req.user.onboardingComplete) {
      return res.redirect('/onboarding/step1');
    }
    return res.redirect('/discover');
  }
);

// @desc    Email verification route
router.get('/verify-email/:token', verifyEmail);

// @desc    OTP verification routes
router.get('/verify-otp', getVerifyOtpPage);
router.post('/verify-otp', postVerifyOtp);
router.post('/resend-otp', resendOtp);

// @desc    Forgot password routes
router.get('/forgot-password', getForgotPassword);
router.post('/forgot-password', postForgotPassword);

// @desc    OTP entry for password reset
router.get('/reset-with-otp', getResetWithOtp);
router.post('/verify-reset-otp', postVerifyResetOtp);

// @desc    Reset password routes
router.get('/reset/:token', getResetPassword);
router.post('/reset/:token', postResetPassword);


export default router;