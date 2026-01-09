# Debug Blinking Issue

## Quick Fixes to Try

### 1. Disable React Strict Mode (Already Done)
✅ Changed `reactStrictMode: false` in `next.config.ts`

### 2. Check if Backend is Running
```bash
# Terminal 1: Start backend
cd backend
python -m uvicorn app.main:app --reload

# Terminal 2: Start frontend
cd frontend
npm run dev
```

### 3. Check Browser Console for Errors
Open your browser (http://localhost:3000) and:
- Press `F12` to open DevTools
- Go to "Console" tab
- Look for red errors
- Take a screenshot and share

### 4. Check Network Tab
- Press `F12` → "Network" tab
- Look for failing API calls (red text)
- Check if requests are happening repeatedly

## Common Causes

### A. Backend Not Running
**Symptom**: Page loads but immediately redirects or shows errors

**Fix**:
```bash
cd backend
python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

### B. CORS Issues
**Symptom**: Console shows "CORS policy" errors

**Fix**: Check backend `.env` file has:
```
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:3001
```

### C. Auth Token Invalid
**Symptom**: Repeatedly redirects to /auth page

**Fix**: Clear localStorage:
```javascript
// In browser console (F12)
localStorage.clear()
// Then refresh page
```

### D. API URL Wrong
**Symptom**: Network requests fail (404 or connection refused)

**Check**: `frontend/.env.local` should have:
```
NEXT_PUBLIC_API_URL=http://localhost:8000
```

### E. Infinite API Calls
**Symptom**: Network tab shows same request repeating

**Fix**: Already applied in useTasks.ts

## Step-by-Step Debugging

### Step 1: Clear Everything
```bash
# In frontend directory
rm -rf .next
rm -rf node_modules/.cache
npm run dev
```

### Step 2: Check What's Blinking
- Is the whole page flickering?
- Is it just specific components?
- Is it happening on dashboard or auth page?
- How fast is it blinking? (multiple times per second or slower?)

### Step 3: Disable Animations Temporarily
Add this to `frontend/app/globals.css`:
```css
* {
  animation: none !important;
  transition: none !important;
}
```

### Step 4: Test Without Auth
Go to dashboard page code and temporarily comment out auth check:
```typescript
// Comment this in dashboard/page.tsx
// useEffect(() => {
//   if (!authLoading && !isAuthenticated) {
//     router.push('/auth');
//   }
// }, [isAuthenticated, authLoading, router]);
```

## What to Report

Please share:
1. **Which page is blinking?** (Landing / Auth / Dashboard)
2. **Backend running?** (Yes/No)
3. **Console errors?** (Screenshot)
4. **Network tab?** (Any red/failed requests?)
5. **How fast?** (Fast flicker vs slow blink)

## Quick Test Code

Add this to `dashboard/page.tsx` at the top of component:
```typescript
console.log('Dashboard render', {
  isAuthenticated,
  authLoading,
  tasksCount: tasks.length,
  isLoading,
  error
});
```

Then check console - if you see this log repeating rapidly, we have a re-render issue.

## Emergency Stop Animations

If animations are causing issues, add to `globals.css`:
```css
@media (prefers-reduced-motion: no-preference) {
  * {
    animation-play-state: paused !important;
  }
}
```

## Contact for Help

Share these details and I can help further:
- Screenshot of browser console
- Screenshot of Network tab
- Which page has the issue
- Backend running status
