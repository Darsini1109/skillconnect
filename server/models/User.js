const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: true,
    trim: true,
    maxlength: 50
  },
  lastName: {
    type: String,
    required: true,
    trim: true,
    maxlength: 50
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
    index: true
  },
  phone: {
    type: String,
    trim: true,
    sparse: true
  },
  password: {
    type: String,
    required: function() { return !this.socialLogin; },
    minlength: 6
  },
  roles: [{
    type: String,
    enum: ['mentee', 'mentor', 'admin'],
    default: 'mentee'
  }],
  currentRole: {
    type: String,
    enum: ['mentee', 'mentor', 'admin'],
    default: 'mentee'
  },
  profile: {
    bio: { type: String, maxlength: 500 },
    skills: [{ type: String, trim: true }],
    experience: { type: String, maxlength: 1000 },
    education: { type: String, maxlength: 1000 },
    avatar: { type: String },
    linkedIn: { type: String },
    github: { type: String },
    website: { type: String }
  },
  verification: {
    email: {
      isVerified: { type: Boolean, default: false },
      token: { type: String },
      expiresAt: { type: Date }
    },
    phone: {
      isVerified: { type: Boolean, default: false },
      otp: { type: String },
      expiresAt: { type: Date }
    }
  },
  socialLogin: {
    google: {
      id: { type: String },
      email: { type: String }
    },
    linkedin: {
      id: { type: String },
      email: { type: String }
    },
    facebook: {
      id: { type: String },
      email: { type: String }
    }
  },
  account: {
    status: {
      type: String,
      enum: ['active', 'inactive', 'suspended', 'pending'],
      default: 'pending'
    },
    suspensionReason: { type: String },
    suspensionExpiry: { type: Date },
    lastLogin: { type: Date },
    loginAttempts: { type: Number, default: 0 },
    lockUntil: { type: Date }
  },
  preferences: {
    notifications: {
      email: { type: Boolean, default: true },
      sms: { type: Boolean, default: false },
      push: { type: Boolean, default: true }
    },
    privacy: {
      profileVisibility: {
        type: String,
        enum: ['public', 'private', 'connections'],
        default: 'public'
      },
      showEmail: { type: Boolean, default: false },
      showPhone: { type: Boolean, default: false }
    }
  },
  metadata: {
    registrationSource: { type: String, default: 'web' },
    referralCode: { type: String },
    referredBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    tags: [{ type: String }]
  }
}, {
  timestamps: true
});

// Indexes for performance
userSchema.index({ email: 1 });
userSchema.index({ roles: 1 });
userSchema.index({ 'account.status': 1 });
userSchema.index({ createdAt: -1 });
userSchema.index({ 'verification.email.isVerified': 1 });

// Virtual for full name
userSchema.virtual('fullName').get(function() {
  return `${this.firstName} ${this.lastName}`;
});

// Virtual for account locked status
userSchema.virtual('isLocked').get(function() {
  return !!(this.account.lockUntil && this.account.lockUntil > Date.now());
});

// Pre-save middleware to hash password
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Method to compare password
userSchema.methods.comparePassword = async function(candidatePassword) {
  if (!this.password) return false;
  return bcrypt.compare(candidatePassword, this.password);
};

// Method to increment login attempts
userSchema.methods.incLoginAttempts = async function() {
  if (this.account.lockUntil && this.account.lockUntil < Date.now()) {
    return this.updateOne({
      $unset: { 'account.lockUntil': 1 },
      $set: { 'account.loginAttempts': 1 }
    });
  }
  
  const updates = { $inc: { 'account.loginAttempts': 1 } };
  
  if (this.account.loginAttempts + 1 >= 5 && !this.isLocked) {
    updates.$set = { 'account.lockUntil': Date.now() + 2 * 60 * 60 * 1000 }; // 2 hours
  }
  
  return this.updateOne(updates);
};

// Method to reset login attempts
userSchema.methods.resetLoginAttempts = async function() {
  return this.updateOne({
    $unset: { 'account.loginAttempts': 1, 'account.lockUntil': 1 }
  });
};

// Method to check if user has role
userSchema.methods.hasRole = function(role) {
  return this.roles.includes(role);
};

// Method to add role
userSchema.methods.addRole = function(role) {
  if (!this.roles.includes(role)) {
    this.roles.push(role);
  }
  return this;
};

// Method to remove role
userSchema.methods.removeRole = function(role) {
  this.roles = this.roles.filter(r => r !== role);
  if (this.currentRole === role) {
    this.currentRole = this.roles[0] || 'mentee';
  }
  return this;
};

// Method to switch role
userSchema.methods.switchRole = function(role) {
  if (this.roles.includes(role)) {
    this.currentRole = role;
  }
  return this;
};

// Method to get public profile
userSchema.methods.getPublicProfile = function() {
  const userObj = this.toObject();
  delete userObj.password;
  delete userObj.verification;
  delete userObj.socialLogin;
  delete userObj.__v;
  
  return userObj;
};

// Method to get safe profile (for API responses)
userSchema.methods.getSafeProfile = function() {
  const userObj = this.toObject();
  delete userObj.password;
  delete userObj.verification.email.token;
  delete userObj.verification.phone.otp;
  delete userObj.socialLogin;
  delete userObj.__v;
  
  return userObj;
};

module.exports = mongoose.model('User', userSchema);