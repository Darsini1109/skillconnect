const express = require('express');
const User = require('../models/User');
const authMiddleware = require('../middleware/auth');
const { validate, schemas } = require('../middleware/validation');
const { logActivity } = require('../services/audit');

const router = express.Router();

// Get user profile
router.get('/profile', authMiddleware, async (req, res) => {
  try {
    res.json({
      success: true,
      data: {
        user: req.user.getSafeProfile()
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error retrieving profile',
      error: error.message
    });
  }
});

// Update user profile
router.put('/profile', authMiddleware, validate(schemas.updateProfile), async (req, res) => {
  try {
    const updates = req.body;
    const allowedUpdates = ['firstName', 'lastName', 'phone', 'profile'];
    
    // Filter allowed updates
    const filteredUpdates = {};
    allowedUpdates.forEach(field => {
      if (updates[field] !== undefined) {
        filteredUpdates[field] = updates[field];
      }
    });

    // Update user
    Object.assign(req.user, filteredUpdates);
    await req.user.save();

    // Log activity
    await logActivity({
      userId: req.user._id,
      performedBy: req.user._id,
      action: 'user_updated',
      details: { updatedFields: Object.keys(filteredUpdates) },
      metadata: { ipAddress: req.ip, userAgent: req.get('User-Agent') }
    });

    res.json({
      success: true,
      message: 'Profile updated successfully',
      data: {
        user: req.user.getSafeProfile()
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error updating profile',
      error: error.message
    });
  }
});

// Change password
router.put('/change-password', authMiddleware, validate(schemas.changePassword), async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    // Verify current password
    const isMatch = await req.user.comparePassword(currentPassword);
    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: 'Current password is incorrect'
      });
    }

    // Update password
    req.user.password = newPassword;
    await req.user.save();

    // Log activity
    await logActivity({
      userId: req.user._id,
      performedBy: req.user._id,
      action: 'password_changed',
      details: {},
      metadata: { ipAddress: req.ip, userAgent: req.get('User-Agent') }
    });

    res.json({
      success: true,
      message: 'Password changed successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error changing password',
      error: error.message
    });
  }
});

// Switch user role
router.put('/switch-role', authMiddleware, async (req, res) => {
  try {
    const { role } = req.body;

    if (!req.user.roles.includes(role)) {
      return res.status(400).json({
        success: false,
        message: 'You do not have permission to switch to this role'
      });
    }

    req.user.currentRole = role;
    await req.user.save();

    // Log activity
    await logActivity({
      userId: req.user._id,
      performedBy: req.user._id,
      action: 'role_switched',
      details: { newRole: role },
      metadata: { ipAddress: req.ip, userAgent: req.get('User-Agent') }
    });

    res.json({
      success: true,
      message: 'Role switched successfully',
      data: {
        user: req.user.getSafeProfile()
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error switching role',
      error: error.message
    });
  }
});

// Deactivate account
router.put('/deactivate', authMiddleware, async (req, res) => {
  try {
    req.user.account.status = 'inactive';
    await req.user.save();

    // Log activity
    await logActivity({
      userId: req.user._id,
      performedBy: req.user._id,
      action: 'user_deactivated',
      details: {},
      metadata: { ipAddress: req.ip, userAgent: req.get('User-Agent') }
    });

    res.json({
      success: true,
      message: 'Account deactivated successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error deactivating account',
      error: error.message
    });
  }
});

// Get user activity log
router.get('/activity', authMiddleware, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const activities = await require('../models/AuditLog')
      .find({ userId: req.user._id })
      .sort({ timestamp: -1 })
      .skip(skip)
      .limit(limit)
      .select('-metadata.userAgent -metadata.ipAddress');

    const total = await require('../models/AuditLog').countDocuments({ userId: req.user._id });

    res.json({
      success: true,
      data: {
        activities,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error retrieving activity log',
      error: error.message
    });
  }
});

// Delete account (soft delete)
router.delete('/account', authMiddleware, async (req, res) => {
  try {
    req.user.account.status = 'deleted';
    req.user.email = `deleted_${Date.now()}_${req.user.email}`;
    await req.user.save();

    // Log activity
    await logActivity({
      userId: req.user._id,
      performedBy: req.user._id,
      action: 'user_deleted',
      details: {},
      metadata: { ipAddress: req.ip, userAgent: req.get('User-Agent') }
    });

    res.json({
      success: true,
      message: 'Account deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error deleting account',
      error: error.message
    });
  }
});

module.exports = router;