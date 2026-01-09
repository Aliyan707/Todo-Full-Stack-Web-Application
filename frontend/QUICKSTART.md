# Frontend Quick Start Guide

## Prerequisites

- Node.js 18+ installed
- Backend API running on `http://localhost:8000`
- Terminal/command prompt

## Installation (5 minutes)

### 1. Navigate to Frontend Directory

```bash
cd frontend
```

### 2. Install Dependencies

```bash
npm install
```

This will install:
- Next.js 16.1.1
- React 19.2.3
- TypeScript 5.9.3
- Tailwind CSS 4.1.18
- Better Auth 1.4.10

### 3. Configure Environment

The `.env.local` file is already created with development defaults:

```env
BETTER_AUTH_SECRET=super-secret-key-at-least-32-characters-long-for-development
NEXT_PUBLIC_API_URL=http://localhost:8000
BETTER_AUTH_URL=http://localhost:3000
```

If you need to change the backend API URL, edit `.env.local`.

### 4. Start Development Server

```bash
npm run dev
```

You should see:

```
▲ Next.js 16.1.1 (Turbopack)
- Local:         http://localhost:3000
- Network:       http://10.x.x.x:3000
- Environments: .env.local

✓ Starting...
✓ Ready in ~1300ms
```

### 5. Open in Browser

Visit: **http://localhost:3000**

You'll be redirected to the login page.

## First-Time User Flow

### Step 1: Register Account

1. Click "Sign up" link on login page
2. Enter email address (e.g., `test@example.com`)
3. Enter password (minimum 8 characters)
4. Confirm password
5. Click "Sign up"
6. You'll be redirected to login page

### Step 2: Log In

1. Enter your email address
2. Enter your password
3. Click "Sign in"
4. You'll be redirected to dashboard

### Step 3: Create Your First Task

1. Click "+ New Task" button
2. Enter task title (required, max 200 characters)
3. Optionally add description
4. Click "Create Task"
5. Task appears in list

### Step 4: Manage Tasks

**Toggle Completion:**
- Click checkbox next to task
- Task will show strikethrough when completed

**Edit Task:**
- Click "Edit" button on task
- Modify title, description, or completion status
- Click "Save Changes" or "Cancel"

**Delete Task:**
- Click "Delete" button on task
- Confirm deletion in modal
- Task is removed from list

**Filter Tasks:**
- Click "All" to see all tasks
- Click "Completed" to see only completed tasks
- Click "Incomplete" to see only incomplete tasks

### Step 5: Log Out

1. Click "Log out" button in header
2. You'll be redirected to login page

## Troubleshooting

### Port Already in Use

If port 3000 is already in use:

```bash
# Kill process on port 3000 (Windows)
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# Or use a different port
npm run dev -- -p 3001
```

### Backend API Not Running

If you see connection errors:

1. Check that backend is running: `http://localhost:8000`
2. Test backend health: `http://localhost:8000/docs`
3. Verify `NEXT_PUBLIC_API_URL` in `.env.local`

### Build Errors

If you encounter build errors:

```bash
# Clear Next.js cache
rm -rf .next

# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install

# Rebuild
npm run build
```

### TypeScript Errors

If TypeScript shows errors:

```bash
# Check TypeScript configuration
npx tsc --noEmit

# Verify all types
npm run build
```

## Development Commands

```bash
# Start dev server (with hot reload)
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Run linter
npm run lint
```

## Project Structure Overview

```
frontend/
├── app/                    # Next.js App Router pages
│   ├── login/             # Login page
│   ├── signup/            # Signup page
│   └── dashboard/         # Protected dashboard
├── components/            # React components
│   ├── auth/             # Auth components
│   └── tasks/            # Task components
├── lib/                  # Utilities
│   ├── api-client.ts    # API fetch wrapper
│   ├── auth.ts          # Auth helpers
│   └── types.ts         # TypeScript types
└── .env.local           # Environment variables
```

## API Endpoints Used

- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `GET /api/tasks` - Fetch all tasks
- `POST /api/tasks` - Create new task
- `PUT /api/tasks/:id` - Update task
- `DELETE /api/tasks/:id` - Delete task

## Technology Stack

- **Next.js 16**: React framework with App Router
- **React 19**: UI library
- **TypeScript**: Type-safe development
- **Tailwind CSS**: Utility-first styling
- **Better Auth**: JWT authentication

## Next Steps

1. Customize theme colors in `tailwind.config.ts`
2. Add more task fields (priority, due date, etc.)
3. Implement task search/filtering
4. Add dark mode support
5. Deploy to Vercel/Netlify

## Support

For issues or questions:
- Check `IMPLEMENTATION_SUMMARY.md` for detailed documentation
- Review `README.md` for full documentation
- Check backend API docs at `http://localhost:8000/docs`

## Production Deployment

Before deploying to production:

1. Update environment variables
2. Set `BETTER_AUTH_SECRET` to a strong random value
3. Use HTTPS for `BETTER_AUTH_URL` and `NEXT_PUBLIC_API_URL`
4. Enable secure cookies in Better Auth config
5. Run `npm run build` to verify
6. Test all features in production environment

Happy coding! 🚀
