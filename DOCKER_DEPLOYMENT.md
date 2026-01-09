# Docker Deployment Guide

This guide explains how to run and deploy your Todo App backend using Docker.

## 🐳 What's Included

- **Dockerfile**: Multi-stage production-ready Docker image
- **docker-compose.yml**: Local development setup
- **.dockerignore**: Optimized build context

---

## 📦 Quick Start (Local Development)

### Prerequisites
- Docker Desktop installed (https://www.docker.com/products/docker-desktop)
- Docker Compose (included with Docker Desktop)

### 1. Clone Repository
```bash
git clone https://github.com/Aliyan707/Todo-Full-Stack-Web-Application.git
cd Todo-Full-Stack-Web-Application
```

### 2. Create Environment File
Create `backend/.env` file:
```env
DATABASE_URL=postgresql://neondb_owner:npg_KuFw58pkIMDG@ep-fancy-bird-ahkak717-pooler.c-3.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require
BETTER_AUTH_SECRET=your-secret-key-minimum-32-characters-required
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:3001
ENVIRONMENT=development
```

### 3. Run with Docker Compose
```bash
# Start backend
docker-compose up -d

# View logs
docker-compose logs -f backend

# Stop services
docker-compose down
```

### 4. Test Backend
Visit: http://localhost:8000/health

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

## 🏗️ Build Docker Image Manually

### Build Image
```bash
cd backend
docker build -t todo-backend:latest .
```

### Run Container
```bash
docker run -d \
  --name todo-backend \
  -p 8000:8000 \
  -e DATABASE_URL="your-database-url" \
  -e BETTER_AUTH_SECRET="your-secret" \
  -e ALLOWED_ORIGINS="http://localhost:3000" \
  -e ENVIRONMENT="production" \
  todo-backend:latest
```

### View Logs
```bash
docker logs -f todo-backend
```

### Stop Container
```bash
docker stop todo-backend
docker rm todo-backend
```

---

## ☁️ Deploy to Cloud Platforms

### Option 1: Deploy to Render (with Docker)

#### Step 1: Create Render Account
Go to https://render.com and sign up

#### Step 2: Create Web Service
1. Click **"New +"** → **"Web Service"**
2. Connect GitHub repository: `Aliyan707/Todo-Full-Stack-Web-Application`
3. Configure:
   - **Name**: `todo-app-backend`
   - **Region**: Choose closest to you
   - **Branch**: `main`
   - **Root Directory**: `backend`
   - **Environment**: `Docker`
   - **Dockerfile Path**: `Dockerfile`

#### Step 3: Add Environment Variables
```env
DATABASE_URL=<your-neon-database-url>
BETTER_AUTH_SECRET=<your-secret>
ALLOWED_ORIGINS=https://your-frontend.vercel.app
ENVIRONMENT=production
PORT=8000
```

#### Step 4: Deploy
Click **"Create Web Service"** and wait for deployment.

Your backend: `https://todo-app-backend.onrender.com`

---

### Option 2: Deploy to Railway (with Docker)

#### Step 1: Install Railway CLI
```bash
# Windows (PowerShell)
iwr https://railway.app/install.ps1 -useb | iex

# Or use: npm install -g @railway/cli
```

#### Step 2: Login
```bash
railway login
```

#### Step 3: Initialize Project
```bash
cd backend
railway init
```

#### Step 4: Set Environment Variables
```bash
railway variables set DATABASE_URL="<your-database-url>"
railway variables set BETTER_AUTH_SECRET="<your-secret>"
railway variables set ALLOWED_ORIGINS="<your-frontend-url>"
railway variables set ENVIRONMENT="production"
```

#### Step 5: Deploy
```bash
railway up
```

Your backend will be deployed automatically!

---

### Option 3: Deploy to Fly.io (with Docker)

#### Step 1: Install Fly CLI
```bash
# Windows (PowerShell)
iwr https://fly.io/install.ps1 -useb | iex
```

#### Step 2: Login
```bash
fly auth login
```

#### Step 3: Launch App
```bash
cd backend
fly launch --dockerfile Dockerfile
```

Follow prompts:
- App name: `todo-app-backend-<your-name>`
- Region: Choose closest
- PostgreSQL: No (using Neon)

#### Step 4: Set Secrets
```bash
fly secrets set DATABASE_URL="<your-neon-database-url>"
fly secrets set BETTER_AUTH_SECRET="<your-secret>"
fly secrets set ALLOWED_ORIGINS="<your-frontend-url>"
fly secrets set ENVIRONMENT="production"
```

#### Step 5: Deploy
```bash
fly deploy
```

Your backend: `https://your-app.fly.dev`

---

### Option 4: AWS ECS/ECR (Enterprise)

#### Step 1: Build and Tag Image
```bash
cd backend
docker build -t todo-backend:latest .
docker tag todo-backend:latest <your-ecr-repo>:latest
```

#### Step 2: Push to ECR
```bash
aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin <your-ecr-repo>
docker push <your-ecr-repo>:latest
```

#### Step 3: Deploy to ECS
Create ECS task definition with:
- Image: `<your-ecr-repo>:latest`
- Port: 8000
- Environment variables (DATABASE_URL, etc.)

Deploy to ECS cluster.

---

### Option 5: Google Cloud Run

#### Step 1: Build and Push
```bash
cd backend
gcloud builds submit --tag gcr.io/<your-project-id>/todo-backend
```

#### Step 2: Deploy
```bash
gcloud run deploy todo-backend \
  --image gcr.io/<your-project-id>/todo-backend \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated \
  --set-env-vars DATABASE_URL="<your-database-url>" \
  --set-env-vars BETTER_AUTH_SECRET="<your-secret>" \
  --set-env-vars ALLOWED_ORIGINS="<your-frontend-url>" \
  --set-env-vars ENVIRONMENT="production"
```

Your backend: Provided by Cloud Run

---

## 🔧 Docker Commands Reference

### Build Commands
```bash
# Build image
docker build -t todo-backend:latest .

# Build with no cache
docker build --no-cache -t todo-backend:latest .

# Build specific platform (for M1 Mac users)
docker build --platform linux/amd64 -t todo-backend:latest .
```

### Run Commands
```bash
# Run in foreground
docker run -p 8000:8000 todo-backend:latest

# Run in background (detached)
docker run -d -p 8000:8000 --name todo-backend todo-backend:latest

# Run with environment file
docker run --env-file backend/.env -p 8000:8000 todo-backend:latest
```

### Management Commands
```bash
# List running containers
docker ps

# List all containers
docker ps -a

# View logs
docker logs todo-backend
docker logs -f todo-backend  # Follow logs

# Stop container
docker stop todo-backend

# Remove container
docker rm todo-backend

# Remove image
docker rmi todo-backend:latest
```

### Docker Compose Commands
```bash
# Start services
docker-compose up

# Start in background
docker-compose up -d

# Stop services
docker-compose down

# View logs
docker-compose logs
docker-compose logs -f backend

# Rebuild and restart
docker-compose up --build

# Remove volumes
docker-compose down -v
```

---

## 🔍 Troubleshooting

### Container Won't Start
```bash
# Check logs
docker logs todo-backend

# Common issues:
# - Missing environment variables
# - Database connection failed
# - Port already in use
```

### Database Connection Issues
```bash
# Test database connection
docker exec -it todo-backend python -c "from app.database import test_connection; print(test_connection())"

# Verify DATABASE_URL
docker exec -it todo-backend env | grep DATABASE_URL
```

### Port Already in Use
```bash
# Find process using port 8000
# Windows
netstat -ano | findstr :8000

# Kill process or use different port
docker run -p 8001:8000 todo-backend:latest
```

### Build Fails
```bash
# Clean Docker cache
docker system prune -a

# Rebuild without cache
docker build --no-cache -t todo-backend:latest .
```

---

## 📊 Image Size Optimization

Current image size: ~150MB (with multi-stage build)

### Further Optimizations
```dockerfile
# Use Alpine for smaller size
FROM python:3.11-alpine

# Remove unnecessary packages
RUN pip install --no-cache-dir -r requirements.txt

# Use specific package versions
# Pin all dependencies in requirements.txt
```

---

## 🔒 Security Best Practices

✅ **Implemented:**
- Non-root user in container
- Multi-stage build to reduce attack surface
- No secrets in Dockerfile
- Health checks enabled
- Minimal base image (slim)

⚠️ **Additional Recommendations:**
- Scan images: `docker scan todo-backend:latest`
- Use Docker secrets for sensitive data
- Enable Docker Content Trust
- Regular image updates
- Use specific version tags (not `latest`)

---

## 📈 Monitoring

### Health Check
```bash
# Check container health
docker inspect --format='{{.State.Health.Status}}' todo-backend

# Manual health check
curl http://localhost:8000/health
```

### Resource Usage
```bash
# View stats
docker stats todo-backend

# Container resource limits
docker run -m 512m --cpus=1 -p 8000:8000 todo-backend:latest
```

---

## 🚀 Production Checklist

Before deploying to production:

- [ ] Environment variables set correctly
- [ ] DATABASE_URL points to production database
- [ ] BETTER_AUTH_SECRET is strong (64+ characters)
- [ ] ALLOWED_ORIGINS includes production frontend URL
- [ ] Health check endpoint works
- [ ] Logs are being collected
- [ ] Resource limits configured
- [ ] Backups configured for database
- [ ] SSL/TLS enabled
- [ ] Monitoring alerts set up

---

## 📚 Additional Resources

- Docker Documentation: https://docs.docker.com
- FastAPI Docker: https://fastapi.tiangolo.com/deployment/docker
- Docker Compose: https://docs.docker.com/compose
- Multi-stage Builds: https://docs.docker.com/build/building/multi-stage

---

## Need Help?

Check platform-specific documentation:
- Render: https://render.com/docs/docker
- Railway: https://docs.railway.app/deploy/dockerfiles
- Fly.io: https://fly.io/docs/languages-and-frameworks/dockerfile
- AWS ECS: https://docs.aws.amazon.com/AmazonECS/latest/developerguide
- Google Cloud Run: https://cloud.google.com/run/docs/quickstarts/build-and-deploy/deploy-python-service
