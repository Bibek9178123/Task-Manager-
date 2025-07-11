import React, { useState } from 'react';
import {
  Card,
  CardContent,
  CardActions,
  Typography,
  Chip,
  IconButton,
  Box,
  Button,
  LinearProgress,
  Tooltip,
  Menu,
  MenuItem,
  styled,
  keyframes,
} from '@mui/material';
import {
  MoreVert,
  Edit,
  Delete,
  PlayArrow,
  Stop,
  CheckCircle,
  Schedule,
  Warning,
  Flag,
  CalendarToday,
  Person,
  TrendingUp,
  Timer,
  Speed,
} from '@mui/icons-material';
import { format } from 'date-fns';
import ProgressBar from '../progress/ProgressBar';
import ProgressUpdateModal from '../progress/ProgressUpdateModal';
import { 
  updateTaskProgress, 
  updateSubtaskProgress, 
  startTimeTracking, 
  stopTimeTracking 
} from '../../services/progressService';
import { toast } from 'react-toastify';

// Animations
const slideUp = keyframes`
  from { transform: translateY(20px); opacity: 0; }
  to { transform: translateY(0); opacity: 1; }
`;

const pulse = keyframes`
  0% { transform: scale(1); }
  50% { transform: scale(1.05); }
  100% { transform: scale(1); }
`;

// Styled Components
const AnimatedCard = styled(Card)(({ theme, priority }) => ({
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  animation: `${slideUp} 0.6s ease-out`,
  borderLeft: `4px solid ${
    priority === 'urgent' ? theme.palette.error.main :
    priority === 'high' ? theme.palette.warning.main :
    priority === 'medium' ? theme.palette.info.main :
    theme.palette.success.main
  }`,
  '&:hover': {
    transform: 'translateY(-4px)',
    boxShadow: theme.shadows[8],
    '& .progress-section': {
      backgroundColor: theme.palette.action.hover,
    },
  },
}));

const PriorityChip = styled(Chip)(({ priority, theme }) => ({
  fontWeight: 'bold',
  animation: priority === 'urgent' ? `${pulse} 2s infinite` : 'none',
  backgroundColor: 
    priority === 'urgent' ? theme.palette.error.main :
    priority === 'high' ? theme.palette.warning.main :
    priority === 'medium' ? theme.palette.info.main :
    theme.palette.success.main,
  color: 'white',
}));

const ProgressSection = styled(Box)(({ theme }) => ({
  padding: theme.spacing(1),
  borderRadius: theme.spacing(1),
  backgroundColor: theme.palette.grey[50],
  margin: theme.spacing(1, 0),
  transition: 'background-color 0.3s ease',
}));

