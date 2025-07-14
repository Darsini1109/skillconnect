const express = require('express');
const User = require('../models/User');
const AuditLog = require('../models/AuditLog');
const authMiddleware = require('../middleware/auth');
const { requireAdmin } = require('../middleware/roleAuth');
const { validate, schemas } = require('../middleware/validation');
const { logActivity } = require('../services/audit');

const router = express.Router();

// Apply auth middleware to all admin routes
router.use(authMiddleware);
router.use(requireAdmin);

// Get all users with pagination and filters
router.get('/users', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    
    const filters = {};
    
    // Apply filters
    if (req.query.status) filters['account.status'] = req.query.status;
    if (req.query.role) filters.roles = req.query.role;
    if (req.query.verified) filters['verification.email.isVerified'] = req.query.verified === 'true';
    if (req.query.search) {
      const searchRegex = new RegExp(req.query.search, 'i');
      filters.$or = [
        { firstName: searchRegex },
        { lastName: searchRegex },
        { email: searchRegex }
      ];
    }

    const users = await User.find(filters)
      .select('-password -verification.email.token -verification.phone.otp')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await User.countDocuments(filters);

    res.json({
      success: true,
      data: {
        users,
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
      message: 'Server error retrieving users',
      error: error.message
    });
  }
});

// Get user by ID
router.get('/users/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
      .select('-password -verification.email.token -verification.phone.otp');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      data: { user }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error retrieving user',
      error: error.message
    });
  }
});

// Update user
router.put('/users/:id', async (req, res) => {
  try {
    const updates = req.body;
    const allowedUpdates = ['firstName', 'lastName', 'email', 'phone', 'roles', 'account.status', 'account.suspensionReason'];
    
    // Filter allowed updates
    const filteredUpdates = {};
    allowedUpdates.forEach(field => {
      if (updates[field] !== undefined) {
        if (field.includes('.')) {
          // Handle nested fields
          const [parent, child] = field.split('.');
          if (!filteredUpdates[parent]) filteredUpdates[parent] = {};
          filteredUpdates[parent][child] = updates[field];
        } else {
          filteredUpdates[field] = updates[field];
        }
      }
    });

    const user = await User.findByIdAndUpdate(
      req.params.id,
      filteredUpdates,
      { new: true, runValidators: true }
    ).select('-password -verification.email.token -verification.phone.otp');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Log activity
    await logActivity({
      userId: user._id,
      performedBy: req.user._id,
      action: 'user_updated',
      details: { updatedFields: Object.keys(filteredUpdates), updatedBy: 'admin' },
      metadata: { ipAddress: req.ip, userAgent: req.get('User-Agent') }
    });

    res.json({
      success: true,
      message: 'User updated successfully',
      data: { user }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error updating user',
      error: error.message
    });
  }
});

// Suspend user
router.put('/users/:id/suspend', async (req, res) => {
  try {
    const { reason, duration } = req.body;

    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    user.account.status = 'suspended';
    user.account.suspensionReason = reason;
    if (duration) {
      user.account.suspensionExpiry = new Date(Date.now() + duration * 24 * 60 * 60 * 1000);
    }
    await user.save();

    // Log activity
    await logActivity({
      userId: user._id,
      performedBy: req.user._id,
      action: 'user_suspended',
      details: { reason, duration },
      metadata: { ipAddress: req.ip, userAgent: req.get('User-Agent') }
    });

    res.json({
      success: true,
      message: 'User suspended successfully',
      data: { user: user.getSafeProfile() }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error suspending user',
      error: error.message
    });
  }
});

// Reactivate user
router.put('/users/:id/reactivate', async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    user.account.status = 'active';
    user.account.suspensionReason = undefined;
    user.account.suspensionExpiry = undefined;
    await user.save();

    // Log activity
    await logActivity({
      userId: user._id,
      performedBy: req.user._id,
      action: 'user_reactivated',
      details: {},
      metadata: { ipAddress: req.ip, userAgent: req.get('User-Agent') }
    });

    res.json({
      success: true,
      message: 'User reactivated successfully',
      data: { user: user.getSafeProfile() }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error reactivating user',
      error: error.message
    });
  }
});

// Delete user (hard delete)
router.delete('/users/:id', async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Log activity
    await logActivity({
      userId: user._id,
      performedBy: req.user._id,
      action: 'user_deleted',
      details: { deletedBy: 'admin', email: user.email },
      metadata: { ipAddress: req.ip, userAgent: req.get('User-Agent') }
    });

    res.json({
      success: true,
      message: 'User deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error deleting user',
      error: error.message
    });
  }
});

// Assign role to user
router.put('/users/:id/roles', async (req, res) => {
  try {
    const { roles } = req.body;

    if (!Array.isArray(roles)) {
      return res.status(400).json({
        success: false,
        message: 'Roles must be an array'
      });
    }

    const validRoles = ['mentee', 'mentor', 'admin'];
    const invalidRoles = roles.filter(role => !validRoles.includes(role));
    
    if (invalidRoles.length > 0) {
      return res.status(400).json({
        success: false,
        message: `Invalid roles: ${invalidRoles.join(', ')}`
      });
    }

    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const oldRoles = [...user.roles];
    user.roles = roles;
    
    // Update current role if it's not in the new roles
    if (!roles.includes(user.currentRole)) {
      user.currentRole = roles[0] || 'mentee';
    }
    
    await user.save();

    // Log activity
    await logActivity({
      userId: user._id,
      performedBy: req.user._id,
      action: 'role_assigned',
      details: { oldRoles, newRoles: roles },
      metadata: { ipAddress: req.ip, userAgent: req.get('User-Agent') }
    });

    res.json({
      success: true,
      message: 'User roles updated successfully',
      data: { user: user.getSafeProfile() }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error updating user roles',
      error: error.message
    });
  }
});

// Get user activity log
router.get('/users/:id/activity', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const activities = await AuditLog.find({ userId: req.params.id })
      .sort({ timestamp: -1 })
      .skip(skip)
      .limit(limit)
      .populate('performedBy', 'firstName lastName email');

    const total = await AuditLog.countDocuments({ userId: req.params.id });

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
      message: 'Server error retrieving user activity',
      error: error.message
    });
  }
});

// Get platform statistics
router.get('/stats', async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const activeUsers = await User.countDocuments({ 'account.status': 'active' });
    const pendingUsers = await User.countDocuments({ 'account.status': 'pending' });
    const suspendedUsers = await User.countDocuments({ 'account.status': 'suspended' });
    
    const mentees = await User.countDocuments({ roles: 'mentee' });
    const mentors = await User.countDocuments({ roles: 'mentor' });
    const admins = await User.countDocuments({ roles: 'admin' });

    const verifiedUsers = await User.countDocuments({ 'verification.email.isVerified': true });
    
    // Recent registrations (last 30 days)
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const recentRegistrations = await User.countDocuments({ 
      createdAt: { $gte: thirtyDaysAgo } 
    });

    res.json({
      success: true,
      data: {
        users: {
          total: totalUsers,
          active: activeUsers,
          pending: pendingUsers,
          suspended: suspendedUsers,
          verified: verifiedUsers,
          recentRegistrations
        },
        roles: {
          mentees,
          mentors,
          admins
        }
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error retrieving statistics',
      error: error.message
    });
  }
});

module.exports = router;