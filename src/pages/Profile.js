import React, { useState, useRef } from 'react';
import {
  Container,
  Typography,
  Box,
  Card,
  CardContent,
  Avatar,
  Grid,
  Button,
  TextField,
  Divider,
  Paper,
  IconButton,
  Switch,
  FormControlLabel,
  Alert,
  Snackbar,
  CircularProgress,
  Chip,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemSecondaryAction,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Tab,
  Tabs,
  Badge,
  Tooltip,
  Stack,
} from '@mui/material';
import {
  Edit as EditIcon,
  PhotoCamera as PhotoCameraIcon,
  Save as SaveIcon,
  Cancel as CancelIcon,
  Security as SecurityIcon,
  Notifications as NotificationsIcon,
  Palette as PaletteIcon,
  Language as LanguageIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  LocationOn as LocationIcon,
  Work as WorkIcon,
  CalendarToday as CalendarIcon,
  Verified as VerifiedIcon,
  Settings as SettingsIcon,
  AccountCircle as AccountIcon,
  Lock as LockIcon,
  Info as InfoIcon,
} from '@mui/icons-material';
import { styled, keyframes } from '@mui/material/styles';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { toast } from 'react-toastify';

// Advanced Animations
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
const GlassCard = styled(Card)(({ theme }) => ({
  background: theme.palette.mode === 'dark' ? 'rgba(0, 0, 0, 0.7)' : 'rgba(255, 255, 255, 0.9)',
  color: theme.palette.text.primary,
  backdropFilter: 'blur(20px)',
  border: '1px solid',
  borderColor: theme.palette.divider,
  borderRadius: '20px',
  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  animation: `${fadeIn} 0.6s ease-out`,
  '&:hover': {
    transform: 'translateY(-4px)',
    boxShadow: theme.palette.mode === 'dark' ? '0 20px 40px rgba(0,0,0,0.5)' : '0 20px 40px rgba(0,0,0,0.1)',
  },
}));

const ProfileHeader = styled(Paper)(({ theme }) => ({
  background: theme.palette.mode === 'dark' ? 'linear-gradient(135deg, #667eea, #764ba2)' : 'linear-gradient(135deg, #667eea, #764ba2)',
  color: theme.palette.common.white,
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
    animation: `${pulse} 6s ease-in-out infinite`,
  },
}));

const StyledAvatar = styled(Avatar)(({ theme }) => ({
  width: 120,
  height: 120,
  fontSize: '3rem',
  border: '4px solid rgba(255,255,255,0.3)',
  animation: `${pulse} 3s ease-in-out infinite`,
  cursor: 'pointer',
  transition: 'all 0.3s ease',
  '&:hover': {
    transform: 'scale(1.1)',
    boxShadow: '0 10px 30px rgba(0,0,0,0.3)',
  },
}));

const AnimatedButton = styled(Button)(({ theme }) => ({
  borderRadius: '25px',
  padding: '12px 24px',
  fontWeight: 'bold',
  transition: 'all 0.3s ease',
  '&:hover': {
    transform: 'translateY(-2px)',
    boxShadow: '0 8px 25px rgba(0,0,0,0.15)',
  },
}));

