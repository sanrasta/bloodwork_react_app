# 📁 Project Structure Overview

This React Native app follows a **feature-based architecture** with Zustand for state management and React Query for data fetching.

## 🏗️ Current Structure

```
bloodwork_app/
├── app/                          # Expo Router pages
│   ├── _layout.tsx               # Root layout with QueryClientProvider
│   ├── (tabs)/
│   │   ├── _layout.tsx
│   │   ├── index.tsx             # Updated home screen
│   │   └── explore.tsx
│   └── +not-found.tsx
│
├── src/                          # Main source code
│   ├── features/                 # Feature-based modules
│   │   ├── bloodwork-results/    # Complete example feature
│   │   │   ├── components/       # Feature-specific UI components
│   │   │   │   ├── bloodwork-list.tsx
│   │   │   │   ├── bloodwork-list-item.tsx
│   │   │   │   ├── bloodwork-list-skeleton.tsx
│   │   │   │   ├── UploadCard.tsx
│   │   │   │   ├── AnalysisProgress.tsx
│   │   │   │   └── ResultSummary.tsx
│   │   │   ├── hooks/           # Custom hooks for this feature
│   │   │   │   ├── use-bloodwork-queries.ts
│   │   │   │   └── use-bloodwork-validation.ts
│   │   │   │   ├── use-upload-mutation.ts
│   │   │   │   ├── use-start-analysis.ts
│   │   │   │   ├── use-analysis-job.ts
│   │   │   │   └── use-result-query.ts
│   │   │   ├── api/             # API functions
│   │   │   │   └── bloodwork-api.ts
│   │   │   ├── store/           # Zustand store
│   │   │   │   └── use-bloodwork-store.ts
│   │   │   ├── types/           # TypeScript types
│   │   │   │   └── types.ts
│   │   │   ├── schemas/         # Zod validation schemas
│   │   │   │   └── bloodwork-schema.ts
│   │   │   └── index.ts         # Barrel exports
│   │   │
│   │   └── user-profile/        # Another example feature
│   │       ├── types/
│   │       │   └── types.ts
│   │       ├── schemas/
│   │       │   └── profile-schema.ts
│   │       └── store/
│   │           └── use-user-profile-store.ts
│   │
│   ├── shared/                  # Shared/reusable code
│   │   ├── components/          # Reusable UI components
│   │   │   ├── ui/              # Base UI components
│   │   │   └── index.ts         # Barrel exports
│   │   ├── hooks/               # Shared custom hooks
│   │   ├── api/                 # Base API client
│   │   │   └── base.ts
│   │   ├── types/               # Global types
│   │   │   └── api.ts
│   │   └── utils/               # Utility functions
│   │       └── date.ts
│   │
│   └── lib/                     # Third-party configurations
│       └── query-client.ts      # React Query configuration
│
├── assets/                      # Static assets
├── .cursorrules                 # Cursor AI rules and guidelines
└── PROJECT_STRUCTURE.md         # This file
```

## 🎯 Key Features Implemented

### ✅ State Management
- **Zustand** for feature-specific state stores
- Proper state update patterns following React Native best practices
- Example stores for bloodwork and user profile features

### ✅ Data Fetching
- **React Query** for server state management
- Proper loading, error, and success state handling
- Optimistic updates and cache invalidation

### ✅ Validation
- **Zod** schemas for type-safe validation
- Feature-specific validation hooks
- Form validation with proper error handling

### ✅ Architecture Patterns
- Feature-first folder structure
- Barrel exports for clean imports
- Separation of concerns
- TypeScript throughout

### ✅ Components Structure
- Loading states with skeleton components
- Error handling patterns
- Data fetching lifecycle management
- Reusable UI components in shared folder

## 🔧 Minimal edits to align MVP (Cursor-ready checklist)

The goal is a single flow: **Upload PDF → Start AI analysis → Poll job → Render result**. Keep the existing `features/bloodwork-results/` feature, but add the minimal hooks/components/API you need for v1.

### 1) Keep structure; add subpieces to the existing feature

