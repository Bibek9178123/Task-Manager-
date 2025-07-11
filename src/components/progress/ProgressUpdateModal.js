import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  Slider,
  TextField,
  Grid,
  Chip,
  LinearProgress,
  IconButton,
  Divider,
  Card,
  CardContent,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Alert,
  styled,
  keyframes,
} from '@mui/material';
import {
  Close,
  PlayArrow,
  Stop,
  CheckCircle,
  Schedule,
  AccessTime,
  TrendingUp,
  Speed,
  Timer,
} from '@mui/icons-material';
import { toast } from 'react-toastify';

// Animations
const slideIn = keyframes`
  from { transform: translateX(-20px); opacity: 0; }
  to { transform: translateX(0); opacity: 1; }
`;

const StyledCard = styled(Card)(({ theme }) => ({
  margin: theme.spacing(1, 0),
  animation: `${slideIn} 0.3s ease-out`,
  '&:hover': {
    boxShadow: theme.shadows[4],
  },
}));

const ProgressUpdateModal = ({ 
  open, 
  onClose, 
  task, 
  onProgressUpdate,
  onTimeToggle 
}) => {
  const [progress, setProgress] = useState(0);
  const [estimatedHours, setEstimatedHours] = useState(0);
  const [subtaskProgress, setSubtaskProgress] = useState({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (task) {
      setProgress(task.progress || 0);
      setEstimatedHours(task.estimatedHours || 0);
      
      // Initialize subtask progress
      const subtaskProgressMap = {};
      task.subtasks?.forEach(subtask => {
        subtaskProgressMap[subtask._id] = subtask.progress || 0;
      });
      setSubtaskProgress(subtaskProgressMap);
    }
  }, [task]);

  const handleProgressChange = (event, newValue) => {
    setProgress(newValue);
  };

  const handleSubtaskProgressChange = (subtaskId, newValue) => {
    setSubtaskProgress(prev => ({
      ...prev,
      [subtaskId]: newValue
    }));
  };

  const handleSave = async () => {
    if (!task) return;

    setLoading(true);
    try {
      // Update main task progress
      await onProgressUpdate(task._id, progress);

      // Update subtask progress
      for (const [subtaskId, progressValue] of Object.entries(subtaskProgress)) {
        if (progressValue !== task.subtasks.find(st => st._id === subtaskId)?.progress) {
          await onProgressUpdate(task._id, progressValue, subtaskId);
        }
      }

      // Update time estimates
      if (estimatedHours !== task.estimatedHours) {
        // This would need to be implemented in the API
        // await updateTimeEstimates(task._id, estimatedHours);
      }

      toast.success('Progress updated successfully!');
      onClose();
    } catch (error) {
      toast.error('Failed to update progress');
    } finally {
      setLoading(false);
    }
  };

  const getProgressColor = (value) => {
    if (value >= 100) return 'success';
    if (value >= 75) return 'info';
    if (value >= 50) return 'warning';
    return 'error';
  };

  const formatTime = (hours) => {
    if (hours < 1) return `${Math.round(hours * 60)}m`;
    return `${hours.toFixed(1)}h`;
  };

  if (!task) return null;

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 2,
          minHeight: '60vh',
        }
      }}
    >
      <DialogTitle sx={{ pb: 1 }}>
        <Box display="flex" alignItems="center" justifyContent="space-between">
          <Typography variant="h5" fontWeight="bold">
            Update Progress: {task.title}
          </Typography>
          <IconButton onClick={onClose}>
            <Close />
          </IconButton>
        </Box>
      </DialogTitle>

      <DialogContent sx={{ pb: 2 }}>
        {/* Overall Progress */}
        <StyledCard>
          <CardContent>
            <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
              <Typography variant="h6" fontWeight="bold">
                Overall Progress
              </Typography>
              <Chip 
                label={`${progress}%`}
                color={getProgressColor(progress)}
                size="large"
                sx={{ fontWeight: 'bold', fontSize: '1rem' }}
              />
            </Box>

            <Box mb={2}>
              <Slider
                value={progress}
                onChange={handleProgressChange}
                aria-labelledby="progress-slider"
                valueLabelDisplay="auto"
                step={5}
                marks
                min={0}
                max={100}
                sx={{
                  color: theme => theme.palette[getProgressColor(progress)].main,
                  '& .MuiSlider-thumb': {
                    width: 24,
                    height: 24,
                  },
                  '& .MuiSlider-track': {
                    height: 8,
                  },
                  '& .MuiSlider-rail': {
                    height: 8,
                  },
                }}
              />
            </Box>

            <LinearProgress
              variant="determinate"
              value={progress}
              color={getProgressColor(progress)}
              sx={{
                height: 10,
                borderRadius: 5,
                mb: 2,
              }}
            />

            <Grid container spacing={2}>
              <Grid item xs={6}>
                <TextField
                  label="Estimated Hours"
                  type="number"
                  value={estimatedHours}
                  onChange={(e) => setEstimatedHours(parseFloat(e.target.value) || 0)}
                  InputProps={{
                    startAdornment: <AccessTime sx={{ mr: 1, color: 'text.secondary' }} />,
                  }}
                  size="small"
                  fullWidth
                />
              </Grid>
              <Grid item xs={6}>
                <Box display="flex" alignItems="center" gap={1}>
                  <Timer color="primary" />
                  <Typography variant="body2" color="text.secondary">
                    Actual: {formatTime(task.actualHours || 0)}
                  </Typography>
                  {task.efficiency && (
                    <Chip
                      label={`${task.efficiency}% efficient`}
                      size="small"
                      color={task.efficiency > 100 ? 'success' : 'warning'}
                      icon={<Speed />}
                    />
                  )}
                </Box>
              </Grid>
            </Grid>
          </CardContent>
        </StyledCard>

        {/* Subtasks Progress */}
        {task.subtasks && task.subtasks.length > 0 && (
          <StyledCard>
            <CardContent>
              <Typography variant="h6" fontWeight="bold" mb={2}>
                Subtasks Progress
              </Typography>
              <List>
                {task.subtasks.map((subtask, index) => (
                  <ListItem key={subtask._id} divider={index < task.subtasks.length - 1}>
                    <ListItemText
                      primary={subtask.title}
                      secondary={
                        <Box>
                          <Box display="flex" alignItems="center" gap={1} mb={1}>
                            <Typography variant="body2" color="text.secondary">
                              Progress: {subtaskProgress[subtask._id] || 0}%
                            </Typography>
                            {subtask.completed && (
                              <CheckCircle color="success" fontSize="small" />
                            )}
                          </Box>
                          <Slider
                            value={subtaskProgress[subtask._id] || 0}
                            onChange={(e, newValue) => 
                              handleSubtaskProgressChange(subtask._id, newValue)
                            }
                            size="small"
                            step={10}
                            marks
                            min={0}
                            max={100}
                            sx={{ maxWidth: 200 }}
                          />
                        </Box>
                      }
                    />
                    <ListItemSecondaryAction>
                      <LinearProgress
                        variant="determinate"
                        value={subtaskProgress[subtask._id] || 0}
                        color={getProgressColor(subtaskProgress[subtask._id] || 0)}
                        sx={{
                          width: 100,
                          height: 6,
                          borderRadius: 3,
                        }}
                      />
                    </ListItemSecondaryAction>
                  </ListItem>
                ))}
              </List>
            </CardContent>
          </StyledCard>
        )}

        {/* Time Tracking */}
        <StyledCard>
          <CardContent>
            <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
              <Typography variant="h6" fontWeight="bold">
                Time Tracking
              </Typography>
              <Box display="flex" gap={1}>
                {task.timeTracking?.started ? (
                  <Button
                    variant="contained"
                    color="error"
                    startIcon={<Stop />}
                    onClick={() => onTimeToggle?.(task._id, 'stop')}
                    size="small"
                  >
                    Stop Timer
                  </Button>
                ) : (
                  <Button
                    variant="contained"
                    color="success"
                    startIcon={<PlayArrow />}
                    onClick={() => onTimeToggle?.(task._id, 'start')}
                    size="small"
                  >
                    Start Timer
                  </Button>
                )}
              </Box>
            </Box>

            <Grid container spacing={2}>
              <Grid item xs={4}>
                <Box textAlign="center">
                  <Typography variant="body2" color="text.secondary">
                    Total Time
                  </Typography>
                  <Typography variant="h6" fontWeight="bold">
                    {formatTime(task.totalTimeSpent || 0)}
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={4}>
                <Box textAlign="center">
                  <Typography variant="body2" color="text.secondary">
                    Sessions
                  </Typography>
                  <Typography variant="h6" fontWeight="bold">
                    {task.timeTracking?.sessions?.length || 0}
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={4}>
                <Box textAlign="center">
                  <Typography variant="body2" color="text.secondary">
                    Status
                  </Typography>
                  <Chip
                    label={task.timeTracking?.started ? 'Running' : 'Stopped'}
                    color={task.timeTracking?.started ? 'success' : 'default'}
                    size="small"
                  />
                </Box>
              </Grid>
            </Grid>

            {task.isOverdue && (
              <Alert severity="warning" sx={{ mt: 2 }}>
                This task is overdue! Consider updating the due date or prioritizing completion.
              </Alert>
            )}
          </CardContent>
        </StyledCard>
      </DialogContent>

      <DialogActions sx={{ p: 2, pt: 0 }}>
        <Button onClick={onClose} variant="outlined">
          Cancel
        </Button>
        <Button
          onClick={handleSave}
          variant="contained"
          disabled={loading}
          startIcon={loading ? <Schedule /> : <TrendingUp />}
        >
          {loading ? 'Updating...' : 'Update Progress'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ProgressUpdateModal;
