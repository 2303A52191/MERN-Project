# TaskFlow - MERN Project Management Tool

TaskFlow is a Kanban-based project management dashboard built using MongoDB, Express, React, and Node.js. It features a dark UI, task status tracking, activity logs, and project assignment capabilities.

## Features

- **Kanban Board:** Drag and drop tasks across columns: Backlog, Todo, In Progress, Review, and Done.
- **Activity Log:** A running feed showing recent actions taken by team members.
- **Project Workspaces:** Create projects, set due dates, and add members.
- **Statistics Dashboard:** Simple charts showing task distribution by priority and status.
- **Role Permissions:** Different access levels for Admins, Managers, and Team Members.

## Stack

- **Frontend:** React, Vite, Tailwind CSS, Recharts, Lucide Icons, Axios.
- **Backend:** Node.js, Express, Mongoose (MongoDB).
- **Auth:** JWT and cookie-based sessions.

## Setup Instructions

### 1. Environment Config

Create a `.env` file in the `server` directory:
```env
PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/taskflow
JWT_SECRET=some_random_secret_string
CLIENT_URL=http://localhost:5173
NODE_ENV=development
```

Create a `.env` file in the `client` directory:
```env
VITE_API_URL=http://localhost:5000/api
```

### 2. Run Locally

Install all dependencies and run both servers concurrently from the root folder:

```bash
# Install dependencies for both frontend and backend
npm run install-all

# Start local development servers
npm run dev
```

The frontend will run at `http://localhost:5173` and the backend server at `http://localhost:5000`.

## API Routes

### Auth
- `POST /api/auth/register` - Create user account.
- `POST /api/auth/login` - Authenticate user.
- `POST /api/auth/logout` - Clear session.
- `GET /api/auth/me` - Get active session data.

### Projects
- `GET /api/projects` - Get all projects.
- `POST /api/projects` - Create new project.
- `GET /api/projects/:id` - Get project details.
- `DELETE /api/projects/:id` - Delete project.

### Tasks
- `POST /api/tasks` - Create a task.
- `GET /api/tasks/project/:projectId` - Get tasks for a project.
- `PATCH /api/tasks/:id/status` - Update task status.
- `DELETE /api/tasks/:id` - Delete a task.
