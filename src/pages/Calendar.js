import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  Box,
  Button,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Avatar,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  ListItemSecondaryAction,
  Paper,
  
  Badge,
  
  Fab,
  Stack,
  Alert,
} from '@mui/material';
import {
  ChevronLeft,
  ChevronRight,
  Today,
  Event,
  Add,
  Schedule,
 
  CalendarMonth,
  ViewWeek,
  ViewDay,
  
  MoreVert,
  
 
  CheckCircle,
  RadioButtonUnchecked,
  
} from '@mui/icons-material';
import { styled, keyframes } from '@mui/material/styles';
import { useTask } from '../context/TaskContext';
import { useAuth } from '../context/AuthContext';

// Advanced Animations
const slideIn = keyframes`
  from {
    opacity: 0;
    transform: translateX(-20px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
`;

const fadeIn = keyframes`
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`;

const pulse = keyframes`
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.05); }
`;

const shimmer = keyframes`
  0% { background-position: -200px 0; }
  100% { background-position: calc(200px + 100%) 0; }
`;

// Styled Components
const CalendarContainer = styled(Box)(({ theme }) => ({
  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  borderRadius: '24px',
  padding: theme.spacing(3),
  color: 'white',
  marginBottom: theme.spacing(3),
  position: 'relative',
  overflow: 'hidden',
  '&::before': {
    content: '""',
    position: 'absolute',
    top: '-50%',
    right: '-20%',
    width: '300px',
    height: '300px',
    background: 'rgba(255,255,255,0.1)',
    borderRadius: '50%',
    animation: `${pulse} 6s ease-in-out infinite`,
  },
}));

const CalendarGrid = styled(Box)(({ theme }) => ({
  display: 'grid',
  gridTemplateColumns: 'repeat(7, 1fr)',
  gap: theme.spacing(1),
  marginTop: theme.spacing(2),
}));

const CalendarDay = styled(Card)(({ theme, isToday, hasEvents, isSelected }) => ({
  minHeight: '120px',
  padding: theme.spacing(1),
  cursor: 'pointer',
  position: 'relative',
  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  background: isToday 
    ? 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)' 
    : isSelected
    ? 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)'
    : 'rgba(255, 255, 255, 0.9)',
  backdropFilter: 'blur(10px)',
  border: hasEvents ? '2px solid #2196F3' : '1px solid rgba(255, 255, 255, 0.2)',
  '&:hover': {
    transform: 'translateY(-4px) scale(1.02)',
    boxShadow: '0 10px 30px rgba(0,0,0,0.2)',
    background: isToday 
      ? 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)' 
      : 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
    color: 'white',
  },
  animation: `${fadeIn} 0.6s ease-out`,
}));

const EventChip = styled(Chip)(({ priority }) => ({
  fontSize: '0.7rem',
  height: '20px',
  marginBottom: '2px',
  background: priority === 'urgent' 
    ? 'linear-gradient(45deg, #ff6b6b, #ee5a24)'
    : priority === 'high'
    ? 'linear-gradient(45deg, #ffa726, #ff9800)'
    : priority === 'medium'
    ? 'linear-gradient(45deg, #42a5f5, #2196f3)'
    : 'linear-gradient(45deg, #66bb6a, #4caf50)',
  color: 'white',
  fontWeight: 'bold',
  '&:hover': {
    transform: 'scale(1.05)',
  },
}));

const FloatingActionButton = styled(Fab)(({ theme }) => ({
  position: 'fixed',
  bottom: theme.spacing(3),
  right: theme.spacing(3),
  background: 'linear-gradient(45deg, #667eea, #764ba2)',
  color: 'white',
  animation: `${pulse} 3s ease-in-out infinite`,
  '&:hover': {
    background: 'linear-gradient(45deg, #5a6fd8, #6a4190)',
    transform: 'scale(1.1)',
  },
}));

const SidePanel = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  height: 'fit-content',
  background: 'rgba(255, 255, 255, 0.9)',
  backdropFilter: 'blur(10px)',
  borderRadius: '20px',
  border: '1px solid rgba(255, 255, 255, 0.2)',
  animation: `${slideIn} 0.6s ease-out`,
}));


