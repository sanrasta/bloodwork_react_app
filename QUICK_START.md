Perfect — here’s the full rewritten Quick Start guide with the TL;DR block integrated at the top. It keeps things lean, professional, and easy for your senior dev friend to spin up immediately while still offering all the details below if needed.

⸻

🚀 Quick Start Guide — Backend + Frontend Testing

This guide explains how to run both the NestJS Backend and React Native Frontend together for end-to-end testing.

⸻

TL;DR Setup

# Start Redis
brew services start redis    # or: redis-server

# Backend (http://localhost:3000)
cd bloodwork-backend && npm install && npm run start:dev

# Frontend (Expo dev server)
cd bloodwork_app && npm install && npx expo start

One-time setup:
Edit bloodwork_app/src/shared/api/base.ts →

const BASE_URL = 'http://localhost:3000/api';


⸻

Prerequisites
	•	Node.js (v18+)
	•	Redis
	•	Expo CLI or a React Native development environment

⸻

Step-by-Step Startup

1. Start Redis

brew services start redis     # macOS with Homebrew
redis-server                  # or manually
redis-cli ping                # expected: PONG

2. Start the Backend (Terminal 1)

cd bloodwork-backend
npm install
npm run start:dev

Backend runs at: http://localhost:3000
Look for: Ready for React Native connections!

3. Start the Frontend (Terminal 2)

cd bloodwork_app
npm install
npx expo start

	•	Expo shows QR code and simulator options (iOS/Android)
	•	Ensure BASE_URL in src/shared/api/base.ts is set to http://localhost:3000/api

4. Verify Both Are Running

Backend

curl http://localhost:3000/api/health
curl http://localhost:3000/api/

Frontend
	•	App loads with the UploadCard component
	•	File picker is visible
	•	Check console logs for errors

⸻

End-to-End Test Flow
	1.	Upload a PDF in the app
	2.	Start analysis and watch the progress indicator
	3.	Wait for completion and review AI-powered recommendations

⸻

Troubleshooting

Backend

curl http://localhost:3000/api/health
redis-cli ping
# Check logs in Terminal 1

Frontend

npx expo start -c   # clear cache
# Verify BASE_URL points to http://localhost:3000/api

Common Problems
	•	Network Error: backend not running or misconfigured API URL
	•	Redis connection failed: start Redis (brew services start redis or redis-server)
	•	Cannot GET /api/uploads: backend not running

⸻

Development Workflow

Terminal 1 — Backend

cd bloodwork-backend
npm run start:dev

Terminal 2 — Frontend

cd bloodwork_app
npx expo start

Terminal 3 — Testing

curl http://localhost:3000/api/health
redis-cli monitor


⸻

Success Indicators

Backend
	•	Logs: Bloodwork Analysis API is running!
	•	Available at http://localhost:3000
	•	Message: Ready for React Native connections!

Frontend
	•	Expo QR code displayed
	•	App launches without errors
	•	UploadCard component visible

Integration
	•	File upload works without errors
	•	Analysis runs and shows progress
	•	Results display successfully

⸻

Quick Test Commands

# Upload a PDF
curl -X POST http://localhost:3000/api/uploads \
  -F "file=@sample.pdf"

# Health check
curl http://localhost:3000/api/health | jq '.status'


At this point, both backend and frontend should be running and fully connected.
