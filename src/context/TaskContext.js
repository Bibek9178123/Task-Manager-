import React, { createContext, useContext, useReducer } from 'react';
import { taskService } from '../services/taskService';

const TaskContext = createContext();

const initialState = {
  tasks: [],
  currentTask: null,
  stats: null,
  loading: false,
  error: null,
  filters: {
    status: '',
    priority: '',
    category: '',
    tags: [],
    search: '',
  },
  pagination: {
    currentPage: 1,
    totalPages: 1,
    totalTasks: 0,
    hasMore: false,
  },
};

const taskReducer = (state, action) => {
  switch (action.type) {
    case 'TASK_START':
      return {
        ...state,
        loading: true,
        error: null,
      };
    case 'TASK_SUCCESS':
      return {
        ...state,
        loading: false,
        error: null,
      };
    case 'TASK_FAIL':
      return {
        ...state,
        loading: false,
        error: action.payload,
      };
    case 'SET_TASKS':
      return {
        ...state,
        tasks: action.payload.tasks,
        pagination: action.payload.pagination,
        loading: false,
      };
    case 'ADD_TASK':
      return {
        ...state,
        tasks: [action.payload, ...state.tasks],
        loading: false,
      };
    case 'UPDATE_TASK':
      return {
        ...state,
        tasks: state.tasks.map(task =>
          task._id === action.payload._id ? action.payload : task
        ),
        currentTask: state.currentTask?._id === action.payload._id ? action.payload : state.currentTask,
        loading: false,
      };
    case 'DELETE_TASK':
      return {
        ...state,
        tasks: state.tasks.filter(task => task._id !== action.payload),
        currentTask: state.currentTask?._id === action.payload ? null : state.currentTask,
        loading: false,
      };
    case 'SET_CURRENT_TASK':
      return {
        ...state,
        currentTask: action.payload,
        loading: false,
      };
    case 'SET_STATS':
      return {
        ...state,
        stats: action.payload,
        loading: false,
      };
    case 'SET_FILTERS':
      return {
        ...state,
        filters: { ...state.filters, ...action.payload },
      };
    case 'CLEAR_FILTERS':
      return {
        ...state,
        filters: initialState.filters,
      };
    case 'CLEAR_ERROR':
      return {
        ...state,
        error: null,
      };
    default:
      return state;
  }
};

export const TaskProvider = ({ children }) => {
  const [state, dispatch] = useReducer(taskReducer, initialState);

  // Get all tasks
  const getTasks = async (filters = {}, page = 1) => {
    try {
      dispatch({ type: 'TASK_START' });
      const response = await taskService.getTasks({ ...filters, page });
      dispatch({
        type: 'SET_TASKS',
        payload: response.data,
      });
      return response;
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to fetch tasks';
      dispatch({
        type: 'TASK_FAIL',
        payload: errorMessage,
      });
      throw error;
    }
  };

  // Get single task
  const getTask = async (id) => {
    try {
      dispatch({ type: 'TASK_START' });
      const response = await taskService.getTask(id);
      dispatch({
        type: 'SET_CURRENT_TASK',
        payload: response.data.task,
      });
      return response;
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to fetch task';
      dispatch({
        type: 'TASK_FAIL',
        payload: errorMessage,
      });
      throw error;
    }
  };

  // Create new task
  const createTask = async (taskData) => {
    try {
      dispatch({ type: 'TASK_START' });
      const response = await taskService.createTask(taskData);
      dispatch({
        type: 'ADD_TASK',
        payload: response.data.task,
      });
      return response;
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to create task';
      dispatch({
        type: 'TASK_FAIL',
        payload: errorMessage,
      });
      throw error;
    }
  };

  // Update task
  const updateTask = async (id, updates) => {
    try {
      dispatch({ type: 'TASK_START' });
      const response = await taskService.updateTask(id, updates);
      dispatch({
        type: 'UPDATE_TASK',
        payload: response.data.task,
      });
      return response;
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to update task';
      dispatch({
        type: 'TASK_FAIL',
        payload: errorMessage,
      });
      throw error;
    }
  };

  // Delete task
  const deleteTask = async (id) => {
    try {
      dispatch({ type: 'TASK_START' });
      await taskService.deleteTask(id);
      dispatch({
        type: 'DELETE_TASK',
        payload: id,
      });
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to delete task';
      dispatch({
        type: 'TASK_FAIL',
        payload: errorMessage,
      });
      throw error;
    }
  };

  // Toggle task completion
  const toggleTaskCompletion = async (id) => {
    try {
      dispatch({ type: 'TASK_START' });
      const response = await taskService.toggleTaskCompletion(id);
      dispatch({
        type: 'UPDATE_TASK',
        payload: response.data.task,
      });
      return response;
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to update task';
      dispatch({
        type: 'TASK_FAIL',
        payload: errorMessage,
      });
      throw error;
    }
  };

  // Get task statistics
  const getTaskStats = async () => {
    try {
      dispatch({ type: 'TASK_START' });
      const response = await taskService.getTaskStats();
      dispatch({
        type: 'SET_STATS',
        payload: response.data,
      });
      return response;
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to fetch statistics';
      dispatch({
        type: 'TASK_FAIL',
        payload: errorMessage,
      });
      throw error;
    }
  };

  // Set filters
  const setFilters = (filters) => {
    dispatch({
      type: 'SET_FILTERS',
      payload: filters,
    });
  };

  // Clear filters
  const clearFilters = () => {
    dispatch({ type: 'CLEAR_FILTERS' });
  };

  // Clear error
  const clearError = () => {
    dispatch({ type: 'CLEAR_ERROR' });
  };

  const value = {
    tasks: state.tasks,
    currentTask: state.currentTask,
    stats: state.stats,
    loading: state.loading,
    error: state.error,
    filters: state.filters,
    pagination: state.pagination,
    getTasks,
    getTask,
    createTask,
    updateTask,
    deleteTask,
    toggleTaskCompletion,
    getTaskStats,
    setFilters,
    clearFilters,
    clearError,
  };

  return <TaskContext.Provider value={value}>{children}</TaskContext.Provider>;
};

export const useTask = () => {
  const context = useContext(TaskContext);
  if (!context) {
    throw new Error('useTask must be used within a TaskProvider');
  }
  return context;
};
