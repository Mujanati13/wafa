# Troubleshooting Guide

## Error: "Unexpected token '<', "<!doctype "... is not valid JSON"

This error occurs when the API endpoint returns HTML instead of JSON. Here are the steps to resolve it:

### 1. Check if Backend is Running

First, ensure the backend server is running:

```bash
cd wafa-backend
npm run dev
```

You should see:
```
Server is running on port 3000
MongoDB connected
```

### 2. Test API Connection

In the admin panel, click the "Test API" button. Check the browser console for:
- Success: `API connection test: {message: "Backend is working!", timestamp: "..."}`
- Failure: Connection errors

### 3. Check Browser Network Tab

1. Open browser DevTools (F12)
2. Go to Network tab
3. Click "Test API" button
4. Look for the request to `/api/v1/test`
5. Check the response:
   - **200 OK with JSON**: Backend is working
   - **404 Not Found**: Route not registered
   - **500 Internal Error**: Backend error
   - **HTML response**: Wrong server responding

### 4. Verify Backend Routes

Check if routes are properly registered:

```bash
# In backend console, you should see:
GET /api/v1/test
GET /api/v1/users/free
GET /api/v1/users/paying
GET /api/v1/users/stats
```

### 5. Check MongoDB Connection

Ensure MongoDB is running and accessible:

```bash
# Check if MongoDB is running
mongosh --eval "db.runCommand('ping')"
```

### 6. Common Issues & Solutions

#### Issue: Backend not starting
```bash
# Check for syntax errors
cd wafa-backend
node app.js

# Check dependencies
npm install
```

#### Issue: MongoDB connection failed
```bash
# Check environment variables
cat .env

# Should contain:
MONGO_URL=mongodb://localhost:27017/your_database
SESSION_SECRET=your_secret
CORS_ORIGIN=http://localhost:5173
```

#### Issue: Routes not loading
```bash
# Check route files exist
ls -la routes/
ls -la controllers/

# Verify imports in routes/index.js
cat routes/index.js
```

### 7. Manual API Testing

Test the API endpoints directly:

```bash
# Test basic endpoint
curl http://localhost:3000/api/v1/test

# Test user endpoints
curl http://localhost:3000/api/v1/users/free
curl http://localhost:3000/api/v1/users/paying
curl http://localhost:3000/api/v1/users/stats
```

### 8. Frontend Configuration

Ensure the frontend is configured correctly:

```javascript
// In userService.js, verify:
const API_BASE_URL = '/api/v1';
```

### 9. CORS Issues

If you see CORS errors, check:

```javascript
// In app.js, ensure CORS is configured:
app.use(cors({
  origin: process.env.CORS_ORIGIN?.split(",") || ["http://localhost:5173"],
  credentials: true
}));
```

### 10. Port Conflicts

Check if port 3000 is available:

```bash
# Check what's using port 3000
netstat -tulpn | grep :3000

# Or use a different port
export PORT=3001
npm run dev
```

## Still Having Issues?

1. Check the backend console for error messages
2. Verify all files are saved and have no syntax errors
3. Restart both backend and frontend servers
4. Clear browser cache and cookies
5. Check if there are any firewall or antivirus blocking connections

## Quick Fix Checklist

- [ ] Backend server running (`npm run dev`)
- [ ] MongoDB connected
- [ ] Routes properly imported
- [ ] No syntax errors in console
- [ ] Frontend pointing to correct backend URL
- [ ] CORS properly configured
- [ ] Port 3000 available
