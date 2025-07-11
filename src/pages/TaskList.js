import React, { useState, useEffect } from 'react';
import { useTask } from '../context/TaskContext';
import { toast } from 'react-toastify';
import {
  Container,
  Typography,
  Box,
  Card,
  CardContent,
  Grid,
  Chip,
  IconButton,
  Avatar,
  LinearProgress,
  Fab,
  TextField,
  InputAdornment,
  Menu,
  MenuItem,
  Button,
  Paper,
  Tooltip,
  Stack,
} from '@mui/material';
import {
  Add as AddIcon,
  Search as SearchIcon,
  FilterList as FilterIcon,
  Sort as SortIcon,
  MoreVert as MoreIcon,
  Star as StarIcon,
  StarBorder as StarBorderIcon,
  Assignment as TaskIcon,
  TrendingUp as TrendingUpIcon,
  CheckCircle as CheckCircleIcon,
} from '@mui/icons-material';
import { styled, keyframes } from '@mui/material/styles';

// CSS Animations
const shimmer = keyframes`
  0% {
    transform: translateX(-100%);
  }
  100% {
    transform: translateX(100%);
  }
`;

const float = keyframes`
  0%, 100% {
    transform: translateY(0px);
  }
  50% {
    transform: translateY(-10px);
  }
`;

const fadeInUp = keyframes`
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`;

// Styled components with mirror effects
const GlassCard = styled(Card)(({ theme }) => ({
  background: 'rgba(255, 255, 255, 0.1)',
  backdropFilter: 'blur(10px)',
  border: '1px solid rgba(255, 255, 255, 0.2)',
  borderRadius: '16px',
  position: 'relative',
  overflow: 'hidden',
  transition: 'all 0.3s ease',
  animation: `${fadeInUp} 0.6s ease-out`,
  '&:hover': {
    transform: 'translateY(-8px) scale(1.02)',
    boxShadow: '0 25px 50px rgba(0, 0, 0, 0.15)',
  },
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: '-100%',
    width: '100%',
    height: '100%',
    background: 'linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent)',
    transition: 'left 0.5s',
  },
  '&:hover::before': {
    left: '100%',
  },
}));

const MirrorContainer = styled(Box)(({ theme }) => ({
  position: 'relative',
  '&::after': {
    content: '""',
    position: 'absolute',
    bottom: '-50%',
    left: 0,
    right: 0,
    height: '50%',
    background: 'linear-gradient(to bottom, rgba(0,0,0,0.1), transparent)',
    transform: 'scaleY(-0.5)',
    opacity: 0.3,
    pointerEvents: 'none',
    zIndex: -1,
  },
}));

const FloatingFab = styled(Fab)(({ theme }) => ({
  animation: `${float} 3s ease-in-out infinite`,
  '&:hover': {
    animation: 'none',
    transform: 'scale(1.1)',
  },
}));

const ShimmerProgress = styled(LinearProgress)(({ theme }) => ({
  '& .MuiLinearProgress-bar': {
    position: 'relative',
    '&::after': {
      content: '""',
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: `linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.6), transparent)`,
      animation: `${shimmer} 2s infinite`,
    },
  },
}));

