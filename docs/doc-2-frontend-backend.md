# Frontend and Backend Architecture

This document tracks the current state of the RentTitan frontend and backend codebases up through Phase 3 (Dossier Profile).

## Frontend (React + Vite)
The frontend is a single-page application built with React and styled beautifully with Tailwind CSS using a glassmorphism aesthetic.

### Key Components
1. **`App.jsx`**: Manages the main routing of the application using `react-router-dom`. It handles the Google OAuth success callback by intercepting the JWT token from the URL and storing it in `localStorage`.
2. **`Login.jsx`**: The landing page displaying a premium UI. It provides the "Continue with Google" button that redirects the user to the backend OAuth initialization endpoint.
3. **`Dashboard.jsx`**: A protected route. It verifies the user's token against the backend upon mounting. It acts as the central hub, displaying the user's dossier score and document checklist status.
4. **`DossierForm.jsx`**: A complex, multi-step form embedded in the Dashboard. It allows the user to input their `targetRent`, `monthlyIncome`, and `employmentStatus`. It dynamically allows the user to add multiple `Guarantors` and submits the data securely to the backend via a JWT-authenticated API call.

## Main Backend (Node.js + Express)
The backend serves as the core API gateway, handling authentication and dossier management.

### Key Modules
1. **`index.js`**: The entry point. Configures Express, CORS, and registers the routers (`/auth` and `/dossiers`).
2. **`auth/passport.js`**: Configures the `passport-google-oauth20` strategy. Upon a successful Google login, it securely intercepts the Google profile, searches for the user in the PostgreSQL database via Prisma, creates the user if they don't exist, and passes the user object down the chain.
3. **`routes/auth.js`**: Handles the Google OAuth redirect and callback endpoints. After Passport verifies the user, it signs a secure JSON Web Token (JWT) and redirects the user back to the frontend with the token.
4. **`routes/dossier.js`**: Handles the `GET /dossiers` and `POST /dossiers` REST endpoints. It reads the user's ID from the JWT token and uses Prisma to create, update, or fetch the user's financial dossier and associated guarantors.
5. **`middleware/auth.js`**: Contains the `authenticateJWT` middleware used to protect secure API routes. It intercepts the `Authorization: Bearer <token>` header and verifies its cryptographic signature.
