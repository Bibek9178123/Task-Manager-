import api from './api';

// Get AI suggestions for a new task
export const getTaskSuggestions = async (taskData) => {
  const response = await api.post('/ai/suggestions', taskData);
  return response.data;
};

// Get personalized task recommendations
export const getTaskRecommendations = async () => {
  const response = await api.get('/ai/recommendations');
  return response.data;
};

// Get productivity insights
export const getProductivityInsights = async (timeRange = 'week') => {
  const response = await api.get(`/ai/insights?timeRange=${timeRange}`);
  return response.data;
};

// Auto-enhance task with AI suggestions
export const enhanceTask = async (taskId) => {
  const response = await api.put(`/ai/enhance/${taskId}`);
  return response.data;
};

// Generate smart schedule
export const generateSmartSchedule = async (scheduleData) => {
  const response = await api.post('/ai/schedule', scheduleData);
  return response.data;
};

// AI Chat
export const sendChatMessage = async (message, context = null) => {
  const response = await api.post('/ai/chat', { message, context });
  return response.data;
};

// Analyze user tasks
export const analyzeUserTasks = async () => {
  const response = await api.post('/ai/analyze');
  return response.data;
};

export default {
  getTaskSuggestions,
  getTaskRecommendations,
  getProductivityInsights,
  enhanceTask,
  generateSmartSchedule,
  sendChatMessage,
  analyzeUserTasks,
};