const TabPanel = ({ children, value, index, ...other }) => {
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`profile-tabpanel-${index}`}
      aria-labelledby={`profile-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
};

const Profile = () => {
  const { user, updateProfile, changePassword } = useAuth();
  const { darkMode, toggleDarkMode, setThemeMode } = useTheme();
  const fileInputRef = useRef(null);
  
  // State management
  const [tabValue, setTabValue] = useState(0);
  const [editMode, setEditMode] = useState(false);
  const [loading, setLoading] = useState(false);
  const [openPasswordDialog, setOpenPasswordDialog] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  
  // Form states
  const [profileData, setProfileData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    location: user?.location || '',
    bio: user?.bio || '',
    jobTitle: user?.jobTitle || '',
    company: user?.company || '',
  });
  
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  
  const [preferences, setPreferences] = useState({
    emailNotifications: user?.preferences?.emailNotifications ?? true,
    taskReminders: user?.preferences?.taskReminders ?? true,
    weeklyReport: user?.preferences?.weeklyReport ?? false,
    pushNotifications: user?.preferences?.pushNotifications ?? true,
  });

  // Handle tab change
  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  // Handle profile edit
  const handleEditToggle = () => {
    if (editMode) {
      // Reset form data if canceling
      setProfileData({
        name: user?.name || '',
        email: user?.email || '',
        phone: user?.phone || '',
        location: user?.location || '',
        bio: user?.bio || '',
        jobTitle: user?.jobTitle || '',
        company: user?.company || '',
      });
    }
    setEditMode(!editMode);
  };

  // Handle profile save
  const handleProfileSave = async () => {
    if (!profileData.name.trim()) {
      showSnackbar('Name is required', 'error');
      return;
    }
    
    setLoading(true);
    try {
      await updateProfile(profileData);
      setEditMode(false);
      showSnackbar('Profile updated successfully!', 'success');
    } catch (error) {
      showSnackbar(error.message || 'Failed to update profile', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Handle password change
  const handlePasswordChange = async () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      showSnackbar('Passwords do not match', 'error');
      return;
    }
    
    if (passwordData.newPassword.length < 6) {
      showSnackbar('Password must be at least 6 characters', 'error');
      return;
    }
    
    setLoading(true);
    try {
      await changePassword(passwordData.currentPassword, passwordData.newPassword);
      setOpenPasswordDialog(false);
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
      showSnackbar('Password changed successfully!', 'success');
    } catch (error) {
      showSnackbar(error.message || 'Failed to change password', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Handle preference change
  const handlePreferenceChange = (preference) => (event) => {
    if (preference === 'darkMode') {
      // Handle dark mode specially through ThemeContext
      setThemeMode(event.target.checked);
      showSnackbar(event.target.checked ? 'Dark mode enabled' : 'Light mode enabled', 'success');
      
      // Also update user preferences in backend
      const newPreferences = {
        ...preferences,
        darkMode: event.target.checked,
      };
      updateProfile({ preferences: newPreferences });
    } else {
      // Handle other preferences normally
      const newPreferences = {
        ...preferences,
        [preference]: event.target.checked,
      };
      setPreferences(newPreferences);
      
      // Auto-save preferences
      updateProfile({ preferences: newPreferences });
      showSnackbar('Preferences updated', 'success');
    }
  };

  // Handle avatar upload
  const handleAvatarUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      // In a real app, you would upload the file to a server
      const reader = new FileReader();
      reader.onload = (e) => {
        // Update avatar in profile
        showSnackbar('Avatar uploaded! (Demo only)', 'info');
      };
      reader.readAsDataURL(file);
    }
  };

  // Show snackbar
  const showSnackbar = (message, severity = 'success') => {
    setSnackbar({ open: true, message, severity });
  };

  // Close snackbar
  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  // Get account stats
  const getAccountStats = () => {
    const joinDate = user?.createdAt ? new Date(user.createdAt) : new Date();
    const daysSinceJoined = Math.floor((new Date() - joinDate) / (1000 * 60 * 60 * 24));
    
    return [
      { label: 'Days Active', value: daysSinceJoined, icon: CalendarIcon },
      { label: 'Tasks Completed', value: user?.tasksCompleted || 0, icon: VerifiedIcon },
      { label: 'Profile Score', value: '85%', icon: InfoIcon },
    ];
  };

  const accountStats = getAccountStats();

  return (
    <Container maxWidth="xl" sx={{ py: 3 }}>
      {/* Profile Header */}
      <ProfileHeader elevation={0}>
        <Grid container alignItems="center" spacing={3}>
          <Grid item xs={12} md={3} textAlign="center">
            <Badge
              overlap="circular"
              anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
              badgeContent={
                <IconButton
                  size="small"
                  sx={{
                    bgcolor: 'white',
                    color: 'primary.main',
                    '&:hover': { bgcolor: 'grey.100' },
                  }}
                  onClick={() => fileInputRef.current?.click()}
                >
                  <PhotoCameraIcon fontSize="small" />
                </IconButton>
              }
            >
              <StyledAvatar
                src={user?.avatar}
                alt={user?.name}
                onClick={() => fileInputRef.current?.click()}
              >
                {user?.name?.charAt(0) || 'U'}
              </StyledAvatar>
            </Badge>
            <input
              type="file"
              ref={fileInputRef}
              style={{ display: 'none' }}
              accept="image/*"
              onChange={handleAvatarUpload}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <Typography variant="h3" fontWeight="bold" gutterBottom>
              {user?.name || 'User Name'}
            </Typography>
            <Typography variant="h6" sx={{ opacity: 0.9, mb: 2 }}>
              {user?.jobTitle || 'Software Developer'} • {user?.company || 'Tech Company'}
            </Typography>
            <Typography variant="body1" sx={{ opacity: 0.8, mb: 2 }}>
              {user?.bio || 'Building amazing things with code and creativity.'}
            </Typography>
            <Stack direction="row" spacing={1} flexWrap="wrap">
              <Chip 
                icon={<EmailIcon />} 
                label={user?.email} 
                variant="outlined" 
                sx={{ color: 'white', borderColor: 'rgba(255,255,255,0.5)' }}
              />
              {user?.location && (
                <Chip 
                  icon={<LocationIcon />} 
                  label={user.location} 
                  variant="outlined" 
                  sx={{ color: 'white', borderColor: 'rgba(255,255,255,0.5)' }}
                />
              )}
            </Stack>
          </Grid>
          <Grid item xs={12} md={3}>
            <Box textAlign="center">
              {accountStats.map((stat, index) => (
                <Box key={index} sx={{ mb: 2 }}>
                  <Typography variant="h4" fontWeight="bold">
                    {stat.value}
                  </Typography>
                  <Typography variant="body2" sx={{ opacity: 0.8 }}>
                    {stat.label}
                  </Typography>
                </Box>
              ))}
            </Box>
          </Grid>
        </Grid>
      </ProfileHeader>

      {/* Profile Tabs */}
      <GlassCard>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={tabValue} onChange={handleTabChange} aria-label="profile tabs">
            <Tab icon={<AccountIcon />} label="Profile" />
            <Tab icon={<SecurityIcon />} label="Security" />
            <Tab icon={<SettingsIcon />} label="Preferences" />
            <Tab icon={<InfoIcon />} label="Account Info" />
          </Tabs>
        </Box>

        {/* Profile Tab */}
        <TabPanel value={tabValue} index={0}>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
            <Typography variant="h5" fontWeight="bold">
              Profile Information
            </Typography>
            <AnimatedButton
              variant={editMode ? "outlined" : "contained"}
              startIcon={editMode ? <CancelIcon /> : <EditIcon />}
              onClick={handleEditToggle}
            >
              {editMode ? 'Cancel' : 'Edit Profile'}
            </AnimatedButton>
          </Box>
          
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Full Name"
                value={profileData.name}
                onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                disabled={!editMode}
                margin="normal"
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Email"
                value={profileData.email}
                onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                disabled={!editMode}
                margin="normal"
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Phone"
                value={profileData.phone}
                onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                disabled={!editMode}
                margin="normal"
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Location"
                value={profileData.location}
                onChange={(e) => setProfileData({ ...profileData, location: e.target.value })}
                disabled={!editMode}
                margin="normal"
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Job Title"
                value={profileData.jobTitle}
                onChange={(e) => setProfileData({ ...profileData, jobTitle: e.target.value })}
                disabled={!editMode}
                margin="normal"
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Company"
                value={profileData.company}
                onChange={(e) => setProfileData({ ...profileData, company: e.target.value })}
                disabled={!editMode}
                margin="normal"
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Bio"
                value={profileData.bio}
                onChange={(e) => setProfileData({ ...profileData, bio: e.target.value })}
                disabled={!editMode}
                margin="normal"
                multiline
                rows={3}
              />
            </Grid>
          </Grid>
          
          {editMode && (
            <Box mt={3} display="flex" gap={2}>
              <AnimatedButton
                variant="contained"
                startIcon={loading ? <CircularProgress size={20} /> : <SaveIcon />}
                onClick={handleProfileSave}
                disabled={loading}
              >
                Save Changes
              </AnimatedButton>
            </Box>
          )}
        </TabPanel>

        {/* Security Tab */}
        <TabPanel value={tabValue} index={1}>
          <Typography variant="h5" fontWeight="bold" gutterBottom>
            Security Settings
          </Typography>
          
          <List>
            <ListItem>
              <ListItemIcon>
                <LockIcon />
              </ListItemIcon>
              <ListItemText
                primary="Change Password"
                secondary="Update your account password"
              />
              <ListItemSecondaryAction>
                <Button
                  variant="outlined"
                  onClick={() => setOpenPasswordDialog(true)}
                >
                  Change
                </Button>
              </ListItemSecondaryAction>
            </ListItem>
            <Divider />
            <ListItem>
              <ListItemIcon>
                <SecurityIcon />
              </ListItemIcon>
              <ListItemText
                primary="Two-Factor Authentication"
                secondary="Add an extra layer of security"
              />
              <ListItemSecondaryAction>
                <Button variant="outlined" disabled>
                  Coming Soon
                </Button>
              </ListItemSecondaryAction>
            </ListItem>
            <Divider />
            <ListItem>
              <ListItemIcon>
                <EmailIcon />
              </ListItemIcon>
              <ListItemText
                primary="Email Verification"
                secondary={user?.emailVerified ? "Email verified" : "Verify your email address"}
              />
              <ListItemSecondaryAction>
                {user?.emailVerified ? (
                  <Chip label="Verified" color="success" icon={<VerifiedIcon />} />
                ) : (
                  <Button variant="outlined">
                    Verify
                  </Button>
                )}
              </ListItemSecondaryAction>
            </ListItem>
          </List>
        </TabPanel>

        {/* Preferences Tab */}
        <TabPanel value={tabValue} index={2}>
          <Typography variant="h5" fontWeight="bold" gutterBottom>
            Preferences
          </Typography>
          
          <List>
            <ListItem>
              <ListItemIcon>
                <NotificationsIcon />
              </ListItemIcon>
              <ListItemText
                primary="Email Notifications"
                secondary="Receive email notifications for important updates"
              />
              <ListItemSecondaryAction>
                <Switch
                  checked={preferences.emailNotifications}
                  onChange={handlePreferenceChange('emailNotifications')}
                />
              </ListItemSecondaryAction>
            </ListItem>
            <Divider />
            <ListItem>
              <ListItemIcon>
                <CalendarIcon />
              </ListItemIcon>
              <ListItemText
                primary="Task Reminders"
                secondary="Get reminded about upcoming tasks"
              />
              <ListItemSecondaryAction>
                <Switch
                  checked={preferences.taskReminders}
                  onChange={handlePreferenceChange('taskReminders')}
                />
              </ListItemSecondaryAction>
            </ListItem>
            <Divider />
            <ListItem>
              <ListItemIcon>
                <PaletteIcon />
              </ListItemIcon>
              <ListItemText
                primary="Dark Mode"
                secondary="Use dark theme for the interface"
              />
              <ListItemSecondaryAction>
                <Switch
                  checked={darkMode}
                  onChange={handlePreferenceChange('darkMode')}
                />
              </ListItemSecondaryAction>
            </ListItem>
            <Divider />
            <ListItem>
              <ListItemIcon>
                <EmailIcon />
              </ListItemIcon>
              <ListItemText
                primary="Weekly Reports"
                secondary="Receive weekly productivity reports"
              />
              <ListItemSecondaryAction>
                <Switch
                  checked={preferences.weeklyReport}
                  onChange={handlePreferenceChange('weeklyReport')}
                />
              </ListItemSecondaryAction>
            </ListItem>
            <Divider />
            <ListItem>
              <ListItemIcon>
                <NotificationsIcon />
              </ListItemIcon>
              <ListItemText
                primary="Push Notifications"
                secondary="Receive push notifications on your device"
              />
              <ListItemSecondaryAction>
                <Switch
                  checked={preferences.pushNotifications}
                  onChange={handlePreferenceChange('pushNotifications')}
                />
              </ListItemSecondaryAction>
            </ListItem>
          </List>
        </TabPanel>

        {/* Account Info Tab */}
        <TabPanel value={tabValue} index={3}>
          <Typography variant="h5" fontWeight="bold" gutterBottom>
            Account Information
          </Typography>
          
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Paper sx={{ p: 3, textAlign: 'center' }}>
                <Typography variant="h6" gutterBottom>
                  Account Status
                </Typography>
                <Chip 
                  label={user?.isActive ? "Active" : "Inactive"} 
                  color={user?.isActive ? "success" : "error"}
                  size="large"
                />
              </Paper>
            </Grid>
            <Grid item xs={12} md={6}>
              <Paper sx={{ p: 3, textAlign: 'center' }}>
                <Typography variant="h6" gutterBottom>
                  Member Since
                </Typography>
                <Typography variant="body1">
                  {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}
                </Typography>
              </Paper>
            </Grid>
            <Grid item xs={12}>
              <Paper sx={{ p: 3 }}>
                <Typography variant="h6" gutterBottom>
                  Account Actions
                </Typography>
                <Stack direction="row" spacing={2} flexWrap="wrap">
                  <Button variant="outlined" color="info">
                    Export Data
                  </Button>
                  <Button variant="outlined" color="warning">
                    Deactivate Account
                  </Button>
                  <Button variant="outlined" color="error">
                    Delete Account
                  </Button>
                </Stack>
              </Paper>
            </Grid>
          </Grid>
        </TabPanel>
      </GlassCard>

      {/* Password Change Dialog */}
      <Dialog open={openPasswordDialog} onClose={() => setOpenPasswordDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Change Password</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            label="Current Password"
            type="password"
            value={passwordData.currentPassword}
            onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
            margin="normal"
          />
          <TextField
            fullWidth
            label="New Password"
            type="password"
            value={passwordData.newPassword}
            onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
            margin="normal"
          />
          <TextField
            fullWidth
            label="Confirm New Password"
            type="password"
            value={passwordData.confirmPassword}
            onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
            margin="normal"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenPasswordDialog(false)}>Cancel</Button>
          <Button 
            onClick={handlePasswordChange} 
            variant="contained"
            disabled={loading}
            startIcon={loading ? <CircularProgress size={20} /> : null}
          >
            Change Password
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={handleCloseSnackbar}
      >
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default Profile;
