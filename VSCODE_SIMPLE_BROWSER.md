# Opening the App in VS Code Simple Browser

This guide explains how to run the PWA Builder application and open it in VS Code's Simple Browser.

## Prerequisites

- **Backend**: Python 3.x, pip
- **Frontend**: Node.js, npm or yarn
- **Database**: MongoDB instance (configured in `backend/.env`)

## Quick Start

### Option 1: Using VS Code Tasks (Recommended)

1. **Open Command Palette**: Press `Ctrl+Shift+P` (Windows/Linux) or `Cmd+Shift+P` (Mac)

2. **Run Task**: Type "Tasks: Run Task" and select it

3. **Start Servers**: Select "Start All Servers" from the task list
   - This will start both backend (port 8000) and frontend (port 3000) servers

4. **Open Simple Browser**: 
   - Press `Ctrl+Shift+P` (Windows/Linux) or `Cmd+Shift+P` (Mac)
   - Type "Simple Browser: Show"
   - Enter URL: `http://localhost:3000`

### Option 2: Using Keyboard Shortcut

After starting the servers (see step 3 above):
- Press `Ctrl+Shift+B` to open the app in Simple Browser at `http://localhost:3000`

### Option 3: Manual Setup

1. **Start Backend**:
   ```bash
   cd backend
   pip install -r requirements.txt
   uvicorn server:app --reload --host 0.0.0.0 --port 8000
   ```

2. **Start Frontend** (in a new terminal):
   ```bash
   cd frontend
   npm install
   npm start
   ```

3. **Open Simple Browser**:
   - Press `Ctrl+Shift+P` (Windows/Linux) or `Cmd+Shift+P` (Mac)
   - Type "Simple Browser: Show"
   - Enter URL: `http://localhost:3000`

## Configuration Files

The following VS Code configuration files have been added:

- **`.vscode/tasks.json`**: Defines tasks for starting backend, frontend, and both servers
- **`.vscode/settings.json`**: Configures Simple Browser default URL
- **`.vscode/keybindings.json`**: Adds keyboard shortcut (`Ctrl+Shift+B`) for opening Simple Browser

## Troubleshooting

### Port Already in Use

If you see "port already in use" errors:

**Backend (port 8000)**:
```bash
# Linux/Mac
lsof -ti:8000 | xargs kill -9
# Windows
netstat -ano | findstr :8000
taskkill /PID <PID> /F
```

**Frontend (port 3000)**:
```bash
# Linux/Mac
lsof -ti:3000 | xargs kill -9
# Windows
netstat -ano | findstr :3000
taskkill /PID <PID> /F
```

### Backend Not Starting

Make sure you have:
1. Created `backend/.env` file with MongoDB connection string
2. Installed all Python dependencies: `pip install -r backend/requirements.txt`

### Frontend Not Starting

Make sure you have:
1. Installed all npm dependencies: `cd frontend && npm install`
2. Node.js version 14+ installed

## Features in Simple Browser

When running in VS Code's Simple Browser, you can:
- ✅ View and interact with the PWA Builder interface
- ✅ Test responsive design within VS Code
- ✅ Keep your code and preview side-by-side
- ✅ Quickly iterate on changes without leaving the editor

## Additional Commands

### Stop All Tasks
- Press `Ctrl+Shift+P` (Windows/Linux) or `Cmd+Shift+P` (Mac)
- Type "Tasks: Terminate Task"
- Select the task to stop

### Restart Servers
1. Terminate existing tasks (see above)
2. Run "Start All Servers" task again

## Environment Variables

Ensure `backend/.env` contains:
```env
MONGO_URL=mongodb://localhost:27017
DB_NAME=pwa_builder
ALLOWED_ORIGINS=http://localhost:3000,http://127.0.0.1:3000
```

Adjust the values based on your setup.
