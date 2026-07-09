# Initializing Google OAuth

This document covers the steps taken to implement the Google OAuth 2.0 flow for the RentTitan MVP.

## Architecture

The OAuth flow is split between the React frontend and the Node/Express backend:

1. **Frontend (`frontend/src/components/Login.jsx`)**: Displays a premium login screen. When the user clicks "Continue with Google," they are redirected to the backend endpoint `http://localhost:5000/auth/google`.
2. **Backend Gateway (`backend/src/routes/auth.js`)**: Receives the request and forwards the user to the Google Consent screen using `passport-google-oauth20`.
3. **Google Consent Screen**: The user authorizes the application.
4. **Backend Callback (`/auth/google/callback`)**: Google redirects back to the backend. The backend verifies the profile, signs a JSON Web Token (JWT), and redirects the user back to the frontend (`http://localhost:5173/auth-success?token=<jwt>`).
5. **Frontend Storage (`frontend/src/App.jsx`)**: The frontend intercepts the token from the URL, stores it in `localStorage`, and pushes the user to the protected `/dashboard` route.
6. **Protected API Requests (`backend/src/middleware/auth.js`)**: All subsequent requests to the backend include the JWT in the `Authorization: Bearer <token>` header, which the backend validates using custom middleware.

## Developer Setup Guide

To run this authentication flow locally, you must configure a Google Cloud Project and supply the credentials via environment variables.

### 1. Create a Google Cloud Project
1. Go to the [Google Cloud Console](https://console.cloud.google.com/).
2. Click **New Project** and name it "RentTitan".

### 2. Configure the OAuth Consent Screen
1. Navigate to **APIs & Services** > **OAuth consent screen**.
2. Select **External** and fill in:
   - App Name: `RentTitan`
   - User support email: `Your email`
   - Developer contact email: `Your email`
3. Click Save.

### 3. Generate OAuth Credentials
1. Navigate to **Credentials** > **Create Credentials** > **OAuth client ID**.
2. Application type: **Web application**.
3. **Authorized JavaScript origins**: `http://localhost:5173`
4. **Authorized redirect URIs**: `http://localhost:5000/auth/google/callback`
5. Click **Create** and copy the Client ID and Client Secret.

### 4. Configure the Environment
1. In the root of the `backend/` directory, create a `.env` file (this is ignored by `.gitignore`).
2. Add the following variables:
   ```env
   PORT=5000
   FRONTEND_URL=http://localhost:5173
   JWT_SECRET=super_secret_jwt_key_change_me_in_production
   GOOGLE_CLIENT_ID=your_client_id_here
   GOOGLE_CLIENT_SECRET=your_client_secret_here
   ```
3. Restart the backend server (`npm run dev` or `npm start`). The login flow will now function end-to-end.
