const mongoose = require('mongoose');

const bulkOperationSchema = new mongoose.Schema({
  operationId: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  type: {
    type: String,
    required: true,
    enum: ['import', 'export', 'bulk_update', 'bulk_delete', 'bulk_email']
  },
  initiatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'processing', 'completed', 'failed', 'cancelled'],
    default: 'pending'
  },
  progress: {
    total: { type: Number, default: 0 },
    processed: { type: Number, default: 0 },
    successful: { type: Number, default: 0 },
    failed: { type: Number, default: 0 }
  },
  parameters: {
    // Filters, fields, email template data, etc.
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  results: {
    successfulItems: {
      type: [mongoose.Schema.Types.Mixed],
      default: []
    },
    failedItems: {
      type: [
        {
          item: { type: mongoose.Schema.Types.Mixed },
          error: { type: String },
          lineNumber: { type: Number }
        }
      ],
      default: []
    },
    summary: {
      type: mongoose.Schema.Types.Mixed,
      default: {}
    }
  },
  files: {
    input: { type: String, default: '' },
    output: { type: String, default: '' },
    errors: { type: String, default: '' }
  },
  startTime: { type: Date },
  endTime: { type: Date },
  estimatedCompletion: { type: Date }
}, {
  timestamps: true
});

// Indexes for performance
bulkOperationSchema.index({ operationId: 1 });
bulkOperationSchema.index({ initiatedBy: 1, createdAt: -1 });
bulkOperationSchema.index({ status: 1, createdAt: -1 });

module.exports = mongoose.model('BulkOperation', bulkOperationSchema);
