const Task = require('../models/Task');
const asyncHandler = require('express-async-handler');

// @desc    Update task progress
// @route   PUT /api/tasks/:id/progress
// @access  Private
const updateTaskProgress = asyncHandler(async (req, res) => {
  const { progress } = req.body;
  const { id } = req.params;

  // Validate progress value
  if (progress < 0 || progress > 100) {
    return res.status(400).json({ message: 'Progress must be between 0 and 100' });
  }

  const task = await Task.findById(id);

  if (!task) {
    return res.status(404).json({ message: 'Task not found' });
  }

  // Check if user is assigned to the task
  if (task.assignedTo.toString() !== req.user.id) {
    return res.status(403).json({ message: 'Not authorized to update this task' });
  }

  // Update progress
  task.progress = progress;

  // Auto-update status based on progress
  if (progress === 0) {
    task.status = 'todo';
  } else if (progress === 100) {
    task.status = 'completed';
  } else if (progress > 0 && task.status === 'todo') {
    task.status = 'in-progress';
  }

  await task.save();

  res.json({
    message: 'Progress updated successfully',
    task: {
      _id: task._id,
      title: task.title,
      progress: task.progress,
      status: task.status,
      completionPercentage: task.completionPercentage,
    }
  });
});

// @desc    Update subtask progress
// @route   PUT /api/tasks/:id/subtasks/:subtaskId/progress
// @access  Private
const updateSubtaskProgress = asyncHandler(async (req, res) => {
  const { progress } = req.body;
  const { id, subtaskId } = req.params;

  // Validate progress value
  if (progress < 0 || progress > 100) {
    return res.status(400).json({ message: 'Progress must be between 0 and 100' });
  }

  const task = await Task.findById(id);

  if (!task) {
    return res.status(404).json({ message: 'Task not found' });
  }

  // Check if user is assigned to the task
  if (task.assignedTo.toString() !== req.user.id) {
    return res.status(403).json({ message: 'Not authorized to update this task' });
  }

  // Find and update subtask
  const subtask = task.subtasks.id(subtaskId);
  if (!subtask) {
    return res.status(404).json({ message: 'Subtask not found' });
  }

  subtask.progress = progress;

  // Auto-update completion status
  if (progress === 100) {
    subtask.completed = true;
    subtask.completedAt = new Date();
  } else if (progress < 100 && subtask.completed) {
    subtask.completed = false;
    subtask.completedAt = null;
  }

  await task.save();

  res.json({
    message: 'Subtask progress updated successfully',
    task: {
      _id: task._id,
      title: task.title,
      completionPercentage: task.completionPercentage,
      subtasks: task.subtasks,
    }
  });
});

// @desc    Start time tracking for a task
// @route   POST /api/tasks/:id/time/start
// @access  Private
const startTimeTracking = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const task = await Task.findById(id);

  if (!task) {
    return res.status(404).json({ message: 'Task not found' });
  }

  // Check if user is assigned to the task
  if (task.assignedTo.toString() !== req.user.id) {
    return res.status(403).json({ message: 'Not authorized to track time for this task' });
  }

  // Check if time tracking is already started
  if (task.timeTracking.started) {
    return res.status(400).json({ message: 'Time tracking already started' });
  }

  // Start time tracking
  task.timeTracking.started = true;
  task.timeTracking.startTime = new Date();

  // Create new session
  task.timeTracking.sessions.push({
    startTime: new Date(),
  });

  // Update task status if it's still 'todo'
  if (task.status === 'todo') {
    task.status = 'in-progress';
  }

  await task.save();

  res.json({
    message: 'Time tracking started',
    task: {
      _id: task._id,
      title: task.title,
      timeTracking: task.timeTracking,
      status: task.status,
    }
  });
});

