import User from '../models/User.js';
import passport from 'passport';
import crypto from 'crypto';
import sendEmail from '../utils/sendEmail.js';

// @desc    Show the signup page
// @route   GET /signup
export const getSignup = (req, res) => {
  res.render('signup', {
    title: 'Sign Up | Amora Hub',
    layout: false,
  });
};

// @desc    Register a new user
// @route   POST /signup
export const postSignup = async (req, res, next) => {
  try {
    const { displayName, email, phoneNumber, password, confirmPassword, terms } = req.body;

    if (!terms) {
        req.flash('error_msg', 'You must accept the Terms of Service and Privacy Policy.');
        return res.redirect('/signup');
    }

    if (password !== confirmPassword) {
      req.flash('error_msg', 'Passwords do not match.');
      return res.redirect('/signup');
    }

    let user = await User.findOne({ email: email.toLowerCase() });
    if (user) {
      req.flash('error_msg', 'Email is already registered.');
      return res.redirect('/signup');
    }

    user = new User({
      displayName,
      email: email.toLowerCase(),
      phoneNumber,
      password,
    });

    await user.save();

    // Generate OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    user.otp = otp;
    user.otpExpires = Date.now() + 10 * 60 * 1000; // 10 minutes

    // Generate verification token
    const verificationToken = crypto.randomBytes(20).toString('hex');
    user.emailVerificationToken = crypto
        .createHash('sha256')
        .update(verificationToken)
        .digest('hex');
    user.emailVerificationExpires = Date.now() + 24 * 60 * 60 * 1000; // 24 hours
    await user.save({ validateBeforeSave: false });

    // Store email in session for OTP resend
    req.session.signupEmail = user.email;

    // Robustly build the verification URL
    const domain = process.env.DOMAIN.endsWith('/') ? process.env.DOMAIN.slice(0, -1) : process.env.DOMAIN;
    const verificationUrl = `${domain}/verify-email/${verificationToken}`;

    try {
        await sendEmail({
            to: user.email,
            subject: 'Verify Your Email Address',
            template: 'emailVerification',
            data: {
                name: user.displayName,
                verificationURL: verificationUrl,
                otp: otp,
            },
        });
        req.flash('success_msg', 'Registration successful! Please check your email for the verification link or OTP.');
        res.redirect('/verify-otp'); // Redirect to a new OTP verification page
    } catch (err) {
        console.error('Email sending error:', err);
        user.emailVerificationToken = undefined;
        user.emailVerificationExpires = undefined;
        await user.save({ validateBeforeSave: false });
        req.flash('error_msg', 'Could not send verification email. Please try signing up again.');
        return res.redirect('/signup');
    }
  } catch (err) {
    console.error(err);
    res.redirect('/signup');
  }
};

// @desc    Show the login page
// @route   GET /login
export const getLogin = (req, res) => {
  res.render('login', {
    title: 'Login | Amora Hub',
    layout: false,
  });
};

// @desc    Login a user
// @route   POST /login
export const postLogin = (req, res, next) => {
  passport.authenticate('local', (err, user, info) => {
    if (err) { return next(err); }
    if (!user) {
      req.flash('error', info.message);
      return res.redirect('/login');
    }
    req.logIn(user, (err) => {
      if (err) { return next(err); }

      // Custom redirect based on role
      if (user.role === 'admin') {
        return res.redirect('/admin/dashboard');
      }
      if (!user.onboardingComplete) {
        return res.redirect('/onboarding/step1');
      }
      return res.redirect('/discover');
    });
  })(req, res, next);
};

// @desc    Show OTP verification page
// @route   GET /verify-otp
export const getVerifyOtpPage = (req, res) => {
    res.render('verify-otp', {
        title: 'Verify Account',
        layout: false,
    });
};

// @desc    Verify OTP
// @route   POST /verify-otp
export const postVerifyOtp = async (req, res) => {
    try {
        const { otp } = req.body;
        const user = await User.findOne({
            otp,
            otpExpires: { $gt: Date.now() },
        });

        if (!user) {
            req.flash('error_msg', 'OTP is invalid or has expired.');
            return res.redirect('/verify-otp');
        }

        user.isVerified = true;
        user.otp = undefined;
        user.otpExpires = undefined;
        await user.save();

        req.flash('success_msg', 'Email verified successfully! You can now log in.');
        res.redirect('/login');
    } catch (err) {
        console.error(err);
        req.flash('error_msg', 'An error occurred. Please try again.');
        res.redirect('/verify-otp');
    }
};

