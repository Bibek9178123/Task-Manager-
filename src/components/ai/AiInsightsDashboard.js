import React, { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  Typography,
  Grid,
  Box,
  Chip,
  Button,
  CircularProgress,
  Alert,
  Tabs,
  Tab,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider,
  LinearProgress,
  Avatar,
  styled,
  keyframes,
} from '@mui/material';
import {
  Psychology,
  TrendingUp,
  Lightbulb,
  Schedule,
  AutoAwesome,
  Insights,
  Speed,
  EmojiObjects,
  Analytics,
  SmartToy,
  Stars,
  Celebration,
} from '@mui/icons-material';
import { getProductivityInsights, getTaskRecommendations } from '../../services/aiService';
import { toast } from 'react-toastify';
import AiChatAssistant from './AiChatAssistant';

// Animations
const float = keyframes`
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-10px); }
`;

const glow = keyframes`
  0%, 100% { box-shadow: 0 0 10px rgba(25, 118, 210, 0.5); }
  50% { box-shadow: 0 0 20px rgba(25, 118, 210, 0.8); }
`;

const sparkle = keyframes`
  0%, 100% { opacity: 1; transform: scale(1); }
  50% { opacity: 0.7; transform: scale(1.1); }
`;

// Styled Components
const GlowCard = styled(Card)(({ theme }) => ({
  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  color: 'white',
  borderRadius: '20px',
  position: 'relative',
  overflow: 'hidden',
  '&:hover': {
    animation: `${glow} 2s infinite`,
  },
  '&::before': {
    content: '""',
    position: 'absolute',
    top: '-50%',
    right: '-20%',
    width: '200px',
    height: '200px',
    background: 'rgba(255,255,255,0.1)',
    borderRadius: '50%',
    animation: `${float} 6s ease-in-out infinite`,
  },
}));

const InsightCard = styled(Card)(({ theme, variant }) => ({
  height: '100%',
  transition: 'all 0.3s ease',
  borderLeft: `4px solid ${
    variant === 'success' ? theme.palette.success.main :
    variant === 'warning' ? theme.palette.warning.main :
    variant === 'info' ? theme.palette.info.main :
    theme.palette.primary.main
  }`,
  '&:hover': {
    transform: 'translateY(-4px)',
    boxShadow: theme.shadows[8],
  },
}));

const FloatingIcon = styled(Avatar)(({ theme }) => ({
  width: 60,
  height: 60,
  background: 'linear-gradient(45deg, #ff6b6b, #ffa726)',
  animation: `${sparkle} 3s ease-in-out infinite`,
  margin: '0 auto 16px',
}));

