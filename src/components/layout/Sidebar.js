import React from 'react';
import { List, ListItem, ListItemIcon, ListItemText } from '@mui/material';
import ListAltIcon from '@mui/icons-material/ListAlt';
import EventNoteIcon from '@mui/icons-material/EventNote';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import DashboardIcon from '@mui/icons-material/Dashboard';
import LightbulbIcon from '@mui/icons-material/Lightbulb';
import { useNavigate } from 'react-router-dom';

const Sidebar = ({ onItemClick }) => {
  const navigate = useNavigate();

  const menuItems = [
    { text: 'Dashboard', icon: <DashboardIcon />, path: '/dashboard' },
    { text: 'Tasks', icon: <ListAltIcon />, path: '/tasks' },
    { text: 'Calendar', icon: <EventNoteIcon />, path: '/calendar' },
    { text: 'Profile', icon: <AccountCircleIcon />, path: '/profile' },
    { text: 'AI Insights', icon: <LightbulbIcon />, path: '/ai-insights' },
  ];

  const handleItemClick = (path) => {
    navigate(path);
    if (onItemClick) onItemClick();
  };

  return (
    <List>
      {menuItems.map((item) => (
        <ListItem button key={item.text} onClick={() => handleItemClick(item.path)}>
          <ListItemIcon>{item.icon}</ListItemIcon>
          <ListItemText primary={item.text} />
        </ListItem>
      ))}
    </List>
  );
};

export default Sidebar;

