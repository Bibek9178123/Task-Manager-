const Task = require('../models/Task');
const aiService = require('../services/aiService');
const asyncHandler = require('express-async-handler');

// @desc    Get AI suggestions for a new task
// @route   POST /api/ai/suggestions
// @access  Private
const getTaskSuggestions = asyncHandler(async (req, res) => {
  const { title, description, dueDate } = req.body;

  if (!title) {
    return res.status(400).json({ message: 'Task title is required' });
  }

  const suggestions = {
    category: aiService.suggestCategory(title, description || ''),
    priority: aiService.suggestPriority(title, description || '', dueDate),
    estimatedHours: aiService.estimateTimeRequired(title, description || ''),
    subtasks: aiService.generateSubtasks(title, description || '', 'work')
  };

  res.json({
    success: true,
    suggestions,
    message: 'AI suggestions generated successfully'
  });
});

// @desc    Get personalized task recommendations
// @route   GET /api/ai/recommendations
// @access  Private
const getTaskRecommendations = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  
  // Get user's tasks for pattern analysis
  const userTasks = await Task.find({ assignedTo: userId })
    .sort({ createdAt: -1 })
    .limit(50);

  const recommendations = aiService.generateTaskRecommendations(userTasks);

  // Get AI-powered insights for recommendations
  const completedTasks = userTasks.filter(task => task.status === 'completed');
  const pendingTasks = userTasks.filter(task => task.status !== 'completed');
  
  const aiPrompt = `Based on user task history: ${completedTasks.length} completed tasks, ${pendingTasks.length} pending tasks. 
    Recent tasks: ${userTasks.slice(0, 5).map(t => t.title).join(', ')}.
    Provide 2 personalized productivity recommendations.`;
  
  const aiInsight = await aiService.callGemini(aiPrompt, 200);
  
  // Add AI-generated recommendation
  if (aiInsight) {
    recommendations.push({
      title: 'AI Productivity Insight',
      description: aiInsight,
      category: 'personal',
      priority: 'medium',
      estimatedHours: 0.5,
      reason: 'AI analysis of your task patterns'
    });
  }

  res.json({
    success: true,
    recommendations,
    count: recommendations.length
  });
});

// @desc    Get productivity insights
// @route   GET /api/ai/insights
// @access  Private
const getProductivityInsights = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const { timeRange = 'week' } = req.query;

  // Get user's tasks for analysis
  const userTasks = await Task.find({ assignedTo: userId })
    .sort({ createdAt: -1 })
    .limit(100);

  const insights = aiService.generateProductivityInsights(userTasks, timeRange);

  // Calculate additional metrics
  const completedTasks = userTasks.filter(task => task.status === 'completed');
  const overdueTasks = userTasks.filter(task => task.isOverdue && task.status !== 'completed');
  
  const metrics = {
    totalTasks: userTasks.length,
    completedTasks: completedTasks.length,
    completionRate: userTasks.length > 0 ? (completedTasks.length / userTasks.length * 100).toFixed(1) : 0,
    overdueTasks: overdueTasks.length,
    averageCompletionTime: completedTasks.length > 0 
      ? (completedTasks.reduce((sum, task) => sum + (task.actualHours || 0), 0) / completedTasks.length).toFixed(2)
      : 0
  };

  res.json({
    success: true,
    insights,
    metrics,
    timeRange
  });
});

// @desc    Auto-enhance task with AI suggestions
// @route   PUT /api/ai/enhance/:id
// @access  Private
const enhanceTask = asyncHandler(async (req, res) => {
  const { id } = req.params;
  
  const task = await Task.findById(id);
  
  if (!task) {
    return res.status(404).json({ message: 'Task not found' });
  }

  // Check if user owns the task
  if (task.assignedTo.toString() !== req.user.id) {
    return res.status(403).json({ message: 'Not authorized to enhance this task' });
  }

  // Get AI suggestions
  const categoryResult = aiService.suggestCategory(task.title, task.description);
  const priorityResult = aiService.suggestPriority(task.title, task.description, task.dueDate);
  const estimatedHours = aiService.estimateTimeRequired(task.title, task.description);

  // Update task if confidence is high enough
  const updates = {};
  if (categoryResult.confidence > 70 && task.category === 'other') {
    updates.category = categoryResult.category;
  }
  if (priorityResult.confidence > 80 && task.priority === 'medium') {
    updates.priority = priorityResult.priority;
  }
  if (!task.estimatedHours && estimatedHours > 0) {
    updates.estimatedHours = estimatedHours;
  }

  // Add suggested subtasks if none exist
  if (task.subtasks.length === 0) {
    const suggestedSubtasks = aiService.generateSubtasks(task.title, task.description, task.category);
    updates.subtasks = suggestedSubtasks.slice(0, 3); // Limit to 3 subtasks
  }

  if (Object.keys(updates).length > 0) {
    Object.assign(task, updates);
    await task.save();
  }

  res.json({
    success: true,
    task,
    enhancements: updates,
    message: 'Task enhanced with AI suggestions'
  });
});

