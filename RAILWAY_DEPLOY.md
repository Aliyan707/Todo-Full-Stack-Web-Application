# 🚂 Railway Deployment Guide - Todo App Backend

Deploy your FastAPI backend to Railway in minutes!

---

## 🎯 Quick Deploy (3 Steps)

### Step 1: Go to Railway
Visit: **https://railway.app**

Click **"Start a New Project"** → **"Deploy from GitHub repo"**

### Step 2: Connect Repository
1. Login with GitHub
2. Select repository: **`Aliyan707/Todo-Full-Stack-Web-Application`**
3. Railway will auto-detect the Dockerfile ✅

### Step 3: Add Environment Variables
Click on your service → **"Variables"** tab

Add these variables:

```env
DATABASE_URL=postgresql://neondb_owner:npg_KuFw58pkIMDG@ep-fancy-bird-ahkak717-pooler.c-3.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require

BETTER_AUTH_SECRET=your-super-secret-key-minimum-32-characters-long-here

ALLOWED_ORIGINS=https://your-frontend-url.vercel.app,http://localhost:3000

ENVIRONMENT=production

PORT=8000
```

**Generate Strong Secret:**
```bash
# Run this to generate BETTER_AUTH_SECRET:
openssl rand -base64 64
```

Click **"Deploy"** and wait 3-5 minutes ⏳

---

## ✅ Verify Deployment

### 1. Get Your Backend URL
Railway will provide a URL like:
```
https://todo-app-backend-production.up.railway.app
```

### 2. Test Health Endpoint
Visit: `https://your-backend-url.railway.app/health`

Expected response:
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

### 3. Test API Docs
Visit: `https://your-backend-url.railway.app/docs`

You should see the FastAPI Swagger documentation!

---

## 🔧 Configuration Details

### Build Settings (Auto-detected)
- **Builder**: Dockerfile
- **Dockerfile Path**: `backend/Dockerfile`
- **Build Command**: Docker build (automatic)

### Runtime Settings
- **Start Command**: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
- **Health Check**: `/health` endpoint
- **Region**: Choose closest to you

### Environment Variables Explained

| Variable | Purpose | Example |
|----------|---------|---------|
| `DATABASE_URL` | Neon PostgreSQL connection | Your Neon connection string |
| `BETTER_AUTH_SECRET` | JWT token signing secret | 64+ random characters |
| `ALLOWED_ORIGINS` | CORS allowed domains | Your Vercel frontend URL |
| `ENVIRONMENT` | Runtime environment | `production` |
| `PORT` | Server port (auto-set by Railway) | `8000` (Railway overrides) |

---

## 🚀 After Deployment

### 1. Update Frontend
Go to Vercel dashboard → Your frontend project → **Settings** → **Environment Variables**

Update:
```env
NEXT_PUBLIC_API_URL=https://your-backend-url.railway.app
```

Then **redeploy frontend** on Vercel.

### 2. Update Backend CORS
Make sure `ALLOWED_ORIGINS` includes your Vercel URL:
```env
ALLOWED_ORIGINS=https://your-app.vercel.app,http://localhost:3000
```

### 3. Test Full Stack
1. Visit your frontend: `https://your-app.vercel.app`
2. Try to register a new user
3. Login
4. Create a todo item
5. Verify everything works! ✅

---

## 📊 Monitor Your Deployment

### View Logs
Railway Dashboard → Your service → **"Logs"** tab

Watch real-time logs:
```
[STARTUP] Starting Todo App Backend...
[STARTUP] Database initialization...
[READY] Backend ready!
```

### Check Metrics
Railway Dashboard → **"Metrics"** tab
- CPU usage
- Memory usage
- Network traffic

### Deployment History
Railway Dashboard → **"Deployments"** tab
- View all deployments
- Rollback if needed

---

## 🐛 Troubleshooting

### Issue: Deployment Fails

**Check build logs:**
1. Railway Dashboard → "Deployments"
2. Click failed deployment
3. View build logs

**Common fixes:**
- Verify Dockerfile exists in `backend/` folder
- Check requirements.txt has all dependencies
- Ensure Python version matches (3.11)

