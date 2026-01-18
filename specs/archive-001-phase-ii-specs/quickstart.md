# Quick Start Guide: Phase II Todo Application

**Version**: 1.0.0
**Created**: 2026-01-07
**Feature**: `001-phase-ii-specs`
**Target Audience**: Developers setting up local development environment

---

## Overview

This guide will help you set up the Phase II Todo Application on your local machine. The application consists of three main components:

- **Frontend**: Next.js 15 App Router with Better Auth (TypeScript)
- **Backend**: FastAPI with SQLModel (Python 3.11+)
- **Database**: Neon Serverless PostgreSQL

**Estimated Setup Time**: 15-20 minutes

---

## Prerequisites

### Required Software

| Tool | Version | Installation | Verification |
|------|---------|--------------|--------------|
| **Node.js** | 18.17.0+ or 20.x+ | [nodejs.org](https://nodejs.org) | `node --version` |
| **Python** | 3.11+ | [python.org](https://python.org) | `python --version` |
| **uv** (Python package manager) | Latest | `curl -LsSf https://astral.sh/uv/install.sh \| sh` | `uv --version` |
| **Git** | Latest | [git-scm.com](https://git-scm.com) | `git --version` |
| **PostgreSQL Client** (optional) | 14+ | [postgresql.org](https://postgresql.org) | `psql --version` |

### Recommended Tools

- **Code Editor**: VS Code with extensions (TypeScript, Python, Tailwind CSS IntelliSense)
- **API Testing**: Thunder Client (VS Code extension) or Postman
- **Terminal**: iTerm2 (macOS), Windows Terminal (Windows), or default terminal

---

## Project Structure

```
Todo-App-/
├── backend/                 # FastAPI backend
│   ├── app/
│   │   ├── main.py          # FastAPI app entry point
│   │   ├── database.py      # Neon DB connection
│   │   ├── auth.py          # JWT verification
│   │   ├── models/          # SQLModel & Pydantic models
│   │   │   ├── user.py
│   │   │   └── task.py
│   │   └── routes/          # API endpoints
│   │       ├── auth.py
│   │       └── tasks.py
│   ├── migrations/          # Database migrations
│   ├── tests/               # Backend tests
│   ├── .env                 # Backend environment variables
│   ├── pyproject.toml       # Python dependencies (uv)
│   └── README.md
│
├── frontend/                # Next.js frontend
│   ├── app/                 # Next.js App Router pages
│   │   ├── layout.tsx
│   │   ├── page.tsx
│   │   ├── login/
│   │   ├── signup/
│   │   └── dashboard/
│   ├── components/          # React components
│   │   ├── auth/
│   │   │   ├── LoginForm.tsx
│   │   │   ├── SignupForm.tsx
│   │   │   └── AuthGuard.tsx
│   │   └── tasks/
│   │       ├── TaskList.tsx
│   │       ├── TaskItem.tsx
│   │       ├── TaskForm.tsx
│   │       └── TaskDeleteConfirm.tsx
│   ├── lib/                 # Utilities and configuration
│   │   ├── auth.ts          # Better Auth configuration
│   │   ├── api-client.ts    # API fetch wrapper
│   │   └── types.ts         # TypeScript interfaces
│   ├── .env.local           # Frontend environment variables
│   ├── package.json
│   ├── tsconfig.json
│   ├── tailwind.config.ts
│   └── README.md
│
└── specs/                   # Technical specifications
    ├── database/
    │   └── schema.md
    ├── api/
    │   └── rest-endpoints.md
    ├── skills/
    │   └── auth-bridge.md
    ├── ui/
    │   └── components.md
    └── 001-phase-ii-specs/
        ├── spec.md
        ├── plan.md
        ├── data-model.md
        ├── quickstart.md (this file)
        └── contracts/
            ├── auth-openapi.yaml
            └── tasks-openapi.yaml
```

---

## Step 1: Clone Repository

```bash
# Clone the repository (if not already cloned)
git clone <repository-url> Todo-App-
cd Todo-App-

# Create feature branch (if working on a specific feature)
git checkout -b 001-phase-ii-specs
```

---

## Step 2: Database Setup (Neon PostgreSQL)

### 2.1 Create Neon Account and Database

1. **Sign up** at https://neon.tech (free tier available)
2. **Create a new project** with name `todo-app-dev`
3. **Create a database** named `todoapp` (or use default `neondb`)
4. **Copy connection string** from Neon dashboard:
   ```
   postgresql://[user]:[password]@[host]/[dbname]?sslmode=require
   ```

**Example connection string**:
```
postgresql://todo_user:abc123xyz@ep-cool-cloud-12345.us-east-1.aws.neon.tech/todoapp?sslmode=require
```

### 2.2 Apply Database Migrations

**Option A: Using `psql` (recommended for initial setup)**

```bash
# Set environment variable
export DATABASE_URL="postgresql://user:pass@host/db?sslmode=require"

# Apply migration
psql $DATABASE_URL -f backend/migrations/001_initial_schema.sql

# Verify tables created
psql $DATABASE_URL -c "\dt"

# Expected output:
#          List of relations
#  Schema |  Name  | Type  |   Owner
# --------+--------+-------+-----------
#  public | tasks  | table | todo_user
#  public | users  | table | todo_user
```

**Option B: Using Python (via SQLModel - will be implemented later)**

```python
# backend/app/database.py
from sqlmodel import SQLModel, create_engine

engine = create_engine(DATABASE_URL)
SQLModel.metadata.create_all(engine)  # Creates tables from models
```

---

## Step 3: Backend Setup (FastAPI)

### 3.1 Navigate to Backend Directory

```bash
cd backend
```

### 3.2 Create Virtual Environment with `uv`

```bash
# Initialize project with uv (if not already done)
uv init

# Install dependencies (will create .venv and install packages)
uv sync

# Activate virtual environment
# On macOS/Linux:
source .venv/bin/activate

# On Windows:
.venv\Scripts\activate
```

### 3.3 Configure Environment Variables

Create `.env` file in `backend/` directory:

```bash
# backend/.env

# Database
DATABASE_URL=postgresql://user:pass@host/db?sslmode=require

# Authentication (shared with frontend!)
BETTER_AUTH_SECRET=<generate-with-openssl-rand-base64-64>

# CORS (allow frontend origin)
ALLOWED_ORIGINS=http://localhost:3000

# Server
HOST=0.0.0.0
PORT=8000
```

**Generate `BETTER_AUTH_SECRET`**:
```bash
openssl rand -base64 64 | tr -d '\n'
# Example output: A8g4JtZ2mN9xP5wQ7rS3uV6yC8eH1kL4oP9qR2tU5xA7yB9zA1cD3fE6gH8jK0mN2pQ4sT6vX9zB1dF3gJ5lM7nP
```

### 3.4 Run Backend Server

```bash
# From backend/ directory with virtual environment activated
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000

# Expected output:
# INFO:     Will watch for changes in these directories: ['/path/to/backend']
# INFO:     Uvicorn running on http://0.0.0.0:8000 (Press CTRL+C to quit)
# INFO:     Started reloader process [12345] using StatReload
# INFO:     Started server process [12346]
# INFO:     Waiting for application startup.
# INFO:     Application startup complete.
```

### 3.5 Verify Backend is Running

**Test Health Endpoint**:
```bash
curl http://localhost:8000/health

# Expected response:
# {"status": "healthy", "database": "connected"}
```

**Browse API Documentation**:
- **Swagger UI**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc

---

## Step 4: Frontend Setup (Next.js)

### 4.1 Navigate to Frontend Directory

```bash
# Open a new terminal window/tab
cd frontend
```

### 4.2 Install Dependencies

```bash
# Using npm
npm install

# Or using pnpm (faster)
pnpm install

# Or using yarn
yarn install
```

### 4.3 Configure Environment Variables

Create `.env.local` file in `frontend/` directory:

```bash
# frontend/.env.local

# Database (for Better Auth - same as backend)
DATABASE_URL=postgresql://user:pass@host/db?sslmode=require

# Authentication (MUST match backend secret!)
BETTER_AUTH_SECRET=<same-secret-as-backend>

# Backend API URL
NEXT_PUBLIC_API_URL=http://localhost:8000

# Node environment
NODE_ENV=development
```

**CRITICAL**: `BETTER_AUTH_SECRET` MUST be identical in both frontend and backend `.env` files!

### 4.4 Run Frontend Development Server

```bash
# From frontend/ directory
npm run dev

# Or with pnpm
pnpm dev

# Or with yarn
yarn dev

# Expected output:
#   ▲ Next.js 15.x.x
#   - Local:        http://localhost:3000
#   - Ready in 1.2s
```

### 4.5 Verify Frontend is Running

**Open in Browser**:
```
http://localhost:3000
```

You should see the landing page with links to:
- `/login` - Login page
- `/signup` - Registration page
- `/dashboard` - Protected dashboard (redirects to login if not authenticated)

---

## Step 5: End-to-End Verification

### 5.1 Test User Registration

**Option A: Using Frontend UI**

1. Navigate to http://localhost:3000/signup
2. Enter email: `test@example.com`
3. Enter password: `TestPass123!`
4. Click "Sign Up"
5. You should be redirected to `/dashboard` with a success message

**Option B: Using cURL**

```bash
curl -X POST http://localhost:8000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "TestPass123!"
  }'

# Expected response (201 Created):
# {
#   "id": "550e8400-e29b-41d4-a716-446655440000",
#   "email": "test@example.com",
#   "created_at": "2026-01-07T12:00:00Z"
# }
```

### 5.2 Test User Login

**Using cURL**:
```bash
curl -X POST http://localhost:8000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "TestPass123!"
  }'

# Expected response (200 OK):
# {
#   "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
#   "token_type": "bearer",
#   "user": {
#     "id": "550e8400-e29b-41d4-a716-446655440000",
#     "email": "test@example.com"
#   }
# }
```

**Save the `access_token` for next steps**:
```bash
export TOKEN="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

### 5.3 Test Task Creation

```bash
curl -X POST http://localhost:8000/api/tasks \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Test task",
    "description": "Verify task creation works",
    "completed": false
  }'

# Expected response (201 Created):
# {
#   "id": "650e8400-e29b-41d4-a716-446655440001",
#   "title": "Test task",
#   "description": "Verify task creation works",
#   "completed": false,
#   "user_id": "550e8400-e29b-41d4-a716-446655440000",
#   "created_at": "2026-01-07T14:30:00Z",
#   "updated_at": "2026-01-07T14:30:00Z"
# }
```

### 5.4 Test Task Retrieval

```bash
curl -X GET http://localhost:8000/api/tasks \
  -H "Authorization: Bearer $TOKEN"

# Expected response (200 OK):
# {
#   "tasks": [
#     {
#       "id": "650e8400-e29b-41d4-a716-446655440001",
#       "title": "Test task",
#       "description": "Verify task creation works",
#       "completed": false,
#       "user_id": "550e8400-e29b-41d4-a716-446655440000",
#       "created_at": "2026-01-07T14:30:00Z",
#       "updated_at": "2026-01-07T14:30:00Z"
#     }
#   ],
#   "total": 1,
#   "limit": 100,
#   "offset": 0
# }
```

### 5.5 Test Frontend Dashboard

1. Navigate to http://localhost:3000/dashboard
2. You should see:
   - Your email in the header
   - Task list with "Test task" created earlier
   - "Add Task" button
   - Logout button

3. Try creating a task via the UI:
   - Click "Add Task"
   - Enter title: "Frontend test"
   - Enter description: "Created via UI"
   - Click "Create"
   - Task should appear in the list immediately

---

## Step 6: Development Workflow

### 6.1 Running Both Servers Concurrently

**Option A: Two Terminal Windows**

Terminal 1 (Backend):
```bash
cd backend
source .venv/bin/activate  # Activate virtual environment
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

Terminal 2 (Frontend):
```bash
cd frontend
npm run dev
```

**Option B: Using `concurrently` (recommended)**

Add to `package.json` in project root:
```json
{
  "scripts": {
    "dev": "concurrently \"cd backend && uvicorn app.main:app --reload\" \"cd frontend && npm run dev\""
  },
  "devDependencies": {
    "concurrently": "^8.2.2"
  }
}
```

Run both servers:
```bash
npm run dev
```

### 6.2 Hot Reload

- **Backend**: Uvicorn automatically reloads on file changes (`--reload` flag)
- **Frontend**: Next.js automatically reloads on file changes (Fast Refresh)

### 6.3 Debugging

**Backend (VS Code)**

Create `.vscode/launch.json`:
```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "name": "FastAPI",
      "type": "python",
      "request": "launch",
      "module": "uvicorn",
      "args": [
        "app.main:app",
        "--reload",
        "--host", "0.0.0.0",
        "--port", "8000"
      ],
      "jinja": true,
      "cwd": "${workspaceFolder}/backend"
    }
  ]
}
```

**Frontend (VS Code)**

Create `.vscode/launch.json`:
```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "name": "Next.js: debug server-side",
      "type": "node-terminal",
      "request": "launch",
      "command": "npm run dev",
      "cwd": "${workspaceFolder}/frontend"
    },
    {
      "name": "Next.js: debug client-side",
      "type": "chrome",
      "request": "launch",
      "url": "http://localhost:3000"
    }
  ]
}
```

---

## Step 7: Testing

### 7.1 Backend Tests

```bash
cd backend

# Run all tests
pytest

# Run with coverage
pytest --cov=app --cov-report=html

# Run specific test file
pytest tests/test_auth.py

# Run with verbose output
pytest -v
```

### 7.2 Frontend Tests

```bash
cd frontend

# Run Jest tests
npm test

# Run with coverage
npm run test:coverage

# Run E2E tests (Playwright)
npm run test:e2e
```

---

## Troubleshooting

### Common Issues

#### Issue 1: Backend won't start - "DATABASE_URL not set"

**Solution**:
```bash
# Verify .env file exists in backend/ directory
ls -la backend/.env

# Check if DATABASE_URL is set
cat backend/.env | grep DATABASE_URL

# If missing, create .env file with correct DATABASE_URL
```

#### Issue 2: Frontend can't connect to backend - CORS error

**Solution**:
- Verify backend is running on http://localhost:8000
- Check `ALLOWED_ORIGINS` in `backend/.env` includes `http://localhost:3000`
- Check `NEXT_PUBLIC_API_URL` in `frontend/.env.local` is `http://localhost:8000`

#### Issue 3: JWT authentication fails - "Invalid token"

**Solution**:
- Verify `BETTER_AUTH_SECRET` is **identical** in both `.env` files
- Generate a new secret if needed: `openssl rand -base64 64 | tr -d '\n'`
- Update both files with the same secret
- Restart both backend and frontend servers

#### Issue 4: Database connection fails - "SSL required"

**Solution**:
- Ensure `?sslmode=require` is at the end of `DATABASE_URL`
- Example: `postgresql://user:pass@host/db?sslmode=require`

#### Issue 5: Port already in use

**Backend (port 8000)**:
```bash
# Find process using port 8000
lsof -i :8000

# Kill process
kill -9 <PID>

# Or use different port
uvicorn app.main:app --reload --port 8001
```

**Frontend (port 3000)**:
```bash
# Find process using port 3000
lsof -i :3000

# Kill process
kill -9 <PID>

# Or use different port (set in package.json)
PORT=3001 npm run dev
```

---

## Next Steps

Once your environment is set up and working:

1. **Read the Specifications**:
   - `specs/database/schema.md` - Database schema details
   - `specs/api/rest-endpoints.md` - API endpoint documentation
   - `specs/skills/auth-bridge.md` - JWT authentication flow
   - `specs/ui/components.md` - Frontend component specifications

2. **Explore the Codebase**:
   - Review SQLModel models in `backend/app/models/`
   - Review API routes in `backend/app/routes/`
   - Review React components in `frontend/components/`
   - Review API client in `frontend/lib/api-client.ts`

3. **Start Development**:
   - Check `specs/001-phase-ii-specs/tasks.md` for implementation tasks
   - Follow Test-Driven Development (TDD) workflow: Red → Green → Refactor
   - Use `specs/001-phase-ii-specs/plan.md` for architectural guidance

4. **Run Tests**:
   - Backend: `pytest` in `backend/` directory
   - Frontend: `npm test` in `frontend/` directory
   - Integration: Test full user flows via UI and API

---

## Additional Resources

### Documentation

- **Next.js 15**: https://nextjs.org/docs
- **FastAPI**: https://fastapi.tiangolo.com
- **SQLModel**: https://sqlmodel.tiangolo.com
- **Better Auth**: https://better-auth.dev
- **Neon PostgreSQL**: https://neon.tech/docs
- **Tailwind CSS**: https://tailwindcss.com/docs

### OpenAPI Specs

- **Authentication API**: `specs/001-phase-ii-specs/contracts/auth-openapi.yaml`
- **Tasks API**: `specs/001-phase-ii-specs/contracts/tasks-openapi.yaml`

### Support

- **Project Issues**: [GitHub Issues](https://github.com/your-repo/issues)
- **Documentation**: `specs/` directory
- **Team Chat**: [Slack/Discord channel]

---

**Last Updated**: 2026-01-07
**Version**: 1.0.0

**Related Documents**:
- `specs/001-phase-ii-specs/spec.md` - Master specification
- `specs/001-phase-ii-specs/plan.md` - Implementation plan
- `specs/001-phase-ii-specs/data-model.md` - Data model and entity relationships
- `specs/database/schema.md` - Database schema specification
- `specs/api/rest-endpoints.md` - REST API specification
- `specs/skills/auth-bridge.md` - JWT authentication specification
- `specs/ui/components.md` - UI component specifications
