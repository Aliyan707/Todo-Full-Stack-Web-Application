# Backend Deployment Guide

This guide explains how to deploy your FastAPI backend to production.

## Prerequisites

- GitHub repository with your code
- Neon PostgreSQL database (already configured)
- Backend environment variables

---

## 🐳 Docker Deployment (Recommended)

**Your backend is now containerized!** For detailed Docker instructions, see [DOCKER_DEPLOYMENT.md](DOCKER_DEPLOYMENT.md)

### Quick Docker Start
```bash
# Local development
docker-compose up -d

# Or build and run manually
cd backend
docker build -t todo-backend .
docker run -p 8000:8000 --env-file .env todo-backend
```

**Deploy with Docker to:**
- Render (Docker runtime)
- Railway
- Fly.io
- AWS ECS
- Google Cloud Run

See [DOCKER_DEPLOYMENT.md](DOCKER_DEPLOYMENT.md) for complete instructions.

---

## Option 1: Deploy to Render (Free Tier Available)

### Step 1: Create Render Account
1. Go to https://render.com
2. Sign up or log in with GitHub

### Step 2: Create New Web Service
1. Click **"New +"** → **"Web Service"**
2. Connect your GitHub repository: `Aliyan707/Todo-Full-Stack-Web-Application`
3. Configure the service:
   - **Name**: `todo-app-backend`
   - **Region**: Choose closest to you
   - **Branch**: `main`
   - **Root Directory**: `backend`
   - **Runtime**: `Python 3`
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`

### Step 3: Add Environment Variables
In Render dashboard, go to **Environment** tab and add:

```
DATABASE_URL=postgresql://neondb_owner:npg_KuFw58pkIMDG@ep-fancy-bird-ahkak717-pooler.c-3.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require

BETTER_AUTH_SECRET=your-secret-key-minimum-32-characters-required

ALLOWED_ORIGINS=https://your-frontend-url.vercel.app,http://localhost:3000

ENVIRONMENT=production

HOST=0.0.0.0

PORT=10000
```

**IMPORTANT**:
- Replace `BETTER_AUTH_SECRET` with a strong secret (use: `openssl rand -base64 64`)
- Update `ALLOWED_ORIGINS` with your actual frontend Vercel URL

### Step 4: Deploy
1. Click **"Create Web Service"**
2. Wait for deployment to complete (5-10 minutes)
3. Your backend will be live at: `https://todo-app-backend.onrender.com`

### Step 5: Test Your Backend
Visit: `https://your-backend-url.onrender.com/health`

You should see:
```json
{
  "status": "healthy",
  "service": "todo-app-backend",
  "version": "1.0.0",
  "database": {
    "status": "connected"
  }
}
```

---

## Option 2: Deploy to Railway

### Step 1: Create Railway Account
1. Go to https://railway.app
2. Sign up with GitHub

### Step 2: Deploy from GitHub
1. Click **"New Project"** → **"Deploy from GitHub repo"**
2. Select `Aliyan707/Todo-Full-Stack-Web-Application`
3. Railway will auto-detect Python

### Step 3: Configure Service
1. Click on the service
2. Go to **Settings**:
   - **Root Directory**: `backend`
   - **Start Command**: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`

### Step 4: Add Environment Variables
Go to **Variables** tab and add:
```
DATABASE_URL=<your-neon-database-url>
BETTER_AUTH_SECRET=<your-secret>
ALLOWED_ORIGINS=<your-frontend-url>
ENVIRONMENT=production
```

### Step 5: Deploy
Railway will automatically deploy. Your backend URL will be generated.

---

## Option 3: Deploy to Fly.io

### Step 1: Install Fly CLI
```bash
# Windows (PowerShell)
powershell -Command "iwr https://fly.io/install.ps1 -useb | iex"

# Or use the installer from: https://fly.io/docs/hands-on/install-flyctl/
```

### Step 2: Login to Fly
```bash
fly auth login
```

### Step 3: Navigate to Backend Directory
```bash
cd backend
```

### Step 4: Launch App
```bash
fly launch
```

Follow the prompts:
- App name: `todo-app-backend-<your-name>`
- Region: Choose closest to you
- PostgreSQL: No (you're using Neon)
- Deploy now: No

### Step 5: Set Environment Variables
```bash
fly secrets set DATABASE_URL="<your-neon-database-url>"
fly secrets set BETTER_AUTH_SECRET="<your-secret>"
fly secrets set ALLOWED_ORIGINS="<your-frontend-url>"
fly secrets set ENVIRONMENT="production"
```

### Step 6: Deploy
```bash
fly deploy
```

Your backend will be live at: `https://your-app.fly.dev`

---

## After Deployment

### 1. Update Frontend Environment Variable
In your Vercel frontend project:
1. Go to **Settings** → **Environment Variables**
2. Update `NEXT_PUBLIC_API_URL` to your backend URL:
   ```
   NEXT_PUBLIC_API_URL=https://your-backend-url.onrender.com
   ```
3. Redeploy frontend

### 2. Update Backend CORS
Make sure `ALLOWED_ORIGINS` in backend includes your Vercel frontend URL:
```
ALLOWED_ORIGINS=https://your-app.vercel.app,http://localhost:3000
```

### 3. Test Full Stack
1. Open your frontend: `https://your-app.vercel.app`
2. Try to sign up/login
3. Create a todo item
4. Verify everything works!

---

## Troubleshooting

### Database Connection Issues
- Verify `DATABASE_URL` is correct
- Check Neon dashboard for connection string
- Ensure `sslmode=require` is in the URL

### CORS Errors
- Add frontend URL to `ALLOWED_ORIGINS`
- Format: `https://your-app.vercel.app` (no trailing slash)

### 500 Internal Server Error
- Check deployment logs in your platform
- Verify all environment variables are set
- Check database connection

### Backend Not Starting
- Verify `requirements.txt` is present
- Check start command: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
- Review build logs for errors

---

## Environment Variables Reference

| Variable | Description | Example |
|----------|-------------|---------|
| `DATABASE_URL` | Neon PostgreSQL connection string | `postgresql://user:pass@host/db?sslmode=require` |
| `BETTER_AUTH_SECRET` | JWT secret (min 32 chars) | Generate with `openssl rand -base64 64` |
| `ALLOWED_ORIGINS` | Frontend URLs for CORS | `https://app.vercel.app,http://localhost:3000` |
| `ENVIRONMENT` | Deployment environment | `production` |
| `PORT` | Server port (auto-set by platform) | `8000` or `$PORT` |

---

## Next Steps

1. Deploy backend to Render/Railway/Fly.io
2. Get backend URL
3. Update Vercel frontend with backend URL
4. Test the full application
5. Monitor logs and performance

**Need help?** Check the platform documentation:
- Render: https://render.com/docs
- Railway: https://docs.railway.app
- Fly.io: https://fly.io/docs