const TaskList = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedTaskId, setSelectedTaskId] = useState(null);
  const [newTask, setNewTask] = useState({ 
    title: '', 
    description: '', 
    priority: 'low',
    category: 'general',
    dueDate: ''
  });
  const [isCreating, setIsCreating] = useState(false);

  // Use TaskContext for state management
  const {
    tasks,
    loading,
    error,
    stats,
    getTasks,
    createTask,
    updateTask,
    deleteTask,
    toggleTaskCompletion,
    getTaskStats,
    clearError
  } = useTask();

  // Load tasks on component mount
  useEffect(() => {
    const loadTasks = async () => {
      try {
        await getTasks();
        await getTaskStats();
      } catch (error) {
        console.error('Error loading tasks:', error);
      }
    };
    loadTasks();
  }, []);

  // Clear error when component unmounts
  useEffect(() => {
    return () => clearError();
  }, []);

  // Sample fallback data for development (will be replaced by backend data)
  const fallbackTasks = [
    {
      id: 1,
      title: 'Complete Project Proposal',
      description: 'Finalize the project proposal document for client review',
      status: 'in-progress',
      priority: 'high',
      dueDate: 'Jul 12, 2025',
      category: 'work',
      progress: 75,
      starred: true,
      assignee: 'John Doe',
      tags: ['urgent', 'client'],
    },
    {
      id: 2,
      title: 'Team Meeting Preparation',
      description: 'Prepare agenda and materials for weekly team meeting',
      status: 'todo',
      priority: 'medium',
      dueDate: 'Jul 11, 2025',
      category: 'work',
      progress: 0,
      starred: false,
      assignee: 'Jane Smith',
      tags: ['meeting', 'preparation'],
    },
    {
      id: 3,
      title: 'Code Review - Authentication Module',
      description: 'Review and test the new authentication system implementation',
      status: 'completed',
      priority: 'high',
      dueDate: 'Jul 10, 2025',
      category: 'work',
      progress: 100,
      starred: true,
      assignee: 'Mike Johnson',
      tags: ['code-review', 'security'],
    },
    {
      id: 4,
      title: 'Grocery Shopping',
      description: 'Buy groceries for the week including organic vegetables',
      status: 'todo',
      priority: 'low',
      dueDate: 'Jul 13, 2025',
      category: 'personal',
      progress: 0,
      starred: false,
      assignee: 'You',
      tags: ['shopping', 'weekly'],
    },
    {
      id: 5,
      title: 'Database Optimization',
      description: 'Optimize database queries and improve performance metrics',
      status: 'in-progress',
      priority: 'urgent',
      dueDate: 'Jul 14, 2025',
      category: 'work',
      progress: 40,
      starred: true,
      assignee: 'Sarah Wilson',
      tags: ['optimization', 'performance'],
    },
    {
      id: 6,
      title: 'UI/UX Design Review',
      description: 'Review the new design mockups and provide feedback',
      status: 'in-progress',
      priority: 'medium',
      dueDate: 'Jul 15, 2025',
      category: 'design',
      progress: 60,
      starred: false,
      assignee: 'Alex Chen',
      tags: ['design', 'review'],
    },
  ];

  // Use backend tasks if available, otherwise use fallback
  const currentTasks = tasks.length > 0 ? tasks : fallbackTasks;

  const filteredTasks = currentTasks.filter(task => 
    task.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleTaskCreation = async () => {
    if (newTask.title.trim() === '') {
      toast.error('Task title is required');
      return;
    }
    
    setIsCreating(true);
    try {
      const taskData = {
        title: newTask.title,
        description: newTask.description,
        priority: newTask.priority,
        category: newTask.category,
        dueDate: newTask.dueDate || new Date().toISOString().split('T')[0],
        status: 'todo',
      };
      
      await createTask(taskData);
      toast.success('Task created successfully!');
      
      // Reset form
      setNewTask({ 
        title: '', 
        description: '', 
        priority: 'low',
        category: 'general',
        dueDate: ''
      });
      
      // Refresh stats
      await getTaskStats();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to create task');
    } finally {
      setIsCreating(false);
    }
  };

  const handleTaskToggle = async (taskId) => {
    try {
      await toggleTaskCompletion(taskId);
      toast.success('Task status updated!');
      await getTaskStats();
    } catch (error) {
      toast.error('Failed to update task status');
    }
  };

  const handleStarToggle = async (task) => {
    try {
      await updateTask(task._id || task.id, { starred: !task.starred });
      toast.success('Task updated!');
    } catch (error) {
      toast.error('Failed to update task');
    }
  };

  const handleMenuClick = (event, taskId) => {
    setAnchorEl(event.currentTarget);
    setSelectedTaskId(taskId);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedTaskId(null);
  };

  const handleTaskDelete = async () => {
    try {
      await deleteTask(selectedTaskId);
      toast.success('Task deleted successfully!');
      await getTaskStats();
    } catch (error) {
      toast.error('Failed to delete task');
    }
    handleMenuClose();
  };

  // Calculate stats from current tasks
  const taskStats = stats || {
    total: currentTasks.length,
    completed: currentTasks.filter(t => t.status === 'completed').length,
    inProgress: currentTasks.filter(t => t.status === 'in-progress').length,
    highPriority: currentTasks.filter(t => t.priority === 'high' || t.priority === 'urgent').length,
  };

  return (
    <Container maxWidth="lg">
      <MirrorContainer sx={{ mb: 4 }}>
        <Typography 
          variant="h3" 
          component="h1" 
          gutterBottom 
          fontWeight="bold" 
          align="center"
          sx={{
            background: 'linear-gradient(45deg, #2196F3, #21CBF3)',
            backgroundClip: 'text',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}
        >
          ✨ Dynamic Task  ✨
        </Typography>
        <Typography variant="h6" color="text.secondary" align="center">
          
        </Typography>
      </MirrorContainer>
      
      {/* Statistics Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {[
          { label: 'Total Tasks', value: taskStats.total, color: 'primary', icon: '📋' },
          { label: 'Completed', value: taskStats.completed, color: 'success', icon: '✅' },
          { label: 'In Progress', value: taskStats.inProgress, color: 'info', icon: '🔄' },
          { label: 'High Priority', value: taskStats.highPriority, color: 'error', icon: '⚡' },
        ].map((stat, index) => (
          <Grid item xs={12} sm={6} md={3} key={stat.label}>
            <GlassCard sx={{ animationDelay: `${index * 0.1}s` }}>
              <CardContent>
                <Box display="flex" alignItems="center" justifyContent="space-between">
                  <Box>
                    <Typography variant="h4" fontWeight="bold" color={`${stat.color}.main`}>
                      {stat.value}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {stat.label}
                    </Typography>
                  </Box>
                  <Typography sx={{ fontSize: 32 }}>
                    {stat.icon}
                  </Typography>
                </Box>
              </CardContent>
            </GlassCard>
          </Grid>
        ))}
      </Grid>
      
      <Paper
        sx={{
          p: 2,
          mb: 3,
          background: 'rgba(255, 255, 255, 0.9)',
          backdropFilter: 'blur(10px)',
          borderRadius: 2,
        }}
      >
        <Stack direction="row" spacing={2} alignItems="center">
          <TextField
            fullWidth
            placeholder="Search tasks..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
          />
          <Button variant="outlined" startIcon={<FilterIcon />}>Filter</Button>
          <Button variant="outlined" startIcon={<SortIcon />}>Sort</Button>
        </Stack>
      </Paper>
      
      <Box sx={{ mb: 3 }}>
        <Paper
          sx={{ p: 2, mb: 3, background: 'rgba(255, 255, 255, 0.9)', backdropFilter: 'blur(10px)', borderRadius: 2 }}
        >
          <Stack spacing={2} direction="row" alignItems="end" flexWrap="wrap">
            <TextField 
              label="Title" 
              value={newTask.title} 
              onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
              sx={{ minWidth: 200 }}
              required
            />
            <TextField 
              label="Description" 
              value={newTask.description} 
              onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
              sx={{ minWidth: 200 }}
            />
            <TextField 
              select
              label="Priority" 
              value={newTask.priority} 
              onChange={(e) => setNewTask({ ...newTask, priority: e.target.value })}
              sx={{ minWidth: 120 }}
            >
              <MenuItem value="low">Low</MenuItem>
              <MenuItem value="medium">Medium</MenuItem>
              <MenuItem value="high">High</MenuItem>
              <MenuItem value="urgent">Urgent</MenuItem>
            </TextField>
            <TextField 
              select
              label="Category" 
              value={newTask.category} 
              onChange={(e) => setNewTask({ ...newTask, category: e.target.value })}
              sx={{ minWidth: 120 }}
            >
              <MenuItem value="general">General</MenuItem>
              <MenuItem value="work">Work</MenuItem>
              <MenuItem value="personal">Personal</MenuItem>
              <MenuItem value="design">Design</MenuItem>
            </TextField>
            <Button 
              variant="contained" 
              onClick={handleTaskCreation} 
              startIcon={<AddIcon />}
              disabled={isCreating || loading}
              sx={{ minWidth: 140 }}
            >
              {isCreating ? 'Creating...' : 'Create Task'}
            </Button>
          </Stack>
        </Paper>
      </Box>

      <Grid container spacing={3}>
        {filteredTasks.map((task) => (
          <Grid item xs={12} md={6} lg={4} key={task.id}>
            <GlassCard>
              <CardContent>
                <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
                  <Box display="flex" alignItems="center" gap={1}>
                    {task.status === 'completed' ? <CheckCircleIcon color="success" /> : <TrendingUpIcon color="primary" />}
                    <IconButton size="small" onClick={() => handleStarToggle(task)}>
                      {task.starred ? <StarIcon color="warning" /> : <StarBorderIcon />}
                    </IconButton>
                  </Box>
                  <IconButton size="small" onClick={(e) => handleMenuClick(e, task._id || task.id)}>
                    <MoreIcon />
                  </IconButton>
                </Box>

                <Typography variant="h6" fontWeight="bold" gutterBottom>
                  {task.title}
                </Typography>
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{
                    mb: 2,
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical',
                  }}
                >
                  {task.description}
                </Typography>

                <Box mb={2}>
                  <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                    <Typography variant="caption" color="text.secondary">
                      Progress
                    </Typography>
                    <Typography variant="caption" fontWeight="bold">
                      {task.progress || 0}%
                    </Typography>
                  </Box>
                  <ShimmerProgress
                    variant="determinate"
                    value={task.progress || 0}
                    sx={{ 
                      height: 6, 
                      borderRadius: 3,
                      '& .MuiLinearProgress-bar': {
                        backgroundColor: '#4caf50'
                      }
                    }}
                  />
                </Box>

                <Stack direction="row" spacing={1} mb={2} flexWrap="wrap">
                  <Chip label={task.priority || 'low'} size="small" color={(task.priority === 'high' || task.priority === 'urgent') ? 'error' : 'default'} variant="outlined" />
                  <Chip label={task.category || 'general'} size="small" variant="outlined" />
                  {(task.tags || []).map((tag) => (
                    <Chip
                      key={tag}
                      label={tag}
                      size="small"
                      variant="filled"
                      sx={{
                        fontSize: '0.7rem',
                        height: 20,
                        backgroundColor: 'rgba(25, 118, 210, 0.1)',
                        color: 'primary.main',
                      }}
                    />
                  ))}
                </Stack>
                <Tooltip title={task.assignee || 'Unassigned'}>
                  <Avatar sx={{ width: 24, height: 24, fontSize: '0.7rem' }}>
                    {task.assignee ? task.assignee.charAt(0) : 'U'}
                  </Avatar>
                </Tooltip>
              </CardContent>
            </GlassCard>
          </Grid>
        ))}
      </Grid>

      {/* Task Actions Menu */}
      <Menu 
        anchorEl={anchorEl} 
        open={Boolean(anchorEl)} 
        onClose={handleMenuClose}
        anchorOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
      >
        <MenuItem onClick={() => handleTaskToggle(selectedTaskId)}>
          {currentTasks.find(t => (t._id || t.id) === selectedTaskId)?.status === 'completed' ? 'Mark Incomplete' : 'Mark Complete'}
        </MenuItem>
        <MenuItem onClick={handleTaskDelete} sx={{ color: 'error.main' }}>
          Delete
        </MenuItem>
      </Menu>

      {/* Loading State */}
      {loading && (
        <Box display="flex" justifyContent="center" py={4}>
          <Typography variant="body1" color="text.secondary">
            Loading tasks...
          </Typography>
        </Box>
      )}

      {/* Error State */}
      {error && (
        <Box display="flex" justifyContent="center" py={4}>
          <Typography variant="body1" color="error">
            Error: {error}
          </Typography>
        </Box>
      )}

      {/* Empty State */}
      {!loading && !error && filteredTasks.length === 0 && (
        <Box display="flex" flexDirection="column" alignItems="center" py={8}>
          <Typography variant="h6" color="text.secondary" gutterBottom>
            {searchQuery ? 'No tasks match your search' : 'No tasks yet'}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {searchQuery ? 'Try adjusting your search terms' : 'Create your first task to get started!'}
          </Typography>
        </Box>
      )}

      <FloatingFab color="primary" aria-label="add task" sx={{ position: 'fixed', bottom: 16, right: 16 }}>
        <AddIcon />
      </FloatingFab>
    </Container>
  );
};

export default TaskList;
