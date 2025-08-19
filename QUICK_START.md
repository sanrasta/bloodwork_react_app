# 🚀 Quick Start Guide - Backend + Frontend Testing

This guide shows you how to run both your **NestJS Backend** and **React Native Frontend** together for end-to-end testing.

## 📋 Prerequisites

Make sure you have:
- ✅ Node.js (v18+)
- ✅ Redis running
- ✅ Expo CLI or React Native development environment

## 🏃‍♂️ Step-by-Step Startup

### 1. **Start Redis** (Required for Backend)
```bash
# macOS with Homebrew
brew services start redis

# Or manually
redis-server

# Verify Redis is running
redis-cli ping
# Should return: PONG
```

### 2. **Start the Backend** (Terminal 1)
```bash
# Navigate to backend directory
cd /Users/santiago/Documents/react-native/bloodwork_react_app/bloodwork-backend

# Start the NestJS server in development mode
npm run start:dev

# ✅ Backend will be running at: http://localhost:3000
# ✅ Look for: "Ready for React Native connections!"
```

### 3. **Start the Frontend** (Terminal 2)
```bash
# Navigate to React Native app directory
cd /Users/santiago/Documents/react-native/bloodwork_react_app/bloodwork_app

# Update API base URL first (one-time setup)
# Edit: src/shared/api/base.ts
# Change baseURL to: 'http://localhost:3000/api'

# Start the React Native development server
npx expo start

# ✅ Expo will show QR code and available options
# ✅ Press 'i' for iOS simulator or 'a' for Android
```

### 4. **Verify Both Are Running**

**Test Backend:**
```bash
# Health check
curl http://localhost:3000/api/health

# API info
curl http://localhost:3000/api/
```

**Test Frontend:**
- ✅ App should load with the UploadCard component
- ✅ You should see the file picker interface
- ✅ Check console logs for any connection issues

## 🔗 Frontend-Backend Integration

### Update API Base URL (First Time Only)

Edit: `bloodwork_app/src/shared/api/base.ts`
```typescript
// Change this line:
const BASE_URL = 'http://localhost:3000/api';  // ← Update to your backend URL
```

## 🧪 Test the Complete Flow

1. **Upload a PDF**: 
   - Tap "Choose PDF File" in React Native app
   - Select a PDF file from your device/simulator

2. **Start Analysis**:
   - Tap "Start Analysis" 
   - Watch the progress indicator

3. **View Results**:
   - Wait for analysis to complete
   - View AI-powered recommendations

## 🛠️ Troubleshooting

### Backend Issues
```bash
# Check if backend is running
curl http://localhost:3000/api/health

# Check Redis connection
redis-cli ping

# View backend logs for errors
# (Check Terminal 1 where npm run start:dev is running)
```

### Frontend Issues
```bash
# Clear React Native cache
npx expo start -c

# Check if API base URL is correct
# Verify: src/shared/api/base.ts points to http://localhost:3000/api
```

### Common Issues

**"Network Error" in React Native:**
- ✅ Make sure backend is running on `http://localhost:3000`
- ✅ Verify API base URL is correctly set
- ✅ Check that CORS is enabled (already configured)

**"Redis connection failed":**
```bash
# Start Redis
brew services start redis
# Or
redis-server
```

**"Cannot GET /api/uploads":**
- ✅ Backend is not running - start with `npm run start:dev`

## 📱 Development Workflow

### Typical Development Session:

**Terminal 1 - Backend:**
```bash
cd bloodwork-backend
npm run start:dev
# Keep running - auto-reloads on code changes
```

**Terminal 2 - Frontend:**
```bash
cd bloodwork_app  
npx expo start
# Keep running - hot reloads on code changes
```

**Terminal 3 - Testing:**
```bash
# Test API endpoints
curl http://localhost:3000/api/health

# Monitor Redis
redis-cli monitor
```

## ✅ Success Indicators

**Backend Ready:**
```
🩸 Bloodwork Analysis API is running!
📡 Server: http://localhost:3000
✅ Ready for React Native connections!
```

**Frontend Ready:**
- ✅ Expo QR code displayed
- ✅ App loads without errors
- ✅ UploadCard component visible

**Integration Working:**
- ✅ File upload works without network errors
- ✅ Analysis starts and shows progress
- ✅ Results display with AI recommendations

## 🎯 Quick Test Commands

```bash
# Test upload endpoint
curl -X POST http://localhost:3000/api/uploads \
  -F "file=@sample.pdf"

# Test health
curl http://localhost:3000/api/health | jq '.status'
```

---

**🎉 You're ready to test your complete Bloodwork Analysis app!**

Both backend and frontend should now be running and communicating successfully.
