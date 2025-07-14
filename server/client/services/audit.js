const AuditLog = require('../models/AuditLog');

// Log user activity
const logActivity = async (data) => {
  try {
    const auditLog = new AuditLog({
      userId: data.userId,
      performedBy: data.performedBy,
      action: data.action,
      details: data.details || {},
      metadata: data.metadata || {}
    });

    await auditLog.save();
    return auditLog;
  } catch (error) {
    console.error('Audit logging failed:', error);
    // Don't throw error to avoid disrupting main operations
  }
};

// Get user activity history
const getUserActivity = async (userId, options = {}) => {
  try {
    const {
      page = 1,
      limit = 10,
      startDate,
      endDate,
      actions
    } = options;

    const skip = (page - 1) * limit;
    const query = { userId };

    // Add date range filter
    if (startDate || endDate) {
      query.timestamp = {};
      if (startDate) query.timestamp.$gte = new Date(startDate);
      if (endDate) query.timestamp.$lte = new Date(endDate);
    }

    // Add action filter
    if (actions && actions.length > 0) {
      query.action = { $in: actions };
    }

    const activities = await AuditLog.find(query)
      .sort({ timestamp: -1 })
      .skip(skip)
      .limit(limit)
      .populate('performedBy', 'firstName lastName email');

    const total = await AuditLog.countDocuments(query);

    return {
      activities,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    };
  } catch (error) {
    console.error('Error retrieving user activity:', error);
    throw error;
  }
};

// Get system activity summary
const getSystemActivitySummary = async (options = {}) => {
  try {
    const {
      startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 30 days ago
      endDate = new Date()
    } = options;

    const pipeline = [
      {
        $match: {
          timestamp: {
            $gte: startDate,
            $lte: endDate
          }
        }
      },
      {
        $group: {
          _id: '$action',
          count: { $sum: 1 }
        }
      },
      {
        $sort: { count: -1 }
      }
    ];

    const summary = await AuditLog.aggregate(pipeline);
    
    const totalActivities = await AuditLog.countDocuments({
      timestamp: {
        $gte: startDate,
        $lte: endDate
      }
    });

    return {
      summary,
      totalActivities,
      dateRange: {
        startDate,
        endDate
      }
    };
  } catch (error) {
    console.error('Error retrieving system activity summary:', error);
    throw error;
  }
};

// Get user login statistics
const getUserLoginStats = async (userId, days = 30) => {
  try {
    const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
    
    const pipeline = [
      {
        $match: {
          userId: userId,
          action: { $in: ['login_success', 'login_failed'] },
          timestamp: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: {
            date: { $dateToString: { format: '%Y-%m-%d', date: '$timestamp' } },
            action: '$action'
          },
          count: { $sum: 1 }
        }
      },
      {
        $group: {
          _id: '$_id.date',
          successful: {
            $sum: {
              $cond: [{ $eq: ['$_id.action', 'login_success'] }, '$count', 0]
            }
          },
          failed: {
            $sum: {
              $cond: [{ $eq: ['$_id.action', 'login_failed'] }, '$count', 0]
            }
          }
        }
      },
      {
        $sort: { _id: 1 }
      }
    ];

    const stats = await AuditLog.aggregate(pipeline);
    
    return {
      stats,
      dateRange: {
        startDate,
        endDate: new Date()
      }
    };
  } catch (error) {
    console.error('Error retrieving user login stats:', error);
    throw error;
  }
};

// Clean old audit logs
const cleanOldAuditLogs = async (daysToKeep = 90) => {
  try {
    const cutoffDate = new Date(Date.now() - daysToKeep * 24 * 60 * 60 * 1000);
    
    const result = await AuditLog.deleteMany({
      timestamp: { $lt: cutoffDate }
    });

    console.log(`Cleaned ${result.deletedCount} old audit logs`);
    return result.deletedCount;
  } catch (error) {
    console.error('Error cleaning old audit logs:', error);
    throw error;
  }
};

module.exports = {
  logActivity,
  getUserActivity,
  getSystemActivitySummary,
  getUserLoginStats,
  cleanOldAuditLogs
};