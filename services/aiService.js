const axios = require('axios');

class AIService {
  constructor() {
    this.enabled = process.env.AI_ENABLED === 'true';
    this.apiKey = process.env.GEMINI_API_KEY;
    this.baseURL = 'https://generativelanguage.googleapis.com/v1beta';
  }

  // Call Google Gemini API with retry logic
  async callGemini(prompt, maxTokens = 150) {
    if (!this.enabled || !this.apiKey) {
      return this.getFallbackResponse(prompt);
    }

    const systemPrompt = 'You are a helpful AI assistant that helps with task management and productivity. Provide concise, practical advice.';
    const fullPrompt = `${systemPrompt}\n\nUser: ${prompt}\n\nAssistant:`;
    
    const maxRetries = 3;
    const baseDelay = 1000; // 1 second

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        const response = await axios.post(
          `${this.baseURL}/models/gemini-1.5-flash:generateContent?key=${this.apiKey}`,
          {
            contents: [{
              parts: [{
                text: fullPrompt
              }]
            }],
            generationConfig: {
              maxOutputTokens: maxTokens,
              temperature: 0.7,
              topP: 0.8,
              topK: 40
            },
            safetySettings: [
              {
                category: 'HARM_CATEGORY_HARASSMENT',
                threshold: 'BLOCK_MEDIUM_AND_ABOVE'
              },
              {
                category: 'HARM_CATEGORY_HATE_SPEECH',
                threshold: 'BLOCK_MEDIUM_AND_ABOVE'
              },
              {
                category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT',
                threshold: 'BLOCK_MEDIUM_AND_ABOVE'
              },
              {
                category: 'HARM_CATEGORY_DANGEROUS_CONTENT',
                threshold: 'BLOCK_MEDIUM_AND_ABOVE'
              }
            ]
          },
          {
            headers: {
              'Content-Type': 'application/json'
            },
            timeout: 30000 // 30 second timeout
          }
        );

        if (response.data.candidates && response.data.candidates[0]?.content?.parts?.[0]?.text) {
          return response.data.candidates[0].content.parts[0].text.trim();
        } else {
          console.warn('Unexpected Gemini API response format:', response.data);
          return this.getFallbackResponse(prompt);
        }
        
      } catch (error) {
        const isRetryableError = error.response && 
          (error.response.status === 429 || // Rate limit
           error.response.status === 503 || // Service unavailable
           error.response.status === 502 || // Bad gateway
           error.response.status === 504);  // Gateway timeout
           
        const isNetworkError = error.code === 'ECONNRESET' || 
                              error.code === 'ETIMEDOUT' || 
                              error.code === 'ENOTFOUND';

        if ((isRetryableError || isNetworkError) && attempt < maxRetries) {
          const delay = baseDelay * Math.pow(2, attempt - 1); // Exponential backoff
          console.log(`Gemini API attempt ${attempt} failed, retrying in ${delay}ms...`);
          await new Promise(resolve => setTimeout(resolve, delay));
          continue;
        }
        
        console.error('Gemini API error:', error.response?.data || error.message);
        return this.getFallbackResponse(prompt);
      }
    }
  }

  // Enhanced fallback response system
  getFallbackResponse(prompt) {
    const lowerPrompt = prompt.toLowerCase();
    
    // Productivity-related responses
    if (lowerPrompt.includes('productivity') || lowerPrompt.includes('efficient')) {
      const responses = [
        'Focus on breaking down large tasks into smaller, manageable steps.',
        'Try the Pomodoro Technique: work for 25 minutes, then take a 5-minute break.',
        'Prioritize your most important tasks during your peak energy hours.',
        'Eliminate distractions by turning off notifications during focused work time.',
        'Use the two-minute rule: if a task takes less than 2 minutes, do it immediately.'
      ];
      return responses[Math.floor(Math.random() * responses.length)];
    }
    
    // Planning and scheduling
    if (lowerPrompt.includes('plan') || lowerPrompt.includes('schedule') || lowerPrompt.includes('day')) {
      const responses = [
        'Start each day by listing your top 3 priorities and tackle them first.',
        'Time-block your calendar to allocate specific hours for different types of work.',
        'Review your task list the night before to prepare mentally for the next day.',
        'Build buffer time between meetings to avoid feeling rushed.',
        'Use the ABCDE method: A=must do, B=should do, C=nice to do, D=delegate, E=eliminate.'
      ];
      return responses[Math.floor(Math.random() * responses.length)];
    }
    
    // Task management
    if (lowerPrompt.includes('task') || lowerPrompt.includes('organize')) {
      const responses = [
        'Group similar tasks together and complete them in batches for better efficiency.',
        'Use the Getting Things Done (GTD) method: capture, clarify, organize, reflect, engage.',
        'Set clear deadlines for all tasks, even those without external deadlines.',
        'Break large projects into smaller, actionable tasks that take 15-30 minutes each.',
        'Use task categories to separate different types of work (urgent, important, routine).'
      ];
      return responses[Math.floor(Math.random() * responses.length)];
    }
    
    // Tips and advice
    if (lowerPrompt.includes('tip') || lowerPrompt.includes('advice') || lowerPrompt.includes('help')) {
      const responses = [
        'Take regular breaks to maintain focus and prevent burnout.',
        'Keep a done list alongside your to-do list to track your accomplishments.',
        'Limit your daily task list to 3-5 important items to avoid overwhelm.',
        'Use the 80/20 rule: focus on the 20% of tasks that create 80% of the results.',
        'Create templates for recurring tasks to save time and ensure consistency.'
      ];
      return responses[Math.floor(Math.random() * responses.length)];
    }
    
    // Stress and overwhelm
    if (lowerPrompt.includes('stress') || lowerPrompt.includes('overwhelm') || lowerPrompt.includes('busy')) {
      const responses = [
        'When overwhelmed, step back and ask: "What\'s the most important thing right now?"',
        'Practice saying no to non-essential commitments to protect your time.',
        'Use the "brain dump" technique: write down everything on your mind, then organize.',
        'Remember: you can\'t do everything. Focus on what truly matters.',
        'Take 5 deep breaths and tackle just one small task to build momentum.'
      ];
      return responses[Math.floor(Math.random() * responses.length)];
    }
    
    // Questions and general
    if (lowerPrompt.includes('?') || lowerPrompt.includes('how') || lowerPrompt.includes('what') || lowerPrompt.includes('why')) {
      const responses = [
        'Great question! Consider starting with the most urgent item and working from there.',
        'That depends on your specific situation, but generally, prioritizing by impact works well.',
        'Try experimenting with different approaches to see what works best for your workflow.',
        'The key is consistency - find a system that you can stick with long-term.',
        'Start small and build habits gradually rather than trying to change everything at once.'
      ];
      return responses[Math.floor(Math.random() * responses.length)];
    }
    
    // Default responses
    const defaultResponses = [
      'Keep working consistently and review your progress regularly.',
      'Focus on one task at a time to maintain quality and reduce stress.',
      'Celebrate small wins to stay motivated on your productivity journey.',
      'Remember that perfect productivity isn\'t the goal - sustainable progress is.',
      'Consider what\'s working well in your current system and build upon it.'
    ];
    
    return defaultResponses[Math.floor(Math.random() * defaultResponses.length)];
  }

  // Smart categorization based on task title and description
  suggestCategory(title, description) {
    const keywords = {
      work: ['meeting', 'project', 'deadline', 'client', 'report', 'presentation', 'email', 'call', 'review'],
      personal: ['exercise', 'workout', 'doctor', 'family', 'vacation', 'hobby', 'read', 'clean'],
      shopping: ['buy', 'purchase', 'grocery', 'store', 'order', 'amazon', 'shopping'],
      health: ['doctor', 'appointment', 'medicine', 'exercise', 'diet', 'checkup', 'hospital'],
      education: ['study', 'learn', 'course', 'book', 'research', 'homework', 'exam', 'lecture'],
      finance: ['pay', 'bill', 'bank', 'invest', 'budget', 'tax', 'insurance', 'loan']
    };

    const text = `${title} ${description}`.toLowerCase();
    let maxScore = 0;
    let suggestedCategory = 'other';

    for (const [category, categoryKeywords] of Object.entries(keywords)) {
      const score = categoryKeywords.reduce((acc, keyword) => {
        return acc + (text.includes(keyword) ? 1 : 0);
      }, 0);

      if (score > maxScore) {
        maxScore = score;
        suggestedCategory = category;
      }
    }

    return {
      category: suggestedCategory,
      confidence: maxScore > 0 ? Math.min(maxScore * 20, 100) : 10
    };
  }

  // Smart priority suggestion based on keywords and urgency indicators
  suggestPriority(title, description, dueDate) {
    const urgentKeywords = ['urgent', 'asap', 'emergency', 'critical', 'important', 'deadline'];
    const highKeywords = ['meeting', 'client', 'presentation', 'interview', 'appointment'];
    const lowKeywords = ['maybe', 'when free', 'someday', 'optional', 'nice to have'];

    const text = `${title} ${description}`.toLowerCase();
    
    // Check for urgent keywords
    if (urgentKeywords.some(keyword => text.includes(keyword))) {
      return { priority: 'urgent', confidence: 90 };
    }

    // Check due date urgency
    if (dueDate) {
      const daysUntilDue = Math.ceil((new Date(dueDate) - new Date()) / (1000 * 60 * 60 * 24));
      if (daysUntilDue <= 1) {
        return { priority: 'urgent', confidence: 85 };
      } else if (daysUntilDue <= 3) {
        return { priority: 'high', confidence: 80 };
      } else if (daysUntilDue <= 7) {
        return { priority: 'medium', confidence: 70 };
      }
    }

    // Check for high priority keywords
    if (highKeywords.some(keyword => text.includes(keyword))) {
      return { priority: 'high', confidence: 75 };
    }

    // Check for low priority keywords
    if (lowKeywords.some(keyword => text.includes(keyword))) {
      return { priority: 'low', confidence: 80 };
    }

    return { priority: 'medium', confidence: 60 };
  }

  // Estimate time required for task completion
  estimateTimeRequired(title, description) {
    const timeKeywords = {
      'quick': 0.25,
      'fast': 0.5,
      'brief': 0.5,
      'short': 0.5,
      'meeting': 1,
      'call': 0.5,
      'email': 0.25,
      'review': 1,
      'read': 1,
      'write': 2,
      'research': 3,
      'project': 8,
      'develop': 6,
      'design': 4,
      'plan': 2
    };

    const text = `${title} ${description}`.toLowerCase();
    let estimatedHours = 1; // default

    for (const [keyword, hours] of Object.entries(timeKeywords)) {
      if (text.includes(keyword)) {
        estimatedHours = Math.max(estimatedHours, hours);
      }
    }

    // Adjust based on description length
    const wordCount = description.split(' ').length;
    if (wordCount > 50) {
      estimatedHours *= 1.5;
    } else if (wordCount < 10) {
      estimatedHours *= 0.7;
    }

    return Math.round(estimatedHours * 4) / 4; // Round to nearest 0.25
  }

  // Generate subtasks based on main task
  generateSubtasks(title, description, category) {
    const subtaskTemplates = {
      work: [
        'Research and gather information',
        'Create initial draft/outline',
        'Review and refine',
        'Get feedback from stakeholders',
        'Finalize and submit'
      ],
      project: [
        'Define project scope',
        'Break down into phases',
        'Assign responsibilities',
        'Execute main tasks',
        'Testing and quality check',
        'Final review and delivery'
      ],
      meeting: [
        'Prepare agenda',
        'Send meeting invites',
        'Gather necessary materials',
        'Conduct meeting',
        'Send follow-up notes'
      ],
      shopping: [
        'Make shopping list',
        'Check for deals/coupons',
        'Visit store or order online',
        'Compare prices',
        'Complete purchase'
      ]
    };

    const text = `${title} ${description}`.toLowerCase();
    
    // Detect task type
    let taskType = category;
    if (text.includes('project')) taskType = 'project';
    else if (text.includes('meeting')) taskType = 'meeting';
    else if (text.includes('buy') || text.includes('purchase')) taskType = 'shopping';

    const templates = subtaskTemplates[taskType] || subtaskTemplates[category] || [
      'Plan and prepare',
      'Execute main task',
      'Review and finalize'
    ];

    return templates.map(template => ({
      title: template,
      completed: false,
      progress: 0,
      estimatedHours: this.estimateTimeRequired(template, '') / templates.length
    }));
  }

  // Smart task recommendations based on user patterns
  generateTaskRecommendations(userTasks, currentDay, currentTime) {
    const dayOfWeek = new Date().toLocaleDateString('en-US', { weekday: 'long' });
    const hour = new Date().getHours();
    
    const recommendations = [];

    // Morning recommendations
    if (hour >= 6 && hour <= 10) {
      recommendations.push({
        title: 'Daily Planning Session',
        description: 'Review today\'s priorities and plan your schedule',
        category: 'personal',
        priority: 'medium',
        estimatedHours: 0.25,
        reason: 'Morning planning helps set a productive tone for the day'
      });
    }

    // Afternoon recommendations
    if (hour >= 14 && hour <= 16) {
      recommendations.push({
        title: 'Take a Break',
        description: 'Step away from work for 15 minutes to recharge',
        category: 'personal',
        priority: 'low',
        estimatedHours: 0.25,
        reason: 'Afternoon breaks improve focus and productivity'
      });
    }

    // Weekend recommendations
    if (dayOfWeek === 'Saturday' || dayOfWeek === 'Sunday') {
      recommendations.push({
        title: 'Weekly Review',
        description: 'Review completed tasks and plan for next week',
        category: 'personal',
        priority: 'medium',
        estimatedHours: 0.5,
        reason: 'Weekly reviews help maintain long-term productivity'
      });
    }

    // Based on overdue tasks
    const overdueTasks = userTasks.filter(task => task.isOverdue && task.status !== 'completed');
    if (overdueTasks.length > 0) {
      recommendations.push({
        title: 'Address Overdue Tasks',
        description: `You have ${overdueTasks.length} overdue task(s) that need attention`,
        category: 'work',
        priority: 'urgent',
        estimatedHours: 1,
        reason: 'Clearing overdue tasks reduces stress and improves workflow'
      });
    }

    return recommendations.slice(0, 3); // Return top 3 recommendations
  }

  // Productivity insights based on task patterns
  generateProductivityInsights(userTasks, timeRange = 'week') {
    const insights = [];
    
    // Calculate completion rates by time of day
    const timeSlots = {
      morning: { completed: 0, total: 0 },
      afternoon: { completed: 0, total: 0 },
      evening: { completed: 0, total: 0 }
    };

    userTasks.forEach(task => {
      if (task.completedAt) {
        const hour = new Date(task.completedAt).getHours();
        let slot = 'morning';
        if (hour >= 12 && hour < 18) slot = 'afternoon';
        else if (hour >= 18) slot = 'evening';
        
        timeSlots[slot].completed++;
      }
    });

    // Find most productive time
    let mostProductiveTime = 'morning';
    let maxCompletions = timeSlots.morning.completed;
    
    Object.entries(timeSlots).forEach(([time, data]) => {
      if (data.completed > maxCompletions) {
        maxCompletions = data.completed;
        mostProductiveTime = time;
      }
    });

    if (maxCompletions > 0) {
      insights.push({
        type: 'productivity',
        message: `You're most productive in the ${mostProductiveTime}`,
        suggestion: `Consider scheduling important tasks during ${mostProductiveTime} hours`,
        data: timeSlots
      });
    }

    // Task completion streak
    const completedTasks = userTasks.filter(task => task.status === 'completed');
    const recentCompletions = completedTasks.filter(task => 
      new Date(task.completedAt) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
    );

    if (recentCompletions.length >= 5) {
      insights.push({
        type: 'streak',
        message: `Great job! You've completed ${recentCompletions.length} tasks this week`,
        suggestion: 'Keep up the momentum!',
        data: { weeklyCompletions: recentCompletions.length }
      });
    }

    return insights;
  }
}

module.exports = new AIService();
