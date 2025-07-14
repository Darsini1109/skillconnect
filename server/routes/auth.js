const express = require('express');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const User = require('../models/User');
const AuditLog = require('../models/AuditLog');
const authMiddleware = require('../middleware/auth');
const { validate, schemas } = require('../middleware/validation');
const { sendEmail, sendSMS } = require('../services/communication');
const { logActivity } = require('../services/audit');

const router = express.Router();

// Generate JWT token
const generateToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: '7d' });
};

// Generate OTP
const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// Register user
router.post('/register', validate(schemas.register), async (req, res) => {
  try {
    const { firstName, lastName, email, password, phone, roles } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'User already exists with this email'
      });
    }

    // Create verification token
    const verificationToken = crypto.randomBytes(32).toString('hex');
    
    // Create user
    const user = new User({
      firstName,
      lastName,
      email,
      password,
      phone,
      roles: roles || ['mentee'],
      verification: {
        email: {
          token: verificationToken,
          expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours
        }
      }
    });

    await user.save();

    // Send verification email
    const verificationUrl = `${process.env.FRONTEND_URL}/verify-email?token=${verificationToken}`;
    await sendEmail(
      email,
      'Verify Your Email - SkillConnect',
      `Please click the following link to verify your email: ${verificationUrl}`
    );

    // Log activity
    await logActivity({
      userId: user._id,
      performedBy: user._id,
      action: 'user_created',
      details: { email, roles },
      metadata: { ipAddress: req.ip, userAgent: req.get('User-Agent') }
    });

    res.status(201).json({
      success: true,
      message: 'User registered successfully. Please check your email for verification.',
      data: {
        user: user.getSafeProfile()
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error during registration',
      error: error.message
    });
  }
});

// Login user
router.post('/login', validate(schemas.login), async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Check if account is locked
    if (user.isLocked) {
      return res.status(423).json({
        success: false,
        message: 'Account temporarily locked due to too many failed login attempts'
      });
    }

    // Check password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      await user.incLoginAttempts();
      await logActivity({
        userId: user._id,
        performedBy: user._id,
        action: 'login_failed',
        details: { reason: 'invalid_password' },
        metadata: { ipAddress: req.ip, userAgent: req.get('User-Agent') }
      });
      
      return res.status(400).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Check if email is verified
    if (!user.verification.email.isVerified) {
      return res.status(400).json({
        success: false,
        message: 'Please verify your email before logging in'
      });
    }

    // Check account status
    if (user.account.status !== 'active') {
      return res.status(403).json({
        success: false,
        message: 'Account is not active'
      });
    }

    // Reset login attempts and update last login
    await user.resetLoginAttempts();
    user.account.lastLogin = new Date();
    await user.save();

    // Generate token
    const token = generateToken(user._id);

    // Log successful login
    await logActivity({
      userId: user._id,
      performedBy: user._id,
      action: 'login_success',
      details: {},
      metadata: { ipAddress: req.ip, userAgent: req.get('User-Agent') }
    });

    res.json({
      success: true,
      message: 'Login successful',
      data: {
        token,
        user: user.getSafeProfile()
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error during login',
      error: error.message
    });
  }
});

// Verify email
router.post('/verify-email', validate(schemas.verifyEmail), async (req, res) => {
  try {
    const { token } = req.body;

    const user = await User.findOne({
      'verification.email.token': token,
      'verification.email.expiresAt': { $gt: new Date() }
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired verification token'
      });
    }

    // Update user verification status
    user.verification.email.isVerified = true;
    user.verification.email.token = undefined;
    user.verification.email.expiresAt = undefined;
    user.account.status = 'active';
    await user.save();

    // Log activity
    await logActivity({
      userId: user._id,
      performedBy: user._id,
      action: 'email_verified',
      details: {},
      metadata: { ipAddress: req.ip, userAgent: req.get('User-Agent') }
    });

    res.json({
      success: true,
      message: 'Email verified successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error during email verification',
      error: error.message
    });
  }
});

// Send phone OTP
router.post('/send-phone-otp', authMiddleware, async (req, res) => {
  try {
    const { phone } = req.body;

    if (!phone) {
      return res.status(400).json({
        success: false,
        message: 'Phone number is required'
      });
    }

    const otp = generateOTP();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Update user with OTP
    req.user.phone = phone;
    req.user.verification.phone.otp = otp;
    req.user.verification.phone.expiresAt = expiresAt;
    await req.user.save();

    // Send OTP via SMS
    await sendSMS(phone, `Your SkillConnect verification code is: ${otp}`);

    res.json({
      success: true,
      message: 'OTP sent successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error sending OTP',
      error: error.message
    });
  }
});

// Verify phone OTP
router.post('/verify-phone', authMiddleware, validate(schemas.verifyPhone), async (req, res) => {
  try {
    const { otp } = req.body;

    if (req.user.verification.phone.otp !== otp) {
      return res.status(400).json({
        success: false,
        message: 'Invalid OTP'
      });
    }

    if (req.user.verification.phone.expiresAt < new Date()) {
      return res.status(400).json({
        success: false,
        message: 'OTP has expired'
      });
    }

    // Update user verification status
    req.user.verification.phone.isVerified = true;
    req.user.verification.phone.otp = undefined;
    req.user.verification.phone.expiresAt = undefined;
    await req.user.save();

    // Log activity
    await logActivity({
      userId: req.user._id,
      performedBy: req.user._id,
      action: 'phone_verified',
      details: {},
      metadata: { ipAddress: req.ip, userAgent: req.get('User-Agent') }
    });

    res.json({
      success: true,
      message: 'Phone verified successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error during phone verification',
      error: error.message
    });
  }
});

// Forgot password
router.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    user.verification.email.token = resetToken;
    user.verification.email.expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour
    await user.save();

    // Send reset email
    const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;
    await sendEmail(
      email,
      'Password Reset - SkillConnect',
      `Please click the following link to reset your password: ${resetUrl}`
    );

    res.json({
      success: true,
      message: 'Password reset email sent'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error during password reset',
      error: error.message
    });
  }
});

// Reset password
router.post('/reset-password', validate(schemas.resetPassword), async (req, res) => {
  try {
    const { token, newPassword } = req.body;

    const user = await User.findOne({
      'verification.email.token': token,
      'verification.email.expiresAt': { $gt: new Date() }
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired reset token'
      });
    }

    // Update password
    user.password = newPassword;
    user.verification.email.token = undefined;
    user.verification.email.expiresAt = undefined;
    await user.save();

    // Log activity
    await logActivity({
      userId: user._id,
      performedBy: user._id,
      action: 'password_reset',
      details: {},
      metadata: { ipAddress: req.ip, userAgent: req.get('User-Agent') }
    });

    res.json({
      success: true,
      message: 'Password reset successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error during password reset',
      error: error.message
    });
  }
});

// Get current user
router.get('/me', authMiddleware, async (req, res) => {
  res.json({
    success: true,
    data: {
      user: req.user.getSafeProfile()
    }
  });
});

// Logout (client-side token removal)
router.post('/logout', authMiddleware, async (req, res) => {
  // In a more advanced implementation, you might want to blacklist the token
  res.json({
    success: true,
    message: 'Logged out successfully'
  });
});

module.exports = router;