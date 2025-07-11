import React, { useEffect, useState } from 'react';
import {
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  Box,
  CircularProgress,
  Alert,
  Button,
  Chip,
  LinearProgress,
  Avatar,
  Stack,
  Paper,
  Divider,
  IconButton,
  Tooltip,
  Badge,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  ListItemSecondaryAction,
} from '@mui/material';
import {
  Assignment,
  AssignmentTurnedIn,
  Schedule,
  Warning,
  Add,
  Visibility,
  Person,
  TrendingUp,
  CheckCircle,
  PlayArrow,
  AccessTime,
  Star,
  MoreVert,
  Notifications,
  CalendarToday,
  Timeline,
  Analytics,
  Speed,
  AutoAwesome,
  Bolt,
  WbSunny,
  NightsStay,
} from '@mui/icons-material';
import { styled, keyframes } from '@mui/material/styles';
import { useTask } from '../context/TaskContext';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

// Advanced Animations
const float = keyframes`
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-10px); }
`;

const glow = keyframes`
  0%, 100% { box-shadow: 0 0 5px rgba(25, 118, 210, 0.5); }
  50% { box-shadow: 0 0 20px rgba(25, 118, 210, 0.8), 0 0 30px rgba(25, 118, 210, 0.6); }
`;

const slideInUp = keyframes`
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`;

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
const GlassCard = styled(Card)(({ theme }) => ({
  background: 'rgba(255, 255, 255, 0.1)',
  backdropFilter: 'blur(20px)',
  border: '1px solid rgba(255, 255, 255, 0.2)',
  borderRadius: '20px',
  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  animation: `${slideInUp} 0.6s ease-out`,
  '&:hover': {
    transform: 'translateY(-8px) scale(1.02)',
    boxShadow: '0 20px 40px rgba(0,0,0,0.1)',
    backdropFilter: 'blur(30px)',
  },
}));

const GradientCard = styled(Card)(({ gradient }) => ({
  background: gradient,
  color: 'white',
  borderRadius: '20px',
  overflow: 'hidden',
  position: 'relative',
  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  animation: `${slideInUp} 0.6s ease-out`,
  '&:hover': {
    transform: 'translateY(-8px) scale(1.02)',
    animation: `${glow} 2s infinite`,
  },
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: '-100%',
    width: '100%',
    height: '100%',
    background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent)',
    transition: 'left 0.5s',
  },
  '&:hover::before': {
    left: '100%',
  },
}));

const FloatingButton = styled(Button)(({ theme }) => ({
  borderRadius: '25px',
  padding: '12px 24px',
  background: 'linear-gradient(45deg, #2196F3, #21CBF3)',
  color: 'white',
  fontWeight: 'bold',
  transition: 'all 0.3s ease',
  animation: `${float} 3s ease-in-out infinite`,
  '&:hover': {
    background: 'linear-gradient(45deg, #1976D2, #0288D1)',
    transform: 'scale(1.05)',
    animation: `${pulse} 0.6s ease-in-out`,
  },
}));

const ShimmerProgress = styled(LinearProgress)(({ theme }) => ({
  height: 8,
  borderRadius: 4,
  background: 'rgba(255,255,255,0.3)',
  '& .MuiLinearProgress-bar': {
    borderRadius: 4,
    background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.6), transparent)',
    backgroundSize: '200px 100%',
    animation: `${shimmer} 2s infinite linear`,
  },
}));

const WelcomeCard = styled(Paper)(({ theme }) => ({
  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  color: 'white',
  padding: theme.spacing(4),
  borderRadius: '24px',
  position: 'relative',
  overflow: 'hidden',
  marginBottom: theme.spacing(4),
  '&::before': {
    content: '""',
    position: 'absolute',
    top: '-50%',
    right: '-20%',
    width: '300px',
    height: '300px',
    background: 'rgba(255,255,255,0.1)',
    borderRadius: '50%',
    animation: `${float} 6s ease-in-out infinite`,
  },
}));

const Dashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { stats, loading, error, getTaskStats } = useTask();
  const [currentTime, setCurrentTime] = useState(new Date());
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    getTaskStats();
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const getTimeOfDay = () => {
    const hour = currentTime.getHours();
    if (hour < 12) return { greeting: 'Good Morning', icon: <WbSunny />, emoji: '🌅' };
    if (hour < 17) return { greeting: 'Good Afternoon', icon: <WbSunny />, emoji: '☀️' };
    return { greeting: 'Good Evening', icon: <NightsStay />, emoji: '🌙' };
  };

  const timeOfDay = getTimeOfDay();

  const statsCards = [
    {
      title: 'Total Tasks',
      value: stats?.totalTasks || 0,
      icon: <Assignment fontSize="large" />,
      gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      change: '+12%',
      trend: 'up',
    },
    {
      title: 'Completed',
      value: stats?.statusStats?.completed || 0,
      icon: <AssignmentTurnedIn fontSize="large" />,
      gradient: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
      change: '+8%',
      trend: 'up',
    },
    {
      title: 'In Progress',
      value: stats?.statusStats?.['in-progress'] || 0,
      icon: <Schedule fontSize="large" />,
      gradient: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
      change: '+5%',
      trend: 'up',
    },
    {
      title: 'Overdue',
      value: stats?.overdueCount || 0,
      icon: <Warning fontSize="large" />,
      gradient: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
      change: '-2%',
      trend: 'down',
    },
  ];

  const quickActions = [
    {
      title: 'Create Task',
      description: 'Add a new task to your list',
      icon: <Add />,
      color: 'primary',
      action: () => navigate('/tasks'),
    },
    {
      title: 'View Calendar',
      description: 'Check your schedule',
      icon: <CalendarToday />,
      color: 'secondary',
      action: () => navigate('/calendar'),
    },
    {
      title: 'Profile Settings',
      description: 'Update your profile',
      icon: <Person />,
      color: 'info',
      action: () => navigate('/profile'),
    },
    {
      title: 'All Tasks',
      description: 'View complete task list',
      icon: <Visibility />,
      color: 'success',
      action: () => navigate('/tasks'),
    },
  ];

  const recentActivities = [
    {
      action: 'Task "Complete Project Proposal" marked as completed',
      time: '2 hours ago',
      icon: <CheckCircle color="success" />,
      priority: 'high',
    },
    {
      action: 'New task "Team Meeting Preparation" created',
      time: '4 hours ago',
      icon: <Add color="primary" />,
      priority: 'medium',
    },
    {
      action: 'Task "Database Optimization" started',
      time: '6 hours ago',
      icon: <PlayArrow color="info" />,
      priority: 'urgent',
    },
    {
      action: 'Reminder set for "UI/UX Design Review"',
      time: '1 day ago',
      icon: <AccessTime color="warning" />,
      priority: 'low',
    },
  ];

  const upcomingTasks = [
    { title: 'Team Meeting', time: 'Today, 2:00 PM', priority: 'high' },
    { title: 'Code Review', time: 'Tomorrow, 10:00 AM', priority: 'medium' },
    { title: 'Project Demo', time: 'Friday, 3:00 PM', priority: 'urgent' },
  ];

  if (loading) {
    return (
      <Box display="flex" flexDirection="column" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress size={60} thickness={4} sx={{ mb: 2 }} />
        <Typography variant="h6" color="text.secondary">Loading your dashboard...</Typography>
      </Box>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ py: 3 }}>
      {/* Welcome Header */}
      <WelcomeCard elevation={0}>
        <Grid container alignItems="center" spacing={3}>
          <Grid item xs={12} md={8}>
            <Box display="flex" alignItems="center" gap={2} mb={2}>
              {timeOfDay.icon}
              <Typography variant="h3" fontWeight="bold">
                {timeOfDay.greeting}, {user?.name?.split(' ')[0] || 'User'}! {timeOfDay.emoji}
              </Typography>
            </Box>
            <Typography variant="h6" sx={{ opacity: 0.9, mb: 2 }}>
              You have {stats?.statusStats?.todo || 0} pending tasks and {stats?.statusStats?.['in-progress'] || 0} in progress.
            </Typography>
            <Typography variant="body1" sx={{ opacity: 0.8 }}>
              {currentTime.toLocaleDateString('en-US', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </Typography>
          </Grid>
          <Grid item xs={12} md={4}>
            <Box display="flex" justifyContent="center" alignItems="center">
              <Avatar
                sx={{
                  width: 120,
                  height: 120,
                  bgcolor: 'rgba(255,255,255,0.2)',
                  fontSize: '3rem',
                  animation: `${pulse} 2s infinite`,
                }}
              >
                {user?.name?.charAt(0) || 'U'}
              </Avatar>
            </Box>
          </Grid>
        </Grid>
      </WelcomeCard>

      {error && (
        <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
          {error}
        </Alert>
      )}

      {/* Enhanced Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {statsCards.map((card, index) => (
          <Grid item xs={12} sm={6} lg={3} key={index}>
            <GradientCard 
              gradient={card.gradient}
              sx={{ animationDelay: `${index * 0.1}s` }}
            >
              <CardContent sx={{ position: 'relative', zIndex: 1 }}>
                <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
                  <Box>
                    <Typography variant="h2" fontWeight="bold" sx={{ mb: 1 }}>
                      {card.value}
                    </Typography>
                    <Typography variant="h6" sx={{ opacity: 0.9 }}>
                      {card.title}
                    </Typography>
                  </Box>
                  <Box sx={{ opacity: 0.8 }}>
                    {card.icon}
                  </Box>
                </Box>
                <Box display="flex" alignItems="center" gap={1}>
                  <TrendingUp fontSize="small" />
                  <Typography variant="body2" fontWeight="bold">
                    {card.change}
                  </Typography>
                  <Typography variant="body2" sx={{ opacity: 0.8 }}>
                    vs last week
                  </Typography>
                </Box>
              </CardContent>
            </GradientCard>
          </Grid>
        ))}
      </Grid>

      {/* Productivity Score */}
      <GlassCard sx={{ mb: 4 }}>
        <CardContent>
          <Box display="flex" alignItems="center" justifyContent="between" mb={3}>
            <Typography variant="h5" fontWeight="bold" display="flex" alignItems="center" gap={1}>
              <Speed color="primary" />
              Productivity Score
            </Typography>
            <Chip 
              label="Excellent" 
              color="success" 
              icon={<AutoAwesome />}
              sx={{ fontWeight: 'bold' }}
            />
          </Box>
          <Box mb={2}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
              <Typography variant="body2" color="text.secondary">Overall Performance</Typography>
              <Typography variant="h6" fontWeight="bold" color="success.main">87%</Typography>
            </Box>
            <ShimmerProgress variant="determinate" value={87} />
          </Box>
          <Grid container spacing={2}>
            <Grid item xs={4}>
              <Typography variant="body2" color="text.secondary">Completion Rate</Typography>
              <Typography variant="h6" fontWeight="bold">92%</Typography>
            </Grid>
            <Grid item xs={4}>
              <Typography variant="body2" color="text.secondary">On-Time Delivery</Typography>
              <Typography variant="h6" fontWeight="bold">85%</Typography>
            </Grid>
            <Grid item xs={4}>
              <Typography variant="body2" color="text.secondary">Quality Score</Typography>
              <Typography variant="h6" fontWeight="bold">94%</Typography>
            </Grid>
          </Grid>
        </CardContent>
      </GlassCard>

      {/* Main Content Grid */}
      <Grid container spacing={3}>
        {/* Quick Actions */}
        <Grid item xs={12} lg={6}>
          <GlassCard>
            <CardContent>
              <Typography variant="h5" fontWeight="bold" gutterBottom display="flex" alignItems="center" gap={1}>
                <Bolt color="warning" />
                Quick Actions
              </Typography>
              <Grid container spacing={2}>
                {quickActions.map((action, index) => (
                  <Grid item xs={12} sm={6} key={index}>
                    <FloatingButton
                      fullWidth
                      variant="contained"
                      startIcon={action.icon}
                      onClick={action.action}
                      sx={{ 
                        animationDelay: `${index * 0.1}s`,
                        mb: 1,
                        justifyContent: 'flex-start',
                      }}
                    >
                      <Box textAlign="left">
                        <Typography variant="body1" fontWeight="bold">
                          {action.title}
                        </Typography>
                        <Typography variant="caption" sx={{ opacity: 0.8 }}>
                          {action.description}
                        </Typography>
                      </Box>
                    </FloatingButton>
                  </Grid>
                ))}
              </Grid>
            </CardContent>
          </GlassCard>
        </Grid>

        {/* Upcoming Tasks */}
        <Grid item xs={12} lg={6}>
          <GlassCard>
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="between" mb={2}>
                <Typography variant="h5" fontWeight="bold" display="flex" alignItems="center" gap={1}>
                  <CalendarToday color="info" />
                  Upcoming Tasks
                </Typography>
                <IconButton size="small">
                  <MoreVert />
                </IconButton>
              </Box>
              <List>
                {upcomingTasks.map((task, index) => (
                  <ListItem key={index} divider={index < upcomingTasks.length - 1}>
                    <ListItemIcon>
                      <Chip 
                        size="small" 
                        label={task.priority} 
                        color={task.priority === 'urgent' ? 'error' : task.priority === 'high' ? 'warning' : 'info'}
                      />
                    </ListItemIcon>
                    <ListItemText
                      primary={task.title}
                      secondary={task.time}
                      primaryTypographyProps={{ fontWeight: 'bold' }}
                    />
                    <ListItemSecondaryAction>
                      <IconButton edge="end">
                        <Star />
                      </IconButton>
                    </ListItemSecondaryAction>
                  </ListItem>
                ))}
              </List>
            </CardContent>
          </GlassCard>
        </Grid>

        {/* Recent Activity */}
        <Grid item xs={12}>
          <GlassCard>
            <CardContent>
              <Typography variant="h5" fontWeight="bold" gutterBottom display="flex" alignItems="center" gap={1}>
                <Timeline color="secondary" />
                Recent Activity
              </Typography>
              <List>
                {recentActivities.map((activity, index) => (
                  <ListItem key={index} divider={index < recentActivities.length - 1}>
                    <ListItemIcon>
                      <Badge 
                        badgeContent={activity.priority === 'urgent' ? '!' : null} 
                        color="error"
                      >
                        {activity.icon}
                      </Badge>
                    </ListItemIcon>
                    <ListItemText
                      primary={activity.action}
                      secondary={activity.time}
                      primaryTypographyProps={{ fontWeight: 'medium' }}
                    />
                    <ListItemSecondaryAction>
                      <Chip 
                        size="small" 
                        label={activity.priority} 
                        variant="outlined"
                        color={activity.priority === 'urgent' ? 'error' : activity.priority === 'high' ? 'warning' : 'default'}
                      />
                    </ListItemSecondaryAction>
                  </ListItem>
                ))}
              </List>
            </CardContent>
          </GlassCard>
        </Grid>
      </Grid>
    </Container>
  );
};

export default Dashboard;
