const mongoose = require('mongoose');

const actionTrailSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: [true, 'Action must belong to a user']
  },
  action: {
    type: String,
    required: [true, 'Action type is required'],
    enum: ['login', 'logout', 'register', 'password_reset', 'email_verification', 'profile_update']
  },
  ipAddress: String,
  userAgent: String,
  status: {
    type: String,
    enum: ['success', 'failed'],
    required: [true, 'Action status is required']
  },
  metadata: Object
}, {
  timestamps: true
});

// Indexes
actionTrailSchema.index({ user: 1 });
actionTrailSchema.index({ createdAt: -1 });

module.exports = mongoose.model('ActionTrail', actionTrailSchema);