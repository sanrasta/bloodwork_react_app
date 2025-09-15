Development Workflow

Terminal 1 — Backend

cd bloodwork-backend
npm run start:dev

Terminal 2 — Frontend

cd bloodwork_app
EXPO_PUBLIC_API_URL="http://$(ipconfig getifaddr en0):3000/api" npx expo start

Terminal 3 — Testing

curl http://localhost:3000/api/health
redis-cli monitor

⸻

Success Indicators

Backend
	•	Logs: Bloodwork Analysis API is running
	•	Listening on http://localhost:3000

Frontend
	•	Expo QR code displayed
	•	App launches without errors
	•	UploadCard visible and uploads succeed

Integration
	•	Upload → Analyze → Poll → Results works end‑to‑end
