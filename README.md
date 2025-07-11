# Task Management System

A modern, professional task management application built with React, Material-UI, and MongoDB.

## Features

- 📋 Create, read, update, and delete tasks
- 🏷️ Task categories and priority levels
- 👥 User authentication and authorization
- 📊 Dashboard with task statistics
- 🔍 Search and filter functionality
- 📱 Responsive design
- 🎨 Modern Material-UI components

## Tech Stack

### Frontend
- React 18
- Material-UI (MUI) v5
- React Router v6
- Axios for API calls
- React Hook Form for form handling
- Date-fns for date formatting

### Backend
- Node.js
- Express.js
- MongoDB with Mongoose
- JWT for authentication
- bcryptjs for password hashing
- CORS for cross-origin requests

## Project Structure

```
task-management-system/
├── client/                     # React frontend
│   ├── public/
│   ├── src/
│   │   ├── components/         # Reusable UI components
│   │   ├── pages/             # Page components
│   │   ├── context/           # React Context
│   │   ├── hooks/             # Custom hooks
│   │   ├── services/          # API services
│   │   ├── utils/             # Utility functions
│   │   └── theme/             # Material-UI theme
│   └── package.json
├── server/                     # Node.js backend
│   ├── controllers/           # Route controllers
│   ├── models/               # Database models
│   ├── routes/               # API routes
│   ├── middleware/           # Custom middleware
│   ├── config/               # Configuration files
│   └── package.json
└── README.md
```

## Getting Started

### Prerequisites
- Node.js (v16 or higher)
- MongoDB (local or cloud instance)

### Installation

1. Clone the repository
2. Install dependencies for both client and server
3. Set up environment variables
4. Start the development servers

Detailed setup instructions will be provided in individual README files for client and server.
