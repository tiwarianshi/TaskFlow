# TaskFlow

TaskFlow is a full-stack productivity and project management application built for teams that need a clean way to organize boards, tasks, members, comments, activity, notifications, and calendar-based work. It combines a React frontend with an Express and MongoDB backend, plus real-time collaboration through Socket.IO.

## Overview

TaskFlow helps users create boards, manage tasks visually, collaborate with members, track activity, and stay updated through notifications. The app includes authentication, protected routes, profile settings, password reset, drag-and-drop task movement, task comments, activity timelines, and a calendar view.

## Features

- User registration, login, logout, and JWT-based protected routes
- Forgot password and reset password email flow
- Profile update and password change from settings
- Board creation, filtering, searching, and analytics
- Board member collaboration and invite/member UI
- Task creation, editing, sorting, priority badges, due dates, and assignees
- Drag-and-drop task workflow with status columns
- Task comments and activity timeline
- Real-time board/task collaboration with Socket.IO
- Notification bell, dropdown, read state, and notification feed
- Calendar view for scheduled and due-date-based work
- Centralized API clients and reusable React hooks
- Responsive dashboard-style user interface

## Tech Stack

**Frontend**

- React 19
- Vite
- React Router
- Axios
- Socket.IO Client
- dnd-kit / hello-pangea DnD
- Lucide React
- React Hot Toast
- Tailwind CSS / CSS modules

**Backend**

- Node.js
- Express
- MongoDB
- Mongoose
- JWT authentication
- bcryptjs password hashing
- Socket.IO
- Nodemailer
- dotenv

## Project Structure

```text
TaskFlow/
  client/
    src/
      api/                 API clients and Axios configuration
      components/          Reusable UI components
      context/             Auth context
      hooks/               Custom data and feature hooks
      pages/               Main application pages
      routes/              Protected route handling
      socket/              Socket.IO client setup
      utils/               Shared frontend helpers
    package.json
    vite.config.js

  server/
    config/                Database connection
    controllers/           Request handlers
    middleware/            Auth and error middleware
    models/                Mongoose schemas
    routes/                API route definitions
    socket/                Socket.IO server handlers
    utils/                 Tokens, emails, stats, notifications
    server.js
    package.json
```

## Getting Started

### Prerequisites

Install the following before running the project:

- Node.js
- npm
- MongoDB Atlas account or local MongoDB server

### 1. Clone the Repository

```bash
git clone <your-repository-url>
cd TaskFlow
```

### 2. Install Dependencies

Install backend dependencies:

```bash
cd server
npm install
```

Install frontend dependencies:

```bash
cd ../client
npm install
```

## Environment Variables

### Backend Environment

Create a `.env` file inside `server/`.

```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
CLIENT_URL=http://localhost:5173

EMAIL_HOST=smtp.example.com
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USER=your_email@example.com
EMAIL_PASS=your_email_password_or_app_password
EMAIL_FROM=TaskFlow <your_email@example.com>
```

### Frontend Environment

Create a `.env` file inside `client/`.

```env
VITE_API_URL=http://localhost:5000/api
VITE_SOCKET_URL=http://localhost:5000
```

## Running the App Locally

Start the backend:

```bash
cd server
npm run dev
```

The backend runs on:

```text
http://localhost:5000
```

Start the frontend in a second terminal:

```bash
cd client
npm run dev
```

The frontend runs on:

```text
http://localhost:5173
```

## Available Scripts

### Client

```bash
npm run dev       # Start Vite development server
npm run build     # Create production build
npm run preview   # Preview production build
npm run lint      # Run ESLint
```

### Server

```bash
npm run dev       # Start backend with nodemon
npm start         # Start backend with Node
npm test          # Placeholder test script
```

## API Overview

The backend exposes REST APIs under `/api`.

```text
GET    /                         API health check
POST   /api/auth/register        Register user
POST   /api/auth/login           Login user
POST   /api/auth/forgot-password Request password reset
POST   /api/auth/reset-password/:token
PUT    /api/auth/profile         Update profile
PUT    /api/auth/password        Change password

/api/boards                      Board management
/api/tasks                       Task management
/api/notifications               Notifications
/api/calendar                    Calendar data
/api/settings                    User settings
```

Protected endpoints require a JWT token in the Authorization header:

```text
Authorization: Bearer <token>
```

## Real-Time Collaboration

TaskFlow uses Socket.IO for real-time board updates. The client connects to the backend socket server using the logged-in user's token and listens for board/task/member updates so users can collaborate without manually refreshing the page.

## Authentication Flow

1. User registers or logs in.
2. Backend validates credentials and returns a JWT.
3. Frontend stores the token and attaches it to future API requests.
4. Protected routes and backend middleware verify the token.
5. Invalid or expired tokens redirect the user back to login.

## Deployment Notes

The frontend includes Vercel configuration and can be deployed as a Vite app. The backend can be deployed to Node-compatible platforms such as Render, Railway, or similar services.

For production:

- Set `VITE_API_URL` to the deployed backend API URL.
- Set `VITE_SOCKET_URL` to the deployed backend base URL.
- Set `CLIENT_URL` on the backend to the deployed frontend URL.
- Add the deployed frontend URL to allowed CORS origins if needed.
- Use a secure `JWT_SECRET`.
- Use MongoDB Atlas or another hosted MongoDB service.
- Configure SMTP credentials for password reset emails.

## Future Improvements

## Future Improvements

* Role-based access control (Admin/Member/Viewer)
* File attachments and document sharing
* Email and push notifications
* Google/GitHub OAuth integration
* Advanced search and filtering
* Recurring tasks and task templates
* Offline support with synchronization


## Author

Built by Anshi Tiwari as a full-stack TaskFlow project.
