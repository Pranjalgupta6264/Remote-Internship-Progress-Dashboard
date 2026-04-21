# Internship Dashboard

Internship Dashboard is a full-stack role-based platform for managing internship workflows across Admin, Mentor, and Intern users. It includes authentication, task management, report submission and review, feedback loops, notifications, and analytics dashboards.

## Features

### Admin
- Manage users and roles
- View admin-level analytics
- Access admin dashboard and settings

### Mentor
- Track intern tasks in kanban view
- Review intern reports and provide feedback
- View mentor analytics and notifications

### Intern
- View assigned tasks and progress
- Submit reports
- Receive feedback and notifications
- View personal analytics

## Tech Stack

- **Frontend:** Next.js (App Router), React, TypeScript, Zustand, Axios, Tailwind CSS
- **Backend:** FastAPI, SQLAlchemy, Pydantic, JWT auth
- **Database:** SQLite (default), configurable via `DATABASE_URL`
- **Realtime:** WebSockets for notifications

## Project Structure

```text
Internship-Dashboard/
  backend/        # FastAPI app, models, routers, auth, seed script
  frontend/       # Next.js app (role-based dashboards and UI components)
  README.md       # Submission-ready project documentation
```

## Setup Instructions

### 1) Clone and install dependencies

#### Backend
```bash
cd backend
python -m venv .venv
# Windows
.venv\Scripts\activate
# macOS/Linux
source .venv/bin/activate
pip install -r requirements.txt
```

#### Frontend
```bash
cd frontend
npm install
```

### 2) Configure environment variables

#### Backend
```bash
cd backend
copy .env.example .env
```

#### Frontend
```bash
cd frontend
copy .env.example .env.local
```

### 3) Seed sample users

```bash
cd backend
python -m app.seed
```

### 4) Run the apps

#### Backend
```bash
cd backend
python -m uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
```

#### Frontend
```bash
cd frontend
npm run dev
```

Open `http://localhost:3000`.

## Environment Variables

### Backend (`backend/.env`)
- `DATABASE_URL` - SQLAlchemy connection string (default sqlite)
- `SECRET_KEY` - JWT signing key (required)

### Frontend (`frontend/.env.local`)
- `NEXT_PUBLIC_API_URL` - Backend REST API base URL
- `NEXT_PUBLIC_WS_URL` - WebSocket URL template (must include `{userId}`)

## Sample Login Credentials

After running the seed script:

- Admin: `admin@test.com` / `admin123`
- Mentor: `mentor@test.com` / `mentor123`
- Intern: `intern@test.com` / `intern123`

## Quality Checks

```bash
# Frontend lint
cd frontend && npm run lint

# Frontend build + type check
cd frontend && npm run build

# Backend import/startup sanity check
cd backend && python -c "import app.main; print('backend import ok')"
```

# project Video Link on Drive
https://drive.google.com/file/d/1raM9MBo6RwcJ6rYpZC9uKibAXK2oOQMy/view?usp=drive_link