const Calendar = () => {
  const { user } = useAuth();
  const { tasks, getTasks, createTask, updateTask } = useTask();
  
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [view, setView] = useState('month'); // month, week, day
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [events, setEvents] = useState([]);
  const [newEvent, setNewEvent] = useState({
    title: '',
    description: '',
    date: new Date(),
    time: '',
    priority: 'medium',
    category: 'work',
    color: '#2196F3',
  });
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    getTasks();
  }, []);

  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days = [];
    
    // Add empty cells for days before the first day of the month
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }
    
    // Add all days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(new Date(year, month, day));
    }
    
    return days;
  };

  const getEventsForDate = (date) => {
    if (!date) return [];
    return events.filter(event => 
      event.date.toDateString() === date.toDateString()
    );
  };

  const isToday = (date) => {
    if (!date) return false;
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  const isSelected = (date) => {
    if (!date) return false;
    return date.toDateString() === selectedDate.toDateString();
  };

  const navigateMonth = (direction) => {
    const newDate = new Date(currentDate);
    newDate.setMonth(newDate.getMonth() + direction);
    setCurrentDate(newDate);
  };

  const handleDateClick = (date) => {
    if (date) {
      setSelectedDate(date);
      // Double click to create event
      if (selectedDate && selectedDate.toDateString() === date.toDateString()) {
        handleCreateEvent();
      }
    }
  };

  const handleEventClick = (event) => {
    setSelectedEvent(event);
    setNewEvent({
      title: event.title,
      description: event.description,
      date: event.date,
      time: event.time,
      priority: event.priority,
      category: event.category,
      color: event.color,
    });
    setOpenDialog(true);
  };

  const handleCreateEvent = () => {
    setSelectedEvent(null);
    setNewEvent({
      title: '',
      description: '',
      date: selectedDate,
      time: '',
      priority: 'medium',
      category: 'work',
      color: '#2196F3',
    });
    setOpenDialog(true);
  };

  const handleSaveEvent = async () => {
    // Validation
    if (!newEvent.title.trim()) {
      alert('Please enter an event title');
      return;
    }

    try {
      if (selectedEvent) {
        // Update existing event
        await updateTask(selectedEvent.id, newEvent);
      } else {
        // Create new event
        await createTask(newEvent);
      }
      await getTasks();
      setOpenDialog(false);
    } catch (error) {
      console.error('Failed to save event:', error);
    }
  };

  const toggleEventCompletion = (eventId) => {
    setEvents(events.map(event =>
      event.id === eventId
        ? { ...event, completed: !event.completed }
        : event
    ));
  };

  const getUpcomingEvents = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Reset time to start of day
    
    return events
      .filter(event => {
        const eventDate = new Date(event.date);
        eventDate.setHours(0, 0, 0, 0);
        return eventDate >= today && !event.completed;
      })
      .sort((a, b) => new Date(a.date) - new Date(b.date))
      .slice(0, 5);
  };

  const getTodayEvents = () => {
    const today = new Date();
    return events.filter(event => 
      event.date.toDateString() === today.toDateString()
    );
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'urgent': return 'error';
      case 'high': return 'warning';
      case 'medium': return 'info';
      case 'low': return 'success';
      default: return 'default';
    }
  };

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const days = getDaysInMonth(currentDate);
  const todayEvents = getTodayEvents();
  const upcomingEvents = getUpcomingEvents();

  return (
    <Container maxWidth="xl" sx={{ py: 3 }}>
      {/* Header */}
      <CalendarContainer>
        <Grid container alignItems="center" justifyContent="space-between">
          <Grid item>
            <Typography variant="h3" fontWeight="bold" sx={{ mb: 1 }}>
              📅 Calendar
            </Typography>
            <Typography variant="h6" sx={{ opacity: 0.9 }}>
              Manage your schedule and tasks efficiently
            </Typography>
          </Grid>
          <Grid item>
            <Avatar
              sx={{
                width: 80,
                height: 80,
                bgcolor: 'rgba(255,255,255,0.2)',
                fontSize: '2rem',
              }}
            >
              <CalendarMonth fontSize="large" />
            </Avatar>
          </Grid>
        </Grid>
      </CalendarContainer>

      <Grid container spacing={3}>
        {/* Main Calendar */}
        <Grid item xs={12} lg={8}>
          <Card sx={{ borderRadius: '20px', overflow: 'hidden' }}>
            <CardContent>
              {/* Calendar Controls */}
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                <Box display="flex" alignItems="center" gap={2}>
                  <IconButton onClick={() => navigateMonth(-1)}>
                    <ChevronLeft />
                  </IconButton>
                  <Typography variant="h4" fontWeight="bold">
                    {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
                  </Typography>
                  <IconButton onClick={() => navigateMonth(1)}>
                    <ChevronRight />
                  </IconButton>
                </Box>
                
                <Box display="flex" gap={1}>
                  <Button
                    variant={view === 'month' ? 'contained' : 'outlined'}
                    startIcon={<CalendarMonth />}
                    onClick={() => setView('month')}
                  >
                    Month
                  </Button>
                  <Button
                    variant={view === 'week' ? 'contained' : 'outlined'}
                    startIcon={<ViewWeek />}
                    onClick={() => setView('week')}
                  >
                    Week
                  </Button>
                  <Button
                    variant={view === 'day' ? 'contained' : 'outlined'}
                    startIcon={<ViewDay />}
                    onClick={() => setView('day')}
                  >
                    Day
                  </Button>
                </Box>
              </Box>

              {/* Day Headers */}
              <CalendarGrid>
                {dayNames.map(day => (
                  <Box
                    key={day}
                    sx={{
                      p: 1,
                      textAlign: 'center',
                      fontWeight: 'bold',
                      color: 'text.secondary',
                    }}
                  >
                    {day}
                  </Box>
                ))}
              </CalendarGrid>

              {/* Calendar Days */}
              <CalendarGrid>
                {days.map((date, index) => {
                  const dayEvents = getEventsForDate(date);
                  return (
                    <CalendarDay
                      key={index}
                      isToday={isToday(date)}
                      hasEvents={dayEvents.length > 0}
                      isSelected={isSelected(date)}
                      onClick={() => handleDateClick(date)}
                    >
                      {date && (
                        <>
                          <Typography
                            variant="body1"
                            fontWeight="bold"
                            sx={{ mb: 1 }}
                          >
                            {date.getDate()}
                          </Typography>
                          <Box>
                            {dayEvents.slice(0, 3).map((event, idx) => (
                              <EventChip
                                key={idx}
                                label={event.title}
                                size="small"
                                priority={event.priority}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleEventClick(event);
                                }}
                                sx={{ 
                                  display: 'block',
                                  textAlign: 'left',
                                  textDecoration: event.completed ? 'line-through' : 'none',
                                  opacity: event.completed ? 0.7 : 1,
                                }}
                              />
                            ))}
                            {dayEvents.length > 3 && (
                              <Typography variant="caption" color="text.secondary">
                                +{dayEvents.length - 3} more
                              </Typography>
                            )}
                          </Box>
                        </>
                      )}
                    </CalendarDay>
                  );
                })}
              </CalendarGrid>
            </CardContent>
          </Card>
        </Grid>

        {/* Side Panel */}
        <Grid item xs={12} lg={4}>
          <Stack spacing={3}>
            {/* Today's Events */}
            <SidePanel>
              <Typography variant="h6" fontWeight="bold" gutterBottom display="flex" alignItems="center" gap={1}>
                <Today color="primary" />
                Today's Events
              </Typography>
              {todayEvents.length > 0 ? (
                <List>
                  {todayEvents.map((event) => (
                    <ListItem key={event.id} divider>
                      <ListItemIcon>
                        <IconButton
                          size="small"
                          onClick={() => toggleEventCompletion(event.id)}
                        >
                          {event.completed ? (
                            <CheckCircle color="success" />
                          ) : (
                            <RadioButtonUnchecked />
                          )}
                        </IconButton>
                      </ListItemIcon>
                      <ListItemText
                        primary={event.title}
                        secondary={`${event.time} • ${event.category}`}
                        primaryTypographyProps={{
                          textDecoration: event.completed ? 'line-through' : 'none',
                          opacity: event.completed ? 0.7 : 1,
                        }}
                      />
                      <ListItemSecondaryAction>
                        <Chip
                          size="small"
                          label={event.priority}
                          color={getPriorityColor(event.priority)}
                        />
                      </ListItemSecondaryAction>
                    </ListItem>
                  ))}
                </List>
              ) : (
                <Alert severity="info">No events scheduled for today</Alert>
              )}
            </SidePanel>

            {/* Upcoming Events */}
            <SidePanel>
              <Typography variant="h6" fontWeight="bold" gutterBottom display="flex" alignItems="center" gap={1}>
                <Schedule color="secondary" />
                Upcoming Events
              </Typography>
              {upcomingEvents.length > 0 ? (
                <List>
                  {upcomingEvents.map((event) => (
                    <ListItem key={event.id} divider>
                      <ListItemIcon>
                        <Badge
                          badgeContent={event.priority === 'urgent' ? '!' : null}
                          color="error"
                        >
                          <Event color="action" />
                        </Badge>
                      </ListItemIcon>
                      <ListItemText
                        primary={event.title}
                        secondary={`${event.date.toLocaleDateString()} • ${event.time}`}
                      />
                      <ListItemSecondaryAction>
                        <IconButton
                          edge="end"
                          onClick={() => handleEventClick(event)}
                        >
                          <MoreVert />
                        </IconButton>
                      </ListItemSecondaryAction>
                    </ListItem>
                  ))}
                </List>
              ) : (
                <Alert severity="success">All caught up! No upcoming events.</Alert>
              )}
            </SidePanel>

            {/* Quick Stats */}
            <SidePanel>
              <Typography variant="h6" fontWeight="bold" gutterBottom display="flex" alignItems="center" gap={1}>
                📊 Quick Stats
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <Box textAlign="center">
                    <Typography variant="h4" fontWeight="bold" color="primary.main">
                      {events.length}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Total Events
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={6}>
                  <Box textAlign="center">
                    <Typography variant="h4" fontWeight="bold" color="success.main">
                      {events.filter(e => e.completed).length}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Completed
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={6}>
                  <Box textAlign="center">
                    <Typography variant="h4" fontWeight="bold" color="warning.main">
                      {upcomingEvents.length}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Upcoming
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={6}>
                  <Box textAlign="center">
                    <Typography variant="h4" fontWeight="bold" color="error.main">
                      {events.filter(e => e.priority === 'urgent').length}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Urgent
                    </Typography>
                  </Box>
                </Grid>
              </Grid>
            </SidePanel>
          </Stack>
        </Grid>
      </Grid>

      {/* Floating Action Button */}
      <FloatingActionButton onClick={handleCreateEvent}>
        <Add />
      </FloatingActionButton>

      {/* Event Dialog */}
      <Dialog
        open={openDialog}
        onClose={() => setOpenDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          {selectedEvent ? 'Edit Event' : 'Create New Event'}
        </DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            label="Event Title"
            value={newEvent.title}
            onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
            margin="normal"
          />
          <TextField
            fullWidth
            label="Description"
            value={newEvent.description}
            onChange={(e) => setNewEvent({ ...newEvent, description: e.target.value })}
            margin="normal"
            multiline
            rows={3}
          />
          <TextField
            fullWidth
            label="Date"
            type="date"
            value={newEvent.date ? newEvent.date.toISOString().split('T')[0] : ''}
            onChange={(e) => setNewEvent({ ...newEvent, date: new Date(e.target.value) })}
            margin="normal"
            InputLabelProps={{
              shrink: true,
            }}
          />
          <TextField
            fullWidth
            label="Time"
            value={newEvent.time}
            onChange={(e) => setNewEvent({ ...newEvent, time: e.target.value })}
            margin="normal"
            placeholder="e.g., 10:00 AM"
          />
          <FormControl fullWidth margin="normal">
            <InputLabel id="priority-label">Priority</InputLabel>
            <Select
              labelId="priority-label"
              value={newEvent.priority}
              label="Priority"
              onChange={(e) => setNewEvent({ ...newEvent, priority: e.target.value })}
            >
              <MenuItem value="low">Low</MenuItem>
              <MenuItem value="medium">Medium</MenuItem>
              <MenuItem value="high">High</MenuItem>
              <MenuItem value="urgent">Urgent</MenuItem>
            </Select>
          </FormControl>
          <FormControl fullWidth margin="normal">
            <InputLabel id="category-label">Category</InputLabel>
            <Select
              labelId="category-label"
              value={newEvent.category}
              label="Category"
              onChange={(e) => setNewEvent({ ...newEvent, category: e.target.value })}
            >
              <MenuItem value="work">Work</MenuItem>
              <MenuItem value="personal">Personal</MenuItem>
              <MenuItem value="health">Health</MenuItem>
              <MenuItem value="education">Education</MenuItem>
              <MenuItem value="social">Social</MenuItem>
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
          <Button onClick={handleSaveEvent} variant="contained">
            {selectedEvent ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default Calendar;
