# Authentication Setup Guide

## Step 1: Get Clerk Credentials

1. Go to [clerk.com](https://clerk.com) and create an account
2. Create a new application
3. Copy your keys from the dashboard

## Step 2: Frontend Environment (.env in bloodwork_app/)

Create `bloodwork_app/.env`:
```
EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_your_publishable_key_here
EXPO_PUBLIC_API_URL=http://localhost:3001/api
```

## Step 3: Backend Environment (.env in bloodwork-backend/)

Create `bloodwork-backend/.env`:
```
CLERK_SECRET_KEY=sk_test_your_secret_key_here
CLERK_PUBLISHABLE_KEY=pk_test_your_publishable_key_here
DATABASE_URL=file:./bloodwork.db
PORT=3001
NODE_ENV=development
```

## Step 4: Run the fix script

The auth integration will be automatically fixed in the code.