// @desc    Generate smart schedule for tasks
// @route   POST /api/ai/schedule
// @access  Private
const generateSmartSchedule = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const { date, workingHours = 8 } = req.body;

  // Get pending tasks
  const pendingTasks = await Task.find({
    assignedTo: userId,
    status: { $in: ['todo', 'in-progress'] },
    isArchived: false
  }).sort({ priority: -1, dueDate: 1 });

  // Smart scheduling algorithm
  const schedule = [];
  let currentTime = new Date(date);
  currentTime.setHours(9, 0, 0, 0); // Start at 9 AM
  
  const endTime = new Date(currentTime);
  endTime.setHours(currentTime.getHours() + workingHours);

  const priorityWeights = { urgent: 4, high: 3, medium: 2, low: 1 };

  // Sort tasks by priority and due date
  const sortedTasks = pendingTasks.sort((a, b) => {
    const priorityDiff = priorityWeights[b.priority] - priorityWeights[a.priority];
    if (priorityDiff !== 0) return priorityDiff;
    
    if (a.dueDate && b.dueDate) {
      return new Date(a.dueDate) - new Date(b.dueDate);
    }
    return a.dueDate ? -1 : 1;
  });

  for (const task of sortedTasks) {
    const taskDuration = (task.estimatedHours || 1) * 60; // Convert to minutes
    const taskEndTime = new Date(currentTime.getTime() + taskDuration * 60000);

    if (taskEndTime <= endTime) {
      schedule.push({
        task: {
          _id: task._id,
          title: task.title,
          priority: task.priority,
          estimatedHours: task.estimatedHours || 1
        },
        startTime: new Date(currentTime),
        endTime: new Date(taskEndTime),
        duration: taskDuration
      });

      currentTime = new Date(taskEndTime.getTime() + 15 * 60000); // 15-minute break
    }

    if (currentTime >= endTime) break;
  }

  res.json({
    success: true,
    schedule,
    date,
    workingHours,
    totalScheduledTasks: schedule.length,
    totalScheduledHours: schedule.reduce((sum, item) => sum + item.duration / 60, 0).toFixed(2)
  });
});

// @desc    AI Chat Assistant
// @route   POST /api/ai/chat
// @access  Private
const aiChat = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const { message, context } = req.body;

  if (!message) {
    return res.status(400).json({ message: 'Message is required' });
  }

  try {
    // Get user's recent tasks for context
    const recentTasks = await Task.find({ assignedTo: userId })
      .sort({ createdAt: -1 })
      .limit(10);

    const taskContext = recentTasks.map(task => `${task.title} (${task.status})`).join(', ');
    
    // Create context-aware prompt
    const contextPrompt = `
      You are a productivity assistant for a task management system. 
      User's recent tasks: ${taskContext}.
      User's question: ${message}
      
      Provide helpful, concise advice related to task management, productivity, or the user's question.
      Keep responses under 200 words and actionable.
    `;

    const aiResponse = await aiService.callGemini(contextPrompt, 200);
    
    res.json({
      success: true,
      response: aiResponse,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('AI Chat error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Failed to get AI response',
      response: 'I apologize, but I\'m having trouble processing your request right now. Please try again later.'
    });
  }
});

