const Task = require('../models/Task');
const mongoose = require('mongoose');

// Get all tasks for authenticated user
const getTasks = async (req, res) => {
  try {
    const {
      status,
      priority,
      category,
      tags,
      search,
      sortBy = 'createdAt',
      sortOrder = 'desc',
      page = 1,
      limit = 10,
    } = req.query;

    // Build filter object
    const filter = { 
      assignedTo: req.user.id,
      isArchived: false,
    };

    if (status) filter.status = status;
    if (priority) filter.priority = priority;
    if (category) filter.category = category;
    if (tags) {
      const tagArray = tags.split(',').map(tag => tag.trim());
      filter.tags = { $in: tagArray };
    }

    // Add search functionality
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ];
    }

    // Build sort object
    const sort = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Execute query
    const tasks = await Task.find(filter)
      .populate('assignedTo', 'name email')
      .populate('createdBy', 'name email')
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit));

    // Get total count for pagination
    const totalTasks = await Task.countDocuments(filter);

    res.json({
      success: true,
      data: {
        tasks,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(totalTasks / parseInt(limit)),
          totalTasks,
          hasMore: skip + tasks.length < totalTasks,
        },
      },
    });
  } catch (error) {
    console.error('Get tasks error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching tasks',
    });
  }
};

// Get single task
const getTask = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid task ID',
      });
    }

    const task = await Task.findById(id)
      .populate('assignedTo', 'name email')
      .populate('createdBy', 'name email');

    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found',
      });
    }

    // Check if user has access to this task
    if (task.assignedTo._id.toString() !== req.user.id && task.createdBy._id.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Access denied',
      });
    }

    res.json({
      success: true,
      data: { task },
    });
  } catch (error) {
    console.error('Get task error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching task',
    });
  }
};

// Create new task
const createTask = async (req, res) => {
  try {
    const {
      title,
      description,
      priority,
      category,
      dueDate,
      tags,
      subtasks,
      assignedTo,
    } = req.body;

    // Validation
    if (!title || title.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Task title is required',
      });
    }

    // Create task data
    const taskData = {
      title: title.trim(),
      description: description ? description.trim() : '',
      priority: priority || 'medium',
      category: category || 'personal',
      assignedTo: assignedTo || req.user.id,
      createdBy: req.user.id,
    };

    if (dueDate) {
      taskData.dueDate = new Date(dueDate);
    }

    if (tags && Array.isArray(tags)) {
      taskData.tags = tags.map(tag => tag.trim()).filter(tag => tag.length > 0);
    }

    if (subtasks && Array.isArray(subtasks)) {
      taskData.subtasks = subtasks.map(subtask => ({
        title: subtask.title.trim(),
        completed: subtask.completed || false,
      }));
    }

    const task = await Task.create(taskData);

    // Populate the created task
    const populatedTask = await Task.findById(task._id)
      .populate('assignedTo', 'name email')
      .populate('createdBy', 'name email');

    res.status(201).json({
      success: true,
      message: 'Task created successfully',
      data: { task: populatedTask },
    });
  } catch (error) {
    console.error('Create task error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while creating task',
    });
  }
};

// Update task
const updateTask = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid task ID',
      });
    }

    const task = await Task.findById(id);

    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found',
      });
    }

    // Check if user has access to update this task
    if (task.assignedTo.toString() !== req.user.id && task.createdBy.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Access denied',
      });
    }

    // Update task
    const updatedTask = await Task.findByIdAndUpdate(
      id,
      updates,
      { new: true, runValidators: true }
    )
      .populate('assignedTo', 'name email')
      .populate('createdBy', 'name email');

    res.json({
      success: true,
      message: 'Task updated successfully',
      data: { task: updatedTask },
    });
  } catch (error) {
    console.error('Update task error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while updating task',
    });
  }
};

// Delete task
const deleteTask = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid task ID',
      });
    }

    const task = await Task.findById(id);

    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found',
      });
    }

    // Check if user has access to delete this task
    if (task.assignedTo.toString() !== req.user.id && task.createdBy.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Access denied',
      });
    }

    await Task.findByIdAndDelete(id);

    res.json({
      success: true,
      message: 'Task deleted successfully',
    });
  } catch (error) {
    console.error('Delete task error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while deleting task',
    });
  }
};

// Toggle task completion
const toggleTaskCompletion = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid task ID',
      });
    }

    const task = await Task.findById(id);

    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found',
      });
    }

    // Check if user has access to update this task
    if (task.assignedTo.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Access denied',
      });
    }

    // Toggle completion status
    const newStatus = task.status === 'completed' ? 'todo' : 'completed';
    
    const updatedTask = await Task.findByIdAndUpdate(
      id,
      { status: newStatus },
      { new: true, runValidators: true }
    )
      .populate('assignedTo', 'name email')
      .populate('createdBy', 'name email');

    res.json({
      success: true,
      message: `Task marked as ${newStatus}`,
      data: { task: updatedTask },
    });
  } catch (error) {
    console.error('Toggle task completion error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while updating task',
    });
  }
};

// Get task statistics
const getTaskStats = async (req, res) => {
  try {
    const userId = req.user.id;

    // Get basic stats
    const stats = await Task.aggregate([
      { $match: { assignedTo: new mongoose.Types.ObjectId(userId), isArchived: false } },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
        },
      },
    ]);

    // Get priority stats
    const priorityStats = await Task.aggregate([
      { $match: { assignedTo: new mongoose.Types.ObjectId(userId), isArchived: false } },
      {
        $group: {
          _id: '$priority',
          count: { $sum: 1 },
        },
      },
    ]);

    // Get category stats
    const categoryStats = await Task.aggregate([
      { $match: { assignedTo: new mongoose.Types.ObjectId(userId), isArchived: false } },
      {
        $group: {
          _id: '$category',
          count: { $sum: 1 },
        },
      },
    ]);

    // Get overdue tasks count
    const overdueCount = await Task.countDocuments({
      assignedTo: userId,
      isArchived: false,
      status: { $ne: 'completed' },
      dueDate: { $lt: new Date() },
    });

    // Get tasks due today
    const today = new Date();
    const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1);

    const dueTodayCount = await Task.countDocuments({
      assignedTo: userId,
      isArchived: false,
      status: { $ne: 'completed' },
      dueDate: { $gte: startOfDay, $lt: endOfDay },
    });

    // Format stats
    const formattedStats = {
      todo: 0,
      'in-progress': 0,
      completed: 0,
    };

    stats.forEach(stat => {
      formattedStats[stat._id] = stat.count;
    });

    const formattedPriorityStats = {
      low: 0,
      medium: 0,
      high: 0,
      urgent: 0,
    };

    priorityStats.forEach(stat => {
      formattedPriorityStats[stat._id] = stat.count;
    });

    const formattedCategoryStats = {};
    categoryStats.forEach(stat => {
      formattedCategoryStats[stat._id] = stat.count;
    });

    res.json({
      success: true,
      data: {
        statusStats: formattedStats,
        priorityStats: formattedPriorityStats,
        categoryStats: formattedCategoryStats,
        overdueCount,
        dueTodayCount,
        totalTasks: Object.values(formattedStats).reduce((a, b) => a + b, 0),
      },
    });
  } catch (error) {
    console.error('Get task stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching task statistics',
    });
  }
};

module.exports = {
  getTasks,
  getTask,
  createTask,
  updateTask,
  deleteTask,
  toggleTaskCompletion,
  getTaskStats,
};
