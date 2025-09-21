const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
    maxlength: [100, 'Name cannot exceed 100 characters']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
  },
  phone: {
    type: String,
    required: [true, 'Phone number is required'],
    unique: true,
    trim: true,
    match: [/^\+?[\d\s-()]+$/, 'Please enter a valid phone number']
  },
  isPhoneVerified: {
    type: Boolean,
    default: false
  },
  otp: {
    code: String,
    expiresAt: Date
  },
  analysisCount: {
    type: Number,
    default: 0
  },
  diseasesDetected: {
    type: Number,
    default: 0
  },
  plantsSaved: {
    type: Number,
    default: 0
  },
  lastLogin: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Index for faster queries
userSchema.index({ phone: 1 });
userSchema.index({ email: 1 });

// Virtual for user's full profile
userSchema.virtual('profile').get(function() {
  return {
    id: this._id,
    name: this.name,
    email: this.email,
    phone: this.phone,
    isPhoneVerified: this.isPhoneVerified,
    analysisCount: this.analysisCount,
    diseasesDetected: this.diseasesDetected,
    plantsSaved: this.plantsSaved,
    createdAt: this.createdAt,
    lastLogin: this.lastLogin
  };
});

// Method to generate OTP
userSchema.methods.generateOTP = function() {
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  this.otp = {
    code: otp,
    expiresAt: new Date(Date.now() + 10 * 60 * 1000) // 10 minutes
  };
  return otp;
};

// Method to verify OTP
userSchema.methods.verifyOTP = function(otp) {
  if (!this.otp || !this.otp.code || !this.otp.expiresAt) {
    return false;
  }
  
  if (new Date() > this.otp.expiresAt) {
    return false;
  }
  
  return this.otp.code === otp;
};

// Method to clear OTP
userSchema.methods.clearOTP = function() {
  this.otp = undefined;
};

// Method to update login time
userSchema.methods.updateLoginTime = function() {
  this.lastLogin = new Date();
};

// Method to increment analysis count
userSchema.methods.incrementAnalysisCount = function() {
  this.analysisCount += 1;
};

// Method to increment diseases detected
userSchema.methods.incrementDiseasesDetected = function() {
  this.diseasesDetected += 1;
};

// Method to increment plants saved
userSchema.methods.incrementPlantsSaved = function() {
  this.plantsSaved += 1;
};

// Pre-save middleware
userSchema.pre('save', function(next) {
  // Update lastLogin if this is a login
  if (this.isModified('lastLogin')) {
    this.lastLogin = new Date();
  }
  next();
});

// Static method to find by phone
userSchema.statics.findByPhone = function(phone) {
  return this.findOne({ phone: phone.trim() });
};

// Static method to check if phone exists
userSchema.statics.phoneExists = function(phone) {
  return this.exists({ phone: phone.trim() });
};

module.exports = mongoose.model('User', userSchema);
