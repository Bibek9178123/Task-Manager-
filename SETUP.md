# Task Management System Setup Guide

## Prerequisites

1. **Node.js** (v16 or higher) - [Download here](https://nodejs.org/)
2. **MongoDB** - Choose one of the following options:

## MongoDB Setup Options

### Option 1: Local MongoDB Installation

1. **Download and Install MongoDB Community Server**
   - Visit [MongoDB Download Center](https://www.mongodb.com/try/download/community)
   - Download the Windows installer
   - Run the installer and follow the setup wizard
   - Install MongoDB as a Windows Service (recommended)

2. **Verify Installation**
   ```powershell
   # Check if MongoDB is running
   Get-Service -Name MongoDB
   
   # Or check the process
   Get-Process -Name mongod
   ```

3. **Start MongoDB (if not running as service)**
   ```powershell
   # Navigate to MongoDB bin directory (usually)
   cd "C:\Program Files\MongoDB\Server\7.0\bin"
   
   # Start MongoDB
   ./mongod.exe --dbpath "C:\data\db"
   ```

### Option 2: MongoDB Atlas (Cloud - Recommended for beginners)

1. **Create a free MongoDB Atlas account**
   - Visit [MongoDB Atlas](https://www.mongodb.com/atlas)
   - Sign up for a free account
   - Create a new cluster (free tier available)

2. **Get Connection String**
   - Click "Connect" on your cluster
   - Choose "Connect your application"
   - Copy the connection string
   - Replace `<password>` with your database user password

3. **Update Environment Variables**
   - Update `server/.env` file with your Atlas connection string:
   ```
   MONGODB_URI=mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/taskmanagement?retryWrites=true&w=majority
   ```

### Option 3: Docker (Alternative)

```powershell
# Pull MongoDB image
docker pull mongo:latest

# Run MongoDB container
docker run -d --name mongodb -p 27017:27017 -e MONGO_INITDB_ROOT_USERNAME=admin -e MONGO_INITDB_ROOT_PASSWORD=password mongo:latest
```

## Installation Steps

### 1. Install Dependencies

```powershell
# Install server dependencies
cd server
npm install

# Install client dependencies
cd ../client
npm install
```

### 2. Environment Setup

Copy the environment file:
```powershell
cd ../server
copy .env.example .env
```

Edit the `.env` file with your configuration:
- Set `MONGODB_URI` to your MongoDB connection string
- Change `JWT_SECRET` to a secure random string
- Update other settings as needed

### 3. Start the Application

**Terminal 1 - Start Backend Server:**
```powershell
cd server
npm run dev
```

**Terminal 2 - Start Frontend Client:**
```powershell
cd client
npm start
```

### 4. Access the Application

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5000
- **API Health Check**: http://localhost:5000/api/health

## Default User Account

For testing, you can create an account through the registration form, or use these demo credentials if you seed the database:

- **Email**: demo@taskmanager.com
- **Password**: demo123

## Troubleshooting

### MongoDB Connection Issues

1. **Check if MongoDB is running:**
   ```powershell
   Get-Service -Name MongoDB
   ```

2. **Check MongoDB logs:**
   ```powershell
   # Look for mongod.log in MongoDB installation directory
   Get-Content "C:\Program Files\MongoDB\Server\7.0\log\mongod.log" -Tail 20
   ```

3. **Test connection manually:**
   ```powershell
   # Install MongoDB tools if not already installed
   mongo --version
   
   # Connect to local MongoDB
   mongo mongodb://localhost:27017/taskmanagement
   ```

### Port Issues

If ports 3000 or 5000 are in use:

1. **Check what's using the port:**
   ```powershell
   netstat -ano | findstr :3000
   netstat -ano | findstr :5000
   ```

2. **Kill the process or change ports in configuration**

### Node.js Issues

1. **Check Node.js version:**
   ```powershell
   node --version
   npm --version
   ```

2. **Clear npm cache if having issues:**
   ```powershell
   npm cache clean --force
   ```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user
- `PUT /api/auth/profile` - Update profile
- `PUT /api/auth/change-password` - Change password

### Tasks
- `GET /api/tasks` - Get all tasks (with filters)
- `GET /api/tasks/stats` - Get task statistics
- `GET /api/tasks/:id` - Get single task
- `POST /api/tasks` - Create new task
- `PUT /api/tasks/:id` - Update task
- `DELETE /api/tasks/:id` - Delete task
- `PATCH /api/tasks/:id/toggle` - Toggle task completion

## Next Steps

1. Start both servers (backend and frontend)
2. Open http://localhost:3000 in your browser
3. Register a new account or use demo credentials
4. Start creating and managing tasks!

## Development

For development with auto-reload:
- Backend: `npm run dev` (uses nodemon)
- Frontend: `npm start` (uses React dev server)

## Production Deployment

For production deployment, you'll need to:
1. Build the React app: `npm run build` in client directory
2. Set up proper environment variables
3. Use a process manager like PM2 for the Node.js server
4. Set up a reverse proxy (nginx/Apache)
5. Use a production MongoDB instance
