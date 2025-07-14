const mongoose = require('mongoose');

const auditLogSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  performedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  action: {
    type: String,
    required: true,
    enum: [
      'user_created',
      'user_updated',
      'user_deleted',
      'user_suspended',
      'user_reactivated',
      'role_assigned',
      'role_removed',
      'role_switched',
      'permission_granted',
      'permission_revoked',
      'login_success',
      'login_failed',
      'password_changed',
      'password_reset',
      'email_verified',
      'phone_verified',
      'account_locked',
      'account_unlocked',
      'bulk_operation'
    ]
  },
  details: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  metadata: {
    ipAddress: { type: String },
    userAgent: { type: String },
    requestId: { type: String },
    sessionId: { type: String }
  },
  timestamp: {
    type: Date,
    default: Date.now,
    index: true
  }
}, {
  timestamps: false
});

// Indexes for performance
auditLogSchema.index({ userId: 1, timestamp: -1 });
auditLogSchema.index({ performedBy: 1, timestamp: -1 });
auditLogSchema.index({ action: 1, timestamp: -1 });

module.exports = mongoose.model('AuditLog', auditLogSchema);