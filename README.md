# TaskFlow AI — Project Management & Team Collaboration Platform

TaskFlow AI is a high-fidelity, modern SaaS project management platform built on the MERN stack (MongoDB, Express, React, Node.js). Featuring a premium, dark-mode first glassmorphic design, the platform delivers fluid Kanban workflows, interactive project boards, live activity logs, and real-time collaboration widgets.

---

## ⚡ Key Features

* **Premium Glassmorphic Design:** A modern dark interface with vibrant glowing backdrops, high-contrast panels, and clean text inputs designed for readability and focus.
* **Kanban Board:** High-fidelity interactive board columns (Backlog, Todo, In Progress, Review, Done) with seamless HTML5 drag-and-drop actions.
* **Real-Time Activity Feed:** Scrollable logs showing recent team updates, comments, status changes, and workspace additions.
* **Workspace Analytics:** Visual priority workload distributions and status shares powered by Recharts.
* **Role-Based Access (RBAC):** Tiered permissions for Admins, Managers, and Team Members to manage assignments and task status.
* **Secure JWT Session Auth:** HTTPOnly cookie-based sessions with fallback authorization headers.

---

## 🛠️ Tech Stack

* **Frontend:** Vite, React.js, Tailwind CSS, Lucide Icons, Recharts, Axios
* **Backend:** Node.js, Express.js, Mongoose, MongoDB
* **Security:** JWT, Bcrypt.js, Cookie-Parser, CORS

---

## 📂 Project Structure

```text
TaskFlow-AI/
├── client/                 # React Frontend
│   ├── src/
│   │   ├── components/     # Modals, Tables, Skeletons
│   │   ├── context/        # Auth, Theme contexts
│   │   ├── layouts/        # Dashboard layout wrapping private views
│   │   ├── pages/          # Dashboard, Projects, Team views
│   │   ├── services/       # Axios API client setup
│   │   └── main.jsx        # App bootstrap entry
│   └── package.json
│
└── server/                 # Express Backend API
    ├── config/             # Mongoose DB connection
    ├── controllers/        # Auth, Project, Task, Comment controllers
    ├── middleware/         # Auth verification and Error handling
    ├── models/             # User, Project, Task, Comment schemas
    ├── routes/             # API Endpoints
    ├── server.js           # Express server bootstrap
    └── package.json
```

---

## 🚀 Installation & Local Setup

### Prerequisites
* Node.js (v18+)
* MongoDB Community Server or MongoDB Atlas account

### 1. Configure Environment Variables

#### Backend (`server/.env`):
Create a `.env` file in the `server` directory:
```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key
CLIENT_URL=http://localhost:5173
NODE_ENV=development
```

#### Frontend (`client/.env`):
Create a `.env` file in the `client` directory:
```env
VITE_API_URL=http://localhost:5000/api
```

### 2. Install Dependencies & Launch

From the root directory, install dependencies and run both servers concurrently:

```bash
# Install dependencies for both client and server
npm run install-all

# Start both services concurrently in development mode
npm run dev
```

The frontend will run at `http://localhost:5173` and the API server at `http://localhost:5000`.

---

## 🌐 API Reference

### 🔑 Authentication (`/api/auth`)
* `POST /api/auth/register` — Create a new account.
* `POST /api/auth/login` — Access existing account.
* `POST /api/auth/logout` — Clear session cookies.
* `GET /api/auth/me` — Retrieve current authenticated profile.

### 📂 Projects (`/api/projects`)
* `GET /api/projects` — Fetch all accessible project workspaces.
* `POST /api/projects` — Create a project workspace.
* `GET /api/projects/:id` — Get project details.
* `DELETE /api/projects/:id` — Delete project and cascaded tasks.

### ⚡ Tasks (`/api/tasks`)
* `POST /api/tasks` — Create task within a project.
* `GET /api/tasks/project/:projectId` — Fetch tasks belonging to a project.
* `PATCH /api/tasks/:id/status` — Modify task column status (drag-and-drop).
* `DELETE /api/tasks/:id` — Remove task.
