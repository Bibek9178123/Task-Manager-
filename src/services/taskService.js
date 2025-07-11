import api from './api';

export const taskService = {
  // Get all tasks
  getTasks: async (params = {}) => {
    const response = await api.get('/tasks', { params });
    return response.data;
  },

  // Get single task
  getTask: async (id) => {
    const response = await api.get(`/tasks/${id}`);
    return response.data;
  },

  // Create new task
  createTask: async (taskData) => {
    const response = await api.post('/tasks', taskData);
    return response.data;
  },

  // Update task
  updateTask: async (id, updates) => {
    const response = await api.put(`/tasks/${id}`, updates);
    return response.data;
  },

  // Delete task
  deleteTask: async (id) => {
    const response = await api.delete(`/tasks/${id}`);
    return response.data;
  },

  // Toggle task completion
  toggleTaskCompletion: async (id) => {
    const response = await api.patch(`/tasks/${id}/toggle`);
    return response.data;
  },

  // Get task statistics
  getTaskStats: async () => {
    const response = await api.get('/tasks/stats');
    return response.data;
  },
};
