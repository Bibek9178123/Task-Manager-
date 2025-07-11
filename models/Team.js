const mongoose = require('mongoose');

const teamSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Team name is required'],
    trim: true,
    minlength: [2, 'Team name must be at least 2 characters long'],
    maxlength: [50, 'Team name cannot exceed 50 characters'],
  },
  description: {
    type: String,
    trim: true,
    maxlength: [200, 'Description cannot exceed 200 characters'],
    default: '',
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  members: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    role: {
      type: String,
      enum: ['owner', 'admin', 'member'],
      default: 'member',
    },
    joinedAt: {
      type: Date,
      default: Date.now,
    },
  }],
  invitations: [{
    email: {
      type: String,
      required: true,
      lowercase: true,
    },
    role: {
      type: String,
      enum: ['admin', 'member'],
      default: 'member',
    },
    invitedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    token: {
      type: String,
      required: true,
    },
    expiresAt: {
      type: Date,
      required: true,
    },
    status: {
      type: String,
      enum: ['pending', 'accepted', 'rejected'],
      default: 'pending',
    },
  }],
  settings: {
    isPrivate: {
      type: Boolean,
      default: false,
    },
    allowMemberInvites: {
      type: Boolean,
      default: true,
    },
    taskPermissions: {
      type: String,
      enum: ['all', 'assigned-only', 'admin-only'],
      default: 'all',
    },
  },
  isActive: {
    type: Boolean,
    default: true,
  },
}, {
  timestamps: true,
});

// Indexes
teamSchema.index({ owner: 1 });
teamSchema.index({ 'members.user': 1 });
teamSchema.index({ 'invitations.email': 1 });

// Virtual for member count
teamSchema.virtual('memberCount').get(function() {
  return this.members.length;
});

// Static method to get user's teams
teamSchema.statics.getUserTeams = function(userId) {
  return this.find({
    $or: [
      { owner: userId },
      { 'members.user': userId }
    ],
    isActive: true
  }).populate('owner', 'name email')
    .populate('members.user', 'name email avatar');
};

// Instance method to check if user is member
teamSchema.methods.isMember = function(userId) {
  return this.members.some(member => member.user.toString() === userId.toString()) || 
         this.owner.toString() === userId.toString();
};

// Instance method to get user role
teamSchema.methods.getUserRole = function(userId) {
  if (this.owner.toString() === userId.toString()) return 'owner';
  const member = this.members.find(member => member.user.toString() === userId.toString());
  return member ? member.role : null;
};

teamSchema.set('toJSON', {
  virtuals: true,
  transform: function(doc, ret) {
    delete ret.id;
    return ret;
  },
});

const Team = mongoose.model('Team', teamSchema);

module.exports = Team;
