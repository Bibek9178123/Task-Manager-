import React from 'react';
import {
  Box,
  LinearProgress,
  Typography,
  Chip,
  Tooltip,
  IconButton,
  styled,
  keyframes,
} from '@mui/material';
import {
  PlayArrow,
  Pause,
  Stop,
  CheckCircle,
  Schedule,
  Warning,
  Speed,
} from '@mui/icons-material';

// Animations
const pulse = keyframes`
  0% { transform: scale(1); }
  50% { transform: scale(1.05); }
  100% { transform: scale(1); }
`;

const shimmer = keyframes`
  0% { background-position: -200px 0; }
  100% { background-position: calc(200px + 100%) 0; }
`;

// Styled Components
const AnimatedLinearProgress = styled(LinearProgress)(({ theme, variant }) => ({
  height: 12,
  borderRadius: 6,
  backgroundColor: theme.palette.grey[200],
  '& .MuiLinearProgress-bar': {
    borderRadius: 6,
    background: variant === 'success' 
      ? 'linear-gradient(45deg, #4caf50 0%, #8bc34a 100%)'
      : variant === 'warning'
      ? 'linear-gradient(45deg, #ff9800 0%, #ffb74d 100%)'
      : variant === 'error'
      ? 'linear-gradient(45deg, #f44336 0%, #e57373 100%)'
      : 'linear-gradient(45deg, #2196f3 0%, #64b5f6 100%)',
    position: 'relative',
    overflow: 'hidden',
    '&::after': {
      content: '""',
      position: 'absolute',
      top: 0,
      left: 0,
      bottom: 0,
      right: 0,
      background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent)',
      animation: `${shimmer} 2s infinite`,
    },
  },
}));

const ProgressContainer = styled(Box)(({ theme }) => ({
  padding: theme.spacing(2),
  borderRadius: theme.spacing(1),
  backgroundColor: theme.palette.background.paper,
  boxShadow: theme.shadows[1],
  transition: 'all 0.3s ease',
  '&:hover': {
    boxShadow: theme.shadows[3],
    transform: 'translateY(-2px)',
  },
}));

const StatusChip = styled(Chip)(({ status, theme }) => ({
  fontWeight: 'bold',
  animation: status === 'in-progress' ? `${pulse} 2s infinite` : 'none',
  backgroundColor: 
    status === 'completed' ? theme.palette.success.main :
    status === 'in-progress' ? theme.palette.warning.main :
    theme.palette.grey[400],
  color: 'white',
}));

const ProgressBar = ({ 
  task, 
  showDetails = true, 
  showControls = true, 
  onProgressUpdate, 
  onTimeToggle 
}) => {
  const getProgressVariant = (progress) => {
    if (progress >= 100) return 'success';
    if (progress >= 75) return 'info';
    if (progress >= 50) return 'warning';
    return 'error';
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed':
        return <CheckCircle color="success" />;
      case 'in-progress':
        return <Schedule color="warning" />;
      default:
        return <Warning color="disabled" />;
    }
  };

  const formatTime = (hours) => {
    if (hours < 1) return `${Math.round(hours * 60)}m`;
    return `${hours.toFixed(1)}h`;
  };

  const getEfficiencyColor = (efficiency) => {
    if (efficiency > 100) return 'success';
    if (efficiency > 80) return 'info';
    if (efficiency > 60) return 'warning';
    return 'error';
  };

  const progress = task.completionPercentage || 0;
  const variant = getProgressVariant(progress);

  return (
    <ProgressContainer>
      {/* Header */}
      <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
        <Box display="flex" alignItems="center" gap={1}>
          {getStatusIcon(task.status)}
          <Typography variant="h6" fontWeight="bold">
            {task.title}
          </Typography>
        </Box>
        
        <Box display="flex" alignItems="center" gap={1}>
          <StatusChip 
            status={task.status}
            label={task.status.replace('-', ' ')}
            size="small"
          />
          <Typography variant="h6" fontWeight="bold" color={`${variant}.main`}>
            {progress}%
          </Typography>
        </Box>
      </Box>

      {/* Progress Bar */}
      <Box mb={2}>
        <AnimatedLinearProgress
          variant="determinate"
          value={progress}
          variant={variant}
        />
      </Box>

      {/* Progress Details */}
      {showDetails && (
        <Box>
          {/* Subtasks Progress */}
          {task.subtasks && task.subtasks.length > 0 && (
            <Box mb={2}>
              <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                Subtasks ({task.subtasks.filter(st => st.completed).length}/{task.subtasks.length})
              </Typography>
              <Box display="flex" flexWrap="wrap" gap={1}>
                {task.subtasks.map((subtask, index) => (
                  <Tooltip key={index} title={`${subtask.title} - ${subtask.progress || 0}%`}>
                    <Chip
                      label={subtask.title}
                      size="small"
                      variant={subtask.completed ? "filled" : "outlined"}
                      color={subtask.completed ? "success" : "default"}
                      sx={{ fontSize: '0.75rem' }}
                    />
                  </Tooltip>
                ))}
              </Box>
            </Box>
          )}

          {/* Time Tracking */}
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Box display="flex" gap={2}>
              {task.estimatedHours > 0 && (
                <Typography variant="body2" color="text.secondary">
                  <strong>Est:</strong> {formatTime(task.estimatedHours)}
                </Typography>
              )}
              
              {task.actualHours > 0 && (
                <Typography variant="body2" color="text.secondary">
                  <strong>Actual:</strong> {formatTime(task.actualHours)}
                </Typography>
              )}
              
              {task.efficiency && (
                <Chip
                  label={`${task.efficiency}% efficient`}
                  size="small"
                  color={getEfficiencyColor(task.efficiency)}
                  icon={<Speed />}
                />
              )}
            </Box>

            {/* Time Tracking Controls */}
            {showControls && (
              <Box display="flex" gap={1}>
                {task.timeTracking?.started ? (
                  <Tooltip title="Stop Time Tracking">
                    <IconButton
                      size="small"
                      color="error"
                      onClick={() => onTimeToggle?.(task._id, 'stop')}
                    >
                      <Stop />
                    </IconButton>
                  </Tooltip>
                ) : (
                  <Tooltip title="Start Time Tracking">
                    <IconButton
                      size="small"
                      color="success"
                      onClick={() => onTimeToggle?.(task._id, 'start')}
                    >
                      <PlayArrow />
                    </IconButton>
                  </Tooltip>
                )}
                
                {task.isOverdue && (
                  <Chip
                    label="Overdue"
                    size="small"
                    color="error"
                    variant="outlined"
                    sx={{ animation: `${pulse} 1s infinite` }}
                  />
                )}
              </Box>
            )}
          </Box>
        </Box>
      )}
    </ProgressContainer>
  );
};

export default ProgressBar;