function TabPanel({ children, value, index, ...other }) {
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`ai-tabpanel-${index}`}
      aria-labelledby={`ai-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

const AiInsightsDashboard = () => {
  const [tabValue, setTabValue] = useState(0);
  const [insights, setInsights] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [metrics, setMetrics] = useState({});
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('week');

  useEffect(() => {
    fetchInsights();
    fetchRecommendations();
  }, [timeRange]);

  const fetchInsights = async () => {
    try {
      const response = await getProductivityInsights(timeRange);
      setInsights(response.insights);
      setMetrics(response.metrics);
    } catch (error) {
      toast.error('Failed to fetch insights');
    }
  };

  const fetchRecommendations = async () => {
    try {
      const response = await getTaskRecommendations();
      setRecommendations(response.recommendations);
    } catch (error) {
      toast.error('Failed to fetch recommendations');
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const getInsightIcon = (type) => {
    switch (type) {
      case 'productivity':
        return <TrendingUp />;
      case 'streak':
        return <Celebration />;
      case 'efficiency':
        return <Speed />;
      default:
        return <Insights />;
    }
  };

  const getMetricColor = (value, type) => {
    switch (type) {
      case 'completion':
        return value >= 80 ? 'success' : value >= 60 ? 'warning' : 'error';
      case 'efficiency':
        return value >= 90 ? 'success' : value >= 70 ? 'info' : 'warning';
      default:
        return 'primary';
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress size={60} />
        <Typography variant="h6" sx={{ ml: 2 }}>
          Analyzing your productivity patterns...
        </Typography>
      </Box>
    );
  }

  return (
    <Box>
      {/* Header */}
      <GlowCard sx={{ mb: 4 }}>
        <CardContent>
          <Box display="flex" alignItems="center" justifyContent="space-between">
            <Box>
              <Typography variant="h4" fontWeight="bold" gutterBottom>
                🤖 AI Insights Dashboard
              </Typography>
              <Typography variant="h6" sx={{ opacity: 0.9 }}>
                Discover patterns, boost productivity, and get smart recommendations
              </Typography>
            </Box>
            <FloatingIcon>
              <SmartToy fontSize="large" />
            </FloatingIcon>
          </Box>
        </CardContent>
      </GlowCard>

      {/* Key Metrics */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={3}>
          <InsightCard variant="success">
            <CardContent>
              <Box textAlign="center">
                <Analytics color="primary" sx={{ fontSize: 40, mb: 1 }} />
                <Typography variant="h4" fontWeight="bold">
                  {metrics.completionRate}%
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Completion Rate
                </Typography>
                <LinearProgress
                  variant="determinate"
                  value={typeof metrics.completionRate === 'string' ? parseFloat(metrics.completionRate) : metrics.completionRate || 0}
                  color={getMetricColor(typeof metrics.completionRate === 'string' ? parseFloat(metrics.completionRate) : metrics.completionRate || 0, 'completion')}
                  sx={{ mt: 1, height: 6, borderRadius: 3 }}
                />
              </Box>
            </CardContent>
          </InsightCard>
        </Grid>

        <Grid item xs={12} md={3}>
          <InsightCard variant="info">
            <CardContent>
              <Box textAlign="center">
                <Schedule color="info" sx={{ fontSize: 40, mb: 1 }} />
                <Typography variant="h4" fontWeight="bold">
                  {metrics.averageCompletionTime}h
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Avg Completion Time
                </Typography>
              </Box>
            </CardContent>
          </InsightCard>
        </Grid>

        <Grid item xs={12} md={3}>
          <InsightCard variant="warning">
            <CardContent>
              <Box textAlign="center">
                <TrendingUp color="success" sx={{ fontSize: 40, mb: 1 }} />
                <Typography variant="h4" fontWeight="bold">
                  {metrics.completedTasks}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Tasks Completed
                </Typography>
              </Box>
            </CardContent>
          </InsightCard>
        </Grid>

        <Grid item xs={12} md={3}>
          <InsightCard variant="error">
            <CardContent>
              <Box textAlign="center">
                <Psychology color="error" sx={{ fontSize: 40, mb: 1 }} />
                <Typography variant="h4" fontWeight="bold">
                  {metrics.overdueTasks}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Overdue Tasks
                </Typography>
              </Box>
            </CardContent>
          </InsightCard>
        </Grid>
      </Grid>

      {/* Tabs */}
      <Card>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={tabValue} onChange={handleTabChange}>
            <Tab 
              label="Smart Insights" 
              icon={<Insights />} 
              iconPosition="start"
            />
            <Tab 
              label="Recommendations" 
              icon={<AutoAwesome />} 
              iconPosition="start"
            />
            <Tab 
              label="AI Assistant" 
              icon={<SmartToy />} 
              iconPosition="start"
            />
            <Tab 
              label="Time Analysis" 
              icon={<Schedule />} 
              iconPosition="start"
            />
          </Tabs>
        </Box>

        <TabPanel value={tabValue} index={0}>
          <Grid container spacing={3}>
            {insights.length > 0 ? (
              insights.map((insight, index) => (
                <Grid item xs={12} md={6} key={index}>
                  <Card sx={{ height: '100%' }}>
                    <CardContent>
                      <Box display="flex" alignItems="center" mb={2}>
                        {getInsightIcon(insight.type)}
                        <Typography variant="h6" fontWeight="bold" sx={{ ml: 1 }}>
                          {insight.type === 'productivity' ? 'Productivity Pattern' :
                           insight.type === 'streak' ? 'Achievement Streak' :
                           'Performance Insight'}
                        </Typography>
                      </Box>
                      
                      <Alert severity="info" sx={{ mb: 2 }}>
                        {insight.message}
                      </Alert>
                      
                      <Typography variant="body2" color="text.secondary">
                        💡 {insight.suggestion}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              ))
            ) : (
              <Grid item xs={12}>
                <Box textAlign="center" py={4}>
                  <EmojiObjects sx={{ fontSize: 60, color: 'text.secondary', mb: 2 }} />
                  <div>
                    <Typography variant="h6" color="text.secondary">
                      Keep working on tasks to generate insights!
                    </Typography>
                  </div>
                </Box>
              </Grid>
            )}
          </Grid>
        </TabPanel>

        <TabPanel value={tabValue} index={1}>
          <List>
            {recommendations.length > 0 ? (
              recommendations.map((recommendation, index) => (
                <React.Fragment key={index}>
                  <ListItem>
                    <ListItemIcon>
                      <Chip
                        label={recommendation.priority}
                        color={
                          recommendation.priority === 'urgent' ? 'error' :
                          recommendation.priority === 'high' ? 'warning' :
                          'success'
                        }
                        size="small"
                      />
                    </ListItemIcon>
                    <ListItemText
                      primary={
                        <Box display="flex" alignItems="center" gap={1}>
                          <Stars color="primary" />
                          <Typography variant="h6">{recommendation.title}</Typography>
                        </Box>
                      }
                      secondary={
                        <React.Fragment>
                          <Typography variant="body2" sx={{ mb: 1 }}>
                            {recommendation.description}
                          </Typography>
                          <span style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '8px' }}>
                            <Chip 
                              label={recommendation.category} 
                              size="small" 
                              variant="outlined" 
                            />
                            <Chip 
                              label={`${recommendation.estimatedHours}h estimated`} 
                              size="small" 
                              variant="outlined"
                              color="primary"
                            />
                          </span>
                          <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                            🎯 {recommendation.reason}
                          </Typography>
                        </React.Fragment>
                      }
                    />
                  </ListItem>
                  {index < recommendations.length - 1 && <Divider />}
                </React.Fragment>
              ))
            ) : (
              <Box textAlign="center" py={4}>
                <Lightbulb sx={{ fontSize: 60, color: 'text.secondary', mb: 2 }} />
                <div>
                  <Typography variant="h6" color="text.secondary">
                    No recommendations available right now
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Complete more tasks to get personalized suggestions!
                  </Typography>
                </div>
              </Box>
            )}
          </List>
        </TabPanel>

        <TabPanel value={tabValue} index={2}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <AiChatAssistant />
            </Grid>
          </Grid>
        </TabPanel>

        <TabPanel value={tabValue} index={3}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6" fontWeight="bold" gutterBottom>
                    ⏰ Time Distribution
                  </Typography>
                  <Box>
                    {['Morning', 'Afternoon', 'Evening'].map((period, index) => (
                      <Box key={period} sx={{ mb: 2 }}>
                        <Box display="flex" justifyContent="space-between" mb={0.5}>
                          <Typography variant="body2">{period}</Typography>
                          <Typography variant="body2" fontWeight="bold">
                            {Math.round(Math.random() * 40 + 10)}%
                          </Typography>
                        </Box>
                        <LinearProgress
                          variant="determinate"
                          value={Math.round(Math.random() * 40 + 10)}
                          color={index === 0 ? 'success' : index === 1 ? 'warning' : 'info'}
                          sx={{ height: 8, borderRadius: 4 }}
                        />
                      </Box>
                    ))}
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6" fontWeight="bold" gutterBottom>
                    📊 Weekly Progress
                  </Typography>
                  <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                    <Typography variant="body2">This Week</Typography>
                    <Chip 
                      label={`${metrics.completedTasks} completed`} 
                      color="success" 
                      size="small" 
                    />
                  </Box>
                  <LinearProgress
                    variant="determinate"
                    value={Math.min((metrics.completedTasks || 0) * 10, 100)}
                    color="success"
                    sx={{ height: 12, borderRadius: 6, mb: 2 }}
                  />
                  <Typography variant="caption" color="text.secondary">
                    🎯 Keep up the great work! You're {metrics.completionRate}% efficient this week.
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </TabPanel>
      </Card>
    </Box>
  );
};

export default AiInsightsDashboard;
