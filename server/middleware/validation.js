const Joi = require('joi');

const validate = (schema) => {
  return (req, res, next) => {
    const { error } = schema.validate(req.body);
    
    if (error) {
      const errorMessage = error.details.map(detail => detail.message).join(', ');
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: errorMessage
      });
    }
    
    next();
  };
};

// Validation schemas
const schemas = {
  register: Joi.object({
    firstName: Joi.string().trim().min(2).max(50).required(),
    lastName: Joi.string().trim().min(2).max(50).required(),
    email: Joi.string().email().required(),
    password: Joi.string().min(6).required(),
    phone: Joi.string().optional(),
    roles: Joi.array().items(Joi.string().valid('mentee', 'mentor')).optional()
  }),

  login: Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().required()
  }),

  updateProfile: Joi.object({
    firstName: Joi.string().trim().min(2).max(50).optional(),
    lastName: Joi.string().trim().min(2).max(50).optional(),
    phone: Joi.string().optional(),
    profile: Joi.object({
      bio: Joi.string().max(500).optional(),
      skills: Joi.array().items(Joi.string().trim()).optional(),
      experience: Joi.string().max(1000).optional(),
      education: Joi.string().max(1000).optional(),
      linkedIn: Joi.string().uri().optional(),
      github: Joi.string().uri().optional(),
      website: Joi.string().uri().optional()
    }).optional()
  }),

  changePassword: Joi.object({
    currentPassword: Joi.string().required(),
    newPassword: Joi.string().min(6).required(),
    confirmPassword: Joi.string().valid(Joi.ref('newPassword')).required()
  }),

  resetPassword: Joi.object({
    token: Joi.string().required(),
    newPassword: Joi.string().min(6).required(),
    confirmPassword: Joi.string().valid(Joi.ref('newPassword')).required()
  }),

  verifyEmail: Joi.object({
    token: Joi.string().required()
  }),

  verifyPhone: Joi.object({
    otp: Joi.string().length(6).required()
  }),

  bulkUserUpdate: Joi.object({
    userIds: Joi.array().items(Joi.string().hex().length(24)).required(),
    updates: Joi.object({
      roles: Joi.array().items(Joi.string().valid('mentee', 'mentor')).optional(),
      status: Joi.string().valid('active', 'inactive', 'suspended').optional(),
      suspensionReason: Joi.string().optional()
    }).required()
  }),

  sendBulkEmail: Joi.object({
    recipients: Joi.array().items(Joi.string().hex().length(24)).required(),
    subject: Joi.string().required(),
    message: Joi.string().required(),
    template: Joi.string().optional()
  })
};

module.exports = { validate, schemas };