// @desc    Resend OTP
// @route   POST /resend-otp
export const resendOtp = async (req, res) => {
    try {
        // We need to know which user is requesting a new OTP.
        // Let's assume the email is stored in the session after signup.
        // This is a simplification. In a real app, you might need a more secure way to identify the user.
        if (!req.session.signupEmail) {
             req.flash('error_msg', 'Could not identify user. Please sign up again.');
             return res.redirect('/signup');
        }

        const user = await User.findOne({ email: req.session.signupEmail });
        if (!user) {
            req.flash('error_msg', 'User not found.');
            return res.redirect('/signup');
        }

        // Generate new OTP
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        user.otp = otp;
        user.otpExpires = Date.now() + 10 * 60 * 1000; // 10 minutes
        await user.save();

        // Send email with new OTP
        await sendEmail({
            to: user.email,
            subject: 'Your New Verification Code',
            template: 'emailVerification', // We can reuse the same template
             data: {
                name: user.displayName,
                verificationURL: `${process.env.DOMAIN}/verify-email/${user.emailVerificationToken}`, // The link still works
                otp: otp,
            },
        });

        req.flash('success_msg', 'A new OTP has been sent to your email.');
        res.redirect('/verify-otp');

    } catch (err) {
        console.error(err);
        req.flash('error_msg', 'Could not resend OTP. Please try again later.');
        res.redirect('/verify-otp');
    }
};


// @desc    Logout a user
// @route   GET /logout
export const logout = (req, res, next) => {
  req.logout((err) => {
    if (err) {
      return next(err);
    }
    req.flash('success_msg', 'You are logged out.');
    res.redirect('/');
  });
};

// @desc    Show forgot password page
// @route   GET /forgot-password
export const getForgotPassword = (req, res) => {
    res.render('forgot-password', {
        title: 'Forgot Password',
        layout: false, // This view has its own full HTML structure
    });
};

// @desc    Handle forgot password form
// @route   POST /forgot-password
export const postForgotPassword = async (req, res, next) => {
    try {
        const user = await User.findOne({ email: req.body.email });

        if (!user) {
            req.flash('success_msg', 'If an account with that email exists, a password reset link has been sent.');
            return res.redirect('/forgot-password');
        }

        // Generate OTP
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        user.otp = otp;
        user.otpExpires = Date.now() + 10 * 60 * 1000; // 10 minutes

        // Get reset token
        const resetToken = crypto.randomBytes(20).toString('hex');

        // Hash token and set to user
        user.passwordResetToken = crypto
            .createHash('sha256')
            .update(resetToken)
            .digest('hex');

        user.passwordResetExpires = Date.now() + 10 * 60 * 1000; // 10 minutes

        await user.save({ validateBeforeSave: false });

        // Robustly build the reset URL
        const domain = process.env.DOMAIN.endsWith('/') ? process.env.DOMAIN.slice(0, -1) : process.env.DOMAIN;
        const resetUrl = `${domain}/reset/${resetToken}`;

        try {
            await sendEmail({
                to: user.email,
                subject: 'Password Reset Request',
                template: 'passwordReset',
                data: {
                    name: user.displayName,
                    resetURL: resetUrl,
                    otp: otp,
                },
            });

            // Store email in session to identify the user on the OTP page
            req.session.resetEmail = user.email;

            req.flash('success_msg', 'We have sent a password reset link and an OTP to your email.');
            res.redirect('/reset-with-otp'); // Redirect to the new OTP page
        } catch (err) {
            console.error('Email sending error:', err);
            user.passwordResetToken = undefined;
            user.passwordResetExpires = undefined;
            user.otp = undefined;
            user.otpExpires = undefined;
            await user.save({ validateBeforeSave: false });
            req.flash('error_msg', 'Could not send password reset email. Please try again later.');
            return res.redirect('/forgot-password');
        }
    } catch (err) {
        console.error(err);
        req.flash('error_msg', 'There was an error. Please try again.');
        res.redirect('/forgot-password');
    }
};

// @desc    Show OTP entry page for password reset
// @route   GET /reset-with-otp
export const getResetWithOtp = (req, res) => {
    if (!req.session.resetEmail) {
        req.flash('error_msg', 'Invalid request. Please start the password reset process again.');
        return res.redirect('/forgot-password');
    }
    res.render('reset-with-otp', {
        title: 'Enter OTP',
        layout: false,
    });
};