### Issue: Database Connection Failed

**Symptoms:**
- Health check shows `database: { status: "error" }`
- Logs show connection errors

**Fix:**
1. Verify `DATABASE_URL` is correct
2. Check Neon database is running
3. Ensure `?sslmode=require` is in connection string

### Issue: CORS Errors

**Symptoms:**
- Frontend can't connect to backend
- Browser console shows CORS errors

**Fix:**
Update `ALLOWED_ORIGINS`:
```env
ALLOWED_ORIGINS=https://your-frontend.vercel.app,https://your-frontend-git-main.vercel.app,http://localhost:3000
```

Include ALL Vercel preview URLs!

### Issue: 502 Bad Gateway

**Symptoms:**
- Backend URL returns 502 error
- Service won't start

**Fix:**
1. Check environment variables are set
2. Verify PORT is not hardcoded
3. Review logs for startup errors

### Issue: Health Check Failing

**Check:**
```bash
# Test locally first
docker build -t todo-backend ./backend
docker run -p 8000:8000 --env-file backend/.env todo-backend

# Visit: http://localhost:8000/health
```

---

## 💡 Pro Tips

### 1. Custom Domain
Railway → Settings → **"Domains"**
- Add custom domain (e.g., `api.yourdomain.com`)
- Update DNS records as instructed

### 2. Automatic Deploys
Railway auto-deploys on:
- Push to `main` branch
- Pull request merges

Disable in: Settings → **"Triggers"**

### 3. Preview Environments
Railway can create preview deployments for PRs:
- Settings → **"PR Deploys"** → Enable

### 4. Database Backups
Your Neon database should have automatic backups enabled.
Check: Neon Dashboard → Your project → **"Backups"**

### 5. Monitoring
Add monitoring tools:
- Sentry for error tracking
- LogRocket for user session replay
- Datadog for metrics

---

## 💰 Pricing

Railway offers:
- **Free Tier**: $5 free credits/month
- **Hobby Plan**: $5/month (includes $5 credits)
- **Pro Plan**: $20/month (includes $20 credits)

Your backend should fit in free tier for development!

---

## 🔐 Security Checklist

Before going live:
- [ ] `BETTER_AUTH_SECRET` is strong (64+ characters)
- [ ] `DATABASE_URL` uses SSL (`sslmode=require`)
- [ ] `ALLOWED_ORIGINS` only includes your domains
- [ ] No secrets in code or Dockerfile
- [ ] `.env` file in `.gitignore`
- [ ] HTTPS enabled (Railway provides automatically)
- [ ] Rate limiting configured (if needed)

---

## 📚 Additional Resources

- Railway Docs: https://docs.railway.app
- Railway Status: https://status.railway.app
- Railway Discord: https://discord.gg/railway
- FastAPI Docs: https://fastapi.tiangolo.com

---

## 🆘 Need Help?

**Railway Issues:**
- Check: https://help.railway.app
- Discord: https://discord.gg/railway

**Backend Issues:**
- Check health endpoint: `/health`
- Review logs in Railway dashboard
- Test locally with Docker

**Database Issues:**
- Neon Dashboard: https://console.neon.tech
- Check connection string
- Verify SSL mode

---

## 📝 Quick Reference

### Railway CLI (Optional)

Install:
```bash
npm install -g @railway/cli
```

Login:
```bash
railway login
```

Deploy:
```bash
railway up
```

View logs:
```bash
railway logs
```

### Testing Commands

```bash
# Test health
curl https://your-backend-url.railway.app/health

# Test with auth
curl -X POST https://your-backend-url.railway.app/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"Test123!","name":"Test User"}'
```

---

## ✨ Success Checklist

After deployment:
- [ ] Backend URL is accessible
- [ ] Health check returns 200 OK
- [ ] API docs (/docs) loads
- [ ] Database connection successful
- [ ] Frontend can connect to backend
- [ ] User registration works
- [ ] Login works
- [ ] CRUD operations work
- [ ] CORS configured correctly
- [ ] Logs show no errors

**Congratulations! Your backend is live! 🎉**