const TaskCard = ({ 
  task, 
  onEdit, 
  onDelete, 
  onStatusChange,
  onProgressUpdate: onExternalProgressUpdate 
}) => {
  const [anchorEl, setAnchorEl] = useState(null);
  const [progressModalOpen, setProgressModalOpen] = useState(false);
  const [isTracking, setIsTracking] = useState(task.timeTracking?.started || false);

  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleProgressUpdate = async (taskId, progress, subtaskId = null) => {
    try {
      if (subtaskId) {
        await updateSubtaskProgress(taskId, subtaskId, progress);
      } else {
        await updateTaskProgress(taskId, progress);
      }
      
      // Call external update handler to refresh task data
      if (onExternalProgressUpdate) {
        onExternalProgressUpdate();
      }
      
      toast.success('Progress updated successfully!');
    } catch (error) {
      toast.error('Failed to update progress');
    }
  };

  const handleTimeToggle = async (taskId, action) => {
    try {
      if (action === 'start') {
        await startTimeTracking(taskId);
        setIsTracking(true);
        toast.success('Time tracking started');
      } else {
        await stopTimeTracking(taskId);
        setIsTracking(false);
        toast.success('Time tracking stopped');
      }
      
      // Refresh task data
      if (onExternalProgressUpdate) {
        onExternalProgressUpdate();
      }
    } catch (error) {
      toast.error(`Failed to ${action} time tracking`);
    }
  };

  const getPriorityIcon = (priority) => {
    switch (priority) {
      case 'urgent':
        return <Flag />;
      case 'high':
        return <Warning />;
      default:
        return null;
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed':
        return <CheckCircle color="success" />;
      case 'in-progress':
        return <Schedule color="warning" />;
      default:
        return <Schedule color="disabled" />;
    }
  };

  const formatTime = (hours) => {
    if (hours < 1) return `${Math.round(hours * 60)}m`;
    return `${hours.toFixed(1)}h`;
  };

  const progress = task.completionPercentage || 0;

  return (
    <>
      <AnimatedCard priority={task.priority}>
        <CardContent sx={{ flexGrow: 1, pb: 1 }}>
          {/* Header */}
          <Box display="flex" alignItems="flex-start" justifyContent="space-between" mb={2}>
            <Box flex={1}>
              <Typography variant="h6" fontWeight="bold" gutterBottom>
                {task.title}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                {task.description}
              </Typography>
            </Box>
            
            <Box display="flex" alignItems="center" gap={1}>
              <PriorityChip
                priority={task.priority}
                label={task.priority}
                size="small"
                icon={getPriorityIcon(task.priority)}
              />
              <IconButton size="small" onClick={handleMenuOpen}>
                <MoreVert />
              </IconButton>
            </Box>
          </Box>

          {/* Progress Section */}
          <ProgressSection className="progress-section">
            <Box display="flex" alignItems="center" justifyContent="space-between" mb={1}>
              <Box display="flex" alignItems="center" gap={1}>
                {getStatusIcon(task.status)}
                <Typography variant="body2" fontWeight="bold">
                  Progress: {progress}%
                </Typography>
              </Box>
              
              <Button
                size="small"
                startIcon={<TrendingUp />}
                onClick={() => setProgressModalOpen(true)}
                sx={{ fontSize: '0.75rem' }}
              >
                Update
              </Button>
            </Box>

            <LinearProgress
              variant="determinate"
              value={progress}
              color={
                progress >= 100 ? 'success' :
                progress >= 75 ? 'info' :
                progress >= 50 ? 'warning' : 'error'
              }
              sx={{
                height: 8,
                borderRadius: 4,
                mb: 1,
              }}
            />

            {/* Subtasks Progress */}
            {task.subtasks && task.subtasks.length > 0 && (
              <Box>
                <Typography variant="caption" color="text.secondary">
                  Subtasks: {task.subtasks.filter(st => st.completed).length}/{task.subtasks.length} completed
                </Typography>
                <Box display="flex" flexWrap="wrap" gap={0.5} mt={0.5}>
                  {task.subtasks.slice(0, 3).map((subtask, index) => (
                    <Chip
                      key={index}
                      label={subtask.title}
                      size="small"
                      variant={subtask.completed ? "filled" : "outlined"}
                      color={subtask.completed ? "success" : "default"}
                      sx={{ fontSize: '0.7rem', height: 20 }}
                    />
                  ))}
                  {task.subtasks.length > 3 && (
                    <Chip
                      label={`+${task.subtasks.length - 3}`}
                      size="small"
                      variant="outlined"
                      sx={{ fontSize: '0.7rem', height: 20 }}
                    />
                  )}
                </Box>
              </Box>
            )}
          </ProgressSection>

          {/* Time Tracking */}
          <Box display="flex" alignItems="center" justifyContent="space-between" mb={1}>
            <Box display="flex" alignItems="center" gap={1}>
              <Timer fontSize="small" color="primary" />
              <Typography variant="caption" color="text.secondary">
                {task.actualHours > 0 ? formatTime(task.actualHours) : 'No time logged'}
              </Typography>
              {task.efficiency && (
                <Chip
                  label={`${task.efficiency}% efficient`}
                  size="small"
                  color={task.efficiency > 100 ? 'success' : 'warning'}
                  icon={<Speed />}
                  sx={{ fontSize: '0.65rem', height: 18 }}
                />
              )}
            </Box>

            <Box display="flex" gap={0.5}>
              {isTracking ? (
                <Tooltip title="Stop Time Tracking">
                  <IconButton 
                    size="small" 
                    color="error"
                    onClick={() => handleTimeToggle(task._id, 'stop')}
                    sx={{ animation: `${pulse} 2s infinite` }}
                  >
                    <Stop fontSize="small" />
                  </IconButton>
                </Tooltip>
              ) : (
                <Tooltip title="Start Time Tracking">
                  <IconButton 
                    size="small" 
                    color="success"
                    onClick={() => handleTimeToggle(task._id, 'start')}
                  >
                    <PlayArrow fontSize="small" />
                  </IconButton>
                </Tooltip>
              )}
            </Box>
          </Box>

          {/* Meta Information */}
          <Box display="flex" flexWrap="wrap" gap={1} mt={2}>
            <Chip
              label={task.category}
              size="small"
              variant="outlined"
              sx={{ fontSize: '0.7rem' }}
            />
            
            {task.dueDate && (
              <Chip
                icon={<CalendarToday />}
                label={format(new Date(task.dueDate), 'MMM dd')}
                size="small"
                color={task.isOverdue ? 'error' : 'default'}
                variant={task.isOverdue ? 'filled' : 'outlined'}
                sx={{ fontSize: '0.7rem' }}
              />
            )}

            {task.assignedTo && (
              <Chip
                icon={<Person />}
                label={task.assignedTo.name}
                size="small"
                variant="outlined"
                sx={{ fontSize: '0.7rem' }}
              />
            )}
          </Box>
        </CardContent>

        <CardActions sx={{ pt: 0, px: 2, pb: 2 }}>
          <Button
            size="small"
            onClick={() => onEdit(task)}
            startIcon={<Edit />}
          >
            Edit
          </Button>
          <Button
            size="small"
            startIcon={<TrendingUp />}
            onClick={() => setProgressModalOpen(true)}
            color="primary"
          >
            Progress
          </Button>
        </CardActions>
      </AnimatedCard>

      {/* Context Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={() => { onEdit(task); handleMenuClose(); }}>
          <Edit sx={{ mr: 1 }} /> Edit Task
        </MenuItem>
        <MenuItem onClick={() => { setProgressModalOpen(true); handleMenuClose(); }}>
          <TrendingUp sx={{ mr: 1 }} /> Update Progress
        </MenuItem>
        <MenuItem onClick={() => { onDelete(task._id); handleMenuClose(); }}>
          <Delete sx={{ mr: 1 }} /> Delete Task
        </MenuItem>
      </Menu>

      {/* Progress Update Modal */}
      <ProgressUpdateModal
        open={progressModalOpen}
        onClose={() => setProgressModalOpen(false)}
        task={task}
        onProgressUpdate={handleProgressUpdate}
        onTimeToggle={handleTimeToggle}
      />
    </>
  );
};

export default TaskCard;
