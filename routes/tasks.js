const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');
const {
  getTasks,
  getTask,
  createTask,
  updateTask,
  deleteTask,
  getTaskStats,
} = require('../controllers/taskController');
const {
  updateTaskProgress,
  updateSubtaskProgress,
  startTimeTracking,
  stopTimeTracking,
  getTaskProgress,
  updateTimeEstimates,
} = require('../controllers/progressController');

// All routes are protected
router.use(auth);

// Task routes
router.get('/', getTasks);
router.get('/stats', getTaskStats);
router.get('/:id', getTask);
router.post('/', createTask);
router.put('/:id', updateTask);
router.delete('/:id', deleteTask);

// Progress tracking routes
router.get('/:id/progress', getTaskProgress);
router.put('/:id/progress', updateTaskProgress);
router.put('/:id/subtasks/:subtaskId/progress', updateSubtaskProgress);
router.put('/:id/estimates', updateTimeEstimates);

// Time tracking routes
router.post('/:id/time/start', startTimeTracking);
router.post('/:id/time/stop', stopTimeTracking);

module.exports = router;
