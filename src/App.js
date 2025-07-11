import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import CssBaseline from '@mui/material/CssBaseline';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Context
import { AuthProvider } from './context/AuthContext';
import { TaskProvider } from './context/TaskContext';
import { ThemeProvider } from './context/ThemeContext';

// Components
import ProtectedRoute from './components/auth/ProtectedRoute';
import Layout from './components/layout/Layout';

// Pages
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import TaskList from './pages/TaskList';
import TaskDetails from './pages/TaskDetails';
import Profile from './pages/Profile';
import Calendar from './pages/Calendar';
import AiInsightsDashboard from './components/ai/AiInsightsDashboard';

function App() {
  return (
    <ThemeProvider>
      <CssBaseline />
      <AuthProvider>
        <TaskProvider>
          <Router future={{ v7_relativeSplatPath: true }}>
            <Routes>
              {/* Public Routes */}
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              
              {/* Protected Routes */}
              <Route path="/" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
                <Route index element={<Navigate to="/dashboard" replace />} />
                <Route path="dashboard" element={<Dashboard />} />
                <Route path="tasks" element={<TaskList />} />
                <Route path="tasks/:id" element={<TaskDetails />} />
                <Route path="calendar" element={<Calendar />} />
                <Route path="profile" element={<Profile />} />
                <Route path="ai-insights" element={<AiInsightsDashboard />} />
              </Route>
              
              {/* Fallback */}
              <Route path="*" element={<Navigate to="/dashboard" replace />} />
            </Routes>
          </Router>
          
          <ToastContainer
            position="top-right"
            autoClose={3000}
            hideProgressBar={false}
            newestOnTop={false}
            closeOnClick
            rtl={false}
            pauseOnFocusLoss
            draggable
            pauseOnHover
            theme="colored"
          />
        </TaskProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
