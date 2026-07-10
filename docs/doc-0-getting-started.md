# Getting Started Guide

This guide walks you through the steps to run the RentTitan MVP locally on your machine.

## Prerequisites
- **Node.js** (v18 or higher recommended)
- **Docker** (for running the PostgreSQL and MongoDB instances)

## 1. Start the Databases
The application relies on PostgreSQL (for users, dossiers, and scoring) and MongoDB (for document metadata).

1. Open your terminal in the root of the project.
2. Start the Docker containers in the background:
   ```bash
   docker-compose up -d
   ```
*(Note: If you don't need the databases running right away, you can skip this until we implement the Prisma and Mongoose models).*

## 2. Start the Main Backend
The main backend handles authentication and serves as the primary API gateway.

1. Open a new terminal window.
2. Navigate to the backend folder:
   ```bash
   cd backend
   ```
3. Ensure your dependencies are installed:
   ```bash
   npm install
   ```
4. **Initialize the Database Schema**: Connect to the Postgres database and create the tables using Prisma:
   ```bash
   npx prisma migrate dev
   ```
5. Make sure your `.env` file is set up (see [OAuth Documentation](doc-1-oauth.md) for details).
6. Start the development server:
   ```bash
   npm run dev
   ```
The backend will now be running on `http://localhost:5000`.

## 3. Start the Frontend
The frontend is a React application built with Vite.

1. Open a new terminal window.
2. Navigate to the frontend folder:
   ```bash
   cd frontend
   ```
3. Ensure your dependencies are installed:
   ```bash
   npm install
   ```
4. Start the Vite development server:
   ```bash
   npm run dev
   ```
The frontend will now be accessible in your browser at `http://localhost:5173`.

## 4. (Optional) Start the Microservices
Later in the MVP, you will also need to start the Document and Scoring microservices:

- **Document Service:** `cd microservices/document-service && npm run dev`
- **Scoring Service:** `cd microservices/scoring-service && npm run dev`
