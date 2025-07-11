import api from './api';

// Update main task progress
export const updateTaskProgress = async (taskId, progress) => {
  const response = await api.put(`/tasks/${taskId}/progress`, { progress });
  return response.data;
};

// Update subtask progress
export const updateSubtaskProgress = async (taskId, subtaskId, progress) => {
  const response = await api.put(`/tasks/${taskId}/subtasks/${subtaskId}/progress`, { progress });
  return response.data;
};

// Get task progress details
export const getTaskProgress = async (taskId) => {
  const response = await api.get(`/tasks/${taskId}/progress`);
  return response.data;
};

// Start time tracking
export const startTimeTracking = async (taskId) => {
  const response = await api.post(`/tasks/${taskId}/time/start`);
  return response.data;
};

// Stop time tracking
export const stopTimeTracking = async (taskId) => {
  const response = await api.post(`/tasks/${taskId}/time/stop`);
  return response.data;
};

// Update time estimates
export const updateTimeEstimates = async (taskId, estimatedHours, subtaskEstimates = []) => {
  const response = await api.put(`/tasks/${taskId}/estimates`, {
    estimatedHours,
    subtaskEstimates
  });
  return response.data;
};

// Get progress analytics for multiple tasks
export const getProgressAnalytics = async (tasks) => {
  const analytics = {
    totalTasks: tasks.length,
    completedTasks: tasks.filter(task => task.status === 'completed').length,
    inProgressTasks: tasks.filter(task => task.status === 'in-progress').length,
    todoTasks: tasks.filter(task => task.status === 'todo').length,
    overdueTasks: tasks.filter(task => task.isOverdue).length,
    averageProgress: tasks.reduce((sum, task) => sum + (task.completionPercentage || 0), 0) / tasks.length,
    totalEstimatedHours: tasks.reduce((sum, task) => sum + (task.estimatedHours || 0), 0),
    totalActualHours: tasks.reduce((sum, task) => sum + (task.actualHours || 0), 0),
    efficiencyStats: {
      underEstimate: tasks.filter(task => task.efficiency && task.efficiency < 100).length,
      onTarget: tasks.filter(task => task.efficiency && task.efficiency >= 100 && task.efficiency <= 120).length,
      overEstimate: tasks.filter(task => task.efficiency && task.efficiency > 120).length,
    }
  };

  analytics.completionRate = (analytics.completedTasks / analytics.totalTasks) * 100;
  analytics.overallEfficiency = analytics.totalEstimatedHours > 0 
    ? (analytics.totalEstimatedHours / analytics.totalActualHours) * 100 
    : null;

  return analytics;
};

// Calculate productivity metrics
export const calculateProductivityMetrics = (tasks, timeRange = 'week') => {
  const now = new Date();
  const startDate = new Date();
  
  switch (timeRange) {
    case 'day':
      startDate.setDate(now.getDate() - 1);
      break;
    case 'week':
      startDate.setDate(now.getDate() - 7);
      break;
    case 'month':
      startDate.setMonth(now.getMonth() - 1);
      break;
    default:
      startDate.setDate(now.getDate() - 7);
  }

  const filteredTasks = tasks.filter(task => 
    new Date(task.updatedAt) >= startDate
  );

  const completedInRange = filteredTasks.filter(task => 
    task.status === 'completed' && 
    task.completedAt && 
    new Date(task.completedAt) >= startDate
  );

  const metrics = {
    tasksCompleted: completedInRange.length,
    totalTimeSpent: filteredTasks.reduce((sum, task) => sum + (task.actualHours || 0), 0),
    averageCompletionTime: completedInRange.length > 0 
      ? completedInRange.reduce((sum, task) => sum + (task.actualHours || 0), 0) / completedInRange.length
      : 0,
    productivityScore: 0,
    trends: {
      improvement: 0,
      decline: 0,
      stable: 0
    }
  };

  // Calculate productivity score (0-100)
  const expectedTasksPerDay = 3; // Configurable
  const daysInRange = timeRange === 'day' ? 1 : timeRange === 'week' ? 7 : 30;
  const expectedTasks = expectedTasksPerDay * daysInRange;
  
  metrics.productivityScore = Math.min(100, (metrics.tasksCompleted / expectedTasks) * 100);

  return metrics;
};

export default {
  updateTaskProgress,
  updateSubtaskProgress,
  getTaskProgress,
  startTimeTracking,
  stopTimeTracking,
  updateTimeEstimates,
  getProgressAnalytics,
  calculateProductivityMetrics,
};