```
src/
  features/
    bloodwork-results/
      components/
        UploadCard.tsx                # pick/validate PDF, show file name/size/errors
        AnalysisProgress.tsx          # queued/running/progress polling UI
        ResultSummary.tsx             # top-level insights & flags
      hooks/
        use-upload-mutation.ts        # POST /uploads (multipart)
        use-start-analysis.ts         # POST /analysis (create job)
        use-analysis-job.ts           # GET /analysis/:jobId; refetchInterval polling
        use-result-query.ts           # GET /results/:resultId
      api/
        bloodwork-api.ts              # export typed functions that call shared ApiClient
      schemas/
        bloodwork-schema.ts           # zod: panels, items, flags, ranges (extend existing)
      store/
        use-bloodwork-store.ts        # UI flow: picked file, jobId, resultId, step
```

> Note: We’re **not** renaming the feature. Future split into `intake/` vs `history/` can happen later.

### 2) Wire providers (already mostly present)
- Ensure `app/_layout.tsx` wraps the app with `QueryClientProvider` using `src/lib/query-client.ts`.
- Ensure `src/shared/api/base.ts` exports a singleton `apiClient` and is used by `bloodwork-api.ts` only (no raw `fetch` elsewhere).

### 3) API surface (contracts)
Create/extend typed calls in `features/bloodwork-results/api/bloodwork-api.ts`:
- `uploadPdf(formData): Promise<{ uploadId: string; fileUrl: string }>`
- `startAnalysis(uploadId): Promise<{ jobId: string; status: 'queued'|'running' }>`
- `getAnalysisJob(jobId): Promise<{ status: 'queued'|'running'|'completed'|'failed'; resultId?: string; progress?: number; errorMessage?: string }>`
- `getResult(resultId): Promise<BloodworkResult>`

### 4) Hooks (React Query)
Implement minimal hooks using the shared `apiClient`:
- `useUploadMutation()` → mutation for multipart upload (sets `Content-Type: multipart/form-data`).
- `useStartAnalysis()` → mutation to create a job.
- `useAnalysisJob(jobId)` → query with `refetchInterval` until completed/failed.
- `useResultQuery(resultId)` → query with long `staleTime`.

### 5) Store (Zustand)
Add/extend `use-bloodwork-store.ts` shape:
```ts
step: 'idle'|'picked'|'uploaded'|'analyzing'|'completed'|'failed';
pickedFile?: { uri: string; name: string; type: string; size?: number };
uploadId?: string; jobId?: string; resultId?: string;
```

### 6) Components (MVP UI)
- `UploadCard.tsx` – file picker (MIME `application/pdf`), size validation, triggers `upload → startAnalysis` chain.
- `AnalysisProgress.tsx` – displays job state from `useAnalysisJob(jobId)`.
- `ResultSummary.tsx` – renders `BloodworkResult.summary` and quick flags; defers details to existing list UI if present.

### 7) Navigation (keep simple)
- Home (`app/(tabs)/index.tsx`) should render the Upload → Progress → Result sections conditionally using the store + hooks.

### 8) Non-breaking lint targets
- No filename renames; only **add** files.
- Keep barrel exports under `features/bloodwork-results/index.ts` so imports like `@/features/bloodwork-results` continue to work.

### 9) Security & copy
- Show a brief privacy notice on upload (no logging of raw values in dev tools).
- Enforce max file size on client and surface a friendly error.

### 10) Done criteria
- Select a valid PDF → sees file name.
- Tap "Analyze" → progress appears and polls.
- On completion → a result summary renders without navigation glitches.

## 🚀 Next Steps

To build upon this structure:

1. **Add new features** in `src/features/[feature-name]/`
2. **Create API endpoints** in each feature's `api/` folder
3. **Build forms** using the validation patterns established
4. **Add navigation** between features using Expo Router
5. **Extend shared components** as needed

## 📚 Usage Examples

### Creating a new feature:
```bash
mkdir -p src/features/new-feature/{components,hooks,api,store,types,schemas}
```

### Importing from features:
```typescript
import { BloodworkList, useGetBloodworkResults } from '@/features/bloodwork-results';
```

### Using shared utilities:
```typescript
import { formatDate } from '@/shared/utils/date';
import { ThemedText } from '@/shared/components';
```

This structure ensures scalability, maintainability, and clear separation of concerns for your React Native bloodwork application.