// @desc    Stop time tracking for a task
// @route   POST /api/tasks/:id/time/stop
// @access  Private
const stopTimeTracking = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const task = await Task.findById(id);

  if (!task) {
    return res.status(404).json({ message: 'Task not found' });
  }

  // Check if user is assigned to the task
  if (task.assignedTo.toString() !== req.user.id) {
    return res.status(403).json({ message: 'Not authorized to track time for this task' });
  }

  // Check if time tracking is started
  if (!task.timeTracking.started) {
    return res.status(400).json({ message: 'Time tracking not started' });
  }

  // Stop time tracking
  task.timeTracking.started = false;
  const endTime = new Date();

  // Update the latest session
  const latestSession = task.timeTracking.sessions[task.timeTracking.sessions.length - 1];
  if (latestSession && !latestSession.endTime) {
    latestSession.endTime = endTime;
    latestSession.duration = endTime - latestSession.startTime;
  }

  // Calculate total actual hours
  const totalDuration = task.timeTracking.sessions.reduce((sum, session) => {
    return sum + (session.duration || 0);
  }, 0);

  task.actualHours = totalDuration / (1000 * 60 * 60); // Convert to hours

  await task.save();

  res.json({
    message: 'Time tracking stopped',
    task: {
      _id: task._id,
      title: task.title,
      timeTracking: task.timeTracking,
      actualHours: task.actualHours,
      totalTimeSpent: task.totalTimeSpent,
    }
  });
});

// @desc    Get task progress summary
// @route   GET /api/tasks/:id/progress
// @access  Private
const getTaskProgress = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const task = await Task.findById(id);

  if (!task) {
    return res.status(404).json({ message: 'Task not found' });
  }

  // Check if user is assigned to the task
  if (task.assignedTo.toString() !== req.user.id) {
    return res.status(403).json({ message: 'Not authorized to view this task' });
  }

  const progressSummary = {
    taskId: task._id,
    title: task.title,
    status: task.status,
    progress: task.progress,
    completionPercentage: task.completionPercentage,
    estimatedHours: task.estimatedHours,
    actualHours: task.actualHours,
    totalTimeSpent: task.totalTimeSpent,
    efficiency: task.efficiency,
    isOverdue: task.isOverdue,
    dueDate: task.dueDate,
    subtasks: task.subtasks.map(subtask => ({
      _id: subtask._id,
      title: subtask.title,
      progress: subtask.progress,
      completed: subtask.completed,
      estimatedHours: subtask.estimatedHours,
      actualHours: subtask.actualHours,
    })),
    timeTracking: {
      started: task.timeTracking.started,
      startTime: task.timeTracking.startTime,
      sessions: task.timeTracking.sessions.map(session => ({
        startTime: session.startTime,
        endTime: session.endTime,
        duration: session.duration,
      })),
    },
  };

  res.json(progressSummary);
});

// @desc    Update task time estimates
// @route   PUT /api/tasks/:id/estimates
// @access  Private
const updateTimeEstimates = asyncHandler(async (req, res) => {
  const { estimatedHours, subtaskEstimates } = req.body;
  const { id } = req.params;

  const task = await Task.findById(id);

  if (!task) {
    return res.status(404).json({ message: 'Task not found' });
  }

  // Check if user is assigned to the task
  if (task.assignedTo.toString() !== req.user.id) {
    return res.status(403).json({ message: 'Not authorized to update this task' });
  }

  // Update main task estimate
  if (estimatedHours !== undefined) {
    task.estimatedHours = estimatedHours;
  }

  // Update subtask estimates
  if (subtaskEstimates && Array.isArray(subtaskEstimates)) {
    subtaskEstimates.forEach(estimate => {
      const subtask = task.subtasks.id(estimate.subtaskId);
      if (subtask) {
        subtask.estimatedHours = estimate.estimatedHours;
      }
    });
  }

  await task.save();

  res.json({
    message: 'Time estimates updated successfully',
    task: {
      _id: task._id,
      title: task.title,
      estimatedHours: task.estimatedHours,
      subtasks: task.subtasks,
    }
  });
});

module.exports = {
  updateTaskProgress,
  updateSubtaskProgress,
  startTimeTracking,
  stopTimeTracking,
  getTaskProgress,
  updateTimeEstimates,
};
