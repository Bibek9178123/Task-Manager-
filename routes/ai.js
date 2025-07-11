const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');
const {
  getTaskSuggestions,
  getTaskRecommendations,
  getProductivityInsights,
  enhanceTask,
  generateSmartSchedule,
  aiChat,
  analyzeUserTasks
} = require('../controllers/aiController');

// All AI routes are protected
router.use(auth);

// AI suggestion routes
router.post('/suggestions', getTaskSuggestions);
router.get('/recommendations', getTaskRecommendations);
router.get('/insights', getProductivityInsights);
router.put('/enhance/:id', enhanceTask);
router.post('/schedule', generateSmartSchedule);

// AI Chat and Analysis routes
router.post('/chat', aiChat);
router.post('/analyze', analyzeUserTasks);

module.exports = router;
