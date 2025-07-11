const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Task title is required'],
    trim: true,
    minlength: [1, 'Task title cannot be empty'],
    maxlength: [200, 'Task title cannot exceed 200 characters'],
  },
  description: {
    type: String,
    trim: true,
    maxlength: [1000, 'Description cannot exceed 1000 characters'],
    default: '',
  },
  status: {
    type: String,
    enum: ['todo', 'in-progress', 'completed'],
    default: 'todo',
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium',
  },
  category: {
    type: String,
    enum: ['personal', 'work', 'shopping', 'health', 'education', 'finance', 'other'],
    default: 'personal',
  },
  dueDate: {
    type: Date,
    default: null,
  },
  completedAt: {
    type: Date,
    default: null,
  },
  tags: [{
    type: String,
    trim: true,
    maxlength: [30, 'Tag cannot exceed 30 characters'],
  }],
  assignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  subtasks: [{
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: [200, 'Subtask title cannot exceed 200 characters'],
    },
    completed: {
      type: Boolean,
      default: false,
    },
    completedAt: {
      type: Date,
      default: null,
    },
    progress: {
      type: Number,
      min: 0,
      max: 100,
      default: 0,
    },
    estimatedHours: {
      type: Number,
      min: 0,
      default: 0,
    },
    actualHours: {
      type: Number,
      min: 0,
      default: 0,
    },
  }],
  attachments: [{
    filename: {
      type: String,
      required: true,
    },
    originalName: {
      type: String,
      required: true,
    },
    size: {
      type: Number,
      required: true,
    },
    mimetype: {
      type: String,
      required: true,
    },
    uploadedAt: {
      type: Date,
      default: Date.now,
    },
  }],
  reminder: {
    enabled: {
      type: Boolean,
      default: false,
    },
    date: {
      type: Date,
      default: null,
    },
    sent: {
      type: Boolean,
      default: false,
    },
  },
  progress: {
    type: Number,
    min: 0,
    max: 100,
    default: 0,
  },
  estimatedHours: {
    type: Number,
    min: 0,
    default: 0,
  },
  actualHours: {
    type: Number,
    min: 0,
    default: 0,
  },
  timeTracking: {
    started: {
      type: Boolean,
      default: false,
    },
    startTime: {
      type: Date,
      default: null,
    },
    pausedTime: {
      type: Number,
      default: 0, // Total paused time in milliseconds
    },
    sessions: [{
      startTime: {
        type: Date,
        required: true,
      },
      endTime: {
        type: Date,
        default: null,
      },
      duration: {
        type: Number,
        default: 0, // Duration in milliseconds
      },
    }],
  },
  isArchived: {
    type: Boolean,
    default: false,
  },
}, {
  timestamps: true,
});

// Indexes for better query performance
taskSchema.index({ assignedTo: 1, status: 1 });
taskSchema.index({ createdBy: 1, createdAt: -1 });
taskSchema.index({ dueDate: 1 });
taskSchema.index({ priority: 1 });
taskSchema.index({ category: 1 });
taskSchema.index({ tags: 1 });

// Virtual for overdue tasks
taskSchema.virtual('isOverdue').get(function() {
  if (!this.dueDate || this.status === 'completed') return false;
  return new Date() > this.dueDate;
});

// Virtual for completion percentage
taskSchema.virtual('completionPercentage').get(function() {
  if (this.status === 'completed') return 100;
  
  // If manual progress is set, use it
  if (this.progress > 0) {
    return this.progress;
  }
  
  // Calculate based on subtasks if they exist
  if (this.subtasks.length > 0) {
    const totalSubtaskProgress = this.subtasks.reduce((sum, subtask) => {
      if (subtask.completed) return sum + 100;
      return sum + (subtask.progress || 0);
    }, 0);
    
    const avgSubtaskProgress = totalSubtaskProgress / this.subtasks.length;
    return Math.round(avgSubtaskProgress);
  }
  
  // Default based on status
  switch (this.status) {
    case 'todo': return 0;
    case 'in-progress': return 25;
    case 'completed': return 100;
    default: return 0;
  }
});

// Virtual for estimated vs actual hours efficiency
taskSchema.virtual('efficiency').get(function() {
  if (this.estimatedHours === 0 || this.actualHours === 0) return null;
  return Math.round((this.estimatedHours / this.actualHours) * 100);
});

// Virtual for total time spent
taskSchema.virtual('totalTimeSpent').get(function() {
  if (this.timeTracking.sessions.length === 0) return 0;
  
  const totalTime = this.timeTracking.sessions.reduce((sum, session) => {
    return sum + (session.duration || 0);
  }, 0);
  
  return Math.round(totalTime / (1000 * 60 * 60 * 100)) / 100; // Convert to hours with 2 decimal places
});

// Update completedAt when status changes to completed
taskSchema.pre('save', function(next) {
  if (this.isModified('status')) {
    if (this.status === 'completed' && !this.completedAt) {
      this.completedAt = new Date();
    } else if (this.status !== 'completed') {
      this.completedAt = null;
    }
  }
  next();
});

// Update subtask completedAt when completed changes
taskSchema.pre('save', function(next) {
  if (this.isModified('subtasks')) {
    this.subtasks.forEach(subtask => {
      if (subtask.completed && !subtask.completedAt) {
        subtask.completedAt = new Date();
      } else if (!subtask.completed) {
        subtask.completedAt = null;
      }
    });
  }
  next();
});

// Transform JSON output
taskSchema.set('toJSON', {
  virtuals: true,
  transform: function(doc, ret) {
    delete ret.id;
    return ret;
  },
});

// Static method to get user's tasks with filters
taskSchema.statics.getUserTasks = function(userId, filters = {}) {
  const query = { assignedTo: userId, isArchived: false };
  
  if (filters.status) query.status = filters.status;
  if (filters.priority) query.priority = filters.priority;
  if (filters.category) query.category = filters.category;
  if (filters.tags && filters.tags.length > 0) query.tags = { $in: filters.tags };
  
  return this.find(query)
    .populate('assignedTo', 'name email')
    .populate('createdBy', 'name email')
    .sort({ createdAt: -1 });
};

// Static method to get task statistics
taskSchema.statics.getTaskStats = function(userId) {
  return this.aggregate([
    { $match: { assignedTo: new mongoose.Types.ObjectId(userId), isArchived: false } },
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 },
      },
    },
  ]);
};

const Task = mongoose.model('Task', taskSchema);

module.exports = Task;
