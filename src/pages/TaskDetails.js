import React from 'react';
import {
  Container,
  Typography,
  Box,
  Card,
  CardContent,
} from '@mui/material';

const TaskDetails = () => {
  return (
    <Container maxWidth="lg">
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom fontWeight="bold">
          Task Details
        </Typography>
        <Typography variant="h6" color="text.secondary">
          View and edit task details
        </Typography>
      </Box>

      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Task Details View
          </Typography>
          <Typography variant="body2" color="text.secondary">
            This page will show detailed information about a specific task,
            including options to edit, delete, or update the task status.
          </Typography>
        </CardContent>
      </Card>
    </Container>
  );
};

export default TaskDetails;
