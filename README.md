
Bloodwork Analysis Platform

AI-powered bloodwork analysis with a clean mobile app and a reliable backend.
Upload PDFs, get insights, and track your health over time—without needing to wrestle with messy lab reports.

(Built with care, curiosity, and probably too much coffee ☕)

⸻

What’s This All About?

Think of it as a bridge between raw lab results and actionable health insights.
	•	Frontend (React Native + Expo): Upload PDFs, view results, and keep track of changes.
	•	Backend (NestJS + Redis): Secure APIs, background jobs, real-time progress.
	•	AI Layer (pluggable): Dev mode runs a simulation, production can drop in OpenAI or a medical model.

⸻

How It Fits Together

graph TD
  A[📱 React Native App] --> B[🌐 NestJS API]
  B --> C[🔄 Redis Queue]
  C --> D[🗄️ SQLite/DB]

	•	Frontend: Expo Router, Zustand, React Query, Zod
	•	Backend: NestJS, TypeORM, Bull/Redis, Multer
	•	AI: Swappable engine—defaults to simulation for dev/testing

⸻

Quick Start (Dev Mode)

If you’ve got Redis and Node.js 18+ installed, you’re basically good to go:

# Start Redis
brew services start redis

# Backend
cd bloodwork-backend
npm install
npm run start:dev

# Frontend
cd bloodwork_app
npm install
npx expo start

For details: see QUICK_START.md.

⸻

📁 Repo Layout

bloodwork_react_app/
├── bloodwork_app/       # React Native frontend
│   ├── app/             # Expo Router pages
│   ├── src/
│   │   ├── features/    # Business logic
│   │   ├── shared/      # Reusable components
│   │   └── lib/         # Utilities
├── bloodwork-backend/   # NestJS backend
│   ├── src/
│   │   ├── uploads/     # File handling
│   │   ├── analysis/    # Background jobs
│   │   ├── results/     # AI insights
│   │   └── common/      # DTOs & entities


⸻

✨ Features (In Plain English)
	•	Upload: PDFs go in, validated and queued.
	•	Analysis: Background jobs spin up, AI processes results.
	•	Progress: Frontend polls Redis jobs for real-time updates.
	•	Results: You get clean, readable insights + recommendations.

⸻

🔧 Tech Stack
	•	Frontend: React Native (Expo), Zustand, React Query, Zod
	•	Backend: NestJS, TypeORM, Redis (Bull), Multer, Class Validator
	•	AI: Simulated now, pluggable for OpenAI / custom models later

⸻

🧪 API Endpoints (Dev Reference)

POST /api/uploads       # Upload PDF
POST /api/analysis      # Start AI analysis
GET  /api/analysis/:id  # Poll job status
GET  /api/results/:id   # Fetch results
GET  /api/health        # Health check


⸻

🔐 Security
	•	File + input validation baked in
	•	Safe error handling
	•	CORS locked down
	•	Medical disclaimers always included

⸻

🛠️ Dev Notes
	•	Hot reload everywhere (npm run start:dev backend, expo start frontend)
	•	Feature-first architecture (both sides)
	•	Code is TypeScript end-to-end
	•	PRs reviewed with CodeRabbit (because even best friends need guardrails 😅)

⸻

📈 Scaling Path
	•	SQLite now → PostgreSQL later
	•	Redis single node → Redis cluster
	•	Local storage → S3 (or whatever cloud storage you like)
	•	Stateless API = easy load balancing

⸻