// @desc    Verify the password reset OTP and redirect to the final reset page
// @route   POST /verify-reset-otp
export const postVerifyResetOtp = async (req, res) => {
    try {
        const { otp } = req.body;
        const email = req.session.resetEmail;

        if (!email) {
            req.flash('error_msg', 'Your session has expired. Please try again.');
            return res.redirect('/forgot-password');
        }

        const user = await User.findOne({
            email,
            otp,
            otpExpires: { $gt: Date.now() },
        });

        if (!user) {
            req.flash('error_msg', 'OTP is invalid or has expired.');
            return res.redirect('/reset-with-otp');
        }

        // OTP is correct. Invalidate it.
        user.otp = undefined;
        user.otpExpires = undefined;

        // We grant the user a short-lived token to access the final reset page.
        // This re-uses the existing token mechanism.
        const resetToken = crypto.randomBytes(20).toString('hex');
        user.passwordResetToken = crypto
            .createHash('sha256')
            .update(resetToken)
            .digest('hex');
        // Give them 5 minutes to complete the password change.
        user.passwordResetExpires = Date.now() + 5 * 60 * 1000;

        await user.save({ validateBeforeSave: false });

        // Clean up the session
        delete req.session.resetEmail;

        // Redirect to the final password reset page
        res.redirect(`/reset/${resetToken}`);

    } catch (err) {
        console.error(err);
        req.flash('error_msg', 'An error occurred. Please try again.');
        res.redirect('/forgot-password');
    }
};


// @desc    Verify user's email
// @route   GET /verify-email/:token
export const verifyEmail = async (req, res) => {
    try {
        const hashedToken = crypto
            .createHash('sha256')
            .update(req.params.token)
            .digest('hex');

        const user = await User.findOne({
            emailVerificationToken: hashedToken,
            emailVerificationExpires: { $gt: Date.now() },
        });

        if (!user) {
            req.flash('error_msg', 'Verification token is invalid or has expired.');
            return res.redirect('/login');
        }

        user.isVerified = true;
        user.emailVerificationToken = undefined;
        user.emailVerificationExpires = undefined;
        await user.save();

        req.flash('success_msg', 'Email verified successfully! You can now log in.');
        res.redirect('/login');

    } catch (err) {
        console.error(err);
        req.flash('error_msg', 'An error occurred during verification. Please try again.');
        res.redirect('/login');
    }
};


// @desc    Show reset password page
// @route   GET /reset/:token
export const getResetPassword = async (req, res) => {
    const hashedToken = crypto
        .createHash('sha256')
        .update(req.params.token)
        .digest('hex');

    try {
        const user = await User.findOne({
            passwordResetToken: hashedToken,
            passwordResetExpires: { $gt: Date.now() },
        });

        if (!user) {
            req.flash('error_msg', 'Password reset token is invalid or has expired.');
            return res.redirect('/forgot-password');
        }

        res.render('reset-password', {
            title: 'Reset Password',
            token: req.params.token,
            layout: false,
        });
    } catch (err) {
        console.error(err);
        res.redirect('/forgot-password');
    }
};

// @desc    Handle reset password form
// @route   POST /reset/:token
export const postResetPassword = async (req, res) => {
    try {
        const hashedToken = crypto
            .createHash('sha256')
            .update(req.params.token)
            .digest('hex');

        const user = await User.findOne({
            passwordResetToken: hashedToken,
            passwordResetExpires: { $gt: Date.now() },
        });

        if (!user) {
            req.flash('error_msg', 'Password reset token is invalid or has expired.');
            return res.redirect('/forgot-password');
        }

        // Check if passwords match
        if (req.body.password !== req.body.confirmPassword) {
            req.flash('error_msg', 'Passwords do not match.');
            return res.redirect(`/reset/${req.params.token}`);
        }

        // Set new password
        user.password = req.body.password;
        user.passwordResetToken = undefined;
        user.passwordResetExpires = undefined;
        await user.save();

        // Log the user in
        req.login(user, (err) => {
            if (err) return next(err);
            req.flash('success_msg', 'Password updated successfully. You are now logged in.');
            res.redirect('/discover');
        });

    } catch (err) {
        console.error(err);
        req.flash('error_msg', 'An error occurred. Please try again.');
        res.redirect('/forgot-password');
    }
};