// @desc    Get AI task analysis
// @route   POST /api/ai/analyze
// @access  Private
const analyzeUserTasks = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  
  try {
    // Get all user tasks
    const userTasks = await Task.find({ assignedTo: userId })
      .sort({ createdAt: -1 })
      .limit(50);

    if (userTasks.length === 0) {
      return res.json({
        success: true,
        analysis: 'No tasks found. Start by creating some tasks to get personalized insights!',
        suggestions: []
      });
    }

    // Analyze task patterns
    const completedTasks = userTasks.filter(task => task.status === 'completed');
    const pendingTasks = userTasks.filter(task => task.status !== 'completed');
    const overdueTasks = userTasks.filter(task => task.isOverdue && task.status !== 'completed');
    
    const categoryDistribution = {};
    const priorityDistribution = {};
    
    userTasks.forEach(task => {
      categoryDistribution[task.category] = (categoryDistribution[task.category] || 0) + 1;
      priorityDistribution[task.priority] = (priorityDistribution[task.priority] || 0) + 1;
    });

    const analysisPrompt = `
      Analyze this user's task management patterns:
      - Total tasks: ${userTasks.length}
      - Completed: ${completedTasks.length} (${((completedTasks.length / userTasks.length) * 100).toFixed(1)}%)
      - Pending: ${pendingTasks.length}
      - Overdue: ${overdueTasks.length}
      - Categories: ${Object.entries(categoryDistribution).map(([cat, count]) => `${cat}: ${count}`).join(', ')}
      - Priorities: ${Object.entries(priorityDistribution).map(([pri, count]) => `${pri}: ${count}`).join(', ')}
      
      Provide:
      1. Brief analysis of their productivity patterns
      2. 3 specific actionable suggestions for improvement
      3. Identify any potential productivity issues
      
      Keep it concise and actionable.
    `;

    // Enhanced fallback analysis when OpenAI is not available
    let aiAnalysis;
    try {
      aiAnalysis = await aiService.callGemini(analysisPrompt, 300);
    } catch (error) {
      // Generate intelligent fallback analysis
      const completionRate = ((completedTasks.length / userTasks.length) * 100).toFixed(1);
      const hasOverdue = overdueTasks.length > 0;
      const topCategory = Object.entries(categoryDistribution).sort(([,a], [,b]) => b - a)[0];
      const topPriority = Object.entries(priorityDistribution).sort(([,a], [,b]) => b - a)[0];
      
      let analysis = `**Productivity Analysis:**\n\n`;
      
      // Completion rate analysis
      if (completionRate >= 80) {
        analysis += `🎉 Excellent completion rate of ${completionRate}%! You're very effective at finishing what you start.\n\n`;
      } else if (completionRate >= 60) {
        analysis += `👍 Good completion rate of ${completionRate}%. There's room for improvement in task completion.\n\n`;
      } else {
        analysis += `⚠️ Your completion rate of ${completionRate}% suggests you might be taking on too many tasks or facing obstacles.\n\n`;
      }
      
      // Category analysis
      if (topCategory) {
        analysis += `📊 Your primary focus is "${topCategory[0]}" tasks (${topCategory[1]} tasks), which shows clear priorities.\n\n`;
      }
      
      // Overdue analysis
      if (hasOverdue) {
        analysis += `🚨 You have ${overdueTasks.length} overdue task(s) that need immediate attention.\n\n`;
      } else {
        analysis += `✅ Great job staying on top of deadlines! No overdue tasks.\n\n`;
      }
      
      // Suggestions
      analysis += `**Recommendations:**\n\n`;
      
      const suggestions = [];
      
      if (completionRate < 70) {
        suggestions.push('• **Reduce task load**: Focus on 3-5 important tasks per day instead of overcommitting.');
      }
      
      if (hasOverdue) {
        suggestions.push('• **Address overdue items**: Schedule dedicated time to clear your backlog and prevent future delays.');
      }
      
      if (pendingTasks.length > completedTasks.length * 2) {
        suggestions.push('• **Prioritize ruthlessly**: Use the Eisenhower Matrix to focus on urgent and important tasks first.');
      }
      
      // Add general suggestions if we need more
      if (suggestions.length < 3) {
        const generalSuggestions = [
          '• **Time blocking**: Allocate specific time slots for different types of tasks.',
          '• **Regular reviews**: Set aside 15 minutes daily to review and adjust your task list.',
          '• **Break down large tasks**: Split complex projects into smaller, manageable sub-tasks.',
          '• **Batch similar tasks**: Group related activities to improve efficiency and focus.'
        ];
        
        while (suggestions.length < 3 && generalSuggestions.length > 0) {
          suggestions.push(generalSuggestions.shift());
        }
      }
      
      analysis += suggestions.slice(0, 3).join('\n\n');
      aiAnalysis = analysis;
    }
    
    res.json({
      success: true,
      analysis: aiAnalysis,
      stats: {
        totalTasks: userTasks.length,
        completedTasks: completedTasks.length,
        completionRate: ((completedTasks.length / userTasks.length) * 100).toFixed(1),
        pendingTasks: pendingTasks.length,
        overdueTasks: overdueTasks.length,
        categoryDistribution,
        priorityDistribution
      }
    });
  } catch (error) {
    console.error('Task analysis error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Failed to analyze tasks'
    });
  }
});

module.exports = {
  getTaskSuggestions,
  getTaskRecommendations,
  getProductivityInsights,
  enhanceTask,
  generateSmartSchedule,
  aiChat,
  analyzeUserTasks
};
