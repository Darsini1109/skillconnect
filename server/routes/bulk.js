const express = require('express');
const multer = require('multer');
const csvtojson = require('csvtojson');
const { Parser } = require('json2csv');
const fs = require('fs');
const path = require('path');
const User = require('../models/User');
const BulkOperation = require('../models/BulkOperation');
const authMiddleware = require('../middleware/auth');
const { requireAdmin } = require('../middleware/roleAuth');
const { validate, schemas } = require('../middleware/validation');
const { sendEmail } = require('../services/communication');
const { logActivity } = require('../services/audit');

const router = express.Router();

// Apply auth middleware to all bulk routes
router.use(authMiddleware);
router.use(requireAdmin);

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = path.join(__dirname, '../uploads');
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  }
});

const upload = multer({ 
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['text/csv', 'application/vnd.ms-excel'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Only CSV files are allowed'));
    }
  }
});

// Generate unique operation ID
const generateOperationId = () => {
  return `op_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

// Bulk user import
router.post('/import', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded'
      });
    }

    const operationId = generateOperationId();
    
    // Create bulk operation record
    const bulkOperation = new BulkOperation({
      operationId,
      type: 'import',
      initiatedBy: req.user._id,
      status: 'pending',
      files: {
        input: req.file.path
      }
    });
    await bulkOperation.save();

    // Process file asynchronously
    processUserImport(operationId, req.file.path, req.user._id);

    res.json({
      success: true,
      message: 'File upload successful. Import process started.',
      data: {
        operationId
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error during file upload',
      error: error.message
    });
  }
});

// Process user import
const processUserImport = async (operationId, filePath, initiatedBy) => {
  try {
    const operation = await BulkOperation.findOne({ operationId });
    if (!operation) return;

    operation.status = 'processing';
    operation.startTime = new Date();
    await operation.save();

    // Parse CSV file
    const jsonData = await csvtojson().fromFile(filePath);
    
    operation.progress.total = jsonData.length;
    await operation.save();

    const results = {
      successful: [],
      failed: []
    };

    // Process each row
    for (let i = 0; i < jsonData.length; i++) {
      const row = jsonData[i];
      
      try {
        // Validate required fields
        if (!row.firstName || !row.lastName || !row.email) {
          results.failed.push({
            item: row,
            error: 'Missing required fields (firstName, lastName, email)',
            lineNumber: i + 2
          });
          continue;
        }

        // Check if user already exists
        const existingUser = await User.findOne({ email: row.email });
        if (existingUser) {
          results.failed.push({
            item: row,
            error: 'User already exists',
            lineNumber: i + 2
          });
          continue;
        }

        // Create user
        const userData = {
          firstName: row.firstName,
          lastName: row.lastName,
          email: row.email,
          phone: row.phone,
          password: row.password || 'DefaultPassword123!',
          roles: row.roles ? row.roles.split(',').map(r => r.trim()) : ['mentee'],
          account: {
            status: 'active'
          },
          verification: {
            email: {
              isVerified: true // Auto-verify imported users
            }
          }
        };

        const user = new User(userData);
        await user.save();

        results.successful.push(user.getSafeProfile());

        // Log activity
        await logActivity({
          userId: user._id,
          performedBy: initiatedBy,
          action: 'user_created',
          details: { source: 'bulk_import', operationId },
          metadata: {}
        });

      } catch (error) {
        results.failed.push({
          item: row,
          error: error.message,
          lineNumber: i + 2
        });
      }

      // Update progress
      operation.progress.processed = i + 1;
      operation.progress.successful = results.successful.length;
      operation.progress.failed = results.failed.length;
      await operation.save();
    }

    // Complete operation
    operation.status = 'completed';
    operation.endTime = new Date();
    operation.results = {
      successfulItems: results.successful,
      failedItems: results.failed,
      summary: {
        totalProcessed: jsonData.length,
        successful: results.successful.length,
        failed: results.failed.length
      }
    };
    await operation.save();

    // Log bulk operation
    await logActivity({
      userId: initiatedBy,
      performedBy: initiatedBy,
      action: 'bulk_operation',
      details: { 
        type: 'import',
        operationId,
        summary: operation.results.summary
      },
      metadata: {}
    });

  } catch (error) {
    // Mark operation as failed
    const operation = await BulkOperation.findOne({ operationId });
    if (operation) {
      operation.status = 'failed';
      operation.endTime = new Date();
      operation.results = {
        summary: {
          error: error.message
        }
      };
      await operation.save();
    }
  }
};

// Export users
router.post('/export', async (req, res) => {
  try {
    const { filters = {}, fields = [] } = req.body;
    const operationId = generateOperationId();

    // Create bulk operation record
    const bulkOperation = new BulkOperation({
      operationId,
      type: 'export',
      initiatedBy: req.user._id,
      status: 'pending',
      parameters: { filters, fields }
    });
    await bulkOperation.save();

    // Process export asynchronously
    processUserExport(operationId, filters, fields, req.user._id);

    res.json({
      success: true,
      message: 'Export process started.',
      data: {
        operationId
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error during export',
      error: error.message
    });
  }
});

// Process user export
const processUserExport = async (operationId, filters, fields, initiatedBy) => {
  try {
    const operation = await BulkOperation.findOne({ operationId });
    if (!operation) return;

    operation.status = 'processing';
    operation.startTime = new Date();
    await operation.save();

    // Default fields if none specified
    const defaultFields = [
      'firstName', 'lastName', 'email', 'phone', 'roles', 
      'account.status', 'verification.email.isVerified', 'createdAt'
    ];
    const exportFields = fields.length > 0 ? fields : defaultFields;

    // Query users
    const users = await User.find(filters)
      .select(exportFields.join(' '))
      .lean();

    operation.progress.total = users.length;
    operation.progress.processed = users.length;
    operation.progress.successful = users.length;
    await operation.save();

    // Convert to CSV
    const parser = new Parser({ fields: exportFields });
    const csv = parser.parse(users);

    // Save to file
    const fileName = `users_export_${Date.now()}.csv`;
    const filePath = path.join(__dirname, '../uploads', fileName);
    fs.writeFileSync(filePath, csv);

    // Complete operation
    operation.status = 'completed';
    operation.endTime = new Date();
    operation.files.output = filePath;
    operation.results = {
      summary: {
        totalExported: users.length,
        fileName
      }
    };
    await operation.save();

    // Log activity
    await logActivity({
      userId: initiatedBy,
      performedBy: initiatedBy,
      action: 'bulk_operation',
      details: { 
        type: 'export',
        operationId,
        summary: operation.results.summary
      },
      metadata: {}
    });

  } catch (error) {
    // Mark operation as failed
    const operation = await BulkOperation.findOne({ operationId });
    if (operation) {
      operation.status = 'failed';
      operation.endTime = new Date();
      operation.results = {
        summary: {
          error: error.message
        }
      };
      await operation.save();
    }
  }
};

// Bulk user update
router.put('/update', validate(schemas.bulkUserUpdate), async (req, res) => {
  try {
    const { userIds, updates } = req.body;
    const operationId = generateOperationId();

    // Create bulk operation record
    const bulkOperation = new BulkOperation({
      operationId,
      type: 'bulk_update',
      initiatedBy: req.user._id,
      status: 'pending',
      parameters: { userIds, updates }
    });
    await bulkOperation.save();

    // Process updates asynchronously
    processBulkUpdate(operationId, userIds, updates, req.user._id);

    res.json({
      success: true,
      message: 'Bulk update process started.',
      data: {
        operationId
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error during bulk update',
      error: error.message
    });
  }
});

// Process bulk update
const processBulkUpdate = async (operationId, userIds, updates, initiatedBy) => {
  try {
    const operation = await BulkOperation.findOne({ operationId });
    if (!operation) return;

    operation.status = 'processing';
    operation.startTime = new Date();
    operation.progress.total = userIds.length;
    await operation.save();

    const results = {
      successful: [],
      failed: []
    };

    // Process each user
    for (let i = 0; i < userIds.length; i++) {
      const userId = userIds[i];
      
      try {
        const user = await User.findById(userId);
        if (!user) {
          results.failed.push({
            item: { userId },
            error: 'User not found'
          });
          continue;
        }

        // Apply updates
        if (updates.roles) user.roles = updates.roles;
        if (updates.status) user.account.status = updates.status;
        if (updates.suspensionReason) user.account.suspensionReason = updates.suspensionReason;

        await user.save();
        results.successful.push(user.getSafeProfile());

        // Log activity
        await logActivity({
          userId: user._id,
          performedBy: initiatedBy,
          action: 'user_updated',
          details: { source: 'bulk_update', operationId, updates },
          metadata: {}
        });

      } catch (error) {
        results.failed.push({
          item: { userId },
          error: error.message
        });
      }

      // Update progress
      operation.progress.processed = i + 1;
      operation.progress.successful = results.successful.length;
      operation.progress.failed = results.failed.length;
      await operation.save();
    }

    // Complete operation
    operation.status = 'completed';
    operation.endTime = new Date();
    operation.results = {
      successfulItems: results.successful,
      failedItems: results.failed,
      summary: {
        totalProcessed: userIds.length,
        successful: results.successful.length,
        failed: results.failed.length
      }
    };
    await operation.save();

  } catch (error) {
    // Mark operation as failed
    const operation = await BulkOperation.findOne({ operationId });
    if (operation) {
      operation.status = 'failed';
      operation.endTime = new Date();
      operation.results = {
        summary: {
          error: error.message
        }
      };
      await operation.save();
    }
  }
};

// Send bulk email
router.post('/email', validate(schemas.sendBulkEmail), async (req, res) => {
  try {
    const { recipients, subject, message, template } = req.body;
    const operationId = generateOperationId();

    // Create bulk operation record
    const bulkOperation = new BulkOperation({
      operationId,
      type: 'bulk_email',
      initiatedBy: req.user._id,
      status: 'pending',
      parameters: { recipients, subject, message, template }
    });
    await bulkOperation.save();

    // Process emails asynchronously
    processBulkEmail(operationId, recipients, subject, message, template, req.user._id);

    res.json({
      success: true,
      message: 'Bulk email process started.',
      data: {
        operationId
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error during bulk email',
      error: error.message
    });
  }
});

// Process bulk email
const processBulkEmail = async (operationId, recipients, subject, message, template, initiatedBy) => {
  try {
    const operation = await BulkOperation.findOne({ operationId });
    if (!operation) return;

    operation.status = 'processing';
    operation.startTime = new Date();
    operation.progress.total = recipients.length;
    await operation.save();

    const results = {
      successful: [],
      failed: []
    };

    // Process each recipient
    for (let i = 0; i < recipients.length; i++) {
      const userId = recipients[i];
      
      try {
        const user = await User.findById(userId);
        if (!user) {
          results.failed.push({
            item: { userId },
            error: 'User not found'
          });
          continue;
        }

        // Send email
        await sendEmail(user.email, subject, message, template);
        results.successful.push({ userId: user._id, email: user.email });

      } catch (error) {
        results.failed.push({
          item: { userId },
          error: error.message
        });
      }

      // Update progress
      operation.progress.processed = i + 1;
      operation.progress.successful = results.successful.length;
      operation.progress.failed = results.failed.length;
      await operation.save();
    }

    // Complete operation
    operation.status = 'completed';
    operation.endTime = new Date();
    operation.results = {
      successfulItems: results.successful,
      failedItems: results.failed,
      summary: {
        totalProcessed: recipients.length,
        successful: results.successful.length,
        failed: results.failed.length
      }
    };
    await operation.save();

  } catch (error) {
    // Mark operation as failed
    const operation = await BulkOperation.findOne({ operationId });
    if (operation) {
      operation.status = 'failed';
      operation.endTime = new Date();
      operation.results = {
        summary: {
          error: error.message
        }
      };
      await operation.save();
    }
  }
};

// Get bulk operation status
router.get('/operations/:operationId', async (req, res) => {
  try {
    const operation = await BulkOperation.findOne({ 
      operationId: req.params.operationId 
    }).populate('initiatedBy', 'firstName lastName email');

    if (!operation) {
      return res.status(404).json({
        success: false,
        message: 'Operation not found'
      });
    }

    res.json({
      success: true,
      data: { operation }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error retrieving operation status',
      error: error.message
    });
  }
});

// Get all bulk operations
router.get('/operations', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const operations = await BulkOperation.find()
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('initiatedBy', 'firstName lastName email');

    const total = await BulkOperation.countDocuments();

    res.json({
      success: true,
      data: {
        operations,
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
      message: 'Server error retrieving operations',
      error: error.message
    });
  }
});

// Download export file
router.get('/download/:operationId', async (req, res) => {
  try {
    const operation = await BulkOperation.findOne({ 
      operationId: req.params.operationId 
    });

    if (!operation) {
      return res.status(404).json({
        success: false,
        message: 'Operation not found'
      });
    }

    if (operation.type !== 'export' || !operation.files.output) {
      return res.status(400).json({
        success: false,
        message: 'No export file available'
      });
    }

    const filePath = operation.files.output;
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({
        success: false,
        message: 'Export file not found'
      });
    }

    res.download(filePath, `users_export_${operation.operationId}.csv`);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error downloading file',
      error: error.message
    });
  }
});

module.exports = router;