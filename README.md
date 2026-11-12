# MERN Stack Task Management System

A full-stack task management application built using the MERN stack, featuring role-based access, task assignment, progress tracking, file attachments, and reporting.

## Overview

The Task Management System helps administrators manage users and tasks while allowing team members to track and update their assigned work through dedicated dashboards.

## Features

### Authentication and Authorization
- User registration and login
- JWT-based authentication
- Protected API routes
- Role-based access control (Admin and Member)

### Task Management
- Create, view, update, and delete tasks
- Assign tasks to multiple team members
- Set task priorities, statuses, and due dates
- Manage task checklists
- Automatic task progress tracking

### Dashboards
- Separate Admin and Member dashboards
- Task statistics and progress summaries
- User and task management

### Additional Features
- Search, filtering, and pagination
- File attachments with upload and download
- Excel export for task and user reports
- Responsive React interface

## Tech Stack

| Area | Technologies |
|---|---|
| Frontend | React.js, Vite, Tailwind CSS |
| Backend | Node.js, Express.js |
| Database | MongoDB, Mongoose |
| Authentication | JSON Web Token (JWT), bcryptjs |
| File Uploads | Multer |
| Reports | ExcelJS |
| HTTP Client | Axios |

## Project Structure

```text
TASKMANAGER/
├── backend/
│   ├── config/
│   ├── controllers/
│   ├── middlewares/
│   ├── models/
│   ├── routes/
│   ├── server.js
│   └── package.json
│
├── frontend/
│   └── Task-Manager/
│       ├── public/
│       ├── src/
│       ├── package.json
│       └── vite.config.js
│
└── README.md
```

## Getting Started

### Prerequisites

- Node.js and npm
- MongoDB database
- Git

### 1. Clone the repository

```bash
git clone https://github.com/Pavithra64-hub/task-manager.git
cd task-manager
```

### 2. Configure the backend

```bash
cd backend
npm install
```

Create a `.env` file inside the `backend` directory:

```env
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_secure_jwt_secret
ADMIN_INVITE_TOKEN=your_admin_invite_token
PORT=8000
```

Use your own credentials. Never commit your `.env` file.

### 3. Start the backend

```bash
npm run dev
```

The backend uses port `8000` by default.

### 4. Configure the frontend

Open another terminal:

```bash
cd frontend/Task-Manager
npm install
npm run dev
```

The Vite development server normally runs at:

```text
http://localhost:5173
```

The frontend API client is configured to use:

```text
http://localhost:8000/api
```

Make sure the backend is running and MongoDB is connected.

## User Roles

**Admin**
- Manage users and tasks
- Assign tasks to team members
- Monitor task progress
- Export reports

**Member**
- View assigned tasks
- Update task status
- Update checklist progress
- Access permitted task attachments

## Future Improvements

- Cloud deployment
- Automated testing
- Real-time task notifications
- Enhanced analytics and reporting

## Author

**Pavithra**

GitHub: [Pavithra64-hub](https://github.com/Pavithra64-hub)

---

This project was developed as a full-stack MERN application to demonstrate frontend development, REST API development, database integration, authentication, and role-based access control.
